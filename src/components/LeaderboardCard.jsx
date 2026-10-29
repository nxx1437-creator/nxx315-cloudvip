import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, ChevronRight } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import { useI18n } from "../i18n/index.js";

const formatCoins = (n) => Number(n || 0).toLocaleString("vi-VN");

const CSS = `
@keyframes lb-twinkle { 0%,100% { opacity:.3; transform:scale(.75) rotate(0deg); } 50% { opacity:1; transform:scale(1.1) rotate(20deg); } }
@keyframes lb-bob { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } }
.lb-twinkle { animation:lb-twinkle 3s ease-in-out infinite; }
.lb-twinkle2 { animation:lb-twinkle 3.8s ease-in-out -1.4s infinite; }
.lb-bob { animation:lb-bob 3.6s ease-in-out infinite; }
`;

const T = {
  vi: { title: "Vinh danh tháng trước", all: "Xem bảng xếp hạng", xu: "xu" },
  en: { title: "Last month's top players", all: "See leaderboard", xu: "coins" },
};

// Màu nền chữ cái đầu khi không có ảnh
const TINTS = ["#7c3aed", "#0ea5e9", "#f97316", "#10b981", "#ec4899", "#6366f1"];

function Pic({ src, name }) {
  const [failed, setFailed] = useState(false);
  const initial = (name || "U").trim().charAt(0).toUpperCase() || "U";
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="h-full w-full rounded-full border-2 border-white bg-white object-cover"
      />
    );
  }
  const tint = TINTS[initial.charCodeAt(0) % TINTS.length];
  return (
    <div
      className="flex h-full w-full items-center justify-center rounded-full border-2 border-white text-3xl font-bold text-white"
      style={{ background: tint }}
    >
      {initial}
    </div>
  );
}

const Spark = ({ className = "", slow = false }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="#f59e0b"
    strokeWidth="1.6"
    strokeLinejoin="round"
    className={`${slow ? "lb-twinkle2" : "lb-twinkle"} pointer-events-none absolute ${className}`}
  >
    <path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" />
  </svg>
);

export default function LeaderboardCard() {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const x = T[lang] || T.vi;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc("get_leaderboard", {
          period: "month",
          limit_count: 2,
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

  if (loading) {
    return (
      <div className="h-72 animate-pulse rounded-[2rem] border border-emerald-100 bg-white/80" />
    );
  }

  if (users.length === 0) return null;

  const top1 = users[0];
  const top2 = users[1];

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-white pt-6 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_2px_8px_-2px_rgba(15,23,42,0.07)]">
      <style>{CSS}</style>

      {/* Ánh sáng vàng sau Top 1 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[27%] top-16 h-64 w-64 -translate-x-1/2"
        style={{
          background:
            "radial-gradient(closest-side,rgba(251,191,36,.38),rgba(251,191,36,.12) 60%,transparent)",
        }}
      />

      <p className="relative text-center font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">
        {x.title}
      </p>
      <button
        onClick={() => navigate("/leaderboard")}
        className="relative mx-auto mt-1.5 flex items-center gap-0.5 text-[12px] font-bold text-emerald-700"
      >
        {x.all} <ChevronRight size={13} />
      </button>

      <div className="relative mt-5 flex items-end justify-center gap-3 px-5">
        {/* ===== TOP 1 ===== */}
        <div className="flex min-w-0 flex-1 flex-col items-center">
          <div className="relative pt-9">
            <Crown
              size={40}
              className="lb-bob absolute left-1/2 top-0 -translate-x-1/2 fill-amber-400 text-amber-500"
            />
            <div className="relative h-[104px] w-[104px] rounded-full bg-gradient-to-br from-amber-300 to-amber-500 p-[5px]">
              <Pic src={top1.avatar_url} name={top1.username} />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-sm font-black text-amber-950 ring-2 ring-white">
              1
            </span>
            <Spark className="-left-5 top-14 h-5 w-5" />
            <Spark className="-right-6 top-10 h-4 w-4" slow />
            <Spark className="-left-3 bottom-2 h-4 w-4" slow />
            <Spark className="-right-4 bottom-8 h-3.5 w-3.5" />
          </div>
          <p className="mt-3 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-amber-600">
            Top 1
          </p>
          <p className="mt-0.5 max-w-full truncate text-[18px] font-extrabold text-slate-900">
            {top1.username}
          </p>
          <span className="mt-2 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 font-mono text-[12.5px] font-bold text-amber-700">
            {formatCoins(top1.coins)} {x.xu}
          </span>
          <div className="mt-4 flex h-24 w-full items-start justify-center rounded-t-[1.75rem] border border-b-0 border-amber-200 bg-gradient-to-b from-amber-100 to-amber-50/30 pt-3 text-[42px] font-black leading-none text-amber-300">
            1
          </div>
        </div>

        {/* ===== TOP 2 ===== */}
        {top2 && (
          <div className="flex min-w-0 flex-1 flex-col items-center">
            <div className="relative">
              <div className="h-[76px] w-[76px] rounded-full bg-gradient-to-br from-slate-200 to-slate-400 p-[4px]">
                <Pic src={top2.avatar_url} name={top2.username} />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-400 text-[13px] font-black text-slate-800 ring-2 ring-white">
                2
              </span>
            </div>
            <p className="mt-3 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500">
              Top 2
            </p>
            <p className="mt-0.5 max-w-full truncate text-[16px] font-extrabold text-slate-900">
              {top2.username}
            </p>
            <span className="mt-2 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-[12px] font-bold text-slate-600">
              {formatCoins(top2.coins)} {x.xu}
            </span>
            <div className="mt-4 flex h-16 w-full items-start justify-center rounded-t-[1.5rem] border border-b-0 border-slate-200 bg-gradient-to-b from-slate-100 to-slate-50/30 pt-2.5 text-[36px] font-black leading-none text-slate-300">
              2
            </div>
          </div>
        )}
      </div>
    </section>
  );
        }

