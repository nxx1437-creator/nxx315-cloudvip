// src/pages/Support/ImageLightbox.jsx
// Xem ảnh hướng dẫn toàn màn hình ngay trong trang (thay vì mở tab mới).

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ExternalLink } from "lucide-react";

export default function ImageLightbox({ src, alt = "", title = "", onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="nxx-fade fixed inset-0 z-[130] flex flex-col bg-[#0e1520]/95 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Xem ảnh"}
      onClick={onClose}
    >
      <div className="flex items-center gap-2 px-4 pb-3 pt-[max(16px,env(safe-area-inset-top))]">
        <p className="min-w-0 flex-1 truncate text-[17px] font-medium text-white">
          {title}
        </p>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          aria-label="Mở ảnh gốc"
          className="nxx-iconbtn h-10 w-10 text-white/80 hover:bg-white/10"
        >
          <ExternalLink size={19} />
        </a>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="nxx-iconbtn h-10 w-10 text-white/80 hover:bg-white/10"
        >
          <X size={22} />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 pb-[max(24px,env(safe-area-inset-bottom))]">
        <img
          src={src}
          alt={alt}
          onClick={(e) => e.stopPropagation()}
          className="nxx-lb-in max-h-full max-w-full rounded-2xl object-contain"
        />
      </div>
    </div>,
    document.body
  );
}
