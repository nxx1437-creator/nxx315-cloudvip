import React, { useCallback, useEffect, useState } from "react";
import { Check, Copy, Loader2, RefreshCw, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const TELCO = { viettel: "Viettel", mobifone: "Mobifone", vinaphone: "Vinaphone" };
const WAITING = ["pending", "needs_review", "processing"];
const FILTERS = [
  { id: "pending", label: "Chờ gửi", statuses: WAITING },
  { id: "completed", label: "Đã gửi", statuses: ["completed"] },
  { id: "failed", label: "Từ chối", statuses: ["failed"] },
  { id: "all", label: "Tất cả", statuses: null },
];
const STATUS = {
  pending: ["Chờ gửi", "bg-amber-50 text-amber-700"],
  needs_review: ["Cần kiểm tra", "bg-sky-50 text-sky-700"],
  processing: ["Đang xử lý", "bg-amber-50 text-amber-700"],
  completed: ["Đã gửi", "bg-emerald-50 text-emerald-700"],
  failed: ["Từ chối", "bg-slate-100 text-slate-500"],
};

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");
const fmtTime = (d) =>
  new Date(d).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function OrderCard({ order, name, busy, onComplete, onReject }) {
  const [copied, setCopied] = useState(false);
  const [label, cls] = STATUS[order.status] || STATUS.pending;
  const phone = (order.contact || "").replace(/\D/g, "");
  const isPhone = /^0\d{9,10}$/.test(phone);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(order.contact || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* bỏ qua */
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-bold text-slate-900">
            {TELCO[order.telco] || order.telco} {fmt(order.denomination)}đ
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {name} · {fmt(order.coins_charged)} xu · {fmtTime(order.created_at)}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${cls}`}>{label}</span>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
        <span className="min-w-0 flex-1 break-all text-sm font-semibold text-slate-800">{order.contact || "-"}</span>
        <button
          onClick={copy}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
        >
          {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
          {copied ? "Đã chép" : "Chép"}
        </button>
        {isPhone && (
          <a
            href={`https://zalo.me/${phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Mở Zalo
          </a>
        )}
      </div>

      {order.status === "failed" && order.error_message && (
        <p className="mt-2 text-xs text-slate-500">Lý do: {order.error_message}</p>
      )}

      {WAITING.includes(order.status) && (
        <div className="mt-3 flex gap-2">
          <button
            disabled={busy}
            onClick={() => onComplete(order)}
            className="flex-1 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            <Check size={16} className="mr-1.5 inline" />
            {busy ? "Đang xử lý..." : "Đã gửi thẻ"}
          </button>
          <button
            disabled={busy}
            onClick={() => onReject(order)}
            className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            <X size={16} className="mr-1.5 inline" />
            Từ chối
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminCardOrdersTab({ onChanged }) {
  const [orders, setOrders] = useState([]);
  const [names, setNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [busyId, setBusyId] = useState(null);
  const [rejectOrder, setRejectOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("card_orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    const list = data || [];
    setOrders(list);

    const ids = [...new Set(list.map((o) => o.user_id))];
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, display_name, username").in("id", ids);
      const map = {};
      (profs || []).forEach((p) => {
        map[p.id] = p.display_name || p.username || p.id.slice(0, 8);
      });
      setNames(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const run = async (order, rpc, params) => {
    if (busyId) return false;
    setBusyId(order.id);
    const { data, error: err } = await supabase.rpc(rpc, params);
    setBusyId(null);
    if (err || data?.error) {
      alert("Có lỗi: " + (err?.message || data.error));
      return false;
    }
    await fetchOrders();
    onChanged?.();
    return true;
  };

  const complete = (o) => run(o, "admin_complete_card_order", { p_order_id: o.id });

  const reject = async () => {
    if (!rejectOrder) return;
    const ok = await run(rejectOrder, "admin_reject_card_order", {
      p_order_id: rejectOrder.id,
      p_reason: rejectReason.trim() || "Đơn bị từ chối",
    });
    if (ok) {
      setRejectOrder(null);
      setRejectReason("");
    }
  };

  const active = FILTERS.find((f) => f.id === filter);
  const shown = active.statuses ? orders.filter((o) => active.statuses.includes(o.status)) : orders;
  const waitingCount = orders.filter((o) => WAITING.includes(o.status)).length;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Đơn thẻ cào</h2>
          <p className="text-sm text-slate-500">Duyệt và gửi thẻ qua Zalo hoặc Discord</p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          aria-label="Tải lại"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50"
        >
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              filter === f.id
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f.label}
            {f.id === "pending" && waitingCount > 0 ? ` (${waitingCount})` : ""}
          </button>
        ))}
      </div>

      {loading && orders.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}{" "}
          <button onClick={fetchOrders} className="font-semibold underline">
            Thử lại
          </button>
        </div>
      ) : shown.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
          Không có đơn nào
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              name={names[o.user_id] || o.user_id.slice(0, 8)}
              busy={busyId === o.id}
              onComplete={complete}
              onReject={setRejectOrder}
            />
          ))}
        </div>
      )}

      {rejectOrder && (
        <Modal
          title="Từ chối đơn thẻ cào"
          onClose={() => {
            setRejectOrder(null);
            setRejectReason("");
          }}
        >
          <p className="mb-2 text-sm text-slate-500">
            {fmt(rejectOrder.coins_charged)} xu sẽ được hoàn lại cho người dùng.
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Nhập lý do từ chối..."
            rows={3}
            className="w-full rounded-xl border p-3 outline-none focus:border-blue-500"
          />
          <button
            disabled={busyId === rejectOrder.id}
            onClick={reject}
            className="mt-3 w-full rounded-xl bg-red-600 py-3 font-semibold text-white disabled:opacity-50"
          >
            {busyId === rejectOrder.id ? "Đang xử lý..." : "Xác nhận từ chối và hoàn xu"}
          </button>
        </Modal>
      )}
    </div>
  );
}
