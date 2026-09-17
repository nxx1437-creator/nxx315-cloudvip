import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Check,
  X,
  Eye,
  Package,
  Copy,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient.js";

const ADMIN_CHAT_ID = "6152450878";

export default function FreeFireOrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailOrder, setDetailOrder] = useState(null);
  const [rejectOrder, setRejectOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

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
    if (processing) return;
    setProcessing(true);

    const { error } = await supabase
      .from("orders")
      .update({
        status: "delivered",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (!error) {
      await notifyTelegram(
        `✅ Đơn Free Fire #${order.order_code || order.id} đã giao.\nUID: ${order.ff_uid}`
      );
      await fetchOrders();
      setDetailOrder(null);
    }

    setProcessing(false);
  };

  const handleProcessing = async (order) => {
    if (processing) return;
    setProcessing(true);

    const { error } = await supabase
      .from("orders")
      .update({
        status: "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (!error) {
      await fetchOrders();
      setDetailOrder(null);
    }

    setProcessing(false);
  };

  const handleReject = async () => {
    if (!rejectOrder || processing) return;
    setProcessing(true);

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
      setDetailOrder(null);
    }

    setProcessing(false);
  };

  const copyText = (text) => {
    navigator.clipboard?.writeText(String(text));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Đơn Free Fire
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý đơn nạp Kim Cương Free Fire
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

      {/* Table */}
      {loading ? (
        <div className="rounded-2xl border bg-white p-8 text-center">
          <RefreshCw className="mx-auto animate-spin text-slate-400" size={32} />
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
        <div className="overflow-hidden rounded-2xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left">Đơn</th>
                  <th className="px-4 py-3 text-left">UID</th>
                  <th className="px-4 py-3 text-left">Kim Cương</th>
                  <th className="px-4 py-3 text-left">Số tiền</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Thời gian</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-semibold">
                      #{order.order_code || order.id}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">
                          {order.ff_uid || "-"}
                        </span>
                        {order.ff_uid && (
                          <button
                            onClick={() => copyText(order.ff_uid)}
                            className="text-slate-400 hover:text-orange-600"
                          >
                            <Copy size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold">
                        {Number(order.ff_diamond || 0).toLocaleString("vi-VN")} KC
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold">
                      {Number(order.amount || 0).toLocaleString("vi-VN")}đ
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-4 text-slate-500 text-xs">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleString("vi-VN")
                        : "-"}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => setDetailOrder(order)}
                        className="rounded-lg p-2 text-orange-600 hover:bg-orange-50"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailOrder && (
        <Modal
          title={`Đơn Free Fire #${detailOrder.order_code || detailOrder.id}`}
          onClose={() => setDetailOrder(null)}
        >
          <div className="space-y-3">
            <InfoBox label="UID" value={detailOrder.ff_uid || "-"} />
            <InfoBox
              label="Kim Cương"
              value={`${Number(detailOrder.ff_diamond || 0).toLocaleString("vi-VN")} KC`}
            />
            <InfoBox
              label="Số tiền"
              value={`${Number(detailOrder.amount || 0).toLocaleString("vi-VN")}đ`}
            />
            <InfoBox
              label="Thanh toán"
              value={detailOrder.payment_method || "-"}
            />
            <InfoBox
              label="Trạng thái"
              value={<StatusBadge status={detailOrder.status} />}
            />
            {detailOrder.note && (
              <InfoBox label="Ghi chú" value={detailOrder.note} />
            )}

            <div className="flex flex-wrap gap-2 pt-3">
              {!["delivered", "rejected"].includes(detailOrder.status) && (
                <button
                  disabled={processing}
                  onClick={() => handleProcessing(detailOrder)}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <RefreshCw size={17} className="mr-2 inline" />
                  Đang xử lý
                </button>
              )}

              {detailOrder.status !== "delivered" && (
                <button
                  disabled={processing}
                  onClick={() => handleDelivered(detailOrder)}
                  className="flex-1 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  <Check size={17} className="mr-2 inline" />
                  Đã giao
                </button>
              )}

              {detailOrder.status !== "rejected" && (
                <button
                  disabled={processing}
                  onClick={() => setRejectOrder(detailOrder)}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  <X size={17} className="mr-2 inline" />
                  Từ chối
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

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

// ============= HELPERS =============

function StatusBadge({ status }) {
  const config = {
    pending: { text: "Chờ thanh toán", className: "bg-amber-100 text-amber-700" },
    paid: { text: "Đã TT", className: "bg-blue-100 text-blue-700" },
    processing: { text: "Đang xử lý", className: "bg-indigo-100 text-indigo-700" },
    delivered: { text: "Đã giao", className: "bg-green-100 text-green-700" },
    completed: { text: "Hoàn thành", className: "bg-green-100 text-green-700" },
    rejected: { text: "Từ chối", className: "bg-red-100 text-red-700" },
    cancelled: { text: "Đã hủy", className: "bg-slate-100 text-slate-600" },
    failed: { text: "Thất bại", className: "bg-red-100 text-red-700" },
  };

  const item = config[status] || {
    text: status || "Không rõ",
    className: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${item.className}`}
    >
      {item.text}
    </span>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-3">
      <div className="mb-1 text-xs font-semibold uppercase text-slate-400">
        {label}
      </div>
      <div className="text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
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
