import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CSS } from "../components/LandingTheme.js";
import { StarMark, Reveal } from "../components/LandingParts.jsx";

// Nội dung Điều khoản sử dụng. Muốn sửa chữ thì sửa ở đây, không cần đụng giao diện.
// Dùng **chữ đậm** để nhấn mạnh. Loại khối: p (đoạn), list (danh sách), note (ô lưu ý có nhãn).
const UPDATED = "25/08/2026";
const APP = "NXX315 Studio Rewards";

const INTRO = {
  tag: "Lưu ý quan trọng",
  text: "Bằng việc đăng ký, truy cập hoặc sử dụng NXX315 Studio Rewards, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý tuân thủ các Điều khoản sử dụng dưới đây.",
  chips: ["Từ 15 tuổi", "Mỗi người một tài khoản", "Xu chỉ có giá trị trong hệ thống"],
};

const SECTIONS = [
  { id: "gioi-thieu", title: "Giới thiệu", blocks: [
    { t: "p", x: "NXX315 Studio Rewards là nền tảng cho phép người dùng tham gia các nhiệm vụ, chương trình hoặc hoạt động được cung cấp trên hệ thống để nhận xu/điểm thưởng." },
    { t: "p", x: "Xu/điểm có thể được sử dụng để yêu cầu đổi lấy các phần thưởng được NXX315 Studio Rewards công bố, bao gồm nhưng không giới hạn ở:" },
    { t: "list", items: ["Quân Huy", "Mã/code Robux", "Các phần thưởng khác được công bố trên hệ thống"] },
    { t: "note", tag: "Lưu ý", x: "NXX315 Studio Rewards không phải là Roblox Corporation và không đại diện, liên kết hoặc được Roblox Corporation tài trợ, chứng thực hay quản lý." },
  ]},
  { id: "dieu-kien", title: "Điều kiện sử dụng", blocks: [
    { t: "p", x: "Để sử dụng dịch vụ, người dùng phải:" },
    { t: "list", items: [
      "Từ 15 tuổi trở lên",
      "Cung cấp thông tin đăng ký chính xác và trung thực",
      "Chỉ sử dụng tài khoản của chính mình",
      "Tuân thủ các điều khoản và quy định của NXX315 Studio Rewards",
      "Không sử dụng hệ thống nhằm mục đích gian lận, trục lợi hoặc phá hoại dịch vụ",
    ]},
    { t: "p", x: "NXX315 Studio Rewards có quyền yêu cầu xác minh thông tin khi cần thiết để bảo vệ hệ thống và người dùng." },
  ]},
  { id: "tai-khoan", title: "Tài khoản người dùng", blocks: [
    { t: "p", x: "Mỗi người dùng chỉ được phép sở hữu một tài khoản trên hệ thống, trừ khi NXX315 Studio Rewards có quy định khác." },
    { t: "p", x: "Người dùng chịu trách nhiệm bảo vệ thông tin đăng nhập và không được chia sẻ tài khoản cho người khác." },
    { t: "note", tag: "Nghiêm cấm", items: [
      "Tạo nhiều tài khoản để nhận nhiều lần phần thưởng",
      "Sử dụng tài khoản của người khác",
      "Mua, bán, cho thuê hoặc chuyển nhượng tài khoản",
      "Sử dụng thông tin giả để đăng ký",
      "Sử dụng công cụ tự động hoặc bot để thao tác với hệ thống khi chưa được cho phép",
    ]},
  ]},
  { id: "xu-diem", title: "Xu và điểm thưởng", blocks: [
    { t: "note", tag: "Lưu ý", x: "Xu/điểm trên NXX315 Studio Rewards **chỉ có giá trị trong phạm vi hệ thống** và không được xem là tiền mặt, tiền điện tử, tài sản tài chính hoặc phương tiện thanh toán." },
    { t: "p", x: "Xu/điểm có thể được cộng hoặc trừ dựa trên:" },
    { t: "list", items: ["Nhiệm vụ hoàn thành hợp lệ", "Hoạt động khuyến mãi", "Đổi phần thưởng", "Điều chỉnh do lỗi hệ thống hoặc hành vi gian lận"] },
    { t: "p", x: "NXX315 Studio Rewards có quyền điều chỉnh hoặc thu hồi số xu/điểm được ghi nhận do lỗi hệ thống, giao dịch không hợp lệ hoặc hành vi gian lận." },
  ]},
  { id: "nhiem-vu", title: "Nhiệm vụ", blocks: [
    { t: "p", x: "Người dùng phải hoàn thành nhiệm vụ theo đúng yêu cầu được hiển thị trên hệ thống." },
    { t: "note", tag: "Nghiêm cấm", items: [
      "Khai báo hoàn thành nhiệm vụ khi chưa thực hiện",
      "Sử dụng nhiều tài khoản để thực hiện cùng một nhiệm vụ nhằm nhận thưởng nhiều lần",
      "Sử dụng bot, script hoặc công cụ tự động trái phép",
      "Làm giả bằng chứng hoàn thành nhiệm vụ",
      "Khai thác lỗi hệ thống để nhận xu/điểm",
      "Cố tình tạo hoạt động giả nhằm tăng phần thưởng",
    ]},
    { t: "p", x: "NXX315 Studio Rewards có quyền từ chối ghi nhận hoặc thu hồi phần thưởng đối với nhiệm vụ không hợp lệ." },
  ]},
  { id: "doi-thuong", title: "Quy định đổi thưởng", blocks: [
    { t: "p", x: "Người dùng có thể sử dụng số xu/điểm đủ điều kiện để tạo yêu cầu đổi phần thưởng. Các yêu cầu đổi thưởng phải tuân thủ:" },
    { t: "list", items: [
      "Người dùng phải có đủ số xu/điểm yêu cầu",
      "Thông tin nhận thưởng phải chính xác",
      "Một yêu cầu đổi thưởng có thể cần được kiểm tra trước khi hoàn tất",
      "Thời gian xử lý có thể thay đổi tùy từng loại phần thưởng",
    ]},
    { t: "p", x: "Sau khi yêu cầu được xác nhận và xử lý thành công, số xu/điểm tương ứng sẽ được trừ khỏi tài khoản." },
    { t: "note", tag: "Lưu ý", x: "NXX315 Studio Rewards không đảm bảo rằng mọi phần thưởng luôn có sẵn. Phần thưởng có thể thay đổi, hết hàng hoặc được thay thế tùy theo tình trạng cung cấp." },
  ]},
  { id: "tu-choi", title: "Hủy hoặc từ chối yêu cầu đổi thưởng", blocks: [
    { t: "p", x: "NXX315 Studio Rewards có thể từ chối, tạm dừng hoặc hủy yêu cầu đổi thưởng nếu:" },
    { t: "list", items: [
      "Phát hiện dấu hiệu gian lận",
      "Người dùng vi phạm Điều khoản sử dụng",
      "Thông tin nhận thưởng không chính xác",
      "Yêu cầu được tạo do lỗi hệ thống",
      "Phần thưởng không còn khả dụng",
      "Có lý do hợp lý để nghi ngờ tài khoản hoặc giao dịch không hợp lệ",
    ]},
    { t: "note", tag: "Hoàn xu", x: "Trong trường hợp yêu cầu bị từ chối do lỗi của người dùng hoặc hành vi vi phạm, NXX315 Studio Rewards **có thể không hoàn lại** số xu/điểm đã sử dụng cho yêu cầu đó." },
  ]},
  { id: "chong-gian-lan", title: "Chính sách chống gian lận", blocks: [
    { t: "p", x: "NXX315 Studio Rewards áp dụng các biện pháp kỹ thuật và thủ công nhằm phát hiện hành vi bất thường. Hệ thống có thể xem xét nhiều tín hiệu khác nhau, chẳng hạn như:" },
    { t: "list", items: ["Thông tin tài khoản", "Lịch sử nhiệm vụ", "Lịch sử đổi thưởng", "Thiết bị và phiên đăng nhập", "Các dấu hiệu hoạt động bất thường", "Mối liên hệ giữa nhiều tài khoản"] },
    { t: "note", tag: "Lưu ý", x: "Việc sử dụng mạng Wi-Fi, 4G hoặc 5G khác nhau không đồng nghĩa với việc người dùng được phép tạo nhiều tài khoản." },
    { t: "note", tag: "Biện pháp xử lý", x: "Nếu phát hiện hành vi gian lận hoặc lạm dụng hệ thống, NXX315 Studio Rewards có thể:", items: [
      "Hủy nhiệm vụ không hợp lệ",
      "Thu hồi xu/điểm bất hợp lệ",
      "Tạm khóa tài khoản",
      "Khóa tài khoản vĩnh viễn",
      "Hủy các yêu cầu đổi thưởng liên quan",
      "Từ chối các yêu cầu hỗ trợ liên quan đến hành vi vi phạm",
    ], foot: "NXX315 Studio Rewards có thể áp dụng biện pháp xử lý ngay cả khi hành vi gian lận được phát hiện sau khi phần thưởng đã được cấp." },
  ]},
  { id: "loi-he-thong", title: "Lạm dụng lỗi hệ thống", blocks: [
    { t: "p", x: "Người dùng không được cố ý khai thác lỗi, lỗ hổng hoặc hành vi ngoài dự kiến của hệ thống để nhận lợi ích." },
    { t: "p", x: "Nếu phát hiện lỗi, người dùng nên thông báo cho NXX315 Studio Rewards thay vì khai thác lỗi." },
    { t: "note", tag: "Lưu ý", x: "Việc cố tình khai thác lỗi để nhận xu, điểm hoặc phần thưởng có thể được xem là hành vi gian lận." },
  ]},
  { id: "kha-dung", title: "Tính khả dụng của dịch vụ", blocks: [
    { t: "p", x: "NXX315 Studio Rewards có thể tạm ngừng hoặc hạn chế một phần dịch vụ để:" },
    { t: "list", items: ["Bảo trì", "Nâng cấp hệ thống", "Khắc phục lỗi", "Xử lý sự cố bảo mật", "Thực hiện các thay đổi cần thiết đối với nền tảng"] },
    { t: "p", x: "NXX315 Studio Rewards không đảm bảo rằng dịch vụ sẽ luôn hoạt động liên tục hoặc không xảy ra lỗi." },
  ]},
  { id: "thay-doi", title: "Thay đổi điều khoản", blocks: [
    { t: "p", x: "NXX315 Studio Rewards có quyền cập nhật hoặc thay đổi Điều khoản sử dụng khi cần thiết. Phiên bản mới sẽ được công bố trên website và có thể có ngày cập nhật mới." },
    { t: "note", tag: "Lưu ý", x: "Việc tiếp tục sử dụng dịch vụ sau khi điều khoản được cập nhật được xem là bạn tiếp tục chấp nhận các điều khoản mới." },
  ]},
  { id: "cham-dut", title: "Chấm dứt quyền sử dụng", blocks: [
    { t: "p", x: "NXX315 Studio Rewards có quyền hạn chế hoặc chấm dứt quyền truy cập của người dùng nếu người dùng:" },
    { t: "list", items: [
      "Vi phạm Điều khoản sử dụng",
      "Gian lận hoặc cố tình lạm dụng hệ thống",
      "Gây ảnh hưởng đến hoạt động của nền tảng",
      "Sử dụng dịch vụ cho mục đích trái pháp luật",
      "Có hành vi gây ảnh hưởng nghiêm trọng đến người dùng hoặc hệ thống",
    ]},
  ]},
  { id: "trach-nhiem", title: "Trách nhiệm của người dùng", blocks: [
    { t: "p", x: "Người dùng có trách nhiệm đảm bảo rằng hoạt động của mình trên NXX315 Studio Rewards tuân thủ pháp luật hiện hành và các quy định của nền tảng." },
    { t: "p", x: "Người dùng không được sử dụng NXX315 Studio Rewards để thực hiện các hoạt động bất hợp pháp, lừa đảo hoặc gây thiệt hại cho người khác." },
  ]},
  { id: "lien-he", title: "Liên hệ", blocks: [
    { t: "p", x: "Nếu bạn phát hiện lỗi, vấn đề bảo mật, giao dịch bất thường hoặc cần hỗ trợ liên quan đến tài khoản, vui lòng liên hệ với NXX315 Studio Rewards thông qua kênh hỗ trợ chính thức được công bố trên website." },
  ]},
];

const ACCEPT = {
  id: "chap-nhan",
  title: "Chấp nhận điều khoản",
  lead: "Khi tạo tài khoản hoặc tiếp tục sử dụng NXX315 Studio Rewards, bạn xác nhận rằng:",
  items: [
    "Bạn đã đọc và hiểu Điều khoản sử dụng",
    "Bạn đáp ứng điều kiện độ tuổi tối thiểu 15 tuổi",
    "Bạn đồng ý tuân thủ các quy định của nền tảng",
    "Bạn hiểu rằng hành vi gian lận hoặc lạm dụng có thể dẫn đến việc mất quyền sử dụng tài khoản và các quyền lợi liên quan",
  ],
  foot: "NXX315 Studio Rewards có quyền thực hiện các biện pháp cần thiết để bảo vệ tính công bằng, an toàn và ổn định của hệ thống.",
};

const ALL = [...SECTIONS, { id: ACCEPT.id, title: ACCEPT.title }];
const IDS = ALL.map((s) => s.id);
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

function Note({ tag, x, items, foot }) {
  return (
    <div className="mt-5 rounded-[28px] border-[.5px] border-[var(--hair)] bg-[var(--panel)] p-5 sm:p-6">
      <span className="lp-tag">{tag}</span>
      {x && <p className="lp-body mt-3 !text-[var(--ink)]">{rich(x)}</p>}
      {items && <List items={items} />}
      {foot && <p className="lp-label mt-4 leading-[1.5]">{foot}</p>}
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

export default function Terms() {
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
        {/* Đầu trang */}
        <div className="lp-rise max-w-[640px]">
          <p className="lp-label">Pháp lý · Cập nhật lần cuối {UPDATED}</p>
          <h1 className="mt-3 text-[clamp(27px,4vw,44px)] leading-[1.2] tracking-[-0.03em]">Điều khoản sử dụng</h1>
          <p className="lp-body lp-d1 mt-4">{INTRO.text}</p>
          <ul className="lp-d2 mt-6 flex flex-wrap gap-1.5">
            {INTRO.chips.map((c) => <li key={c} className="lp-tag">{c}</li>)}
          </ul>
        </div>

        <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-10 lg:mt-20 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
          {/* Mục lục: hàng chip cuộn ngang trên điện thoại, cột dính bên trái trên máy tính */}
          <nav aria-label="Mục lục" className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <p className="lp-label mb-3 hidden lg:block">Mục lục</p>
            <ol className="-mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0">
              {ALL.map((s, i) => (
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

          {/* Nội dung */}
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

            {/* Chấp nhận điều khoản */}
            <section id={ACCEPT.id} className="scroll-mt-28 pt-6">
              <Reveal>
                <div className="lp-card p-7 sm:p-[56px]">
                  <p className="lp-label">{pad(SECTIONS.length + 1)}</p>
                  <h2 className="mt-2 text-[24px] leading-[1.2] tracking-[-0.48px] sm:text-[27px]">{ACCEPT.title}</h2>
                  <p className="lp-body mt-4">{ACCEPT.lead}</p>
                  <List items={ACCEPT.items} />
                  <p className="lp-label mt-5 leading-[1.5]">{ACCEPT.foot}</p>
                  <Link to="/dashboard" className="lp-cta lp-press mt-8">
                    <span>Quay về trang chủ</span><ArrowRight size={16} strokeWidth={1.5} />
                  </Link>
                </div>
              </Reveal>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
      }
  
     
