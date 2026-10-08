import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const CHECK_MS = 60 * 1000; // kiểm tra mỗi 60 giây
const MIN_GAP_MS = 60 * 1000; // chống reload liên tục
const GUARD_KEY = "last_update_reload";

// Không bao giờ reload ở các trang này (đang có captcha/đếm giờ)
const isBusyPath = (path) => path.startsWith("/task/callback");

const collectAssets = (root) => {
  const found = [];
  root
    .querySelectorAll('script[src], link[rel="stylesheet"]')
    .forEach((el) => {
      const url = el.getAttribute("src") || el.getAttribute("href") || "";
      if (url.includes("/assets/")) found.push(url.split("?")[0]);
    });
  return found.sort().join("|");
};

async function fetchLatestBuildId() {
  const res = await fetch(`/index.html?_=${Date.now()}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  return collectAssets(doc);
}

export default function VersionChecker() {
  const location = useLocation();
  const pendingRef = useRef(false);
  const currentRef = useRef(null);
  const pathRef = useRef(location.pathname);
  const firstRender = useRef(true);

  pathRef.current = location.pathname;

  const reloadNow = () => {
    if (!pendingRef.current) return;
    if (isBusyPath(pathRef.current)) return;

    try {
      const last = parseInt(sessionStorage.getItem(GUARD_KEY) || "0", 10);
      if (Date.now() - last < MIN_GAP_MS) return;
      sessionStorage.setItem(GUARD_KEY, String(Date.now()));
    } catch {
      /* bỏ qua */
    }

    window.location.reload();
  };

  // Kiểm tra bản mới: chỉ đánh dấu, KHÔNG reload ngay
  useEffect(() => {
    currentRef.current = collectAssets(document);
    if (!currentRef.current) return; // dev mode / không phải bản build

    let stopped = false;

    const check = async () => {
      if (stopped || pendingRef.current) return;
      try {
        const latest = await fetchLatestBuildId();
        if (latest && latest !== currentRef.current) {
          pendingRef.current = true;
        }
      } catch {
        /* mất mạng thì bỏ qua */
      }
    };

    const timer = setInterval(check, CHECK_MS);
    check();

    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, []);

  // Lúc an toàn 1: người dùng rời tab / chuyển app / quay lại
  useEffect(() => {
    const onVisibility = () => reloadNow();
    document.addEventListener("visibilitychange", onVisibility);
    return () =>
      document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Lúc an toàn 2: người dùng chuyển trang trong web
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    reloadNow();
  }, [location.pathname]);

  return null;
    }
