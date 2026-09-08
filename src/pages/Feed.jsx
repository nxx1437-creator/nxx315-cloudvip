import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Heart, MessageCircle, Send, Image as ImageIcon,
  BadgeCheck, Loader2, X, PlayCircle, Sparkles,
} from "lucide-react";

import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

const TABS = [
  { key: "community", label: "Cộng đồng" },
  { key: "ugc_guide", label: "Khám phá UGC" },
];

export default function Feed() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile } = useProfile();

  const [tab, setTab] = useState("community");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [videoLinks, setVideoLinks] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [likedIds, setLikedIds] = useState(new Set());
  const [expandedComments, setExpandedComments] = useState(null);

  const userId = session?.user?.id;
  const canPost = profile?.can_post || profile?.is_admin;

  const fetchPosts = async () => {
    setLoading(true);

    const { data: postsData } = await supabase
      .from("posts")
      .select("*")
      .eq("category", tab)
      .eq("status", "visible")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!postsData || postsData.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const authorIds = [...new Set(postsData.map((p) => p.author_id))];

    const { data: authorsData } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, is_official, is_admin")
      .in("id", authorIds);

    const authorMap = Object.fromEntries((authorsData || []).map((a) => [a.id, a]));

    let liked = new Set();
    if (userId) {
      const { data: likesData } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", userId)
        .in("post_id", postsData.map((p) => p.id));
      liked = new Set((likesData || []).map((l) => l.post_id));
    }

    setLikedIds(liked);
    setPosts(postsData.map((p) => ({ ...p, author: authorMap[p.author_id] })));
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [tab, userId]);

  const handleCreatePost = async () => {
    if (!content.trim()) {
      setPostError("Vui lòng nhập nội dung.");
      return;
    }

    setPosting(true);
    setPostError("");

    const links = videoLinks
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    try {
      const { data, error } = await supabase.functions.invoke("moderate-post", {
        headers: { Authorization: `Bearer ${token}` },
        body: {
          content: content.trim(),
          category: tab,
          video_links: links.length > 0 ? links : null,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Đăng bài thất bại.");

      setContent("");
      setVideoLinks("");

      if (data.status === "visible") {
        fetchPosts();
      } else {
        setPostError("Bài đăng của bạn không phù hợp với chủ đề cộng đồng nên đã bị ẩn.");
      }
    } catch (err) {
      setPostError(err.message || "Có lỗi xảy ra.");
    } finally {
      setPosting(false);
    }
  };

  const handleToggleLike = async (postId) => {
    if (!userId) return;

    const isLiked = likedIds.has(postId);
    const newLiked = new Set(likedIds);

    if (isLiked) {
      newLiked.delete(postId);
      setLikedIds(newLiked);
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, likes_count: p.likes_count - 1 } : p)));
      await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", userId);
    } else {
      newLiked.add(postId);
      setLikedIds(newLiked);
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p)));
      await supabase.from("post_likes").insert({ post_id: postId, user_id: userId });
    }
  };
  return (
    <div className="min-h-screen bg-[#F5F7FB] pb-24 text-[#111827]">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[#E5E7EB] bg-white/95 px-4 py-3.5 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#6B7280] hover:bg-[#F5F7FB]">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-[15px] font-bold text-[#111827]">Cộng đồng</h1>
      </header>

      <div className="sticky top-[57px] z-10 flex gap-2 border-b border-[#E5E7EB] bg-white px-4 py-2.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              tab === t.key ? "bg-sky-500 text-white" : "bg-[#F5F7FB] text-[#6B7280]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main className="mx-auto max-w-md space-y-3 px-4 py-4">
        {canPost && (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder={tab === "ugc_guide" ? "Mô tả cách lấy UGC..." : "Bạn đang nghĩ gì?"}
              className="w-full resize-none rounded-xl border border-[#E5E7EB] bg-[#F5F7FB] px-3.5 py-3 text-sm outline-none focus:border-sky-400"
            />

            {tab === "ugc_guide" && (
              <textarea
                value={videoLinks}
                onChange={(e) => setVideoLinks(e.target.value)}
                rows={2}
                placeholder="Dán link video (mỗi dòng 1 link)"
                className="mt-2 w-full resize-none rounded-xl border border-[#E5E7EB] bg-[#F5F7FB] px-3.5 py-3 text-xs outline-none focus:border-sky-400"
              />
            )}

            {postError && <p className="mt-2 text-xs font-semibold text-rose-500">{postError}</p>}

            <div className="mt-3 flex items-center justify-between">
              <p className="flex items-center gap-1 text-[11px] text-[#9CA3AF]">
                <Sparkles size={11} /> +20 Xu sau khi được duyệt
              </p>
              <button
                onClick={handleCreatePost}
                disabled={posting}
                className="flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
              >
                {posting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                Đăng bài
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={20} className="animate-spin text-[#D1D5DB]" />
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-5 py-12 text-center">
            <p className="text-sm font-bold text-[#374151]">Chưa có bài đăng nào</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              liked={likedIds.has(post.id)}
              onToggleLike={() => handleToggleLike(post.id)}
              expanded={expandedComments === post.id}
              onToggleComments={() => setExpandedComments(expandedComments === post.id ? null : post.id)}
              userId={userId}
              onCommentAdded={() =>
                setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, comments_count: p.comments_count + 1 } : p)))
              }
            />
          ))
        )}
      </main>

      <BottomNav />
    </div>
  );
        }
function PostCard({ post, liked, onToggleLike, expanded, onToggleComments, userId, onCommentAdded }) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  const author = post.author;
  const displayName = author?.username || "Người dùng";
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    if (!expanded) return;

    const fetchComments = async () => {
      setLoadingComments(true);

      const { data: commentsData } = await supabase
        .from("post_comments")
        .select("*")
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });

      const authorIds = [...new Set((commentsData || []).map((c) => c.author_id))];

      const { data: authorsData } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, is_official")
        .in("id", authorIds.length > 0 ? authorIds : [""]);

      const authorMap = Object.fromEntries((authorsData || []).map((a) => [a.id, a]));

      setComments((commentsData || []).map((c) => ({ ...c, author: authorMap[c.author_id] })));
      setLoadingComments(false);
    };

    fetchComments();
  }, [expanded, post.id]);

  const handleSendComment = async () => {
    if (!commentText.trim() || sendingComment) return;

    setSendingComment(true);

    const { data, error } = await supabase
      .from("post_comments")
      .insert({ post_id: post.id, author_id: userId, content: commentText.trim() })
      .select()
      .single();

    setSendingComment(false);

    if (!error && data) {
      setComments((prev) => [...prev, { ...data, author: { username: "Bạn" } }]);
      setCommentText("");
      onCommentAdded();
    }
  };

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-center gap-2.5">
        {author?.avatar_url ? (
          <img src={author.avatar_url} alt={displayName} className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
            {initial}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="truncate text-sm font-bold text-[#111827]">{displayName}</p>
            {author?.is_official && <BadgeCheck size={14} className="shrink-0 fill-sky-500 text-white" />}
          </div>
          <p className="text-[10px] text-[#9CA3AF]">{new Date(post.created_at).toLocaleString("vi-VN")}</p>
        </div>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#374151]">{post.content}</p>

      {post.video_links && post.video_links.length > 0 && (
        <div className="mt-3 space-y-2">
          {post.video_links.map((link, i) => (
            <a
              key={i}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-[#F5F7FB] px-3 py-2.5 text-xs font-semibold text-sky-600"
            >
              <PlayCircle size={15} className="shrink-0" />
              <span className="truncate">{link}</span>
            </a>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-4 border-t border-[#F3F4F6] pt-3">
        <button onClick={onToggleLike} className="flex items-center gap-1.5 text-xs font-semibold text-[#6B7280]">
          <Heart size={16} className={liked ? "fill-rose-500 text-rose-500" : ""} />
          {post.likes_count}
        </button>
        <button onClick={onToggleComments} className="flex items-center gap-1.5 text-xs font-semibold text-[#6B7280]">
          <MessageCircle size={16} />
          {post.comments_count}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3 border-t border-[#F3F4F6] pt-3">
          {loadingComments ? (
            <Loader2 size={15} className="mx-auto animate-spin text-[#D1D5DB]" />
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F5F7FB] text-[9px] font-bold text-[#6B7280]">
                  {(c.author?.username || "?").charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1 rounded-xl bg-[#F5F7FB] px-3 py-2">
                  <div className="flex items-center gap-1">
                    <p className="text-[11px] font-bold text-[#111827]">{c.author?.username || "Người dùng"}</p>
                    {c.author?.is_official && <BadgeCheck size={11} className="fill-sky-500 text-white" />}
                  </div>
                  <p className="text-xs text-[#374151]">{c.content}</p>
                </div>
              </div>
            ))
          )}

          {userId && (
            <div className="flex items-center gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
                placeholder="Viết bình luận..."
                className="flex-1 rounded-full border border-[#E5E7EB] bg-[#F5F7FB] px-3.5 py-2 text-xs outline-none focus:border-sky-400"
              />
              <button
                onClick={handleSendComment}
                disabled={sendingComment}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white disabled:opacity-50"
              >
                <Send size={13} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
      }
