import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { LandingHeader, LandingFooter } from "../components/LandingNav.jsx";
import { SITE } from "../lib/siteInfo.js";
import { useI18n } from "../i18n/index.js";

const COPY = {
  vi: {
    title: "Về NXX315 Studio",
    lead: (since) =>
      `NXX315 là nền tảng làm nhiệm vụ nhận Coin và đổi lấy quà game, do cá nhân vận hành. Web mới hoạt động từ ${since}, còn nhỏ và đang hoàn thiện. Vì vậy bạn nên đọc kỹ trang này trước khi tham gia.`,
    l: {
      operator: "Người vận hành",
      business: "Đăng ký kinh doanh",
      address: "Địa chỉ",
      since: "Hoạt động từ",
    },
    whoH: "Ai đứng sau",
    srcH: "Xu đến từ đâu",
    src: "Mỗi nhiệm vụ là một liên kết của đối tác quảng cáo. Khi bạn hoàn thành hợp lệ, đối tác trả phí cho NXX315 và phần xu thưởng được lấy từ nguồn đó. Vì thế xu chỉ được cộng khi nhiệm vụ được xác nhận, và các hành vi gian lận như đa tài khoản, VPN hay tool tự động sẽ bị chặn.",
    noH: "Những điều chúng tôi không làm",
    no: [
      "Không yêu cầu nạp tiền để kiếm hoặc rút Coin.",
      "Không bao giờ hỏi mật khẩu, mã OTP hay mã khôi phục của bạn.",
      "Không cam kết thu nhập. Số xu bạn kiếm phụ thuộc vào số nhiệm vụ còn lượt và hoạt động của bạn.",
      "Không bán tool hack minigame hay mẹo tăng xu.",
    ],
    noNote:
      "Cửa hàng cho phép thanh toán bằng chuyển khoản nếu bạn muốn mua quà trực tiếp. Đó là mua hàng, không phải khoản nạp bắt buộc để được rút.",
    payH: "Rút tiền và đổi quà",
    pay: [
      "1 Coin = 1đ.",
      "Rút tối thiểu 10.000đ, phí 1.000 Coin mỗi lần, tối đa 5 lần và 500.000đ mỗi ngày.",
      "Yêu cầu rút và đơn đổi quà được xem xét thủ công để chặn gian lận, nên cần thời gian.",
      "Nếu yêu cầu rút bị từ chối, lý do hiển thị trong lịch sử. Số tiền rút được hoàn lại, phí 1.000 Coin được giữ.",
    ],
    payNote:
      "Chúng tôi không hứa duyệt tức thì. Nếu chờ quá lâu, hãy liên hệ kèm mã đơn.",
    links: [
      ["/guide/rut-tien", "Hướng dẫn rút tiền"],
      ["/guide/doi-thuong", "Hướng dẫn đổi thưởng"],
      ["/withdraw/history", "Lịch sử rút"],
    ],
    refH: "Chương trình giới thiệu",
    ref: "Chương trình chỉ có một cấp và không thu phí tham gia. Người được mời nhận 200 xu khi nhập mã. Người mời nhận 15% số xu mà người đó kiếm từ nhiệm vụ, kèm thưởng mốc khi đủ 3, 5, 10 và 20 người. Đây không phải cam kết thu nhập, và tài khoản tạo ra để tự mời chính mình sẽ bị thu hồi thưởng.",
    contactH: "Liên hệ chính thức",
    contact:
      "Chúng tôi chỉ có các kênh dưới đây. Mọi trang hoặc người khác tự xưng NXX315 rồi đòi tiền hay mật khẩu đều là giả mạo.",
    chat: "Chat hỗ trợ",
    legal: [
      ["/terms", "Điều khoản"],
      ["/privacy", "Quyền riêng tư"],
      ["/fraud", "Chống gian lận"],
      ["/redemption-policy", "Chính sách đổi thưởng"],
    ],
  },
  en: {
    title: "About NXX315 Studio",
    lead: (since) =>
      `NXX315 is a platform where you complete tasks to earn Coins and redeem game gifts. It is run by an individual. The site has only been running since ${since}, so it is small and still improving. Please read this page before you join.`,
    l: {
      operator: "Operator",
      business: "Business registration",
      address: "Address",
      since: "Running since",
    },
    whoH: "Who is behind it",
    srcH: "Where the coins come from",
    src: "Each task is a link from an advertising partner. When you complete it validly, the partner pays NXX315 and the coin reward comes from that income. That is why coins are only credited once a task is confirmed, and cheating such as multiple accounts, VPNs or automation tools is blocked.",
    noH: "What we do not do",
    no: [
      "We never ask you to deposit money to earn or withdraw Coins.",
      "We never ask for your password, OTP or recovery codes.",
      "We do not promise income. What you earn depends on available task slots and your activity.",
      "We do not sell minigame hacks or tricks to get more coins.",
    ],
    noNote:
      "The store accepts bank transfer if you want to buy a gift directly. That is a purchase, not a required deposit to be able to withdraw.",
    payH: "Withdrawals and redemptions",
    pay: [
      "1 Coin = 1 VND.",
      "Minimum withdrawal 10,000 VND, a fee of 1,000 Coins per request, up to 5 requests and 500,000 VND per day.",
      "Withdrawals and redemption orders are reviewed manually to stop fraud, so they take time.",
      "If a withdrawal is rejected, the reason is shown in your history. The withdrawn amount is returned and the 1,000 Coin fee is kept.",
    ],
    payNote:
      "We do not promise instant approval. If you wait too long, contact us with your order code.",
    links: [
      ["/guide/rut-tien", "Withdrawal guide"],
      ["/guide/doi-thuong", "Redemption guide"],
      ["/withdraw/history", "Withdrawal history"],
    ],
    refH: "Referral program",
    ref: "The program has a single level and no joining fee. A friend who enters your code gets 200 coins. You get 15% of the coins they earn from tasks, plus bonuses at 3, 5, 10 and 20 invites. This is not an income guarantee, and accounts created to invite yourself lose their rewards.",
    contactH: "Official contact",
    contact:
      "These are our only channels. Any other page or person claiming to be NXX315 and asking for money or passwords is an impersonator.",
    chat: "Support chat",
    legal: [
      ["/terms", "Terms"],
      ["/privacy", "Privacy"],
      ["/fraud", "Anti-fraud"],
      ["/redemption-policy", "Redemption policy"],
    ],
  },
};

const Section = ({ title, children }) => (
  <section className="border-t border-slate-200 py-9">
    <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
    <div className="mt-3 space-y-3 text-[16px] leading-7 text-slate-600">
      {children}
    </div>
  </section>
);

const Bullets = ({ items }) => (
  <ul className="space-y-2">
    {items.map((x, i) => (
      <li key={i} className="flex gap-3">
        <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
        <span>{x}</span>
      </li>
    ))}
  </ul>
);

const Row = ({ k, children }) => (
  <div className="grid gap-1 border-b border-slate-100 py-3 sm:grid-cols-[190px_1fr]">
    <dt className="text-[14px] font-semibold text-slate-500">{k}</dt>
    <dd className="text-[16px] text-slate-900">{children}</dd>
  </div>
);

const A = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="font-semibold text-blue-600 hover:underline"
  >
    {children}
  </a>
);

export default function About() {
  const { lang } = useI18n();
  const c = COPY[lang] || COPY.vi;
  const since = SITE.launched[lang] || SITE.launched.vi;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white font-['Be_Vietnam_Pro',sans-serif] text-slate-900">
      <LandingHeader />

      <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <h1 className="text-[34px] font-extrabold leading-tight tracking-tight sm:text-5xl">
          {c.title}
        </h1>
        <p className="mt-5 text-[17px] leading-8 text-slate-600">
          {c.lead(since)}
        </p>

        <section className="mt-10 border-t border-slate-200 py-9">
          <h2 className="text-xl font-bold tracking-tight">{c.whoH}</h2>
          <dl className="mt-3">
            <Row k={c.l.operator}>{SITE.operator}</Row>
            {SITE.youtube && (
              <Row k="YouTube">
                <A href={SITE.youtube}>
                  {SITE.youtube.replace("https://www.", "")}
                </A>
              </Row>
            )}
            {SITE.business && <Row k={c.l.business}>{SITE.business}</Row>}
            {SITE.address && <Row k={c.l.address}>{SITE.address}</Row>}
            <Row k={c.l.since}>{since}</Row>
          </dl>
        </section>

        <Section title={c.srcH}>
          <p>{c.src}</p>
        </Section>

        <Section title={c.noH}>
          <Bullets items={c.no} />
          <p>{c.noNote}</p>
        </Section>

        <Section title={c.payH}>
          <Bullets items={c.pay} />
          <p>{c.payNote}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
            {c.links.map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className="inline-flex items-center gap-1 text-[15px] font-semibold text-blue-600 hover:underline"
              >
                {label} <ArrowRight size={14} />
              </Link>
            ))}
          </div>
        </Section>

        <Section title={c.refH}>
          <p>{c.ref}</p>
        </Section>

        <Section title={c.contactH}>
          <p>{c.contact}</p>
          <dl>
            <Row k="Zalo">
              <A href={SITE.zaloUrl}>{SITE.zalo}</A>
            </Row>
            <Row k="Email">
              <A href={`mailto:${SITE.email}`}>{SITE.email}</A>
            </Row>
            <Row k={c.chat}>
              <Link
                to="/support"
                className="font-semibold text-blue-600 hover:underline"
              >
                /support
              </Link>
            </Row>
          </dl>
        </Section>

        <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-200 pt-8 text-[14px]">
          {c.legal.map(([to, label]) => (
            <Link
              key={to}
              to={to}
              className="text-slate-500 hover:text-blue-600"
            >
              {label}
            </Link>
          ))}
        </div>
      </main>

      <LandingFooter />
    </div>
  );
      }
