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

/* ===== Màu chủ đạo: --ac, --ac2, --soft (đang dùng xanh lá giống trang Đăng nhập/Đăng ký) =====
   Xanh lá (hiện tại):  #059669 / #047857 / #ecfdf5
   Xanh dương (cũ):     #2563eb / #1d4ed8 / #eff6ff */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@1,700;1,800&family=Roboto+Mono:wght@500;700&family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
.lp { --ac:#059669; --ac2:#047857; --soft:#ecfdf5; font-family:'Be Vietnam Pro',sans-serif; }
.lp-display { font-family:'Barlow Condensed','Be Vietnam Pro',sans-serif; font-style:italic; font-weight:800; text-transform:uppercase; letter-spacing:-.005em; line-height:1.02; }
.lp-mono { font-family:'Roboto Mono',ui-monospace,monospace; text-transform:uppercase; letter-spacing:.14em; }
.lp-br { position:relative; }
.lp-br::before, .lp-br::after { content:""; position:absolute; width:10px; height:10px; border:2px solid var(--ac); pointer-events:none; }
.lp-br::before { top:-2px; left:-2px; border-right:0; border-bottom:0; }
.lp-br::after { bottom:-2px; right:-2px; border-left:0; border-top:0; }
.lp-grid { background-color:#eaf6f2; background-image:linear-gradient(rgba(15,23,42,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(15,23,42,.06) 1px,transparent 1px); background-size:28px 28px; }
.lp-acc { color:var(--ac2); }
.lp-on { border-color:var(--ac) !important; color:var(--ac) !important; background:#fff !important; }
.lp-ico { display:flex; height:48px; width:48px; align-items:center; justify-content:center; background:var(--soft); color:var(--ac); }
.lp-outline { color:transparent; -webkit-text-stroke:1.5px var(--ac); }
.lp-btn { display:inline-flex; height:52px; align-items:center; justify-content:center; gap:8px; padding:0 26px; background:linear-gradient(90deg,var(--ac),#14b8a6); color:#fff; font-weight:700; font-size:15px; transition:filter .2s, transform .2s; }
.lp-btn:hover { filter:brightness(1.08); transform:translateY(-1px); }
.lp-btn-o { display:inline-flex; height:52px; align-items:center; justify-content:center; gap:6px; padding:0 26px; border:1px solid #cbd5e1; background:#fff; color:#334155; font-weight:700; font-size:15px; transition:border-color .2s,color .2s; }
.lp-btn-o:hover { border-color:var(--ac); color:var(--ac); }
@keyframes lp-float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
@keyframes lp-pop { from { opacity:0; transform:translateY(14px) scale(.97); } to { opacity:1; transform:none; } }
@keyframes lp-rise { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
.lp-float { animation:lp-float 4.6s ease-in-out infinite; }
.lp-float2 { animation:lp-float 5.6s ease-in-out -2s infinite; }
.lp-pop { animation:lp-pop .55s cubic-bezier(.2,.8,.2,1) both; }
.lp-rise { animation:lp-rise .8s cubic-bezier(.2,.8,.2,1) both; }
.lp-d1 { animation-delay:.08s; } .lp-d2 { animation-delay:.18s; } .lp-d3 { animation-delay:.3s; } .lp-d4 { animation-delay:.42s; }
`;

// Icon 3D trên Supabase, lỗi ảnh thì dùng icon dự phòng
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

// Khối hiện dần khi cuộn tới
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

// Tiêu đề mục: nhãn "00X — TÊN" trong khung góc + tiêu đề nghiêng in hoa
function Head({ n, label, title, sub, center = true }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="lp-br lp-mono lp-acc inline-block border border-slate-200 bg-white px-3.5 py-1.5 text-[11px] font-bold">
        <span className="opacity-50">{n} — </span>{label}
      </span>
      <h2 className="lp-display mt-5 text-[36px] text-slate-900 sm:text-5xl">{title}</h2>
      {sub && <p className="mt-3 text-[16px] leading-7 text-slate-600">{sub}</p>}
    </div>
  );
}

function FaqRow({ n, q, a, open, onToggle }) {
  return (
    <div className="border-b border-slate-200">
      <button onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-4 py-5 text-left">
        <span className="lp-mono w-9 shrink-0 text-[11px] font-bold text-slate-300">{n}</span>
        <span className="flex-1 text-[16px] font-bold text-slate-900">{q}</span>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center border transition ${open ? "lp-on rotate-45" : "border-slate-200 text-slate-400"}`}>
          <Plus size={16} />
        </span>
      </button>
      <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <p className="pb-5 pl-[52px] pr-10 text-[15px] leading-7 text-slate-600">{a}</p>
        </div>
      </div>
    </div>
  );
}

/* Khối minh hoạ đầu trang: 3 thẻ chuyển tự động (như trang mẫu) */
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
      <div className="lp-br lp-grid relative overflow-hidden border border-slate-200 p-6 sm:p-9">
        <span className="lp-float lp-mono absolute left-3 top-3 border border-slate-200 bg-white px-2.5 py-1.5 text-[10.5px] font-bold lp-acc shadow-sm">
          {c.facts[0][0]}
        </span>
        <span className="lp-float2 lp-mono absolute bottom-3 right-3 border border-slate-200 bg-white px-2.5 py-1.5 text-[10.5px] font-bold lp-acc shadow-sm">
          {c.facts[1][0]}
        </span>
        <div key={i} className="lp-pop flex min-h-[300px] flex-col items-center justify-center text-center">
          <Img3D name={name} Fallback={Fb} size="h-32 w-32 sm:h-40 sm:w-40" />
          <h3 className="mt-5 max-w-sm text-xl font-bold tracking-tight text-slate-900">{f.title}</h3>
          <p className="mt-2 max-w-sm text-[14.5px] leading-6 text-slate-600">{f.body}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {L.tabs.map(([n, label], k) => (
          <button
            key={n}
            onClick={() => { setI(k); setHold(true); }}
            className={`lp-br lp-mono border border-slate-200 bg-white/70 px-2 py-3 text-[10.5px] font-bold text-slate-400 transition ${k === i ? "lp-on" : ""}`}
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


function Eyebrow({ label }) {
  return (
    <span className="lp-br lp-mono lp-acc inline-block border border-slate-200 bg-white px-3.5 py-1.5 text-[11px] font-bold">
      {label}
    </span>
  );
}

const Row = ({ k, children }) => (
  <div className="flex justify-between gap-4 py-3.5">
    <dt className="text-slate-500">{k}</dt>
    <dd className="text-right font-semibold text-slate-900">{children}</dd>
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

  const linkCls = "font-semibold lp-acc hover:underline";

  return (
    <div className="lp min-h-screen bg-white text-slate-900">
      <style>{CSS}</style>
      <LandingHeader />

      <main>
        {/* ============ ĐẦU TRANG ============ */}
        <section className="lp-grid relative border-b border-slate-200">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:pb-24 lg:pt-20">
            <div>
              <span className="lp-br lp-mono lp-acc lp-rise inline-block border border-slate-200 bg-white px-3.5 py-1.5 text-[11px] font-bold">
                {t("ld.badge")}
              </span>
              <h1 className="lp-display lp-rise lp-d1 mt-6 text-[46px] text-slate-900 sm:text-6xl lg:text-[76px]">
                {c.h1a}
                <span className="lp-acc mt-1 block">
                  {c.h1b}
                </span>
              </h1>
              <p className="lp-rise lp-d2 mt-6 max-w-lg text-[17px] leading-8 text-slate-600">{c.heroSub}</p>
              <div className="lp-rise lp-d3 mt-8 flex flex-wrap gap-3">
                <button onClick={() => navigate("/register")} className="lp-btn lp-br">
                  {t("ld.ctaStart")} <ArrowRight size={17} />
                </button>
                <button onClick={() => scrollToId("how")} className="lp-btn-o">
                  {c.how} <ChevronDown size={16} />
                </button>
              </div>
              <ul className="lp-rise lp-d4 mt-7 space-y-2">
                {[t("ld.check1"), t("ld.check2"), t("ld.check3")].map((x) => (
                  <li key={x} className="flex items-center gap-2.5 text-[14.5px] text-slate-600">
                    <Check size={16} className="lp-acc shrink-0" /> {x}
                  </li>
                ))}
              </ul>
              <p className="mt-4 max-w-md text-[13px] leading-6 text-slate-500">{c.note}</p>
            </div>
            <Showcase c={c} L={L} />
          </div>
        </section>

        {/* ============ SỐ LIỆU ============ */}
        <section className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {c.facts.map(([v, l], i) => (
              <Reveal key={i} className="h-full">
                <div className="lp-br h-full border border-slate-200 bg-white p-5">
                  <dt className="lp-display lp-acc text-4xl sm:text-5xl">{v}</dt>
                  <dd className="lp-mono mt-3 text-[10.5px] font-bold leading-5 text-slate-500">{l}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </section>

        {/* ============ TÍNH NĂNG ============ */}
        <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-14 sm:py-20">
          <Head n="001" label={L.feat} title={c.featTitle} />
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {c.features.map((f, i) => {
              const Icon = FEATURE_ICONS[i] || ListChecks;
              return (
                <Reveal key={f.to} className="h-full">
                  <div className="lp-br h-full border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70 sm:p-7">
                    <div className="flex items-start justify-between">
                      <span className="lp-ico"><Icon size={22} /></span>
                      <span className="lp-mono text-[11px] font-bold text-slate-300">0{i + 1}</span>
                    </div>
                    <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-900">{f.title}</h3>
                    <p className="mt-2 text-[15px] leading-7 text-slate-600">{f.body}</p>
                    <Link to={f.to} className="mt-5 inline-flex items-center gap-1 text-[14px] font-semibold lp-acc hover:underline">
                      {c.guide} <ArrowRight size={15} />
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <p className="lp-mono mt-8 text-center text-[11px] font-bold leading-6 text-slate-400">{c.more}</p>
        </section>

        {/* ============ CÁCH HOẠT ĐỘNG ============ */}
        <section id="how" className="lp-grid scroll-mt-20 border-y border-slate-200">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
            <Head n="002" label={L.how} title={c.howTitle} />
            <ol className="mt-12 grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <li key={n}>
                  <Reveal className="h-full">
                    <div className="lp-br h-full border border-slate-200 bg-white p-6 sm:p-7">
                      <span className="lp-display lp-outline text-7xl">0{n}</span>
                      <h3 className="mt-3 text-xl font-bold text-slate-900">{t(`ld.s${n}t`)}</h3>
                      <p className="mt-2 text-[15px] leading-7 text-slate-600">{t(`ld.s${n}d`)}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

         {/* ============ AN TOÀN ============ */}
        <section id="safety" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-14 sm:py-20">
          <Head n="003" label={L.safe} title={t("ld.safeTitle")} sub={t("ld.safeSub")} />
          <Reveal>
            <div className="lp-br mt-12 bg-[#0b2e27] p-6 text-white sm:p-10">
              <div className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
                {SAFETY.map(({ icon: Icon, t: tk, d }) => (
                  <div key={tk} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/15 bg-white/5 text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-bold">{t(tk)}</h3>
                      <p className="mt-1.5 text-[15px] leading-7 text-slate-300">{t(d)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* ============ AI ĐỨNG SAU ============ */}
        <section className="lp-grid border-y border-slate-200">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:py-20 md:grid-cols-2 md:gap-14">
            <div>
              <Eyebrow label={L.who} />
              <h2 className="lp-display mt-5 text-[34px] text-slate-900 sm:text-5xl">{c.whoTitle}</h2>
              <p className="mt-4 max-w-md text-[16px] leading-7 text-slate-600">{c.whoBody}</p>
              <ul className="mt-5 space-y-2.5 text-[15px] text-slate-700">
                {c.whoPoints.map((p) => (
                  <li key={p} className="flex gap-3">
                    <Check size={17} className="mt-1 shrink-0 lp-acc" />
                    {p}
                  </li>
                ))}
              </ul>
              <Link to="/about" className="mt-6 inline-flex items-center gap-1 text-[15px] font-semibold lp-acc hover:underline">
                {c.whoMore} <ArrowRight size={15} />
              </Link>

              <div className="mt-8 border-t border-slate-200 pt-5">
                <p className="lp-mono text-[11px] font-bold text-slate-500">{c.whoLegal}</p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[14px]">
                  <Link to="/terms" className="text-slate-700 underline-offset-4 hover:underline">
                    {lang === "en" ? "Terms of Service" : "Điều khoản sử dụng"}
                  </Link>
                  <Link to="/privacy" className="text-slate-700 underline-offset-4 hover:underline">
                    {lang === "en" ? "Privacy Policy" : "Chính sách bảo mật"}
                  </Link>
                  <Link to="/refund" className="text-slate-700 underline-offset-4 hover:underline">
                    {lang === "en" ? "Refund Policy" : "Chính sách hoàn tiền"}
                  </Link>
                </div>
              </div>
            </div>

            <Reveal>
              <dl className="lp-br divide-y divide-slate-200 border border-slate-200 bg-white px-5 text-[15px]">
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
        <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-14 sm:py-20">
          <Head n="004" label={L.faq} title={t("ld.faqTitle")} />
          <div className="mt-10 border-t border-slate-200">
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
        <section className="mx-auto max-w-6xl px-5 pb-16 sm:pb-24">
          <Reveal>
            <div className="lp-br relative overflow-hidden bg-[#0b2e27] px-6 py-14 text-white sm:px-14 sm:py-20">
              <Coins className="absolute -right-6 -top-6 h-52 w-52 rotate-12 text-white/[0.05]" />
              <h2 className="lp-display relative max-w-2xl text-[40px] sm:text-6xl">{c.ctaTitle}</h2>
              <p className="relative mt-4 max-w-lg text-[16px] leading-7 text-slate-300">{t("ld.ctaSub")}</p>
              <div className="relative mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
                <button onClick={() => navigate("/register")} className="lp-btn lp-br">
                  {t("ld.ctaReg")} <ArrowRight size={17} />
                </button>
                <button onClick={() => navigate("/login")} className="text-[15px] font-semibold text-white underline-offset-4 hover:underline">
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
                                            }
