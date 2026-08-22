import React, { useState } from "react";
import { Megaphone, Music, Youtube, Sparkles, Send, Coins, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { useMarketing } from "../hooks/useMarketing.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

export default function Marketing() {
  const { session } = useSession();
  const { profile } = useProfile();
  const { videos, loading, fetchVideos } = useMarketing(session?.user?.id);
  
  const [link, setLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!link.trim()) {
      alert("Vui lòng nhập link video!");
      return;
    }
    
    setIsSubmitting(true);
    const { error } = await supabase.from("marketing_videos").insert({
      user_id: session.user.id,
      link: link.trim(),
      platform: link.includes("tiktok") ? "TikTok" : "YouTube",
      status: "pending"
    });
    setIsSubmitting(false);
    
    if (error) {
      alert("Lỗi gửi video: " + error.message);
      return;
    }
    
    setLink("");
    alert("Đã gửi video thành công! Chờ admin duyệt nhé!");
    fetchVideos();
  };

  const filteredVideos = videos.filter((v) => {
    if (activeTab === "all") return true;
    return v.status === activeTab;
  });

  const total = videos.length;
  const pending = videos.filter(v => v.status === "pending").length;
  const approved = videos.filter(v => v.status === "approved").length;
  const rejected = videos.filter(v => v.status === "rejected").length;
  const totalCoins = videos.reduce((sum, v) => sum + (v.coin_awarded || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 px-4 py-4 backdrop-blur-md">
        <h1 className="font-display text-xl font-bold text-slate-900">Marketing Video</h1>
      </header>

      <main className="mx-auto max-w-md space-y-5 px-4 py-5">
        {/* Giới thiệu */}
        <div className="rounded-3xl border border-sky-100 bg-gradient-to-b from-sky-50 to-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-500"><Megaphone size={28} /></span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Marketing Video — Kiếm coin từ TikTok / YouTube</h2>
              <p className="mt-1 text-sm text-slate-500">Quay video giới thiệu web, đăng lên TikTok/YouTube, gửi link, admin duyệt và trả coin.</p>
            </div>
          </div>
        </div>

        {/* Gửi link */}
        <div className="rounded-3xl border border-white bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Gửi link video của bạn</h2>
          <form onSubmit={handleSubmit} className="mt-4">
            <input type="text" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Dán link TikTok / YouTube..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400" />
            <button type="submit" disabled={isSubmitting} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-blue-500 py-3 text-sm font-semibold text-white shadow-md disabled:opacity-60">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Gửi duyệt
            </button>
          </form>
        </div>

        {/* Thống kê */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm"><p className="text-xs text-slate-400">Tổng video</p><p className="mt-1 text-2xl font-bold text-slate-900">{total}</p></div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm"><p className="text-xs text-slate-400">Chờ duyệt</p><p className="mt-1 text-2xl font-bold text-amber-500">{pending}</p></div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm"><p className="text-xs text-slate-400">Đã duyệt</p><p className="mt-1 text-2xl font-bold text-blue-500">{approved}</p></div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm"><p className="text-xs text-slate-400">Coin đã nhận</p><p className="mt-1 text-2xl font-bold text-emerald-600"><Coins size={18} className="inline" /> {totalCoins}</p></div>
        </div>

        {/* Video của bạn */}
        <div className="rounded-3xl border border-white bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Video của bạn</h2>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {["all", "pending", "approved", "rejected"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-full px-4 py-2 text-xs font-semibold ${activeTab === tab ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                {tab === "all" ? "Tất cả" : tab === "pending" ? "Chờ duyệt" : tab === "approved" ? "Đã duyệt" : "Từ chối"}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-4">
            {loading ? (
              <p className="py-8 text-center text-sm text-slate-400">Đang tải...</p>
            ) : filteredVideos.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Bạn chưa gửi video nào.</p>
            ) : filteredVideos.map((video) => (
              <div key={video.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${video.platform === "TikTok" ? "bg-slate-100 text-slate-700" : "bg-red-50 text-red-600"}`}>
                    {video.platform === "TikTok" ? <Music size={12} /> : <Youtube size={12} />} {video.platform}
                  </span>
                  <p className="text-sm font-bold text-amber-500"><Coins size={14} className="inline" /> {video.coin_awarded || 0}</p>
                </div>
                <div className="mt-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${video.status === "rejected" ? "bg-rose-50 text-rose-500" : video.status === "approved" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                    {video.status === "pending" ? "Chờ duyệt" : video.status === "approved" ? "Đã duyệt" : "Từ chối"}
                  </span>
                  <p className="mt-1 text-xs text-slate-400">{new Date(video.created_at).toLocaleString("vi-VN")}</p>
                </div>
                <p className="mt-2 text-sm font-medium text-blue-500">{video.link}</p>
                {video.admin_note && <p className="mt-2 rounded-lg bg-slate-50 p-3 text-xs italic text-slate-500">Admin: {video.admin_note}</p>}
              </div>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
