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
  ChevronRight,
  Star,
  Bot,
  TrendingUp,
  Clock,
} from "lucide-react";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { supabase } from "../lib/supabaseClient.js";
import useSession from "../hooks/useSession.js";

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

// Tính rating từ likes/views
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

  const filtered = videos.filter((v) =>
    !search.trim()
      ? true
      : v.title.toLowerCase().includes(search.trim().toLowerCase()) ||
        (v.description || "").toLowerCase().includes(search.trim().toLowerCase())
  );

  const featured = filtered.filter((v) => v.is_featured);
  const others = filtered.filter((v) => !v.is_featured);
  const bannerVideo = featured[0] || filtered[0];

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
      <div className="min-h-screen bg-slate-50 pb-24">
        <TopHeader />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
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

      {/* HEADER giống MoMo */}
      <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-slate-100 bg-white px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center"
        >
          <ArrowLeft size={22} strokeWidth={2} className="text-slate-900" />
        </button>
        <h1 className="flex-1 text-[16px] font-black tracking-tight text-slate-900">
          Khám phá video
        </h1>
        <a
          href="/support"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700"
        >
          <Headphones size={18} strokeWidth={2.2} />
        </a>
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

        {/* BANNER */}
        {bannerVideo && (
          <div className="px-4 pt-4">
            <button
              onClick={() => setActiveVideo(bannerVideo)}
              className="group relative w-full overflow-hidden rounded-2xl text-left shadow-md transition active:scale-[0.99]"
            >
              {/* Ảnh nền */}
              <div className="relative aspect-[16/7] w-full overflow-hidden bg-slate-900">
                {bannerVideo.thumbnail_url && (
                  <img
                    src={bannerVideo.thumbnail_url}
                    alt=""
                    className="h-full w-full object-cover opacity-70"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Text overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white">
                      HOT
                    </span>
                    {bannerVideo.reward_coins > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-black text-amber-600">
                        <Coins size={10} />
                        +{bannerVideo.reward_coins} xu
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 line-clamp-2 text-[15px] font-black leading-tight text-white">
                    {bannerVideo.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-white/80">
                    <Eye size={12} />
                    {formatNumber(bannerVideo.views_count)} lượt xem
                  </div>
                </div>

                {/* Play button */}
                <div className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-xl">
                  <Play
                    size={20}
                    className="ml-0.5 text-slate-900"
                    fill="currentColor"
                  />
                </div>
              </div>
            </button>
          </div>
        )}

        {/* VIDEO NỔI BẬT */}
        {featured.length > 0 && (
          <div className="pt-6">
            <div className="flex items-center justify-between px-4">
              <h2 className="flex items-center gap-1.5 text-[15px] font-black text-slate-900">
                <TrendingUp size={16} className="text-amber-500" />
                Đáng xem tuần này
              </h2>
              {featured.length > 2 && (
                <ChevronRight size={18} className="text-slate-400" />
              )}
            </div>

            <div className="mt-3 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {featured.map((video) => (
                <FeaturedCard
                  key={video.id}
                  video={video}
                  onClick={() => setActiveVideo(video)}
                />
              ))}
            </div>
          </div>
        )}

        {/* VIDEO MỚI NHẤT */}
        {others.length > 0 && (
          <div className="pt-6">
            <div className="flex items-center justify-between px-4">
              <h2 className="flex items-center gap-1.5 text-[15px] font-black text-slate-900">
                <Clock size={16} className="text-sky-500" />
                Video mới nhất
              </h2>
            </div>

            <div className="mt-3 space-y-3 px-4">
              {others.map((video) => (
                <VideoRow
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
              {search ? "Không tìm thấy video" : "Chưa có video nào"}
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
// FEATURED CARD (to, có rating)
// =====================================================
function FeaturedCard({ video, onClick }) {
  const [imageError, setImageError] = useState(false);
  const isVertical = video.orientation === "vertical";
  const rating = calculateRating(video);

  return (
    <button
      onClick={onClick}
      className="group w-[140px] shrink-0 text-left transition active:scale-[0.97]"
    >
      <div
        className={`relative w-full overflow-hidden rounded-xl bg-slate-100 shadow-sm ${
          isVertical ? "aspect-[2/3]" : "aspect-[2/3]"
        }`}
      >
        {!imageError && video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
            <Play size={32} className="text-slate-400" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Reward badge */}
        {video.reward_coins > 0 && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white shadow-md">
            <Coins size={10} />
            +{video.reward_coins}
          </div>
        )}

        {/* Play button center */}
        <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-lg transition group-hover:opacity-100">
          <Play size={16} className="ml-0.5 text-slate-900" fill="currentColor" />
        </div>

        {/* Rating bottom */}
        {rating && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 backdrop-blur-sm">
            <Star size={10} fill="#FBBF24" className="text-amber-400" />
            <span className="text-[10px] font-bold text-white">{rating}</span>
          </div>
        )}
      </div>

      <h3 className="mt-2 line-clamp-2 text-[12px] font-bold leading-tight text-slate-900">
        {video.title}
      </h3>

      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <Eye size={10} />
          {formatNumber(video.views_count)}
        </span>
        <span className="flex items-center gap-1">
          <Heart size={10} />
          {formatNumber(video.likes_count)}
        </span>
      </div>
    </button>
  );
}

// =====================================================
// VIDEO ROW (dạng list ngang)
// =====================================================
function VideoRow({ video, onClick }) {
  const [imageError, setImageError] = useState(false);
  const rating = calculateRating(video);

  return (
    <button
      onClick={onClick}
      className="group flex w-full items-start gap-3 rounded-2xl border border-slate-100 bg-white p-2.5 text-left shadow-sm transition active:scale-[0.99]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-[140px] shrink-0 overflow-hidden rounded-xl bg-slate-100">
        {!imageError && video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-200">
            <Play size={22} className="text-slate-400" />
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition group-hover:opacity-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90">
            <Play size={14} className="ml-0.5 text-slate-900" fill="currentColor" />
          </div>
        </div>

        {video.reward_coins > 0 && (
          <div className="absolute right-1 top-1 flex items-center gap-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-black text-white shadow">
            <Coins size={9} />+{video.reward_coins}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-[13px] font-bold leading-tight text-slate-900">
          {video.title}
        </h3>

        {video.description && (
          <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">
            {video.description}
          </p>
        )}

        <div className="mt-1.5 flex items-center gap-3 text-[10.5px] text-slate-500">
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
    // =====================================================
// VIDEO PLAYER MODAL
// =====================================================
function VideoPlayerModal({ video, user, onClose, onUpdate, showToast }) {
  const [isLiked, setIsLiked] = useState(video.is_liked || false);
  const [isSaved, setIsSaved] = useState(video.is_saved || false);
  const [likesCount, setLikesCount] = useState(video.likes_count || 0);
  const [savesCount, setSavesCount] = useState(video.saves_count || 0);
  const [viewsCount, setViewsCount] = useState(video.views_count || 0);
  const [commentsCount, setCommentsCount] = useState(video.comments_count || 0);
  const [isRewarded, setIsRewarded] = useState(video.is_rewarded || false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const watchStartRef = useRef(Date.now());
  const rewardSentRef = useRef(false);

  // Auto send watch reward khi đóng modal
  const sendWatchReward = async () => {
    if (!user?.id || rewardSentRef.current) return;
    rewardSentRef.current = true;

    const watchedSeconds = Math.floor((Date.now() - watchStartRef.current) / 1000);

    try {
      const { data, error } = await supabase.rpc("watch_video", {
        p_user_id: user.id,
        p_video_id: video.id,
        p_watched_seconds: watchedSeconds,
      });

      if (error) throw error;

      if (data?.rewarded === true) {
        setIsRewarded(true);
        onUpdate({ is_rewarded: true, views_count: viewsCount + 1 });
        showToast(`+${data.reward_amount} xu từ video!`, "success");
      } else {
        onUpdate({ views_count: viewsCount + 1 });
      }
    } catch (err) {
      console.error("Watch reward error:", err);
    }
  };

  const handleClose = async () => {
    await sendWatchReward();
    onClose();
  };

  // Like
  const handleLike = async () => {
    if (!user?.id) {
      showToast("Vui lòng đăng nhập để thích video", "error");
      return;
    }

    try {
      const { data, error } = await supabase.rpc("like_video", {
        p_user_id: user.id,
        p_video_id: video.id,
      });

      if (error) throw error;

      setIsLiked(data.liked);
      setLikesCount((c) => (data.liked ? c + 1 : Math.max(c - 1, 0)));
      onUpdate({
        is_liked: data.liked,
        likes_count: data.liked ? likesCount + 1 : Math.max(likesCount - 1, 0),
      });
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  // Save
  const handleSave = async () => {
    if (!user?.id) {
      showToast("Vui lòng đăng nhập để lưu video", "error");
      return;
    }

    try {
      const { data, error } = await supabase.rpc("save_video", {
        p_user_id: user.id,
        p_video_id: video.id,
      });

      if (error) throw error;

      setIsSaved(data.saved);
      setSavesCount((c) => (data.saved ? c + 1 : Math.max(c - 1, 0)));
      onUpdate({
        is_saved: data.saved,
        saves_count: data.saved ? savesCount + 1 : Math.max(savesCount - 1, 0),
      });
      showToast(data.saved ? "Đã lưu video" : "Đã bỏ lưu", "success");
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  // Share
  const handleShare = async () => {
    const url = `${window.location.origin}/videos#${video.id}`;
    const text = `Xem video: ${video.title}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: video.title, text, url });
      } catch (err) {
        // User cancel
      }
    } else {
      navigator.clipboard?.writeText(`${text}\n${url}`);
      showToast("Đã copy link video", "success");
    }
  };

  // Load comments
  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase.rpc("get_video_comments", {
        p_video_id: video.id,
        p_limit: 50,
      });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error("Load comments error:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (showComments) loadComments();
  }, [showComments]);

  // Post comment
  const handlePostComment = async () => {
    if (!commentText.trim() || !user?.id) return;

    setPostingComment(true);
    try {
      const { data, error } = await supabase.rpc("add_video_comment", {
        p_user_id: user.id,
        p_video_id: video.id,
        p_content: commentText.trim(),
      });

      if (error) throw error;
      if (data?.error) {
        showToast(data.error, "error");
        return;
      }

      setCommentText("");
      setCommentsCount((c) => c + 1);
      onUpdate({ comments_count: commentsCount + 1 });
      await loadComments();
    } catch (err) {
      console.error("Post comment error:", err);
      showToast("Không thể gửi bình luận", "error");
    } finally {
      setPostingComment(false);
    }
  };

  const isVertical = video.orientation === "vertical";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="relative w-full max-w-lg">
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute -top-12 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm"
        >
          <X size={18} />
        </button>

        {/* Video container */}
        <div
          className={`relative overflow-hidden rounded-2xl bg-black ${
            isVertical ? "aspect-[9/16] max-h-[80vh]" : "aspect-video"
          }`}
        >
          {/* Embed iframe */}
          {video.source_type === "youtube" && video.embed_url && (
            <iframe
              src={video.embed_url}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}

          {video.source_type === "tiktok" && video.embed_url && (
            <iframe
              src={video.embed_url}
              className="h-full w-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          )}

          {video.source_type === "upload" && (
            <video
              src={video.source_url}
              className="h-full w-full object-contain"
              controls
              autoPlay
            />
          )}

          {/* Fallback */}
          {!video.embed_url && video.source_type !== "upload" && (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center text-white">
              <Play size={40} />
              <p className="text-sm">Không thể phát video trong app</p>
              <a
                href={video.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-semibold"
              >
                <ExternalLink size={14} />
                Mở link gốc
              </a>
            </div>
          )}
        </div>

        {/* Video info */}
        <div className="mt-4 rounded-2xl bg-white p-4">
          <h2 className="text-[15px] font-black leading-tight text-slate-900">
            {video.title}
          </h2>
          {video.description && (
            <p className="mt-1 line-clamp-2 text-[12.5px] leading-5 text-slate-500">
              {video.description}
            </p>
          )}

          {/* Stats */}
          <div className="mt-3 flex items-center gap-4 border-b border-slate-100 pb-3 text-[11.5px] text-slate-500">
            <span className="flex items-center gap-1">
              <Eye size={13} />
              {formatNumber(viewsCount)}
            </span>
            {video.reward_coins > 0 && (
              <span className="flex items-center gap-1 font-bold text-amber-600">
                <Coins size={13} />
                {isRewarded ? "Đã nhận" : `+${video.reward_coins} xu`}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="mt-3 grid grid-cols-4 gap-2">
            <button
              onClick={handleLike}
              className={`flex flex-col items-center gap-1 rounded-xl py-2.5 transition ${
                isLiked
                  ? "bg-rose-50 text-rose-600"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Heart
                size={18}
                fill={isLiked ? "currentColor" : "none"}
                strokeWidth={2.2}
              />
              <span className="text-[10px] font-bold">
                {formatNumber(likesCount)}
              </span>
            </button>

            <button
              onClick={() => setShowComments((v) => !v)}
              className={`flex flex-col items-center gap-1 rounded-xl py-2.5 transition ${
                showComments
                  ? "bg-sky-50 text-sky-600"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <MessageCircle size={18} strokeWidth={2.2} />
              <span className="text-[10px] font-bold">
                {formatNumber(commentsCount)}
              </span>
            </button>

            <button
              onClick={handleSave}
              className={`flex flex-col items-center gap-1 rounded-xl py-2.5 transition ${
                isSaved
                  ? "bg-amber-50 text-amber-600"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Bookmark
                size={18}
                fill={isSaved ? "currentColor" : "none"}
                strokeWidth={2.2}
              />
              <span className="text-[10px] font-bold">Lưu</span>
            </button>

            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-1 rounded-xl bg-slate-50 py-2.5 text-slate-600 transition hover:bg-slate-100"
            >
              <Share2 size={18} strokeWidth={2.2} />
              <span className="text-[10px] font-bold">Chia sẻ</span>
            </button>
          </div>

          {/* Comments */}
          {showComments && (
            <div className="mt-4 max-h-60 overflow-y-auto border-t border-slate-100 pt-3">
              {loadingComments ? (
                <div className="flex justify-center py-6">
                  <Loader2 size={20} className="animate-spin text-slate-400" />
                </div>
              ) : comments.length === 0 ? (
                <p className="py-6 text-center text-[12px] text-slate-400">
                  Chưa có bình luận
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-sky-400 to-blue-600">
                        {c.avatar_url ? (
                          <img
                            src={c.avatar_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-[11px] font-black text-white">
                            {(c.username || "U").slice(0, 1).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[12px] font-bold text-slate-800">
                            {c.username || "Ẩn danh"}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {timeAgo(c.created_at)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[12.5px] leading-5 text-slate-700">
                          {c.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Input */}
              {user?.id && (
                <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handlePostComment();
                      }
                    }}
                    placeholder="Viết bình luận..."
                    maxLength={500}
                    className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-[12.5px] outline-none focus:border-sky-500 focus:bg-white"
                  />
                  <button
                    onClick={handlePostComment}
                    disabled={postingComment || !commentText.trim()}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white disabled:opacity-40"
                  >
                    {postingComment ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
