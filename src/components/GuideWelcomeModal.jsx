import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import { useI18n } from "../i18n/index.js";

const IMAGE_SRC =
  "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/icons/guide-welcome.png";

const NEW_ACCOUNT_DAYS = 7; // chỉ hiện cho tài khoản tạo trong 7 ngày gần đây
const DELAY_MS = 800;
const KEY = (id) => `guide_welcome_seen_v1_${id}`;

// Không hiện ở các trang này
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
    start: "Bắt đầu",
    go: "Xem hướng dẫn",
  },
  en: {
    hello: "Welcome to",
    body: "Quick guide to learn how to earn coins, redeem gifts, and keep your account safe!",
    start: "Get started",
    go: "View guide",
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
  // Thêm ?showguide=1 vào địa chỉ để xem thử (chỉ dùng khi test)
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

    const timer = setTimeout(() => {
      setOpen(true);
      // Tính là đã xem ngay khi popup hiện ra
      try {
        localStorage.setItem(KEY(user.id), "1");
      } catch {
        /* bỏ qua */
      }
      // Xóa ?showguide=1 khỏi địa chỉ để quay lại không bị hiện lặp
      if (forced) navigate(pathname, { replace: true });
    }, DELAY_MS);

    return () => clearTimeout(timer);
  }, [user?.id, user?.created_at, hidden, forced, pathname, navigate]);

  // Bấm Esc để đóng
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  const goGuide = () => {
    setOpen(false);
    navigate("/guide");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={close}
    >
      <style>{`
        @keyframes welcomeIn {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .welcome-card { animation: welcomeIn 0.28s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .welcome-card { animation: none; }
        }
      `}</style>

      <div
        role="dialog"
        aria-modal="true"
        className="welcome-card max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-[#18191b] p-5 text-left shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="px-1 pb-4 pt-1 text-[26px] font-medium leading-tight text-white">
          {tx.hello}{" "}
          <span className="whitespace-nowrap">NXX315 Studio 🎁</span>
        </h2>

        {imgOk && (
          <div className="overflow-hidden rounded-2xl bg-black">
            <img
              src={IMAGE_SRC}
              alt=""
              className="aspect-[16/9] w-full object-cover"
              onError={() => setImgOk(false)}
            />
          </div>
        )}

        <p className="px-1 pb-2 pt-5 text-[16px] leading-relaxed text-zinc-300">
          {tx.body}
        </p>

        <div className="mt-6 flex items-center justify-between gap-3 px-1">
          <button
            onClick={goGuide}
            className="text-left text-[15px] font-semibold text-white transition hover:text-zinc-300"
          >
            {tx.go}
          </button>

          <button
            onClick={close}
            className="shrink-0 rounded-xl bg-zinc-800 px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-zinc-700 active:scale-95"
          >
            {tx.start}
          </button>
        </div>
      </div>
    </div>
  );
             }
