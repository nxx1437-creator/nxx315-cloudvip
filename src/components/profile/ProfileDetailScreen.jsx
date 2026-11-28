// src/components/profile/ProfileDetailScreen.jsx — "Trang cá nhân" kiểu GitHub (TopHeader + hàng tab có nút quay lại)
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, ChevronRight, Lock, Settings, Star } from "lucide-react";
import TopHeader from "../TopHeader.jsx";
import GhProfile, { BadgeList, GH_BTN, GH_INK, GH_LINE, GH_MUTED, GhTabs, StatList, statItems } from "./GhProfile.jsx";
import { FollowCounts } from "./FollowList.jsx";
import CosmeticPicker from "./CosmeticPicker.jsx";
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
  const [picker, setPicker] = useState(null); // null | "frame" | "effect"
  const [cos, setCos] = useState({ frame: null, effect: null }); // tên khung / hiệu ứng đang dùng

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

  const loadCos = useCallback(async () => {
    if (!uid) return;
    const { data: eq } = await supabase
      .from("user_cosmetic_equip")
      .select("frame_id,effect_id")
      .eq("user_id", uid)
      .maybeSingle();
    const ids = [eq?.frame_id, eq?.effect_id].filter(Boolean);
    const names = {};
    if (ids.length) {
      const { data } = await supabase.from("cosmetic_items").select("id,name").in("id", ids);
      (data || []).forEach((i) => {
        names[i.id] = i.name;
      });
    }
    setCos({ frame: names[eq?.frame_id] || null, effect: names[eq?.effect_id] || null });
  }, [uid]);

  useEffect(() => {
    loadCos();
  }, [loadCos]);

  // khung/hiệu ứng vừa đổi từ màn "Sửa thông tin"
  useEffect(() => {
    window.addEventListener("profile-cosmetics-changed", loadCos);
    return () => window.removeEventListener("profile-cosmetics-changed", loadCos);
  }, [loadCos]);

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

  const cosRows = [
    { k: "frame", label: "Khung avatar", val: cos.frame },
    { k: "effect", label: "Hiệu ứng hồ sơ", val: cos.effect },
  ];

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

                {/* Trang trí hồ sơ (mua bằng xu) — bấm để mở bảng chọn kiểu Discord */}
                <div className={`overflow-hidden rounded-md border ${GH_LINE}`}>
                  {cosRows.map((r) => (
                    <button
                      key={r.k}
                      type="button"
                      onClick={() => setPicker(r.k)}
                      className={`flex w-full items-center justify-between gap-3 border-b px-3 py-3 text-left last:border-b-0 ${GH_LINE}`}
                    >
                      <span className="min-w-0">
                        <b className={`block text-[14px] font-semibold ${GH_INK}`}>{r.label}</b>
                        <span className={`block truncate text-[13px] ${GH_MUTED}`}>{r.val || "Chưa dùng · Mua bằng xu"}</span>
                      </span>
                      <ChevronRight size={18} className={`shrink-0 ${GH_MUTED}`} />
                    </button>
                  ))}
                </div>
              </div>
            }
          />
        )}
        {tab === "badges" && <BadgeList badges={x.badges} />}
        {tab === "stats" && <StatList items={statItems(statSrc)} />}
      </main>

      {picker && <CosmeticPicker kind={picker} onClose={() => setPicker(null)} onChanged={loadCos} />}
    </div>
  );
}
