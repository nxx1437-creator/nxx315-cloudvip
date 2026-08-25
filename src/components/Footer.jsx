import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <div className="mt-10 bg-gradient-to-b from-white to-sky-50 py-8">
      <div className="mx-auto max-w-md px-4">
        {/* Brand */}
        <div className="mb-6 text-center">
          <h3 className="font-display text-lg font-bold text-slate-900">NXX315 Studio</h3>
          <p className="mt-1 text-xs text-slate-500">Nền tảng nhiệm vụ & phần thưởng</p>
          <p className="mt-1 text-xs text-slate-400">Kiếm coin • Đổi thưởng • Marketing</p>
        </div>

        {/* Thông tin */}
        <div className="mb-6">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Thông tin</h4>
          <ul className="space-y-2">
            <li><Link to="/terms" className="text-sm text-slate-600 hover:text-sky-600">Điều khoản sử dụng</Link></li>
            <li><Link to="/privacy" className="text-sm text-slate-600 hover:text-sky-600">Chính sách bảo mật</Link></li>
            <li><Link to="/fraud" className="text-sm text-slate-600 hover:text-sky-600">Chính sách chống gian lận</Link></li>
            <li><Link to="/redemption-policy" className="text-sm text-slate-600 hover:text-sky-600">Quy định đổi thưởng</Link></li>
          </ul>
        </div>

        {/* Hỗ trợ */}
        <div className="mb-6">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Hỗ trợ</h4>
          <ul className="space-y-2">
            <li><Link to="/help" className="text-sm text-slate-600 hover:text-sky-600">Trung tâm trợ giúp</Link></li>
            <li><Link to="/contact" className="text-sm text-slate-600 hover:text-sky-600">Liên hệ</Link></li>
          </ul>
        </div>

        {/* Kết nối */}
        <div className="mb-6">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Kết nối</h4>
          <div className="flex gap-3">
            <a 
              href="https://www.tiktok.com/@nxx3150" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition hover:bg-sky-100 hover:text-sky-600"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.76-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </a>
            <a 
              href="https://youtube.com/@nxx3155" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition hover:bg-rose-100 hover:text-rose-600"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-100 pt-6 text-center">
          <p className="text-xs text-slate-400">© 2026 NXX315 Studio</p>
        </div>
      </div>
    </div>
  );
      }
