import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Flag,
  Copy,
  Check,
  Clock,
} from "lucide-react";

function formatTime(date) {
  if (!date) return "";
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút`;
  if (mins < 1440) return `${Math.floor(mins / 60)} giờ`;
  if (mins < 10080) return `${Math.floor(mins / 1440)} ngày`;

  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getInitial(username) {
  return (username || "U").charAt(0).toUpperCase();
}

export default function PostCard({
  post,
  isLiked,
  currentUserId,
  onToggleLike,
  onOpenComments,
  onToast,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const author = post.author || {};
  const isMine = currentUserId && post.author_id === currentUserId;
  const status = String(post.status || "").toLowerCase();

  const handleLike = () => {
    if (!currentUserId) {
      onToast?.("Vui lòng đăng nhập để thích bài viết", "error");
      return;
    }
    onToggleLike?.(post.id, isLiked);
  };

  const handleComment = () => {
    if (!currentUserId) {
      onToast?.("Vui lòng đăng nhập để bình luận", "error");
      return;
    }
    onOpenComments?.(post);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/community/${post.id}`;
    const shareText = post.content?.slice(0, 100) || "Bài viết hay trên NXX315";

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Bài viết từ NXX315 Studio",
          text: shareText,
          url,
        });
        onToast?.("Đã chia sẻ!", "success");
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        onToast?.("Đã copy link!", "success");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.warn("Share error:", err);
      }
    }
  };

  const handleReport = () => {
    setShowMenu(false);
    const reason = prompt(
      "Lý do báo cáo bài viết này?\n\n- Spam\n- Nội dung không phù hợp\n- Lừa đảo\n- Khác"
    );
    if (reason && reason.trim()) {
      onToast?.("Đã gửi báo cáo. Cảm ơn bạn!", "success");
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <Link
          to={`/profile/${post.author_id}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#FE2C55] to-[#25F4EE]"
        >
          {author.avatar_url ? (
            <img
              src={author.avatar_url}
              alt={author.username}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="text-sm font-bold text-white">
              {getInitial(author.username)}
            </span>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link
              to={`/profile/${post.author_id}`}
              className="truncate text-sm font-bold text-slate-900 hover:underline"
            >
              {author.username || "Ẩn danh"}
            </Link>
            {isMine && (
              <span className="rounded-full bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold text-sky-700">
                BẠN
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Clock size={10} strokeWidth={2.4} />
            <span>{formatTime(post.created_at)}</span>
            {status === "pending" && (
              <>
                <span>·</span>
                <span className="font-semibold text-amber-600">
                  Đang chờ duyệt
                </span>
              </>
            )}
          </div>
        </div>

        {/* Menu button */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100"
          >
            <MoreHorizontal size={18} strokeWidth={2.4} />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                <button
                  onClick={handleShare}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] text-slate-700 transition hover:bg-slate-50"
                >
                  <Copy size={14} strokeWidth={2.4} />
                  Sao chép liên kết
                </button>
                {!isMine && (
                  <button
                    onClick={handleReport}
                    className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-left text-[13px] text-rose-600 transition hover:bg-rose-50"
                  >
                    <Flag size={14} strokeWidth={2.4} />
                    Báo cáo
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="whitespace-pre-wrap break-words text-[14px] leading-6 text-slate-800">
            {post.content}
          </p>
        </div>
      )}

      {/* Image */}
      {post.image_url && (
        <div className="bg-slate-50">
          <img
            src={post.image_url}
            alt="Post"
            loading="lazy"
            className="max-h-[500px] w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Stats */}
      {(post.likes_count > 0 || post.comments_count > 0) && (
        <div className="flex items-center justify-between px-4 pt-2.5 text-[12px] text-slate-500">
          {post.likes_count > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500">
                <Heart size={9} className="fill-white text-white" />
              </div>
              <span>{post.likes_count}</span>
            </div>
          )}
          {post.comments_count > 0 && (
            <span>{post.comments_count} bình luận</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center border-t border-slate-100">
        <button
          onClick={handleLike}
          className={`flex flex-1 items-center justify-center gap-2 py-3 text-[13px] font-bold transition ${
            isLiked
              ? "text-rose-500"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Heart
            size={18}
            strokeWidth={2.4}
            className={isLiked ? "fill-rose-500" : ""}
          />
          Thích
        </button>

        <button
          onClick={handleComment}
          className="flex flex-1 items-center justify-center gap-2 py-3 text-[13px] font-bold text-slate-600 transition hover:bg-slate-50"
        >
          <MessageCircle size={18} strokeWidth={2.4} />
          Bình luận
        </button>

        <button
          onClick={handleShare}
          className="flex flex-1 items-center justify-center gap-2 py-3 text-[13px] font-bold text-slate-600 transition hover:bg-slate-50"
        >
          {copied ? (
            <>
              <Check size={18} strokeWidth={2.6} className="text-emerald-500" />
              Đã copy
            </>
          ) : (
            <>
              <Share2 size={18} strokeWidth={2.4} />
              Chia sẻ
            </>
          )}
        </button>
      </div>
    </div>
  );
}
