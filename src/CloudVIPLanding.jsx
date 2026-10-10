import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Check,
  ListChecks,
  Coins,
  Link2,
  UserPlus,
  Zap,
  Gift,
  Lock,
  ShieldCheck,
  Bot,
  KeyRound,
} from "lucide-react";
import {
  SafetyCard,
  FAQItem,
  DOT_BG,
  primaryBtn,
} from "./components/LandingKit.jsx";
import {
  PvStore,
  PvCheckin,
  PvGames,
  PvRefer,
} from "./components/LandingPreviews.jsx";
import {
  Reveal,
  Eyebrow,
  TwoTone,
  IconTile,
  PhoneMock,
  FeatureCard,
  PvTasks,
  PvWeek,
  ProgressBar,
  StepCard,
  Connector,
  StickyCta,
} from "./components/LandingAstra.jsx";
import {
  LandingHeader,
  LandingFooter,
  BackToTop,
  scrollToId,
} from "./components/LandingChrome.jsx";
import { useI18n } from "./i18n/index.js";

const COPY = {
  vi: {
    phoneCap: "Làm nhiệm vụ. Nhận xu. Đổi quà.",
    tiles: ["Nhiệm vụ mỗi ngày", "Xu & điểm danh", "Mời bạn bè"],
    featEyebrow: "Tính năng",
    featDim: "Mọi thứ bạn cần",
    featStrong: "để kiếm xu mỗi ngày.",
    cards: [
      ["Làm nhiệm vụ mỗi ngày,", "nhận xu nhanh gọn."],
      ["Đổi xu lấy quà game,", "không cần nạp tiền."],
      ["Điểm danh 7 ngày,", "xu tăng dần mỗi ngày."],
      ["Nghỉ giải lao với", "minigame may mắn."],
      ["Thấy xu của bạn", "tăng qua từng ngày."],
      ["Mời bạn bè,", "nhận hoa hồng 15%."],
    ],
    store: ["Robux", "Quân Huy", "Kim cương"],
    week: {
      title: "Xu kiếm được",
      range: "7 ngày qua",
      days: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    },
    howEyebrow: "Cách hoạt động",
    howDim: "Từ đăng ký đến",
    howStrong: "nhận quà chỉ 3 bước.",
    step: "Bước",
    progress: "Hoàn thành 100%",
    safeEyebrow: "An toàn",
    ctaDim: "Sẵn sàng kiếm xu?",
    ctaStrong: "Bắt đầu miễn phí.",
  },
  en: {
    phoneCap: "Do tasks. Earn coins. Redeem rewards.",
    tiles: ["Daily tasks", "Coins & check-in", "Invite friends"],
    featEyebrow: "Features",
    featDim: "Everything you need",
    featStrong: "to earn coins every day.",
    cards: [
      ["Do tasks every day,", "earn coins fast."],
      ["Redeem coins for game gifts,", "no top-up needed."],
      ["Check in for 7 days,", "rewards grow daily."],
      ["Take a break with", "lucky minigames."],
      ["Watch your coins", "grow day by day."],
      ["Invite friends,", "earn 15% commission."],
    ],
    store: ["Robux", "Quân Huy", "Diamonds"],
    week: {
      title: "Coins earned",
      range: "Last 7 days",
      days: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    },
    howEyebrow: "How it works",
    howDim: "From sign-up to",
    howStrong: "rewards in 3 steps.",
    step: "Step",
    progress: "Complete 100%",
    safeEyebrow: "Safety",
    ctaDim: "Ready to earn coins?",
    ctaStrong: "Start for free.",
  },
};

const FAQ_ORDER = [1, 2, 7, 3, 4, 5, 6];
const SAFETY = [
  { icon: Lock, t: "ld.b1t", d: "ld.b1d" },
  { icon: ShieldCheck, t: "ld.b2t", d: "ld.b2d" },
  { icon: Bot, t: "ld.b3t", d: "ld.b3d" },
  { icon: KeyRound, t: "ld.b4t", d: "ld.b4d" },
];

export default function CloudVIPLanding() {
  const { t, lang } = useI18n();
  const c = COPY[lang] || COPY.vi;
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);

  const cards = [
    { v: <PvTasks />, d: t("ld.s2d") },
    { v: <PvStore labels={c.store} />, d: t("ld.f7d") },
    { v: <PvCheckin />, d: t("ld.f1d") },
    { v: <PvGames labels={[t("dash.wheel"), t("dash.scratch"), t("dash.dice")]} />, d: t("ld.f3d") },
    { v: <PvWeek {...c.week} />, d: t("ld.f4d") },
    { v: <PvRefer />, d: t("ld.f5d") },
  ];

  const steps = [
    { icon: UserPlus, k: "ld.s1t" },
    { icon: Zap, k: "ld.s2t" },
    { icon: Gift, k: "ld.s3t" },
  ];

  return (
    <div className="min-h-screen bg-white pb-28 font-['Be_Vietnam_Pro',sans-serif] text-slate-900 md:pb-0">
      <LandingHeader />

      <main>
        {/* ============ HERO ============ */}
        <section className="relative overflow-hidden px-5 pb-6 pt-10 text-center sm:pt-16">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              ...DOT_BG,
              WebkitMaskImage:
                "radial-gradient(ellipse at 50% 25%, black, transparent 70%)",
              maskImage:
                "radial-gradient(ellipse at 50% 25%, black, transparent 70%)",
            }}
          />
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-sky-200/40 blur-3xl" />

          <div className="relative mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-4 py-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-600 shadow-sm sm:text-[11px]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              {t("ld.badge")}
            </span>

            <h1 className="mt-6 text-[38px] font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
              <span className="block text-slate-400">{t("ld.h1a")}</span>
              <span className="block text-slate-900">{t("ld.h1b")}</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-slate-500 sm:text-base">
              {t("ld.heroSub")}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate("/register")}
                className={primaryBtn}
              >
                {t("ld.ctaStart")} <ArrowRight size={16} />
              </button>
              <button
                onClick={() => scrollToId("how")}
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-blue-500 bg-white px-7 py-3.5 text-[14px] font-bold text-slate-900 transition hover:bg-blue-50 active:scale-[0.98]"
              >
                {t("ld.ctaHow")}
                <Sparkles size={15} className="text-amber-500" />
              </button>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {["ld.check1", "ld.check2", "ld.check3"].map((k) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600"
                >
                  <Check size={13} className="text-emerald-500" />
                  {t(k)}
                </span>
              ))}
            </div>
          </div>

          <PhoneMock caption={c.phoneCap} />
        </section>

        {/* 3 ô icon 3D (ảnh trên Supabase) */}
        <div className="relative z-10 mx-auto -mt-14 grid max-w-md grid-cols-3 gap-4 px-5">
          <IconTile name="icon-task" Fallback={ListChecks} label={c.tiles[0]} />
          <IconTile name="icon-coin" Fallback={Coins} label={c.tiles[1]} />
          <IconTile name="icon-link" Fallback={Link2} label={c.tiles[2]} />
        </div>

        <div className="mx-auto mt-10 h-16 w-px bg-gradient-to-b from-slate-300 to-transparent" />

        {/* ============ TÍNH NĂNG ============ */}
        <section
          id="features"
          className="mx-auto max-w-5xl scroll-mt-24 px-5 py-14 sm:py-20"
        >
          <Reveal>
            <Eyebrow>{c.featEyebrow}</Eyebrow>
            <TwoTone
              dim={c.featDim}
              strong={c.featStrong}
              className="mx-auto mt-4 max-w-2xl"
            />
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {cards.map((card, i) => (
              <FeatureCard
                key={i}
                dim={c.cards[i][0]}
                strong={c.cards[i][1]}
                desc={card.d}
              >
                {card.v}
              </FeatureCard>
            ))}
          </div>
        </section>

        {/* ============ CÁCH HOẠT ĐỘNG ============ */}
        <section
          id="how"
          className="scroll-mt-24 border-y border-slate-200 bg-slate-50/70"
        >
          <div className="mx-auto max-w-xl px-5 py-16 sm:py-24">
            <Reveal>
              <Eyebrow>{c.howEyebrow}</Eyebrow>
              <TwoTone
                dim={c.howDim}
                strong={c.howStrong}
                className="mt-4"
              />
            </Reveal>

            <div className="mt-12">
              <ProgressBar label={c.progress} />
              <Connector />
              {steps.map(({ icon, k }, i) => (
                <div key={k}>
                  <StepCard
                    n={String(i + 1).padStart(2, "0")}
                    label={c.step}
                    title={t(k)}
                    Icon={icon}
                  />
                  {i < steps.length - 1 && <Connector />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ AN TOÀN ============ */}
        <section
          id="safety"
          className="mx-auto max-w-5xl scroll-mt-24 px-5 py-16 sm:py-24"
        >
          <Reveal>
            <Eyebrow>{c.safeEyebrow}</Eyebrow>
            <h2 className="mx-auto mt-4 max-w-2xl text-center text-[30px] font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl">
              {t("ld.safeTitle")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-[15px] leading-7 text-slate-500">
              {t("ld.safeSub")}
            </p>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {SAFETY.map(({ icon, t: tk, d }) => (
              <Reveal key={tk}>
                <SafetyCard icon={icon} title={t(tk)} desc={t(d)} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section
          id="faq"
          className="scroll-mt-24 border-t border-slate-200 bg-slate-50/70"
        >
          <div className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
            <Reveal>
              <Eyebrow>{t("ld.nav.faq")}</Eyebrow>
              <h2 className="mx-auto mt-4 max-w-2xl text-center text-[30px] font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl">
                {t("ld.faqTitle")}
              </h2>
            </Reveal>
            <div className="mt-10 space-y-3">
              {FAQ_ORDER.map((i, idx) => (
                <FAQItem
                  key={i}
                  q={t(`ld.faq${i}q`)}
                  a={t(`ld.faq${i}a`)}
                  open={openFaq === idx}
                  onToggle={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ============ CTA CUỐI ============ */}
        <section className="mx-auto max-w-4xl px-5 py-16 sm:py-24">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-gradient-to-b from-white to-slate-50 px-6 py-14 text-center">
              <div className="pointer-events-none absolute -bottom-24 left-1/2 h-48 w-[28rem] -translate-x-1/2 rounded-full bg-blue-400/30 blur-3xl" />
              <div className="relative">
                <TwoTone dim={c.ctaDim} strong={c.ctaStrong} />
                <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-slate-500">
                  {t("ld.ctaSub")}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => navigate("/register")}
                    className={primaryBtn}
                  >
                    {t("ld.ctaReg")} <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-blue-500 bg-white px-7 py-3.5 text-[14px] font-bold text-slate-900 transition hover:bg-blue-50 active:scale-[0.98]"
                  >
                    {t("ld.login")}
                    <Sparkles size={15} className="text-amber-500" />
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <LandingFooter />

      {/* nút "lên đầu trang" chỉ hiện trên máy tính để không đè thanh nút đáy */}
      <div className="hidden md:block">
        <BackToTop />
      </div>

      <StickyCta
        primary={t("ld.ctaReg")}
        secondary={t("ld.login")}
        onPrimary={() => navigate("/register")}
        onSecondary={() => navigate("/login")}
      />
    </div>
  );
      }
