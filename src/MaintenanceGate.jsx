import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

// segment đầu của đường dẫn -> page_key trong bảng site_maintenance
const ROUTE_KEYS = {
  store: "store",
  tasks: "tasks",
  wallet: "wallet",
  withdraw: "withdraw",
  feed: "feed",
  guide: "guide",
  "shop-earn": "shop-earn",
  profile: "profile",
};
// 'all' không chặn các trang này
const ALWAYS_OPEN = ["", "login", "task"];

function fmt(d) {
  try {
    return new Date(d).toLocaleString("vi-VN", {
      hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit",
    });
  } catch { return ""; }
}

export default function MaintenanceGate({ children }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState({ loaded: false, isAdmin: false, pages: [] });

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_maintenance");
    if (error || !data) return;
    setState({ loaded: true, isAdmin: !!data.is_admin, pages: data.pages || [] });
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    const onVis = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVis);
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
      sub?.subscription?.unsubscribe();
    };
  }, [load]);

  // kiểm tra lại mỗi lần đổi trang
  useEffect(() => { load(); }, [pathname, load]);

  const seg = pathname.split("/")[1] || "";
  const key = ROUTE_KEYS[seg];
  const hit =
    state.pages.find((p) => key && p.page_key === key) ||
    (!ALWAYS_OPEN.includes(seg) ? state.pages.find((p) => p.page_key === "all") : null);

  const blocked = state.loaded && hit && !state.isAdmin;
  if (!blocked) return children;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-3xl border border-white/60 bg-white/90 p-6 text-center shadow-2xl">
        <button
          onClick={() => navigate("/", { replace: true })}
          aria-label="Đóng"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-400 text-white">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-slate-800">{hit.title || "Đang bảo trì"}</h2>
        <p className="mt-2 text-sm text-slate-600">
          {hit.message || "Trang này đang được nâng cấp. Bạn vui lòng quay lại sau nhé!"}
        </p>
        {hit.ends_at && (
          <p className="mt-3 text-xs font-medium text-sky-600">
            Dự kiến xong: {fmt(hit.ends_at)}
          </p>
        )}

        <button
          onClick={() => navigate("/", { replace: true })}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 py-3 text-sm font-semibold text-white active:scale-95"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
            }
