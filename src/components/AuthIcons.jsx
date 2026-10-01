import React from "react";

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const IconMail = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="M3.5 7l7.4 5.2c.6.4 1.4.4 2 0L20.5 7" />
  </svg>
);

export const IconLock = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="3" />
    <path d="M8 10.5V7.5a4 4 0 018 0v3" />
    <circle cx="12" cy="15.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const IconEye = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconEyeOff = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M3 3l18 18" />
    <path d="M10.6 6.2A9.9 9.9 0 0112 6c6 0 9.5 6 9.5 6a16.8 16.8 0 01-3.5 4.2M6.6 8.2A17 17 0 002.5 12s3.5 6 9.5 6c1.5 0 2.8-.3 4-.9" />
    <path d="M9.9 9.9a3 3 0 104.2 4.2" />
  </svg>
);

export const IconArrow = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={2.2}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconSpinner = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className="animate-spin"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="2.5"
      opacity="0.25"
    />
    <path
      d="M21 12a9 9 0 00-9-9"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

export const IconWarning = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M12 3.5L2.5 20.5h19L12 3.5z" />
    <path d="M12 9.5v4" strokeWidth="2" />
    <circle cx="12" cy="17" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconShield = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M12 2.5l8 3v6.5c0 5-3.4 8.5-8 9.5-4.6-1-8-4.5-8-9.5V5.5l8-3z" />
    <path d="M12 8v5" strokeWidth="2" />
    <circle cx="12" cy="16.5" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconWifiOff = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M2.5 8.5C5.5 5.8 8.6 4.5 12 4.5c3.4 0 6.5 1.3 9.5 4" />
    <path d="M6 12c1.7-1.5 3.7-2.3 6-2.3 2.3 0 4.3.8 6 2.3" />
    <path d="M9.5 15.5c.7-.6 1.5-.9 2.5-.9 1 0 1.8.3 2.5.9" />
    <circle cx="12" cy="18.5" r="1.2" fill="currentColor" stroke="none" />
    <path d="M3 3l18 18" strokeWidth="2" />
  </svg>
);

export const IconClock = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" strokeWidth="2" />
  </svg>
);

export const IconGoogle = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path
      fill="#EA4335"
      d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"
    />
    <path
      fill="#FBBC05"
      d="M10.5 28.7A14.5 14.5 0 019.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 000 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
    />
  </svg>
);
export const IconUser = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6" />
  </svg>
);

export const IconGift = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <rect x="3.5" y="8.5" width="17" height="4" rx="1" />
    <path d="M5 12.5V20h14v-7.5M12 8.5V20" />
    <path d="M12 8.5C10 8.5 8 7.5 8 5.8 8 4.5 9 4 10 4c1.6 0 2 2.4 2 4.5zM12 8.5c2 0 4-1 4-2.7 0-1.3-1-1.8-2-1.8-1.6 0-2 2.4-2 4.5z" />
  </svg>
);
