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
