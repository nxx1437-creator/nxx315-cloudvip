import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient.js";
import TopHeader from "../../components/TopHeader.jsx";
import { CATEGORIES } from "./constants.js";
import { getGreeting, getSuggestions } from "./helpers.js";
import HomeView from "./HomeView.jsx";
import HelpView from "./HelpView.jsx";
import ChatView from "./ChatView.jsx";

export default function Index() {
  const [view, setView] = useState("home");
  const [user, setUser] = useState(null);
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
    };
    initAuth();
  }, []);

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
        {view === "home" && (
          <HomeView
            user={user} // Truyền user xuống
            onOpenHelp={openHelp}
            onStartChat={({ text, category }) => startAIChat(category, text)} // Truyền hàm tạo chat
          />
        )}
        {view === "help" && (
          <HelpView
            category={selectedCategory}
            onBack={() => setView("home")}
            onStartChat={() => startAIChat(selectedCategory)}
          />
        )}
        {view === "chat" && conversation && (
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
