import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ShieldAlert,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Redirect() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [seconds, setSeconds] = useState(2);
  const [opening, setOpening] = useState(false);

  const url = params.get("url") || "";
  const productName =
    params.get("name") || "Sản phẩm TikTok Shop";
  const productImage = params.get("image") || "";

  const destination = useMemo(() => {
    try {
      const parsed = new URL(url);

      if (!["http:", "https:"].includes(parsed.protocol)) {
        return null;
      }

      return parsed.toString();
    } catch {
      return null;
    }
  }, [url]);

  /*
   * Mở link mua hàng ở tab/cửa sổ mới.
   * Sau đó quay lại ShopEarn để màn "Chuyển hướng"
   * không bị giữ lại.
   */
  const goNow = () => {
    if (!destination || opening) return;

    setOpening(true);

    try {
      const newWindow = window.open(
        destination,
        "_blank",
        "noopener,noreferrer"
      );

      /*
       * Nếu trình duyệt cho phép mở tab mới,
       * quay lại giao diện Mua hàng kiếm sao.
       */
      if (newWindow) {
        setTimeout(() => {
          navigate(-1);
        }, 250);
        return;
      }

      /*
       * Một số trình duyệt/webview chặn window.open.
       * Khi đó dùng location để vẫn mở được link.
       */
      window.location.href = destination;
    } catch {
      window.location.href = destination;
    }
  };

  useEffect(() => {
    if (!destination) return;

    if (seconds <= 0) {
      goNow();
      return;
    }

    const timer = setTimeout(() => {
      setSeconds((value) => value - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [seconds, destination]);

  return (
    <div className="min-h-screen bg-[#F5F8F4] px-4 pb-10 text-[#18231D]">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center py-6">
        <div className="w-full overflow-hidden rounded-[30px] bg-white shadow-[0_12px_35px_rgba(31,55,40,0.08)]">

          {/* HEADER */}
          <div className="bg-gradient-to-br from-[#EAF8E8] via-[#F5FFF3] to-white px-6 pb-6 pt-7 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-[#DDF0DA]">
              <ShoppingBag
                size={24}
                className="text-[#45B967]"
              />
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#E8F7E5] px-3 py-1.5 text-[10px] font-black text-[#43A85F]">
              <ShoppingBag size={12} />
              MUA HÀNG TÍCH ĐIỂM
            </div>

            <h1 className="mt-3 text-xl font-black text-[#18231D]">
              Chuyển hướng
            </h1>

            <p className="mx-auto mt-2 max-w-[300px] text-xs font-medium leading-5 text-[#78867D]">
              bạn chờ xíu nha, hệ thống đang đưa bạn đến trang mua sắm 
            </p>
          </div>

          {/* CONTENT */}
          <div className="px-5 pb-6">

            {/* PRODUCT */}
            <div className="mt-5 rounded-2xl border border-[#E8ECE9] bg-[#FAFCFA] p-3.5">
              <div className="flex items-center gap-3">

                {productImage ? (
                  <img
                    src={productImage}
                    alt={productName}
                    className="h-20 w-20 shrink-0 rounded-xl bg-white object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-[#E8ECE9]">
                    <ShoppingBag
                      size={28}
                      className="text-[#C8D2CB]"
                    />
                  </div>
                )}

                <div className="min-w-0 flex-1 text-left">

                  <span className="inline-flex rounded-md bg-black px-1.5 py-0.5 text-[8px] font-black text-white">
                    TikTok Shop
                  </span>

                  <p className="mt-1.5 line-clamp-3 text-xs font-bold leading-5 text-[#18231D]">
                    {productName}
                  </p>

                </div>
              </div>
            </div>

            {/* WARNING */}
            <div className="mt-4 rounded-2xl border border-[#F2C7C7] bg-[#FFF7F7] p-3.5 text-left">
              <div className="flex gap-2.5">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFE8E8] text-[#E05252]">
                  <ShieldAlert size={16} />
                </div>

                <div>
                  <p className="text-[11px] font-black text-[#B73F3F]">
                    Lưu ý quan trọng
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-[#855F5F]">
                    Không nên mua 1 sản phẩm quá nhiều lần,
                    làm vậy có thể bị các sàn đánh dấu vi phạm đó!
                  </p>
                </div>

              </div>
            </div>

            {/* INVALID LINK */}
            {!destination ? (
              <div className="mt-4 rounded-xl bg-[#FFF1F1] px-3 py-2.5 text-center">
                <p className="text-[10px] font-bold text-[#C94B4B]">
                  Link mua hàng không hợp lệ.
                </p>

                <button
                  onClick={() => navigate(-1)}
                  className="mt-2 text-[10px] font-black text-[#45B967]"
                >
                  Quay lại
                </button>
              </div>
            ) : (
              <>
                {/* BUTTON */}
                <button
                  onClick={goNow}
                  disabled={opening}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#45B967] py-3.5 text-xs font-black text-white shadow-[0_8px_18px_rgba(69,185,103,0.2)] transition active:scale-[0.99] disabled:opacity-70"
                >
                  {opening ? (
                    <>
                      <CheckCircle2
                        size={15}
                        className="animate-pulse"
                      />
                      Đang mở trang mua hàng...
                    </>
                  ) : (
                    <>
                      {seconds > 0
                        ? `Đang chuyển hướng (${seconds})`
                        : "Mua ngay"}

                      <ArrowRight size={15} />
                    </>
                  )}
                </button>

                <p className="mt-3 flex items-center justify-center gap-1 text-[9px] font-medium text-[#A0AAA4]">
                  <ExternalLink size={10} />
                  Link mua hàng sẽ mở ở trang mới
                </p>
              </>
            )}

            {/* FOOTER */}
            <p className="mt-4 text-center text-[9px] font-medium leading-4 text-[#A0AAA4]">
              Hãy mua đúng sản phẩm và hoàn tất đơn hàng
              để được ghi nhận điểm.
            </p>

          </div>
        </div>
      </main>
    </div>
  );
      }
