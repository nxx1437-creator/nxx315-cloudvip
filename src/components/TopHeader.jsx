import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Globe,
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
import { Avatar } from "./home/HomeUI.jsx";
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
  const { t, lang, setLang } = useI18n();
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
  const avatarUrl =
    profile?.avatar_url ||
    session?.user?.user_metadata?.avatar_url ||
    session?.user?.user_metadata?.picture ||
    "";
  const [showSearch, setShowSearch] = useState(false);

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

  const iconBtn =
    "flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-white";

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#eefaf7]/90 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between gap-2 px-4 py-3 md:max-w-5xl">
          <button
            onClick={() => navigate("/dashboard")}
            className="shrink-0 text-[22px] font-extrabold leading-none tracking-tight text-slate-900"
          >
            Nxx315 <span className="text-emerald-600">Studio</span>
          </button>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setShowSearch((v) => !v)}
              aria-label="Search"
              className={iconBtn}
            >
              <Search size={22} />
            </button>

            {/* Chuông */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setNotifOpen((prev) => !prev)}
                aria-label="Notifications"
                className={`relative ${iconBtn}`}
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

            {notifOpen && (
              <div className="fixed left-3 right-3 top-[64px] z-50 mx-auto max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
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

            <button
              onClick={() => setLang(lang === "vi" ? "en" : "vi")}
              aria-label="Language"
              className={iconBtn}
            >
              <Globe size={22} />
            </button>

            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Menu"
              className="ml-1.5 rounded-full"
            >
              <Avatar
                src={avatarUrl}
                name={displayName}
                size={40}
                className="ring-2 ring-emerald-200"
              />
            </button>
          </div>
        </div>

        {showSearch && (
          <div ref={searchRef} className="relative mx-auto max-w-md px-4 pb-3 md:max-w-5xl">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-400 focus-within:border-emerald-500">
              <Search size={16} className="shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder={t("hd.searchPh")}
                className="w-full min-w-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
              <button
                onClick={() => {
                  setQuery("");
                  setShowSearch(false);
                }}
                aria-label="Close"
                className="shrink-0 text-slate-400"
              >
                <X size={15} />
              </button>
            </div>

            {searchOpen && query.trim() && (
              <div className="absolute left-4 right-4 top-full -mt-1 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
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
                        onClick={() => {
                          setShowSearch(false);
                          handleSelectResult(item.path);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-emerald-50"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
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
        )}
      </header>

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        displayName={displayName}
        initial={initial}
        avatarUrl={avatarUrl}
        coins={profile?.coins}
        level={lv?.level ?? profile?.level}
      />
    </>
  );
    }
      
