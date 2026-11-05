// src/pages/Leaderboard.jsx — bảng xếp hạng (gộp 1 file; bấm avatar/tên để xem trang cá nhân)
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Coins, Crown } from "lucide-react";

import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import useSession from "../hooks/useSession.js";
import { supabase } from "../lib/supabaseClient.js";

const TABS = [
  { key: "week", label: "Tuần này", note: "7 ngày gần nhất" },
  { key: "month", label: "Tháng này", note: "30 ngày gần nhất" },
];
const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");

/* ---------- Avatar có chữ cái dự phòng ---------- */
export function LbAvatar({ src, name, size = "h-12 w-12", text = "text-base", ring = "" }) {
  const [failed, setFailed] = useState(false);
  const initial = (name || "U").charAt(0).toUpperCase();

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        onError={() => setFailed(true)}
        className={`${size} ${ring} shrink-0 rounded-full object-cover`}
      />
    );
  }
  return (
    <div
      className={`${size} ${text} ${ring} flex shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-500 dark:bg-slate-800`}
    >
      {initial}
    </div>
  );
}

/* ---------- Bục top 1-2-3 ---------- */
const STYLE = {
  1: { avatar: "h-[84px] w-[84px]", text: "text-3xl", ring: "ring-4 ring-amber-300", base: "h-20 from-amber-300 to-amber-100", num: "text-amber-700" },
  2: { avatar: "h-[68px] w-[68px]", text: "text-2xl", ring: "ring-4 ring-slate-300", base: "h-14 from-slate-300 to-slate-100", num: "text-slate-600" },
  3: { avatar: "h-[68px] w-[68px]", text: "text-2xl", ring: "ring-4 ring-orange-300", base: "h-10 from-orange-300 to-orange-100", num: "text-orange-700" },
};

function Spot({ user, rank, onOpen }) {
  const s = STYLE[rank];
  if (!user) return <div className="flex-1" />;
  const name = user.display_name || user.username || "Người dùng";

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      {rank === 1 && <Crown size={30} className="mb-1 fill-amber-400 text-amber-400" />}
      <button onClick={() => onOpen(user)} className="flex w-full min-w-0 flex-col items-center transition active:scale-95">
        <LbAvatar src={user.avatar_url} name={name} size={s.avatar} text={s.text} ring={s.ring} />
        <span className="mt-2 w-full truncate px-1 text-center text-[13px] font-bold text-slate-900 dark:text-white">
          {name}
        </span>
      </button>
      <span className="mt-1 flex items-center gap-1 text-[13px] font-extrabold text-amber-500">
        <Coins size={13} strokeWidth={2.6} />
        {fmt(user.coins)}
      </span>
      <div className={`mt-3 flex w-full items-start justify-center rounded-t-2xl bg-gradient-to-b pt-2 ${s.base}`}>
        <span className={`text-2xl font-black ${s.num}`}>{rank}</span>
      </div>
    </div>
  );
}

function Podium({ top, onOpen }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white px-3 pt-6 dark:bg-slate-900">
      <div className="flex items-end gap-2">
        <Spot user={top[1]} rank={2} onOpen={onOpen} />
        <Spot user={top[0]} rank={1} onOpen={onOpen} />
        <Spot user={top[2]} rank={3} onOpen={onOpen} />
      </div>
    </section>
  );
}

/* ---------- Dòng xếp hạng từ hạng 4 ---------- */
function RankRow({ user, rank, mine, onOpen }) {
  const name = user.display_name || user.username || "Người dùng";
  return (
    <button
      onClick={() => onOpen(user)}
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition active:scale-[0.99] ${
        mine ? "bg-accent-500/10 ring-1 ring-accent-500/40" : "bg-white dark:bg-slate-900"
      }`}
    >
      <span className="w-7 shrink-0 text-center text-[15px] font-bold text-slate-400">{rank}</span>
      <LbAvatar src={user.avatar_url} name={name} size="h-11 w-11" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[15px] font-bold text-slate-900 dark:text-white">{name}</span>
          {mine && (
            <span className="shrink-0 rounded-md bg-accent-500 px-1.5 py-0.5 text-[10px] font-bold text-white">Bạn</span>
          )}
        </span>
        <span className="block text-[12.5px] text-slate-500">Lv.{user.level || 1}</span>
      </span>
      <span className="shrink-0 text-right">
        <span className="flex items-center justify-end gap-1 text-amber-500">
          <Coins size={14} strokeWidth={2.6} />
          <span className="text-[15px] font-extrabold">{fmt(user.coins)}</span>
        </span>
        <span className="block text-[11px] text-slate-400">Coin kiếm được</span>
      </span>
      <ChevronRight size={16} className="shrink-0 text-slate-300" />
    </button>
  );
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const { session } = useSession();
  const myId = session?.user?.id;

  const [tab, setTab] = useState("week");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc("get_leaderboard", { period: tab, limit_count: 50 });
        if (error) throw error;
        if (alive) setUsers(data || []);
      } catch (err) {
        console.error("Load leaderboard error:", err);
        if (alive) setUsers([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [tab]);

  // Bấm vào chính mình -> trang cá nhân của mình; người khác -> /u/:id
  const openUser = (u) => {
    if (!u?.id) return;
    if (u.id === myId) navigate("/profile", { state: { screen: "profile" } });
    else navigate(`/u/${u.id}`);
  };

  const myIndex = myId ? users.findIndex((u) => u.id === myId) : -1;
  const me = myIndex >= 0 ? users[myIndex] : null;
  const rest = users.slice(3);
  const note = TABS.find((t) => t.key === tab)?.note;

  return (
    <div className="min-h-screen bg-[#eef2f9] pb-28 dark:bg-slate-950">
      <TopHeader />

      <main className="mx-auto max-w-md space-y-4 px-4 py-5 md:max-w-3xl">
        <div className="px-1">
          <h1 className="text-[26px] font-black leading-tight text-slate-900 dark:text-white">Bảng xếp hạng</h1>
          <p className="mt-0.5 text-[14px] text-slate-500">Top người kiếm Coin nhiều nhất</p>
        </div>

        <div className="grid grid-cols-2 rounded-2xl bg-white p-1 dark:bg-slate-900">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-xl py-2.5 text-[14px] font-bold transition ${
                tab === t.key ? "bg-accent-500 text-white" : "text-slate-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {!loading && myId && users.length > 0 && (
          <div className="flex items-center gap-3 rounded-2xl bg-accent-500 p-4 text-white">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-white/80">Hạng của bạn</p>
              {me ? (
                <p className="text-[24px] font-black leading-tight">#{myIndex + 1}</p>
              ) : (
                <p className="text-[15px] font-semibold leading-5">Chưa vào top 50, làm nhiệm vụ để lên hạng!</p>
              )}
            </div>
            {me ? (
              <div className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2">
                <Coins size={16} strokeWidth={2.6} />
                <span className="text-[16px] font-extrabold">{fmt(me.coins)}</span>
              </div>
            ) : (
              <button
                onClick={() => navigate("/tasks")}
                className="shrink-0 rounded-xl bg-white px-4 py-2.5 text-[14px] font-bold text-accent-600"
              >
                Làm nhiệm vụ
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            <div className="h-56 animate-pulse rounded-2xl bg-white dark:bg-slate-900" />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[68px] animate-pulse rounded-2xl bg-white dark:bg-slate-900" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-[15px] text-slate-500 dark:bg-slate-900">
            Chưa có dữ liệu xếp hạng
          </div>
        ) : (
          <>
            <Podium top={users} onOpen={openUser} />
            {rest.length > 0 && (
              <div className="space-y-2.5">
                {rest.map((u, i) => (
                  <RankRow key={u.id || i} user={u} rank={i + 4} mine={u.id === myId} onOpen={openUser} />
                ))}
              </div>
            )}
            <p className="px-2 text-center text-[12.5px] text-slate-400">
              Xếp hạng theo Coin kiếm được trong {note}. Bấm vào avatar hoặc tên để xem trang cá nhân.
            </p>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
    }
                          
