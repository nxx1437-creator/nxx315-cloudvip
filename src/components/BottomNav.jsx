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
      {/* Nền tối, bo tròn, đổ bóng */}
      <div className="relative mx-auto flex max-w-md items-center justify-between rounded-[28px] bg-[#1A1D21] p-2 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.6)] md:max-w-2xl">
        {tabs.map(({ path, labelKey, icon: Icon }) => {
          const active = pathname === path || pathname.startsWith(path + "/");
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="group flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1 transition active:scale-95"
            >
              <span
                className={`flex h-9 w-12 items-center justify-center rounded-full transition-all duration-200 ${
                  active
                    ? "text-emerald-400" // Màu xanh lá khi active
                    : "text-white/80 group-hover:text-white" // Màu trắng khi không active
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 2} />
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
                
