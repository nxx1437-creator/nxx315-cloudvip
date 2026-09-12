import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Gift,
  Loader2,
  XCircle,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient.js";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";

const SUPABASE_STORAGE =
  "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/";

const ROBLOX_IMAGES = {
  40: `${SUPABASE_STORAGE}roblox-40.png`,
  80: `${SUPABASE_STORAGE}roblox-80.png`,
  400: `${SUPABASE_STORAGE}roblox-400.png`,
  500: `${SUPABASE_STORAGE}roblox-500.png`,
};

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatMoney(value) {
  if (value == null || value === "") return "—";

  return `${Number(value).toLocaleString("vi-VN")}đ`;
}

function formatCoins(value) {
  if (value == null || value === "") return "—";

  return `${Number(value).toLocaleString("vi-VN")} xu`;
}

function statusInfo(status) {
  const key = String(status || "").toLowerCase();

  // Đã giao
  if (key === "delivered") {
    return {
      label: "Đã giao",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-100",
      icon: CheckCircle2,
    };
  }

  // Các trạng thái hoàn thành khác
  if (["completed", "success", "done"].includes(key)) {
    return {
      label: "Hoàn thành",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-100",
      icon: CheckCircle2,
    };
  }

  // Đã từ chối
  if (key === "rejected") {
    return {
      label: "Đã từ chối",
      className:
        "bg-rose-50 text-rose-700 border-rose-100",
      icon: XCircle,
    };
  }

  // Đã hủy
  if (["cancelled", "canceled"].includes(key)) {
    return {
      label: "Đã hủy",
      className:
        "bg-rose-50 text-rose-700 border-rose-100",
      icon: XCircle,
    };
  }

  // Thất bại
  if (["failed"].includes(key)) {
    return {
      label: "Thất bại",
      className:
        "bg-rose-50 text-rose-700 border-rose-100",
      icon: XCircle,
    };
  }

  // Đã thanh toán, chờ admin kiểm tra
  if (key === "paid") {
    return {
      label: "Đang kiểm tra",
      className:
        "bg-blue-50 text-blue-700 border-blue-100",
      icon: Clock3,
    };
  }

  // Đang xử lý
  if (["processing", "checking"].includes(key)) {
    return {
      label: "Đang xử lý",
      className:
        "bg-blue-50 text-blue-700 border-blue-100",
      icon: Clock3,
    };
  }

  // Chờ thanh toán
  if (key === "pending") {
    return {
      label: "Chờ thanh toán",
      className:
        "bg-amber-50 text-amber-700 border-amber-100",
      icon: Clock3,
    };
  }

  return {
    label: "Đang xử lý",
    className:
      "bg-sky-50 text-sky-700 border-sky-100",
    icon: Loader2,
  };
}

function normalizeHistory(rows, type) {
  return (rows || []).map((row) => ({
    ...row,
    history_type: type,
  }));
}

function getImage(order) {
  if (order?.image_url) {
    return order.image_url;
  }

  if (order?.product_image) {
    return order.product_image;
  }

  if (order?.package_image) {
    return order.package_image;
  }

  if (order?.history_type === "order") {
    return ROBLOX_IMAGES[Number(order?.robux)] || "";
  }

  return "";
}

function getName(order) {
  if (order?.history_type === "order") {
    return order?.robux
      ? `${Number(order.robux).toLocaleString("vi-VN")} Robux`
      : order?.package_name || "Đơn Roblox";
  }

  return order?.package_name || "Đơn đổi thưởng";
}

export default function HistoryPage() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (alive) {
          setLoading(false);
        }

        return;
      }

      const [ordersResult, redemptionResult] =
        await Promise.all([
          supabase
            .from("orders")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("redemption_orders")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", {
              ascending: false,
            }),
        ]);

      const merged = [
        ...normalizeHistory(
          ordersResult.data,
          "order"
        ),

        ...normalizeHistory(
          redemptionResult.data,
          "redemption"
        ),
      ].sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );

      if (!alive) return;

      setHistory(merged);
      setLoading(false);
    };

    load();

    return () => {
      alive = false;
    };
  }, []);

  const title = useMemo(
    () => "Lịch sử giao dịch",
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] pb-24 text-slate-900">
        <TopHeader />

        <main className="mx-auto max-w-3xl px-4 py-6">
          <div className="h-10 w-36 animate-pulse rounded-2xl bg-white" />

          <div className="mt-5 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-[24px] bg-white"
              />
            ))}
          </div>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC] pb-24 text-slate-900">
      <TopHeader />

      <main className="mx-auto w-full max-w-3xl px-4 py-5">
        <button
          type="button"
          onClick={() => navigate("/store")}
          className="mb-5 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-100"
        >
          <ArrowLeft size={18} />

          Quay lại cửa hàng
        </button>

        <div className="mb-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-500">
            Giao dịch
          </p>

          <h1 className="mt-1 text-2xl font-black text-slate-900">
            {title}
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Tất cả đơn hàng và giao dịch của bạn.
          </p>
        </div>

        {!history.length ? (
          <EmptyHistory />
        ) : (
          <div className="space-y-3">
            {history.map((order) => {
              const status = statusInfo(order.status);
              const StatusIcon = status.icon;
              const image = getImage(order);

              const source =
                order.history_type === "order"
                  ? "orders"
                  : "redemption_orders";

              const detailUrl =
                `/history/order/${order.id}?source=${source}`;

              return (
                <button
                  key={`${order.history_type}-${order.id}`}
                  type="button"
                  onClick={() =>
                    navigate(detailUrl)
                  }
                  className="w-full rounded-[24px] border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    {/* IMAGE */}
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-sky-50">
                      {image ? (
                        <img
                          src={image}
                          alt={getName(order)}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Gift
                            size={25}
                            className="text-sky-400"
                          />
                        </div>
                      )}
                    </div>

                    {/* CONTENT */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-slate-900">
                        {getName(order)}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400">
                        {formatDate(order.created_at)}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${status.className}`}
                        >
                          <StatusIcon size={11} />

                          {status.label}
                        </span>

                        <span className="text-xs font-black text-sky-600">
                          {order.history_type === "order"
                            ? formatMoney(order.amount)
                            : formatCoins(
                                order.coin_cost
                              )}
                        </span>
                      </div>
                    </div>

                    <ChevronRight
                      size={19}
                      className="shrink-0 text-slate-300"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function EmptyHistory() {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-200 bg-white px-5 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50">
        <Clock3
          size={28}
          className="text-sky-400"
        />
      </div>

      <p className="mt-4 text-base font-black text-slate-800">
        Chưa có giao dịch
      </p>

      <p className="mt-1 text-sm text-slate-400">
        Khi bạn đặt đơn, lịch sử sẽ xuất hiện ở đây.
      </p>
    </div>
  );
}
