import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

/* Chỉnh 2 số này cho khớp chiều cao thanh trên / thanh dưới của web (px).
   Vùng này KHÔNG bị chặn bấm, thẻ bảo trì cũng nằm phía trên thanh dưới. */
const NAV_TOP = 60;
const NAV_BOTTOM = 76;

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

  // khóa cuộn trang phía sau khi đang hiện thẻ
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
        <>
          <style>{`
            @keyframes mtFade{from{opacity:0}to{opacity:1}}
            @keyframes mtUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
          `}</style>

          {/* Lớp chặn bấm vào trang, chừa thanh trên và thanh dưới */}
          <div
            className="fixed left-0 right-0 z-[9998]"
            style={{
              top: NAV_TOP,
              bottom: NAV_BOTTOM,
              background: "rgba(15, 23, 42, 0.22)",
              animation: "mtFade .2s ease-out",
            }}
          />

          {/* Thẻ bảo trì ở góc dưới */}
          <div
            className="fixed left-4 right-4 z-[9999] sm:left-auto sm:right-6 sm:w-[380px]"
            style={{
              bottom: `calc(${NAV_BOTTOM}px + 12px + env(safe-area-inset-bottom, 0px))`,
              animation: "mtUp .32s cubic-bezier(.2,.9,.3,1)",
            }}
          >
            <div className="relative overflow-hidden rounded-[28px] bg-[#0f1115] shadow-2xl ring-1 ring-white/10">
              {/* khung minh họa */}
              <div
                className="relative flex h-36 items-center justify-center overflow-hidden"
                style={{
                  background:
                    "radial-gradient(70% 90% at 50% 20%, #22d3ee 0%, #0ea5e9 38%, #0b2a4a 75%, #0f1115 100%)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "radial-gradient(rgba(255,255,255,.55) 1px, transparent 1.2px)",
                    backgroundSize: "10px 10px",
                  }}
                />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-sm">
                  <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6z" />
                  </svg>
                </div>

                <button
                  onClick={goHome}
                  aria-label="Đóng"
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white/90 active:scale-95"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              {/* nội dung */}
              <div className="px-5 pb-5 pt-4">
                <h2 className="text-[22px] font-bold leading-tight text-white">
                  {hit.title || "Đang bảo trì"}
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-400">
                  {hit.message ||
                    "Trang này đang được nâng cấp. Bạn vui lòng quay lại sau nhé!"}
                </p>
                {hit.ends_at && (
                  <p className="mt-3 inline-block rounded-full bg-sky-500/15 px-3 py-1 text-xs font-medium text-sky-300">
                    Dự kiến xong: {fmt(hit.ends_at)}
                  </p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate("/support")}
                    className="rounded-2xl border border-white/15 bg-transparent py-3 text-[15px] font-semibold text-white active:scale-95"
                  >
                    Hỗ trợ
                  </button>
                  <button
                    onClick={goHome}
                    className="rounded-2xl bg-white py-3 text-[15px] font-semibold text-[#0f1115] active:scale-95"
                  >
                    Về trang chủ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
          }
