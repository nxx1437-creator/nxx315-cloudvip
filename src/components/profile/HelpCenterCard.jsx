// src/components/profile/HelpCenterCard.jsx — Trung tâm trợ giúp (mềm, gọn) + yêu cầu gần đây
import React, { useEffect, useState } from "react";
import { BookOpen, ChevronRight, Lightbulb, MessageCircle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import { StatusDot } from "../../pages/help/HelpUI.jsx";
import { statusOf } from "../../pages/help/HelpScreen.jsx";
import { GH_CARD, GH_INK, GH_MUTED } from "./GhProfile.jsx";

// onOpen(key): "home" | "chat" | "topics" | "idea" | "history"
const ROWS = [
  { key: "chat", Icon: MessageCircle, label: "Hỗ trợ trực tuyến", sub: "Chat với trợ lý AI, giải đáp 24/7" },
  { key: "topics", Icon: BookOpen, label: "Chủ đề trợ giúp", sub: "Xem hướng dẫn theo từng chủ đề" },
  { key: "idea", Icon: Lightbulb, label: "Đề xuất ý tưởng", sub: "Gửi yêu cầu hỗ trợ hoặc góp ý" },
];

const TILE =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f3f5f8] text-[#59636e] dark:bg-[#161b22] dark:text-[#9198a1]";
const ROW =
  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition active:bg-[#f3f5f8] dark:active:bg-[#161b22]";

const shortDate = (d) => new Date(d).toLocaleDateString("vi-VN");

export default function HelpCenterCard({ userId, onOpen }) {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    (async () => {
      const since = new Date();
      since.setMonth(since.getMonth() - 6);
      const { data } = await supabase
        .from("support_tickets")
        .select("id,ticket_code,title,status,created_at")
        .eq("user_id", userId)
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false })
        .limit(5);
      if (alive) setTickets(data || []);
    })();
    return () => {
      alive = false;
    };
  }, [userId]);

  return (
    <section className={GH_CARD}>
      <button onClick={() => onOpen("home")} className="flex w-full items-center gap-3 px-5 pb-1 pt-4 text-left">
        <span className="min-w-0 flex-1">
          <span className={`block text-[17px] font-semibold leading-6 ${GH_INK}`}>Trung tâm trợ giúp</span>
          <span className={`block text-[13px] ${GH_MUTED}`}>Giúp bạn giải quyết mọi vấn đề</span>
        </span>
        <ChevronRight size={18} className={`shrink-0 ${GH_MUTED}`} />
      </button>

      <ul className="px-2 py-2">
        {ROWS.map(({ key, Icon, label, sub }) => (
          <li key={key}>
            <button onClick={() => onOpen(key)} className={ROW}>
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

      {tickets.length > 0 && (
        <>
          <div className="mx-5 border-t border-slate-100 dark:border-[#21262d]" />
          <div className="flex items-center justify-between px-5 pb-1 pt-3">
            <p className={`text-[14px] font-medium ${GH_MUTED}`}>Yêu cầu gần đây</p>
            <button
              onClick={() => onOpen("history")}
              className="text-[13.5px] font-medium text-[#0969da] dark:text-[#4493f8]"
            >
              Xem tất cả
            </button>
          </div>

          <ul className="px-2 pb-2">
            {tickets.slice(0, 3).map((t) => (
              <li key={t.id}>
                <button onClick={() => onOpen("history")} className={ROW}>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-[14.5px] font-medium leading-5 ${GH_INK}`}>{t.title}</span>
                    <span className={`block truncate text-[12.5px] leading-5 ${GH_MUTED}`}>
                      #{t.ticket_code} · {shortDate(t.created_at)}
                    </span>
                  </span>
                  <StatusDot st={statusOf(t.status)} />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
