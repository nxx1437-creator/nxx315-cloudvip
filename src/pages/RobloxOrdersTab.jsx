import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Loader2,
  Copy,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient.js";

const statusInfo = {
  pending: {
    text: "Chờ thanh toán",
    className: "bg-amber-50 text-amber-600",
  },

  paid: {
    text: "Chờ kiểm tra",
    className: "bg-blue-50 text-blue-600",
  },

  processing: {
    text: "Đang xử lý",
    className: "bg-purple-50 text-purple-600",
  },

  delivered: {
    text: "Đã giao",
    className: "bg-emerald-50 text-emerald-600",
  },

  completed: {
    text: "Hoàn thành",
    className: "bg-emerald-50 text-emerald-600",
  },

  rejected: {
    text: "Đã từ chối",
    className: "bg-rose-50 text-rose-600",
  },

  cancelled: {
    text: "Đã hủy",
    className: "bg-rose-50 text-rose-600",
  },
};

const money = (value) =>
  Number(value || 0).toLocaleString("vi-VN") + "đ";

export default function RobloxOrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [search, setSearch] = useState("");

  const [rejectOrder, setRejectOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Lỗi tải đơn Roblox:", error);
      alert("Không tải được đơn Roblox: " + error.message);
    }

    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /*
   * CẬP NHẬT TRẠNG THÁI
   */
  const updateStatus = async (order, newStatus) => {
    setProcessing(order.id);

    const { error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (error) {
      alert("Lỗi cập nhật đơn: " + error.message);
    } else {
      /*
       * Cập nhật ngay trên giao diện trước,
       * sau đó fetch lại DB để chắc chắn dữ liệu đồng bộ.
       */
      setOrders((current) =>
        current.map((item) =>
          item.id === order.id
            ? {
                ...item,
                status: newStatus,
                updated_at: new Date().toISOString(),
              }
            : item
        )
      );

      await fetchOrders();
    }

    setProcessing(null);
  };

  /*
   * MỞ FORM TỪ CHỐI
   */
  const openRejectModal = (order) => {
    setRejectOrder(order);
    setRejectReason("");
  };

  /*
   * ĐÓNG FORM TỪ CHỐI
   */
  const closeRejectModal = () => {
    if (rejecting) return;

    setRejectOrder(null);
    setRejectReason("");
  };

  /*
   * TỪ CHỐI ĐƠN
   *
   * status = rejected
   * note = lý do từ chối
   */
  const confirmReject = async () => {
    if (!rejectOrder) return;

    const reason = rejectReason.trim();

    if (!reason) {
      alert("Vui lòng nhập lý do từ chối đơn hàng.");
      return;
    }

    setRejecting(true);

    const { error } = await supabase
      .from("orders")
      .update({
        status: "rejected",
        note: reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", rejectOrder.id);

    if (error) {
      alert("Lỗi từ chối đơn: " + error.message);
    } else {
      setOrders((current) =>
        current.map((item) =>
          item.id === rejectOrder.id
            ? {
                ...item,
                status: "rejected",
                note: reason,
                updated_at: new Date().toISOString(),
              }
            : item
        )
      );

      setRejectOrder(null);
      setRejectReason("");

      await fetchOrders();
    }

    setRejecting(false);
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(String(text ?? ""));
    } catch {}
  };

  const filtered = orders.filter((order) => {
    const q = search.trim().toLowerCase();

    if (!q) return true;

    return (
      order.order_code?.toLowerCase().includes(q) ||
      order.roblox_username?.toLowerCase().includes(q) ||
      order.roblox_display_name?.toLowerCase().includes(q)
    );
  });

  const waiting = orders.filter(
    (o) => o.status === "paid"
  ).length;

  const processingCount = orders.filter(
    (o) => o.status === "processing"
  ).length;

  const delivered = orders.filter(
    (o) => o.status === "delivered"
  ).length;

  const rejected = orders.filter(
    (o) => o.status === "rejected"
  ).length;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2
          size={28}
          className="animate-spin text-blue-500"
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Đơn nạp Roblox
          </h2>

          <p className="text-sm text-slate-400">
            Quản lý đơn nạp Robux thủ công
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="rounded-full bg-blue-50 p-2.5 text-blue-600 hover:bg-blue-100"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-blue-50 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {waiting}
          </p>

          <p className="text-xs text-blue-600">
            Chờ kiểm tra
          </p>
        </div>

        <div className="rounded-2xl bg-purple-50 p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">
            {processingCount}
          </p>

          <p className="text-xs text-purple-600">
            Đang xử lý
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-50 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">
            {delivered}
          </p>

          <p className="text-xs text-emerald-600">
            Đã giao
          </p>
        </div>

        <div className="rounded-2xl bg-rose-50 p-4 text-center">
          <p className="text-2xl font-bold text-rose-600">
            {rejected}
          </p>

          <p className="text-xs text-rose-600">
            Từ chối
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <Search size={16} className="text-slate-400" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm mã đơn / username Roblox..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {/* ORDERS */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white py-12 text-center">
            <p className="text-sm text-slate-400">
              Chưa có đơn Roblox.
            </p>
          </div>
        ) : (
          filtered.map((order) => {
            const status =
              statusInfo[order.status] || {
                text: order.status,
                className:
                  "bg-slate-100 text-slate-500",
              };

            const busy = processing === order.id;

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                {/* HEADER */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900">
                        {order.order_code}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          copy(order.order_code)
                        }
                        className="text-slate-400 hover:text-blue-500"
                      >
                        <Copy size={14} />
                      </button>
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(
                        order.created_at
                      ).toLocaleString("vi-VN")}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}
                  >
                    {status.text}
                  </span>
                </div>

                {/* INFO */}
                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4">
                  <div>
                    <p className="text-xs text-slate-400">
                      Roblox
                    </p>

                    <p className="font-bold text-slate-900">
                      {order.roblox_username}
                    </p>

                    {order.roblox_display_name && (
                      <p className="text-xs text-slate-500">
                        {order.roblox_display_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Gói
                    </p>

                    <p className="font-bold text-blue-600">
                      {order.robux} Robux
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Số tiền
                    </p>

                    <p className="font-bold text-slate-900">
                      {money(order.amount)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Thanh toán
                    </p>

                    <p className="font-semibold text-slate-700">
                      {order.payment_method || "Chưa chọn"}
                    </p>
                  </div>
                </div>

                {/* NOTE */}
                {order.note && (
                  <div
                    className={`mt-3 rounded-xl border p-3 ${
                      order.status === "rejected"
                        ? "border-rose-100 bg-rose-50"
                        : "border-blue-100 bg-blue-50"
                    }`}
                  >
                    <p
                      className={`text-xs font-semibold ${
                        order.status === "rejected"
                          ? "text-rose-600"
                          : "text-blue-600"
                      }`}
                    >
                      {order.status === "rejected"
                        ? "Lý do từ chối"
                        : "Nội dung chuyển khoản"}
                    </p>

                    <div className="mt-1 flex items-start justify-between gap-2">
                      <p className="break-all text-sm font-bold text-slate-700">
                        {order.note}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          copy(order.note)
                        }
                        className="shrink-0 rounded-lg bg-white p-2 text-slate-500"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* DUYỆT / TỪ CHỐI */}
                {order.status === "paid" && (
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        updateStatus(
                          order,
                          "processing"
                        )
                      }
                      className="flex-1 rounded-full bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2
                          size={15}
                          className="mx-auto animate-spin"
                        />
                      ) : (
                        <>
                          <CheckCircle2
                            size={15}
                            className="mr-1 inline"
                          />
                          Duyệt đơn
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        openRejectModal(order)
                      }
                      className="flex-1 rounded-full bg-rose-500 py-2.5 text-sm font-bold text-white hover:bg-rose-600 disabled:opacity-50"
                    >
                      <XCircle
                        size={15}
                        className="mr-1 inline"
                      />
                      Từ chối
                    </button>
                  </div>
                )}

                {/* ĐÃ GIAO */}
                {order.status === "processing" && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      updateStatus(
                        order,
                        "delivered"
                      )
                    }
                    className="mt-4 w-full rounded-full bg-emerald-500 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {busy ? (
                      <Loader2
                        size={15}
                        className="mx-auto animate-spin"
                      />
                    ) : (
                      <>
                        <CheckCircle2
                          size={15}
                          className="mr-1 inline"
                        />
                        Đã giao Robux
                      </>
                    )}
                  </button>
                )}

                {/* ĐÃ GIAO */}
                {order.status === "delivered" && (
                  <div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-emerald-50 py-2.5 text-sm font-bold text-emerald-600">
                    <CheckCircle2 size={16} />
                    Đơn hàng đã giao
                  </div>
                )}

                {/* TỪ CHỐI */}
                {order.status === "rejected" && (
                  <div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-rose-50 py-2.5 text-sm font-bold text-rose-600">
                    <XCircle size={16} />
                    Đơn hàng đã từ chối
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL TỪ CHỐI */}
      {rejectOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Từ chối đơn hàng
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  {rejectOrder.order_code}
                </p>
              </div>

              <button
                type="button"
                onClick={closeRejectModal}
                disabled={rejecting}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400">
                Roblox
              </p>

              <p className="font-bold text-slate-900">
                @{rejectOrder.roblox_username}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Gói
              </p>

              <p className="font-bold text-blue-600">
                {rejectOrder.robux} Robux
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Số tiền
              </p>

              <p className="font-bold text-slate-900">
                {money(rejectOrder.amount)}
              </p>
            </div>

            <div className="mt-4">
              <label className="text-sm font-bold text-slate-700">
                Lý do từ chối
              </label>

              <textarea
                value={rejectReason}
                onChange={(e) =>
                  setRejectReason(e.target.value)
                }
                placeholder="Nhập lý do từ chối đơn hàng..."
                rows={4}
                disabled={rejecting}
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:bg-slate-50"
              />

              <p className="mt-1 text-[11px] text-slate-400">
                Lý do này sẽ hiển thị cho khách hàng
                trong lịch sử giao dịch.
              </p>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={closeRejectModal}
                disabled={rejecting}
                className="flex-1 rounded-full border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={confirmReject}
                disabled={
                  rejecting ||
                  !rejectReason.trim()
                }
                className="flex-1 rounded-full bg-rose-500 py-2.5 text-sm font-bold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {rejecting ? (
                  <Loader2
                    size={16}
                    className="mx-auto animate-spin"
                  />
                ) : (
                  <>
                    <XCircle
                      size={15}
                      className="mr-1 inline"
                    />
                    Xác nhận từ chối
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
