import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  X,
  AlertTriangle,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

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

    const timer = setTimeout(() => {
      setCounting((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [counting, targetUrl, navigate]);

  const handleGoNow = () => {
    if (!targetUrl) return;

    window.location.href = targetUrl;
  };

  if (!targetUrl) return null;

  return (
    <div className="min-h-screen bg-[#F7FAF7] px-4 py-5 text-[#18231D]">
      <div className="mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-md flex-col">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-[18px] font-black tracking-tight">
            Chuyển hướng
          </h1>

          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#7B877F] shadow-[0_3px_12px_rgba(30,50,35,0.08)] active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex flex-1 flex-col items-center justify-center">

          {/* MASCOT */}
          <div className="relative mb-5 flex h-44 w-44 items-center justify-center">

            {/* Glow */}
            <div className="absolute inset-5 rounded-full bg-[#DDF4E1] blur-2xl" />

            {/* Decorative circles */}
            <div className="absolute left-4 top-10 h-3 w-3 rounded-full bg-[#9BDBAA]" />
            <div className="absolute right-5 top-6 h-2 w-2 rounded-full bg-[#B8E8C2]" />
            <div className="absolute bottom-7 left-8 h-2.5 w-2.5 rounded-full bg-[#B8E8C2]" />

            {/* Pig mascot */}
            <div
              className="relative flex h-32 w-32 items-center justify-center rounded-[42%] bg-gradient-to-br from-[#FFB7A9] to-[#FF8F82] shadow-[0_14px_30px_rgba(255,143,130,0.25)]"
              style={{
                animation:
                  "redirect-float 1.5s ease-in-out infinite",
              }}
            >
              {/* Ears */}
              <div className="absolute -left-1 top-4 h-10 w-10 rotate-[-25deg] rounded-[45%] bg-[#FF9E91]" />
              <div className="absolute -right-1 top-4 h-10 w-10 rotate-[25deg] rounded-[45%] bg-[#FF9E91]" />

              {/* Face */}
              <div className="relative z-10 flex h-full w-full flex-col items-center justify-center">

                {/* Eyes */}
                <div className="mt-2 flex gap-8">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#54352F]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#54352F]" />
                </div>

                {/* Snout */}
                <div className="mt-3 flex h-9 w-12 items-center justify-center gap-2 rounded-full bg-[#FF796D]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#C9554C]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#C9554C]" />
                </div>

                {/* Smile */}
                <div className="mt-1 h-2 w-5 rounded-b-full border-b-2 border-[#874A43]" />
              </div>

              {/* Little bag */}
              <div className="absolute -bottom-3 -right-5 flex h-14 w-14 rotate-[-10deg] items-center justify-center rounded-2xl bg-[#48B967] shadow-lg">
                <ShoppingBag size={25} className="text-white" />
              </div>
            </div>
          </div>

          {/* BADGE */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF8EC] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wide text-[#43A85F]">
            <ShoppingBag size={12} />
            Mua hàng tích điểm
          </div>

          {/* TITLE */}
          <h2 className="mt-3 text-center text-[22px] font-black text-[#18231D]">
            Chuyển hướng
          </h2>

          {/* DESCRIPTION */}
          <p className="mt-2 max-w-[290px] text-center text-[13px] font-medium leading-5 text-[#78867D]">
            Sếp chờ xíu nha, Nô Tì đang đưa sếp
            <br />
            qua trang mua sắm đâyy 💚
          </p>

          {/* WARNING */}
          <div className="mt-6 w-full rounded-[20px] border border-[#F0B5B5] bg-[#FFF6F6] p-4">
            <div className="flex items-start gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFE4E4]">
                <AlertTriangle
                  size={18}
                  className="text-[#D94D4D]"
                />
              </div>

              <div className="flex-1">
                <p className="text-[12px] font-black text-[#B63E3E]">
                  Lưu ý quan trọng
                </p>

                <p className="mt-1 text-[11px] leading-[18px] text-[#855F5F]">
                  Không nên mua 1 sản phẩm quá nhiều lần,
                  làm vậy có thể bị các sàn đánh dấu vi phạm.
                </p>
              </div>
            </div>
          </div>

          {/* COUNTDOWN */}
          <p className="mt-4 text-center text-[10px] font-medium text-[#9AA49E]">
            {counting > 0
              ? `Sẵn sàng chuyển hướng sau ${counting} giây...`
              : "Bạn có thể đến trang mua sắm ngay"}
          </p>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleGoNow}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-[18px] bg-[#45B967] py-[15px] text-[13px] font-black text-white shadow-[0_9px_20px_rgba(69,185,103,0.22)] transition active:scale-[0.98]"
        >
          {counting > 0
            ? `Đến ngay >> (${counting}s)`
            : "Đến ngay >>"}

          <ArrowRight size={16} />
        </button>

        {/* FOOTER */}
        <p className="mb-1 text-center text-[9px] font-medium leading-4 text-[#A2AAA5]">
          Hãy mua đúng sản phẩm từ link để đơn hàng
          <br />
          được ghi nhận và tích điểm.
        </p>
      </div>

      {/* ANIMATION */}
      <style>{`
        @keyframes redirect-float {
          0%,
          100% {
            transform: translateY(0) rotate(-2deg);
          }

          50% {
            transform: translateY(-9px) rotate(2deg);
          }
        }
      `}</style>
    </div>
  );
            }
