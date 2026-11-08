// src/components/profile/ProfileIcons.jsx — icon SVG dùng riêng cho trang hồ sơ
import React from "react";

export const IconCheck = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="profCheckGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="9" stroke="url(#profCheckGrad)" strokeWidth="1.8" fill="none" />
    <path d="M8 12.5l2.5 2.5L16 9.5" stroke="url(#profCheckGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconBulb = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="bulbGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#eab308" />
      </linearGradient>
    </defs>
    <path d="M9 18h6v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z" stroke="url(#bulbGrad)" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
    <path d="M9 18c-1.5-1.5-3-3.5-3-6a6 6 0 1112 0c0 2.5-1.5 4.5-3 6" stroke="url(#bulbGrad)" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
    <path d="M9.5 14h5" stroke="url(#bulbGrad)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconWarning2 = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="warn2Grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
    <path d="M12 3.5L2.5 20.5h19L12 3.5z" stroke="url(#warn2Grad)" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
    <path d="M12 9.5v4" stroke="url(#warn2Grad)" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="17" r="1.2" fill="url(#warn2Grad)" />
  </svg>
);

export const IconSpinner2 = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ animation: "profSpin 0.8s linear infinite" }}
  >
    <defs>
      <linearGradient id="profSpinGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.15" />
      </linearGradient>
    </defs>
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="url(#profSpinGrad)"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
      strokeDasharray="56.55"
      strokeDashoffset="14"
    />
    <style>{`@keyframes profSpin { to { transform: rotate(360deg); } }`}</style>
  </svg>
);

export const IconLogoutAll = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="logoutAllGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f43f5e" />
        <stop offset="100%" stopColor="#be123c" />
      </linearGradient>
    </defs>
    <rect x="3" y="5" width="12" height="14" rx="2" stroke="url(#logoutAllGrad)" strokeWidth="1.8" fill="none" />
    <path d="M8 9h4M8 12h3M8 15h2" stroke="url(#logoutAllGrad)" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 12h5M19 9l3 3-3 3" stroke="url(#logoutAllGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
    
