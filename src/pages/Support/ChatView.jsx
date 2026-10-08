// src/pages/Support/ChatView.jsx

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Send, Loader2, Headphones, Smile, Plus,
  History, X, Camera, Image as ImageIcon, Paperclip, Mic,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";

import { supabase } from "../../lib/supabaseClient.js";
import { AI_ENDPOINT, QUICK_ACTIONS, SUPPORT } from "./constants.js";
import BannerNotice from "./BannerNotice.jsx";
import StatusBubble from "./StatusBubble.jsx";
import HistoryDrawer from "./HistoryDrawer.jsx";
import MessageBubble from "./MessageBubble.jsx";

export default function ChatView({
  conversation,
  user,
  onBack,
  onNewChat,
  onOpenConversation,
}) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [streamingMsgId, setStreamingMsgId] = useState(null);
  const [streamingText, setStreamingText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [conv, setConv] = useState(conversation);
  const [hiddenSuggestionIds, setHiddenSuggestionIds] = useState([]);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);

  const scrollRef = useRef(null);
  const sentIds = useRef(new Set());
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const scrollToBottom = (smooth = false) => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: smooth ? "smooth" : "auto",
        });
      }
    });
  };

  useEffect(() => {
    if (!loading && messages.length > 0) scrollToBottom(true);
  }, [messages.length, loading]);

  const runTypewriter = (msg) => {
    setStreamingMsgId(msg.id);
    setStreamingText("");
    let idx = 0;
    const full = msg.message;
    const interval = setInterval(() => {
      idx += 3;
      if (idx >= full.length) {
        setStreamingText(full);
        clearInterval(interval);
        setTimeout(() => {
          setStreamingMsgId(null);
          setStreamingText("");
          scrollToBottom(true);
        }, 100);
      } else {
        setStreamingText(full.slice(0, idx));
      }
    }, 20);
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
      setTimeout(() => scrollToBottom(), 100);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [conversation.id]);

  useEffect(() => {
    const channel = supabase
      .channel(`conv-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const msg = payload.new;
          if (sentIds.current.has(msg.id)) return;
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            if (msg.sender_type === "ai" || msg.sender_type === "system") {
              const withoutStatus = prev.filter(
                (m) => m.sender_type !== "status"
              );
              return [...withoutStatus, msg];
            }
            return [...prev, msg];
          });
          if (msg.sender_type === "ai" && msg.message) runTypewriter(msg);
          else scrollToBottom(true);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "support_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const msg = payload.new;
          setMessages((prev) =>
            prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m))
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "support_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.filter((m) => m.id !== payload.old.id)
          );
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [conversation.id]);

  const callAI = async (imageUrl, messageText) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Chưa đăng nhập");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const bodyPayload = {
      conversation_id: conv.id,
      user_message: imageUrl
        ? "Phân tích ảnh này giúp mình"
        : messageText,
    };
    if (imageUrl) bodyPayload.image_url = imageUrl;

    const response = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(bodyPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errData = {};
      try {
        errData = await response.json();
      } catch (_) {}
      throw new Error(
        errData?.error || `AI trả về lỗi ${response.status}`
      );
    }
    return response.json();
  };

  const sendMessage = async (customText) => {
    const content = (customText || input).trim();
    if ((!content && !pendingImage) || sending || !user?.id) return;

    setSending(true);
    try {
      let imageUrl = null;

      if (pendingImage) {
        const file = pendingImage.file;
        const fileExt = file.name.split(".").pop() || "jpg";
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("support-images")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("support-images")
          .getPublicUrl(fileName);
        imageUrl = urlData?.publicUrl;
        if (!imageUrl) throw new Error("Không lấy được URL ảnh");
      }

      const { data: userMsg, error } = await supabase
        .from("support_messages")
        .insert({
          conversation_id: conv.id,
          user_id: user.id,
          message: content || "",
          sender_type: "user",
          image_url: imageUrl,
        })
        .select()
        .single();

      if (error) throw error;
      sentIds.current.add(userMsg.id);

      setMessages((prev) => [
        ...prev.filter((m) => m.sender_type !== "status"),
        userMsg,
      ]);
      setInput("");
      if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl);
      setPendingImage(null);
      setShowEmoji(false);
      setShowFileMenu(false);
      scrollToBottom(true);

      if (conv.status === "ai") {
        const typingTimer = setTimeout(() => setAiTyping(true), 1500);
        try {
          const data = await callAI(imageUrl, content);
          console.log(
            `[Support AI] Provider: ${data.provider} (${data.model})`
          );
        } catch (err) {
          console.error("AI error:", err);
          setMessages((prev) =>
            prev.filter((m) => m.sender_type !== "status")
          );
          const { data: errMsg } = await supabase
            .from("support_messages")
            .insert({
              conversation_id: conv.id,
              user_id: user.id,
              message:
                "Xin lỗi bạn, mình đang gặp sự cố kỹ thuật. Bạn thử lại sau hoặc liên hệ Zalo 0865245988 để được hỗ trợ trực tiếp nha 🌸",
              sender_type: "ai",
              suggestions: [],
            })
            .select()
            .single();
          if (errMsg) {
            sentIds.current.add(errMsg.id);
            setMessages((prev) => [...prev, errMsg]);
            runTypewriter(errMsg);
          }
        } finally {
          clearTimeout(typingTimer);
          setAiTyping(false);
        }
      }
    } catch (error) {
      console.error("Send error:", error);
      alert("Không thể gửi tin nhắn.");
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Chỉ hỗ trợ file ảnh");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh không được vượt quá 5MB");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setPendingImage({ file, previewUrl });
    setShowFileMenu(false);
  };

  const hideAllSuggestions = () => {
    setHiddenSuggestionIds((prev) => {
      const allIds = messages
        .filter((m) => m.suggestions?.length > 0)
        .map((m) => m.id);
      return [...new Set([...prev, ...allIds])];
    });
  };

  const hasInput = input.trim() || pendingImage;

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-white">
      {/* HEADER */}
<div className="sticky top-0 z-30 flex items-center gap-2 border-b border-black/[0.06] bg-white/95 px-3 py-2.5 backdrop-blur-xl">
  {/* Back button */}
  <button
    onClick={onBack}
    className="flex h-9 w-9 shrink-0 items-center justify-center text-[#161823]"
  >
    <ArrowLeft size={22} strokeWidth={2.2} />
  </button>

  {/* Avatar + Title căn giữa */}
  <div className="flex min-w-0 flex-1 items-center gap-2.5">
    <img
      src="https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/avatar.png"
      alt="NXX"
      className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-pink-100"
      onError={(e) => {
        e.currentTarget.src = `https://ui-avatars.com/api/?name=NXX&background=FE2C55&color=fff&bold=true&size=80`;
      }}
    />
    <h1 className="truncate text-[17px] font-bold tracking-[-0.01em] text-[#161823]">
      Chăm sóc khách hàng
    </h1>
  </div>

  {/* Right icons */}
<button
  onClick={() => {
    console.log("[History] Opening. userId:", user?.id);
    setShowHistoryDrawer(true);
  }}
  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[#161823] transition hover:bg-slate-50"
>
  <History size={20} strokeWidth={2} />
</button>

  <a
    href={SUPPORT.zaloUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[#0068FF] transition hover:bg-[#0068FF]/[0.08]"
  >
    <Headphones size={20} strokeWidth={2} />
  </a>
</div>

      {/* MESSAGES */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-2.5 overflow-y-auto px-3.5 py-4 sm:px-4"
        style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch" }}
      >
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 size={20} className="animate-spin text-slate-300" />
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              if (msg.sender_type === "status")
                return <StatusBubble key={msg.id} message={msg} />;
              const isLastAIMessage =
                idx === messages.length - 1 &&
                msg.sender_type === "ai" &&
                !streamingMsgId &&
                !aiTyping;
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  streamingText={
                    streamingMsgId === msg.id ? streamingText : null
                  }
                  isLastAIMessage={isLastAIMessage}
                  onSuggestionClick={(text) => {
                    hideAllSuggestions();
                    sendMessage(text);
                  }}
                  sending={sending}
                  onShowLogin={() => navigate("/login")}
                  hiddenSuggestionIds={hiddenSuggestionIds}
                  onHideSuggestions={hideAllSuggestions}
                />
              );
            })}
            {aiTyping &&
              !streamingMsgId &&
              !messages.some((m) => m.sender_type === "status") && (
                <div className="flex justify-start">
                  <div className="rounded-[20px] rounded-tl-[6px] border border-slate-100 bg-white px-4 py-3.5 shadow-sm">
                    <div className="flex gap-1">
                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-slate-300"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-slate-300"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-slate-300"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}
          </>
        )}
      </div>

      {/* QUICK ACTIONS */}
      <div
        className="scrollbar-hide flex gap-2 overflow-x-auto border-t border-black/[0.05] bg-white px-3.5 pb-1 pt-2.5"
        style={{ scrollbarWidth: "none" }}
      >
        {QUICK_ACTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => sendMessage(q.prompt)}
            disabled={sending}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-black/[0.06] bg-white px-3.5 py-2 text-[12.5px] font-semibold text-slate-700 transition hover:border-black/[0.12] hover:bg-slate-50 active:scale-95 disabled:opacity-50"
          >
            <span className="text-[14px]">{q.icon}</span>
            <span>{q.label}</span>
          </button>
        ))}
      </div>

      {/* INPUT BAR */}
      <div className="relative border-t border-black/[0.05] bg-white px-3.5 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 sm:px-4">
        {pendingImage && (
          <div className="mb-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2">
            <img
              src={pendingImage.previewUrl}
              alt="Preview"
              className="h-16 w-16 rounded-xl object-cover"
            />
            <div className="flex-1">
              <p className="text-[13px] font-medium text-slate-700">
                Ảnh đã chọn
              </p>
              <p className="text-[11px] text-slate-500">
                Nhập mô tả và bấm gửi
              </p>
            </div>
            <button
              onClick={() => {
                URL.revokeObjectURL(pendingImage.previewUrl);
                setPendingImage(null);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 hover:bg-slate-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowFileMenu(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/[0.07] bg-white text-[#161823] transition active:scale-95"
          >
            <Plus size={22} strokeWidth={2.2} />
          </button>

          <div className="relative flex-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Nhập yêu cầu của bạn tại đây nhé"
              className="h-11 w-full rounded-full border border-black/[0.07] bg-[#f2f2f2] px-4 text-[14px] text-[#161823] outline-none transition placeholder:text-[#8a8d93] focus:border-[#b9bdc5] focus:bg-white"
            />
          </div>

          {hasInput ? (
            <button
              onClick={() => sendMessage()}
              disabled={sending}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FE2C55] text-white transition active:scale-95 disabled:opacity-40"
            >
              {sending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} strokeWidth={2.4} />
              )}
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowEmoji(true)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#161823] transition active:scale-95"
              >
                <Smile size={22} strokeWidth={2.2} />
              </button>
              <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#161823] transition active:scale-95">
                <Mic size={22} strokeWidth={2.2} />
              </button>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileSelect(f);
            e.target.value = "";
          }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileSelect(f);
            e.target.value = "";
          }}
        />

        {/* BOTTOM SHEET */}
        {showFileMenu && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setShowFileMenu(false)}
            />
            <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[24px] bg-white pb-[max(20px,env(safe-area-inset-bottom))] pt-2 shadow-2xl">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
              <div className="px-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">
                    Tải lên
                  </h3>
                  <button
                    onClick={() => {
                      setShowFileMenu(false);
                      fileInputRef.current?.click();
                    }}
                    className="text-sm font-semibold text-blue-500"
                  >
                    Tất cả ảnh
                           </button>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <button
                    onClick={() => {
                      setShowFileMenu(false);
                      cameraInputRef.current?.click();
                    }}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                      <Camera size={32} strokeWidth={1.8} />
                    </div>
                    <span className="text-[13px] font-medium text-slate-700">
                      Chụp ảnh
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setShowFileMenu(false);
                      fileInputRef.current?.click();
                    }}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                      <ImageIcon size={32} strokeWidth={1.8} />
                    </div>
                    <span className="text-[13px] font-medium text-slate-700">
                      Album
                    </span>
                  </button>

                  <button
                    onClick={() => setShowFileMenu(false)}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                      <Paperclip size={32} strokeWidth={1.8} />
                    </div>
                    <span className="text-[13px] font-medium text-slate-700">
                      Tệp
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {showEmoji && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowEmoji(false)}
            />
            <div className="absolute bottom-20 right-4 z-50 overflow-hidden rounded-lg border border-slate-200 shadow-2xl">
              <EmojiPicker
                onEmojiClick={(e) =>
                  setInput((prev) => prev + e.emoji)
                }
                theme="light"
                height={350}
                width={300}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
