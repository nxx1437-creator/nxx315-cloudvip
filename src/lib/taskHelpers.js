export const SUPABASE_URL = "https://rwglwovohbyqmbbzdvdj.supabase.co";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const RECAPTCHA_SITE_KEY = "6LdDVZQtAAAAAPtq_OTF3sAMkjmUphIIQkRPbwWh";

const STORAGE_BUCKET = "game_logos";

const PROVIDER_LOGOS = {
  layma: "layma.png",
  link4m: "link4m.png",
  site2s: "site2s.png",
  traffic68: "traffic68.png",
};

const getImageUrl = (fileName) =>
  `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;

export const getProviderLogo = (task) => {
  if (task?.logo_url) return task.logo_url;
  const key = String(task?.provider || "").toLowerCase().trim();
  const file = PROVIDER_LOGOS[key];
  return file ? getImageUrl(file) : null;
};

export function hoursUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(1, Math.round((midnight - now) / 1000 / 60 / 60));
}

export const DONE_STATUSES = ["completed", "success", "done", "verified"];

// Trả về { key, raw, cls }: có key thì dịch bằng t(key), không thì hiện raw
export function getHistoryStatus(status) {
  const s = String(status || "").toLowerCase();
  if (s === "pending")
    return { key: "tk.st.pending", cls: "bg-blue-50 text-blue-600 border-blue-100" };
  if (DONE_STATUSES.includes(s))
    return {
      key: "tk.st.completed",
      cls: "bg-emerald-50 text-emerald-600 border-emerald-100",
    };
  if (s === "expired")
    return { key: "tk.st.expired", cls: "bg-slate-100 text-slate-500 border-slate-200" };
  if (s === "cancelled")
    return { key: "tk.st.cancelled", cls: "bg-amber-50 text-amber-600 border-amber-100" };
  if (s === "failed")
    return { key: "tk.st.failed", cls: "bg-rose-50 text-rose-600 border-rose-100" };
  return {
    key: null,
    raw: s || "—",
    cls: "bg-slate-100 text-slate-500 border-slate-200",
  };
}

export function formatDateTime(d, lang = "vi") {
  if (!d) return "—";
  return new Date(d).toLocaleString(lang === "en" ? "en-US" : "vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Tạo fingerprint từ thông tin trình duyệt
export function generateFingerprint() {
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || "unknown",
    navigator.platform || "unknown",
  ].join("|");

  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return "fp_" + Math.abs(hash).toString(36);
}

// Tên hiển thị riêng cho từng provider (KHÔNG đổi task.provider gốc,
// vì backend start-task so khớp đúng chuỗi này)
const LINK999_STEP_LABELS = { "3": "3 Bước", "4": "2 Bước", "5": "4 Bước" };

export function getDisplayName(task) {
  if (task.provider === "TASKDAILY") return "TASKDAILY - Google Maps Review";
  if (task.provider === "LINK999")
    return `LINK999 - Google Search ${LINK999_STEP_LABELS[task.url] || ""}`;
  return task.provider;
    }
