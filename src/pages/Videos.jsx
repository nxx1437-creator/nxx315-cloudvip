import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Loader2,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  X,
  Send,
  Eye,
  Coins,
  Play,
  ExternalLink,
  Sparkles,
  Headphones,
  Home,
  Star,
  Bot,
  TrendingUp,
  Clock,
  Flame,
} from "lucide-react";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { supabase } from "../lib/supabaseClient.js";
import useSession from "../hooks/useSession.js";

const SUPABASE_URL = "https://rwglwovohbyqmbbzdvdj.supabase.co";
const STORAGE_BUCKET = "game_logos";

const getImageUrl = (fileName) =>
  `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;

const VIDEO_BANNER = "video-banner.png";
const VIDEO_BANNER_LINK = "/videos";

const TABS = [
  { id: "all", label: "Tất cả" },
  { id: "roblox", label: "Roblox" },
  { id: "guide", label: "Hướng dẫn" },
  { id: "event", label: "Sự kiện" },
];

function formatNumber(n) {
  if (!n) return "0";
  if (n < 1000) return String(n);
  if (n < 1000000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
}

function timeAgo(date) {
  if (!date) return "";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Vừa xong";
  if (seconds < 3600) return Math.floor(seconds / 60) + " phút trước";
  if (seconds < 86400) return Math.floor(seconds / 3600) + " giờ trước";
  if (seconds < 604800) return Math.floor(seconds / 86400) + " ngày trước";
  return new Date(date).toLocaleDateString("vi-VN");
}

function calculateRating(video) {
  if (!video.likes_count || !video.views_count) return null;
  const score = (video.likes_count / video.views_count) * 10;
  return Math.min(10, Math.max(6, Number(score.toFixed(1))));
}

export default function Videos() {
  const navigate = useNavigate();
  const { session } = useSession();
  const user = session?.user;

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [activeVideo, setActiveVideo] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.clearTimeout(window.__videoToast);
    window.__videoToast = window.setTimeout(() => setToast(null), 3000);
  };

  const loadVideos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_videos", {
        p_category: null,
        p_limit: 100,
      });

      if (error) throw error;
      setVideos(data || []);
    } catch (err) {
      console.error("Load videos error:", err);
      showToast("Không thể tải video", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  // Filter theo tab + search
  const filtered = videos.filter((v) => {
    // Filter theo tab
    if (activeTab !== "all") {
      if ((v.category || "general") !== activeTab) return false;
    }
    // Filter theo search
    if (search.trim()) {
      const kw = search.trim().toLowerCase();
      const match =
        v.title.toLowerCase().includes(kw) ||
        (v.description || "").toLowerCase().includes(kw);
      if (!match) return false;
    }
    return true;
  });

  const featured = filtered.filter((v) => v.is_featured);
  const others = filtered.filter((v) => !v.is_featured);

  const updateVideoInState = (videoId, patch) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, ...patch } : v))
    );
    setActiveVideo((prev) =>
      prev && prev.id === videoId ? { ...prev, ...patch } : prev
    );
  };
    if (loading) {
    return (
      <div className="min-h-screen bg-white pb-24">
        <TopHeader />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed left-1/2 top-4 z-[100] flex w-[calc(100%-32px)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl ${
            toast.type === "error"
              ? "border-rose-200 bg-white text-rose-700"
              : "border-emerald-200 bg-white text-emerald-700"
          }`}
        >
          <Sparkles size={18} />
          <p className="text-sm font-semibold">{toast.message}</p>
        </div>
      )}

      <TopHeader />

      {/* HEADER */}
      <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-slate-100 bg-white px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center"
        >
          <ArrowLeft size={22} strokeWidth={2} className="text-slate-900" />
        </button>
        <h1 className="flex-1 text-[17px] font-black tracking-tight text-slate-900">
          Video
        </h1>
        <button
          onClick={() => navigate("/support")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700"
        >
          <Headphones size={18} strokeWidth={2.2} />
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700"
        >
          <Home size={18} strokeWidth={2.2} />
        </button>
      </div>

      <div className="mx-auto max-w-2xl">
        {/* SEARCH + TRỢ LÝ */}
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <Search size={16} className="shrink-0 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm video..."
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              onClick={() => navigate("/support")}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-3 text-[12px] font-bold text-sky-600 shadow-sm"
            >
              <Bot size={14} strokeWidth={2.4} />
              Trợ lý
            </button>
          </div>
        </div>

        {/* BANNER TĨNH */}
        <div className="px-4 pt-4">
          <button
            onClick={() => navigate(VIDEO_BANNER_LINK)}
            className="group relative w-full overflow-hidden rounded-2xl text-left shadow-md transition active:scale-[0.99]"
          >
            <div className="relative aspect-[16/6] w-full overflow-hidden bg-gradient-to-br from-pink-200 via-pink-100 to-sky-100">
              <img
                src={getImageUrl(VIDEO_BANNER)}
                alt="Video"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </button>
        </div>

        {/* FILTER TABS */}
        <div className="px-4 pt-4">
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-[12.5px] font-bold transition ${
                  activeTab === tab.id
                    ? "bg-pink-500 text-white shadow-md shadow-pink-500/30"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* VIDEO NỔI BẬT */}
        {featured.length > 0 && (
          <div className="pt-5">
            <div className="mb-3 flex items-center justify-between px-4">
              <h2 className="flex items-center gap-1.5 text-[15px] font-black text-slate-900">
                <Flame size={16} className="text-orange-500" />
                Video nổi bật
              </h2>
              <button
                onClick={() => setActiveTab("all")}
                className="text-[12px] font-bold text-pink-500"
              >
                Xem tất cả
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 px-4">
              {featured.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onClick={() => setActiveVideo(video)}
                />
              ))}
            </div>
          </div>
        )}

        {/* MỚI CẬP NHẬT */}
        {others.length > 0 && (
          <div className="pt-5">
            <div className="mb-3 flex items-center justify-between px-4">
              <h2 className="flex items-center gap-1.5 text-[15px] font-black text-slate-900">
                <Clock size={16} className="text-sky-500" />
                Mới cập nhật
              </h2>
              <button
                onClick={() => setActiveTab("all")}
                className="text-[12px] font-bold text-pink-500"
              >
                Xem tất cả
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 px-4">
              {others.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onClick={() => setActiveVideo(video)}
                />
              ))}
            </div>
          </div>
        )}

        {/* EMPTY */}
        {!loading && filtered.length === 0 && (
          <div className="mx-4 mt-6 rounded-2xl border border-slate-200 bg-white py-16 text-center">
            <Play size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-bold text-slate-600">
              {search || activeTab !== "all"
                ? "Không tìm thấy video"
                : "Chưa có video nào"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {search ? "Thử từ khóa khác" : "Video sẽ sớm được cập nhật"}
            </p>
          </div>
        )}

        <div className="pb-6" />
      </div>

      {/* Modal Video */}
      {activeVideo && (
        <VideoPlayerModal
          video={activeVideo}
          user={user}
          onClose={() => setActiveVideo(null)}
          onUpdate={(patch) => updateVideoInState(activeVideo.id, patch)}
          showToast={showToast}
        />
      )}

      <BottomNav />
    </div>
  );
}

// =====================================================
// VIDEO CARD (grid 2 cột)
// =====================================================
function VideoCard({ video, onClick }) {
  const [imageError, setImageError] = useState(false);
  const rating = calculateRating(video);

  return (
    <button
      onClick={onClick}
      className="group overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow-sm transition active:scale-[0.98]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        {!imageError && video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt=""
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
            <Play size={32} className="text-slate-400" />
          </div>
        )}

        {/* Play button center */}
        <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-lg transition group-hover:opacity-100">
          <Play size={16} className="ml-0.5 text-slate-900" fill="currentColor" />
        </div>

        {/* Reward badge */}
        {video.reward_coins > 0 && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white shadow-md">
            <Coins size={10} />
            +{video.reward_coins}
          </div>
        )}

        {/* Duration (nếu có) */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {video.duration}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="line-clamp-2 text-[13px] font-bold leading-tight text-slate-900">
          {video.title}
        </h3>

        <div className="mt-2 flex items-center gap-3 text-[10.5px] text-slate-500">
          {rating && (
            <span className="flex items-center gap-1">
              <Star size={10} fill="#FBBF24" className="text-amber-400" />
              <b className="text-slate-700">{rating}</b>
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye size={10} />
            {formatNumber(video.views_count)}
          </span>
          <span className="flex items-center gap-1">
            <Heart size={10} />
            {formatNumber(video.likes_count)}
          </span>
        </div>
      </div>
    </button>
  );
                }
