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

const fmtDate = (v) =>
  v
    ? new Date(v).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

function statusOf(value) {
  const key = String(value || "").toLowerCase();

  if (["success", "completed", "delivered"].includes(key)) {
    return [
      "Hoàn thành",
      CheckCircle2,
      "bg-emerald-50 border-emerald-100 text-emerald-600",
    ];
  }

  if (["cancelled", "canceled", "failed", "rejected"].includes(key)) {
    return [
      key === "failed"
        ? "Thất bại"
        : key === "rejected"
        ? "Đã từ chối"
        : "Đã hủy",
      XCircle,
      "bg-rose-50 border-rose-100 text-rose-500",
    ];
  }

  if (["paid", "processing"].includes(key)) {
    return [
      "Đang kiểm tra",
      Clock3,
      "bg-blue-50 border-blue-100 text-blue-600",
    ];
  }

  return [
    "Đang xử lý",
    Clock3,
    "bg-amber-50 border-amber-100 text-amber-600",
  ];
}

function Row({ label, value, copyable = false }) {
  const copy = async () => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(String(value));
    } catch {}
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

        {copyable && value && (
          <button
            onClick={copy}
            className="shrink-0 text-blue-500"
            type="button"
          >
            <Copy size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function HistoryDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [params] = useSearchParams();

  const source = params.get("source");

  const [order, setOrder] = useState(null);
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      /*
       * Roblox / nạp tiền:
       * orders
       *
       * Đổi thưởng Store:
       * redemption_orders
       */
      const tables = source
        ? [source]
        : ["orders", "redemption_orders"];

      let found = null;
      let foundSource = null;

      for (const table of tables) {
        const { data, error: qError } = await supabase
          .from(table)
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (!qError && data) {
          found = data;
          foundSource = table;
          break;
        }
      }

      if (!found) {
        setError("Không tìm thấy giao dịch.");
        return;
      }

      setOrder({
        ...found,
        __source: foundSource,
      });

      /*
       * Nếu đơn có package_id thì thử lấy
       * thông tin package để lấy tên / ảnh.
       */
      if (found.package_id) {
        const { data: packageData } = await supabase
          .from("redemption_packages")
          .select("*")
          .eq("id", found.package_id)
          .maybeSingle();

        setPkg(packageData || null);
      }
    } catch (e) {
      console.error(e);
      setError("Không thể tải thông tin giao dịch.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id, source]);

  const [label, Icon, statusClass] = statusOf(order?.status);

  const name =
    order?.package_name ||
    order?.product_name ||
    order?.name ||
    pkg?.name ||
    order?.game_name ||
    "Giao dịch";

  const image =
    order?.image_url ||
    order?.package_image ||
    order?.product_image ||
    order?.logo_url ||
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

  return (
    <div className="min-h-screen bg-[#f7faff] pb-28 text-slate-900">
      <TopHeader />

      <main className="px-4 pt-5">
        <div className="mx-auto max-w-2xl">

          {/* QUAY LẠI */}
          <button
            onClick={() => navigate("/history")}
            className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-500"
            type="button"
          >
            <ArrowLeft size={17} />
            Quay lại lịch sử
          </button>

          {/* LOADING */}
          {loading ? (
            <div className="space-y-3">
              <div className="h-40 animate-pulse rounded-3xl bg-white" />
              <div className="h-72 animate-pulse rounded-3xl bg-white" />
            </div>
          ) : error ? (
            /* ERROR */
            <div className="rounded-3xl border border-rose-100 bg-white p-8 text-center">
              <p className="text-sm font-bold text-rose-500">
                {error}
              </p>

              <button
                onClick={load}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-xs font-bold text-white"
                type="button"
              >
                <RefreshCw size={14} />
                Thử lại
              </button>
            </div>
          ) : (
            <>
              {/* TIẾN TRÌNH */}
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
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${statusClass}`}
                    >
                      <Icon size={23} />
                    </div>

                    <span className="text-xs font-bold text-slate-600">
                      {label}
                    </span>
                  </div>

                </div>
              </section>

              {/* THÔNG TIN SẢN PHẨM */}
              <section className="mt-3 overflow-hidden rounded-3xl border border-blue-50 bg-white shadow-sm">

                <div className="flex items-center gap-4 p-5">
                  {image ? (
                    <img
                      src={image}
                      alt=""
                      className="h-24 w-24 shrink-0 rounded-2xl border border-blue-50 object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
                      <Package
                        size={32}
                        className="text-blue-400"
                      />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      Đơn hàng
                    </p>

                    <h1 className="mt-1 text-lg font-black">
                      {name}
                    </h1>

                    {order?.delivery_method && (
                      <p className="mt-1 text-xs text-slate-400">
                        Giao: {order.delivery_method}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
                  <span className="text-xs text-slate-400">
                    Trạng thái
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-bold ${statusClass}`}
                  >
                    {label}
                  </span>
                </div>
              </section>

              {/* CHI TIẾT */}
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

                <Row
                  label="Mã đơn hàng"
                  value={order?.id}
                  copyable
                />

                <Row
                  label="Tên"
                  value={name}
                />

                <Row
                  label="Thời gian"
                  value={fmtDate(order?.created_at)}
                />

                <Row
                  label="Trạng thái"
                  value={label}
                />

                {coin != null && (
                  <Row
                    label="Số xu"
                    value={`${Number(coin).toLocaleString(
                      "vi-VN"
                    )} xu`}
                  />
                )}

                {money != null && (
                  <Row
                    label="Số tiền"
                    value={`${Number(money).toLocaleString(
                      "vi-VN"
                    )}đ`}
                  />
                )}

                {order?.payment_method && (
                  <Row
                    label="Thanh toán"
                    value={order.payment_method}
                  />
                )}

                {order?.roblox_username && (
                  <Row
                    label="Roblox"
                    value={`@${order.roblox_username}`}
                  />
                )}

                {order?.roblox_user_id && (
                  <Row
                    label="Roblox ID"
                    value={order.roblox_user_id}
                    copyable
                  />
                )}

                {order?.uid && (
                  <Row
                    label="UID"
                    value={order.uid}
                    copyable
                  />
                )}

                {order?.delivery_target && (
                  <Row
                    label="Thông tin nhận"
                    value={order.delivery_target}
                  />
                )}

                {order?.note && (
                  <Row
                    label="Ghi chú"
                    value={order.note}
                  />
                )}
              </section>

              {/* ĐANG KIỂM TRA */}
              {["processing", "paid"].includes(
                String(order?.status || "").toLowerCase()
              ) && (
                <section className="mt-3 rounded-3xl border border-blue-100 bg-blue-50 p-5">
                  <p className="text-sm font-black text-blue-700">
                    Đã ghi nhận chuyển khoản
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-600">
                    Hệ thống đang chờ kiểm tra giao dịch. Khi thanh
                    toán được xác nhận, trạng thái đơn sẽ được cập
                    nhật.
                  </p>
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
