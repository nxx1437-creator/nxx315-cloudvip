// src/components/tasks/IpBlockedScreen.jsx — màn hình khi nhiệm vụ bị tạm khóa (lời nhắn thân thiện)
// Toàn bộ chữ lấy từ i18n: tk.ip.title / intro / reasonLabel / help / helpSub / chat / attach / a1 / a2 / a3 / tip
import React from "react";
import { Headphones, HeartHandshake } from "lucide-react";
import TopHeader from "../TopHeader.jsx";
import BottomNav from "../BottomNav.jsx";
import { useI18n } from "../../i18n/index.js";

export default function IpBlockedScreen({ reason }) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[#eefaf7] pb-24">
      <TopHeader />

      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <HeartHandshake size={32} className="text-amber-600" strokeWidth={2.2} />
          </div>
          <h2 className="mt-4 text-[20px] font-black text-slate-900">{t("tk.ip.title")}</h2>
          <p className="mt-3 text-[14px] leading-6 text-slate-600">{t("tk.ip.intro")}</p>

          {reason && (
            <div className="mt-4 rounded-2xl bg-white/80 px-4 py-3 text-left ring-1 ring-amber-100">
              <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-amber-600">
                {t("tk.ip.reasonLabel")}
              </p>
              <p className="mt-1 text-[13px] leading-5 text-slate-600">{reason}</p>
            </div>
          )}
        </div>

        <div className="mt-5 rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Headphones size={16} className="text-emerald-600" strokeWidth={2.4} />
            <h3 className="text-[14.5px] font-black text-slate-900">{t("tk.ip.help")}</h3>
          </div>
          <p className="mt-1.5 text-[12.5px] leading-5 text-slate-500">{t("tk.ip.helpSub")}</p>

          <a
            href="https://zalo.me/0865245988"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 py-3.5 text-[14px] font-black text-white shadow-md shadow-emerald-500/30 transition hover:brightness-110 active:scale-[0.98]"
          >
            <Headphones size={16} strokeWidth={2.6} />
            {t("tk.ip.chat")}
          </a>

          <div className="mt-3 rounded-2xl bg-slate-50 p-3.5">
            <p className="text-[12px] font-bold leading-5 text-slate-600">{t("tk.ip.attach")}</p>
            <ul className="mt-1 list-inside list-disc text-[12px] leading-5 text-slate-600">
              <li>{t("tk.ip.a1")}</li>
              <li>{t("tk.ip.a2")}</li>
              <li>{t("tk.ip.a3")}</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5">
          <p className="text-[12.5px] leading-5 text-emerald-700">{t("tk.ip.tip")}</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}


