import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle2,
  Send,
  Loader2,
  Inbox,
  X,
  AlertCircle,
  Zap,
  ShieldCheck,
} from "lucide-react";

import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { supabase } from "../lib/supabaseClient.js";

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

function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusInfo(status) {
  const key = String(status || "").toLowerCase();
  if (key === "open" || key === "pending") {
    return {
      label: "Đang mở",
      className: "bg-emerald-50 text-emerald-600 border-emerald-200",
    };
  }
  if (key === "answered" || key === "in_progress") {
    return {
      label: "Đang xử lý",
      className: "bg-blue-50 text-blue-600 border-blue-200",
    };
  }
  if (key === "closed" || key === "resolved") {
    return {
      label: "Đã đóng",
      className: "bg-slate-50 text-slate-500 border-slate-200",
    };
  }
  return {
    label: status || "Không rõ",
    className: "bg-slate-50 text-slate-500 border-slate-200",
  };
}

const CATEGORIES = [
  { value: "payment", label: "Thanh toán", icon: "💳" },
  { value: "order", label: "Đơn hàng", icon: "📦" },
  { value: "account", label: "Tài khoản", icon: "👤" },
  { value: "bug", label: "Lỗi hệ thống", icon: "🐛" },
  { value: "other", label: "Khác", icon: "💬" },
];

const PRIORITIES = [
  { value: "low", label: "Thấp", color: "slate" },
  { value: "normal", label: "Bình thường", color: "blue" },
  { value: "high", label: "Cao", color: "orange" },
  { value: "urgent", label: "Khẩn cấp", color: "rose" },
];
export default function Support() {
  const [view, setView] = useState("list");
  const [selectedTicket, setSelectedTicket] = useState(null);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-28 text-slate-900">
      <TopHeader />

      <main className="mx-auto w-full max-w-2xl px-4 py-5">
        {view === "list" && (
          <TicketList
            onSelectTicket={(ticket) => {
              setSelectedTicket(ticket);
              setView("chat");
            }}
          />
        )}

        {view === "chat" && selectedTicket && (
          <TicketChat
            ticket={selectedTicket}
            onBack={() => {
              setView("list");
              setSelectedTicket(null);
            }}
          />
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function TicketList({ onSelectTicket }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Load tickets error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => {
    const key = String(t.status || "").toLowerCase();
    return key === "open" || key === "pending" || key === "answered";
  }).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-lg font-black text-slate-900">Hỗ trợ</h1>
          <p className="text-xs text-slate-500">
            Gửi yêu cầu & theo dõi phản hồi
          </p>
        </div>
      </div>

      {/* Stats Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50">
            <Inbox size={20} className="text-sky-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900">Ticket hỗ trợ</p>
            <p className="text-xs text-slate-500">
              Phản hồi trong vòng 24h
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Tất cả</p>
            <p className="mt-0.5 text-2xl font-black text-slate-900">
              {totalCount}
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3">
            <p className="text-xs text-emerald-600">Đang mở</p>
            <p className="mt-0.5 text-2xl font-black text-emerald-600">
              {openCount}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-sm font-black text-white shadow-md shadow-sky-200 transition hover:brightness-110 active:scale-[0.99]"
        >
          <Plus size={18} />
          Tạo ticket mới
        </button>
      </div>

      {/* List */}
      <div>
        <h2 className="mb-3 px-1 text-xs font-black uppercase tracking-wider text-slate-500">
          Lịch sử ticket
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-32 rounded bg-slate-100" />
                    <div className="h-3 w-48 rounded bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
              <Inbox size={26} className="text-slate-300" />
            </div>
            <p className="mt-3 text-sm font-bold text-slate-700">
              Chưa có ticket nào
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Tạo ticket nếu bạn cần hỗ trợ
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={() => onSelectTicket(ticket)}
              />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateTicketModal
          onClose={() => setShowCreate(false)}
          onSuccess={async () => {
            setShowCreate(false);
            await fetchTickets();
          }}
        />
      )}
    </div>
  );
}

function TicketCard({ ticket, onClick }) {
  const status = getStatusInfo(ticket.status);
  const category = CATEGORIES.find((c) => c.value === ticket.category);
  const priority = PRIORITIES.find((p) => p.value === ticket.priority);

  return (
    <button
      onClick={onClick}
      className="group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-sky-300 hover:shadow-md active:scale-[0.995]"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-sm">
          <MessageSquare size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-black text-slate-900">
              {ticket.title || "Ticket hỗ trợ"}
            </p>
            <span
              className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${status.className}`}
            >
              {status.label}
            </span>
          </div>

          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
            {ticket.last_message || ticket.description || "Không có nội dung"}
          </p>

          <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-400">
            {category && (
              <span>
                {category.icon} {category.label}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {formatDate(ticket.created_at)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
function TicketChat({ ticket, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = React.useRef(null);

  const status = getStatusInfo(ticket.status);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      // ⚠️ QUAN TRỌNG: Đây là bảng giả định
      // Bạn cần xác nhận tên bảng đúng
      const { data, error } = await supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", ticket.id)
        .order("created_at", { ascending: true });

      if (error) {
        // Fallback: chỉ hiện description + last_message
        const fallback = [];
        if (ticket.description) {
          fallback.push({
            id: "init",
            content: ticket.description,
            is_admin: false,
            created_at: ticket.created_at,
          });
        }
        if (ticket.last_message && ticket.last_message !== ticket.description) {
          fallback.push({
            id: "reply",
            content: ticket.last_message,
            is_admin: true,
            created_at: ticket.updated_at || ticket.created_at,
          });
        }
        setMessages(fallback);
      } else {
        setMessages(data || []);
      }
    } catch (error) {
      console.error("Load messages error:", error);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  useEffect(() => {
    loadMessages();
  }, [ticket.id]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || sending) return;

    setSending(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // ⚠️ Cần xác nhận bảng đúng
      const { data, error } = await supabase
        .from("ticket_messages")
        .insert({
          ticket_id: ticket.id,
          user_id: user.id,
          content,
          is_admin: false,
        })
        .select()
        .single();

      if (error) throw error;

      setMessages((prev) => [...prev, data]);
      setInput("");
      scrollToBottom();
    } catch (error) {
      console.error("Send message error:", error);
      alert("Không thể gửi tin nhắn.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-black text-slate-900">
            {ticket.title || "Ticket hỗ trợ"}
          </h1>
          <p className="text-[11px] text-slate-500">
            #{ticket.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto py-4"
      >
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            {/* Mô tả ticket */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Nội dung ban đầu
              </p>
              <p className="mt-1 text-sm text-slate-800">
                {ticket.description || "—"}
              </p>
            </div>

            {messages
              .filter(
                (m) =>
                  m.content !== ticket.description &&
                  m.id !== "init"
              )
              .map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 bg-white pt-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..."
            rows={1}
            className="max-h-24 min-h-[44px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
            style={{ height: "44px" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-200 transition hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:shadow-none"
          >
            {sending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ message }) {
  const isAdmin = message.is_admin || message.sender === "admin";

  return (
    <div
      className={`flex items-end gap-2 ${
        isAdmin ? "justify-start" : "justify-end"
      }`}
    >
      {isAdmin && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-sm">
          <ShieldCheck size={14} />
        </div>
      )}

      <div className={`max-w-[75%] ${isAdmin ? "" : "items-end"}`}>
        <div
          className={`rounded-2xl px-3.5 py-2.5 ${
            isAdmin
              ? "rounded-bl-md border border-slate-100 bg-white text-slate-800 shadow-sm"
              : "rounded-br-md bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-200"
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-6">
            {message.content}
          </p>
        </div>
        <p
          className={`mt-1 px-1 text-[10px] text-slate-400 ${
            isAdmin ? "text-left" : "text-right"
          }`}
        >
          {formatTime(message.created_at)}
        </p>
      </div>

      {!isAdmin && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-sm">
          <span className="text-xs font-black">U</span>
        </div>
      )}
    </div>
  );
}

function CreateTicketModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("payment");
  const [priority, setPriority] = useState("normal");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Vui lòng nhập tiêu đề và mô tả.");
      return;
    }

    setCreating(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        title: title.trim(),
        category,
        priority,
        description: description.trim(),
        status: "open",
        last_message: description.trim(),
      });

      if (error) throw error;
      await onSuccess();
    } catch (error) {
      console.error("Create ticket error:", error);
      alert("Không thể tạo ticket.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Tạo ticket hỗ trợ
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Mô tả vấn đề bạn đang gặp
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Tiêu đề
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Không nhận được Coin"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Danh mục
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                    category === c.value
                      ? "border-sky-500 bg-sky-50 text-sky-600"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Độ ưu tiên
            </label>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                    priority === p.value
                      ? "border-sky-500 bg-sky-50 text-sky-600"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Mô tả chi tiết
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết vấn đề của bạn..."
              rows={5}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={creating || !title.trim() || !description.trim()}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-sm font-black text-white shadow-md shadow-sky-200 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {creating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Plus size={16} />
                Tạo ticket
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}