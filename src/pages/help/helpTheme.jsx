// helpTheme.jsx — chủ đề trắng / đen cho Trung tâm Trợ giúp.
// Đọc đúng lựa chọn ở Hồ sơ → Cài đặt tài khoản → Giao diện
// (khóa "theme_mode" và cột profiles.theme_mode, cùng nguồn với hooks/useTheme.js).
import React, { useEffect, useLayoutEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient.js";
import "./helpTheme.css";
import "./helpWriter.css";

const KEY = "theme_mode";
const MODES = ["light", "dark", "system"];

const readCache = () => {
  try { const v = localStorage.getItem(KEY); return MODES.includes(v) ? v : "system"; } catch { return "system"; }
};
let mode = readCache();
let scopes = 0;
let lastSync = 0;
const subs = new Set();

const prefersDark = () => !!window.matchMedia?.("(prefers-color-scheme: dark)").matches;
const resolve = (m) => (m === "dark" ? "dark" : m === "light" ? "light" : prefersDark() ? "dark" : "light");

function apply() {
  if (scopes > 0) document.documentElement.setAttribute("data-help-theme", resolve(mode));
}
function emit() {
  subs.forEach((f) => f(mode));
  apply();
}

/* Lấy lựa chọn đã lưu trong tài khoản (tối đa 1 lần / phút) */
async function syncFromProfile() {
  const now = Date.now();
  if (now - lastSync < 60000) return;
  lastSync = now;
  const { data: s } = await supabase.auth.getSession();
  const uid = s?.session?.user?.id;
  if (!uid) return;
  const { data } = await supabase.from("profiles").select("theme_mode").eq("id", uid).maybeSingle();
  if (data && MODES.includes(data.theme_mode) && data.theme_mode !== mode) {
    mode = data.theme_mode;
    try { localStorage.setItem(KEY, mode); } catch { /* bỏ qua */ }
    emit();
  }
}

export async function setThemeMode(next) {
  if (!MODES.includes(next)) return;
  mode = next;
  try { localStorage.setItem(KEY, next); } catch { /* bỏ qua */ }
  emit();
  const { data: s } = await supabase.auth.getSession();
  const uid = s?.session?.user?.id;
  if (uid) await supabase.from("profiles").update({ theme_mode: next }).eq("id", uid);
}

/* Gọi trong mỗi màn của trợ giúp: bật chủ đề khi màn mở, tắt khi đóng hết */
export function useHelpTheme() {
  const [, force] = useState(0);
  useLayoutEffect(() => {
    const f = () => force((n) => n + 1);
    const onStorage = (e) => {
      if (e.key === KEY) { mode = readCache(); emit(); }
    };
    mode = readCache(); // đọc lại: người dùng có thể vừa đổi ở trang Cài đặt
    subs.add(f);
    scopes += 1;
    apply();
    window.addEventListener("storage", onStorage);
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    mq?.addEventListener?.("change", apply);
    return () => {
      subs.delete(f);
      window.removeEventListener("storage", onStorage);
      mq?.removeEventListener?.("change", apply);
      scopes -= 1;
      if (scopes === 0) document.documentElement.removeAttribute("data-help-theme");
    };
  }, []);
  useEffect(() => { syncFromProfile(); }, []);
  return resolve(mode);
}

/* Nút chọn Trắng / Đen / Theo máy (hiện chưa dùng, Cài đặt đã có sẵn) */
export function ThemeSwitch() {
  const [m, setM] = useState(mode);
  useEffect(() => {
    subs.add(setM);
    syncFromProfile();
    return () => subs.delete(setM);
  }, []);
  const opts = [["light", "Trắng"], ["dark", "Đen"], ["system", "Theo máy"]];
  return (
    <div role="group" aria-label="Giao diện" className="grid grid-cols-3 gap-2">
      {opts.map(([v, label]) => (
        <button key={v} type="button" aria-pressed={m === v} onClick={() => setThemeMode(v)}
          className="hc-chip rounded-full px-3 py-2.5 text-[14px] font-medium transition active:scale-95">
          {label}
        </button>
      ))}
    </div>
  );
  }
