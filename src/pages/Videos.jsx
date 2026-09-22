import React, { useEffect, useRef, useState } from "react";
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
import BottomNav from "../components/BottomNav.jsx";
import { supabase } from "../lib/supabaseClient.js";
import useSession from "../hooks/useSession.js";

/*
=====================================================
 NXX315 STUDIO REWARDS — VIDEO PAGE
=====================================================

BANNER:
- Upload your banner to Supabase Storage.
- Paste the public image URL below.
- Leave it empty to automatically use the featured
  video's thumbnail.

Example:
const BANNER_IMAGE_URL =
  "https://xxxx.supabase.co/storage/v1/object/public/...";
=====================================================
*/
const BANNER_IMAGE_URL = "";

function formatNumber(n) {
  if (!n) return "0";
  if (n < 1000) return String(n);
  if (n < 1000000) {
    return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
}

function timeAgo(date) {
  if (!date) return "";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Vừa xong";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
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

  const filtered = videos.filter((v) => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return true;

    return (
      (v.title || "").toLowerCase().includes(keyword) ||
      (v.description || "").toLowerCase().includes(keyword)
    );
  });

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
      <div className="min-h-screen bg-[#f7f8fc] pb-24">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-sky-500 shadow-lg shadow-pink-200">
              <Play size={20} className="ml-0.5 text-white" fill="currentColor" />
            </div>
            <Loader2 className="h-5 w-5 animate-spin text-pink-500" />
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const bannerImage = BANNER_IMAGE_URL || bannerVideo?.thumbnail_url;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f8fc] pb-24 text-slate-900">
      {toast && (
        <div
          className={`fixed left-1/2 top-4 z-[120] flex w-[calc(100%-28px)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-2xl ${
            toast.type === "error"
              ? "border-rose-100 text-rose-600"
              : "border-emerald-100 text-emerald-600"
          }`}
        >
          <Sparkles size={17} />
          <p className="text-[13px] font-bold">{toast.message}</p>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[62px] max-w-2xl items-center gap-2 px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-800 transition active:scale-95"
            aria-label="Quay lại"
          >
            <ArrowLeft size={21} strokeWidth={2.3} />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="truncate text-[17px] font-black tracking-[-0.02em]">
                Video
              </h1>
              <span className="rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-white">
                NXX315
              </span>
            </div>
            <p className="truncate text-[10px] font-medium text-slate-400">
              NXX315 Studio Rewards
            </p>
          </div>

          <button
            onClick={() => navigate("/support")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-50 to-sky-50 text-pink-500 transition active:scale-95"
            aria-label="Trợ giúp"
          >
            <Headphones size={19} strokeWidth={2.2} />
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-700 transition active:scale-95"
            aria-label="Trang chủ"
          >
            <Home size={19} strokeWidth={2.2} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl">
        {/* SEARCH */}
        <section className="px-4 pt-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-[48px] min-w-0 flex-1 items-center gap-2.5 rounded-2xl border border-slate-100 bg-white px-4 shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
              <Search size={19} className="shrink-0 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm video hoặc nội dung..."
                className="min-w-0 flex-1 bg-transparent text-[13px] font-medium outline-none placeholder:text-slate-400"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <button
              onClick={() => navigate("/support")}
              className="flex h-[48px] shrink-0 items-center gap-1.5 rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-fuchsia-50 px-3.5 text-[11px] font-black text-pink-500 shadow-[0_4px_18px_rgba(236,72,153,0.08)] transition active:scale-95"
            >
              <Bot size={16} strokeWidth={2.5} />
              Trợ lý
            </button>
          </div>
        </section>

        {/* HERO BANNER */}
        {bannerVideo && (
          <section className="px-4 pt-4">
            <button
              onClick={() => setActiveVideo(bannerVideo)}
              className="group relative block w-full overflow-hidden rounded-[24px] bg-slate-900 text-left shadow-[0_10px_30px_rgba(15,23,42,0.12)] transition active:scale-[0.99]"
            >
              <div className="relative aspect-[16/7.2] overflow-hidden">
                {bannerImage ? (
                  <img
                    src={bannerImage}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-pink-400 via-fuchsia-400 to-sky-400" />
                )}

                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/5" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

                <div className="absolute inset-y-0 left-0 flex w-[72%] flex-col justify-center px-5">
                  <div className="mb-2 flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 backdrop-blur-md">
                    <Sparkles size={11} className="text-pink-200" />
                    <span className="text-[9px] font-black uppercase tracking-[0.12em] text-white">
                      Nổi bật
                    </span>
                  </div>

                  <h2 className="line-clamp-2 text-[19px] font-black leading-[1.12] tracking-[-0.02em] text-white">
                    {bannerVideo.title}
                  </h2>

                  <div className="mt-2.5 flex items-center gap-3 text-[10px] font-semibold text-white/80">
                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      {formatNumber(bannerVideo.views_count)} lượt xem
                    </span>

                    {bannerVideo.reward_coins > 0 && (
                      <span className="flex items-center gap-1 text-amber-200">
                        <Coins size={12} />
                        +{bannerVideo.reward_coins} xu
                      </span>
                    )}
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-xl transition group-hover:scale-105">
                  <Play size={18} fill="currentColor" className="ml-0.5" />
                </div>
              </div>
            </button>
          </section>
        )}

        {/* FEATURED */}
        {featured.length > 0 && (
          <section className="pt-7">
            <div className="flex items-end justify-between px-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-fuchsia-500 text-white shadow-sm">
                    <TrendingUp size={14} />
                  </div>
                  <h2 className="text-[16px] font-black tracking-[-0.02em]">
                    Video nổi bật
                  </h2>
                </div>
                <p className="mt-1 text-[10px] font-medium text-slate-400">
                  Những nội dung đang được quan tâm
                </p>
              </div>

              {featured.length > 2 && (
                <span className="flex items-center gap-0.5 text-[11px] font-bold text-slate-400">
                  Xem thêm
                  <ChevronRight size={14} />
                </span>
              )}
            </div>

            <div className="mt-3 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {featured.map((video) => (
                <FeaturedCard
                  key={video.id}
                  video={video}
                  onClick={() => setActiveVideo(video)}
                />
              ))}
            </div>
          </section>
        )}

        {/* LATEST */}
        {others.length > 0 && (
          <section className="pt-7">
            <div className="px-4">
              <div className="flex items-center gap-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm">
                  <Clock size={14} />
                </div>
                <h2 className="text-[16px] font-black tracking-[-0.02em]">
                  Mới cập nhật
                </h2>
              </div>
              <p className="mt-1 text-[10px] font-medium text-slate-400">
                Video mới nhất từ NXX315 Studio Rewards
              </p>
            </div>

            <div className="mt-3 space-y-2.5 px-4">
              {others.map((video) => (
                <VideoRow
                  key={video.id}
                  video={video}
                  onClick={() => setActiveVideo(video)}
                />
              ))}
            </div>
          </section>
        )}

        {/* EMPTY */}
        {filtered.length === 0 && (
          <div className="mx-4 mt-6 rounded-[24px] border border-slate-100 bg-white px-5 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-50 to-sky-50 text-pink-400">
              <Play size={24} />
            </div>
            <p className="mt-4 text-[14px] font-black text-slate-700">
              {search ? "Không tìm thấy video" : "Chưa có video nào"}
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-400">
              {search
                ? "Thử tìm với từ khóa khác nhé"
                : "Video sẽ sớm được cập nhật"}
            </p>
          </div>
        )}

        <div className="h-6" />
      </main>

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

function FeaturedCard({ video, onClick }) {
  const [imageError, setImageError] = useState(false);
  const rating = calculateRating(video);

  return (
    <button
      onClick={onClick}
      className="group w-[148px] shrink-0 text-left transition active:scale-[0.97]"
    >
      <div className="relative aspect-[2/2.65] overflow-hidden rounded-[18px] bg-slate-100 shadow-[0_5px_18px_rgba(15,23,42,0.08)]">
        {!imageError && video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-100 to-sky-100">
            <Play size={30} className="text-slate-400" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {video.reward_coins > 0 && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-amber-400 px-2 py-1 text-[9px] font-black text-white shadow-lg">
            <Coins size={10} />
            +{video.reward_coins}
          </div>
        )}

        <div className="absolute bottom-2.5 left-2.5 right-2.5">
          {rating && (
            <div className="mb-1.5 flex w-fit items-center gap-1 rounded-full bg-black/45 px-2 py-1 backdrop-blur-md">
              <Star size={10} fill="currentColor" className="text-amber-300" />
              <span className="text-[9px] font-black text-white">{rating}</span>
            </div>
          )}

          <h3 className="line-clamp-2 text-[12px] font-black leading-tight text-white">
            {video.title}
          </h3>

          <div className="mt-1.5 flex items-center gap-2 text-[9px] font-medium text-white/75">
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

        <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 opacity-0 shadow-xl transition group-hover:opacity-100">
          <Play size={15} fill="currentColor" className="ml-0.5" />
        </div>
      </div>
    </button>
  );
}

function VideoRow({ video, onClick }) {
  const [imageError, setImageError] = useState(false);
  const rating = calculateRating(video);

  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-[18px] border border-slate-100 bg-white p-2.5 text-left shadow-[0_3px_14px_rgba(15,23,42,0.04)] transition active:scale-[0.99]"
    >
      <div className="relative aspect-video w-[132px] shrink-0 overflow-hidden rounded-[14px] bg-slate-100">
        {!imageError && video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-sky-100">
            <Play size={22} className="text-slate-400" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        <div className="absolute bottom-2 left-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-md">
          <Play size={11} fill="currentColor" className="ml-0.5" />
        </div>

        {video.reward_coins > 0 && (
          <div className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-full bg-amber-400 px-1.5 py-0.5 text-[8px] font-black text-white shadow">
            <Coins size={9} />
            +{video.reward_coins}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 py-0.5">
        <h3 className="line-clamp-2 text-[13px] font-black leading-[1.25] text-slate-800">
          {video.title}
        </h3>

        {video.description && (
          <p className="mt-1 line-clamp-1 text-[10.5px] font-medium text-slate-400">
            {video.description}
          </p>
        )}

        <div className="mt-2 flex items-center gap-2.5 text-[9.5px] font-medium text-slate-400">
          {rating && (
            <span className="flex items-center gap-1 text-slate-600">
              <Star size={10} fill="currentColor" className="text-amber-400" />
              {rating}
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

          {video.created_at && (
            <span className="truncate">{timeAgo(video.created_at)}</span>
          )}
        </div>
      </div>

      <ChevronRight size={17} className="shrink-0 text-slate-300" />
    </button>
  );
}

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

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const sendWatchReward = async () => {
    if (!user?.id || rewardSentRef.current) return;

    rewardSentRef.current = true;
    const watchedSeconds = Math.floor(
      (Date.now() - watchStartRef.current) / 1000
    );

    try {
      const { data, error } = await supabase.rpc("watch_video", {
        p_user_id: user.id,
        p_video_id: video.id,
        p_watched_seconds: watchedSeconds,
      });

      if (error) throw error;

      const nextViews = viewsCount + 1;

      if (data?.rewarded === true) {
        setIsRewarded(true);
        setViewsCount(nextViews);
        onUpdate({
          is_rewarded: true,
          views_count: nextViews,
        });
        showToast(`+${data.reward_amount} xu từ video!`, "success");
      } else {
        setViewsCount(nextViews);
        onUpdate({ views_count: nextViews });
      }
    } catch (err) {
      console.error("Watch reward error:", err);
    }
  };

  const handleClose = async () => {
    await sendWatchReward();
    onClose();
  };

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

      const nextLiked = data.liked;
      const nextCount = nextLiked
        ? likesCount + 1
        : Math.max(likesCount - 1, 0);

      setIsLiked(nextLiked);
      setLikesCount(nextCount);

      onUpdate({
        is_liked: nextLiked,
        likes_count: nextCount,
      });
    } catch (err) {
      console.error("Like error:", err);
      showToast("Không thể cập nhật lượt thích", "error");
    }
  };

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

      const nextSaved = data.saved;
      const nextCount = nextSaved
        ? savesCount + 1
        : Math.max(savesCount - 1, 0);

      setIsSaved(nextSaved);
      setSavesCount(nextCount);

      onUpdate({
        is_saved: nextSaved,
        saves_count: nextCount,
      });

      showToast(nextSaved ? "Đã lưu video" : "Đã bỏ lưu", "success");
    } catch (err) {
      console.error("Save error:", err);
      showToast("Không thể lưu video", "error");
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/videos#${video.id}`;
    const text = `Xem video: ${video.title}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text,
          url,
        });
      } catch {
        // Người dùng đóng bảng chia sẻ.
      }
    } else {
      try {
        await navigator.clipboard?.writeText(`${text}\n${url}`);
        showToast("Đã copy link video", "success");
      } catch {
        showToast("Không thể copy link", "error");
      }
    }
  };

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
      showToast("Không thể tải bình luận", "error");
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (showComments) loadComments();
  }, [showComments]);

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

      const nextCount = commentsCount + 1;

      setCommentText("");
      setCommentsCount(nextCount);
      onUpdate({ comments_count: nextCount });
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
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#f7f8fc]">
      {/* TOP BAR */}
      <div className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[58px] max-w-2xl items-center gap-2 px-4">
          <button
            onClick={handleClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-800 transition active:scale-95"
          >
            <ArrowLeft size={21} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-black text-slate-800">
              Đang xem
            </p>
            <p className="text-[9px] font-medium text-slate-400">
              NXX315 Studio Rewards
            </p>
          </div>

          <button
            onClick={handleShare}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-600"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        {/* VIDEO */}
        <div
          className={`relative w-full overflow-hidden bg-black ${
            isVertical ? "mx-auto max-w-[430px] aspect-[9/16]" : "aspect-video"
          }`}
        >
          {video.source_type === "youtube" && video.embed_url && (
            <iframe
              src={video.embed_url}
              title={video.title}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}

          {video.source_type === "tiktok" && video.embed_url && (
            <iframe
              src={video.embed_url}
              title={video.title}
              className="h-full w-full border-0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          )}

          {video.source_type === "upload" && video.source_url && (
            <video
              src={video.source_url}
              className="h-full w-full object-contain"
              controls
              autoPlay
              playsInline
            />
          )}

          {!video.embed_url &&
            video.source_type !== "upload" &&
            video.source_url && (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center text-white">
                <Play size={42} />
                <p className="text-sm font-bold">
                  Không thể phát video trong ứng dụng
                </p>
                <a
                  href={video.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold backdrop-blur-md"
                >
                  <ExternalLink size={14} />
                  Mở video gốc
                </a>
              </div>
            )}
        </div>

        {/* INFO */}
        <section className="rounded-b-[28px] bg-white px-4 pb-5 pt-4 shadow-[0_5px_25px_rgba(15,23,42,0.06)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-[17px] font-black leading-[1.25] tracking-[-0.02em] text-slate-900">
                {video.title}
              </h1>

              {video.description && (
                <p className="mt-1.5 text-[12px] font-medium leading-5 text-slate-500">
                  {video.description}
                </p>
              )}
            </div>

            {video.reward_coins > 0 && (
              <div
                className={`shrink-0 rounded-xl px-2.5 py-2 text-center ${
                  isRewarded
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                <Coins size={15} className="mx-auto" />
                <p className="mt-0.5 text-[9px] font-black">
                  {isRewarded ? "Đã nhận" : `+${video.reward_coins} xu`}
                </p>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-slate-100 pb-3 text-[10.5px] font-medium text-slate-400">
            <span className="flex items-center gap-1">
              <Eye size={13} />
              {formatNumber(viewsCount)} lượt xem
            </span>
            <span>{formatNumber(likesCount)} lượt thích</span>
            <span>{formatNumber(commentsCount)} bình luận</span>
          </div>

          {/* ACTIONS */}
          <div className="mt-3 grid grid-cols-4 gap-2">
            <button
              onClick={handleLike}
              className={`flex min-w-0 flex-col items-center gap-1.5 rounded-2xl py-3 transition active:scale-95 ${
                isLiked
                  ? "bg-pink-50 text-pink-500"
                  : "bg-slate-50 text-slate-600"
              }`}
            >
              <Heart
                size={19}
                fill={isLiked ? "currentColor" : "none"}
                strokeWidth={2.2}
              />
              <span className="text-[9px] font-black">
                {formatNumber(likesCount)}
              </span>
            </button>

            <button
              onClick={() => setShowComments((v) => !v)}
              className={`flex min-w-0 flex-col items-center gap-1.5 rounded-2xl py-3 transition active:scale-95 ${
                showComments
                  ? "bg-sky-50 text-sky-600"
                  : "bg-slate-50 text-slate-600"
              }`}
            >
              <MessageCircle size={19} strokeWidth={2.2} />
              <span className="text-[9px] font-black">
                {formatNumber(commentsCount)}
              </span>
            </button>

            <button
              onClick={handleSave}
              className={`flex min-w-0 flex-col items-center gap-1.5 rounded-2xl py-3 transition active:scale-95 ${
                isSaved
                  ? "bg-amber-50 text-amber-600"
                  : "bg-slate-50 text-slate-600"
              }`}
            >
              <Bookmark
                size={19}
                fill={isSaved ? "currentColor" : "none"}
                strokeWidth={2.2}
              />
              <span className="text-[9px] font-black">Lưu</span>
            </button>

            <button
              onClick={handleShare}
              className="flex min-w-0 flex-col items-center gap-1.5 rounded-2xl bg-slate-50 py-3 text-slate-600 transition active:scale-95"
            >
              <Share2 size={19} strokeWidth={2.2} />
              <span className="text-[9px] font-black">Chia sẻ</span>
            </button>
          </div>

          {/* COMMENTS */}
          {showComments && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[13px] font-black">Bình luận</h2>
                <span className="text-[10px] font-medium text-slate-400">
                  {commentsCount} bình luận
                </span>
              </div>

              <div className="max-h-[360px] overflow-y-auto pr-1">
                {loadingComments ? (
                  <div className="flex justify-center py-8">
                    <Loader2 size={20} className="animate-spin text-pink-500" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 py-8 text-center">
                    <MessageCircle
                      size={24}
                      className="mx-auto text-slate-300"
                    />
                    <p className="mt-2 text-[11px] font-medium text-slate-400">
                      Chưa có bình luận nào
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comments.map((c) => (
                      <div key={c.id} className="flex items-start gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-pink-400 to-sky-500">
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

                        <div className="min-w-0 flex-1 rounded-2xl bg-slate-50 px-3 py-2">
                          <div className="flex items-baseline gap-2">
                            <span className="text-[11px] font-black text-slate-800">
                              {c.username || "Ẩn danh"}
                            </span>
                            <span className="text-[9px] font-medium text-slate-400">
                              {timeAgo(c.created_at)}
                            </span>
                          </div>

                          <p className="mt-0.5 text-[11.5px] font-medium leading-5 text-slate-700">
                            {c.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
                    className="h-10 min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-[11.5px] font-medium outline-none transition focus:border-pink-300 focus:bg-white"
                  />

                  <button
                    onClick={handlePostComment}
                    disabled={postingComment || !commentText.trim()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-500 text-white shadow-md disabled:opacity-40"
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
        </section>

        <div className="h-8" />
      </div>
    </div>
  );
}
