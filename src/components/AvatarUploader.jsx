import React, { useRef, useState, useEffect } from "react";
import { Camera, Loader2, X, Check, AlertTriangle, ZoomIn, ZoomOut } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import { validateAvatarFile, uploadAvatar, checkAvatarUploadLimit } from "../lib/avatarUpload.js";

// Kích thước khung cắt hiển thị (px)
const CROP_SIZE = 280; 
// Kích thước ảnh đầu ra (px) - Ảnh vuông
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

  // Kéo thả ảnh
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

  const handlePointerUp = () => setIsDragging(false);

  // Cắt ảnh & Upload
  const handleSaveCroppedImage = async () => {
    if (!imageSrc || !imgDimensions.width) return;

    try {
      setUploading(true);
      setError("");

      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d");

      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve) => (img.onload = resolve));

      // Tính toán tỷ lệ dựa trên kích thước hiển thị của ảnh gốc
      // Ảnh gốc được scale để vừa với khung CROP_SIZE, sau đó nhân với zoom
      const baseScale = Math.max(CROP_SIZE / imgDimensions.width, CROP_SIZE / imgDimensions.height);
      const finalScale = baseScale * zoom;

      const scaledWidth = imgDimensions.width * finalScale;
      const scaledHeight = imgDimensions.height * finalScale;

      // Tọa độ top-left của ảnh bên trong khung crop
      const left = (CROP_SIZE - scaledWidth) / 2 + offset.x;
      const top = (CROP_SIZE - scaledHeight) / 2 + offset.y;

      // Tọa độ trên ảnh gốc cần cắt
      const sourceX = -left / finalScale;
      const sourceY = -top / finalScale;
      const sourceWidth = CROP_SIZE / finalScale;
      const sourceHeight = CROP_SIZE / finalScale;

      ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

      const croppedBlob = await new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9));
      if (!croppedBlob) throw new Error("Không thể xử lý ảnh.");

      const croppedFile = new File([croppedBlob], `avatar_${userId}_${Date.now()}.jpg`, { type: "image/jpeg" });
      const publicUrl = await uploadAvatar(userId, croppedFile);

      const { error: dbError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);
      if (dbError) throw dbError;

      setPreview(publicUrl);
      setSuccess(true);
      setImageSrc(null);
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
      {/* --- Nút chọn Avatar --- */}
      <div className="relative">
        <div className="relative h-24 w-24">
          {preview ? (
            <img src={preview} alt="Avatar" className="h-24 w-24 rounded-full border-4 border-accent-400/30 object-cover shadow-md" onError={() => setPreview(null)} />
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
        <button type="button" onClick={handlePick} disabled={uploading || limit.remaining <= 0} className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-accent-500 text-white shadow transition hover:opacity-90 disabled:opacity-50 dark:border-slate-900">
          <Camera size={14} />
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleFile} className="hidden" />
      </div>

      <p className="mt-3 text-center text-[10px] text-slate-400 dark:text-slate-500">JPG, PNG, WEBP · tối đa 2MB · tối thiểu 200×200</p>
      <p className="mt-1 text-center text-[10px] font-semibold text-slate-500">Còn <span className="text-accent-600">{limit.remaining}</span>/{limit.limit} lượt đổi hôm nay</p>

      {error && (
        <div className="mt-2 flex w-full max-w-xs items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 dark:border-rose-500/30 dark:bg-rose-500/10">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-rose-500" />
          <p className="flex-1 text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</p>
          <button onClick={() => setError("")} className="shrink-0 text-rose-400 hover:text-rose-600"><X size={12} /></button>
        </div>
      )}

      {/* --- MODAL CẮT ẢNH XỊN --- */}
      {imageSrc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[340px] overflow-hidden rounded-[24px] bg-white shadow-2xl dark:bg-slate-900">
            
            {/* Header */}
            <div className="px-5 pt-5 pb-3">
              <h3 className="font-display text-center text-lg font-bold text-slate-900 dark:text-white">Cắt ảnh đại diện</h3>
            </div>

            {/* Vùng Crop ảnh */}
            <div className="relative flex justify-center px-4">
              <div 
                className="relative h-[280px] w-[280px] overflow-hidden rounded-2xl bg-slate-900"
                style={{ touchAction: "none" }}
              >
                {/* Ảnh kéo thả & zoom */}
                <img
                  src={imageSrc}
                  alt="Crop preview"
                  draggable={false}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  className="absolute top-1/2 left-1/2 max-w-none cursor-grab active:cursor-grabbing"
                  style={{
                    transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                    width: imgDimensions.width > imgDimensions.height ? "auto" : "100%",
                    height: imgDimensions.height >= imgDimensions.width ? "auto" : "100%",
                  }}
                />
                
                {/* Khung tròn che mờ (Mask) - Đã fix lỗi tràn viền */}
                <div className="pointer-events-none absolute inset-0 m-auto h-[220px] w-[220px] rounded-full border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]" />
              </div>
            </div>

            {/* Thanh trượt Zoom */}
            <div className="px-6 pt-5 pb-2">
              <div className="flex items-center gap-3">
                <ZoomOut size={18} className="text-slate-400" />
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600 dark:bg-slate-700"
                />
                <ZoomIn size={18} className="text-slate-400" />
              </div>
              <p className="mt-2 text-center text-[11px] text-slate-500">Kéo ảnh để di chuyển • dùng thanh trượt để phóng to</p>
            </div>

            {/* Nút Hủy / Lưu */}
            <div className="flex gap-3 p-5 pt-3">
              <button
                onClick={() => setImageSrc(null)}
                disabled={uploading}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveCroppedImage}
                disabled={uploading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />} Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
                 }
