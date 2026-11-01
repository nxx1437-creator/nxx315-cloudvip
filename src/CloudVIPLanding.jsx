import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, ChevronDown, ListChecks, Coins, Wallet, Gift, Users,
  Lock, ShieldCheck, Bot, KeyRound, Check, Plus,
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

/* ===== Analogue design tokens =====
   Carbon #000000 · Bone #ffffff · Ash #e5e7eb · Smoke #bfbfbf · Iron #999999
   Monochrome only. Max weight 500. Cards 17.6px. Pills 9999px. */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Roboto+Mono:wght@400;500&display=swap');
.lp {
  --carbon:#000000; --bone:#ffffff; --ash:#e5e7eb;
  --smoke:#bfbfbf; --iron:#999999;
  --font:'Inter',ui-sans-serif,system-ui,-apple-system,sans-serif;
  font-family:var(--font);
  font-feature-settings:"ss08" on, "calt" on;
  color:var(--bone);
  background:var(--carbon);
  -webkit-font-smoothing:antialiased;
  letter-spacing:-0.02em;
}
/* Display: weight 450/500, tracking cực âm khi size lớn */
.lp-display {
  font-weight:450;
  letter-spacing:-0.05em;
  line-height:1.0;
  color:var(--bone);
}
.lp-display-xl {
  font-size:clamp(40px,7vw,76px);
  letter-spacing:-0.06em;
  line-height:0.85;
  font-weight:450;
}
.lp-mono {
  font-family:'Roboto Mono',ui-monospace,monospace;
  text-transform:uppercase; letter-spacing:.14em; font-weight:400;
}
/* Hairline corner — thay cho khung xanh */
.lp-br { position:relative; }
.lp-br::before, .lp-br::after {
  content:""; position:absolute; width:8px; height:8px;
  border:1px solid rgba(229,231,235,0.35); pointer-events:none;
}
.lp-br::before { top:-1px; left:-1px; border-right:0; border-bottom:0; }
.lp-br::after { bottom:-1px; right:-1px; border-left:0; border-top:0; }

.lp-acc { color:var(--bone); }
.lp-muted { color:var(--iron); }
.lp-mid { color:var(--smoke); }

.lp-ico {
  display:flex; height:48px; width:48px; align-items:center; justify-content:center;
  border:1px solid rgba(229,231,235,0.15);
  color:var(--bone);
  border-radius:12px;
}
/* Primary Action Pill — trắng duy nhất trên nền tối */
.lp-btn {
  display:inline-flex; height:52px; align-items:center; justify-content:center; gap:8px;
  padding:0 32px; border-radius:9999px; background:var(--bone); color:var(--carbon);
  font-weight:500; font-size:15px; border:0; letter-spacing:-0.02em;
  transition:opacity .2s, transform .2s;
}
.lp-btn:hover { opacity:.88; transform:translateY(-1px); }
/* Ghost outline — chỉ dùng ngoài nền tối, viền hairline */
.lp-btn-o {
  display:inline-flex; height:52px; align-items:center; justify-content:center; gap:6px;
  padding:0 28px; border-radius:9999px;
  border:1px solid rgba(229,231,235,0.4);
  background:transparent; color:var(--bone);
  font-weight:450; font-size:15px; letter-spacing:-0.02em;
  transition:border-color .2s, background .2s;
}
.lp-btn-o:hover { border-color:var(--bone); background:rgba(255,255,255,0.04); }
/* Nút trắng dùng trên nền sáng (section Ash) */
.lp-btn-dark {
  display:inline-flex; height:52px; align-items:center; justify-content:center; gap:8px;
  padding:0 32px; border-radius:9999px;
  background:var(--carbon); color:var(--bone);
  font-weight:500; font-size:15px; border:0; letter-spacing:-0.02em;
  transition:opacity .2s;
}
.lp-btn-dark:hover { opacity:.85; }

@keyframes lp-float { 0%,100% { transform:translateY(0) rotate(var(--r,0deg)); } 50% { transform:translateY(-10px) rotate(var(--r,0deg)); } }
@keyframes lp-pop { from { opacity:0; transform:translateY(14px) scale(.97); } to { opacity:1; transform:none; } }
@keyframes lp-rise { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
.lp-float { animation:lp-float 5.2s ease-in-out infinite; }
.lp-float2 { animation:lp-float 6.4s ease-in-out -2s infinite; }
.lp-pop { animation:lp-pop .55s cubic-bezier(.2,.8,.2,1) both; }
.lp-rise { animation:lp-rise .8s cubic-bezier(.2,.8,.2,1) both; }
.lp-d1 { animation-delay:.08s; } .lp-d2 { animation-delay:.18s; }
.lp-d3 { animation-delay:.3s; } .lp-d4 { animation-delay:.42s; }
`;
function Img3D({ name, Fallback, size = "h-24 w-24", shadow = true }) {
  const [ok, setOk] = useState(true);
  if (!ok) return <Fallback className="h-10 w-10 text-[var(--smoke)]" strokeWidth={1.25} />;
  return (
    <img
      src={`${ICON_BASE}/${name}.png`}
      alt=""
      loading="lazy"
      className={`${size} object-contain ${shadow ? "drop-shadow-[0_10px_30px_rgba(0,0,0,0.55)]" : ""}`}
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

// Tiêu đề mục — hai dòng stacked: nhãn nhỏ Ash + tiêu đề lớn Bone
function Head({ n, label, title, sub, center = true, onLight = false }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className={`lp-mono text-[11px] ${onLight ? "text-[var(--iron)]" : "text-[var(--smoke)]"}`}>
        {n} — {label}
      </span>
      <h2 className="lp-display mt-4 text-[36px] sm:text-[52px]" style={{ color: onLight ? "var(--carbon)" : "var(--bone)" }}>
        {title}
      </h2>
      {sub && (
        <p className={`mt-4 text-[16px] leading-[1.5] ${onLight ? "text-[#555]" : "text-[var(--smoke)]"}`}>
          {sub}
        </p>
      )}
    </div>
  );
}

function FaqRow({ n, q, a, open, onToggle }) {
  return (
    <div className="border-b border-white/10">
      <button onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-4 py-5 text-left">
        <span className="lp-mono w-10 shrink-0 text-[11px] text-[var(--iron)]">{n}</span>
        <span className="flex-1 text-[16px] font-normal text-[var(--bone)]" style={{ fontWeight: 450 }}>{q}</span>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${open ? "rotate-45 border-[var(--bone)] text-[var(--bone)]" : "border-white/20 text-[var(--smoke)]"}`}>
          <Plus size={15} strokeWidth={1.5} />
        </span>
      </button>
      <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <p className="pb-5 pl-[56px] pr-10 text-[15px] leading-[1.6] text-[var(--smoke)]">{a}</p>
        </div>
      </div>
    </div>
  );
}

/* Showcase — artifact nổi trên void như Analogue */
const SHOW = [["icon-task", ListChecks], ["icon-gift", Gift], ["icon-money", Wallet]];
const ROTS = [-14, 8, -6];

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
      {/* Vitrine — void đen, viền hairline, không grid */}
      <div className="relative overflow-hidden rounded-[17.6px] border border-white/10 bg-[var(--carbon)] p-8 sm:p-10">
        {/* Nhãn góc — chỉ chữ, không fill */}
        <span className="lp-mono absolute left-4 top-4 text-[10px] text-[var(--iron)]">
          {c.facts[0][0]}
        </span>
        <span className="lp-mono absolute bottom-4 right-4 text-[10px] text-[var(--iron)]">
          {c.facts[1][0]}
        </span>

        <div key={i} className="lp-pop flex min-h-[320px] flex-col items-center justify-center text-center">
          <div
            className="lp-float"
            style={{ "--r": `${ROTS[i]}deg` }}
          >
            <Img3D name={name} Fallback={Fb} size="h-36 w-36 sm:h-44 sm:w-44" />
          </div>
          <h3 className="mt-8 max-w-sm text-[21px] leading-[1.15] text-[var(--bone)]" style={{ fontWeight: 450, letterSpacing: "-0.03em" }}>
            {f.title}
          </h3>
          <p className="mt-3 max-w-sm text-[15px] leading-[1.6] text-[var(--smoke)]">{f.body}</p>
        </div>
      </div>
      {/* Tab — pill, active = trắng, không viền */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {L.tabs.map(([n, label], k) => (
          <button
            key={n}
            onClick={() => { setI(k); setHold(true); }}
            className={`lp-mono rounded-full px-2 py-3 text-[10px] transition ${
              k === i
                ? "bg-[var(--bone)] text-[var(--carbon)]"
                : "border border-white/10 text-[var(--smoke)] hover:border-white/30 hover:text-[var(--bone)]"
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
    h1a: "Kiếm Coin",
    h1b: "Đổi thưởng dễ dàng",
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
    h1a: "Earn Coins",
    h1b: "Redeem with ease",
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

// Icon Lucide cho 4 feature, có fallback nếu features > 4
const FEATURE_ICONS = [ListChecks, Gift, Wallet, Users];

const FAQ_ORDER = [1, 2, 7, 3, 4, 5, 6];

function Eyebrow({ label, onLight = false }) {
  return (
    <span className={`lp-mono text-[11px] ${onLight ? "text-[var(--iron)]" : "text-[var(--smoke)]"}`}>
      {label}
    </span>
  );
}

const Row = ({ k, children }) => (
  <div className="flex justify-between gap-4 border-b border-white/10 py-4 last:border-b-0">
    <dt className="text-[14px] text-[var(--iron)]">{k}</dt>
    <dd className="text-right text-[14px] text-[var(--bone)]" style={{ fontWeight: 450 }}>{children}</dd>
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

  const linkCls = "text-[var(--bone)] underline-offset-4 hover:underline";

  return (
    <div className="lp min-h-screen bg-[var(--carbon)]">
      <style>{CSS}</style>
      <LandingHeader />

      <main>
        {/* ============ HERO — vitrine ============ */}
        <section className="relative border-b border-white/10 bg-[var(--carbon)]">
          <div className="relative mx-auto grid max-w-[1200px] items-center gap-14 px-5 pb-20 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:pb-28 lg:pt-24">
            <div>
              <span className="lp-mono lp-rise text-[11px] text-[var(--smoke)]">
                {t("ld.badge")}
              </span>
              <h1 className="lp-display lp-display-xl lp-rise lp-d1 mt-6">
                {c.h1a}
                <span className="mt-1 block text-[var(--bone)]">{c.h1b}</span>
              </h1>
              <p className="lp-rise lp-d2 mt-7 max-w-lg text-[17px] leading-[1.55] text-[var(--smoke)]">
                {c.heroSub}
              </p>
              <div className="lp-rise lp-d3 mt-9 flex flex-wrap gap-3">
                <button onClick={() => navigate("/register")} className="lp-btn">
                  {t("ld.ctaStart")} <ArrowRight size={16} strokeWidth={1.75} />
                </button>
                <button onClick={() => scrollToId("how")} className="lp-btn-o">
                  {c.how} <ChevronDown size={15} strokeWidth={1.75} />
                </button>
              </div>
              <ul className="lp-rise lp-d4 mt-9 space-y-2.5">
                {[t("ld.check1"), t("ld.check2"), t("ld.check3")].map((x) => (
                  <li key={x} className="flex items-center gap-2.5 text-[15px] text-[var(--smoke)]">
                    <Check size={15} strokeWidth={2} className="shrink-0 text-[var(--bone)]" /> {x}
                  </li>
                ))}
              </ul>
              <p className="mt-5 max-w-md text-[13px] leading-[1.6] text-[var(--iron)]">{c.note}</p>
            </div>
            <Showcase c={c} L={L} />
          </div>
        </section>

        {/* ============ SỐ LIỆU — dải đen liền mạch ============ */}
        <section className="border-b border-white/10 bg-[var(--carbon)]">
          <div className="mx-auto max-w-[1200px] px-5 py-16 sm:py-20">
            <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {c.facts.map(([v, l], i) => (
                <Reveal key={i} className="h-full">
                  <div className="h-full rounded-[17.6px] border border-white/10 bg-[var(--carbon)] p-7">
                    <dt className="lp-display text-[40px] text-[var(--bone)] sm:text-[52px]">{v}</dt>
                    <dd className="lp-mono mt-4 text-[10px] leading-5 text-[var(--iron)]">{l}</dd>
                  </div>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>

        {/* ============ TÍNH NĂNG — dải sáng Ash ============ */}
        <section id="features" className="scroll-mt-20 bg-[var(--ash)] text-[var(--carbon)]">
          <div className="mx-auto max-w-[1200px] px-5 py-20 sm:py-28">
            <Head n="001" label={L.feat} title={c.featTitle} onLight />
            <div className="mt-14 grid gap-4 md:grid-cols-2">
              {c.features.map((f, i) => {
                const Icon = FEATURE_ICONS[i] || ListChecks;
                return (
                  <Reveal key={f.to} className="h-full">
                    <div className="h-full rounded-[17.6px] border border-black/10 bg-[var(--bone)] p-7 transition duration-300 hover:border-black/30">
                      <div className="flex items-start justify-between">
                        <span className="flex h-12 w-12 items-center justify-center rounded-[12px] border border-black/10 text-[var(--carbon)]">
                          <Icon size={20} strokeWidth={1.5} />
                        </span>
                        <span className="lp-mono text-[10px] text-[var(--iron)]">0{i + 1}</span>
                      </div>
                      <h3 className="mt-7 text-[21px] leading-[1.15] text-[var(--carbon)]" style={{ fontWeight: 450, letterSpacing: "-0.03em" }}>
                        {f.title}
                      </h3>
                      <p className="mt-3 text-[15px] leading-[1.6] text-[#454545]">{f.body}</p>
                      <Link to={f.to} className="mt-5 inline-flex items-center gap-1 text-[14px] text-[var(--carbon)] underline-offset-4 hover:underline" style={{ fontWeight: 450 }}>
                        {c.guide} <ArrowRight size={14} strokeWidth={1.75} />
                      </Link>
                    </div>
                  </Reveal>
                );
              })}
            </div>
            <p className="lp-mono mt-12 text-center text-[10px] leading-6 text-[var(--iron)]">{c.more}</p>
          </div>
        </section>

        {/* ============ CÁCH HOẠT ĐỘNG — về void ============ */}
        <section id="how" className="scroll-mt-20 bg-[var(--carbon)]">
          <div className="mx-auto max-w-[1200px] px-5 py-20 sm:py-28">
            <Head n="002" label={L.how} title={c.howTitle} />
            <ol className="mt-14 grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <li key={n}>
                  <Reveal className="h-full">
                    <div className="h-full rounded-[17.6px] border border-white/10 bg-[var(--carbon)] p-7">
                      <span
                        className="lp-display text-[64px] leading-none text-transparent"
                        style={{ WebkitTextStroke: "1px rgba(229,231,235,0.45)" }}
                      >
                        0{n}
                      </span>
                      <h3 className="mt-5 text-[21px] leading-[1.15] text-[var(--bone)]" style={{ fontWeight: 450, letterSpacing: "-0.03em" }}>
                        {t(`ld.s${n}t`)}
                      </h3>
                      <p className="mt-3 text-[15px] leading-[1.6] text-[var(--smoke)]">{t(`ld.s${n}d`)}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ============ AN TOÀN — dải Ash ============ */}
        <section id="safety" className="scroll-mt-20 bg-[var(--ash)] text-[var(--carbon)]">
          <div className="mx-auto max-w-[1200px] px-5 py-20 sm:py-28">
            <Head n="003" label={L.safe} title={t("ld.safeTitle")} sub={t("ld.safeSub")} onLight />
            <Reveal>
              <div className="mt-14 rounded-[17.6px] border border-black/10 bg-[var(--bone)] p-8 sm:p-12">
                <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
                  {SAFETY.map(({ icon: Icon, t: tk, d }) => (
                    <div key={tk} className="flex gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/15 text-[var(--carbon)]">
                        <Icon className="h-5 w-5" strokeWidth={1.5} />
                      </span>
                      <div>
                        <h3 className="text-[17px] text-[var(--carbon)]" style={{ fontWeight: 450, letterSpacing: "-0.02em" }}>{t(tk)}</h3>
                        <p className="mt-2 text-[15px] leading-[1.6] text-[#454545]">{t(d)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============ AI ĐỨNG SAU — void ============ */}
        <section className="border-y border-white/10 bg-[var(--carbon)]">
          <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-20 sm:py-28 md:grid-cols-2 md:gap-16">
            <div>
              <Eyebrow label={L.who} />
              <h2 className="lp-display mt-5 text-[36px] sm:text-[52px]">{c.whoTitle}</h2>
              <p className="mt-5 max-w-md text-[16px] leading-[1.6] text-[var(--smoke)]">{c.whoBody}</p>
              <ul className="mt-6 space-y-3 text-[15px] text-[var(--bone)]">
                {c.whoPoints.map((p) => (
                  <li key={p} className="flex gap-3">
                    <Check size={16} strokeWidth={2} className="mt-1 shrink-0 text-[var(--bone)]" />
                    <span className="text-[var(--smoke)]">{p}</span>
                  </li>
                ))}
              </ul>
              <Link to="/about" className="mt-7 inline-flex items-center gap-1 text-[15px] text-[var(--bone)] underline-offset-4 hover:underline" style={{ fontWeight: 450 }}>
                {c.whoMore} <ArrowRight size={14} strokeWidth={1.75} />
              </Link>

              <div className="mt-10 border-t border-white/10 pt-6">
                <p className="lp-mono text-[10px] text-[var(--iron)]">{c.whoLegal}</p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
                  <Link to="/terms" className="text-[var(--smoke)] underline-offset-4 hover:text-[var(--bone)] hover:underline">
                    {lang === "en" ? "Terms of Service" : "Điều khoản sử dụng"}
                  </Link>
                  <Link to="/privacy" className="text-[var(--smoke)] underline-offset-4 hover:text-[var(--bone)] hover:underline">
                    {lang === "en" ? "Privacy Policy" : "Chính sách bảo mật"}
                  </Link>
                  <Link to="/refund" className="text-[var(--smoke)] underline-offset-4 hover:text-[var(--bone)] hover:underline">
                    {lang === "en" ? "Refund Policy" : "Chính sách hoàn tiền"}
                  </Link>
                </div>
              </div>
            </div>

            <Reveal>
              <dl className="rounded-[17.6px] border border-white/10 bg-[var(--carbon)] px-6 py-2">
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

        {/* ============ FAQ — Ash ============ */}
        <section id="faq" className="scroll-mt-20 bg-[var(--ash)] text-[var(--carbon)]">
          <div className="mx-auto max-w-3xl px-5 py-20 sm:py-28">
            <Head n="004" label={L.faq} title={t("ld.faqTitle")} onLight />
            <div className="mt-12 border-t border-black/10">
              <div className="[&_.lp-mono]:text-[var(--iron)] [&_p]:text-[#454545] [&_button_span:nth-child(2)]:text-[var(--carbon)] [&_.border-b]:border-black/10">
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
          </div>
        </section>

        {/* ============ KÊU GỌI CUỐI — void, pill trắng ============ */}
        <section className="bg-[var(--carbon)]">
          <div className="mx-auto max-w-[1200px] px-5 py-20 sm:py-28">
            <Reveal>
              <div className="relative overflow-hidden rounded-[17.6px] border border-white/10 bg-[var(--carbon)] px-8 py-16 text-center sm:px-14 sm:py-24">
                <Coins
                  className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rotate-12 text-white/[0.04]"
                  strokeWidth={0.75}
                />
                <h2 className="lp-display relative mx-auto max-w-2xl text-[40px] sm:text-[64px] text-[var(--bone)]">
                  {c.ctaTitle}
                </h2>
                <p className="relative mx-auto mt-5 max-w-lg text-[16px] leading-[1.6] text-[var(--smoke)]">
                  {t("ld.ctaSub")}
                </p>
                <div className="relative mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
                  <button onClick={() => navigate("/register")} className="lp-btn">
                    {t("ld.ctaReg")} <ArrowRight size={16} strokeWidth={1.75} />
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="text-[15px] text-[var(--bone)] underline-offset-4 hover:underline"
                    style={{ fontWeight: 450 }}
                  >
                    {t("ld.login")}
                  </button>
                </div>
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
