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
  Send,
  Mail,
  MessageCircle,
  Plus,
  Minus,
  Menu,
  X,
  Trophy,
  Flame,
  Gift,
  Filter,
  Lock,
  Globe,
  Clock,
  TrendingUp,
  Award,
  Heart,
  Facebook,
  Youtube,
} from "lucide-react";

// ============ MÀU CHỦ ĐẠO ============
const BLUE = "#087EA4";
const BLUE_LIGHT = "#F1F8FA";
const BLUE_BORDER = "#CDE8EF";

const AVATAR_URL =
  "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/avatars";

// ============ DATA ============

const HOW_IT_WORKS = [
  {
    n: "01",
    icon: Users,
    title: "Tạo tài khoản miễn phí",
    desc: "Đăng ký chỉ trong 30 giây, không cần nạp tiền, không cần SĐT.",
  },
  {
    n: "02",
    icon: Zap,
    title: "Làm nhiệm vụ đơn giản",
    desc: "Xem video, chơi mini game, mời bạn bè... để nhận Coin vào ví.",
  },
  {
    n: "03",
    icon: Gift,
    title: "Đổi thưởng hấp dẫn",
    desc: "Đổi Coin lấy Robux, thẻ điện thoại, gift card và nhiều phần quà khác.",
  },
];

const STATS = [
  { value: "10.000+", label: "Người dùng", icon: Users },
  { value: "500tr+", label: "Đã chi trả", icon: TrendingUp },
  { value: "24h", label: "Rút tiền nhanh", icon: Clock },
  { value: "4.9/5", label: "Đánh giá", icon: Star },
];

const SOCIAL_AVATARS = [
  `${AVATAR_URL}/user-1.jpg`,
  `${AVATAR_URL}/user-2.jpg`,
  `${AVATAR_URL}/user-3.jpg`,
  `${AVATAR_URL}/user-4.jpg`,
];

const TESTIMONIALS = [
  {
    stars: 5,
    text: "Mình làm nhiệm vụ đều đặn, mỗi tháng đổi được 1.700 Robux. Nạp thẳng vào tài khoản Roblox luôn, nhanh gọn.",
    name: "Minh Tuấn",
    role: "Admin group 120k thành viên",
    avatar: `${AVATAR_URL}/avatar-1.jpg`,
  },
  {
    stars: 5,
    text: "Hệ thống uy tín, admin duyệt nhanh. Mình đổi thưởng 3 lần rồi, lần nào cũng nhận đúng và đủ.",
    name: "Thu Hà",
    role: "Content Creator",
    avatar: `${AVATAR_URL}/avatar-2.jpg`,
  },
  {
    stars: 5,
    text: "Không cần nạp tiền, chỉ cần làm nhiệm vụ là có Coin. App dễ dùng, giao diện đẹp.",
    name: "Hoàng Nam",
    role: "Streamer",
    avatar: `${AVATAR_URL}/avatar-3.jpg`,
  },
];

const FAQS = [
  {
    q: "NXX315 là gì?",
    a: "NXX315 Studio Rewards là nền tảng kiếm thưởng trực tuyến tại Việt Nam. Người dùng hoàn thành nhiệm vụ đơn giản (xem video, chơi game, mời bạn bè) để nhận Coin, sau đó đổi Coin lấy Robux, thẻ điện thoại hoặc gift card.",
  },
  {
    q: "Tôi có phải nạp tiền không?",
    a: "Hoàn toàn miễn phí. Bạn không cần nạp bất kỳ khoản tiền nào. Chỉ cần làm nhiệm vụ để kiếm Coin, sau đó đổi thưởng.",
  },
  {
    q: "Khi nào tôi nhận được phần thưởng?",
    a: "Sau khi bạn đặt đơn đổi thưởng, admin sẽ xử lý trong vòng 24 giờ (thường nhanh hơn). Robux sẽ được nạp trực tiếp vào tài khoản Roblox của bạn; thẻ điện thoại sẽ được gửi qua notification hoặc email.",
  },
  {
    q: "Hệ thống có uy tín không?",
    a: "Chúng tôi đã hoạt động hơn 2 năm, với hơn 10.000 người dùng và hơn 500 triệu đồng đã chi trả. Hệ thống có chứng chỉ SSL, bảo mật 2 lớp, và admin xử lý thủ công để đảm bảo mọi giao dịch minh bạch.",
  },
  {
    q: "Có mất phí gì không?",
    a: "Không. NXX315 hoàn toàn miễn phí. Không có phí ẩn, không phí duy trì tài khoản, không phí rút thưởng.",
  },
  {
    q: "Tôi có thể tạo nhiều tài khoản không?",
    a: "Không. Mỗi người chỉ được tạo 1 tài khoản. Chúng tôi sử dụng hệ thống kiểm tra IP, fingerprint và hành vi để phát hiện gian lận. Tài khoản vi phạm sẽ bị khoá vĩnh viễn.",
  },
  {
    q: "NXX315 bảo mật thông tin của tôi như thế nào?",
    a: "Chúng tôi sử dụng SSL 256-bit, mã hoá mật khẩu bằng bcrypt, xác thực 2 lớp, và không lưu trữ thông tin thẻ. Toàn bộ dữ liệu được bảo vệ theo tiêu chuẩn quốc tế.",
  },
  {
    q: "Tôi có thể liên hệ hỗ trợ bằng cách nào?",
    a: "Bạn có thể chat qua Zalo 0865245988, gửi email tới nxx315hub@gmail.com, hoặc qua Telegram. Thời gian phản hồi trung bình 5-15 phút.",
  },
];

const SOCIAL_LINKS = [
  { icon: MessageCircle, label: "Zalo", href: "https://zalo.me/0865245988" },
  { icon: Send, label: "Telegram", href: "https://t.me/nxx315" },
  { icon: Mail, label: "Email", href: "mailto:nxx315hub@gmail.com" },
  { icon: Facebook, label: "Facebook", href: "https://facebook.com/nxx315" },
];
// ============ SUB-COMPONENTS ============

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-slate-900 sm:text-base">
          {q}
        </span>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500"
          style={{ backgroundColor: BLUE_LIGHT }}
        >
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
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
        style={{ backgroundColor: BLUE }}
      >
        <Coins size={19} />
      </div>
      <div className="leading-none">
        <div className="text-[15px] font-extrabold tracking-tight text-slate-950">
          NXX315
        </div>
        <div
          className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em]"
          style={{ color: BLUE }}
        >
          Studio Rewards
        </div>
      </div>
    </div>
  );
}

function TrustBadge({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: BLUE_LIGHT }}
      >
        <Icon size={18} style={{ color: BLUE }} />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
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
    <div className="min-h-screen bg-white font-[Inter] text-slate-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        html { scroll-behavior: smooth; }
      `}</style>

      {/* ============ NAVBAR ============ */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Logo />

          <nav className="hidden items-center gap-8 md:flex">
            <button
              onClick={() => scrollTo("how")}
              className="text-sm font-medium text-slate-600 hover:text-slate-950"
            >
              Cách hoạt động
            </button>
            <button
              onClick={() => scrollTo("trust")}
              className="text-sm font-medium text-slate-600 hover:text-slate-950"
            >
              Uy tín
            </button>
            <button
              onClick={() => scrollTo("testimonials")}
              className="text-sm font-medium text-slate-600 hover:text-slate-950"
            >
              Đánh giá
            </button>
            <button
              onClick={() => scrollTo("faq")}
              className="text-sm font-medium text-slate-600 hover:text-slate-950"
            >
              FAQ
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/login")}
              className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:block"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => navigate("/register")}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
              style={{ backgroundColor: BLUE }}
            >
              Đăng ký
            </button>
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 md:hidden"
            >
              {mobileMenu ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="border-t border-slate-200 bg-white px-5 py-4 md:hidden">
            <div className="mx-auto max-w-6xl space-y-1">
              <button
                onClick={() => scrollTo("how")}
                className="block w-full px-3 py-3 text-left text-sm font-medium text-slate-700"
              >
                Cách hoạt động
              </button>
              <button
                onClick={() => scrollTo("trust")}
                className="block w-full px-3 py-3 text-left text-sm font-medium text-slate-700"
              >
                Uy tín
              </button>
              <button
                onClick={() => scrollTo("testimonials")}
                className="block w-full px-3 py-3 text-left text-sm font-medium text-slate-700"
              >
                Đánh giá
              </button>
              <button
                onClick={() => scrollTo("faq")}
                className="block w-full px-3 py-3 text-left text-sm font-medium text-slate-700"
              >
                FAQ
              </button>
              <button
                onClick={() => navigate("/login")}
                className="mt-2 block w-full rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ============ HERO ============ */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
            <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
              <div>
                {/* Stars */}
                <div
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm"
                  style={{
                    borderColor: BLUE_BORDER,
                    backgroundColor: BLUE_LIGHT,
                    color: BLUE,
                  }}
                >
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={11}
                        className="fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  4.9/5 từ 3.000+ thành viên
                </div>

                <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-[1.08] tracking-[-0.035em] text-slate-950 sm:text-6xl">
                  Kiếm Coin.
                  <br />
                  <span style={{ color: BLUE }}>Đổi thưởng dễ dàng.</span>
                </h1>

                <p className="mt-5 max-w-xl text-[15px] leading-7 text-slate-500 sm:text-base">
                  Hoàn thành nhiệm vụ đơn giản, nhận Coin và đổi ngay Robux,
                  thẻ điện thoại, gift card cùng nhiều phần quà hấp dẫn khác.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => navigate("/register")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
                    style={{
                      backgroundColor: BLUE,
                      boxShadow: "0 8px 20px -6px rgba(8,126,164,0.4)",
                    }}
                  >
                    Bắt đầu ngay
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => scrollTo("how")}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    Xem cách hoạt động
                  </button>
                </div>

                <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} style={{ color: BLUE }} />
                    Không cần nạp tiền
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} style={{ color: BLUE }} />
                    Rút tiền trong 24h
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} style={{ color: BLUE }} />
                    Bảo mật SSL 256-bit
                  </span>
                </div>

                <div className="mt-7 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {SOCIAL_AVATARS.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt="User"
                        className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=U${i + 1}&background=087EA4&color=fff&size=64`;
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-slate-600">
                    <b className="text-slate-900">10.000+</b> user đang kiếm Coin
                    mỗi ngày
                  </p>
                </div>
              </div>

              {/* DASHBOARD MOCKUP */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-rose-400" />
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wide text-slate-400">
                      NXX315 DASHBOARD
                    </span>
                  </div>

                  <div className="p-5 sm:p-7">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-400">
                          Số dư Coin
                        </p>
                        <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950">
                          1.250.000
                        </p>
                      </div>
                      <div
                        className="rounded-lg px-3 py-2 text-xs font-semibold"
                        style={{ backgroundColor: BLUE_LIGHT, color: BLUE }}
                      >
                        Coin
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-lg"
                          style={{ backgroundColor: BLUE_LIGHT }}
                        >
                          <Trophy size={17} style={{ color: BLUE }} />
                        </div>
                        <p className="mt-3 text-xs font-medium text-slate-400">
                          Cấp độ
                        </p>
                        <p className="mt-1 text-lg font-extrabold text-slate-900">
                          Siêu sao
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-lg"
                          style={{ backgroundColor: BLUE_LIGHT }}
                        >
                          <CheckCircle2 size={17} style={{ color: BLUE }} />
                        </div>
                        <p className="mt-3 text-xs font-medium text-slate-400">
                          Nhiệm vụ
                        </p>
                        <p className="mt-1 text-lg font-extrabold text-slate-900">
                          12
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <Gamepad2 size={14} style={{ color: BLUE }} />
                          Roblox 400 Robux
                        </span>
                        <span className="text-xs font-medium text-amber-600">
                          -38.000 Coin
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <Flame size={14} style={{ color: BLUE }} />
                          Nhiệm vụ hàng ngày
                        </span>
                        <span className="text-xs font-semibold text-emerald-600">
                          +522 Coin
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ STATS ============ */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-5 py-12">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {STATS.map(({ value, label, icon: Icon }) => (
                <div key={label} className="text-center">
                  <div
                    className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: BLUE_LIGHT }}
                  >
                    <Icon size={20} style={{ color: BLUE }} />
                  </div>
                  <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                    {value}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section id="how" className="mx-auto max-w-6xl px-5 py-20">
          <div className="max-w-2xl">
            <span
              className="text-xs font-bold uppercase tracking-[0.15em]"
              style={{ color: BLUE }}
            >
              Bắt đầu thật đơn giản
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Ba bước để bắt đầu
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              Không cần thao tác phức tạp. Mọi thứ được thiết kế để bạn dễ hiểu
              và dễ theo dõi.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {HOW_IT_WORKS.map(({ n, title, desc, icon: Icon }) => (
              <div
                key={n}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: BLUE }}
                  >
                    <Icon size={18} />
                  </div>
                  <span className="text-2xl font-extrabold text-slate-200">
                    {n}
                  </span>
                </div>
                <h3 className="mt-6 text-base font-bold text-slate-950">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ TRUST / SECURITY ============ */}
        <section id="trust" className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <div className="text-center">
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
                style={{ backgroundColor: BLUE_LIGHT, color: BLUE }}
              >
                <ShieldCheck size={13} />
                Ưu tiên an toàn
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                Cam kết uy tín — minh bạch
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                NXX315 hoạt động hơn 2 năm với hơn 10.000 người dùng tin tưởng.
                Mọi giao dịch đều được ghi log, admin duyệt thủ công để đảm bảo
                minh bạch.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <TrustBadge
                icon={Lock}
                title="Bảo mật SSL"
                desc="Mã hoá 256-bit chuẩn quốc tế"
              />
              <TrustBadge
                icon={Clock}
                title="Rút nhanh 24h"
                desc="Xử lý thủ công trong ngày"
              />
              <TrustBadge
                icon={ShieldCheck}
                title="Chống gian lận"
                desc="Kiểm tra IP, fingerprint, hành vi"
              />
              <TrustBadge
                icon={Award}
                title="Uy tín 2 năm"
                desc="Hơn 500 triệu đã chi trả"
              />
            </div>

            <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: BLUE }}
                  >
                    <Filter size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Bộ lọc người dùng
                    </p>
                    <p className="text-xs text-slate-500">
                      Đang bảo vệ realtime
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold text-emerald-700"
                    style={{ backgroundColor: "#D1FAE5" }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    ONLINE
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <FilterRow label="Bot / tự động" status="blocked" />
                <FilterRow label="VPN / Proxy" status="blocked" />
                <FilterRow label="Trùng thiết bị" status="blocked" />
                <FilterRow label="Người dùng thật" status="approved" />
              </div>
            </div>
          </div>
        </section>

        {/* ============ TESTIMONIALS ============ */}
        <section id="testimonials" className="mx-auto max-w-6xl px-5 py-20">
          <div className="text-center">
            <span
              className="text-xs font-bold uppercase tracking-[0.15em]"
              style={{ color: BLUE }}
            >
              Người dùng nói gì
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Đánh giá từ cộng đồng
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Hơn 10.000 người dùng đã tin tưởng và sử dụng NXX315.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-700">
                  "{t.text}"
                </p>
                <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="h-10 w-10 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=087EA4&color=fff&size=80`;
                    }}
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {t.name}
                    </p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section id="faq" className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-4xl px-5 py-20">
            <div className="text-center">
              <span
                className="text-xs font-bold uppercase tracking-[0.15em]"
                style={{ color: BLUE }}
              >
                Giải đáp thắc mắc
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                Câu hỏi thường gặp
              </h2>
            </div>

            <div className="mt-10 space-y-3">
              {FAQS.map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ============ CTA CUỐI ============ */}
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <div
              className="rounded-3xl p-8 text-center sm:p-14"
              style={{
                backgroundColor: BLUE_LIGHT,
                border: `1px solid ${BLUE_BORDER}`,
              }}
            >
              <div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white"
                style={{ backgroundColor: BLUE }}
              >
                <Heart size={26} />
              </div>
              <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                Sẵn sàng bắt đầu kiếm Coin?
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600 sm:text-base">
                Đăng ký miễn phí trong 30 giây, không cần nạp tiền. Bắt đầu làm
                nhiệm vụ và đổi thưởng ngay hôm nay.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  onClick={() => navigate("/register")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
                  style={{ backgroundColor: BLUE }}
                >
                  Đăng ký miễn phí
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate("/help")}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Tìm hiểu thêm
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <Logo />
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
                NXX315 Studio Rewards — Nền tảng kiếm thưởng trực tuyến uy tín
                hàng đầu Việt Nam. Hoạt động từ 2024.
              </p>

              <div className="mt-5 flex gap-2">
                {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">Về NXX315</p>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
                <li>
                  <button
                    onClick={() => scrollTo("how")}
                    className="hover:text-slate-900"
                  >
                    Cách hoạt động
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("trust")}
                    className="hover:text-slate-900"
                  >
                    Bảo mật
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("testimonials")}
                    className="hover:text-slate-900"
                  >
                    Đánh giá
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("faq")}
                    className="hover:text-slate-900"
                  >
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">Pháp lý</p>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
                <li>
                  <button
                    onClick={() => navigate("/terms")}
                    className="hover:text-slate-900"
                  >
                    Điều khoản sử dụng
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/privacy")}
                    className="hover:text-slate-900"
                  >
                    Chính sách bảo mật
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/fraud")}
                    className="hover:text-slate-900"
                  >
                    Chống gian lận
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/redemption-policy")}
                    className="hover:text-slate-900"
                  >
                    Chính sách đổi thưởng
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row">
            <p>
              © {new Date().getFullYear()} NXX315 Studio. Bảo lưu mọi quyền.
            </p>
            <p className="flex items-center gap-1.5">
              <Lock size={12} />
              SSL secured • Made in Vietnam 🇻🇳
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper component cho filter row
function FilterRow({ label, status }) {
  const isBlocked = status === "blocked";
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span
        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
          isBlocked
            ? "bg-rose-50 text-rose-700"
            : "bg-emerald-50 text-emerald-700"
        }`}
      >
        {isBlocked ? "BLOCKED" : "APPROVED"}
      </span>
    </div>
  );
                                    }
