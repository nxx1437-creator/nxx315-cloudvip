// src/components/profile/ProfileDetailScreen.jsx — "Trang cá nhân" kiểu GitHub
import React from "react";
import { ArrowLeft, Calendar, Lock, Settings, Star } from "lucide-react";
import GhProfile, { GH_BTN, GH_INK, GH_LINE } from "./GhProfile.jsx";
import useProfileExtras from "../../hooks/useProfileExtras.js";

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");

export default function ProfileDetailScreen({
  onClose, session, profile, userLevel, onAvatarClick, onEdit, onOpenSettings, onPrivacy, onOpenLevel,
}) {
  const x = useProfileExtras(session, profile, userLevel);
  const displayName = profile.username || "Thành viên";
  const email = session?.user?.email || "";
  const memberSince = session?.user?.created_at
    ? new Date(session.user.created_at).toLocaleDateString("vi-VN")
    : "—";

  const meta = [{ Icon: Calendar, text: `Tham gia ${memberSince}` }];
  if (userLevel) {
    meta.push({ Icon: Star, text: `Cấp ${userLevel.level} · ${userLevel.label}`, onClick: onOpenLevel });
  }

  return (
    <div className="min-h-screen bg-white pb-10 font-[Be_Vietnam_Pro] dark:bg-[#0d1117]">
      <header className={`sticky top-0 z-20 flex items-center gap-1 border-b bg-white/95 px-2 py-2 backdrop-blur dark:bg-[#0d1117]/95 ${GH_LINE}`}>
        <button
          onClick={onClose}
          aria-label="Quay lại"
          className={`flex h-10 w-10 items-center justify-center rounded-full ${GH_INK}`}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className={`text-[16px] font-semibold ${GH_INK}`}>Trang cá nhân</h1>
      </header>

      <main className="mx-auto max-w-md md:max-w-3xl">
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
          sub={email}
          stats={[
            { value: `Lv.${profile.level || 1}`, label: "cấp độ" },
            { value: profile.streak_days || 0, label: "chuỗi ngày" },
            { value: `${profile.exp || 0}/${profile.exp_target || 100}`, label: "EXP" },
            { value: fmt(profile.coins), label: "coin" },
          ]}
          meta={meta}
          badges={x.badges}
          actions={
            <div className="flex gap-2">
              <button type="button" onClick={onEdit} className={`${GH_BTN} flex-1`}>
                Sửa thông tin
              </button>
              <button type="button" onClick={onPrivacy} aria-label="Quyền riêng tư" className={`${GH_BTN} w-9 !px-0`}>
                <Lock size={16} />
              </button>
              <button type="button" onClick={onOpenSettings} aria-label="Cài đặt tài khoản" className={`${GH_BTN} w-9 !px-0`}>
                <Settings size={16} />
              </button>
            </div>
          }
        />
      </main>
    </div>
  );
}
