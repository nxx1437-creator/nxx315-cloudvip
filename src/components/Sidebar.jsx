import React, { useEffect } from "react";
import { 
  LayoutDashboard, User, ListChecks, Megaphone, Rocket, Gift, 
  Trophy, Store, ShoppingBag, Wallet, CreditCard, FileText, 
  History, Coins, Mail, Download, FileWarning, LifeBuoy, X, LogOut, Search
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
      { label: "Mời bạn", icon: Gift, badge: "+200", badgeColor: "bg-amber-100 text-amber-600" },
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
      { label: "Hỗ trợ", icon: LifeBuoy },
    ],
  },
];

export default function Sidebar({ open, onClose, displayName, initial, coins, level }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Khóa cuộn trang khi mở sidebar
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  const handleNavigate = (path) => {
    if (path) {
      navigate(path);
    }
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
      {/* Overlay mờ phía sau */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Sidebar trượt từ trái */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[85%] max-w-[320px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between px-5 pb-4 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-blue-500/30">
              <span className="text-lg font-bold">{initial}</span>
            </div>
            <div>
              <h2 className="font-display text-lg font-bold leading-tight text-slate-900">Nxx315 Studio Rewards</h2>
              <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Premium Hub</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2.5">
            <Search size={15} className="text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Card số dư */}
        <div className="mx-5 mb-4 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Số dư khả dụng</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {coins} <span className="text-sm font-medium text-amber-500">Coin</span>
              </p>
              <p className="text-[10px] text-slate-400">0 MEME</p>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
              <span>👑</span> VIP Đồng
            </div>
          </div>
        </div>

        {/* Menu cuộn */}
        <div className="flex-1 overflow-y-auto px-3 pb-20">
          {MENU_GROUPS.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = item.path && location.pathname === item.path;
                  return (
                    <button
                      key={item.label}
                      onClick={() => handleNavigate(item.path)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                        isActive
                          ? "border border-sky-100 bg-sky-50 text-sky-600"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <item.icon size={18} className={isActive ? "text-sky-500" : "text-slate-400"} />
                      <span className="flex-1 text-sm font-medium">{item.label}</span>
                      {item.badge && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Nút đăng xuất */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-white p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50 py-3 text-sm font-semibold text-rose-500 transition hover:bg-rose-100"
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
      }
