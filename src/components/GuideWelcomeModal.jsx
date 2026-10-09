import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import { useI18n } from "../i18n/index.js";

const NEW_ACCOUNT_DAYS = 7;
const DELAY_MS = 800;
const KEY = (id) => `guide_welcome_seen_v1_${id}`;

const HIDE_PATHS = [
  "/", "/login", "/register", "/verify-email", "/forgot-password",
  "/banned", "/account-review", "/onboarding", "/task/callback",
];
const HIDE_PREFIX = ["/guide", "/admin"];

const TEXT = {
  vi: {
    title: "Chào mừng đến NXX315 STUDIO",
    body: "Hướng dẫn nhanh để kiếm xu, đổi quà và giữ tài khoản của bạn an toàn!",
    later: "Để sau",
    go: "Xem hướng dẫn",
  },
  en: {
    title: "Welcome to NXX315 STUDIO",
    body: "Quick guide to learn how to earn coins, redeem gifts, and keep your account safe!",
    later: "Later",
    go: "See Instructions",
  },
};

export default function GuideWelcomeModal() {
  const { lang } = useI18n();
  const { session } = useSession();
  const user = session?.user;
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const tx = TEXT[lang] || TEXT.vi;
  const hidden = HIDE_PATHS.includes(pathname) || HIDE_PREFIX.some((p) => pathname.startsWith(p));
  const forced = new URLSearchParams(search).get("showguide") === "1";

  useEffect(() => {
    if (!user?.id || hidden) { setOpen(false); return; }
    let seen = false;
    try { seen = localStorage.getItem(KEY(user.id)) === "1"; } catch {}
    const ageDays = (Date.now() - new Date(user.created_at).getTime()) / 86400000;
    const isNew = ageDays <= NEW_ACCOUNT_DAYS;
    if (!forced && (seen || !isNew)) return;
    const timer = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, [user?.id, user?.created_at, hidden, forced]);

  const markSeen = () => {
    try { if (user?.id) localStorage.setItem(KEY(user.id), "1"); } catch {}
  };
  const close = () => { markSeen(); setOpen(false); };
  const goGuide = () => { markSeen(); setOpen(false); navigate("/guide"); };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans"
      onClick={close}
    >
      <div
        className="w-full max-w-[340px] rounded-2xl bg-white px-6 pb-6 pt-8 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- ICON KHIÊN BẢO VỆ --- */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fe2c55"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>

        {/* --- TIÊU ĐỀ --- */}
        <h2 className="text-[20px] font-extrabold leading-tight tracking-tight text-[#161823]">
          {tx.title}
        </h2>

        {/* --- NỘI DUNG --- */}
        <p className="mt-3 text-[14px] leading-relaxed text-slate-600">
          {tx.body}
        </p>

        {/* --- NÚT BẤM --- */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={close}
            className="flex-1 rounded-full bg-slate-100 py-3 text-[14px] font-bold text-[#161823] transition active:scale-95"
          >
            {tx.later}
          </button>
          <button
            onClick={goGuide}
            className="flex-1 rounded-full bg-[#fe2c55] py-3 text-[14px] font-bold text-white shadow-md shadow-rose-500/30 transition active:scale-95"
          >
            {tx.go}
          </button>
        </div>
      </div>
    </div>
  );
    }
