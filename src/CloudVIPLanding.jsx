import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Coins,
  ShieldCheck,
  Users,
  Star,
  ArrowRight,
  CheckCircle2,
  Gamepad2,
  Zap,
  Lock,
  Wallet,
  Send,
  Mail,
  MessageCircle,
  Plus,
  Minus,
  Menu,
  X,
  Search,
  Trophy,
  Flame,
  Clock,
  Gift,
  Sparkles,
} from "lucide-react";

const HOW_IT_WORKS = [
  {
    n: "01",
    title: "Tạo tài khoản",
    desc: "Đăng ký miễn phí và bắt đầu sử dụng NXX315.",
    icon: Users,
  },
  {
    n: "02",
    title: "Hoàn thành nhiệm vụ",
    desc: "Chọn nhiệm vụ phù hợp và nhận Coin theo từng nhiệm vụ.",
    icon: Zap,
  },
  {
    n: "03",
    title: "Đổi phần thưởng",
    desc: "Dùng Coin để đổi các sản phẩm và phần thưởng có trong Shop.",
    icon: Gift,
  },
];

const WHY_CARDS = [
  {
    icon: Zap,
    title: "Dễ sử dụng",
    desc: "Giao diện đơn giản, tối ưu cho cả điện thoại và máy tính.",
  },
  {
    icon: ShieldCheck,
    title: "Ưu tiên an toàn",
    desc: "Hệ thống có các lớp kiểm tra nhằm hạn chế gian lận và lạm dụng.",
  },
  {
    icon: Wallet,
    title: "Theo dõi Coin",
    desc: "Dễ dàng xem số dư, lịch sử nhiệm vụ và các giao dịch của bạn.",
  },
];

const FAQS = [
  {
    q: "NXX315 hoạt động như thế nào?",
    a: "Bạn tạo tài khoản, hoàn thành các nhiệm vụ đủ điều kiện để nhận Coin, sau đó có thể sử dụng Coin cho những phần thưởng được hỗ trợ trong Shop.",
  },
  {
    q: "Có cần nạp tiền để sử dụng không?",
    a: "Bạn có thể đăng ký và bắt đầu sử dụng các tính năng kiếm Coin mà không cần nạp tiền.",
  },
  {
    q: "Bao lâu thì nhận được phần thưởng?",
    a: "Thời gian xử lý phụ thuộc vào từng loại phần thưởng và trạng thái kiểm tra đơn. Hãy xem thông tin cụ thể trong Shop trước khi đổi.",
  },
  {
    q: "Tại sao nhiệm vụ có thể không được cộng Coin?",
    a: "Một số nhiệm vụ cần nhà cung cấp xác nhận hoàn thành. Nếu trạng thái chưa được xác nhận, Coin có thể chưa được cộng ngay.",
  },
];

const SOCIAL_LINKS = [
  { icon: Send, label: "Telegram", href: "https://t.me/nxx315" },
  { icon: MessageCircle, label: "Zalo", href: "https://zalo.me/0865245988" },
  { icon: Mail, label: "Email", href: "mailto:nxx315hub@gmail.com" },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-sky-200">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-bold text-slate-900 sm:text-base">{q}</span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600">
          {open ? <Minus size={15} /> : <Plus size={15} />}
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-3">
          <p className="text-sm leading-6 text-slate-600">{a}</p>
        </div>
      )}
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 shadow-lg shadow-sky-600/20">
        <Coins size={20} className="text-white" />
      </div>
      <div className="leading-none">
        <div className="text-[15px] font-black tracking-tight text-slate-950">
          NXX315
        </div>
        <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-sky-600">
          Studio Rewards
        </div>
      </div>
    </div>
  );
}

export default function CloudVIPLanding() {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenu(false);
  };

  return (
    <div className="min-h-screen bg-white font-[Be_Vietnam_Pro] text-slate-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap');
        html { scroll-behavior: smooth; }
      `}</style>

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Logo />

          <nav className="hidden items-center gap-7 md:flex">
            <button onClick={() => scrollTo("how")} className="text-sm font-semibold text-slate-600 transition hover:text-sky-600">
              Cách hoạt động
            </button>
            <button onClick={() => scrollTo("why")} className="text-sm font-semibold text-slate-600 transition hover:text-sky-600">
              Tính năng
            </button>
            <button onClick={() => scrollTo("faq")} className="text-sm font-semibold text-slate-600 transition hover:text-sky-600">
              FAQ
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/login")}
              className="hidden rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:block"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => navigate("/register")}
              className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700"
            >
              Đăng ký
            </button>
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 md:hidden"
            >
              {mobileMenu ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="border-t border-slate-100 bg-white px-5 py-4 md:hidden">
            <div className="mx-auto max-w-6xl space-y-1">
              <button onClick={() => scrollTo("how")} className="block w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-sky-50">
                Cách hoạt động
              </button>
              <button onClick={() => scrollTo("why")} className="block w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-sky-50">
                Tính năng
              </button>
              <button onClick={() => scrollTo("faq")} className="block w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-sky-50">
                FAQ
              </button>
              <button onClick={() => navigate("/login")} className="mt-2 block w-full rounded-xl border border-slate-200 py-3 text-center text-sm font-bold text-slate-700">
                Đăng nhập
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <main>
        <section className="relative overflow-hidden border-b border-slate-100">
          <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-sky-100/70 blur-3xl" />
          <div className="absolute -right-32 top-20 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-14 sm:pb-20 sm:pt-20">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3.5 py-2 text-xs font-bold text-sky-700">
                  <Sparkles size={13} />
                  Nền tảng NXX315 Studio Rewards
                </div>

                <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.1] tracking-tight text-slate-950 sm:text-6xl">
                  Kiếm Coin.
                  <br />
                  <span className="text-sky-600">Đổi phần thưởng.</span>
                </h1>

                <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                  Hoàn thành nhiệm vụ, tích lũy Coin và sử dụng Coin cho những
                  phần thưởng được hỗ trợ trên NXX315.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => navigate("/register")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-sky-600/20 transition hover:bg-sky-700"
                  >
                    Bắt đầu ngay
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => scrollTo("how")}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50"
                  >
                    Xem cách hoạt động
                  </button>
                </div>

                <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-sky-600" />
                    Đăng ký miễn phí
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-sky-600" />
                    Theo dõi số dư
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-sky-600" />
                    Hỗ trợ trực tuyến
                  </span>
                </div>
              </div>

              {/* Dashboard preview */}
              <div className="relative">
                <div className="rounded-[28px] border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/10">
                  <div className="overflow-hidden rounded-[22px] bg-slate-50">
                    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">NXX315 DASHBOARD</span>
                    </div>

                    <div className="p-5 sm:p-7">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-semibold text-slate-400">Số dư Coin</p>
                          <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">
                            1.250.000
                          </p>
                        </div>
                        <div className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700">
                          Coin
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50">
                            <CheckCircle2 size={17} className="text-sky-600" />
                          </div>
                          <p className="mt-3 text-xs font-semibold text-slate-400">Nhiệm vụ</p>
                          <p className="mt-1 text-lg font-black text-slate-900">12</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50">
                            <Trophy size={17} className="text-sky-600" />
                          </div>
                          <p className="mt-3 text-xs font-semibold text-slate-400">Trạng thái</p>
                          <p className="mt-1 text-lg font-black text-slate-900">Hoạt động</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                          <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <Gamepad2 size={14} className="text-sky-600" />
                            Roblox
                          </span>
                          <span className="text-xs font-bold text-slate-500">Đổi thưởng</span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                          <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <Flame size={14} className="text-sky-600" />
                            Nhiệm vụ
                          </span>
                          <span className="text-xs font-bold text-emerald-600">+ Coin</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl sm:block">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50">
                      <ShieldCheck size={16} className="text-sky-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400">Hệ thống</p>
                      <p className="text-xs font-black text-slate-900">Đang hoạt động</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW */}
        <section id="how" className="mx-auto max-w-6xl px-5 py-20">
          <div className="max-w-2xl">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-sky-600">
              Bắt đầu thật đơn giản
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Ba bước để bắt đầu
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              Không cần thao tác phức tạp. Mọi thứ được thiết kế để bạn dễ
              hiểu và dễ theo dõi.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {HOW_IT_WORKS.map(({ n, title, desc, icon: Icon }) => (
              <div
                key={n}
                className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-900/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-600 text-white">
                    <Icon size={19} />
                  </div>
                  <span className="text-3xl font-black text-slate-100">{n}</span>
                </div>
                <h3 className="mt-6 text-lg font-extrabold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* WHY */}
        <section id="why" className="border-y border-slate-100 bg-slate-50/70">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.18em] text-sky-600">
                  Vì sao NXX315
                </span>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Gọn, rõ ràng và tập trung vào trải nghiệm
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  NXX315 được xây dựng để việc kiếm Coin, theo dõi tài khoản
                  và đổi thưởng trở nên dễ hiểu hơn trên mọi thiết bị.
                </p>

                <button
                  onClick={() => navigate("/register")}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-600/20 hover:bg-sky-700"
                >
                  Tạo tài khoản
                  <ArrowRight size={15} />
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {WHY_CARDS.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50">
                      <Icon size={18} className="text-sky-600" />
                    </div>
                    <h3 className="mt-4 text-base font-extrabold text-slate-950">{title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-500">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECURITY */}
        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="overflow-hidden rounded-[30px] border border-sky-100 bg-sky-600">
            <div className="grid gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[1fr_.7fr] lg:items-center">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white">
                  <Lock size={20} />
                </div>
                <h2 className="mt-5 text-2xl font-black tracking-tight text-white sm:text-3xl">
                  Ưu tiên an toàn tài khoản
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-sky-50">
                  Hệ thống áp dụng các biện pháp kiểm tra và giới hạn để giảm
                  hành vi gian lận, đồng thời hỗ trợ theo dõi lịch sử hoạt động.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  ["01", "Kiểm tra hoạt động"],
                  ["02", "Theo dõi giao dịch"],
                  ["03", "Bảo vệ tài khoản"],
                  ["04", "Hỗ trợ người dùng"],
                ].map(([n, t]) => (
                  <div key={n} className="rounded-2xl border border-white/15 bg-white/10 p-4">
                    <span className="text-xs font-black text-sky-100">{n}</span>
                    <p className="mt-2 text-xs font-bold leading-5 text-white">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl px-5 py-20">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700">
              <Search size={13} />
              Giải đáp
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Câu hỏi thường gặp
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
              Một vài thông tin cơ bản trước khi bạn bắt đầu.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {FAQS.map((item, index) => (
              <FAQItem key={index} {...item} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-5 pb-20">
          <div className="rounded-[30px] border border-sky-100 bg-sky-50 px-6 py-12 text-center sm:px-10">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-600/20">
              <Coins size={21} />
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Sẵn sàng bắt đầu?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
              Tạo tài khoản NXX315 miễn phí và khám phá hệ thống ngay hôm nay.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-sky-600/20 transition hover:bg-sky-700"
            >
              Đăng ký miễn phí
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 bg-white px-5 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <Logo />
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
                Nền tảng NXX315 Studio Rewards — kiếm Coin, quản lý số dư và
                đổi phần thưởng được hỗ trợ trên hệ thống.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                Khám phá
              </h4>
              <div className="mt-4 space-y-3 text-sm font-semibold text-slate-600">
                <button onClick={() => navigate("/register")} className="block hover:text-sky-600">
                  Đăng ký kiếm Coin
                </button>
                <button onClick={() => navigate("/tasks")} className="block hover:text-sky-600">
                  Làm nhiệm vụ
                </button>
                <button onClick={() => navigate("/store")} className="block hover:text-sky-600">
                  Đổi thưởng
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                Liên hệ
              </h4>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <a href="mailto:nxx315hub@gmail.com" className="flex items-center gap-2 hover:text-sky-600">
                  <Mail size={15} className="text-sky-600" />
                  nxx315hub@gmail.com
                </a>
                <a href="https://zalo.me/0865245988" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-sky-600">
                  <MessageCircle size={15} className="text-sky-600" />
                  Zalo 0865245988
                </a>
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-sky-600" />
                  Hỗ trợ trực tuyến
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-100 pt-6 text-center">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} NXX315 Studio Rewards. Robux là
              thương hiệu của Roblox Corporation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
