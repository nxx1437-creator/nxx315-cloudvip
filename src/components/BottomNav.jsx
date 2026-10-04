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
    <nav
      className="fixed inset-x-0 bottom-3 z-30 px-3"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between rounded-[28px] border border-slate-100 bg-white/95 p-1.5 shadow-[0_12px_40px_-10px_rgba(15,23,42,0.3)] backdrop-blur md:max-w-2xl">
        {tabs.map(({ path, labelKey, icon: Icon }) => {
          const active = pathname === path || pathname.startsWith(path + "/");
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="group flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 transition active:scale-95"
            >
              <span
                className={`flex h-9 w-14 items-center justify-center rounded-full transition-all duration-200 ${
                  active
                    ? "bg-emerald-100 text-emerald-700"
                    : "text-slate-400 group-hover:bg-slate-50 group-hover:text-slate-600"
                }`}
              >
                <Icon size={21} strokeWidth={active ? 2.4 : 2} />
              </span>
              <span
                className={`text-[11px] leading-tight transition ${
                  active
                    ? "font-bold text-emerald-700"
                    : "font-medium text-slate-500"
                }`}
              >
                {t(labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
                }
                
