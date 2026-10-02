import React from "react";
import { ShieldAlert, Headphones } from "lucide-react";
import TopHeader from "../TopHeader.jsx";
import BottomNav from "../BottomNav.jsx";
import { useI18n } from "../../i18n/index.js";

export default function IpBlockedScreen({ reason }) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-white pb-24">
      <TopHeader />

      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="rounded-2xl border-2 border-rose-300 bg-gradient-to-br from-rose-50 to-white p-6 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
            <ShieldAlert size={32} className="text-rose-600" strokeWidth={2.2} />
          </div>
          <h2 className="mt-4 text-[20px] font-black text-rose-800">
            {t("tk.ip.title")}
          </h2>
          <p className="mt-3 text-[13.5px] leading-6 text-rose-700">{reason}</p>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Headphones size={16} className="text-sky-600" strokeWidth={2.4} />
            <h3 className="text-[14px] font-black text-slate-900">
              {t("tk.ip.help")}
            </h3>
          </div>
          <p className="mt-1.5 text-[12px] leading-5 text-slate-500">
            {t("tk.ip.helpSub")}
          </p>

          <a
            href="https://zalo.me/0865245988"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-3.5 text-[14px] font-black text-white shadow-md shadow-sky-500/30 transition hover:brightness-110 active:scale-[0.98]"
          >
            <Headphones size={16} strokeWidth={2.6} />
            {t("tk.ip.chat")}
          </a>

          <div className="mt-3 rounded-xl bg-slate-50 p-3">
            <p className="text-[11.5px] font-bold leading-5 text-slate-600">
              {t("tk.ip.attach")}
            </p>
            <ul className="mt-1 list-inside list-disc text-[11.5px] leading-5 text-slate-600">
              <li>{t("tk.ip.a1")}</li>
              <li>{t("tk.ip.a2")}</li>
              <li>{t("tk.ip.a3")}</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-3.5">
          <p className="text-[12px] leading-5 text-sky-700">{t("tk.ip.tip")}</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
