import { useState, useEffect, useCallback } from "react";
import PostForm from "../components/community/PostForm";
import CommentDrawer from "../components/community/CommentDrawer";
import { fetchPosts, getMyReactions, toggleLike, toggleSave, recordShare } from "../lib/community";
import useProfile from "../hooks/useProfile";

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
    setLoading(true);
    const data = await fetchPosts();
    setPosts(data);
    setHasMore(data.length > 0);

    if (profile?.id && data.length) {
      const { liked: l, saved: s } = await getMyReactions(data.map((p) => p.id), profile.id);
      setLiked(l);
      setSaved(s);
    }
    setLoading(false);
  }, [profile?.id]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const loadMore = async () => {
    if (loadingMore || !posts.length) return;
    setLoadingMore(true);
    const cursor = posts[posts.length - 1].created_at;
    const more = await fetchPosts(cursor);
    setPosts((prev) => [...prev, ...more]);
    setHasMore(more.length > 0);

    if (profile?.id && more.length) {
      const { liked: l, saved: s } = await getMyReactions(more.map((p) => p.id), profile.id);
      setLiked((prev) => new Set([...prev, ...l]));
      setSaved((prev) => new Set([...prev, ...s]));
    }
    setLoadingMore(false);
  };

  const handleToggleLike = async (postId, isLiked) => {
    if (!profile?.id) return;
    setLiked((prev) => {
      const next = new Set(prev);
      isLiked ? next.delete(postId) : next.add(postId);
      return next;
    });
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, like_count: p.like_count + (isLiked ? -1 : 1) } : p))
    );
    await toggleLike(postId, profile.id, isLiked);
  };

  const handleToggleSave = async (postId, isSaved) => {
    if (!profile?.id) return;
    setSaved((prev) => {
      const next = new Set(prev);
      isSaved ? next.delete(postId) : next.add(postId);
      return next;
    });
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, save_count: p.save_count + (isSaved ? -1 : 1) } : p))
    );
    await toggleSave(postId, profile.id, isSaved);
  };

  const handleShare = async (postId) => {
    const post = posts.find((p) => p.id === postId);
    const url = `${window.location.origin}/community/${postId}`;

    if (navigator.share) {
      await navigator.share({ title: "Chia sẻ bài đăng", text: post?.content?.slice(0, 80), url });
    } else {
      await navigator.clipboard.writeText(url);
    }

    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, share_count: p.share_count + 1 } : p)));
    await recordShare(postId, profile?.id);
  };

  const handlePostCreated = (post) => {
    setPosts((prev) => [{ ...post, author: { username: profile.username, avatar_url: profile.avatar_url, is_official: profile.is_official } }, ...prev]);
  };

  const handleCommentAdded = (postId) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p)));
  };

  return (
    <div className="max-w-lg mx-auto px-3 py-4">
      <PostForm onPostCreated={handlePostCreated} />

      {loading ? (
        <p className="text-center text-white/50 text-sm py-8">Đang tải bảng tin...</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-white/50 text-sm py-8">Chưa có bài đăng nào. Là người đầu tiên đi!</p>
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
          onClick={loadMore}
          disabled={loadingMore}
          className="w-full mt-4 text-sm text-cyan-400 py-2"
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