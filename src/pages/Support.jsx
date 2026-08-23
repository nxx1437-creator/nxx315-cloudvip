import React, { useState, useEffect } from "react";
import { LifeBuoy, MessageCircle, Send, Loader2, ChevronDown, Mail, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

const FAQS = [
  { question: "Làm sao để kiếm Coin?", answer: "Bạn có thể kiếm Coin bằng cách hoàn thành nhiệm vụ trong mục Nhiệm vụ, hoặc mời bạn bè qua mã giới thiệu." },
  { question: "Làm sao để đổi Coin lấy Robux?", answer: "Vào mục Cửa hàng, chọn gói Robux bạn muốn, nhập Username Roblox, sau đó đặt đơn." },
  { question: "Mất Robux thì phải làm sao?", answer: "Nếu bạn không nhận được Robux sau khi đặt đơn, hãy liên hệ ngay với bộ phận hỗ trợ qua form bên dưới." },
  { question: "Làm sao để liên hệ với Admin?", answer: "Bạn có thể gửi yêu cầu hỗ trợ qua form bên dưới, hoặc liên hệ trực tiếp qua Discord/Zalo." }
];

export default function Support() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!session?.user?.id) return;
      const { data } = await supabase.from("support_tickets").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
      setTickets(data ?? []);
    };
    fetchTickets();
  }, [session]);

  const getSubjectColor = (subject) => {
    const colors = {
      "Vấn đề về Coin": "bg-amber-50 text-amber-700",
      "Vấn đề về Robux": "bg-rose-50 text-rose-700",
      "Vấn đề về tài khoản": "bg-blue-50 text-blue-700",
      "Khác": "bg-slate-50 text-slate-700"
    };
    return colors[subject] || "bg-slate-50 text-slate-700";
  };

  const handleSubmit = async () => {
    if (!selectedSubject) {
      setToast({ message: "Vui lòng chọn vấn đề!", type: "error" });
      return;
    }
    if (!message.trim()) {
      setToast({ message: "Vui lòng nhập mô tả!", type: "error" });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from("support_tickets").insert({
      user_id: session.user.id,
      subject: selectedSubject,
      message: message.trim()
    });
    setIsSubmitting(false);

    if (error) {
      setToast({ message: "Lỗi gửi yêu cầu: " + error.message, type: "error" });
      return;
    }

    setToast({ message: "Đã gửi yêu cầu hỗ trợ!", type: "success" });
    setSelectedSubject("");
    setMessage("");
    
    const { data: newTickets } = await supabase.from("support_tickets").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
    setTickets(newTickets ?? []);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 px-4 py-4 backdrop-blur-md">
        <h1 className="font-display text-xl font-bold text-slate-900">Hỗ trợ</h1>
      </header>

      <main className="mx-auto max-w-md px-4 py-5">
        {/* Hero */}
        <div className="rounded-3xl border border-sky-100 bg-gradient-to-b from-sky-100 via-sky-50 to-white p-6 shadow-lg shadow-sky-100">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-500">
              <LifeBuoy size={24} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Cần giúp đỡ?</h2>
              <p className="text-sm text-slate-500">Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-sky-600 shadow-sm"><MessageCircle size={12} /> Discord: Nxx315</span>
            <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-blue-600 shadow-sm"><Phone size={12} /> Zalo: 0123456789</span>
          </div>
        </div>

        {/* Form hỗ trợ */}
        <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Gửi yêu cầu hỗ trợ</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Vấn đề của bạn</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400"
              >
                <option value="">-- Chọn vấn đề --</option>
                <option value="Vấn đề về Coin">Vấn đề về Coin</option>
                <option value="Vấn đề về Robux">Vấn đề về Robux</option>
                <option value="Vấn đề về tài khoản">Vấn đề về tài khoản</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Mô tả chi tiết</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Mô tả vấn đề của bạn..."
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400"
              />
            </div>

            <button onClick={handleSubmit} disabled={isSubmitting} className="w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-sky-500/25 disabled:opacity-50">
              {isSubmitting ? <Loader2 size={16} className="animate-spin mx-auto" /> : <Send size={16} className="inline mr-2" />} Gửi yêu cầu
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Câu hỏi thường gặp</h3>
          <div className="space-y-2">
            {FAQS.map((faq, index) => (
              <div key={index} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="flex w-full items-center justify-between py-2 text-left"
                >
                  <span className="text-sm font-medium text-slate-800">{faq.question}</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${openFaqIndex === index ? "rotate-180" : ""}`} />
                </button>
                {openFaqIndex === index && (
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Lịch sử yêu cầu */}
        <div className="mt-6">
          <h3 className="mb-3 text-lg font-bold text-slate-900">Lịch sử yêu cầu</h3>
          <div className="space-y-3">
            {tickets.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                <p className="text-sm text-slate-400">Chưa có yêu cầu nào.</p>
              </div>
            ) : tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-2xl border border-white bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${getSubjectColor(ticket.subject)}`}>
                    {ticket.subject}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    ticket.status === "pending" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                  }`}>
                    {ticket.status === "pending" ? "Chờ xử lý" : "Đã xử lý"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{ticket.message}</p>
                <p className="mt-1 text-xs text-slate-400">{new Date(ticket.created_at).toLocaleString("vi-VN")}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />

      {/* Toast */}
      {toast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-2xl bg-white p-6 text-center shadow-2xl">
            <p className={`text-sm font-semibold ${toast.type === "success" ? "text-emerald-600" : "text-rose-500"}`}>
              {toast.message}
            </p>
            <button onClick={() => setToast(null)} className="mt-4 rounded-xl bg-slate-100 px-6 py-2 text-sm font-semibold text-slate-600">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
      }
