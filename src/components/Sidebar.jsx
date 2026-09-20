import React, { useEffect, useState } from "react";
import {
  Home,
  ListChecks,
  Store,
  Sparkles,
  Gift,
  CreditCard,
  History,
  Heart,
  User,
  LifeBuoy,
  X,
  LogOut,
  Coins,
  FileWarning,
  HelpCircle,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

import { supabase } from "../lib/supabaseClient.js";

const MENU_ITEMS = [
  { path: "/dashboard", label: "Trang chính", icon: Home },
  { path: "/tasks", label: "Nhiệm vụ", icon: ListChecks },
  {
    path: "/store",
    label: "Cửa hàng",
    icon: Store,
    badge: "HOT",
    badgeType: "hot",
  },
  {
    path: "/minigames",
    label: "Mini Games",
    icon: Sparkles,
    badge: "NEW",
    badgeType: "new",
  },
  {
    path: "/invite",
    label: "Mời bạn",
    icon: Gift,
    badge: "+200",
    badgeType: "coin",
  },
  { path: "/wallet", label: "Ví & Nạp thẻ", icon: CreditCard },
  { path: "/history", label: "Lịch sử đơn hàng", icon: History },
  { path: "/community", label: "Cộng đồng", icon: Heart },
  { path: "/profile", label: "Hồ sơ", icon: User },
  { path: "/support", label: "Hỗ trợ", icon: LifeBuoy },
  { path: "/terms", label: "Điều khoản", icon: FileWarning },
];

const EXTRA_ITEMS = [
  { path: "/help", label: "Trung tâm trợ giúp", icon: HelpCircle },
];
export default function Sidebar({ open, onClose, coins }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

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

        // Fallback từ auth.users
        const fallbackUsername = user.email?.split("@")[0] || "user";

        const fallbackDisplayName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          fallbackUsername;

        const fallbackAvatar =
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          null;

        // Query profile
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url, coins")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.warn("Load profile error:", error);
        }

        // Merge: ưu tiên profile → fallback auth
        if (alive) {
          setProfile({
            id: user.id,
            username: data?.username || fallbackUsername,
            display_name:
              data?.display_name ||
              data?.username ||
              fallbackDisplayName ||
              fallbackUsername,
            avatar_url: data?.avatar_url || fallbackAvatar,
            coins: data?.coins ?? 0,
          });
        }
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

  const displayName =
    profile?.display_name || profile?.username || "Người dùng";

  const username = profile?.username ? `@${profile.username}` : "@user";

  const avatarUrl = profile?.avatar_url;

  const initial = (displayName || "U").charAt(0).toUpperCase();

  const finalCoins = Number(profile?.coins ?? coins ?? 0);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[86%] max-w-[330px] flex-col bg-white transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ boxShadow: "4px 0 24px rgba(0,0,0,0.08)" }}
      >
        {/* Header — Avatar + Tên + Nút đóng */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            {/* Avatar */}
            <div className="relative shrink-0">
              {loadingProfile ? (
                <div className="h-12 w-12 animate-pulse rounded-full bg-slate-200" />
              ) : (
                <>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-12 w-12 rounded-full border border-slate-200 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        if (e.currentTarget.nextElementSibling) {
                          e.currentTarget.nextElementSibling.style.display =
                            "flex";
                        }
                      }}
                    />
                  ) : null}

                  <div
                    className={`h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-lg font-black text-white ${
                      avatarUrl ? "hidden" : "flex"
                    }`}
                  >
                    {initial}
                  </div>
                </>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              {loadingProfile ? (
                <>
                  <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-20 animate-pulse rounded bg-slate-200" />
                </>
              ) : (
                <>
                  <p className="truncate text-[15px] font-bold text-slate-900">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {username}
                  </p>
                </>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Balance Card */}
        <div className="px-4 pt-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                <Coins size={18} className="text-amber-600" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Số dư
                </p>

                {loadingProfile ? (
                  <div className="mt-1.5 h-5 w-32 animate-pulse rounded bg-slate-200" />
                ) : (
                  <p className="mt-0.5 text-lg font-black text-slate-900">
                    {finalCoins.toLocaleString("vi-VN")}
                    <span className="ml-1 text-xs font-bold text-amber-600">
                      Coin
                    </span>
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                navigate("/wallet");
                onClose();
              }}
              className="mt-3 flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 py-2.5 text-xs font-black text-white transition hover:brightness-110"
            >
              Nạp Coin
            </button>
          </div>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto px-2 pt-3 pb-4">
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
                className={`group flex w-full items-center gap-3.5 rounded-lg px-3 py-2.5 text-left transition ${
                  isActive
                    ? "bg-sky-50 text-sky-600"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon
                  size={20}
                  className={`shrink-0 ${
                    isActive
                      ? "text-sky-600"
                      : "text-slate-500 group-hover:text-slate-700"
                  }`}
                  strokeWidth={isActive ? 2.4 : 2}
                />

                <span
                  className={`min-w-0 flex-1 truncate text-[15px] ${
                    isActive ? "font-bold" : "font-medium"
                  }`}
                >
                  {item.label}
                </span>

                {item.badge && (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${
                      item.badgeType === "hot"
                        ? "bg-rose-100 text-rose-600"
                        : item.badgeType === "new"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Divider */}
          <div className="my-3 border-t border-slate-100" />

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
                className={`group flex w-full items-center gap-3.5 rounded-lg px-3 py-2.5 text-left transition ${
                  isActive
                    ? "bg-sky-50 text-sky-600"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon
                  size={20}
                  className={`shrink-0 ${
                    isActive
                      ? "text-sky-600"
                      : "text-slate-500 group-hover:text-slate-700"
                  }`}
                  strokeWidth={isActive ? 2.4 : 2}
                />

                <span
                  className={`min-w-0 flex-1 truncate text-[15px] ${
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
        <div className="border-t border-slate-100 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-100"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
            }
