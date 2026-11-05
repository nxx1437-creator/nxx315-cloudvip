// src/components/profile/AvatarModal.jsx — bọc AvatarUploader trong popup (khung tải ảnh to nên không nhét vào thẻ hồ sơ)
import React from "react";
import { X } from "lucide-react";
import AvatarUploader from "../AvatarUploader.jsx";

export default function AvatarModal({ userId, currentUrl, initial, onUploaded, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Ảnh đại diện</h3>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-4 flex justify-center">
          <AvatarUploader
            userId={userId}
            currentUrl={currentUrl}
            initial={initial}
            onUploaded={(url) => {
              onUploaded(url);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
