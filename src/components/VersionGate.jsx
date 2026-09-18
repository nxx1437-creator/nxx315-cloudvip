import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { APP_VERSION } from '../version.js';

const CHECK_INTERVAL = 60 * 1000; // check lại mỗi 1 phút

export default function VersionGate({ children }) {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkVersion = async () => {
      try {
        const { data, error } = await supabase
          .from('app_config')
          .select('min_required_version')
          .eq('id', 1)
          .single();

        if (error || !data || cancelled) return;

        if (data.min_required_version !== APP_VERSION) {
          setBlocked(true);
        }
      } catch (err) {
        console.error('Version check failed:', err);
      }
    };

    checkVersion();
    const interval = setInterval(checkVersion, CHECK_INTERVAL);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkVersion();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  if (blocked) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-50">
          <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-sky-500">
            <path d="M12 4v6m0 0l3-3m-3 3L9 7M5 15a7 7 0 1014 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="mt-4 text-lg font-bold text-slate-900">Có phiên bản mới!</h1>
        <p className="mt-2 max-w-xs text-sm text-slate-500">
          Vui lòng tải lại trang để cập nhật phiên bản mới nhất trước khi tiếp tục sử dụng.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-sky-500/30"
        >
          Tải lại trang
        </button>
      </div>
    );
  }

  return children;
      }
