// src/components/profile/ProfileDetailScreen.jsx — "Trang cá nhân" (kiểu GitHub/MoMo): ảnh bìa, avatar, số liệu, huy hiệu, nút nhanh
import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Calendar, Camera, Loader2, Lock, Mail, Pencil, Settings, Star, User } from "lucide-react";
import { Group, Row } from "./SettingsParts.jsx";
import VerifiedBadge from "../VerifiedBadge.jsx";
import BadgeGrid from "./BadgeGrid.jsx";
import { supabase } from "../../lib/supabaseClient.js";
import { uploadCover } from "../../lib/coverUpload.js";
import { getBadges } from "../../lib/profileBadges.js";

const COVER =
  "bg-[linear-gradient(135deg,#dbeafe_0%,#e0f2fe_45%,#ccfbf1_100%)] dark:bg-[linear-gradient(135deg,#0f2a44_0%,#0b3a4a_100%)]";

const Sparkle = ({ className = "", size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 1c.6 5.4 3.6 9.4 11 11-7.4 1.6-10.4 5.6-11 11-.6-5.4-3.6-9.4-11-11 7.4-1.6 10.4-5.6 11-11z" />
  </svg>
);

function Stat({ value, label }) {
  return (
    <div className="min-w-0 px-1 text-center">
      <p className="truncate text-[20px] font-bold leading-7 text-slate-900 dark:text-white">{value}</p>
      <p className="text-[12.5px] text-slate-500">{label}</p>
    </div>
  );
}

const pill =
  "flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-[15px] font-semibold text-slate-800 transition active:scale-[0.98] dark:border-slate-700 dark:text-slate-100";

export default function ProfileDetailScreen({
  onClose, session, profile, userLevel, onAvatarClick, onEdit, onOpenSettings, onPrivacy, onOpenLevel,
}) {
  const uid = session?.user?.id;
  const displayName = profile.username || "Thành viên";
  const initial = displayName.charAt(0).toUpperCase();
  const email = session?.user?.email || "";
  const memberSince = session?.user?.created_at
    ? new Date(session.user.created_at).toLocaleDateString("vi-VN")
    : "—";
  const next = userLevel?.next_level;

  const coverRef = useRef(null);
  const [stats, setStats] = useState(undefined); // undefined = đang tải, null = lỗi
  const [coverUrl, setCoverUrl] = useState(null); // ảnh bìa vừa đổi (ghi đè bản đã tải)
  const [coverBusy, setCoverBusy] = useState(false);
  const [coverErr, setCoverErr] = useState("");

  // số liệu cho huy hiệu + ảnh bìa mới nhất (dùng lại RPC hồ sơ công khai với id của chính mình)
  useEffect(() => {
    if (!uid) return;
    let alive = true;
    (async () => {
      const { data, error } = await supabase.rpc("get_public_profile", { p_user_id: uid });
      if (alive) setStats(error ? null : data);
    })();
    return () => {
      alive = false;
    };
  }, [uid]);

  const cover = coverUrl || stats?.cover_url || profile.cover_url || null;

  const onPickCover = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !uid) return;
    setCoverErr("");
    setCoverBusy(true);
    try {
      setCoverUrl(await uploadCover(uid, file));
    } catch (err) {
      setCoverErr(err.message || "Không đổi được ảnh bìa.");
    } finally {
      setCoverBusy(false);
    }
  };

  const badges = getBadges({
    ...(stats || {}),
    is_verified: profile.is_verified ?? stats?.is_verified,
    level: profile.level ?? stats?.level,
    streak_days: profile.streak_days ?? stats?.streak_days,
    streak_record: profile.streak_record ?? stats?.streak_record,
    referrals_count: profile.referrals_count ?? stats?.referrals_count,
    joined_at: profile.created_at || session?.user?.created_at,
    lifetime_coins: userLevel?.lifetime_coins ?? stats?.lifetime_coins,
  });

  return (
    <div className="min-h-screen bg-[#eef2f9] pb-10 font-[Be_Vietnam_Pro] dark:bg-slate-950">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-[#eef2f9]/95 px-4 pb-3 pt-4 backdrop-blur dark:bg-slate-950/95">
        <button
          onClick={onClose}
          aria-label="Quay lại"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[19px] font-bold text-slate-900 dark:text-white">Trang cá nhân</h1>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 md:max-w-3xl">
        <section className="rounded-2xl bg-white p-3 shadow-sm dark:bg-slate-900">
          {/* ẢNH BÌA */}
          <div className={`relative h-36 overflow-hidden rounded-xl ${cover ? "bg-slate-200 dark:bg-slate-800" : COVER}`}>
            {cover ? (
              <img src={cover} alt="" className="h-full w-full object-cover" />
            ) : (
              <>
                <Sparkle className="absolute left-5 top-4 text-white/80" size={26} />
                <Sparkle className="absolute right-6 top-8 text-white/70" size={38} />
                <Sparkle className="absolute bottom-3 right-24 text-white/60" size={18} />
              </>
            )}
            <button
              type="button"
              onClick={() => coverRef.current?.click()}
              disabled={coverBusy}
              className="absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded-lg bg-black/45 px-3 py-1.5 text-[12.5px] font-semibold text-white backdrop-blur transition active:scale-95 disabled:opacity-60"
            >
              {coverBusy ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              {coverBusy ? "Đang tải..." : "Đổi ảnh bìa"}
            </button>
            <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onPickCover} className="hidden" />
            {coverErr && (
              <p className="absolute inset-x-2 bottom-2 rounded-lg bg-rose-500/90 px-3 py-1.5 text-[12px] font-medium text-white">
                {coverErr}
              </p>
            )}
          </div>

          <div className="px-2">
            <button
              onClick={onAvatarClick}
              aria-label="Đổi ảnh đại diện"
              className="relative -mt-12 block h-[96px] w-[96px] rounded-full ring-4 ring-white dark:ring-slate-900"
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center rounded-full bg-accent-500 text-4xl font-bold text-white">
                  {initial}
                </span>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-slate-600 dark:border-slate-900 dark:bg-slate-800 dark:text-slate-300">
                <Camera size={15} />
              </span>
            </button>

            <h2 className="mt-3 flex min-w-0 items-center gap-2 text-[22px] font-bold text-slate-900 dark:text-white">
              <span className="truncate">{displayName}</span>
              {profile.is_verified === true && <VerifiedBadge size={22} />}
            </h2>
            <p className="mt-0.5 truncate text-[14px] text-slate-500">{email}</p>

            <div className="mt-4 grid grid-cols-4 divide-x divide-slate-100 dark:divide-slate-800">
              <Stat value={`Lv.${profile.level || 1}`} label="Cấp độ" />
              <Stat value={profile.streak_days || 0} label="Chuỗi ngày" />
              <Stat value={`${profile.exp || 0}/${profile.exp_target || 100}`} label="EXP" />
              <Stat value={(profile.coins || 0).toLocaleString("vi-VN")} label="Coin" />
            </div>

            <div className="mt-4 flex gap-2.5 pb-1">
              <button onClick={onEdit} className={pill}>
                <Pencil size={17} /> Sửa thông tin
              </button>
              <button onClick={onPrivacy} className={pill}>
                <Lock size={17} /> Quyền riêng tư
              </button>
              <button
                onClick={onOpenSettings}
                aria-label="Cài đặt tài khoản"
                className="flex w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-800 transition active:scale-95 dark:border-slate-700 dark:text-slate-100"
              >
                <Settings size={19} />
              </button>
            </div>
          </div>
        </section>

        {/* HUY HIỆU */}
        {stats === undefined ? (
          <div className="h-44 animate-pulse rounded-2xl bg-white dark:bg-slate-900" />
        ) : (
          <BadgeGrid badges={badges} />
        )}

        <div className="-mt-2">
          <Group title="Thông tin cá nhân">
            <Row icon={User} title="Tên hiển thị" sub={profile.username || "Chưa đặt"} onClick={onEdit} />
            <Row icon={Mail} title="Email" sub={email || "—"} />
            <Row icon={Calendar} title="Thành viên từ" sub={memberSince} />
          </Group>

          {userLevel && (
            <Group title="Cấp độ">
              <Row
                icon={Star}
                title={`Cấp ${userLevel.level} · ${userLevel.label}`}
                sub={
                  next
                    ? `${(userLevel.lifetime_coins || 0).toLocaleString("vi-VN")} / ${(next.coins_required || 0).toLocaleString("vi-VN")} coin để lên cấp`
                    : "Bạn đã đạt cấp cao nhất"
                }
                onClick={onOpenLevel}
              />
            </Group>
          )}
        </div>
      </main>
    </div>
  );
  }
