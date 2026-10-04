import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Menu,
  X,
  Coins,
  ShoppingBag,
  ListChecks,
  Wallet,
  User,
  ShieldCheck,
} from "lucide-react";

import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import useLevelProgress from "../hooks/useLevelProgress.js";
import { supabase } from "../lib/supabaseClient.js";
import Sidebar from "./Sidebar.jsx";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import { useI18n } from "../i18n/index.js";

// label: khoá dịch; keywords: từ khoá tìm kiếm (không dấu + tiếng Anh)
const SEARCH_INDEX = [
  { labelKey: "nav.home", path: "/dashboard", icon: Coins, keywords: "dashboard trang chu home" },
  { labelKey: "nav.tasks", path: "/tasks", icon: ListChecks, keywords: "nhiem vu task tasks kiem coin earn" },
  { labelKey: "nav.store", path: "/store", icon: ShoppingBag, keywords: "cua hang store shop doi thuong redeem robux" },
  { labelKey: "nav.shopEarn", path: "/shop-earn", icon: Coins, keywords: "mua hang kiem sao affiliate hoan tien cashback stars" },
  { labelKey: "nav.wallet", path: "/wallet", icon: Wallet, keywords: "vi wallet coin" },
  { labelKey: "nav.settings", path: "/profile", icon: User, keywords: "cai dat settings tai khoan profile account" },
  { labelKey: "nav.review", path: "/account-review", icon: ShieldCheck, keywords: "flag nghi ngo da tai khoan review" },
];

export default function TopHeader() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile } = useProfile();
  const { data: lv } = useLevelProgress(session?.user?.id);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const searchRef = useRef(null);
  const notifRef = useRef(null);

  const displayName =
    profile?.username ||
    session?.user?.user_metadata?.username ||
    session?.user?.email?.split("@")[0] ||
    t("dash.fallbackName");
  const initial = displayName.charAt(0).toUpperCase();

  const q = query.trim().toLowerCase();
  const matches = q
    ? SEARCH_INDEX.filter((item) =>
        (t(item.labelKey) + " " + item.keywords).toLowerCase().includes(q)
      )
    : [];

  // Load notifications + Realtime
  useEffect(() => {
    if (!session?.user?.id) return;

    const loadNotifs = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setNotifications(data || []);
      setUnreadCount((data || []).filter((n) => !n.is_read).length);
    };

    loadNotifs();

    const channel = supabase
      .channel(`notifications-${session.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev].slice(0, 10));
          setUnreadCount((c) => c + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleSelectResult = (path) => {
    setQuery("");
    setSearchOpen(false);
    navigate(path);
  };

  const handleMarkAllAsRead = async () => {
    if (!session?.user?.id) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", session.user.id)
      .eq("is_read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleClickNotif = async (notif) => {
    if (!notif.is_read) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    if (notif.action_url) navigate(notif.action_url);
    setNotifOpen(false);
  };

  const formatTime = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return t("dash2.agoNow");
    if (diff < 3600) return t("dash2.agoMin", { n: Math.floor(diff / 60) });
    if (diff < 86400) return t("dash2.agoHour", { n: Math.floor(diff / 3600) });
    if (diff < 604800) return t("dash2.agoDay", { n: Math.floor(diff / 86400) });
    return new Date(dateStr).toLocaleDateString(lang === "en" ? "en-US" : "vi-VN");
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-2 px-3 py-2.5 md:max-w-5xl">
          <button
            onClick={() => navigate("/dashboard")}
            className="shrink-0 text-[15px] font-black leading-none tracking-tight text-slate-900"
          >
            Nxx315 <span className="text-emerald-600">Studio</span>
          </button>

          <div ref={searchRef} className="relative min-w-0 flex-1">
            <div className="flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400 transition focus-within:border-emerald-500">
              <Search size={15} className="shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                placeholder={t("hd.searchPh")}
                className="w-full min-w-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="shrink-0 text-slate-300"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {searchOpen && query.trim() && (
              <div className="absolute left-0 right-0 top-full mt-2 max-h-72 overflow-y-auto border border-slate-200 bg-white p-1.5 shadow-xl">
                {matches.length === 0 ? (
                  <p className="px-3 py-4 text-center text-xs text-slate-400">
                    {t("hd.noResult")}
                  </p>
                ) : (
                  matches.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleSelectResult(item.path)}
                        className="flex w-full items-center gap-3 px-2.5 py-2.5 text-left transition hover:bg-emerald-50"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-emerald-50 text-emerald-600">
                          <Icon size={15} />
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                          {t(item.labelKey)}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Nút chuông */}
          <div ref={notifRef} className="relative shrink-0">
            <button
              onClick={() => setNotifOpen((prev) => !prev)}
              className="relative flex h-9 w-9 items-center justify-center border border-slate-200 bg-white transition hover:border-emerald-500"
            >
              <Bell size={16} className="text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center bg-rose-500 px-1 text-[9px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="fixed left-3 right-3 top-[60px] z-50 mx-auto max-w-sm overflow-hidden border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Bell size={15} className="text-emerald-700" />
                    <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.15em] text-slate-900">
                      {t("hd.notif")}
                    </h3>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      {t("hd.markAll")}
                    </button>
                  )}
                </div>

                <div className="max-h-[360px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell size={26} className="mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-semibold text-slate-500">
                        {t("hd.notifEmpty")}
                      </p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleClickNotif(n)}
                        className={`flex w-full items-start justify-between gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition last:border-0 ${
                          !n.is_read
                            ? "bg-emerald-50/50 hover:bg-emerald-50"
                            : "bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-[13px] leading-5 ${
                              !n.is_read
                                ? "font-bold text-slate-900"
                                : "font-semibold text-slate-700"
                            }`}
                          >
                            {n.title}
                          </p>
                          {n.body && (
                            <p className="mt-0.5 text-[11.5px] leading-5 text-slate-500">
                              {n.body}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 pt-0.5 font-mono text-[10px] text-slate-400">
                          {formatTime(n.created_at)}
                        </span>
                      </button>
                    ))
                  )}
                </div>

                <button
                  onClick={() => {
                    setNotifOpen(false);
                    navigate("/notifications");
                  }}
                  className="flex w-full items-center justify-center border-t border-slate-100 bg-white px-4 py-3 text-[12.5px] font-bold text-emerald-700 transition hover:bg-emerald-50"
                >
                  {t("hd.viewAll")}
                </button>
              </div>
            )}
          </div>

          {/* Đổi ngôn ngữ (gọn) */}
          <div className="shrink-0">
            <LanguageSwitcher compact />
          </div>

          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center text-slate-600 transition hover:bg-slate-50"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        displayName={displayName}
        initial={initial}
        coins={profile?.coins}
        level={lv?.level ?? profile?.level}
      />
    </>
  );
}
