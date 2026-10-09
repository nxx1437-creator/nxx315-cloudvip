import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import { useI18n } from "../i18n/index.js";

// Ảnh bạn tự tải lên: để file trong thư mục public/ với đúng tên này
const IMAGE_SRC = "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/icons/guide-welcome.png";
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
    titlePrefix: "Chào mừng bạn đến",
    titleBrand: "NXX315!",
    body: "Xem nhanh hướng dẫn để biết cách kiếm xu, đổi thưởng và giữ tài khoản an toàn.",
    later: "Để sau",
    go: "Xem hướng dẫn",
  },
  en: {
    titlePrefix: "Welcome to",
    titleBrand: "NXX315!",
    body: "Take a quick look at the guide to learn how to earn coins, redeem rewards and keep your account safe.",
    later: "Later",
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
  // Thêm ?showguide=1 vào địa chỉ để xem thử mà không cần tạo tài khoản mới
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
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center font-sans"
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
            // Sửa: object-contain để không cắt ảnh, bỏ max-h-56, thêm bg nhẹ
            className="mb-6 w-full rounded-2xl object-contain bg-slate-50/50"
            onError={() => setImgOk(false)}
          />
        )}

        {/* Sửa phần tiêu đề: Tách dòng, giảm độ đậm, thêm tracking */}
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          {tx.titlePrefix}{" "}
          <span className="block bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
            {tx.titleBrand}
          </span>
        </h2>

        <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
          {tx.body}
        </p>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            onClick={close}
            className="rounded-full bg-slate-100 py-3.5 font-bold text-slate-700 transition active:scale-95"
          >
            {tx.later}
          </button>
          <button
            onClick={goGuide}
            className="rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-3.5 font-bold text-white shadow-md shadow-sky-500/30 transition active:scale-95"
          >
            {tx.go}
          </button>
        </div>
      </div>
    </div>
  );
}
