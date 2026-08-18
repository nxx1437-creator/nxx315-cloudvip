import React from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Home,
  ListChecks,
  Store,
  Wallet,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Coins,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";

const LINKS = [
  { path: "/dashboard", label: "Trang chủ", icon: Home },
  { path: "/tasks", label: "Nhiệm vụ", icon: ListChecks },
  { path: "/store", label: "Cửa hàng", icon: Store },
  { path: "/wallet", label: "Ví", icon: Wallet },
  { path: "/me", label: "Tôi", icon: User },
];

const SECONDARY_LINKS = [
  { path: "/settings", label: "Cài đặt", icon: Settings },
  { path: "/help", label: "Trợ giúp", icon: HelpCircle },
];

export default function Sidebar({ open, onClose, displayName, initial, coins, level }) {
  const navigate = useNavigate();

  const go = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
    navigate("/");
  };

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[78%] max-w-xs flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-bold text-white">
              {initial}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{displayName}</p>
              <p className="flex items-center gap-1 text-xs text-slate-500">
                <Coins size={11} className="text-amber-400" /> {coins} Coin · LV {level}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng menu"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Điều hướng
          </p>
          {LINKS.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              onClick={() => go(path)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
            >
              <Icon size={17} />
              {label}
            </button>
          ))}

          <p className="mt-4 px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Khác
          </p>
          {SECONDARY_LINKS.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              onClick={() => go(path)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            <LogOut size={17} />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
        }
