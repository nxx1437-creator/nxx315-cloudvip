import React, { useState, useEffect, lazy, Suspense } from "react";
import { Menu, ShieldCheck, X } from "lucide-react";

import { NavList } from "../components/admin/AdminNav";
import usePendingCounts from "../components/admin/usePendingCounts";

// ---- Lazy load các tab để giảm bundle size ban đầu ----
const AdminHome = lazy(() => import("../pages/AdminHome"));
const AdminOrdersTab = lazy(() => import("../pages/AdminOrdersTab"));
const AdminGameOrdersTab = lazy(() => import("../pages/AdminGameOrdersTab"));
const AdminCardOrdersTab = lazy(() => import("../pages/AdminCardOrdersTab"));
const WithdrawalsTab = lazy(() => import("../pages/WithdrawalsTab"));
const AdminSupportTab = lazy(() => import("../pages/AdminSupportTab"));
const PostsTab = lazy(() =>
  import("../pages/AdminContentTabs").then((m) => ({ default: m.PostsTab }))
);
const RobloxOrdersTab = lazy(() => import("../pages/RobloxOrdersTab"));
const LienQuanOrdersTab = lazy(() => import("../pages/LienQuanOrdersTab"));
const PlayTogetherOrdersTab = lazy(() => import("../pages/PlayTogetherOrdersTab"));
const FreeFireOrdersTab = lazy(() => import("../pages/FreeFireOrdersTab"));
const UsersTab = lazy(() =>
  import("../pages/AdminUsersTab").then((m) => ({ default: m.UsersTab }))
);
const BroadcastForm = lazy(() => import("../components/admin/BroadcastForm"));

// ---- Fallback khi đang load tab ----
function TabLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e5e7eb] border-t-[#101010]" />
    </div>
  );
}

// ---- Helper đọc/ghi tab từ URL ----
const VALID_TABS = [
  "home", "orders", "game-orders", "card-orders", "withdrawals",
  "support", "posts", "roblox-orders", "lienquan-orders",
  "playtogether-orders", "freefire-orders", "users", "notify",
];

function readTabFromUrl() {
  if (typeof window === "undefined") return "home";
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab");
  return tab && VALID_TABS.includes(tab) ? tab : "home";
}

function writeTabToUrl(tab) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (tab === "home") url.searchParams.delete("tab");
  else url.searchParams.set("tab", tab);
  window.history.replaceState({}, "", url.toString());
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState(readTabFromUrl);
  const [menuOpen, setMenuOpen] = useState(false);
  const [counts = {}, refreshCounts] = usePendingCounts();

  // Badge tổng: KHÔNG tính posts (posts không phải việc "cần xử lý gấp")
  const badges = {
    orders: counts.redeem || 0,
    "game-orders": counts.game || 0,
    "card-orders": counts.cards || 0,
    withdrawals: counts.withdrawals || 0,
    support: counts.tickets || 0,
    posts: counts.posts || 0,
  };
  const totalPending =
    badges.orders +
    badges["game-orders"] +
    badges["card-orders"] +
    badges.withdrawals +
    badges.support;

  // Scroll top sau khi tab đã render
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  // Khóa scroll body khi drawer mở (fix iOS)
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  // Đóng drawer bằng phím Esc
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Sync URL khi tab đổi (hỗ trợ back/forward giữa các tab)
  useEffect(() => {
    writeTabToUrl(activeTab);
  }, [activeTab]);

  // Hỗ trợ back/forward của trình duyệt
  useEffect(() => {
    const onPop = () => setActiveTab(readTabFromUrl());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const go = (tabId) => {
    if (!VALID_TABS.includes(tabId)) tabId = "home";
    setActiveTab(tabId);
    setMenuOpen(false);
  };

  const nav = (
    <NavList activeTab={activeTab} onSelect={go} badges={badges} />
  );

  // Map tab -> element (chỉ render tab đang active, dùng lazy bên trong)
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

  const currentTab = TABS[activeTab] ?? TABS.home;

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-[#242424]">
      <header className="sticky top-0 z-40 bg-white/95 shadow-[0_1px_0_#e5e7eb] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button onClick={() => go("home")} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#101010] text-white">
              <ShieldCheck size={18} />
            </div>
            <span className="text-[20px] font-semibold tracking-[0.01em]">
              Admin
            </span>
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
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-white">
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-[20px] font-semibold tracking-[0.01em]">
                Menu
              </span>
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

          <main className="min-w-0 flex-1">
            <Suspense fallback={<TabLoading />}>{currentTab}</Suspense>
          </main>
        </div>
      </div>
    </div>
  );
    }
