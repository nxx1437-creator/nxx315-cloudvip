import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

// Các trang KHÔNG bị chặn khi bật bảo trì 'all'
const ALWAYS_OPEN = [
  "", "login", "register", "auth", "forgot-password", "verify-email",
  "banned", "account-review", "onboarding", "dashboard", "task", "admin",
];

function fmt(d) {
  try {
    return new Date(d).toLocaleString("vi-VN", {
      hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit",
    });
  } catch {
    return "";
  }
}

// page_key khớp theo đường dẫn: 'store/roblox' -> /store/roblox (và con của nó)
function findHit(pages, pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";
  const matches = pages
    .filter((p) => p.page_key !== "all")
    .filter((p) => {
      const base = "/" + p.page_key;
      return path === base || path.startsWith(base + "/");
    })
    .sort((a, b) => b.page_key.length - a.page_key.length);
  if (matches[0]) return matches[0];

  const seg = path.split("/")[1] || "";
  if (!ALWAYS_OPEN.includes(seg)) {
    return pages.find((p) => p.page_key === "all") || null;
  }
  return null;
}

export default function MaintenanceGate({ children }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState({
    loaded: false, isAdmin: false, loggedIn: false, pages: [],
  });

  const load = useCallback(async () => {
    try {
      const [{ data, error }, { data: sess }] = await Promise.all([
        supabase.rpc("get_maintenance"),
        supabase.auth.getSession(),
      ]);
      if (error || !data) return;
      setState({
        loaded: true,
        isAdmin: !!data.is_admin,
        loggedIn: !!sess?.session,
        pages: data.pages || [],
      });
    } catch (e) {
      console.warn("[Maintenance] lỗi:", e);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    const onVis = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVis);
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") return;
      setTimeout(load, 0);
    });
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
      sub?.subscription?.unsubscribe();
    };
  }, [load]);

  // kiểm tra lại mỗi lần đổi trang
  useEffect(() => {
    load();
  }, [pathname, load]);

  const hit = findHit(state.pages, pathname);
  const blocked = !!(state.loaded && hit && !state.isAdmin);

  // khóa cuộn trang phía sau khi đang hiện popup
  useEffect(() => {
    if (!blocked) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [blocked]);

  const goHome = () =>
    navigate(state.loggedIn ? "/dashboard" : "/", { replace: true });

  return (
    <>
      {children}

      {blocked && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-5"
          style={{
            background: "rgba(15, 23, 42, 0.28)",
            backdropFilter: "blur(3px)",
            WebkitBackdropFilter: "blur(3px)",
            animation: "mtFade .2s ease-out",
          }}
        >
          <style>{`
            @keyframes mtFade{from{opacity:0}to{opacity:1}}
            @keyframes mtPop{from{opacity:0;transform:translateY(14px) scale(.96)}to{opacity:1;transform:none}}
          `}</style>

          <div
            className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-white/70 bg-white/80 p-6 text-center shadow-2xl"
            style={{
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              animation: "mtPop .28s cubic-bezier(.2,.9,.3,1)",
            }}
          >
            <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-cyan-300/40 blur-3xl" />

            <button
              onClick={goHome}
              aria-label="Đóng"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/5 text-slate-500 active:scale-95"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-400 text-white shadow-lg shadow-sky-300/50">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6z" />
              </svg>
            </div>

            <h2 className="relative text-xl font-bold text-slate-800">
              {hit.title || "Đang bảo trì"}
            </h2>
            <p className="relative mt-2 text-sm leading-relaxed text-slate-600">
              {hit.message ||
                "Trang này đang được nâng cấp. Bạn vui lòng quay lại sau nhé!"}
            </p>
            {hit.ends_at && (
              <p className="relative mt-3 inline-block rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-600">
                Dự kiến xong: {fmt(hit.ends_at)}
              </p>
            )}

            <button
              onClick={goHome}
              className="relative mt-5 w-full rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 py-3 text-sm font-semibold text-white shadow-md shadow-sky-300/40 active:scale-95"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      )}
    </>
  );
              }
