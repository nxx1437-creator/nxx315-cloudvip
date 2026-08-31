import React, { useState } from "react";
import { ShieldAlert, ArrowLeft, Send, CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";

export default function AccountReview() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile } = useProfile();

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError("Vui lòng nhập nội dung giải trình.");
      return;
    }

    setSubmitting(true);
    setError("");

    const { error: insertError } = await supabase
      .from("support_tickets")
      .insert({
        user_id: session?.user?.id,
        user_name: profile?.username || "Không tên",
        user_email: session?.user?.email,
        subject: "Khiếu nại: Nghi ngờ đa tài khoản",
        message: message.trim(),
        status: "pending",
      });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message || "Có lỗi xảy ra, thử lại sau.");
      return;
    }

    try {
      await supabase.functions.invoke("telegram-webhook", {
        body: {
          message: {
            text: `⚠️ Khiếu nại đa tài khoản mới!\n👤 User: ${profile?.username || session?.user?.email}\n📝 Nội dung: ${message.trim()}`,
            chat: { id: 6152450878 },
          },
        },
      });
    } catch (teleError) {
      console.error("Telegram error:", teleError);
    }

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] px-4 py-6">
      <div className="mx-auto max-w-md">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-sky-600"
        >
          <ArrowLeft size={14} />
          Quay lại
        </button>

        <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
              <ShieldAlert size={19} className="text-amber-500" />
            </div>

            <h1 className="text-lg font-black text-slate-950">
              Kiểm tra tài khoản
            </h1>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Trạng thái hiện tại
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {profile?.multi_account_flag
                ? "⚠️ Đang bị gắn cờ nghi đa tài khoản"
                : "✅ Không có cảnh báo nào"}
            </p>
          </div>

          {profile?.multi_account_flag && !submitted && (
            <>
              <p className="mt-5 text-sm leading-6 text-slate-600">
                Hệ thống phát hiện tài khoản này có dấu hiệu trùng thiết
                bị/mạng với tài khoản khác. Nếu bạn cho rằng đây là nhầm
                lẫn (dùng chung wifi gia đình, mượn máy người khác...),
                hãy giải trình bên dưới để đội ngũ xem xét lại.
              </p>

              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                placeholder="Giải trình lý do (vd: dùng chung mạng nhà với anh/chị/em...)"
                className="mt-4 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />

              {error && (
                <p className="mt-2 text-xs font-bold text-rose-500">
                  {error}
                </p>
              )}

              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-sky-500/25 transition disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Send size={15} />
                    Gửi giải trình
                  </>
                )}
              </button>
            </>
          )}

          {submitted && (
            <div className="mt-5 flex items-center gap-2.5 rounded-2xl bg-emerald-50 p-4">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
              <p className="text-sm font-semibold text-emerald-700">
                Đã gửi giải trình. Đội ngũ sẽ xem xét và phản hồi sớm nhất.
              </p>
            </div>
          )}

          {!profile?.multi_account_flag && (
            <p className="mt-5 text-sm leading-6 text-slate-500">
              Tài khoản của bạn hiện không có cảnh báo nào. Nếu gặp vấn
              đề khác, vui lòng liên hệ qua trang Hỗ trợ.
            </p>
          )}
        </div>
      </div>
    </div>
  );
    }
