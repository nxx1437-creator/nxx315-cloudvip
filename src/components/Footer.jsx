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

        {/* 2 cột thông tin */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Thông tin</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-slate-600 hover:text-sky-600">Giới thiệu</Link></li>
              <li><Link to="/terms" className="text-sm text-slate-600 hover:text-sky-600">Điều khoản dịch vụ</Link></li>
              <li><Link to="/privacy" className="text-sm text-slate-600 hover:text-sky-600">Chính sách bảo mật</Link></li>
              <li><Link to="/store" className="text-sm text-slate-600 hover:text-sky-600">Quy định đổi thưởng</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Hỗ trợ</h4>
            <ul className="space-y-2">
              <li><Link to="/support" className="text-sm text-slate-600 hover:text-sky-600">Trung tâm trợ giúp</Link></li>
              <li><Link to="/contact" className="text-sm text-slate-600 hover:text-sky-600">Liên hệ</Link></li>
              <li><Link to="/status" className="text-sm text-slate-600 hover:text-sky-600">Trạng thái hệ thống</Link></li>
            </ul>
          </div>
        </div>

        {/* Kết nối */}
        <div className="mt-8">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Kết nối</h4>
          <div className="flex gap-3">
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition hover:bg-sky-100 hover:text-sky-600">
              TikTok
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition hover:bg-rose-100 hover:text-rose-600">
              YouTube
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition hover:bg-blue-100 hover:text-blue-600">
              Discord
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-slate-100 pt-6 text-center">
          <p className="text-xs text-slate-400">© 2026 NXX315 Studio</p>
        </div>
      </div>
    </div>
  );
              }
