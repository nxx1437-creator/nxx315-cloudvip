import React, { useState } from "react";
import { Crown, Copy, Check, Share2, Users } from "lucide-react";
import useLevelProgress from "../../hooks/useLevelProgress.js";
import { Panel, Tag, ProgressBar } from "./HomeUI.jsx";
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
      <Panel title={t("dash2.lvTitle")} lift={false}>
        <div className="skeleton-shimmer h-16 rounded-md" />
      </Panel>
    );
  }
  if (!data) return null;

  return (
    <Panel
      title={t("dash2.lvTitle")}
      right={<Tag tone="green">{t("dash2.lvBonus", { pct: data.bonus })}</Tag>}
    >
      <div className="flex items-center gap-2">
        <Crown size={16} strokeWidth={1.75} className="text-amber-500" />
        <p className="truncate text-sm font-medium text-[#171717]">
          {data.label}
        </p>
        <span className="text-xs text-[#9A9A9A]">
          {t("dash2.lvNow", { level: data.level })}
        </span>
      </div>

      {data.next ? (
        <>
          <div className="mt-3">
            <ProgressBar pct={data.pct} />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="tabular-nums text-[#6F6F6F]">
              {fmt(data.lifetime)} / {fmt(data.nextCoins)}
            </span>
            <span className="font-medium tabular-nums text-[#0F7A4D]">
              {t("dash2.lvRemain", { n: fmt(data.remain) })}
            </span>
          </div>
          <p className="mt-3 text-xs leading-5 text-[#6F6F6F]">
            <span className="font-medium text-[#171717]">
              {t("dash2.lvNext", { label: data.next.label })}
            </span>
            {" · "}
            {t("dash2.lvNextBonus", { pct: data.next.task_bonus })}
          </p>
        </>
      ) : (
        <p className="mt-3 text-xs font-medium text-[#0F7A4D]">
          {t("dash2.lvMax")}
        </p>
      )}
    </Panel>
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
    <Panel title={t("dash2.refTitle")}>
      <p className="text-xs leading-5 text-[#6F6F6F]">{t("dash2.refSub")}</p>

      {code ? (
        <>
          <button
            type="button"
            onClick={handleCopy}
            className="hv-btn hv-btn-ghost mt-3 flex w-full items-center justify-between rounded-md border border-[#E6E6E6] bg-[#FAFAFA] px-3 py-2.5 text-left active:bg-[#F4F4F4]"
          >
            <span className="min-w-0">
              <span className="block text-[11px] text-[#9A9A9A]">
                {t("dash2.refCode")}
              </span>
              <span className="block truncate font-mono text-[15px] font-medium tracking-wider text-[#171717]">
                {code}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-[#6F6F6F]">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? t("dash2.refCopied") : t("dash2.refCopy")}
            </span>
          </button>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-xs text-[#6F6F6F]">
              <Users size={14} strokeWidth={1.75} />
              {t("dash2.refCount", { n: profile?.referrals_count || 0 })}
            </span>
            <button
              type="button"
              onClick={handleShare}
              className="hv-btn hv-btn-brand inline-flex h-8 items-center gap-2 rounded-md border border-[#24B47E] bg-[#3ECF8E] px-3.5 text-xs font-medium text-[#0B1F17] active:scale-95"
            >
              <Share2 size={13} /> {t("dash2.refShare")}
            </button>
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm text-[#9A9A9A]">{t("dash2.refNoCode")}</p>
      )}
    </Panel>
  );
          }
