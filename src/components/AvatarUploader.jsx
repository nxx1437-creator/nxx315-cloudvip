import React, { useRef, useState, useEffect } from "react";
import { Camera, Loader2, X, Check, AlertTriangle, ZoomIn, ZoomOut } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import { validateAvatarFile, uploadAvatar, checkAvatarUploadLimit } from "../lib/avatarUpload.js";

// Kích thước khung cắt hiển thị (px)
const CROP_SIZE = 280;
// Đường kính vòng tròn hiển thị — chỉ phần trong vòng này được lưu
const CIRCLE_SIZE = 220;
// Kích thước ảnh đầu ra (px) - Ảnh vuông
const OUTPUT_SIZE = 400;
const MAX_ZOOM = 3;

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
  const [minZoom, setMinZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

  // Cử chỉ chạm: kéo 1 ngón, chụm 2 ngón
  const pointers = useRef(new Map());
  const dragRef = useRef(null);
  const pinchRef = useRef(null);

  useEffect(() => {
    if (currentUrl && !preview) setPreview(currentUrl);
  }, [currentUrl]);

  useEffect(() => {
    if (!userId) return;
    checkAvatarUploadLimit(userId).then((res) => {
      setLimit({ remaining: res.remaining, limit: res.limit });
    });
  }, [userId, success]);

  // Tỉ lệ gốc: ảnh phủ kín khung CROP_SIZE (zoom = 1)
  const getBaseScale = (dims = imgDimensions) =>
    Math.max(CROP_SIZE / dims.width, CROP_SIZE / dims.height);

  const clampZoom = (z) => Math.min(MAX_ZOOM, Math.max(minZoom, z));

  // Giới hạn kéo: ảnh to hơn vòng tròn thì luôn phủ kín vòng,
  // ảnh nhỏ hơn vòng tròn thì luôn nằm gọn trong vòng
  const getBounds = (z) => {
    if (!imgDimensions.width) return { maxX: 0, maxY: 0 };
    const s = getBaseScale() * z;
    return {
      maxX: Math.abs(imgDimensions.width * s - CIRCLE_SIZE) / 2,
      maxY: Math.abs(imgDimensions.height * s - CIRCLE_SIZE) / 2,
    };
  };

  const clampOffset = (o, z) => {
    const { maxX, maxY } = getBounds(z);
    return {
      x: Math.min(maxX, Math.max(-maxX, o.x)),
      y: Math.min(maxY, Math.max(-maxY, o.y)),
    };
  };

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
          const dims = { width: img.width, height: img.height };
          // Mức thu nhỏ tối đa: thấy trọn cả ảnh trong vòng tròn
          const base = getBaseScale(dims);
          const contain = CIRCLE_SIZE / Math.max(dims.width, dims.height);
          const mz = Math.max(0.15, Math.min(1, contain / base));
          pointers.current.clear();
          dragRef.current = null;
          pinchRef.current = null;
          setImgDimensions(dims);
          setMinZoom(mz);
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

  // ---- Kéo / chụm ảnh ----
  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      dragRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    } else {
      dragRef.current = null;
      pinchRef.current = null;
    }
  };

  const handlePointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (!pinchRef.current) {
        pinchRef.current = { dist, zoom };
        return;
      }
      const z = clampZoom(pinchRef.current.zoom * (dist / pinchRef.current.dist));
      setZoom(z);
      setOffset((o) => clampOffset(o, z));
      return;
    }

    if (!dragRef.current) return;
    setOffset(
      clampOffset(
        { x: e.clientX - dragRef.current.x, y: e.clientY - dragRef.current.y },
        zoom
      )
    );
  };

  const handlePointerUp = (e) => {
    pointers.current.delete(e.pointerId);
    pinchRef.current = null;
    if (pointers.current.size === 1) {
      const p = [...pointers.current.values()][0];
      dragRef.current = { x: p.x - offset.x, y: p.y - offset.y };
    } else {
      dragRef.current = null;
    }
  };

  const handleWheel = (e) => {
    const z = clampZoom(zoom - e.deltaY * 0.002);
    setZoom(z);
    setOffset((o) => clampOffset(o, z));
  };

  const handleZoomChange = (e) => {
    const z = clampZoom(Number(e.target.value));
    setZoom(z);
    setOffset((o) => clampOffset(o, z));
  };

  const setZoomPreset = (z) => {
    const zz = clampZoom(z);
    setZoom(zz);
    setOffset({ x: 0, y: 0 });
  };

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

      const finalScale = getBaseScale() * zoom;
      const scaledWidth = imgDimensions.width * finalScale;
      const scaledHeight = imgDimensions.height * finalScale;

      // Tọa độ top-left của ảnh bên trong khung crop
      const left = (CROP_SIZE - scaledWidth) / 2 + offset.x;
      const top = (CROP_SIZE - scaledHeight) / 2 + offset.y;

      // Vòng tròn căn giữa trong khung crop
      const circleLeft = (CROP_SIZE - CIRCLE_SIZE) / 2;
      const circleTop = (CROP_SIZE - CIRCLE_SIZE) / 2;
      const k = OUTPUT_SIZE / CIRCLE_SIZE;

      // Nền trắng (khi thu nhỏ ảnh sẽ có chỗ trống quanh ảnh)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(
        img,
        (left - circleLeft) * k,
        (top - circleTop) * k,
        scaledWidth * k,
        scaledHeight * k
      );

      const croppedBlob = await new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92));
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
      {/* --- Avatar + nút đổi ảnh --- */}
      <div className="relative h-32 w-32">
        {preview ? (
          <img
            src={preview}
            alt="Avatar"
            className="h-32 w-32 rounded-full object-cover shadow-lg ring-4 ring-sky-100 dark:ring-slate-800"
            onError={() => setPreview(null)}
          />
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-accent-400 to-accent-600 text-5xl font-bold text-white shadow-lg ring-4 ring-sky-100 dark:ring-slate-800">
            {initial}
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <Loader2 size={28} className="animate-spin text-white" />
          </div>
        )}
        {success && (
          <div className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow">
            <Check size={16} className="text-white" />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handlePick}
        disabled={uploading || limit.remaining <= 0}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
      >
        <Camera size={16} /> Đổi ảnh
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFile}
        className="hidden"
      />

      <p className="mt-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
        Còn <span className="text-accent-600">{limit.remaining}</span>/{limit.limit} lượt đổi hôm nay
      </p>
      <p className="mt-1 text-center text-[11px] text-slate-400 dark:text-slate-500">
        JPG, PNG, WEBP · tối đa 2MB · tối thiểu 200×200
      </p>

      {error && (
        <div className="mt-2 flex w-full max-w-xs items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 dark:border-rose-500/30 dark:bg-rose-500/10">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-rose-500" />
          <p className="flex-1 text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</p>
          <button onClick={() => setError("")} className="shrink-0 text-rose-400 hover:text-rose-600"><X size={12} /></button>
        </div>
      )}

      {/* --- MODAL CẮT ẢNH --- */}
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
                className="relative h-[280px] w-[280px] overflow-hidden rounded-2xl bg-white"
                style={{ touchAction: "none" }}
                onWheel={handleWheel}
              >
                {/* Ảnh kéo thả & zoom */}
                <img
                  src={imageSrc}
                  alt="Crop preview"
                  draggable={false}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="absolute top-1/2 left-1/2 max-w-none cursor-grab select-none active:cursor-grabbing"
                  style={{
                    transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                    width: imgDimensions.width > imgDimensions.height ? "auto" : "100%",
                    height: imgDimensions.height >= imgDimensions.width ? "auto" : "100%",
                    touchAction: "none",
                  }}
                />

                {/* Khung tròn che mờ (Mask) - đúng bằng CIRCLE_SIZE */}
                <div
                  className="pointer-events-none absolute inset-0 m-auto rounded-full border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"
                  style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
                />
              </div>
            </div>

            {/* Thanh trượt Zoom */}
            <div className="px-6 pt-5 pb-2">
              <div className="flex items-center gap-3">
                <ZoomOut size={18} className="text-slate-400" />
                <input
                  type="range"
                  value={zoom}
                  min={minZoom}
                  max={MAX_ZOOM}
                  step={0.01}
                  onChange={handleZoomChange}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600 dark:bg-slate-700"
                />
                <ZoomIn size={18} className="text-slate-400" />
              </div>
              <div className="mt-3 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomPreset(minZoom)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Vừa ảnh
                </button>
                <button
                  type="button"
                  onClick={() => setZoomPreset(1)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Đầy khung
                </button>
              </div>
              <p className="mt-2 text-center text-[11px] text-slate-500">Kéo ảnh để di chuyển • chụm hai ngón hoặc dùng thanh trượt để phóng to / thu nhỏ</p>
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
