import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  ShieldCheck,
  Users,
  Star,
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  UserPlus,
  ListChecks,
  Gift,
  Rocket
} from "lucide-react";

// --- Dữ liệu nội dung ---
const TRUST_STATS = [
  { icon: Users, value: "10K+", label: "NGƯỜI DÙNG" },
  { icon: Gift, value: "50K+", label: "ĐƠN HÀNG" },
  { icon: Star, value: "99%", label: "HÀI LÒNG" },
];

const WHY_CARDS = [
  { 
    icon: Zap, 
    title: "Nạp game chính hãng", 
    desc: "Nạp Robux, Quân Huy, Kim Cương, UC cho 8+ tựa game hot nhất." 
  },
  { 
    icon: ShieldCheck, 
    title: "An toàn & Bảo mật", 
    desc: "Hệ thống chống gian lận nâng cao, bảo vệ tài khoản." 
  },
  { 
    icon: Users, 
    title: "Kiếm thưởng miễn phí", 
    desc: "Làm nhiệm vụ để nhận Coin đổi quà, rút tiền về ngân hàng." 
  },
];

const HOW_IT_WORKS = [
  { n: "1", title: "Đăng ký tài khoản", desc: "Tạo tài khoản miễn phí chỉ trong 30 giây" },
  { n: "2", title: "Làm nhiệm vụ", desc: "Chọn nhiệm vụ và hoàn thành để nhận Coin" },
  { n: "3", title: "Đổi thưởng", desc: "Dùng Coin mua tài khoản Premium trong Shop" },
];

export default function NXX315Landing() {
  const navigate = useNavigate();

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFBFC] font-[Be_Vietnam_Pro] text-slate-900">
      {/* Nhúng Font chữ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 bg-white/90 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-white">
            {/* Icon Logo giống hình mẫu */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
          </div>
          <span className="text-lg font-bold text-slate-800">NXX315 Studio</span>
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
          
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
            <Zap size={14} className="fill-current" />
            Nạp game chính hãng & Kiếm thưởng miễn phí
          </div>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Nền tảng kiếm Coin
            <br />
            <span className="text-blue-500">đổi tài khoản Premium</span>
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
            Nạp Robux, Quân Huy, Kim Cương, UC cho 8+ tựa game hot nhất. Hoặc làm nhiệm vụ để nhận Coin đổi quà, rút tiền về ngân hàng.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3">
            <button
              onClick={() => navigate("/register")}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              <Rocket size={18} className="fill-current" />
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

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-green-500" /> Không cần nạp tiền
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-blue-500" /> Tài khoản thật 100%
            </span>
          </div>
        </div>

        {/* STATS */}
        <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 gap-3">
          {TRUST_STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <Icon size={20} className="mb-1.5 text-blue-400" />
              <div className="text-xl font-bold text-slate-900">{value}</div>
              <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE SECTION */}
      <section className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Tính năng nổi bật</span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            Tại sao chọn <span className="text-blue-500">NXX315?</span>
          </h2>
        </div>

        <div className="mt-8 space-y-4">
          {WHY_CARDS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <Icon size={22} className="text-blue-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="mx-auto max-w-lg px-4 py-12 pb-20 sm:px-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-500">3 bước đơn giản</span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Cách hoạt động</h2>
        </div>

        <div className="mt-8 space-y-4">
          {HOW_IT_WORKS.map(({ n, title, desc }) => (
            <div key={n} className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-400 text-lg font-bold text-white">
                {n}
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <button
            onClick={() => navigate("/register")}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            Bắt đầu kiếm Coin ngay <ArrowRight size={16} />
          </button>
        </div>
      </section>

    </div>
  );
}
