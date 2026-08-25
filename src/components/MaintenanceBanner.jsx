import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function MaintenanceBanner({ onClose }) {
  const [visible, setVisible] = React.useState(true);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-rose-600 to-orange-500 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <AlertTriangle size={20} className="animate-pulse" />
          <div>
            <span className="font-bold">⚠️ Đang bảo trì</span>
            <span className="ml-2 text-sm opacity-90">
              Hệ thống đang được nâng cấp. Một số chức năng có thể không hoạt động.
            </span>
          </div>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="shrink-0 rounded-full p-1 hover:bg-white/20 transition"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
