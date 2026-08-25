import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Coins,
  ShieldCheck,
  Users,
  Star,
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  Moon,
  Sun,
  Gamepad2,
  Timer,
  BadgeCheck,
  UserPlus,
  ListChecks,
  Gift,
} from "lucide-react";

/**
 * CloudVIP — Landing Page
 * -----------------------------------------------------------------
 * Reward model: users complete admin-approved tasks -> earn Coin ->
 * redeem Coin for GENUINE Robux, topped up directly into their
 * linked VNG (Roblox VN publisher) account. No premium-account
 * trading, no bot/engagement-farming features.
 *
 * Text color: every text element sets an explicit sky shade
 * (never inherits "currentColor"/white), so nothing goes invisible
 * against light or dark backgrounds.
 *
 * NOTE ON STATS: "10K+ users / 50K+ orders / 99% satisfied" style
 * numbers are placeholders ("—") on purpose. Fill in TRUST_STATS
 * below with real figures once you have them.
 * -----------------------------------------------------------------
 */

const TRUST_STATS = [
  { icon: Users, value: "—", label: "Người dùng" },
  { icon: Gift, value: "—", label: "Robux đã nạp" },
  { icon: Star, value: "—", label: "Đánh giá 5 sao" },
];

const HOW_IT_WORKS = [
  {
    n: "1",
    icon: UserPlus,
    title: "Đăng ký tài khoản",
    desc: "Tạo tài khoản miễn phí chỉ trong 30 giây.",
  },
  {
    n: "2",
    icon: ListChecks,
    title: "Làm nhiệm vụ",
    desc: "Chọn nhiệm vụ, hoàn thành và chờ admin duyệt để nhận Coin.",
  },
  {
    n: "3",
    icon: Gamepad2,
    title: "Đổi Robux chính hãng",
    desc: "Dùng Coin đổi Robux, nạp thẳng vào tài khoản Roblox (VNG) của bạn.",
  },
];

const WHY_CARDS = [
  {
    icon: Coins,
    title: "Kiếm Coin dễ dàng",
    desc: "Hoàn thành nhiệm vụ đơn giản, nhận Coin ngay vào ví sau khi admin duyệt.",
  },
  {
    icon: ShieldCheck,
    title: "Robux chính hãng, minh bạch",
    desc: "Robux được mua từ nguồn chính hãng và nạp trực tiếp vào tài khoản VNG — không dùng tài khoản trung gian.",
  },
  {
    icon: Timer,
    title: "Nạp nhanh, có xác nhận",
    desc: "Yêu cầu đổi thưởng được xử lý thủ công và có xác nhận rõ ràng cho từng giao dịch.",
  },
];

const ROBUX_PACKAGES = [
  { robux: "80", coin: "8,000" },
  { robux: "400", coin: "38,000" },
  { robux: "800", coin: "72,000" },
  { robux: "1,700", coin: "150,000" },
];

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
            style={{
              left: `${left}%`,
              "--dur": `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          >
            <Coins
              size={size}
              className="text-sky-300/70 drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]"
            />
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
  const [dark, setDark] = useState(true);
  const navigate = useNavigate();

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  // Explicit sky text colors for every state — never left to inherit,
  // so text never renders white-on-white or blends into the background.
  const bg = dark ? "bg-[#050B18] text-sky-100" : "bg-[#F5FAFF] text-sky-950";
  const cardBg = dark
    ? "bg-white/[0.04] border-white/10 backdrop-blur-xl"
    : "bg-white/70 border-sky-200 backdrop-blur-xl";
  const subText = dark ? "text-sky-200/70" : "text-sky-800/80";
  const accentText = dark ? "text-sky-400" : "text-sky-600";
  const headingGradient = dark
    ? "bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent"
    : "bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent";
  const ctaGradient = "bg-gradient-to-r from-sky-400 to-blue-600";

  return (
    <div
      className={`min-h-screen w-full font-[Be_Vietnam_Pro] transition-colors duration-500 ${bg}`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
        .font-mono-num { font-family: 'Space Grotesk', monospace; }
      `}</style>

      {/* NAV */}
      <header
        className={`sticky top-0 z-30 border-b ${
          dark ? "border-white/10 bg-[#050B18]/80" : "border-sky-200 bg-white/80"
        } backdrop-blur-md`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${ctaGradient} shadow-lg shadow-sky-500/30`}>
              <Coins size={18} className="text-white" />
            </div>
            <span className={`font-display text-lg font-bold tracking-tight ${dark ? "text-sky-100" : "text-sky-950"}`}>
              CloudVIP
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark((d) => !d)}
              aria-label="Đổi giao diện sáng/tối"
              className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                dark ? "border-white/15 hover:bg-white/10 text-sky-200" : "border-sky-200 hover:bg-sky-50 text-sky-700"
              } transition`}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => navigate("/register")}
              className={`rounded-full ${ctaGradient} px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-500/30 transition hover:shadow-sky-500/50 hover:brightness-110 flex items-center gap-1.5`}
            >
              <Star size={14} /> Đăng ký
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden px-5 pb-16 pt-14 sm:pt-20">
        <div
          className={`pointer-events-none absolute inset-x-0 top-[-10%] h-[480px] blur-3xl ${
            dark ? "opacity-40" : "opacity-60"
          }`}
          style={{
            background:
              "radial-gradient(60% 60% at 50% 30%, rgba(56,189,248,0.35), transparent 70%)",
          }}
        />
        <FloatingCoins />
        <div className="relative mx-auto max-w-3xl text-center">
          <Reveal>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium ${
                dark
                  ? "border-sky-400/30 bg-sky-400/10 text-sky-200"
                  : "border-sky-300 bg-sky-50 text-sky-700"
              }`}
            >
              <Gamepad2 size={13} /> Kiếm Coin — Đổi Robux chính hãng
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className={`font-display mt-5 text-4xl font-bold leading-[1.12] sm:text-5xl ${dark ? "text-sky-50" : "text-sky-950"}`}>
              Nền tảng kiếm Coin
              <br />
              <span className={headingGradient}>đổi Robux chính hãng</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className={`mx-auto mt-5 max-w-xl text-base sm:text-lg ${subText}`}>
              Hoàn thành nhiệm vụ đơn giản, nhận Coin và đổi ngay Robux chính
              hãng — nạp thẳng vào tài khoản Roblox liên kết VNG của bạn.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/register")}
                className={`group flex items-center gap-2 rounded-full ${ctaGradient} px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:shadow-sky-500/50 hover:brightness-110`}
              >
                Bắt đầu ngay — Miễn phí
                <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={scrollToHowItWorks}
                className={`flex items-center gap-2 rounded-full border px-7 py-3.5 text-sm font-semibold transition ${
                  dark
                    ? "border-white/15 hover:bg-white/5 text-sky-100"
                    : "border-sky-200 bg-white hover:bg-sky-50 text-sky-800"
                }`}
              >
                <PlayCircle size={16} /> Cách hoạt động
              </button>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className={`mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs ${subText}`}>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" /> Không cần nạp tiền
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className={accentText} /> Robux chính hãng 100%
              </span>
              <span className="flex items-center gap-1.5">
                <BadgeCheck size={14} className={accentText} /> Nhiệm vụ được duyệt thủ công
              </span>
            </div>
          </Reveal>
        </div>

        {/* trust stats */}
        <Reveal delay={380} className="relative mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-3">
          {TRUST_STATS.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className={`rounded-2xl border px-3 py-5 text-center ${cardBg}`}
            >
              <Icon size={18} className={`mx-auto mb-2 ${accentText}`} />
              <div className={`font-mono-num text-xl font-semibold ${dark ? "text-sky-50" : "text-sky-950"}`}>
                {value}
              </div>
              <div className={`mt-0.5 text-[11px] uppercase tracking-wide ${subText}`}>
                {label}
              </div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative mx-auto max-w-5xl px-5 py-16">
        <Reveal className="text-center">
          <span className={`text-xs font-semibold uppercase tracking-widest ${accentText}`}>
            3 bước đơn giản
          </span>
          <h2 className={`font-display mt-2 text-3xl font-bold ${dark ? "text-sky-50" : "text-sky-950"}`}>
            Cách hoạt động
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {HOW_IT_WORKS.map(({ n, icon: Icon, title, desc }, i) => (
            <Reveal key={n} delay={i * 100}>
              <div className={`h-full rounded-2xl border p-6 ${cardBg}`}>
                <div className={`flex h-11 w-11 items-center justify-center rounded-full ${ctaGradient} font-display text-lg font-bold text-white shadow-md shadow-sky-500/30`}>
                  {n}
                </div>
                <Icon size={20} className={`mt-4 ${accentText}`} />
                <h3 className={`mt-2 text-base font-semibold ${dark ? "text-sky-50" : "text-sky-950"}`}>
                  {title}
                </h3>
                <p className={`mt-1.5 text-sm leading-relaxed ${subText}`}>{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ROBUX REDEMPTION FEATURE */}
      <section className="relative mx-auto max-w-5xl px-5 py-6">
        <Reveal>
          <div className={`relative overflow-hidden rounded-3xl border p-7 sm:p-10 ${cardBg}`}>
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl"
              style={{ background: "radial-gradient(circle, rgba(56,189,248,0.35), transparent 70%)" }}
            />
            <div className="relative flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-sm">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                    dark
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                      : "border-emerald-300 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  <ShieldCheck size={13} /> Đổi thưởng minh bạch
                </span>
                <h3 className={`font-display mt-3 text-2xl font-bold leading-snug ${dark ? "text-sky-50" : "text-sky-950"}`}>
                  Đổi Coin lấy Robux
                  <br />
                  <span className={accentText}>chính hãng</span>
                </h3>
                <p className={`mt-3 text-sm leading-relaxed ${subText}`}>
                  Nhập User ID Roblox liên kết tài khoản VNG của bạn — admin
                  xác nhận và nạp Robux trực tiếp vào tài khoản trong vòng
                  24 giờ. Không qua trung gian, không dùng tài khoản chia sẻ.
                </p>
                <ul className={`mt-4 space-y-2 text-sm ${subText}`}>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                    Nạp thẳng vào tài khoản Roblox (VNG)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                    Có xác nhận giao dịch rõ ràng
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                    Nguồn Robux chính hãng, không dùng thẻ gian lận
                  </li>
                </ul>
              </div>

              <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:min-w-[280px]">
                {ROBUX_PACKAGES.map((p) => (
                  <div
                    key={p.robux}
                    className={`rounded-xl border px-4 py-3.5 text-center transition hover:border-sky-400/50 ${
                      dark ? "border-white/10 bg-white/[0.03]" : "border-sky-200 bg-white"
                    }`}
                  >
                    <div className={`font-mono-num text-lg font-bold ${accentText}`}>
                      {p.robux} <span className="text-xs font-medium">R$</span>
                    </div>
                    <div className={`mt-1 text-xs ${subText}`}>{p.coin} Coin</div>
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
          <span className={`text-xs font-semibold uppercase tracking-widest ${accentText}`}>
            Tính năng nổi bật
          </span>
          <h2 className={`font-display mt-2 text-3xl font-bold ${dark ? "text-sky-50" : "text-sky-950"}`}>
            Tại sao chọn <span className={accentText}>CloudVIP</span>?
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {WHY_CARDS.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 100}>
              <div className={`h-full rounded-2xl border p-6 ${cardBg}`}>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${dark ? "bg-sky-400/10" : "bg-sky-50"}`}>
                  <Icon size={20} className={accentText} />
                </div>
                <h3 className={`mt-4 text-base font-semibold ${dark ? "text-sky-50" : "text-sky-950"}`}>
                  {title}
                </h3>
                <p className={`mt-1.5 text-sm leading-relaxed ${subText}`}>{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="relative mx-auto max-w-3xl px-5 pb-20 pt-6 text-center">
        <Reveal>
          <div className={`rounded-3xl border px-6 py-10 ${cardBg}`}>
            <h3 className={`font-display text-2xl font-bold ${dark ? "text-sky-50" : "text-sky-950"}`}>
              Sẵn sàng kiếm Coin và đổi Robux?
            </h3>
            <p className={`mx-auto mt-2 max-w-md text-sm ${subText}`}>
              Đăng ký miễn phí và hoàn thành nhiệm vụ đầu tiên ngay hôm nay.
            </p>
            <button
              onClick={() => navigate("/register")}
              className={`mt-6 inline-flex items-center gap-2 rounded-full ${ctaGradient} px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:shadow-sky-500/50 hover:brightness-110`}
            >
              Bắt đầu ngay — Miễn phí <ArrowRight size={16} />
            </button>
          </div>
        </Reveal>
      </section>

      <footer className={`border-t px-5 py-6 text-center text-xs ${dark ? "border-white/10 text-sky-300/60" : "border-sky-200 text-sky-700/60"}`}>
        © {new Date().getFullYear()} CloudVIP. Robux là thương hiệu của Roblox Corporation.
      </footer>
    </div>
  );
            }
                  
