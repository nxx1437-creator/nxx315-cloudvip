// src/pages/Leaderboard.jsx — bảng xếp hạng trực tiếp (bấm avatar/tên để xem trang cá nhân)
// - Tự cập nhật mỗi 8 giây; ai kiếm thêm Coin sẽ có hiệu ứng xu nhảy lên + số đếm tăng dần
// - LbAvatar vẫn được export cho PublicProfile.jsx dùng
import React, { useCallback, useEffect, useRef, useState } from "react";
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
const POLL_MS = 8000;
const BURST_MS = 2200;
const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");
const nameOf = (u) => u.display_name || u.username || "Người dùng";

/* ---------- Keyframes cho hiệu ứng ---------- */
const CSS = `
@keyframes lbCoin {
  0%   { transform: translate(0,0) scale(.5); opacity: 0; }
  15%  { opacity: 1; }
  45%  { transform: translate(var(--x), -58px) scale(1) rotate(180deg); }
  70%  { transform: translate(var(--x), -22px) scale(1) rotate(300deg); opacity: 1; }
  85%  { transform: translate(var(--x), -34px) scale(1) rotate(340deg); opacity: 1; }
  100% { transform: translate(var(--x), -30px) scale(.8) rotate(360deg); opacity: 0; }
}
@keyframes lbPop {
  0%   { transform: translateY(8px) scale(.6); opacity: 0; }
  20%  { transform: translateY(-4px) scale(1.15); opacity: 1; }
  75%  { transform: translateY(-14px) scale(1); opacity: 1; }
  100% { transform: translateY(-26px) scale(.9); opacity: 0; }
}
@keyframes lbBump {
  0%, 100% { transform: scale(1); }
  30% { transform: scale(1.28); }
  60% { transform: scale(.96); }
}
@keyframes lbFlash {
  0% { box-shadow: 0 0 0 0 rgba(251,191,36,.55); }
  100% { box-shadow: 0 0 0 14px rgba(251,191,36,0); }
}
@keyframes lbFloat {
  0%, 100% { transform: translateY(0) scale(1); opacity: .9; }
  50% { transform: translateY(-6px) scale(1.15); opacity: .4; }
}
@keyframes lbLive {
  0% { box-shadow: 0 0 0 0 rgba(16,185,129,.6); }
  100% { box-shadow: 0 0 0 8px rgba(16,185,129,0); }
}
.lb-coin  { animation: lbCoin 1.5s cubic-bezier(.3,.7,.4,1) both; }
.lb-pop   { animation: lbPop 1.8s ease-out both; }
.lb-bump  { display: inline-block; animation: lbBump .6s ease-out; }
.lb-flash { animation: lbFlash 1.1s ease-out; }
.lb-float { animation: lbFloat 3.2s ease-in-out infinite; }
.lb-live  { animation: lbLive 1.6s ease-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .lb-coin, .lb-pop, .lb-bump, .lb-flash, .lb-float, .lb-live { animation: none !important; }
}
`;

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

/* ---------- Số đếm tăng dần ---------- */
function CountUp({ value }) {
  const target = Number(value || 0);
  const [shown, setShown] = useState(target);
  const cur = useRef(target);

  useEffect(() => {
    const start = cur.current;
    if (start === target) return undefined;
    const t0 = performance.now();
    const dur = 900;
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      const v = Math.round(start + (target - start) * e);
      cur.current = v;
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return <>{fmt(shown)}</>;
}

/* ---------- Xu nhảy lên + chữ +N ---------- */
const COIN_FX = [
  { x: "-26px", delay: "0s" },
  { x: "0px", delay: ".12s" },
  { x: "26px", delay: ".24s" },
  { x: "-12px", delay: ".36s" },
  { x: "14px", delay: ".46s" },
];

function Burst({ delta, className = "" }) {
  return (
    <span className={`pointer-events-none absolute z-30 flex items-end justify-center ${className}`} aria-hidden="true">
      <span className="lb-pop absolute -top-5 whitespace-nowrap rounded-full bg-amber-400 px-2.5 py-0.5 text-[12px] font-black text-white shadow-lg">
        +{fmt(delta)}
      </span>
      {COIN_FX.map((c, i) => (
        <span
          key={i}
          className="lb-coin absolute flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-b from-amber-300 to-amber-500 text-white shadow ring-1 ring-amber-600/40"
          style={{ "--x": c.x, animationDelay: c.delay }}
        >
          <Coins size={11} strokeWidth={3} />
        </span>
      ))}
    </span>
  );
}

/* ---------- Bục top 1-2-3 ---------- */
const STYLE = {
  1: {
    avatar: "h-[96px] w-[96px]",
    text: "text-4xl",
    frame: "p-[5px] from-amber-300 via-amber-400 to-orange-500 shadow-[0_0_44px_rgba(251,191,36,.6)]",
    badge: "from-amber-300 to-orange-500",
    base: "h-24 border-amber-400 from-amber-100 to-white dark:from-amber-400/20 dark:to-transparent",
    num: "text-amber-300/80",
    label: "text-amber-600",
  },
  2: {
    avatar: "h-[70px] w-[70px]",
    text: "text-2xl",
    frame: "p-1 from-slate-200 via-slate-300 to-slate-400 shadow-[0_0_26px_rgba(148,163,184,.55)]",
    badge: "from-slate-300 to-slate-500",
    base: "h-16 border-slate-300 from-slate-100 to-white dark:from-slate-400/15 dark:to-transparent",
    num: "text-slate-300",
    label: "text-slate-500",
  },
  3: {
    avatar: "h-[70px] w-[70px]",
    text: "text-2xl",
    frame: "p-1 from-orange-300 via-orange-400 to-orange-600 shadow-[0_0_26px_rgba(251,146,60,.55)]",
    badge: "from-orange-300 to-orange-600",
    base: "h-12 border-orange-400 from-orange-100 to-white dark:from-orange-400/15 dark:to-transparent",
    num: "text-orange-300/80",
    label: "text-orange-600",
  },
};

function Spot({ user, rank, burst, onOpen }) {
  const s = STYLE[rank];
  if (!user) return <div className="flex-1" />;
  const name = nameOf(user);

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <div className="relative flex flex-col items-center">
        {rank === 1 ? (
          <Crown size={34} className="mb-1.5 fill-amber-400 text-amber-500 drop-shadow" />
        ) : (
          <div className="h-[22px]" />
        )}
        <button
          onClick={() => onOpen(user)}
          aria-label={`Xem trang cá nhân ${name}`}
          className="relative transition active:scale-95"
        >
          <span className={`block rounded-full bg-gradient-to-b ${s.frame} ${burst ? "lb-flash" : ""}`}>
            <LbAvatar
              src={user.avatar_url}
              name={name}
              size={s.avatar}
              text={s.text}
              ring="ring-2 ring-white dark:ring-slate-900"
            />
          </span>
          <span
            className={`absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b ${s.badge} text-[15px] font-black text-slate-900 shadow ring-2 ring-white dark:ring-slate-900`}
          >
            {rank}
          </span>
        </button>
        {burst && <Burst key={burst.key} delta={burst.delta} className="left-1/2 top-6 h-0 w-0" />}
      </div>

      <span className={`mt-3 font-mono text-[11px] font-bold uppercase tracking-[0.25em] ${s.label}`}>Top {rank}</span>
      <button onClick={() => onOpen(user)} className="mt-0.5 w-full min-w-0 px-1 transition active:scale-95">
        <span className="block truncate text-center text-[15px] font-extrabold text-slate-900 dark:text-white">{name}</span>
      </button>

      <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-mono text-[13px] font-bold text-amber-600 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300">
        <Coins size={13} strokeWidth={2.6} />
        <span className={burst ? "lb-bump" : ""}>
          <CountUp value={user.coins} />
        </span>
      </span>
      <span className="mt-1 text-[11.5px] text-slate-400">Lv.{user.level || 1}</span>

      <div
        className={`mt-3 flex w-full items-start justify-center rounded-t-[26px] border-t-4 bg-gradient-to-b pt-1 ${s.base}`}
      >
        <span className={`text-[44px] font-black leading-none ${s.num}`}>{rank}</span>
      </div>
    </div>
  );
}

function Podium({ top, bursts, onOpen }) {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-white px-3 pt-7 shadow-sm dark:bg-slate-900">
      {/* Ánh sáng sau top 1 */}
      <div
        className="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full opacity-70"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,.35) 0%, rgba(251,191,36,0) 70%)" }}
      />
      <svg className="lb-float pointer-events-none absolute left-[14%] top-24 text-amber-400" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 1c.6 5.4 3.6 9.4 11 11-7.4 1.6-10.4 5.6-11 11-.6-5.4-3.6-9.4-11-11 7.4-1.6 10.4-5.6 11-11z" />
      </svg>
      <svg className="lb-float pointer-events-none absolute right-[12%] top-16 text-amber-300" style={{ animationDelay: "1s" }} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 1c.6 5.4 3.6 9.4 11 11-7.4 1.6-10.4 5.6-11 11-.6-5.4-3.6-9.4-11-11 7.4-1.6 10.4-5.6 11-11z" />
      </svg>

      <p className="relative mb-4 text-center font-mono text-[12px] font-bold uppercase tracking-[0.3em] text-slate-400">
        Bảng vàng
      </p>
      <div className="relative flex items-end gap-2">
        <Spot user={top[1]} rank={2} burst={top[1] && bursts[top[1].id]} onOpen={onOpen} />
        <Spot user={top[0]} rank={1} burst={top[0] && bursts[top[0].id]} onOpen={onOpen} />
        <Spot user={top[2]} rank={3} burst={top[2] && bursts[top[2].id]} onOpen={onOpen} />
      </div>
    </section>
  );
}

/* ---------- Dòng xếp hạng từ hạng 4 ---------- */
function RankRow({ user, rank, mine, burst, onOpen }) {
  const name = nameOf(user);
  return (
    <button
      onClick={() => onOpen(user)}
      className={`relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition active:scale-[0.99] ${
        mine ? "bg-accent-500/10 ring-1 ring-accent-500/40" : "bg-white dark:bg-slate-900"
      } ${burst ? "lb-flash" : ""}`}
    >
      <span className="w-7 shrink-0 text-center font-mono text-[15px] font-bold text-slate-400">{rank}</span>
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
      <span className="relative shrink-0 text-right">
        <span className="flex items-center justify-end gap-1 text-amber-500">
          <Coins size={14} strokeWidth={2.6} />
          <span className={`text-[15px] font-extrabold ${burst ? "lb-bump" : ""}`}>
            <CountUp value={user.coins} />
          </span>
        </span>
        <span className="block text-[11px] text-slate-400">Coin kiếm được</span>
        {burst && <Burst key={burst.key} delta={burst.delta} className="right-6 top-2 h-0 w-0" />}
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
  const [bursts, setBursts] = useState({}); // { [userId]: { delta, key } }

  const prevCoins = useRef(new Map()); // coin lần tải trước, để biết ai vừa kiếm thêm
  const timers = useRef(new Map());

  const load = useCallback(
    async (silent, isAlive) => {
      if (!silent) setLoading(true);
      try {
        const { data, error } = await supabase.rpc("get_leaderboard", { period: tab, limit_count: 50 });
        if (error) throw error;
        if (!isAlive()) return;
        const list = data || [];

        const fresh = {};
        const next = new Map();
        list.forEach((u) => {
          const coins = Number(u.coins || 0);
          const before = prevCoins.current.get(u.id);
          if (silent && before !== undefined && coins > before) {
            fresh[u.id] = { delta: coins - before, key: `${u.id}-${Date.now()}` };
          }
          next.set(u.id, coins);
        });
        prevCoins.current = next;
        setUsers(list);

        const ids = Object.keys(fresh);
        if (ids.length) {
          setBursts((b) => ({ ...b, ...fresh }));
          ids.forEach((id) => {
            clearTimeout(timers.current.get(id));
            timers.current.set(
              id,
              setTimeout(() => {
                setBursts((b) => {
                  if (b[id]?.key !== fresh[id].key) return b;
                  const { [id]: _drop, ...rest } = b;
                  return rest;
                });
              }, BURST_MS)
            );
          });
        }
      } catch (err) {
        console.error("Load leaderboard error:", err);
        if (!silent && isAlive()) setUsers([]);
      } finally {
        if (!silent && isAlive()) setLoading(false);
      }
    },
    [tab]
  );

  useEffect(() => {
    let alive = true;
    const isAlive = () => alive;
    prevCoins.current = new Map();
    setBursts({});
    load(false, isAlive);

    const id = setInterval(() => {
      if (!document.hidden) load(true, isAlive);
    }, POLL_MS);
    const onVisible = () => {
      if (!document.hidden) load(true, isAlive);
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      alive = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach((h) => clearTimeout(h));
  }, []);

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
      <style>{CSS}</style>
      <TopHeader />

      <main className="mx-auto max-w-md space-y-4 px-4 py-5 md:max-w-3xl">
        {/* Tiêu đề + trạng thái trực tiếp */}
        <div className="px-1">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[13px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Bảng xếp hạng trực tiếp
            </p>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300">
              <span className="lb-live h-2 w-2 rounded-full bg-emerald-500" />
              TRỰC TIẾP
            </span>
          </div>
          <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.15em] text-slate-400">
            {users.length} người kiếm Coin
          </p>
        </div>

        <div className="flex gap-2 px-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full border px-4 py-1.5 font-mono text-[12.5px] font-bold uppercase tracking-[0.12em] transition ${
                tab === t.key
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-300"
                  : "border-transparent bg-white text-slate-500 dark:bg-slate-900"
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
              <div className="relative flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2">
                <Coins size={16} strokeWidth={2.6} />
                <span className={`text-[16px] font-extrabold ${bursts[me.id] ? "lb-bump" : ""}`}>
                  <CountUp value={me.coins} />
                </span>
                {bursts[me.id] && <Burst key={bursts[me.id].key} delta={bursts[me.id].delta} className="left-1/2 top-2 h-0 w-0" />}
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
            <div className="h-80 animate-pulse rounded-[28px] bg-white dark:bg-slate-900" />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[68px] animate-pulse rounded-2xl bg-white dark:bg-slate-900" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-[15px] text-slate-500 dark:bg-slate-900">
            Chưa có ai trên bảng xếp hạng lúc này.
          </div>
        ) : (
          <>
            <Podium top={users} bursts={bursts} onOpen={openUser} />
            {rest.length > 0 && (
              <div className="space-y-2.5">
                {rest.map((u, i) => (
                  <RankRow
                    key={u.id || i}
                    user={u}
                    rank={i + 4}
                    mine={u.id === myId}
                    burst={bursts[u.id]}
                    onOpen={openUser}
                  />
                ))}
              </div>
            )}
            <p className="px-2 text-center text-[12.5px] text-slate-400">
              Xếp hạng theo Coin kiếm được trong {note}. Tự cập nhật liên tục, bấm vào avatar hoặc tên để xem trang cá nhân.
            </p>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
            }
