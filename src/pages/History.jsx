import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Coins,
  Copy,
  Gift,
  Hash,
  History as HistoryIcon,
  Loader2,
  Package,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";

import useSession from "../hooks/useSession.js";
import { supabase } from "../lib/supabaseClient.js";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";

const formatNumber = (value) => Number(value || 0).toLocaleString("vi-VN");

const formatDate = (value) => {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return date.toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const statusConfig = {
  pending: ["Đang xử lý", Clock3, "border-amber-100 bg-amber-50 text-amber-700", "bg-amber-100 text-amber-600"],
  processing: ["Đang xử lý", Clock3, "border-amber-100 bg-amber-50 text-amber-700", "bg-amber-100 text-amber-600"],
  delivered: ["Đã giao", CheckCircle2, "border-emerald-100 bg-emerald-50 text-emerald-700", "bg-emerald-100 text-emerald-600"],
  success: ["Thành công", CheckCircle2, "border-emerald-100 bg-emerald-50 text-emerald-700", "bg-emerald-100 text-emerald-600"],
  completed: ["Hoàn thành", CheckCircle2, "border-emerald-100 bg-emerald-50 text-emerald-700", "bg-emerald-100 text-emerald-600"],
  rejected: ["Đã từ chối", XCircle, "border-rose-100 bg-rose-50 text-rose-700", "bg-rose-100 text-rose-600"],
  cancelled: ["Đã hủy", XCircle, "border-slate-200 bg-slate-100 text-slate-600", "bg-slate-200 text-slate-500"],
};

function InfoRow({ icon: Icon, label, value, copyable, onCopy }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 py-3.5 last:border-b-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
        <Icon size={17} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-bold text-slate-800">
          {value || "—"}
        </p>
      </div>
      {copyable && value && (
        <button
          type="button"
          onClick={() => onCopy(value)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-sky-500"
        >
          <Copy size={15} />
        </button>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { session } = useSession();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError("");

      let query = supabase
        .from("redemption_orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (id) query = query.eq("id", id);

      const { data, error: queryError } = await query;

      if (queryError) {
        console.error("History error:", queryError);
        setError("Không thể tải lịch sử giao dịch.");
        setOrders([]);
      } else {
        setOrders(data || []);
        if (id && !(data || []).length) {
          setError("Không tìm thấy giao dịch này.");
        }
      }

      setLoading(false);
    };

    load();
  }, [userId, id]);

  const copyValue = async (value) => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(String(value));
      setTimeout(() => setCopied(""), 1500);
    } catch {}
  };

  if (id) {
    const order = orders[0];
    const config =
      statusConfig[String(order?.status || "").toLowerCase()] ||
      statusConfig.pending;
    const [statusLabel, StatusIcon, statusBox, statusIconBox] = config;

    return (
      <div className="min-h-screen bg-[#F7FAFC] pb-28 text-slate-900">
        <TopHeader />
        <main className="mx-auto w-full max-w-lg px-4 py-5">
          <button
            type="button"
            onClick={() => navigate("/history")}
            className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-sky-600"
          >
            <ArrowLeft size={17} />
            Lịch sử
          </button>

          {loading ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-[28px] bg-white">
              <Loader2 className="animate-spin text-sky-500" size={28} />
            </div>
          ) : error ? (
            <div className="rounded-[28px] bg-white p-8 text-center shadow-sm">
              <XCircle className="mx-auto text-rose-500" size={32} />
              <p className="mt-4 text-sm font-black text-slate-800">{error}</p>
              <button
                type="button"
                onClick={() => navigate("/history")}
                className="mt-5 rounded-xl bg-sky-500 px-5 py-3 text-xs font-black text-white"
              >
                Về lịch sử
              </button>
            </div>
          ) : (
            <section className="overflow-hidden rounded-[28px] border border-sky-100 bg-white shadow-[0_16px_50px_rgba(14,165,233,0.1)]">
              <div className="bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                    <ShieldCheck size={24} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                      Chi tiết giao dịch
                    </p>
                    <h1 className="truncate text-lg font-black">
                      {order?.package_name || "Đơn hàng"}
                    </h1>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className={`rounded-2xl border p-4 ${statusBox}`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${statusIconBox}`}>
                      <StatusIcon size={21} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                        Trạng thái
                      </p>
                      <p className="mt-1 text-sm font-black">{statusLabel}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4">
                  <InfoRow icon={Package} label="Tên" value={order?.package_name} />
                  <InfoRow icon={Clock3} label="Thời gian" value={formatDate(order?.created_at)} />
                  <InfoRow
                    icon={Hash}
                    label="Mã đơn hàng"
                    value={order?.order_code || order?.id}
                    copyable
                    onCopy={copyValue}
                  />
                  <InfoRow
                    icon={User}
                    label="Thông tin nhận"
                    value={order?.delivery_target || order?.target || order?.username || order?.uid}
                    copyable
                    onCopy={copyValue}
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                    <div className="flex items-center gap-2 text-sky-500">
                      <Coins size={17} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Coin</span>
                    </div>
                    <p className="mt-2 text-lg font-black text-sky-700">
                      {formatNumber(order?.coin_cost)} xu
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Số tiền
                    </p>
                    <p className="mt-2 text-lg font-black text-slate-800">
                      {order?.amount_vnd || order?.price_vnd || order?.total_vnd
                        ? `${formatNumber(order.amount_vnd || order.price_vnd || order.total_vnd)}đ`
                        : "—"}
                    </p>
                  </div>
                </div>

                {(order?.delivery_method || order?.payment_method) && (
                  <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Thông tin khác
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {order?.delivery_method && (
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-[10px] text-slate-400">Phương thức nhận</p>
                          <p className="mt-1 text-xs font-black text-slate-700">
                            {order.delivery_method}
                          </p>
                        </div>
                      )}
                      {order?.payment_method && (
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-[10px] text-slate-400">Thanh toán</p>
                          <p className="mt-1 text-xs font-black text-slate-700">
                            {order.payment_method}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {order?.note && (
                  <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-sky-500">
                      Ghi chú
                    </p>
                    <p className="mt-2 text-xs leading-5 text-sky-800">{order.note}</p>
                  </div>
                )}

                {copied && (
                  <p className="mt-3 text-center text-[11px] font-bold text-emerald-600">
                    ✓ Đã sao chép
                  </p>
                )}

                <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <Gift size={17} className="text-sky-500" />
                    <p className="text-xs font-black text-slate-800">
                      Thông tin giao dịch
                    </p>
                  </div>
                  <p className="mt-2 text-[11px] leading-5 text-slate-400">
                    Đây là thông tin được lưu cho đơn hàng. Trạng thái sẽ được cập nhật khi đơn hoàn tất.
                  </p>
                </div>
              </div>
            </section>
          )}
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC] pb-28 text-slate-900">
      <TopHeader />
      <main className="mx-auto w-full max-w-2xl px-4 py-5">
        <button
          type="button"
          onClick={() => navigate("/store")}
          className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-sky-600"
        >
          <ArrowLeft size={17} />
          Cửa hàng
        </button>

        <div className="mb-5 rounded-[28px] bg-gradient-to-br from-sky-500 to-cyan-400 p-5 text-white shadow-[0_16px_45px_rgba(14,165,233,0.2)]">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <HistoryIcon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                Giao dịch
              </p>
              <h1 className="text-xl font-black">Lịch sử</h1>
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-white/80">
            Theo dõi tên, thời gian, trạng thái và số Coin của các đơn hàng.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 animate-pulse rounded-[22px] bg-white ring-1 ring-slate-100" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[24px] bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-black text-rose-600">{error}</p>
          </div>
        ) : !orders.length ? (
          <div className="rounded-[24px] border border-dashed border-sky-100 bg-white px-5 py-14 text-center">
            <HistoryIcon className="mx-auto text-sky-400" size={30} />
            <p className="mt-4 text-sm font-black text-slate-700">Chưa có giao dịch</p>
            <p className="mt-1 text-xs text-slate-400">Khi có đơn hàng, chúng sẽ hiện ở đây.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const config =
                statusConfig[String(order.status || "").toLowerCase()] ||
                statusConfig.pending;
              const [statusLabel, StatusIcon] = config;

              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => navigate(`/history/order/${encodeURIComponent(order.id)}`)}
                  className="group w-full rounded-[22px] border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-500">
                      <Package size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-900">
                            {order.package_name || "Đơn hàng"}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-400">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <span className="flex shrink-0 items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-600">
                          <StatusIcon size={11} />
                          {statusLabel}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="flex items-center gap-1.5 text-xs font-black text-sky-600">
                          <Coins size={14} />
                          {formatNumber(order.coin_cost)} xu
                        </span>
                        <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                          Chi tiết
                          <ArrowLeft size={14} className="rotate-180 transition group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
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
