import React, { useEffect, useState } from "react";
import { ShieldCheck, Package, ListChecks, Users, Loader2, Plus, Trash2, Save, Gift, RefreshCw, CheckCircle2, XCircle, Coins } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";

const TABS = [
  { key: "orders", label: "Đơn hàng", icon: Package, desc: "Quản lý đơn đổi thưởng" },
  { key: "tasks", label: "Nhiệm vụ", icon: ListChecks, desc: "Cấu hình nhiệm vụ" },
  { key: "packages", label: "Gói Robux", icon: Gift, desc: "Quản lý cửa hàng" },
  { key: "users", label: "Người dùng", icon: Users, desc: "Quản lý tài khoản" },
];

export default function Admin() {
  const [tab, setTab] = useState("orders");
  return (
    <div className="min-h-screen bg-[#F0F6FF] pb-16">
      <header className="sticky top-0 z-20 border-b border-blue-100 bg-white/90 px-4 py-4 shadow-sm backdrop-blur-xl md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-lg shadow-blue-500/30"><ShieldCheck size={22} /></div>
            <div><h1 className="text-lg font-extrabold text-slate-900 md:text-xl">Nxx315 Admin Panel</h1><p className="text-xs font-medium text-slate-500">Rewards Management</p></div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-600"><span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" /> System Online</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pt-5 md:px-6 md:pt-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {TABS.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.key} onClick={() => setTab(item.key)} className={`flex min-w-max items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${
                tab === item.key ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-500/30" : "border border-blue-100 bg-white text-slate-600 shadow-sm hover:bg-blue-50"
              }`}>
                <Icon size={20} className={tab === item.key ? "text-white" : "text-blue-500"} />
                <div><div className="text-sm font-bold">{item.label}</div><div className={`text-[11px] ${tab === item.key ? "text-white/80" : "text-slate-400"}`}>{item.desc}</div></div>
              </button>
            );
          })}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-5 md:px-6 md:py-6">
        {tab === "orders" && <OrdersTab />}
        {tab === "tasks" && <TasksTab />}
        {tab === "packages" && <PackagesTab />}
        {tab === "users" && <UsersTab />}
      </main>
    </div>
  );
}

/* ===== ORDERS TAB ===== */
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from("redemption_orders").select("*").eq("status", "processing").order("created_at", { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  // Đánh dấu đã giao
  const handleDelivered = async (order) => {
    setSavingId(order.id);
    await supabase.from("redemption_orders").update({ status: "delivered" }).eq("id", order.id);
    setSavingId(null);
    await fetchOrders();
  };

  // Hủy đơn và hoàn coin
  const handleCancel = async (order) => {
    if (!cancelReason.trim()) {
      alert("Vui lòng nhập lý do hủy đơn!");
      return;
    }
    setSavingId(order.id);
    const { data: user } = await supabase.from("profiles").select("coins").eq("id", order.user_id).single();
    if (user) {
      await supabase.from("profiles").update({ coins: user.coins + order.coins_charged }).eq("id", order.user_id);
    }
    await supabase.from("redemption_orders").update({ status: "cancelled", admin_note: cancelReason }).eq("id", order.id);
    setSavingId(null);
    setCancelReason("");
    await fetchOrders();
  };

  if (loading) return <Loading text="Loading orders..." />;
  if (orders.length === 0) return <EmptyState text="Chưa có đơn hàng chờ xử lý." />;

  return (
    <div className="space-y-4">
      <SectionHeader title="Đơn hàng chờ xử lý" count={`${orders.length} Đơn`} onRefresh={fetchOrders} />
      {orders.map((order) => (
        <div key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold text-slate-900">{order.package_name}</p>
              <p className="mt-1 text-xs text-slate-400">User: {order.target_username || order.roblox_username || "Không rõ"} • ID: {order.id}</p>
              <p className="mt-1 text-xs text-slate-400">Thời gian: {new Date(order.created_at).toLocaleString("vi-VN")}</p>
              {order.receive_method === "discord" && <p className="mt-1 text-xs text-slate-400">Discord: {order.contact_value}</p>}
              {order.receive_method === "zalo" && <p className="mt-1 text-xs text-slate-400">Zalo: {order.contact_value}</p>}
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600">Chờ xử lý</span>
          </div>
          
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex gap-2">
              <button onClick={() => handleDelivered(order)} disabled={savingId === order.id} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-emerald-500 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                {savingId === order.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Đã giao
              </button>
              <button onClick={() => { setCancelReason(""); setSavingId(null); }} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-rose-500 py-2.5 text-sm font-semibold text-white">
                <XCircle size={14} /> Hủy đơn
              </button>
            </div>
            <input type="text" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Nhập lý do hủy đơn..." className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none" />
            {cancelReason && (
              <button onClick={() => handleCancel(order)} className="w-full rounded-full bg-rose-500 py-2 text-sm font-semibold text-white">Xác nhận hủy (Hoàn {order.coins_charged} Coin)</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ===== CÁC TAB KHÁC (Giữ nguyên từ code cũ) ===== */
// ... (Bạn có thể giữ nguyên code các tab khác từ Admin cũ, mình đã rút gọn để tập trung vào đơn hàng)

function SectionHeader({ title, count, onRefresh }) {
  return (
    <div className="flex items-center justify-between">
      <div><h2 className="text-lg font-bold text-slate-900">{title}</h2><p className="text-sm text-slate-400">{count}</p></div>
      <button onClick={onRefresh} className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600"><RefreshCw size={14} /> Refresh</button>
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="py-12 text-center"><p className="text-sm text-slate-400">{text}</p></div>;
}

function Loading({ text }) {
  return <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-slate-400" /><span className="ml-2 text-sm text-slate-400">{text}</span></div>;
    }
