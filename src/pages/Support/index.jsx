import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient.js";
import TopHeader from "../../components/TopHeader.jsx";
import { CATEGORIES } from "./constants.js";
import { getGreeting, getSuggestions } from "./helpers.js";
import HomeView from "./HomeView.jsx";
import HelpView from "./HelpView.jsx";
import ChatView from "./ChatView.jsx";

export default function Index() {
  // Cuộc trò chuyện đang mở được ghi trên URL (?c=<id>) để tải lại trang vẫn ở đúng khung chat
  const [searchParams, setSearchParams] = useSearchParams();
  const convParam = searchParams.get("c");

  const [view, setView] = useState("home");
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [restoring, setRestoring] = useState(Boolean(convParam));
  const [conversation, setConversation] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [initialMessage, setInitialMessage] = useState(null);
  const [globalError, setGlobalError] = useState("");

  // Tự động đăng nhập ẩn nếu chưa có user
  useEffect(() => {
    const initAuth = async () => {
      let { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (!error && data.user) {
          user = data.user;
        } else {
          console.error("Lỗi đăng nhập ẩn:", error);
        }
      }
      setUser(user);
      setAuthReady(true);
    };
    initAuth();
  }, []);

  // Khôi phục cuộc trò chuyện từ URL khi tải lại trang
  useEffect(() => {
    if (!restoring || !authReady) return undefined;
    if (!user?.id || !convParam) {
      setRestoring(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("support_conversations")
          .select("*")
          .eq("id", convParam)
          .eq("user_id", user.id)
          .maybeSingle();
        if (cancelled) return;
        if (!error && data) {
          setSelectedCategory(data.category || null);
          setInitialMessage(null);
          setConversation(data);
          setView("chat");
        }
      } catch (err) {
        console.error("Lỗi khôi phục chat:", err);
      } finally {
        if (!cancelled) setRestoring(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [restoring, authReady, user?.id, convParam]);

  // Giữ URL khớp với màn hình: đang chat thì có ?c=, ra khỏi chat thì bỏ
  useEffect(() => {
    if (restoring) return;
    if (view === "chat" && conversation?.id) {
      if (convParam !== conversation.id) {
        const next = new URLSearchParams(searchParams);
        next.set("c", conversation.id);
        setSearchParams(next, { replace: true });
      }
    } else if (convParam) {
      const next = new URLSearchParams(searchParams);
      next.delete("c");
      setSearchParams(next, { replace: true });
    }
  }, [view, conversation?.id, restoring, convParam, searchParams, setSearchParams]);

  // Lắng nghe sự kiện tạo chat thành công từ HomeView
  useEffect(() => {
    const handleStartChatEvent = (e) => {
      const { conversation, category, firstText } = e.detail;
      setSelectedCategory(category);
      setInitialMessage(firstText);
      setConversation(conversation);
      setView("chat");
    };
    window.addEventListener("nxx-start-chat", handleStartChatEvent);
    return () => window.removeEventListener("nxx-start-chat", handleStartChatEvent);
  }, []);

  const openHelp = (category) => {
    setSelectedCategory(category);
    setView("help");
  };

  const startAIChat = async (category, firstText = null) => {
    setGlobalError("");
    if (!user?.id) {
      setGlobalError("Hệ thống đang khởi tạo tài khoản. Vui lòng đợi 2 giây rồi thử lại.");
      return { error: "Chưa có user." };
    }

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Quá 10s không phản hồi. Vui lòng kiểm tra lại mạng!")), 10000)
      );

      const createChatPromise = async () => {
        const { data: conv, error: convError } = await supabase
          .from("support_conversations")
          .insert({
            user_id: user.id,
            title: category ? `Hỗ trợ ${CATEGORIES.find((c) => c.id === category)?.label}` : "Cuộc trò chuyện mới",
            category,
            status: "ai",
          })
          .select()
          .single();

        if (convError) throw new Error("Lỗi tạo chat: " + convError.message);

        const { error: msgError } = await supabase
          .from("support_messages")
          .insert({
            conversation_id: conv.id,
            user_id: user.id,
            message: getGreeting(category),
            sender_type: "ai",
            suggestions: getSuggestions(category),
          });

        if (msgError) throw new Error("Lỗi tạo tin nhắn: " + msgError.message);
        return conv;
      };

      const conv = await Promise.race([createChatPromise(), timeoutPromise]);

      setSelectedCategory(category);
      setInitialMessage(firstText);
      setConversation(conv);
      setView("chat");
      return { ok: true };

    } catch (error) {
      console.error("Lỗi tạo chat:", error);
      setGlobalError(error?.message || "Lỗi không xác định.");
      return { error: error?.message };
    }
  };

  const openConversation = (conv) => {
    setSelectedCategory(conv.category || null);
    setInitialMessage(null);
    setConversation({ ...conv });
    setView("chat");
  };

  return (
    <div className="min-h-screen bg-white pb-24 text-slate-900 relative">
      <TopHeader />

      {/* Thanh báo lỗi màu đỏ nếu có lỗi */}
      {globalError && (
        <div className="fixed top-[60px] left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-red-600 text-white p-4 rounded-xl shadow-2xl z-[9999] flex justify-between items-start">
          <p className="text-[14px] font-medium leading-5">{globalError}</p>
          <button onClick={() => setGlobalError("")} className="ml-3 text-xl font-bold leading-none">&times;</button>
        </div>
      )}

      <main className="mx-auto w-full max-w-2xl">
        {restoring && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
          </div>
        )}
        {!restoring && view === "home" && (
          <HomeView
            user={user} // Truyền user xuống
            onOpenHelp={openHelp}
            onStartChat={({ text, category }) => startAIChat(category, text)} // Truyền hàm tạo chat
          />
        )}
        {!restoring && view === "help" && (
          <HelpView
            category={selectedCategory}
            onBack={() => setView("home")}
            onStartChat={() => startAIChat(selectedCategory)}
          />
        )}
        {!restoring && view === "chat" && conversation && (
          <ChatView
            key={conversation.id}
            conversation={conversation}
            user={user}
            initialMessage={initialMessage}
            onBack={() => setView(selectedCategory ? "help" : "home")}
            onNewChat={() => startAIChat(selectedCategory)}
            onOpenConversation={openConversation}
          />
        )}
      </main>
    </div>
  );
}
