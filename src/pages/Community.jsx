import { useState, useEffect, useCallback } from "react";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import PostForm from "../components/community/PostForm";
import PostCard from "../components/community/PostCard";
import CommentDrawer from "../components/community/CommentDrawer";
import { fetchPosts, getMyReactions, toggleLike } from "../lib/community";
import useSession from "../hooks/useSession";
import useProfile from "../hooks/useProfile";
import { Loader2, Users } from "lucide-react";

export default function Community() {
  const { session } = useSession();
  const user = session?.user;
  const { profile } = useProfile(user?.id);

  const [posts, setPosts] = useState([]);
  const [liked, setLiked] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activePost, setActivePost] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.clearTimeout(window.__communityToast);
    window.__communityToast = window.setTimeout(() => setToast(null), 3000);
  };

  const loadInitial = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPosts();
      setPosts(data);
      setHasMore(data.length >= 10);

      if (user?.id && data.length) {
        const { liked: l } = await getMyReactions(
          data.map((p) => p.id),
          user.id
        );
        setLiked(l);
      }
    } catch (err) {
      console.error("loadInitial error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const loadMore = async () => {
    if (loadingMore || !posts.length) return;
    setLoadingMore(true);
    try {
      const cursor = posts[posts.length - 1].created_at;
      const more = await fetchPosts(cursor);
      setPosts((prev) => [...prev, ...more]);
      setHasMore(more.length >= 10);

      if (user?.id && more.length) {
        const { liked: l } = await getMyReactions(
          more.map((p) => p.id),
          user.id
        );
        setLiked((prev) => new Set([...prev, ...l]));
      }
    } catch (err) {
      console.error("loadMore error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleToggleLike = async (postId, isLiked) => {
    if (!user?.id) {
      showToast("Vui lòng đăng nhập để thích bài viết", "error");
      return;
    }

    // Optimistic UI
    setLiked((prev) => {
      const next = new Set(prev);
      if (isLiked) next.delete(postId);
      else next.add(postId);
      return next;
    });

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              likes_count: Math.max(
                (p.likes_count || 0) + (isLiked ? -1 : 1),
                0
              ),
            }
          : p
      )
    );

    const success = await toggleLike(postId, user.id, isLiked);
    if (!success) {
      // Rollback
      setLiked((prev) => {
        const next = new Set(prev);
        if (isLiked) next.add(postId);
        else next.delete(postId);
        return next;
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likes_count: Math.max(
                  (p.likes_count || 0) + (isLiked ? 1 : -1),
                  0
                ),
              }
            : p
        )
      );
    }
  };

  const handlePostCreated = (post) => {
    setPosts((prev) => [
      {
        ...post,
        likes_count: 0,
        comments_count: 0,
        author: {
          id: user.id,
          username: profile?.username || user.email?.split("@")[0] || "Bạn",
          avatar_url: profile?.avatar_url || null,
        },
      },
      ...prev,
    ]);
    showToast("Đã đăng bài!", "success");
  };

  const handleCommentAdded = (postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, comments_count: (p.comments_count || 0) + 1 }
          : p
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-24">
      {toast && (
        <div
          className={`fixed left-1/2 top-4 z-50 w-[calc(100%-32px)] max-w-md -translate-x-1/2 rounded-2xl border px-4 py-3 shadow-lg ${
            toast.type === "error"
              ? "border-rose-200 bg-white text-rose-700"
              : "border-emerald-200 bg-white text-emerald-700"
          }`}
        >
          <p className="text-sm font-semibold">{toast.message}</p>
        </div>
      )}

      <TopHeader />

      <main className="mx-auto max-w-lg px-3 py-4">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#FE2C55] to-[#25F4EE]">
            <Users size={20} className="text-white" strokeWidth={2.4} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Cộng đồng</h1>
            <p className="text-xs text-slate-500">Chia sẻ, học hỏi, kết nối</p>
          </div>
        </div>

        {user?.id && <PostForm onPostCreated={handlePostCreated} />}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-slate-300" />
            <p className="mt-3 text-sm text-slate-400">Đang tải bảng tin...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
            <Users size={36} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-bold text-slate-600">
              Chưa có bài đăng nào
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Hãy là người đầu tiên chia sẻ!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isLiked={liked.has(post.id)}
                currentUserId={user?.id}
                onToggleLike={handleToggleLike}
                onOpenComments={setActivePost}
                onToast={showToast}
              />
            ))}

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-3 text-sm font-bold text-sky-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Đang tải...
                  </>
                ) : (
                  "Xem thêm"
                )}
              </button>
            )}
          </div>
        )}
      </main>

      <BottomNav />

      {activePost && (
        <CommentDrawer
          post={activePost}
          currentUserId={user?.id}
          onClose={() => setActivePost(null)}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </div>
  );
          }
