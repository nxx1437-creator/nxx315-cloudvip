import { supabase } from "./supabaseClient.js";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_INPUT = 10 * 1024 * 1024;
const OUT_W = 1200;
const OUT_H = 400; // tỉ lệ 3:1

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Không thể đọc ảnh.")); };
    img.src = url;
  });

export async function uploadCover(userId, file) {
  if (!file) throw new Error("Vui lòng chọn ảnh.");
  if (!ALLOWED.includes(file.type)) throw new Error("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.");
  if (file.size > MAX_INPUT) throw new Error("Ảnh không được vượt quá 10MB.");

  const img = await loadImage(file);
  if (img.width < 600 || img.height < 200) throw new Error("Ảnh bìa tối thiểu 600×200.");

  // cắt giữa theo tỉ lệ 3:1 rồi thu nhỏ → file nhẹ, tải nhanh
  const canvas = document.createElement("canvas");
  canvas.width = OUT_W;
  canvas.height = OUT_H;
  const scale = Math.max(OUT_W / img.width, OUT_H / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  canvas.getContext("2d").drawImage(img, (OUT_W - w) / 2, (OUT_H - h) / 2, w, h);
  const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.85));
  if (!blob) throw new Error("Không thể xử lý ảnh.");

  const path = `${userId}/cover.jpg`;
  const { error: upErr } = await supabase.storage
    .from("covers")
    .upload(path, blob, { upsert: true, contentType: "image/jpeg", cacheControl: "3600" });
  if (upErr) throw new Error("Tải ảnh bìa thất bại: " + upErr.message);

  const { data } = supabase.storage.from("covers").getPublicUrl(path);
  const url = `${data.publicUrl}?v=${Date.now()}`;
  const { error: dbErr } = await supabase.from("profiles").update({ cover_url: url }).eq("id", userId);
  if (dbErr) throw new Error(dbErr.message);
  return url;
}
