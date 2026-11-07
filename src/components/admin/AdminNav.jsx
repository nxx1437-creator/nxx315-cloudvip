import React from "react";
import {
  ChevronRight, Package, Users, ListTodo, HandCoins, FileText, Gift, Coins,
  Wallet, Bell, Trophy, Gamepad2, Crosshair, Flame, MessageCircle, CreditCard,
} from "lucide-react";

export const MENU_GROUPS = [
  {
    id: "orders", label: "Đơn hàng", icon: Package,
    items: [
      { id: "orders", label: "Đổi thưởng", icon: Gift },
      { id: "card-orders", label: "Thẻ cào", icon: CreditCard },
      { id: "roblox-orders", label: "Roblox", icon: Gift },
      { id: "lienquan-orders", label: "Liên Quân", icon: Trophy },
      { id: "playtogether-orders", label: "Play Together", icon: Gamepad2 },
      { id: "pubg-orders", label: "PUBG Mobile", icon: Crosshair },
      { id: "freefire-orders", label: "Free Fire", icon: Flame },
    ],
  },
  {
    id: "users", label: "Người dùng", icon: Users,
    items: [
      { id: "users", label: "Tài khoản", icon: Users },
      { id: "support", label: "Hỗ trợ", icon: MessageCircle },
      { id: "affiliate", label: "Affiliate", icon: HandCoins },
      { id: "withdrawals", label: "Rút tiền", icon: Wallet },
    ],
  },
  {
    id: "content", label: "Nội dung", icon: FileText,
    items: [
      { id: "tasks", label: "Nhiệm vụ", icon: ListTodo },
      { id: "packages", label: "Gói nạp", icon: Coins },
      { id: "posts", label: "Bài viết", icon: FileText },
    ],
  },
  {
    id: "notify", label: "Thông báo", icon: Bell,
    items: [{ id: "notify", label: "Gửi thông báo", icon: Bell }],
  },
];

export function NavList({ activeTab, onSelect, openGroups, setOpenGroups, badges = {} }) {
  return (
    <div className="space-y-4">
      {MENU_GROUPS.map((group) => {
        const isOpen = openGroups[group.id];
        return (
          <div key={group.id}>
            <button
              onClick={() => setOpenGroups((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
              className="flex w-full items-center justify-between px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400"
            >
              {group.label}
              <ChevronRight size={14} className={`transition-transform ${isOpen ? "rotate-90" : ""}`} />
            </button>

            {isOpen && (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {group.items.map((item, index) => {
                  const ItemIcon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelect(item.id)}
                      className={`flex w-full items-center gap-3 px-3.5 py-3 text-left text-sm font-medium transition ${
                        index > 0 ? "border-t border-slate-100" : ""
                      } ${isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      <ItemIcon size={17} className={isActive ? "text-white" : "text-slate-400"} />
                      <span className="flex-1">{item.label}</span>
                      {badges[item.id] > 0 && (
                        <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-bold leading-none text-white">
                          {badges[item.id]}
                        </span>
                      )}
                      <ChevronRight size={15} className={isActive ? "text-white/70" : "text-slate-300"} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
      }
