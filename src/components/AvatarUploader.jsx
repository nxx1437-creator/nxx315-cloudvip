import React, { useRef, useState, useEffect } from "react";
import { Camera, Loader2, X, Check, AlertTriangle, ZoomIn, ZoomOut } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import { validateAvatarFile, uploadAvatar, checkAvatarUploadLimit } from "../lib/avatarUpload.js";

// Kích thước khung cắt (pixel)
const CROP_SIZE = 300; 
// Kích thước ảnh đầu ra
const OUTPUT_SIZE = 400;

export default function AvatarUploader({ userId, currentUrl, initial, onUploaded }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [limit, setLimit] = useState({ remaining: 2, limit: 2 });

  // State cho phần cắt ảnh
  const [imageSrc, setImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

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

  // Bước 1: Chọn file -> Validate -> Đọc ảnh -> Mở modal
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError("");
    setSuccess(false);

    try {
      await validateAvatarFile(file);

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const img = new Image();
        img.onload = () => {
          setImgDimensions({ width: img.width, height: img.height });
          setImageSrc(reader.result);
          setZoom(1);
          setOffset({ x: 0, y: 0 });
        };
        img.src = reader.result;
      });
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Validation error:", err);
      setError(err.message || "File không hợp lệ.");
    }
  };

  // Xử lý kéo thả ảnh
  const handlePointerDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Bước 2: Cắt ảnh bằng Canvas và Upload
  const handleSaveCroppedImage = async () => {
    if (!imageSrc || !imgDimensions.width) return;

    try {
      setUploading(true);
      setError("");

      // Tính toán tỷ lệ để vẽ lên canvas
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d");

      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve) => (img.onload = resolve));

      // Tính toán vị trí cắt dựa trên offset và zoom
      const scale = zoom;
      const scaledWidth = imgDimensions.width * scale;
      const scaledHeight = imgDimensions.height * scale;

      // Tọa độ top-left của ảnh trong khung crop (300x300)
      const left = (CROP_SIZE - scaledWidth) / 2 + offset.x;
      const top = (CROP_SIZE - scaledHeight) / 2 + offset.y;

      // Tọa độ trên ảnh gốc cần cắt
      const sourceX = -left / scale;
      const sourceY = -top / scale;
      const sourceWidth = CROP_SIZE / scale;
      const sourceHeight = CROP_SIZE / scale;

      // Vẽ ảnh đã cắt lên canvas
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE
      );

      // Chuyển canvas thành Blob
      const croppedBlob = await new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
      });

      if (!croppedBlob) throw new Error("Không thể xử lý ảnh.");

      // Tạo File từ Blob để upload
      const croppedFile = new File(
        [croppedBlob],
        `avatar_${userId}_${Date.now()}.jpg`,
        { type: "image/jpeg" }
      );

      // Upload lên Supabase
      const publicUrl = await uploadAvatar(userId, croppedFile);

      // Cập nhật database
      const { error: dbError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (dbError) throw dbError;

      // Cập nhật giao diện
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

      {/* --- MODAL CẮT ẢNH (KHÔNG CẦN THƯ VIỆN) --- */}
      {imageSrc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-900">
            
            <div className="border-b border-slate-100 p-4 dark:border-slate-800">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Cắt ảnh đại diện
              </h3>
            </div>

            {/* Vùng Crop ảnh (Dùng CSS transform thay vì thư viện) */}
            <div 
              className="relative flex h-[300px] w-full items-center justify-center overflow-hidden bg-slate-900"
              style={{ touchAction: "none" }} // Quan trọng để kéo thả trên mobile không bị cuộn trang
            >
              {/* Khung tròn mask */}
              <div className="absolute inset-0 z-10 m-auto h-[300px] w-[300px] rounded-full border-2 border-white/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] pointer-events-none" />
              
              {/* Ảnh có thể kéo thả và zoom */}
              <img
                src={imageSrc}
                alt="Crop preview"
                draggable={false}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                className="absolute max-w-none cursor-grab active:cursor-grabbing"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  transformOrigin: "center",
                  // Tính toán kích thước ban đầu để vừa vặn với khung
                  width: imgDimensions.width > imgDimensions.height ? "auto" : "100%",
                  height: imgDimensions.height >= imgDimensions.width ? "auto" : "100%",
                }}
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
