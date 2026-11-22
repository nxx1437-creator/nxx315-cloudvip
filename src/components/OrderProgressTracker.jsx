import React, { useEffect, useState } from "react";
import { BadgeCheck, Check, Clock3, User, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import { canReply, formatDate, getReplyDeadline } from "../lib/orderView.js";

// Dán ID (uuid) của tài khoản NXX315 admin vào đây
const ADMIN_USER_ID = "";
const ADMIN_FALLBACK_NAME = "NXX315 Admin";

export const STEPS = ["Đã nhận đơn", "Kiểm tra", "Xử lý", "Hoàn tất"];

export function deriveStep(order) {
  if (Number.isInteger(order?.progress_step)) {
    return Math.min(Math.max(order.progress_step, 0), STEPS.length - 1);
  }
  const s = String(order?.status || "").toLowerCase();
  if (["delivered", "success", "completed", "done"].includes(s)) return 3;
  if (s === "processing") return 2;
  if (s === "paid") return 1;
  return 0;
}

const TONE = {
  blue: { fill: "bg-blue-500", dot: "bg-blue-500 text-white", ring: "ring-blue-200", text: "text-blue-600" },
  green: { fill: "bg-emerald-500", dot: "bg-emerald-500 text-white", ring: "ring-emerald-200", text: "text-emerald-600" },
  red: { fill: "bg-rose-400", dot: "bg-rose-500 text-white", ring: "ring-rose-200", text: "text-rose-600" },
};

let adminCache = null;

function useAdminProfile() {
  const [admin, setAdmin] = useState(adminCache);

  useEffect(() => {
    if (!ADMIN_USER_ID || adminCache) return;
    let alive = true;

    (async () => {
      try {
        const { data, error } = await supabase.rpc("get_public_profile", {
          p_user_id: ADMIN_USER_ID,
        });
        if (error || !data) return;
        adminCache = {
          name: data.name || ADMIN_FALLBACK_NAME,
          avatar: data.avatar_url || "",
        };
        if (alive) setAdmin(adminCache);
      } catch {}
    })();

    return () => {
      alive = false;
    };
  }, []);

  return admin || { name: ADMIN_FALLBACK_NAME, avatar: "" };
}

function AdminAvatar({ src, name }) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className="h-10 w-10 shrink-0 rounded-full border border-slate-100 object-cover"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white">
      {(name || "N").charAt(0).toUpperCase()}
    </div>
  );
}

function timeLeftText(deadline, now) {
  const left = Math.max(deadline - now, 0);
  const h = Math.floor(left / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  if (h > 0) return `Còn ${h} giờ ${m} phút để trả lời`;
  return `Còn ${Math.max(m, 1)} phút để trả lời`;
}

export default function OrderProgressTracker({ order, onReplied }) {
  const admin = useAdminProfile();

  const [now, setNow] = useState(() => Date.now());
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Cập nhật đồng hồ để nút "Trả lời" tự ẩn khi hết 23 giờ
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  if (!order) return null;

  const status = String(order.status || "").toLowerCase();
  const failed = ["rejected", "failed", "cancelled", "canceled"].includes(status);
  const step = deriveStep(order);
  const complete = !failed && step === STEPS.length - 1;
  const tone = TONE[failed ? "red" : complete ? "green" : "blue"];
  const proofs = Array.isArray(order.proof_urls) ? order.proof_urls : [];
  const note = order.progress_note;
  const hasMessage = Boolean(note) || proofs.length > 0;

  const replyable = hasMessage && canReply(order, now);
  const deadline = getReplyDeadline(order);

  const sendReply = async () => {
    const content = text.trim();
    if (!content || sending) return;

    setSending(true);
    setError("");

    const { data, error: err } = await supabase.rpc("reply_to_order", {
      p_source: order.__source,
      p_order_id: String(order.id),
      p_text: content,
    });

    setSending(false);

    if (err || data?.success === false) {
      setError(err?.message || data?.error || "Không gửi được, thử lại sau.");
      return;
    }

    onReplied?.({
      user_reply: content,
      user_reply_at: data?.user_reply_at || new Date().toISOString(),
    });
    setReplying(false);
    setText("");
  };

  return (
    <section className="mt-3 rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="mb-5 text-sm font-bold text-gray-900">Tiến độ đơn hàng</h2>

      <div className="relative">
        <div className="absolute left-[12.5%] right-[12.5%] top-[13px] h-1 rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${tone.fill}`}
            style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        <div className="relative grid grid-cols-4">
          {STEPS.map((label, i) => {
            const done = i < step || (i === step && complete);
            const current = i === step && !complete;

            return (
              <div key={label} className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-[30px] w-[30px] items-center justify-center rounded-full text-xs font-bold transition-all duration-500 ${
                    done
                      ? tone.dot
                      : current
                      ? `${tone.dot} ring-4 ${tone.ring}`
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {current && failed ? (
                    <X size={15} />
                  ) : current ? (
                    <Clock3 size={15} />
                  ) : done ? (
                    <Check size={15} />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-center text-[11px] font-semibold leading-tight ${
                    done || current ? tone.text : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {hasMessage && (
        <div className="mt-6 border-t border-gray-100 pt-5">
          <div className="flex gap-3">
            <AdminAvatar key={admin.avatar} src={admin.avatar} name={admin.name} />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="truncate text-sm font-bold text-gray-900">
                  {admin.name}
                </span>
                <BadgeCheck
                  size={17}
                  className="shrink-0 fill-blue-500 text-white"
                  aria-label="Tài khoản đã xác minh"
                />
              </div>

              {note && (
                <p className="mt-1.5 whitespace-pre-wrap break-words text-[13px] leading-6 text-gray-700">
                  {note}
                </p>
              )}

              {proofs.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {proofs.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="block aspect-square overflow-hidden rounded-xl border border-gray-100 bg-gray-50"
                    >
                      <img src={url} alt="Ảnh đính kèm" className="h-full w-full object-cover" />
                    </a>
                  ))}
                </div>
              )}

              <p className="mt-2 text-xs text-gray-400">
                {formatDate(order.progress_msg_at || order.progress_updated_at)}
              </p>

              {order.user_reply && (
                <div className="mt-4 flex gap-2.5 border-l-2 border-gray-100 pl-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                    <User size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-gray-900">Bạn</p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-[13px] leading-6 text-gray-700">
                      {order.user_reply}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {formatDate(order.user_reply_at)}
                    </p>
                  </div>
                </div>
              )}

              {replyable && !replying && (
                <div className="mt-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setReplying(true)}
                    className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-bold text-gray-700 active:bg-gray-50"
                  >
                    Trả lời
                  </button>
                  <span className="text-[11px] text-gray-400">
                    {timeLeftText(deadline, now)}
                  </span>
                </div>
              )}

              {replyable && replying && (
                <div className="mt-4 space-y-2">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={500}
                    rows={3}
                    autoFocus
                    placeholder="Nhập nội dung trả lời admin..."
                    className="w-full rounded-xl border border-gray-200 p-3 text-[13px] outline-none focus:border-gray-900"
                  />

                  {error && <p className="text-xs text-rose-500">{error}</p>}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={sendReply}
                      disabled={sending || !text.trim()}
                      className="rounded-full bg-gray-900 px-5 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                    >
                      {sending ? "Đang gửi..." : "Gửi"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReplying(false);
                        setText("");
                        setError("");
                      }}
                      className="rounded-full px-4 py-1.5 text-xs font-bold text-gray-500"
                    >
                      Hủy
                    </button>
                    <span className="ml-auto text-[11px] text-gray-400">
                      {text.length}/500
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
                                        }
