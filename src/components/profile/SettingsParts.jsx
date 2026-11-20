// src/components/profile/AppSettingsCard.jsx — pháp lý + đăng xuất / xóa tài khoản (kiểu GitHub)
import React from "react";
import { ChevronRight, FileText, Lock } from "lucide-react";
import { GH_BTN, GH_INK, GH_LINE, GH_MUTED } from "./GhProfile.jsx";

export default function AppSettingsCard({ onTerms, onPrivacy, onLogout, onDelete }) {
  const rows = [
    { Icon: FileText, label: "Điều khoản sử dụng", sub: "Quy định khi dùng dịch vụ", onClick: onTerms },
    { Icon: Lock, label: "Chính sách quyền riêng tư", sub: "Cách chúng tôi bảo vệ dữ liệu", onClick: onPrivacy },
  ];

  return (
    <section className={`overflow-hidden rounded-lg border bg-white dark:bg-[#0d1117] ${GH_LINE}`}>
      <h2 className={`border-b bg-[#f6f8fa] px-4 py-3 text-[15px] font-semibold leading-5 dark:bg-[#161b22] ${GH_INK} ${GH_LINE}`}>
        Cài đặt ứng dụng
      </h2>

      <ul>
        {rows.map(({ Icon, label, sub, onClick }) => (
          <li key={label} className={`border-b ${GH_LINE}`}>
            <button
              onClick={onClick}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition active:bg-[#f6f8fa] dark:active:bg-[#161b22]"
            >
              <Icon size={18} className={`shrink-0 ${GH_MUTED}`} />
              <span className="min-w-0 flex-1">
                <span className={`block text-[14.5px] font-semibold leading-5 ${GH_INK}`}>{label}</span>
                <span className={`block text-[12.5px] leading-5 ${GH_MUTED}`}>{sub}</span>
              </span>
              <ChevronRight size={16} className={`shrink-0 ${GH_MUTED}`} />
            </button>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-2 gap-2 p-3">
        <button onClick={onLogout} className={`${GH_BTN} w-full`}>
          Đăng xuất
        </button>
        <button onClick={onDelete} className={`${GH_BTN} w-full !text-[#cf222e] dark:!text-[#f85149]`}>
          Xóa tài khoản
        </button>
      </div>
    </section>
  );
}
