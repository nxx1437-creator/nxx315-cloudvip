import React, { useState, useEffect } from "react";
import { Megaphone, Music, Youtube, Sparkles, Send, Coins, Loader2, CheckCircle2, XCircle, Copy, Wallet, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

export default function Marketing() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  
  // Wallet + Code Marketing
  const [marketingCode, setMarketingCode] = useState("NXX315-DEFAULT");
  const [wallet, setWallet] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;

      // Lấy ví marketing
      const { data: walletData } = await supabase
        .from("marketing_wallets")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      setWallet(walletData);

      // Lấy mã marketing (Giả sử có bảng profiles hoặc thêm mới)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("marketing_code")
        .eq("id", session.user.id)
        .single();
      
      if (profileData?.marketing_code) {
        setMarketingCode(profileData.marketing_code);
      }

      // Lấy danh sách video
      const { data: videoData } = await supabase
        .from("marketing_videos")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      setVideos(videoData ?? []);
      setLoading(false);
    };
    fetchData();
  }, [session]);

  const handleCopy = () => {
    navigator.clipboard.writeText(marketingCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getStatus = (status) => {
    const config = {
      pending: { label: "Chờ duyệt", color: "bg-amber-50 text-amber-600" },
      approved: { label: "Đã duyệt", color: "bg-emerald-50 text-emerald-600" },
      rejected: { label: "Từ chối", color: "bg-rose-50 text-rose-600" }
    };
    return config[status] || config.pending;
  };

  const filteredVideos = videos.filter((v) => activeTab === "all" ? true : v.status === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 px-4 py-4 backdrop-blur-md">
        <h1 className="font-display text-xl font-bold text-slate-900">Marketing Center</h1>
      </header>

      <main className="mx-auto max-w-md px-4 py-5">
        {/* VÍ MARKETING */}
        <div className="rounded-3xl bg-gradient-to-br from-sky-400 to-blue-600 p-6 text-white shadow-lg shadow-blue-500/30">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/80">💰 Ví Marketing</span>
            <Wallet size={20} className="text-white/80" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-display text-4xl font-bold">{wallet?.available_balance || 0}</span>
            <span className="text-lg text-white/80">đ</span>
          </div>
          <p className="mt-1 text-xs text-white/60">Đang chờ xác minh: {wallet?.pending_balance || 0}đ</p>
          <div className="mt-4 flex gap-3">
            <button onClick={() => navigate("/marketing-wallet")} className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-white/20 py-2.5 text-sm font-semibold backdrop-blur-sm hover:bg-white/30">
              <TrendingUp size={14} /> Rút tiền
            </button>
            <button className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-white py-2.5 text-sm font-semibold text-blue-600 hover:bg-sky-50">
              Đổi sang xu
            </button>
          </div>
          <p className="mt-2 text-[10px] text-white/50">Phí nền tảng: 5%</p>
        </div>

        {/* MÃ MARKETING */}
        <div className="mt-5 rounded-3xl border border-sky-100 bg-gradient-to-b from-sky-50 to-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600"><Megaphone size={16} /></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Mã Marketing của bạn</span>
          </div>
          <div className="mt-3 text-center">
            <p className="font-display text-3xl font-bold tracking-widest text-blue-600">{marketingCode}</p>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleCopy} className="flex flex-1 items-center justify-center gap-1 rounded-full bg-blue-500 py-2.5 text-sm font-semibold text-white">
              {isCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />} Sao chép
            </button>
          </div>
        </div>

        {/* CÁCH TÍNH THƯỞNG */}
        <div className="mt-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Cách kiếm thưởng</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500"><Music size={18} /></span>
              <div>
                <p className="text-xs text-slate-500">TikTok</p>
                <p className="text-sm font-bold text-slate-800">1.000 lượt truy cập hợp lệ = 2.500 coin</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500"><Youtube size={18} /></span>
              <div>
                <p className="text-xs text-slate-500">YouTube Short</p>
                <p className="text-sm font-bold text-slate-800">1.000 lượt truy cập hợp lệ = 10.000 coin</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500"><Youtube size={18} /></span>
              <div>
                <p className="text-xs text-slate-500">YouTube Long</p>
                <p className="text-sm font-bold text-slate-800">1.000 lượt truy cập hợp lệ = 25.000 coin</p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs italic text-slate-400">⚠️ Chỉ lượt truy cập hợp lệ mới được tính.</p>
        </div>

        {/* GỬI NỘI DUNG QUẢNG BÁ */}
        <div className="mt-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Gửi nội dung quảng bá</h2>
          <p className="mb-2 text-xs text-slate-500">Dán link TikTok / YouTube hoặc nội dung của bạn</p>
          <input 
            type="text" 
            placeholder="Dán link TikTok / YouTube..." 
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400"
          />
          <p className="mt-2 text-xs text-slate-400">Mã Marketing: <span className="font-bold text-blue-600">{marketingCode}</span></p>
          <button className="mt-3 w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-sky-500/25">
            Gửi xét duyệt
          </button>
        </div>

        {/* NỘI DUNG CỦA BẠN */}
        <div className="mt-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Nội dung của bạn</h2>
          
          <div className="mb-4 flex gap-2">
            <button onClick={() => setActiveTab("all")} className={`px-4 py-2 rounded-full text-xs font-semibold ${activeTab === "all" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"}`}>Tất cả</button>
            <button onClick={() => setActiveTab("pending")} className={`px-4 py-2 rounded-full text-xs font-semibold ${activeTab === "pending" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"}`}>Chờ</button>
            <button onClick={() => setActiveTab("approved")} className={`px-4 py-2 rounded-full text-xs font-semibold ${activeTab === "approved" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"}`}>Đã duyệt</button>
            <button onClick={() => setActiveTab("rejected")} className={`px-4 py-2 rounded-full text-xs font-semibold ${activeTab === "rejected" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"}`}>Từ chối</button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <p className="py-8 text-center text-sm text-slate-400">Đang tải...</p>
            ) : filteredVideos.length === 0 ? (
              <div className="py-10 text-center">
                <Megaphone size={40} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-500">Bắt đầu ngay để kiếm coin nào!</p>
                <p className="mt-1 text-xs text-slate-400">Gửi nội dung quảng bá đầu tiên của bạn</p>
              </div>
            ) : filteredVideos.map((video) => {
              const statusConfig = getStatus(video.status);
              return (
                <div key={video.id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${video.platform === "TikTok" ? "bg-slate-100 text-slate-700" : "bg-red-50 text-red-600"}`}>
                      {video.platform === "TikTok" ? <Music size={12} /> : <Youtube size={12} />} {video.platform}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusConfig.color}`}>{statusConfig.label}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-slate-400">{new Date(video.created_at).toLocaleString("vi-VN")}</p>
                    <p className="text-sm font-bold text-amber-500">+{video.coin_awarded || 0} coin</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Lượt truy cập hợp lệ: {video.valid_visits || 0}</p>
                  <p className="mt-2 break-all text-sm font-medium text-blue-500">{video.link}</p>
                  {video.admin_note && <p className="mt-2 rounded-lg bg-slate-50 p-3 text-xs italic text-slate-500">Admin: {video.admin_note}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
      }
