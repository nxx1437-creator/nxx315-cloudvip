import React, { useEffect, useState } from "react";
import {
  LayoutGrid,
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
  CheckCircle,
  Megaphone,
  Rocket,
  Trophy,
  FileWarning,
  HelpCircle,
  Search,
  ChevronDown,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

import { supabase } from "../lib/supabaseClient.js";

const SECTIONS = [
  {
    title: "Tổng quan",
    items: [
      { path: "/dashboard", label: "Trang chính", icon: LayoutGrid },
      { path: "/profile", label: "Hồ sơ", icon: User },
    ],
  },
  {
    title: "Kiếm coin",
    items: [
      { path: "/tasks", label: "Nhiệm vụ", icon: CheckCircle },
      {
        path: "/marketing-video",
        label: "Marketing Video",
        icon: Megaphone,
        badge: "HOT",
        badgeType: "hot",
      },
      {
        path: "/buff-mxh",
        label: "Buff MXH Free",
        icon: Rocket,
        badge: "FREE",
        badgeType: "free",
      },
      {
        path: "/invite",
        label: "Mời bạn",
        icon: Gift,
        badge: "+200",
        badgeType: "coin",
      },
    ],
  },
  {
    title: "Mua sắm",
    items: [
      {
        path: "/store",
        label: "Cửa hàng",
        icon: Store,
        badge: "HOT",
        badgeType: "hot",
      },
      { path: "/wallet", label: "Ví & Nạp thẻ", icon: CreditCard },
      { path: "/history", label: "Lịch sử đơn hàng", icon: History },
    ],
  },
  {
    title: "Khác",
    items: [
      { path: "/community", label: "Cộng đồng", icon: Heart },
      { path: "/support", label: "Hỗ trợ", icon: LifeBuoy },
      { path: "/help", label: "Trung tâm trợ giúp", icon: HelpCircle },
      { path: "/terms", label: "Điều khoản", icon: FileWarning },
    ],
  },
];

// Chip trạng thái: HOT hồng / NEW xanh ngọc / FREE xanh lá / +200 vàng
const BADGE_STYLES = {
  hot: "border border-rose-300 bg-rose-100 text-rose-500 shadow-[0_0_14px_rgba(244,63,94,0.38)]",
  new: "border border-cyan-300 bg-cyan-100 text-cyan-500 shadow-[0_0_14px_rgba(6,182,212,0.38)]",
  free: "border border-teal-300 bg-teal-100 text-teal-500 shadow-[0_0_14px_rgba(20,184,166,0.38)]",
  coin: "border border-amber-300 bg-amber-100 text-amber-500 shadow-[0_0_14px_rgba(245,158,11,0.42)]",
};

export default function Sidebar({ open, onClose, coins, meme = 0, vipTier }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [query, setQuery] = useState("");
  const [openSections, setOpenSections] = useState(
    () => new Set(SECTIONS.map((s) => s.title)),
  );

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

        const fallbackUsername = user.email?.split("@")[0] || "user";
        const fallbackDisplayName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          fallbackUsername;
        const fallbackAvatar =
          user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url, coins")
          .eq("id", user.id)
          .maybeSingle();

        if (error) console.warn("Load profile error:", error);

        // ⚠️ Đổi "meme" / "vip_tier" thành tên cột thật trong bảng profiles của bạn
        const { data: extraData } = await supabase
          .from("profiles")
          .select("meme, vip_tier")
          .eq("id", user.id)
          .maybeSingle();

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
            meme: extraData?.meme ?? 0,
            vip_tier: extraData?.vip_tier || "Đồng",
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

  const toggleSection = (title) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

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
  const finalMeme = Number(profile?.meme ?? meme ?? 0);
  const finalVip = profile?.vip_tier || vipTier || "Đồng";

  const q = query.trim().toLowerCase();
  const filteredSections = SECTIONS.map((s) => ({
    ...s,
    items: q
      ? s.items.filter((i) => i.label.toLowerCase().includes(q))
      : s.items,
  })).filter((s) => s.items.length > 0);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-sky-950/25 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[86%] max-w-[330px] flex-col bg-white transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ boxShadow: "12px 0 42px rgba(56,120,190,0.22)" }}
      >
        {/* Header — Avatar + Tên + Nút đóng */}
        <div className="flex items-center justify-between gap-3 px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative shrink-0">
              {loadingProfile ? (
                <div className="h-12 w-12 animate-pulse rounded-full bg-slate-200" />
              ) : (
                <>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-[0_2px_12px_rgba(56,130,246,0.25)]"
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
                    className={`h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-sky-400 to-blue-500 text-lg font-black text-white shadow-[0_2px_12px_rgba(56,130,246,0.3)] ${
                      avatarUrl ? "hidden" : "flex"
                    }`}
                  >
                    {initial}
                  </div>
                </>
              )}
            </div>
            <div className="min-w-0 flex-1">
              {loadingProfile ? (
                <>
                  <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-20 animate-pulse rounded bg-slate-200" />
                </>
              ) : (
                <>
                  <p className="truncate text-[15px] font-bold text-slate-800">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-slate-400">{username}</p>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4">
          <div className="flex h-14 items-center gap-3 rounded-[22px] border border-slate-200 bg-slate-50 px-4 text-slate-500 shadow-[0_3px_12px_rgba(71,85,105,0.10)]">
            <Search
              size={21}
              strokeWidth={2.2}
              className="shrink-0 text-slate-500"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm..."
              className="w-full min-w-0 bg-transparent text-[16px] font-medium text-slate-700 placeholder:text-slate-400 outline-none"
            />
          </div>
        </div>

        {/* Balance Card — Coin + MEME + Huy hiệu VIP */}
        <div className="px-4 pt-5">
          <div className="rounded-[26px] border border-sky-200 bg-gradient-to-br from-blue-100 via-sky-50 to-cyan-100 p-5 shadow-[0_10px_28px_rgba(56,130,246,0.22)]">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Số dư khả dụng
            </p>

            {loadingProfile ? (
              <div className="mt-1.5 h-8 w-32 animate-pulse rounded bg-white/70" />
            ) : (
              <>
                <p className="mt-1 text-4xl font-black text-slate-950">
                  {finalCoins.toLocaleString("vi-VN")}
                  <span className="ml-2 text-base font-extrabold text-amber-500">
                    Coin
                  </span>
                </p>
                <p className="mt-1 text-lg font-extrabold text-teal-500">
                  {finalMeme.toLocaleString("vi-VN")}
                  <span className="ml-1 text-sm">MEME</span>
                </p>
              </>
            )}

            {/* Huy hiệu VIP */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-amber-400/70 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 shadow-[0_4px_14px_rgba(245,158,11,0.25)]">
              <Trophy size={15} className="text-amber-500" />
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-sm font-black text-transparent">
                VIP {finalVip}
              </span>
            </div>
          </div>
        </div>

        {/* Menu — chia nhóm thu gọn được (accordion) */}
        <div className="flex-1 overflow-y-auto px-3 pt-4 pb-4">
          {filteredSections.map((section) => {
            const isOpen = q ? true : openSections.has(section.title);
            return (
              <div key={section.title} className="mb-2">
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex w-full items-center gap-2 px-3 py-3 text-left"
                >
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  <span className="flex-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                    {section.title}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform ${isOpen ? "" : "-rotate-90"}`}
                  />
                </button>

                {isOpen &&
                  section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.path &&
                      (location.pathname === item.path ||
                        location.pathname.startsWith(item.path + "/"));

                    return (
                      <button
                        key={item.label}
                        onClick={() => handleNavigate(item.path)}
                        className={`group relative mb-1 flex w-full items-center gap-4 rounded-[20px] px-3 py-3.5 text-left transition ${
                          isActive
                            ? "border border-blue-300 bg-gradient-to-r from-blue-100 via-sky-50 to-white shadow-[0_7px_22px_rgba(59,130,246,0.25)]"
                            : "border border-transparent hover:bg-slate-50"
                        }`}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-10 w-1.5 -translate-y-1/2 rounded-r-full bg-blue-500" />
                        )}
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                            isActive
                              ? "bg-sky-300 text-white shadow-[0_6px_18px_rgba(56,189,248,0.48)]"
                              : "text-slate-400"
                          }`}
                        >
                          <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                        </span>
                        <span
                          className={`min-w-0 flex-1 truncate text-[16px] ${
                            isActive
                              ? "font-extrabold text-slate-950"
                              : "font-semibold text-slate-600"
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.badge && (
                          <span
                            className={`shrink-0 rounded-2xl px-3 py-1.5 text-[11px] font-black ${
                              BADGE_STYLES[item.badgeType] || BADGE_STYLES.coin
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            );
          })}
        </div>

        {/* Footer — Logout */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-[15px] font-bold text-rose-500 transition hover:bg-rose-50"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
      }
