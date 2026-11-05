// src/components/profile/ProfileHeader.jsx — thẻ hồ sơ: avatar, tên, cấp độ, EXP
import React from "react";
import { ChevronRight, Flame, Pencil, Star } from "lucide-react";
import AvatarUploader from "../AvatarUploader.jsx";

const pct = (a, b) => Math.min(100, Math.round(((a || 0) / (b || 1)) * 100));

export default function ProfileHeader({
  userId,
  session,
  profile,
  userLevel,
  onEdit,
  onAvatar,
  onOpenLevel,
}) {
  const displayName = profile.username || "Thành viên";
  const initial = displayName.charAt(0).toUpperCase();
  const memberSince = session?.user?.created_at
    ? new Date(session.user.created_at).toLocaleDateString("vi-VN")
    : "—";
  const expPct = pct(profile.exp, profile.exp_target || 100);
  const next = userLevel?.next_level;
  const lvPct = next ? pct(userLevel.lifetime_coins, next.coins_required) : 100;
  const lvColor = userLevel?.color || "#64748B";

  return (
    <section className="rounded-2xl bg-white p-5 dark:bg-slate-900">
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          <AvatarUploader
            userId={userId}
            currentUrl={profile?.avatar_url}
            initial={initial}
            onUploaded={onAvatar}
          />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-[24px] font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
            {displayName}
          </h1>
          <p className="mt-0.5 text-[13px] text-slate-500">
            Thành viên từ {memberSince}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Star size={11} className="text-amber-500" />
              Lv.{profile.level || 1}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-500/10">
              <Flame size={11} />
              {profile.streak_days || 0} ngày
            </span>
          </div>
        </div>

        <button
          onClick={onEdit}
          aria-label="Chỉnh sửa hồ sơ"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition active:scale-95 dark:border-slate-700 dark:text-slate-200"
        >
          <Pencil size={17} />
        </button>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-[12px] font-medium text-slate-500">
          <span>{profile.exp || 0} EXP</span>
          <span>{profile.exp_target || 100} EXP</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-accent-500 transition-all duration-500"
            style={{ width: `${expPct}%` }}
          />
        </div>
      </div>

      {userLevel && (
        <button
          onClick={onOpenLevel}
          className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-3.5 text-left transition active:scale-[0.99] dark:bg-slate-800/60"
        >
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ backgroundColor: lvColor }}
          >
            {userLevel.level}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-bold text-slate-900 dark:text-white">
              {userLevel.label}
            </span>
            {next && (
              <>
                <span className="mt-0.5 block text-[12px] text-slate-500">
                  {(userLevel.lifetime_coins || 0).toLocaleString("vi-VN")} /{" "}
                  {(next.coins_required || 0).toLocaleString("vi-VN")} coin
                </span>
                <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <span
                    className="block h-full rounded-full transition-all duration-500"
                    style={{ width: `${lvPct}%`, backgroundColor: lvColor }}
                  />
                </span>
              </>
            )}
          </span>
          <ChevronRight size={18} className="shrink-0 text-slate-400" />
        </button>
      )}
    </section>
  );
}
