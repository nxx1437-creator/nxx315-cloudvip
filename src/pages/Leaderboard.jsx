import React, { useEffect, useState } from "react";
import { Crown, Medal, Coins, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabaseClient.js";

const TABS = [
  { key: "week", label: "Tuần này" },
  { key: "month", label: "Tháng này" },
];

const formatCoins = (n) => Number(n || 0).toLocaleString("vi-VN");

/* ---------- Avatar có fallback chữ cái ---------- */
function Avatar({ src, name, size = "h-12 w-12", text = "text-sm", ring = true }) {
  const initial = (name || "U").charAt(0).toUpperCase();
  const [failed, setFailed] = useState(false);

  const ringClass = ring ? "border-2 border-white shadow-[0_4px_14px_rgba(0,0,0,0.12)]" : "";

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className={`${size} ${ringClass} shrink-0 rounded-full object-cover`}
      />
    );
  }
  return (
    <div
      className={`${size} ${text} ${ringClass} flex shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-500`}
    >
      {initial}
    </div>
  );
}

/* ---------- Icon cúp cho podium ---------- */
function TrophyIcon({ rank, size = 26 }) {
  if (rank === 1) return <Crown className="text-amber-400" size={size} strokeWidth={2.4} />;
  if (rank === 2) return <Medal className="text-slate-400" size={size} strokeWidth={2.2} />;
  if (rank === 3) return <Medal className="text-orange-400" size={size} strokeWidth={2.2} />;
  return null;
}

/* ---------- Icon hạng cho list 4+ ---------- */
function RankIcon({ rank }) {
  if (rank === 1) return <Crown className="text-amber-400" size={22} strokeWidth={2.4} />;
  if (rank === 2) return <Medal className="text-slate-400" size={22} strokeWidth={2.2} />;
  if (rank === 3) return <Medal className="text-orange-400" size={22} strokeWidth={2.2} />;
  return (
    <span className="w-[22px] text-center text-sm font-bold text-slate-400">
      {rank}
    </span>
  );
}

/* ---------- Podium ---------- */
const PODIUM_STYLES = {
  1: {
    card: "bg-gradient-to-b from-amber-100 to-amber-50 border-amber-200",
    padding: "pt-5 pb-5",
    name: "text-slate-800",
    avatarSize: "h-16 w-16",
    avatarText: "text-xl",
  },
  2: {
    card: "bg-gradient-to-b from-slate-200 to-slate-100 border-slate-200",
    padding: "pt-4 pb-4 mt-4",
    name: "text-slate-700",
    avatarSize: "h-14 w-14",
    avatarText: "text-lg",
  },
  3: {
    card: "bg-gradient-to-b from-orange-100 to-orange-50 border-orange-200",
    padding: "pt-4 pb-4 mt-4",
    name: "text-slate-700",
    avatarSize: "h-14 w-14",
    avatarText: "text-lg",
  },
};

function PodiumCard({ user, rank }) {
  if (!user) {
    return <div className="flex-1" />;
  }
  const s = PODIUM_STYLES[rank];
  const isFirst = rank === 1;

  return (
    <div
      className={`flex flex-1 flex-col items-center rounded-2xl border ${s.card} ${s.padding} px-2 transition`}
    >
      {/* Icon cúp */}
      <div className="mb-3">
        <TrophyIcon rank={rank} size={isFirst ? 28 : 24} />
      </div>

      {/* Avatar */}
      <Avatar
        src={user.avatar_url}
        name={user.display_name || user.username}
        size={s.avatarSize}
        text={s.avatarText}
        ring={true}
      />

      {/* Tên */}
      <p className={`mt-3 w-full truncate text-center text-[13px] font-bold ${s.name}`}>
        {user.display_name || user.username}
      </p>

      {/* Coin */}
      <div className="mt-1 flex items-center gap-1 text-amber-500">
        <Coins size={isFirst ? 15 : 14} strokeWidth={2.6} />
        <span className={`${isFirst ? "text-[15px]" : "text-[13px]"} font-black`}>
          {formatCoins(user.coins)}
        </span>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("week");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc("get_leaderboard", {
          period: tab,
          limit_count: 50,
        });

        if (error) throw error;
        if (alive) setUsers(data || []);
      } catch (err) {
        console.error("Load leaderboard error:", err);
        if (alive) setUsers([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [tab]);

  const top1 = users[0];
  const top2 = users[1];
  const top3 = users[2];
  const rest = users.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/60 via-white to-white pb-24">
      {/* Header quay lại */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Title block */}
      <div className="mt-3 flex items-center gap-3 px-4">
        <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-[0_6px_16px_rgba(56,130,246,0.35)]">
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
            <path
              d="M6 4h12v3a6 6 0 0 1-12 0V4Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M6 6H4a2 2 0 0 0 0 4h2M18 6h2a2 2 0 0 1 0 4h-2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M9 14h6M12 14v4M9 20h6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <h1 className="text-[22px] font-black leading-tight text-slate-900">
            Bảng Xếp Hạng
          </h1>
          <p className="text-[13px] text-slate-500">
            Top user kiếm Coin nhiều nhất
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex gap-3 px-4">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                active
                  ? "bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-[0_4px_14px_rgba(56,130,246,0.35)]"
                  : "bg-white text-slate-500 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Podium */}
      <div className="mt-4 px-4">
        {loading ? (
          <div className="flex gap-3">
            {[2, 1, 3].map((r) => (
              <div
                key={r}
                className="h-[150px] flex-1 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-400 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
            Chưa có dữ liệu xếp hạng
          </div>
        ) : (
          <div className="flex items-stretch gap-3">
            <PodiumCard user={top2} rank={2} />
            <PodiumCard user={top1} rank={1} />
            <PodiumCard user={top3} rank={3} />
          </div>
        )}
      </div>

      {/* List 4+ */}
      <div className="mt-4 space-y-3 px-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-[76px] animate-pulse rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
              />
            ))
          : rest.map((u, idx) => {
              const rank = idx + 4;
              return (
                <div
                  key={u.id}
                  className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
                >
                  <div className="flex w-7 shrink-0 justify-center">
                    <RankIcon rank={rank} />
                  </div>

                  <Avatar
                    src={u.avatar_url}
                    name={u.display_name || u.username}
                    size="h-12 w-12"
                    text="text-base"
                    ring={false}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-bold text-slate-800">
                      {u.display_name || u.username}
                    </p>
                    <p className="text-[13px] text-slate-400">Lv.{u.level || 1}</p>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="flex items-center justify-end gap-1 text-amber-500">
                      <Coins size={15} strokeWidth={2.6} />
                      <span className="text-[16px] font-black">
                        {formatCoins(u.coins)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Coin kiếm được
                    </p>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
            }
