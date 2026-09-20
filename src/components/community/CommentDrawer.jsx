import { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { fetchComments, addComment } from "../../lib/community";

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
  });
}

function getInitial(name) {
  return (name || "U").charAt(0).toUpperCase();
}

export default function CommentDrawer({
  post,
  currentUserId,
  onClose,
  onCommentAdded,
}) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Load comments
  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchComments(post.id);
        if (alive) setComments(data);
      } catch (err) {
        console.error("Load comments error:", err);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [post.id]);

  // Auto scroll to bottom
  useEffect(() => {
    if (!loading && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [loading, comments.length]);

  // Lock body scroll
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();

    const content = input.trim();
    if (!content || sending) return;

    if (!currentUserId) {
      setError("Vui lòng đăng nhập để bình luận");
      return;
    }

    if (content.length > 500) {
      setError("Bình luận quá dài (tối đa 500 ký tự)");
      return;
    }

    setError("");
    setSending(true);

    try {
      const newComment = await addComment({
        postId: post.id,
        userId: currentUserId,
        content,
      });

      // Tạo comment hiển thị tạm với thông tin user (chưa có author)
      setComments((prev) => [
        ...prev,
        {
          ...newComment,
          author: {
            id: currentUserId,
            username: "Bạn",
            avatar_url: null,
          },
          _optimistic: true,
        },
      ]);

      setInput("");
      onCommentAdded?.(post.id);

      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 50);
    } catch (err) {
      console.error("Submit comment error:", err);
      setError("Không thể gửi bình luận. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-[80vh] flex-col rounded-t-3xl bg-white shadow-2xl animate-[slideUp_0.3s_ease-out]">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-sky-500" strokeWidth={2.4} />
            <h3 className="text-base font-bold text-slate-900">
              Bình luận
              {comments.length > 0 && (
                <span className="ml-1.5 text-sm font-normal text-slate-500">
                  ({comments.length})
                </span>
              )}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100"
          >
            <X size={20} strokeWidth={2.4} />
          </button>
        </div>

        {/* Comments List */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain px-4 py-3"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={22} className="animate-spin text-slate-300" />
              <p className="mt-2 text-xs text-slate-400">
                Đang tải bình luận...
              </p>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle size={36} className="mb-2 text-slate-300" />
              <p className="text-sm font-bold text-slate-600">
                Chưa có bình luận nào
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Hãy là người đầu tiên bình luận!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => {
                const author = c.author || {};
                const isMine = currentUserId && c.author_id === currentUserId;

                return (
                  <div key={c.id} className="flex items-start gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#FE2C55] to-[#25F4EE]">
                      {author.avatar_url ? (
                        <img
                          src={author.avatar_url}
                          alt={author.username}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-xs font-bold text-white">
                          {getInitial(author.username)}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="rounded-2xl bg-slate-100 px-3.5 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[12px] font-bold text-slate-900">
                            {author.username || "Ẩn danh"}
                          </p>
                          {isMine && (
                            <span className="rounded-full bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold text-sky-700">
                              BẠN
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 whitespace-pre-wrap break-words text-[13px] leading-5 text-slate-700">
                          {c.content}
                        </p>
                      </div>
                      <div className="mt-1 px-2">
                        <span className="text-[10px] text-slate-400">
                          {formatTime(c.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-slate-100 bg-white px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
          {error && (
            <p className="mb-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
              {error}
            </p>
          )}

          {!currentUserId ? (
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-center">
              <p className="text-xs font-medium text-slate-500">
                Vui lòng đăng nhập để bình luận
              </p>
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Viết bình luận..."
                rows={1}
                maxLength={500}
                disabled={sending}
                className="min-h-[44px] max-h-32 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white disabled:opacity-60"
                style={{ overflowY: input.length > 60 ? "auto" : "hidden" }}
              />
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || sending}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/30 transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} strokeWidth={2.4} />
                )}
              </button>
            </div>
          )}

          {input.length > 0 && (
            <p className="mt-1.5 text-right text-[10px] text-slate-400">
              {input.length}/500
            </p>
          )}
        </div>
      </div>

      {/* Animation */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
      }
