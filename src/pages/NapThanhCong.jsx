import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  Copy,
  Home,
  History as HistoryIcon,
  Coins,
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
    <div className="min-h-screen bg-[#F5F7FB] pb-24">
      <TopHeader />

      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 size={44} className="text-emerald-600" />
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-900">
            Nạp thẻ thành công!
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Coin đã được cộng vào tài khoản của bạn
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white shadow-lg shadow-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-100">
                Coin nhận được
              </p>
              <p className="mt-1 text-3xl font-black">
                +{Number(coinsAdded).toLocaleString("vi-VN")}
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Coins size={28} />
            </div>
          </div>
        </div>

        {!loading && order && (
          <div className="mt-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-3 text-base font-black text-slate-900">
              Thông tin đơn hàng
            </h2>

            <InfoRow
              label="Mã đơn"
              value={order.order_code}
              onCopy={handleCopy}
            />
            <InfoRow label="Gói nạp" value={order.package_id} />
            <InfoRow label="Số tiền" value={formatPrice(order.amount)} />
            <InfoRow
              label="Thanh toán"
              value={
                order.payment_method === "card"
                  ? "Thẻ cào"
                  : order.payment_method
              }
            />
            <InfoRow label="Trạng thái" value="Đã giao" />
            <InfoRow
              label="Thời gian"
              value={new Date(order.created_at).toLocaleString("vi-VN")}
            />
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            onClick={() => navigate("/store")}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-600 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition hover:opacity-95"
          >
            <Home size={18} />
            Về cửa hàng
          </button>

          <button
            onClick={() => navigate("/history")}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <HistoryIcon size={18} />
            Xem lịch sử
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

function InfoRow({ label, value, onCopy }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <span className="text-xs text-slate-400">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-sm font-bold text-slate-800">
          {value ?? "—"}
        </span>
        {onCopy && value != null && (
          <button
            onClick={() => onCopy(String(value))}
            className="shrink-0 text-sky-500"
          >
            <Copy size={14} />
          </button>
        )}
      </div>
    </div>
  );
                }
