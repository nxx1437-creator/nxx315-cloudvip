import React, { useRef, useState, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Camera, Loader2, X, Check, AlertTriangle, ZoomIn, ZoomOut } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import { validateAvatarFile, uploadAvatar, checkAvatarUploadLimit } from "../lib/avatarUpload.js";

// --- Hàm tiện ích để xử lý cắt ảnh ---
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // Cần thiết cho ảnh từ domain khác
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  // Kích thước ảnh đại diện đầu ra (400x400px)
  const MAX_SIZE = 400;
  canvas.width = MAX_SIZE;
  canvas.height = MAX_SIZE;

  // Vẽ phần ảnh đã cắt vào canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    MAX_SIZE,
    MAX_SIZE
  );

  // Trả về dạng Blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg", 0.9);
  });
}
// --------------------------------------

export default function AvatarUploader({ userId, currentUrl, initial, onUploaded }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [limit, setLimit] = useState({ remaining: 2, limit: 2 });

  // State cho phần cắt ảnh
  const [imageSrc, setImageSrc] = useState(null); // Ảnh gốc dạng base64 để cắt
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

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

  // Bước 1: Chọn file -> Validate -> Mở modal cắt ảnh
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError("");
    setSuccess(false);

    try {
      await validateAvatarFile(file);

      // Đọc file thành chuỗi base64 để hiển thị lên Cropper
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
      });
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Validation error:", err);
      setError(err.message || "File không hợp lệ.");
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Bước 2: Người dùng bấm "Lưu" trên modal -> Cắt ảnh -> Upload
  const handleSaveCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setUploading(true);
      setError("");

      // 1. Cắt ảnh từ canvas
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Không thể xử lý ảnh.");

      // 2. Chuyển Blob thành File để uploadAvatar có thể xử lý
      const croppedFile = new File(
        [croppedBlob],
        `avatar_${userId}_${Date.now()}.jpg`,
        { type: "image/jpeg" }
      );

      // 3. Upload lên Supabase (dùng hàm uploadAvatar hiện tại của bạn)
      const publicUrl = await uploadAvatar(userId, croppedFile);

      // 4. Cập nhật database
      const { error: dbError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (dbError) throw dbError;

      // 5. Cập nhật giao diện
      setPreview(publicUrl);
      setSuccess(true);
      setImageSrc(null); // Đóng modal
      onUploaded?.(publicUrl);

      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      console.error("Upload avatar error:", err);
      setError(err.message || "Upload thất bại. Vui lòng thử lại.");
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

      {/* --- MODAL CẮT ẢNH --- */}
      {imageSrc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-900">
            
            {/* Header */}
            <div className="border-b border-slate-100 p-4 dark:border-slate-800">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Cắt ảnh đại diện
              </h3>
            </div>

            {/* Vùng Crop ảnh */}
            <div className="relative h-80 w-full bg-slate-900">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            {/* Thanh trượt Zoom */}
            <div className="p-4">
              <div className="flex items-center gap-3">
                <ZoomOut size={18} className="text-slate-400" />
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-accent-600 dark:bg-slate-700"
                />
                <ZoomIn size={18} className="text-slate-400" />
              </div>
              <p className="mt-2 text-center text-[11px] text-slate-500">
                Kéo ảnh để di chuyển • dùng thanh trượt để phóng to
              </p>
            </div>

            {/* Nút Hủy / Lưu */}
            <div className="flex gap-3 border-t border-slate-100 p-4 dark:border-slate-800">
              <button
                onClick={() => setImageSrc(null)}
                disabled={uploading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveCroppedImage}
                disabled={uploading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent-600 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Check size={18} />
                )}
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
