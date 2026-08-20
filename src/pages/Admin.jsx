import React, { useEffect, useState } from "react";
import {
  ShieldCheck, Package, ListChecks, Users, Loader2, Plus, Trash2, Save,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";

const TABS = [
  { key: "orders", label: "Đơn hàng", icon: Package },
  { key: "tasks", label: "Nhiệm vụ", icon: ListChecks },
  { key: "packages", label: "Gói Robux", icon: ShieldCheck },
  { key: "users", label: "Người dùng", icon: Users },
];

export default function Admin() {
  const [tab, setTab] = useState("orders");

  return (
    <div className="min-h-screen bg-[#F5FAFF] pb-16">
      <header className="sticky top-0 z-10 border-b border-sky-100 bg-white/95 px-4 py-3 backdrop-blur-md">
        <h1 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
          <ShieldCheck size={20} className="text-sky-500" /> Trang Admin
        </h1>
        <div className="mt-3 flex gap-1.5 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                tab === t.key
                  ? "bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/30"
                  : "bg-sky-50 text-sky-700"
              }`}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-4">
        {tab === "orders" && <OrdersTab />}
        {tab === "tasks" && <TasksTab />}
        {tab === "packages" && <PackagesTab />}
        {tab === "users" && <UsersTab />}
      </main>
    </div>
  );
}

/* ============================== ĐƠN HÀNG ============================== */

const STATUS_OPTIONS = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Hủy (tự hoàn Coin)" },
];

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [drafts, setDrafts] = useState({}); // { [orderId]: { status, admin_note } }

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("redemption_orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getDraft = (o) => drafts[o.id] ?? { status: o.status, admin_note: o.admin_note ?? "" };

  const handleSave = async (order) => {
    const draft = getDraft(order);
    setSavingId(order.id);
    const { error } = await supabase
      .from("redemption_orders")
      .update({ status: draft.status, admin_note: draft.admin_note })
      .eq("id", order.id);
    setSavingId(null);
    if (error) {
      alert(error.message);
      return;
    }
    fetchOrders();
  };

  if (loading) return <p className="py-8 text-center text-sm text-slate-400">Đang tải đơn hàng...</p>;
  if (orders.length === 0) return <p className="py-8 text-center text-sm text-slate-400">Chưa có đơn nào.</p>;

  return (
    <div className="space-y-3">
      {orders.map((o) => {
        const draft = getDraft(o);
        const dirty = draft.status !== o.status || draft.admin_note !== (o.admin_note ?? "");
        return (
          <div key={o.id} className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900">{o.package_name}</p>
                <p className="text-xs text-slate-400">
                  User: {o.roblox_username} • {new Date(o.created_at).toLocaleString("vi-VN")}
                </p>
                {o.receive_method && (
                  <p className="text-xs text-slate-400">
                    Nhận qua {o.receive_method === "zalo" ? "Zalo" : "Discord"}: {o.contact_value}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-xs font-semibold text-rose-500">
                -{o.coins_charged.toLocaleString("vi-VN")} Coin
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <select
                value={draft.status}
                onChange={(e) =>
                  setDrafts((d) => ({ ...d, [o.id]: { ...draft, status: e.target.value } }))
                }
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-sky-400"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <input
              value={draft.admin_note}
              onChange={(e) =>
                setDrafts((d) => ({ ...d, [o.id]: { ...draft, admin_note: e.target.value } }))
              }
              placeholder="Ghi chú admin (khách sẽ thấy)..."
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-sky-400"
            />

            {o.coins_refunded > 0 && (
              <p className="mt-1.5 text-xs font-medium text-emerald-600">
                Đã hoàn {o.coins_refunded.toLocaleString("vi-VN")} Coin
              </p>
            )}

            {dirty && (
              <button
                onClick={() => handleSave(o)}
                disabled={savingId === o.id}
                className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-2 text-sm font-semibold text-white shadow-md shadow-sky-500/25 disabled:opacity-60"
              >
                {savingId === o.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Lưu thay đổi
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ============================== NHIỆM VỤ ============================== */

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

  useEffect(() => {
    fetchTasks();
  }, []);

  const updateField = (id, field, value) => {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const handleSave = async (task) => {
    setSavingId(task.id);
    const { error } = await supabase
      .from("tasks")
      .update({
        reward_coins: Number(task.reward_coins),
        daily_limit: Number(task.daily_limit),
        is_hot: task.is_hot,
        active: task.active,
      })
      .eq("id", task.id);
    setSavingId(null);
    if (error) alert(error.message);
  };

  const handleDelete = async (id) => {
    if (!confirm("Xoá nhiệm vụ này? Không thể hoàn tác.")) return;
    await supabase.from("tasks").delete().eq("id", id);
    fetchTasks();
  };

  const handleCreate = async () => {
    if (!newTask.provider.trim()) return alert("Nhập tên provider (VD: LINK4M).");
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

  if (loading) return <p className="py-8 text-center text-sm text-slate-400">Đang tải nhiệm vụ...</p>;

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowNew((s) => !s)}
        className="flex w-full items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-sky-200 py-3 text-sm font-semibold text-sky-600"
      >
        <Plus size={15} /> Thêm nhiệm vụ mới
      </button>

      {showNew && (
        <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
          <input
            value={newTask.provider}
            onChange={(e) => setNewTask((n) => ({ ...n, provider: e.target.value }))}
            placeholder="Tên provider (VD: LINK4M)"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-sky-400"
          />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input
              type="number"
              value={newTask.reward_coins}
              onChange={(e) => setNewTask((n) => ({ ...n, reward_coins: e.target.value }))}
              placeholder="Coin thưởng"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-sky-400"
            />
            <input
              type="number"
              value={newTask.daily_limit}
              onChange={(e) => setNewTask((n) => ({ ...n, daily_limit: e.target.value }))}
              placeholder="Giới hạn/ngày"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-sky-400"
            />
          </div>
          <label className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <input
              type="checkbox"
              checked={newTask.is_hot}
              onChange={(e) => setNewTask((n) => ({ ...n, is_hot: e.target.checked }))}
            />
            Đánh dấu HOT
          </label>
          <button
            onClick={handleCreate}
            className="mt-2 w-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-2 text-sm font-semibold text-white"
          >
            Tạo nhiệm vụ
          </button>
          <p className="mt-2 text-[11px] text-slate-400">
            Lưu ý: nếu provider chưa có API thật trong Edge Function (`start-task`), nhiệm vụ sẽ chạy chế độ test (bỏ qua quảng cáo).
          </p>
        </div>
      )}

      {tasks.map((t) => (
        <div key={t.id} className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-900">{t.provider}</p>
            <button onClick={() => handleDelete(t.id)} className="text-rose-400">
              <Trash2 size={16} />
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="text-xs text-slate-400">
              Coin/lượt
              <input
                type="number"
                value={t.reward_coins}
                onChange={(e) => updateField(t.id, "reward_coins", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm outline-none focus:border-sky-400"
              />
            </label>
            <label className="text-xs text-slate-400">
              Giới hạn/ngày
              <input
                type="number"
                value={t.daily_limit}
                onChange={(e) => updateField(t.id, "daily_limit", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm outline-none focus:border-sky-400"
              />
            </label>
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={t.is_hot} onChange={(e) => updateField(t.id, "is_hot", e.target.checked)} />
              HOT
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={t.active} onChange={(e) => updateField(t.id, "active", e.target.checked)} />
              Đang bật
            </label>
          </div>
          <button
            onClick={() => handleSave(t)}
            disabled={savingId === t.id}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full bg-sky-50 py-2 text-sm font-semibold text-sky-700 disabled:opacity-60"
          >
            {savingId === t.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Lưu
          </button>
        </div>
      ))}
    </div>
  );
}

/* ============================== GÓI ROBUX ============================== */

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

  useEffect(() => {
    fetchPackages();
  }, []);

  const updateField = (id, field, value) => {
    setPackages((ps) => ps.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleSave = async (pkg) => {
    setSavingId(pkg.id);
    const { error } = await supabase
      .from("redemption_packages")
      .update({
        coin_cost: Number(pkg.coin_cost),
        original_price_text: pkg.original_price_text,
        is_promo: pkg.is_promo,
        active: pkg.active,
      })
      .eq("id", pkg.id);
    setSavingId(null);
    if (error) alert(error.message);
  };

  if (loading) return <p className="py-8 text-center text-sm text-slate-400">Đang tải gói...</p>;

  return (
    <div className="space-y-3">
      {packages.map((p) => (
        <div key={p.id} className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
          <p className="text-sm font-bold text-slate-900">
            {p.name} <span className="text-xs font-normal text-slate-400">({p.version})</span>
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="text-xs text-slate-400">
              Giá Coin
              <input
                type="number"
                value={p.coin_cost}
                onChange={(e) => updateField(p.id, "coin_cost", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm outline-none focus:border-sky-400"
              />
            </label>
            <label className="text-xs text-slate-400">
              Giá gốc (hiển thị)
              <input
                value={p.original_price_text ?? ""}
                onChange={(e) => updateField(p.id, "original_price_text", e.target.value)}
                placeholder="VD: 14.000đ"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm outline-none focus:border-sky-400"
              />
            </label>
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={p.is_promo} onChange={(e) => updateField(p.id, "is_promo", e.target.checked)} />
              Khuyến mãi (KM)
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={p.active} onChange={(e) => updateField(p.id, "active", e.target.checked)} />
              Đang bán
            </label>
          </div>
          <button
            onClick={() => handleSave(p)}
            disabled={savingId === p.id}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full bg-sky-50 py-2 text-sm font-semibold text-sky-700 disabled:opacity-60"
          >
            {savingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Lưu
          </button>
        </div>
      ))}
    </div>
  );
}

/* ============================== NGƯỜI DÙNG ============================== */

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

  useEffect(() => {
    fetchUsers();
  }, []);

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

  if (loading) return <p className="py-8 text-center text-sm text-slate-400">Đang tải người dùng...</p>;

  return (
    <div className="space-y-3">
      {users.map((u) => (
        <div key={u.id} className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">{u.username || "(chưa đặt tên)"}</p>
              <p className="text-xs text-slate-400">
                Lv {u.level} • {u.coins.toLocaleString("vi-VN")} Coin
              </p>
            </div>
            {u.is_admin && (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-600">ADMIN</span>
            )}
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <input
              type="number"
              value={adjustAmount[u.id] ?? ""}
              onChange={(e) => setAdjustAmount((a) => ({ ...a, [u.id]: e.target.value }))}
              placeholder="+/- Coin"
              className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm outline-none focus:border-sky-400"
            />
            <button
              onClick={() => handleAdjustCoins(u)}
              disabled={savingId === u.id}
              className="flex-1 rounded-full bg-sky-50 py-1.5 text-xs font-semibold text-sky-700 disabled:opacity-60"
            >
              {savingId === u.id ? "Đang lưu..." : "Cộng/Trừ Coin"}
            </button>
            <button
              onClick={() => toggleAdmin(u)}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500"
            >
              {u.is_admin ? "Bỏ Admin" : "Set Admin"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
