import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, // Thay cho Coins
  ShieldCheck,
  Users,
  Star,
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  UserPlus,
  ListChecks,
  Gift,
  Zap, // Thay cho Gamepad2
} from "lucide-react";

// --- Dữ liệu cho các phần ---
const TRUST_STATS = [
  { icon: Users, value: "10K+", label: "NGƯỜI DÙNG" },
  { icon: Gift, value: "50K+", label: "ĐƠN HÀNG" },
  { icon: Star, value: "99%", label: "HÀI LÒNG" },
];

const WHY_CARDS = [
  { 
    icon: Zap, 
    title: "Kiếm Coin dễ dàng", 
    desc: "Hoàn thành nhiệm vụ đơn giản, nhận Coin ngay vào ví." 
  },
  { 
    icon: ShieldCheck, 
    title: "An toàn & Bảo mật", 
    desc: "Hệ thống chống gian lận nâng cao, bảo vệ tài khoản." 
  },
  { 
    icon: Users, 
    title: "Cộng đồng lớn", 
    desc: "Hơn 10,000 người dùng tin tưởng mỗi ngày." 
  },
];

const HOW_IT_WORKS = [
  { n: "1", icon: UserPlus, title: "Đăng ký tài khoản", desc: "Tạo tài khoản miễn phí chỉ trong 30 giây" },
  { n: "2", icon: ListChecks, title: "Làm nhiệm vụ", desc: "Chọn nhiệm vụ và hoàn thành để nhận Coin" },
  { n: "3", icon: Gift, title: "Đổi thưởng", desc: "Dùng Coin mua tài khoản Premium trong Shop" },
];

// --- Hook và Component cho hiệu ứng xuất hiện ---
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

// --- Component chính ---
export default function CloudVIPLanding() {
  const navigate = useNavigate();

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen w-full bg-white font-[Be_Vietnam_Pro] text-slate-900">
      {/* Nhúng Font chữ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* NAVBAR */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 bg-white/90 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-white">
            <Sparkles size={18} />
          </div>
          <span className="text-lg font-bold text-slate-800">CloudVIP</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
          </button>
          <button
            onClick={() => navigate("/register")}
            className="flex items-center gap-1.5 rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            <Star size={14} fill="currentColor" /> Đăng ký
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative px-4 pb-12 pt-10 text-center sm:px-6 sm:pt-16">
        <div className="mx-auto max-w-lg">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
              <Sparkles size={14} />
              Kiếm Coin — Đổi tài khoản Premium
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Nền tảng kiếm Coin
              <br />
              <span className="text-blue-500">đổi tài khoản Premium</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
              Hoàn thành nhiệm vụ đơn giản, nhận Coin và đổi tài khoản Netflix, Spotify, YouTube Premium an toàn 100%.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3">
              <button
                onClick={() => navigate("/register")}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                <Zap size={18} className="fill-current" />
                Bắt đầu ngay — Miễn phí
                <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={scrollToHowItWorks}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <PlayCircle size={18} /> Cách hoạt động
              </button>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-green-500" /> Không cần nạp tiền
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-blue-500" /> Tài khoản thật 100%
              </span>
            </div>
          </Reveal>
        </div>

        {/* STATS */}
        <Reveal delay={380} className="mx-auto mt-10 grid max-w-lg grid-cols-3 gap-3">
          {TRUST_STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <Icon size={20} className="mb-1.5 text-blue-400" />
              <div className="text-xl font-bold text-slate-900">{value}</div>
              <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">{label}</div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* WHY CHOOSE SECTION */}
      <section className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <Reveal className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Tính năng nổi bật</span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            Tại sao chọn <span className="text-blue-500">CloudVIP?</span>
          </h2>
        </Reveal>

        <div className="mt-8 space-y-4">
          {WHY_CARDS.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 100}>
              <div className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <Icon size={22} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="mx-auto max-w-lg px-4 py-12 pb-20 sm:px-6">
        <Reveal className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-500">3 bước đơn giản</span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Cách hoạt động</h2>
        </Reveal>

        <div className="mt-8 space-y-4">
          {HOW_IT_WORKS.map(({ n, title, desc }, i) => (
            <Reveal key={n} delay={i * 100}>
              <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-400 text-lg font-bold text-white">
                  {n}
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={300} className="mt-8">
          <button
            onClick={() => navigate("/register")}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            Bắt đầu kiếm Coin ngay <ArrowRight size={16} />
          </button>
        </Reveal>
      </section>

    </div>
  );
                }
