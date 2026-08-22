import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  X, Search, Coins, Crown, LayoutGrid, User, CheckSquare, Trophy,
  Gift, ShoppingBag, Wallet, CreditCard, LogOut, ChevronDown,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";

/**
 * Sidebar.jsx
 * -----------------------------------------------------------------
 * Menu trượt ra từ trái. Giữ nguyên interface props cũ để không phải
 * sửa chỗ gọi ở Dashboard.jsx / Tasks.jsx:
 *   <Sidebar open={..} onClose={..} displayName={..} initial={..} coins={..} level={..} />
 *
 * Mục nào CHƯA có trang thật trong app (Bảng xếp hạng, Nạp thẻ...)
 * sẽ hiện toast "Sắp ra mắt" thay vì dẫn tới link lỗi.
 * -----------------------------------------------------------------
 */
export default function Sidebar({ open, onClose, displayName, initial, coins = 0, level = 1 }) {
  const navigate = useNavigate();
  const [comingSoon, setComingSoon] = useState(null);

  if (!open) return null;

  const handleComingSoon = (label) => {
    setComingSoon(label);
    setTimeout(() => setComingSoon(null), 1800);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose?.();
    navigate("/login");
  };

  const NAV_GROUPS = [
    {
      title: "Tổng quan",
      items: [
        { icon: LayoutGrid, label: "Trang chính", to: "/dashboard" },
        { icon: User, label: "Hồ sơ", soon: true },
      ],
    },
    {
      title: "Kiếm Coin",
      items: [
        { icon: CheckSquare, label: "Nhiệm vụ", to: "/tasks" },
        { icon: Trophy, label: "Bảng xếp hạng", badge: "MỚI", badgeCls: "bg-emerald-100 text-emerald-600", soon: true },
        { icon: Gift, label: "Mời bạn", badge: "+200", badgeCls: "bg-amber-100 text-amber-600", soon: true },
      ],
    },
    {
      title: "Cửa hàng",
      items: [
        { icon: ShoppingBag, label: "Đổi Robux", badge: "HOT", badgeCls: "bg-rose-100 text-rose-600", to: "/store" },
      ],
    },
    {
      title: "Ví & Nạp",
      items: [
        { icon: Wallet, label: "Ví của tôi", soon: true },
        { icon: CreditCard, label: "Nạp thẻ", badge: "HOT", badgeCls: "bg-rose-100 text-rose-600", soon: true },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Nền mờ phía sau */}
      <div className="flex-1 bg-black/40 backdrop-blur-[2px] transition-opacity" onClick={onClose} />

      {/* Panel menu */}
      <div className="flex w-[84%] max-w-xs flex-col bg-white shadow-2xl animate-[slideIn_0.22s_ease-out]">
        <style>{`
          @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        `}</style>

        {/* Header thương hiệu */}
        <div className="flex items-center justify-between px-4 pt-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-md shadow-sky-500/30">
              <Coins size={18} className="text-white" />
            </span>
            <div>
              <p className="text-sm font-extrabold leading-tight text-slate-900">Nxx315 Studio</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-500">Rewards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 active:scale-90"
          >
            <X size={18} />
          </button>
        </div>

        {/* Ô tìm kiếm (trang trí, chưa có tính năng lọc) */}
        <div className="mt-4 px-4">
          <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-3.5 py-2.5">
            <Search size={16} className="text-slate-400" />
            <input
              disabled
              placeholder="Tìm kiếm..."
              className="w-full bg-transparent text-sm text-slate-400 outline-none"
            />
          </div>
        </div>

        {/* Thẻ số dư */}
        <div className="mx-4 mt-3 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Số dư khả dụng</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">
            {coins.toLocaleString("vi-VN")} <span className="text-base font-bold text-amber-500">Coin</span>
          </p>
          <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-600">
            <Crown size={12} /> Level {level}
          </span>
        </div>

        {/* Danh sách menu — cuộn được */}
        <div className="mt-2 flex-1 overflow-y-auto px-2 pb-2">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="mt-3">
              <div className="flex items-center justify-between px-3 py-1">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{group.title}</p>
                <ChevronDown size={13} className="text-slate-300" />
              </div>
              {group.items.map((item) => {
                const content = (
                  <>
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition group-hover:bg-sky-50 group-hover:text-sky-600">
                      <item.icon size={17} />
                    </span>
                    <span className="flex-1 text-sm font-semibold text-slate-700">{item.label}</span>
                    {item.badge && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.badgeCls}`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                );

                const rowCls =
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 active:scale-[0.97] hover:bg-sky-50/70";

                return item.soon ? (
                  <button key={item.label} onClick={() => handleComingSoon(item.label)} className={`${rowCls} w-full text-left`}>
                    {content}
                  </button>
                ) : (
                  <Link key={item.label} to={item.to} onClick={onClose} className={rowCls}>
                    {content}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Toast "sắp ra mắt" */}
        {comingSoon && (
          <div className="mx-4 mb-2 animate-[fadeIn_0.15s_ease-out] rounded-xl bg-slate-900 px-3.5 py-2 text-center text-xs font-medium text-white">
            "{comingSoon}" sắp ra mắt nhé 🚀
          </div>
        )}

        {/* Đăng xuất */}
        <div className="border-t border-slate-100 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-rose-500 transition-all duration-150 hover:bg-rose-50 active:scale-[0.97]"
          >
            <LogOut size={17} /> Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
        }
                          
