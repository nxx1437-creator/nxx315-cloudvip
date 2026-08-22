import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Package,
  ListChecks,
  Users,
  Loader2,
  Plus,
  Trash2,
  Save,
  Gift,
  Megaphone,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Coins,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";

/* =========================================================
   ADMIN TABS
========================================================= */

const TABS = [
  {
    key: "orders",
    label: "Orders",
    icon: Package,
    desc: "Manage rewards",
  },
  {
    key: "tasks",
    label: "Tasks",
    icon: ListChecks,
    desc: "Config tasks",
  },
  {
    key: "packages",
    label: "Packages",
    icon: Gift,
    desc: "Store items",
  },
  {
    key: "users",
    label: "Users",
    icon: Users,
    desc: "Manage accounts",
  },
  {
    key: "marketing",
    label: "Marketing",
    icon: Megaphone,
    desc: "Review videos",
  },
];

/* =========================================================
   MAIN ADMIN
========================================================= */

export default function Admin() {
  const [tab, setTab] = useState("orders");

  return (
    <div className="min-h-screen bg-[#F0F6FF] pb-16">
      {/* HEADER */}
      <header className="sticky top-0 z-10 border-b border-blue-100 bg-white/90 px-4 py-4 shadow-sm backdrop-blur-xl md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-lg shadow-blue-500/30">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h1 className="text-xl font-extrabold text-slate-900">
                Nxx315 Admin Panel
              </h1>
              <p className="text-xs font-medium text-slate-500">
                Rewards Management
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-600">
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
              System Online
            </span>
          </div>
        </div>
      </header>

      {/* TABS */}
      <div className="mx-auto max-w-7xl px-4 pt-6 md:px-6">
        <div className="flex flex-wrap gap-3">
          {TABS.map((t) => {
            const Icon = t.icon;

            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200 ${
                  tab === t.key
                    ? "scale-105 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "border border-blue-100 bg-white text-slate-600 shadow-sm hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <Icon
                  size={20}
                  className={
                    tab === t.key ? "text-white" : "text-blue-500"
                  }
                />

                <div>
                  <div className="text-sm font-bold">{t.label}</div>
                  <div
                    className={`text-[11px] ${
                      tab === t.key
                        ? "text-white/80"
                        : "text-slate-400"
                    }`}
                  >
                    {t.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT */}
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
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

/* =========================================================
   ORDERS
========================================================= */

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancel (Refund)" },
];

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [drafts, setDrafts] = useState({});

  const fetchOrders = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("redemption_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert(error.message);
    }

    setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getDraft = (order) =>
    drafts[order.id] ?? {
      status: order.status,
      admin_note: order.admin_note ?? "",
    };

  const handleSave = async (order) => {
    const draft = getDraft(order);

    setSavingId(order.id);

    const { error } = await supabase
      .from("redemption_orders")
      .update({
        status: draft.status,
        admin_note: draft.admin_note,
      })
      .eq("id", order.id);

    setSavingId(null);

    if (error) {
      alert(error.message);
      return;
    }

    await fetchOrders();
  };

  if (loading) {
    return (
      <LoadingBox text="Loading orders..." />
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyBox
        icon={Package}
        title="No orders yet"
        text="Orders will appear here when users redeem rewards."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {orders.map((o) => {
        const draft = getDraft(o);

        const dirty =
          draft.status !== o.status ||
          draft.admin_note !== (o.admin_note ?? "");

        return (
          <div
            key={o.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-600">
                    ID: {String(o.id).slice(0, 6)}
                  </span>

                  <span
                    className={`rounded-lg px-2 py-1 text-[11px] font-bold ${
                      o.status === "delivered"
                        ? "bg-emerald-50 text-emerald-600"
                        : o.status === "cancelled"
                        ? "bg-rose-50 text-rose-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {o.status === "pending"
                      ? "Pending"
                      : o.status === "delivered"
                      ? "Done"
                      : "Cancelled"}
                  </span>
                </div>

                <p className="mt-2 text-sm font-bold text-slate-900">
                  {o.package_name ?? "Robux Package"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">
                    {o.roblox_username ?? "Unknown"}
                  </span>{" "}
                  •{" "}
                  {o.created_at
                    ? new Date(o.created_at).toLocaleString()
                    : ""}
                </p>
              </div>

              <span className="shrink-0 text-lg font-extrabold text-rose-500">
                -{Number(o.coins_charged ?? 0).toLocaleString()}
              </span>
            </div>

            {o.receive_method && (
              <div className="mt-3 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600">
                Via{" "}
                <span className="font-bold">
                  {o.receive_method === "zalo"
                    ? "Zalo"
                    : "Discord"}
                </span>
                : {o.contact_value}
              </div>
            )}

            <div className="mt-3 space-y-2">
              <select
                value={draft.status}
                onChange={(e) =>
                  setDrafts((d) => ({
                    ...d,
                    [o.id]: {
                      ...draft,
                      status: e.target.value,
                    },
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>

              <input
                value={draft.admin_note}
                onChange={(e) =>
                  setDrafts((d) => ({
                    ...d,
                    [o.id]: {
                      ...draft,
                      admin_note: e.target.value,
                    },
                  }))
                }
                placeholder="Admin note..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              />
            </div>

            {Number(o.coins_refunded ?? 0) > 0 && (
              <p className="mt-2 text-xs font-semibold text-emerald-600">
                Refunded:{" "}
                {Number(o.coins_refunded).toLocaleString()} Coins
              </p>
            )}

            {dirty && (
              <button
                onClick={() => handleSave(o)}
                disabled={savingId === o.id}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:opacity-90 disabled:opacity-60"
              >
                {savingId === o.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Save Changes
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   TASKS
========================================================= */

function TasksTab() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const [newTask, setNewTask] = useState({
    provider: "",
    reward_coins: 0,
    daily_limit: 1,
    is_hot: false,
  });

  const fetchTasks = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      alert(error.message);
    }

    setTasks(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const updateField = (id, field, value) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? { ...task, [field]: value }
          : task
      )
    );
  };

  const handleSave = async (task) => {
    setSavingId(task.id);

    const { error } = await supabase
      .from("tasks")
      .update({
        reward_coins: Number(task.reward_coins),
        daily_limit: Number(task.daily_limit),
        is_hot: Boolean(task.is_hot),
        active: Boolean(task.active),
      })
      .eq("id", task.id);

    setSavingId(null);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Task saved!");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchTasks();
  };

  const handleCreate = async () => {
    if (!newTask.provider.trim()) {
      alert("Provider name required.");
      return;
    }

    const { error } = await supabase
      .from("tasks")
      .insert({
        provider: newTask.provider.trim().toUpperCase(),
        reward_coins: Number(newTask.reward_coins),
        daily_limit: Number(newTask.daily_limit),
        is_hot: Boolean(newTask.is_hot),
        active: true,
        sort_order: tasks.length + 1,
      });

    if (error) {
      alert(error.message);
      return;
    }

    setNewTask({
      provider: "",
      reward_coins: 0,
      daily_limit: 1,
      is_hot: false,
    });

    setShowNew(false);
    fetchTasks();
  };

  if (loading) {
    return <LoadingBox text="Loading tasks..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">
          Manage Tasks
        </h2>

        <button
          onClick={() => setShowNew((s) => !s)}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 hover:opacity-90"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      {showNew && (
        <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <input
              value={newTask.provider}
              onChange={(e) =>
                setNewTask((n) => ({
                  ...n,
                  provider: e.target.value,
                }))
              }
              placeholder="Provider (LINK4M)"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400"
            />

            <input
              type="number"
              value={newTask.reward_coins}
              onChange={(e) =>
                setNewTask((n) => ({
                  ...n,
                  reward_coins: e.target.value,
                }))
              }
              placeholder="Reward Coins"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400"
            />

            <input
              type="number"
              value={newTask.daily_limit}
              onChange={(e) =>
                setNewTask((n) => ({
                  ...n,
                  daily_limit: e.target.value,
                }))
              }
              placeholder="Daily Limit"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400"
            />

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={newTask.is_hot}
                onChange={(e) =>
                  setNewTask((n) => ({
                    ...n,
                    is_hot: e.target.checked,
                  }))
                }
                className="h-4 w-4"
              />
              Mark HOT
            </label>
          </div>

          <button
            onClick={handleCreate}
            className="mt-4 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Create Task
          </button>
        </div>
      )}

      {tasks.length === 0 ? (
        <EmptyBox
          icon={ListChecks}
          title="No tasks"
          text="Create your first task."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-slate-900">
                    {t.provider}
                  </span>

                  {t.is_hot && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-600">
                      HOT
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(t.id)}
                  className="text-rose-400 transition hover:text-rose-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[11px] font-bold uppercase text-slate-400">
                    Coin per turn
                  </span>

                  <input
                    type="number"
                    value={t.reward_coins}
                    onChange={(e) =>
                      updateField(
                        t.id,
                        "reward_coins",
                        e.target.value
                      )
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-bold uppercase text-slate-400">
                    Daily Limit
                  </span>

                  <input
                    type="number"
                    value={t.daily_limit}
                    onChange={(e) =>
                      updateField(
                        t.id,
                        "daily_limit",
                        e.target.value
                      )
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                </label>
              </div>

              <div className="mt-4 flex items-center gap-6 border-t border-slate-100 pt-4 text-sm text-slate-600">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(t.is_hot)}
                    onChange={(e) =>
                      updateField(
                        t.id,
                        "is_hot",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 accent-blue-500"
                  />
                  HOT
                </label>

                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(t.active)}
                    onChange={(e) =>
                      updateField(
                        t.id,
                        "active",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 accent-blue-500"
                  />
                  Active
                </label>
              </div>

              <button
    
