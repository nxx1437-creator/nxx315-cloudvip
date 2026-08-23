import React, { useEffect, useState } from "react";
import { 
  LayoutDashboard, User, ListChecks, Megaphone, Rocket, Gift, 
  Trophy, Store, ShoppingBag, Wallet, CreditCard, FileText, 
  History, Coins, Mail, Download, FileWarning, LifeBuoy, X, LogOut, Search, ChevronDown
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
      { label: "Marketing Video", icon: Megaphone, badge: "HOT", badgeColor: "bg-rose-100 text-rose-500" },
      { label: "Buff MXH Free", icon: Rocket, badge: "FREE", badgeColor: "bg-teal-100 text-teal-600" },
      { path: "/invite", label: "Mời bạn", icon: Gift, badge: "+200", badgeColor: "bg-amber-100 text-amber-600" },
      { label: "Bảng xếp hạng", icon: Trophy, badge: "NEW", badgeColor: "bg-emerald-100 text-emerald-600" },
    ],
  },
  {
    label: "Cửa hàng",
    items: [
      { path: "/store", label: "Chợ", icon: Store, badge: "NEW", badgeColor: "bg-emerald-100 text-emerald-600" },
      { path: "/store", label: "Mua Robux", icon: ShoppingBag, badge: "HOT", badgeColor: "bg-rose-100 text-rose-500" },
      { path: "/store", label: "Cửa hàng", icon: Wallet },
    ],
  },
  {
    label: "Ví & Nạp",
    items: [
      { path: "/wallet", label: "Nạp thẻ", icon: CreditCard, badge: "HOT", badgeColor: "bg-rose-100 text-rose-500" },
      { label: "Đơn hàng", icon: FileText },
      { label: "Lịch sử", icon: History },
      { label: "Lịch sử Coin", icon: Coins },
    ],
  },
  {
    label: "Tiện ích",
    items: [
      { label: "Đọc Mail", icon: Mail, badge: "NEW", badgeColor: "bg-emerald-100 text-emerald-600" },
      { label: "Tải xuống", icon: Download, badge: "FREE", badgeColor: "bg-teal-100 text-teal-600" },
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

export default function Sidebar({ open, onClose, displayName, initial, coins, level }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState(["Tổng quan", "Kiếm Coin", "Cửa hàng", "Ví & Nạp"]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [open]);

  const toggleGroup = (label) => {
    setOpenGroups((prev) => prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]);
  };

  const handleNavigate = (path) => {
    if (path) navigate(path);
    else navigate("/nonexistent-page-404");
    onClose();
  };

  const handleLogout = async () => {
    const { supabase } = await import("../lib/supabaseClient.js");
    await supabase.auth.signOut();
    navigate("/login");
    onClose();
  };

  return (
    <>
      {/* Overlay mờ */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[88%] max-w-[340px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between px-5 pb-6 pt-7">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-2xl font-bold text-white shadow-lg shadow-blue-500/40">
              <span>{initial}</span>
            </div>
            <div>
              <h2 className="font-display text-xl font-extrabold leading-tight text-slate-900">Nxx315 Studio</h2>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">Premium Hub</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute right-5 top-7 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tìm kiếm */}
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-3">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Card số dư */}
        <div className="mx-5 mb-4 rounded-2xl border border-sky-100 bg-gradient-to-b from-sky-50 to-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Số dư khả dụng</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {coins} <span className="text-sm font-medium text-amber-500">Coin</span>
              </p>
              <p className="mt-1 text-[10px] text-slate-400">0 MEME</p>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
              👑 VIP Đồng
            </div>
          </div>
        </div>

        {/* Menu cuộn */}
        <div className="flex-1 overflow-y-auto px-3 pb-6">
          {MENU_GROUPS.map((group) => (
            <div key={group.label} className="mb-2">
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex w-full items-center gap-2 px-3 py-3 text-left"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                <span className="flex-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                  {group.label}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-slate-300 transition-transform ${openGroups.includes(group.label) ? "rotate-180" : ""}`}
                />
              </button>

              {openGroups.includes(group.label) && (
                <div className="space-y-1.5">
                  {group.items.map((item) => {
                    const isActive = item.path && location.pathname === item.path;
                    return (
                      <button
                        key={item.label}
                        onClick={() => handleNavigate(item.path)}
                        className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                          isActive
                            ? "border border-sky-100 bg-sky-50 text-sky-600 shadow-sm"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <item.icon size={20} className={isActive ? "text-sky-500" : "text-slate-400"} />
                        <span className="flex-1 text-[15px] font-medium">{item.label}</span>
                        {item.badge && (
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Đăng xuất */}
        <div className="border-t border-slate-100 bg-white p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-3.5 text-sm font-bold text-rose-500 transition hover:bg-rose-100"
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
                                                                                       }
