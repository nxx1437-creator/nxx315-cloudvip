import React from "react";
import { X } from "lucide-react";

export default function ScanAIIntroModal({ 
  isOpen, 
  onClose, 
  title = "NÂNG CẤP TRẢI NGHIỆM CỬA HÀNG: ĐỒNG BỘ - NHANH CHÓNG - AN TOÀN",
  description = "Nxx315 Studio chính thức ra mắt giao diện Store mới 😎. Tối ưu hóa nạp thẻ, thêm danh sách đề xuất các gói, hỗ trợ rút tiền qua Ngân hàng/MoMo/ZaloPay và theo dõi lịch sử giao dịch minh bạch theo thời gian thực.",
  imageSrc = "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/store-preview.png"
  buttonText = "Trải nghiệm ngay"
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      {/* Lớp nền mờ - Bấm ra ngoài để đóng */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Nội dung Modal */}
      <div className="relative z-10 w-full max-w-md animate-slide-up overflow-hidden rounded-3xl bg-white shadow-2xl sm:animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Hình ảnh minh họa */}
<div className="px-5 mt-2">
  <img 
    src={imageSrc} 
    alt="Store Preview" 
    // Class này giúp ảnh cao tối đa 200px, tự động cắt bớt phần dưới (nếu thừa) mà không bị méo
    className="h-[200px] w-full rounded-2xl object-cover object-top" 
  />
</div>
        {/* Nội dung text */}
        <div className="px-5 pt-6 pb-4 text-center">
          <h3 className="mb-2 text-lg font-bold text-slate-900 flex items-center justify-center gap-2">
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
