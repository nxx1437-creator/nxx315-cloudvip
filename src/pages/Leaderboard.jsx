import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Crown, Medal, ChevronRight, Gift } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import { Card, Eyebrow } from "../../components/creator/creatorUi.jsx";

// Hàm format điểm
const formatPoints = (n) => Number(n || 0).toLocaleString("vi-VN");

// Component Avatar có viền
function Avatar({ src, name, size = "h-16 w-16", text = "text-xl" }) {
  const initial = (name || "U").charAt(0).toUpperCase();
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className={`${size} ${text} border-4 border-white shadow-lg shrink-0 rounded-full object-cover`}
      />
    );
  }
  return (
    <div className={`${size} ${text} border-4 border-white shadow-lg flex shrink-0 items-center justify-center rounded-full bg-cyan-100 font-bold text-cyan-700`}>
      {initial}
    </div>
  );
}

// Component Podium (Bục vinh danh)
function PodiumCard({ user, rank }) {
  if (!user) return <div className="flex-1" />;

  const isFirst = rank === 1;
  const bgColor = isFirst 
    ? "from-amber-100/80 to-amber-50/30 border-amber-200/50" 
    : "from-white/80 to-white/40 border-white/60";
  
  return (
    <div className={`relative flex flex-1 flex-col items-center justify-end rounded-[2rem] border bg-gradient-to-b p-4 pb-6 shadow-sm backdrop-blur-sm ${bgColor} ${isFirst ? 'pt-8 -mt-6 z-10' : 'pt-6 mt-4'}`}>
      
      {/* Vương miện cho Top 1 */}
      {isFirst && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <Crown size={36} className="text-amber-400 fill-amber-400 drop-shadow-md" />
        </div>
      )}

      {/* Avatar & Badge */}
      <div className="relative mb-3">
        <Avatar src={user.avatar_url} name={user.username} size={isFirst ? "h-20 w-20" : "h-14 w-14"} />
        <div className={`absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white shadow-md border-2 border-white ${isFirst ? 'bg-amber-500' : 'bg-slate-400'}`}>
          {rank}
        </div>
      </div>

      {/* Tên */}
      <p className={`w-full truncate text-center font-bold ${isFirst ? 'text-[15px] text-slate-800' : 'text-[13px] text-slate-700'}`}>
        {user.username}
      </p>

      {/* Điểm & Phần thưởng (Giả lập giống ảnh mẫu) */}
      <div className={`mt-2 flex flex-col items-center rounded-xl px-3 py-1.5 ${isFirst ? 'bg-amber-100/50' : 'bg-slate-50'}`}>
        <p className={`font-black ${isFirst ? 'text-amber-600 text-sm' : 'text-slate-600 text-xs'}`}>
          {formatPoints(user.points)} điểm
        </p>
        <p className="text-[9px] font-bold text-slate-400 uppercase">
          {user.approved} video
        </p>
      </div>

    </div>
  );
}

export default function Ranking() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .rpc("get_creator_leaderboard")
      .then(({ data: d }) => {
        setData(d?.ok ? d : { items: [], me: null });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-40 bg-slate-200 rounded-[2rem]"></div>
        <div className="h-64 bg-slate-200 rounded-[2rem]"></div>
      </div>
    );
  }

  const items = data?.items || [];
  const top1 = items[0];
  const top2 = items[1];
  const top3 = items[2];
  const rest = items.slice(3);

  return (
    <div className="space-y-6 pb-10">
      
      {/* HEADER */}
      <div className="px-1">
        <h1 className="text-3xl font-extrabold text-cyan-600">Bảng Xếp Hạng</h1>
        <p className="mt-1 text-sm text-slate-500">Cập nhật trực tiếp — refresh lúc 00:00 ICT mỗi ngày.</p>
      </div>

      {/* 1. PODIUM (TOP 1, 2, 3) */}
      <Card className="relative overflow-hidden rounded-[2.5rem] border-white bg-[#e6f7f2] p-5 shadow-sm">
        <div className="text-center mb-6">
          <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-emerald-600 uppercase">Vinh danh tháng này</p>
        </div>

        {items.length === 0 ? (
           <div className="py-10 text-center text-sm text-slate-500">Chưa có ai trên bảng xếp hạng tháng này.</div>
        ) : (
          <div className="flex items-end justify-center gap-2 sm:gap-4 px-2">
            <PodiumCard user={top2} rank={2} />
            <PodiumCard user={top1} rank={1} />
            <PodiumCard user={top3} rank={3} />
          </div>
        )}
      </Card>

      {/* 2. VỪA NHẬN THƯỞNG (Giả lập giao diện) */}
      <Card className="relative overflow-hidden rounded-[2.5rem] border-white bg-white/80 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
             <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-500"><Gift size={16}/></div>
             <div>
               <h3 className="text-sm font-bold text-slate-800">Vừa nhận thưởng</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Giờ vừa được cộng cho Creator</p>
             </div>
          </div>
        </div>

        <div className="rounded-xl border border-cyan-200 bg-cyan-50/50 p-4 flex items-center justify-between mb-2">
           <div className="flex items-center gap-2 text-cyan-700 text-xs font-bold">
             <Trophy size={16} /> TỔNG GIỜ ĐÃ TĂNG
           </div>
           <div className="flex items-end gap-1">
             <span className="text-xl font-black text-cyan-600">83.334</span>
             <span className="text-[10px] font-bold text-cyan-600 mb-1">GIỜ</span>
           </div>
        </div>

        {/* Mock list (Sau này thay bằng API thật) */}
        <div className="space-y-3 mt-4">
           {items.slice(0, 3).map((u, i) => (
             <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Avatar src={u.avatar_url} name={u.username} size="h-10 w-10" text="text-sm" />
                   <div>
                      <p className="text-sm font-bold text-slate-800">{u.username}</p>
                      <p className="text-[11px] text-slate-500">Vừa được duyệt video mới</p>
                   </div>
                </div>
                <div className="text-right">
                   <span className="inline-block rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">+{u.approved * 6} giờ</span>
                   <p className="text-[9px] text-slate-400 mt-1">Hôm qua</p>
                </div>
             </div>
           ))}
        </div>
      </Card>

      {/* 3. DANH SÁCH TỪ TOP 4 TRỞ XUỐNG */}
      {rest.length > 0 && (
        <Card className="relative overflow-hidden rounded-[2.5rem] border-white bg-white/80 p-5 shadow-sm">
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-4">Top Creator</h3>
          <div className="divide-y divide-slate-100">
            {rest.map((it) => (
              <div key={it.rank} className="flex items-center gap-3 py-3">
                <span className="w-6 text-center text-sm font-black text-slate-400">{it.rank}</span>
                <Avatar src={it.avatar_url} name={it.username} size="h-10 w-10" text="text-sm" />
                <span className="min-w-0 flex-1 truncate text-[14px] font-bold text-slate-800">
                  {it.username} {it.is_me && <span className="text-xs text-cyan-600">(bạn)</span>}
                </span>
                <span className="text-right">
                  <b className="block text-[14px] text-cyan-600">{formatPoints(it.points)}</b>
                  <span className="text-[10px] text-slate-500">{it.approved} video</span>
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
      }
