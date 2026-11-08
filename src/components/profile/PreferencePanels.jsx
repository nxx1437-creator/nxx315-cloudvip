// src/components/profile/PreferencePanels.jsx — Thông báo + Giao diện
import React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { NotifToggle } from "./ProfileUI.jsx";

const ACCENT_OPTIONS = [
  { key: "blue", label: "Xanh dương", dot: "bg-sky-500" },
  { key: "purple", label: "Tím", dot: "bg-purple-500" },
  { key: "green", label: "Xanh lá", dot: "bg-emerald-500" },
];

const THEME_OPTIONS = [
  { key: "light", label: "Sáng", icon: Sun },
  { key: "dark", label: "Tối", icon: Moon },
  { key: "system", label: "Thiết bị", icon: Monitor },
];

export function NotifPanel({ profile, updateNotifPref }) {
  return (
        <div className="rounded-2xl bg-white dark:bg-slate-900">
          <div className="border-b border-slate-100 p-4 dark:border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Loại thông báo
            </p>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <NotifToggle
              label="Thông báo đơn hàng"
              sub="Trạng thái đơn nạp game"
              checked={profile.notif_orders}
              onChange={(v) => updateNotifPref("notif_orders", v)}
            />
            <NotifToggle
              label="Thông báo khuyến mãi"
              sub="Ưu đãi, sự kiện mới"
              checked={profile.notif_promo}
              onChange={(v) => updateNotifPref("notif_promo", v)}
            />
            <NotifToggle
              label="Thông báo phần thưởng"
              sub="Khi nhận Coin, quà tặng"
              checked={profile.notif_rewards}
              onChange={(v) => updateNotifPref("notif_rewards", v)}
            />
            <NotifToggle
              label="Thông báo hệ thống"
              sub="Cập nhật, bảo trì"
              checked={profile.notif_system}
              onChange={(v) => updateNotifPref("notif_system", v)}
              last
            />
          </div>
        </div>
  );
}

export function ThemePanel({ themeMode, accentColor, setThemeMode, setAccentColor }) {
  return (
        <div className="rounded-2xl bg-white dark:bg-slate-900">
          <div className="border-b border-slate-100 p-4 dark:border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Chế độ hiển thị
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 p-4">
            {THEME_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.key}
                  onClick={() => setThemeMode(opt.key)}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-xs font-semibold transition ${
                    themeMode === opt.key
                      ? "border-accent-500 bg-accent-500/5 text-accent-600 dark:bg-accent-500/10"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <Icon size={18} />
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="border-b border-t border-slate-100 p-4 dark:border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Màu giao diện
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 p-4">
            {ACCENT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setAccentColor(opt.key)}
                className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-xs font-semibold transition ${
                  accentColor === opt.key
                    ? "border-accent-500 bg-accent-500/5 text-accent-600 dark:bg-accent-500/10"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50"
                }`}
              >
                <span className={`h-4 w-4 rounded-full ${opt.dot}`} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>
  );
}
