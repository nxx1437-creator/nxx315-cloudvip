import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Medal, Coins, ChevronRight, Trophy } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";

const formatCoins = (n) => Number(n || 0).toLocaleString("vi-VN");

// ✅ Avatar có fallback chữ cái
function Avatar({ src, name, size = "h-12 w-12", text = "text-sm" }) {
  const initial = (name || "U").charAt(0).toUpperCase();
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className={`${size} shrink-0 rounded-full border-2 border-white object-cover shadow-md`}
      />
    );
  }

  return (
    <div
      className={`${size} ${text} flex shrink-0 items-center justify-center rounded-full border-2 border-white bg-slate-100 font-bold text-slate-500 shadow-md`}
    >
      {initial}
    </div>
  );
}

// ✅ Icon hạng
function RankIcon({ rank, size = 16 }) {
  if (rank === 1) return <Crown className="text-amber-400" size={size} strokeWidth={2.6} />;
  if (rank === 2) return <Medal className="text-slate-400" size={size} strokeWidth={2.4} />;
  if (rank === 3) return <Medal className="text-orange-400" size={size} strokeWidth={2.4} />;
  return <span className="text-[11px] font-bold text-slate-400">{rank}</span>;
}

// ✅ Styles cho top 1-2-3
const TOP_STYLES = {
  1: {
    bg: "bg-gradient-to-br from-amber-100 to-amber-50",
    border: "border-amber-300",
    text: "text-amber-700",
  },
  2: {
    bg: "bg-gradient-to-br from-slate-200 to-slate-100",
    border: "border-slate-300",
    text: "text-slate-700",
  },
  3: {
    bg: "bg-gradient-to-br from-orange-100 to-orange-50",
    border: "border-orange-300",
    text: "text-orange-700",
  },
};

export default function LeaderboardCard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc("get_leaderboard", {
          period: "week",
          limit_count: 3,
        });

        if (error) throw error;
        if (alive) setUsers(data || []);
      } catch (err) {
        console.error("Load leaderboard card error:", err);
        if (alive) setUsers([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  // Loading skeleton
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) return null;

  return (
    <button
      onClick={() => navigate("/leaderboard")}
      className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition hover:border-sky-200 hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-orange-500/25">
            <Trophy size={17} className="text-white" strokeWidth={2.4} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Top 3 tuần này</p>
            <p className="text-[11px] text-slate-500">Ai kiếm nhiều Coin nhất?</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-slate-300" />
      </div>

      {/* Podium top 3 */}
      <div className="grid grid-cols-3 gap-2.5 p-4">
        {users.map((user, idx) => {
          const rank = idx + 1;
          const style = TOP_STYLES[rank];
          return (
            <div
              key={user.id}
              className={`flex flex-col items-center rounded-2xl border ${style.border} ${style.bg} p-3`}
            >
              {/* Icon hạng */}
              <div className="mb-2 flex h-6 w-6 items-center justify-center">
                <RankIcon rank={rank} size={18} />
              </div>

              {/* Avatar */}
              <Avatar
                src={user.avatar_url}
                name={user.display_name || user.username}
                size="h-12 w-12"
                text="text-base"
              />

              {/* Tên */}
              <p
                className={`mt-2 w-full truncate text-center text-[11.5px] font-bold ${style.text}`}
              >
                {user.display_name || user.username}
              </p>

              {/* Coin */}
              <div className="mt-1 flex items-center gap-0.5 text-amber-500">
                <Coins size={11} strokeWidth={2.6} />
                <span className="text-[11px] font-black">
                  {formatCoins(user.coins)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-2.5 text-center">
        <p className="text-[11.5px] font-semibold text-sky-600">
          Xem bảng xếp hạng đầy đủ →
        </p>
      </div>
    </button>
  );
      }
