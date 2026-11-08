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
    console.log("⏳ [Support] 1. Đang chuẩn bị tạo chat...");
    if (!user?.id) {
      alert("LỖI: Bạn chưa đăng nhập hoặc phiên hết hạn.");
      return { error: "Chưa đăng nhập." };
    }
    try {
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

      if (convError) throw new Error("Lỗi tạo conv: " + convError.message);

      console.log("✅ [Support] 2. Đã tạo conv:", conv.id);

      const { error: msgError } = await supabase
        .from("support_messages")
        .insert({
          conversation_id: conv.id,
          user_id: user.id,
          message: getGreeting(category),
          sender_type: "ai",
          suggestions: getSuggestions(category),
        });

      if (msgError) throw new Error("Lỗi tạo msg: " + msgError.message);

      console.log("✅ [Support] 3. Đã tạo tin nhắn chào. Đang chuyển trang...");
      
      setSelectedCategory(category);
      setInitialMessage(firstText);
      setConversation(conv);
      setView("chat");
      return { ok: true };
    } catch (error) {
      console.error(error);
      alert("LỖI TẠO CHAT: " + (error?.message || "Không rõ nguyên nhân"));
      return { error: error?.message || "Lỗi tạo chat." };
    }
  };

  const openConversation = (conv) => {
    setSelectedCategory(conv.category || null);
    setInitialMessage(null);
    setConversation({ ...conv });
    setView("chat");
  };

  return (
    <div className="min-h-screen bg-white pb-24 text-slate-900">
      <TopHeader />
      <main className="mx-auto w-full max-w-2xl">
        {view === "home" && (
          <HomeView
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
