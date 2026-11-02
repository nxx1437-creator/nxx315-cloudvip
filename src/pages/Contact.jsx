import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Gift, Bug, Lightbulb, Mail, Youtube, ExternalLink, Loader2, CheckCircle2, XCircle } from "lucide-react";
import LegalPage from "../components/LegalKit.jsx";
import { supabase } from "../lib/supabaseClient.js";

const ADMIN_CHAT_ID = 6152450878;

// ẢNH / VIDEO MINH HỌA: ảnh thì tải lên Supabase (bucket game_logos) rồi ghi TÊN FILE;
// video thì để trong thư mục public của repo rồi ghi "/ten-video.mp4". Để "" nếu chưa có.
const IMAGES = { hero: "/contact-hero.mp4", "tai-khoan": "", "doi-thuong": "", "bao-loi": "", "gop-y": "" };
const ICONS = { "tai-khoan": AlertCircle, "doi-thuong": Gift, "bao-loi": Bug, "gop-y": Lightbulb };

// Nội dung: sửa chữ ở đây. Dùng **chữ đậm** để nhấn mạnh.
const EMAIL = "nxx315hub@gmail.com";
const YOUTUBE = "https://youtube.com/@nxx3155/community";
const INTRO = {
  text: "Bạn cần hỗ trợ, muốn báo lỗi hoặc có vấn đề liên quan đến tài khoản? Hãy liên hệ NXX315 Studio Rewards qua các kênh hỗ trợ chính thức bên dưới.",
  chips: ["Hỗ trợ tài khoản", "Báo lỗi", "Góp ý", "Kênh chính thức"],
};
const SECTIONS = [
  { id: "tai-khoan", title: "Hỗ trợ tài khoản", blocks: [
    { t: "p", x: "Bạn có thể liên hệ khi gặp các vấn đề như:" },
    { t: "list", items: ["Không thể đăng nhập", "Tài khoản gặp lỗi", "Xu/điểm không được cộng đúng", "Nhiệm vụ không được ghi nhận",
      "Yêu cầu đổi thưởng gặp vấn đề", "Cần hỗ trợ về đơn đổi thưởng", "Phát hiện hoạt động bất thường trên tài khoản"] },
  ]},
  { id: "doi-thuong", title: "Hỗ trợ đổi thưởng", blocks: [
    { t: "p", x: "Khi liên hệ về một đơn đổi thưởng, vui lòng cung cấp:" },
    { t: "list", items: ["Tên tài khoản", "Mã đơn hàng", "Phần thưởng đã yêu cầu", "Mô tả vấn đề", "Ảnh chụp màn hình nếu cần thiết"] },
    { t: "note", tag: "Bảo mật", x: "**Không gửi mật khẩu** hoặc mã xác thực tài khoản cho bất kỳ ai." },
  ]},
  { id: "bao-loi", title: "Báo lỗi", blocks: [
    { t: "p", x: "Nếu bạn phát hiện lỗi trên NXX315 Studio Rewards, hãy cung cấp:" },
    { t: "list", items: ["Mô tả lỗi", "Các bước khiến lỗi xảy ra", "Thiết bị/trình duyệt đang sử dụng", "Ảnh hoặc video minh họa nếu có"] },
    { t: "note", tag: "Nghiêm cấm", x: "**Không cố tình khai thác lỗi** để nhận xu/điểm hoặc phần thưởng." },
  ]},
  { id: "gop-y", title: "Góp ý", blocks: [
    { t: "p", x: "Bạn cũng có thể liên hệ để gửi:" },
    { t: "list", items: ["Góp ý cải thiện website", "Đề xuất nhiệm vụ", "Đề xuất phần thưởng", "Báo cáo trải nghiệm không tốt", "Ý tưởng cho các tính năng mới"] },
  ]},
];
const PAGE_SECTIONS = SECTIONS.map((s) => ({ ...s, icon: ICONS[s.id], img: IMAGES[s.id] }));
const EXTRA_TOC = [{ id: "kenh", title: "Kênh chính thức" }, { id: "gui-yeu-cau", title: "Gửi yêu cầu" }];

const SEC = "scroll-mt-28 border-t-[.5px] border-[var(--line)] py-10 sm:py-12";
const H2 = "text-[22px] leading-[1.25] tracking-[-0.44px] sm:text-[24px]";
const INPUT = "mt-1.5 w-full rounded-[14px] border-[.5px] border-[var(--line)] bg-white px-4 py-3 text-[16px] outline-none transition-colors focus:border-[var(--blue)]";

function Channel({ icon: Icon, label, href, text, external }) {
  return (
    <div className="flex items-center gap-4 border-b-[.5px] border-[var(--line)] py-4 last:border-b-0">
      <Icon size={22} strokeWidth={1.25} className="shrink-0 text-[var(--ink)]" />
      <div className="min-w-0">
        <p className="text-[12px] text-[var(--mute)]">{label}</p>
        <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="mt-0.5 inline-flex items-center gap-1 break-all text-[16px] text-[var(--blue)]">
          {text} {external && <ExternalLink size={13} strokeWidth={1.5} />}
        </a>
      </div>
    </div>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSending(true); setError(""); setSent(false);
    try {
      // 1) Lưu vào database
      const { error: dbError } = await supabase.from("support_tickets").insert({
        user_name: form.name, user_email: form.email, subject: form.subject, message: form.message, status: "pending",
      });
      if (dbError) throw dbError;
      // 2) Báo lên Telegram
      try {
        await supabase.functions.invoke("telegram-webhook", {
          body: { message: {
            text: `🆕 Yêu cầu hỗ trợ mới! Tên: ${form.name}\n📧 Email: ${form.email}\n📌 Chủ đề: ${form.subject}\n📝 Nội dung: ${form.message}`,
            chat: { id: ADMIN_CHAT_ID },
          } },
        });
      } catch (teleError) { console.error("Lỗi gửi Telegram:", teleError); }
      // 3) Gửi email
      const { data, error: fnError } = await supabase.functions.invoke("send-email", { body: form });
      if (fnError) throw new Error(fnError.message);
      if (data?.success) {
        setSent(true); setForm({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setSent(false), 5000);
      } else throw new Error(data?.error || "Gửi thất bại");
    } catch (err) {
      setError(err.message || "Lỗi kết nối, vui lòng thử lại sau");
    } finally { setSending(false); }
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-5">
      {error && (
        <div className="flex items-start gap-2.5 rounded-[14px] bg-[#f6f6f7] p-4 text-[15px] text-[#c8374b]">
          <XCircle size={18} strokeWidth={1.5} className="mt-0.5 shrink-0" /> <span>{error}</span>
        </div>
      )}
      <label className="block text-[13px] text-[var(--mute)]">Tên của bạn *
        <input type="text" required value={form.name} onChange={set("name")} placeholder="Nhập tên của bạn" className={INPUT} />
      </label>
      <label className="block text-[13px] text-[var(--mute)]">Email *
        <input type="email" required value={form.email} onChange={set("email")} placeholder="email@example.com" className={INPUT} />
      </label>
      <label className="block text-[13px] text-[var(--mute)]">Chủ đề *
        <select required value={form.subject} onChange={set("subject")} className={INPUT}>
          <option value="">Chọn chủ đề...</option>
          {["Hỗ trợ tài khoản", "Hỗ trợ đổi thưởng", "Báo lỗi", "Góp ý", "Khác"].map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
      </label>
      <label className="block text-[13px] text-[var(--mute)]">Nội dung *
        <textarea required rows={5} value={form.message} onChange={set("message")} placeholder="Mô tả chi tiết vấn đề của bạn..." className={INPUT} />
      </label>
      <button type="submit" disabled={sending} className="lg-cta lg-press w-full justify-center disabled:opacity-50">
        {sending ? <Loader2 size={18} className="animate-spin" /> : <span>Gửi yêu cầu</span>}
      </button>
      {sent && (
        <div className="flex items-start gap-2.5 rounded-[14px] bg-[#f6f6f7] p-4 text-[15px] text-[#1f9d68]">
          <CheckCircle2 size={18} strokeWidth={1.5} className="mt-0.5 shrink-0" /> <span>Yêu cầu của bạn đã được gửi! Chúng tôi sẽ phản hồi sớm.</span>
        </div>
      )}
    </form>
  );
}

const extra = (
  <>
    <section id="kenh" className={SEC}>
      <h2 className={H2}>Kênh liên hệ chính thức</h2>
      <div className="mt-4 border-t-[.5px] border-[var(--line)]">
        <Channel icon={Mail} label="Email hỗ trợ" href={`mailto:${EMAIL}`} text={EMAIL} />
        <Channel icon={Youtube} label="Kênh cộng đồng" href={YOUTUBE} text="YouTube Community" external />
      </div>
      <div className="mt-5 rounded-[14px] bg-[#f6f6f7] p-4 sm:p-5">
        <p className="text-[12px] text-[#b7791f]">Lưu ý</p>
        <p className="mt-1.5 text-[16px] leading-[1.5]">Chỉ sử dụng các kênh được công bố trên website NXX315 Studio Rewards.</p>
      </div>
      <p className="mt-6 text-[16px] leading-[1.55] text-[var(--soft)]">
        Thời gian phản hồi có thể thay đổi tùy số lượng yêu cầu và mức độ phức tạp của vấn đề. Xem thêm{" "}
        <Link to="/privacy" className="text-[var(--blue)]">Chính sách quyền riêng tư</Link>.
      </p>
    </section>

    <section id="gui-yeu-cau" className={SEC}>
      <h2 className={H2}>Gửi yêu cầu</h2>
      <p className="mt-3 text-[16px] leading-[1.55] text-[var(--soft)]">Điền thông tin bên dưới, chúng tôi sẽ phản hồi sớm nhất có thể.</p>
      <ContactForm />
    </section>
  </>
);

export default function Contact() {
  return (
    <LegalPage
      title="Liên hệ NXX315 Studio Rewards"
      eyebrow="Hỗ trợ · Luôn sẵn sàng"
      intro={INTRO.text}
      chips={INTRO.chips}
      hero={IMAGES.hero}
      sections={PAGE_SECTIONS}
      extra={extra}
      extraToc={EXTRA_TOC}
      home="/"
    />
  );
}

