import React, { useState, useRef } from "react";
import { PlayCircle, X, ArrowUpRight } from "lucide-react";

// 👇 DANH SÁCH VIDEO HƯỚNG DẪN
const TUTORIALS = [
  {
    id: "juVecn7DhWM",
    tag: "Hướng dẫn",
    title: "Hướng dẫn làm nhiệm vụ",
    desc: "Đừng bỏ lỡ! Cách kiếm coin nhanh nhất cho người mới nhé",
  },
  {
    id: "-6gX4pcH4dk",
    tag: "Giới thiệu",
    title: "Giới thiệu về NXX315 Studio",
    desc: "Tổng quan về nền tảng, các tính năng và cách kiếm thưởng hiệu quả",
  },
];

// Tự động tạo link thumbnail chất lượng cao từ YouTube ID
const getThumbnail = (id) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

export default function HomeTutorial() {
  const [isVisible, setIsVisible] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef(null);

  if (!isVisible) return null;

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const width = scrollRef.current.offsetWidth;
    setCurrentSlide(Math.round(scrollLeft / width));
  };

  return (
    <div className="w-full px-1 mb-2 fade-in">
      <div className="relative overflow-hidden rounded-[32px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        
        {/* Nút đóng */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition hover:bg-slate-100"
        >
          <X size={16} />
        </button>

        {/* Vùng Slider - Vuốt ngang */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="mt-2 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 hide-scrollbar"
        >
          {TUTORIALS.map((video) => (
            <div 
              key={video.id}
              className="w-full shrink-0 snap-center"
            >
              <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-50 shadow-sm">
                {/* Thanh giả lập browser */}
                <div className="flex items-center gap-1.5 bg-white px-3 py-2.5 border-b border-slate-100">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                
                {/* Vùng chứa video */}
                <div className="relative aspect-video w-full bg-slate-900">
                  {activeVideo === video.id ? (
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <div 
                      className="group relative h-full w-full cursor-pointer"
                      onClick={() => setActiveVideo(video.id)}
                    >
                      <img 
                        src={getThumbnail(video.id)} 
                        alt={video.title}
                        className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                        onError={(e) => { 
                          e.target.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`; 
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-xl transition hover:scale-110">
                          <PlayCircle size={32} className="text-[#3478F6]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Nội dung text */}
              <div className="mt-5">
                <span className="inline-block rounded-full bg-[#EAF2FE] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#3478F6]">
                  {video.tag}
                </span>
              </div>

              <div className="relative mt-2 inline-block">
                <h3 className="font-display text-2xl font-black text-slate-900">
                  {video.title}
                </h3>
                <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                  <path d="M0,5 Q50,0 100,5" fill="none" stroke="#3478F6" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>

              <p className="mt-3 text-[13px] leading-relaxed text-slate-500">
                {video.desc}
              </p>

              <button 
                onClick={() => setActiveVideo(video.id)}
                className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#3478F6] transition hover:underline"
              >
                Xem video hướng dẫn
                <ArrowUpRight size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Dấu chấm điều hướng */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {TUTORIALS.map((_, i) => (
            <span 
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === i ? "w-6 bg-[#3478F6]" : "w-2 bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
