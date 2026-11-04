import React, { useEffect, useMemo } from "react";
import { UserCheck, Coins, Ban, Wallet, RotateCcw, MessageCircle, Users, Mail } from "lucide-react";
import LegalPage from "../components/LegalKit.jsx";
import { SITE } from "../lib/siteInfo.js";
import { useI18n } from "../i18n/index.js";
import { buildAbout } from "../lib/aboutCopy.js";

// ẢNH / VIDEO MINH HỌA: ảnh thì tải lên Supabase (bucket game_logos) rồi ghi TÊN FILE;
// video thì để trong thư mục public của repo rồi ghi "/ten-video.mp4". Để "" nếu chưa có.
const IMAGES = { hero: "", ai: "", "nguon-xu": "", "khong-lam": "", "rut-xu": "", "hoan-tien": "", "khieu-nai": "", "gioi-thieu": "", "lien-he": "" };
// VIDEO GIỚI THIỆU (hiện ở cuối trang): đặt about-video.mp4 và about-video-poster.jpg trong thư mục public của repo.
// Để VIDEO = "" nếu muốn ẩn.
const VIDEO = "/about-video.mp4";
const POSTER = "/about-video-poster.jpg";
const ICONS = {
  ai: UserCheck, "nguon-xu": Coins, "khong-lam": Ban, "rut-xu": Wallet, "hoan-tien": RotateCcw,
  "khieu-nai": MessageCircle, "gioi-thieu": Users, "lien-he": Mail,
};

export default function About() {
  const { lang } = useI18n();
  const page = useMemo(() => buildAbout(lang, SITE), [lang]);
  const sections = useMemo(() => page.sections.map((s) => ({ ...s, icon: ICONS[s.id], img: IMAGES[s.id] })), [page]);

  const video = useMemo(() => (VIDEO ? {
    src: VIDEO, poster: POSTER,
    title: lang === "en" ? "Watch in one minute" : "Xem nhanh trong 1 phút",
    caption: lang === "en" ? "A short video summary of this page." : "Tóm tắt trang này bằng video, không cần đọc hết.",
  } : null), [lang]);

  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  return (
    <LegalPage
      title={page.title}
      eyebrow={page.eyebrow}
      intro={page.intro}
      chips={page.chips}
      hero={IMAGES.hero}
      sections={sections}
      ui={page.ui}
      video={video}
      home="/"
    />
  );
}


