// src/components/profile/QuickActions.jsx — hàng 4 lối tắt
import React from "react";
import { Bell, Lock, Palette, User } from "lucide-react";

const ITEMS = [
  { key: "profile", icon: User, label: "Hồ sơ" },
  { key: "security", icon: Lock, label: "Bảo mật" },
  { key: "notif", icon: Bell, label: "Thông báo" },
  { key: "theme", icon: Palette, label: "Giao diện" },
];

export default function QuickActions({ onSelect }) {
  return (
    <section className="grid grid-cols-4 gap-1 rounded-2xl bg-white px-2 py-3.5 dark:bg-slate-900">
      {ITEMS.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className="flex flex-col items-center gap-1.5 rounded-xl py-1 transition active:scale-95"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-600">
            <Icon size={23} strokeWidth={1.8} />
          </span>
          <span className="text-[13px] font-medium text-slate-800 dark:text-slate-200">{label}</span>
        </button>
      ))}
    </section>
  );
}

