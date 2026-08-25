// src/lib/deviceId.js
//
// Sinh 1 "device_id" bền vững cho mỗi thiết bị — lưu trong localStorage
// nên KHÔNG đổi khi người dùng chuyển mạng (Wi-Fi/4G/5G), chỉ đổi khi họ
// xoá dữ liệu trình duyệt hoặc dùng trình duyệt/máy khác. Đây là tín hiệu
// CHÍNH để phát hiện đa tài khoản; IP chỉ là tín hiệu phụ (xử lý ở server).

const STORAGE_KEY = "nxx315_device_id";

function generateId() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  // Dự phòng cho trình duyệt cũ không hỗ trợ randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getDeviceId() {
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = generateId();
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    // localStorage bị chặn (chế độ ẩn danh nghiêm ngặt...) -> dùng tạm ID phiên
    return generateId();
  }
    }
