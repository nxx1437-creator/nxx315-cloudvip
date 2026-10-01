import React, { useState } from "react";
import { IconEye, IconEyeOff } from "./AuthIcons.jsx";

const labelCls =
  "text-[12px] font-bold uppercase tracking-wider text-slate-700";

export default function AuthField({
  id,
  label,
  labelRight,
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
  maxLength,
  autoComplete,
  variant = "default",
  uppercase = false,
  autoFocus = false,
}) {
  const [show, setShow] = useState(false);
  const isPw = type === "password";

  const tone =
    variant === "gift"
      ? "border-amber-200 bg-amber-50/50 text-amber-900 placeholder:text-amber-400 focus:border-amber-400 focus:ring-amber-100"
      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-100";

  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className={labelCls}>
          {label}
        </label>
        {labelRight}
      </div>
      <div className="relative mt-2">
        {icon && (
          <span
            className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${
              variant === "gift" ? "text-amber-500" : "text-slate-400"
            }`}
          >
            {icon}
          </span>
        )}
        <input
          id={id}
          type={isPw && show ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={`w-full rounded-xl border py-3.5 text-sm outline-none transition focus:ring-4 disabled:bg-slate-100 disabled:opacity-60 ${tone} ${
            icon ? "pl-11" : "pl-4"
          } ${isPw ? "pr-12" : "pr-4"} ${
            uppercase
              ? "font-semibold uppercase tracking-wider placeholder:font-normal placeholder:normal-case placeholder:tracking-normal"
              : ""
          }`}
        />
        {isPw && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            disabled={disabled}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            {show ? <IconEyeOff size={18} /> : <IconEye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}
