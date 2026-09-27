import React, { useState } from "react";
import { PlayCircle, X, ArrowUpRight } from "lucide-react";

const YOUTUBE_LINK = "https://youtu.be/juVecn7DhWM?si=bMTU3LILnDXnFQMo";
const IMAGE_URL = "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/huongdan.png"; 

export default function HomeTutorial() {
  const [isVisible, setIsVisible] = useState(true);

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
          
          {/* 👇 Đã thêm "group" vào đây */}
          <div className="group relative aspect-video w-full bg-slate-900 cursor-pointer" onClick={() => window.open(YOUTUBE_LINK, "_blank")}>
            <img 
              src={IMAGE_URL} 
              alt="Hướng dẫn làm nhiệm vụ" 
              className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105"
              onError={(e) => { e.target.src = "https://placehold.co/600x400/1e293b/ffffff?text=Huong+Dan" }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition hover:bg-black/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition hover:scale-110">
                <PlayCircle size={28} className="text-[#3478F6]" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <span className="inline-block rounded-full bg-[#EAF2FE] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#3478F6]">
            Tính năng mới
          </span>
        </div>

        <div className="relative mt-2 inline-block">
          {/* 👇 Đã viết hoa chữ đầu và xóa dấu cách thừa */}
          <h3 className="font-display text-2xl font-black text-slate-900">
            Hướng dẫn làm nhiệm vụ
          </h3>
          <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
            <path d="M0,5 Q50,0 100,5" fill="none" stroke="#3478F6" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        {/* 👇 Đã xóa dấu cách thừa */}
        <p className="mt-3 text-[13px] leading-relaxed text-slate-500">
          Đừng bỏ lỡ! Cách kiếm coin nhanh nhất cho người mới nhé
        </p>

        <button 
          onClick={() => window.open(YOUTUBE_LINK, "_blank")}
          className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#3478F6] transition hover:underline"
        >
          Xem video hướng dẫn
          <ArrowUpRight size={14} />
        </button>

        {/* 👇 Có thể xóa cụm dots này đi vì chỉ có 1 card */}
        <div className="mt-6 flex items-center justify-center gap-1.5">
          <span className="h-2 w-6 rounded-full bg-[#3478F6] transition-all duration-300"></span>
          <span className="h-2 w-2 rounded-full bg-slate-200"></span>
          <span className="h-2 w-2 rounded-full bg-slate-200"></span>
        </div>

      </div>
    </div>
  );
}
