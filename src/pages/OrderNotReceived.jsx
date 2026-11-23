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
  LifeBuoy,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import { getAccountRows } from "../lib/orderView.js";

const VALID_SOURCES = ["orders", "redemption_orders"];
const ID_RE = /^[0-9a-zA-Z-]{1,64}$/;

function Step({ n, icon: Icon, title, last, children }) {
  return (
    <li className="relative flex gap-3.5">
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-md shadow-sky-200">
          <Icon size={18} />
        </div>
        {!last && (
          <div className="mt-1.5 w-px flex-1 bg-gradient-to-b from-sky-200 to-gray-100" />
        )}
      </div>

      <div className={`min-w-0 flex-1 ${last ? "" : "pb-5"}`}>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_14px_rgba(15,23,42,0.06)]">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <h2 className="text-[16px] font-bold leading-snug text-gray-900">{title}</h2>
            <span className="shrink-0 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-600">
              Bước {String(n).padStart(2, "0")}
            </span>
          </div>
          <div className="text-[14px] leading-relaxed text-gray-500">{children}</div>
        </div>
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
  const proofs = Array.isArray(order?.proof_urls) ? order.proof_urls : [];

  const handleCopy = async (e) => {
    e.stopPropagation();
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
    <div className="min-h-screen bg-gradient-to-b from-sky-50/70 via-white to-white pb-44 text-gray-900">
      {/* HEADER */}
      <header className="sticky top-0 z-20 w-full bg-white/80 px-4 pb-2 pt-4 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full border border-gray-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:bg-gray-50"
          >
            <Sparkles size={20} className="text-sky-500" />
          </button>

          <div className="flex h-[44px] flex-1 items-center justify-between rounded-full border border-gray-100 bg-white px-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-full items-center gap-1.5 rounded-full px-3 text-[14px] font-medium text-gray-700 active:bg-gray-100"
            >
              <ArrowLeft size={18} />
              Quay lại
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex h-full items-center rounded-full px-3 text-[14px] font-medium text-gray-700 active:bg-gray-100"
            >
              Trang chủ
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="px-4 pb-5 pt-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-sky-500 to-cyan-400 p-5 text-white shadow-lg shadow-sky-200">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15" />
          <div className="absolute -bottom-10 right-10 h-24 w-24 rounded-full bg-white/10" />
          <div className="relative">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
              <LifeBuoy size={22} />
            </div>
            <h1 className="text-[22px] font-bold leading-tight">Chưa nhận được hàng?</h1>
            <p className="mt-1.5 text-[14px] leading-relaxed text-white/90">
              Làm theo 4 bước kiểm tra nhanh bên dưới. Nếu vẫn chưa có hàng, hãy tạo yêu cầu để
              được hỗ trợ.
            </p>
            {order?.order_code && (
              <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[12px] font-semibold backdrop-blur">
                Mã đơn: {order.order_code}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CÁC BƯỚC */}
      <ol className="px-4">
        <Step n={1} icon={ClipboardCheck} title="Đối soát thông tin nhận hàng">
          Đảm bảo bạn đã nhập chính xác UID, tên nhân vật hoặc thông tin tài khoản cần nạp. Nếu
          sai lệch, vui lòng kiểm tra lại lịch sử đơn hàng.
          {proofs.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {proofs.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt="Minh chứng"
                  className="aspect-square w-full rounded-xl border border-gray-100 bg-gray-50 object-cover shadow-sm"
                />
              ))}
            </div>
          )}
        </Step>

        <Step n={2} icon={UserCheck} title="Xác nhận tài khoản / UID nhận">
          Hệ thống đã ghi nhận thông tin nhận hàng của bạn. Hãy chắc chắn tài khoản này đang hoạt
          động bình thường.

          <div className="mt-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-3.5">
            {first ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-600">
                      {first.label}
                    </p>
                    <p className="mt-0.5 truncate text-[17px] font-bold text-gray-900">
                      {first.value}
                    </p>
                    {first.subValue && (
                      <p className="mt-0.5 truncate text-[12px] text-gray-500">
                        {first.subValue}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold transition-colors ${
                      copied
                        ? "bg-emerald-500 text-white"
                        : "bg-white text-sky-600 shadow-sm active:bg-sky-100"
                    }`}
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                    {copied ? "Đã chép" : "Sao chép"}
                  </button>
                </div>

                {rows.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setOpen((v) => !v)}
                      className="mt-3 flex w-full items-center justify-center gap-1 border-t border-sky-100 pt-2.5 text-[12px] font-semibold text-sky-600"
                    >
                      {open ? "Thu gọn" : "Xem thêm thông tin"}
                      <ChevronDown
                        size={15}
                        className={`transition-transform ${open ? "rotate-180" : ""}`}
                      />
                    </button>

                    {open && (
                      <div className="mt-2 space-y-2">
                        {rows.slice(1).map((r) => (
                          <div
                            key={r.label}
                            className="flex items-start justify-between gap-3 rounded-xl bg-white px-3 py-2"
                          >
                            <span className="text-[12px] text-gray-500">{r.label}</span>
                            <span className="break-all text-right text-[13px] font-semibold text-gray-800">
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
              <div className="animate-pulse space-y-2">
                <div className="h-3 w-24 rounded bg-sky-100" />
                <div className="h-5 w-40 rounded bg-sky-100" />
              </div>
            )}
          </div>
        </Step>

        <Step n={3} icon={Clock} title="Chờ hệ thống cập nhật">
          Đối với nạp game hoặc mua tài khoản, đôi khi hệ thống cần một khoảng thời gian để xử lý.
          Bạn hãy thử đăng nhập lại game hoặc tải lại trang để kiểm tra.
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[12px] font-semibold text-amber-600">
            <Clock size={13} />
            Thông thường 5 - 15 phút
          </div>
        </Step>

        <Step n={4} icon={Bell} title="Kiểm tra hộp thư / thông báo" last>
          Xem lại tin nhắn trong mục Thông báo của web hoặc email đăng ký, xem có thông báo hoàn
          tất đơn hàng hay yêu cầu bổ sung thông tin từ Admin không.
        </Step>
      </ol>

      {/* FOOTER CỐ ĐỊNH */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-100 bg-white/95 px-4 pb-6 pt-3.5 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-md">
        <p className="mb-2.5 text-center text-[13px] text-gray-500">
          Đã kiểm tra kỹ mà vẫn chưa nhận được hàng?
        </p>
        <button
          type="button"
          onClick={() => navigate("/help?r=new")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-sky-200 active:scale-[0.98] active:opacity-90"
        >
          <LifeBuoy size={18} />
          Tạo yêu cầu để được hỗ trợ
        </button>
      </div>
    </div>
  );
    }
