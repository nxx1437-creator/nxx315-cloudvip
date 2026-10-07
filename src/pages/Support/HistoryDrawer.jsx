// src/pages/Support/HistoryDrawer.jsx

import React, { useEffect, useState } from "react";
import { Loader2, Plus, X, History, FileText } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import { formatRelativeTime } from "./helpers.js";

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
    if (open && userId) loadConversations();
  }, [open, userId]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("support_conversations")
        .select("id, title, category, created_at, updated_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setConversations(data || []);
    } catch (err) {
      console.error("Load conversations error:", err);
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
        <h3 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                conv.id === currentConvId
                  ? "bg-rose-50 text-[#FE2C55]"
                  : "text-slate-700 hover:bg-slate-50"
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
        className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed left-0 top-0 z-[101] flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
          <h2 className="text-[17px] font-bold text-slate-800">
            Lịch sử trò chuyện
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>
        <div className="border-b border-slate-100 p-3">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FE2C55] px-4 py-3 text-[14px] font-bold text-white shadow-[0_4px_12px_rgba(254,44,85,0.25)] transition active:scale-[0.98]"
          >
            <Plus size={18} strokeWidth={2.4} />
            Cuộc trò chuyện mới
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={20} className="animate-spin text-slate-300" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <History
                size={36}
                className="mx-auto mb-3 text-slate-300"
                strokeWidth={1.5}
              />
              <p className="text-[13px] font-medium text-slate-500">
                Chưa có cuộc trò chuyện nào
              </p>
              <p className="mt-1 text-[11.5px] text-slate-400">
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
