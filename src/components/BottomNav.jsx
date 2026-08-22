import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, ListChecks, Store, Wallet, User } from "lucide-react";

const TABS = [
  { path: "/dashboard", label: "Trang chủ", icon: Home },
  { path: "/tasks", label: "Nhiệm vụ", icon: ListChecks },
  { path: "/store", label: "Cửa hàng", icon: Store },
  { path: "/wallet", label: "Ví", icon: Wallet },
  { path: "/profile", label: "Tôi", icon: User },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed inset-x-0 bottom-4 z-30 px-4">
      <div className="mx-auto flex max-w-md items-center justify-between rounded-3xl border border-slate-100 bg-white p-2 shadow-lg shadow-slate-200/70">
        {TABS.map(({ path, label, icon: Icon }) => {
          const active = pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-2.5 text-[11px] font-semibold transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/30"
                  : "text-slate-500 hover:text-slate-700"
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
