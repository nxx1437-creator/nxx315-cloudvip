import React from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw, X } from "lucide-react";

export default function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Check update mỗi 60 phút
      if (r) {
        setInterval(() => r.update(), 60 * 60 * 1000);
      }
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-50">
          <RefreshCw size={26} className="text-sky-500" />
        </div>

        <h2 className="mt-4 text-center text-lg font-bold text-slate-900">
          Có bản cập nhật mới
        </h2>

        <p className="mt-2 text-center text-sm text-slate-500">
          Ứng dụng vừa được cập nhật. Nhấn "Cập nhật ngay" để tải phiên bản mới nhất.
        </p>

        <button
          onClick={() => updateServiceWorker(true)}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-sky-500/30 transition hover:brightness-110"
        >
          Cập nhật ngay
        </button>

        <button
          onClick={() => setNeedRefresh(false)}
          className="mt-2 w-full rounded-xl py-2.5 text-xs font-semibold text-slate-400 transition hover:text-slate-600"
        >
          Để sau
        </button>
      </div>
    </div>
  );
      }
