import { supabase } from "./supabaseClient.js";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * Kiểm tra file hợp lệ (loại, kích thước, độ phân giải tối thiểu)
 */
export async function validateAvatarFile(file) {
  if (!file) {
    throw new Error("Vui lòng chọn ảnh.");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.");
  }

  if (file.size > MAX_SIZE) {
    throw new Error("Ảnh không được vượt quá 2MB.");
  }

  // Check độ phân giải tối thiểu (>= 200x200)
  const dims = await getImageDimensions(file);
  if (dims.width < 200 || dims.height < 200) {
    throw new Error("Ảnh phải có kích thước tối thiểu 200x200.");
  }

  return true;
}

/**
 * Lấy width/height của ảnh
 */
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
 * Upload avatar lên Supabase Storage
 * @returns URL công khai của ảnh
 */
export async function uploadAvatar(userId, file) {
  const ext = file.name.split(".").pop().toLowerCase();
  const fileName = `${userId}/avatar.${ext}`; 

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
  return data.publicUrl;
}
