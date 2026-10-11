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
        <div className="skeleton-shimmer h-24 rounded-2xl" />
      </Card>
    );
  }
  if (!data) return null;

  return (
    <Card
      title={t("dash2.lvTitle")}
      right={<Tag tone="orange">{t("dash2.lvBonus", { pct: data.bonus })}</Tag>}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FBEBC8] text-[#92600A]">
          <Crown size={21} strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] text-[#8A8173]">
            {t("dash2.lvNow", { level: data.level })}
          </p>
          <p className="truncate text-lg font-extrabold leading-tight text-[#1F1B16]">
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
            <span className="tabular-nums text-[#8A8173]">
              {fmt(data.lifetime)} / {fmt(data.nextCoins)}
            </span>
            <span className="font-bold tabular-nums text-[#C2410C]">
              {t("dash2.lvRemain", { n: fmt(data.remain) })}
            </span>
          </div>
          <div className="mt-3 rounded-2xl bg-[#FBF8F3] px-3.5 py-3 text-xs leading-5 text-[#6B6358]">
            <p className="font-bold text-[#1F1B16]">
              {t("dash2.lvNext", { label: data.next.label })}
            </p>
            <p>{t("dash2.lvNextBonus", { pct: data.next.task_bonus })}</p>
          </div>
        </>
      ) : (
        <p className="mt-3 rounded-2xl bg-[#FFF1EA] px-3.5 py-3 text-xs font-bold text-[#C2410C]">
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
    <Card title={t("dash2.refTitle")} tone="sage">
      <p className="text-xs leading-5 text-[#6B6358]">{t("dash2.refSub")}</p>

      {code ? (
        <>
          <div className="mt-3 flex items-stretch gap-2">
            <div className="min-w-0 flex-1 rounded-2xl bg-white px-3.5 py-2.5">
              <p className="text-[11px] text-[#8A8173]">{t("dash2.refCode")}</p>
              <p className="truncate font-mono text-lg font-bold tracking-widest text-[#1F1B16]">
                {code}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="flex w-16 flex-col items-center justify-center gap-1 rounded-2xl bg-white text-[11px] font-semibold text-[#3A342C] transition active:scale-95"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? t("dash2.refCopied") : t("dash2.refCopy")}
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-xs text-[#6B6358]">
              <Users size={14} strokeWidth={1.9} />
              {t("dash2.refCount", { n: profile?.referrals_count || 0 })}
            </span>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#F25533] px-5 text-[13px] font-bold text-white transition active:scale-95"
            >
              <Share2 size={14} /> {t("dash2.refShare")}
            </button>
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm text-[#A39A8A]">{t("dash2.refNoCode")}</p>
      )}
    </Card>
  );
}
