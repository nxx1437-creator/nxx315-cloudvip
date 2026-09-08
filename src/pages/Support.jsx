// src/pages/Support.jsx - PHẦN 1
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Send, Paperclip, Image, X, Loader2, 
  MessageCircle, Clock, CheckCheck, User, ChevronRight,
  Plus, Search, Filter, Phone, Mail, AlertCircle
} from "lucide-react";
import useSession from "../hooks/useSession.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

export default function Support() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [newTicketData, setNewTicketData] = useState({
    title: "",
    category: "Khác",
    priority: "Bình thường",
    description: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Kiểm tra admin
  useEffect(() => {
    if (!session?.user?.id) return;
    const checkAdmin = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      setIsAdmin(data?.role === 'admin');
    };
    checkAdmin();
  }, [session]);

  // Lấy danh sách ticket
  useEffect(() => {
    if (!session?.user?.id) return;
    fetchTickets();
  }, [session]);

  const fetchTickets = async () => {
    setLoading(true);
    let query = supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (isAdmin) {
      query = supabase
        .from('support_tickets')
        .select('*, profiles!inner(username, email)')
        .order('created_at', { ascending: false });
    }

    const { data } = await query;
    setTickets(data || []);
    setLoading(false);
  };

  // Lấy messages của ticket
  const fetchMessages = async (ticketId) => {
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    setMessages(data || []);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const openTicket = async (ticket) => {
    setSelectedTicket(ticket);
    await fetchMessages(ticket.id);
  };

  // Gửi tin nhắn
  const sendMessage = async () => {
    if (!messageText.trim() && !selectedImage) return;
    if (!selectedTicket) return;

    setSending(true);
    let imageUrl = null;

    if (selectedImage) {
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `support/${selectedTicket.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('support_images')
        .upload(filePath, selectedImage);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('support_images')
          .getPublicUrl(filePath);
        imageUrl = publicUrl;
      }
    }

    const { error } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: selectedTicket.id,
        user_id: session.user.id,
        message: messageText.trim(),
        image_url: imageUrl,
        is_admin: isAdmin,
      });

    if (!error) {
      setMessageText("");
      setSelectedImage(null);
      setImagePreview(null);
      await fetchMessages(selectedTicket.id);
      
      await supabase
        .from('support_tickets')
        .update({ 
          updated_at: new Date().toISOString(),
          last_message: messageText.trim() || 'Hình ảnh'
        })
        .eq('id', selectedTicket.id);
    }
    setSending(false);
  };

  // Tạo ticket mới
  const createTicket = async () => {
    if (!newTicketData.title.trim() || !newTicketData.description.trim()) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: session.user.id,
        title: newTicketData.title,
        category: newTicketData.category,
        priority: newTicketData.priority,
        description: newTicketData.description,
        status: 'open',
      })
      .select();

    if (!error && data) {
      setShowNewTicket(false);
      setNewTicketData({ title: "", category: "Khác", priority: "Bình thường", description: "" });
      await fetchTickets();
      openTicket(data[0]);
    } else {
      alert("Lỗi tạo ticket: " + error?.message);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'open': return 'Đang mở';
      case 'pending': return 'Đang chờ';
      case 'closed': return 'Đã đóng';
      default: return status;
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (activeTab === 'all') return true;
    if (activeTab === 'open') return t.status === 'open';
    if (activeTab === 'pending') return t.status === 'pending';
    if (activeTab === 'closed') return t.status === 'closed';
    return true;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    pending: tickets.filter(t => t.status === 'pending').length,
    closed: tickets.filter(t => t.status === 'closed').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-[72px]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white px-4 py-3 border-b border-gray-100/80">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50"
          >
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-[17px] font-semibold text-gray-900">Hỗ trợ</h1>
            {selectedTicket && (
              <p className="text-[11px] text-gray-400 truncate">{selectedTicket.title}</p>
            )}
          </div>
          {!selectedTicket && isAdmin && (
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-500">
              <Search size={18} />
            </button>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-3">
        {selectedTicket ? (
          // === CHAT VIEW ===
          <div className="flex flex-col h-[calc(100vh-200px)]">
            {/* Ticket info */}
            <div className="bg-white rounded-xl p-3 border border-gray-100 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedTicket.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${getStatusColor(selectedTicket.status)}`}>
                      {getStatusLabel(selectedTicket.status)}
                    </span>
                    <span className="text-[9px] text-gray-400">{selectedTicket.category}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="text-[10px] font-medium text-blue-500"
                >
                  Đóng
                </button>
              </div>
              {selectedTicket.description && (
                <p className="mt-1.5 text-[10px] text-gray-500">{selectedTicket.description}</p>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-2 pb-2">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle size={32} className="mx-auto text-gray-300" />
                  <p className="mt-2 text-sm text-gray-400">Chưa có tin nhắn nào</p>
                  <p className="text-[10px] text-gray-300">Hãy gửi tin nhắn để bắt đầu</p>
                </div>
              )}
              {messages.map((msg) => {
                const isMine = msg.user_id === session?.user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-xl px-3 py-2 ${isMine ? 'bg-blue-500 text-white' : 'bg-white border border-gray-100'}`}>
                      {msg.image_url && (
                        <img src={msg.image_url} alt="attachment" className="rounded-lg max-w-[200px] mb-1" />
                      )}
                      {msg.message && (
                        <p className={`text-[13px] ${isMine ? 'text-white' : 'text-gray-900'}`}>{msg.message}</p>
                      )}
                      <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <span className={`text-[9px] ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString('vi-VN')}
                        </span>
                        {isMine && <CheckCheck size={12} className="text-blue-200" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white rounded-xl p-2 border border-gray-100">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="w-full bg-gray-50 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none resize-none min-h-[40px] max-h-[120px] border border-gray-100 focus:border-blue-400"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  {imagePreview && (
                    <div className="relative mt-1 inline-block">
                      <img src={imagePreview} alt="preview" className="h-16 w-16 rounded-lg object-cover" />
                      <button
                        onClick={removeImage}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Paperclip size={16} className="text-gray-500" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || (!messageText.trim() && !selectedImage)}
                  className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {sending ? <Loader2 size={16} className="animate-spin text-white" /> : <Send size={16} className="text-white" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // === LIST TICKETS ===
          <>
            {/* Stats */}
            <div className="bg-white rounded-xl p-3 border border-gray-100 mb-3">
              <p className="text-[10px] font-medium text-gray-400">Ticket hỗ trợ</p>
              <div className="flex gap-3 mt-1.5">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{stats.total}</p>
                  <p className="text-[8px] text-gray-400">Tất cả</p>
                </div>
                <div className="w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-lg font-bold text-emerald-500">{stats.open}</p>
                  <p className="text-[8px] text-gray-400">Đang mở</p>
                </div>
                <div className="w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-lg font-bold text-amber-500">{stats.pending}</p>
                  <p className="text-[8px] text-gray-400">Đang chờ</p>
                </div>
                <div className="w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-400">{stats.closed}</p>
                  <p className="text-[8px] text-gray-400">Đã đóng</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewTicket(true)}
                className="mt-2 w-full py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors"
              >
                + Tạo ticket
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-3 overflow-x-auto">
              {[
                { key: 'all', label: 'Tất cả', count: stats.total },
                { key: 'open', label: 'Đang mở', count: stats.open },
                { key: 'pending', label: 'Đang chờ', count: stats.pending },
                { key: 'closed', label: 'Đã đóng', count: stats.closed },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.key
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {tab.label} {tab.count > 0 && `(${tab.count})`}
                </button>
              ))}
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
// src/pages/Support.jsx - PHẦN 2 (TIẾP THEO)

            {/* Tickets list */}
            <div className="space-y-2">
              {filteredTickets.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                  <MessageCircle size={32} className="mx-auto text-gray-300" />
                  <p className="mt-2 text-sm text-gray-400">Chưa có ticket hỗ trợ</p>
                  <p className="text-[10px] text-gray-300">Tạo ticket mới để được hỗ trợ</p>
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => openTicket(ticket)}
                    className="w-full bg-white rounded-xl p-3 border border-gray-100 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 truncate">{ticket.title}</span>
                          <span className={`text-[8px] font-medium px-1.5 py-0.5 rounded-full ${getStatusColor(ticket.status)} flex-shrink-0`}>
                            {getStatusLabel(ticket.status)}
                          </span>
                        </div>
                        {ticket.profiles && (
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {ticket.profiles.username || ticket.profiles.email}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] text-gray-400">{ticket.category}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span className="text-[9px] text-gray-400">
                            {new Date(ticket.created_at).toLocaleString('vi-VN')}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                    {ticket.last_message && (
                      <p className="mt-1 text-[10px] text-gray-500 truncate">{ticket.last_message}</p>
                    )}
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </main>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-sm bg-white rounded-t-2xl sm:rounded-2xl p-5 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Ticket mới</h2>
              <button onClick={() => setShowNewTicket(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-medium text-gray-600 mb-1">Tiêu đề *</p>
                <input
                  type="text"
                  value={newTicketData.title}
                  onChange={(e) => setNewTicketData({ ...newTicketData, title: e.target.value })}
                  placeholder="Nhập tiêu đề"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] font-medium text-gray-600 mb-1">Danh mục</p>
                  <select
                    value={newTicketData.category}
                    onChange={(e) => setNewTicketData({ ...newTicketData, category: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  >
                    <option>Khác</option>
                    <option>Tài khoản</option>
                    <option>Thanh toán</option>
                    <option>Sản phẩm</option>
                    <option>Kỹ thuật</option>
                  </select>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-gray-600 mb-1">Ưu tiên</p>
                  <select
                    value={newTicketData.priority}
                    onChange={(e) => setNewTicketData({ ...newTicketData, priority: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  >
                    <option>Bình thường</option>
                    <option>Cao</option>
                    <option>Khẩn cấp</option>
                  </select>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-medium text-gray-600 mb-1">Mô tả vấn đề *</p>
                <textarea
                  value={newTicketData.description}
                  onChange={(e) => setNewTicketData({ ...newTicketData, description: e.target.value })}
                  placeholder="Mô tả chi tiết vấn đề..."
                  rows={4}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
                />
              </div>

              <button
                onClick={createTicket}
                className="w-full py-2.5 rounded-lg bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 transition-colors"
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