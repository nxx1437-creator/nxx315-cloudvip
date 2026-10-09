import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import { useI18n } from "../i18n/index.js";

// Ảnh bạn tự tải lên: để file trong thư mục public/ với đúng tên này
const IMAGE_SRC = "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/icons/guide-welcome.png";
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
    title: "An toàn của bạn rất quan trọng", // Đổi tiêu đề giống ảnh 2
    body: "Bạn sắp rời khỏi NXX315 và mở liên kết bên ngoài. Hãy đảm bảo đó là liên kết của một nguồn đáng tin cậy và tránh chia sẻ thông tin cá nhân.",
    later: "Hủy",
    go: "Tiếp tục",
  },
  en: {
    title: "Your safety is important",
    body: "You are about to leave NXX315 and open an external link. Make sure it's from a trusted source and avoid sharing personal information.",
    later: "Cancel",
    go: "Continue",
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
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center font-sans"
      onClick={close}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-white px-6 pb-8 pt-8 text-center shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- ICON / ẢNH --- */}
        {/* Nếu muốn giống ảnh 2 (chỉ có icon), bạn có thể thay bằng thẻ svg hoặc img icon nhỏ.
            Còn nếu vẫn muốn giữ ảnh minh họa, mình để nó ở đây với kích thước gọn hơn */}
        {imgOk && (
          <img
            src={IMAGE_SRC}
            alt=""
            className="mx-auto mb-5 max-h-32 w-auto object-contain"
            onError={() => setImgOk(false)}
          />
        )}

        {/* --- TIÊU ĐỀ --- */}
        {/* Font cực đậm (font-extrabold), chữ đen, xuống dòng tự nhiên */}
        <h2 className="text-[26px] font-extrabold leading-tight tracking-tight text-[#161823]">
          {tx.title}
        </h2>

        {/* --- NỘI DUNG --- */}
        <p className="mt-4 text-[15px] leading-relaxed text-slate-600 px-2">
          {tx.body}
        </p>

        {/* --- NÚT BẤM --- */}
        {/* Bố cục giống TikTok: nút Hủy bên trái (xám), nút Tiếp tục bên phải (đỏ/hồng) */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={close}
            className="flex-1 rounded-full bg-slate-100 py-3.5 font-bold text-[#161823] transition active:scale-95"
          >
            {tx.later}
          </button>
          <button
            onClick={goGuide}
            className="flex-1 rounded-full bg-[#fe2c55] py-3.5 font-bold text-white shadow-md shadow-rose-500/30 transition active:scale-95"
          >
            {tx.go}
          </button>
        </div>
      </div>
    </div>
  );
}
