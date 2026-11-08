// src/components/profile/ProfileHeader.jsx — thẻ hồ sơ gọn (kiểu MoMo) + hàng cấp độ mỏng
import React from "react";
import { Camera, ChevronRight } from "lucide-react";

const pct = (a, b) => Math.min(100, Math.round(((a || 0) / (b || 1)) * 100));

function Stat({ value, label }) {
  return (
    <div className="min-w-0 px-1 text-center">
      <p className="truncate text-[17px] font-bold leading-6 text-slate-900 dark:text-white">{value}</p>
      <p className="text-[12px] text-slate-500">{label}</p>
    </div>
  );
}

export default function ProfileHeader({ session, profile, userLevel, onEdit, onAvatarClick, onOpenLevel }) {
  const displayName = profile.username || "Thành viên";
  const initial = displayName.charAt(0).toUpperCase();
  const memberSince = session?.user?.created_at
    ? new Date(session.user.created_at).toLocaleDateString("vi-VN")
    : "—";
  const next = userLevel?.next_level;
  const lvColor = userLevel?.color || "#64748B";

  return (
    <>
      <section className="rounded-2xl bg-white p-4 dark:bg-slate-900">
        <div className="flex items-center gap-3.5">
          <button onClick={onAvatarClick} aria-label="Đổi ảnh đại diện" className="relative h-16 w-16 shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center rounded-full bg-accent-500 text-2xl font-bold text-white">
                {initial}
              </span>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-slate-600 dark:border-slate-900 dark:bg-slate-800 dark:text-slate-300">
              <Camera size={12} />
            </span>
          </button>

          <button onClick={onEdit} className="flex min-w-0 flex-1 items-center gap-2 text-left">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[19px] font-bold leading-6 text-slate-900 dark:text-white">
                {displayName}
              </span>
              <span className="block text-[12.5px] text-slate-500">Thành viên từ {memberSince}</span>
            </span>
            <ChevronRight size={18} className="shrink-0 text-slate-400" />
          </button>
        </div>

        <div className="mt-3.5 grid grid-cols-4 divide-x divide-slate-100 border-t border-slate-100 pt-3.5 dark:divide-slate-800 dark:border-slate-800">
          <Stat value={`Lv.${profile.level || 1}`} label="Cấp độ" />
          <Stat value={profile.streak_days || 0} label="Chuỗi ngày" />
          <Stat value={`${profile.exp || 0}/${profile.exp_target || 100}`} label="EXP" />
          <Stat value={(profile.coins || 0).toLocaleString("vi-VN")} label="Coin" />
        </div>
      </section>

      {userLevel && (
        <button
          onClick={onOpenLevel}
          className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left transition active:scale-[0.99] dark:bg-slate-900"
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white"
            style={{ backgroundColor: lvColor }}
          >
            {userLevel.level}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-2">
              <span className="truncate text-[15px] font-bold text-slate-900 dark:text-white">{userLevel.label}</span>
              {next && (
                <span className="shrink-0 text-[12px] text-slate-500">
                  {(userLevel.lifetime_coins || 0).toLocaleString("vi-VN")} / {(next.coins_required || 0).toLocaleString("vi-VN")} coin
                </span>
              )}
            </span>
            {next && (
              <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <span
                  className="block h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct(userLevel.lifetime_coins, next.coins_required)}%`, backgroundColor: lvColor }}
                />
              </span>
            )}
          </span>
          <ChevronRight size={18} className="shrink-0 text-slate-400" />
        </button>
      )}
    </>
  );
}


