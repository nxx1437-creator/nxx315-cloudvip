// src/components/profile/HelpCenterCard.jsx — Trung tâm trợ giúp + yêu cầu gần đây
import React, { useEffect, useState } from "react";
import { ChevronRight, HelpCircle, Lightbulb, MessageCircle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import { StatusDot } from "../../pages/help/HelpUI.jsx";
import { statusOf } from "../../pages/help/HelpScreen.jsx";
import { fmtDate } from "../../pages/help/helpData.js";

// open = gợi ý màn hình cần mở trong /help (trang Help đọc location.state.open nếu muốn)
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
    <section className="rounded-2xl bg-white p-4 dark:bg-slate-900">
      <button
        onClick={() => onOpen("home")}
        className="flex w-full items-center gap-3 px-1 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[20px] font-bold leading-tight text-slate-900 dark:text-white">
            Trung tâm trợ giúp
          </span>
          <span className="mt-0.5 block text-[13px] text-slate-500">
            Giúp bạn giải quyết mọi vấn đề
          </span>
        </span>
        <ChevronRight size={20} className="shrink-0 text-slate-400" />
      </button>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => onOpen("chat")}
          className="row-span-2 flex flex-col justify-between rounded-2xl bg-[#eaf1ff] p-4 text-left transition active:scale-[0.98] dark:bg-sky-500/10"
        >
          <span>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#2b59e0] dark:bg-slate-800">
              <MessageCircle size={22} />
            </span>
            <span className="mt-3 block text-[16px] font-bold leading-5 text-slate-900 dark:text-white">
              Hỗ trợ trực tuyến
            </span>
            <span className="mt-0.5 block text-[13px] text-slate-500">
              Giải đáp 24/7
            </span>
          </span>
          <span className="mt-4 block text-[14px] font-semibold text-[#2b59e0] dark:text-sky-400">
            Chat với trợ lý AI
          </span>
        </button>

        <button
          onClick={() => onOpen("faq")}
          className="flex items-center gap-2.5 rounded-2xl border border-slate-200 px-3 py-3.5 text-left transition active:scale-[0.98] dark:border-slate-700"
        >
          <HelpCircle size={19} className="shrink-0 text-[#2b59e0] dark:text-sky-400" />
          <span className="text-[14px] font-semibold leading-5 text-slate-800 dark:text-slate-100">
            Vấn đề thường gặp
          </span>
        </button>

        <button
          onClick={() => onOpen("idea")}
          className="flex items-center gap-2.5 rounded-2xl border border-slate-200 px-3 py-3.5 text-left transition active:scale-[0.98] dark:border-slate-700"
        >
          <Lightbulb size={19} className="shrink-0 text-[#2b59e0] dark:text-sky-400" />
          <span className="text-[14px] font-semibold leading-5 text-slate-800 dark:text-slate-100">
            Đề xuất ý tưởng
          </span>
        </button>
      </div>

      {tickets.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between px-1">
            <p className="text-[16px] font-bold text-slate-900 dark:text-white">
              Yêu cầu gần đây
            </p>
            <button
              onClick={() => onOpen("history")}
              className="text-[14px] font-semibold text-[#2b59e0] dark:text-sky-400"
            >
              Xem tất cả
            </button>
          </div>

          <div className="-mx-4 mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
            {tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => onOpen("history")}
                className="min-w-[78%] snap-start rounded-[22px] bg-[#eef2f9] p-4 text-left dark:bg-slate-800"
              >
                <span className="block text-[18px] font-semibold tracking-[-0.3px] text-slate-900 dark:text-white">
                  #{t.ticket_code}
                </span>
                <span className="mt-0.5 block text-[13px] text-slate-500">
                  {fmtDate(t.created_at)}
                </span>
                <span className="mt-4 flex items-center justify-between gap-3">
                  <span className="min-w-0 flex-1 truncate text-[15px] text-slate-600 dark:text-slate-300">
                    {t.title}
                  </span>
                  <StatusDot st={statusOf(t.status)} />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
