import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  User,
  ListChecks,
  Gift,
  Trophy,
  Store,
  ShoppingBag,
  Wallet,
  CreditCard,
  FileText,
  History,
  Coins,
  Mail,
  Download,
  FileWarning,
  LifeBuoy,
  X,
  LogOut,
  Search,
  ChevronDown,
  Crown,
  Sparkles,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const MENU_GROUPS = [
  {
    label: "Tổng quan",
    items: [
      { path: "/dashboard", label: "Trang chính", icon: LayoutDashboard },
      { path: "/profile", label: "Hồ sơ", icon: User },
    ],
  },
  {
    label: "Kiếm Coin",
    items: [
      { path: "/tasks", label: "Nhiệm vụ", icon: ListChecks },
      {
        path: "/invite",
        label: "Mời bạn",
        icon: Gift,
        badge: "+200",
        badgeColor: "bg-amber-100 text-amber-600",
      },
      {
        label: "Bảng xếp hạng",
        icon: Trophy,
        badge: "NEW",
        badgeColor: "bg-emerald-100 text-emerald-600",
      },
    ],
  },
  {
    label: "Cửa hàng",
    items: [
      {
        path: "/store",
        label: "Chợ",
        icon: Store,
        badge: "NEW",
        badgeColor: "bg-emerald-100 text-emerald-600",
      },
      {
        path: "/store",
        label: "Mua Robux",
        icon: ShoppingBag,
        badge: "HOT",
        badgeColor: "bg-rose-100 text-rose-500",
      },
      { path: "/store", label: "Cửa hàng", icon: Wallet },
    ],
  },
  {
    label: "Ví & Nạp",
    items: [
      {
        path: "/wallet",
        label: "Nạp thẻ",
        icon: CreditCard,
        badge: "HOT",
        badgeColor: "bg-rose-100 text-rose-500",
      },
      { label: "Đơn hàng", icon: FileText },
      { label: "Lịch sử", icon: History },
      { label: "Lịch sử Coin", icon: Coins },
    ],
  },
  {
    label: "Tiện ích",
    items: [
      {
        label: "Đọc Mail",
        icon: Mail,
        badge: "NEW",
        badgeColor: "bg-emerald-100 text-emerald-600",
      },
      {
        label: "Tải xuống",
        icon: Download,
        badge: "FREE",
        badgeColor: "bg-teal-100 text-teal-600",
      },
    ],
  },
  {
    label: "Hỗ trợ",
    items: [
      { label: "Quy định", icon: FileWarning },
      { path: "/support", label: "Hỗ trợ", icon: LifeBuoy },
    ],
  },
];
export default function Sidebar({
  open,
  onClose,
  displayName,
  initial,
  coins,
  level,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState([
    "Tổng quan",
    "Kiếm Coin",
    "Cửa hàng",
    "Ví & Nạp",
  ]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  const toggleGroup = (label) => {
    setOpenGroups((prev) =>
      prev.includes(label)
        ? prev.filter((g) => g !== label)
        : [...prev, label]
    );
  };

  const handleNavigate = (path) => {
    if (path) navigate(path);
    else navigate("/nonexistent-page-404");
    onClose();
  };

  const handleLogout = async () => {
    const { supabase } = await import("../lib/supabaseClient.js");
    await supabase.auth.signOut();
    navigate("/Landing");
    onClose();
  };

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
        className={`fixed left-0 top-0 z-50 flex h-full w-[86%] max-w-[320px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-lg font-black text-white shadow-md shadow-blue-500/30">
              {initial}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-black leading-tight text-slate-900">
                Nxx315 Studio
              </h2>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Premium Hub
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-sky-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100">
            <Search size={15} className="shrink-0 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Balance Card */}
        <div className="px-4 pt-3">
          <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50/50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Số dư khả dụng
              </p>
              <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-white px-2 py-0.5 text-[10px] font-bold text-amber-600">
                <Crown size={10} />
                VIP Đồng
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">
                {Number(coins || 0).toLocaleString("vi-VN")}
              </span>
              <span className="text-sm font-bold text-amber-500">Coin</span>
            </div>

            <p className="mt-1 text-[10px] font-medium text-slate-400">
              0 MEME
            </p>
          </div>
        </div>

        {/* Menu — scrollable */}
        <div className="flex-1 overflow-y-auto px-3 pt-4 pb-4">
          {MENU_GROUPS.map((group) => {
            const isOpen = openGroups.includes(group.label);

            return (
              <div key={group.label} className="mb-1">
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-slate-50"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                  <span className="flex-1 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {group.label}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`shrink-0 text-slate-300 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Group items */}
                {isOpen && (
                  <div className="mt-1 space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        item.path && location.pathname === item.path;

                      return (
                        <button
                          key={item.label}
                          onClick={() => handleNavigate(item.path)}
                          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                            isActive
                              ? "bg-sky-50 text-sky-600"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                              isActive
                                ? "bg-sky-500 text-white shadow-sm shadow-sky-500/30"
                                : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                            }`}
                          >
                            <Icon size={15} />
                          </div>

                          <span className="min-w-0 flex-1 truncate text-[13px]">
                            {item.label}
                          </span>

                          {item.badge && (
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black ${item.badgeColor}`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-white p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-100"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
  }
                                     
