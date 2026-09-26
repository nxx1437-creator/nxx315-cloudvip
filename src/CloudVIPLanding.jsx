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
  TrendingUp,
  Lock,
  RefreshCw,
  Wallet,
  Send,
  Mail,
  MessageCircle,
  Plus,
  Minus,
  Menu,
  X,
  Quote,
  Search,
  Trophy,
  Flame,
  Clock,
  Gift,
  Sparkles, 
} from "lucide-react";
import { supabase } from "./lib/supabaseClient.js";

// ============ DATA ============
const HOW_IT_WORKS = [
  {
    n: "01",
    title: "Đăng ký tài khoản",
    desc: "Tạo tài khoản miễn phí chỉ trong 30 giây.",
  },
  {
    n: "02",
    title: "Làm nhiệm vụ",
    desc: "Chọn nhiệm vụ và hoàn thành để nhận Coin.",
  },
  {
    n: "03",
    title: "Đổi Robux",
    desc: "Dùng Coin mua Robux chính hãng trong Shop.",
  },
];

const WHY_CARDS = [
  {
    icon: Zap,
    title: "Kiếm Coin dễ dàng",
    desc: "Hoàn thành nhiệm vụ đơn giản, nhận Coin ngay vào ví sau khi admin duyệt.",
  },
  {
    icon: ShieldCheck,
    title: "An toàn & Bảo mật",
    desc: "Hệ thống chống gian lận nâng cao, bảo vệ tài khoản của bạn.",
  },
  {
    icon: Users,
    title: "Cộng đồng lớn",
    desc: "Hơn 10.000 người dùng tin tưởng mỗi ngày.",
  },
];

const TRANSPARENCY_ITEMS = [
  "Ngưỡng đổi thưởng thấp",
  "Robux chính hãng 100%",
  "Lịch sử giao dịch minh bạch",
];

const TESTIMONIALS = [
  {
    stars: 5,
    text: "Mình làm nhiệm vụ đều đặn, mỗi tháng đổi được 1.700 Robux. Nạp thẳng vào tài khoản VNG luôn, nhanh gọn.",
    name: "Minh Tuấn",
    role: "Admin group 120k thành viên",
  },
  {
    stars: 5,
    text: "Hệ thống uy tín, admin duyệt nhanh. Mình đổi Robux 3 lần rồi, lần nào cũng được nạp đúng.",
    name: "Thu Hà",
    role: "Content Creator",
  },
  {
    stars: 5,
    text: "Không cần nạp tiền, chỉ cần làm nhiệm vụ là có Coin. App dễ dùng, giao diện đẹp.",
    name: "Hoàng Nam",
    role: "Streamer",
  },
];

const FAQS = [
  {
    q: "NXX315 hoạt động như thế nào?",
    a: "Bạn đăng ký tài khoản miễn phí, làm nhiệm vụ để kiếm Coin, sau đó dùng Coin đổi Robux chính hãng trong Shop. Admin sẽ duyệt và nạp Robux vào tài khoản Roblox (VNG) của bạn.",
  },
  {
    q: "Khi nào tôi nhận được Robux?",
    a: "Sau khi bạn đổi thưởng, admin sẽ xử lý trong vòng 24 giờ. Robux được nạp trực tiếp vào tài khoản Roblox liên kết VNG của bạn.",
  },
  {
    q: "Hệ thống chống gian lận ra sao?",
    a: "Chúng tôi có hệ thống kiểm tra IP, fingerprint, và hành vi bất thường. Mỗi tài khoản chỉ được tạo 1 lần, chống tạo nhiều tài khoản để trục lợi.",
  },
  {
    q: "Có cần nạp tiền không?",
    a: "Hoàn toàn miễn phí. Bạn chỉ cần làm nhiệm vụ để kiếm Coin, không cần nạp bất kỳ khoản nào.",
  },
];

const SOCIAL_LINKS = [
  { icon: Send, label: "Telegram", href: "https://t.me/nxx315" },
  { icon: MessageCircle, label: "Zalo", href: "https://zalo.me/0865245988" },
  { icon: Mail, label: "Email", href: "mailto:support@nxx315.top" },
];

// ============ COMPONENTS ============
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-sky-100 bg-white shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-bold text-slate-900 sm:text-base">{q}</span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600">
          {open ? <Minus size={14} /> : <Plus size={14} />}
        </span>
      </button>
      {open && (
        <div className="border-t border-sky-50 px-5 pb-4 pt-3">
          <p className="text-sm leading-relaxed text-slate-600">{a}</p>
        </div>
      )}
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
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-50 via-white to-blue-50 font-[Be_Vietnam_Pro] text-slate-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap');
      `}</style>

      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-sky-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600">
              <Coins size={18} className="text-white" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-slate-900">
              NXX315 Studio <span className="text-sky-500">Rewards</span>
            </span>
          </div>

          {/* Desktop menu */}
          <div className="hidden items-center gap-6 sm:flex">
            <button
              onClick={() => scrollTo("how-it-works")}
              className="text-sm font-semibold text-slate-600 hover:text-sky-600"
            >
              Cách hoạt động
            </button>
            <button
              onClick={() => scrollTo("why")}
              className="text-sm font-semibold text-slate-600 hover:text-sky-600"
            >
              Vì sao chọn
            </button>
            <button
              onClick={() => scrollTo("faq")}
              className="text-sm font-semibold text-slate-600 hover:text-sky-600"
            >
              FAQ
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/login")}
              className="hidden rounded-lg px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 sm:block"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => navigate("/register")}
              className="rounded-lg bg-gradient-to-r from-sky-400 to-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-sky-500/30 transition hover:brightness-110"
            >
              Đăng ký
            </button>
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-200 bg-white text-slate-600 sm:hidden"
            >
              {mobileMenu ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="border-t border-sky-100 bg-white px-5 py-3 sm:hidden">
            <button
              onClick={() => scrollTo("how-it-works")}
              className="block w-full py-2 text-left text-sm font-semibold text-slate-700"
            >
              Cách hoạt động
            </button>
            <button
              onClick={() => scrollTo("why")}
              className="block w-full py-2 text-left text-sm font-semibold text-slate-700"
            >
              Vì sao chọn
            </button>
            <button
              onClick={() => scrollTo("faq")}
              className="block w-full py-2 text-left text-sm font-semibold text-slate-700"
            >
              FAQ
            </button>
            <button
              onClick={() => navigate("/login")}
              className="mt-2 block w-full rounded-lg border border-sky-200 py-2 text-center text-sm font-bold text-slate-700"
            >
              Đăng nhập
            </button>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative px-5 pb-16 pt-12 sm:pt-16">
        <div className="mx-auto max-w-4xl text-center">
          {/* Stars */}
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white px-4 py-1.5 shadow-sm">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-600">
              4.9/5 từ 3.000+ thành viên
            </span>
          </div>

          {/* Title */}
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-6xl">
            Kiếm Coin
            <br />
            <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
              Đổi Robux chính hãng
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Hoàn thành nhiệm vụ đơn giản, nhận Coin và đổi ngay Robux chính
            hãng — nạp thẳng vào tài khoản Roblox liên kết VNG của bạn.
          </p>

          {/* Input box */}
          <div className="mx-auto mt-8 max-w-md rounded-3xl border border-sky-100 bg-white p-5 shadow-lg shadow-sky-500/10">
            <div className="flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50/50 px-4 py-3">
              <Gamepad2 size={18} className="shrink-0 text-sky-500" />
              <input
                type="text"
                placeholder="Nhập User ID Roblox của bạn..."
                className="w-full bg-transparent text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none"
              />
            </div>
            <button
              onClick={() => navigate("/register")}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 py-3.5 text-sm font-bold text-white shadow-md shadow-sky-500/30 transition hover:brightness-110"
            >
              Bắt đầu kiếm Coin <ArrowRight size={16} />
            </button>
          </div>

          {/* Social proof */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {["T", "H", "N", "L"].map((c, i) => (
                <div
                  key={i}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-sky-400 to-blue-500 text-xs font-bold text-white shadow-sm"
                >
                  {c}
                </div>
              ))}
            </div>
            <p className="text-xs font-semibold text-slate-600">
              <b className="text-slate-900">10.000+</b> user đang kiếm Coin mỗi ngày
            </p>
          </div>
        </div>
      </section>
     {/* DASHBOARD MOCKUP */}
<section className="mx-auto max-w-4xl px-5 py-8">
  <div className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-xl shadow-sky-500/10">
    {/* Window bar */}
    <div className="flex items-center gap-2 border-b border-sky-50 bg-sky-50/50 px-4 py-3">
      <span className="h-3 w-3 rounded-full bg-rose-400" />
      <span className="h-3 w-3 rounded-full bg-amber-400" />
      <span className="h-3 w-3 rounded-full bg-emerald-400" />
      <span className="ml-2 text-[11px] font-semibold text-slate-500">
        nxx315.top · bảng điều khiển
      </span>
    </div>

    {/* Content */}
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Số dư khả dụng
          </p>
          <p className="mt-1 text-3xl font-black text-slate-900 sm:text-4xl">
            1.250.000
            <span className="ml-1 text-base font-bold text-amber-500">
              Coin
            </span>
          </p>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
          ▲ 12% tuần này
        </div>
      </div>

      {/* Activity cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-sky-50 bg-sky-50/30 p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
              <CheckCircle2 size={14} className="text-emerald-600" />
            </span>
            <p className="text-xs font-semibold text-slate-500">
              Nhiệm vụ hoàn thành
            </p>
          </div>
          <p className="mt-2 text-xl font-black text-slate-900">
            +25.000 Coin
          </p>
          <p className="text-xs text-slate-500">
            Hôm nay · 12 nhiệm vụ
          </p>
        </div>

        <div className="rounded-2xl border border-sky-50 bg-sky-50/30 p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
              <Trophy size={14} className="text-amber-600" />
            </span>
            <p className="text-xs font-semibold text-slate-500">
              Cấp độ
            </p>
          </div>
          <p className="mt-2 text-xl font-black text-slate-900">
            Siêu sao · Lv.7
          </p>
          <p className="text-xs text-slate-500">
            Thưởng +45% task
          </p>
        </div>
      </div>

      {/* Recent */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between rounded-xl border border-sky-50 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <Gamepad2 size={14} className="text-sky-500" />
            <span className="text-xs font-semibold text-slate-700">
              Roblox 400 Robux
            </span>
          </div>
          <span className="text-xs font-bold text-amber-600">
            -38.000 Coin
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-sky-50 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <Flame size={14} className="text-rose-500" />
            <span className="text-xs font-semibold text-slate-700">
              Nhiệm vụ LINK4M
            </span>
          </div>
          <span className="text-xs font-bold text-emerald-600">
            +522 Coin
          </span>
        </div>
      </div>
    </div>
  </div>
</section>

{/* HOW IT WORKS */}
<section id="how-it-works" className="mx-auto max-w-5xl px-5 py-16">
  <div className="text-center">
    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-white px-3 py-1 text-xs font-bold text-sky-600">
      <Gift size={13} /> Đơn giản tới bất ngờ
    </span>
    <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
      Ba bước để bắt đầu
    </h2>
    <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
      Không cần vốn, không cần kỹ thuật — chỉ cần đăng ký và làm nhiệm vụ.
    </p>
  </div>

  <div className="mt-10 grid gap-4 sm:grid-cols-3">
    {HOW_IT_WORKS.map(({ n, title, desc }) => (
      <div
        key={n}
        className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm transition hover:shadow-md"
      >
        <p className="text-4xl font-black text-sky-500">{n}</p>
        <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
          {desc}
        </p>
      </div>
    ))}
  </div>
</section>
  {/* WHY CHOOSE */}
<section id="why" className="mx-auto max-w-5xl px-5 py-16">
  <div className="text-center">
    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-white px-3 py-1 text-xs font-bold text-sky-600">
      <Sparkles /> Vì sao chọn NXX315
    </span>
    <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
      Được xây riêng cho
      <br />
      người Việt kiếm Coin
    </h2>
  </div>

  {/* Fraud prevention */}
  <div className="mt-10 rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-sm sm:p-10">
    <span className="text-xs font-black uppercase tracking-widest text-sky-500">
      Chống gian lận
    </span>
    <h3 className="mt-2 text-2xl font-extrabold leading-snug tracking-tight text-slate-900">
      Hệ thống kiểm tra nhiều lớp, minh bạch từng Coin
    </h3>
    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
      Hệ thống tự động phát hiện và chặn bot, VPN, proxy, datacenter IP
      và hành vi bất thường bằng behavior fingerprint. Mỗi tài khoản
      được kiểm tra trước khi tính điểm — bạn chỉ nhận Coin từ người thật.
    </p>

    <div className="mt-5 space-y-2.5">
      {[
        "Lọc bot & VPN nhiều lớp",
        "Giới hạn theo IP mỗi ngày",
        "Chấm điểm hành vi 0-100",
      ].map((t) => (
        <div key={t} className="flex items-center gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100">
            <CheckCircle2 size={13} className="text-sky-600" />
          </span>
          <span className="text-sm font-semibold text-slate-700">{t}</span>
        </div>
      ))}
    </div>
  </div>

  {/* 3 cards */}
  <div className="mt-6 grid gap-4 sm:grid-cols-3">
    {WHY_CARDS.map(({ icon: Icon, title, desc }) => (
      <div
        key={title}
        className="h-full rounded-2xl border border-sky-100 bg-white p-6 shadow-sm"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-blue-100">
          <Icon size={20} className="text-sky-600" />
        </div>
        <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
          {desc}
        </p>
      </div>
    ))}
  </div>
</section>

{/* TRANSPARENCY */}
<section className="mx-auto max-w-5xl px-5 py-16">
  <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-sm sm:p-10">
    <span className="text-xs font-black uppercase tracking-widest text-sky-500">
      Minh bạch & nhanh
    </span>
    <h3 className="mt-2 text-2xl font-extrabold leading-snug tracking-tight text-slate-900">
      Đổi thưởng dễ dàng, theo dõi realtime
    </h3>
    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
      Số dư, nhiệm vụ hoàn thành và lịch sử giao dịch cập nhật theo thời
      gian thực. Yêu cầu đổi thưởng xử lý trong ngày làm việc. Mọi giao
      dịch đều lưu vết để bạn an tâm.
    </p>

    <div className="mt-5 space-y-2.5">
      {TRANSPARENCY_ITEMS.map((t) => (
        <div key={t} className="flex items-center gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 size={13} className="text-emerald-600" />
          </span>
          <span className="text-sm font-semibold text-slate-700">{t}</span>
        </div>
      ))}
    </div>
  </div>
</section>

{/* TESTIMONIALS */}
<section className="mx-auto max-w-5xl px-5 py-16">
  <div className="text-center">
    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-white px-3 py-1 text-xs font-bold text-sky-600">
      <Users size={13} /> Người thật, thu nhập thật
    </span>
    <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
      Hàng nghìn user đã tin dùng
    </h2>
  </div>

  <div className="mt-10 grid gap-4 sm:grid-cols-3">
    {TESTIMONIALS.map((t, i) => (
      <div
        key={i}
        className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm"
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
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          "{t.text}"
        </p>
        <div className="mt-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-sm font-bold text-white">
            {t.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{t.name}</p>
            <p className="text-xs text-slate-500">{t.role}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
</section>
         {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-5 py-16">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-white px-3 py-1 text-xs font-bold text-sky-600">
            <Search size={13} /> Giải đáp
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Câu hỏi thường gặp
          </h2>
        </div>

        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => (
            <FAQItem key={i} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-5 pb-20 pt-6">
        <div className="rounded-3xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 px-6 py-12 text-center shadow-2xl shadow-sky-500/30">
          <h3 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            Sẵn sàng kiếm Coin
            <br />
            đổi Robux chính hãng?
          </h3>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-sky-50">
            Tạo tài khoản miễn phí và hoàn thành nhiệm vụ đầu tiên ngay hôm nay.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/register")}
              className="w-full rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-sky-600 shadow-lg transition hover:bg-sky-50 sm:w-auto"
            >
              Đăng ký miễn phí
            </button>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="w-full rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 sm:w-auto"
            >
              Tìm hiểu thêm
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-sky-100 bg-gradient-to-b from-white to-sky-50/30 px-5 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 sm:grid-cols-3">
            {/* Col 1 */}
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600">
                  <Coins size={18} className="text-white" />
                </div>
                <span className="text-base font-extrabold tracking-tight text-slate-900">
                  NXX315 Studio <span className="text-sky-500">Rewards</span>
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Nền tảng kiếm Coin & đổi Robux chính hãng hàng đầu Việt Nam.
                Minh bạch, an toàn, nạp nhanh.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700">
                  Robux chính hãng 100%
                </span>
              </div>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
                Cho người kiếm Coin
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                <li
                  onClick={() => navigate("/register")}
                  className="cursor-pointer hover:text-sky-600"
                >
                  Đăng ký kiếm Coin
                </li>
                <li
                  onClick={() => navigate("/tasks")}
                  className="cursor-pointer hover:text-sky-600"
                >
                  Làm nhiệm vụ
                </li>
                <li
                  onClick={() => navigate("/store")}
                  className="cursor-pointer hover:text-sky-600"
                >
                  Đổi Robux
                </li>
                <li
                  onClick={() => scrollTo("how-it-works")}
                  className="cursor-pointer hover:text-sky-600"
                >
                  Cách hoạt động
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
                Liên hệ & Hỗ trợ
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <Mail size={14} className="text-sky-500" />
                  support@nxx315.top
                </li>
                <li className="flex items-center gap-2">
                  <MessageCircle size={14} className="text-sky-500" />
                  Zalo 0865245988
                </li>
                <li className="flex items-center gap-2">
                  <Clock size={14} className="text-sky-500" />
                  Phản hồi trong 1 giờ làm việc
                </li>
              </ul>

              <div className="mt-4 flex gap-2">
                {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-100 bg-white text-slate-500 transition hover:border-sky-400 hover:text-sky-600"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-sky-100 pt-6 text-center">
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
