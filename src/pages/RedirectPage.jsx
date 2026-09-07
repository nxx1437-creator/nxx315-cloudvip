import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

export default function Redirect() {
  const [params] = useSearchParams();

  const [seconds, setSeconds] =
    useState(2);

  const url =
    params.get("url") || "";

  const productName =
    params.get("name") ||
    "Sản phẩm TikTok Shop";

  const productImage =
    params.get("image") || "";

  const destination = useMemo(() => {

    try {

      const parsed =
        new URL(url);

      if (
        !["http:", "https:"].includes(
          parsed.protocol
        )
      ) {
        return null;
      }

      return parsed.toString();

    } catch {
      return null;
    }

  }, [url]);

  const goNow = () => {

    if (destination) {
      window.location.assign(
        destination
      );
    }

  };

  useEffect(() => {

    if (!destination) {
      return;
    }

    if (seconds <= 0) {

      goNow();

      return;
    }

    const timer =
      setTimeout(() => {

        setSeconds(
          (value) =>
            value - 1
        );

      }, 1000);

    return () =>
      clearTimeout(timer);

  }, [
    destination,
    seconds,
  ]);

  return (
    <div className="min-h-screen bg-[#F5F8F4] px-4 pb-10 text-[#18231D]">

      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center">

        <div className="w-full rounded-[30px] bg-white p-6 shadow-[0_12px_35px_rgba(31,55,40,0.08)]">

          {/* TIÊU ĐỀ */}

          <div className="text-center">

            <div className="inline-flex items-center rounded-full bg-[#EFF9EC] px-3 py-1.5 text-[10px] font-black text-[#43A85F]">
              MUA HÀNG TÍCH ĐIỂM
            </div>

            <h1 className="mt-3 text-xl font-black text-[#18231D]">
              Chuyển hướng
            </h1>

            <p className="mx-auto mt-2 max-w-[300px] text-xs font-medium leading-5 text-[#78867D]">
              bạn đợi chờ xíu nha, hệ thống đang đưa bạn qua trang mua sắm!
            </p>

          </div>

          {/* SẢN PHẨM */}

          <div className="mt-5 overflow-hidden rounded-2xl border border-[#E8EEE9] bg-[#F8FBF8]">

            {productImage ? (

              <img
                src={productImage}
                alt={productName}
                className="h-52 w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display =
                    "none";
                }}
              />

            ) : (

              <div className="h-32 w-full bg-[#EEF4EF]" />

            )}

            <div className="p-4">

              <p className="text-[9px] font-bold uppercase tracking-wide text-[#8A968E]">
                Sản phẩm
              </p>

              <p className="mt-1 line-clamp-2 text-sm font-black leading-5 text-[#18231D]">
                {productName}
              </p>

              <div className="mt-2 inline-flex rounded-full bg-[#EFF9EC] px-2 py-1 text-[9px] font-bold text-[#43A85F]">
                TikTok Shop
              </div>

            </div>

          </div>

          {/* CẢNH BÁO */}

          <div className="mt-4 rounded-2xl border border-[#F2C7C7] bg-[#FFF7F7] p-3.5">

            <div className="flex gap-2.5">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFE8E8] text-[#E05252]">

                <ShieldAlert size={16} />

              </div>

              <div>

                <p className="text-[11px] font-black text-[#B73F3F]">
                  Lưu ý quan trọng
                </p>

                <p className="mt-1 text-[10px] leading-4 text-[#855F5F]">
                  Không nên mua 1 sản phẩm quá nhiều lần, làm vậy có thể bị các sàn đánh dấu vi phạm.
                </p>

              </div>

            </div>

          </div>

          {/* LINK KHÔNG HỢP LỆ */}

          {!destination ? (

            <p className="mt-4 rounded-xl bg-[#FFF1F1] px-3 py-2.5 text-center text-[10px] font-bold text-[#C94B4B]">
              Link mua hàng không hợp lệ. Vui lòng quay lại và tạo link mới.
            </p>

          ) : (

            <button
              onClick={goNow}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#45B967] py-3.5 text-xs font-black text-white shadow-[0_8px_18px_rgba(69,185,103,0.2)] active:scale-[0.99]"
            >

              Mua ngay{" "}
              {seconds > 0
                ? `(${seconds})`
                : ""}

              <ArrowRight
                size={15}
              />

            </button>

          )}

          {/* FOOTER */}

          <p className="mt-4 text-center text-[9px] font-medium leading-4 text-[#A0AAA4]">

            Link sẽ tự chuyển sau{" "}
            {seconds > 0
              ? `${seconds} giây`
              : "ít giây"}
            . Hãy mua đúng sản phẩm để được ghi nhận điểm.

          </p>

        </div>

      </main>

    </div>
  );
}
