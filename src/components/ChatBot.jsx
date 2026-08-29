import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: "bot", 
      content: "👋 Chào cậu! Nia đây, trợ thủ AI của NXX315 Studio Rewards nè!\n\nNia vẫn đang học để hỗ trợ cậu tốt hơn, nếu thấy chưa đúng, hãy phản hồi cho Nia nha ",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setFeedback(null);

    try {
      const history = messages.map(m => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.content
      }));

      const { data, error } = await supabase.functions.invoke("chat-bot", {
        body: { message: input, history }
      });

      if (error) throw error;

      const botReply = data?.reply || "Xin lỗi cậu, Nia chưa hiểu câu hỏi này lắm. ";
      setMessages(prev => [...prev, { role: "bot", content: botReply, timestamp: new Date() }]);

    } catch (err) {
      setMessages(prev => [...prev, { 
        role: "bot", 
        content: "❌ Có lỗi xảy ra rồi cậu ơi! Nia đang bảo trì, thử lại sau nha! ",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (type) => {
    setFeedback(type);
    alert(`Cảm ơn cậu đã phản hồi! ${type === 'yes' ? '😊' : '🥺 Nia sẽ cố gắng hơn nha!'}`);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-lg shadow-pink-500/30 transition hover:scale-105"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 w-[90vw] max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-pink-400 to-rose-500 px-4 py-3 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌸</span>
          <div>
            <span className="font-semibold">Trợ thủ AI - Nia</span>
            <p className="text-[10px] text-white/80">NXX315 Studio Rewards</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-full p-1">
          <X size={18} />
        </button>
      </div>

      <div className="h-80 overflow-y-auto p-4 space-y-3 bg-pink-50/30">
        {messages.map((msg, idx) => (
          <div key={idx}>
            <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-pink-400 to-rose-500 text-white"
                    : "bg-white border border-pink-200 text-slate-800 shadow-sm"
                }`}
              >
                {msg.content.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < msg.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </div>
            {msg.role === "bot" && msg.timestamp && (
              <p className="text-[10px] text-slate-400 mt-1 ml-2">
                {new Date(msg.timestamp).toLocaleString('vi-VN')}
              </p>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-pink-200 rounded-2xl px-4 py-2 text-sm text-slate-500 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Nia đang suy nghĩ...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length > 1 && !loading && (
        <div className="border-t border-pink-100 px-4 py-2 bg-pink-50/50 flex items-center justify-between">
          <span className="text-xs text-slate-500">Câu trả lời có hữu ích không?</span>
          <div className="flex gap-2">
            <button 
              onClick={() => handleFeedback('yes')}
              className={`p-1.5 rounded-full transition ${feedback === 'yes' ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-slate-100 text-slate-400'}`}
            >
              <ThumbsUp size={14} />
            </button>
            <button 
              onClick={() => handleFeedback('no')}
              className={`p-1.5 rounded-full transition ${feedback === 'no' ? 'bg-rose-100 text-rose-600' : 'hover:bg-slate-100 text-slate-400'}`}
            >
              <ThumbsDown size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="border-t border-pink-100 p-3 flex gap-2 bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Hỏi Nia bất cứ điều gì..."
          className="flex-1 rounded-full border border-pink-200 px-4 py-2 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-md disabled:opacity-50 transition hover:scale-105"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
                                   }
