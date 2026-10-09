import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Book, ChevronRight } from "lucide-react";
import { GUIDE_MENU } from "./guideData.js";

export default function Sidebar({ onNavigate }) {
  const location = useLocation();
  const currentId = location.pathname.split("/guide/")[1] || "";

  return (
    <nav className="space-y-1">
      {/* Link về trang chủ Guide */}
      <Link
        to="/guide"
        onClick={onNavigate}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-all ${
          !currentId
            ? "guide-sidebar-active"
            : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
        }`}
      >
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
            !currentId ? "bg-blue-500/20" : "bg-white/5"
          }`}
        >
          <Book size={14} className="text-blue-400" strokeWidth={2.4} />
        </div>
        <span className="flex-1">Tổng quan</span>
        {!currentId && <ChevronRight size={14} className="text-blue-400" />}
      </Link>

      {/* Divider */}
      <div className="px-3 py-2">
        <div className="h-px bg-white/10" />
      </div>

      {/* Danh sách mục */}
      {GUIDE_MENU.map((item) => {
        const active = currentId === item.id;

        return (
          <Link
            key={item.id}
            to={`/guide/${item.id}`}
            onClick={onNavigate}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-all ${
              active
                ? "guide-sidebar-active"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
            }`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition ${
                active ? "bg-blue-500/20" : "bg-white/5 group-hover:bg-white/10"
              }`}
            >
              <img
                src={item.icon}
                alt=""
                className="h-5 w-5 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>

            <span className="flex-1 truncate">{item.label}</span>

            <ChevronRight
              size={14}
              className={`shrink-0 transition ${
                active
                  ? "text-blue-400"
                  : "text-zinc-600 group-hover:text-zinc-400"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
                    }
