import React from "react";
import { useI18n } from "../i18n/index.js";
import {
  IconWarning,
  IconShield,
  IconLock,
  IconWifiOff,
  IconClock,
} from "./AuthIcons.jsx";

const ZALO = "0865245988";
const ZALO_URL = "https://zalo.me/0865245988";

const TONES = {
  teal: "border-teal-200 bg-teal-50 text-teal-800 [--i:theme(colors.teal.100)]",
  amber: "border-amber-200 bg-amber-50 text-amber-800 [--i:theme(colors.amber.100)]",
  rose: "border-rose-200 bg-rose-50 text-rose-800 [--i:theme(colors.rose.100)]",
  red: "border-red-300 bg-red-50 text-red-800 [--i:theme(colors.red.100)]",
  orange: "border-orange-300 bg-orange-50 text-orange-800 [--i:theme(colors.orange.100)]",
};

function Box({ tone, icon, title, children }) {
  return (
    <div className={`mb-4 rounded-2xl border p-3.5 ${TONES[tone]}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/70 shadow-sm">
          {icon}
        </div>
        <div className="flex-1 text-[12px] leading-5">
          <p className="text-[13px] font-bold">{title}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

const ZaloLink = () => (
  <a
    href={ZALO_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="font-bold underline"
  >
    {ZALO}
  </a>
);

export default function LoginAlerts({
  errorType,
  isLocked,
  remainingSec,
  maxAttempts,
  ipInfo,
  formatTime,
}) {
  const { t } = useI18n();

  return (
    <>
      {/* Lưu ý chung */}
      <Box tone="teal" icon={<IconWarning size={18} />} title={t("notice.title")}>
        <p className="mt-1">{t("notice.body")}</p>
      </Box>

      {/* Phiên hết hạn */}
      {errorType === "session_expired" && (
        <Box tone="amber" icon={<IconClock size={20} />} title={t("session.title")}>
          <p className="mt-1">{t("session.body")}</p>
        </Box>
      )}

      {/* IP trùng */}
      {errorType === "ip_duplicate" && (
        <Box tone="rose" icon={<IconShield size={20} />} title={t("dup.title")}>
          <p className="mt-1">
            {t("dup.body")} <ZaloLink /> {t("dup.bodyEnd")}
          </p>
        </Box>
      )}

      {/* Bị khoá */}
      {isLocked && (
        <Box tone="red" icon={<IconLock size={20} />} title={t("lock.title")}>
          <p className="mt-1">{t("lock.body", { max: maxAttempts })}</p>
          <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-white/80 px-3 py-2 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
              {t("lock.unlockIn")}
            </span>
            <span className="text-[16px] font-black tabular-nums tracking-widest text-red-600">
              {formatTime(remainingSec)}
            </span>
          </div>
        </Box>
      )}

      {/* IP không khớp */}
      {errorType === "ip_mismatch" && (
        <Box tone="orange" icon={<IconWifiOff size={20} />} title={t("ip.title")}>
          <p className="mt-1">{t("ip.body")}</p>
          {ipInfo && (
            <div className="mt-2.5 space-y-1 rounded-xl bg-white/70 p-2.5 text-[11px] leading-5">
              <p>
                📍 {t("ip.registered")}: <b>{ipInfo.registeredIp}</b>
              </p>
              <p>
                🌐 {t("ip.current")}: <b>{ipInfo.currentIp}</b>
              </p>
              <p>⏳ {t("ip.trust", { days: ipInfo.trustDays })}</p>
            </div>
          )}
          <p className="mt-2 text-[11px]">
            {t("ip.support")} <ZaloLink />
          </p>
        </Box>
      )}
    </>
  );
  }
