import { useSyncExternalStore } from "react";
import vi from "./vi.js";
import en from "./en.js";

const DICTS = { vi, en };
const KEY = "nxx315_lang";

export const LANGS = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", label: "English", flag: "🇺🇸" },
];

function detect() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && DICTS[saved]) return saved;
  } catch {}
  const nav = (navigator.language || "vi").toLowerCase();
  return nav.startsWith("vi") ? "vi" : "en";
}

let current = detect();
const listeners = new Set();

if (typeof document !== "undefined") {
  document.documentElement.lang = current;
}

export function setLang(code) {
  if (!DICTS[code] || code === current) return;
  current = code;
  try {
    localStorage.setItem(KEY, code);
  } catch {}
  if (typeof document !== "undefined") {
    document.documentElement.lang = code;
  }
  listeners.forEach((fn) => fn());
}

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const getSnapshot = () => current;

export function translate(lang, key, vars) {
  const str = DICTS[lang]?.[key] ?? DICTS.vi[key] ?? key;
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] !== undefined ? vars[k] : `{${k}}`
  );
}

// Dùng trong mọi component: const { t, lang, setLang } = useI18n();
export function useI18n() {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const t = (key, vars) => translate(lang, key, vars);
  return { lang, t, setLang };
}
