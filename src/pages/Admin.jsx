import React, { useState, useEffect } from "react";
import { ShieldCheck, Package, ListChecks, Users, Loader2, Plus, Trash2, Save, Gift, RefreshCw, CheckCircle2, XCircle, LifeBuoy, Ban, Undo2, Search, Eye } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import emailjs from '@emailjs/browser';
import BanUserModal from '../components/BanUserModal.jsx';

const ADMIN_CHAT_ID = 6152450878; 

const SERVICE_ID = 'service_i4wv7md';
const TEMPLATE_ID_REPLY = 'template_i16qct';
const PUBLIC_KEY = 'RCMv-hwVtokArn48n';

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
              <button key={item.key} onClick={() => setTab(item.key)} className={`flex min-w-max items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${tab === item.key ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-500/30" : "border border-blue-100 bg-white text-slate-600 shadow-sm hover:bg-blue-50"}`}>
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

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [detailOrder, setDetailOrder] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
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
    const matchSearch = search.trim() === "" ? true : (o.package_name?.toLowerCase().includes(search.trim().toLowerCase()) || o.delivery_target?.toLowerCase().includes(search.trim().toLowerCase()) || String(o.id).toLowerCase().includes(search.trim().toLowerCase()));
    return matchFilter && matchSearch;
  });

  const pendingCount = orders.filter(o => o.status === "pending").length;
  const deliveredCount = orders.filter(o => o.status === "delivered").length;
  const rejectedCount = orders.filter(o => o.status === "rejected").length;

  const handleDelivered = async (order) => {
    setSavingId(order.id);
    const { error } = await supabase.from("redemption_orders").update({ status: "delivered", processed_at: new Date().toISOString() }).eq("id", order.id);
    setSavingId(null);
    if (error) { alert(error.message); return; }
    
    try {
      await supabase.functions.invoke("telegram-webhook", {
        body: {
          message: {
            text: `✅ Đã duyệt đơn hàng!\n📦 Gói: ${order.package_name}\n👤 User: ${order.user_id}\n💰 Coin: ${order.coins_charged}\n🆔 Mã đơn: ${order.id}`,
            chat: { id: ADMIN_CHAT_ID }
          }
        }
      });
    } catch (teleError) {
      console.error("Lỗi gửi Telegram:", teleError);
    }
    
    await fetchOrders();
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { alert("Vui lòng nhập lý do từ chối!"); return; }
    setSavingId(rejectModal.id);
    const { error } = await supabase.rpc("refund_order_points", { p_order_id: rejectModal.id, p_reason: rejectReason.trim() });
    setSavingId(null);
    if (error) { alert(error.message); return; }
    
    try {
      await supabase.functions.invoke("telegram-webhook", {
        body: {
          message: {
            text: `❌ Đã từ chối đơn hàng!\n📦 Gói: ${rejectModal.package_name}\n👤 User: ${rejectModal.user_id}\n💰 Coin: ${rejectModal.coins_charged}\n🆔 Mã đơn: ${rejectModal.id}\n📝 Lý do: ${rejectReason}`,
            chat: { id: ADMIN_CHAT_ID }
          }
        }
      });
    } catch (teleError) {
      console.error("Lỗi gửi Telegram:", teleError);
    }
    
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
                  <button onClick={() => handleDelivered(order)} disabled={savingId === order.id} className="flex-1 rounded-full bg-emerald-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><CheckCircle2 size={14} className="inline mr-1" /> Đã giao</button>
                  <button onClick={() => setRejectModal(order)} disabled={savingId === order.id} className="flex-1 rounded-full bg-rose-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><XCircle size={14} className="inline mr-1" /> Từ chối</button>
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
function SupportTab() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [replyingId, setReplyingId] = useState(null);

  const fetchTickets = async () => {
    setLoading(true);
    const { data } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
    setTickets(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleReply = async (ticketId) => {
    if (!replyText.trim()) {
      alert('Vui lòng nhập nội dung phản hồi!');
      return;
    }

    setReplyingId(ticketId);

    try {
      const ticket = tickets.find(t => t.id === ticketId);
      if (!ticket) throw new Error('Không tìm thấy ticket');

      const { error: updateError } = await supabase.rpc("ban_linked_group", {
      p_user_id: user.id,
      p_reason: finalReason.trim(),
      p_note: note.trim() || null,
      p_banned_until: bannedUntil,
    });

      if (dbError) throw new Error('Lỗi DB: ' + dbError.message);

      try {
        const result = await emailjs.send(
          SERVICE_ID,
          TEMPLATE_ID_REPLY,
          {
            user_name: ticket.user_name || 'Khách',
            admin_reply: replyText,
            user_subject: ticket.subject || 'Không có chủ đề',
            user_message: ticket.message || 'Không có nội dung'
          },
          PUBLIC_KEY
        );

        if (result.status !== 200) {
          throw new Error('EmailJS status: ' + result.status);
        }
      } catch (emailError) {
        console.error('EmailJS error:', emailError);
        alert('⚠️ Đã lưu phản hồi nhưng gửi email thất bại: ' + (emailError.message || 'Lỗi không xác định'));
        setReplyText('');
        await fetchTickets();
        setReplyingId(null);
        return;
      }

      try {
        await supabase.functions.invoke("telegram-webhook", {
          body: {
            message: {
              text: `💬 Đã phản hồi yêu cầu hỗ trợ!\n👤 User: ${ticket.user_name}\n📌 Chủ đề: ${ticket.subject}\n📝 Nội dung: ${replyText}`,
              chat: { id: ADMIN_CHAT_ID }
            }
          }
        });
      } catch (teleError) {
        console.error("Lỗi gửi Telegram:", teleError);
      }

      setReplyText('');
      await fetchTickets();
      alert('✅ Đã gửi phản hồi thành công!');

    } catch (err) {
      alert('❌ Lỗi: ' + err.message);
      console.error('Error:', err);
    } finally {
      setReplyingId(null);
    }
  };

  if (loading) return <Loading text="Loading tickets..." />;
  if (tickets.length === 0) return <EmptyState text="Chưa có yêu cầu hỗ trợ nào." />;

  return (
    <div className="space-y-4">
      <SectionHeader title="Yêu cầu hỗ trợ" count={`${tickets.length} Yêu cầu`} onRefresh={fetchTickets} />
      {tickets.map((ticket) => (
        <div key={ticket.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900">{ticket.user_name || 'Khách'}</span>
                <span className="text-xs text-slate-400">• {ticket.user_email}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ticket.status === 'pending' ? 'bg-amber-50 text-amber-600' : ticket.status === 'replied' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {ticket.status === 'pending' ? '⏳ Chờ xử lý' : ticket.status === 'replied' ? '💬 Đã phản hồi' : '✅ Đã xử lý'}
                </span>
              </div>
              <p className="mt-2 font-semibold text-slate-900">📌 {ticket.subject}</p>
              <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{ticket.message}</p>
              <p className="mt-2 text-xs text-slate-400">{new Date(ticket.created_at).toLocaleString('vi-VN')}</p>
              {ticket.admin_reply && (
                <div className="mt-3 rounded-xl bg-sky-50 p-3 border border-sky-200">
                  <p className="text-xs font-semibold text-sky-700">💬 Phản hồi từ admin:</p>
                  <p className="mt-1 text-sm text-slate-700">{ticket.admin_reply}</p>
                </div>
              )}
            </div>
          </div>
          {ticket.status === 'pending' && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={3} placeholder="Nhập nội dung phản hồi..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400" />
              <button onClick={() => handleReply(ticket.id)} disabled={replyingId === ticket.id} className="mt-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-md disabled:opacity-50">
                {replyingId === ticket.id ? <Loader2 size={16} className="animate-spin mx-auto" /> : '📤 Gửi phản hồi'}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banModalUser, setBanModalUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("coins", { ascending: false });
    setUsers(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleUnban = async (user) => {
    await supabase.from("profiles").update({
      is_banned: false,
      ban_reason: null,
      ban_note: null,
      banned_until: null,
      banned_at: null,
    }).eq("id", user.id);

    try {
      await supabase.functions.invoke("telegram-webhook", {
        body: {
          message: {
            text: `✅ Đã mở ban user!\n👤 User: ${user.username || user.id}`,
            chat: { id: ADMIN_CHAT_ID }
          }
        }
      });
    } catch (teleError) {
      console.error("Lỗi gửi Telegram:", teleError);
    }

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
              <th className="px-6 py-4">Cảnh báo</th>
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
                <td className="px-6 py-4">
                  {user.multi_account_flag ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600">
                      ⚠️ Nghi đa tài khoản
                    </span>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {user.is_banned ? (
                    <button onClick={() => handleUnban(user)} className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white"><Undo2 size={12} className="inline mr-1" /> Mở khóa</button>
                  ) : (
                    <button onClick={() => setBanModalUser(user)} className="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white"><Ban size={12} className="inline mr-1" /> Ban</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {banModalUser && (
        <BanUserModal
          user={banModalUser}
          onClose={() => setBanModalUser(null)}
          onBanned={fetchUsers}
        />
      )}
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
        </div>
      ))}
    </div>
  );
}

function SectionHeader({ title, count, onRefresh }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <span className="text-sm font-semibold text-slate-400">{count}</span>
      </div>
      <button onClick={onRefresh} className="rounded-full bg-blue-50 p-2 text-blue-600 hover:bg-blue-100">
        <RefreshCw size={16} />
      </button>
    </div>
  );
}

function Loading({ text }) {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 size={24} className="animate-spin text-blue-500" />
      <p className="ml-3 text-sm text-slate-500">{text}</p>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="py-12 text-center">
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}
