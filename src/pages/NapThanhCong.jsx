import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  Copy,
  Home,
  History as HistoryIcon,
  Coins,
  CreditCard,
  Package,
  Calendar,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { supabase } from "../lib/supabaseClient.js";

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN").format(Number(value || 0)) + "đ";

export default function NapThanhCong() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const coinsAdded = location.state?.coinsAdded || 0;

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (err) {
        console.error("Load order error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [orderId]);

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    alert("Đã sao chép!");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <TopHeader />

      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        {/* === HERO BANNER === */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-6 shadow-xl shadow-emerald-500/20 sm:p-8">
          {/* Decorative circles */}
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5" />

          <div className="relative flex flex-col items-center text-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-white/30" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
                <CheckCircle2 size={44} className="text-emerald-600" strokeWidth={2.5} />
              </div>
            </div>

            <h1 className="mt-5 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Nạp thẻ thành công!
            </h1>

            <p className="mt-2 max-w-md text-sm text-emerald-50">
              Coin đã được cộng tự động vào tài khoản của bạn
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
              <Sparkles size={14} className="text-amber-300" />
              <span className="text-xs font-bold text-white">
                Giao dịch hoàn tất
              </span>
            </div>
          </div>
        </div>

        {/* === COIN CARD === */}
        <div className="-mt-6 mx-2 overflow-hidden rounded-2xl bg-white p-5 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 sm:mx-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Coin nhận được
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-600 sm:text-4xl">
                  +{Number(coinsAdded).toLocaleString("vi-VN")}
                </span>
                <span className="text-sm font-bold text-slate-400">Coin</span>
              </div>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
              <Coins size={26} strokeWidth={2.5} />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5">
            <TrendingUp size={14} className="shrink-0 text-emerald-600" />
            <p className="text-xs font-semibold text-emerald-700">
              Số dư đã được cập nhật vào ví của bạn
            </p>
          </div>
        </div>

        {/* === ORDER DETAILS === */}
        {!loading && order && (
          <div className="mt-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50">
                <Package size={17} className="text-sky-600" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">
                  Thông tin đơn hàng
                </h2>
                <p className="text-[11px] text-slate-400">
                  Chi tiết giao dịch của bạn
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-slate-100">
              <DetailCell
                icon={<CreditCard size={14} />}
                label="Mã đơn"
                value={order.order_code}
                copyable
                onCopy={handleCopy}
                full
              />
              <DetailCell
                icon={<Package size={14} />}
                label="Gói nạp"
                value={order.package_id}
              />
              <DetailCell
                icon={<Coins size={14} />}
                label="Số tiền"
                value={formatPrice(order.amount)}
              />
              <DetailCell
                icon={<CreditCard size={14} />}
                label="Thanh toán"
                value={order.payment_method === "card" ? "Thẻ cào" : order.payment_method}
              />
              <DetailCell
                icon={<CheckCircle2 size={14} />}
                label="Trạng thái"
                value="Đã giao"
                highlight
              />
              <DetailCell
                icon={<Calendar size={14} />}
                label="Thời gian"
                value={new Date(order.created_at).toLocaleString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
                full
              />
            </div>
          </div>
        )}

        {/* === ACTION BUTTONS === */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() => navigate("/store")}
            className="group flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
          >
            <Home size={18} />
            Về cửa hàng
            <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
          </button>

          <button
            onClick={() => navigate("/history")}
            className="group flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-sky-300 hover:text-sky-600 hover:shadow-md active:translate-y-0"
          >
            <HistoryIcon size={18} />
            Xem lịch sử
            <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* === FOOTER NOTE === */}
        <p className="mt-6 text-center text-[11px] text-slate-400">
          Cảm ơn bạn đã sử dụng dịch vụ NXX315 Studio Rewards 💚
        </p>
      </main>

      <BottomNav />
    </div>
  );
}

/* =====================================================
 * DETAIL CELL COMPONENT
 * ===================================================== */

function DetailCell({ icon, label, value, copyable, onCopy, highlight, full }) {
  return (
    <div
      className={`flex flex-col gap-2 bg-white p-4 ${
        full ? "col-span-2" : "col-span-1"
      }`}
    >
      <div className="flex items-center gap-1.5">
        <span className={`${highlight ? "text-emerald-500" : "text-slate-400"}`}>
          {icon}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>

      <div className="flex min-w-0 items-center justify-between gap-2">
        <span
          className={`truncate text-sm font-black ${
            highlight ? "text-emerald-600" : "text-slate-900"
          }`}
        >
          {value ?? "—"}
        </span>

        {copyable && value != null && (
          <button
            onClick={() => onCopy(String(value))}
            className="shrink-0 rounded-lg p-1.5 text-sky-500 transition hover:bg-sky-50"
            title="Sao chép"
          >
            <Copy size={13} />
          </button>
        )}
      </div>
    </div>
  );
              }
