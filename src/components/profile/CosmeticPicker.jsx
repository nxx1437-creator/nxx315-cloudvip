// src/components/profile/CosmeticPicker.jsx — mở trình chỉnh khung/hiệu ứng toàn màn hình ngay từ trang cá nhân
import React from "react";
import CosmeticEditor from "../cosmetics/CosmeticEditor.jsx";

export default function CosmeticPicker({ kind = "frame", onClose, onChanged }) {
  return <CosmeticEditor initialKind={kind} onBack={onClose} onChanged={onChanged} />;
}
