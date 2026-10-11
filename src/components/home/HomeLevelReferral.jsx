import React, { useState } from "react";
import { Crown, Copy, Check, Share2, Users } from "lucide-react";
import useLevelProgress from "../../hooks/useLevelProgress.js";
import { Card, Tag, ProgressBar } from "./HomeUI.jsx";
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
      <Card title={t("dash2.lvTitle")}>
        <div className="h-24 animate-pulse rounded-md bg-slate-100" />
      </Card>
    );
  }
  if (!data) return null;

  return (
    <Card
      title={t("dash2.lvTitle")}
      right={
        <Tag tone="green">{t("dash2.lvBonus", { pct: data.bonus })}</Tag>
      }
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-amber-200 bg-amber-50 text-amber-600">
          <Crown size={19} strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] text-slate-500">
            {t("dash2.lvNow", { level: data.level })}
          </p>
          <p className="truncate text-base font-semibold leading-tight text-slate-900">
            {data.label}
          </p>
        </div>
      </div>

      {data.next ? (
        <>
          <div className="mt-4">
            <ProgressBar pct={data.pct} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="tabular-nums text-slate-500">
              {fmt(data.lifetime)} / {fmt(data.nextCoins)}
            </span>
            <span className="font-medium tabular-nums text-emerald-600">
              {t("dash2.lvRemain", { n: fmt(data.remain) })}
            </span>
          </div>
          <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-600">
            <p className="font-medium text-slate-900">
              {t("dash2.lvNext", { label: data.next.label })}
            </p>
            <p>{t("dash2.lvNextBonus", { pct: data.next.task_bonus })}</p>
          </div>
        </>
      ) : (
        <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-700">
          {t("dash2.lvMax")}
        </p>
      )}
    </Card>
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
    <Card title={t("dash2.refTitle")}>
      <p className="text-xs leading-5 text-slate-500">{t("dash2.refSub")}</p>

      {code ? (
        <>
          <div className="mt-3 flex items-stretch gap-2">
            <div className="min-w-0 flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] text-slate-500">
                {t("dash2.refCode")}
              </p>
              <p className="truncate font-mono text-lg font-semibold tracking-widest text-slate-900">
                {code}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="flex w-16 flex-col items-center justify-center gap-1 rounded-md border border-slate-300 bg-white text-[11px] font-medium text-slate-700 transition hover:border-emerald-500 active:scale-95"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? t("dash2.refCopied") : t("dash2.refCopy")}
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <Users size={14} strokeWidth={1.75} />
              {t("dash2.refCount", { n: profile?.referrals_count || 0 })}
            </span>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-emerald-600 bg-[#3ECF8E] px-4 text-[13px] font-medium text-slate-900 transition active:scale-95"
            >
              <Share2 size={14} /> {t("dash2.refShare")}
            </button>
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm text-slate-400">{t("dash2.refNoCode")}</p>
      )}
    </Card>
  );
          }
