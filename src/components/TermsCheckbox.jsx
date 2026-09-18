import React from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

export default function TermsCheckbox({ checked, onChange, accentColor = "orange" }) {
  const colorMap = {
    orange: {
      border: "border-orange-500",
      bg: "bg-orange-500",
      text: "text-orange-600",
    },
    green: {
      border: "border-green-500",
      bg: "bg-green-500",
      text: "text-green-600",
    },
    blue: {
      border: "border-blue-500",
      bg: "bg-blue-500",
      text: "text-blue-600",
    },
    yellow: {
      border: "border-yellow-500",
      bg: "bg-yellow-500",
      text: "text-yellow-600",
    },
    rose: {
      border: "border-rose-500",
      bg: "bg-rose-500",
      text: "text-rose-600",
    },
  };

  const colors = colorMap[accentColor] || colorMap.orange;

  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 transition hover:border-slate-300 hover:bg-slate-100">
      {/* Custom checkbox */}
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
          checked
            ? `${colors.bg} ${colors.border}`
            : "border-slate-300 bg-white"
        }`}
        aria-label="Đồng ý điều khoản"
      >
        {checked && <Check size={12} className="text-white" strokeWidth={3} />}
      </button>

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />

      <span className="text-xs leading-5 text-slate-600">
        Tôi đã đọc và đồng ý với{" "}
        <Link
          to="/redemption-policy"
          target="_blank"
          className={`font-bold ${colors.text} hover:underline`}
          onClick={(e) => e.stopPropagation()}
        >
          Quy định đổi thưởng
        </Link>{" "}
        và{" "}
        <Link
          to="/privacy"
          target="_blank"
          className={`font-bold ${colors.text} hover:underline`}
          onClick={(e) => e.stopPropagation()}
        >
          Chính sách quyền riêng tư
        </Link>{" "}
        của NXX315 Studio Rewards.
      </span>
    </label>
  );
}
