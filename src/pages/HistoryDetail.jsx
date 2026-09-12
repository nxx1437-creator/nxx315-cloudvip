import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Copy,
  FileText,
  Package,
  RefreshCw,
  XCircle,
} from "lucide-react";

import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { supabase } from "../lib/supabaseClient.js";

const PACKAGE_IMAGES = {
  "card-400":
    "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-400.png",

  "vng-40":
    "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-40.png",

  "vng-80":
    "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-80.png",

  "vng-500":
    "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-500.png",
};

const fmtDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function getStatus(status) {
  const key = String(status || "").toLowerCase();

  if (["success", "completed", "delivered"].includes(key)) {
    return {
      text: "Hoàn thành",
      Icon: CheckCircle2,
      className:
        "bg-emerald-50 border-emerald-100 text-emerald-600",
    };
  }

  if (["cancelled", "canceled"].includes(key)) {
    return {
      text: "Đã hủy",
      Icon: XCircle,
      className:
        "bg-rose-50 border-rose-100 text-rose-500",
    };
  }

  if (["failed", "rejected"].includes(key)) {
    return {
      text: key === "failed" ? "Thất bại" : "Đã từ chối",
      Icon: XCircle,
      className:
        "bg-rose-50 border-rose-100 text-rose-500",
    };
  }

  if (["paid", "processing"].includes(key)) {
    return {
      text: "Đang kiểm tra",
      Icon: Clock3,
      className:
        "bg-blue-50 border-blue-100 text-blue-600",
    };
  }

  return {
    text: "Đang xử lý",
    Icon: Clock3,
    className:
      "bg-amber-50 border-amber-100 text-amber-600",
  };
}

function InfoRow({ label, value, copyable = false }) {
  const handleCopy = async () => {
    if (value === null || value === undefined) return;

    try {
      await navigator.clipboard.writeText(String(value));
    } catch (error) {
      console.error("Copy error:", error);
    }
  };

  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <span className="shrink-0 text-xs text-slate-400">
        {label}
      </span>

      <div className="flex min-w-0 items-center gap-2 text-right">
        <span className="break-all text-xs font-bold text-slate-800">
          {value ?? "—"}
        </span>

        {copyable &&
          value !== null &&
          value !== undefined && (
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 text-blue-500"
              aria-label={`Sao chép ${label}`}
            >
              <Copy size={14} />
            </button>
          )}
      </div>
    </div>
  );
}
function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-100 ${className}`}
    />
  );
}

function HistoryDetailSkeleton() {
  return (
    <div className="space-y-3">
      {/* Trạng thái tiến trình */}
      <section className="rounded-3xl border border-blue-50 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-center gap-5">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-12 w-12 rounded-2xl" />

            <Skeleton className="h-3 w-12" />
          </div>

          <Skeleton className="h-px w-14" />

          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-12 w-12 rounded-2xl" />

            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </section>

      {/* Thông tin sản phẩm */}
      <section className="overflow-hidden rounded-3xl border border-blue-50 bg-white shadow-sm">
        <div className="flex items-center gap-4 p-5">
          {/* Ảnh */}
          <Skeleton className="h-24 w-24 shrink-0 rounded-2xl" />

          <div className="min-w-0 flex-1 space-y-3">
            {/* Đơn hàng */}
            <Skeleton className="h-2.5 w-14" />

            {/* Tên */}
            <Skeleton className="h-5 w-32 rounded-md" />

            {/* Robux */}
            <Skeleton className="h-3.5 w-24" />

            {/* Phương thức */}
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        {/* Trạng thái */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
          <Skeleton className="h-3 w-14" />

          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </section>

      {/* Thông tin đơn hàng */}
      <section className="rounded-3xl border border-blue-50 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />

          <Skeleton className="h-4 w-32" />
        </div>

        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0"
          >
            <Skeleton className="h-3 w-16" />

            <Skeleton
              className={`h-3 ${
                index % 3 === 0
                  ? "w-28"
                  : index % 3 === 1
                  ? "w-36"
                  : "w-20"
              }`}
            />
          </div>
        ))}
      </section>

      {/* Box trạng thái */}
      <section className="rounded-3xl border border-blue-50 bg-blue-50 p-5">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl bg-white" />

          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40 bg-white" />

            <Skeleton className="h-3 w-full bg-white" />

            <Skeleton className="h-3 w-4/5 bg-white" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default function HistoryDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const source = searchParams.get("source");

  const [order, setOrder] = useState(null);
  const [pkg, setPkg] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrder() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        navigate("/login");
        return;
      }

      console.log("HISTORY DETAIL");
      console.log("URL ID:", id);
      console.log("USER ID:", user.id);
      console.log("SOURCE:", source);

      const tables = source
        ? [source]
        : ["orders", "redemption_orders"];

      let foundOrder = null;
      let foundTable = null;

      for (const table of tables) {
        const {
          data,
          error: queryError,
        } = await supabase
          .from(table)
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .maybeSingle();

        console.log(`RESULT ${table}:`, {
          data,
          error: queryError,
        });

        if (queryError) {
          console.error(
            `Lỗi query ${table}:`,
            queryError
          );

          continue;
        }

        if (data) {
          foundOrder = data;
          foundTable = table;
          break;
        }
      }

      if (!foundOrder) {
        setError(
          `Không tìm thấy đơn hàng #${id} của tài khoản hiện tại.`
        );
        return;
      }

      console.log("FOUND ORDER:", foundOrder);
      console.log("FOUND TABLE:", foundTable);

      setOrder({
        ...foundOrder,
        __source: foundTable,
      });

      /*
       * Chỉ thử lấy package nếu package_id là UUID.
       *
       * Với các đơn Roblox hiện tại:
       * card-400 / vng-40 / vng-80 / vng-500
       * không phải UUID nên bỏ qua.
       */
      if (
        foundOrder.package_id &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          String(foundOrder.package_id)
        )
      ) {
        const {
          data: packageData,
          error: packageError,
        } = await supabase
          .from("redemption_packages")
          .select("*")
          .eq("id", foundOrder.package_id)
          .maybeSingle();

        if (packageError) {
          console.warn(
            "Không lấy được package:",
            packageError
          );
        }

        setPkg(packageData || null);
      } else {
        setPkg(null);
      }
    } catch (err) {
      console.error("HistoryDetail error:", err);

      setError(
        err?.message ||
          "Không thể tải thông tin giao dịch."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
  }, [id, source]);
    const status = getStatus(order?.status);
  const StatusIcon = status.Icon;

  const name =
    order?.package_name ||
    order?.product_name ||
    order?.name ||
    pkg?.name ||
    order?.game_name ||
    (order?.package_id === "card-400"
      ? "Card Robux"
      : order?.package_id === "vng-40"
      ? "Nạp trực tiếp"
      : order?.package_id === "vng-80"
      ? "Nạp trực tiếp"
      : order?.package_id === "vng-500"
      ? "Nạp trực tiếp"
      : order?.robux
      ? `${order.robux} Robux`
      : "Giao dịch");

  const image =
    order?.image_url ||
    order?.package_image ||
    order?.product_image ||
    order?.logo_url ||
    PACKAGE_IMAGES[order?.package_id] ||
    pkg?.image_url ||
    null;

  const coin =
    order?.coin_cost ??
    order?.coins ??
    order?.coin_amount ??
    order?.amount_coins ??
    order?.price_coins ??
    null;

  const money =
    order?.amount_vnd ??
    order?.price_vnd ??
    order?.amount ??
    order?.total_amount ??
    pkg?.price_vnd ??
    null;

  const paymentMethod =
    order?.payment_method === "bank"
      ? "Chuyển khoản ngân hàng"
      : order?.payment_method === "coins"
      ? "Thanh toán bằng xu"
      : order?.payment_method || null;

  return (
    <div className="min-h-screen bg-[#f7faff] pb-28 text-slate-900">
      <TopHeader />

      <main className="px-4 pt-5">
        <div className="mx-auto max-w-2xl">
          {/* Quay lại */}
          <button
            type="button"
            onClick={() => navigate("/history")}
            className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-500"
          >
            <ArrowLeft size={17} />

            Quay lại lịch sử
          </button>

          {/* SKELETON */}
          {loading && <HistoryDetailSkeleton />}

          {/* ERROR */}
          {!loading && error && (
            <div className="rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50">
                <XCircle
                  size={28}
                  className="text-rose-500"
                />
              </div>

              <h2 className="mt-4 text-base font-black text-slate-800">
                Không thể tải đơn hàng
              </h2>

              <p className="mt-2 break-words text-xs leading-5 text-rose-500">
                {error}
              </p>

              <button
                type="button"
                onClick={loadOrder}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-xs font-bold text-white"
              >
                <RefreshCw size={14} />

                Thử lại
              </button>
            </div>
          )}

          {/* DATA */}
          {!loading && !error && order && (
            <>
              {/* PROCESS */}
              <section className="rounded-3xl border border-blue-50 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-center gap-5">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                      <CheckCircle2 size={23} />
                    </div>

                    <span className="text-xs font-bold text-slate-600">
                      Đặt hàng
                    </span>
                  </div>

                  <div className="h-px w-14 bg-blue-100" />

                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${status.className}`}
                    >
                      <StatusIcon size={23} />
                    </div>

                    <span className="text-xs font-bold text-slate-600">
                      {status.text}
                    </span>
                  </div>
                </div>
              </section>

              {/* PRODUCT */}
              <section className="mt-3 overflow-hidden rounded-3xl border border-blue-50 bg-white shadow-sm">
                <div className="flex items-center gap-4 p-5">
                  {/* IMAGE */}
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-blue-50 bg-blue-50">
                    {image ? (
                      <img
                        src={image}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package
                          size={32}
                          className="text-blue-400"
                        />
                      </div>
                    )}
                  </div>

                  {/* PRODUCT INFO */}
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      Đơn hàng
                    </p>

                    <h1 className="mt-1 text-lg font-black">
                      {name}
                    </h1>

                    {order.robux != null && (
                      <p className="mt-1 text-xs font-bold text-blue-500">
                        {Number(
                          order.robux
                        ).toLocaleString("vi-VN")}{" "}
                        Robux
                      </p>
                    )}

                    {order.package_id && (
                      <p className="mt-1 text-xs text-slate-400">
                        Gói: {order.package_id}
                      </p>
                    )}

                    {order.delivery_method && (
                      <p className="mt-1 text-xs text-slate-400">
                        Giao: {order.delivery_method}
                      </p>
                    )}
                  </div>
                </div>

                {/* STATUS */}
                <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
                  <span className="text-xs text-slate-400">
                    Trạng thái
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-bold ${status.className}`}
                  >
                    {status.text}
                  </span>
                </div>
              </section>

              {/* ORDER INFO */}
              <section className="mt-3 rounded-3xl border border-blue-50 bg-white p-5 shadow-sm">
                <div className="mb-1 flex items-center gap-2">
                  <FileText
                    size={17}
                    className="text-blue-500"
                  />

                  <h2 className="text-sm font-black">
                    Thông tin đơn hàng
                  </h2>
                </div>

                <InfoRow
                  label="Mã ID"
                  value={order.id}
                  copyable
                />

                {order.order_code && (
                  <InfoRow
                    label="Mã đơn"
                    value={order.order_code}
                    copyable
                  />
                )}

                <InfoRow
                  label="Tên"
                  value={name}
                />

                <InfoRow
                  label="Thời gian"
                  value={fmtDate(order.created_at)}
                />

                <InfoRow
                  label="Trạng thái"
                  value={status.text}
                />

                {order.robux != null && (
                  <InfoRow
                    label="Robux"
                    value={`${Number(
                      order.robux
                    ).toLocaleString("vi-VN")} Robux`}
                  />
                )}

                {coin != null && (
                  <InfoRow
                    label="Số xu"
                    value={`${Number(
                      coin
                    ).toLocaleString("vi-VN")} xu`}
                  />
                )}

                {money != null && (
                  <InfoRow
                    label="Số tiền"
                    value={`${Number(
                      money
                    ).toLocaleString("vi-VN")}đ`}
                  />
                )}

                {paymentMethod && (
                  <InfoRow
                    label="Thanh toán"
                    value={paymentMethod}
                  />
                )}
                                {order.roblox_username && (
                  <InfoRow
                    label="Roblox"
                    value={`@${order.roblox_username}`}
                  />
                )}

                {order.roblox_user_id != null && (
                  <InfoRow
                    label="Roblox ID"
                    value={order.roblox_user_id}
                    copyable
                  />
                )}

                {order.roblox_display_name && (
                  <InfoRow
                    label="Display Name"
                    value={order.roblox_display_name}
                  />
                )}

                {order.uid && (
                  <InfoRow
                    label="UID"
                    value={order.uid}
                    copyable
                  />
                )}

                {order.delivery_target && (
                  <InfoRow
                    label="Thông tin nhận"
                    value={order.delivery_target}
                  />
                )}

                {order.note && (
                  <InfoRow
                    label="Ghi chú"
                    value={order.note}
                  />
                )}
              </section>

              {/* PAID / PROCESSING */}
              {["paid", "processing"].includes(
                String(order.status || "").toLowerCase()
              ) && (
                <section className="mt-3 rounded-3xl border border-blue-100 bg-blue-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-500">
                      <Clock3 size={20} />
                    </div>

                    <div>
                      <p className="text-sm font-black text-blue-700">
                        Đã ghi nhận chuyển khoản
                      </p>

                      <p className="mt-1 text-xs leading-5 text-blue-600">
                        Hệ thống đang chờ kiểm tra giao dịch.
                        Khi thanh toán được xác nhận,
                        trạng thái đơn sẽ được cập nhật.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* PENDING */}
              {String(order.status || "").toLowerCase() ===
                "pending" && (
                <section className="mt-3 rounded-3xl border border-amber-100 bg-amber-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-500">
                      <Clock3 size={20} />
                    </div>

                    <div>
                      <p className="text-sm font-black text-amber-700">
                        Chờ thanh toán
                      </p>

                      <p className="mt-1 text-xs leading-5 text-amber-600">
                        Đơn hàng đang chờ thanh toán.
                        Hãy hoàn tất thanh toán theo hướng
                        dẫn của đơn hàng.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* FAILED */}
              {["failed", "rejected", "cancelled", "canceled"].includes(
                String(order.status || "").toLowerCase()
              ) && (
                <section className="mt-3 rounded-3xl border border-rose-100 bg-rose-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-rose-500">
                      <XCircle size={20} />
                    </div>

                    <div>
                      <p className="text-sm font-black text-rose-700">
                        Giao dịch không thành công
                      </p>

                      <p className="mt-1 text-xs leading-5 text-rose-600">
                        Giao dịch này hiện không thể tiếp tục.
                        Nếu mày cho rằng đây là lỗi, hãy liên hệ
                        quản trị viên.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* SUCCESS */}
              {["success", "completed", "delivered"].includes(
                String(order.status || "").toLowerCase()
              ) && (
                <section className="mt-3 rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-500">
                      <CheckCircle2 size={20} />
                    </div>

                    <div>
                      <p className="text-sm font-black text-emerald-700">
                        Đơn hàng đã hoàn thành
                      </p>

                      <p className="mt-1 text-xs leading-5 text-emerald-600">
                        Giao dịch đã được xác nhận thành công.
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
                    }
