import React from "react";
import {
  CreditCard, Crosshair, FileText, Flame, Gamepad2, Gift, LayoutDashboard,
  MessageCircle, Bell, Package, Trophy, Users, Wallet,
} from "lucide-react";

export const MENU_GROUPS = [
  {
    id: "main", label: "",
    items: [{ id: "home", label: "Tổng quan", icon: LayoutDashboard }],
  },
  {
    id: "todo", label: "Cần xử lý",
    items: [
      { id: "orders", label: "Đổi thưởng", icon: Gift },
      { id: "game-orders", label: "Đơn game chờ giao", icon: Package },
      { id: "card-orders", label: "Thẻ cào", icon: CreditCard },
      { id: "withdrawals", label: "Rút tiền", icon: Wallet },
      { id: "support", label: "Hỗ trợ", icon: MessageCircle },
      { id: "posts", label: "Bài viết", icon: FileText },
    ],
  },
  {
    id: "game", label: "Lịch sử đơn game",
    items: [
      { id: "roblox-orders", label: "Roblox", icon: Gift },
      { id: "lienquan-orders", label: "Liên Quân", icon: Trophy },
      { id: "playtogether-orders", label: "Play Together", icon: Gamepad2 },
      { id: "pubg-orders", label: "PUBG Mobile", icon: Crosshair },
      { id: "freefire-orders", label: "Free Fire", icon: Flame },
    ],
  },
  {
    id: "manage", label: "Quản lý",
    items: [
      { id: "users", label: "Tài khoản", icon: Users },
      { id: "notify", label: "Gửi thông báo", icon: Bell },
    ],
  },
];

export function NavList({ activeTab, onSelect, badges = {} }) {
  return (
    <div className="space-y-5">
      {MENU_GROUPS.map((group) => (
        <div key={group.id}>
          {group.label && <p className="px-4 pb-2 text-[12px] font-medium text-[#898989]">{group.label}</p>}
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              const n = badges[item.id];
              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={`flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-left text-[14px] font-medium transition ${
                    active ? "bg-[#101010] text-white" : "text-[#242424] hover:bg-[#f4f4f4]"
                  }`}
                >
                  <Icon size={17} strokeWidth={1.8} className={active ? "text-white" : "text-[#6b7280]"} />
                  <span className="flex-1">{item.label}</span>
                  {n > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        active ? "bg-white text-[#101010]" : "bg-[#101010] text-white"
                      }`}
                    >
                      {n}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
