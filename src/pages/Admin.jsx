import React, { useEffect, useState } from "react";
import {
  ShieldCheck, Package, ListChecks, Users, Loader2, Plus, Trash2, Save,
  Gift, Megaphone, CheckCircle2, XCircle, RefreshCw, Music, Youtube
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
              <button key={item.key} type="button" onClick={() => setTab(item.key)}
                className={`flex min-w-max items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200 ${
                  active ? "scale-[1.02] bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-500/30" : "border border-blue-100 bg-white text-slate-600 shadow-sm hover:bg-blue-50 hover:text-blue-600"
                }`}>
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
                  <select value={draft.status} onChange={(e) => setDrafts((current) => ({ ...current, [order.id]: { ...draft, status: e.target.value } }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400">
                    {STATUS_OPTIONS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                  </select>
                  <input value={draft.admin_note} onChange={(e) => setDrafts((current) => ({ ...current, [order.id]: { ...draft, admin_note: e.target.value } }))}
                    placeholder="Admin note..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
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
