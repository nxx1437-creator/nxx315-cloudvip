import React, { useCallback, useEffect, useState } from "react";
import { CheckCircle, Clock, Package, RefreshCw, X, XCircle } from "lucide-react";

export const fmtNum = (n) => Number(n || 0).toLocaleString("vi-VN");
export const fmtDate = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "-");

// Tải danh sách từ Supabase. `build` phải là hàm cố định, khai báo ngoài component.
export function useAdminList(build) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: rows, error: err } = await build();
    if (err) setError(err.message);
    else setData(rows || []);
    setLoading(false);
  }, [build]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, setData, loading, error, reload };
}

export function SectionHeader({ title, description, onRefresh, loading }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        aria-label="Làm mới"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
      >
        <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
      </button>
    </div>
  );
}

export function Loading() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white">
      {[1, 2, 3, 4, 5].map((item, index) => (
        <div
          key={item}
          className={`flex items-center gap-3 px-4 py-3.5 ${index > 0 ? "border-t border-slate-100" : ""}`}
        >
          <div className="h-9 w-9 shrink-0 rounded-full bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/2 rounded bg-slate-100" />
            <div className="h-3 w-3/4 rounded bg-slate-100" />
          </div>
          <div className="h-5 w-16 rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export function GridSkeleton({ count = 4, className = "" }) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border bg-white p-5">
          <div className="mb-4 h-5 w-32 rounded bg-slate-200" />
          <div className="mb-2 h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-2/3 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ text }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Package size={22} />
      </div>
      <p className="text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
      <p className="text-sm font-medium text-red-700">{message || "Có lỗi xảy ra khi tải dữ liệu"}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Thử lại
        </button>
      )}
    </div>
  );
}

export function StatusIcon({ status }) {
  const s = String(status || "").toLowerCase();
  const done = ["delivered", "completed", "answered", "success", "approved"].includes(s);
  const bad = ["rejected", "cancelled", "canceled", "failed"].includes(s);
  const Icon = done ? CheckCircle : bad ? XCircle : Clock;
  const cls = done
    ? "bg-emerald-50 text-emerald-500"
    : bad
    ? "bg-red-50 text-red-500"
    : "bg-amber-50 text-amber-500";
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${cls}`}>
      <Icon size={18} />
    </div>
  );
}

const BADGES = {
  pending: { text: "Đang chờ", cls: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  paid: { text: "Đang kiểm tra", cls: "border-sky-200 bg-sky-50 text-sky-700", dot: "bg-sky-500" },
  processing: { text: "Đang xử lý", cls: "border-sky-200 bg-sky-50 text-sky-700", dot: "bg-sky-500" },
  delivered: { text: "Đã giao", cls: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  completed: { text: "Hoàn thành", cls: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  approved: { text: "Đã duyệt", cls: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  rejected: { text: "Từ chối", cls: "border-red-200 bg-red-50 text-red-700", dot: "bg-red-500" },
  cancelled: { text: "Đã hủy", cls: "border-slate-200 bg-slate-50 text-slate-600", dot: "bg-slate-400" },
  answered: { text: "Đã trả lời", cls: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
};

export function StatusBadge({ status }) {
  const item = BADGES[status] || {
    text: status || "Không rõ",
    cls: "border-slate-200 bg-slate-50 text-slate-600",
    dot: "bg-slate-400",
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${item.cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
      {item.text}
    </span>
  );
}

export function InfoBox({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-3.5 py-3">
      <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <span className="min-w-0 break-words text-right text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
}

export function Modal({ title, children, onClose }) {
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
          }
