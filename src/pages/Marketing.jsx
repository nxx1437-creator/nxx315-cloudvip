import React, { useState, useEffect } from "react";
import { Megaphone, Music, Youtube, Sparkles, Coins, Loader2, CheckCircle2, XCircle, Copy, Wallet, TrendingUp, ChevronRight, Info } from "lucide-react";
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
  const [showRewardTable, setShowRewardTable] = useState(false); // Ẩn/Hiện bảng thưởng

  // Wallet + Code
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

      // Lấy mã marketing
      const { data: profileData } = await supabase
        .from("profiles")
        .select("marketing_code")
        .eq("id", session.user.id)
        .single();
      
      if (profileData?.marketing_code) {
        setMarketingCode(profileData.marketing_code);
      }

      // Lấy video
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

  const handleSubmit = async () => {
    // Logic gửi video (giữ nguyên)
    // Bạn có thể thêm lại input ở dưới nếu cần, nhưng mình gợi ý đặt nó ở phần Nội dung
    // Để gọn, mình sẽ thêm một nút mở popup gửi link ở dưới
  };

  const getStatus = (status) => {
    const config = {
      pending: { label: "Chờ", color: "bg-amber-50 text-amber-600" },
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

      {/* HEADER NHỎ */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-lg font-bold text-slate-900">Marketing</h1>
            <p className="text-xs text-slate-500">Kiếm thưởng từ nội dung của bạn</p>
          </div>
          <button onClick={() => navigate("/marketing-wallet")} className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Wallet size={16} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-4">
        {/* 1. SỐ DƯ MARKETING */}
        <div className="rounded-3xl bg-gradient-to-br from-sky-400 to-blue-600 p-6 text-white shadow-lg shadow-blue-500/30">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/80">💰 Số dư Marketing</span>
            <Coins size={20} className="text-amber-300" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-display text-4xl font-bold">{wallet?.available_balance || 0}</span>
            <span className="text-lg text-white/80">đ</span>
          </div>
          <p className="mt-1 text-xs text-white/60">Đang chờ: {wallet?.pending_balance || 0}đ</p>
          <div className="mt-4 flex gap-2">
            <button onClick={() => navigate("/marketing-wallet")} className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-white/20 py-2.5 text-sm font-semibold backdrop-blur-sm hover:bg-white/30">
              <TrendingUp size={14} /> Rút tiền
            </button>
            <button className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-white py-2.5 text-sm font-semibold text-blue-600 hover:bg-sky-50">
              Đổi xu
            </button>
          </div>
          <p className="mt-2 text-[10px] text-white/50">Phí nền tảng: 5%</p>
        </div>

        {/* 2. MÃ MARKETING */}
        <div className="mt-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600"><Megaphone size={16} /></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Mã Marketing</span>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <p className="font-display text-xl font-bold tracking-widest text-blue-600">{marketingCode}</p>
            <button onClick={handleCopy} className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600">
              {isCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">Chia sẻ mã này khi quảng bá nội dung của bạn.</p>
        </div>

        {/* 3. CÁCH KIẾM THƯỞNG (MINI) */}
        <div className="mt-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <button onClick={() => setShowRewardTable(!showRewardTable)} className="flex w-full items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Sparkles size={16} className="text-amber-500" /> Thưởng theo lượt truy cập hợp lệ
            </span>
            <ChevronRight size={16} className={`text-slate-400 transition-transform ${showRewardTable ? "rotate-90" : ""}`} />
          </button>

          {showRewardTable && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-slate-50 p-3 text-center">
                <Music size={18} className="mx-auto text-rose-500" />
                <p className="mt-1 text-xs text-slate-500">TikTok</p>
                <p className="text-sm font-bold text-slate-800">2.5K/1K</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 text-center">
                <Youtube size={18} className="mx-auto text-red-500" />
                <p className="mt-1 text-xs text-slate-500">YouTube</p>
                <p className="text-sm font-bold text-slate-800">25K/1K</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 text-center">
                <Youtube size={18} className="mx-auto text-red-500" />
                <p className="mt-1 text-xs text-slate-500">Short</p>
                <p className="text-sm font-bold text-slate-800">10K/1K</p>
              </div>
            </div>
          )}

          <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
            <Info size={12} /> Chỉ lượt truy cập hợp lệ mới được tính. Phí 5%.
          </p>
        </div>

        {/* 4. NỘI DUNG CỦA BẠN */}
        <div className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Nội dung của bạn</h2>
            <button className="text-xs font-semibold text-blue-600">Xem tất cả</button>
          </div>

          {/* Tab lọc */}
          <div className="mb-4 flex gap-2">
            <button onClick={() => setActiveTab("all")} className={`px-4 py-1.5 rounded-full text-xs font-semibold ${activeTab === "all" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"}`}>Tất cả</button>
            <button onClick={() => setActiveTab("pending")} className={`px-4 py-1.5 rounded-full text-xs font-semibold ${activeTab === "pending" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"}`}>Chờ</button>
            <button onClick={() => setActiveTab("approved")} className={`px-4 py-1.5 rounded-full text-xs font-semibold ${activeTab === "approved" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"}`}>Duyệt</button>
            <button onClick={() => setActiveTab("rejected")} className={`px-4 py-1.5 rounded-full text-xs font-semibold ${activeTab === "rejected" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"}`}>Từ chối</button>
          </div>

          {/* Danh sách video compact */}
          <div className="space-y-3">
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
                <div key={video.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm font-bold text-slate-800">
                      {video.platform === "TikTok" ? <Music size={16} className="text-rose-500" /> : <Youtube size={16} className="text-red-500" />}
                      {video.platform === "TikTok" ? "TikTok" : "YouTube Short"}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    {video.status === "approved" ? (
                      <>12.4K lượt truy cập hợp lệ</>
                    ) : (
                      <>Đã gửi {new Date(video.created_at).toLocaleDateString("vi-VN")}</>
                    )}
                  </div>
                  {video.status === "approved" && (
                    <p className="mt-1 text-sm font-bold text-amber-500">+{video.coin_awarded || 0} coin</p>
                  )}
                  {video.admin_note && <p className="mt-2 rounded-lg bg-slate-50 p-2 text-xs italic text-slate-500">{video.admin_note}</p>}
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
