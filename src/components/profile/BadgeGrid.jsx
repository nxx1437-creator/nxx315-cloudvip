// src/components/profile/BadgeGrid.jsx — lưới "Huy hiệu" kiểu GitHub Achievements: chưa đạt thì mờ + khóa, bấm để xem chi tiết
import React, { useState } from "react";
import { Lock } from "lucide-react";

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");

export default function BadgeGrid({ badges = [], title = "Huy hiệu" }) {
  const [pick, setPick] = useState(null);
  const list = [...badges].sort((a, b) => Number(b.earned) - Number(a.earned)); // đã đạt lên trước
  const got = badges.filter((b) => b.earned).length;
  const sel = badges.find((b) => b.id === pick);

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[16px] font-bold text-slate-900 dark:text-white">{title}</h2>
        <span className="text-[12.5px] text-slate-500">{got}/{badges.length} đã đạt</span>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-x-2 gap-y-4 md:grid-cols-6">
        {list.map(({ id, name, Icon, grad, earned }) => (
          <button
            key={id}
            type="button"
            onClick={() => setPick(pick === id ? null : id)}
            className="flex flex-col items-center gap-1.5 active:scale-95"
          >
            <span
              className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${grad} text-white shadow-md ring-2 transition ${
                pick === id ? "ring-accent-500" : "ring-transparent"
              } ${earned ? "" : "opacity-35 grayscale"}`}
            >
              <Icon size={26} strokeWidth={2.2} />
              {!earned && (
                <Lock size={12} className="absolute -bottom-0.5 -right-0.5 rounded-full bg-slate-700 p-0.5 text-white" />
              )}
            </span>
            <span className="line-clamp-2 text-center text-[11px] leading-tight text-slate-600 dark:text-slate-400">{name}</span>
          </button>
        ))}
      </div>

      {sel && (
        <div className="mt-4 rounded-xl bg-slate-100 px-3.5 py-3 dark:bg-slate-800">
          <p className="flex items-center gap-2 text-[14px] font-bold text-slate-900 dark:text-white">
            {sel.name}
            <span className={`text-[11.5px] font-semibold ${sel.earned ? "text-emerald-600" : "text-slate-500"}`}>
              {sel.earned ? "Đã đạt" : "Chưa đạt"}
            </span>
          </p>
          <p className="mt-0.5 text-[13px] text-slate-600 dark:text-slate-400">{sel.desc}</p>
          {!sel.earned && sel.goal > 1 && (
            <div className="mt-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-accent-500 transition-all"
                  style={{ width: `${Math.min(100, Math.round((sel.cur / sel.goal) * 100))}%` }}
                />
              </div>
              <p className="mt-1 text-[11.5px] text-slate-500">{fmt(sel.cur)} / {fmt(sel.goal)}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
            }
