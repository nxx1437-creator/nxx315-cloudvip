import { supabase } from "./supabaseClient.js";

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const DAILY_LIMIT = 2;  // 2 lần/ngày

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
 * Kiểm tra user còn lượt upload avatar hôm nay không
 * @returns { allowed: boolean, used: number, remaining: number }
 */
export async function checkAvatarUploadLimit(userId) {
  const today = new Date().toISOString().slice(0, 10);

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_uploads_today, avatar_upload_date")
    .eq("id", userId)
    .single();

  let used = profile?.avatar_uploads_today || 0;

  // Nếu ngày khác → reset về 0
  if (profile?.avatar_upload_date !== today) {
    used = 0;
    await supabase
      .from("profiles")
      .update({ avatar_uploads_today: 0, avatar_upload_date: today })
      .eq("id", userId);
  }

  return {
    allowed: used < DAILY_LIMIT,
    used,
    remaining: Math.max(0, DAILY_LIMIT - used),
    limit: DAILY_LIMIT,
  };
}

/**
 * Upload avatar — có giới hạn 2 lần/ngày
 */
export async function uploadAvatar(userId, file) {
  // 1. Check limit
  const limit = await checkAvatarUploadLimit(userId);
  if (!limit.allowed) {
    throw new Error(
      `Bạn đã dùng hết ${DAILY_LIMIT} lượt đổi avatar hôm nay. Quay lại vào ngày mai nhé!`
    );
  }

  // 2. Xóa file cũ
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

  // 3. Upload file mới
  const fileName = `${userId}/avatar.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: "image/jpeg",
    });

  if (uploadError) {
    throw new Error("Upload thất bại: " + uploadError.message);
  }

  // 4. Tăng counter
  await supabase
    .from("profiles")
    .update({
      avatar_uploads_today: limit.used + 1,
      avatar_upload_date: new Date().toISOString().slice(0, 10),
    })
    .eq("id", userId);

  // 5. URL public
  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);

  return `${urlData.publicUrl}?v=${Date.now()}`;
}
