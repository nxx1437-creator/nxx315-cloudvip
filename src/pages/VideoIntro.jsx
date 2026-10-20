import React, { useEffect, useState, useCallback } from "react";
import {
  Video,
  Send,
  Copy,
  Check,
  Clock,
  XCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Gift,
  Info,
} from "lucide-react";
import useSession from "../hooks/useSession.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";
import TopHeader from "../components/TopHeader.jsx";
import { useI18n } from "../i18n/index.js";

const TXT = {
  vi: {
    title: "Video giới thiệu",
    sub: "Làm video giới thiệu web, được duyệt nhận code xu",
    rulesTitle: "Yêu cầu video",
    rules: [
      "Video đăng công khai trên TikTok, YouTube hoặc Facebook",
      "Giới thiệu rõ website Nxx315 Studio (nxx315.top)",
      "Nội dung do bạn tự làm, không copy video của người khác",
      "Mỗi video được duyệt nhận 1 code xu do admin gửi",
    ],
    linkLabel: "Link video",
    linkPh: "Dán link video của bạn vào đây",
    send: "Gửi video",
    historyTitle: "Lịch sử video",
    empty: "Bạn chưa gửi video nào.",
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Từ chối",
    code: "Code nhận xu",
    copy: "Chép",
    copied: "Đã chép",
    howTo: "Vào Ví → Nhập Gift Code để nhận xu.",
    reason: "Lý do",
    error: "Có lỗi xảy ra, vui lòng thử lại.",
    xu: "xu",
  },
  en: {
    title: "Intro videos",
    sub: "Make a video about this site and get a coin code when approved",
    rulesTitle: "Video requirements",
    rules: [
      "Public video on TikTok, YouTube or Facebook",
      "Clearly introduce Nxx315 Studio (nxx315.top)",
      "Your own original content, no copied videos",
      "Each approved video gets a coin code from the admin",
    ],
    linkLabel: "Video link",
    linkPh: "Paste your video link here",
    send: "Submit video",
    historyTitle: "Video history",
    empty: "You have not submitted any video yet.",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    code: "Coin code",
    copy: "Copy",
    copied: "Copied",
    howTo: "Go to Wallet → Enter Gift Code to redeem.",
    reason: "Reason",
    error: "Something went wrong, please try again.",
    xu: "coins",
  },
};

const PLATFORM = { tiktok: "TikTok", youtube: "YouTube", facebook: "Facebook" };

function StatusBadge({ status, s }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
        <CheckCircle2 size={11} /> {s.approved}
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-600">
        <XCircle size={11} /> {s.rejected}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
      <Clock size={11} /> {s.pending}
    </span>
  );
}

export default function VideoIntro() {
  const { lang } = useI18n();
  const s = TXT[lang] || TXT.vi;
  const { session } = useSession();
  const userId = session?.user?.id;

  const [url, setUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const load = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("intro_video_submissions")
      .select("id, url, platform, status, admin_note, gift_code, coins, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    setItems(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    if (sending || !url.trim()) return;
    setSending(true);
    setMsg(null);
    const { data, error } = await supabase.rpc("submit_intro_video", {
      p_url: url,
    });
    setSending(false);
    if (error || !data) {
      setMsg({ ok: false, text: s.error });
      return;
    }
    setMsg({ ok: !!data.ok, text: data.message || s.error });
    if (data.ok) {
      setUrl("");
      load();
    }
  };

  const copy = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      /* bỏ qua */
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] pb-24 text-[#111827]">
      <TopHeader />

      <main className="mx-auto max-w-md space-y-4 px-4 py-5 md:max-w-3xl">
        {/* Đầu trang */}
        <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-100 via-sky-50 to-white p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#3478F6] to-[#0878C9] text-white">
              <Video size={21} />
            </span>
            <div>
              <h1 className="text-lg font-bold leading-tight text-slate-900">{s.title}</h1>
              <p className="text-xs text-slate-500">{s.sub}</p>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-[#D6E0F5] bg-white/70 p-3">
            <div className="mb-1.5 flex items-center gap-2 text-sm font-bold text-slate-800">
              <Info size={15} className="text-[#3478F6]" /> {s.rulesTitle}
            </div>
            <ul className="space-y-1">
              {s.rules.map((r) => (
                <li key={r} className="flex items-start gap-2 text-xs text-slate-600">
                  <Check size={13} className="mt-0.5 shrink-0 text-[#3478F6]" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Form gửi video */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <label className="text-sm font-semibold text-slate-800">{s.linkLabel}</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={s.linkPh}
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            maxLength={300}
            className="mt-1.5 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-3 text-sm outline-none focus:border-[#3478F6]"
          />

          {msg && (
            <p
              className={`mt-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"
              }`}
            >
              {msg.text}
            </p>
          )}

          <button
            onClick={submit}
            disabled={sending || !url.trim()}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3478F6] to-[#0878C9] py-3 text-sm font-bold text-white shadow-md shadow-[#3478F6]/25 disabled:opacity-50"
          >
            {sending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Send size={16} /> {s.send}
              </>
            )}
          </button>
        </div>

        {/* Lịch sử */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <h2 className="mb-3 text-sm font-bold text-slate-900">{s.historyTitle}</h2>

          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 size={20} className="animate-spin text-slate-400" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">{s.empty}</p>
          ) : (
            <div className="space-y-3">
              {items.map((it) => (
                <div key={it.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-800">
                      {PLATFORM[it.platform] || it.platform}
                    </span>
                    <StatusBadge status={it.status} s={s} />
                  </div>

                  <a
                    href={it.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex items-center gap-1 text-xs text-[#3478F6]"
                  >
                    <ExternalLink size={12} className="shrink-0" />
                    <span className="truncate">{it.url}</span>
                  </a>

                  <p className="mt-1 text-[11px] text-slate-400">
                    {new Date(it.created_at).toLocaleString("vi-VN")}
                  </p>

                  {it.status === "approved" && it.gift_code && (
                    <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 font-semibold text-emerald-700">
                          <Gift size={13} /> {s.code}
                        </span>
                        <span className="font-bold text-amber-600">
                          +{Number(it.coins || 0).toLocaleString("vi-VN")} {s.xu}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <code className="min-w-0 flex-1 truncate rounded-lg border border-emerald-200 bg-white px-3 py-2 text-center font-mono text-sm font-bold tracking-wider text-slate-800">
                          {it.gift_code}
                        </code>
                        <button
                          onClick={() => copy(it.id, it.gift_code)}
                          className="flex shrink-0 items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                        >
                          {copiedId === it.id ? (
                            <>
                              <Check size={13} /> {s.copied}
                            </>
                          ) : (
                            <>
                              <Copy size={13} /> {s.copy}
                            </>
                          )}
                        </button>
                      </div>
                      <p className="mt-2 text-[11px] text-emerald-700">{s.howTo}</p>
                    </div>
                  )}

                  {it.status === "rejected" && it.admin_note && (
                    <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">
                      {s.reason}: {it.admin_note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
    }
