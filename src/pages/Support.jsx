import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Plus, X, Send } from "lucide-react";
import useSession from "../hooks/useSession.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

export default function Support() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    if (session?.user?.id) {
      fetchTickets();
    }
  }, [session]);

  const fetchTickets = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    setTickets(data || []);
    setLoading(false);
  };

  const fetchMessages = async (ticketId) => {
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const createTicket = async () => {
    if (!newTitle.trim() || !newDescription.trim()) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: session.user.id,
        title: newTitle,
        description: newDescription,
        status: 'open',
      })
      .select();
    if (!error && data) {
      setShowNewTicket(false);
      setNewTitle("");
      setNewDescription("");
      fetchTickets();
      setSelectedTicket(data[0]);
      await fetchMessages(data[0].id);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;
    if (!selectedTicket) return;
    setSending(true);
    const { error } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: selectedTicket.id,
        user_id: session.user.id,
        message: messageText,
      });
    if (!error) {
      setMessageText("");
      await fetchMessages(selectedTicket.id);
    }
    setSending(false);
  };

  const openTicket = async (ticket) => {
    setSelectedTicket(ticket);
    await fetchMessages(ticket.id);
  };

  const closeTicket = () => {
    setSelectedTicket(null);
    setMessages([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 flex-1">
            {selectedTicket ? selectedTicket.title : "Hỗ trợ"}
          </h1>
          {selectedTicket && (
            <button onClick={closeTicket} className="text-sm text-blue-500 font-medium">
              Đóng
            </button>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4">
        {selectedTicket ? (
          // === CHAT VIEW ===
          <div>
            <div className="bg-white rounded-xl p-3 mb-4 border border-gray-200">
              <p className="text-sm text-gray-600">{selectedTicket.description}</p>
              <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                selectedTicket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {selectedTicket.status === 'open' ? 'Đang mở' : 'Đã đóng'}
              </span>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto mb-4">
              {messages.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">Chưa có tin nhắn</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.user_id === session?.user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-xl px-3 py-2 ${
                      msg.user_id === session?.user?.id ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-[10px] opacity-70 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button
                onClick={sendMessage}
                disabled={sending || !messageText.trim()}
                className="px-4 py-2 rounded-xl bg-blue-500 text-white font-medium disabled:opacity-50"
              >
                {sending ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        ) : (
          // === LIST TICKETS ===
          <div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
              <p className="text-sm text-gray-500">Ticket hỗ trợ</p>
              <div className="flex gap-4 mt-2">
                <div>
                  <p className="text-xl font-bold text-gray-900">{tickets.length}</p>
                  <p className="text-xs text-gray-400">Tất cả</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-green-600">{tickets.filter(t => t.status === 'open').length}</p>
                  <p className="text-xs text-gray-400">Đang mở</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewTicket(true)}
                className="mt-3 w-full py-2 rounded-lg bg-blue-500 text-white font-semibold"
              >
                + Tạo ticket
              </button>
            </div>

            {tickets.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                <MessageCircle size={40} className="mx-auto text-gray-300" />
                <p className="mt-2 text-gray-400">Chưa có ticket nào</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => openTicket(ticket)}
                  className="w-full bg-white rounded-xl p-4 border border-gray-200 mb-2 text-left hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{ticket.title}</p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ticket.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(ticket.created_at).toLocaleString('vi-VN')}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      ticket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {ticket.status === 'open' ? 'Đang mở' : 'Đã đóng'}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </main>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Ticket mới</h2>
              <button onClick={() => setShowNewTicket(false)}><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Tiêu đề *"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none"
              />
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Mô tả vấn đề *"
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none resize-none"
              />
              <button
                onClick={createTicket}
                className="w-full py-2 rounded-lg bg-blue-500 text-white font-semibold"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}