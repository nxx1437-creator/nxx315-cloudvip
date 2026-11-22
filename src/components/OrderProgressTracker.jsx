import React, { useEffect, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import { canReply, getReplyDeadline } from "../lib/orderView.js";

// Dán ID (uuid) của tài khoản NXX315 admin vào đây
const ADMIN_USER_ID = "46b2fbbc-dc4a-411d-b140-7c67e8680695";
const ADMIN_FALLBACK_NAME = "NXX315 Admin";

// Sau bao nhiêu phút kể từ lúc đặt hàng thì tự chuyển bước (đổi số ở đây)
export const AUTO_CHECK_MIN = 1; // -> Đang kiểm tra thanh toán
export const AUTO_PROCESS_MIN = 3; // -> Đang xử lý

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

// Bước hiển thị cho người dùng. Tự chạy tới "Đang xử lý" theo thời gian,
// còn "Hoàn tất" chỉ có khi admin duyệt (status = delivered...)
export function displayStep(order, now = Date.now()) {
  const real = deriveStep(order);
  const s = String(order?.status || "").toLowerCase();
  if (real >= 3) return real;
  if (["rejected", "failed", "cancelled", "canceled"].includes(s)) return real;

  const live =
    ["paid", "processing"].includes(s) ||
    (order?.__source === "redemption_orders" && s === "pending");
  if (!live) return real;

  const t = new Date(order.created_at).getTime();
  if (Number.isNaN(t)) return real;

  const mins = (now - t) / 60000;
  const auto = mins >= AUTO_PROCESS_MIN ? 2 : mins >= AUTO_CHECK_MIN ? 1 : 0;
  return Math.max(real, auto);
}

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
        className="h-8 w-8 shrink-0 rounded-full border border-gray-100 object-cover"
      />
    );
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white">
      {(name || "N").charAt(0).toUpperCase()}
    </div>
  );
}

function parts(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return {
    day: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
    time: d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };
}

function timeLeftText(deadline, now) {
  const left = Math.max(deadline - now, 0);
  const h = Math.floor(left / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  if (h > 0) return `Còn ${h} giờ ${m} phút để trả lời`;
  return `Còn ${Math.max(m, 1)} phút để trả lời`;
}

// Danh sách mốc, mới nhất nằm trên cùng (giống TikTok Shop)
function buildEvents(order, step, failed) {
  const base = new Date(order.created_at).getTime();
  const at = (min) =>
    Number.isNaN(base) ? null : new Date(base + min * 60000).toISOString();
  const updated = order.progress_updated_at || order.updated_at;
  const events = [];

  if (failed) {
    const s = String(order.status || "").toLowerCase();
    events.push({
      title: s === "rejected" ? "Đã từ chối" : "Giao dịch không thành công",
      desc: order.note || "Đơn hàng này không thể tiếp tục.",
      time: updated,
      tone: "red",
    });
  } else if (step >= 3) {
    events.push({
      title: "Hoàn thành",
      desc: "Đơn hàng của bạn đã được giao thành công.",
      time: order.delivered_at || updated,
    });
  }

  if (!failed && step >= 2) {
    events.push({
      title: step === 2 ? "Đang xử lý" : "Đã xử lý",
      desc:
        step === 2
          ? "Admin đang xử lý để giao đơn hàng cho bạn."
          : "Đơn hàng đã được xử lý xong.",
      time: at(AUTO_PROCESS_MIN),
    });
  }

  if (!failed && step >= 1) {
    events.push({
      title: step === 1 ? "Đang kiểm tra thanh toán" : "Đã kiểm tra thanh toán",
      desc:
        step === 1
          ? "Hệ thống đang kiểm tra giao dịch của bạn."
          : "Giao dịch của bạn đã được xác nhận.",
      time: at(AUTO_CHECK_MIN),
    });
  }

  events.push({
    title: "Đã đặt hàng",
    desc: "Đơn hàng của bạn đã được tạo.",
    time: order.created_at,
  });

  return events;
}

function AdminMessage({ order, admin, now, onReplied }) {
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const proofs = Array.isArray(order.proof_urls) ? order.proof_urls : [];
  const note = order.progress_note;
  if (!note && proofs.length === 0) return null;

  const replyable = canReply(order, now);
  const deadline = getReplyDeadline(order);
  const sent = parts(order.progress_msg_at || order.progress_updated_at);
  const replyAt = parts(order.user_reply_at);

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
    <div className="mt-3 rounded-xl bg-gray-50 p-3">
      <div className="flex items-center gap-2">
        <AdminAvatar key={admin.avatar} src={admin.avatar} name={admin.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate text-[13px] font-bold text-gray-900">{admin.name}</span>
            <BadgeCheck size={15} className="shrink-0 fill-blue-500 text-white" />
          </div>
          {sent && (
            <p className="text-[11px] text-gray-400">
              {sent.time} · {sent.day}
            </p>
          )}
        </div>
      </div>

      {note && (
        <p className="mt-2 whitespace-pre-wrap break-words text-[13px] leading-6 text-gray-700">
          {note}
        </p>
      )}

      {proofs.length > 0 && (
        <>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {proofs.map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="block aspect-square overflow-hidden rounded-lg bg-gray-100"
              >
                <img src={url} alt="Ảnh từ admin" className="h-full w-full object-cover" />
              </a>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-gray-400">Hình ảnh từ admin</p>
        </>
      )}

      {order.user_reply && (
        <div className="mt-3 border-l-2 border-gray-200 pl-3">
          <p className="text-[12px] font-bold text-gray-900">Bạn</p>
          <p className="mt-0.5 whitespace-pre-wrap break-words text-[13px] leading-6 text-gray-700">
            {order.user_reply}
          </p>
          {replyAt && (
            <p className="mt-0.5 text-[11px] text-gray-400">
              {replyAt.time} · {replyAt.day}
            </p>
          )}
        </div>
      )}

      {replyable && !replying && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setReplying(true)}
            className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs font-bold text-gray-800 active:bg-gray-100"
          >
            Trả lời
          </button>
          <span className="text-[11px] text-gray-400">{timeLeftText(deadline, now)}</span>
        </div>
      )}

      {replyable && replying && (
        <div className="mt-3 space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            rows={3}
            autoFocus
            placeholder="Nhập nội dung trả lời admin..."
            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-[13px] outline-none focus:border-gray-900"
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
            <span className="ml-auto text-[11px] text-gray-400">{text.length}/500</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderProgressTracker({ order, onReplied }) {
  const admin = useAdminProfile();
  const [now, setNow] = useState(() => Date.now());

  // Đồng hồ chạy để tự chuyển bước và để nút "Trả lời" tự biến mất sau 23 giờ
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  if (!order) return null;

  const status = String(order.status || "").toLowerCase();
  const failed = ["rejected", "failed", "cancelled", "canceled"].includes(status);
  const step = displayStep(order, now);
  const events = buildEvents(order, step, failed);

  return (
    <section className="mt-3 rounded-2xl border border-gray-200 bg-white px-4 pb-2 pt-5">
      <h2 className="mb-4 text-sm font-bold text-gray-900">Theo dõi đơn hàng</h2>

      {events.map((ev, i) => {
        const latest = i === 0;
        const last = i === events.length - 1;
        const t = parts(ev.time);
        const dot =
          ev.tone === "red" ? "bg-rose-500" : latest ? "bg-emerald-500" : "bg-gray-300";

        return (
          <div key={ev.title} className="flex gap-3">
            <div className="w-11 shrink-0 pt-0.5 text-right text-[11px] leading-4 text-gray-400">
              {t && (
                <>
                  <p>{t.day}</p>
                  <p>{t.time}</p>
                </>
              )}
            </div>

            <div className="flex w-4 shrink-0 flex-col items-center">
              <div className={`mt-1 h-3.5 w-3.5 rounded-full ${dot}`} />
              {!last && <div className="mt-1 w-px flex-1 bg-gray-200" />}
            </div>

            <div className="min-w-0 flex-1 pb-6">
              <p
                className={`text-[15px] font-bold ${
                  ev.tone === "red"
                    ? "text-rose-600"
                    : latest
                    ? "text-gray-900"
                    : "text-gray-400"
                }`}
              >
                {ev.title}
              </p>
              <p
                className={`mt-0.5 text-[13px] leading-5 ${
                  latest ? "text-gray-600" : "text-gray-400"
                }`}
              >
                {ev.desc}
              </p>

              {latest && (
                <AdminMessage order={order} admin={admin} now={now} onReplied={onReplied} />
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
    }
