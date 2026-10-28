import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Coins, ChevronRight } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";

const formatCoins = (n) => Number(n || 0).toLocaleString("vi-VN");

// Component Avatar
function Avatar({ src, name, size = "h-14 w-14", text = "text-lg" }) {
  const initial = (name || "U").charAt(0).toUpperCase();
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className={`${size} shrink-0 rounded-full border-4 border-white object-cover shadow-lg`}
      />
    );
  }

  return (
    <div
      className={`${size} ${text} flex shrink-0 items-center justify-center rounded-full border-4 border-white bg-slate-100 font-bold text-slate-500 shadow-lg`}
    >
      {initial}
    </div>
  );
}

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
          period: "month", // Lấy top tháng
          limit_count: 3,
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
    return () => { alive = false; };
  }, []);

  if (loading) {
    return <div className="rounded-[2rem] border border-white bg-white/80 p-5 shadow-sm h-64 animate-pulse" />;
  }

  if (users.length === 0) return null;

  const top1 = users[0];
  const top2 = users[1];
  const top3 = users[2];

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white bg-[#e6f7f2] p-5 shadow-sm">
      {/* Hiệu ứng ánh sáng nền */}
      <div className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 h-48 w-48 rounded-full bg-amber-300/30 blur-3xl"></div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-emerald-700 uppercase">
          Vinh danh tháng trước
        </p>
        <button onClick={() => navigate("/leaderboard")} className="text-[10px] font-bold text-cyan-600 flex items-center gap-1">
          Xem tất cả <ChevronRight size={12} />
        </button>
      </div>

      {/* PODIUM */}
      <div className="relative flex items-end justify-center gap-1 sm:gap-2 px-1 z-10">
        
        {/* TOP 2 (Bên trái) */}
        <div className="flex flex-col items-center flex-1">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-[3px] border-slate-300 p-0.5 bg-white">
              <Avatar src={top2?.avatar_url} name={top2?.username || "U"} size="h-full w-full" />
            </div>
            <div className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white shadow-md border-2 border-[#e6f7f2]">
              2
            </div>
          </div>
          <p className="mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Top 2</p>
          <p className="text-[12px] font-bold text-slate-800 truncate max-w-[80px] text-center">{top2?.username || "—"}</p>
          <div className="mt-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-center w-full">
            <p className="text-[9px] font-bold text-amber-700">300,000đ + 120h</p>
          </div>
          <p className="mt-1 text-[10px] font-bold text-slate-500">{top2 ? formatCoins(top2.coins) : 0} điểm</p>
          {/* Bục đỡ */}
          <div className="mt-2 h-10 w-full rounded-t-xl bg-gradient-to-b from-slate-300/40 to-transparent"></div>
        </div>

        {/* TOP 1 (Ở giữa, to nhất) */}
        <div className="flex flex-col items-center flex-1 z-10 -mt-6">
          <div className="relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <Crown size={32} className="text-amber-400 fill-amber-400 drop-shadow-md" />
            </div>
            <div className="h-24 w-24 rounded-full border-[4px] border-amber-400 p-0.5 bg-white shadow-[0_0_20px_rgba(251,191,36,0.4)]">
              <Avatar src={top1?.avatar_url} name={top1?.username || "U"} size="h-full w-full" text="text-3xl" />
            </div>
            <div className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-[12px] font-black text-white shadow-md border-2 border-[#e6f7f2]">
              1
            </div>
          </div>
          <p className="mt-3 text-[10px] font-bold text-amber-600 uppercase tracking-widest text-center">Top 1</p>
          <p className="text-[14px] font-black text-slate-800 truncate max-w-[90px] text-center">{top1?.username || "—"}</p>
          <div className="mt-1 rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-center w-full">
            <p className="text-[10px] font-bold text-amber-700">700,000đ + 150h</p>
          </div>
          <p className="mt-1 text-[11px] font-bold text-slate-600">{top1 ? formatCoins(top1.coins) : 0} điểm</p>
          {/* Bục đỡ */}
          <div className="mt-2 h-14 w-full rounded-t-2xl bg-gradient-to-b from-amber-300/60 to-transparent"></div>
        </div>

        {/* TOP 3 (Bên phải) */}
        <div className="flex flex-col items-center flex-1">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-[3px] border-slate-300 p-0.5 bg-white">
              <Avatar src={top3?.avatar_url} name={top3?.username || "U"} size="h-full w-full" />
            </div>
            <div className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white shadow-md border-2 border-[#e6f7f2]">
              3
            </div>
          </div>
          <p className="mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Top 3</p>
          <p className="text-[12px] font-bold text-slate-800 truncate max-w-[80px] text-center">{top3?.username || "—"}</p>
          <div className="mt-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-center w-full">
            <p className="text-[9px] font-bold text-amber-700">200,000đ + 100h</p>
          </div>
          <p className="mt-1 text-[10px] font-bold text-slate-500">{top3 ? formatCoins(top3.coins) : 0} điểm</p>
          {/* Bục đỡ */}
          <div className="mt-2 h-10 w-full rounded-t-xl bg-gradient-to-b from-orange-200/40 to-transparent"></div>
        </div>
      </div>

    </div>
  );
          }
