import React, { useState } from "react";
import { Crown, Copy, Check, Share2, Users } from "lucide-react";
import useLevelProgress from "../../hooks/useLevelProgress.js";
import { Panel, SectionLabel } from "./HomeSections.jsx";
import { useI18n } from "../../i18n/index.js";

// ===== Cấp độ & thưởng cấp tiếp theo =====
export function LevelCard({ userId, state }) {
  const { t, lang } = useI18n();
  const own = useLevelProgress(state ? null : userId);
  const { loading, data } = state || own;
  const fmt = (n) =>
    Number(n || 0).toLocaleString(lang === "en" ? "en-US" : "vi-VN");

  if (loading) {
    return (
      <div>
        <SectionLabel>{t("dash2.lvTitle")}</SectionLabel>
        <div className="h-36 animate-pulse rounded-3xl bg-slate-100" />
      </div>
    );
  }
  if (!data) return null;

  return (
    <div>
      <SectionLabel>{t("dash2.lvTitle")}</SectionLabel>
      <Panel className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 text-white shadow-md shadow-amber-300/50">
              <Crown size={26} />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-400">
                {t("dash2.lvNow", { level: data.level })}
              </p>
              <p className="text-xl font-extrabold leading-tight text-slate-900">
                {data.label}
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            {t("dash2.lvBonus", { pct: data.bonus })}
          </span>
        </div>

        {data.next ? (
          <>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all"
                style={{ width: `${data.pct}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">
                {fmt(data.lifetime)} / {fmt(data.nextCoins)}
              </span>
              <span className="font-bold text-emerald-700">
                {t("dash2.lvRemain", { n: fmt(data.remain) })}
              </span>
            </div>
            <div className="mt-4 rounded-2xl bg-slate-50 p-3.5 text-[13px] leading-5 text-slate-600">
              <p className="font-bold text-slate-800">
                {t("dash2.lvNext", { label: data.next.label })}
              </p>
              <p>{t("dash2.lvNextBonus", { pct: data.next.task_bonus })}</p>
            </div>
          </>
        ) : (
          <p className="mt-4 rounded-2xl bg-emerald-50 p-3.5 text-[13px] font-bold text-emerald-700">
            {t("dash2.lvMax")}
          </p>
        )}
      </Panel>
    </div>
  );
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

// ===== Mời bạn bè =====
export function ReferralCard({ profile }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const code = profile?.referral_code || "";
  const link = code ? `${window.location.origin}/register?ref=${code}` : "";

  const handleCopy = async () => {
    if (!code) return;
    const ok = await copyText(link);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!code) return;
    const text = t("dash2.refShareText", { code });
    if (navigator.share) {
      try {
        await navigator.share({ title: "NXX315 Studio", text, url: link });
      } catch {
        /* người dùng đóng hộp chia sẻ */
      }
      return;
    }
    handleCopy();
  };

  return (
    <div>
      <SectionLabel>{t("dash2.refTitle")}</SectionLabel>
      <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5 shadow-[0_4px_24px_-10px_rgba(5,150,105,0.25)]">
        <p className="text-[13px] leading-5 text-slate-600">
          {t("dash2.refSub")}
        </p>

        {code ? (
          <>
            <div className="mt-4 flex items-stretch gap-2.5">
              <div className="flex-1 rounded-2xl border-2 border-dashed border-emerald-300 bg-white px-4 py-3">
                <p className="text-[11px] font-semibold text-emerald-700/70">
                  {t("dash2.refCode")}
                </p>
                <p className="font-mono text-xl font-black tracking-[0.15em] text-emerald-800">
                  {code}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="flex w-20 flex-col items-center justify-center gap-1 rounded-2xl bg-white text-[11px] font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:text-emerald-700 hover:ring-emerald-400 active:scale-95"
              >
                {copied ? <Check size={17} /> : <Copy size={17} />}
                {copied ? t("dash2.refCopied") : t("dash2.refCopy")}
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Users size={14} />
                {t("dash2.refCount", { n: profile?.referrals_count || 0 })}
              </span>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-700 active:scale-95"
              >
                <Share2 size={15} /> {t("dash2.refShare")}
              </button>
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-slate-400">{t("dash2.refNoCode")}</p>
        )}
      </div>
    </div>
  );
                }
