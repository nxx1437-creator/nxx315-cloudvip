import React, { useState } from "react";
import { PlayCircle, X, ExternalLink } from "lucide-react";

// 👇 THAY LINK YOUTUBE CỦA BẠN VÀO ĐÂY
const YOUTUBE_LINK = "https://www.youtube.com/watch?v=YOUR_VIDEO_ID";

// 👇 THAY ĐƯỜNG DẪN ẢNH MINH HOẠ CỦA BẠN VÀO ĐÂY
const IMAGE_URL = "https://your-image-host.com/paywall-demo.jpg"; 

export default function HomeTutorial() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleOpenVideo = () => {
    // Mở link YouTube trong tab mới
    window.open(YOUTUBE_LINK, "_blank");
  };

  return (
    <div className="w-full px-4 mb-2 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
            Tính năng mới
          </span>
        </div>
        {/* Nút đóng (X) giống trong hình */}
        <button 
          onClick={() => setIsVisible(false)}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-slate-200 dark:bg-slate-800"
        >
          <X size={14} />
        </button>
      </div>

      {/* Slider Container (Dùng CSS scroll snap để vuốt mượt trên mobile) */}
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 hide-scrollbar">
        
        {/* Card Hướng dẫn */}
        <div 
          onClick={handleOpenVideo}
          className="group relative w-[85vw] max-w-[340px] shrink-0 snap-center cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          {/* Hình ảnh thu nhỏ (Thumbnail) */}
          <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img 
              src={IMAGE_URL} 
              alt="Video Thumbnail" 
              className="h-full w-full object-cover opacity-90 transition group-hover:scale-105 group-hover:opacity-100" 
              onError={(e) => { e.target.src = "https://placehold.co/600x400/1e293b/ffffff?text=Video+Hướng+Dẫn" }}
            />
            {/* Overlay Play Button */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition group-hover:scale-110 group-hover:bg-white">
                <PlayCircle size={28} className="text-blue-600" />
              </div>
            </div>
          </div>

          {/* Nội dung text */}
          <div className="p-4">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Paywall Link
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
              Bán quyền truy cập nội dung số của bạn. Chỉ cần chia sẻ link, người mua thanh toán, nội dung sẽ tự động mở khóa.
            </p>
            
            {/* Nút CTA nhỏ */}
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
              <span>Xem video hướng dẫn</span>
              <ExternalLink size={12} />
            </div>
          </div>
        </div>

        {/* Bạn có thể thêm Card thứ 2 ở đây nếu muốn */}
        {/* <div className="w-[85vw] max-w-[340px] shrink-0 snap-center ...">...</div> */}

      </div>

      {/* Dấu chấm điều hướng (Dots) - Chỉ mang tính trang trí */}
      <div className="mt-2 flex items-center justify-center gap-1.5">
        <span className="h-1.5 w-4 rounded-full bg-blue-600 transition-all duration-300"></span>
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
      </div>

      {/* Custom CSS để ẩn thanh cuộn ngang */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
          }
