import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Gift,
  Gamepad2,
  Target,
  Bot,
  Users,
  Sparkles,
  CheckCircle2,
  PlayCircle,
  ChevronRight,
  Globe2,
  HeartHandshake,
} from "lucide-react";

// =====================================================
// NXX315 STUDIO — ABOUT PAGE
// Theme: White + Ocean Blue
// =====================================================

const FEATURES = [
  {
    icon: Gift,
    title: "Rewards",
    desc: "Khám phá hệ thống phần thưởng và các hoạt động tích điểm trên NXX315 Studio Rewards.",
  },
  {
    icon: Gamepad2,
    title: "Gaming",
    desc: "Tập trung xây dựng những tiện ích và trải nghiệm dành cho cộng đồng game thủ.",
  },
  {
    icon: Target,
    title: "Nhiệm vụ",
    desc: "Tham gia các nhiệm vụ phù hợp để tích lũy điểm và khám phá thêm nhiều hoạt động.",
  },
  {
    icon: Bot,
    title: "AI Support",
    desc: "Trợ lý AI giúp giải đáp những câu hỏi thường gặp và hỗ trợ người dùng.",
  },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: "An toàn",
    desc: "Ưu tiên bảo vệ tài khoản và thông tin của người dùng trong quá trình sử dụng nền tảng.",
  },
  {
    icon: Sparkles,
    title: "Đơn giản",
    desc: "Thiết kế giao diện rõ ràng để mọi người có thể dễ dàng tìm và sử dụng các tính năng.",
  },
  {
    icon: Globe2,
    title: "Minh bạch",
    desc: "Thông tin về dịch vụ, phần thưởng và các hoạt động được trình bày rõ ràng.",
  },
  {
    icon: HeartHandshake,
    title: "Cộng đồng",
    desc: "Xây dựng một không gian thân thiện và hướng đến cộng đồng người dùng.",
  },
];

const TIMELINE = [
  {
    year: "01",
    title: "Bắt đầu",
    desc: "NXX315 Studio bắt đầu phát triển các sản phẩm và nội dung dành cho cộng đồng.",
  },
  {
    year: "02",
    title: "NXX315 Rewards",
    desc: "Hệ thống Rewards được xây dựng để mang đến nhiều hoạt động và phần thưởng hơn.",
  },
  {
    year: "03",
    title: "Mở rộng",
    desc: "Tiếp tục phát triển thêm các tiện ích, dịch vụ và trải nghiệm cho người dùng.",
  },
];

export default function About() {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <>
      {/* =====================================================
          GOOGLE FONT
      ===================================================== */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      <div
        className="min-h-screen w-full overflow-hidden bg-[#f8fbff] text-slate-900"
        style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      >
        {/* =====================================================
            BACKGROUND DECORATION
        ===================================================== */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-sky-200/30 blur-3xl" />
          <div className="absolute right-[-180px] top-[25%] h-[420px] w-[420px] rounded-full bg-blue-200/20 blur-3xl" />
          <div className="absolute bottom-[-200px] left-[25%] h-[400px] w-[400px] rounded-full bg-cyan-100/40 blur-3xl" />
        </div>

        {/* =====================================================
            NAVBAR
        ===================================================== */}
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
            {/* LOGO */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/20">
                <Sparkles
                  size={19}
                  className="text-white"
                  fill="currentColor"
                />
              </div>

              <div className="text-left leading-none">
                <div className="text-[15px] font-extrabold tracking-tight text-slate-900">
                  NXX315
                </div>
                <div className="mt-1 text-[10px] font-semibold text-sky-600">
                  STUDIO
                </div>
              </div>
            </button>

            {/* DESKTOP NAV */}
            <nav className="hidden items-center gap-7 text-sm font-medium text-slate-500 lg:flex">
              <button
                onClick={() => scrollToSection("about")}
                className="transition hover:text-sky-600"
              >
                Giới thiệu
              </button>

              <button
                onClick={() => navigate("/tasks")}
                className="transition hover:text-sky-600"
              >
                Rewards
              </button>

              <button
                onClick={() => navigate("/videos")}
                className="transition hover:text-sky-600"
              >
                Videos
              </button>

              <button
                onClick={() => navigate("/feed")}
                className="transition hover:text-sky-600"
              >
                Cộng đồng
              </button>

              <button
                onClick={() => navigate("/help")}
                className="transition hover:text-sky-600"
              >
                Hỗ trợ
              </button>
            </nav>

            {/* ACTIONS */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigate("/login")}
                className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:block"
              >
                Đăng nhập
              </button>

              <button
                onClick={() => navigate("/register")}
                className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-500/20 transition hover:bg-sky-600"
              >
                Bắt đầu
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </header>

        {/* =====================================================
            HERO
        ===================================================== */}
        <main className="relative z-10">
          <section className="relative px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8">
            <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
              {/* LEFT */}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-[11px] font-bold text-sky-600 sm:text-xs">
                  <Sparkles size={13} />
                  NXX315 STUDIO REWARDS
                </div>

                <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.12] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  Một hệ sinh thái
                  <span className="block text-sky-500">
                    dành cho cộng đồng.
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                  NXX315 Studio Rewards là nền tảng được xây dựng với mục tiêu
                  mang đến những trải nghiệm Rewards, gaming và tiện ích đơn
                  giản, dễ sử dụng cho cộng đồng.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => navigate("/tasks")}
                    className="group flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-600"
                  >
                    Khám phá Rewards
                    <ArrowRight
                      size={17}
                      className="transition group-hover:translate-x-1"
                    />
                  </button>

                  <button
                    onClick={() => navigate("/videos")}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600"
                  >
                    <PlayCircle size={17} />
                    Xem Videos
                  </button>
                </div>

                {/* TRUST */}
                <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-medium text-slate-500 sm:text-xs">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-sky-500" />
                    Giao diện dễ sử dụng
                  </span>

                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-sky-500" />
                    Ưu tiên an toàn
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Users size={14} className="text-sky-500" />
                    Hướng đến cộng đồng
                  </span>
                </div>
              </div>

              {/* RIGHT VISUAL */}
              <div className="relative mx-auto w-full max-w-[520px]">
                <div className="absolute inset-8 rounded-[32px] bg-sky-400/20 blur-3xl" />

                <div className="relative overflow-hidden rounded-[28px] border border-sky-100 bg-white p-3 shadow-2xl shadow-sky-900/10">
                  <div className="overflow-hidden rounded-[20px] bg-gradient-to-br from-sky-500 via-blue-600 to-sky-700 p-6 sm:p-8">
                    {/* Decorative circles */}
                    <div className="absolute right-[-45px] top-[-45px] h-40 w-40 rounded-full border border-white/10" />
                    <div className="absolute bottom-[-60px] left-[-40px] h-44 w-44 rounded-full border border-white/10" />

                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur">
                          <Sparkles size={20} />
                        </div>

                        <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold text-white/90">
                          NXX315
                        </span>
                      </div>

                      <div className="mt-16">
                        <div className="text-xs font-semibold text-sky-100">
                          NXX315 STUDIO
                        </div>

                        <div className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                          Rewards
                        </div>

                        <p className="mt-3 max-w-xs text-xs leading-5 text-sky-100 sm:text-sm">
                          Khám phá. Tích điểm. Nhận thưởng.
                        </p>
                      </div>

                      <div className="mt-12 flex items-end justify-between">
                        <div>
                          <div className="text-[10px] text-sky-100">
                            Nền tảng
                          </div>
                          <div className="mt-1 text-sm font-bold text-white">
                            NXX315 Studio
                          </div>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sky-600">
                          <ArrowRight size={18} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =====================================================
              ABOUT
          ===================================================== */}
          <section
            id="about"
            className="scroll-mt-24 border-y border-slate-200 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
          >
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-sky-500">
                    Về chúng tôi
                  </div>

                  <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                    NXX315 Studio
                    <span className="block text-sky-500">
                      là gì?
                    </span>
                  </h2>
                </div>

                <div>
                  <p className="text-sm leading-7 text-slate-600 sm:text-base">
                    NXX315 Studio là một dự án tập trung phát triển các sản
                    phẩm, tiện ích và nội dung dành cho cộng đồng. NXX315 Studio
                    Rewards là một phần trong hệ sinh thái đó, hướng đến việc
                    tạo ra một nơi để người dùng khám phá các hoạt động,
                    tích điểm và nhận phần thưởng.
                  </p>

                  <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
                    Chúng tôi muốn giữ mọi thứ đơn giản, dễ hiểu và thuận tiện
                    để người dùng có thể tập trung vào trải nghiệm thay vì phải
                    mất thời gian tìm hiểu một giao diện phức tạp.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* =====================================================
              FEATURES
          ===================================================== */}
          <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="max-w-2xl">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-sky-500">
                  Hệ sinh thái
                </div>

                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Những gì bạn có thể
                  <span className="text-sky-500"> khám phá</span>
                </h2>

                <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
                  NXX315 Studio tiếp tục phát triển thêm nhiều tính năng để
                  mang đến trải nghiệm thuận tiện hơn cho cộng đồng.
                </p>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {FEATURES.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.title}
                      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-900/5"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-500 transition group-hover:bg-sky-500 group-hover:text-white">
                        <Icon size={21} />
                      </div>

                      <h3 className="mt-5 text-base font-extrabold text-slate-900">
                        {feature.title}
                      </h3>

                      <p className="mt-2 text-xs leading-6 text-slate-500 sm:text-sm">
                        {feature.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* =====================================================
              VALUES
          ===================================================== */}
          <section className="border-y border-slate-200 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="text-center">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-sky-500">
                  Giá trị
                </div>

                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Điều chúng tôi hướng đến
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Mỗi tính năng được xây dựng với mục tiêu tạo ra trải nghiệm
                  rõ ràng, thuận tiện và thân thiện hơn.
                </p>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {VALUES.map((value) => {
                  const Icon = value.icon;

                  return (
                    <div
                      key={value.title}
                      className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sky-500 shadow-sm">
                        <Icon size={19} />
                      </div>

                      <h3 className="mt-4 text-sm font-extrabold text-slate-900 sm:text-base">
                        {value.title}
                      </h3>

                      <p className="mt-2 text-xs leading-6 text-slate-500 sm:text-sm">
                        {value.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* =====================================================
              TIMELINE
          ===================================================== */}
          <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-sky-500">
                    Hành trình
                  </div>

                  <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                    Từ một ý tưởng
                    <span className="block text-sky-500">
                      đến một hệ sinh thái.
                    </span>
                  </h2>

                  <p className="mt-4 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
                    NXX315 Studio được phát triển từng bước với mục tiêu tạo
                    ra những sản phẩm hữu ích và gần gũi với cộng đồng.
                  </p>
                </div>

                <div className="space-y-4">
                  {TIMELINE.map((item, index) => (
                    <div
                      key={item.year}
                      className="relative flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-xs font-black text-sky-600">
                        {item.year}
                      </div>

                      <div>
                        <div className="text-base font-extrabold text-slate-900">
                          {item.title}
                        </div>

                        <p className="mt-1 text-xs leading-6 text-slate-500 sm:text-sm">
                          {item.desc}
                        </p>
                      </div>

                      {index !== TIMELINE.length - 1 && (
                        <div className="absolute -bottom-5 left-[41px] z-10 hidden h-5 w-px bg-sky-200 sm:block" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* =====================================================
              CTA
          ===================================================== */}
          <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 to-blue-700 px-6 py-12 text-center shadow-xl shadow-sky-900/15 sm:px-10 sm:py-16">
                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border border-white/10" />
                <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full border border-white/10" />

                <div className="relative">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur">
                    <Sparkles size={22} />
                  </div>

                  <h2 className="mt-5 text-2xl font-black tracking-tight text-white sm:text-4xl">
                    Khám phá NXX315 Studio Rewards
                  </h2>

                  <p className="mx-auto mt-3 max-w-xl text-xs leading-6 text-sky-100 sm:text-sm">
                    Bắt đầu trải nghiệm các tính năng và hoạt động đang có
                    trên nền tảng NXX315 Studio.
                  </p>

                  <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                    <button
                      onClick={() => navigate("/tasks")}
                      className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-sky-600 transition hover:bg-sky-50"
                    >
                      Bắt đầu ngay
                      <ChevronRight size={17} />
                    </button>

                    <button
                      onClick={() => navigate("/help")}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/15"
                    >
                      Trung tâm hỗ trợ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* =====================================================
            FOOTER
        ===================================================== */}
        <footer className="border-t border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500">
                    <Sparkles
                      size={15}
                      className="text-white"
                      fill="currentColor"
                    />
                  </div>

                  <span className="text-sm font-extrabold text-slate-900">
                    NXX315 Studio
                  </span>
                </div>

                <p className="mt-2 text-[11px] text-slate-400">
                  Xây dựng trải nghiệm cho cộng đồng.
                </p>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
                <button
                  onClick={() => navigate("/help")}
                  className="transition hover:text-sky-600"
                >
                  Hỗ trợ
                </button>

                <button
                  onClick={() => navigate("/terms")}
                  className="transition hover:text-sky-600"
                >
                  Điều khoản
                </button>

                <button
                  onClick={() => navigate("/privacy")}
                  className="transition hover:text-sky-600"
                >
                  Chính sách
                </button>
              </div>
            </div>

            <div className="mt-7 border-t border-slate-100 pt-5 text-[10px] text-slate-400 sm:text-xs">
              © {new Date().getFullYear()} NXX315 Studio. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
