import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, User } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import { getAccountRows } from "../lib/orderView.js";

const VALID_SOURCES = ["orders", "redemption_orders"];
const ID_RE = /^[0-9a-zA-Z-]{1,64}$/;

function Step({ n, title, children }) {
  return (
    <section className="border-b border-gray-100 px-5 py-5">
      <div className="flex items-baseline gap-2.5">
        <span className="text-[22px] font-semibold text-rose-500">
          {String(n).padStart(2, "0")}
        </span>
        <h2 className="text-[19px] font-semibold leading-snug text-gray-900">{title}</h2>
      </div>
      <div className="mt-1.5 text-[15px] leading-6 text-gray-500">{children}</div>
    </section>
  );
}

export default function OrderNotReceived() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const source = searchParams.get("source");

  const [order, setOrder] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (!id || !ID_RE.test(String(id))) return;

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const tables = source && VALID_SOURCES.includes(source) ? [source] : VALID_SOURCES;

        for (const table of tables) {
          const { data } = await supabase
            .from(table)
            .select("*")
            .eq("id", id)
            .eq("user_id", user.id)
            .maybeSingle();

          if (data) {
            if (alive) setOrder({ ...data, __source: table });
            return;
          }
        }
      } catch (err) {
        console.error("OrderNotReceived error:", err);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id, source]);

  const rows = order ? getAccountRows(order) : [];
  if (order?.delivery_target) {
    rows.push({ label: "Thông tin nhận", value: order.delivery_target });
  }
  const first = rows[0];
  const proofs = Array.isArray(order?.proof_urls) ? order.proof_urls : [];

  return (
    <div className="min-h-screen bg-white pb-32 text-gray-900">
      <header className="sticky top-0 z-10 flex items-center border-b border-gray-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full active:bg-gray-100"
          aria-label="Quay lại"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="flex-1 pr-9 text-center text-[17px] font-bold">
          Không nhận được hàng?
        </h1>
      </header>

      <Step n={1} title="Kiểm tra bằng chứng giao hàng">
        Xem ghi chú và hình ảnh admin gửi trong phần Theo dõi đơn hàng để biết đơn đã được
        giao như thế nào.
        {proofs.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {proofs.map((url) => (
              <img
                key={url}
                src={url}
                alt="Bằng chứng giao hàng"
                className="aspect-square w-full rounded-xl border border-gray-100 object-cover"
              />
            ))}
          </div>
        )}
      </Step>

      <Step n={2} title="Kiểm tra tài khoản nhận hàng">
        Đơn đã được giao đến thông tin bạn cung cấp khi đặt hàng. Hãy chắc chắn thông tin
        này đúng.
        <button
          type="button"
          onClick={() => rows.length > 0 && setOpen((v) => !v)}
          className="mt-3 flex w-full items-start gap-3 rounded-2xl bg-gray-50 px-4 py-3 text-left"
        >
          <User size={20} className="mt-0.5 shrink-0 text-gray-900" />
          <div className="min-w-0 flex-1">
            {first ? (
              <>
                <p className="truncate text-[15px] font-semibold text-gray-900">
                  {first.label}: {first.value}
                </p>
                {open && (
                  <div className="mt-2 space-y-1.5">
                    {rows.slice(1).map((r) => (
                      <p key={r.label} className="break-all text-[13px] text-gray-500">
                        {r.label}: <span className="text-gray-800">{r.value}</span>
                      </p>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-[14px] text-gray-400">Đang tải thông tin đơn hàng...</p>
            )}
          </div>
          {rows.length > 1 && (
            <ChevronDown
              size={20}
              className={`mt-0.5 shrink-0 text-gray-400 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          )}
        </button>
      </Step>

      <Step n={3} title="Kiểm tra lại trong game">
        Mở game và xem lại số dư (Robux, Kim Cương, Quân Huy...). Một số game cần đăng nhập
        lại hoặc chờ vài phút mới cập nhật.
      </Step>

      <Step n={4} title="Kiểm tra thông báo từ admin">
        Xem chuông thông báo trên web, email hoặc Zalo/Discord bạn đã dùng khi đặt hàng xem
        admin có nhắn gì không.
        <button
          type="button"
          onClick={() => navigate("/notifications")}
          className="mt-2 block text-[15px] font-semibold text-teal-600"
        >
          Mở thông báo
        </button>
      </Step>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-gray-100 bg-white px-5 pb-6 pt-3">
        <p className="mb-2 text-center text-[12px] text-gray-400">
          Đã kiểm tra đủ các bước mà vẫn chưa nhận được hàng?
        </p>
        <button
          type="button"
          onClick={() => navigate("/support")}
          className="w-full rounded-full bg-gray-900 py-3.5 text-[15px] font-bold text-white active:opacity-80"
        >
          Tạo yêu cầu để được hỗ trợ
        </button>
      </div>
    </div>
  );
    }
