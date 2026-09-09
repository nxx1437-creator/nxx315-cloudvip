import { useState } from "react";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

export default function PostCard({
  post,
  isLiked,
  isSaved,
  onToggleLike,
  onToggleSave,
  onShare,
  onOpenComments,
}) {
  const [likeBusy, setLikeBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const author = post.author || {};

  const handleLike = async () => {
    if (likeBusy) return;
    setLikeBusy(true);
    await onToggleLike(post.id, isLiked);
    setLikeBusy(false);
  };

  const handleSave = async () => {
    if (saveBusy) return;
    setSaveBusy(true);
    await onToggleSave(post.id, isSaved);
    setSaveBusy(false);
  };
  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <img
          src={author.avatar_url || "/default-avatar.png"}
          alt=""
          className="w-9 h-9 rounded-full object-cover border border-sky-300/40"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-sm truncate">{author.username || "Ẩn danh"}</span>
            {author.is_official && (
              <span className="text-cyan-400 text-xs">✔</span>
            )}
          </div>
          <span className="text-xs text-white/50">{timeAgo(post.created_at)}</span>
        </div>
      </div>

      <p className="text-sm whitespace-pre-wrap mb-3">{post.content}</p>

      {post.image_url && (
        <img src={post.image_url} alt="" className="w-full rounded-xl mb-3 object-cover max-h-80" />
      )}

      {post.link_url && (
        <a
          href={post.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-xs text-cyan-400 underline break-all mb-3"
        >
          🔗 {post.link_url}
        </a>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-sm">
        <button onClick={handleLike} className={`flex items-center gap-1 ${isLiked ? "text-rose-400" : "text-white/70"}`}>
          {isLiked ? "❤️" : "🤍"} {post.like_count}
        </button>
        <button onClick={() => onOpenComments(post)} className="flex items-center gap-1 text-white/70">
          💬 {post.comment_count}
        </button>
        <button onClick={() => onShare(post.id)} className="flex items-center gap-1 text-white/70">
          🔗 {post.share_count}
        </button>
        <button onClick={handleSave} className={`flex items-center gap-1 ${isSaved ? "text-amber-400" : "text-white/70"}`}>
          {isSaved ? "🔖" : "📑"} {post.save_count}
        </button>
      </div>
    </div>
  );
      }
