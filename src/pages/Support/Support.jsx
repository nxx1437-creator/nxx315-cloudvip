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
  const [globalError, setGlobalError] = useState(null); // Hứng lỗi toàn cục

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  // Hàm xử lý chính (Có Timeout 8 giây chống treo)
  const startAIChat = async (category, firstText = null) => {
    setGlobalError(null);
    if (!user?.id) {
      setGlobalError("Lỗi: Bạn chưa đăng nhập hoặc phiên hết hạn.");
      return;
    }

    const doCreate = async () => {
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

    try {
      // Chạy đua giữa hàm tạo chat và đồng hồ bấm giờ 8 giây
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Quá thời gian 8s! Supabase không phản hồi hoặc mạng quá yếu.")), 8000)
      );
      
      const conv = await Promise.race([doCreate(), timeout]);

      // Thành công thì chuyển trang
      setSelectedCategory(category);
      setInitialMessage(firstText);
      setConversation(conv);
      setView("chat");
    } catch (err) {
      console.error(err);
      // In lỗi thẳng lên màn hình đỏ
      setGlobalError(err.message || "Lỗi không xác định khi tạo chat.");
    }
  };

  const openHelp = (category) => {
    setSelectedCategory(category);
    setView("help");
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
      
      {/* KHUNG BÁO LỖI ĐỎ CHÓT - Luôn hiển thị trên cùng nếu có lỗi */}
      {globalError && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-red-600 text-white p-4 rounded-xl shadow-2xl z-[9999] flex justify-between items-start">
          <p className="text-sm font-medium">{globalError}</p>
          <button onClick={() => setGlobalError(null)} className="ml-3 font-bold text-xl leading-none">&times;</button>
        </div>
      )}

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
