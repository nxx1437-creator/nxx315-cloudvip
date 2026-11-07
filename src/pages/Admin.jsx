import React, { useState } from "react";
import { Menu, ShieldCheck, X } from "lucide-react";

import RobloxOrdersTab from "../pages/RobloxOrdersTab";
import LienQuanOrdersTab from "../pages/LienQuanOrdersTab";
import PlayTogetherOrdersTab from "../pages/PlayTogetherOrdersTab";
import FreeFireOrdersTab from "../pages/FreeFireOrdersTab";
import WithdrawalsTab from "../pages/WithdrawalsTab";
import AdminSupportTab from "../pages/AdminSupportTab";
import AdminHome from "../pages/AdminHome";
import AdminOrdersTab from "../pages/AdminOrdersTab";
import AdminGameOrdersTab from "../pages/AdminGameOrdersTab";
import AdminCardOrdersTab from "../pages/AdminCardOrdersTab";
import { UsersTab } from "../pages/AdminUsersTab";
import { PostsTab } from "../pages/AdminContentTabs";
import BroadcastForm from "../components/admin/BroadcastForm";
import { NavList } from "../components/admin/AdminNav";
import usePendingCounts from "../components/admin/usePendingCounts";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [counts, refreshCounts] = usePendingCounts();

  const badges = {
    orders: counts.redeem,
    "game-orders": counts.game,
    "card-orders": counts.cards,
    withdrawals: counts.withdrawals,
    support: counts.tickets,
    posts: counts.posts,
  };
  const totalPending = Object.values(badges).reduce((s, n) => s + (n || 0), 0);

  const go = (tabId) => {
    setActiveTab(tabId);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nav = <NavList activeTab={activeTab} onSelect={go} badges={badges} />;

  const TABS = {
    home: <AdminHome counts={counts} onGo={go} onRefresh={refreshCounts} />,
    orders: <AdminOrdersTab onChanged={refreshCounts} />,
    "game-orders": <AdminGameOrdersTab onChanged={refreshCounts} />,
    "card-orders": <AdminCardOrdersTab onChanged={refreshCounts} />,
    withdrawals: <WithdrawalsTab />,
    support: <AdminSupportTab onChanged={refreshCounts} />,
    posts: <PostsTab />,
    "roblox-orders": <RobloxOrdersTab />,
    "lienquan-orders": <LienQuanOrdersTab />,
    "playtogether-orders": <PlayTogetherOrdersTab />,
    "freefire-orders": <FreeFireOrdersTab />,
    users: <UsersTab />,
    notify: <BroadcastForm />,
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-[#242424]">
      <header className="sticky top-0 z-40 bg-white/95 shadow-[0_1px_0_#e5e7eb] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button onClick={() => go("home")} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#101010] text-white">
              <ShieldCheck size={18} />
            </div>
            <span className="text-[20px] font-semibold tracking-[0.01em]">Admin</span>
          </button>

          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Mở menu"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e7eb] bg-white lg:hidden"
          >
            <Menu size={19} />
            {totalPending > 0 && (
              <span className="absolute -right-1.5 -top-1.5 rounded-full bg-[#101010] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                {totalPending}
              </span>
            )}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-white">
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-[20px] font-semibold tracking-[0.01em]">Menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Đóng menu"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#6b7280] hover:bg-[#f4f4f4]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-6">{nav}</div>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-6xl px-4 py-5">
        <div className="flex gap-6">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-20 rounded-xl bg-white p-3 shadow-[0_1px_5px_-4px_rgba(36,36,36,0.7),0_4px_8px_rgba(36,36,36,0.05)]">
              {nav}
            </div>
          </aside>

          <main className="min-w-0 flex-1">{TABS[activeTab]}</main>
        </div>
      </div>
    </div>
  );
}
