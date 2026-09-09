import React, { useEffect, useState } from "react";
import {
  Check,
  Clock,
  Copy,
  RefreshCw,
  Search,
  X,
  Loader2,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient.js";

const STATUS = {
  pending: {
    label: "Chờ thanh toán",
  },
  paid: {
    label: "Chờ kiểm tra",
  },
  processing: {
    label: "Đang xử lý",
  },
  completed: {
    label: "Hoàn thành",
  },
  cancelled: {
    label: "Đã hủy",
  },
};

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN").format(price) + "đ";

const formatDate = (date) =>
  new Date(date).toLocaleString("vi-VN");

export default function RobloxOrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [search, setSearch] = useState("");

  const loadOrders = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load Roblox orders:", error);
      alert("Không thể tải đơn Roblox: " + error.message);
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (id, status) => {
    setActionId(id);

    const { error } = await supabase
      .from("orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      alert("Không thể cập nhật đơn: " + error.message);
    } else {
      await loadOrders();
    }

    setActionId(null);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Không làm gì nếu trình duyệt không cho copy
    }
  };

  const filteredOrders = orders.filter((order) => {
    const keyword = search.toLowerCase();

    return (
      order.order_code?.toLowerCase().includes(keyword) ||
      order.roblox_username?.toLowerCase().includes(keyword) ||
      order.roblox_display_name?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Đơn Roblox
          </h2>

          <p className="text-sm text-slate-500">
            Quản lý và duyệt đơn nạp Robux
          </p>
        </div>

        <button
          onClick={loadOrders}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />

          Làm mới
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm mã đơn hoặc username Roblox..."
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500"
        />
      </div>

      {/* ORDERS */}
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16">
          <Loader2
            size={28}
            className="animate-spin text-blue-600"
          />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <p className="font-semibold text-slate-700">
            Không có đơn Roblox
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Các đơn nạp Robux sẽ xuất hiện ở đây.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const status = STATUS[order.status] || {
              label: order.status,
            };

            const isAction = actionId === order.id;

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {/* TOP */}
                <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        {order.order_code}
                      </span>

                      <button
                        onClick={() => copyText(order.order_code)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                      >
                        <Copy size={14} />
                      </button>
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                    {status.label}
                  </span>
                </div>

                {/* INFO */}
                <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs text-slate-400">
                      Roblox
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
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
                      Robux
                    </p>

                    <p className="mt-1 font-bold text-blue-600">
                      {order.robux} Robux
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Số tiền
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      {formatPrice(order.amount)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Thanh toán
                    </p>

                    <p className="mt-1 font-semibold text-slate-700">
                      {order.payment_method || "Chưa chọn"}
                    </p>
                  </div>
                </div>

                {/* NOTE */}
                {order.note && (
                  <div className="mx-4 mb-4 rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-400">
                      Nội dung chuyển khoản
                    </p>

                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className="break-all text-sm font-semibold text-slate-700">
                        {order.note}
                      </p>

                      <button
                        onClick={() => copyText(order.note)}
                        className="shrink-0 rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-blue-600"
                      >
                        <Copy size={15} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ACTIONS */}
                <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50 p-4">
                  {order.status === "paid" && (
                    <>
                      <button
                        disabled={isAction}
                        onClick={() =>
                          updateStatus(order.id, "processing")
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isAction ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Check size={16} />
                        )}

                        Duyệt đơn
                      </button>

                      <button
                        disabled={isAction}
                        onClick={() =>
                          updateStatus(order.id, "cancelled")
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <X size={16} />

                        Từ chối
                      </button>
                    </>
                  )}

                  {order.status === "processing" && (
                    <button
                      disabled={isAction}
                      onClick={() =>
                        updateStatus(order.id, "completed")
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {isAction ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Check size={16} />
                      )}

                      Hoàn thành
                    </button>
                  )}

                  {order.status === "pending" && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <Clock size={16} />
                      Đang chờ khách thanh toán
                    </div>
                  )}

                  {order.status === "completed" && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                      <Check size={16} />
                      Đơn đã hoàn thành
                    </div>
                  )}

                  {order.status === "cancelled" && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
                      <X size={16} />
                      Đơn đã bị từ chối
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
  }
