import { supabase } from "./supabaseClient.js";

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function validateAvatarFile(file) {
  if (!file) throw new Error("Vui lòng chọn ảnh.");
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("Ảnh không được vượt quá 2MB.");
  }
  const dims = await getImageDimensions(file);
  if (dims.width < 200 || dims.height < 200) {
    throw new Error("Ảnh phải có kích thước tối thiểu 200×200.");
  }
  return true;
}

function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Không thể đọc ảnh."));
    };
    img.src = url;
  });
}

/**
 * Upload avatar — luôn dùng .jpg cố định
 * Cache-busting để DB lưu URL unique → không bị browser cache
 */
export async function uploadAvatar(userId, file) {
  // 1. Xóa file cũ
  try {
    const { data: existing } = await supabase.storage
      .from("avatars")
      .list(userId);

    if (existing?.length) {
      const filesToRemove = existing.map((f) => `${userId}/${f.name}`);
      await supabase.storage.from("avatars").remove(filesToRemove);
    }
  } catch (err) {
    console.warn("Không xóa được file cũ:", err);
  }

  // 2. Tên file cố định
  const fileName = `${userId}/avatar.jpg`;

  // 3. Upload — ép content-type chuẩn
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: "image/jpeg",   // ⚠️ ÉP cứng jpeg, không dùng file.type
    });

  if (uploadError) {
    throw new Error("Upload thất bại: " + uploadError.message);
  }

  // 4. URL công khai — thêm timestamp để tránh cache
  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);

  // Thêm cache-busting param vào URL lưu DB
  return `${urlData.publicUrl}?v=${Date.now()}`;
      }
