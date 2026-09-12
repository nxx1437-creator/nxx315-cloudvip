import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import {
  Coins,
  ShieldCheck,
  Users,
  Star,
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  Gamepad2,
  Timer,
  BadgeCheck,
  UserPlus,
  ListChecks,
  Gift,
} from "lucide-react";

/**
 * CloudVIP — Landing Page (theme: trắng + xanh)
 * Đã bỏ dark mode, thêm đăng nhập nhanh Google/Facebook/Discord.
 */

const TRUST_STATS = [
  { icon: Users, value: "—", label: "Người dùng" },
  { icon: Gift, value: "—", label: "Robux đã nạp" },
  { icon: Star, value: "—", label: "Đánh giá 5 sao" },
];

const HOW_IT_WORKS = [
  { n: "1", icon: UserPlus, title: "Đăng ký tài khoản", desc: "Tạo tài khoản miễn phí chỉ trong 30 giây." },
  { n: "2", icon: ListChecks, title: "Làm nhiệm vụ", desc: "Chọn nhiệm vụ, hoàn thành và chờ admin duyệt để nhận Coin." },
  { n: "3", icon: Gamepad2, title: "Đổi Robux chính hãng", desc: "Dùng Coin đổi Robux, nạp thẳng vào tài khoản Roblox (VNG) của bạn." },
];

const WHY_CARDS = [
  { icon: Coins, title: "Kiếm Coin dễ dàng", desc: "Hoàn thành nhiệm vụ đơn giản, nhận Coin ngay vào ví sau khi admin duyệt." },
  { icon: ShieldCheck, title: "Robux chính hãng, minh bạch", desc: "Robux được mua từ nguồn chính hãng và nạp trực tiếp vào tài khoản VNG — không dùng tài khoản trung gian." },
  { icon: Timer, title: "Nạp nhanh, có xác nhận", desc: "Yêu cầu đổi thưởng được xử lý thủ công và có xác nhận rõ ràng cho từng giao dịch." },
];

const ROBUX_PACKAGES = [
  { robux: "80", coin: "8,000" },
  { robux: "400", coin: "38,000" },
  { robux: "800", coin: "72,000" },
  { robux: "1,700", coin: "150,000" },
];

const SOCIAL_PROVIDERS = [
  { id: "google", label: "Google", Icon: GoogleMark },
  { id: "facebook", label: "Facebook", Icon: FacebookMark },
  { id: "discord", label: "Discord", Icon: DiscordMark },
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

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, className = "", delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function FloatingCoins() {
  const coins = Array.from({ length: 10 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {coins.map((_, i) => {
        const left = 5 + ((i * 9.3) % 90);
        const duration = 9 + (i % 5) * 2.2;
        const delay = (i % 6) * 1.3;
        const size = 14 + (i % 3) * 6;
        return (
          <span
            key={i}
            className="absolute bottom-[-40px] opacity-0 animate-[floatUp_var(--dur)_ease-in_infinite]"
            style={{ left: `${left}%`, "--dur": `${duration}s`, animationDelay: `${delay}s` }}
          >
            <Coins size={size} className="text-sky-400/70 drop-shadow-[0_0_6px_rgba(56,189,248,0.4)]" />
          </span>
        );
      })}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          85% { opacity: 0.5; }
          100% { transform: translateY(-620px) rotate(180deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
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
    <div className="min-h-screen w-full bg-white font-[Be_Vietnam_Pro] text-slate-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
        .font-mono-num { font-family: 'Space Grotesk', monospace; }
      `}</style>

      {/* NAV */}
      <header className="sticky top-0 z-30 border-b border-sky-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 shadow-lg shadow-sky-500/30">
              <Coins size={18} className="text-white" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-slate-900">
              NXX315 Studio Rewards
            </span>
          </div>
          <button
            onClick={() => navigate("/register")}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-500/30 transition hover:shadow-sky-500/50 hover:brightness-110"
          >
            <Star size={14} /> Đăng ký
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden px-5 pb-16 pt-14 sm:pt-20">
        <div
          className="pointer-events-none absolute inset-x-0 top-[-10%] h-[480px] opacity-70 blur-3xl"
          style={{ background: "radial-gradient(60% 60% at 50% 30%, rgba(56,189,248,0.25), transparent 70%)" }}
        />
        <FloatingCoins />
        <div className="relative mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1.5 text-xs font-medium text-sky-700">
              <Gamepad2 size={13} /> Kiếm Coin — Đổi Robux chính hãng
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="font-display mt-5 text-4xl font-bold leading-[1.12] text-slate-900 sm:text-5xl">
              Nền tảng kiếm Coin
              <br />
              <span className="bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                đổi Robux chính hãng
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mx-auto mt-5 max-w-xl text-base text-slate-500 sm:text-lg">
              Hoàn thành nhiệm vụ đơn giản, nhận Coin và đổi ngay Robux chính
              hãng — nạp thẳng vào tài khoản Roblox liên kết VNG của bạn.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/register")}
                className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:shadow-sky-500/50 hover:brightness-110"
              >
                Bắt đầu ngay — Miễn phí
                <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={scrollToHowItWorks}
                className="flex items-center gap-2 rounded-full border border-sky-200 bg-white px-7 py-3.5 text-sm font-semibold text-sky-800 transition hover:bg-sky-50"
              >
                <PlayCircle size={16} /> Cách hoạt động
              </button>
            </div>
          </Reveal>

          {/* SOCIAL LOGIN */}
          <Reveal delay={300}>
            <div className="mt-7 flex flex-col items-center gap-3">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="h-px w-10 bg-sky-100" />
                hoặc đăng nhập nhanh với
                <span className="h-px w-10 bg-sky-100" />
              </div>
              <div className="flex items-center gap-3">
                {SOCIAL_PROVIDERS.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => handleSocialLogin(id)}
                    aria-label={`Đăng nhập với ${label}`}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-sky-200 bg-white text-sky-600 shadow-sm transition hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700"
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={380}>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500" /> Không cần nạp tiền
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-sky-600" /> Robux chính hãng 100%
              </span>
              <span className="flex items-center gap-1.5">
                <BadgeCheck size={14} className="text-sky-600" /> đổi thưởng được duyệt thủ công!
              </span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={440} className="relative mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-3">
          {TRUST_STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="rounded-2xl border border-sky-100 bg-white px-3 py-5 text-center shadow-sm">
              <Icon size={18} className="mx-auto mb-2 text-sky-600" />
              <div className="font-mono-num text-xl font-semibold text-slate-900">{value}</div>
              <div className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative mx-auto max-w-5xl px-5 py-16">
        <Reveal className="text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-sky-600">3 bước đơn giản</span>
          <h2 className="font-display mt-2 text-3xl font-bold text-slate-900">Cách hoạt động</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {HOW_IT_WORKS.map(({ n, icon: Icon, title, desc }, i) => (
            <Reveal key={n} delay={i * 100}>
              <div className="h-full rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-blue-600 font-display text-lg font-bold text-white shadow-md shadow-sky-500/30">
                  {n}
                </div>
                <Icon size={20} className="mt-4 text-sky-600" />
                <h3 className="mt-2 text-base font-semibold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ROBUX REDEMPTION */}
      <section className="relative mx-auto max-w-5xl px-5 py-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-sky-100 bg-white p-7 shadow-sm sm:p-10">
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl"
              style={{ background: "radial-gradient(circle, rgba(56,189,248,0.25), transparent 70%)" }}
            />
            <div className="relative flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-sm">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  <ShieldCheck size={13} /> Đổi thưởng minh bạch
                </span>
                <h3 className="font-display mt-3 text-2xl font-bold leading-snug text-slate-900">
                  Đổi Coin lấy Robux
                  <br />
                  <span className="text-sky-600">chính hãng</span>
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  Nhập User ID Roblox liên kết tài khoản VNG của bạn — admin
                  xác nhận và nạp Robux trực tiếp vào tài khoản trong vòng
                  24 giờ. Không qua trung gian, không dùng tài khoản chia sẻ.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-500">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="shrink-0 text-emerald-500" /> Nạp thẳng vào tài khoản Roblox (VNG)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="shrink-0 text-emerald-500" /> Có xác nhận giao dịch rõ ràng
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="shrink-0 text-emerald-500" /> Nguồn Robux chính hãng, không dùng thẻ gian lận
                  </li>
                </ul>
              </div>
              <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:min-w-[280px]">
                {ROBUX_PACKAGES.map((p) => (
                  <div key={p.robux} className="rounded-xl border border-sky-100 bg-white px-4 py-3.5 text-center shadow-sm transition hover:border-sky-300">
                    <div className="font-mono-num text-lg font-bold text-sky-600">
                      {p.robux} <span className="text-xs font-medium">R$</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{p.coin} Coin</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* WHY CHOOSE */}
      <section className="relative mx-auto max-w-5xl px-5 py-16">
        <Reveal className="text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-sky-600">Tính năng nổi bật</span>
          <h2 className="font-display mt-2 text-3xl font-bold text-slate-900">
            Tại sao chọn <span className="text-sky-600">NXX315 Studio Rewards</span>?
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {WHY_CARDS.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 100}>
              <div className="h-full rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50">
                  <Icon size={20} className="text-sky-600" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="relative mx-auto max-w-3xl px-5 pb-20 pt-6 text-center">
        <Reveal>
          <div className="rounded-3xl border border-sky-100 bg-white px-6 py-10 shadow-sm">
            <h3 className="font-display text-2xl font-bold text-slate-900">Sẵn sàng kiếm Coin và đổi Robux?</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Đăng ký miễn phí và hoàn thành nhiệm vụ đầu tiên ngay hôm nay.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:shadow-sky-500/50 hover:brightness-110"
            >
              Bắt đầu ngay — Miễn phí <ArrowRight size={16} />
            </button>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-sky-100 px-5 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} NXX315 Studio Rewards. Robux là thương hiệu của Roblox Corporation.
      </footer>
    </div>
  );
      }
