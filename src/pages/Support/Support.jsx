import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient.js";
import TopHeader from "../../components/TopHeader.jsx";
import { CATEGORIES } from "./constants.js";
import { getGreeting, getSuggestions } from "./helpers.js";
import HomeView from "./HomeView.jsx";
import HelpView from "./HelpView.jsx";
import ChatView from "./ChatView.jsx";

export default function Support() {
  const [view, setView] = useState("home");
  const [user, setUser] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [initialMessage, setInitialMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(""); // Lưu lỗi để hiển thị

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

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
    setErrorMsg(""); // Xóa lỗi cũ
    if (!user?.id) {
      setErrorMsg("Lỗi: Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.");
      return { error: "Chưa đăng nhập." };
    }

    try {
      // Đồng hồ đếm ngược 10 giây
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Quá 10s không phản hồi. Vui lòng kiểm tra lại mạng.")), 10000)
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

        if (convError) throw new Error("Lỗi tạo cuộc trò chuyện: " + convError.message);

        const { error: msgError } = await supabase
          .from("support_messages")
          .insert({
            conversation_id: conv.id,
            user_id: user.id,
            message: getGreeting(category),
            sender_type: "ai",
            suggestions: getSuggestions(category),
          });

        if (msgError) throw new Error("Lỗi tạo tin nhắn chào: " + msgError.message);
        return conv;
      };

      const conv = await Promise.race([createChatPromise(), timeoutPromise]);

      // Thành công thì chuyển trang
      setSelectedCategory(category);
      setInitialMessage(firstText);
      setConversation(conv);
      setView("chat");
      return { ok: true };

    } catch (error) {
      console.error(error);
      // Hiện lỗi lên thanh đỏ
      setErrorMsg(error?.message || "Không thể kết nối đến máy chủ.");
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
      
      {/* THANH BÁO LỖI ĐỎ */}
      {errorMsg && (
        <div className="fixed top-[60px] left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-red-600 text-white p-4 rounded-xl shadow-2xl z-[9999] flex justify-between items-start">
          <p className="text-[14px] font-medium leading-5">{errorMsg}</p>
          <button onClick={() => setErrorMsg("")} className="ml-3 text-xl font-bold leading-none">&times;</button>
        </div>
      )}

      <main className="mx-auto w-full max-w-2xl">
        {view === "home" && (
  <HomeView
    user={user} 
    onOpenHelp={openHelp}
    onStartChat={({ text, category }) => startAIChat(category, text)}
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
