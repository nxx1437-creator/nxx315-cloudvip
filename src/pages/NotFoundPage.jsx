import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

/**
 * NotFoundPage.jsx
 * -----------------------------------------------------------------
 * Trang 404 tương tác: kéo ngón tay (hoặc di chuột trên desktop) và
 * nhân vật + kính lúp sẽ đuổi theo, dạo quanh giữa số "404" khổng lồ.
 * Toàn bộ hình vẽ + logic đều tự viết, không sao chép thiết kế tham khảo.
 * -----------------------------------------------------------------
 */
export default function NotFoundPage() {
  const stageRef = useRef(null);
  const [pos, setPos] = useState({ x: 0.5, y: 0.55 }); // tỉ lệ 0-1 trong khung
  const [facingRight, setFacingRight] = useState(true);
  const lastX = useRef(0.5);

  const handlePointerMove = (clientX, clientY) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    setFacingRight(x >= lastX.current);
    lastX.current = x;
    setPos({ x, y });
  };

  useEffect(() => {
    const onMove = (e) => handlePointerMove(e.clientX, e.clientY);
    const onTouch = (e) => {
      if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const stage = stageRef.current;
    stage?.addEventListener("pointermove", onMove);
    stage?.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      stage?.removeEventListener("pointermove", onMove);
      stage?.removeEventListener("touchmove", onTouch);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FBF3E7] px-6 text-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
        @keyframes legWalk { 0%,100% { transform: rotate(-14deg); } 50% { transform: rotate(14deg); } }
      `}</style>

      <h2 className="text-lg font-bold text-slate-800">Không tìm thấy trang</h2>
      <p className="mt-1.5 max-w-xs text-sm text-slate-400">Không có gì ở địa chỉ này cả.</p>

      <Link
        to="/dashboard"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition hover:brightness-110"
      >
        <Home size={16} /> Về Trang chủ
      </Link>

      {/* Sân khấu tương tác — kéo ngón tay hoặc di chuột trong vùng này */}
      <div
        ref={stageRef}
        className="font-display relative mt-8 h-64 w-full max-w-md touch-none select-none overflow-hidden rounded-3xl"
      >
        <span className="absolute inset-0 flex items-center justify-center text-[7rem] font-extrabold leading-none text-amber-200/70 sm:text-[8.5rem]">
          404
        </span>
        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-normal text-slate-400">
          Chạm và kéo để dạo chơi cùng bạn thỏ 🐾
        </p>

        {/* Nhân vật + kính lúp, vị trí theo con trỏ */}
        <div
          className="absolute transition-[left,top] duration-150 ease-out"
          style={{
            left: `${pos.x * 100}%`,
            top: `${pos.y * 100}%`,
            transform: `translate(-50%, -50%) scaleX(${facingRight ? 1 : -1})`,
          }}
        >
          <svg width="88" height="96" viewBox="0 0 130 150">
            {/* Tai */}
            <path d="M48 46 C36 20 30 4 42 2 C54 0 58 30 58 50 Z" fill="#FFD9E6" />
            <path d="M49 44 C42 26 38 12 44 10 C50 9 53 30 53 46 Z" fill="#FFF0F5" />
            <path d="M82 46 C94 20 100 4 88 2 C76 0 72 30 72 50 Z" fill="#FFD9E6" />
            <path d="M102 50 C114 44 120 54 116 66 C113 75 106 76 103 70" fill="#FFF0F5" />
            {/* Đầu */}
            <circle cx="75" cy="70" r="40" fill="#FFF5F8" />
            <ellipse cx="48" cy="80" rx="9" ry="7" fill="#FFB8CE" />
            <ellipse cx="102" cy="80" rx="9" ry="7" fill="#FFB8CE" />
            <path d="M58 66 Q65 59 72 66" stroke="#8A5A6B" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M80 66 Q87 59 94 66" stroke="#8A5A6B" strokeWidth="3" fill="none" strokeLinecap="round" />
            <ellipse cx="75" cy="78" rx="2.8" ry="2.2" fill="#F98BAE" />
            <path d="M69 84 Q75 89 81 84" stroke="#C97C93" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Thân */}
            <ellipse cx="75" cy="130" rx="22" ry="18" fill="#FFF5F8" />
            {/* Chân bước đi */}
            <ellipse cx="64" cy="146" rx="7" ry="5" fill="#FFD9E6" style={{ transformOrigin: "64px 138px", animation: "legWalk 0.5s ease-in-out infinite" }} />
            <ellipse cx="86" cy="146" rx="7" ry="5" fill="#FFD9E6" style={{ transformOrigin: "86px 138px", animation: "legWalk 0.5s ease-in-out infinite reverse" }} />
          </svg>

          {/* Kính lúp trong tay, đưa ra phía trước hướng nhìn */}
          <svg
            width="46" height="46" viewBox="0 0 52 52"
            className="absolute -right-3 top-9"
          >
            <circle cx="20" cy="20" r="14" fill="#FEF3C7" stroke="#78350F" strokeWidth="3.5" />
            <line x1="30" y1="30" x2="44" y2="44" stroke="#78350F" strokeWidth="4.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
            }
                                                       
