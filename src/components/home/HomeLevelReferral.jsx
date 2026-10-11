import React, { useState } from "react";
import { Crown, Copy, Check, Share2, Users } from "lucide-react";
import useLevelProgress from "../../hooks/useLevelProgress.js";
import { Section, Tag, ProgressBar } from "./HomeUI.jsx";
import { useI18n } from "../../i18n/index.js";

// ===== Cấp độ =====
export function LevelCard({ userId, state }) {
  const { t, lang } = useI18n();
  const own = useLevelProgress(state ? null : userId);
  const { loading, data } = state || own;
  const fmt = (n) =>
    Number(n || 0).toLocaleString(lang === "en" ? "en-US" : "vi-VN");

  if (loading) {
    return (
      <Section title={t("dash2.lvTitle")}>
        <div className="skeleton-shimmer h-16 rounded-lg" />
      </Section>
    );
  }
  if (!data) return null;

  return (
    <Section
      title={t("dash2.lvTitle")}
      right={<Tag tone="green">{t("dash2.lvBonus", { pct: data.bonus })}</Tag>}
    >
      <div className="flex items-center gap-2">
        <Crown size={17} strokeWidth={1.75} className="text-amber-500" />
        <p className="truncate text-base font-semibold text-slate-900">
          {data.label}
        </p>
        <span className="text-xs text-slate-400">
          {t("dash2.lvNow", { level: data.level })}
        </span>
      </div>

      {data.next ? (
        <>
          <div className="mt-3">
            <ProgressBar pct={data.pct} />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="tabular-nums text-slate-500">
              {fmt(data.lifetime)} / {fmt(data.nextCoins)}
            </span>
            <span className="font-medium tabular-nums text-emerald-700">
              {t("dash2.lvRemain", { n: fmt(data.remain) })}
            </span>
          </div>
          <p className="mt-3 text-[13px] leading-5 text-slate-500">
            <span className="font-medium text-slate-800">
              {t("dash2.lvNext", { label: data.next.label })}
            </span>
            {" · "}
            {t("dash2.lvNextBonus", { pct: data.next.task_bonus })}
          </p>
        </>
      ) : (
        <p className="mt-3 text-[13px] font-medium text-emerald-700">
          {t("dash2.lvMax")}
        </p>
      )}
    </Section>
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
    <Section title={t("dash2.refTitle")}>
      <p className="text-[13px] leading-5 text-slate-500">
        {t("dash2.refSub")}
      </p>

      {code ? (
        <>
          <button
            type="button"
            onClick={handleCopy}
            className="mt-3 flex w-full items-center justify-between rounded-lg border border-slate-200 px-3.5 py-2.5 text-left transition active:bg-slate-50"
          >
            <span className="min-w-0">
              <span className="block text-[11px] text-slate-400">
                {t("dash2.refCode")}
              </span>
              <span className="block truncate font-mono text-base font-semibold tracking-wider text-slate-900">
                {code}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-slate-500">
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? t("dash2.refCopied") : t("dash2.refCopy")}
            </span>
          </button>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <Users size={14} strokeWidth={1.75} />
              {t("dash2.refCount", { n: profile?.referrals_count || 0 })}
            </span>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-[13px] font-medium text-white transition active:scale-95"
            >
              <Share2 size={14} /> {t("dash2.refShare")}
            </button>
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm text-slate-400">{t("dash2.refNoCode")}</p>
      )}
    </Section>
  );
}
