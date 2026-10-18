import React, { useState } from "react";
import { X } from "lucide-react";

export default function ScanAIIntroModal({ 
  isOpen, 
  onClose, 
  description, 
  imageSrc = "", 
  buttonText = "Đã hiểu"
}) {
  // State để kiểm tra xem ảnh có bị lỗi không (tự động ẩn nếu link ảnh chết)
  const [imageError, setImageError] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      {/* Lớp nền mờ - Bấm ra ngoài để đóng */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Nội dung Modal */}
      <div className="relative z-10 w-full max-w-md animate-slide-up overflow-hidden rounded-3xl bg-white shadow-2xl sm:animate-fade-in max-h-[90vh] overflow-y-auto">
        
        {/* Nút X đóng (Góc trên phải) */}
        <div className="flex justify-end px-4 pt-3 pb-0">
          <button 
            onClick={onClose}
            className="shrink-0 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={22} />
          </button>
        </div>

        {/* Hình ảnh minh họa - Tự động ẩn nếu ảnh bị lỗi */}
        {imageSrc && !imageError && (
          <div className="px-5 pt-2">
            <img 
              src={imageSrc} 
              alt="Store Preview" 
              onError={() => setImageError(true)} 
              className="w-full rounded-2xl bg-slate-50 object-contain max-h-[320px]" 
            />
          </div>
        )}

        {/* Nội dung text */}
        <div className="px-5 pb-4 pt-6 text-center">
          <h3 className="mb-3 text-xl font-bold text-slate-900">
            Khám phá mọi thứ trong tích tắc
          </h3>
          <p className="text-[15px] leading-relaxed text-slate-600">
            {description}
          </p>
        </div>

        {/* Nút bấm */}
        <div className="p-5 pt-2">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-blue-50 py-3.5 text-base font-bold text-blue-600 transition hover:bg-blue-100 active:scale-[0.98]"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
