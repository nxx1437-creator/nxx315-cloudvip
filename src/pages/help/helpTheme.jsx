// helpTheme.js — chủ đề sáng/tối cho Trung tâm Trợ giúp, đọc từ profiles.theme_mode
import React, { useEffect, useLayoutEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient.js";
import "./helpTheme.css";

const KEY = "nxx315-theme-mode";
const MODES = ["light", "dark", "system"];

const readCache = () => {
  try { const v = localStorage.getItem(KEY); return MODES.includes(v) ? v : "system"; } catch { return "system"; }
};
let mode = readCache();
let scopes = 0;
let synced = false;
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

async function syncFromProfile() {
  if (synced) return;
  const { data: s } = await supabase.auth.getSession();
  const uid = s?.session?.user?.id;
  if (!uid) return;
  synced = true;
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
    subs.add(f);
    scopes += 1;
    apply();
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    mq?.addEventListener?.("change", apply);
    return () => {
      subs.delete(f);
      mq?.removeEventListener?.("change", apply);
      scopes -= 1;
      if (scopes === 0) document.documentElement.removeAttribute("data-help-theme");
    };
  }, []);
  useEffect(() => { syncFromProfile(); }, []);
  return resolve(mode);
}

/* Nút chọn Trắng / Đen / Theo máy: đặt trong trang hồ sơ người dùng */
export function ThemeSwitch() {
  const [m, setM] = useState(mode);
  useEffect(() => {
    subs.add(setM);
    syncFromProfile();
    return () => subs.delete(setM);
  }, []);
  const opts = [["light", "Trắng"], ["dark", "Đen"], ["system", "Theo máy"]];
  return (
    <div role="radiogroup" aria-label="Giao diện" className="grid grid-cols-3 gap-2">
      {opts.map(([v, label]) => (
        <button key={v} role="radio" aria-checked={m === v} onClick={() => setThemeMode(v)}
          className={`rounded-xl border px-3 py-2.5 text-[14px] font-medium transition active:scale-95 ${
            m === v ? "border-[#08874f] bg-[#e0f4e9] text-[#10261b]" : "border-slate-200 bg-white text-slate-600"
          }`}>
          {label}
        </button>
      ))}
    </div>
  );
}
