import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CSS } from "../components/LandingTheme.js";
import { StarMark, Reveal } from "../components/LandingParts.jsx";

// Nội dung chính sách: sửa chữ ở đây. Dùng **chữ đậm** để nhấn mạnh.
// Loại khối: p (đoạn), list (danh sách), note (ô lưu ý có nhãn).
const UPDATED = "25/08/2026";
const INTRO = {
  text: "NXX315 Studio Rewards tôn trọng quyền riêng tư của người dùng và cam kết bảo vệ thông tin được cung cấp trong quá trình sử dụng dịch vụ.",
  chips: ["Chỉ thu thập thông tin cần thiết", "Không chủ động bán thông tin cá nhân", "Từ 15 tuổi trở lên"],
};
const SECTIONS = [
  { id: "thu-thap", title: "Thông tin chúng tôi có thể thu thập", blocks: [
    { t: "p", x: "Tùy vào cách bạn sử dụng dịch vụ, NXX315 Studio Rewards có thể xử lý một số thông tin cần thiết cho hoạt động của tài khoản, bao gồm:" },
    { t: "list", items: [
      "Thông tin tài khoản như tên hiển thị hoặc thông tin đăng nhập",
      "Thông tin liên quan đến hồ sơ người dùng",
      "Lịch sử nhiệm vụ và phần thưởng",
      "Lịch sử đổi thưởng",
      "Thông tin cần thiết để xử lý yêu cầu hỗ trợ",
      "Thông tin kỹ thuật cần thiết để duy trì và bảo vệ hoạt động của hệ thống",
    ]},
    { t: "note", tag: "Lưu ý", x: "Chúng tôi **chỉ thu thập những thông tin cần thiết** cho mục đích vận hành, bảo mật và cung cấp dịch vụ." },
  ]},
  { id: "muc-dich", title: "Mục đích sử dụng thông tin", blocks: [
    { t: "p", x: "Thông tin có thể được sử dụng để:" },
    { t: "list", items: [
      "Quản lý tài khoản người dùng",
      "Ghi nhận nhiệm vụ và xu/điểm",
      "Xử lý yêu cầu đổi thưởng",
      "Phát hiện và ngăn chặn gian lận",
      "Bảo vệ hệ thống khỏi hành vi lạm dụng",
      "Cải thiện chất lượng dịch vụ",
      "Xử lý yêu cầu hỗ trợ",
      "Khắc phục lỗi và sự cố kỹ thuật",
    ]},
  ]},
  { id: "bao-ve", title: "Bảo vệ thông tin", blocks: [
    { t: "p", x: "NXX315 Studio Rewards áp dụng các biện pháp phù hợp nhằm hạn chế truy cập trái phép, mất mát hoặc sử dụng thông tin không đúng mục đích." },
    { t: "note", tag: "Lưu ý", x: "Tuy nhiên, **không có hệ thống trực tuyến nào có thể đảm bảo an toàn tuyệt đối**. Người dùng cũng có trách nhiệm bảo vệ thông tin đăng nhập và không chia sẻ thông tin tài khoản cho người khác." },
  ]},
  { id: "chia-se", title: "Chia sẻ thông tin", blocks: [
    { t: "p", x: "NXX315 Studio Rewards **không chủ động bán thông tin cá nhân** của người dùng." },
    { t: "p", x: "Thông tin có thể được cung cấp cho bên thứ ba khi cần thiết để:" },
    { t: "list", items: [
      "Cung cấp hoặc xử lý phần thưởng",
      "Duy trì hoạt động của dịch vụ",
      "Xử lý vấn đề kỹ thuật",
      "Tuân thủ nghĩa vụ pháp lý hợp lệ",
      "Bảo vệ quyền lợi, tài sản và sự an toàn của hệ thống",
    ]},
  ]},
  { id: "luu-tru", title: "Thời gian lưu trữ", blocks: [
    { t: "p", x: "Thông tin được lưu trữ trong khoảng thời gian cần thiết để vận hành dịch vụ, xử lý giao dịch, bảo mật hệ thống và thực hiện các mục đích hợp pháp khác." },
    { t: "p", x: "Một số dữ liệu giao dịch hoặc dữ liệu liên quan đến gian lận có thể được lưu giữ lâu hơn để phục vụ việc kiểm tra và bảo vệ hệ thống." },
  ]},
  { id: "quyen", title: "Quyền của người dùng", blocks: [
    { t: "p", x: "Tùy theo quy định pháp luật áp dụng, người dùng có thể yêu cầu:" },
    { t: "list", items: [
      "Kiểm tra thông tin liên quan đến tài khoản",
      "Sửa thông tin không chính xác",
      "Yêu cầu hỗ trợ liên quan đến dữ liệu của mình",
      "Yêu cầu xóa tài khoản khi phù hợp",
    ]},
    { t: "note", tag: "Lưu ý", x: "Một số dữ liệu có thể cần được giữ lại vì lý do bảo mật, giao dịch, chống gian lận hoặc nghĩa vụ pháp lý." },
  ]},
  { id: "do-tuoi", title: "Trẻ em và độ tuổi sử dụng", blocks: [
    { t: "p", x: "NXX315 Studio Rewards yêu cầu người dùng **từ 15 tuổi trở lên**." },
    { t: "p", x: "Nếu phát hiện tài khoản không đáp ứng điều kiện độ tuổi, NXX315 Studio Rewards có thể hạn chế hoặc chấm dứt quyền sử dụng tài khoản." },
  ]},
  { id: "thay-doi", title: "Thay đổi chính sách", blocks: [
    { t: "p", x: "Chính sách quyền riêng tư có thể được cập nhật khi hệ thống hoặc cách thức xử lý dữ liệu thay đổi." },
    { t: "p", x: "Phiên bản mới sẽ được công bố trên website cùng ngày cập nhật." },
  ]},
  { id: "lien-he", title: "Liên hệ", blocks: [
    { t: "p", x: "Nếu bạn có câu hỏi hoặc yêu cầu liên quan đến quyền riêng tư, vui lòng liên hệ NXX315 Studio Rewards thông qua kênh hỗ trợ chính thức được công bố trên website." },
  ]},
];

const IDS = SECTIONS.map((s) => s.id);
const pad = (n) => String(n).padStart(2, "0");

/* **chữ đậm** → nhấn bằng màu đen, không dùng độ đậm */
const rich = (s) =>
  s.split(/(\*\*[^*]+\*\*)/g).map((x, i) =>
    x.startsWith("**") ? <strong key={i} className="font-[350] text-[var(--ink)]">{x.slice(2, -2)}</strong> : x
  );

const goTo = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
};

function List({ items }) {
  return (
    <ul className="mt-4 border-t-[.5px] border-[var(--hair)]">
      {items.map((x) => (
        <li key={x} className="lp-body border-b-[.5px] border-[var(--hair)] py-3">{x}</li>
      ))}
    </ul>
  );
}

function Note({ tag, x }) {
  return (
    <div className="mt-5 rounded-[28px] border-[.5px] border-[var(--hair)] bg-[var(--panel)] p-5 sm:p-6">
      <span className="lp-tag">{tag}</span>
      <p className="lp-body mt-3 !text-[var(--ink)]">{rich(x)}</p>
    </div>
  );
}

function Block({ b }) {
  if (b.t === "p") return <p className="lp-body mt-4">{rich(b.x)}</p>;
  if (b.t === "list") return <List items={b.items} />;
  return <Note {...b} />;
}

/* Mục đang đọc → nổi màu xanh ở mục lục */
function useActive(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-25% 0px -65% 0px" }
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [ids]);
  return active;
}

export default function Privacy() {
  const navigate = useNavigate();
  const active = useActive(IDS);

  return (
    <div className="lp min-h-screen">
      <style>{CSS}</style>

      <header className="lp-nav">
        <Link to="/" aria-label="NXX315" className="lp-glass lp-press lp-nav-logo"><StarMark /></Link>
        <nav className="lp-glass lp-nav-bar" aria-label="Main">
          <button onClick={() => navigate(-1)} className="lp-nav-link lp-press inline-flex items-center gap-1.5">
            <ArrowLeft size={14} strokeWidth={1.5} /> Quay lại
          </button>
          <Link to="/dashboard" className="lp-nav-link lp-press">Trang chủ</Link>
        </nav>
      </header>

      <main className="mx-auto max-w-[1200px] px-5 pb-20 pt-[110px] sm:pb-[94px] sm:pt-[150px]">
        <div className="lp-rise max-w-[640px]">
          <p className="lp-label">Pháp lý · Cập nhật lần cuối {UPDATED}</p>
          <h1 className="mt-3 text-[clamp(27px,4vw,44px)] leading-[1.2] tracking-[-0.03em]">Chính sách quyền riêng tư</h1>
          <p className="lp-body lp-d1 mt-4">{INTRO.text}</p>
          <ul className="lp-d2 mt-6 flex flex-wrap gap-1.5">
            {INTRO.chips.map((c) => <li key={c} className="lp-tag">{c}</li>)}
          </ul>
        </div>

        <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-10 lg:mt-20 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
          <nav aria-label="Mục lục" className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <p className="lp-label mb-3 hidden lg:block">Mục lục</p>
            <ol className="-mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0">
              {SECTIONS.map((s, i) => (
                <li key={s.id} className="shrink-0">
                  <button onClick={() => goTo(s.id)}
                    className={`lp-press whitespace-nowrap rounded-full border-[.5px] px-3 py-1.5 text-[12px] transition-colors lg:rounded-none lg:border-0 lg:px-0 lg:py-[7px] lg:text-[14px] ${
                      active === s.id
                        ? "border-[var(--blue)] text-[var(--blue)]"
                        : "border-[var(--hair)] text-[var(--steel)]"
                    }`}>
                    <span className="mr-1.5 text-[var(--ash)]">{pad(i + 1)}</span>{s.title}
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <div className="min-w-0 max-w-[720px]">
            {SECTIONS.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-28 border-t-[.5px] border-[var(--hair)] py-10 first:border-t-0 first:pt-0 sm:py-12">
                <Reveal>
                  <p className="lp-label">{pad(i + 1)}</p>
                  <h2 className="mt-2 text-[22px] leading-[1.25] tracking-[-0.44px] sm:text-[27px]">{s.title}</h2>
                  {s.blocks.map((b, k) => <Block key={k} b={b} />)}
                </Reveal>
              </section>
            ))}

            <Link to="/dashboard" className="lp-cta lp-press mt-4">
              <span>Quay về trang chủ</span><ArrowRight size={16} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
    }
    
