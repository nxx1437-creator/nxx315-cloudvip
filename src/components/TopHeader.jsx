import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Menu, X, Coins, ShoppingBag, ListChecks, Wallet, User, ShieldCheck } from "lucide-react";

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
    profile?.username || session?.user?.user_metadata?.username || session?.user?.email?.split("@")[0] || "Bạn";
  const initial = displayName.charAt(0).toUpperCase();

  const matches = query.trim()
    ? SEARCH_INDEX.filter((item) =>
        (item.label + " " + item.keywords).toLowerCase().includes(query.trim().toLowerCase())
      )
    : [];

  useEffect(() => {
    if (!session?.user?.id) return;

    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(15)
      .then(({ data }) => {
        setNotifications(data || []);
        setUnreadCount((data || []).filter((n) => !n.is_read).length);
      });
  }, [session?.user?.id]);

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

  const handleOpenNotif = async () => {
    setNotifOpen((prev) => !prev);

    if (unreadCount > 0 && session?.user?.id) {
      await supabase.from("notifications").update({ is_read: true }).eq("user_id", session.user.id).eq("is_read", false);
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-slate-100 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md">
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
                <p className="px-3 py-4 text-center text-xs text-slate-400">Không tìm thấy kết quả.</p>
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
                      <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div ref={notifRef} className="relative shrink-0">
          <button
            onClick={handleOpenNotif}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm"
          >
            <Bell size={16} className="text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 max-h-80 w-72 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
              <p className="px-2 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Thông báo</p>
              {notifications.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-slate-400">Chưa có thông báo nào.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="rounded-xl px-3 py-2.5 hover:bg-slate-50">
                    <p className="text-xs font-bold text-slate-800">{n.title}</p>
                    {n.body && <p className="mt-0.5 text-[11px] text-slate-500">{n.body}</p>}
                    <p className="mt-1 text-[10px] text-slate-300">
                      {new Date(n.created_at).toLocaleString("vi-VN")}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setSidebarOpen(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-white hover:shadow-sm"
        >
          <Menu size={19} />
        </button>
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
