import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Send, Trophy, Timer, ScrollText, CheckCircle2, ChevronRight, Film } from "lucide-react";
import useProfile from "../../hooks/useProfile.js";
import { Card, Eyebrow, StatusPill, PLATFORMS, getTier } from "../../components/creator/creatorUi.jsx";

const pad = (n) => String(n).padStart(2, "0");

function useMonthEnd() {
  const [left, setLeft] = useState(null);
  useEffect(() => {
    const tick = () => {
      const vn = new Date(Date.now() + 7 * 3600e3);
      const end = Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth() + 1, 1) - 7 * 3600e3;
      const s = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setLeft({
        d: Math.floor(s / 86400),
        h: Math.floor((s % 86400) / 3600),
        m: Math.floor((s % 3600) / 60),
        s: s % 60,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return left;
}

export default function CreatorOverview() {
  const navigate = useNavigate();
  const { ov } = useOutletContext();
  const { profile } = useProfile();
  const left = useMonthEnd();

  const hour = new Date().getHours();
  const greet = hour < 11 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";
  const tier = getTier(ov.approved);
  const vn = new Date(Date.now() + 7 * 3600e3);
  const monthLabel = `THÁNG ${vn.getUTCMonth() + 1} ${vn.getUTCFullYear()}`;
  const hashtags = ov.settings?.hashtags || "#Nxx315Studio";
  const prize = ov.settings?.event_prize_text;

  const rules = [
    "Đăng công khai trên kênh TikTok hoặc YouTube bạn đã liên kết",
    "Giới thiệu rõ website Nxx315 Studio (nxx315.top)",
    "Tiêu đề/mô tả có nội dung thật, không chỉ mỗi hashtag",
    `Gắn hashtag ${hashtags} trong tiêu đề hoặc mô tả`,
  ];

  return (
    <>
      {/* Hero */}
      <Card>
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 font-mono text-[10px] tracking-widest text-cyan-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" /> CREATOR HQ · LIVE
        </span>
        <p className="mt-3 text-sm text-slate-400">{greet}</p>
        <h1 className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-4xl font-extrabold text-transparent">
          {profile?.username || "Creator"}
        </h1>
        <div className="mt-4 space-y-2.5">
          <button
            onClick={() => navigate("/creator/videos")}
            className="flex w-full items-center justify-between rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 py-3 pl-6 pr-3 text-base font-bold text-white"
          >
            Gửi video
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Send size={16} />
            </span>
          </button>
          <button
            onClick={() => navigate("/creator/ranking")}
            className="flex w-full items-center justify-between rounded-full border border-white/15 py-3 pl-5 pr-3 text-base font-semibold text-slate-200"
          >
            <span className="flex items-center gap-2">
              <Trophy size={18} className="text-amber-400" /> Bảng xếp hạng
            </span>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
        </div>
      </Card>

      {/* Hạng */}
      <Card>
        <div className="flex items-center justify-between">
          <Eyebrow className="!text-slate-300">{tier.name}</Eyebrow>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 font-mono text-[10px] tracking-widest text-emerald-300">
            {ov.pending > 0 ? "● ĐANG CHỜ DUYỆT" : "● IDLE"}
          </span>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <Eyebrow>Hạng hiện tại</Eyebrow>
            <p className="mt-1 text-6xl font-black italic text-slate-200">{ov.rank ? `#${ov.rank}` : "—"}</p>
          </div>
          <span className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${tier.cls} text-white shadow-lg`}>
            <Trophy size={34} />
          </span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
          <div>
            <Eyebrow>Điểm tháng này</Eyebrow>
            <p className="mt-1 text-3xl font-extrabold text-cyan-300">{ov.points_month}</p>
          </div>
          <div>
            <Eyebrow>Video tháng này</Eyebrow>
            <p className="mt-1 text-3xl font-extrabold text-white">{ov.month_approved}</p>
          </div>
        </div>
      </Card>

      {/* Sự kiện */}
      <Card>
        <Eyebrow className="flex items-center gap-2 !text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> Sự kiện đang diễn ra
        </Eyebrow>
        <h2 className="mt-1 bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-3xl font-black text-transparent">
          {monthLabel}
        </h2>
        {prize ? (
          <p className="mt-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 font-mono text-xs text-amber-300">
            🏆 {prize}
          </p>
        ) : null}
        <Eyebrow className="mt-4 flex items-center gap-2">
          <Timer size={13} className="text-cyan-400" /> Kết thúc sau
        </Eyebrow>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {left &&
            [
              [left.d, "NGÀY"],
              [left.h, "GIỜ"],
              [left.m, "PHÚT"],
              [left.s, "GIÂY"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-2xl border border-white/10 bg-black/30 py-2.5 text-center">
                <p className="text-2xl font-black text-cyan-300">{pad(v)}</p>
                <p className="font-mono text-[9px] tracking-widest text-slate-500">{l}</p>
              </div>
            ))}
        </div>
      </Card>

      {/* Yêu cầu */}
      <Card>
        <Eyebrow className="flex items-center gap-2">
          <ScrollText size={14} className="text-cyan-400" /> Yêu cầu mỗi video
        </Eyebrow>
        <ul className="mt-3 space-y-2.5">
          {rules.map((r) => (
            <li key={r} className="flex items-start gap-2.5 text-sm text-slate-300">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-400" />
              {r}
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-2xl bg-cyan-400/10 px-4 py-2.5 text-xs text-cyan-200">
          Mỗi video được duyệt nhận 1 code xu do admin gửi.
        </p>
      </Card>

      {/* Video gần đây */}
      <div>
        <div className="mb-2 flex items-center justify-between px-1">
          <Eyebrow>Video gần đây</Eyebrow>
          <button
            onClick={() => navigate("/creator/videos")}
            className="font-mono text-[11px] tracking-widest text-cyan-300"
          >
            XEM TẤT CẢ →
          </button>
        </div>
        {ov.recent.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 px-5 py-8 text-center">
            <Film size={26} className="mx-auto text-slate-500" />
            <p className="mt-2 text-sm font-semibold text-slate-200">Chưa có video. Gửi video đầu tiên nhé!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {ov.recent.map((v) => (
              <div key={v.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0E1626] px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">{PLATFORMS[v.platform]?.name}</p>
                  <p className="truncate text-xs text-slate-500">{v.url}</p>
                </div>
                <StatusPill status={v.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
            }
