import { useEffect, useState, useCallback } from "react";

const KEY = "nxx-theme"; // "light" | "dark" | "system"

const resolve = (m) =>
  m === "system"
    ? window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
    : m;

export function applyTheme(mode) {
  document.documentElement.dataset.theme = resolve(mode);
}

export function initTheme() {
  let m = "dark";
  try { m = localStorage.getItem(KEY) || "dark"; } catch {}
  applyTheme(m);
}

export function useTheme() {
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem(KEY) || "dark"; } catch { return "dark"; }
  });

  const set = useCallback((m) => {
    setMode(m);
    try { localStorage.setItem(KEY, m); } catch {}
    applyTheme(m);
  }, []);

  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const fn = () => applyTheme("system");
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [mode]);

  return [mode, set];
}
