import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

/* Chiều cao thanh trên / thanh dưới của web (px).
   Vùng này không bị chặn bấm, thẻ nằm phía trên thanh dưới. */
const NAV_TOP = 60;
const NAV_BOTTOM = 76;

// Các trang KHÔNG bị chặn khi bật bảo trì 'all'
const ALWAYS_OPEN = [
  "", "login", "register", "auth", "forgot-password", "verify-email",
  "banned", "account-review", "onboarding", "dashboard", "task", "admin",
];

function fmt(d) {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  return dt.toLocaleString("vi-VN", {
    hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit",
  });
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
      if (error || !data) {
        // fail-open: không chặn nếu RPC lỗi, nhưng đánh dấu loaded để không kẹt loading
        setState((s) => ({ ...s, loaded: true }));
        return;
      }
      setState({
        loaded: true,
        isAdmin: !!data.is_admin,
        loggedIn: !!sess?.session,
        pages: data.pages || [],
      });
    } catch (e) {
      console.warn("[Maintenance] lỗi:", e);
      setState((s) => ({ ...s, loaded: true }));
    }
  }, []);

  // Poll định kỳ + theo dõi visibility + auth
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

  // Kiểm tra lại mỗi lần đổi trang (bỏ qua lần mount đầu để tránh double-call)
  const firstPathRun = useRef(true);
  useEffect(() => {
    if (firstPathRun.current) {
      firstPathRun.current = false;
      return;
    }
    load();
  }, [pathname, load]);

  const hit = useMemo(
    () => findHit(state.pages, pathname),
    [state.pages, pathname]
  );
  const blocked = !!(state.loaded && hit && !state.isAdmin);

  // Khóa cuộn trang phía sau
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
      <div aria-hidden={blocked || undefined} inert={blocked ? "" : undefined}>
        {children}
      </div>

      {blocked && (
        <>
          <style>{`
            @keyframes mtFade{from{opacity:0}to{opacity:1}}
            @keyframes mtUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
          `}</style>

          {/* Lớp chặn bấm vào trang (mờ nhẹ), chừa thanh trên và thanh dưới */}
          <div
            className="fixed left-0 right-0 z-[9998]"
            style={{
              top: NAV_TOP,
              bottom: NAV_BOTTOM,
              background: "rgba(15, 23, 42, 0.12)",
              animation: "mtFade .2s ease-out",
            }}
          />

          {/* Thẻ nhỏ ở góc dưới bên phải */}
          <div
            className="fixed z-[9999]"
            style={{
              right: 12,
              width: "min(300px, calc(100vw - 24px))",
              bottom: `calc(${NAV_BOTTOM}px + 10px + env(safe-area-inset-bottom, 0px))`,
              animation: "mtUp .28s cubic-bezier(.2,.9,.3,1)",
            }}
          >
            <div className="relative rounded-2xl bg-[#0f1115] p-3.5 shadow-2xl ring-1 ring-white/10">
              <button
                onClick={goHome}
                aria-label="Đóng"
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/80 active:scale-95"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>

              <div className="flex items-start gap-3 pr-7">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-cyan-400 text-white">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h2 className="text-[15px] font-bold leading-tight text-white">
                    {hit.title || "Đang bảo trì"}
                  </h2>
                  <p className="mt-1 text-[13px] leading-snug text-slate-400">
                    {hit.message ||
                      "Trang này đang được nâng cấp. Bạn quay lại sau nhé!"}
                  </p>
                  {hit.ends_at && (
                    <p className="mt-1.5 text-[11px] font-medium text-sky-300">
                      Dự kiến xong: {fmt(hit.ends_at)}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={goHome}
                className="mt-3 w-full rounded-xl bg-white py-2 text-[13px] font-semibold text-[#0f1115] active:scale-95"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
       }
