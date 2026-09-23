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
  Flame,
  Trophy,
  Sparkles,
  Check,
} from "lucide-react";

import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import Sidebar from "./Sidebar.jsx";

const SEARCH_INDEX = [
  { label: "Trang chủ", path: "/dashboard", icon: Coins, keywords: "dashboard trang chu home" },
  { label: "Nhiệm vụ", path: "/tasks", icon: ListChecks, keywords: "nhiem vu task kiem coin" },
  { label: "Cửa hàng", path: "/store", icon: ShoppingBag, keywords: "cua hang store doi thuong robux" },
  { label: "Mua hàng kiếm sao", path: "/shop-earn", icon: Coins, keywords: "mua hang kiem sao affiliate hoan tien" },
  { label: "Ví", path: "/wallet", icon: Wallet, keywords: "vi wallet coin" },
  { label: "Cài đặt", path: "/profile", icon: User, keywords: "cai dat settings tai khoan profile" },
  { label: "Kiểm tra tài khoản", path: "/account-review", icon: ShieldCheck, keywords: "flag nghi ngo da tai khoan" },
];

// ✅ Icon map theo loại thông báo
const NOTIF_ICONS = {
  bell: Bell,
  flame: Flame,
  trophy: Trophy,
  sparkles: Sparkles,
};

// ✅ Class màu theo loại thông báo
const NOTIF_COLORS = {
  task_reminder: "bg-rose-100 text-rose-500",
  streak_complete: "bg-amber-100 text-amber-600",
  top_rank: "bg-purple-100 text-purple-600",
};

export default function TopHeader() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile } = useProfile();

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
    "Bạn";
  const initial = displayName.charAt(0).toUpperCase();

  const matches = query.trim()
    ? SEARCH_INDEX.filter((item) =>
        (item.label + " " + item.keywords)
          .toLowerCase()
          .includes(query.trim().toLowerCase())
      )
    : [];

  // ✅ Load notifications + Realtime subscription
  useEffect(() => {
    if (!session?.user?.id) return;

    const loadNotifs = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(15);

      setNotifications(data || []);
      setUnreadCount((data || []).filter((n) => !n.is_read).length);
    };

    loadNotifs();

    // ✅ Realtime: nhận thông báo mới ngay lập tức
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
          setNotifications((prev) => [payload.new, ...prev].slice(0, 15));
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

  // ✅ Mở/đóng dropdown (không tự động mark all as read nữa)
  const handleOpenNotif = () => {
    setNotifOpen((prev) => !prev);
  };

  // ✅ Click vào 1 thông báo → mark as read + điều hướng
  const handleClickNotif = async (notif) => {
    if (!notif.is_read) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    if (notif.action_url) navigate(notif.action_url);
    setNotifOpen(false);
  };

  // ✅ Đọc hết
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

  // ✅ Format thời gian
  const formatTime = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-md md:max-w-5xl items-center gap-2 px-4 py-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="shrink-0 font-[Baloo_2] text-base font-extrabold tracking-tight text-slate-900"
          >
            NXX315 <span className="text-sky-500">Studio</span>
          </button>

          <div ref={searchRef} className="relative min-w-0 flex-1">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-400 shadow-sm">
              <Search size={15} className="shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                placeholder="Tìm trang, tính năng..."
                className="w-full min-w-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")} className="shrink-0 text-slate-300">
                  <X size={13} />
                </button>
              )}
            </div>

            {searchOpen && query.trim() && (
              <div className="absolute left-0 right-0 top-full mt-2 max-h-72 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                {matches.length === 0 ? (
                  <p className="px-3 py-4 text-center text-xs text-slate-400">
                    Không tìm thấy kết quả.
                  </p>
                ) : (
                  matches.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleSelectResult(item.path)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-sky-50"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-500">
                          <Icon size={15} />
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                          {item.label}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* ✅ Nút chuông thông báo */}
          <div ref={notifRef} className="relative shrink-0">
            <button
              onClick={handleOpenNotif}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm"
            >
              <Bell size={16} className="text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-[calc(100vw-32px)] max-w-sm overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
                {/* Header dropdown */}
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Thông báo {unreadCount > 0 && `(${unreadCount})`}
                  </p>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700"
                    >
                      <Check size={11} /> Đọc hết
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell size={28} className="mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-semibold text-slate-500">
                        Chưa có thông báo nào
                      </p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const Icon = NOTIF_ICONS[n.icon] || Bell;
                      const colorClass =
                        NOTIF_COLORS[n.type] || "bg-slate-100 text-slate-500";
                      return (
                        <button
                          key={n.id}
                          onClick={() => handleClickNotif(n)}
                          className={`flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition last:border-0 ${
                            !n.is_read
                              ? "bg-sky-50/50 hover:bg-sky-50"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colorClass}`}
                          >
                            <Icon size={16} strokeWidth={2.4} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-[13px] ${
                                !n.is_read
                                  ? "font-bold text-slate-900"
                                  : "font-semibold text-slate-700"
                              }`}
                            >
                              {n.title}
                            </p>
                            {n.body && (
                              <p className="mt-0.5 text-[11px] leading-5 text-slate-500">
                                {n.body}
                              </p>
                            )}
                            <p className="mt-1 text-[10px] text-slate-400">
                              {formatTime(n.created_at)}
                            </p>
                          </div>
                          {!n.is_read && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-500" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-white hover:shadow-sm"
          >
            <Menu size={19} />
          </button>
        </div>
      </header>

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        displayName={displayName}
        initial={initial}
        coins={profile?.coins}
        level={profile?.level}
      />
    </>
  );
               }
