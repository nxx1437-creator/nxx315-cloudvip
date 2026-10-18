import React, { useState } from "react";
import { X } from "lucide-react";

export default function ScanAIIntroModal({ 
  isOpen, 
  onClose, 
  title, // Đã bỏ mặc định để có thể ẩn đi
  description = "Nxx315 Studio chính thức ra mắt giao diện Store mới. Tối ưu hóa nạp thẻ, thêm danh sách đề xuất các gói, hỗ trợ rút tiền qua Ngân hàng/MoMo/ZaloPay và theo dõi lịch sử giao dịch minh bạch theo thời gian thực.",
  imageSrc = "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/store-preview.png", 
  buttonText = "Đã hiểu"
}) {
  // State để kiểm tra xem ảnh có bị lỗi không
  const [imageError, setImageError] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      {/* Lớp nền mờ - Bấm ra ngoài để đóng */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Nội dung Modal */}
      <div className="relative z-10 w-full max-w-md animate-slide-up overflow-hidden rounded-3xl bg-white shadow-2xl sm:animate-fade-in max-h-[90vh] overflow-y-auto">
        
        {/* Header: Chỉ hiển thị nút X nếu không có title */}
        <div className="flex items-start justify-between px-5 pt-4 pb-2">
          {title ? (
            <h2 className="pr-6 text-xl font-bold leading-snug text-slate-900 mt-1">
              {title}
            </h2>
          ) : (
            <div></div> // Khoảng trống để đẩy nút X sang phải
          )}
          <button 
            onClick={onClose}
            className="shrink-0 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Hình ảnh minh họa - Tự động ẩn nếu ảnh bị lỗi */}
        {imageSrc && !imageError && (
          <div className="mt-2 px-5">
            <img 
              src={imageSrc} 
              alt="Store Preview" 
              onError={() => setImageError(true)} // Bắt lỗi nếu link ảnh chết
              className="w-full rounded-2xl bg-slate-50 object-contain max-h-[320px]" 
            />
          </div>
        )}

        {/* Nội dung text (Đã bỏ icon 😎) */}
        <div className="px-5 pb-4 pt-6 text-center">
          <h3 className="mb-3 text-lg font-bold text-slate-900">
            Khám phá mọi thứ trong tích tắc
          </h3>
          <p className="text-sm leading-relaxed text-slate-600">
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
