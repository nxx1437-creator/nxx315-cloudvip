import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, ListChecks, Store, Wallet, User } from "lucide-react";

const TABS = [
  { path: "/dashboard", label: "Trang chủ", icon: Home },
  { path: "/tasks", label: "Nhiệm vụ", icon: ListChecks },
  { path: "/store", label: "Đổi quà", icon: Store },
  { path: "/wallet", label: "Ví", icon: Wallet },
  { path: "/profile", label: "Tài khoản", icon: User },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0B1120]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-between px-2 py-3">
        {TABS.map(({ path, label, icon: Icon }) => {
          const active = pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium transition ${
                active
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Icon size={20} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
