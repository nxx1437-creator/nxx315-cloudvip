import React, { useState, useEffect } from "react";
import { Megaphone, Music, Youtube, Sparkles, Send, Coins, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

// 🛡️ Hàm kiểm tra link hợp lệ (Chỉ cho TikTok, YouTube, Short)
const isValidLink = (url) => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    return (
      host.includes("tiktok.com") ||
      host.includes("youtube.com") ||
      host.includes("youtu.be")
    );
  } catch {
    return false;
  }
};

export default function Marketing() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [link, setLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Lấy danh sách video của user
  useEffect(() => {
    const fetchVideos = async () => {
      if (!session?.user?.id) return;
      const { data } = await supabase
        .from("marketing_videos")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      setVideos(data ?? []);
      setLoading(false);
    };
    fetchVideos();
  }, [session]);

  const handleSubmit = async () => {
    // ✅ Bộ lọc link
    if (!link.trim()) {
      alert("Vui lòng nhập link video!");
      return;
    }
    if (!isValidLink(link)) {
      alert("Link không hợp lệ! Vui lòng chỉ nhập link TikTok hoặc YouTube.");
      return;
    }

    setIsSubmitting(true);

    // ✅ Tự động lấy tiêu đề video (nếu có)
    let fetchedTitle = "";
    try {
      const noembed = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(link)}`);
      const noembedData = await noembed.json();
      if (noembedData.title) fetchedTitle = noembedData.title;
    } catch {}

    const { error } = await supabase.from("marketing_videos").insert({
      user_id: session.user.id,
      link: link.trim(),
      title: fetchedTitle,
      platform: link.includes("tiktok.com") ? "TikTok" : "YouTube",
      status: "pending"
    });
    setIsSubmitting(false);

    if (error) {
      alert("Lỗi gửi video: " + error.message);
      return;
    }

    setLink("");
    alert("Đã gửi video thành công! Chờ admin duyệt nhé!");
    const { data: newVideos } = await supabase
      .from("marketing_videos")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    setVideos(newVideos ?? []);
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
        <h1 className="font-display text-xl font-bold text-slate-900">Marketing Video</h1>
      </header>

      <main className="mx-auto max-w-md px-4 py-5">
        {/* GIỚI THIỆU */}
        <div className="rounded-3xl border border-sky-100 bg-gradient-to-b from-sky-100 via-sky-50 to-white p-6 shadow-lg shadow-sky-100">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-sm"><Megaphone size={16} /></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">MARKETING</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Kiếm coin từ TikTok / YouTube</h1>
          <p className="mt-2 text-sm text-slate-500">Quay video giới thiệu trang web, đăng lên TikTok hoặc YouTube, gửi link tại đây – admin duyệt và trả coin theo số lượt xem.</p>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-emerald-600 shadow-sm"><CheckCircle2 size={12} /> Duyệt nhanh</span>
            <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-sky-600 shadow-sm"><Coins size={12} /> Trả coin tự động</span>
            <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-amber-600 shadow-sm"><Sparkles size={12} /> Bonus theo view</span>
          </div>
        </div>

        {/* CÁCH TÍNH THƯỞNG */}
        <div className="mt-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Cách tính thưởng</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500"><Music size={18} /></span>
              <div>
                <p className="text-xs text-slate-500">TikTok</p>
                <p className="text-sm font-bold text-slate-800">1K view = 2.500 coin</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500"><Youtube size={18} /></span>
              <div>
                <p className="text-xs text-slate-500">YouTube Long</p>
                <p className="text-sm font-bold text-slate-800">1K view = 25.000 coin</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500"><Youtube size={18} /></span>
              <div>
                <p className="text-xs text-slate-500">YouTube Short</p>
                <p className="text-sm font-bold text-slate-800">1K view = 10.000 coin</p>
              </div>
            </div>
          </div>
        </div>

        {/* GỬI LINK VIDEO */}
        <div className="mt-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Gửi link video của bạn</h2>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={link} 
              onChange={(e) => setLink(e.target.value)} 
              placeholder="Dán link TikTok / YouTube..." 
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400"
            />
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white shadow-md shadow-blue-500/25 hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">⚠️ Vui lòng chỉ gửi link TikTok hoặc YouTube hợp lệ. Link không hợp lệ sẽ bị từ chối.</p>
        </div>

        {/* LỊCH SỬ VIDEO */}
        <div className="mt-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Video của bạn</h2>
          
          <div className="mb-4 flex gap-2">
            <button onClick={() => setActiveTab("all")} className={`px-4 py-2 rounded-full text-xs font-semibold ${activeTab === "all" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"}`}>Tất cả</button>
            <button onClick={() => setActiveTab("pending")} className={`px-4 py-2 rounded-full text-xs font-semibold ${activeTab === "pending" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"}`}>Chờ duyệt</button>
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
                <p className="mt-1 text-xs text-slate-400">Quay video và gửi link đầu tiên của bạn</p>
              </div>
            ) : filteredVideos.map((video) => {
              const statusConfig = getStatus(video.status);
              return (
                <div key={video.id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${video.platform === "TikTok" ? "bg-slate-100 text-slate-700" : "bg-red-50 text-red-600"}`}>
                      {video.platform === "TikTok" ? <Music size={12} /> : <Youtube size={12} />} {video.platform}
                    </span>
                    <p className="text-sm font-bold text-amber-500"><Coins size={14} className="inline" /> {video.coin_awarded || 0}</p>
                  </div>
                  <div className="mt-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusConfig.color}`}>{statusConfig.label}</span>
                    <p className="mt-1 text-xs text-slate-400">{new Date(video.created_at).toLocaleString("vi-VN")}</p>
                  </div>
                  <p className="mt-2 break-all text-sm font-medium text-blue-500">{video.title || video.link}</p>
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
