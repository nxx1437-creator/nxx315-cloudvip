import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Loader2,
  User,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Phone,
  Mail,
  CheckCheck,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import AdminGuard from "../components/AdminGuard.jsx";

function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
export default function AdminChat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [resolving, setResolving] = useState(false);
  const scrollRef = useRef(null);
  const sentIds = useRef(new Set());

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  };

  // Load admin user hiện tại
  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setAdminUser(user);
    };
    load();
  }, []);

  // Thêm vào useEffect khi admin vào chat lần đầu
useEffect(() => {
  const notifyUser = async () => {
    if (!conversation || !adminUser) return;
    
    // Check xem đã có system message "Nhân viên đã tham gia" chưa
    const { data: existing } = await supabase
      .from("support_messages")
      .select("id")
      .eq("conversation_id", conversationId)
      .eq("sender_type", "system")
      .ilike("message", "%Nhân viên đã tham gia%")
      .maybeSingle();

    if (existing) return; // Đã có rồi, không insert nữa

    // Insert system message
    await supabase.from("support_messages").insert({
      conversation_id: conversationId,
      user_id: adminUser.id,
      message: "Nhân viên đã tham gia cuộc trò chuyện.",
      sender_type: "system",
      suggestions: [],
    });
  };
  
  notifyUser();
}, [conversation?.id, adminUser?.id]);

  // Realtime messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`admin-chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new;
          if (msg.sender_type === "status") return;
          if (sentIds.current.has(msg.id)) return;

          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          scrollToBottom();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [conversationId]);

  const sendReply = async () => {
    const content = input.trim();
    if (!content || sending || !adminUser?.id || !conversation) return;

    setSending(true);
    try {
      const { data: msg, error } = await supabase
        .from("support_messages")
        .insert({
          conversation_id: conversationId,
          user_id: adminUser.id,
          message: content,
          sender_type: "agent",
        })
        .select()
        .single();

      if (error) throw error;

      sentIds.current.add(msg.id);
      setMessages((prev) => [...prev, msg]);
      setInput("");
      scrollToBottom();
    } catch (err) {
      console.error("[AdminChat] send error:", err);
      alert("Không thể gửi tin nhắn.");
    } finally {
      setSending(false);
    }
  };

  const resolveConversation = async () => {
    if (!conversation) return;
    if (!confirm("Đánh dấu cuộc trò chuyện này đã hoàn thành?")) return;

    setResolving(true);
    try {
      // Update conversation → closed
      await supabase
        .from("support_conversations")
        .update({
          status: "closed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId);

      // Update notification → resolved
      await supabase
        .from("support_notifications")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          resolved_by: adminUser?.id,
        })
        .eq("conversation_id", conversationId);

      // Insert system message
      await supabase.from("support_messages").insert({
        conversation_id: conversationId,
        user_id: adminUser?.id,
        message: "Cuộc trò chuyện đã được đánh dấu hoàn thành.",
        sender_type: "system",
        suggestions: [],
      });

      navigate("/admin/notifications");
    } catch (err) {
      console.error("[AdminChat] resolve error:", err);
      alert("Không thể đánh dấu hoàn thành.");
    } finally {
      setResolving(false);
    }
  };
  if (loading) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 size={24} className="animate-spin text-slate-300" />
      </div>
    </AdminGuard>
  );
}

if (!conversation) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen items-center justify-center bg-white p-6">
        <div className="text-center">
          <p className="text-[14px] font-semibold text-slate-700">
            Không tìm thấy cuộc trò chuyện
          </p>
          <button
            onClick={() => navigate("/admin/notifications")}
            className="mt-3 rounded-lg bg-[#FE2C55] px-4 py-2 text-sm font-bold text-white"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    </AdminGuard>
  );
}

const userLabel =
  userProfile?.full_name ||
  userProfile?.email ||
  `User ${conversation.user_id.slice(0, 8)}`;

return (
  <AdminGuard>
    <div className="relative flex h-[100dvh] flex-col bg-[#f8f8f8]">
      {/* HEADER */}
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-black/[0.06] bg-white/95 px-3 py-3 backdrop-blur-xl">
        <button
          onClick={() => navigate("/admin/notifications")}
          className="flex h-8 w-8 shrink-0 items-center justify-center text-slate-900"
        >
          <ArrowLeft size={22} strokeWidth={2.2} />
        </button>

        <button
          onClick={() => setShowInfo((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500">
            <User size={16} className="text-white" strokeWidth={2.3} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[14px] font-extrabold text-[#161823]">
              {userLabel}
            </h1>
            <p className="text-[10px] font-medium text-emerald-600">
              {conversation.status === "agent"
                ? "Đang trò chuyện"
                : conversation.status === "closed"
                ? "Đã đóng"
                : "Chờ xử lý"}
            </p>
          </div>
        </button>

        <button
          onClick={resolveConversation}
          disabled={resolving || conversation.status === "closed"}
          className="flex h-8 shrink-0 items-center gap-1 rounded-md bg-emerald-500 px-2.5 text-[11px] font-bold text-white transition hover:bg-emerald-600 disabled:opacity-40"
        >
          {resolving ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <CheckCircle2 size={12} strokeWidth={2.6} />
          )}
          Xong
        </button>
      </div>

      {/* INFO PANEL */}
      {showInfo && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/30"
            onClick={() => setShowInfo(false)}
          />
          <div className="absolute left-3 right-3 top-16 z-40 overflow-hidden rounded-[16px] border border-black/[0.06] bg-white shadow-[0_14px_40px_rgba(0,0,0,0.15)]">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Thông tin khách hàng
              </p>
            </div>
            <div className="space-y-3 px-4 py-4 text-[13px]">
              <div className="flex items-center gap-2">
                <User size={14} className="text-slate-400" />
                <span className="text-slate-600">Tên:</span>
                <span className="font-semibold text-slate-800">
                  {userProfile?.full_name || "Chưa có"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-slate-400" />
                <span className="text-slate-600">Email:</span>
                <span className="truncate font-semibold text-slate-800">
                  {userProfile?.email || "Chưa có"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase text-slate-400">
                  ID
                </span>
                <span className="font-mono text-[11px] text-slate-600">
                  {conversation.user_id.slice(0, 16)}...
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase text-slate-400">
                  Danh mục
                </span>
                <span className="font-semibold text-slate-700">
                  {conversation.category || "Khác"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase text-slate-400">
                  Tạo lúc
                </span>
                <span className="text-slate-600">
                  {formatDate(conversation.created_at)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MESSAGES */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-3.5 py-4"
      >
        {messages.map((msg) => {
          const isUser = msg.sender_type === "user";
          const isAgent = msg.sender_type === "agent";
          const isAI = msg.sender_type === "ai";
          const isSystem = msg.sender_type === "system";

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-500">
                  {msg.message}
                </div>
              </div>
            );
          }

          if (isUser) {
            return (
              <div key={msg.id} className="flex justify-start">
                <div className="max-w-[78%]">
                  <div className="rounded-[18px] rounded-bl-[5px] border border-black/[0.05] bg-white px-4 py-2.5 text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                    <p className="whitespace-pre-wrap break-words text-[13px] leading-5">
                      {msg.message}
                    </p>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Khách • {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          }

          // AI hoặc Agent → bên phải
          return (
            <div key={msg.id} className="flex justify-end">
              <div className="max-w-[78%]">
                <div className="rounded-[18px] rounded-br-[5px] bg-[#FE2C55] px-4 py-2.5 text-white shadow-[0_3px_10px_rgba(254,44,85,0.12)]">
                  <p className="whitespace-pre-wrap break-words text-[13px] leading-5">
                    {msg.message}
                  </p>
                </div>
                <div className="mt-1 flex items-center justify-end gap-1">
                  {isAgent && (
                    <CheckCheck size={11} className="text-emerald-500" />
                  )}
                  <p className="text-[10px] text-slate-400">
                    {isAgent ? "Bạn" : "AI"} • {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
              {/* INPUT */}
        <div className="border-t border-black/[0.05] bg-white px-3.5 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
          {conversation.status === "closed" ? (
            <div className="rounded-[14px] bg-slate-100 px-4 py-3 text-center text-[12px] text-slate-500">
              Cuộc trò chuyện đã đóng
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendReply();
                  }
                }}
                placeholder="Nhập tin nhắn trả lời khách..."
                className="h-11 flex-1 rounded-[18px] border border-black/[0.07] bg-[#f2f2f2] px-4 text-[14px] text-[#161823] outline-none transition placeholder:text-[#8a8d93] focus:border-[#b9bdc5] focus:bg-white"
              />

              <button
                onClick={sendReply}
                disabled={!input.trim() || sending}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FE2C55] text-white shadow-[0_4px_12px_rgba(254,44,85,0.2)] transition active:scale-95 disabled:opacity-40"
              >
                {sending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} strokeWidth={2.4} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
