import React, { useState } from "react";
import { Menu, Search, Bell, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";

export default function AppHeader() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile } = useProfile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const displayName = profile.username || session?.user?.email?.split("@")[0] || "Bạn";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-slate-100 bg-gradient-to-b from-sky-50/80 to-white/90 px-4 py-3 shadow-sm backdrop-blur-md">
        {/* Nút mở Menu */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-white hover:shadow-sm"
        >
          <Menu size={19} />
        </button>

        {/* Tìm kiếm */}
        <button
          onClick={() => navigate("/tasks")}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-400 shadow-sm"
        >
          <Search size={15} className="shrink-0" />
          <span className="truncate whitespace-nowrap">Tìm kiếm</span>
        </button>

        {/* Chuông */}
        <button className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
          <Bell size={16} className="text-slate-600" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
        </button>

        {/* Ngôn ngữ */}
        <button className="flex h-9 shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 text-sm shadow-sm">
          <Globe size={15} className="text-slate-500" /> 🇻🇳 VI
        </button>

        {/* Avatar */}
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-bold text-white shadow-md shadow-sky-500/30">
          {initial}
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        displayName={displayName}
        initial={initial}
        coins={profile.coins}
        level={profile.level}
      />
    </>
  );
            }
