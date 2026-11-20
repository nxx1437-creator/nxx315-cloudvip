// src/components/profile/ProfileHeader.jsx — thẻ hồ sơ kiểu GitHub (bìa + avatar + huy hiệu) + hàng cấp độ mỏng
import React from "react";
import { Calendar, ChevronRight } from "lucide-react";
import GhProfile, { GH_BTN, GH_INK, GH_LINE, GH_MUTED } from "./GhProfile.jsx";
import useProfileExtras from "../../hooks/useProfileExtras.js";

const pct = (a, b) => Math.min(100, Math.round(((a || 0) / (b || 1)) * 100));
const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");

export default function ProfileHeader({ session, profile, userLevel, onEdit, onAvatarClick, onOpenLevel }) {
  const x = useProfileExtras(session, profile, userLevel);
  const displayName = profile.username || "Thành viên";
  const memberSince = session?.user?.created_at
    ? new Date(session.user.created_at).toLocaleDateString("vi-VN")
    : "—";
  const next = userLevel?.next_level;
  const lvColor = userLevel?.color || "#64748B";

  return (
    <>
      <section className={`overflow-hidden rounded-lg border bg-white dark:bg-[#0d1117] ${GH_LINE}`}>
        <GhProfile
          cover={x.cover}
          onPickCover={x.pickCover}
          coverBusy={x.coverBusy}
          coverErr={x.coverErr}
          avatarUrl={profile.avatar_url}
          initial={displayName.charAt(0).toUpperCase()}
          onAvatar={onAvatarClick}
          name={displayName}
          verified={profile.is_verified === true}
          stats={[
            { value: `Lv.${profile.level || 1}`, label: "cấp độ" },
            { value: profile.streak_days || 0, label: "chuỗi ngày" },
            { value: `${profile.exp || 0}/${profile.exp_target || 100}`, label: "EXP" },
            { value: fmt(profile.coins), label: "coin" },
          ]}
          meta={[{ Icon: Calendar, text: `Tham gia ${memberSince}` }]}
          badges={x.badges}
          actions={
            <button type="button" onClick={onEdit} className={`${GH_BTN} w-full`}>
              Xem trang cá nhân
            </button>
          }
        />
      </section>

      {userLevel && (
        <button
          onClick={onOpenLevel}
          className={`flex w-full items-center gap-3 rounded-lg border bg-white px-4 py-3 text-left transition active:scale-[0.99] dark:bg-[#0d1117] ${GH_LINE}`}
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white"
            style={{ backgroundColor: lvColor }}
          >
            {userLevel.level}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-2">
              <span className={`truncate text-[15px] font-semibold ${GH_INK}`}>{userLevel.label}</span>
              {next && (
                <span className={`shrink-0 text-[12px] ${GH_MUTED}`}>
                  {fmt(userLevel.lifetime_coins)} / {fmt(next.coins_required)} coin
                </span>
              )}
            </span>
            {next && (
              <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-[#eaeef2] dark:bg-[#21262d]">
                <span
                  className="block h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct(userLevel.lifetime_coins, next.coins_required)}%`, backgroundColor: lvColor }}
                />
              </span>
            )}
          </span>
          <ChevronRight size={18} className={`shrink-0 ${GH_MUTED}`} />
        </button>
      )}
    </>
  );
                    }
