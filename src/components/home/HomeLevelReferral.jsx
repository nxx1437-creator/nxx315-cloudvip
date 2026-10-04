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
  const fmt = (n) => Number(n || 0).toLocaleString(lang === "en" ? "en-US" : "vi-VN");

  if (loading) {
    return (
      <div>
        <SectionLabel>{t("dash2.lvTitle")}</SectionLabel>
        <Panel className="h-32 animate-pulse bg-slate-50" />
      </div>
    );
  }
  if (!data) return null;

  return (
    <div>
      <SectionLabel>{t("dash2.lvTitle")}</SectionLabel>
      <Panel className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center border border-amber-200 bg-amber-50 text-amber-500">
              <Crown size={22} />
            </span>
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                {t("dash2.lvNow", { level: data.level })}
              </p>
              <p className="text-xl font-black uppercase leading-tight text-slate-950">
                {data.label}
              </p>
            </div>
          </div>
          <span className="shrink-0 border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 font-mono text-[11px] font-bold text-emerald-700">
            {t("dash2.lvBonus", { pct: data.bonus })}
          </span>
        </div>

        {data.next ? (
          <>
            <div className="mt-5 h-2.5 bg-slate-100">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all"
                style={{ width: `${data.pct}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-slate-500">
              <span>
                {fmt(data.lifetime)} / {fmt(data.nextCoins)}
              </span>
              <span className="font-bold text-emerald-700">
                {t("dash2.lvRemain", { n: fmt(data.remain) })}
              </span>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3 text-[13px] leading-5 text-slate-600">
              <p className="font-bold text-slate-800">
                {t("dash2.lvNext", { label: data.next.label })}
              </p>
              <p>{t("dash2.lvNextBonus", { pct: data.next.task_bonus })}</p>
            </div>
          </>
        ) : (
          <p className="mt-4 border-t border-slate-100 pt-3 text-[13px] font-bold text-emerald-700">
            {t("dash2.lvMax")}
          </p>
        )}

        <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-slate-400">
          {t("dash2.lvLifetime")}: {fmt(data.lifetime)}
        </p>
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
        return;
      } catch {
        return; // người dùng đóng hộp chia sẻ
      }
    }
    handleCopy();
  };

  return (
    <div>
      <SectionLabel>{t("dash2.refTitle")}</SectionLabel>
      <Panel className="p-5">
        <p className="text-[13px] leading-5 text-slate-600">
          {t("dash2.refSub")}
        </p>

        {code ? (
          <>
            <div className="mt-4 flex items-stretch gap-2">
              <div className="flex-1 border-2 border-dashed border-emerald-300 bg-emerald-50/60 px-4 py-2.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-700/70">
                  {t("dash2.refCode")}
                </p>
                <p className="font-mono text-xl font-black tracking-[0.18em] text-emerald-800">
                  {code}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="flex w-20 flex-col items-center justify-center gap-1 border border-slate-200 bg-white text-[11px] font-bold uppercase text-slate-600 transition hover:border-emerald-500 hover:text-emerald-700"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? t("dash2.refCopied") : t("dash2.refCopy")}
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                <Users size={13} />
                {t("dash2.refCount", { n: profile?.referrals_count || 0 })}
              </span>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 bg-emerald-600 px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white transition hover:bg-emerald-700"
              >
                <Share2 size={14} /> {t("dash2.refShare")}
              </button>
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-slate-400">{t("dash2.refNoCode")}</p>
        )}
      </Panel>
    </div>
  );
                                      }
