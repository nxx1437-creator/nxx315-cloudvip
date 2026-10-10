import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  ListChecks,
  Coins,
  Link2,
  Wallet,
  Lock,
  ShieldCheck,
  Bot,
  KeyRound,
} from "lucide-react";
import { BackToTop, scrollToId } from "./components/LandingChrome.jsx";
import { LandingHeader, LandingFooter } from "./components/LandingNav.jsx";
import { useI18n } from "./i18n/index.js";

const ICON_BASE =
  "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/icons";

// Icon 3D trên Supabase, lỗi ảnh thì dùng icon dự phòng
function Img3D({ name, Fallback, size = "h-24 w-24" }) {
  const [ok, setOk] = useState(true);
  if (!ok) return <Fallback className="h-10 w-10 text-blue-600" />;
  return (
    <img
      src={`${ICON_BASE}/${name}.png`}
      alt=""
      loading="lazy"
      className={`${size} object-contain drop-shadow-md`}
      onError={() => setOk(false)}
    />
  );
}

function FaqRow({ q, a, open, onToggle }) {
  return (
    <div className="border-b border-slate-200">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-[16px] font-semibold text-slate-900">{q}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="pb-5 text-[15px] leading-7 text-slate-600">{a}</p>
        </div>
      </div>
    </div>
  );
}

// Ba hình 3D xếp lệch bên phải phần đầu trang
function HeroArt() {
  return (
    <div className="relative mx-auto h-[280px] w-full max-w-[420px] rounded-3xl border border-slate-200 bg-slate-50 sm:h-[360px]">
      <div className="absolute left-[8%] top-[10%] -rotate-6">
        <Img3D
          name="icon-task"
          Fallback={ListChecks}
          size="h-28 w-28 sm:h-36 sm:w-36"
        />
      </div>
      <div className="absolute right-[8%] top-[28%] rotate-6">
        <Img3D
          name="icon-coin"
          Fallback={Coins}
          size="h-32 w-32 sm:h-44 sm:w-44"
        />
      </div>
      <div className="absolute bottom-[6%] left-[22%] -rotate-3">
        <Img3D
          name="icon-money"
          Fallback={Wallet}
          size="h-24 w-24 sm:h-32 sm:w-32"
        />
      </div>
    </div>
  );
}

// Chữ trong trang. Số liệu lấy từ hệ thống thật, đổi mức rút/phí thì sửa ở đây.
const COPY = {
  vi: {
    h1a: "Kiếm Coin.",
    h1b: "Đổi thưởng dễ dàng.",
    heroSub:
      "Làm nhiệm vụ đơn giản, nhận Coin và đổi lấy Robux, kim cương game và nhiều quà khác.",
    how: "Cách hoạt động",
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
  },
  en: {
    h1a: "Earn Coins.",
    h1b: "Redeem with ease.",
    heroSub:
      "Complete simple tasks, earn Coins and redeem Robux, in-game diamonds and more rewards.",
    how: "How it works",
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
  },
};

const FEATURE_ART = [
  { img: "icon-task", fb: ListChecks },
  { img: "icon-coin", fb: Coins },
  { img: "icon-money", fb: Wallet },
  { img: "icon-link", fb: Link2 },
];
const SAFETY = [
  { icon: Lock, t: "ld.b1t", d: "ld.b1d" },
  { icon: ShieldCheck, t: "ld.b2t", d: "ld.b2d" },
  { icon: Bot, t: "ld.b3t", d: "ld.b3d" },
  { icon: KeyRound, t: "ld.b4t", d: "ld.b4d" },
];

const FAQ_ORDER = [1, 2, 7, 3, 4, 5, 6];

export default function CloudVIPLanding() {
  const { t, lang } = useI18n();
  const c = COPY[lang] || COPY.vi;
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen bg-white font-['Be_Vietnam_Pro',sans-serif] text-slate-900">
      <LandingHeader />

      <main>
        {/* ============ ĐẦU TRANG ============ */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-14 pt-10 lg:grid-cols-[1.1fr_.9fr] lg:gap-16 lg:pb-24 lg:pt-20">
          <div>
            <p className="text-[14px] font-medium text-slate-500">
              {t("ld.badge")}
            </p>
            <h1 className="mt-4 text-[38px] font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[56px]">
              <span className="text-blue-600">{c.h1a}</span> {c.h1b}
            </h1>
            <p className="mt-5 max-w-lg text-[17px] leading-8 text-slate-600">
              {c.heroSub}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <button
                onClick={() => navigate("/register")}
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-blue-600 px-6 text-[15px] font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
              >
                {t("ld.ctaStart")} <ArrowRight size={17} />
              </button>
              <button
                onClick={() => scrollToId("how")}
                className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-slate-700 transition hover:text-blue-600"
              >
                {c.how} <ChevronDown size={16} />
              </button>
            </div>
          </div>
          <HeroArt />
        </section>

        {/* ============ SỐ LIỆU ============ */}
        <section className="border-y border-slate-200 bg-slate-50">
          <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-8 px-5 py-10 lg:grid-cols-4 lg:gap-x-0">
            {c.facts.map(([v, l], i) => (
              <div
                key={i}
                className={i > 0 ? "lg:border-l lg:border-slate-200 lg:pl-8" : ""}
              >
                <dt className="text-[26px] font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  {v}
                </dt>
                <dd className="mt-1 max-w-[220px] text-[13.5px] leading-5 text-slate-500">
                  {l}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ============ TÍNH NĂNG ============ */}
        <section
          id="features"
          className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:py-24"
        >
          <h2 className="max-w-xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {c.featTitle}
          </h2>

          <div className="mt-12 divide-y divide-slate-200 border-y border-slate-200">
            {c.features.map((f, i) => (
              <div
                key={f.to}
                className="grid items-center gap-6 py-10 md:grid-cols-[220px_1fr] md:gap-12"
              >
                <div className="flex h-40 items-center justify-center rounded-2xl bg-slate-50 md:h-44">
                  <Img3D
                    name={FEATURE_ART[i].img}
                    Fallback={FEATURE_ART[i].fb}
                    size="h-24 w-24 md:h-28 md:w-28"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                    {f.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-[16px] leading-7 text-slate-600">
                    {f.body}
                  </p>
                  <Link
                    to={f.to}
                    className="mt-4 inline-flex items-center gap-1 text-[15px] font-semibold text-blue-600 hover:underline"
                  >
                    {c.guide} <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-[15px] text-slate-500">{c.more}</p>
        </section>

        {/* ============ CÁCH HOẠT ĐỘNG ============ */}
        <section
          id="how"
          className="scroll-mt-20 border-y border-slate-200 bg-slate-50"
        >
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
            <h2 className="max-w-xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {c.howTitle}
            </h2>
            <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              {[1, 2, 3].map((n) => (
                <li key={n} className="border-t-2 border-slate-900 pt-5">
                  <span className="text-[14px] font-semibold text-slate-400">
                    0{n}
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">
                    {t(`ld.s${n}t`)}
                  </h3>
                  <p className="mt-2 text-[15px] leading-7 text-slate-600">
                    {t(`ld.s${n}d`)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ============ AN TOÀN ============ */}
        <section
          id="safety"
          className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:py-24"
        >
          <h2 className="max-w-xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t("ld.safeTitle")}
          </h2>
          <p className="mt-3 max-w-xl text-[16px] leading-7 text-slate-600">
            {t("ld.safeSub")}
          </p>
          <div className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {SAFETY.map(({ icon: Icon, t: tk, d }) => (
              <div key={tk} className="flex gap-4">
                <Icon className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-slate-900">{t(tk)}</h3>
                  <p className="mt-1.5 text-[15px] leading-7 text-slate-600">
                    {t(d)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section
          id="faq"
          className="scroll-mt-20 border-t border-slate-200 bg-slate-50"
        >
          <div className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {t("ld.faqTitle")}
            </h2>
            <div className="mt-8 border-t border-slate-200">
              {FAQ_ORDER.map((i, idx) => (
                <FaqRow
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

        {/* ============ KÊU GỌI CUỐI ============ */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <div className="rounded-3xl bg-blue-600 px-6 py-12 sm:px-12 sm:py-16">
            <h2 className="max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {c.ctaTitle}
            </h2>
            <p className="mt-3 max-w-lg text-[16px] leading-7 text-blue-100">
              {t("ld.ctaSub")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <button
                onClick={() => navigate("/register")}
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-blue-700 transition hover:bg-blue-50 active:scale-[0.98]"
              >
                {t("ld.ctaReg")} <ArrowRight size={17} />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="text-[15px] font-semibold text-white underline-offset-4 hover:underline"
              >
                {t("ld.login")}
              </button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
      <BackToTop />
    </div>
  );
            }
