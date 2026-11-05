// src/components/tasks/IpBlockedScreen.jsx — màn hình khi nhiệm vụ bị tạm khóa (lời nhắn thân thiện)
import React from "react";
import { Headphones, HeartHandshake } from "lucide-react";
import TopHeader from "../TopHeader.jsx";
import BottomNav from "../BottomNav.jsx";
import { useI18n } from "../../i18n/index.js";

// Lời nhắn tiếng Việt thân thiện. Ngôn ngữ khác vẫn dùng bản dịch cũ trong i18n.
const VI = {
  title: "Ối!!!, mình tạm nghỉ một chút nhé",
  intro:
    "Hệ thống thấy kết nối của bạn hơi lạ nên đã tạm khóa nhiệm vụ để giữ an toàn cho tài khoản. Đừng lo, đa số chỉ là hiểu nhầm thôi, tụi mình gỡ cho bạn liền!",
  reasonLabel: "Lời nhắn từ hệ thống",
  help: "Để tụi mình giúp bạn nha ",
  helpSub: "Nhắn đội hỗ trợ qua Zalo, tụi mình sẽ kiểm tra và mở lại cho bạn sớm nhất có thể.",
  chat: "Nhắn Zalo cho tụi mình",
  attach: "Gửi kèm giúp tụi mình mấy thứ này để xử lý nhanh hơn nhé:",
  a1: "Ảnh chụp màn hình trang này",
  a2: "Email tài khoản bạn đang dùng",
  a3: "Bạn đang dùng Wi-Fi hay 4G, có bật VPN không",
  tip: "Mẹo nhỏ: thử tắt VPN hoặc proxy, hay đổi sang 4G rồi tải lại trang. Nhiều khi là hết liền đó ✨",
};

export default function IpBlockedScreen({ reason }) {
  const { t, lang } = useI18n();
  const vi = !lang || lang === "vi";
  const tx = (key) => (vi ? VI[key] : t(`tk.ip.${key}`));

  return (
    <div className="min-h-screen bg-[#eefaf7] pb-24">
      <TopHeader />

      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <HeartHandshake size={32} className="text-amber-600" strokeWidth={2.2} />
          </div>
          <h2 className="mt-4 text-[20px] font-black text-slate-900">{vi ? VI.title : t("tk.ip.title")}</h2>
          {vi && <p className="mt-3 text-[14px] leading-6 text-slate-600">{VI.intro}</p>}

          {reason && (
            <div className="mt-4 rounded-2xl bg-white/80 px-4 py-3 text-left ring-1 ring-amber-100">
              {vi && (
                <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-amber-600">
                  {VI.reasonLabel}
                </p>
              )}
              <p className="mt-1 text-[13px] leading-5 text-slate-600">{reason}</p>
            </div>
          )}
        </div>

        <div className="mt-5 rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Headphones size={16} className="text-emerald-600" strokeWidth={2.4} />
            <h3 className="text-[14.5px] font-black text-slate-900">{tx("help")}</h3>
          </div>
          <p className="mt-1.5 text-[12.5px] leading-5 text-slate-500">{tx("helpSub")}</p>

          <a
            href="https://zalo.me/0865245988"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 py-3.5 text-[14px] font-black text-white shadow-md shadow-emerald-500/30 transition hover:brightness-110 active:scale-[0.98]"
          >
            <Headphones size={16} strokeWidth={2.6} />
            {tx("chat")}
          </a>

          <div className="mt-3 rounded-2xl bg-slate-50 p-3.5">
            <p className="text-[12px] font-bold leading-5 text-slate-600">{tx("attach")}</p>
            <ul className="mt-1 list-inside list-disc text-[12px] leading-5 text-slate-600">
              <li>{tx("a1")}</li>
              <li>{tx("a2")}</li>
              <li>{tx("a3")}</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5">
          <p className="text-[12.5px] leading-5 text-emerald-700">{tx("tip")}</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

