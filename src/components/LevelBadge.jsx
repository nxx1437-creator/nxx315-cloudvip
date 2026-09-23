import React from "react";
import { Crown, Star, Sparkles } from "lucide-react";

/**
 * Badge level — hiển thị cạnh avatar
 * @param {number} level
 * @param {string} label
 * @param {string} color
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
export function LevelBadge({ level, label, color, size = "md" }) {
  const sizeClass = {
    sm: "h-5 px-1.5 text-[9px]",
    md: "h-6 px-2 text-[10px]",
    lg: "h-7 px-2.5 text-[11px]",
  }[size];

  const iconSize = { sm: 9, md: 11, lg: 12 }[size];

  // Level 10+ → Crown, level 5-9 → Star, còn lại → Sparkles
  let Icon = Sparkles;
  if (level >= 10) Icon = Crown;
  else if (level >= 5) Icon = Star;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-black text-white shadow-sm ${sizeClass}`}
      style={{ backgroundColor: color || "#9CA3AF" }}
    >
      <Icon size={iconSize} strokeWidth={2.6} />
      <span>Lv.{level}</span>
      {label && size !== "sm" && (
        <span className="ml-0.5 opacity-90">{label}</span>
      )}
    </span>
  );
}

/**
 * Progress bar đến level tiếp theo
 */
export function LevelProgress({
  level,
  lifetimeCoins,
  nextLevel,
  color = "#3B82F6",
}) {
  if (!nextLevel) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 p-3 text-center text-white">
        <Crown size={20} className="mx-auto mb-1" />
        <p className="text-[13px] font-black">
          🏆 Bạn đã đạt Level tối đa!
        </p>
      </div>
    );
  }

  const current = Number(lifetimeCoins || 0);
  const target = Number(nextLevel.coins_required || 0);
  const previousLevelCoins = 0; // giả định từ 0
  const range = target - previousLevelCoins;

  const pct = Math.min(100, Math.round((current / target) * 100));
  const remaining = Math.max(0, target - current);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black text-white"
            style={{ backgroundColor: color }}
          >
            {level}
          </span>
          <span className="text-[11px] font-bold text-slate-500">→</span>
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black text-white"
            style={{ backgroundColor: nextLevel.color || "#3B82F6" }}
          >
            {nextLevel.level}
          </span>
          <span className="text-[12px] font-bold text-slate-700">
            {nextLevel.label}
          </span>
        </div>
        <span className="text-[13px] font-black" style={{ color }}>
          {pct}%
        </span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${nextLevel.color || "#3B82F6"})`,
          }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span className="text-slate-500">
          Đã kiếm: <b className="text-slate-700">{current.toLocaleString("vi-VN")}</b>
        </span>
        <span className="text-slate-500">
          Còn: <b className="text-slate-700">{remaining.toLocaleString("vi-VN")}</b> → Lv.{nextLevel.level}
        </span>
      </div>

      {nextLevel.shop_discount > 0 && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-[11px]">
          <span className="font-black text-emerald-700">
            Lên Level {nextLevel.level} sẽ được:
          </span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-700">
            -{nextLevel.shop_discount}% Shop
          </span>
          <span className="rounded-full bg-sky-100 px-2 py-0.5 font-bold text-sky-700">
            +{nextLevel.task_bonus}% Task
          </span>
        </div>
      )}
    </div>
  );
      }
                                                                                    
