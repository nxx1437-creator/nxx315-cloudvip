const sendMessage = async () => {
  if (!input.trim() || loading) return;

  const userMessage = { role: "user", content: input, timestamp: new Date() };
  setMessages(prev => [...prev, userMessage]);
  setInput("");
  setLoading(true);
  setFeedback(null);

  try {
    console.log("📤 Sending:", input);

    const { data, error } = await supabase.functions.invoke("chat-bot", {
      body: { message: input, history: [] }
    });

    console.log("📥 Response:", { data, error });

    if (error) {
      console.error("❌ Error from Edge Function:", error);
      setMessages(prev => [...prev, { 
        role: "bot", 
        content: `❌ Lỗi: ${error.message || "Không xác định"}`,
        timestamp: new Date()
      }]);
      setLoading(false);
      return;
    }

    if (!data) {
      console.error("❌ No data received");
      setMessages(prev => [...prev, { 
        role: "bot", 
        content: "❌ Không nhận được phản hồi từ Nia!",
        timestamp: new Date()
      }]);
      setLoading(false);
      return;
    }

    console.log("✅ Reply:", data.reply);

    const botReply = data.reply || "Xin lỗi cậu, Nia chưa hiểu câu hỏi này lắm. 🥺";
    setMessages(prev => [...prev, { role: "bot", content: botReply, timestamp: new Date() }]);

  } catch (err) {
    console.error("❌ Catch error:", err);
    setMessages(prev => [...prev, { 
      role: "bot", 
      content: `❌ Lỗi: ${err.message || "Không xác định"}`,
      timestamp: new Date()
    }]);
  } finally {
    setLoading(false);
  }
};
