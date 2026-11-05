// src/components/profile/QuickActions.jsx — hàng 4 lối tắt (giống "Cài đặt tài khoản / Thanh toán..." của MoMo)
import React from "react";
import { Bell, Lock, Palette, User } from "lucide-react";

const ITEMS = [
  { key: "profile", icon: User, label: "Hồ sơ cá nhân" },
  { key: "security", icon: Lock, label: "Bảo mật" },
  { key: "notif", icon: Bell, label: "Thông báo" },
  { key: "theme", icon: Palette, label: "Giao diện" },
];

export default function QuickActions({ onSelect }) {
  return (
    <section className="grid grid-cols-4 gap-1 rounded-2xl bg-white px-2 py-4 dark:bg-slate-900">
      {ITEMS.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className="flex flex-col items-center gap-2 rounded-xl px-1 py-1 transition active:scale-95"
        >
          <Icon size={30} strokeWidth={1.5} className="text-slate-800 dark:text-slate-100" />
          <span className="text-center text-[13px] font-medium leading-4 text-slate-800 dark:text-slate-200">
            {label}
          </span>
        </button>
      ))}
    </section>
  );
}
