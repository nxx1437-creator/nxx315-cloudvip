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
  completed: {
    text: "Hoàn thành",
    className: "bg-emerald-50 text-emerald-600",
  },
  cancelled: {
    text: "Đã từ chối",
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
      await fetchOrders();
    }

    setProcessing(null);
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
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

  const waiting = orders.filter((o) => o.status === "paid").length;
  const processingCount = orders.filter(
    (o) => o.status === "processing"
  ).length;
  const completed = orders.filter(
    (o) => o.status === "completed"
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
          onClick={fetchOrders}
          className="rounded-full bg-blue-50 p-2.5 text-blue-600 hover:bg-blue-100"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3">
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
            {completed}
          </p>
          <p className="text-xs text-emerald-600">
            Hoàn thành
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
                className: "bg-slate-100 text-slate-500",
              };

            const busy = processing === order.id;

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >

                {/* ORDER HEADER */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900">
                        {order.order_code}
                      </p>

                      <button
                        onClick={() => copy(order.order_code)}
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

                {/* TRANSFER NOTE */}
                {order.note && (
                  <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
                    <p className="text-xs font-semibold text-blue-600">
                      Nội dung chuyển khoản
                    </p>

                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="break-all text-sm font-bold text-slate-700">
                        {order.note}
                      </p>

                      <button
                        onClick={() => copy(order.note)}
                        className="shrink-0 rounded-lg bg-white p-2 text-slate-500"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ACTION */}
                {order.status === "paid" && (
                  <div className="mt-4 flex gap-2">

                    <button
                      disabled={busy}
                      onClick={() =>
                        updateStatus(order, "processing")
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
                      disabled={busy}
                      onClick={() =>
                        updateStatus(order, "cancelled")
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

                {/* COMPLETE */}
                {order.status === "processing" && (
                  <button
                    disabled={busy}
                    onClick={() =>
                      updateStatus(order, "completed")
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
                        Đã nạp Robux — Hoàn thành
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
      }
