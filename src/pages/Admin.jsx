import React, { useEffect, useState } from "react";
import {
  ShieldCheck, Package, ListChecks, Users, Loader2, Plus, Trash2, Save, Gift
} from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";

const TABS = [
  { key: "orders", label: "Orders", icon: Package, desc: "Manage rewards" },
  { key: "tasks", label: "Tasks", icon: ListChecks, desc: "Config tasks" },
  { key: "packages", label: "Packages", icon: Gift, desc: "Store items" },
  { key: "users", label: "Users", icon: Users, desc: "Manage accounts" },
];

export default function Admin() {
  const [tab, setTab] = useState("orders");

  return (
    <div className="min-h-screen bg-[#F0F6FF] pb-16">
      <header className="sticky top-0 z-10 border-b border-blue-100 bg-white/90 px-6 py-4 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-lg shadow-blue-500/30">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Nxx315 Admin Panel</h1>
              <p className="text-xs font-medium text-slate-500">Rewards Management</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-600">
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500"></span> System Online
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 pt-6">
        <div className="flex flex-wrap gap-3">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200 ${
                tab === t.key
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                  : "bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-blue-100 shadow-sm"
              }`}
            >
              <t.icon size={20} className={tab === t.key ? "text-white" : "text-blue-500"} />
              <div>
                <div className="text-sm font-bold">{t.label}</div>
                <div className={`text-[11px] ${tab === t.key ? "text-white/80" : "text-slate-400"}`}>{t.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-blue-50">
          {tab === "orders" && <OrdersTab />}
          {tab === "tasks" && <TasksTab />}
          {tab === "packages" && <PackagesTab />}
          {tab === "users" && <UsersTab />}
        </div>
      </main>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [drafts, setDrafts] = useState({});

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("redemption_orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const getDraft = (o) => drafts[o.id] ?? { status: o.status, admin_note: o.admin_note ?? "" };

  const handleSave = async (order) => {
    const draft = getDraft(order);
    setSavingId(order.id);
    const { error } = await supabase
      .from("redemption_orders")
      .update({ status: draft.status, admin_note: draft.admin_note })
      .eq("id", order.id);
    setSavingId(null);
    if (error) { alert(error.message); return; }
    fetchOrders();
  };

  if (loading) return <p className="py-8 text-center text-sm text-slate-400">Loading orders...</p>;
  if (orders.length === 0) return <p className="py-8 text-center text-sm text-slate-400">No orders yet.</p>;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {orders.map((o) => {
        const draft = getDraft(o);
        const dirty = draft.status !== o.status || draft.admin_note !== (o.admin_note ?? "");
        return (
          <div key={o.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-600">ID: {o.id.slice(0, 6)}</span>
                  <span className={`rounded-lg px-2 py-1 text-[11px] font-bold ${o.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : o.status === 'cancelled' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                    {o.status === 'pending' ? 'Pending' : o.status === 'delivered' ? 'Done' : 'Cancelled'}
                  </span>
                </div>
                <p className="mt-2 text-sm font-bold text-slate-900">{o.package_name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{o.roblox_username}</span> • {new Date(o.created_at).toLocaleString()}
                </p>
              </div>
              <span className="shrink-0 text-lg font-extrabold text-rose-500">-{o.coins_charged.toLocaleString()}</span>
            </div>

            {o.receive_method && (
              <div className="mt-3 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600">
                Via <span className="font-bold">{o.receive_method === "zalo" ? "Zalo" : "Discord"}</span>: {o.contact_value}
              </div>
            )}

            <div className="mt-3 space-y-2">
              <select
                value={draft.status}
                onChange={(e) => setDrafts((d) => ({ ...d, [o.id]: { ...draft, status: e.target.value } }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>

              <input
                value={draft.admin_note}
                onChange={(e) => setDrafts((d) => ({ ...d, [o.id]: { ...draft, admin_note: e.target.value } }))}
                placeholder="Admin note..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              />
            </div>

            {o.coins_refunded > 0 && (
              <p className="mt-2 text-xs font-semibold text-emerald-600">Refunded: {o.coins_refunded.toLocaleString()} Coins</p>
            )}

            {dirty && (
              <button
                onClick={() => handleSave(o)}
                disabled={savingId === o.id}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:opacity-90 disabled:opacity-60"
              >
                {savingId === o.id ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Changes
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancel (Refund)" },
];
function TasksTab() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [newTask, setNewTask] = useState({ provider: "", reward_coins: 0, daily_limit: 1, is_hot: false });

  const fetchTasks = async () => {
    setLoading(true);
    const { data } = await supabase.from("tasks").select("*").order("sort_order", { ascending: true });
    setTasks(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  const updateField = (id, field, value) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, [field]: value } : t)));

  const handleSave = async (task) => {
    setSavingId(task.id);
    const { error } = await supabase.from("tasks").update({
      reward_coins: Number(task.reward_coins),
      daily_limit: Number(task.daily_limit),
      is_hot: task.is_hot,
      active: task.active,
    }).eq("id", task.id);
    setSavingId(null);
    if (error) alert(error.message);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this task?")) return;
    await supabase.from("tasks").delete().eq("id", id);
    fetchTasks();
  };

  const handleCreate = async () => {
    if (!newTask.provider.trim()) return alert("Provider name required.");
    const { error } = await supabase.from("tasks").insert({
      provider: newTask.provider.trim().toUpperCase(),
      reward_coins: Number(newTask.reward_coins),
      daily_limit: Number(newTask.daily_limit),
      is_hot: newTask.is_hot,
      active: true,
      sort_order: tasks.length + 1,
    });
    if (error) return alert(error.message);
    setNewTask({ provider: "", reward_coins: 0, daily_limit: 1, is_hot: false });
    setShowNew(false);
    fetchTasks();
  };

  if (loading) return <p className="py-8 text-center text-sm text-slate-400">Loading tasks...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Manage Tasks</h2>
        <button
          onClick={() => setShowNew((s) => !s)}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 hover:opacity-90"
        >
          <Plus size={16} /> Add Task
        </button>
      </div>

      {showNew && (
        <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <input
              value={newTask.provider}
              onChange={(e) => setNewTask((n) => ({ ...n, provider: e.target.value }))}
              placeholder="Provider (LINK4M)"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400"
            />
            <input
              type="number"
              value={newTask.reward_coins}
              onChange={(e) => setNewTask((n) => ({ ...n, reward_coins: e.target.value }))}
              placeholder="Reward Coins"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400"
            />
            <input
              type="number"
              value={newTask.daily_limit}
              onChange={(e) => setNewTask((n) => ({ ...n, daily_limit: e.target.value }))}
              placeholder="Daily Limit"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400"
            />
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={newTask.is_hot} onChange={(e) => setNewTask((n) => ({ ...n, is_hot: e.target.checked }))} className="h-4 w-4" />
              Mark HOT
            </label>
          </div>
          <button onClick={handleCreate} className="mt-4 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            Create Task
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {tasks.map((t) => (
          <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-900">{t.provider}</span>
                {t.is_hot && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-600">HOT</span>}
              </div>
              <button onClick={() => handleDelete(t.id)} className="text-rose-400 hover:text-rose-600 transition">
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[11px] font-bold uppercase text-slate-400">Coin per turn</span>
                <input
                  type="number"
                  value={t.reward_coins}
                  onChange={(e) => updateField(t.id, "reward_coins", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold uppercase text-slate-400">Daily Limit</span>
                <input
                  type="number"
                  value={t.daily_limit}
                  onChange={(e) => updateField(t.id, "daily_limit", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
              </label>
            </div>

            <div className="mt-4 flex items-center gap-6 border-t border-slate-100 pt-4 text-sm text-slate-600">
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={t.is_hot} onChange={(e) => updateField(t.id, "is_hot", e.target.checked)} className="h-4 w-4 accent-blue-500" />
                HOT
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={t.active} onChange={(e) => updateField(t.id, "active", e.target.checked)} className="h-4 w-4 accent-blue-500" />
                Active
              </label>
            </div>

            <button
              onClick={() => handleSave(t)}
              disabled={savingId === t.id}
              className="mt-4 w-full rounded-full bg-blue-50 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-100 transition disabled:opacity-60"
            >
              {savingId === t.id ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Save Settings"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
              }
function PackagesTab() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const fetchPackages = async () => {
    setLoading(true);
    const { data } = await supabase.from("redemption_packages").select("*").order("sort_order", { ascending: true });
    setPackages(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchPackages(); }, []);

  const updateField = (id, field, value) => setPackages((ps) => ps.map((p) => (p.id === id ? { ...p, [field]: value } : p)));

  const handleSave = async (pkg) => {
    setSavingId(pkg.id);
    const { error } = await supabase.from("redemption_packages").update({
      coin_cost: Number(pkg.coin_cost),
      original_price_text: pkg.original_price_text,
      is_promo: pkg.is_promo,
      active: pkg.active,
    }).eq("id", pkg.id);
    setSavingId(null);
    if (error) alert(error.message);
  };

  if (loading) return <p className="py-8 text-center text-sm text-slate-400">Loading packages...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Manage Packages</h2>
        <span className="rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600">{packages.length} Packages</span>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {packages.map((p) => (
          <div key={p.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-blue-50 transition group-hover:scale-125" />
            <div className="relative">
              <p className="text-lg font-extrabold text-slate-900">{p.name}</p>
              <p className="text-xs font-medium text-slate-400">Version: {p.version}</p>

              <div className="mt-5 flex items-end gap-1">
                <span className="text-3xl font-extrabold text-blue-600">{Number(p.coin_cost).toLocaleString()}</span>
                <span className="mb-1 text-sm font-medium text-slate-400">Coins</span>
              </div>

              <div className="mt-5 space-y-3">
                <label className="block">
                  <span className="text-[11px] font-bold uppercase text-slate-400">Coin Cost</span>
                  <input
                    type="number"
                    value={p.coin_cost}
                    onChange={(e) => updateField(p.id, "coin_cost", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-bold uppercase text-slate-400">Original Price</span>
                  <input
                    value={p.original_price_text ?? ""}
                    onChange={(e) => updateField(p.id, "original_price_text", e.target.value)}
                    placeholder="14.000d"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                </label>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-600">
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={p.is_promo} onChange={(e) => updateField(p.id, "is_promo", e.target.checked)} className="h-4 w-4 accent-rose-500" />
                  Promo (KM)
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={p.active} onChange={(e) => updateField(p.id, "active", e.target.checked)} className="h-4 w-4 accent-blue-500" />
                  Active
                </label>
              </div>

              <button
                onClick={() => handleSave(p)}
                disabled={savingId === p.id}
                className="mt-5 w-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:opacity-90 disabled:opacity-60"
              >
                {savingId === p.id ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Save Package"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjustAmount, setAdjustAmount] = useState({});
  const [savingId, setSavingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("coins", { ascending: false });
    setUsers(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAdjustCoins = async (u) => {
    const amount = Number(adjustAmount[u.id] ?? 0);
    if (!amount) return;
    setSavingId(u.id);
    const { error } = await supabase.from("profiles").update({ coins: u.coins + amount }).eq("id", u.id);
    setSavingId(null);
    if (error) return alert(error.message);
    setAdjustAmount((a) => ({ ...a, [u.id]: "" }));
    fetchUsers();
  };

  const toggleAdmin = async (u) => {
    await supabase.from("profiles").update({ is_admin: !u.is_admin }).eq("id", u.id);
    fetchUsers();
  };

  if (loading) return <p className="py-8 text-center text-sm text-slate-400">Loading users...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Manage Users</h2>
        <span className="rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600">{users.length} Accounts</span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Level</th>
              <th className="px-6 py-4">Coins</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="transition hover:bg-blue-50/40">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-bold text-white">
                      {(u.username || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{u.username || "No name"}</p>
                      <p className="text-xs text-slate-400">ID: {u.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700">Lv. {u.level || 1}</td>
                <td className="px-6 py-4">
                  <span className="text-base font-extrabold text-blue-600">{u.coins.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4">
                  {u.is_admin && <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-600">ADMIN</span>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <input
                      type="number"
                      value={adjustAmount[u.id] ?? ""}
                      onChange={(e) => setAdjustAmount((a) => ({ ...a, [u.id]: e.target.value }))}
                      placeholder="+/- Coins"
                      className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                    <button
                      onClick={() => handleAdjustCoins(u)}
                      disabled={savingId === u.id}
                      className="rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition disabled:opacity-60"
                    >
                      {savingId === u.id ? <Loader2 size={12} className="animate-spin" /> : "Adjust"}
                    </button>
                    <button
                      onClick={() => toggleAdmin(u)}
                      className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                        u.is_admin ? "border-rose-200 text-rose-600 hover:bg-rose-50" : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {u.is_admin ? "Remove Admin" : "Set Admin"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
              }
// Thêm icon
import { Megaphone } from "lucide-react"; 

// Thêm vào TABS
const TABS = [
  // ... các tab cũ
  { key: "marketing", label: "Marketing", icon: Megaphone, desc: "Duyệt video TikTok/YouTube" },
];

// Thêm component MarketingTab vào cuối file (hoặc cạnh các tab khác)
function MarketingTab() {
  const { videos, fetchVideos } = useMarketing(null, true); // Lấy tất cả video
  const [notes, setNotes] = useState({});
  const [coins, setCoins] = useState({});

  const handleApprove = async (video) => {
    const coin = Number(coins[video.id] || 0);
    const note = notes[video.id] || "";
    await supabase.from("marketing_videos").update({ status: "approved", coin_awarded: coin, admin_note: note }).eq("id", video.id);
    // Cộng coin cho user
    await supabase.rpc("add_coins", { user_id: video.user_id, amount: coin }); // Cần tạo function add_coins trong SQL
    fetchVideos();
  };

  const handleReject = async (video) => {
    const note = notes[video.id] || "";
    await supabase.from("marketing_videos").update({ status: "rejected", admin_note: note }).eq("id", video.id);
    fetchVideos();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Marketing Videos</h2>
      {videos.map((video) => (
        <div key={video.id} className="rounded-xl border p-4">
          <p className="text-sm font-bold">{video.platform} - {video.link}</p>
          <p className="text-xs text-slate-400">User: {video.user_id}</p>
          <div className="mt-2 flex gap-2">
            <input type="number" placeholder="Coin thưởng" value={coins[video.id] || ""} onChange={(e) => setCoins({...coins, [video.id]: e.target.value})} className="w-20 rounded border px-2 py-1" />
            <input type="text" placeholder="Lời nhắc" value={notes[video.id] || ""} onChange={(e) => setNotes({...notes, [video.id]: e.target.value})} className="flex-1 rounded border px-2 py-1" />
          </div>
          <div className="mt-2 flex gap-2">
            <button onClick={() => handleApprove(video)} className="rounded-full bg-emerald-500 px-4 py-1 text-xs text-white">Duyệt</button>
            <button onClick={() => handleReject(video)} className="rounded-full bg-rose-500 px-4 py-1 text-xs text-white">Từ chối</button>
          </div>
        </div>
      ))}
    </div>
  );
}
