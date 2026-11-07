import React, { useCallback, useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import {
  Btn, Card, EmptyState, ErrorState, FilterPills, Loading, Modal, SectionHeader, StatusBadge,
  fmtNum, fmtTime,
} from "../components/admin/AdminUI";

const TELCO = { viettel: "Viettel", mobifone: "Mobifone", vinaphone: "Vinaphone" };
const WAITING = ["pending", "needs_review", "processing"];
const FILTERS = [
  { id: "pending", label: "Chờ gửi", statuses: WAITING },
  { id: "completed", label: "Đã gửi", statuses: ["completed"] },
  { id: "failed", label: "Từ chối", statuses: ["failed"] },
  { id: "all", label: "Tất cả", statuses: null },
];

function OrderCard({ order, name, busy, onComplete, onReject }) {
  const [copied, setCopied] = useState(false);
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
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[17px] font-semibold text-[#242424]">
            {TELCO[order.telco] || order.telco} {fmtNum(order.denomination)}đ
          </p>
          <p className="mt-0.5 text-[13px] text-[#6b7280]">
            {name} · {fmtNum(order.coins_charged)} xu · {fmtTime(order.created_at)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#f4f4f4] px-3 py-2.5">
        <span className="min-w-0 flex-1 break-all text-[14px] font-medium text-[#242424]">{order.contact || "-"}</span>
        <button
          onClick={copy}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#e5e7eb] bg-white px-3 py-1.5 text-[12px] font-medium text-[#242424]"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Đã chép" : "Chép"}
        </button>
        {isPhone && (
          <a
            href={`https://zalo.me/${phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full bg-[#101010] px-3 py-1.5 text-[12px] font-medium text-white"
          >
            Mở Zalo
          </a>
        )}
      </div>

      {order.status === "failed" && order.error_message && (
        <p className="mt-2 text-[13px] text-[#6b7280]">Lý do: {order.error_message}</p>
      )}

      {WAITING.includes(order.status) && (
        <div className="mt-3 flex gap-2">
          <Btn className="flex-1" disabled={busy} onClick={() => onComplete(order)}>
            {busy ? "Đang xử lý..." : "Đã gửi thẻ"}
          </Btn>
          <Btn variant="ghost" className="flex-1" disabled={busy} onClick={() => onReject(order)}>
            Từ chối
          </Btn>
        </div>
      )}
    </Card>
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
  const waiting = orders.filter((o) => WAITING.includes(o.status)).length;
  const options = FILTERS.map((f) => ({
    id: f.id,
    label: f.id === "pending" && waiting > 0 ? `${f.label} (${waiting})` : f.label,
  }));

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Thẻ cào"
        description="Duyệt và gửi thẻ qua Zalo hoặc Discord"
        onRefresh={fetchOrders}
        loading={loading}
      />
      <FilterPills options={options} value={filter} onChange={setFilter} />

      {loading && orders.length === 0 ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchOrders} />
      ) : shown.length === 0 ? (
        <EmptyState text="Không có đơn nào" />
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
          <p className="mb-3 text-[14px] text-[#6b7280]">
            {fmtNum(rejectOrder.coins_charged)} xu sẽ được hoàn lại cho người dùng.
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Nhập lý do từ chối..."
            rows={3}
            className="w-full rounded-lg border border-[#e5e7eb] p-3 text-[14px] outline-none focus:border-[#101010]"
          />
          <Btn className="mt-3 w-full" disabled={busyId === rejectOrder.id} onClick={reject}>
            {busyId === rejectOrder.id ? "Đang xử lý..." : "Xác nhận từ chối và hoàn xu"}
          </Btn>
        </Modal>
      )}
    </div>
  );
      }
