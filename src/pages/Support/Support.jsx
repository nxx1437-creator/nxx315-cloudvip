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
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    loadUser();
  }, []);

  const openHelp = (category) => {
    setSelectedCategory(category);
    setView("help");
  };

  // firstText: câu người dùng gõ ở khung to trang chủ (tự gửi khi chat mở)
  const startAIChat = async (category, firstText = null) => {
    if (!user?.id) {
      alert("Vui lòng đăng nhập để chat với AI.");
      return;
    }
    try {
      const { data: conv, error: convError } = await supabase
        .from("support_conversations")
        .insert({
          user_id: user.id,
          title: category
            ? `Hỗ trợ ${CATEGORIES.find((c) => c.id === category)?.label}`
            : "Cuộc trò chuyện mới",
          category,
          status: "ai",
        })
        .select()
        .single();

      if (convError) throw convError;

      const greeting = getGreeting(category);
      const suggestions = getSuggestions(category);

      const { error: msgError } = await supabase
        .from("support_messages")
        .insert({
          conversation_id: conv.id,
          user_id: user.id,
          message: greeting,
          sender_type: "ai",
          suggestions: suggestions,
        });

      if (msgError) throw msgError;

      setSelectedCategory(category);
      setInitialMessage(firstText);
      setConversation(conv);
      setView("chat");
    } catch (error) {
      console.error("Start chat error:", error);
          alert("Không thể bắt đầu cuộc trò chuyện. Vui lòng thử lại.");
    }
  };

  const openConversation = (conv) => {
    console.log("[Support] Opening conversation:", conv.id);
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
