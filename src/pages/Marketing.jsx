import React, { useState, useEffect } from "react";
import { 
  Megaphone, Music, Youtube, Sparkles, Send, Coins, 
  Clock, CheckCircle2, XCircle, Loader2, ShieldCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import BottomNav from "../components/BottomNav.jsx";

// Dữ liệu mẫu (Sau này thay bằng API thật từ Supabase)
const MOCK_VIDEOS = [
  { 
    id: 1, platform: "YouTube", title: "được 10 robux mỗi n...", 
    coin: 7170, status: "rejected", date: "15:02:43 22/5/2026", 
    view: 717, like: 40, cmt: 9, ctr: "0%", 
    note: "Admin: video đã ẩn hoặc bị xóa nên sẽ không được cập nhật coin mới"
  },
  { 
    id: 2, platform: "TikTok", title: "10 robux mỗi ngày t...", 
    coin: 2510, status: "rejected", date: "05:56:21 22/5/2026", 
    view: 1004, like: 61, cmt: 12, ctr: "0%", 
    note: "Admin: video đã ẩn hoặc bị xóa nên sẽ không được cập nhật coin mới"
  },
  { 
    id: 3, platform: "YouTube", title: "Rồi sao phải như vậ...", 
    coin: 2670, status: "rejected", date: "21:54:44 21/5/2026", 
    view: 500, like: 50, cmt: 10, ctr: "0%", 
    note: "Admin: video đã ẩn hoặc bị xóa nên sẽ không được cập nhật coin mới"
  },
];

// Các mốc view
const VIEW_TIERS = [
  { view: "1.000", coin: "2.268" },
  { view: "5.000", coin: "12.474" },
  { view: "10.000", coin: "27.216" },
  { view: "50.000", coin: "136.080" },
];

export default function Marketing() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile } = useProfile();
  
  const [link, setLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // all, pending, approved, rejected, paid
  const [videos, setVideos] = useState(MOCK_VIDEOS); // Dữ liệu mẫu

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!link.trim()) {
      alert("Vui lòng nhập link video!");
      return;
    }
    
    setIsSubmitting(true);
    // TODO: Gọi API lên Supabase để gửi link lên admin duyệt
    setTimeout(() => {
      setIsSubmitting(false);
      setLink("");
      alert("Đã gửi video thành công! Chờ admin duyệt nhé!");
    }, 1000);
  };

  const filteredVideos = videos.filter((v) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return v.status === "pending";
    if (activeTab === "approved") return v.status === "approved";
    if (activeTab === "rejected") return v.status === "rejected";
    if (activeTab === "paid") return v.status === "paid";
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 px-4 py-4 backdrop-blur-md">
        <h1 className="font-display text-xl font-bold text-slate-900">Marketing Video</h1>
      </header>

      <main className="mx-auto max-w-md space-y-5 px-4 py-5">
        {/* 1. Giới thiệu */}
        <div className="rounded-3xl border border-sky-100 bg-gradient-to-b from-sky-50 to-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-500">
              <Megaphone size={28} />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Marketing Video — Kiếm coin từ TikTok / YouTube
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Quay video giới thiệu trang web, đăng lên TikTok hoặc YouTube, gửi link tại đây — admin duyệt và trả coin theo số lượt xem.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                <Music size={18} />
              </span>
              <div>
                <p className="text-xs text-slate-400">TikTok</p>
                <p className="text-sm font-bold text-slate-800">1K view = 2.500 coin</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
                <Youtube size={18} />
              </span>
              <div>
                <p className="text-xs text-slate-400">YouTube Long</p>
                <p className="text-sm font-bold text-slate-800">1K view = 25.000 coin</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
                <Youtube size={18} />
              </span>
              <div>
                <p className="text-xs text-slate-400">YouTube Short</p>
                <p className="text-sm font-bold text-slate-800">1K view = 10.000 coin</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-500">
                <Sparkles size={18} />
              </span>
              <div>
                <p className="text-xs text-amber-500">Bonus theo view</p>
                <p className="text-sm font-bold text-amber-600">≥5K +10% • ≥10K +20%</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Gửi link video */}
        <div className="rounded-3xl border border-white bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Gửi link video của bạn</h2>
          
          <form onSubmit={handleSubmit} className="mt-4">
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Dán link TikTok / YouTube v..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400"
            />
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-blue-500 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-600 disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Gửi duyệt
            </button>
          </form>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {VIEW_TIERS.map((tier) => (
              <div key={tier.view} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{tier.view} view</p>
                <p className="mt-1 flex items-center gap-1 text-sm font-bold text-amber-600">
                  <Coins size={14} /> {tier.coin}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Thống kê */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white bg-white p-4 text-center shadow-sm">
            <p className="text-xs text-slate-400">Tổng video</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">4</p>
          </div>
          <div className="rounded-2xl border border-white bg-white p-4 text-center shadow-sm">
            <p className="text-xs text-slate-400">Chờ duyệt</p>
            <p className="mt-1 text-2xl font-bold text-amber-500">0</p>
          </div>
          <div className="rounded-2xl border border-white bg-white p-4 text-center shadow-sm">
            <p className="text-xs text-slate-400">Đã duyệt</p>
            <p className="mt-1 text-2xl font-bold text-blue-500">0</p>
          </div>
          <div className="rounded-2xl border border-white bg-white p-4 text-center shadow-sm">
            <p className="text-xs text-slate-400">Coin đã nhận</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              <Coins size={18} className="inline" /> 0
            </p>
          </div>
        </div>

        {/* 4. Danh sách video */}
        <div className="rounded-3xl border border-white bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Video của bạn</h2>
          
          {/* Tabs */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button 
              onClick={() => setActiveTab("all")}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${activeTab === "all" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"}`}
            >
              Tất cả <span className="ml-1">4</span>
            </button>
            <button 
              onClick={() => setActiveTab("pending")}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${activeTab === "pending" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"}`}
            >
              Chờ duyệt <span className="ml-1">0</span>
            </button>
            <button 
              onClick={() => setActiveTab("approved")}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${activeTab === "approved" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"}`}
            >
              Đã duyệt <span className="ml-1">0</span>
            </button>
            <button 
              onClick={() => setActiveTab("paid")}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${activeTab === "paid" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"}`}
            >
              Đã trả coin <span className="ml-1">0</span>
            </button>
            <button 
              onClick={() => setActiveTab("rejected")}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${activeTab === "rejected" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"}`}
            >
              Từ chối <span className="ml-1">4</span>
            </button>
          </div>

          {/* Danh sách video */}
          <div className="mt-5 space-y-4">
            {filteredVideos.map((video) => (
              <div key={video.id} className="rounded-2xl border border-slate-100 p-4">
                {/* Platform & Coin */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${video.platform === "TikTok" ? "bg-slate-100 text-slate-700" : "bg-red-50 text-red-600"}`}>
                      {video.platform === "TikTok" ? <Music size={12} /> : <Youtube size={12} />}
                      {video.platform}
                    </span>
                    <span className="text-xs text-slate-400">Coin</span>
                  </div>
                  <p className="text-lg font-bold text-amber-500">
                    <Coins size={16} className="inline" /> {video.coin.toLocaleString()}
                  </p>
                </div>

                {/* Status */}
                <div className="mt-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${video.status === "rejected" ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-600"}`}>
                    {video.status === "rejected" ? "Từ chối" : "Đã duyệt"}
                  </span>
                  <p className="mt-1 text-xs text-slate-400">{video.date}</p>
                </div>

                {/* Title */}
                <p className="mt-2 text-sm font-medium text-blue-500">{video.title}</p>

                {/* Stats */}
                <div className="mt-3 grid grid-cols-4 gap-2">
                  <div className="rounded-lg bg-slate-50 p-2 text-center">
                    <p className="text-[10px] text-slate-400">View</p>
                    <p className="text-sm font-bold text-slate-800">{video.view}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2 text-center">
                    <p className="text-[10px] text-slate-400">Like</p>
                    <p className="text-sm font-bold text-slate-800">{video.like}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2 text-center">
                    <p className="text-[10px] text-slate-400">Cmt</p>
                    <p className="text-sm font-bold text-slate-800">{video.cmt}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2 text-center">
                    <p className="text-[10px] text-slate-400">CTR</p>
                    <p className="text-sm font-bold text-slate-800">{video.ctr}</p>
                  </div>
                </div>

                {/* Admin note */}
                {video.note && (
                  <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs italic text-slate-500">
                    {video.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
         }
