import React, { useRef, useState } from "react";
import { BadgeCheck, Camera, Coins, Flame, Lock, Star, Trophy, Zap } from "lucide-react";

const DAY = 86400000;

// Huy hiệu tự tính từ số liệu; muốn thêm huy hiệu mới chỉ cần thêm 1 dòng
export const getBadges = (p = {}, s = {}) => [
  { id: "verified", name: "Đã xác minh", desc: "Tài khoản được NXX xác minh.", Icon: BadgeCheck, grad: "from-sky-400 to-blue-600", earned: !!p.verified },
  { id: "top3", name: "Top 3 bảng xếp hạng", desc: "Lọt top 3 trên bảng xếp hạng.", Icon: Trophy, grad: "from-amber-300 to-orange-500", earned: !!s.rank && s.rank <= 3 },
  { id: "coin1k", name: "1.000 xu", desc: "Kiếm tổng cộng 1.000 xu.", Icon: Coins, grad: "from-yellow-300 to-amber-500", earned: (s.coins || 0) >= 1000 },
  { id: "coin10k", name: "10.000 xu", desc: "Kiếm tổng cộng 10.000 xu.", Icon: Coins, grad: "from-emerald-400 to-green-600", earned: (s.coins || 0) >= 10000 },
  { id: "tasks50", name: "Chăm nhiệm vụ", desc: "Hoàn thành 50 nhiệm vụ.", Icon: Zap, grad: "from-violet-400 to-purple-600", earned: (s.tasks || 0) >= 50 },
  { id: "streak7", name: "7 ngày liền", desc: "Hoạt động liên tục 7 ngày.", Icon: Flame, grad: "from-orange-400 to-red-500", earned: (s.streak || 0) >= 7 },
  { id: "veteran", name: "Thành viên lâu năm", desc: "Đồng hành cùng NXX hơn 90 ngày.", Icon: Star, grad: "from-pink-400 to-rose-500",
    earned: !!p.created_at && Date.now() - new Date(p.created_at).getTime() > 90 * DAY },
];

export default function ProfileHeader({ profile = {}, stats = {}, isOwner = false, onPickCover }) {
  const fileRef = useRef(null);
  const [pick, setPick] = useState(null);
  const badges = getBadges(profile, stats);
  const got = badges.filter((b) => b.earned).length;
  const sel = badges.find((b) => b.id === pick);
  const name = profile.name || profile.full_name || "Người dùng";
  const joined = profile.created_at ? new Date(profile.created_at).toLocaleDateString("vi-VN") : null;

  return (
    <div className="mx-auto w-full max-w-3xl overflow-hidden bg-white dark:bg-neutral-900 sm:rounded-2xl sm:border sm:border-neutral-200 dark:sm:border-neutral-800">
      {/* ẢNH BÌA */}
      <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 sm:h-48">
        {profile.cover_url ? (
          <img src={profile.cover_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 20%,#fff 0,transparent 35%),radial-gradient(circle at 80% 80%,#fff 0,transparent 30%)" }} />
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent" />
        {isOwner && (
          <>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-black/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur active:scale-95">
              <Camera size={14} /> Đổi ảnh bìa
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onPickCover?.(f); e.target.value = ""; }} />
          </>
        )}
      </div>

      {/* AVATAR + TÊN */}
      <div className="px-4 pb-4">
        <div className="-mt-12 flex items-end gap-3">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={name} className="h-24 w-24 rounded-full object-cover ring-4 ring-white dark:ring-neutral-900" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-600 text-3xl font-semibold text-white ring-4 ring-white dark:ring-neutral-900">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">{name}</h1>
          {profile.verified && <BadgeCheck size={18} className="text-sky-500" />}
        </div>
        {profile.username && <p className="text-[15px] text-neutral-500">@{profile.username}</p>}
        {profile.bio && <p className="mt-2 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">{profile.bio}</p>}

        {/* SỐ LIỆU */}
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400">
          {stats.coins != null && <span><b className="text-neutral-900 dark:text-white">{Number(stats.coins).toLocaleString("vi-VN")}</b> xu</span>}
          {stats.rank ? <span>Hạng <b className="text-neutral-900 dark:text-white">#{stats.rank}</b></span> : null}
          {stats.tasks != null && <span><b className="text-neutral-900 dark:text-white">{stats.tasks}</b> nhiệm vụ</span>}
          {joined && <span>Tham gia {joined}</span>}
        </div>

        {/* HUY HIỆU */}
        <div className="mt-6 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Huy hiệu</h2>
            <span className="text-xs text-neutral-500">{got}/{badges.length} đã đạt</span>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
            {badges.map(({ id, name: bn, Icon, grad, earned }) => (
              <button key={id} type="button" onClick={() => setPick(pick === id ? null : id)} className="flex flex-col items-center gap-1.5 active:scale-95">
                <span className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${grad} text-white shadow-md ring-2 transition ${
                  pick === id ? "ring-green-500" : "ring-transparent"} ${earned ? "" : "opacity-35 grayscale"}`}>
                  <Icon size={26} strokeWidth={2.2} />
                  {!earned && <Lock size={12} className="absolute -bottom-0.5 -right-0.5 rounded-full bg-neutral-700 p-0.5 text-white" />}
                </span>
                <span className="line-clamp-2 text-center text-[11px] leading-tight text-neutral-600 dark:text-neutral-400">{bn}</span>
              </button>
            ))}
          </div>

          {sel && (
            <div className="mt-3 rounded-xl bg-neutral-100 px-3.5 py-3 text-sm dark:bg-neutral-800">
              <b className="text-neutral-900 dark:text-white">{sel.name}</b>
              <span className={`ml-2 text-xs font-medium ${sel.earned ? "text-green-600" : "text-neutral-500"}`}>{sel.earned ? "Đã đạt" : "Chưa đạt"}</span>
              <p className="mt-0.5 text-neutral-600 dark:text-neutral-400">{sel.desc}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
                            }
