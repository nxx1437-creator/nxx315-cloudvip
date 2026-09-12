import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Check,
  X,
  Ban,
  ShieldCheck,
  MessageCircle,
  Package,
  Users,
  ListTodo,
  HandCoins,
  FileText,
  ChevronRight,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  UserCheck,
  UserX,
  Gift,
  Coins,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import emailjs from "@emailjs/browser";
import BanUserModal from "../components/BanUserModal";
import RobloxOrdersTab from "../pages/RobloxOrdersTab";

const ADMIN_CHAT_ID = "6152450878";

const EMAIL_SERVICE_ID = "YOUR_EMAIL_SERVICE_ID";
const EMAIL_TEMPLATE_ID = "YOUR_EMAIL_TEMPLATE_ID";
const EMAIL_PUBLIC_KEY = "YOUR_EMAIL_PUBLIC_KEY";

const PACKAGE_IMAGES = {
  "card-400":
    "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-400.png",
  "vng-40":
    "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-40.png",
  "vng-80":
    "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-80.png",
  "vng-500":
    "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-500.png",
};

const tabs = [
  { id: "orders", label: "Đơn hàng", icon: Package },
  { id: "roblox-orders", label: "Roblox", icon: Gift },
  { id: "tasks", label: "Nhiệm vụ", icon: ListTodo },
  { id: "packages", label: "Gói nạp", icon: Coins },
  { id: "users", label: "Người dùng", icon: Users },
  { id: "support", label: "Hỗ trợ", icon: MessageCircle },
  { id: "affiliate", label: "Affiliate", icon: HandCoins },
  { id: "posts", label: "Bài viết", icon: FileText },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState("orders");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <ShieldCheck size={23} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-slate-500">
                Quản lý CloudVIP
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-5">
        <div className="mb-5 flex gap-2 overflow-x-auto rounded-2xl border bg-white p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={17} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "orders" && <OrdersTab />}
        {activeTab === "roblox-orders" && <RobloxOrdersTab />}
        {activeTab === "tasks" && <TasksTab />}
        {activeTab === "packages" && <PackagesTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "support" && <SupportTab />}
        {activeTab === "affiliate" && <AffiliateTab />}
        {activeTab === "posts" && <PostsTab />}
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detailOrder, setDetailOrder] = useState(null);
  const [rejectOrder, setRejectOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("redemption_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setOrders(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return orders;

    return orders.filter((order) =>
      [
        order.id,
        order.order_code,
        order.roblox_username,
        order.roblox_user_id,
        order.status,
        order.package_id,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(keyword)
        )
    );
  }, [orders, search]);

  const notifyTelegram = async (message) => {
    try {
      await fetch("/api/telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          text: message,
        }),
      });
    } catch {
      // Không làm fail thao tác chính
    }
  };

  const handleDelivered = async (order) => {
    if (processing) return;

    setProcessing(true);

    const { error } = await supabase
      .from("redemption_orders")
      .update({
        status: "delivered",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (!error) {
      await notifyTelegram(
        `✅ Đơn hàng #${order.order_code || order.id} đã giao thành công.`
      );

      await fetchOrders();
      setDetailOrder(null);
    }

    setProcessing(false);
  };

  const handleReject = async () => {
    if (!rejectOrder || processing) return;

    setProcessing(true);

    const { error } = await supabase
      .from("redemption_orders")
      .update({
        status: "rejected",
        note: rejectReason.trim() || "Đơn hàng bị từ chối",
        updated_at: new Date().toISOString(),
      })
      .eq("id", rejectOrder.id);

    if (!error) {
      await notifyTelegram(
        `❌ Đơn hàng #${
          rejectOrder.order_code || rejectOrder.id
        } bị từ chối.\nLý do: ${
          rejectReason.trim() || "Không có lý do"
        }`
      );

      await fetchOrders();

      setRejectOrder(null);
      setRejectReason("");
      setDetailOrder(null);
    }

    setProcessing(false);
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Đơn hàng"
        description="Quản lý đơn hàng đổi thưởng"
        onRefresh={fetchOrders}
        loading={loading}
      />

      <div className="rounded-2xl border bg-white p-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã đơn, Roblox ID, username..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : filteredOrders.length === 0 ? (
        <EmptyState text="Không có đơn hàng nào" />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left">Đơn</th>
                  <th className="px-4 py-3 text-left">Roblox</th>
                  <th className="px-4 py-3 text-left">Gói</th>
                  <th className="px-4 py-3 text-left">Số tiền</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Thời gian</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-semibold">
                      #{order.order_code || order.id}
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900">
                        {order.roblox_username || "-"}
                      </div>

                      <div className="text-xs text-slate-500">
                        {order.roblox_user_id || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {order.package_id || "-"}
                    </td>

                    <td className="px-4 py-4 font-semibold">
                      {Number(order.amount || 0).toLocaleString("vi-VN")}đ
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={order.status} />
                    </td>

                    <td className="px-4 py-4 text-slate-500">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleString("vi-VN")
                        : "-"}
                    </td>

                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => setDetailOrder(order)}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detailOrder && (
        <Modal
          title={`Đơn #${detailOrder.order_code || detailOrder.id}`}
          onClose={() => setDetailOrder(null)}
        >
          <div className="space-y-3">
            <InfoBox
              label="Roblox"
              value={
                detailOrder.roblox_username ||
                detailOrder.roblox_user_id ||
                "-"
              }
            />

            <InfoBox
              label="Gói"
              value={detailOrder.package_id || "-"}
            />

            <InfoBox
              label="Số tiền"
              value={`${Number(
                detailOrder.amount || 0
              ).toLocaleString("vi-VN")}đ`}
            />

            <InfoBox
              label="Phương thức"
              value={detailOrder.payment_method || "-"}
            />

            <InfoBox
              label="Trạng thái"
              value={<StatusBadge status={detailOrder.status} />}
            />

            {detailOrder.note && (
              <InfoBox label="Ghi chú" value={detailOrder.note} />
            )}

            <div className="flex gap-2 pt-3">
              {detailOrder.status !== "delivered" && (
                <button
                  disabled={processing}
                  onClick={() => handleDelivered(detailOrder)}
                  className="flex-1 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  <Check size={17} className="mr-2 inline" />
                  Đã giao
                </button>
              )}

              {detailOrder.status !== "rejected" && (
                <button
                  disabled={processing}
                  onClick={() => setRejectOrder(detailOrder)}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  <X size={17} className="mr-2 inline" />
                  Từ chối
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {rejectOrder && (
        <Modal
          title="Từ chối đơn hàng"
          onClose={() => {
            setRejectOrder(null);
            setRejectReason("");
          }}
        >
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Nhập lý do từ chối..."
            rows={4}
            className="w-full rounded-xl border p-3 outline-none focus:border-blue-500"
          />

          <button
            disabled={processing}
            onClick={handleReject}
            className="mt-3 w-full rounded-xl bg-red-600 py-3 font-semibold text-white disabled:opacity-50"
          >
            {processing ? "Đang xử lý..." : "Xác nhận từ chối"}
          </button>
        </Modal>
      )}
    </div>
  );
  }
function SupportTab() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setTickets(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const sendReply = async () => {
    if (!selected || !reply.trim() || sending) return;

    setSending(true);

    const message = reply.trim();

    const { error } = await supabase
      .from("support_tickets")
      .update({
        admin_reply: message,
        status: "answered",
        updated_at: new Date().toISOString(),
      })
      .eq("id", selected.id);

    if (!error) {
      try {
        await emailjs.send(
          EMAIL_SERVICE_ID,
          EMAIL_TEMPLATE_ID,
          {
            to_email: selected.email,
            message,
          },
          EMAIL_PUBLIC_KEY
        );
      } catch {
        // Email lỗi không làm fail reply trong DB
      }

      try {
        await fetch("/api/telegram", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: ADMIN_CHAT_ID,
            text: `💬 Đã trả lời ticket #${selected.id}`,
          }),
        });
      } catch {}

      setReply("");
      await fetchTickets();

      const updated = {
        ...selected,
        admin_reply: message,
        status: "answered",
      };

      setSelected(updated);
    }

    setSending(false);
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Hỗ trợ"
        description="Quản lý yêu cầu hỗ trợ của người dùng"
        onRefresh={fetchTickets}
        loading={loading}
      />

      {loading ? (
        <Loading />
      ) : tickets.length === 0 ? (
        <EmptyState text="Không có ticket hỗ trợ" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => setSelected(ticket)}
              className="rounded-2xl border bg-white p-5 text-left transition hover:border-blue-300 hover:shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-bold">
                  Ticket #{ticket.id}
                </span>

                <StatusBadge status={ticket.status} />
              </div>

              <p className="line-clamp-2 text-slate-600">
                {ticket.message ||
                  ticket.content ||
                  ticket.subject ||
                  "Không có nội dung"}
              </p>

              <div className="mt-3 text-xs text-slate-400">
                {ticket.created_at
                  ? new Date(ticket.created_at).toLocaleString("vi-VN")
                  : "-"}
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <Modal
          title={`Ticket #${selected.id}`}
          onClose={() => setSelected(null)}
        >
          <div className="space-y-4">
            <InfoBox
              label="Email"
              value={selected.email || "-"}
            />

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-2 text-xs font-bold uppercase text-slate-400">
                Nội dung
              </div>

              <p className="whitespace-pre-wrap text-sm text-slate-700">
                {selected.message ||
                  selected.content ||
                  selected.subject ||
                  "-"}
              </p>
            </div>

            {selected.admin_reply && (
              <div className="rounded-xl bg-blue-50 p-4">
                <div className="mb-2 text-xs font-bold uppercase text-blue-500">
                  Admin đã trả lời
                </div>

                <p className="whitespace-pre-wrap text-sm text-slate-700">
                  {selected.admin_reply}
                </p>
              </div>
            )}

            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Nhập câu trả lời..."
              rows={5}
              className="w-full rounded-xl border p-3 outline-none focus:border-blue-500"
            />

            <button
              disabled={sending || !reply.trim()}
              onClick={sendReply}
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Send size={17} className="mr-2 inline" />
              {sending ? "Đang gửi..." : "Gửi trả lời"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [banUser, setBanUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setUsers(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return users;

    return users.filter((user) =>
      [
        user.username,
        user.email,
        user.id,
        user.roblox_username,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(keyword)
        )
    );
  }, [users, search]);

  const togglePostPermission = async (user) => {
    const nextValue = !user.can_post;

    const { error } = await supabase
      .from("profiles")
      .update({
        can_post: nextValue,
      })
      .eq("id", user.id);

    if (!error) {
      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id
            ? { ...item, can_post: nextValue }
            : item
        )
      );
    }
  };

  const unbanUser = async (user) => {
    const { error } = await supabase
      .from("profiles")
      .update({
        banned: false,
        ban_reason: null,
      })
      .eq("id", user.id);

    if (!error) {
      await fetchUsers();
    }
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Người dùng"
        description="Quản lý tài khoản người dùng"
        onRefresh={fetchUsers}
        loading={loading}
      />

      <div className="rounded-2xl border bg-white p-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm username, email..."
            className="w-full rounded-xl border py-3 pl-10 pr-4 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : filteredUsers.length === 0 ? (
        <EmptyState text="Không tìm thấy người dùng" />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left">Người dùng</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Coin</th>
                  <th className="px-4 py-3 text-left">Đăng bài</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-4">
                      <div className="font-semibold">
                        {user.username || "Không tên"}
                      </div>

                      <div className="text-xs text-slate-400">
                        {user.id}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {user.email || "-"}
                    </td>

                    <td className="px-4 py-4 font-semibold">
                      {Number(user.coins || 0).toLocaleString("vi-VN")}
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={() => togglePostPermission(user)}
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          user.can_post
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {user.can_post ? "Được phép" : "Không"}
                      </button>
                    </td>

                    <td className="px-4 py-4">
                      {user.banned ? (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                          Đã ban
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                          Hoạt động
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-right">
                      {user.banned ? (
                        <button
                          onClick={() => unbanUser(user)}
                          className="rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-100"
                        >
                          <UserCheck size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => setBanUser(user)}
                          className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                        >
                          <Ban size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {banUser && (
        <BanUserModal
          user={banUser}
          onClose={() => setBanUser(null)}
          onSuccess={async () => {
            setBanUser(null);
            await fetchUsers();
          }}
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

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setTasks(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Nhiệm vụ"
        description="Quản lý nhiệm vụ kiếm coin"
        onRefresh={fetchTasks}
        loading={loading}
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border bg-white p-5"
            >
              <div className="mb-4 h-5 w-32 rounded bg-slate-200" />
              <div className="mb-2 h-4 w-full rounded bg-slate-200" />
              <div className="h-4 w-2/3 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState text="Chưa có nhiệm vụ" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-2xl border bg-white p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className="font-bold text-slate-900">
                  {task.name || task.title || "Nhiệm vụ"}
                </h3>

                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                  +{Number(task.reward || task.coins || 0)}
                </span>
              </div>

              <p className="text-sm text-slate-500">
                {task.description || "Không có mô tả"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PackagesTab() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPackages = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("redemption_packages")
      .select("*")
      .order("coin_cost", { ascending: true });

    if (!error) {
      setPackages(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Gói nạp"
        description="Quản lý các gói Robux"
        onRefresh={fetchPackages}
        loading={loading}
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <PackageSkeleton key={item} />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <EmptyState text="Chưa có gói nạp" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {packages.map((pkg) => {
            const image =
              pkg.image_url ||
              pkg.image ||
              PACKAGE_IMAGES[pkg.id];

            return (
              <div
                key={pkg.id}
                className="overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-40 items-center justify-center bg-slate-50 p-5">
                  {image ? (
                    <img
                      src={image}
                      alt={pkg.name || pkg.id}
                      className="h-full max-w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling.style.display =
                          "flex";
                      }}
                    />
                  ) : null}

                  <div
                    className={`${
                      image ? "hidden" : "flex"
                    } h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-500`}
                  >
                    <ImageIcon size={32} />
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-slate-900">
                    {pkg.name || pkg.id}
                  </h3>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Robux
                    </span>

                    <span className="font-bold text-blue-600">
                      {Number(
                        pkg.robux || pkg.amount || 0
                      ).toLocaleString("vi-VN")}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Giá coin
                    </span>

                    <span className="font-bold text-slate-900">
                      {Number(
                        pkg.coin_cost || pkg.coins || 0
                      ).toLocaleString("vi-VN")}
                    </span>
                  </div>

                  <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                    ID: {pkg.id}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PackageSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border bg-white">
      <div className="h-40 bg-slate-200" />

      <div className="space-y-3 p-4">
        <div className="h-5 w-32 rounded bg-slate-200" />

        <div className="flex justify-between">
          <div className="h-4 w-16 rounded bg-slate-200" />
          <div className="h-4 w-14 rounded bg-slate-200" />
        </div>

        <div className="flex justify-between">
          <div className="h-4 w-16 rounded bg-slate-200" />
          <div className="h-4 w-20 rounded bg-slate-200" />
        </div>

        <div className="h-8 rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  description,
  onRefresh,
  loading,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <button
        onClick={onRefresh}
        disabled={loading}
        className="rounded-xl border bg-white p-2.5 text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
      >
        <RefreshCw
          size={18}
          className={loading ? "animate-spin" : ""}
        />
      </button>
    </div>
  );
}

function Loading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-2xl border bg-white p-5"
        >
          <div className="mb-4 h-5 w-32 rounded bg-slate-200" />
          <div className="mb-2 h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-2/3 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border bg-white px-6 py-14 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Package size={22} />
      </div>

      <p className="text-sm font-medium text-slate-500">
        {text}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    pending: {
      text: "Đang chờ",
      className: "bg-yellow-100 text-yellow-700",
    },
    paid: {
      text: "Đang kiểm tra",
      className: "bg-blue-100 text-blue-700",
    },
    processing: {
      text: "Đang xử lý",
      className: "bg-blue-100 text-blue-700",
    },
    delivered: {
      text: "Đã giao",
      className: "bg-green-100 text-green-700",
    },
    completed: {
      text: "Hoàn thành",
      className: "bg-green-100 text-green-700",
    },
    rejected: {
      text: "Từ chối",
      className: "bg-red-100 text-red-700",
    },
    cancelled: {
      text: "Đã hủy",
      className: "bg-slate-100 text-slate-600",
    },
    answered: {
      text: "Đã trả lời",
      className: "bg-green-100 text-green-700",
    },
  };

  const item = config[status] || {
    text: status || "Không rõ",
    className: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${item.className}`}
    >
      {item.text}
    </span>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-3">
      <div className="mb-1 text-xs font-semibold uppercase text-slate-400">
        {label}
      </div>

      <div className="text-sm font-medium text-slate-800">
        {value}
      </div>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="font-bold text-slate-900">
            {title}
          </h3>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
      }
    function AffiliateTab() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailWithdrawal, setDetailWithdrawal] = useState(null);
  const [rejectWithdrawal, setRejectWithdrawal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const statusText = {
    pending: "Đang chờ",
    processing: "Đang xử lý",
    approved: "Đã duyệt",
    completed: "Đã thanh toán",
    rejected: "Đã từ chối",
    cancelled: "Đã hủy",
  };

  const fetchWithdrawals = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("star_withdrawals")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setWithdrawals(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const updateWithdrawal = async (withdrawal, status, extra = {}) => {
    if (processing) return;

    setProcessing(true);

    const { error } = await supabase
      .from("star_withdrawals")
      .update({
        status,
        ...extra,
        updated_at: new Date().toISOString(),
      })
      .eq("id", withdrawal.id);

    if (!error) {
      await fetchWithdrawals();
      setDetailWithdrawal(null);
      setRejectWithdrawal(null);
      setRejectReason("");
    }

    setProcessing(false);
  };

  const handleApprove = async (withdrawal) => {
    await updateWithdrawal(withdrawal, "approved");
  };

  const handleReject = async () => {
    if (!rejectWithdrawal) return;

    await updateWithdrawal(
      rejectWithdrawal,
      "rejected",
      {
        reject_reason:
          rejectReason.trim() || "Không có lý do",
      }
    );
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Affiliate"
        description="Quản lý yêu cầu rút tiền affiliate"
        onRefresh={fetchWithdrawals}
        loading={loading}
      />

      {loading ? (
        <Loading />
      ) : withdrawals.length === 0 ? (
        <EmptyState text="Chưa có yêu cầu rút tiền" />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Số tiền</th>
                  <th className="px-4 py-3 text-left">Ngân hàng</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Thời gian</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {withdrawals.map((withdrawal) => (
                  <tr
                    key={withdrawal.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-4 py-4 font-semibold">
                      #{withdrawal.id}
                    </td>

                    <td className="px-4 py-4">
                      {withdrawal.user_id || "-"}
                    </td>

                    <td className="px-4 py-4 font-bold">
                      {Number(
                        withdrawal.amount ||
                          withdrawal.coins ||
                          0
                      ).toLocaleString("vi-VN")}
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-medium">
                        {withdrawal.bank_name ||
                          withdrawal.bank ||
                          "-"}
                      </div>

                      <div className="text-xs text-slate-500">
                        {withdrawal.account_number || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                        {statusText[withdrawal.status] ||
                          withdrawal.status ||
                          "Không rõ"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-slate-500">
                      {withdrawal.created_at
                        ? new Date(
                            withdrawal.created_at
                          ).toLocaleString("vi-VN")
                        : "-"}
                    </td>

                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() =>
                          setDetailWithdrawal(withdrawal)
                        }
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detailWithdrawal && (
        <Modal
          title={`Yêu cầu #${detailWithdrawal.id}`}
          onClose={() => setDetailWithdrawal(null)}
        >
          <div className="space-y-3">
            <InfoBox
              label="User ID"
              value={detailWithdrawal.user_id || "-"}
            />

            <InfoBox
              label="Số tiền"
              value={Number(
                detailWithdrawal.amount ||
                  detailWithdrawal.coins ||
                  0
              ).toLocaleString("vi-VN")}
            />

            <InfoBox
              label="Ngân hàng"
              value={
                detailWithdrawal.bank_name ||
                detailWithdrawal.bank ||
                "-"
              }
            />

            <InfoBox
              label="Số tài khoản"
              value={
                detailWithdrawal.account_number || "-"
              }
            />

            <InfoBox
              label="Chủ tài khoản"
              value={
                detailWithdrawal.account_name ||
                detailWithdrawal.holder_name ||
                "-"
              }
            />

            <InfoBox
              label="Trạng thái"
              value={
                statusText[detailWithdrawal.status] ||
                detailWithdrawal.status ||
                "-"
              }
            />

            {detailWithdrawal.reject_reason && (
              <InfoBox
                label="Lý do từ chối"
                value={detailWithdrawal.reject_reason}
              />
            )}

            <div className="flex gap-2 pt-3">
              {detailWithdrawal.status === "pending" && (
                <>
                  <button
                    disabled={processing}
                    onClick={() =>
                      handleApprove(detailWithdrawal)
                    }
                    className="flex-1 rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <Check
                      size={17}
                      className="mr-2 inline"
                    />
                    Duyệt
                  </button>

                  <button
                    disabled={processing}
                    onClick={() =>
                      setRejectWithdrawal(detailWithdrawal)
                    }
                    className="flex-1 rounded-xl bg-red-600 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    <X
                      size={17}
                      className="mr-2 inline"
                    />
                    Từ chối
                  </button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {rejectWithdrawal && (
        <Modal
          title="Từ chối rút tiền"
          onClose={() => {
            setRejectWithdrawal(null);
            setRejectReason("");
          }}
        >
          <textarea
            value={rejectReason}
            onChange={(e) =>
              setRejectReason(e.target.value)
            }
            rows={4}
            placeholder="Nhập lý do từ chối..."
            className="w-full rounded-xl border p-3 outline-none focus:border-blue-500"
          />

          <button
            disabled={processing}
            onClick={handleReject}
            className="mt-3 w-full rounded-xl bg-red-600 py-3 font-semibold text-white disabled:opacity-50"
          >
            {processing
              ? "Đang xử lý..."
              : "Xác nhận từ chối"}
          </button>
        </Modal>
      )}
    </div>
  );
    }
function PostsTab() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setPosts(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const updatePost = async (post, action) => {
    if (processingId) return;

    setProcessingId(post.id);

    let status = action;

    if (action === "approve") {
      status = "approved";
    }

    if (action === "reject") {
      status = "rejected";
    }

    const { error } = await supabase
      .from("posts")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", post.id);

    if (!error) {
      await fetchPosts();
    }

    setProcessingId(null);
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Bài viết"
        description="Duyệt và quản lý bài viết cộng đồng"
        onRefresh={fetchPosts}
        loading={loading}
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border bg-white p-5"
            >
              <div className="mb-4 h-6 w-2/3 rounded bg-slate-200" />
              <div className="mb-2 h-4 w-full rounded bg-slate-200" />
              <div className="mb-2 h-4 w-5/6 rounded bg-slate-200" />
              <div className="h-4 w-2/3 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState text="Chưa có bài viết" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl border bg-white p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900">
                    {post.title || "Bài viết không có tiêu đề"}
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    {post.created_at
                      ? new Date(
                          post.created_at
                        ).toLocaleString("vi-VN")
                      : "-"}
                  </p>
                </div>

                <StatusBadge status={post.status} />
              </div>

              {post.image_url && (
                <div className="mb-4 overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src={post.image_url}
                    alt=""
                    className="max-h-60 w-full object-cover"
                  />
                </div>
              )}

              <p className="line-clamp-4 whitespace-pre-wrap text-sm text-slate-600">
                {post.content || post.description || "-"}
              </p>

              <div className="mt-4 flex gap-2">
                {post.status !== "approved" && (
                  <button
                    disabled={processingId === post.id}
                    onClick={() =>
                      updatePost(post, "approve")
                    }
                    className="flex-1 rounded-xl bg-green-600 py-2.5 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <Check
                      size={16}
                      className="mr-1 inline"
                    />
                    Duyệt
                  </button>
                )}

                {post.status !== "rejected" && (
                  <button
                    disabled={processingId === post.id}
                    onClick={() =>
                      updatePost(post, "reject")
                    }
                    className="flex-1 rounded-xl bg-red-600 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    <X
                      size={16}
                      className="mr-1 inline"
                    />
                    Từ chối
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
