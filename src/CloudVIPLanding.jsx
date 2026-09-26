import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabaseClient.js";
import {
  Coins,
  ShieldCheck,
  Users,
  Star,
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  Gamepad2,
  BadgeCheck,
  UserPlus,
  ListChecks,
  Gift,
  Zap,
} from "lucide-react";

const WHY_CARDS = [
  {
    icon: Zap,
    title: "Kiếm Coin dễ dàng",
    desc: "Hoàn thành nhiệm vụ đơn giản, nhận Coin ngay vào ví sau khi admin duyệt.",
  },
  {
    icon: ShieldCheck,
    title: "An toàn & Bảo mật",
    desc: "Hệ thống chống gian lận nâng cao, bảo vệ tài khoản của bạn.",
  },
  {
    icon: Users,
    title: "Cộng đồng lớn",
    desc: "Hơn 10,000 người dùng tin tưởng mỗi ngày.",
  },
];

const REFERRAL_TASKS = [
  { icon: Gift, title: "Mời 1 bạn", desc: "+200 Coin cho bạn mới" },
  { icon: Users, title: "Hoa hồng", desc: "Nhận 15% Coin từ mỗi nhiệm vụ bạn bè làm" },
  { icon: Star, title: "Mốc thưởng", desc: "Mời 3/5/10/20 bạn — nhận thêm 500đ → 10.000đ" },
];

const HOW_IT_WORKS = [
  { n: "1", icon: UserPlus, title: "Đăng ký tài khoản", desc: "Tạo tài khoản miễn phí chỉ trong 30 giây." },
  { n: "2", icon: ListChecks, title: "Làm nhiệm vụ", desc: "Chọn nhiệm vụ và hoàn thành để nhận Coin." },
  { n: "3", icon: Gamepad2, title: "Đổi thưởng", desc: "Dùng Coin mua Robux chính hãng trong Shop." },
];

function GoogleMark({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M21.35 11.1h-9.17v2.98h5.27c-.23 1.44-1.64 4.22-5.27 4.22-3.17 0-5.76-2.62-5.76-5.85s2.59-5.85 5.76-5.85c1.8 0 3.01.77 3.7 1.43l2.52-2.43C16.86 3.99 14.7 3 12.18 3 7.03 3 2.86 7.14 2.86 12.25s4.17 9.25 9.32 9.25c5.38 0 8.95-3.78 8.95-9.11 0-.61-.07-1.08-.16-1.29Z" />
    </svg>
  );
}

function FacebookMark({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

function DiscordMark({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M20.32 4.37a19.8 19.8 0 00-4.89-1.52.07.07 0 00-.08.04c-.21.38-.44.86-.61 1.25a18.3 18.3 0 00-5.49 0 12.6 12.6 0 00-.62-1.25.08.08 0 00-.08-.04 19.74 19.74 0 00-4.88 1.52.07.07 0 00-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 00.03.06c2.05 1.5 4.04 2.42 5.99 3.03a.08.08 0 00.08-.03c.46-.63.87-1.3 1.23-1.99a.08.08 0 00-.04-.11 12.4 12.4 0 01-1.87-.89.08.08 0 01-.01-.13c.13-.1.25-.19.37-.29a.07.07 0 01.08-.01c3.93 1.79 8.18 1.79 12.06 0a.07.07 0 01.08.01c.12.1.25.2.37.29a.08.08 0 010 .13c-.6.35-1.22.64-1.87.89a.08.08 0 00-.04.11c.36.7.77 1.36 1.22 1.99a.08.08 0 00.09.03c1.96-.61 3.95-1.52 6-3.03a.08.08 0 00.03-.06c.5-5.18-.84-9.67-3.55-13.66a.06.06 0 00-.03-.03ZM8.02 15.33c-1.18 0-2.16-1.09-2.16-2.42s.96-2.42 2.16-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.33-.96 2.42-2.16 2.42Zm7.97 0c-1.18 0-2.16-1.09-2.16-2.42s.96-2.42 2.16-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.33-.95 2.42-2.16 2.42Z" />
    </svg>
  );
}

const SOCIAL_PROVIDERS = [
  { id: "google", label: "Google", Icon: GoogleMark },
  { id: "facebook", label: "Facebook", Icon: FacebookMark },
  { id: "discord", label: "Discord", Icon: DiscordMark },
];

export default function CloudVIPLanding() {
  const navigate = useNavigate();

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSocialLogin = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) console.error("Đăng nhập thất bại:", error.message);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-50 via-white to-blue-50 font-[Be_Vietnam_Pro] text-slate-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* NAV */}
      <header className="sticky top-0 z-30 border-b border-sky-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600">
              <Coins size={18} className="text-white" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-slate-900">
              NXX315 Studio <span className="text-sky-500">Rewards</span>
            </span>
          </div>
          <button
            onClick={() => navigate("/register")}
            className="rounded-lg bg-gradient-to-r from-sky-400 to-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-sky-500/30 transition hover:brightness-110"
          >
            Đăng ký
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative px-5 pb-20 pt-16 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-sky-600 shadow-sm">
            <Gamepad2 size={13} />
            Kiếm Coin — Đổi Robux chính hãng
          </span>

          <h1 className="mt-7 text-[32px] font-extrabold leading-[1.2] tracking-tight text-slate-900 sm:text-5xl">
  Nền tảng kiếm Coin
  <br />
  <span className="whitespace-nowrap bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
    đổi thưởng chính hãng
  </span>
</h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Hoàn thành nhiệm vụ đơn giản, nhận Coin và đổi ngay Robux chính
            hãng — nạp thẳng vào tài khoản Roblox liên kết VNG của bạn.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/register")}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/40 transition hover:brightness-110 sm:w-auto"
            >
              Bắt đầu ngay — Miễn phí
              <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={scrollToHowItWorks}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-200 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-sky-50 sm:w-auto"
            >
              <PlayCircle size={16} /> Cách hoạt động
            </button>
          </div>

          {/* SOCIAL LOGIN */}
          <div className="mt-10 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
              <span className="h-px w-10 bg-sky-200" />
              hoặc đăng nhập nhanh với
              <span className="h-px w-10 bg-sky-200" />
            </div>
            <div className="flex items-center gap-3">
              {SOCIAL_PROVIDERS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => handleSocialLogin(id)}
                  aria-label={`Đăng nhập với ${label}`}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-sky-200 bg-white text-slate-600 shadow-sm transition hover:border-sky-400 hover:text-sky-600"
                >
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>

          {/* TRUST BADGES */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-500" /> Không cần nạp tiền
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-sky-600" /> Robux chính hãng 100%
            </span>
            <span className="flex items-center gap-1.5">
              <BadgeCheck size={14} className="text-sky-600" /> Duyệt thủ công!
            </span>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-500">
            Tính năng nổi bật
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            Tại sao chọn{" "}
            <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
              NXX315
            </span>
            ?
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {WHY_CARDS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="h-full rounded-2xl border border-sky-100 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-blue-100">
                <Icon size={20} className="text-sky-600" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* REFERRAL */}
      <section className="mx-auto max-w-5xl px-5 py-6">
        <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-blue-50 to-white p-7 shadow-sm sm:p-10">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-bold text-sky-600">
              <Gift size={13} /> Tính năng mới
            </span>
            <h3 className="mt-4 text-2xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-3xl">
              Kiếm Coin từ việc
              <br />
              <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                mời bạn bè
              </span>
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
              Mời bạn bè tham gia — bạn nhận hoa hồng 15% từ mỗi nhiệm vụ họ
              hoàn thành, cộng thêm thưởng mốc khi mời đủ số lượng.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {REFERRAL_TASKS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm"
              >
                <Icon size={20} className="text-sky-500" />
                <h4 className="mt-3 text-base font-bold text-slate-900">{title}</h4>
                <p className="mt-1 text-sm text-slate-500">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/register")}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/40 transition hover:brightness-110"
            >
              <Gift size={16} /> Bắt đầu mời bạn
            </button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="mx-auto max-w-5xl px-5 py-16">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-500">
            3 bước đơn giản
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            Cách hoạt động
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {HOW_IT_WORKS.map(({ n, icon: Icon, title, desc }) => (
            <div
              key={n}
              className="h-full rounded-2xl border border-sky-100 bg-white p-6 text-center shadow-sm"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-base font-extrabold text-white shadow-md shadow-sky-500/30">
                {n}
              </div>
              <Icon size={20} className="mx-auto mt-4 text-sky-600" />
              <h3 className="mt-3 text-base font-bold text-slate-900">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="mx-auto max-w-3xl px-5 pb-20 pt-6 text-center">
        <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-blue-50 to-white px-6 py-10 shadow-sm">
          <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Sẵn sàng kiếm Coin và đổi Robux?
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            Đăng ký miễn phí và hoàn thành nhiệm vụ đầu tiên ngay hôm nay.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/40 transition hover:brightness-110"
          >
            Bắt đầu ngay — Miễn phí <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <footer className="border-t border-sky-100 bg-white/50 px-5 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} NXX315 Studio Rewards. Robux là thương hiệu của Roblox Corporation.
      </footer>
    </div>
  );
                                      }
