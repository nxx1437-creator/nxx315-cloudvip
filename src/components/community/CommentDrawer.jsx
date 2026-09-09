import { useState, useEffect } from "react";
import { fetchComments, addComment } from "../../lib/community";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

export default function CommentDrawer({ post, currentUserId, onClose, onCommentAdded }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchComments(post.id).then((data) => {
      if (active) {
        setComments(data);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [post.id]);

  const handleSend = async () => {
    if (!text.trim() || !currentUserId || sending) return;
    setSending(true);
    try {
      const newComment = await addComment(post.id, currentUserId, text.trim());
      setComments((prev) => [...prev, { ...newComment, author: { username: "Bạn" } }]);
      setText("");
      onCommentAdded?.(post.id);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center bg-black/50">
      <div className="w-full sm:max-w-md bg-slate-900 border border-white/20 rounded-t-2xl sm:rounded-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="font-semibold text-sm">Bình luận</span>
          <button onClick={onClose} className="text-white/60 text-lg leading-none">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {loading ? (
            <p className="text-center text-white/50 text-sm py-4">Đang tải...</p>
          ) : comments.length === 0 ? (
            <p className="text-center text-white/50 text-sm py-4">Chưa có bình luận nào.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-2">
                <img
                  src={c.author?.avatar_url || "/default-avatar.png"}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                />
                <div className="bg-white/10 rounded-xl px-3 py-2 text-sm flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs">{c.author?.username || "Ẩn danh"}</span>
                    <span className="text-white/40 text-[10px]">{timeAgo(c.created_at)}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-white/10 flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={currentUserId ? "Viết bình luận..." : "Đăng nhập để bình luận"}
            disabled={!currentUserId}
            className="flex-1 bg-transparent border border-white/20 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-400 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!currentUserId || sending || !text.trim()}
            className="bg-cyan-500 disabled:opacity-40 text-white text-sm font-semibold px-3 py-2 rounded-xl"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
            }
