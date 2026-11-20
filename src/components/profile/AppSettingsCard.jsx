// src/components/profile/AppSettingsCard.jsx — pháp lý + đăng xuất / xóa tài khoản (mềm, gọn)
import React from "react";
import { ChevronRight, FileText, Lock } from "lucide-react";
import { GH_CARD, GH_INK, GH_MUTED } from "./GhProfile.jsx";

const TILE =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f3f5f8] text-[#59636e] dark:bg-[#161b22] dark:text-[#9198a1]";
const ROW =
  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition active:bg-[#f3f5f8] dark:active:bg-[#161b22]";

export default function AppSettingsCard({ onTerms, onPrivacy, onLogout, onDelete }) {
  const rows = [
    { Icon: FileText, label: "Điều khoản sử dụng", sub: "Quy định khi dùng dịch vụ", onClick: onTerms },
    { Icon: Lock, label: "Chính sách quyền riêng tư", sub: "Cách chúng tôi bảo vệ dữ liệu", onClick: onPrivacy },
  ];

  return (
    <section className={GH_CARD}>
      <h2 className={`px-5 pb-1 pt-4 text-[17px] font-semibold leading-6 ${GH_INK}`}>Cài đặt ứng dụng</h2>

      <ul className="px-2 py-2">
        {rows.map(({ Icon, label, sub, onClick }) => (
          <li key={label}>
            <button onClick={onClick} className={ROW}>
              <span className={TILE}>
                <Icon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-[15px] font-medium leading-5 ${GH_INK}`}>{label}</span>
                <span className={`block text-[13px] leading-5 ${GH_MUTED}`}>{sub}</span>
              </span>
              <ChevronRight size={16} className={`shrink-0 ${GH_MUTED}`} />
            </button>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-2 gap-2.5 px-4 pb-4 pt-1">
        <button
          onClick={onLogout}
          className="h-11 rounded-xl bg-[#f3f5f8] text-[14.5px] font-medium text-[#1f2328] transition active:scale-[0.98] dark:bg-[#21262d] dark:text-[#e6edf3]"
        >
          Đăng xuất
        </button>
        <button
          onClick={onDelete}
          className="h-11 rounded-xl bg-rose-50 text-[14.5px] font-medium text-[#cf222e] transition active:scale-[0.98] dark:bg-rose-500/10 dark:text-[#f85149]"
        >
          Xóa tài khoản
        </button>
      </div>
    </section>
  );
}
