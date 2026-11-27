// src/components/profile/CosmeticPicker.jsx — mở trình chỉnh khung/hiệu ứng toàn màn hình ngay từ trang cá nhân
import React from "react";
import CosmeticEditor from "../cosmetics/CosmeticEditor.jsx";

export default function CosmeticPicker({ kind = "frame", onClose, onChanged }) {
  // overlay: phủ kín trang cá nhân bên dưới nên chỉ còn 1 thanh đầu trang
  return <CosmeticEditor overlay initialKind={kind} onBack={onClose} onChanged={onChanged} />;
}
