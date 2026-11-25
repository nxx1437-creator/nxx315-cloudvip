// src/pages/Support/ChatHeader.jsx — đầu trang kiểu Cofounder: nút lịch sử, avatar tròn + tên, nút Zalo / đóng
import React from "react";
import { Headphones, X } from "lucide-react";

const AVATAR = "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/avatar.png";
const AVATAR_FALLBACK = "https://ui-avatars.com/api/?name=NXX&background=2b2b2b&color=fff&bold=true&size=120";

const handleAvatarError = (e) => {
  // Tránh vòng lặp vô hạn nếu fallback cũng lỗi
  e.currentTarget.onerror = null;
  e.currentTarget.src = AVATAR_FALLBACK;
};

function ChatHeader({ hidden, onHistory, onBack, zaloUrl }) {
  return (
    <div
      className={`absolute inset-x-0 top-0 z-20 transition-transform duration-300 ease-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="nxx-hdr mx-auto w-full max-w-2xl px-4 pt-[max(12px,env(safe-area-inset-top))]">
        <div className="relative h-[116px]">
          <button
            type="button"
            onClick={onHistory}
            aria-label="Lịch sử trò chuyện"
            className="nxx-sqbtn absolute left-0 top-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 9h14M5 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <div className="absolute left-1/2 top-0 flex -translate-x-1/2 flex-col items-center">
            <div className="nxx-hdr-avatar">
              <img src={AVATAR} alt="NXX" onError={handleAvatarError} />
            </div>
            {/* Đặt dưới avatar, không đè lên avatar nữa */}
            <div className="nxx-namepill !mt-2.5 whitespace-nowrap">NXX Support</div>
          </div>

          <div className="absolute right-0 top-2 flex gap-2">
            {zaloUrl && (
              <a
                href={zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Gặp nhân viên qua Zalo"
                className="nxx-sqbtn text-[#0068FF]"
              >
                <Headphones size={19} strokeWidth={2} />
              </a>
            )}
            <button type="button" onClick={onBack} aria-label="Đóng cuộc trò chuyện" className="nxx-sqbtn">
              <X size={19} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ChatHeader);
