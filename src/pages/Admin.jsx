import React, { useState, useEffect } from "react";
import { ShieldCheck, Package, ListChecks, Users, Loader2, Plus, Trash2, Save, Gift, RefreshCw, CheckCircle2, XCircle, LifeBuoy, Ban, Undo2, Search, Eye, Bell, Edit2, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";

const TABS = [
  { key: "orders", label: "Đơn hàng", icon: Package, desc: "Quản lý đổi thưởng" },
  { key: "tasks", label: "Nhiệm vụ", icon: ListChecks, desc: "Cấu hình nhiệm vụ" },
  { key: "packages", label: "Gói Robux", icon: Gift, desc: "Quản lý cửa hàng" },
  { key: "users", label: "Người dùng", icon: Users, desc: "Quản lý tài khoản" },
  { key: "support", label: "Hỗ trợ", icon: LifeBuoy, desc: "Yêu cầu hỗ trợ" },
  { key: "notices", label: "Thông báo", icon: Bell, desc: "Quản lý thông báo" }, // 👈 Thêm tab mới
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

/* ===== ORDERS TAB ===== */
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [detailOrder, setDetailOrder] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [confirmModal, setConfirmModal] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from("redemption_orders").select("*").order("created_at", { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const filteredOrders = orders.filter(o => {
    const matchFilter = filter === "all" ? true : o.status === filter;
    const matchSearch = search.trim() === "" ? true : (
      o.package_name?.toLowerCase().includes(search.trim().toLowerCase()) || 
      o.delivery_target?.toLowerCase().includes(search.trim().toLowerCase()) ||
      String(o.id).toLowerCase().includes(search.trim().toLowerCase())
    );
    return matchFilter && matchSearch;
  });

  const pendingCount = orders.filter(o => o.status === "pending").length;
  const deliveredCount = orders.filter(o => o.status === "delivered").length;
  const rejectedCount = orders.filter(o => o.status === "rejected").length;

  // ✅ Dùng update trực tiếp thay vì RPC
  const handleDelivered = async () => {
    if (!confirmModal) return;
    setSavingId(confirmModal.id);
    const { error } = await supabase.from("redemption_orders").update({
      status: "delivered",
      processed_at: new Date().toISOString()
    }).eq("id", confirmModal.id);
    setSavingId(null);
    if (error) { alert(error.message); return; }
    setConfirmModal(null);
    await fetchOrders();
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối!");
      return;
    }
    setSavingId(rejectModal.id);
    const { error } = await supabase.from("redemption_orders").update({
      status: "rejected",
      admin_note: rejectReason.trim(),
      processed_at: new Date().toISOString()
    }).eq("id", rejectModal.id);
    setSavingId(null);
    if (error) { alert(error.message); return; }
    setRejectModal(null);
    setRejectReason("");
    await fetchOrders();
  };

  if (loading) return <Loading text="Loading orders..." />;

  return (
    <div className="space-y-5">
      <SectionHeader title="Đơn đổi thưởng" count={`${orders.length} Đơn`} onRefresh={fetchOrders} />

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-amber-50 p-4 text-center"><p className="text-2xl font-bold text-amber-600">{pendingCount}</p><p className="text-xs text-amber-600">Chờ xử lý</p></div>
        <div className="rounded-2xl bg-emerald-50 p-4 text-center"><p className="text-2xl font-bold text-emerald-600">{deliveredCount}</p><p className="text-xs text-emerald-600">Đã giao</p></div>
        <div className="rounded-2xl bg-rose-50 p-4 text-center"><p className="text-2xl font-bold text-rose-600">{rejectedCount}</p><p className="text-xs text-rose-600">Từ chối</p></div>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <Search size={16} className="text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm mã đơn / username..." className="w-full bg-transparent text-sm outline-none" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "pending", "delivered", "rejected"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-xs font-semibold ${filter === f ? "bg-blue-500 text-white" : "bg-white text-slate-500"}`}>
            {f === "all" ? "Tất cả" : f === "pending" ? "Chờ xử lý" : f === "delivered" ? "Đã giao" : "Từ chối"}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? <EmptyState text="Không tìm thấy đơn hàng." /> : filteredOrders.map((order) => (
          <div key={order.id} className={`rounded-2xl border p-5 shadow-sm ${order.status === "delivered" ? "bg-emerald-50/30 border-emerald-100" : order.status === "rejected" ? "bg-rose-50/30 border-rose-100" : "bg-white border-slate-200"}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-slate-900">{order.package_name} • #{String(order.id).slice(0, 8)}</p>
                <p className="mt-1 text-xs text-slate-400">Người dùng: {order.delivery_target || order.user_id}</p>
                <p className="mt-1 text-xs text-slate-400">Ngày: {new Date(order.created_at).toLocaleString("vi-VN")}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${order.status === "pending" ? "bg-amber-50 text-amber-600" : order.status === "delivered" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                {order.status === "pending" ? "Chờ xử lý" : order.status === "delivered" ? "Đã giao" : "Từ chối"}
              </span>
            </div>

            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">
              <p><span className="font-bold">Phương thức:</span> {order.delivery_method || "Nạp thẳng"}</p>
              <p><span className="font-bold">Thông tin nhận:</span> {order.delivery_target || order.target_username || "—"}</p>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={() => setDetailOrder(order)} className="flex-1 rounded-full bg-slate-100 py-2.5 text-sm font-semibold text-slate-600"><Eye size={14} className="inline mr-1" /> Xem chi tiết</button>
              {order.status === "pending" && (
                <>
                  <button onClick={() => setConfirmModal(order)} disabled={savingId === order.id} className="flex-1 rounded-full bg-emerald-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                    <CheckCircle2 size={14} className="inline mr-1" /> Đã giao
                  </button>
                  <button onClick={() => setRejectModal(order)} disabled={savingId === order.id} className="flex-1 rounded-full bg-rose-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                    <XCircle size={14} className="inline mr-1" /> Từ chối
                  </button>
                </>
              )}
            </div>

            {order.admin_note && <p className="mt-3 rounded-lg bg-slate-100 p-3 text-xs italic text-slate-500">Lý do: {order.admin_note}</p>}
          </div>
        ))}
      </div>

      {detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">Đơn #{String(detailOrder.id).slice(0, 8)}</h2>
            <p className="mt-1 text-sm text-slate-500">{detailOrder.package_name} • {detailOrder.coins_charged} Coin</p>
            <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
              <p><span className="font-bold">Người dùng:</span> {detailOrder.user_id}</p>
              <p><span className="font-bold">Phương thức:</span> {detailOrder.delivery_method || "—"}</p>
              <p><span className="font-bold">Thông tin nhận:</span> {detailOrder.delivery_target || "—"}</p>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-700">Lịch sử xử lý</p>
            <div className="mt-2 space-y-2 text-xs">
              <p><span className="text-amber-500">🟡</span> {new Date(detailOrder.created_at).toLocaleString("vi-VN")} - Đơn được tạo</p>
              {detailOrder.status === "delivered" && <p><span className="text-emerald-500">🟢</span> {new Date(detailOrder.processed_at).toLocaleString("vi-VN")} - Đã giao</p>}
              {detailOrder.status === "rejected" && (
                <>
                  <p><span className="text-rose-500">🔴</span> {new Date(detailOrder.processed_at).toLocaleString("vi-VN")} - Bị từ chối</p>
                  <p className="text-emerald-600">🪙 Hoàn {detailOrder.coins_charged} coin</p>
                </>
              )}
            </div>
            <button onClick={() => setDetailOrder(null)} className="mt-6 w-full rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-600">Đóng</button>
          </div>
        </div>
      )}

      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">Xác nhận giao hàng?</h2>
            <p className="mt-2 text-sm text-slate-500">Sau khi xác nhận, đơn sẽ chuyển sang Đã giao và không thể xử lý lại.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setConfirmModal(null)} className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-600">Hủy</button>
              <button onClick={handleDelivered} disabled={savingId === confirmModal.id} className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white disabled:opacity-50">
                {savingId === confirmModal.id ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Xác nhận đã giao"}
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">Từ chối đơn #{String(rejectModal.id).slice(0, 8)}</h2>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} placeholder="Lý do từ chối..." className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400" />
            <p className="mt-2 text-sm font-semibold text-emerald-600">💰 Coin sẽ được hoàn: {rejectModal.coins_charged} coin</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setRejectModal(null)} className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-600">Hủy</button>
              <button onClick={handleReject} disabled={savingId === rejectModal.id} className="flex-1 rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white disabled:opacity-50">
                {savingId === rejectModal.id ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Từ chối & hoàn coin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== CÁC TAB KHÁC ===== */
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
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${ticket.status === "pending" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>{ticket.status === "pending" ? "Chờ xử lý" : "Đã xử lý"}</span>
              <p className="mt-2 text-sm font-bold text-slate-900">{ticket.subject}</p>
              <p className="mt-1 text-sm text-slate-600">{ticket.message}</p>
              <p className="mt-1 text-xs text-slate-400">User ID: {ticket.user_id} • {new Date(ticket.created_at).toLocaleString("vi-VN")}</p>
            </div>
            {ticket.status === "pending" && <button onClick={() => handleResolve(ticket)} className="shrink-0 rounded-full bg-emerald-500 px-5 py-2 text-xs font-semibold text-white">Đã xử lý</button>}
          </div>
        </div>
      ))}
    </div>
  );
}

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
                <td className="px-6 py-4">{user.is_banned ? <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600">Bị ban</span> : <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">Hoạt động</span>}</td>
                <td className="px-6 py-4 text-right">
                  {user.is_banned ? <button onClick={() => handleUnban(user)} className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white"><Undo2 size={12} className="inline mr-1" /> Mở khóa</button> : <button onClick={() => handleBan(user)} className="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white"><Ban size={12} className="inline mr-1" /> Ban</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
        </div>
      ))}
    </div>
  );
}

function Pack
/* ===== NOTICES TAB ===== */
function NoticesTab() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'warning',
    icon: 'bell',
    status_1: '',
    status_2: '',
    status_3: '',
    progress_label: '',
    action_label: '',
    action_link: '',
    link_text: '',
    link: '',
    active: true,
    priority: 0
  });
  const [isEditing, setIsEditing] = useState(false);

  const fetchNotices = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("admin_notices")
      .select("*")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });
    setNotices(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      alert("Vui lòng nhập tiêu đề và nội dung!");
      return;
    }

    setLoading(true);
    if (isEditing && editing) {
      // Update
      await supabase
        .from("admin_notices")
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq("id", editing);
    } else {
      // Insert
      await supabase
        .from("admin_notices")
        .insert([formData]);
    }

    setLoading(false);
    setIsEditing(false);
    setEditing(null);
    setFormData({
      title: '',
      content: '',
      type: 'warning',
      icon: 'bell',
      status_1: '',
      status_2: '',
      status_3: '',
      progress_label: '',
      action_label: '',
      action_link: '',
      link_text: '',
      link: '',
      active: true,
      priority: 0
    });
    await fetchNotices();
  };

  const handleEdit = (notice) => {
    setEditing(notice.id);
    setIsEditing(true);
    setFormData({
      title: notice.title || '',
      content: notice.content || '',
      type: notice.type || 'warning',
      icon: notice.icon || 'bell',
      status_1: notice.status_1 || '',
      status_2: notice.status_2 || '',
      status_3: notice.status_3 || '',
      progress_label: notice.progress_label || '',
      action_label: notice.action_label || '',
      action_link: notice.action_link || '',
      link_text: notice.link_text || '',
      link: notice.link || '',
      active: notice.active ?? true,
      priority: notice.priority || 0
    });
  };

  const handleToggleActive = async (id, current) => {
    await supabase
      .from("admin_notices")
      .update({ active: !current })
      .eq("id", id);
    await fetchNotices();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa thông báo này?")) {
      await supabase
        .from("admin_notices")
        .delete()
        .eq("id", id);
      await fetchNotices();
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditing(null);
    setFormData({
      title: '',
      content: '',
      type: 'warning',
      icon: 'bell',
      status_1: '',
      status_2: '',
      status_3: '',
      progress_label: '',
      action_label: '',
      action_link: '',
      link_text: '',
      link: '',
      active: true,
      priority: 0
    });
  };

  if (loading && notices.length === 0) return <Loading text="Đang tải thông báo..." />;

  return (
    <div className="space-y-5">
      <SectionHeader title="Quản lý thông báo" count={`${notices.length} Thông báo`} onRefresh={fetchNotices} />

      {/* Form thêm/sửa */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-blue-800 mb-3">
          {isEditing ? '✏️ Sửa thông báo' : '➕ Thêm thông báo mới'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="Tiêu đề *"
            className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400"
          />
          <input
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            placeholder="Nội dung *"
            className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400"
          />
          <select
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400"
          >
            <option value="info">📘 Info (Xanh)</option>
            <option value="warning">⚠️ Warning (Vàng)</option>
            <option value="danger">🔴 Danger (Đỏ)</option>
            <option value="success">✅ Success (Xanh lá)</option>
          </select>
          <input
            value={formData.status_1}
            onChange={(e) => setFormData({...formData, status_1: e.target.value})}
            placeholder="Status 1 (VD: Đăng ký)"
            className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400"
          />
          <input
            value={formData.status_2}
            onChange={(e) => setFormData({...formData, status_2: e.target.value})}
            placeholder="Status 2 (VD: Ký hợp đồng)"
            className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400"
          />
          <input
            value={formData.status_3}
            onChange={(e) => setFormData({...formData, status_3: e.target.value})}
            placeholder="Status 3 (VD: Chờ phê duyệt)"
            className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400"
          />
          <input
            value={formData.progress_label}
            onChange={(e) => setFormData({...formData, progress_label: e.target.value})}
            placeholder="Progress label (VD: Kiểm tra...)"
            className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400"
          />
          <input
            value={formData.action_label}
            onChange={(e) => setFormData({...formData, action_label: e.target.value})}
            placeholder="Nút hành động (VD: Màn hình chính)"
            className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400"
          />
          <input
            value={formData.action_link}
            onChange={(e) => setFormData({...formData, action_link: e.target.value})}
            placeholder="Link nút hành động (VD: /)"
            className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400"
          />
          <input
            value={formData.link_text}
            onChange={(e) => setFormData({...formData, link_text: e.target.value})}
            placeholder="Link text (VD: Tìm hiểu thêm)"
            className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400"
          />
          <input
            value={formData.link}
            onChange={(e) => setFormData({...formData, link: e.target.value})}
            placeholder="Link (VD: https://t.me/...)"
            className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400"
          />
          <input
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
            placeholder="Priority (số càng cao càng ưu tiên)"
            className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400"
          />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({...formData, active: e.target.checked})}
                className="w-4 h-4"
              />
              Active
            </label>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isEditing ? 'Cập nhật' : 'Thêm mới'}
          </button>
          {isEditing && (
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-300 transition"
            >
              Hủy
            </button>
          )}
        </div>
      </div>

      {/* Danh sách thông báo */}
      {notices.length === 0 ? (
        <EmptyState text="Chưa có thông báo nào." />
      ) : (
        <div className="space-y-3">
          {notices.map((notice) => (
            <div key={notice.id} className={`rounded-2xl border p-5 shadow-sm ${
              notice.active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-bold ${notice.active ? 'text-slate-900' : 'text-slate-500'}`}>
                      {notice.title}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      notice.type === 'danger' ? 'bg-rose-100 text-rose-700' :
                      notice.type === 'warning' ? 'bg-amber-100 text-amber-700' :
                      notice.type === 'success' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {notice.type}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      notice.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {notice.active ? '🟢 Hiển thị' : '⚪ Ẩn'}
                    </span>
                    {notice.priority > 0 && (
                      <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                        Priority: {notice.priority}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{notice.content}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                    {notice.status_1 && <span>✓ {notice.status_1}</span>}
                    {notice.status_2 && <span>• {notice.status_2}</span>}
                    {notice.status_3 && <span>• {notice.status_3}</span>}
                    {notice.progress_label && <span>⏱ {notice.progress_label}</span>}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Tạo: {new Date(notice.created_at).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  <button
                    onClick={() => handleToggleActive(notice.id, notice.active)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      notice.active ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    } transition`}
                  >
                    {notice.active ? 'Ẩn' : 'Hiện'}
                  </button>
                  <button
                    onClick={() => handleEdit(notice)}
                    className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-200 transition"
                  >
                    <Edit2 size={14} className="inline mr-1" /> Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(notice.id)}
                    className="rounded-full bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-200 transition"
                  >
                    <Trash2 size={14} className="inline mr-1" /> Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
        }
