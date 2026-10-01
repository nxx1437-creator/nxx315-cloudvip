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
  Search,
  Trophy,
  Flame,
  Clock,
  Gift,
  Filter,
  Award,
  Lock,
  TrendingUp,
  Heart,
} from "lucide-react";

// ============ MÀU CHỦ ĐẠO ============
const BLUE = "#087EA4";
const BLUE_LIGHT = "#F1F8FA";
const BLUE_BORDER = "#CDE8EF";

// ============ URL AVATAR ============
const AVATAR_URL =
  "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/avatars";

// ============ DATA ============

const HOW_IT_WORKS = [
  {
    n: "01",
    icon: Users,
    title: "Tạo tài khoản",
    desc: "Đăng ký miễn phí chỉ trong 30 giây.",
  },
  {
    n: "02",
    icon: Zap,
    title: "Làm nhiệm vụ",
    desc: "Chọn nhiệm vụ và hoàn thành để nhận Coin vào ví.",
  },
  {
    n: "03",
    icon: Gift,
    title: "Đổi thưởng",
    desc: "Đổi Coin lấy Robux chính hãng, thẻ điện thoại, gift card và nhiều phần quà khác.",
  },
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
    text: "Hệ thống uy tín, admin duyệt nhanh. Mình đổi Robux 3 lần rồi, lần nào cũng được nạp đúng.",
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
    q: "NXX315 hoạt động như thế nào?",
    a: "Bạn đăng ký tài khoản miễn phí, làm nhiệm vụ để kiếm Coin, sau đó dùng Coin đổi Robux chính hãng trong Shop. Admin sẽ duyệt và nạp Robux vào tài khoản Roblox của bạn.",
  },
  {
    q: "Khi nào tôi nhận được phần thưởng?",
    a: "Sau khi bạn đổi thưởng, admin sẽ xử lý trong vòng 24 giờ. Robux được nạp trực tiếp vào tài khoản Roblox; thẻ điện thoại sẽ được gửi qua notification hoặc email.",
  },
  {
    q: "Hệ thống chống gian lận ra sao?",
    a: "Chúng tôi có hệ thống kiểm tra IP, fingerprint, và hành vi bất thường. Mỗi tài khoản chỉ được tạo 1 lần, chống tạo nhiều tài khoản để trục lợi.",
  },
  {
    q: "Có cần nạp tiền không?",
    a: "Hoàn toàn miễn phí. Bạn chỉ cần làm nhiệm vụ để kiếm Coin, không cần nạp bất kỳ khoản nào.",
  },
  {
    q: "NXX315 có uy tín không?",
    a: "Chúng tôi đã hoạt động hơn 2 năm, với hơn 10.000 người dùng và hơn 500 triệu đồng đã chi trả. Hệ thống có chứng chỉ SSL, bảo mật 2 lớp, và admin xử lý thủ công để đảm bảo mọi giao dịch minh bạch.",
  },
  {
    q: "Tôi có thể liên hệ hỗ trợ bằng cách nào?",
    a: "Bạn có thể chat qua Zalo 0865245988, gửi email tới nxx315hub@gmail.com, hoặc qua Telegram. Thời gian phản hồi trung bình 5-15 phút.",
  },
];

const SOCIAL_LINKS = [
  { icon: Send, label: "Telegram", href: "https://t.me/nxx315" },
  { icon: MessageCircle, label: "Zalo", href: "https://zalo.me/0865245988" },
  { icon: Mail, label: "Email", href: "mailto:nxx315hub@gmail.com" },
];

const TRUST_BADGES = [
  { icon: "🔒", label: "SSL 256-bit", sub: "Bảo mật chuẩn quốc tế" },
  { icon: "⚡", label: "Rút 24h", sub: "Xử lý trong ngày" },
  { icon: "🛡️", label: "Chống gian lận", sub: "Kiểm tra nhiều lớp" },
  { icon: "🏆", label: "2 năm uy tín", sub: "500tr+ đã chi trả" },
];

const AWARDS = [
  { label: "Hoạt động từ", value: "2024" },
  { label: "Người dùng", value: "10.000+" },
  { label: "Đã chi trả", value: "500tr+" },
  { label: "Đánh giá", value: "4.9/5" },
];

const FILTER_ROWS = [
  { label: "Bot tự động", status: "Đã chặn", color: "text-rose-600" },
  { label: "VPN / Proxy", status: "Đã chặn", color: "text-rose-600" },
  { label: "Datacenter IP", status: "Đã chặn", color: "text-rose-600" },
  { label: "Người dùng thật", status: "Hợp lệ", color: "text-emerald-600" },
];
// ============ COMPONENTS ============

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

function AvatarFallback({ name, size = 32 }) {
  const initial = name?.charAt(0).toUpperCase() || "U";
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
      style={{
        width: size,
        height: size,
        backgroundColor: BLUE,
      }}
    >
      {initial}
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

      {/* NAVBAR */}
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
              onClick={() => scrollTo("why")}
              className="text-sm font-medium text-slate-600 hover:text-slate-950"
            >
              Bảo mật
            </button>
            <button
              onClick={() => scrollTo("awards")}
              className="text-sm font-medium text-slate-600 hover:text-slate-950"
            >
              Uy tín
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
                onClick={() => scrollTo("why")}
                className="block w-full px-3 py-3 text-left text-sm font-medium text-slate-700"
              >
                Bảo mật
              </button>
              <button
                onClick={() => scrollTo("awards")}
                className="block w-full px-3 py-3 text-left text-sm font-medium text-slate-700"
              >
                Uy tín
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
                  <span style={{ color: BLUE }}>Đổi Robux chính hãng.</span>
                </h1>

                <p className="mt-5 max-w-xl text-[15px] leading-7 text-slate-500 sm:text-base">
                  Hoàn thành nhiệm vụ đơn giản, nhận Coin và đổi ngay Robux
                  chính hãng — nạp thẳng vào tài khoản Roblox của bạn.
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
                    Robux chính hãng 100%
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} style={{ color: BLUE }} />
                    Admin duyệt thủ công
                  </span>
                </div>

                <div className="mt-7 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {SOCIAL_AVATARS.map((src, i) => (
                      <div
                        key={i}
                        className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white shadow-sm"
                      >
                        <img
                          src={src}
                          alt="User"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling.style.display = "flex";
                          }}
                        />
                        <div
                          className="hidden h-full w-full items-center justify-center text-[10px] font-bold text-white"
                          style={{ backgroundColor: BLUE }}
                        >
                          U
                        </div>
                      </div>
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
                          Nhiệm vụ LINK4M
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
                   {/* ============ SECURITY ============ */}
        <section id="why" className="border-y border-slate-200 bg-slate-50">
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
                Hệ thống kiểm tra nhiều lớp
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Hệ thống tự động phát hiện và chặn bot, VPN, proxy, datacenter
                IP và hành vi bất thường. Mỗi tài khoản được kiểm tra trước khi
                tính điểm — bạn chỉ nhận Coin từ người thật.
              </p>
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
                    className="text-2xl font-extrabold"
                    style={{ color: BLUE }}
                  >
                    98
                  </span>
                  <span className="text-sm font-semibold text-slate-400">
                    /100
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {FILTER_ROWS.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <span className="text-xs font-semibold text-slate-700">
                      {item.label}
                    </span>
                    <span className={`text-xs font-bold ${item.color}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                {[
                  "Lọc bot & VPN nhiều lớp",
                  "Giới hạn theo IP mỗi ngày",
                  "Chấm điểm hành vi 0-100",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-3">
                    <CheckCircle2 size={14} style={{ color: BLUE }} />
                    <span className="text-xs font-medium text-slate-600">
                      {t}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ AWARDS / CERTIFICATIONS ============ */}
        <section
          id="awards"
          className="border-b border-slate-200 bg-white"
        >
          <div className="mx-auto max-w-6xl px-5 py-14">
            <div className="text-center">
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
                style={{ backgroundColor: BLUE_LIGHT, color: BLUE }}
              >
                <Award size={13} />
                Chứng nhận & Giải thưởng
              </span>
              <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                Được cộng đồng tin tưởng
              </h2>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {AWARDS.map((a) => (
                <div
                  key={a.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:shadow-md"
                >
                  <p
                    className="text-3xl font-extrabold tracking-tight"
                    style={{ color: BLUE }}
                  >
                    {a.value}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {a.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-4">
              {TRUST_BADGES.map((b) => (
                <div
                  key={b.label}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
                    style={{ backgroundColor: BLUE_LIGHT }}
                  >
                    {b.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {b.label}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {b.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ TRANSPARENCY ============ */}
        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
            <div>
              <span
                className="text-xs font-bold uppercase tracking-[0.15em]"
                style={{ color: BLUE }}
              >
                Minh bạch & nhanh
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                Đổi thưởng dễ dàng, theo dõi realtime
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Số dư, nhiệm vụ hoàn thành và lịch sử giao dịch cập nhật theo
                thời gian thực. Yêu cầu đổi thưởng xử lý trong ngày làm việc.
                Mọi giao dịch đều lưu vết để bạn an tâm.
              </p>
              <div className="mt-5 space-y-2">
                {[
                  "Ngưỡng đổi thưởng thấp",
                  "Robux chính hãng 100%",
                  "Lịch sử giao dịch minh bạch",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-3">
                    <CheckCircle2 size={14} style={{ color: BLUE }} />
                    <span className="text-sm font-medium text-slate-600">
                      {t}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                      style={{ backgroundColor: BLUE }}
                    >
                      <Trophy size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Yêu cầu đổi thưởng
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        Roblox 400 Robux
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                    Đã duyệt
                  </span>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-center text-3xl font-extrabold text-emerald-600">
                    +1.500.000đ
                  </p>
                  <p className="mt-1 text-center text-xs text-slate-400">
                    Đã chuyển khoản
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ TESTIMONIALS ============ */}
        <section className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <div className="text-center">
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
                style={{ backgroundColor: BLUE_LIGHT, color: BLUE }}
              >
                <Users size={13} />
                Người thật, thu nhập thật
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                Hàng nghìn user đã tin dùng
              </h2>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className="fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    "{t.text}"
                  </p>
                  <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling.style.display = "flex";
                        }}
                      />
                      <div
                        className="hidden h-full w-full items-center justify-center text-sm font-bold text-white"
                        style={{ backgroundColor: BLUE }}
                      >
                        {t.name.charAt(0)}
                      </div>
                    </div>
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
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section id="faq" className="mx-auto max-w-3xl px-5 py-20">
          <div className="text-center">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{ backgroundColor: BLUE_LIGHT, color: BLUE }}
            >
              <Search size={13} />
              Giải đáp
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
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

        {/* ============ CTA CUỐI ============ */}
        <section className="mx-auto max-w-6xl px-5 pb-20">
          <div
            className="rounded-3xl border px-6 py-14 text-center shadow-sm sm:px-10"
            style={{ borderColor: BLUE_BORDER, backgroundColor: BLUE_LIGHT }}
          >
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white"
              style={{ backgroundColor: BLUE }}
            >
              <Heart size={26} />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Sẵn sàng kiếm Coin?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
              Tạo tài khoản NXX315 miễn phí và bắt đầu kiếm Coin ngay hôm nay.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/register")}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
                style={{
                  backgroundColor: BLUE,
                  boxShadow: "0 8px 20px -6px rgba(8,126,164,0.4)",
                }}
              >
                Đăng ký miễn phí
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate("/help")}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Tìm hiểu thêm
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-slate-200 bg-white px-5 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <Logo />
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
                Nền tảng NXX315 Studio Rewards — kiếm Coin, quản lý số dư và đổi
                Robux chính hãng.
              </p>
              <div className="mt-5 flex gap-2">
                {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                Khám phá
              </h4>
              <div className="mt-4 space-y-3 text-sm font-medium text-slate-600">
                <button
                  onClick={() => navigate("/register")}
                  className="block hover:text-slate-950"
                >
                  Đăng ký kiếm Coin
                </button>
                <button
                  onClick={() => navigate("/tasks")}
                  className="block hover:text-slate-950"
                >
                  Làm nhiệm vụ
                </button>
                <button
                  onClick={() => navigate("/store")}
                  className="block hover:text-slate-950"
                >
                  Đổi Robux
                </button>
                <button
                  onClick={() => scrollTo("how")}
                  className="block hover:text-slate-950"
                >
                  Cách hoạt động
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                Liên hệ
              </h4>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <a
                  href="mailto:nxx315hub@gmail.com"
                  className="flex items-center gap-2 hover:text-slate-950"
                >
                  <Mail size={15} style={{ color: BLUE }} />
                  nxx315hub@gmail.com
                </a>
                <a
                  href="https://zalo.me/0865245988"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-slate-950"
                >
                  <MessageCircle size={15} style={{ color: BLUE }} />
                  Zalo 0865245988
                </a>
                <div className="flex items-center gap-2">
                  <Clock size={15} style={{ color: BLUE }} />
                  Hỗ trợ 24/7
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row">
            <p>
              © {new Date().getFullYear()} NXX315 Studio Rewards. Robux là thương
              hiệu của Roblox Corporation.
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
