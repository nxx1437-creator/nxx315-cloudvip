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

/* ===== Wise design tokens =====
   Forest Ink #163300 · Lime #9fe870 · Spruce #054d28 · Linen Mist #e2f6d5
   Fog #e8ebe6 · Charcoal #454745 · Obsidian #0e0f0c · Pebble #868685 */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Roboto+Mono:wght@500;700&display=swap');
.lp {
  --ink:#163300; --lime:#9fe870; --spruce:#054d28; --mist:#e2f6d5;
  --fog:#e8ebe6; --charcoal:#454745; --obsidian:#0e0f0c; --pebble:#868685;
  --slate:#6a6c6a; --paper:#ffffff;
  font-family:'Inter',ui-sans-serif,system-ui,sans-serif;
  color:var(--charcoal);
  -webkit-font-smoothing:antialiased;
}
/* Display: Inter Black 900, tracking cực âm */
.lp-display {
  font-family:'Inter',sans-serif;
  font-weight:900;
  letter-spacing:-0.04em;
  line-height:0.92;
  color:var(--obsidian);
}
.lp-display-xl { font-size:clamp(48px,8vw,104px); letter-spacing:-0.045em; line-height:0.86; }
.lp-mono {
  font-family:'Roboto Mono',ui-monospace,monospace;
  text-transform:uppercase; letter-spacing:.16em; font-weight:700;
}
/* Góc cắt hairline thay cho khung xanh cũ */
.lp-br { position:relative; }
.lp-br::before, .lp-br::after {
  content:""; position:absolute; width:8px; height:8px;
  border:1.5px solid var(--ink); pointer-events:none; opacity:.55;
}
.lp-br::before { top:-1px; left:-1px; border-right:0; border-bottom:0; }
.lp-br::after { bottom:-1px; right:-1px; border-left:0; border-top:0; }

.lp-acc { color:var(--ink); }
.lp-ico {
  display:flex; height:48px; width:48px; align-items:center; justify-content:center;
  background:var(--mist); color:var(--ink); border-radius:14px;
}
/* Primary CTA — pill Lime, chữ Forest Ink */
.lp-btn {
  display:inline-flex; height:52px; align-items:center; justify-content:center; gap:8px;
  padding:0 28px; border-radius:9999px; background:var(--lime); color:var(--ink);
  font-weight:600; font-size:16px; border:0;
  transition:filter .18s, transform .18s;
}
.lp-btn:hover { filter:brightness(.94); transform:translateY(-1px); }
/* Secondary — pill outline Forest Ink */
.lp-btn-o {
  display:inline-flex; height:52px; align-items:center; justify-content:center; gap:6px;
  padding:0 26px; border-radius:9999px; border:1.5px solid var(--ink);
  background:var(--paper); color:var(--ink); font-weight:600; font-size:16px;
  transition:background .18s, color .18s;
}
.lp-btn-o:hover { background:var(--ink); color:var(--paper); }
/* CTA trên nền tối — pill Lime giữ nguyên */
.lp-btn-dark {
  display:inline-flex; height:52px; align-items:center; justify-content:center; gap:8px;
  padding:0 28px; border-radius:9999px; background:var(--lime); color:var(--ink);
  font-weight:600; font-size:16px; border:0;
  transition:filter .18s, transform .18s;
}
.lp-btn-dark:hover { filter:brightness(.94); transform:translateY(-1px); }

@keyframes lp-float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
@keyframes lp-pop { from { opacity:0; transform:translateY(14px) scale(.97); } to { opacity:1; transform:none; } }
@keyframes lp-rise { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
.lp-float { animation:lp-float 4.6s ease-in-out infinite; }
.lp-float2 { animation:lp-float 5.6s ease-in-out -2s infinite; }
.lp-pop { animation:lp-pop .55s cubic-bezier(.2,.8,.2,1) both; }
.lp-rise { animation:lp-rise .8s cubic-bezier(.2,.8,.2,1) both; }
.lp-d1 { animation-delay:.08s; } .lp-d2 { animation-delay:.18s; }
.lp-d3 { animation-delay:.3s; } .lp-d4 { animation-delay:.42s; }
`;
function Img3D({ name, Fallback, size = "h-24 w-24", shadow = true }) {
  const [ok, setOk] = useState(true);
  if (!ok) return <Fallback className="h-10 w-10 lp-acc" />;
  return (
    <img
      src={`${ICON_BASE}/${name}.png`}
      alt=""
      loading="lazy"
      className={`${size} object-contain ${shadow ? "drop-shadow-md" : ""}`}
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

// Tiêu đề mục — nhãn pill Linen Mist + Inter Black
function Head({ n, label, title, sub, center = true }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="lp-mono inline-block rounded-full bg-[var(--mist)] px-4 py-1.5 text-[11px] text-[var(--ink)]">
        <span className="opacity-50">{n} — </span>{label}
      </span>
      <h2 className="lp-display mt-5 text-[38px] sm:text-[56px]">{title}</h2>
      {sub && <p className="mt-4 text-[17px] leading-7 text-[var(--slate)]">{sub}</p>}
    </div>
  );
}

function FaqRow({ n, q, a, open, onToggle }) {
  return (
    <div className="border-b border-[var(--fog)]">
      <button onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-4 py-5 text-left">
        <span className="lp-mono w-9 shrink-0 text-[11px] text-[var(--pebble)]">{n}</span>
        <span className="flex-1 text-[17px] font-bold text-[var(--obsidian)]">{q}</span>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${open ? "rotate-45 border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]" : "border-[var(--fog)] text-[var(--pebble)]"}`}>
          <Plus size={16} />
        </span>
      </button>
      <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <p className="pb-5 pl-[52px] pr-10 text-[15px] leading-7 text-[var(--slate)]">{a}</p>
        </div>
      </div>
    </div>
  );
}

/* Khối minh hoạ đầu trang: 3 thẻ chuyển tự động */
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
      {/* Card lớn — radius 28px, surface Linen Mist, không grid nền */}
      <div className="relative overflow-hidden rounded-[28px] border border-[var(--mist)] bg-[var(--mist)] p-6 sm:p-9">
        <span className="lp-float lp-mono absolute left-3 top-3 rounded-full bg-[var(--paper)] px-3 py-1.5 text-[10.5px] text-[var(--ink)] shadow-sm">
          {c.facts[0][0]}
        </span>
        <span className="lp-float2 lp-mono absolute bottom-3 right-3 rounded-full bg-[var(--ink)] px-3 py-1.5 text-[10.5px] text-[var(--lime)] shadow-sm">
          {c.facts[1][0]}
        </span>
        <div key={i} className="lp-pop flex min-h-[300px] flex-col items-center justify-center text-center">
          <Img3D name={name} Fallback={Fb} size="h-32 w-32 sm:h-40 sm:w-40" />
          <h3 className="mt-6 max-w-sm text-xl font-bold tracking-tight text-[var(--obsidian)]">{f.title}</h3>
          <p className="mt-2 max-w-sm text-[14.5px] leading-6 text-[var(--slate)]">{f.body}</p>
        </div>
      </div>
      {/* Tab segmented pill — active = Lime fill */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {L.tabs.map(([n, label], k) => (
          <button
            key={n}
            onClick={() => { setI(k); setHold(true); }}
            className={`lp-mono rounded-full border px-2 py-3 text-[10.5px] transition ${
              k === i
                ? "border-[var(--lime)] bg-[var(--lime)] text-[var(--ink)]"
                : "border-[var(--fog)] bg-[var(--paper)] text-[var(--pebble)] hover:border-[var(--ink)]"
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
    h1b: "Đổi quà thật dễ!",
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

function Eyebrow({ label }) {
  return (
    <span className="lp-mono inline-block rounded-full bg-[var(--mist)] px-4 py-1.5 text-[11px] text-[var(--ink)]">
      {label}
    </span>
  );
}

const Row = ({ k, children }) => (
  <div className="flex justify-between gap-4 py-3.5">
    <dt className="text-[var(--pebble)]">{k}</dt>
    <dd className="text-right font-semibold text-[var(--obsidian)]">{children}</dd>
  </div>
);
 export default function CloudVIPLanding() {
  const { t, lang } = useI18n();
  const c = COPY[lang] || COPY.vi;
  const L = LABELS[lang] || LABELS.vi;
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);

  // Xử lý an toàn cho launched (string hoặc object)
  const launchedText =
    typeof SITE.launched === "object"
      ? SITE.launched[lang] || SITE.launched.vi
      : SITE.launched;

  const linkCls = "font-semibold text-[var(--ink)] hover:underline";

  return (
    <div className="lp min-h-screen bg-[var(--paper)]">
      <style>{CSS}</style>
      <LandingHeader />

      <main>
        {/* ============ HERO ============ */}
        <section className="relative overflow-hidden border-b border-[var(--fog)] bg-[var(--paper)]">
          <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-5 pb-16 pt-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:pb-24 lg:pt-20">
            <div>
              <span className="lp-mono lp-rise inline-block rounded-full bg-[var(--mist)] px-4 py-1.5 text-[11px] text-[var(--ink)]">
                {t("ld.badge")}
              </span>
              <h1 className="lp-display lp-display-xl lp-rise lp-d1 mt-7">
                {c.h1a}
                <span className="mt-1 block text-[var(--ink)]">{c.h1b}</span>
              </h1>
              <p className="lp-rise lp-d2 mt-7 max-w-lg text-[18px] leading-[1.5] text-[var(--slate)]">
                {c.heroSub}
              </p>
              <div className="lp-rise lp-d3 mt-9 flex flex-wrap gap-3">
                <button onClick={() => navigate("/register")} className="lp-btn">
                  {t("ld.ctaStart")} <ArrowRight size={17} />
                </button>
                <button onClick={() => scrollToId("how")} className="lp-btn-o">
                  {c.how} <ChevronDown size={16} />
                </button>
              </div>
              <ul className="lp-rise lp-d4 mt-8 space-y-2.5">
                {[t("ld.check1"), t("ld.check2"), t("ld.check3")].map((x) => (
                  <li key={x} className="flex items-center gap-2.5 text-[15px] text-[var(--charcoal)]">
                    <Check size={16} className="shrink-0 text-[var(--ink)]" /> {x}
                  </li>
                ))}
              </ul>
              <p className="mt-5 max-w-md text-[13px] leading-6 text-[var(--pebble)]">{c.note}</p>
            </div>
            <Showcase c={c} L={L} />
          </div>
        </section>

        {/* ============ SỐ LIỆU ============ */}
        <section className="mx-auto max-w-[1200px] px-5 py-14 sm:py-20">
          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {c.facts.map(([v, l], i) => (
              <Reveal key={i} className="h-full">
                <div className="h-full rounded-[10px] border border-[var(--fog)] bg-[var(--paper)] p-6">
                  <dt className="lp-display text-[44px] text-[var(--ink)] sm:text-[52px]">{v}</dt>
                  <dd className="lp-mono mt-3 text-[10.5px] leading-5 text-[var(--pebble)]">{l}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </section>

        {/* ============ TÍNH NĂNG ============ */}
        <section id="features" className="scroll-mt-20 border-y border-[var(--fog)] bg-[var(--fog)]/40">
          <div className="mx-auto max-w-[1200px] px-5 py-16 sm:py-24">
            <Head n="001" label={L.feat} title={c.featTitle} />
            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {c.features.map((f, i) => {
                const Icon = FEATURE_ICONS[i] || ListChecks;
                return (
                  <Reveal key={f.to} className="h-full">
                    <div className="h-full rounded-[10px] border border-[var(--fog)] bg-[var(--paper)] p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)]">
                      <div className="flex items-start justify-between">
                        <span className="lp-ico"><Icon size={22} /></span>
                        <span className="lp-mono text-[11px] text-[var(--pebble)]">0{i + 1}</span>
                      </div>
                      <h3 className="mt-6 text-xl font-bold tracking-tight text-[var(--obsidian)]">{f.title}</h3>
                      <p className="mt-2 text-[15px] leading-7 text-[var(--slate)]">{f.body}</p>
                      <Link to={f.to} className="mt-5 inline-flex items-center gap-1 text-[14px] font-semibold text-[var(--ink)] hover:underline">
                        {c.guide} <ArrowRight size={15} />
                      </Link>
                    </div>
                  </Reveal>
                );
              })}
            </div>
            <p className="lp-mono mt-10 text-center text-[11px] leading-6 text-[var(--pebble)]">{c.more}</p>
          </div>
        </section>

        {/* ============ CÁCH HOẠT ĐỘNG ============ */}
        <section id="how" className="scroll-mt-20">
          <div className="mx-auto max-w-[1200px] px-5 py-16 sm:py-24">
            <Head n="002" label={L.how} title={c.howTitle} />
            <ol className="mt-12 grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <li key={n}>
                  <Reveal className="h-full">
                    <div className="h-full rounded-[10px] border border-[var(--fog)] bg-[var(--paper)] p-7">
                      <span className="lp-display text-[72px] leading-none text-transparent [-webkit-text-stroke:1.5px_var(--lime)]">
                        0{n}
                      </span>
                      <h3 className="mt-3 text-xl font-bold text-[var(--obsidian)]">{t(`ld.s${n}t`)}</h3>
                      <p className="mt-2 text-[15px] leading-7 text-[var(--slate)]">{t(`ld.s${n}d`)}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ============ AN TOÀN ============ */}
        <section id="safety" className="scroll-mt-20 bg-[var(--paper)]">
          <div className="mx-auto max-w-[1200px] px-5 py-16 sm:py-24">
            <Head n="003" label={L.safe} title={t("ld.safeTitle")} sub={t("ld.safeSub")} />
            <Reveal>
              <div className="mt-12 rounded-[28px] bg-[var(--ink)] p-7 text-[var(--paper)] sm:p-12">
                <div className="grid gap-x-12 gap-y-9 sm:grid-cols-2">
                  {SAFETY.map(({ icon: Icon, t: tk, d }) => (
                    <div key={tk} className="flex gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[var(--lime)]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="font-bold text-[var(--paper)]">{t(tk)}</h3>
                        <p className="mt-1.5 text-[15px] leading-7 text-[#c9d3c6]">{t(d)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============ AI ĐỨNG SAU ============ */}
        <section className="border-y border-[var(--fog)] bg-[var(--fog)]/40">
          <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-16 sm:py-24 md:grid-cols-2 md:gap-14">
            <div>
              <Eyebrow label={L.who} />
              <h2 className="lp-display mt-5 text-[38px] sm:text-[52px]">{c.whoTitle}</h2>
              <p className="mt-4 max-w-md text-[16px] leading-7 text-[var(--slate)]">{c.whoBody}</p>
              <ul className="mt-6 space-y-3 text-[15px] text-[var(--charcoal)]">
                {c.whoPoints.map((p) => (
                  <li key={p} className="flex gap-3">
                    <Check size={17} className="mt-1 shrink-0 text-[var(--ink)]" />
                    {p}
                  </li>
                ))}
              </ul>
              <Link to="/about" className="mt-7 inline-flex items-center gap-1 text-[15px] font-semibold text-[var(--ink)] hover:underline">
                {c.whoMore} <ArrowRight size={15} />
              </Link>

              <div className="mt-8 border-t border-[var(--fog)] pt-5">
                <p className="lp-mono text-[11px] text-[var(--pebble)]">{c.whoLegal}</p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[14px]">
                  <Link to="/terms" className="text-[var(--charcoal)] underline-offset-4 hover:underline">
                    {lang === "en" ? "Terms of Service" : "Điều khoản sử dụng"}
                  </Link>
                  <Link to="/privacy" className="text-[var(--charcoal)] underline-offset-4 hover:underline">
                    {lang === "en" ? "Privacy Policy" : "Chính sách bảo mật"}
                  </Link>
                  <Link to="/refund" className="text-[var(--charcoal)] underline-offset-4 hover:underline">
                    {lang === "en" ? "Refund Policy" : "Chính sách hoàn tiền"}
                  </Link>
                </div>
              </div>
            </div>

            <Reveal>
              <dl className="divide-y divide-[var(--fog)] rounded-[10px] border border-[var(--fog)] bg-[var(--paper)] px-6 text-[15px]">
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

        {/* ============ FAQ ============ */}
        <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-16 sm:py-24">
          <Head n="004" label={L.faq} title={t("ld.faqTitle")} />
          <div className="mt-10 border-t border-[var(--fog)]">
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
        </section>

        {/* ============ KÊU GỌI CUỐI ============ */}
        <section className="mx-auto max-w-[1200px] px-5 pb-20 sm:pb-28">
          <Reveal>
            <div className="relative overflow-hidden rounded-[28px] bg-[var(--ink)] px-7 py-16 text-[var(--paper)] sm:px-14 sm:py-20">
              <Coins className="absolute -right-8 -top-8 h-56 w-56 rotate-12 text-[var(--lime)]/[0.08]" />
              <h2 className="lp-display relative max-w-2xl text-[42px] text-[var(--lime)] sm:text-[64px]">
                {c.ctaTitle}
              </h2>
              <p className="relative mt-5 max-w-lg text-[16px] leading-7 text-[#c9d3c6]">{t("ld.ctaSub")}</p>
              <div className="relative mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
                <button onClick={() => navigate("/register")} className="lp-btn-dark">
                  {t("ld.ctaReg")} <ArrowRight size={17} />
                </button>
                <button onClick={() => navigate("/login")} className="text-[15px] font-semibold text-[var(--paper)] underline-offset-4 hover:underline">
                  {t("ld.login")}
                </button>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <LandingFooter />
      <BackToTop />
    </div>
  );
                    }                                           }
