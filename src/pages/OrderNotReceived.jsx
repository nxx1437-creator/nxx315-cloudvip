import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, ChevronDown, Copy } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import { getAccountRows } from "../lib/orderView.js";

const VALID_SOURCES = ["orders", "redemption_orders"];
const ID_RE = /^[0-9a-zA-Z-]{1,64}$/;

const FONT = '"Suisse Intl", "Inter", "Be Vietnam Pro", Arial, sans-serif';

function Step({ n, title, children }) {
  return (
    <li className="grid grid-cols-[30px_1fr] border-t border-[#e3e3e2] py-6 pl-3 pr-1">
      <span className="pt-[7px] text-[11px] text-[#7c7c7c]">
        {String(n).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <h2 className="text-[21px] font-normal leading-[1.22] tracking-[-0.03em] text-[#1a1a1a]">
          {title}
        </h2>
        <div className="mt-2.5 text-[14px] leading-[1.5] text-[#7c7c7c]">{children}</div>
      </div>
    </li>
  );
}

export default function OrderNotReceived() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const source = searchParams.get("source");

  const [order, setOrder] = useState(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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
  const extra = rows.slice(1);
  const proofs = Array.isArray(order?.proof_urls) ? order.proof_urls : [];

  const handleCopy = async () => {
    if (!first?.value) return;
    try {
      await navigator.clipboard.writeText(String(first.value));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error("Copy error:", err);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#f8f8f7] pb-44 text-[#1a1a1a]"
      style={{ fontFamily: FONT }}
    >
      {/* NAV */}
      <header className="sticky top-0 z-20 bg-[#f8f8f7]/80 backdrop-blur-[8px]">
        <div className="flex h-14 items-center justify-between px-5 text-[13px] text-[#515151]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 active:opacity-60"
          >
            <ArrowLeft size={15} strokeWidth={1.6} />
            Quay lại
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="active:opacity-60"
          >
            Trang chủ
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="px-5 pb-10 pt-8">
        <h1 className="text-[36px] font-normal leading-[1.15] tracking-[-0.04em]">
          Chưa nhận được hàng?
        </h1>
        <p className="mt-4 max-w-[330px] text-[16px] leading-[1.35] tracking-[-0.02em] text-[#7c7c7c]">
          <span className="text-[#1a1a1a]">Làm theo 4 bước kiểm tra nhanh. </span>
          Nếu vẫn chưa có hàng, hãy tạo yêu cầu để được hỗ trợ.
        </p>

        {order?.order_code && (
          <div className="mt-7 border-l border-[#e3e3e2] pl-3">
            <p className="text-[11px] text-[#7c7c7c]">Mã đơn hàng</p>
            <p className="mt-1 text-[15px] font-[450] tracking-[-0.01em]">
              {order.order_code}
            </p>
          </div>
        )}
      </section>

      {/* CÁC BƯỚC */}
      <ol className="mx-5 border-b border-l border-[#e3e3e2]">
        <Step n={1} title="Đối soát thông tin nhận hàng">
          Đảm bảo bạn đã nhập chính xác UID, tên nhân vật hoặc thông tin tài khoản cần nạp. Nếu
          sai lệch, vui lòng kiểm tra lại lịch sử đơn hàng.
          {proofs.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {proofs.map((url, i) => (
                <div key={url}>
                  <img
                    src={url}
                    alt="Minh chứng"
                    className="aspect-square w-full rounded-[4px] border border-[#e3e3e2] bg-[#f0f0ee] object-cover"
                  />
                  <p className="mt-1.5 text-[10px] text-[#7c7c7c]">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Step>

        <Step n={2} title="Xác nhận tài khoản / UID nhận">
          Hệ thống đã ghi nhận thông tin nhận hàng của bạn. Hãy chắc chắn tài khoản này đang hoạt
          động bình thường.

          <div className="mt-5 border-l border-[#e3e3e2] pl-3">
            {first ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-[#7c7c7c]">{first.label}</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex h-7 items-center gap-1.5 rounded-[4px] bg-[#f0f0ee] px-2.5 text-[12px] font-[450] text-[#1a1a1a] active:scale-[0.97]"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? "Đã chép" : "Sao chép"}
                  </button>
                </div>

                <p className="mt-3 break-all text-[28px] font-normal leading-[1.15] tracking-[-0.03em] text-[#1a1a1a]">
                  {first.value}
                </p>
                {first.subValue && (
                  <p className="mt-1.5 text-[12px] text-[#7c7c7c]">{first.subValue}</p>
                )}

                {extra.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setOpen((v) => !v)}
                      className="mt-4 flex items-center gap-1 text-[12px] font-[450] text-[#1a1a1a] active:opacity-60"
                    >
                      {open ? "Thu gọn" : "Xem thêm thông tin"}
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${open ? "rotate-180" : ""}`}
                      />
                    </button>

                    {open && (
                      <div className="mt-3 border-t border-[#e3e3e2]">
                        {extra.map((r) => (
                          <div
                            key={r.label}
                            className="flex items-start justify-between gap-4 border-b border-[#e3e3e2] py-2.5"
                          >
                            <span className="text-[12px] text-[#7c7c7c]">{r.label}</span>
                            <span className="break-all text-right text-[13px] text-[#1a1a1a]">
                              {r.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="animate-pulse space-y-2.5">
                <div className="h-2.5 w-20 rounded-[2px] bg-[#e3e3e2]" />
                <div className="h-7 w-48 rounded-[2px] bg-[#e3e3e2]" />
              </div>
            )}
          </div>
        </Step>

        <Step n={3} title="Chờ hệ thống cập nhật">
          Đối với nạp game hoặc mua tài khoản, đôi khi hệ thống cần một khoảng thời gian để xử
          lý. Bạn hãy thử đăng nhập lại game hoặc tải lại trang để kiểm tra.
          <div className="mt-5 border-l border-[#e3e3e2] pl-3">
            <p className="text-[11px] text-[#7c7c7c]">Thời gian xử lý thông thường</p>
            <p className="mt-2 text-[32px] font-normal leading-[1.1] tracking-[-0.03em] text-[#1a1a1a]">
              5 – 15
              <span className="ml-1.5 text-[14px] tracking-normal text-[#7c7c7c]">phút</span>
            </p>
          </div>
        </Step>

        <Step n={4} title="Kiểm tra hộp thư / thông báo">
          Xem lại tin nhắn trong mục Thông báo của web hoặc email đăng ký, xem có thông báo hoàn
          tất đơn hàng hay yêu cầu bổ sung thông tin từ Admin không.
        </Step>
      </ol>

      {/* FOOTER CỐ ĐỊNH */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#e3e3e2] bg-[#f8f8f7]/90 px-5 pb-6 pt-4 backdrop-blur-[8px]">
        <p className="mb-3 text-[12px] text-[#7c7c7c]">
          Đã kiểm tra kỹ mà vẫn chưa nhận được hàng?
        </p>
        <div className="flex gap-[5.4px]">
          <button
            type="button"
            onClick={() => navigate("/help?r=new")}
            className="flex h-[42px] flex-1 items-center justify-center rounded-[4px] bg-[#1a1a1a] px-3 text-[13px] font-[450] text-[#f8f8f7] hover:bg-[#353535] active:scale-[0.97]"
          >
            Tạo yêu cầu hỗ trợ
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-[42px] items-center justify-center rounded-[4px] bg-[#f0f0ee] px-4 text-[13px] font-[450] text-[#1a1a1a] hover:bg-[#deded9] active:scale-[0.97]"
          >
            Xem đơn
          </button>
        </div>
      </div>
    </div>
  );
                    }
