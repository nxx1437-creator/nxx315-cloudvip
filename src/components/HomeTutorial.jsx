import React, { useState } from "react";
import { PlayCircle, X, ArrowUpRight } from "lucide-react";

// LINK VIDEO YOUTUBE 
const YOUTUBE_LINK = "https://youtu.be/juVecn7DhWM?si=bMTU3LILnDXnFQMo";

// TỰ ĐỘNG TÁCH VIDEO ID TỪ LINK (để nhúng iframe)
const YOUTUBE_ID = "juVecn7DhWM";

// ẢNH THUMBNAIL
const IMAGE_URL = "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/huongdan.png"; 

export default function HomeTutorial() {
  const [isVisible, setIsVisible] = useState(true);
  const [showVideo, setShowVideo] = useState(false); // 👈 State bật/tắt video

  if (!isVisible) return null;

  return (
    <div className="w-full px-1 mb-2 fade-in">
      <div className="relative overflow-hidden rounded-[32px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition hover:bg-slate-100"
        >
          <X size={16} />
        </button>

        <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-50 shadow-sm">
          <div className="flex items-center gap-1.5 bg-white px-3 py-2.5 border-b border-slate-100">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          
          {/* 👇 VÙNG CHỨA ẢNH HOẶC VIDEO */}
          <div className="group relative aspect-video w-full bg-slate-900">
            
            {!showVideo ? (
              // ==== TRẠNG THÁI 1: Hiển thị ảnh thumbnail ====
              <div 
                className="relative h-full w-full cursor-pointer"
                onClick={() => setShowVideo(true)}
              >
                {/* 👇 ĐÃ BỎ HOÀN TOÀN opacity và lớp phủ đen */}
                <img 
                  src={IMAGE_URL} 
                  alt="Hướng dẫn làm nhiệm vụ" 
                  className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                  onError={(e) => { e.target.src = "https://placehold.co/600x400/1e293b/ffffff?text=Huong+Dan" }}
                />
                
                {/* Nút Play ở giữa - Không có lớp phủ đen nữa */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-xl transition hover:scale-110">
                    <PlayCircle size={32} className="text-[#3478F6]" />
                  </div>
                </div>
              </div>
            ) : (
              // ==== TRẠNG THÁI 2: Phát video trực tiếp ====
              <div className="h-full w-full bg-black">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0&modestbranding=1`}
                  title="Hướng dẫn làm nhiệm vụ"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-5">
          <span className="inline-block rounded-full bg-[#EAF2FE] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#3478F6]">
            Tính năng mới
          </span>
        </div>

        <div className="relative mt-2 inline-block">
          <h3 className="font-display text-2xl font-black text-slate-900">
            Hướng dẫn làm nhiệm vụ
          </h3>
          <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
            <path d="M0,5 Q50,0 100,5" fill="none" stroke="#3478F6" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        <p className="mt-3 text-[13px] leading-relaxed text-slate-500">
          Đừng bỏ lỡ! Cách kiếm coin nhanh nhất cho người mới nhé
        </p>

        {/* 👇 Nút này cũng phát video trực tiếp luôn */}
        <button 
          onClick={() => setShowVideo(true)}
          className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#3478F6] transition hover:underline"
        >
          Xem video hướng dẫn
          <ArrowUpRight size={14} />
        </button>

        <div className="mt-6 flex items-center justify-center gap-1.5">
          <span className="h-2 w-6 rounded-full bg-[#3478F6] transition-all duration-300"></span>
          <span className="h-2 w-2 rounded-full bg-slate-200"></span>
          <span className="h-2 w-2 rounded-full bg-slate-200"></span>
        </div>

      </div>
    </div>
  );
}
