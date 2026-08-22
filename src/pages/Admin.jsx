async function fetchVideoMeta(url) {
  try {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
      const data = await res.json();
      return { title: data.title || "Video", view: "—", like: "—", comment: "—" };
    } else if (url.includes("tiktok.com")) {
      const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      return { title: data.title || "TikTok Video", view: "—", like: "—", comment: "—" };
    }
  } catch { return { title: "Không xác định", view: "—", like: "—", comment: "—" }; }
}
import React, { useEffect, useState } from "react";
import {
  ShieldCheck, Package, ListChecks, Users, Loader2, Plus, Trash2, Save,
  Gift, Megaphone, CheckCircle2, XCircle, Clock3, RefreshCw
} from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";

const TABS = [
  { key: "orders", label: "Orders", icon: Package, desc: "Manage rewards" },
  { key: "tasks", label: "Tasks", icon: ListChecks, desc: "Config tasks" },
  { key: "packages", label: "Packages", icon: Gift, desc: "Store items" },
  { key: "users", label: "Users", icon: Users, desc: "Manage accounts" },
  { key: "marketing", label: "Marketing", icon: Megaphone, desc: "Review videos" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancel" },
];

export default function Admin() {
  const [tab, setTab] = useState("orders");

  return (
    <div className="min-h-screen bg-[#F0F6FF] pb-16">
      <header className="sticky top-0 z-20 border-b border-blue-100 bg-white/90 px-4 py-4 shadow-sm backdrop-blur-xl md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-lg shadow-blue-500/30">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 md:text-xl">Nxx315 Admin Panel</h1>
              <p className="text-xs font-medium text-slate-500">Rewards Management</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-600">
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" /> System Online
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pt-5 md:px-6 md:pt-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`flex min-w-max items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200 ${
                  active ? "scale-[1.02] bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-500/30" : "border border-blue-100 bg-white text-slate-600 shadow-sm hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <Icon size={20} className={active ? "text-white" : "text-blue-500"} />
                <div>
                  <div className="text-sm font-bold">{item.label}</div>
                  <div className={`text-[11px] ${active ? "text-white/80" : "text-slate-400"}`}>{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-5 md:px-6 md:py-6">
        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-blue-50 md:p-6">
          {tab === "orders" && <OrdersTab />}
          {tab === "tasks" && <TasksTab />}
          {tab === "packages" && <PackagesTab />}
          {tab === "users" && <UsersTab />}
          {tab === "marketing" && <MarketingTab />}
        </div>
      </main>
    </div>
  );
}

/* ===== ORDERS ===== */
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

  return (
    <div className="space-y-5">
      <SectionHeader title="Manage Orders" count={`${orders.length} Orders`} onRefresh={fetchOrders} />
      {orders.length === 0 ? <EmptyState text="No orders yet." /> : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => {
            const draft = getDraft(order);
            const dirty = draft.status !== order.status || draft.admin_note !== (order.admin_note ?? "");
            return (
              <div key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-600">ID: {String(order.id).slice(0, 8)}</span>
                      <OrderStatus status={order.status} />
                    </div>
                    <p className="mt-3 truncate text-sm font-bold text-slate-900">{order.package_name ?? "Robux Package"}</p>
                    <p className="mt-1 text-xs text-slate-500"><span className="font-semibold text-slate-700">{order.roblox_username ?? "Unknown user"}</span></p>
                    {order.created_at && <p className="mt-1 text-[11px] text-slate-400">{new Date(order.created_at).toLocaleString()}</p>}
                  </div>
                  <span className="shrink-0 text-lg font-extrabold text-rose-500">-{Number(order.coins_charged ?? 0).toLocaleString()}</span>
                </div>

                {order.receive_method && (
                  <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                    Via <span className="font-bold">{order.receive_method === "zalo" ? "Zalo" : order.receive_method === "discord" ? "Discord" : order.receive_method}</span>
                    {order.contact_value ? `: ${order.contact_value}` : ""}
                  </div>
                )}

                <div className="mt-4 space-y-2">
                  <select
                    value={draft.status}
                    onChange={(e) => setDrafts((current) => ({ ...current, [order.id]: { ...draft, status: e.target.value } }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  >
                    {STATUS_OPTIONS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                  </select>
                  <input
                    value={draft.admin_note}
                    onChange={(e) => setDrafts((current) => ({ ...current, [order.id]: { ...draft, admin_note: e.target.value } }))}
                    placeholder="Admin note..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  />
                </div>

                {Number(order.coins_refunded ?? 0) > 0 && <p className="mt-2 text-xs font-semibold text-emerald-600">Refunded: {Number(order.coins_refunded).toLocaleString()} Coins</p>}

                {dirty && (
                  <button type="button" onClick={() => handleSave(order)} disabled={savingId === order.id}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:opacity-90 disabled:opacity-60">
                    {savingId === order.id ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ===== TASKS ===== */
function TasksTab() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [newTask, setNewTask] = useState({ provider: "", reward_coins: 0, daily_limit: 1, is_hot: false });

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("tasks").select("*").order("sort_order", { ascending: true });
    if (error) { alert(error.message); setTasks([]); } else { setTasks(data ?? []); }
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  const updateField = (id, field, value) => setTasks((current) => current.map((task) => task.id === id ? { ...task, [field]: value } : task));

  const handleSave = async (task) => {
    setSavingId(task.id);
    const { error } = await supabase.from("tasks").update({ reward_coins: Number(task.reward_coins), daily_limit: Number(task.daily_limit), is_hot: Boolean(task.is_hot), active: Boolean(task.active) }).eq("id", task.id);
    setSavingId(null);
    if (error) { alert(error.message); return; }
    alert("Task saved!");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    await fetchTasks();
  };

  const handleCreate = async () => {
    if (!newTask.provider.trim()) { alert("Provider name required."); return; }
    const { error } = await supabase.from("tasks").insert({ provider: newTask.provider.trim().toUpperCase(), reward_coins: Number(newTask.reward_coins), daily_limit: Number(newTask.daily_limit), is_hot: Boolean(newTask.is_hot), active: true, sort_order: tasks.length + 1 });
    if (error) { alert(error.message); return; }
    setNewTask({ provider: "", reward_coins: 0, daily_limit: 1, is_hot: false });
    setShowNew(false); await fetchTasks();
  };

  if (loading) return <Loading text="Loading tasks..." />;

  return (
    <div className="space-y-6">
      <SectionHeader title="Manage Tasks" count={`${tasks.length} Tasks`} onRefresh={fetchTasks} />
      <button type="button" onClick={() => setShowNew((value) => !value)} className="flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:opacity-90">
        <Plus size={16} /> Add Task
      </button>

      {showNew && (
        <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <input value={newTask.provider} onChange={(e) => setNewTask((current) => ({ ...current, provider: e.target.value }))} placeholder="Provider (LINK4M)" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
            <input type="number" value={newTask.reward_coins} onChange={(e) => setNewTask((current) => ({ ...current, reward_coins: e.target.value }))} placeholder="Reward Coins" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
            <input type="number" value={newTask.daily_limit} onChange={(e) => setNewTask((current) => ({ ...current, daily_limit: e.target.value }))} placeholder="Daily Limit" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <input type="checkbox" checked={newTask.is_hot} onChange={(e) => setNewTask((current) => ({ ...current, is_hot: e.target.checked }))} className="h-4 w-4 accent-blue-500" /> Mark HOT
            </label>
          </div>
          <button type="button" onClick={handleCreate} className="mt-4 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">Create Task</button>
        </div>
      )}

      {tasks.length === 0 ? <EmptyState text="No tasks found." /> : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-slate-900">{task.provider}</span>
                  {task.is_hot && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-600">HOT</span>}
                </div>
                <button type="button" onClick={() => handleDelete(task.id)} className="text-rose-400 transition hover:text-rose-600"><Trash2 size={18} /></button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <label>
                  <span className="text-[11px] font-bold uppercase text-slate-400">Coin per turn</span>
                  <input type="number" value={task.reward_coins} onChange={(e) => updateField(task.id, "reward_coins", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </label>
                <label>
                  <span className="text-[11px] font-bold uppercase text-slate-400">Daily Limit</span>
                  <input type="number" value={task.daily_limit} onChange={(e) => updateField(task.id, "daily_limit", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </label>
              </div>

              <div className="mt-4 flex items-center gap-6 border-t border-slate-100 pt-4 text-sm text-slate-600">
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={Boolean(task.is_hot)} onChange={(e) => updateField(task.id, "is_hot", e.target.checked)} className="h-4 w-4 accent-blue-500" /> HOT
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={Boolean(task.active)} onChange={(e) => updateField(task.id, "active", e.target.checked)} className="h-4 w-4 accent-blue-500" /> Active
                </label>
              </div>

              <button type="button" onClick={() => handleSave(task)} disabled={savingId === task.id} className="mt-4 w-full rounded-full bg-blue-50 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100 disabled:opacity-60">
                {savingId === task.id ? <Loader2 size={16} className="mx-auto animate-spin" /> : "Save Settings"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
    }
/* ===== PACKAGES ===== */
function PackagesTab() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const fetchPackages = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("redemption_packages").select("*").order("sort_order", { ascending: true });
    if (error) { alert(error.message); setPackages([]); } else { setPackages(data ?? []); }
    setLoading(false);
  };

  useEffect(() => { fetchPackages(); }, []);

  const updateField = (id, field, value) => setPackages((current) => current.map((pkg) => pkg.id === id ? { ...pkg, [field]: value } : pkg));
  const handleSave = async (pkg) => {
    setSavingId(pkg.id);
    const { error } = await supabase.from("redemption_packages").update({ coin_cost: Number(pkg.coin_cost), original_price_text: pkg.original_price_text, is_promo: Boolean(pkg.is_promo), active: Boolean(pkg.active) }).eq("id", pkg.id);
    setSavingId(null);
    if (error) { alert(error.message); return; }
    alert("Package saved!");
  };

  if (loading) return <Loading text="Loading packages..." />;

  return (
    <div className="space-y-6">
      <SectionHeader title="Manage Packages" count={`${packages.length} Packages`} onRefresh={fetchPackages} />
      {packages.length === 0 ? <EmptyState text="No packages found." /> : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((pkg) => (
            <div key={pkg.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-blue-50 transition group-hover:scale-125" />
              <div className="relative">
                <p className="text-lg font-extrabold text-slate-900">{pkg.name}</p>
                <p className="text-xs font-medium text-slate-400">Version: {pkg.version}</p>
                <div className="mt-5 flex items-end gap-1">
                  <span className="text-3xl font-extrabold text-blue-600">{Number(pkg.coin_cost).toLocaleString()}</span>
                  <span className="mb-1 text-sm font-medium text-slate-400">Coins</span>
                </div>
                <div className="mt-5 space-y-3">
                  <label>
                    <span className="text-[11px] font-bold uppercase text-slate-400">Coin Cost</span>
                    <input type="number" value={pkg.coin_cost} onChange={(e) => updateField(pkg.id, "coin_cost", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400" />
                  </label>
                  <label>
                    <span className="text-[11px] font-bold uppercase text-slate-400">Original Price</span>
                    <input value={pkg.original_price_text ?? ""} onChange={(e) => updateField(pkg.id, "original_price_text", e.target.value)} placeholder="14.000d" className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400" />
                  </label>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-600">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={Boolean(pkg.is_promo)} onChange={(e) => updateField(pkg.id, "is_promo", e.target.checked)} className="h-4 w-4 accent-rose-500" /> Promo (KM)
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={Boolean(pkg.active)} onChange={(e) => updateField(pkg.id, "active", e.target.checked)} className="h-4 w-4 accent-blue-500" /> Active
                  </label>
                </div>
                <button type="button" onClick={() => handleSave(pkg)} disabled={savingId === pkg.id} className="mt-5 w-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:opacity-90 disabled:opacity-60">
                  {savingId === pkg.id ? <Loader2 size={16} className="mx-auto animate-spin" /> : "Save Package"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== USERS ===== */
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjustAmount, setAdjustAmount] = useState({});
  const [savingId, setSavingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("*").order("coins", { ascending: false });
    if (error) { alert(error.message); setUsers([]); } else { setUsers(data ?? []); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAdjustCoins = async (u) => {
    const amount = Number(adjustAmount[u.id] ?? 0);
    if (!amount) return;
    setSavingId(u.id);
    const { error } = await supabase.from("profiles").update({ coins: u.coins + amount }).eq("id", u.id);
    setSavingId(null);
    if (error) { alert(error.message); return; }
    setAdjustAmount((current) => ({ ...current, [u.id]: "" }));
    await fetchUsers();
  };

  const toggleAdmin = async (u) => {
    const { error } = await supabase.from("profiles").update({ is_admin: !u.is_admin }).eq("id", u.id);
    if (error) { alert(error.message); return; }
    await fetchUsers();
  };

  if (loading) return <Loading text="Loading users..." />;

  return (
    <div className="space-y-6">
      <SectionHeader title="Manage Users" count={`${users.length} Accounts`} onRefresh={fetchUsers} />
      {users.length === 0 ? <EmptyState text="No users found." /> : (
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
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-bold text-white">{(u.username || "U").charAt(0).toUpperCase()}</div>
                      <div>
                        <p className="font-bold text-slate-900">{u.username || "No name"}</p>
                        <p className="text-xs text-slate-400">ID: {String(u.id).slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">Lv. {u.level || 1}</td>
                  <td className="px-6 py-4"><span className="text-base font-extrabold text-blue-600">{u.coins.toLocaleString()}</span></td>
                  <td className="px-6 py-4">{u.is_admin && <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-600">ADMIN</span>}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <input type="number" value={adjustAmount[u.id] ?? ""} onChange={(e) => setAdjustAmount((current) => ({ ...current, [u.id]: e.target.value }))} placeholder="+/- Coins" className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400" />
                      <button type="button" onClick={() => handleAdjustCoins(u)} disabled={savingId === u.id} className="rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 disabled:opacity-60">
                        {savingId === u.id ? <Loader2 size={12} className="animate-spin" /> : "Adjust"}
                      </button>
                      <button type="button" onClick={() => toggleAdmin(u)} className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${u.is_admin ? "border-rose-200 text-rose-600 hover:bg-rose-50" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                        {u.is_admin ? "Remove Admin" : "Set Admin"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
                    }
/* ===== MARKETING ===== */
function MarketingTab() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});
  const [coins, setCoins] = useState({});
  const [savingId, setSavingId] = useState(null);

  const fetchVideos = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("marketing_videos").select("*").order("created_at", { ascending: false });
    if (error) { alert(error.message); setVideos([]); } else { setVideos(data ?? []); }
    setLoading(false);
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleApprove = async (video) => {
    const coin = Number(coins[video.id] || 0);
    const note = notes[video.id] || "";
    if (coin <= 0) { alert("Vui lòng nhập số coin thưởng!"); return; }
    setSavingId(video.id);
    const { error: videoError } = await supabase.from("marketing_videos").update({ status: "approved", coin_awarded: coin, admin_note: note }).eq("id", video.id);
    if (videoError) { alert(videoError.message); setSavingId(null); return; }
    const { data: userData } = await supabase.from("profiles").select("coins").eq("id", video.user_id).single();
    if (userData) {
      const { error: userError } = await supabase.from("profiles").update({ coins: userData.coins + coin }).eq("id", video.user_id);
      if (userError) alert(userError.message);
    }
    setSavingId(null);
    setNotes((current) => ({ ...current, [video.id]: "" }));
    setCoins((current) => ({ ...current, [video.id]: "" }));
    await fetchVideos();
  };

  const handleReject = async (video) => {
    const note = notes[video.id] || "";
    setSavingId(video.id);
    const { error } = await supabase.from("marketing_videos").update({ status: "rejected", admin_note: note }).eq("id", video.id);
    if (error) { alert(error.message); setSavingId(null); return; }
    setSavingId(null);
    setNotes((current) => ({ ...current, [video.id]: "" }));
    await fetchVideos();
  };

  if (loading) return <Loading text="Loading videos..." />;

  return (
    <div className="space-y-6">
      <SectionHeader title="Review Marketing Videos" count={`${videos.length} Videos`} onRefresh={fetchVideos} />
      {videos.length === 0 ? <EmptyState text="No videos submitted." /> : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {videos.map((video) => (
            <div key={video.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">{video.platform}</span>
                    <span className="text-xs text-slate-400">{new Date(video.created_at).toLocaleString()}</span>
                  </div>
                  <p className="mt-3 break-all text-sm font-bold text-slate-900">{video.link}</p>
                  <p className="mt-1 text-xs text-slate-400">User ID: {String(video.user_id).slice(0, 8)}...</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${video.status === "approved" ? "bg-emerald-50 text-emerald-600" : video.status === "rejected" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"}`}>
                  {video.status === "approved" ? "Approved" : video.status === "rejected" ? "Rejected" : "Pending"}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <input type="number" value={coins[video.id] ?? ""} onChange={(e) => setCoins((current) => ({ ...current, [video.id]: e.target.value }))} placeholder="Coin Award" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400" />
                <input type="text" value={notes[video.id] ?? ""} onChange={(e) => setNotes((current) => ({ ...current, [video.id]: e.target.value }))} placeholder="Admin note" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400" />
              </div>

              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => handleApprove(video)} disabled={savingId === video.id} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-emerald-500 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60">
                  {savingId === video.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Approve
                </button>
                <button type="button" onClick={() => handleReject(video)} disabled={savingId === video.id} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-rose-500 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60">
                  {savingId === video.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== SHARED ===== */
function SectionHeader({ title, count, onRefresh }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-400">{count}</p>
      </div>
      <button type="button" onClick={onRefresh} className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200">
        <RefreshCw size={14} /> Refresh
      </button>
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="py-12 text-center"><p className="text-sm text-slate-400">{text}</p></div>;
}

function Loading({ text }) {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 size={24} className="animate-spin text-slate-400" />
      <span className="ml-2 text-sm text-slate-400">{text}</span>
    </div>
  );
}

function OrderStatus({ status }) {
  const config = {
    pending: { label: "Pending", color: "bg-amber-50 text-amber-600" },
    delivered: { label: "Delivered", color: "bg-emerald-50 text-emerald-600" },
    cancelled: { label: "Cancelled", color: "bg-rose-50 text-rose-600" },
  };
  const current = config[status] || config.pending;
  return <span className={`rounded-lg px-2 py-1 text-[11px] font-bold ${current.color}`}>{current.label}</span>;
  }
