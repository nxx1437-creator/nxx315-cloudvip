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
  Hash,
  ClipboardPaste,
  Sparkles,
} from "lucide-react";
import useSession from "../hooks/useSession.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";
import TopHeader from "../components/TopHeader.jsx";
import { useI18n } from "../i18n/index.js";

const HASHTAG = "#Nxx315Studio";

const TXT = {
  vi: {
    title: "Video giới thiệu",
    sub: "Làm video về web, được duyệt nhận code xu",
    badge: "Mỗi video được duyệt = 1 code xu",
    stSent: "Đã gửi",
    stPending: "Chờ duyệt",
    stApproved: "Đã duyệt",
    stepsTitle: "Cách làm",
    steps: ["Quay video giới thiệu web", "Gửi link video bên dưới", "Nhận code, nhập ở Ví"],
    tagTitle: "Hashtag bắt buộc",
    tagSub: "Gắn hashtag này vào mô tả hoặc tiêu đề video",
    rulesTitle: "Yêu cầu video",
    rules: [
      "Đăng công khai trên TikTok, YouTube hoặc Facebook",
      "Giới thiệu rõ website Nxx315 Studio (nxx315.top)",
      "Phải có hashtag của web trong mô tả hoặc tiêu đề",
      "Nội dung tự làm, không copy video của người khác",
    ],
    linkLabel: "Link video",
    linkPh: "Dán link video của bạn",
    paste: "Dán",
    confirm: "Video của tôi đã có hashtag của web",
    send: "Gửi video",
    historyTitle: "Lịch sử video",
    empty: "Bạn chưa gửi video nào",
    emptySub: "Gửi video đầu tiên để nhận code xu nhé!",
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
    sub: "Make a video about the site, get a coin code when approved",
    badge: "Each approved video = 1 coin code",
    stSent: "Sent",
    stPending: "Pending",
    stApproved: "Approved",
    stepsTitle: "How it works",
    steps: ["Record a video about the site", "Submit the link below", "Get a code, enter it in Wallet"],
    tagTitle: "Required hashtag",
    tagSub: "Add this hashtag to the video caption or title",
    rulesTitle: "Video requirements",
    rules: [
      "Public on TikTok, YouTube or Facebook",
      "Clearly introduce Nxx315 Studio (nxx315.top)",
      "The site hashtag must be in the caption or title",
      "Your own content, no copied videos",
    ],
    linkLabel: "Video link",
    linkPh: "Paste your video link",
    paste: "Paste",
    confirm: "My video includes the site hashtag",
    send: "Submit video",
    historyTitle: "Video history",
    empty: "No videos yet",
    emptySub: "Submit your first video to earn a coin code!",
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

const PLATFORMS = {
  tiktok: { name: "TikTok", cls: "bg-slate-900 text-white" },
  youtube: { name: "YouTube", cls: "bg-red-600 text-white" },
  facebook: { name: "Facebook", cls: "bg-blue-600 text-white" },
};

const detect = (u) => {
  const x = (u || "").toLowerCase();
  if (/tiktok\.com/.test(x)) return "tiktok";
  if (/youtube\.com|youtu\.be/.test(x)) return "youtube";
  if (/facebook\.com|fb\.watch/.test(x)) return "facebook";
  return null;
};

const STATUS = {
  pending: { bar: "border-l-amber-400", chip: "bg-amber-100 text-amber-700", Icon: Clock },
  approved: { bar: "border-l-emerald-500", chip: "bg-emerald-100 text-emerald-700", Icon: CheckCircle2 },
  rejected: { bar: "border-l-rose-400", chip: "bg-rose-100 text-rose-600", Icon: XCircle },
};

export default function VideoIntro() {
  const { lang } = useI18n();
  const s = TXT[lang] || TXT.vi;
  const { session } = useSession();
  const userId = session?.user?.id;

  const [url, setUrl] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);

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

  const platform = detect(url);
  const canSend = !sending && url.trim() && confirmed;

  const submit = async () => {
    if (!canSend) return;
    setSending(true);
    setMsg(null);
    const { data, error } = await supabase.rpc("submit_intro_video", { p_url: url });
    setSending(false);
    if (error || !data) {
      setMsg({ ok: false, text: s.error });
      return;
    }
    setMsg({ ok: !!data.ok, text: data.message || s.error });
    if (data.ok) {
      setUrl("");
      setConfirmed(false);
      load();
    }
  };

  const copy = async (key, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      /* bỏ qua */
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (t) setUrl(t.trim());
    } catch {
      /* bỏ qua */
    }
  };

  const countPending = items.filter((i) => i.status === "pending").length;
  const countApproved = items.filter((i) => i.status === "approved").length;

  return (
    <div className="min-h-screen bg-[#F5F7FB] pb-28 text-[#111827]">
      <TopHeader />

      <main className="mx-auto max-w-md space-y-4 px-4 py-5 md:max-w-3xl">
        {/* Hero */}
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#3478F6] via-[#0878C9] to-[#06B6D4] p-5 text-white shadow-lg shadow-[#3478F6]/20">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Video size={24} />
            </span>
            <div>
              <h1 className="text-xl font-bold leading-tight">{s.title}</h1>
              <p className="text-xs text-white/80">{s.sub}</p>
            </div>
          </div>

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur">
            <Sparkles size={13} /> {s.badge}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              [items.length, s.stSent],
              [countPending, s.stPending],
              [countApproved, s.stApproved],
            ].map(([n, label]) => (
              <div key={label} className="rounded-2xl bg-white/15 px-2 py-2.5 text-center backdrop-blur">
                <p className="text-xl font-bold leading-none">{n}</p>
                <p className="mt-1 text-[11px] text-white/80">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Các bước */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <h2 className="mb-3 text-sm font-bold text-slate-900">{s.stepsTitle}</h2>
          <div className="grid grid-cols-3 gap-2">
            {s.steps.map((st, i) => (
              <div key={st} className="flex flex-col items-center text-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#3478F6] to-[#0878C9] text-sm font-bold text-white">
                  {i + 1}
                </span>
                <p className="mt-2 text-[11px] leading-snug text-slate-600">{st}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hashtag */}
        <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <Hash size={16} />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">{s.tagTitle}</p>
              <p className="text-[11px] text-slate-500">{s.tagSub}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 rounded-xl border border-violet-200 bg-white px-3 py-2.5 text-center font-mono text-base font-bold text-violet-700">
              {HASHTAG}
            </code>
            <button
              onClick={() => copy("tag", HASHTAG)}
              className="flex shrink-0 items-center gap-1 rounded-xl bg-violet-600 px-3.5 py-2.5 text-xs font-semibold text-white"
            >
              {copiedKey === "tag" ? <Check size={14} /> : <Copy size={14} />}
              {copiedKey === "tag" ? s.copied : s.copy}
            </button>
          </div>
        </div>

        {/* Yêu cầu */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <h2 className="mb-2 text-sm font-bold text-slate-900">{s.rulesTitle}</h2>
          <ul className="space-y-1.5">
            {s.rules.map((r) => (
              <li key={r} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#4C8DF6] text-white">
                  <Check size={10} strokeWidth={3} />
                </span>
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Form gửi */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-900">{s.linkLabel}</label>
            {platform && (
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${PLATFORMS[platform].cls}`}>
                {PLATFORMS[platform].name}
              </span>
            )}
          </div>

          <div className="relative mt-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder={s.linkPh}
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              maxLength={300}
              className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] py-3 pl-3 pr-20 text-sm outline-none focus:border-[#3478F6]"
            />
            <button
              onClick={pasteFromClipboard}
              className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-lg bg-[#EAF2FE] px-2.5 py-1.5 text-xs font-semibold text-[#3478F6]"
            >
              <ClipboardPaste size={13} /> {s.paste}
            </button>
          </div>

          <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-xl bg-[#F5F7FB] p-3">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#3478F6]"
            />
            <span className="text-xs leading-snug text-slate-700">
              {s.confirm} <b className="text-violet-700">{HASHTAG}</b>
            </span>
          </label>

          {msg && (
            <p
              className={`mt-3 rounded-xl px-3 py-2 text-xs font-semibold ${
                msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"
              }`}
            >
              {msg.text}
            </p>
          )}

          <button
            onClick={submit}
            disabled={!canSend}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3478F6] to-[#0878C9] py-3.5 text-sm font-bold text-white shadow-md shadow-[#3478F6]/25 disabled:opacity-50"
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
            <div className="py-6 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Video size={22} />
              </span>
              <p className="mt-2 text-sm font-semibold text-slate-600">{s.empty}</p>
              <p className="text-xs text-slate-400">{s.emptySub}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((it) => {
                const st = STATUS[it.status] || STATUS.pending;
                const pf = PLATFORMS[it.platform];
                return (
                  <div
                    key={it.id}
                    className={`rounded-xl border border-l-4 border-slate-100 bg-slate-50/60 p-3 ${st.bar}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${pf ? pf.cls : "bg-slate-200"}`}>
                        {pf ? pf.name : it.platform}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${st.chip}`}>
                        <st.Icon size={11} /> {s[it.status] || it.status}
                      </span>
                    </div>

                    <a
                      href={it.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex items-center gap-1 text-xs text-[#3478F6]"
                    >
                      <ExternalLink size={12} className="shrink-0" />
                      <span className="truncate">{it.url}</span>
                    </a>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {new Date(it.created_at).toLocaleString("vi-VN")}
                    </p>

                    {it.status === "approved" && it.gift_code && (
                      <div className="mt-3 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 font-semibold text-emerald-700">
                            <Gift size={14} /> {s.code}
                          </span>
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-700">
                            +{Number(it.coins || 0).toLocaleString("vi-VN")} {s.xu}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <code className="min-w-0 flex-1 truncate rounded-lg bg-white px-3 py-2.5 text-center font-mono text-sm font-bold tracking-wider text-slate-800">
                            {it.gift_code}
                          </code>
                          <button
                            onClick={() => copy(it.id, it.gift_code)}
                            className="flex shrink-0 items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white"
                          >
                            {copiedKey === it.id ? <Check size={13} /> : <Copy size={13} />}
                            {copiedKey === it.id ? s.copied : s.copy}
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
                );
              })}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
