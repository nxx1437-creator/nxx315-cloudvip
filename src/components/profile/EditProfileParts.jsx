// src/components/profile/EditProfileParts.jsx — các mảnh nhỏ dùng cho EditProfileModal
import React from "react";
import { ChevronRight } from "lucide-react";
import { GH_INK, GH_LINE, GH_MUTED } from "./GhProfile.jsx";

// công tắc đen/trắng
export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        checked ? "bg-[#1f2328] dark:bg-[#e6edf3]" : "bg-[#d0d7de] dark:bg-[#30363d]"
      }`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all dark:bg-[#0d1117] ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

// hộp thoại xác nhận nhỏ ở giữa màn hình
export function Confirm({ title, text, okLabel, okDanger, cancelLabel, onOk, onCancel }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-6">
      <div className="w-full max-w-xs overflow-hidden rounded-2xl bg-white text-center dark:bg-[#161b22]">
        <div className="px-5 pb-4 pt-5">
          <p className={`text-[16px] font-semibold ${GH_INK}`}>{title}</p>
          <p className={`mt-1.5 text-[14px] leading-5 ${GH_MUTED}`}>{text}</p>
        </div>
        <button
          type="button"
          onClick={onOk}
          className={`block w-full border-t py-3 text-[15px] font-semibold ${GH_LINE} ${
            okDanger ? "text-[#cf222e]" : GH_INK
          }`}
        >
          {okLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`block w-full border-t py-3 text-[15px] ${GH_LINE} ${GH_INK}`}
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  );
}

// đường kẻ thụt vào hai bên (như ảnh mẫu)
export const Divider = () => <div className={`mx-4 border-t ${GH_LINE}`} />;

// một dòng: nhãn đậm ở trên, giá trị xám ở dưới, (tuỳ chọn) nội dung bên phải + mũi tên
export function Row({ label, value, placeholder, onClick, right, note, disabled }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      {...(onClick ? { type: "button", onClick, disabled } : {})}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left disabled:opacity-60"
    >
      <span className="min-w-0 flex-1">
        <span className={`block text-[14px] font-semibold ${GH_INK}`}>{label}</span>
        <span className={`mt-0.5 block truncate text-[15px] ${value ? GH_INK : "text-[#8c959f]"}`}>
          {value || placeholder}
        </span>
        {note && <span className={`block text-[12px] leading-4 ${GH_MUTED}`}>{note}</span>}
      </span>
      {right}
      {onClick && <ChevronRight size={18} className={`shrink-0 ${GH_MUTED}`} />}
    </Tag>
  );
}
