import React, { useEffect, useState } from "react";
import { ShieldCheck, Package, ListChecks, Users, Loader2, Plus, Trash2, Save, Gift, RefreshCw, CheckCircle2, XCircle, LifeBuoy, Ban, Undo2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";

const TABS = [
  { key: "orders", label: "Đơn hàng", icon: Package, desc: "Quản lý đơn đổi thưởng" },
  { key: "tasks", label: "Nhiệm vụ", icon: ListChecks, desc: "Cấu hình nhiệm vụ" },
  { key: "packages", label: "Gói Robux", icon: Gift, desc: "Quản lý cửa hàng" },
  { key: "users", label: "Người dùng", icon: Users, desc: "Quản lý tài khoản & Ban" },
  { key: "support", label: "Hỗ trợ", icon: LifeBuoy, desc: "Xem yêu cầu hỗ trợ" },
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
        {tab === "support" && <SupportTab />}
      </main>
    </div>
  );
}

/* ===== USERS TAB (Thêm cơ chế Ban) ===== */
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("coins", { ascending: false });
    setUsers(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleBan = async (user) => {
    await supabase.from("profiles").update({ is_banned: true }).eq("id", user.id);
    await fetchUsers();
  };

  const handleUnban = async (user) => {
    await supabase.from("profiles").update({ is_banned: false }).eq("id", user.id);
    await fetchUsers();
  };

  if (loading) return <Loading text="Loading users..." />;
  if (users.length === 0) return <EmptyState text="No users found." />;

  return (
    <div className="space-y-4">
      <SectionHeader title="Người dùng" count={`${users.length} Users`} onRefresh={fetchUsers} />

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">Username</th>
              <th className="px-6 py-4">Level</th>
              <th className="px-6 py-4">Coins</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="transition hover:bg-blue-50/40">
                <td className="px-6 py-4 font-bold text-slate-900">{user.username || "Không tên"}</td>
                <td className="px-6 py-4">Lv.{user.level}</td>
                <td className="px-6 py-4 font-bold text-amber-500">{user.coins}</td>
                <td className="px-6 py-4">
                  {user.is_banned ? (
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600">Bị ban</span>
                  ) : (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">Hoạt động</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {user.is_banned ? (
                    <button onClick={() => handleUnban(user)} className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white">
                      <Undo2 size={12} className="inline mr-1" /> Mở khóa
                    </button>
                  ) : (
                    <button onClick={() => handleBan(user)} className="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white">
                      <Ban size={12} className="inline mr-1" /> Ban
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===== SUPPORT TAB ===== */
function SupportTab() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    setLoading(true);
    const { data } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
    setTickets(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleResolve = async (ticket) => {
    await supabase.from("support_tickets").update({ status: "resolved" }).eq("id", ticket.id);
    await fetchTickets();
  };

  if (loading) return <Loading text="Loading tickets..." />;
  if (tickets.length === 0) return <EmptyState text="Chưa có yêu cầu hỗ trợ nào." />;

  return (
    <div className="space-y-4">
      <SectionHeader title="Yêu cầu hỗ trợ" count={`${tickets.length} Yêu cầu`} onRefresh={fetchTickets} />
      {tickets.map((ticket) => (
        <div key={ticket.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                ticket.status === "pending" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
              }`}>
                {ticket.status === "pending" ? "Chờ xử lý" : "Đã xử lý"}
              </span>
              <p className="mt-2 text-sm font-bold text-slate-900">{ticket.subject}</p>
              <p className="mt-1 text-sm text-slate-600">{ticket.message}</p>
              <p className="mt-1 text-xs text-slate-400">User ID: {ticket.user_id} • {new Date(ticket.created_at).toLocaleString("vi-VN")}</p>
            </div>
            {ticket.status === "pending" && (
              <button onClick={() => handleResolve(ticket)} className="shrink-0 rounded-full bg-emerald-500 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-600">
                Đã xử lý
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ===== ORDERS TAB ===== */
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [drafts, setDrafts] = useState({});

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("redemption_orders").select("*").order("created_at", { ascending: false });
    if (error) { alert(error.message); setOrders([]); } else { setOrders(data ?? []); }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const getDraft = (order) => drafts[order.id] ?? { status: order.status, admin_note: order.admin_note ?? "" };
  const handleSave = async (order) => {
    const draft = getDraft(order);
    setSavingId(order.id);
    const { error } = await supabase.from("redemption_orders").update({ status: draft.status, admin_note: draft.admin_note }).eq("id", order.id);
    setSavingId(null);
    if (error) { alert(error.message); return; }
    await fetchOrders();
    setDrafts((current) => { const next = { ...current }; delete next[order.id]; return next; });
  };

  if (loading) return <Loading text="Loading orders..." />;
  if (orders.length === 0) return <EmptyState text="Chưa có đơn nào." />;

  return (
    <div className="space-y-4">
      <SectionHeader title="Đơn hàng chờ xử lý" count={`${orders.length} Đơn`} onRefresh={fetchOrders} />
      {orders.map((order) => (
        <div key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold text-slate-900">{order.package_name}</p>
              <p className="mt-1 text-xs text-slate-400">User: {order.roblox_username || "Không rõ"} • {new Date(order.created_at).toLocaleString("vi-VN")}</p>
            </div>
            <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600">Chờ xử lý</span>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => { setDrafts((d) => ({ ...d, [order.id]: { ...getDraft(order), status: "delivered" } })); handleSave(order); }} className="flex-1 rounded-full bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600">
              <CheckCircle2 size={14} className="inline mr-1" /> Đã giao
            </button>
            <button onClick={() => { setDrafts((d) => ({ ...d, [order.id]: { ...getDraft(order), status: "cancelled" } })); handleSave(order); }} className="flex-1 rounded-full bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600">
              <XCircle size={14} className="inline mr-1" /> Hủy đơn
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ===== CÁC TAB KHÁC ===== */
function TasksTab() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    const { data } = await supabase.from("tasks").select("*").order("sort_order", { ascending: true });
    setTasks(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);
  if (loading) return <Loading text="Loading tasks..." />;
  if (tasks.length === 0) return <EmptyState text="No tasks found." />;

  return (
    <div className="space-y-4">
      <SectionHeader title="Nhiệm vụ" count={`${tasks.length} Tasks`} onRefresh={fetchTasks} />
      {tasks.map((task) => (
        <div key={task.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">{task.provider}</span>
            <span className="text-xs text-slate-400">Coin: {task.reward_coins}/lượt</span>
          </div>
          <div className="mt-2 flex gap-2">
            <button onClick={() => alert("Chỉnh sửa cài đặt ở phiên bản cũ")} className="flex-1 rounded-full bg-blue-50 py-2 text-sm font-semibold text-blue-600">Cài đặt</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PackagesTab() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPackages = async () => {
    setLoading(true);
    const { data } = await supabase.from("redemption_packages").select("*").order("sort_order", { ascending: true });
    setPackages(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchPackages(); }, []);
  if (loading) return <Loading text="Loading packages..." />;
  if (packages.length === 0) return <EmptyState text="No packages found." />;

  return (
    <div className="space-y-4">
      <SectionHeader title="Gói Robux" count={`${packages.length} Gói`} onRefresh={fetchPackages} />
      {packages.map((pkg) => (
        <div key={pkg.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-bold text-slate-900">{pkg.name}</p>
          <p className="mt-1 text-xs text-slate-400">Giá: {pkg.coin_cost} Coin</p>
          <div className="mt-2 flex gap-2">
            <button onClick={() => alert("Chỉnh sửa cài đặt ở phiên bản cũ")} className="flex-1 rounded-full bg-blue-50 py-2 text-sm font-semibold text-blue-600">Cài đặt</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ===== SHARED ===== */
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
