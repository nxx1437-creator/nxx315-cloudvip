// src/components/profile/ProfileDetailScreen.jsx — "Trang cá nhân" kiểu GitHub (TopHeader + hàng tab có nút quay lại)
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Lock, Settings, Star } from "lucide-react";
import TopHeader from "../TopHeader.jsx";
import GhProfile, { BadgeList, GH_BTN, GH_INK, GhTabs, StatList, statItems } from "./GhProfile.jsx";
import { FollowCounts } from "./FollowList.jsx";
import useProfileExtras from "../../hooks/useProfileExtras.js";
import { supabase } from "../../lib/supabaseClient.js";

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");

export default function ProfileDetailScreen({
  onClose, session, profile, userLevel, onAvatarClick, onEdit, onOpenSettings, onOpenLevel,
}) {
  const x = useProfileExtras(session, profile, userLevel);
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const uid = session?.user?.id;
  const [fc, setFc] = useState(null); // số người theo dõi / đang theo dõi của chính mình

  useEffect(() => {
    if (!uid) return undefined;
    let alive = true;
    supabase.rpc("get_follow_info", { p_user_id: uid }).then(({ data, error }) => {
      if (alive && !error && data) setFc(data);
    });
    return () => {
      alive = false;
    };
  }, [uid]);

  const displayName = profile.username || "Thành viên";
  const email = session?.user?.email || "";
  const memberSince = session?.user?.created_at
    ? new Date(session.user.created_at).toLocaleDateString("vi-VN")
    : "—";

  const meta = [{ Icon: Calendar, text: `Tham gia ${memberSince}` }];
  if (userLevel) {
    meta.push({ Icon: Star, text: `Cấp ${userLevel.level} · ${userLevel.label}`, onClick: onOpenLevel });
  }

  const tabs = [
    { id: "overview", label: "Tổng quan" },
    { id: "badges", label: "Huy hiệu", count: x.badges.length },
    { id: "stats", label: "Thống kê" },
  ];

  const statSrc = {
    ...(x.stats || {}),
    level: profile.level ?? x.stats?.level,
    streak_days: profile.streak_days ?? x.stats?.streak_days,
    streak_record: profile.streak_record ?? x.stats?.streak_record,
    lifetime_coins: userLevel?.lifetime_coins ?? x.stats?.lifetime_coins,
  };

  return (
    <div className="min-h-screen bg-white pb-10 font-[Be_Vietnam_Pro] dark:bg-[#0d1117]">
      <TopHeader variant="gh" />

      {/* hàng tab dính ngay dưới TopHeader (cao 64px), nút quay lại nằm đầu hàng */}
      <div className="sticky top-[64px] z-20 bg-white/95 backdrop-blur dark:bg-[#0d1117]/95">
        <GhTabs
          tabs={tabs}
          value={tab}
          onChange={setTab}
          leading={
            <button
              onClick={onClose}
              aria-label="Quay lại"
              className={`flex w-12 shrink-0 items-center justify-center ${GH_INK}`}
            >
              <ArrowLeft size={20} />
            </button>
          }
        />
      </div>

      <main className="mx-auto max-w-md md:max-w-3xl">
        {tab === "overview" && (
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
              { value: fmt(profile.coins), label: "coin" },
            ]}
            meta={meta}
            badges={x.badges}
            actions={
              <div className="space-y-3">
                {fc && (
                  <FollowCounts
                    followers={fc.followers}
                    following={fc.following}
                    onOpen={(kind) => navigate(`/u/${uid}?list=${kind}`)}
                  />
                )}
                <div className="flex gap-2">
                  <button type="button" onClick={onEdit} className={`${GH_BTN} flex-1`}>
                    Sửa thông tin
                  </button>
                  {/* ổ khóa: mở thẳng cài đặt "Quyền riêng tư" (ẩn danh sách đang theo dõi) */}
                  <button
                    type="button"
                    onClick={() => navigate("/profile", { state: { screen: "privacy" } })}
                    aria-label="Quyền riêng tư"
                    className={`${GH_BTN} w-9 !px-0`}
                  >
                    <Lock size={16} />
                  </button>
                  <button type="button" onClick={onOpenSettings} aria-label="Cài đặt tài khoản" className={`${GH_BTN} w-9 !px-0`}>
                    <Settings size={16} />
                  </button>
                </div>
              </div>
            }
          />
        )}
        {tab === "badges" && <BadgeList badges={x.badges} />}
        {tab === "stats" && <StatList items={statItems(statSrc)} />}
      </main>
    </div>
  );
}
