import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, ListChecks, Gift, Wallet, User } from "lucide-react";
import { useI18n } from "../i18n/index.js";

const tabs = [
  { path: "/dashboard", labelKey: "nav.home", icon: Home },
  { path: "/tasks", labelKey: "nav.tasks", icon: ListChecks },
  { path: "/store", labelKey: "nav.store", icon: Gift },
  { path: "/wallet", labelKey: "nav.wallet", icon: Wallet },
  { path: "/profile", labelKey: "nav.profile", icon: User },
];

export default function BottomNav() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed inset-x-0 bottom-3 z-30 px-3">
      <div className="mx-auto flex max-w-md items-center justify-between gap-1 border border-slate-200 bg-white/95 p-1.5 shadow-xl shadow-slate-900/10 backdrop-blur md:max-w-2xl">
        {tabs.map(({ path, labelKey, icon: Icon }) => {
          const active = pathname === path || pathname.startsWith(path + "/");
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 transition-all duration-200 ${
                active
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Icon size={19} />
              <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider">
                {t(labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
    }
