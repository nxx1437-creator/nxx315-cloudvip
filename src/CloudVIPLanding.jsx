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
  Gamepad2,
  Wallet,
  Sparkles,
  ChevronRight
} from "lucide-react";

// --- Dữ liệu ---
const STATS = [
  { value: "10K+", label: "Người dùng" },
  { value: "50K+", label: "Giao dịch" },
  { value: "99%", label: "Hài lòng" },
];

const GAMES = [
  "Roblox", "Free Fire", "Liên Quân", "PUBG Mobile", 
  "Genshin Impact", "Honkai: Star Rail", "Valorant", "LMHT: Tốc Chiến"
];

const FEATURES = [
  {
    icon: Zap,
    title: "Nạp siêu tốc",
    desc: "Hệ thống xử lý tự động, nạp Robux, Quân Huy, Kim Cương chỉ trong vài giây.",
    color: "text-amber-400",
    bg: "bg-amber-400/10"
  },
  {
    icon: ShieldCheck,
    title: "Bảo mật tuyệt đối",
    desc: "Mã hóa dữ liệu 2 lớp, cam kết an toàn 100% cho tài khoản game của bạn.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10"
  },
  {
    icon: Wallet,
    title: "Kiếm thưởng & Rút tiền",
    desc: "Làm nhiệm vụ nhận Coin, đổi quà hoặc rút tiền mặt trực tiếp về ngân hàng.",
    color: "text-sky-400",
    bg: "bg-sky-400/10"
  },
];

const STEPS = [
  { n: "01", title: "Tạo tài khoản", desc: "Đăng ký miễn phí, xác thực email bảo mật." },
  { n: "02", title: "Chọn dịch vụ", desc: "Nạp game hoặc làm nhiệm vụ kiếm Coin." },
  { n: "03", title: "Nhận thưởng", desc: "Vật phẩm vào game ngay, tiền về ví liền tay." },
];

export default function NXX315Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#09090b] font-[Be_Vietnam_Pro] text-slate-200 selection:bg-emerald-500/30">
      {/* Nhúng Font chữ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap');
      `}</style>

      {/* --- BACKGROUND GRADIENT MESH (Tạo chiều sâu) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      {/* --- NAVBAR --- */}
      <header className="relative z-50 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/20">
              <Gamepad2 size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              NXX315 <span className="text-emerald-400">Studio</span>
            </span>
          </div>
          
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-400 md:flex">
            <a href="#" className="transition hover:text-white">Nạp Game</a>
            <a href="#" className="transition hover:text-white">Kiếm Thưởng</a>
            <a href="#" className="transition hover:text-white">Bảng Giá</a>
            <a href="#" className="transition hover:text-white">Hỗ Trợ</a>
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/login")} className="hidden text-sm font-medium text-slate-300 transition hover:text-white sm:block">
              Đăng nhập
            </button>
            <button
              onClick={() => navigate("/register")}
              className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-slate-200"
            >
              Bắt đầu
            </button>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 px-4 pt-20 pb-16 sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
            <Sparkles size={14} /> Nền tảng nạp game & kiếm thưởng thế hệ mới
          </div>
          
          <h1 className="mt-8 text-4xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-6xl">
            Nạp Game Chính Hãng.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
              Kiếm Thưởng Miễn Phí.
            </span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Nạp Robux, Quân Huy, Kim Cương, UC cho 8+ tựa game hot nhất. 
            Hoặc làm nhiệm vụ để nhận Coin đổi quà, rút tiền về ngân hàng.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => navigate("/nap-game")}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-base font-bold text-black transition hover:bg-emerald-400 sm:w-auto"
            >
              Nạp Game Ngay
              <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => navigate("/kiem-thuong")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition hover:bg-white/10 sm:w-auto"
            >
              <Zap size={18} className="text-amber-400" /> Kiếm Thưởng
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" /> Giao dịch tự động 24/7
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-500" /> Bảo mật 100%
            </span>
            <span className="flex items-center gap-2">
              <Star size={16} className="text-amber-400" /> 4.9/5 (2K+ đánh giá)
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mx-auto mt-20 grid max-w-3xl grid-cols-3 gap-4 border-t border-white/5 pt-10">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-extrabold text-white sm:text-4xl">{stat.value}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* --- GAME LOGOS / MARQUEE --- */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.02] py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-4 px-4 text-sm font-semibold text-slate-500 sm:gap-x-12">
          {GAMES.map((game) => (
            <span key={game} className="transition hover:text-slate-300">{game}</span>
          ))}
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="mb-16 max-w-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Tại sao chọn <span className="text-emerald-400">NXX315?</span>
          </h2>
          <p className="mt-4 text-slate-400">
            Chúng tôi xây dựng nền tảng dựa trên sự tin cậy, tốc độ và bảo mật. 
            Mọi giao dịch đều được xử lý minh bạch.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map((feat) => (
            <div 
              key={feat.title} 
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition hover:bg-white/[0.04]"
            >
              <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl ${feat.bg} ${feat.color}`}>
                <feat.icon size={24} />
              </div>
              <h3 className="mb-3 text-lg font-bold text-white">{feat.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{feat.desc}</p>
              
              {/* Hiệu ứng viền sáng khi hover */}
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 transition group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="relative z-10 border-t border-white/5 bg-white/[0.01] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Quy trình <span className="text-emerald-400">3 bước</span>
            </h2>
            <p className="mt-4 text-slate-400">Bắt đầu chỉ trong chưa đầy 1 phút.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step, idx) => (
              <div key={step.n} className="relative flex flex-col items-center text-center">
                {/* Đường nối giữa các bước */}
                {idx !== STEPS.length - 1 && (
                  <div className="absolute top-8 left-[60%] hidden h-[1px] w-[80%] bg-gradient-to-r from-emerald-500/50 to-transparent md:block" />
                )}
                
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#09090b] text-2xl font-black text-emerald-400 shadow-xl shadow-emerald-500/10">
                  {step.n}
                </div>
                <h3 className="mt-6 text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="relative z-10 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-10 text-center backdrop-blur-xl sm:p-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Sẵn sàng trải nghiệm?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Tham gia cùng hàng ngàn game thủ khác. Nạp game giá rẻ, kiếm thưởng 
            khủng và rút tiền về ví ngân hàng của bạn ngay hôm nay.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => navigate("/register")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-base font-bold text-black transition hover:bg-emerald-400 sm:w-auto"
            >
              Đăng ký miễn phí <ChevronRight size={18} />
            </button>
            <button
              onClick={() => navigate("/lien-he")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-transparent px-8 py-4 text-base font-bold text-white transition hover:bg-white/5 sm:w-auto"
            >
              Liên hệ hỗ trợ
            </button>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 border-t border-white/5 bg-[#09090b] px-4 py-8 text-center text-xs text-slate-600 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p>© {new Date().getFullYear()} NXX315 Studio. Nạp game chính hãng & Kiếm thưởng miễn phí.</p>
          <p className="mt-2">Robux là thương hiệu của Roblox Corporation. Các tựa game khác thuộc bản quyền của chủ sở hữu tương ứng.</p>
        </div>
      </footer>
    </div>
  );
      }
