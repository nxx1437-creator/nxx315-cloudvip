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
      <div className="mx-auto flex max-w-md items-stretch rounded-[28px] border border-emerald-100 bg-white/95 px-1 py-2 shadow-[0_2px_12px_rgba(15,23,42,0.10)] backdrop-blur md:max-w-2xl">
        {tabs.map(({ path, labelKey, icon: Icon }) => {
          const active = pathname === path || pathname.startsWith(path + "/");
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="group flex flex-1 flex-col items-center gap-1.5 py-1.5 transition active:scale-95"
            >
              <Icon
                size={26}
                strokeWidth={active ? 2.2 : 1.8}
                className={active ? "text-emerald-600" : "text-slate-400 transition group-hover:text-slate-600"}
              />
              <span
                className={`text-[10.5px] font-bold uppercase leading-tight tracking-wide transition ${
                  active ? "text-emerald-600" : "text-slate-400"
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
