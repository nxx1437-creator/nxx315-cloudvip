import React from "react";
import { X } from "lucide-react";

export default function ScanAIIntroModal({ 
  isOpen, 
  onClose, 
  title = "Giới thiệu Store", 
  description = "Nxx315 Studio chính thức ra mắt giao diện Store mới. Tối ưu hóa nạp thẻ, thêm danh sách đề xuất các gói, hỗ trợ rút tiền qua Ngân hàng/MoMo/ZaloPay và theo dõi lịch sử giao dịch minh bạch theo thời gian thực.",
  imageSrc = "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/store-preview.png", 
  buttonText = "Đã hiểu"
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      {/* Lớp nền mờ - Bấm ra ngoài để đóng */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Nội dung Modal */}
      <div className="relative z-10 w-full max-w-md animate-slide-up overflow-hidden rounded-3xl bg-white shadow-2xl sm:animate-fade-in max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-2">
          <h2 className="pr-6 text-xl font-bold leading-snug text-slate-900">
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="shrink-0 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Hình ảnh minh họa - SỬA THEO CÁCH 2 */}
        <div className="mt-2 px-5">
          {imageSrc ? (
            <img 
              src={imageSrc} 
              alt="Store Preview" 
              // Dùng h-auto để tự giãn theo tỉ lệ ảnh gốc, max-h để không bị quá dài
              className="w-full rounded-2xl bg-slate-50 object-contain max-h-[320px]" 
            />
          ) : (
            <div className="flex h-48 w-full items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-400">
              Chưa có ảnh minh họa
            </div>
          )}
        </div>

        {/* Nội dung text */}
        <div className="px-5 pb-4 pt-6 text-center">
          <h3 className="mb-2 flex items-center justify-center gap-2 text-lg font-bold text-slate-900">
            <span>😎</span> Khám phá mọi thứ trong tích tắc
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
