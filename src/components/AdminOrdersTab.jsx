import React, { useMemo, useState } from "react";
import { Check, ChevronRight, Search, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import {
  EmptyState, ErrorState, InfoBox, Loading, Modal, SectionHeader, StatusBadge, StatusIcon,
  fmtNum, useAdminList,
} from "../components/admin/AdminUI";

const ADMIN_CHAT_ID = import.meta.env.VITE_ADMIN_CHAT_ID;

const loadOrders = () =>
  supabase.from("redemption_orders").select("*").order("created_at", { ascending: false });

async function notifyTelegram(message) {
  if (!ADMIN_CHAT_ID) return;
  try {
    await fetch("/api/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: message }),
    });
  } catch (err) {
    console.error("Telegram:", err);
  }
}

export default function AdminOrdersTab() {
  const { data: orders, loading, error, reload } = useAdminList(loadOrders);
  const [search, setSearch] = useState("");
  const [detailOrder, setDetailOrder] = useState(null);
  const [rejectOrder, setRejectOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return orders;
    return orders.filter((o) =>
      [o.id, o.order_code, o.roblox_username, o.roblox_user_id, o.status, o.package_id]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(keyword))
    );
  }, [orders, search]);

  const updateOrder = async (order, patch, message) => {
    if (processing) return false;
    setProcessing(true);
    const { error: err } = await supabase
      .from("redemption_orders")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", order.id);
    if (err) alert("Có lỗi: " + err.message);
    else {
      await notifyTelegram(message);
      await reload();
    }
    setProcessing(false);
    return !err;
  };

  const handleDelivered = async (order) => {
    const ok = await updateOrder(
      order,
      { status: "delivered" },
      `✅ Đơn hàng #${order.order_code || order.id} đã giao thành công.`
    );
    if (ok) setDetailOrder(null);
  };

  const handleReject = async () => {
    if (!rejectOrder) return;
    const reason = rejectReason.trim();
    const ok = await updateOrder(
      rejectOrder,
      { status: "rejected", note: reason || "Đơn hàng bị từ chối" },
      `❌ Đơn hàng #${rejectOrder.order_code || rejectOrder.id} bị từ chối.\nLý do: ${reason || "Không có lý do"}`
    );
    if (ok) {
      setRejectOrder(null);
      setRejectReason("");
      setDetailOrder(null);
    }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Đơn hàng" description="Quản lý đơn hàng đổi thưởng" onRefresh={reload} loading={loading} />

      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm mã đơn, Roblox ID, username..."
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : filteredOrders.length === 0 ? (
        <EmptyState text="Không có đơn hàng nào" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-semibold text-slate-900">Danh sách đơn</span>
            <span className="text-xs text-slate-400">{filteredOrders.length} đơn</span>
          </div>
          {filteredOrders.map((order, index) => (
            <button
              key={order.id}
              onClick={() => setDetailOrder(order)}
              className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50 ${
                index > 0 ? "border-t border-slate-100" : ""
              }`}
            >
              <StatusIcon status={order.status} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  #{order.order_code || order.id} · {order.roblox_username || "-"}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {order.package_id || "-"} · {fmtNum(order.amount)}đ ·{" "}
                  {order.created_at
                    ? new Date(order.created_at).toLocaleString("vi-VN", {
                        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                      })
                    : "-"}
                </p>
              </div>
              <StatusBadge status={order.status} />
              <ChevronRight size={16} className="shrink-0 text-slate-300" />
            </button>
          ))}
        </div>
      )}

      {detailOrder && (
        <Modal title={`Đơn #${detailOrder.order_code || detailOrder.id}`} onClose={() => setDetailOrder(null)}>
          <div className="space-y-3">
            <InfoBox label="Roblox" value={detailOrder.roblox_username || detailOrder.roblox_user_id || "-"} />
            <InfoBox label="Gói" value={detailOrder.package_id || "-"} />
            <InfoBox label="Số tiền" value={`${fmtNum(detailOrder.amount)}đ`} />
            <InfoBox label="Phương thức" value={detailOrder.payment_method || "-"} />
            <InfoBox label="Trạng thái" value={<StatusBadge status={detailOrder.status} />} />
            {detailOrder.note && <InfoBox label="Ghi chú" value={detailOrder.note} />}
            <div className="flex gap-2 pt-3">
              {detailOrder.status !== "delivered" && (
                <button
                  disabled={processing}
                  onClick={() => handleDelivered(detailOrder)}
                  className="flex-1 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  <Check size={17} className="mr-2 inline" />Đã giao
                </button>
              )}
              {detailOrder.status !== "rejected" && (
                <button
                  disabled={processing}
                  onClick={() => setRejectOrder(detailOrder)}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  <X size={17} className="mr-2 inline" />Từ chối
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {rejectOrder && (
        <Modal
          title="Từ chối đơn hàng"
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
            className="w-full rounded-xl border p-3 outline-none focus:border-blue-500"
          />
          <button
            disabled={processing}
            onClick={handleReject}
            className="mt-3 w-full rounded-xl bg-red-600 py-3 font-semibold text-white disabled:opacity-50"
          >
            {processing ? "Đang xử lý..." : "Xác nhận từ chối"}
          </button>
        </Modal>
      )}
    </div>
  );
                  }
