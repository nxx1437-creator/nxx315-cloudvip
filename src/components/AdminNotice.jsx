import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  User,
  MessageSquare,
  Zap,
  ChevronRight,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import AdminGuard from "../components/AdminGuard.jsx";

const PRIORITY_STYLE = {
  urgent: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    label: "KHẨN CẤP",
    icon: Zap,
  },
  high: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    label: "CAO",
    icon: AlertCircle,
  },
  normal: {
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
    label: "BÌNH THƯỜNG",
    icon: Clock,
  },
  low: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-600",
    label: "THẤP",
    icon: Clock,
  },
};

const STATUS_TABS = [
  { id: "pending", label: "Chờ xử lý" },
  { id: "seen", label: "Đang xử lý" },
  { id: "resolved", label: "Đã xong" },
];

function formatTime(value) {
  if (!value) return "";
  const d = new Date(value);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  if (mins < 1440) return `${Math.floor(mins / 60)} giờ trước`;

  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
export default function AdminNotifications() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [tab, setTab] = useState("pending");
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data, error } = await supabase
        .from("support_notifications")
        .select(
          `
          id,
          conversation_id,
          user_id,
          reason,
          priority,
          status,
          created_at,
          resolved_at
        `
        )
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Load thêm thông tin user cho từng notification
      const userIds = [...new Set((data || []).map((n) => n.user_id))];
      let profiles = [];
      if (userIds.length > 0) {
        const { data: prof } = await supabase
          .from("user_profiles")
          .select("id, email, full_name")
          .in("id", userIds);
        profiles = prof || [];
      }

      const merged = (data || []).map((n) => ({
        ...n,
        profile: profiles.find((p) => p.id === n.user_id) || null,
      }));

      setNotifications(merged);
    } catch (err) {
      console.error("[AdminNotifications] load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Realtime: có notification mới → reload
    const channel = supabase
      .channel("admin-notifications-rt")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_notifications",
        },
        () => {
          loadNotifications(false);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const filtered = notifications.filter((n) => n.status === tab);

  const counts = {
    pending: notifications.filter((n) => n.status === "pending").length,
    seen: notifications.filter((n) => n.status === "seen").length,
    resolved: notifications.filter((n) => n.status === "resolved").length,
  };

  const handleAccept = async (notif) => {
    try {
      // 1. Update notification → seen
      await supabase
        .from("support_notifications")
        .update({ status: "seen" })
        .eq("id", notif.id);

      // 2. Update conversation → agent
      await supabase
        .from("support_conversations")
        .update({
          status: "agent",
          updated_at: new Date().toISOString(),
        })
        .eq("id", notif.conversation_id);

      // 3. Vào trang chat
      navigate(`/admin/chat/${notif.conversation_id}`);
    } catch (err) {
      console.error("[AdminNotifications] accept error:", err);
      alert("Không thể nhận xử lý. Vui lòng thử lại.");
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications(false);
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#f8f8f8] pb-6 text-slate-900">
        {/* HEADER */}
        <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-black/[0.06] bg-white/95 px-4 py-3 backdrop-blur-xl">
          <button
            onClick={() => navigate("/")}
            className="flex h-8 w-8 items-center justify-center text-slate-900"
          >
            <ArrowLeft size={22} strokeWidth={2.2} />
          </button>
          <div className="flex-1">
            <h1 className="text-[16px] font-extrabold tracking-[-0.02em] text-[#161823]">
              Yêu cầu hỗ trợ
            </h1>
            <p className="text-[11px] text-slate-500">
              {counts.pending} đang chờ • {counts.seen} đang xử lý
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
          >
            <RefreshCw
              size={18}
              className={refreshing ? "animate-spin" : ""}
              strokeWidth={2.2}
            />
          </button>
        </div>

        {/* TABS */}
        <div className="sticky top-[57px] z-10 flex gap-1 border-b border-black/[0.05] bg-white px-3 py-2">
          {STATUS_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold transition ${
                tab === t.id
                  ? "bg-[#FE2C55] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t.label}
              {counts[t.id] > 0 && (
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    tab === t.id
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {counts[t.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* LIST */}
        <div className="px-3 py-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-slate-300" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <CheckCircle2 size={24} className="text-slate-400" />
              </div>
              <p className="text-[14px] font-semibold text-slate-700">
                Không có yêu cầu nào
              </p>
              <p className="mt-1 text-[12px] text-slate-500">
                {tab === "pending"
                  ? "Tất cả yêu cầu đã được xử lý"
                  : tab === "seen"
                  ? "Chưa có yêu cầu nào đang xử lý"
                  : "Chưa có yêu cầu nào hoàn thành"}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map((notif) => (
                <NotificationCard
                  key={notif.id}
                  notif={notif}
                  onAccept={handleAccept}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
    }
function NotificationCard({ notif, onAccept }) {
  const style = PRIORITY_STYLE[notif.priority] || PRIORITY_STYLE.normal;
  const PriorityIcon = style.icon;

  const userLabel =
    notif.profile?.full_name ||
    notif.profile?.email ||
    `User ${notif.user_id.slice(0, 8)}`;

  return (
    <button
      onClick={() => onAccept(notif)}
      className="flex w-full flex-col gap-3 rounded-[16px] border border-black/[0.06] bg-white p-4 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] active:scale-[0.99]"
    >
      {/* Top row: priority + time */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide ${style.bg} ${style.border} ${style.text}`}
        >
          <PriorityIcon size={11} strokeWidth={2.6} />
          {style.label}
        </span>
        <span className="text-[11px] text-slate-400">
          {formatTime(notif.created_at)}
        </span>
      </div>

      {/* User */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FE2C55] to-[#25F4EE]">
          <User size={14} className="text-white" strokeWidth={2.3} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-slate-800">
            {userLabel}
          </p>
          <p className="truncate text-[11px] text-slate-500">
            ID: {notif.user_id.slice(0, 8)}...
          </p>
        </div>
      </div>

      {/* Reason */}
      <div className="rounded-[10px] bg-slate-50 px-3 py-2">
        <div className="flex items-start gap-2">
          <MessageSquare
            size={14}
            className="mt-0.5 shrink-0 text-slate-500"
            strokeWidth={2.2}
          />
          <p className="text-[13px] leading-5 text-slate-700">
            {notif.reason}
          </p>
        </div>
      </div>

      {/* Action */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
        <span className="text-[11px] font-medium text-slate-500">
          {notif.status === "pending"
            ? "Nhấn để nhận xử lý"
            : notif.status === "seen"
            ? "Tiếp tục xử lý"
            : "Đã hoàn thành"}
        </span>
        <ChevronRight
          size={16}
          className="text-slate-400"
          strokeWidth={2.4}
        />
      </div>
    </button>
  );
}
