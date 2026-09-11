import { useState, useEffect, useCallback } from "react";
import CommentDrawer from "../components/community/CommentDrawer";
import {
  fetchPosts,
  getMyReactions,
  toggleLike,
  toggleSave,
  recordShare,
} from "../lib/community";
import useProfile from "../hooks/useProfile";

function PostCard({
  post,
  isLiked,
  isSaved,
  onToggleLike,
  onToggleSave,
  onShare,
  onOpenComments,
}) {
  const author = post.author || {};

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      {/* Author */}
      <div className="flex items-center gap-3 p-4">
        {author.avatar_url ? (
          <img
            src={author.avatar_url}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
            {(author.username || "?").charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-white truncate">
              {author.username || "Người dùng"}
            </span>

            {author.is_official && (
              <span className="text-cyan-400 text-xs">✓</span>
            )}
          </div>

          <p className="text-xs text-white/40">
            {post.created_at
              ? new Date(post.created_at).toLocaleString("vi-VN")
              : ""}
          </p>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-sm text-white whitespace-pre-wrap break-words">
            {post.content}
          </p>
        </div>
      )}

      {/* Image */}
      {post.image_url && (
        <img
          src={post.image_url}
          alt=""
          className="w-full max-h-[500px] object-cover"
          loading="lazy"
        />
      )}

      {/* Stats */}
      <div className="px-4 py-2 flex items-center gap-4 text-xs text-white/40 border-b border-white/5">
        <span>{post.like_count || 0} lượt thích</span>
        <span>{post.comment_count || 0} bình luận</span>
        <span>{post.share_count || 0} lượt chia sẻ</span>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-4">
        <button
          type="button"
          onClick={() => onToggleLike(post.id, isLiked)}
          className={`py-3 text-sm transition ${
            isLiked
              ? "text-cyan-400"
              : "text-white/60 hover:text-white"
          }`}
        >
          {isLiked ? "♥" : "♡"} Thích
        </button>

        <button
          type="button"
          onClick={() => onOpenComments(post)}
          className="py-3 text-sm text-white/60 hover:text-white transition"
        >
          💬 Bình luận
        </button>

        <button
          type="button"
          onClick={() => onShare(post.id)}
          className="py-3 text-sm text-white/60 hover:text-white transition"
        >
          ↗ Chia sẻ
        </button>

        <button
          type="button"
          onClick={() => onToggleSave(post.id, isSaved)}
          className={`py-3 text-sm transition ${
            isSaved
              ? "text-yellow-400"
              : "text-white/60 hover:text-white"
          }`}
        >
          {isSaved ? "★" : "☆"} Lưu
        </button>
      </div>
    </article>
  );
}

export default function Feed() {
  const { profile } = useProfile();

  const [posts, setPosts] = useState([]);
  const [liked, setLiked] = useState(new Set());
  const [saved, setSaved] = useState(new Set());

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [activePost, setActivePost] = useState(null);

  const loadInitial = useCallback(async () => {
    try {
      setLoading(true);

      const data = await fetchPosts();

      setPosts(data || []);
      setHasMore((data || []).length > 0);

      if (profile?.id && data?.length) {
        const { liked: l, saved: s } = await getMyReactions(
          data.map((p) => p.id),
          profile.id
        );

        setLiked(l || new Set());
        setSaved(s || new Set());
      }
    } catch (error) {
      console.error("Feed load error:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const loadMore = async () => {
    if (loadingMore || !posts.length || !hasMore) return;

    try {
      setLoadingMore(true);

      const cursor = posts[posts.length - 1].created_at;
      const more = await fetchPosts(cursor);

      const nextPosts = more || [];

      setPosts((prev) => [...prev, ...nextPosts]);
      setHasMore(nextPosts.length > 0);

      if (profile?.id && nextPosts.length) {
        const { liked: l, saved: s } = await getMyReactions(
          nextPosts.map((p) => p.id),
          profile.id
        );

        setLiked(
          (prev) => new Set([...prev, ...(l || new Set())])
        );

        setSaved(
          (prev) => new Set([...prev, ...(s || new Set())])
        );
      }
    } catch (error) {
      console.error("Load more error:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleToggleLike = async (postId, isLiked) => {
    if (!profile?.id) return;

    setLiked((prev) => {
      const next = new Set(prev);

      if (isLiked) {
        next.delete(postId);
      } else {
        next.add(postId);
      }

      return next;
    });

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              like_count: Math.max(
                0,
                (p.like_count || 0) + (isLiked ? -1 : 1)
              ),
            }
          : p
      )
    );

    try {
      await toggleLike(postId, profile.id, isLiked);
    } catch (error) {
      console.error("Toggle like error:", error);
    }
  };

  const handleToggleSave = async (postId, isSaved) => {
    if (!profile?.id) return;

    setSaved((prev) => {
      const next = new Set(prev);

      if (isSaved) {
        next.delete(postId);
      } else {
        next.add(postId);
      }

      return next;
    });

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              save_count: Math.max(
                0,
                (p.save_count || 0) + (isSaved ? -1 : 1)
              ),
            }
          : p
      )
    );

    try {
      await toggleSave(postId, profile.id, isSaved);
    } catch (error) {
      console.error("Toggle save error:", error);
    }
  };

  const handleShare = async (postId) => {
    const post = posts.find((p) => p.id === postId);

    if (!post) return;

    const url = `${window.location.origin}/community/${postId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Chia sẻ bài đăng",
          text: post?.content?.slice(0, 80) || "Xem bài đăng này",
          url,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                share_count: (p.share_count || 0) + 1,
              }
            : p
        )
      );

      await recordShare(postId, profile?.id);
    } catch (error) {
      // Người dùng bấm "Hủy" share không phải lỗi nghiêm trọng.
      if (error?.name !== "AbortError") {
        console.error("Share error:", error);
      }
    }
  };

  const handleCommentAdded = (postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comment_count: (p.comment_count || 0) + 1,
            }
          : p
      )
    );
  };

  return (
    <div className="max-w-lg mx-auto px-3 py-4">
      {loading ? (
        <p className="text-center text-white/50 text-sm py-8">
          Đang tải bảng tin...
        </p>
      ) : posts.length === 0 ? (
        <p className="text-center text-white/50 text-sm py-8">
          Chưa có bài đăng nào. Là người đầu tiên đi!
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isLiked={liked.has(post.id)}
              isSaved={saved.has(post.id)}
              onToggleLike={handleToggleLike}
              onToggleSave={handleToggleSave}
              onShare={handleShare}
              onOpenComments={setActivePost}
            />
          ))}
        </div>
      )}

      {hasMore && posts.length > 0 && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loadingMore}
          className="w-full mt-4 text-sm text-cyan-400 py-2 disabled:opacity-50"
        >
          {loadingMore ? "Đang tải..." : "Xem thêm"}
        </button>
      )}

      {activePost && (
        <CommentDrawer
          post={activePost}
          currentUserId={profile?.id}
          onClose={() => setActivePost(null)}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </div>
  );
}