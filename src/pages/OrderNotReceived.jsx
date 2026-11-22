import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, MapPin, Sparkles } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import { getAccountRows } from "../lib/orderView.js";

const VALID_SOURCES = ["orders", "redemption_orders"];
const ID_RE = /^[0-9a-zA-Z-]{1,64}$/;

function Step({ n, title, children }) {
  return (
    <section className="border-b border-gray-100 px-5 py-5">
      <div className="flex items-baseline gap-2.5 mb-2">
        <span className="text-[20px] font-semibold text-rose-500 tracking-tight">
          {String(n).padStart(2, "0")}
        </span>
        <h2 className="text-[18px] font-semibold leading-snug text-gray-900">{title}</h2>
      </div>
      <div className="text-[15px] leading-relaxed text-gray-500">{children}</div>
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
    <div className="min-h-screen bg-[#f8f9fa] pb-32 text-gray-900">
      {/* HEADER MỚI THEO YÊU CẦU */}
      <header className="sticky top-0 z-10 bg-[#f8f9fa] px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          {/* Nút Logo (Hình tròn) */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm active:bg-gray-50"
            aria-label="Trang chủ"
          >
            {/* Bạn có thể thay <Sparkles> bằng <img src="link_logo_cua_ban" /> */}
            <Sparkles size={24} className="text-gray-800" />
          </button>

          {/* Thanh điều hướng (Bo tròn) */}
          <div className="flex h-[52px] flex-1 items-center justify-between rounded-full border border-gray-200 bg-white px-2 shadow-sm">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-full items-center gap-1.5 rounded-full px-3 text-[15px] font-medium text-gray-700 active:bg-gray-100"
            >
              <ArrowLeft size={20} />
              Quay lại
            </button>
            
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex h-full items-center rounded-full px-4 text-[15px] font-medium text-gray-700 active:bg-gray-100"
            >
              Trang chủ
            </button>
          </div>
        </div>
      </header>

      {/* Nội dung bên dưới giữ nguyên */}
      <div className="mt-2 bg-white">
        <Step n={1} title="Kiểm tra bằng chứng giao hàng">
          Xem hình ảnh nhân viên chuyển phát cung cấp để định vị kiện hàng
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

        <Step n={2} title="Kiểm tra địa chỉ giao hàng">
          Kiện hàng đã giao đến địa chỉ bạn cung cấp
          <button
            type="button"
            onClick={() => rows.length > 0 && setOpen((v) => !v)}
            className="mt-3 flex w-full items-start gap-3 rounded-xl bg-gray-50 px-4 py-3.5 text-left transition-colors hover:bg-gray-100"
          >
            <MapPin size={20} className="mt-0.5 shrink-0 text-gray-800" />
            <div className="min-w-0 flex-1">
              {first ? (
                <>
                  <p className="truncate text-[15px] font-semibold text-gray-900">
                    {first.label}: {first.value}
                  </p>
                  {first.subValue && (
                    <p className="mt-0.5 truncate text-[13px] text-gray-500">
                      {first.subValue}
                    </p>
                  )}
                  {open && (
                    <div className="mt-2 space-y-1.5 border-t border-gray-200 pt-2">
                      {rows.slice(1).map((r) => (
                        <p key={r.label} className="break-all text-[13px] text-gray-500">
                          {r.label}: <span className="text-gray-800">{r.value}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-[14px] text-gray-400">Đang tải thông tin...</p>
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

        <Step n={3} title="Kiểm tra với người nhận">
          Hỏi hàng xóm hoặc thành viên trong gia đình xem họ có nhận hàng thay bạn không
        </Step>

        <Step n={4} title="Kiểm tra thông báo của đơn vị vận chuyển">
          Kiểm tra email hoặc tin nhắn xem có thông báo giao hàng từ đơn vị vận chuyển hay không. Bạn cũng có thể liên hệ với họ.
        </Step>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-gray-100 bg-white px-5 pb-6 pt-4">
        <p className="mb-3 text-center text-[13px] text-gray-500">
          Đã kiểm tra đủ các bước mà vẫn chưa nhận được hàng?
        </p>
        <button
          type="button"
          onClick={() => navigate("/help?r=new")}
          className="w-full rounded-xl bg-gray-900 py-3.5 text-[15px] font-bold text-white active:opacity-80"
        >
          Tạo yêu cầu để được hỗ trợ
        </button>
      </div>
    </div>
  );
      }
