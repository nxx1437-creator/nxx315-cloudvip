import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, ListChecks, Store, Wallet, User } from "lucide-react";

const TABS = [
  { path: "/dashboard", label: "Trang chủ", icon: Home },
  { path: "/tasks", label: "Nhiệm vụ", icon: ListChecks },
  { path: "/store", label: "Cửa hàng", icon: Store },
  { path: "/wallet", label: "Ví", icon: Wallet },
  { path: "/me", label: "Tôi", icon: User },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-between px-2 py-2">
        {TABS.map(({ path, label, icon: Icon }) => {
          const active = pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium transition ${
                active
                  ? "bg-gradient-to-b from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/30"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
