import React, { useEffect, useState, useCallback } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Trophy, Film, Gift, Settings, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import { Card, Eyebrow, ChannelLinkCard } from "../../components/creator/creatorUi.jsx";

const TABS = [
  { to: "/creator", end: true, label: "Tổng quan", Icon: LayoutDashboard },
  { to: "/creator/ranking", label: "Xếp hạng", Icon: Trophy },
  { to: "/creator/videos", label: "Video", Icon: Film },
  { to: "/creator/rewards", label: "Thưởng", Icon: Gift },
  { to: "/creator/settings", label: "Cài đặt", Icon: Settings },
];

function Onboarding({ ov, reload }) {
  const byPlatform = Object.fromEntries((ov?.channels || []).map((c) => [c.platform, c]));
  return (
    <div className="space-y-4">
      <Card>
        <Eyebrow>▸ Bắt đầu</Eyebrow>
        <h1 className="mt-2 text-2xl font-bold text-white">Liên kết kênh của bạn</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Để gửi video giới thiệu và nhận code xu, bạn cần liên kết ít nhất 1 kênh TikTok hoặc
          YouTube của chính bạn. Mỗi kênh chỉ liên kết được với 1 tài khoản.
        </p>
      </Card>
      <ChannelLinkCard platform="tiktok" channel={byPlatform.tiktok} onChanged={reload} />
      <ChannelLinkCard platform="youtube" channel={byPlatform.youtube} onChanged={reload} />
    </div>
  );
}

export default function CreatorLayout() {
  const navigate = useNavigate();
  const [ov, setOv] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const { data } = await supabase.rpc("get_creator_overview");
    if (data?.ok) setOv(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const linked = (ov?.channels || []).length > 0;

  return (
    <div className="min-h-screen bg-[#070B14] pb-28 font-['Be_Vietnam_Pro',sans-serif] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.12),transparent_55%)]" />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070B14]/90 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3 md:max-w-3xl">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300"
          >
            <ArrowLeft size={14} /> Trang chủ
          </button>
          <span className="text-base font-bold text-white">
            Nxx315 <span className="text-cyan-400">Creator</span>
          </span>
        </div>
      </header>

      <main className="relative mx-auto max-w-md space-y-4 px-4 py-5 md:max-w-3xl">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={24} className="animate-spin text-cyan-400" />
          </div>
        ) : !linked ? (
          <Onboarding ov={ov} reload={reload} />
        ) : (
          <Outlet context={{ ov, reload }} />
        )}
      </main>

      <nav className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-md rounded-3xl border border-white/10 bg-[#0B1322]/95 px-2 py-2 shadow-2xl backdrop-blur md:max-w-xl">
        <div className="grid grid-cols-5">
          {TABS.map(({ to, end, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-semibold uppercase tracking-wide ${
                  isActive ? "bg-cyan-400/10 text-cyan-300" : "text-slate-500"
                }`
              }
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
