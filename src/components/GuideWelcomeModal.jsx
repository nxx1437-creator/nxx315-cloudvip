import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import { useI18n } from "../i18n/index.js";

const IMAGE_SRC =
  "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/icons/guide-welcome.png";

const NEW_ACCOUNT_DAYS = 7; 
const DELAY_MS = 800;
const KEY = (id) => `guide_welcome_seen_v1_${id}`;

const HIDE_PATHS = [
  "/",
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/banned",
  "/account-review",
  "/onboarding",
  "/task/callback",
];
const HIDE_PREFIX = ["/guide", "/admin"];

const TEXT = {
  vi: {
    hello: "Chào mừng bạn đến với",
    body: "Xem nhanh hướng dẫn để biết cách kiếm xu, đổi quà và giữ tài khoản luôn an toàn nhé!",
    later: "Để sau",
    go: "Xem hướng dẫn",
  },
  en: {
    hello: "Welcome to",
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
  const [imgOk, setImgOk] = useState(true);

  const tx = TEXT[lang] || TEXT.vi;
  const hidden =
    HIDE_PATHS.includes(pathname) ||
    HIDE_PREFIX.some((p) => pathname.startsWith(p));
  // Thêm ?showguide=1 vào địa chỉ để xem thử
  const forced = new URLSearchParams(search).get("showguide") === "1";

  useEffect(() => {
    if (!user?.id || hidden) {
      setOpen(false);
      return;
    }

    let seen = false;
    try {
      seen = localStorage.getItem(KEY(user.id)) === "1";
    } catch {
      /* bỏ qua */
    }

    const ageDays =
      (Date.now() - new Date(user.created_at).getTime()) / 86400000;
    const isNew = ageDays <= NEW_ACCOUNT_DAYS;

    if (!forced && (seen || !isNew)) return;

    const timer = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, [user?.id, user?.created_at, hidden, forced]);

  const markSeen = () => {
    try {
      if (user?.id) localStorage.setItem(KEY(user.id), "1");
    } catch {
      /* bỏ qua */
    }
  };

  const close = () => {
    markSeen();
    setOpen(false);
  };

  const goGuide = () => {
    markSeen();
    setOpen(false);
    navigate("/guide");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
      onClick={close}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-white px-6 pb-8 pt-6 text-center shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {imgOk && (
          <img
            src={IMAGE_SRC}
            alt=""
            className="mb-5 max-h-56 w-full rounded-2xl object-cover"
            onError={() => setImgOk(false)}
          />
        )}

        <h2 className="leading-tight">
          <span className="block text-base font-semibold text-slate-500">
            {tx.hello}
          </span>
          <span className="mt-1 block bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-3xl font-extrabold text-transparent">
            NXX315 STUDIO
          </span>
        </h2>

        <p
          className="mx-auto mt-3 max-w-xs text-[15px] leading-relaxed text-slate-600"
          style={{ textWrap: "balance" }}
        >
          {tx.body}
        </p>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            onClick={close}
            className="rounded-full bg-slate-100 py-3.5 font-bold text-slate-800 active:scale-95"
          >
            {tx.later}
          </button>
          <button
            onClick={goGuide}
            className="rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-3.5 font-bold text-white shadow-md shadow-sky-500/30 active:scale-95"
          >
            {tx.go}
          </button>
        </div>
      </div>
    </div>
  );
}
