import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { X, Coins, AlertTriangle } from "lucide-react";

export default function RedirectPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const targetUrl = searchParams.get("url");
  const [counting, setCounting] = useState(2);

  useEffect(() => {
    if (!targetUrl) {
      navigate("/shop-earn", { replace: true });
      return;
    }

    if (counting <= 0) return;

    const timer = setTimeout(() => setCounting((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [counting, targetUrl, navigate]);

  const handleGoNow = () => {
    window.location.href = targetUrl;
  };

  if (!targetUrl) return null;

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FB] px-5 py-6 text-[#111827]">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#111827]">Chuyển hướng</h1>
        <button
          onClick={() => navigate(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#6B7280] shadow-sm"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="relative flex h-40 w-40 items-center justify-center">
          <div className="absolute h-40 w-40 rounded-full bg-gradient-to-br from-sky-200/60 to-sky-400/20 blur-2xl" />
          <div
            className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-sky-400 to-blue-600 shadow-xl"
            style={{ animation: "redirect-fly 1.4s ease-in-out infinite" }}
          >
            <Coins size={44} className="text-white" />
          </div>
        </div>

        <style>{`
          @keyframes redirect-fly {
            0%, 100% { transform: translateY(0) rotate(-4deg); }
            50% { transform: translateY(-10px) rotate(4deg); }
          }
        `}</style>

        <p className="mt-6 text-center text-base font-semibold text-[#374151]">
          Chờ xíu nha, NXX315 đang đưa bạn
          <br />qua trang mua sắm đây
        </p>

        <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
          <p className="text-xs leading-5 text-amber-700">
            Không nên mua 1 sản phẩm quá nhiều lần, làm vậy có thể bị sàn đánh dấu vi phạm.
          </p>
        </div>
      </div>

      <button
        onClick={handleGoNow}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/25"
      >
        {counting > 0 ? `Đến ngay >> (${counting}s)` : "Đến ngay >>"}
      </button>
    </div>
  );
}
