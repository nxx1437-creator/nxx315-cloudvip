import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  ShieldCheck,
  Users,
  Star,
  ArrowRight,
  CheckCircle2,
  Wallet,
  Sparkles,
  ChevronRight,
  PlayCircle,
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

export default function CloudVIPLanding() {
  const navigate = useNavigate();

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <div 
        className="min-h-screen w-full bg-[#09090b] text-slate-200 selection:bg-emerald-500/30"
        style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      >
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute top-[20%] right-[-10%] h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[120px]" />
        </div>

        {/* --- NAVBAR --- */}
        <header className="relative z-50 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/20">
                <Zap size={20} className="text-white" fill="currentColor" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                NXX315 <span className="text-emerald-400">Studio</span>
              </span>
            </div>
            
            <nav className="hidden items-center gap-8 text-sm font-medium text-slate-400 md:flex">
              <a href="/store" className="transition hover:text-white">Nạp Game</a>
              <a href="/tasks" className="transition hover:text-white">Kiếm Thưởng</a>
              <a href="/feed" className="transition hover:text-white">Cộng đồng</a>
              <a href="/help" className="transition hover:text-white">Hỗ trợ</a>
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
        {/* ĐÃ GIẢM PADDING TOP ĐỂ GỌN HƠN */}
        <section className="relative z-10 px-4 pt-12 pb-10 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-semibold text-emerald-400 sm:text-xs">
              <Sparkles size={12} /> Nền tảng nạp game & kiếm thưởng 
            </div>
            
            {/* ĐÃ GIẢM MẠNH KÍCH THƯỚC CHỮ TRÊN MOBILE */}
            <h1 className="mt-5 text-2xl font-extrabold leading-[1.25] tracking-tight text-white sm:text-5xl">
              Nạp Game Chính Hãng.
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
                Kiếm Thưởng Miễn Phí.
              </span>
            </h1>
            
            {/* CHỮ MÔ TẢ NHỎ LẠI */}
            <p className="mx-auto mt-4 max-w-md text-[11px] leading-relaxed text-slate-400 sm:text-sm">
              Nạp Robux, Quân Huy, Kim Cương, UC cho 8+ tựa game hot nhất. 
              Hoặc làm nhiệm vụ để nhận Coin đổi quà, rút tiền về ngân hàng.
            </p>

            {/* NÚT BẤM GỌN HƠN */}
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/register")}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-bold text-black transition hover:bg-emerald-400 sm:w-auto sm:text-sm"
              >
                Đăng ký ngay
                <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </button>
              <button
                onClick={scrollToHowItWorks}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/10 sm:w-auto sm:text-sm"
              >
                <PlayCircle size={16} className="text-emerald-400" /> Cách hoạt động
              </button>
            </div>

            {/* TRUST INDICATORS GỌN HƠN */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] text-slate-500 sm:text-xs">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-500" /> Giao dịch tự động 24/7
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-emerald-500" /> Bảo mật 100%
              </span>
              <span className="flex items-center gap-1.5">
                <Star size={12} className="text-amber-400" /> 4.9/5 (2K+ đánh giá)
              </span>
            </div>
          </div>

          {/* STATS GỌN HƠN */}
          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-4 border-t border-white/5 pt-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl font-extrabold text-white sm:text-3xl">{stat.value}</div>
                <div className="mt-1 text-[9px] font-medium uppercase tracking-wider text-slate-500 sm:text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* --- GAME LOGOS --- */}
        <section className="relative z-10 border-y border-white/5 bg-white/[0.02] py-5">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 text-[11px] font-semibold text-slate-500 sm:gap-x-10 sm:text-sm">
            {GAMES.map((game) => (
              <span key={game} className="transition hover:text-slate-300">{game}</span>
            ))}
          </div>
        </section>

        {/* --- FEATURES SECTION --- */}
        <section className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-3xl">
              Tại sao chọn <span className="text-emerald-400">NXX315?</span>
            </h2>
            <p className="mt-3 text-xs text-slate-400 sm:text-sm">
              Chúng tôi xây dựng nền tảng dựa trên sự tin cậy, tốc độ và bảo mật. 
              Mọi giao dịch đều được xử lý minh bạch.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {FEATURES.map((feat) => (
              <div 
                key={feat.title} 
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition hover:bg-white/[0.04]"
              >
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${feat.bg} ${feat.color}`}>
                  <feat.icon size={20} />
                </div>
                <h3 className="mb-2 text-sm font-bold text-white sm:text-base">{feat.title}</h3>
                <p className="text-[11px] leading-relaxed text-slate-400 sm:text-sm">{feat.desc}</p>
                
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 transition group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </section>

        {/* --- HOW IT WORKS --- */}
        <section id="how-it-works" className="relative z-10 border-t border-white/5 bg-white/[0.01] py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-10 text-center">
              <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-3xl">
                Quy trình <span className="text-emerald-400">3 bước</span>
              </h2>
              <p className="mt-3 text-xs text-slate-400 sm:text-sm">Bắt đầu chỉ trong chưa đầy 1 phút.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {STEPS.map((step, idx) => (
                <div key={step.n} className="relative flex flex-col items-center text-center">
                  {idx !== STEPS.length - 1 && (
                    <div className="absolute top-7 left-[60%] hidden h-[1px] w-[80%] bg-gradient-to-r from-emerald-500/50 to-transparent md:block" />
                  )}
                  
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#09090b] text-lg font-black text-emerald-400 shadow-xl shadow-emerald-500/10">
                    {step.n}
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-white sm:text-base">{step.title}</h3>
                  <p className="mt-1 text-[11px] text-slate-400 sm:text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- CTA SECTION --- */}
        <section className="relative z-10 px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-8 text-center backdrop-blur-xl sm:p-12">
            <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-4xl">
              Sẵn sàng trải nghiệm?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[11px] text-slate-400 sm:text-sm">
              Tham gia cùng hàng ngàn game thủ khác. Nạp game giá rẻ, kiếm thưởng 
              khủng và rút tiền về ví ngân hàng của bạn ngay hôm nay.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/register")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-bold text-black transition hover:bg-emerald-400 sm:w-auto sm:text-sm"
              >
                Đăng ký miễn phí <ChevronRight size={16} />
              </button>
              <button
                onClick={() => navigate("/support")}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-transparent px-5 py-3 text-xs font-bold text-white transition hover:bg-white/5 sm:w-auto sm:text-sm"
              >
                Liên hệ hỗ trợ
              </button>
            </div>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="relative z-10 border-t border-white/5 bg-[#09090b] px-4 py-6 text-center text-[10px] text-slate-600 sm:px-6 sm:text-xs">
          <div className="mx-auto max-w-7xl">
            <p>© {new Date().getFullYear()} NXX315 Studio. Nạp game chính hãng & Kiếm thưởng miễn phí.</p>
            <p className="mt-2">Robux là thương hiệu của Roblox Corporation. Các tựa game khác thuộc bản quyền của chủ sở hữu tương ứng.</p>
          </div>
        </footer>
      </div>
    </>
  );
}