import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  User,
  ListChecks,
  Gift,
  Trophy,
  Store,
  CreditCard,
  FileText,
  History,
  Coins,
  LifeBuoy,
  X,
  LogOut,
  Search,
  FileWarning,
  Bell,
  Home,
  Heart,
  Sparkles,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

import { supabase } from "../lib/supabaseClient.js";

// Menu items — chỉ giữ mục có thật trong app
const MENU_ITEMS = [
  { path: "/dashboard", label: "Trang chính", icon: Home },
  { path: "/tasks", label: "Nhiệm vụ", icon: ListChecks },
  { path: "/store", label: "Cửa hàng", icon: Store, badge: "HOT" },
  { path: "/minigames", label: "Mini Games", icon: Sparkles, badge: "NEW" },
  { path: "/invite", label: "Mời bạn", icon: Gift, badge: "+200" },
  { path: "/wallet", label: "Ví & Nạp thẻ", icon: CreditCard },
  { path: "/history", label: "Lịch sử đơn hàng", icon: History },
  { path: "/feed", label: "Cộng đồng", icon: Heart },
  { path: "/profile", label: "Hồ sơ", icon: User },
  { path: "/support", label: "Hỗ trợ", icon: LifeBuoy },
  { path: "/terms", label: "Điều khoản", icon: FileWarning },
];

// Mục dưới divider — phụ
const EXTRA_ITEMS = [
  { path: "/help", label: "Trung tâm trợ giúp", icon: LifeBuoy },
  { path: "/contact", label: "Liên hệ", icon: Bell },
];
export default function Sidebar({ open, onClose, coins }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Load profile khi mở sidebar
  useEffect(() => {
    if (!open) return;

    let alive = true;

    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (alive) setLoadingProfile(false);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url, coins")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        if (alive) setProfile(data);
      } catch (error) {
        console.error("Load profile error:", error);
      } finally {
        if (alive) setLoadingProfile(false);
      }
    };

    loadProfile();
    return () => {
      alive = false;
    };
  }, [open]);

  // Lock scroll khi mở
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  const handleNavigate = (path) => {
    if (path) navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
    onClose();
  };

  // Thông tin user hiển thị
  const displayName =
    profile?.display_name ||
    profile?.username ||
    "Người dùng";

  const username = profile?.username
    ? `@${profile.username}`
    : "@user";

  const avatarUrl = profile?.avatar_url;

  const initial = (displayName || "U").charAt(0).toUpperCase();

  const finalCoins = Number(profile?.coins ?? coins ?? 0);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[86%] max-w-[330px] flex-col bg-[#0f172a] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header — Avatar + tên */}
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            {/* Avatar */}
            <div className="relative shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-12 w-12 rounded-full border-2 border-white/20 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling.style.display = "flex";
                  }}
                />
              ) : null}

              <div
                className={`h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-lg font-black text-white shadow-lg shadow-blue-500/30 ${
                  avatarUrl ? "hidden" : "flex"
                }`}
              >
                {initial}
              </div>
            </div>

            {/* Info */}
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">
                {loadingProfile ? "Đang tải..." : displayName}
              </p>
              <p className="truncate text-xs text-slate-400">
                {loadingProfile ? "@..." : username}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Balance Card */}
        <div className="px-4 pt-4">
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                <Coins size={18} className="text-amber-400" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Số dư
                </p>
                <p className="mt-0.5 text-lg font-black text-white">
                  {finalCoins.toLocaleString("vi-VN")}
                  <span className="ml-1 text-xs font-bold text-amber-400">
                    Coin
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                navigate("/wallet");
                onClose();
              }}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 py-2.5 text-xs font-black text-white transition hover:brightness-110"
            >
              Nạp Coin
            </button>
          </div>
        </div>

        {/* Menu — main list */}
        <div className="flex-1 overflow-y-auto px-2 pt-4 pb-4">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path &&
              (location.pathname === item.path ||
                location.pathname.startsWith(item.path + "/"));

            return (
              <button
                key={item.label}
                onClick={() => handleNavigate(item.path)}
                className={`group flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-left transition ${
                  isActive
                    ? "bg-sky-500/10 text-sky-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon
                  size={19}
                  className={`shrink-0 ${
                    isActive
                      ? "text-sky-400"
                      : "text-slate-400 group-hover:text-white"
                  }`}
                />

                <span
                  className={`min-w-0 flex-1 truncate text-sm ${
                    isActive ? "font-bold" : "font-medium"
                  }`}
                >
                  {item.label}
                </span>

                {item.badge && (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black ${
                      item.badge === "HOT"
                        ? "bg-rose-500/20 text-rose-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Divider */}
          <div className="my-3 border-t border-white/5" />

          {/* Extra items */}
          {EXTRA_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path &&
              (location.pathname === item.path ||
                location.pathname.startsWith(item.path + "/"));

            return (
              <button
                key={item.label}
                onClick={() => handleNavigate(item.path)}
                className={`group flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-left transition ${
                  isActive
                    ? "bg-sky-500/10 text-sky-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon
                  size={19}
                  className={`shrink-0 ${
                    isActive
                      ? "text-sky-400"
                      : "text-slate-400 group-hover:text-white"
                  }`}
                />

                <span
                  className={`min-w-0 flex-1 truncate text-sm ${
                    isActive ? "font-bold" : "font-medium"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer — Logout */}
        <div className="border-t border-white/5 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500/10 py-3 text-sm font-bold text-rose-400 transition hover:bg-rose-500/20"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
            }
