import React, { useEffect, useState } from "react";
import { Trophy, Crown, Medal, Coins, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabaseClient.js";

const formatCoins = (n) => Number(n || 0).toLocaleString("vi-VN");

function Avatar({ src, name, size = "h-11 w-11", text = "text-sm" }) {
  const initial = (name || "U").charAt(0).toUpperCase();
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className={`${size} shrink-0 rounded-full border-2 border-white object-cover shadow-[0_2px_8px_rgba(56,120,190,0.15)]`}
      />
    );
  }
  return (
    <div
      className={`${size} ${text} flex shrink-0 items-center justify-center rounded-full bg-slate-100 font-black text-slate-500`}
    >
      {initial}
    </div>
  );
}

function RankIcon({ rank }) {
  if (rank === 1) return <Crown className="text-amber-400" size={22} strokeWidth={2.2} />;
  if (rank === 2) return <Medal className="text-slate-400" size={22} strokeWidth={2.2} />;
  if (rank === 3) return <Medal className="text-orange-400" size={22} strokeWidth={2.2} />;
  return (
    <span className="w-[22px] text-center text-sm font-bold text-slate-400">
      {rank}
    </span>
  );
}

const PODIUM_STYLES = {
  1: { card: "bg-gradient-to-b from-amber-100 to-amber-50 border-amber-200" },
  2: { card: "bg-gradient-to-b from-slate-100 to-slate-50 border-slate-200" },
  3: { card: "bg-gradient-to-b from-orange-100 to-orange-50 border-orange-200" },
};

function PodiumCard({ user, rank }) {
  if (!user) return <div className="flex-1" />;
  const style = PODIUM_STYLES[rank];
  const isFirst = rank === 1;

  return (
    <div
      className={`flex flex-1 flex-col items-center rounded-2xl border ${style.card} px-2 ${
        isFirst ? "-mt-2 py-4" : "mt-2 py-3"
      } transition`}
    >
      <div className="mb-1.5">
        <RankIcon rank={rank} />
      </div>
      <Avatar
        src={user.avatar_url}
        name={user.display_name || user.username}
        size={isFirst ? "h-14 w-14" : "h-12 w-12"}
      />
      <p className="mt-2 w-full truncate text-center text-[12px] font-bold text-slate-800">
        {user.display_name || user.username}
      </p>
      <div className="mt-0.5 flex items-center gap-1 text-amber-500">
        <Coins size={12} strokeWidth={2.4} />
        <span className="text-[12px] font-black">{formatCoins(user.coins)}</span>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc("get_leaderboard", {
          period: "all",
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
  }, []);

  const top1 = users[0];
  const top2 = users[1];
  const top3 = users[2];
  const rest = users.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/70 via-white to-sky-50/40 pb-24">
      <div className="flex items-center gap-3 px-4 pt-5">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-[0_2px_8px_rgba(56,120,190,0.12)]"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-lg font-black text-slate-900">Bảng Xếp Hạng</h1>
      </div>

      <div className="mt-4 flex items-center gap-3 px-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-[0_6px_18px_rgba(56,130,246,0.35)]">
          <Trophy size={24} strokeWidth={2.2} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">Bảng Xếp Hạng</h2>
          <p className="text-xs text-slate-500">Top user sở hữu Coin nhiều nhất</p>
        </div>
      </div>

      <div className="mt-5 px-4">
        {loading ? (
          <div className="flex gap-3">
            {[2, 1, 3].map((r) => (
              <div key={r} className="h-36 flex-1 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-400 shadow-[0_4px_16px_rgba(56,120,190,0.08)]">
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

      <div className="mt-5 space-y-2.5 px-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-[68px] animate-pulse rounded-2xl bg-white shadow-[0_2px_8px_rgba(56,120,190,0.06)]"
              />
            ))
          : rest.map((u, idx) => {
              const rank = idx + 4;
              return (
                <div
                  key={u.id}
                  className="flex items-center gap-3 rounded-2xl bg-white px-3 py-3 shadow-[0_2px_10px_rgba(56,120,190,0.08)]"
                >
                  <div className="flex w-6 shrink-0 justify-center">
                    <RankIcon rank={rank} />
                  </div>
                  <Avatar
                    src={u.avatar_url}
                    name={u.display_name || u.username}
                    size="h-11 w-11"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-bold text-slate-800">
                      {u.display_name || u.username}
                    </p>
                    <p className="text-xs text-slate-400">Lv.{u.level || 1}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="flex items-center justify-end gap-1 text-amber-500">
                      <Coins size={14} strokeWidth={2.4} />
                      <span className="text-[15px] font-black">
                        {formatCoins(u.coins)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Coin</p>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
