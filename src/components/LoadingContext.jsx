import React, { createContext, useContext, useRef, useState } from "react";
import LoadingScreen from "../components/LoadingScreen.jsx";

const LoadingContext = createContext(null);

/**
 * LoadingProvider — bọc quanh toàn bộ App. Bất kỳ hook nào gọi
 * beginLoad()/endLoad() (qua useGlobalLoading) đều làm hiện/ẩn
 * LoadingScreen dạng overlay che kín màn hình.
 *
 * Dùng đếm số lượt đang tải cùng lúc (counter) để nếu 2-3 hook cùng
 * tải song song, màn hình chờ chỉ tắt khi TẤT CẢ đã xong.
 */
export function LoadingProvider({ children }) {
  const [activeCount, setActiveCount] = useState(0);
  const countRef = useRef(0);

  const beginLoad = () => {
    countRef.current += 1;
    setActiveCount(countRef.current);
  };

  const endLoad = () => {
    countRef.current = Math.max(0, countRef.current - 1);
    setActiveCount(countRef.current);
  };

  return (
    <LoadingContext.Provider value={{ beginLoad, endLoad }}>
      {children}
      {activeCount > 0 && (
        <div className="fixed inset-0 z-[999]">
          <LoadingScreen />
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useGlobalLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    // Chưa được bọc bởi <LoadingProvider> — trả no-op để không crash app
    return { beginLoad: () => {}, endLoad: () => {} };
  }
  return ctx;
}
