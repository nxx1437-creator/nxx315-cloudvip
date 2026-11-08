// src/components/profile/AppSettingsCard.jsx — pháp lý + đăng xuất / xóa tài khoản
import React from "react";
import { FileText, Lock } from "lucide-react";
import { SettingsRow } from "./ProfileUI.jsx";

export default function AppSettingsCard({ onTerms, onPrivacy, onLogout, onDelete }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900">
      <h2 className="px-5 pb-2 pt-5 font-display text-[20px] font-bold text-slate-900 dark:text-white">
        Cài đặt ứng dụng
      </h2>
      <SettingsRow
        icon={FileText}
        label="Điều khoản sử dụng"
        sub="Quy định khi dùng dịch vụ"
        onClick={onTerms}
      />
      <SettingsRow
        icon={Lock}
        label="Chính sách quyền riêng tư"
        sub="Cách chúng tôi bảo vệ dữ liệu"
        onClick={onPrivacy}
        last
      />
      <div className="grid grid-cols-2 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onLogout}
          className="border-r border-slate-100 py-4 text-[15px] font-semibold text-rose-500 transition active:bg-slate-50 dark:border-slate-800 dark:active:bg-slate-800/50"
        >
          Đăng xuất
        </button>
        <button
          onClick={onDelete}
          className="py-4 text-[15px] font-semibold text-slate-500 transition active:bg-slate-50 dark:text-slate-400 dark:active:bg-slate-800/50"
        >
          Xóa tài khoản
        </button>
      </div>
    </section>
  );
}
