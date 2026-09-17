import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Check,
  X,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Gamepad2,
  Gem,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient.js";

const ADMIN_CHAT_ID = "6152450878";

export default function FreeFireOrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [processingId, setProcessingId] = useState(null);
  const [rejectOrder, setRejectOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchOrders = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("game", "freefire")
      .order("created_at", { ascending: false });

    if (!error) {
      setOrders(data || []);
    } else {
      console.error("Fetch Free Fire orders error:", error);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    let list = orders;

    if (statusFilter !== "all") {
      list = list.filter((o) => o.status === statusFilter);
    }

    const keyword = search.trim().toLowerCase();
    if (!keyword) return list;

    return list.filter((order) =>
      [
        order.id,
        order.order_code,
        order.ff_uid,
        order.status,
        order.package_id,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(keyword))
    );
  }, [orders, search, statusFilter]);

  const notifyTelegram = async (message) => {
    try {
      await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: message }),
      });
    } catch {}
  };

  const handleDelivered = async (order) => {
    if (processingId) return;
    if (!window.confirm(`Xác nhận ĐÃ GIAO đơn ${order.order_code || order.id}?`)) return;

    setProcessingId(order.id);

    const { error } = await supabase
      .from("orders")
      .update({
        status: "delivered",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (!error) {
      await notifyTelegram(
        `✅ Đơn Free Fire #${order.order_code || order.id} đã giao.\nUID: ${order.ff_uid}\nKC: ${order.ff_diamond}`
      );
      await fetchOrders();
    } else {
      alert("Không thể cập nhật: " + error.message);
    }

    setProcessingId(null);
  };

  const handleProcessing = async (order) => {
    if (processingId) return;
    setProcessingId(order.id);

    const { error } = await supabase
      .from("orders")
      .update({
        status: "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (!error) {
      await fetchOrders();
    }

    setProcessingId(null);
  };

  const handleReject = async () => {
    if (!rejectOrder || processingId) return;

    setProcessingId(rejectOrder.id);

    const { error } = await supabase
      .from("orders")
      .update({
        status: "rejected",
        note: rejectReason.trim() || "Đơn hàng bị từ chối",
        updated_at: new Date().toISOString(),
      })
      .eq("id", rejectOrder.id);

    if (!error) {
      await notifyTelegram(
        `❌ Đơn Free Fire #${rejectOrder.order_code || rejectOrder.id} bị từ chối.\nLý do: ${rejectReason.trim() || "Không có lý do"}`
      );
      await fetchOrders();
      setRejectOrder(null);
      setRejectReason("");
    } else {
      alert("Không thể từ chối: " + error.message);
    }

    setProcessingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Đơn Free Fire
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {orders.length} đơn · Duyệt nhanh trên mobile
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="rounded-xl border bg-white p-2.5 text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Filter */}
      <div className="rounded-2xl border bg-white p-4 space-y-3">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã đơn, UID..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none transition focus:border-orange-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "Tất cả" },
            { key: "pending", label: "Chờ TT" },
            { key: "paid", label: "Đã TT" },
            { key: "processing", label: "Xử lý" },
            { key: "delivered", label: "Đã giao" },
            { key: "rejected", label: "Từ chối" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                statusFilter === f.key
                  ? "bg-orange-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border bg-white p-5"
            >
              <div className="h-5 w-32 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-48 rounded bg-slate-200" />
              <div className="mt-2 h-4 w-40 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-2xl border bg-white px-6 py-14 text-center">
          <Package size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm text-slate-500">
            {orders.length === 0
              ? "Chưa có đơn Free Fire nào"
              : "Không tìm thấy đơn khớp bộ lọc"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              processing={processingId === order.id}
              onDelivered={() => handleDelivered(order)}
              onProcessing={() => handleProcessing(order)}
              onReject={() => setRejectOrder(order)}
            />
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectOrder && (
        <Modal
          title="Từ chối đơn Free Fire"
          onClose={() => {
            setRejectOrder(null);
            setRejectReason("");
          }}
        >
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Nhập lý do từ chối..."
            rows={4}
            className="w-full rounded-xl border p-3 outline-none focus:border-red-500"
          />
          <button
            disabled={processingId === rejectOrder.id}
            onClick={handleReject}
            className="mt-3 w-full rounded-xl bg-red-600 py-3 font-semibold text-white disabled:opacity-50"
          >
            {processingId === rejectOrder.id
              ? "Đang xử lý..."
              : "Xác nhận từ chối"}
          </button>
        </Modal>
      )}
    </div>
  );
}

// ============= ORDER CARD =============

function OrderCard({ order, processing, onDelivered, onProcessing, onReject }) {
  const status = getStatusInfo(order.status);
  const StatusIcon = status.icon;

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${status.bgColor}`}
          >
            <StatusIcon size={20} className={status.iconColor} />
          </div>
          <div className="min-w-0">
            <p className="font-black text-slate-900 truncate">
              {order.order_code || `#${order.id}`}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatDate(order.created_at)}
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-2 p-4">
        <InfoRow
          icon={User}
          label="UID Free Fire"
          value={order.ff_uid || "-"}
          mono
        />
        <InfoRow
          icon={Gem}
          label="Kim Cương"
          value={`${Number(order.ff_diamond || 0).toLocaleString("vi-VN")} KC`}
          highlight
        />
        <InfoRow
          icon={Gamepad2}
          label="Số tiền"
          value={`${Number(order.amount || 0).toLocaleString("vi-VN")}đ`}
          highlight
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50 p-3">
        {!["delivered", "rejected"].includes(order.status) && (
          <button
            onClick={onProcessing}
            disabled={processing}
            className="flex flex-1 min-w-[120px] items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw size={14} />
            Đang xử lý
          </button>
        )}

        {order.status !== "delivered" && (
          <button
            onClick={onDelivered}
            disabled={processing}
            className="flex flex-1 min-w-[120px] items-center justify-center gap-1.5 rounded-xl bg-green-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            <Check size={14} />
            Đã giao
          </button>
        )}

        {order.status !== "rejected" && (
          <button
            onClick={onReject}
            disabled={processing}
            className="flex flex-1 min-w-[120px] items-center justify-center gap-1.5 rounded-xl bg-red-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            <X size={14} />
            Từ chối
          </button>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, mono, highlight }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <Icon size={14} className="shrink-0 text-slate-400" />
        <span className="text-xs text-slate-500 shrink-0">{label}</span>
      </div>
      <span
        className={`text-right truncate ${
          mono ? "font-mono" : "font-bold"
        } ${highlight ? "text-sm text-slate-900" : "text-sm text-slate-700"}`}
      >
        {value}
      </span>
    </div>
  );
}

// ============= HELPERS =============

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusInfo(status) {
  switch (String(status || "").toLowerCase()) {
    case "pending":
      return {
        label: "Chờ thanh toán",
        icon: Clock,
        className: "bg-amber-50 text-amber-700 border-amber-200",
        bgColor: "bg-amber-100",
        iconColor: "text-amber-600",
      };
    case "paid":
      return {
        label: "Đã thanh toán",
        icon: CheckCircle2,
        className: "bg-blue-50 text-blue-700 border-blue-200",
        bgColor: "bg-blue-100",
        iconColor: "text-blue-600",
      };
    case "processing":
      return {
        label: "Đang xử lý",
        icon: RefreshCw,
        className: "bg-indigo-50 text-indigo-700 border-indigo-200",
        bgColor: "bg-indigo-100",
        iconColor: "text-indigo-600",
      };
    case "delivered":
      return {
        label: "Đã giao",
        icon: CheckCircle2,
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        bgColor: "bg-emerald-100",
        iconColor: "text-emerald-600",
      };
    case "rejected":
      return {
        label: "Từ chối",
        icon: XCircle,
        className: "bg-red-50 text-red-700 border-red-200",
        bgColor: "bg-red-100",
        iconColor: "text-red-600",
      };
    case "cancelled":
    case "canceled":
      return {
        label: "Đã hủy",
        icon: XCircle,
        className: "bg-slate-50 text-slate-600 border-slate-200",
        bgColor: "bg-slate-100",
        iconColor: "text-slate-500",
      };
    default:
      return {
        label: status || "Không rõ",
        icon: Clock,
        className: "bg-slate-50 text-slate-600 border-slate-200",
        bgColor: "bg-slate-100",
        iconColor: "text-slate-500",
      };
  }
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
          }
