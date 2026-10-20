import React, { useEffect, useState } from "react";
import { Loader2, Trophy } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import { Card, Eyebrow } from "../../components/creator/creatorUi.jsx";

const MEDAL = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function CreatorRanking() {
  const [data, setData] = useState(null);

  useEffect(() => {
    supabase.rpc("get_creator_leaderboard").then(({ data: d }) => setData(d?.ok ? d : { items: [], me: null }));
  }, []);

  if (!data) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <>
      <div className="px-1">
        <Eyebrow>▸ Leaderboard</Eyebrow>
        <h1 className="mt-1 text-3xl font-extrabold text-white">Bảng xếp hạng</h1>
        <p className="mt-1 text-sm text-slate-400">Xếp theo số video được duyệt trong tháng.</p>
      </div>

      <Card>
        <Eyebrow>Hạng của bạn</Eyebrow>
        {data.me ? (
          <div className="mt-2 flex items-end justify-between">
            <p className="text-5xl font-black italic text-cyan-300">#{data.me.rank}</p>
            <p className="text-right text-sm text-slate-300">
              {data.me.approved} video
              <br />
              <b className="text-white">{data.me.points}</b> điểm
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-400">
            Bạn chưa có video nào được duyệt trong tháng này.
          </p>
        )}
      </Card>

      <Card className="!p-3">
        {data.items.length === 0 ? (
          <div className="py-10 text-center">
            <Trophy size={28} className="mx-auto text-slate-600" />
            <p className="mt-2 text-sm text-slate-400">Chưa có ai trên bảng xếp hạng tháng này.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {data.items.map((it) => (
              <div
                key={it.rank}
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 ${it.is_me ? "bg-cyan-400/10" : ""}`}
              >
                <span className="w-8 text-center text-lg font-black text-slate-300">
                  {MEDAL[it.rank] || it.rank}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
                  {it.name} {it.is_me && <span className="text-xs text-cyan-300">(bạn)</span>}
                </span>
                <span className="text-right">
                  <b className="block text-sm text-cyan-300">{it.points}</b>
                  <span className="text-[10px] text-slate-500">{it.approved} video</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
            }
