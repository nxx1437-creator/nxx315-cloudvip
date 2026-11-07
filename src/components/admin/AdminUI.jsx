import React, { useCallback, useEffect, useState } from "react";
import { Package, RefreshCw, Search, X } from "lucide-react";

export const fmtNum = (n) => Number(n || 0).toLocaleString("vi-VN");
export const fmtDate = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "-");
export const fmtTime = (d) =>
  d
    ? new Date(d).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
    : "-";

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

// ===== Phong cách Cal.com: thẻ trắng bo 12px, đổ bóng nhẹ, không viền =====
const SHADOW = "shadow-[0_1px_5px_-4px_rgba(36,36,36,0.7),0_4px_8px_rgba(36,36,36,0.05)]";

export function Card({ className = "", children, ...rest }) {
  return (
    <div className={`rounded-xl bg-white ${SHADOW} ${className}`} {...rest}>
      {children}
    </div>
  );
}

// Nút hình viên thuốc: primary (đen) hoặc ghost (viền xám)
export function Btn({ variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-[14px] font-medium transition active:scale-[0.98] disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-[#101010] text-white hover:bg-[#242424]"
      : "border border-[#e5e7eb] bg-white text-[#242424] hover:bg-[#f4f4f4]";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

export function SectionHeader({ title, description, onRefresh, loading }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-[24px] font-semibold leading-[1.3] tracking-[0.01em] text-[#242424]">{title}</h2>
        {description && <p className="mt-0.5 text-[14px] text-[#6b7280]">{description}</p>}
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={loading}
          aria-label="Làm mới"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#242424] disabled:opacity-50 ${SHADOW}`}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      )}
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder }) {
  return (
    <div className={`relative rounded-full bg-white ${SHADOW}`}>
      <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#898989]" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full bg-transparent py-3 pl-11 pr-4 text-[14px] text-[#242424] outline-none placeholder:text-[#898989]"
      />
    </div>
  );
}

// Nhóm nút lọc dạng viên thuốc
export function FilterPills({ options, value, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition ${
            value === o.id
              ? "bg-[#101010] text-white"
              : "border border-[#e5e7eb] bg-white text-[#242424] hover:bg-[#f4f4f4]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Loading() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse p-4">
          <div className="h-4 w-1/2 rounded bg-[#e5e7eb]" />
          <div className="mt-3 h-3 w-3/4 rounded bg-[#f4f4f4]" />
          <div className="mt-2 h-3 w-1/3 rounded bg-[#f4f4f4]" />
        </Card>
      ))}
    </div>
  );
}

export function GridSkeleton({ count = 4, className = "" }) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} className="animate-pulse p-5">
          <div className="mb-4 h-5 w-32 rounded bg-[#e5e7eb]" />
          <div className="mb-2 h-4 w-full rounded bg-[#f4f4f4]" />
          <div className="h-4 w-2/3 rounded bg-[#f4f4f4]" />
        </Card>
      ))}
    </div>
  );
}

export function EmptyState({ text }) {
  return (
    <Card className="px-6 py-12 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f4f4f4] text-[#898989]">
        <Package size={22} />
      </div>
      <p className="text-[14px] text-[#6b7280]">{text}</p>
    </Card>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <Card className="px-6 py-8 text-center">
      <p className="text-[14px] text-[#242424]">{message || "Có lỗi xảy ra khi tải dữ liệu"}</p>
      {onRetry && (
        <Btn onClick={onRetry} className="mt-3">
          Thử lại
        </Btn>
      )}
    </Card>
  );
}

const LABELS = {
  pending: "Chờ xử lý", paid: "Chờ giao", processing: "Đang xử lý", needs_review: "Cần kiểm tra",
  delivered: "Đã giao", completed: "Hoàn thành", approved: "Đã duyệt", answered: "Đã trả lời",
  rejected: "Từ chối", cancelled: "Đã hủy", failed: "Từ chối",
};
const NEEDS_ACTION = ["pending", "paid", "processing", "needs_review"];
const FINISHED = ["delivered", "completed", "approved", "answered"];

export function StatusBadge({ status }) {
  const tone = NEEDS_ACTION.includes(status)
    ? "bg-[#101010] text-white"
    : FINISHED.includes(status)
    ? "bg-[#e5e7eb] text-[#242424]"
    : "border border-[#e5e7eb] text-[#6b7280]";
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[12px] font-medium ${tone}`}>
      {LABELS[status] || status || "Không rõ"}
    </span>
  );
}

export function InfoBox({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-[#f4f4f4] px-3.5 py-3">
      <span className="shrink-0 text-[12px] font-medium text-[#6b7280]">{label}</span>
      <span className="min-w-0 break-words text-right text-[14px] text-[#242424]">{value}</span>
    </div>
  );
}

export function Modal({ title, children, onClose }) {
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className={`max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-xl bg-white sm:rounded-xl ${SHADOW}`}
      >
        <div className="flex items-center justify-between px-5 pb-2 pt-5">
          <h3 className="text-[20px] font-semibold leading-[1.3] tracking-[0.01em] text-[#242424]">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#6b7280] hover:bg-[#f4f4f4]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 pt-3">{children}</div>
      </div>
    </div>
  );
}
