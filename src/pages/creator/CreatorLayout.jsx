import React, { useEffect, useState, useCallback } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Trophy,
  Film,
  Gift,
  Settings,
  ArrowLeft,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";

const TABS = [
  { to: "/creator", end: true, label: "Tổng quan", Icon: LayoutDashboard },
  { to: "/creator/ranking", label: "Xếp hạng", Icon: Trophy },
  { to: "/creator/videos", label: "Video", Icon: Film },
  { to: "/creator/rewards", label: "Thưởng", Icon: Gift },
  { to: "/creator/settings", label: "Cài đặt", Icon: Settings },
];

function LinkBanner({ showButton, onGo }) {
  return (
    <div className="flex items-start gap-3 rounded-3xl border border-amber-400/30 bg-black/60 p-4">
      <AlertTriangle size={22} className="mt-0.5 shrink-0 text-amber-300" />
      <div className="min-w-0 flex-1">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-white">
          Bạn chưa liên kết kênh
        </p>
        <p className="mt-1 font-mono text-[11px] uppercase leading-relaxed tracking-wide text-slate-300">
          Liên kết kênh TikTok hoặc YouTube để bắt đầu gửi video và nhận thưởng.
        </p>
      </div>
      {showButton && (
        <button
          onClick={onGo}
          className="shrink-0 rounded-xl bg-white px-3 py-2 text-xs font-bold text-black"
        >
          Liên kết ngay
        </button>
      )}
    </div>
  );
}

export default function CreatorLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [ov, setOv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [synced, setSynced] = useState(false);

  const reload = useCallback(async () => {
    const { data } = await supabase.rpc("get_creator_overview");
    if (data?.ok) setOv(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Bổ sung ảnh/tên cho các kênh đã liên kết từ trước (chỉ chạy 1 lần)
  useEffect(() => {
    if (!ov || synced) return;
    setSynced(true);
    const missing = (ov.channels || []).some((c) => !c.avatar || !c.name);
    if (missing) {
      supabase.functions
        .invoke("creator-verify", { body: { action: "refresh_channels" } })
        .then(() => reload());
    }
  }, [ov, synced, reload]);

  const linked = (ov?.channels || []).length > 0;
  const onSettings = pathname.startsWith("/creator/settings");

  return (
    <div className="min-h-screen bg-[#070B14] pb-28 font-['Be_Vietnam_Pro',sans-serif] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.12),transparent_55%)]" />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070B14]/90 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3 md:max-w-3xl">
          <button
            onClick={() => navigate("/dashboard")}
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
        ) : !ov ? (
          <div className="py-16 text-center">
            <p className="text-sm text-slate-400">Không tải được dữ liệu.</p>
            <button
              onClick={() => {
                setLoading(true);
                reload();
              }}
              className="mt-3 rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-slate-200"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <>
            {!linked && (
              <LinkBanner showButton={!onSettings} onGo={() => navigate("/creator/settings")} />
            )}
            <Outlet context={{ ov, reload }} />
          </>
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
