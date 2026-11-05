// src/pages/Leaderboard.jsx — bảng xếp hạng trực tiếp (bấm avatar/tên để xem trang cá nhân)
// - Giao diện theo trang Xếp hạng của web creator: hero chữ gradient, thẻ bo lớn, nhãn mono
// - Tự cập nhật mỗi 8 giây; ai kiếm thêm Coin sẽ có hiệu ứng xu nhảy lên + số đếm tăng dần
// - LbAvatar vẫn được export cho PublicProfile.jsx dùng
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Coins, Crown, Flame } from "lucide-react";

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

/* ---------- Thẻ trắng bo lớn + vạch xanh dưới đáy (như web creator) ---------- */
function Card({ className = "", children }) {
  return (
    <section
      className={`relative overflow-hidden rounded-[32px] bg-white shadow-[0_8px_30px_rgba(15,70,90,.06)] dark:bg-slate-900 ${className}`}
    >
      {children}
      <span className="pointer-events-none absolute inset-x-10 bottom-0 h-[3px] rounded-full bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
    </section>
  );
}

function Pill({ tone = "gray", children }) {
  const tones = {
    green:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300",
    gray: "border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[11.5px] font-bold uppercase tracking-[0.12em] ${tones[tone]}`}
    >
      {children}
    </span>
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
    avatar: "h-[84px] w-[84px]",
    text: "text-3xl",
    frame: "p-[5px] from-amber-300 via-amber-400 to-orange-500 shadow-[0_0_40px_rgba(251,191,36,.55)]",
    badge: "h-8 w-8 text-[15px] from-amber-300 to-orange-500",
    base: "h-20 border-amber-400 from-amber-100 to-white dark:from-amber-400/20 dark:to-transparent",
    num: "text-[40px] text-amber-300/80",
    label: "text-amber-600",
  },
  2: {
    avatar: "h-[58px] w-[58px]",
    text: "text-xl",
    frame: "p-[3px] from-slate-200 via-slate-300 to-slate-400 shadow-[0_0_22px_rgba(148,163,184,.5)]",
    badge: "h-6 w-6 text-[12px] from-slate-300 to-slate-500",
    base: "h-14 border-slate-300 from-slate-100 to-white dark:from-slate-400/15 dark:to-transparent",
    num: "text-[32px] text-slate-300",
    label: "text-slate-500",
  },
  3: {
    avatar: "h-[58px] w-[58px]",
    text: "text-xl",
    frame: "p-[3px] from-orange-300 via-orange-400 to-orange-600 shadow-[0_0_22px_rgba(251,146,60,.5)]",
    badge: "h-6 w-6 text-[12px] from-orange-300 to-orange-600",
    base: "h-10 border-orange-400 from-orange-100 to-white dark:from-orange-400/15 dark:to-transparent",
    num: "text-[28px] text-orange-300/80",
    label: "text-orange-600",
  },
};

function Spot({ user, rank, burst, onOpen }) {
  const s = STYLE[rank];
  if (!user) return <div />;
  const name = nameOf(user);

  return (
    <div className="flex min-w-0 flex-col items-center">
      <div className="relative flex flex-col items-center">
        {rank === 1 && <Crown size={30} className="mb-1 fill-amber-400 text-amber-500 drop-shadow" />}
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
            className={`absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-gradient-to-b font-black text-slate-900 shadow ring-2 ring-white dark:ring-slate-900 ${s.badge}`}
          >
            {rank}
          </span>
        </button>
        {burst && <Burst key={burst.key} delta={burst.delta} className="left-1/2 top-6 h-0 w-0" />}
      </div>

      <span className={`mt-2.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] ${s.label}`}>Top {rank}</span>
      <button onClick={() => onOpen(user)} className="w-full min-w-0 px-1 transition active:scale-95">
        <span className="block truncate text-center text-[13.5px] font-extrabold text-slate-900 dark:text-white">{name}</span>
      </button>

      <span className="mt-1.5 inline-flex max-w-full items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-mono text-[12px] font-bold text-amber-600 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300">
        <Coins size={12} strokeWidth={2.6} className="shrink-0" />
        <span className={`truncate ${burst ? "lb-bump" : ""}`}>
          <CountUp value={user.coins} />
        </span>
      </span>

      <div className={`mt-2.5 flex w-full items-start justify-center rounded-t-[22px] border-t-4 bg-gradient-to-b pt-0.5 ${s.base}`}>
        <span className={`font-black leading-none ${s.num}`}>{rank}</span>
      </div>
    </div>
  );
}

function Podium({ top, bursts, onOpen }) {
  return (
    <Card className="px-3 pb-0 pt-6">
      <div
        className="pointer-events-none absolute left-1/2 top-12 h-64 w-64 -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,.32) 0%, rgba(251,191,36,0) 70%)" }}
      />
      <svg className="lb-float pointer-events-none absolute left-[10%] top-20 text-amber-400" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 1c.6 5.4 3.6 9.4 11 11-7.4 1.6-10.4 5.6-11 11-.6-5.4-3.6-9.4-11-11 7.4-1.6 10.4-5.6 11-11z" />
      </svg>
      <svg className="lb-float pointer-events-none absolute right-[10%] top-14 text-amber-300" style={{ animationDelay: "1s" }} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 1c.6 5.4 3.6 9.4 11 11-7.4 1.6-10.4 5.6-11 11-.6-5.4-3.6-9.4-11-11 7.4-1.6 10.4-5.6 11-11z" />
      </svg>

      <p className="relative mb-5 text-center font-mono text-[12px] font-bold uppercase tracking-[0.3em] text-slate-500">
        Bảng vàng
      </p>
      <div className="relative grid grid-cols-[1fr_1.25fr_1fr] items-end gap-1.5">
        <Spot user={top[1]} rank={2} burst={top[1] && bursts[top[1].id]} onOpen={onOpen} />
        <Spot user={top[0]} rank={1} burst={top[0] && bursts[top[0].id]} onOpen={onOpen} />
        <Spot user={top[2]} rank={3} burst={top[2] && bursts[top[2].id]} onOpen={onOpen} />
      </div>
    </Card>
  );
}

/* ---------- Dòng xếp hạng từ hạng 4 ---------- */
function RankRow({ user, rank, mine, burst, onOpen }) {
  const name = nameOf(user);
  return (
    <button
      onClick={() => onOpen(user)}
      className={`relative flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-left transition active:scale-[0.99] ${
        mine ? "bg-emerald-50 dark:bg-emerald-400/10" : ""
      } ${burst ? "lb-flash" : ""}`}
    >
      <span className="w-7 shrink-0 text-center font-mono text-[15px] font-bold text-slate-400">{rank}</span>
      <LbAvatar src={user.avatar_url} name={name} size="h-11 w-11" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[15px] font-bold text-slate-900 dark:text-white">{name}</span>
          {mine && (
            <span className="shrink-0 rounded-md bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">Bạn</span>
          )}
        </span>
        <span className="block font-mono text-[11.5px] uppercase tracking-wider text-slate-400">Lv.{user.level || 1}</span>
      </span>
      <span className="relative shrink-0">
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300">
          <Coins size={14} strokeWidth={2.6} />
          <span className={`font-mono text-[14px] font-bold ${burst ? "lb-bump" : ""}`}>
            <CountUp value={user.coins} />
          </span>
        </span>
        {burst && <Burst key={burst.key} delta={burst.delta} className="left-1/2 top-3 h-0 w-0" />}
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

  const meta = session?.user?.user_metadata || {};
  const myName = me ? nameOf(me) : meta.full_name || meta.name || session?.user?.email?.split("@")[0] || "Bạn";
  const myAvatar = me?.avatar_url || meta.avatar_url || meta.picture;
  const myBurst = me ? bursts[me.id] : null;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#effbf7_0%,#e6f5fb_100%)] pb-32 dark:bg-slate-950 dark:bg-none">
      <style>{CSS}</style>
      <TopHeader />

      <main className="mx-auto max-w-md space-y-4 px-4 py-5 md:max-w-3xl">
        {/* Hero */}
        <Card className="px-6 pb-6 pt-6">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="green">
              <span className="lb-live h-2 w-2 rounded-full bg-emerald-500" />
              Trực tiếp
            </Pill>
            <Pill>
              <Flame size={14} className="text-orange-500" />
              {users.length} người kiếm coin
            </Pill>
          </div>
          <h1 className="mt-4 bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-[38px] font-black leading-[1.1] tracking-tight text-transparent">
            Bảng xếp hạng
          </h1>
          <p className="mt-2 text-[15.5px] leading-6 text-slate-500">
            Xếp hạng theo Coin kiếm được trong {note}. Tự cập nhật liên tục.
          </p>
          <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-full border px-4 py-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] transition ${
                  tab === t.key
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-300"
                    : "border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Hạng của bạn */}
        {!loading && myId && users.length > 0 && (
          <Card className="px-6 pb-6 pt-6 text-center">
            <div className="relative mx-auto w-fit">
              <LbAvatar
                src={myAvatar}
                name={myName}
                size="h-[76px] w-[76px]"
                text="text-3xl"
                ring="ring-4 ring-emerald-100 dark:ring-emerald-400/20"
              />
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-700 px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-white">
                Lv.{me?.level || 1}
              </span>
            </div>
            <p className="mt-5 font-mono text-[12.5px] font-bold uppercase tracking-[0.18em] text-emerald-600">
              ▸ Hạng của bạn
            </p>
            <p className="mt-1 text-[44px] font-black leading-tight text-slate-800 dark:text-white">
              {me ? `#${myIndex + 1}` : "—"}
            </p>
            <p className="truncate text-[17px] font-bold text-slate-800 dark:text-white">{myName}</p>

            {me ? (
              <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                <p className="font-mono text-[11.5px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  Coin kiếm được
                </p>
                <p className="relative mt-1 inline-flex items-center gap-2 text-[34px] font-black leading-none text-cyan-500">
                  <Coins size={26} strokeWidth={2.6} className="text-amber-500" />
                  <span className={myBurst ? "lb-bump" : ""}>
                    <CountUp value={me.coins} />
                  </span>
                  {myBurst && <Burst key={myBurst.key} delta={myBurst.delta} className="left-1/2 top-3 h-0 w-0" />}
                </p>
              </div>
            ) : (
              <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                <p className="text-[14.5px] leading-6 text-slate-500">
                  Chưa vào top 50. Làm nhiệm vụ để kiếm Coin và lên bảng!
                </p>
                <button
                  onClick={() => navigate("/tasks")}
                  className="mt-3 rounded-full bg-emerald-500 px-6 py-2.5 text-[14px] font-bold text-white"
                >
                  Làm nhiệm vụ
                </button>
              </div>
            )}
          </Card>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="h-80 animate-pulse rounded-[32px] bg-white dark:bg-slate-900" />
            <div className="h-64 animate-pulse rounded-[32px] bg-white dark:bg-slate-900" />
          </div>
        ) : users.length === 0 ? (
          <Card className="p-8 text-center text-[15px] text-slate-500">Chưa có ai trên bảng xếp hạng lúc này.</Card>
        ) : (
          <>
            <Podium top={users} bursts={bursts} onOpen={openUser} />

            {rest.length > 0 && (
              <Card className="px-4 pb-5 pt-5">
                <div className="px-2">
                  <p className="font-mono text-[12.5px] font-bold uppercase tracking-[0.16em] text-slate-700 dark:text-slate-200">
                    Bảng xếp hạng trực tiếp
                  </p>
                  <p className="mt-1 font-mono text-[11.5px] uppercase tracking-[0.12em] text-slate-400">
                    Từ hạng 4 · {note}
                  </p>
                </div>
                <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
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
              </Card>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
