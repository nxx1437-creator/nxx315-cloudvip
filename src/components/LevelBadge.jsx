import React from "react";
import { Crown, Star, Sparkles } from "lucide-react";

/**
 * Badge level — hiển thị cạnh tên user
 */
export function LevelBadge({ level, label, color, size = "md" }) {
  const sizeClass = {
    sm: "h-5 px-2 text-[9px]",
    md: "h-6 px-2.5 text-[10px]",
    lg: "h-7 px-3 text-[11px]",
  }[size];

  const iconSize = { sm: 9, md: 11, lg: 12 }[size];

  let Icon = Sparkles;
  if (level >= 10) Icon = Crown;
  else if (level >= 5) Icon = Star;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-bold text-white ${sizeClass}`}
      style={{ backgroundColor: color || "#64748B" }}
    >
      <Icon size={iconSize} strokeWidth={2.6} />
      <span>Lv.{level}</span>
    </span>
  );
}

/**
 * Card Cấp độ — hiển thị ở trang Profile
 * Style: MoMo — nền trắng, vuông vức, đường phân cách rõ
 */
export function LevelCard({ userLevel, onClick }) {
  if (!userLevel) return null;

  const {
    level,
    label,
    color,
    shop_discount,
    task_bonus,
    lifetime_coins,
    next_level,
  } = userLevel;

  const current = Number(lifetime_coins || 0);
  const target = Number(next_level?.coins_required || 0);
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 100;
  const remaining = Math.max(0, target - current);

  return (
    <div
      onClick={onClick}
      className="cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm active:scale-[0.99]"
    >
      {/* HEADER ROW */}
      <div className="flex items-start gap-4 border-b border-slate-100 p-4">
        {/* Level Circle */}
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: color }}
        >
          <span className="text-[20px] font-bold leading-none">{level}</span>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-bold leading-tight text-slate-900">
              {label}
            </h3>
          </div>
          <p className="mt-0.5 text-[12px] font-medium text-slate-500">
            Cấp {level} / 10
          </p>
          <p className="mt-1.5 text-[12px] text-slate-400">
            {current.toLocaleString("vi-VN")} coin đã kiếm
          </p>
        </div>
      </div>

      {/* ƯU ĐÃI ROW — 2 CỘT */}
      <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
        <div className="p-3.5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Giảm giá Shop
          </p>
          <p className="mt-1 text-[18px] font-bold text-slate-900">
            -{shop_discount}%
          </p>
        </div>
        <div className="p-3.5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Thưởng Task
          </p>
          <p className="mt-1 text-[18px] font-bold text-slate-900">
            +{task_bonus}%
          </p>
        </div>
      </div>

      {/* PROGRESS ROW */}
      {next_level ? (
        <div className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-slate-600">
              Tiến độ lên cấp {next_level.level}
            </span>
            <span className="text-[12px] font-bold text-slate-900">
              {pct}%
            </span>
          </div>

          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                backgroundColor: color,
              }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Đã kiếm: {current.toLocaleString("vi-VN")}</span>
            <span>
              Còn {remaining.toLocaleString("vi-VN")} → Lv.{next_level.level}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center">
          <p className="text-[13px] font-bold text-amber-600">
             Bạn đã đạt cấp tối đa!
          </p>
        </div>
      )}
    </div>
  );
}
