import React, { useState } from "react";
import { ChevronRight, Menu, ShieldCheck, X } from "lucide-react";

import RobloxOrdersTab from "../pages/RobloxOrdersTab";
import LienQuanOrdersTab from "../pages/LienQuanOrdersTab";
import PlayTogetherOrdersTab from "../pages/PlayTogetherOrdersTab";
import PubgOrdersTab from "../pages/PubgOrdersTab";
import FreeFireOrdersTab from "../pages/FreeFireOrdersTab";
import WithdrawalsTab from "../pages/WithdrawalsTab";
import AdminSupportTab from "../pages/AdminSupportTab";
import AdminCardOrdersTab from "../pages/AdminCardOrdersTab";
import AdminOrdersTab from "../pages/AdminOrdersTab";
import { UsersTab, AffiliateTab } from "../pages/AdminUsersTab";
import { TasksTab, PackagesTab, PostsTab } from "../pages/AdminContentTabs";
import BroadcastForm from "../components/admin/BroadcastForm";
import { MENU_GROUPS, NavList } from "../components/admin/AdminNav";
import usePendingCounts from "../components/admin/usePendingCounts";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("orders");
  const [menuOpen, setMenuOpen] = useState(false);
  const [counts, refreshCounts] = usePendingCounts();
  const [openGroups, setOpenGroups] = useState(() =>
    Object.fromEntries(MENU_GROUPS.map((g) => [g.id, true]))
  );

  const activeItem = MENU_GROUPS.flatMap((g) => g.items).find((i) => i.id === activeTab);

  const badges = { orders: counts.redeem, support: counts.tickets, "card-orders": counts.cards };
  const totalPending = (counts.redeem || 0) + (counts.tickets || 0) + (counts.cards || 0);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nav = (
    <NavList
      activeTab={activeTab}
      onSelect={handleSelectTab}
      openGroups={openGroups}
      setOpenGroups={setOpenGroups}
      badges={badges}
    />
  );

  const TABS = {
    orders: <AdminOrdersTab />,
    "card-orders": <AdminCardOrdersTab onChanged={refreshCounts} />,
    "roblox-orders": <RobloxOrdersTab />,
    "lienquan-orders": <LienQuanOrdersTab />,
    "playtogether-orders": <PlayTogetherOrdersTab />,
    "pubg-orders": <PubgOrdersTab />,
    "freefire-orders": <FreeFireOrdersTab />,
    tasks: <TasksTab />,
    packages: <PackagesTab />,
    users: <UsersTab />,
    support: <AdminSupportTab onChanged={refreshCounts} />,
    affiliate: <AffiliateTab />,
    posts: <PostsTab />,
    notify: <BroadcastForm />,
    withdrawals: <WithdrawalsTab />,
  };

  return (
    <div className="min-h-screen bg-[#eef0f2]">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
              <ShieldCheck size={20} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold leading-tight text-slate-900">Admin</h1>
              <p className="truncate text-xs text-slate-500">Quản lý CloudVIP</p>
            </div>
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Mở menu"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50 lg:hidden"
          >
            <Menu size={20} />
            {totalPending > 0 && (
              <span className="absolute -right-1.5 -top-1.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                {totalPending}
              </span>
            )}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5">
              <span className="text-base font-semibold text-slate-900">Menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Đóng menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">{nav}</div>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-6xl px-4 py-5">
        <div className="flex gap-6">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-3">{nav}</div>
          </aside>

          <main className="min-w-0 flex-1 space-y-5">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Admin</span>
              <ChevronRight size={14} />
              <span className="font-semibold text-slate-800">{activeItem?.label}</span>
            </div>

            <div className="w-full">{TABS[activeTab]}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
