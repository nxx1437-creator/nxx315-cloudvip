import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Check, CheckCircle2, Copy, Loader2, Zap } from "lucide-react";
 
import { supabase } from "../lib/supabaseClient.js";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import {
  PageShell,
  Panel,
  PillButton,
} from "../components/pay/DimensionKit.jsx";

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");

function formatTime(value) {
  const d = value ? new Date(value) : new Date();
  const time = d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return `${time} - ${date}`;
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-[14px]">
      <span className="shrink-0 text-gray-500">{label}</span>
      <span className="min-w-0 break-all text-right font-semibold text-gray-900">
        {children}
      </span>
    </div>
  );
}

export default function OrderSuccess() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { state } = useLocation();

  const [info, setInfo] = useState(state || null);
  const [loading, setLoading] = useState(!state);
  const [copied, setCopied] = useState(false);

  // Tải lại trang (mất state) -> lấy đơn từ database
  useEffect(() => {
    if (state) return;
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();
        if (error) throw error;
        if (cancelled) return;
        setInfo({
          game: "Đơn hàng",
          orderCode: data.order_code,
          amount: data.amount,
          paidAt: data.paid_at || data.updated_at || data.created_at,
        });
      } catch (e) {
        console.error("Load order error:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId, state]);

  const copyCode = async () => {
    try {
      await navigator.clipboard?.writeText(info?.orderCode || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-white">
      <PageShell>
        <TopHeader />

        <main className="mx-auto w-full max-w-md px-4 py-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-gray-400" size={28} />
            </div>
          ) : (
            <>
              {/* Tiêu đề + số tiền */}
              <div className="px-1">
                <CheckCircle2
                  size={52}
                  className="text-emerald-500"
                  strokeWidth={1.75}
                />
                <h1 className="mt-4 text-[26px] font-semibold leading-tight tracking-[-0.035em] text-gray-900">
                  Thanh toán thành công
                </h1>

                <p className="mt-3 flex items-baseline gap-2 text-[48px] font-semibold leading-none tracking-[-0.035em] text-gray-900">
                  {fmt(info?.amount)}
                  <span className="text-[20px] font-medium tracking-normal text-gray-400">
                    Coin
                  </span>
                </p>

                <p className="mt-3 text-[13px] text-gray-500">
                  {formatTime(info?.paidAt)}
                  {info?.orderCode && <> · Mã đơn: {info.orderCode}</>}
                </p>
              </div>

              {/* Chi tiết đơn */}
              <Panel className="mt-6 divide-y divide-gray-100 px-5 py-2 shadow-sm">
                <Row label="Game">
                  <span className="inline-flex items-center gap-2">
                    {info?.logo && (
                      <img
                        src={info.logo}
                        alt=""
                        className="h-6 w-6 rounded-md object-cover"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    )}
                    {info?.game || "Đơn hàng"}
                  </span>
                </Row>

                {info?.packageLabel && (
                  <Row label="Gói">{info.packageLabel}</Row>
                )}

                {info?.accountValue && (
                  <Row label={info.accountLabel || "ID game"}>
                    {info.accountValue}
                  </Row>
                )}

                {info?.orderCode && (
                  <Row label="Mã đơn">
                    <span className="inline-flex items-center gap-2">
                      <span className="font-mono">{info.orderCode}</span>
                      <button
                        type="button"
                        onClick={copyCode}
                        aria-label="Sao chép mã đơn"
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </span>
                  </Row>
                )}

                <Row label="Phương thức">Coin trong ví</Row>

                {info?.remainingCoins !== undefined &&
                  info?.remainingCoins !== null && (
                    <Row label="Coin còn lại">
                      {fmt(info.remainingCoins)} Coin
                    </Row>
                  )}
              </Panel>

              {/* Ghi chú xử lý */}
              <div className="mt-3 flex items-start gap-2.5 rounded-[16px] border border-gray-200 bg-gray-50 p-3.5">
                <Zap size={16} className="mt-0.5 shrink-0 text-gray-900" />
                <p className="text-[13px] leading-5 text-gray-600">
                  Đơn hàng đang được xử lý tự động. Bạn có thể theo dõi trạng
                  thái trong lịch sử đơn hàng.
                </p>
              </div>

              {/* Nút */}
              <div className="mt-6 space-y-3">
                <PillButton onClick={() => navigate("/store")} className="h-14">
                  Quay lại cửa hàng
                </PillButton>

                <button
                  type="button"
                  onClick={() => navigate(`/history/order/${orderId}`)}
                  className="w-full py-2 text-center text-[14px] text-gray-900 underline underline-offset-4 transition hover:text-gray-600"
                >
                  Xem lịch sử đơn hàng
                </button>
              </div>
            </>
          )}
        </main>

        <BottomNav />
      </PageShell>
    </div>
  );
}
