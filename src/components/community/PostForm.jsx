import { useState, useRef } from "react";
import { Image as ImageIcon, X, Loader2, Send } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { createPost, checkCanPost } from "../../lib/community";
import useProfile from "../../hooks/useProfile";

export default function PostForm({ onPostCreated }) {
  const { profile } = useProfile();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const CATEGORIES = [
    { id: "general", label: "Chung" },
    { id: "question", label: "Hỏi đáp" },
    { id: "showcase", label: "Khoe thành tích" },
    { id: "tutorial", label: "Hướng dẫn" },
  ];

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Chỉ hỗ trợ file ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ảnh không được vượt quá 5MB");
      return;
    }

    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const text = content.trim();
    if (!text && !imageFile) {
      setError("Vui lòng nhập nội dung hoặc chọn ảnh");
      return;
    }

    if (text.length > 2000) {
      setError("Nội dung quá dài (tối đa 2000 ký tự)");
      return;
    }

    if (!profile?.id) {
      setError("Vui lòng đăng nhập");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      // 1. Check can post
      const check = await checkCanPost(profile.id);
      if (!check.allowed) {
        setError(check.reason);
        setSubmitting(false);
        return;
      }

      // 2. Upload ảnh (nếu có)
      let imageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop() || "jpg";
        const fileName = `${profile.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("community-images")
          .upload(fileName, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          setError("Không thể upload ảnh. Vui lòng thử lại.");
          setSubmitting(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("community-images")
          .getPublicUrl(fileName);

        imageUrl = urlData?.publicUrl || null;
      }

      // 3. Tạo bài
      const newPost = await createPost({
        userId: profile.id,
        content: text,
        imageUrl,
        category,
      });

      // 4. Reset form
      setContent("");
      setCategory("general");
      handleRemoveImage();

      // 5. Callback
      if (onPostCreated) onPostCreated(newPost);
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!profile?.id) {
    return (
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 text-center">
        <p className="text-sm text-slate-600">
          Vui lòng đăng nhập để đăng bài
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <form onSubmit={handleSubmit}>
        {/* Textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Bạn đang nghĩ gì? Chia sẻ với cộng đồng..."
          rows={3}
          maxLength={2000}
          disabled={submitting}
          className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white disabled:opacity-60"
        />

        {/* Image Preview */}
        {imagePreview && (
          <div className="relative mt-3 overflow-hidden rounded-2xl border border-slate-200">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-64 w-full object-contain bg-slate-50"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
            >
              <X size={16} strokeWidth={2.6} />
            </button>
          </div>
        )}

        {/* Category */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              disabled={submitting}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                category === cat.id
                  ? "bg-sky-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePickImage}
              disabled={submitting}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
              title="Chọn ảnh"
            >
              <ImageIcon size={18} strokeWidth={2.2} />
            </button>

            <span className="ml-1 text-[11px] text-slate-400">
              {content.length}/2000
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting || (!content.trim() && !imageFile)}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-500/30 transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Đang đăng...
              </>
            ) : (
              <>
                <Send size={14} strokeWidth={2.4} />
                Đăng bài
              </>
            )}
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />
      </form>
    </div>
  );
              }
