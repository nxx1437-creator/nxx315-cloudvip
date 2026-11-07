import React, { useEffect, useState } from "react";
import { Plus, X, History, FileText } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import { formatRelativeTime } from "./helpers.js";
import { ThinkingSpinner } from "./ThinkingIndicator.jsx";

export default function HistoryDrawer({
  open,
  onClose,
  userId,
  currentConvId,
  onOpenConversation,
  onNewChat,
}) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      loadConversations();
    } else if (open && !userId) {
      console.warn("[HistoryDrawer] Mở drawer nhưng userId rỗng");
    }
  }, [open, userId]);

  const loadConversations = async () => {
    console.log("[HistoryDrawer] Loading for userId:", userId);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("support_conversations")
        .select("id, title, category, created_at, updated_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      console.log("[HistoryDrawer] Result:", { data, error });

      if (error) throw error;
      setConversations(data || []);
    } catch (err) {
      console.error("[HistoryDrawer] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const groupConversations = () => {
    const now = new Date();
    const groups = { today: [], week: [], older: [] };
    conversations.forEach((conv) => {
      const d = new Date(conv.created_at);
      const diffDay = Math.floor((now - d) / 86400000);
      if (diffDay < 1) groups.today.push(conv);
      else if (diffDay < 7) groups.week.push(conv);
      else groups.older.push(conv);
    });
    return groups;
  };

  const groups = groupConversations();

  const renderGroup = (title, items) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-5">
        <h3 className="mb-1.5 px-2 text-[12.5px] font-medium text-[#7b7e90]">
          {title}
        </h3>
        <div className="space-y-0.5">
          {items.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                onOpenConversation(conv);
                onClose();
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                conv.id === currentConvId
                  ? "bg-[#f5f6fb] text-[#13141a]"
                  : "text-[#3f4254] hover:bg-[#f5f6fb]"
              }`}
            >
              <FileText size={16} className="shrink-0 opacity-60" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium">
                  {conv.title || "Cuộc trò chuyện"}
                </p>
                <p className="truncate text-[11px] opacity-60">
                  {formatRelativeTime(conv.created_at)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (!open) return null;

  return (
    <>
      <div
        className="nxx-fade fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="nxx-drawer-in fixed left-0 top-0 z-[101] flex h-full w-[85%] max-w-sm flex-col rounded-r-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <h2 className="text-[19px] font-semibold tracking-[-0.01em] text-[#13141a]">
            Lịch sử trò chuyện
          </h2>
          <button
            onClick={onClose}
            className="nxx-iconbtn h-9 w-9 text-[#7b7e90] hover:bg-[#f5f6fb]"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-4 pb-3">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#13141a] px-4 py-3 text-[14.5px] font-semibold text-white transition active:scale-[0.98]"
          >
            <Plus size={18} strokeWidth={2.4} />
            Cuộc trò chuyện mới
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <ThinkingSpinner />
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <History
                size={36}
                className="mx-auto mb-3 text-[#c5c8dc]"
                strokeWidth={1.5}
              />
              <p className="text-[13.5px] font-medium text-[#3f4254]">
                Chưa có cuộc trò chuyện nào
              </p>
              <p className="mt-1 text-[12px] text-[#7b7e90]">
                Bắt đầu chat để lưu lịch sử
              </p>
            </div>
          ) : (
            <>
              {renderGroup("Hôm nay", groups.today)}
              {renderGroup("7 ngày qua", groups.week)}
              {renderGroup("Trước đây", groups.older)}
            </>
          )}
        </div>
      </div>
    </>
  );
}


