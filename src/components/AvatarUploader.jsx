import React, { useRef, useState, useEffect } from "react";
import { Camera, Loader2, X, Check, AlertTriangle } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import { validateAvatarFile, uploadAvatar, checkAvatarUploadLimit } from "../lib/avatarUpload.js";

export default function AvatarUploader({ userId, currentUrl, initial, onUploaded }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [limit, setLimit] = useState({ remaining: 2, limit: 2 });

  useEffect(() => {
    if (currentUrl && !preview) setPreview(currentUrl);
  }, [currentUrl]);

  useEffect(() => {
    if (!userId) return;
    checkAvatarUploadLimit(userId).then((res) => {
      setLimit({ remaining: res.remaining, limit: res.limit });
    });
  }, [userId, success]);

  const handlePick = () => {
    if (limit.remaining <= 0) {
      setError(`Bạn đã dùng hết ${limit.limit} lượt đổi avatar hôm nay. Quay lại vào ngày mai nhé!`);
      return;
    }
    setError("");
    setSuccess(false);
    fileRef.current?.click();
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError("");
    setSuccess(false);

    try {
      await validateAvatarFile(file);

      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      setUploading(true);

      const publicUrl = await uploadAvatar(userId, file);

      const { error: dbError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (dbError) throw dbError;

      setPreview(publicUrl);
      setSuccess(true);
      onUploaded?.(publicUrl);

      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      console.error("Upload avatar error:", err);
      setError(err.message || "Upload thất bại. Vui lòng thử lại.");
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="relative h-24 w-24">
          {preview ? (
            <img
              src={preview}
              alt="Avatar"
              className="h-24 w-24 rounded-full border-4 border-accent-400/30 object-cover shadow-md"
              onError={() => setPreview(null)}
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-accent-400/30 bg-gradient-to-br from-accent-400 to-accent-600 text-4xl font-bold text-white shadow-md">
              {initial}
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
              <Loader2 size={24} className="animate-spin text-white" />
            </div>
          )}

          {success && (
            <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow">
              <Check size={14} className="text-white" />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handlePick}
          disabled={uploading || limit.remaining <= 0}
          className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-accent-500 text-white shadow transition hover:opacity-90 disabled:opacity-50 dark:border-slate-900"
        >
          <Camera size={14} />
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFile}
          className="hidden"
        />
      </div>

      <p className="mt-3 text-center text-[10px] text-slate-400 dark:text-slate-500">
        JPG, PNG, WEBP · tối đa 2MB · tối thiểu 200×200
      </p>

      <p className="mt-1 text-center text-[10px] font-semibold text-slate-500">
        Còn <span className="text-accent-600">{limit.remaining}</span>/{limit.limit} lượt đổi hôm nay
      </p>

      {error && (
        <div className="mt-2 flex w-full max-w-xs items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 dark:border-rose-500/30 dark:bg-rose-500/10">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-rose-500" />
          <p className="flex-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
            {error}
          </p>
          <button
            onClick={() => setError("")}
            className="shrink-0 text-rose-400 hover:text-rose-600"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
        }
