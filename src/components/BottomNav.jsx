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
      <div className="mx-auto flex max-w-md items-stretch rounded-2xl border border-slate-200 bg-white/95 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.28)] backdrop-blur md:max-w-2xl">
        {tabs.map(({ path, labelKey, icon: Icon }) => {
          const active = pathname === path || pathname.startsWith(path + "/");
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="group relative flex flex-1 flex-col items-center gap-1 pb-2 pt-3 transition active:scale-95"
            >
              {active && (
                <span className="absolute inset-x-5 top-0 h-[3px] rounded-b-full bg-emerald-500" />
              )}
              <Icon
                size={22}
                strokeWidth={active ? 2.4 : 2}
                className={
                  active
                    ? "text-emerald-600"
                    : "text-slate-400 transition group-hover:text-slate-600"
                }
              />
              <span
                className={`text-[11px] leading-tight transition ${
                  active ? "font-bold text-emerald-700" : "font-medium text-slate-500"
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
