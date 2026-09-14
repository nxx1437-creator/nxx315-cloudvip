import React, { useRef, useState } from "react";
import { Camera, Loader2, X, Check, AlertTriangle } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import { validateAvatarFile, uploadAvatar } from "../lib/avatarUpload.js";

export default function AvatarUploader({ userId, currentUrl, initial, onUploaded }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handlePick = () => {
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

      // Preview trước khi upload
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      setUploading(true);

      const publicUrl = await uploadAvatar(userId, file);

      // Update profile trong DB
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
    <div className="relative">
      <div className="relative h-24 w-24">
        {preview ? (
          <img
            src={preview}
            alt="Avatar"
            className="h-24 w-24 rounded-full border-4 border-accent-400/30 object-cover shadow-md"
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
        disabled={uploading}
        className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-accent-500 text-white shadow transition hover:opacity-90 disabled:opacity-60 dark:border-slate-900"
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

      {error && (
        <div className="absolute left-1/2 top-full z-30 mt-2 flex w-64 -translate-x-1/2 items-start gap-2 rounded-xl border border-rose-200 bg-white p-3 shadow-lg dark:bg-slate-900">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-rose-500" />
          <p className="flex-1 text-xs font-semibold text-rose-600">{error}</p>
          <button onClick={() => setError("")} className="shrink-0 text-slate-400">
            <X size={12} />
          </button>
        </div>
      )}

      <p className="absolute left-1/2 top-full mt-2 w-48 -translate-x-1/2 text-center text-[10px] text-slate-400">
        JPG, PNG, WEBP · tối đa 2MB · tối thiểu 200x200
      </p>
    </div>
  );
}
