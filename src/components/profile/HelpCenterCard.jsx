// src/components/profile/HelpCenterCard.jsx — Trung tâm trợ giúp (danh sách phẳng kiểu GitHub) + yêu cầu gần đây
import React, { useEffect, useState } from "react";
import { BookOpen, ChevronRight, Lightbulb, MessageCircle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import { StatusDot } from "../../pages/help/HelpUI.jsx";
import { statusOf } from "../../pages/help/HelpScreen.jsx";
import { fmtDate } from "../../pages/help/helpData.js";
import { GH_INK, GH_LINE, GH_MUTED } from "./GhProfile.jsx";

// onOpen(key): "home" | "chat" | "topics" | "idea" | "history"
const ROWS = [
  { key: "chat", Icon: MessageCircle, label: "Hỗ trợ trực tuyến", sub: "Chat với trợ lý AI, giải đáp 24/7" },
  { key: "topics", Icon: BookOpen, label: "Chủ đề trợ giúp", sub: "Xem hướng dẫn theo từng chủ đề" },
  { key: "idea", Icon: Lightbulb, label: "Đề xuất ý tưởng", sub: "Gửi yêu cầu hỗ trợ hoặc góp ý cho NXX" },
];

const PRESS = "transition active:bg-[#f6f8fa] dark:active:bg-[#161b22]";
const BAR = `bg-[#f6f8fa] dark:bg-[#161b22] ${GH_LINE}`;

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
    <section className={`overflow-hidden rounded-lg border bg-white dark:bg-[#0d1117] ${GH_LINE}`}>
      <button
        onClick={() => onOpen("home")}
        className={`flex w-full items-center gap-3 border-b px-4 py-3 text-left ${BAR}`}
      >
        <span className="min-w-0 flex-1">
          <span className={`block text-[15px] font-semibold leading-5 ${GH_INK}`}>Trung tâm trợ giúp</span>
          <span className={`block text-[12.5px] ${GH_MUTED}`}>Giúp bạn giải quyết mọi vấn đề</span>
        </span>
        <ChevronRight size={18} className={`shrink-0 ${GH_MUTED}`} />
      </button>

      <ul>
        {ROWS.map(({ key, Icon, label, sub }) => (
          <li key={key} className={`border-b last:border-b-0 ${GH_LINE}`}>
            <button onClick={() => onOpen(key)} className={`flex w-full items-center gap-3 px-4 py-3 text-left ${PRESS}`}>
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

      {tickets.length > 0 && (
        <>
          <div className={`flex items-center justify-between border-y px-4 py-2 ${BAR}`}>
            <p className={`text-[13px] font-semibold ${GH_INK}`}>Yêu cầu gần đây</p>
            <button
              onClick={() => onOpen("history")}
              className="text-[13px] font-semibold text-[#0969da] dark:text-[#4493f8]"
            >
              Xem tất cả
            </button>
          </div>

          <ul>
            {tickets.slice(0, 3).map((t) => (
              <li key={t.id} className={`border-b last:border-b-0 ${GH_LINE}`}>
                <button onClick={() => onOpen("history")} className={`flex w-full items-center gap-3 px-4 py-3 text-left ${PRESS}`}>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-[14px] font-semibold leading-5 ${GH_INK}`}>{t.title}</span>
                    <span className={`block text-[12.5px] leading-5 ${GH_MUTED}`}>
                      #{t.ticket_code} · {fmtDate(t.created_at)}
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
