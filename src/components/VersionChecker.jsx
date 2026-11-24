import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { isUpdateReady, onUpdateReady, applyUpdate } from "../lib/updater";

const CHECK_MS = 60 * 1000;
const MIN_GAP_MS = 60 * 1000;
const GUARD_KEY = "last_update_reload";

const BUSY = /^\/(task\/callback|store\/|withdraw|cards|thanh-toan|nap-thanh-cong|onboarding|history\/order\/[^/]+\/not-received)/;

const isTyping = () => {
  const el = document.activeElement;
  return !!el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
};

export default function VersionChecker() {
  // đổi trang HOẶC đổi phần sau dấu ? (vd. mở danh sách theo dõi) đều là lúc an toàn để áp dụng bản mới
  const { pathname, search } = useLocation();
  const pathRef = useRef(pathname);
  const pendingRef = useRef(isUpdateReady());
  const first = useRef(true);
  pathRef.current = pathname;

  const tryApply = () => {
    if (!pendingRef.current) return;
    if (BUSY.test(pathRef.current) || isTyping()) return;
    try {
      const last = +sessionStorage.getItem(GUARD_KEY) || 0;
      if (Date.now() - last < MIN_GAP_MS) return;
      sessionStorage.setItem(GUARD_KEY, String(Date.now()));
    } catch {}
    isUpdateReady() ? applyUpdate() : window.location.reload();
  };

  useEffect(() => {
    const off = onUpdateReady(() => { pendingRef.current = true; });

    // Dự phòng khi không có SW (trình duyệt trong app, iOS...)
    const check = async () => {
      if (pendingRef.current) return;
      try {
        const r = await fetch(`/version.json?_=${Date.now()}`, { cache: "no-store" });
        const { version } = await r.json();
        if (version && version !== __BUILD_ID__) pendingRef.current = true;
      } catch {}
    };
    check();
    const t = setInterval(check, CHECK_MS);

    const onVis = () => { if (document.hidden) tryApply(); };
    document.addEventListener("visibilitychange", onVis);

    return () => { off(); clearInterval(t); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    tryApply();
  }, [pathname, search]);

  return null;
}
