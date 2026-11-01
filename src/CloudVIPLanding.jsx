import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, ChevronDown, ListChecks, Coins, Wallet, Gift, Users,
  Lock, ShieldCheck, Bot, KeyRound, Check, Plus, Play,
} from "lucide-react";
import {
  LandingHeader,
  LandingFooter,
  BackToTop,
  scrollToId,
} from "./components/LandingNav.jsx";
import { SITE } from "./lib/siteInfo.js";
import { useI18n } from "./i18n/index.js";

const ICON_BASE =
  "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/icons";

/* ===== Apple design tokens =====
   Studio #ffffff · Gallery #fafafc · Cloud #f5f5f7 · Graphite #1d1d1f
   Slate #5b5b61 · Steel #86868b · Divider #d6d6d6 · Control #e2e2e5
   Blue #0071e3 · Link #0066cc · New #b64400 */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Roboto+Mono:wght@400;500&display=swap');
.lp {
  --studio:#ffffff; --gallery:#fafafc; --cloud:#f5f5f7;
  --graphite:#1d1d1f; --slate:#5b5b61; --steel:#86868b;
  --divider:#d6d6d6; --control:#e2e2e5;
  --blue:#0071e3; --link:#0066cc; --new:#b64400;
  font-family:'Inter','SF Pro Text',ui-sans-serif,system-ui,-apple-system,sans-serif;
  font-feature-settings:"numr" on;
  color:var(--graphite);
  background:var(--studio);
  -webkit-font-smoothing:antialiased;
  letter-spacing:-0.01em;
}
/* Display — SF Pro Display 600 (Inter 600 substitute) */
.lp-display {
  font-weight:600;
  letter-spacing:-0.02em;
  line-height:1.06;
  color:var(--graphite);
}
.lp-display-xl {
  font-size:clamp(40px,7.5vw,80px);
  letter-spacing:-0.03em;
  line-height:1.02;
  font-weight:600;
}
.lp-mono {
  font-family:'Roboto Mono',ui-monospace,monospace;
  text-transform:uppercase; letter-spacing:.12em; font-weight:400;
}
.lp-acc { color:var(--graphite); }
.lp-muted { color:var(--steel); }

.lp-ico {
  display:flex; height:52px; width:52px; align-items:center; justify-content:center;
  border-radius:14px; background:var(--cloud); color:var(--graphite);
}
/* Primary Buy Pill — Apple Blue duy nhất cho CTA */
.lp-btn {
  display:inline-flex; height:48px; align-items:center; justify-content:center; gap:8px;
  padding:0 24px; border-radius:9999px;
  background:var(--blue); color:#fff;
  font-weight:500; font-size:16px; border:0; letter-spacing:-0.02em;
  transition:opacity .2s, transform .2s;
}
.lp-btn:hover { opacity:.9; transform:translateY(-1px); }
/* Ghost — viền graphite */
.lp-btn-o {
  display:inline-flex; height:48px; align-items:center; justify-content:center; gap:6px;
  padding:0 22px; border-radius:9999px;
  border:1px solid var(--divider); background:transparent; color:var(--graphite);
  font-weight:500; font-size:16px; letter-spacing:-0.02em;
  transition:border-color .2s, background .2s;
}
.lp-btn-o:hover { border-color:var(--graphite); background:var(--gallery); }
/* Pill trắng cho nền tối (hero film) */
.lp-btn-light {
  display:inline-flex; height:48px; align-items:center; justify-content:center; gap:8px;
  padding:0 24px; border-radius:9999px;
  background:rgba(210,210,215,0.64); color:var(--graphite);
  font-weight:500; font-size:16px; border:0; letter-spacing:-0.02em;
  backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
  transition:opacity .2s;
}
.lp-btn-light:hover { opacity:.9; }

@keyframes lp-float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
@keyframes lp-pop { from { opacity:0; transform:translateY(14px) scale(.97); } to { opacity:1; transform:none; } }
@keyframes lp-rise { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
.lp-float { animation:lp-float 5s ease-in-out infinite; }
.lp-float2 { animation:lp-float 6s ease-in-out -2s infinite; }
.lp-pop { animation:lp-pop .55s cubic-bezier(.2,.8,.2,1) both; }
.lp-rise { animation:lp-rise .8s cubic-bezier(.2,.8,.2,1) both; }
.lp-d1 { animation-delay:.08s; } .lp-d2 { animation-delay:.18s; }
.lp-d3 { animation-delay:.3s; } .lp-d4 { animation-delay:.42s; }
`;
function Img3D({ name, Fallback, size = "h-24 w-24", shadow = true }) {
  const [ok, setOk] = useState(true);
  if (!ok) return <Fallback className="h-10 w-10 text-[var(--steel)]" strokeWidth={1.25} />;
  return (
    <img
      src={`${ICON_BASE}/${name}.png`}
      alt=""
      loading="lazy"
      className={`${size} object-contain ${shadow ? "drop-shadow-[0_20px_40px_rgba(0,0,0,0.18)]" : ""}`}
      onError={() => setOk(false)}
    />
  );
}

function Reveal({ children, className = "" }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) { setOn(true); return undefined; }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } },
      { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`transition-[opacity,transform] duration-700 ease-out ${on ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${className}`}>
      {children}
    </div>
  );
}

// Head — kicker 28px Graphite + headline 48–64px
function Head({ n, label, title, sub, center = true, onDark = false }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <span className={`lp-mono text-[11px] ${onDark ? "text-white/60" : "text-[var(--steel)]"}`}>
        {n} — {label}
      </span>
      <h2
        className="lp-display mt-4 text-[36px] sm:text-[56px]"
        style={{ color: onDark ? "#fff" : "var(--graphite)" }}
      >
        {title}
      </h2>
      {sub && (
        <p className={`mt-4 text-[17px] leading-[1.5] ${onDark ? "text-white/70" : "text-[var(--slate)]"}`}>
          {sub}
        </p>
      )}
    </div>
  );
}

function FaqRow({ n, q, a, open, onToggle }) {
  return (
    <div className="border-b border-[var(--divider)]">
      <button onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-4 py-5 text-left">
        <span className="lp-mono w-10 shrink-0 text-[11px] text-[var(--steel)]">{n}</span>
        <span className="flex-1 text-[17px] font-semibold text-[var(--graphite)]">{q}</span>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${open ? "rotate-45 border-[var(--graphite)] text-[var(--graphite)]" : "border-[var(--divider)] text-[var(--steel)]"}`}>
          <Plus size={15} strokeWidth={1.75} />
        </span>
      </button>
      <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <p className="pb-5 pl-[56px] pr-10 text-[15px] leading-[1.6] text-[var(--slate)]">{a}</p>
        </div>
      </div>
    </div>
  );
}

/* Showcase — media panel 20px radius, text overlay kiểu Apple film card */
const SHOW = [["icon-task", ListChecks], ["icon-gift", Gift], ["icon-money", Wallet]];

function Showcase({ c, L }) {
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  useEffect(() => {
    if (hold) return undefined;
    const id = setInterval(() => setI((v) => (v + 1) % 3), 3800);
    return () => clearInterval(id);
  }, [hold]);
  const f = c.features[i];
  const [name, Fb] = SHOW[i];
  return (
    <div className="lp-rise lp-d2">
      <div className="relative overflow-hidden rounded-[20px] border border-[var(--divider)] bg-[var(--cloud)] p-8 sm:p-10">
        <div key={i} className="lp-pop flex min-h-[320px] flex-col items-center justify-center text-center">
          <div className="lp-float">
            <Img3D name={name} Fallback={Fb} size="h-36 w-36 sm:h-44 sm:w-44" />
          </div>
          <h3 className="mt-8 max-w-sm text-[24px] font-semibold leading-[1.17] text-[var(--graphite)]">
            {f.title}
          </h3>
          <p className="mt-3 max-w-sm text-[15px] leading-[1.6] text-[var(--slate)]">{f.body}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {L.tabs.map(([n, label], k) => (
          <button
            key={n}
            onClick={() => { setI(k); setHold(true); }}
            className={`lp-mono rounded-full px-2 py-3 text-[10px] transition ${
              k === i
                ? "bg-[var(--graphite)] text-white"
                : "border border-[var(--divider)] text-[var(--steel)] hover:border-[var(--graphite)] hover:text-[var(--graphite)]"
            }`}
          >
            <span className="mr-1 opacity-60">{n}</span>{label}
          </button>
        ))}
      </div>
    </div>
  );
    }
// Chữ trong trang. Số liệu lấy từ hệ thống thật, đổi mức rút/phí thì sửa ở đây.
const COPY = {
  vi: {
    h1a: "Làm",
    h1b: "Nhận",
    heroSub:
      "Làm nhiệm vụ đơn giản, nhận Coin và đổi lấy Robux, kim cương game và nhiều quà khác.",
    how: "Cách hoạt động",
    note: "Kiếm xu hoàn toàn miễn phí. Chuyển khoản chỉ dùng khi bạn muốn mua quà trực tiếp.",
    facts: [
      ["1 Coin = 1đ", "Giá Coin bằng giá tiền"],
      ["10.000đ", "Mức rút tối thiểu"],
      ["7 ngày", "Chuỗi điểm danh, ngày cuối thưởng 1.000 xu"],
      ["15%", "Hoa hồng khi bạn bè làm nhiệm vụ"],
    ],
    featTitle: "Bạn làm được gì trên NXX315",
    guide: "Xem hướng dẫn",
    features: [
      {
        to: "/guide/lam-nhiem-vu",
        title: "Làm nhiệm vụ, nhận xu trong ngày",
        body: "Mở liên kết của đối tác, làm theo các bước rồi quay lại xác nhận là xu vào ví. Mỗi nhiệm vụ có số lượt riêng mỗi ngày.",
      },
      {
        to: "/guide/doi-thuong",
        title: "Đổi xu lấy quà game",
        body: "Robux, Quân Huy, kim cương Free Fire và nhiều gói khác. Trả bằng Coin hoặc chuyển khoản, đơn nào cũng theo dõi được trong Lịch sử.",
      },
      {
        to: "/guide/rut-tien",
        title: "Rút về khi bạn cần",
        body: "Rút từ 10.000đ về ngân hàng, MoMo hoặc ZaloPay. Phí 1.000 Coin mỗi lần, yêu cầu được xem xét thủ công.",
      },
      {
        to: "/guide/moi-ban",
        title: "Mời bạn bè, nhận hoa hồng",
        body: "Bạn bè nhập mã của bạn nhận 200 xu. Bạn nhận 15% số xu họ kiếm từ nhiệm vụ, thêm thưởng khi đủ 3, 5, 10 và 20 người.",
      },
    ],
    more: "Ngoài ra còn có điểm danh hằng ngày, minigame, cấp độ và bảng xếp hạng.",
    howTitle: "Bắt đầu chỉ với 3 bước",
    ctaTitle: "Bắt đầu kiếm Coin hôm nay.",
    whoTitle: "Ai đứng sau NXX315",
    whoBody:
      "NXX315 do một cá nhân vận hành và mới hoạt động từ tháng 8/2026. Chúng tôi công khai cách hoạt động và kênh liên hệ chính thức để bạn tự kiểm tra.",
    whoPoints: [
      "Kiếm xu miễn phí, không cần nạp tiền để rút.",
      "Chuyển khoản chỉ dùng khi bạn mua quà trực tiếp.",
      "Hoa hồng giới thiệu không phải cam kết thu nhập.",
    ],
    whoMore: "Đọc trang Về chúng tôi",
    whoOperator: "Người vận hành",
    whoSince: "Hoạt động từ",
    whoLegal: "Pháp lý & chính sách",
  },
  en: {
    h1a: "Do",
    h1b: "Get",
    heroSub:
      "Complete simple tasks, earn Coins and redeem Robux, in-game diamonds and more rewards.",
    how: "How it works",
    note: "Earning coins is completely free. Bank transfer is only for buying gifts directly.",
    facts: [
      ["1 Coin = 1 VND", "Coin price equals cash price"],
      ["10,000 VND", "Minimum withdrawal"],
      ["7 days", "Check-in streak, 1,000 coins on the last day"],
      ["15%", "Commission when friends complete tasks"],
    ],
    featTitle: "What you can do on NXX315",
    guide: "Read the guide",
    features: [
      {
        to: "/guide/lam-nhiem-vu",
        title: "Do tasks, get coins the same day",
        body: "Open a partner link, follow the steps, then come back to confirm and the coins land in your wallet. Each task has its own daily limit.",
      },
      {
        to: "/guide/doi-thuong",
        title: "Redeem coins for game gifts",
        body: "Robux, Quân Huy, Free Fire diamonds and more. Pay with Coins or bank transfer and track every order in History.",
      },
      {
        to: "/guide/rut-tien",
        title: "Withdraw when you need to",
        body: "Withdraw from 10,000 VND to a bank, MoMo or ZaloPay. The fee is 1,000 Coins per request and requests are reviewed manually.",
      },
      {
        to: "/guide/moi-ban",
        title: "Invite friends, earn commission",
        body: "Friends who enter your code get 200 coins. You get 15% of the coins they earn from tasks, plus bonuses at 3, 5, 10 and 20 invites.",
      },
    ],
    more: "There is also daily check-in, minigames, levels and a leaderboard.",
    howTitle: "Get started in 3 steps",
    ctaTitle: "Start earning Coins today.",
    whoTitle: "Who is behind NXX315",
    whoBody:
      "NXX315 is run by an individual and has only been running since August 2026. We publish how it works and our official contacts so you can check for yourself.",
    whoPoints: [
      "Earning is free, no deposit needed to withdraw.",
      "Bank transfer is only for buying gifts directly.",
      "Referral commission is not an income guarantee.",
    ],
    whoMore: "Read the About page",
    whoOperator: "Operator",
    whoSince: "Running since",
    whoLegal: "Legal & policies",
  },
};

const LABELS = {
  vi: {
    feat: "TÍNH NĂNG", how: "CÁCH HOẠT ĐỘNG", safe: "AN TOÀN", who: "MINH BẠCH", faq: "HỎI ĐÁP",
    tabs: [["01", "NHIỆM VỤ"], ["02", "ĐỔI QUÀ"], ["03", "RÚT TIỀN"]],
    ticks: ["Kiếm xu hoàn toàn miễn phí", "Không cần nạp tiền để rút", "Theo dõi mọi đơn trong Lịch sử"],
  },
  en: {
    feat: "FEATURES", how: "HOW IT WORKS", safe: "SAFETY", who: "TRANSPARENCY", faq: "FAQ",
    tabs: [["01", "TASKS"], ["02", "REDEEM"], ["03", "WITHDRAW"]],
    ticks: ["Earning coins is free", "No deposit needed to withdraw", "Track every order in History"],
  },
};

const SAFETY = [
  { icon: Lock, t: "ld.b1t", d: "ld.b1d" },
  { icon: ShieldCheck, t: "ld.b2t", d: "ld.b2d" },
  { icon: Bot, t: "ld.b3t", d: "ld.b3d" },
  { icon: KeyRound, t: "ld.b4t", d: "ld.b4d" },
];

const FEATURE_ICONS = [ListChecks, Gift, Wallet, Users];

const FAQ_ORDER = [1, 2, 7, 3, 4, 5, 6];

function Eyebrow({ label, onDark = false }) {
  return (
    <span className={`lp-mono text-[11px] ${onDark ? "text-white/60" : "text-[var(--steel)]"}`}>
      {label}
    </span>
  );
}

const Row = ({ k, children }) => (
  <div className="flex justify-between gap-4 border-b border-[var(--divider)] py-4 last:border-b-0">
    <dt className="text-[14px] text-[var(--steel)]">{k}</dt>
    <dd className="text-right text-[14px] font-semibold text-[var(--graphite)]">{children}</dd>
  </div>
);
export default function CloudVIPLanding() {
  const { t, lang } = useI18n();
  const c = COPY[lang] || COPY.vi;
  const L = LABELS[lang] || LABELS.vi;
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);

  const launchedText =
    typeof SITE.launched === "object"
      ? SITE.launched[lang] || SITE.launched.vi
      : SITE.launched;

  const linkCls = "text-[var(--graphite)] underline-offset-4 hover:text-[var(--link)] hover:underline";

  return (
    <div className="lp min-h-screen bg-[var(--studio)]">
      <style>{CSS}</style>
      <LandingHeader />

      <main>
        {/* ============ HERO — full-bleed film + copy overlay ============ */}
        <section className="relative overflow-hidden bg-[var(--graphite)] text-white">
          {/* 👇👇👇 DÁN LINK VIDEO HERO VÀO ĐÂY 👇👇👇 */}
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster=""
          >
            {/* 👉 ĐỔI src bên dưới thành link video của bạn (mp4/webm) */}
            <source src="" type="video/mp4" />
          </video>
          {/* 👆👆👆 HẾT SLOT VIDEO HERO 👆👆👆 */}

          {/* Lớp tối nhẹ để chữ đọc được trên video */}
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />

          <div className="relative mx-auto grid max-w-[1200px] items-center gap-14 px-5 pb-24 pt-24 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:pb-32 lg:pt-32">
            <div>
              <span className="lp-mono lp-rise text-[11px] text-white/70">
                {t("ld.badge")}
              </span>
              <h1 className="lp-display lp-display-xl lp-rise lp-d1 mt-6 text-white">
                {c.h1a}
                <span className="mt-1 block text-white">{c.h1b}</span>
              </h1>
              <p className="lp-rise lp-d2 mt-7 max-w-lg text-[17px] leading-[1.55] text-white/80">
                {c.heroSub}
              </p>
              <div className="lp-rise lp-d3 mt-9 flex flex-wrap gap-3">
                <button onClick={() => navigate("/register")} className="lp-btn">
                  {t("ld.ctaStart")} <ArrowRight size={16} strokeWidth={1.75} />
                </button>
                <button onClick={() => scrollToId("how")} className="lp-btn-light">
                  {c.how} <ChevronDown size={15} strokeWidth={1.75} />
                </button>
              </div>
              <ul className="lp-rise lp-d4 mt-9 space-y-2.5">
                {[t("ld.check1"), t("ld.check2"), t("ld.check3")].map((x) => (
                  <li key={x} className="flex items-center gap-2.5 text-[15px] text-white/80">
                    <Check size={15} strokeWidth={2} className="shrink-0 text-white" /> {x}
                  </li>
                ))}
              </ul>
              <p className="mt-5 max-w-md text-[13px] leading-[1.6] text-white/60">{c.note}</p>
            </div>
            <Showcase c={c} L={L} />
          </div>
        </section>

        {/* ============ SỐ LIỆU — Cloud Gray band ============ */}
        <section className="bg-[var(--cloud)]">
          <div className="mx-auto max-w-[1200px] px-5 py-20 sm:py-24">
            <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {c.facts.map(([v, l], i) => (
                <Reveal key={i} className="h-full">
                  <div className="h-full rounded-[28px] bg-[var(--studio)] p-7">
                    <dt className="lp-display text-[36px] text-[var(--graphite)] sm:text-[44px]">{v}</dt>
                    <dd className="lp-mono mt-3 text-[10px] leading-5 text-[var(--steel)]">{l}</dd>
                  </div>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>

        {/* ============ TÍNH NĂNG — trắng ============ */}
        <section id="features" className="scroll-mt-20 bg-[var(--studio)]">
          <div className="mx-auto max-w-[1200px] px-5 py-20 sm:py-28">
            <Head n="001" label={L.feat} title={c.featTitle} />
            <div className="mt-16 grid gap-4 md:grid-cols-2">
              {c.features.map((f, i) => {
                const Icon = FEATURE_ICONS[i] || ListChecks;
                return (
                  <Reveal key={f.to} className="h-full">
                    <div className="h-full rounded-[28px] bg-[var(--cloud)] p-8 transition duration-300 hover:bg-[#eeeef0]">
                      <div className="flex items-start justify-between">
                        <span className="lp-ico"><Icon size={22} strokeWidth={1.5} /></span>
                        <span className="lp-mono text-[10px] text-[var(--steel)]">0{i + 1}</span>
                      </div>
                      <h3 className="mt-8 text-[24px] font-semibold leading-[1.17] text-[var(--graphite)]">
                        {f.title}
                      </h3>
                      <p className="mt-3 text-[15px] leading-[1.6] text-[var(--slate)]">{f.body}</p>
                      <Link to={f.to} className="mt-5 inline-flex items-center gap-1 text-[15px] font-medium text-[var(--link)] hover:underline">
                        {c.guide} <ArrowRight size={14} strokeWidth={1.75} />
                      </Link>
                    </div>
                  </Reveal>
                );
              })}
            </div>
            <p className="lp-mono mt-12 text-center text-[10px] leading-6 text-[var(--steel)]">{c.more}</p>
          </div>
        </section>

        {/* ============ CÁCH HOẠT ĐỘNG — có VIDEO PANEL ============ */}
        <section id="how" className="scroll-mt-20 bg-[var(--studio)]">
          <div className="mx-auto max-w-[1200px] px-5 py-20 sm:py-28">
            <Head n="002" label={L.how} title={c.howTitle} />

            {/* 👇👇👇 DÁN LINK VIDEO PANEL VÀO ĐÂY 👇👇👇 */}
            <div className="mt-14 overflow-hidden rounded-[20px] bg-[var(--graphite)]">
              <video
                className="aspect-video w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                controls
              >
                {/* 👉 ĐỔI src bên dưới thành link video thứ 2 của bạn */}
                <source src="" type="video/mp4" />
              </video>
            </div>
            {/* 👆👆👆 HẾT SLOT VIDEO PANEL 👆👆👆 */}

            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <li key={n}>
                  <Reveal className="h-full">
                    <div className="h-full rounded-[28px] bg-[var(--cloud)] p-7">
                      <span className="lp-display text-[56px] leading-none text-[var(--control)]">
                        0{n}
                      </span>
                      <h3 className="mt-4 text-[22px] font-semibold leading-[1.18] text-[var(--graphite)]">
                        {t(`ld.s${n}t`)}
                      </h3>
                      <p className="mt-2 text-[15px] leading-[1.6] text-[var(--slate)]">{t(`ld.s${n}d`)}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ============ AN TOÀN — Cloud Gray ============ */}
        <section id="safety" className="scroll-mt-20 bg-[var(--cloud)]">
          <div className="mx-auto max-w-[1200px] px-5 py-20 sm:py-28">
            <Head n="003" label={L.safe} title={t("ld.safeTitle")} sub={t("ld.safeSub")} />
            <Reveal>
              <div className="mt-14 rounded-[28px] bg-[var(--studio)] p-8 sm:p-12">
                <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
                  {SAFETY.map(({ icon: Icon, t: tk, d }) => (
                    <div key={tk} className="flex gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--cloud)] text-[var(--graphite)]">
                        <Icon className="h-5 w-5" strokeWidth={1.5} />
                      </span>
                      <div>
                        <h3 className="text-[17px] font-semibold text-[var(--graphite)]">{t(tk)}</h3>
                        <p className="mt-2 text-[15px] leading-[1.6] text-[var(--slate)]">{t(d)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============ AI ĐỨNG SAU — trắng ============ */}
        <section className="bg-[var(--studio)]">
          <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-20 sm:py-28 md:grid-cols-2 md:gap-16">
            <div>
              <Eyebrow label={L.who} />
              <h2 className="lp-display mt-5 text-[36px] sm:text-[52px]">{c.whoTitle}</h2>
              <p className="mt-5 max-w-md text-[17px] leading-[1.55] text-[var(--slate)]">{c.whoBody}</p>
              <ul className="mt-6 space-y-3 text-[15px] text-[var(--graphite)]">
                {c.whoPoints.map((p) => (
                  <li key={p} className="flex gap-3">
                    <Check size={16} strokeWidth={2} className="mt-1 shrink-0 text-[var(--blue)]" />
                    <span className="text-[var(--slate)]">{p}</span>
                  </li>
                ))}
              </ul>
              <Link to="/about" className="mt-7 inline-flex items-center gap-1 text-[15px] font-medium text-[var(--link)] hover:underline">
                {c.whoMore} <ArrowRight size={14} strokeWidth={1.75} />
              </Link>

              <div className="mt-10 border-t border-[var(--divider)] pt-6">
                <p className="lp-mono text-[10px] text-[var(--steel)]">{c.whoLegal}</p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
                  <Link to="/terms" className="text-[var(--slate)] hover:text-[var(--link)] hover:underline">
                    {lang === "en" ? "Terms of Service" : "Điều khoản sử dụng"}
                  </Link>
                  <Link to="/privacy" className="text-[var(--slate)] hover:text-[var(--link)] hover:underline">
                    {lang === "en" ? "Privacy Policy" : "Chính sách bảo mật"}
                  </Link>
                  <Link to="/refund" className="text-[var(--slate)] hover:text-[var(--link)] hover:underline">
                    {lang === "en" ? "Refund Policy" : "Chính sách hoàn tiền"}
                  </Link>
                </div>
              </div>
            </div>

            <Reveal>
              <dl className="rounded-[28px] bg-[var(--cloud)] px-7 py-2">
                <Row k={c.whoOperator}>{SITE.operator}</Row>
                {SITE.address && <Row k={lang === "en" ? "Address" : "Địa chỉ"}>{SITE.address}</Row>}
                {SITE.business && <Row k={lang === "en" ? "Business" : "Kinh doanh"}>{SITE.business}</Row>}
                {SITE.youtube && (
                  <Row k="YouTube">
                    <a href={SITE.youtube} target="_blank" rel="noopener noreferrer" className={linkCls}>
                      {SITE.youtube.replace("https://www.youtube.com/", "")}
                    </a>
                  </Row>
                )}
                <Row k="Zalo">
                  <a href={SITE.zaloUrl} target="_blank" rel="noopener noreferrer" className={linkCls}>
                    {SITE.zalo}
                  </a>
                </Row>
                <Row k="Email"><span className="break-all">{SITE.email}</span></Row>
                <Row k={c.whoSince}>{launchedText}</Row>
              </dl>
            </Reveal>
          </div>
        </section>

        {/* ============ FAQ — Cloud Gray ============ */}
        <section id="faq" className="scroll-mt-20 bg-[var(--cloud)]">
          <div className="mx-auto max-w-3xl px-5 py-20 sm:py-28">
            <Head n="004" label={L.faq} title={t("ld.faqTitle")} />
            <div className="mt-12 border-t border-[var(--divider)]">
              {FAQ_ORDER.map((i, idx) => (
                <FaqRow
                  key={i}
                  n={String(idx + 1).padStart(3, "0")}
                  q={t(`ld.faq${i}q`)}
                  a={t(`ld.faq${i}a`)}
                  open={openFaq === idx}
                  onToggle={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ============ KÊU GỌI CUỐI — film tối ============ */}
        <section className="bg-[var(--graphite)]">
          <div className="mx-auto max-w-[1200px] px-5 py-20 text-center sm:py-28">
            <Reveal>
              <Coins
                className="pointer-events-none mx-auto mb-8 h-20 w-20 text-white/15"
                strokeWidth={0.75}
              />
              <h2 className="lp-display mx-auto max-w-2xl text-[40px] text-white sm:text-[64px]">
                {c.ctaTitle}
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-[17px] leading-[1.55] text-white/70">
                {t("ld.ctaSub")}
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
                <button onClick={() => navigate("/register")} className="lp-btn">
                  {t("ld.ctaReg")} <ArrowRight size={16} strokeWidth={1.75} />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="text-[16px] font-medium text-white underline-offset-4 hover:underline"
                >
                  {t("ld.login")}
                </button>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <LandingFooter />
      <BackToTop />
    </div>
  );
            }
