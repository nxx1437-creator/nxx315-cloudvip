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

/* ===== Apple (España) design tokens =====
   Ink #1d1d1f · Fog #f5f5f7 · White #ffffff · Slate #86868b
   Blue #0071e3 (chỉ dùng cho CTA) · Link #0066cc */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;600&family=Inter:wght@400;600&display=swap');
.lp {
  --ink:#1d1d1f; --fog:#f5f5f7; --white:#ffffff; --ash:#e8e8ed;
  --graphite:#707070; --slate:#86868b; --blue:#0071e3; --link:#0066cc;
  font-family:'Inter',ui-sans-serif,system-ui,-apple-system,sans-serif;
  color:var(--ink);
  background:var(--fog);
  -webkit-font-smoothing:antialiased;
}
/* Display — SF Pro Display 600 */
.lp-display {
  font-family:'Inter Tight','Inter',sans-serif;
  font-weight:600;
  letter-spacing:-0.015em;
  line-height:1.07;
  color:var(--ink);
}
.lp-display-xl {
  font-size:clamp(52px,8vw,96px);
  letter-spacing:-0.02em;
  line-height:1.02;
  font-weight:600;
}
.lp-mono {
  font-family:'Inter',sans-serif;
  text-transform:uppercase; letter-spacing:.06em; font-weight:600;
}
.lp-acc { color:var(--ink); }

/* CTA — Electric Blue duy nhất */
.lp-btn {
  display:inline-flex; height:48px; align-items:center; justify-content:center; gap:8px;
  padding:0 24px; border-radius:980px;
  background:var(--blue); color:#fff;
  font-weight:400; font-size:17px; border:0;
  transition:opacity .2s, transform .2s;
}
.lp-btn:hover { opacity:.9; transform:translateY(-1px); }
/* Ghost — viền Ink */
.lp-btn-o {
  display:inline-flex; height:48px; align-items:center; justify-content:center; gap:6px;
  padding:0 24px; border-radius:980px;
  border:1px solid var(--ink); background:transparent; color:var(--ink);
  font-weight:400; font-size:17px;
  transition:background .2s, color .2s;
}
.lp-btn-o:hover { background:var(--ink); color:#fff; }

@keyframes lp-float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
@keyframes lp-pop { from { opacity:0; transform:translateY(14px) scale(.97); } to { opacity:1; transform:none; } }
@keyframes lp-rise { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
.lp-float { animation:lp-float 6s ease-in-out infinite; }
.lp-float2 { animation:lp-float 7s ease-in-out -2s infinite; }
.lp-pop { animation:lp-pop .55s cubic-bezier(.2,.8,.2,1) both; }
.lp-rise { animation:lp-rise .8s cubic-bezier(.2,.8,.2,1) both; }
.lp-d1 { animation-delay:.08s; } .lp-d2 { animation-delay:.18s; }
.lp-d3 { animation-delay:.3s; } .lp-d4 { animation-delay:.42s; }
`;
function Img3D({ name, Fallback, size = "h-24 w-24", shadow = true }) {
  const [ok, setOk] = useState(true);
  if (!ok) return <Fallback className="h-10 w-10 text-[var(--slate)]" strokeWidth={1.25} />;
  return (
    <img
      src={`${ICON_BASE}/${name}.png`}
      alt=""
      loading="lazy"
      className={`${size} object-contain ${shadow ? "drop-shadow-[0_20px_40px_rgba(0,0,0,0.12)]" : ""}`}
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

function Head({ n, label, title, sub, center = true }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <span className="lp-mono text-[12px] text-[var(--slate)]">{n} — {label}</span>
      <h2 className="lp-display mt-3 text-[32px] sm:text-[48px]">{title}</h2>
      {sub && <p className="mt-4 text-[17px] leading-[1.47] text-[var(--graphite)]">{sub}</p>}
    </div>
  );
}

function FaqRow({ n, q, a, open, onToggle }) {
  return (
    <div className="border-b border-[var(--ash)]">
      <button onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-4 py-5 text-left">
        <span className="lp-mono w-10 shrink-0 text-[12px] text-[var(--slate)]">{n}</span>
        <span className="flex-1 text-[17px] font-semibold text-[var(--ink)]">{q}</span>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${open ? "rotate-45 border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--ash)] text-[var(--slate)]"}`}>
          <Plus size={16} strokeWidth={1.5} />
        </span>
      </button>
      <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <p className="pb-5 pl-[56px] pr-10 text-[17px] leading-[1.47] text-[var(--graphite)]">{a}</p>
        </div>
      </div>
    </div>
  );
}

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
      <div className="relative overflow-hidden rounded-[28px] bg-[var(--white)] p-8 sm:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div key={i} className="lp-pop flex min-h-[340px] flex-col items-center justify-center text-center">
          <div className="lp-float">
            <Img3D name={name} Fallback={Fb} size="h-40 w-40 sm:h-52 sm:w-52" />
          </div>
          <h3 className="mt-8 max-w-sm text-[24px] font-semibold leading-[1.19] text-[var(--ink)]">
            {f.title}
          </h3>
          <p className="mt-3 max-w-sm text-[17px] leading-[1.47] text-[var(--graphite)]">{f.body}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {L.tabs.map(([n, label], k) => (
          <button
            key={n}
            onClick={() => { setI(k); setHold(true); }}
            className={`lp-mono rounded-full px-2 py-3 text-[11px] transition ${
              k === i
                ? "bg-[var(--ink)] text-white"
                : "border border-[var(--ash)] bg-[var(--white)] text-[var(--slate)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
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
    h1a: "Làm nhiệm vụ",
    h1b: "Nhận Coin ngay",
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
  },
  en: {
    feat: "FEATURES", how: "HOW IT WORKS", safe: "SAFETY", who: "TRANSPARENCY", faq: "FAQ",
    tabs: [["01", "TASKS"], ["02", "REDEEM"], ["03", "WITHDRAW"]],
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

function Eyebrow({ label }) {
  return <span className="lp-mono text-[12px] text-[var(--slate)]">{label}</span>;
}

const Row = ({ k, children }) => (
  <div className="flex justify-between gap-4 border-b border-[var(--ash)] py-4 last:border-b-0">
    <dt className="text-[15px] text-[var(--slate)]">{k}</dt>
    <dd className="text-right text-[15px] font-semibold text-[var(--ink)]">{children}</dd>
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

  const linkCls = "text-[var(--ink)] underline-offset-4 hover:text-[var(--link)] hover:underline";

  return (
    <div className="lp min-h-screen bg-[var(--fog)]">
      <style>{CSS}</style>
      <LandingHeader />

      <main>
        {/* ============ HERO (Apple style) ============ */}
        <section className="relative overflow-hidden bg-[var(--fog)] pt-16 lg:pt-24 pb-20">
          <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-5 lg:grid-cols-2 lg:gap-20">
            <div>
              <span className="lp-mono lp-rise text-[12px] text-[var(--slate)]">
                {t("ld.badge")}
              </span>
              <h1 className="lp-display lp-display-xl lp-rise lp-d1 mt-4 text-[var(--ink)]">
                {c.h1a} <br /> {c.h1b}
              </h1>
              <p className="lp-rise lp-d2 mt-6 max-w-lg text-[20px] leading-[1.47] text-[var(--graphite)]">
                {c.heroSub}
              </p>
              <div className="lp-rise lp-d3 mt-8 flex flex-wrap gap-4">
                <button onClick={() => navigate("/register")} className="lp-btn">
                  {t("ld.ctaStart")} <ArrowRight size={18} />
                </button>
                <button onClick={() => scrollToId("how")} className="lp-btn-o">
                  {c.how} <ChevronDown size={18} />
                </button>
              </div>
              <ul className="lp-rise lp-d4 mt-10 space-y-3">
                {[t("ld.check1"), t("ld.check2"), t("ld.check3")].map((x) => (
                  <li key={x} className="flex items-center gap-3 text-[17px] text-[var(--ink)]">
                    <Check size={18} strokeWidth={2} className="shrink-0 text-[var(--blue)]" /> {x}
                  </li>
                ))}
              </ul>
              <p className="mt-6 max-w-md text-[14px] leading-[1.5] text-[var(--slate)]">{c.note}</p>
            </div>

            {/* KHỐI GIF/VIDEO BÊN PHẢI */}
            <div className="lp-rise lp-d2 flex items-center justify-center">
              {/* 👇👇👇 DÁN LINK GIF VÀO ĐÂY 👇👇👇 */}
              <img
                src="https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/Hero.gif"
                alt="Hero visual"
                className="w-full max-w-[600px] rounded-[28px] object-cover"
              />
              {/* 👆👆👆 HẾT SLOT GIF 👆👆👆 */}
            </div>
          </div>
        </section>

        {/* ============ SỐ LIỆU ============ */}
        <section className="bg-[var(--fog)]">
          <div className="mx-auto max-w-[1200px] px-5 py-16 sm:py-24">
            <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {c.facts.map(([v, l], i) => (
                <Reveal key={i} className="h-full">
                  <div className="h-full rounded-[28px] bg-[var(--white)] p-8">
                    <dt className="lp-display text-[36px] text-[var(--ink)] sm:text-[44px]">{v}</dt>
                    <dd className="lp-mono mt-3 text-[11px] leading-5 text-[var(--slate)]">{l}</dd>
                  </div>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>

        {/* ============ TÍNH NĂNG ============ */}
        <section id="features" className="scroll-mt-20 bg-[var(--white)]">
          <div className="mx-auto max-w-[1200px] px-5 py-20 sm:py-32">
            <Head n="001" label={L.feat} title={c.featTitle} />
            <div className="mt-16 grid gap-6 md:grid-cols-2">
              {c.features.map((f, i) => {
                const Icon = FEATURE_ICONS[i] || ListChecks;
                return (
                  <Reveal key={f.to} className="h-full">
                    <div className="h-full rounded-[28px] bg-[var(--fog)] p-8 sm:p-10">
                      <div className="flex items-start justify-between">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--white)] text-[var(--ink)]">
                          <Icon size={24} strokeWidth={1.5} />
                        </span>
                        <span className="lp-mono text-[11px] text-[var(--slate)]">0{i + 1}</span>
                      </div>
                      <h3 className="mt-8 text-[24px] font-semibold leading-[1.19] text-[var(--ink)]">
                        {f.title}
                      </h3>
                      <p className="mt-3 text-[17px] leading-[1.47] text-[var(--graphite)]">{f.body}</p>
                      <Link to={f.to} className="mt-6 inline-flex items-center gap-1 text-[17px] text-[var(--link)] hover:underline">
                        {c.guide} <ArrowRight size={16} />
                      </Link>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============ CÁCH HOẠT ĐỘNG ============ */}
        <section id="how" className="scroll-mt-20 bg-[var(--fog)]">
          <div className="mx-auto max-w-[1200px] px-5 py-20 sm:py-32">
            <Head n="002" label={L.how} title={c.howTitle} />
            <ol className="mt-16 grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <li key={n}>
                  <Reveal className="h-full">
                    <div className="h-full rounded-[28px] bg-[var(--white)] p-8 sm:p-10">
                      <span className="lp-display text-[56px] leading-none text-[var(--ash)]">
                        0{n}
                      </span>
                      <h3 className="mt-6 text-[24px] font-semibold leading-[1.19] text-[var(--ink)]">
                        {t(`ld.s${n}t`)}
                      </h3>
                      <p className="mt-3 text-[17px] leading-[1.47] text-[var(--graphite)]">{t(`ld.s${n}d`)}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ============ AN TOÀN ============ */}
        <section id="safety" className="scroll-mt-20 bg-[var(--white)]">
          <div className="mx-auto max-w-[1200px] px-5 py-20 sm:py-32">
            <Head n="003" label={L.safe} title={t("ld.safeTitle")} sub={t("ld.safeSub")} />
            <Reveal>
              <div className="mt-16 rounded-[28px] bg-[var(--fog)] p-8 sm:p-14">
                <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
                  {SAFETY.map(({ icon: Icon, t: tk, d }) => (
                    <div key={tk} className="flex gap-5">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--white)] text-[var(--ink)]">
                        <Icon className="h-6 w-6" strokeWidth={1.5} />
                      </span>
                      <div>
                        <h3 className="text-[19px] font-semibold text-[var(--ink)]">{t(tk)}</h3>
                        <p className="mt-2 text-[17px] leading-[1.47] text-[var(--graphite)]">{t(d)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============ AI ĐỨNG SAU ============ */}
        <section className="bg-[var(--fog)]">
          <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-20 sm:py-32 md:grid-cols-2 md:gap-20">
            <div>
              <Eyebrow label={L.who} />
              <h2 className="lp-display mt-4 text-[36px] sm:text-[48px]">{c.whoTitle}</h2>
              <p className="mt-5 max-w-md text-[17px] leading-[1.47] text-[var(--graphite)]">{c.whoBody}</p>
              <ul className="mt-6 space-y-3 text-[17px] text-[var(--ink)]">
                {c.whoPoints.map((p) => (
                  <li key={p} className="flex gap-3">
                    <Check size={18} strokeWidth={2} className="mt-1 shrink-0 text-[var(--blue)]" />
                    <span className="text-[var(--graphite)]">{p}</span>
                  </li>
                ))}
              </ul>
              <Link to="/about" className="mt-6 inline-flex items-center gap-1 text-[17px] text-[var(--link)] hover:underline">
                {c.whoMore} <ArrowRight size={16} />
              </Link>

              <div className="mt-10 border-t border-[var(--ash)] pt-6">
                <p className="lp-mono text-[11px] text-[var(--slate)]">{c.whoLegal}</p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
                  <Link to="/terms" className="text-[var(--graphite)] hover:text-[var(--link)] hover:underline">
                    {lang === "en" ? "Terms of Service" : "Điều khoản sử dụng"}
                  </Link>
                  <Link to="/privacy" className="text-[var(--graphite)] hover:text-[var(--link)] hover:underline">
                    {lang === "en" ? "Privacy Policy" : "Chính sách bảo mật"}
                  </Link>
                  <Link to="/refund" className="text-[var(--graphite)] hover:text-[var(--link)] hover:underline">
                    {lang === "en" ? "Refund Policy" : "Chính sách hoàn tiền"}
                  </Link>
                </div>
              </div>
            </div>

            <Reveal>
              <dl className="rounded-[28px] bg-[var(--white)] px-7 py-2">
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
        <section id="faq" className="scroll-mt-20 bg-[var(--white)]">
          <div className="mx-auto max-w-3xl px-5 py-20 sm:py-32">
            <Head n="004" label={L.faq} title={t("ld.faqTitle")} />
            <div className="mt-12 border-t border-[var(--ash)]">
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

        {/* ============ KÊU GỌI CUỐI ============ */}
        <section className="bg-[var(--fog)]">
          <div className="mx-auto max-w-[1200px] px-5 py-20 text-center sm:py-32">
            <Reveal>
              <Coins
                className="pointer-events-none mx-auto mb-8 h-20 w-20 text-[var(--ash)]"
                strokeWidth={1.5}
              />
              <h2 className="lp-display mx-auto max-w-2xl text-[40px] sm:text-[64px]">
                {c.ctaTitle}
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-[17px] leading-[1.47] text-[var(--graphite)]">
                {t("ld.ctaSub")}
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
                <button onClick={() => navigate("/register")} className="lp-btn">
                  {t("ld.ctaReg")} <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="text-[17px] text-[var(--ink)] hover:text-[var(--link)] hover:underline"
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
