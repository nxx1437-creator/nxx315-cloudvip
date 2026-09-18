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
  ChevronRight,
  Crown,
  MessageSquare,
  Home,
  Gamepad2,
  Compass,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// Menu phẳng — không chia group
const MENU_ITEMS = [
  { path: "/dashboard", label: "Trang chính", icon: Home },
  { path: "/tasks", label: "Nhiệm vụ", icon: ListChecks },
  { path: "/store", label: "Cửa hàng", icon: Store, badge: "HOT" },
  { path: "/invite", label: "Mời bạn", icon: Gift, badge: "+200" },
  { path: "/profile", label: "Hồ sơ", icon: User },
  { path: "/wallet", label: "Ví & Nạp thẻ", icon: CreditCard },
  { label: "Đơn hàng", icon: FileText, badge: 3 },
  { label: "Lịch sử", icon: History },
  { label: "Lịch sử Coin", icon: Coins },
  { label: "Bảng xếp hạng", icon: Trophy },
  { label: "Đọc Mail", icon: Mail },
  { label: "Tải xuống", icon: Download },
  { label: "Quy định", icon: FileWarning },
  { path: "/support", label: "Hỗ trợ", icon: LifeBuoy },
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

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

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
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Sidebar — dạng tối giống Roblox */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[85%] max-w-[320px] flex-col bg-[#17191f] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header — Avatar + Info */}
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            {/* Avatar */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-lg font-black text-white shadow-lg shadow-blue-500/30">
              {initial}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">
                {displayName || "Người dùng"}
              </p>
              <p className="truncate text-xs text-slate-400">
                <p className="truncate text-xs text-slate-400">
  @{displayName?.toLowerCase().replace(/\s+/g, "") || "user0001"}
</p>
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

        {/* Balance Card — nổi bật */}
        <div className="px-4 pt-4">
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur">
            {/* Số dư */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                <Coins size={18} className="text-amber-400" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Số dư
                </p>
                <p className="mt-0.5 text-lg font-black text-white">
                  {Number(coins || 0).toLocaleString("vi-VN")}
                  <span className="ml-1 text-xs font-bold text-amber-400">
                    Coin
                  </span>
                </p>
              </div>
            </div>

            {/* Nút CTA */}
            <button
              onClick={() => {
                navigate("/wallet");
                onClose();
              }}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-white py-2.5 text-xs font-black text-slate-900 transition hover:bg-slate-100"
            >
              Nạp Coin
            </button>
          </div>
        </div>

        {/* Menu — Flat list */}
        <div className="flex-1 overflow-y-auto px-2 pt-3 pb-4">
          {MENU_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.path && location.pathname === item.path;
            const isLastSection = index === MENU_ITEMS.length - 5;

            return (
              <React.Fragment key={item.label}>
                <button
                  onClick={() => handleNavigate(item.path)}
                  className={`group flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left transition ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon
                    size={20}
                    className={`shrink-0 ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                    }`}
                  />

                  <span
                    className={`min-w-0 flex-1 truncate text-[15px] ${
                      isActive ? "font-bold text-white" : "font-medium"
                    }`}
                  >
                    {item.label}
                  </span>

                  {item.badge && (
                    <span
                      className={`shrink-0 ${
                        typeof item.badge === "number"
                          ? "flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-black text-white"
                          : "rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Divider giữa các nhóm */}
                {isLastSection && (
                  <div className="my-2 border-t border-white/5" />
                )}
              </React.Fragment>
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
