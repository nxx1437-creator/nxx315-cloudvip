import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronDown,
  ClipboardCheck,
  Clock,
  Copy,
  UserCheck,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import { getAccountRows } from "../lib/orderView.js";

const VALID_SOURCES = ["orders", "redemption_orders"];
const ID_RE = /^[0-9a-zA-Z-]{1,64}$/;

const FONT = '"Suisse Intl", "Inter", "Be Vietnam Pro", Arial, sans-serif';

function Step({ n, icon: Icon, title, children }) {
  return (
    <li className="rounded-[22px] border border-black/[0.06] bg-white/80 p-5 shadow-[0_6px_24px_rgba(26,26,26,0.05)] backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-50 to-sky-100 text-cyan-700">
          <Icon size={18} strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-[#7c7c7c]">
            Bước {String(n).padStart(2, "0")}
          </p>
          <h2 className="text-[17px] font-medium leading-tight tracking-[-0.02em] text-[#1a1a1a]">
            {title}
          </h2>
        </div>
      </div>
      <div className="mt-3 text-[14px] leading-[1.55] text-[#6b6b6b]">{children}</div>
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
      className="relative min-h-screen overflow-hidden bg-[#f8f8f7] pb-44 text-[#1a1a1a]"
      style={{ fontFamily: FONT }}
    >
      {/* ÁNH SÁNG KHUẾCH TÁN */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#00a2c7] opacity-25 blur-[80px]" />
      <div className="pointer-events-none absolute -left-32 top-40 h-64 w-64 rounded-full bg-[#0052ff] opacity-[0.12] blur-[80px]" />

      <div className="relative">
        {/* NAV */}
        <header className="sticky top-0 z-20 bg-[#f8f8f7]/70 backdrop-blur-[10px]">
          <div className="flex h-14 items-center justify-between px-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-9 items-center gap-1.5 rounded-full border border-black/[0.06] bg-white/80 px-3.5 text-[13px] font-medium text-[#515151] active:scale-[0.97]"
            >
              <ArrowLeft size={15} strokeWidth={1.8} />
              Quay lại
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex h-9 items-center rounded-full border border-black/[0.06] bg-white/80 px-3.5 text-[13px] font-medium text-[#515151] active:scale-[0.97]"
            >
              Trang chủ
            </button>
          </div>
        </header>

        {/* HERO */}
        <section className="px-5 pb-7 pt-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white/80 px-3 py-1 text-[11px] font-medium text-[#515151]">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
            Hỗ trợ đơn hàng
          </div>

          <h1 className="mt-4 text-[34px] font-normal leading-[1.12] tracking-[-0.04em]">
            Chưa nhận được hàng?
          </h1>
          <p className="mt-3 max-w-[320px] text-[15px] leading-[1.45] text-[#7c7c7c]">
            <span className="text-[#1a1a1a]">Đừng lo, thử 4 bước kiểm tra nhanh này nhé. </span>
            Nếu vẫn chưa có hàng, bên mình sẽ hỗ trợ ngay.
          </p>

          {order?.order_code && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] py-1.5 pl-3.5 pr-4 text-[#f8f8f7] shadow-[0_6px_16px_rgba(26,26,26,0.18)]">
              <span className="text-[11px] text-[#f8f8f7]/60">Mã đơn</span>
              <span className="text-[13px] font-medium tracking-[0.01em]">
                {order.order_code}
              </span>
            </div>
          )}
        </section>

        {/* CÁC BƯỚC */}
        <ol className="space-y-3 px-4">
          <Step n={1} icon={ClipboardCheck} title="Đối soát thông tin nhận hàng">
            Đảm bảo bạn đã nhập chính xác UID, tên nhân vật hoặc thông tin tài khoản cần nạp.
            Nếu sai lệch, vui lòng kiểm tra lại lịch sử đơn hàng.
            {proofs.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {proofs.map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt="Minh chứng"
                    className="aspect-square w-full rounded-2xl border border-black/[0.06] bg-[#f0f0ee] object-cover"
                  />
                ))}
              </div>
            )}
          </Step>

          <Step n={2} icon={UserCheck} title="Xác nhận tài khoản / UID nhận">
            Hệ thống đã ghi nhận thông tin nhận hàng của bạn. Hãy chắc chắn tài khoản này đang
            hoạt động bình thường.

            <div className="mt-4 rounded-2xl border border-black/[0.06] bg-[#f8f8f7] p-4">
              {first ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] font-medium text-[#7c7c7c]">
                      {first.label}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className={`flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium transition-colors active:scale-[0.97] ${
                        copied
                          ? "bg-emerald-500 text-white"
                          : "bg-white text-[#1a1a1a] shadow-sm ring-1 ring-black/[0.06]"
                      }`}
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      {copied ? "Đã chép" : "Sao chép"}
                    </button>
                  </div>

                  <p className="mt-2 break-all text-[26px] font-normal leading-[1.15] tracking-[-0.03em] text-[#1a1a1a]">
                    {first.value}
                  </p>
                  {first.subValue && (
                    <p className="mt-1 text-[12px] text-[#7c7c7c]">{first.subValue}</p>
                  )}

                  {extra.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        className="mt-3.5 flex items-center gap-1 text-[12px] font-medium text-cyan-700 active:opacity-60"
                      >
                        {open ? "Thu gọn" : "Xem thêm thông tin"}
                        <ChevronDown
                          size={14}
                          className={`transition-transform ${open ? "rotate-180" : ""}`}
                        />
                      </button>

                      {open && (
                        <div className="mt-2.5 space-y-2">
                          {extra.map((r) => (
                            <div
                              key={r.label}
                              className="flex items-start justify-between gap-4 rounded-xl bg-white px-3 py-2.5 ring-1 ring-black/[0.05]"
                            >
                              <span className="text-[12px] text-[#7c7c7c]">{r.label}</span>
                              <span className="break-all text-right text-[13px] font-medium text-[#1a1a1a]">
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
                  <div className="h-2.5 w-20 rounded-full bg-[#e3e3e2]" />
                  <div className="h-7 w-44 rounded-lg bg-[#e3e3e2]" />
                </div>
              )}
            </div>
          </Step>

          <Step n={3} icon={Clock} title="Chờ hệ thống cập nhật">
            Đối với nạp game hoặc mua tài khoản, đôi khi hệ thống cần một khoảng thời gian để xử
            lý. Bạn hãy thử đăng nhập lại game hoặc tải lại trang để kiểm tra.
            <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1.5 text-[12px] font-medium text-cyan-700">
              <Clock size={13} />
              Thường mất 5 – 15 phút
            </div>
          </Step>

          <Step n={4} icon={Bell} title="Kiểm tra hộp thư / thông báo">
            Xem lại tin nhắn trong mục Thông báo của web hoặc email đăng ký, xem có thông báo
            hoàn tất đơn hàng hay yêu cầu bổ sung thông tin từ Admin không.
          </Step>
        </ol>
      </div>

      {/* FOOTER CỐ ĐỊNH */}
      <div className="fixed inset-x-0 bottom-0 z-20 rounded-t-[26px] border-t border-black/[0.06] bg-white/90 px-4 pb-6 pt-4 shadow-[0_-10px_30px_rgba(26,26,26,0.07)] backdrop-blur-[10px]">
        <p className="mb-3 text-center text-[13px] text-[#7c7c7c]">
          Đã kiểm tra kỹ mà vẫn chưa nhận được hàng?
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate("/help?r=new")}
            className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-[#1a1a1a] px-4 text-[14px] font-medium text-[#f8f8f7] shadow-[0_8px_20px_rgba(26,26,26,0.2)] active:scale-[0.97]"
          >
            Tạo yêu cầu hỗ trợ
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-12 items-center justify-center rounded-2xl bg-[#f0f0ee] px-5 text-[14px] font-medium text-[#1a1a1a] active:scale-[0.97]"
          >
            Xem đơn
          </button>
        </div>
      </div>
    </div>
  );
        }
