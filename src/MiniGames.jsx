import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Ticket, ArrowLeft, RotateCw, Layers, Dices, ChevronRight, Clock3, Coins } from "lucide-react";

import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

const GAMES = [
  {
    key: "wheel",
    path: "/minigames/wheel",
    title: "Vòng quay may mắn",
    desc: "Quay để nhận Coin ngẫu nhiên, có cơ hội trúng lớn",
    icon: RotateCw,
    color: "from-sky-500 to-blue-600",
    bg: "bg-[#EAF2FE]",
    text: "text-[#3478F6]",
  },
  {
    key: "scratch",
    path: "/minigames/scratch",
    title: "Cào thẻ trúng thưởng",
    desc: "Cào lớp phủ để lộ ra số Coin bên trong",
    icon: Layers,
    color: "from-amber-400 to-orange-500",
    bg: "bg-[#FFF4DB]",
    text: "text-[#B87700]",
  },
  {
    key: "dice",
    path: "/minigames/dice",
    title: "Xúc xắc may mắn",
    desc: "Lắc xúc xắc, mặt càng lớn Coin càng nhiều",
    icon: Dices,
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
];

export default function MiniGames() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile } = useProfile();
  const [history, setHistory] = useState([]);

  const tickets = profile?.game_tickets || 0;

  useEffect(() => {
    if (!session?.user?.id) return;

    supabase
      .from("game_plays")
      .select("*")
      .eq("user_id", session.user.id)
      .order("played_at", { ascending: false })
      .limit(10)
      .then(({ data }) => setHistory(data || []));
  }, [session?.user?.id]);

  const gameLabel = (type) =>
    type === "wheel" ? "Vòng quay" : type === "scratch" ? "Cào thẻ" : "Xúc xắc";

  return (
    <div className="min-h-screen bg-[#F5F7FB] pb-24 text-[#111827]">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[#E5E7EB] bg-white/95 px-4 py-3.5 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#6B7280] hover:bg-[#F5F7FB]">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-[15px] font-bold text-[#111827]">Mini Game</h1>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 py-5">
        <div className="rounded-2xl border border-[#E5E7EB] bg-gradient-to-br from-[#3478F6] to-[#0878C9] p-5 text-white">
          <p className="flex items-center gap-1.5 text-xs font-medium text-white/80">
            <Ticket size={13} /> LƯỢT CHƠI CỦA BẠN
          </p>
          <p className="mt-1.5 text-3xl font-bold">{tickets} lượt</p>
          <p className="mt-1 text-xs text-white/70">
            Hoàn thành nhiệm vụ để nhận thêm lượt chơi miễn phí
          </p>
          <button
            onClick={() => navigate("/tasks")}
            className="mt-3 rounded-xl bg-white/15 px-4 py-2 text-xs font-bold backdrop-blur-sm transition hover:bg-white/25"
          >
            Làm nhiệm vụ ngay →
          </button>
        </div>

        <div className="space-y-3">
          {GAMES.map((game) => {
            const Icon = game.icon;
            return (
              <button
                key={game.key}
                onClick={() => navigate(game.path)}
                className="flex w-full items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 text-left transition hover:border-sky-200"
              >
                <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${game.color} text-white shadow-md`}>
                  <Icon size={24} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#111827]">{game.title}</p>
                  <p className="mt-0.5 text-xs text-[#9CA3AF]">{game.desc}</p>
                </div>
                <ChevronRight size={16} className="shrink-0 text-[#D1D5DB]" />
              </button>
            );
          })}
        </div>

        {history.length > 0 && (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <p className="mb-3 text-sm font-bold text-[#111827]">Lịch sử chơi gần đây</p>
            <div className="space-y-3">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between border-b border-[#F3F4F6] pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F7FB] text-[#9CA3AF]">
                      <Clock3 size={13} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-[#374151]">{gameLabel(h.game_type)}</p>
                      <p className="text-[10px] text-[#9CA3AF]">{new Date(h.played_at).toLocaleString("vi-VN")}</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 text-sm font-bold ${h.reward > 0 ? "text-emerald-600" : "text-[#9CA3AF]"}`}>
                    <Coins size={13} />
                    {h.reward > 0 ? `+${h.reward}` : "0"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
        }
