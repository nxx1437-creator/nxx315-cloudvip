// src/pages/help/HelpHistory.jsx — lịch sử yêu cầu (nhóm → danh sách)
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient.js";
import { Icon, StatusDot } from "./HelpUI.jsx";
import { Screen, statusOf, sourceOf } from "./HelpScreen.jsx";
import { ChatScreen } from "./HelpTicket.jsx";
import { CATEGORIES, fmtDate } from "./helpData.js";

const groupKey = (t) => (t.type === "idea" ? "idea" : t.category || "other");
const groupLabel = (k) => (k === "idea" ? "Góp ý ý tưởng" : CATEGORIES.find((c) => c.key === k)?.label || "Khác");

function GroupCard({ label, items, onOpenGroup, onOpenTicket }) {
  return (
    <section className="rounded-xl bg-[#ffffff] pb-5 pt-6">
      <button onClick={onOpenGroup} className="flex w-full items-start gap-3 px-6 text-left">
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] text-[#6b7488]">{label}</span>
          <span className="mt-1 block truncate text-[22px] font-semibold leading-tight tracking-[-0.5px] text-[#16213e]">{items[0].title}</span>
          <span className="mt-1.5 block text-[14px] text-[#6b7488]">{items.length} yêu cầu</span>
        </span>
        <Icon name="chevR" size={19} className="mt-2 shrink-0 text-[#6b7488]" />
      </button>
      <div className="mt-4 flex snap-x gap-3 overflow-x-auto px-6 [scrollbar-width:none]">
        {items.map((t) => (
          <button key={t.id} onClick={() => onOpenTicket(t)}
            className="min-w-[76%] snap-start rounded-[22px] bg-[#eef2f9] p-4 text-left">
            <span className="block text-[18px] font-semibold tracking-[-0.3px] text-[#16213e]">#{t.ticket_code}</span>
            <span className="mt-0.5 block text-[13px] text-[#6b7488]">{fmtDate(t.created_at)}</span>
            <span className="block text-[13px] text-[#6b7488]">Nguồn tiếp nhận: {sourceOf(t.source)}</span>
            <span className="mt-4 flex items-center justify-between gap-3">
              <span className="min-w-0 flex-1 truncate text-[15px] text-[#4a5368]">{t.title}</span>
              <StatusDot st={statusOf(t.status)} />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function HistoryFlow({ onClose, onNew }) {
  const [rows, setRows] = useState(null);
  const [stack, setStack] = useState([{ s: "list" }]);
  const top = stack[stack.length - 1];
  const push = (x) => setStack((cur) => [...cur, x]);
  const pop = () => (stack.length > 1 ? setStack((cur) => cur.slice(0, -1)) : onClose());

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      const uid = s?.session?.user?.id;
      if (!uid) return setRows([]);
      const since = new Date();
      since.setMonth(since.getMonth() - 6);
      const { data } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", uid)
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false })
        .limit(100);
      setRows(data || []);
    })();
  }, []);

  const groups = useMemo(() => {
    const map = new Map();
    (rows || []).forEach((t) => {
      const k = groupKey(t);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(t);
    });
    return [...map.entries()].map(([key, items]) => ({ key, label: groupLabel(key), items }));
  }, [rows]);

  if (top.s === "chat") return <ChatScreen ticket={top.ticket} onClose={pop} />;

  if (top.s === "group") {
    const g = groups.find((x) => x.key === top.key);
    return (
      <Screen title={g?.label || "Yêu cầu"} onClose={pop}>
        <div className="divide-y divide-[#16213e]/10 overflow-hidden rounded-xl bg-[#ffffff]">
          {(g?.items || []).map((t) => (
            <button key={t.id} onClick={() => push({ s: "chat", ticket: t })} className="flex w-full items-center gap-3 px-6 py-5 text-left transition active:bg-[#eef2f9]">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[18px] font-semibold tracking-[-0.3px] text-[#16213e]">{t.title}</span>
                <span className="mt-1 block text-[14px] text-[#6b7488]">#{t.ticket_code} · {fmtDate(t.created_at)}</span>
                <span className="mt-0.5 block text-[14px] text-[#6b7488]">Nguồn tiếp nhận: {sourceOf(t.source)}</span>
                <span className="mt-2 block"><StatusDot st={statusOf(t.status)} /></span>
              </span>
              <Icon name="chevR" size={17} className="shrink-0 text-[#6b7488]" />
            </button>
          ))}
        </div>
      </Screen>
    );
  }

  return (
    <Screen title="Lịch sử yêu cầu" onClose={onClose}>
      {rows === null && [0, 1].map((i) => <div key={i} className="h-44 animate-pulse rounded-xl bg-[#ffffff]" />)}
      {rows && rows.length === 0 && (
        <div className="rounded-xl bg-[#ffffff] px-6 py-12 text-center">
          <p className="text-[20px] font-semibold tracking-[-0.4px] text-[#16213e]">Bạn chưa gửi yêu cầu nào</p>
          <button onClick={onNew} className="mt-5 rounded-xl bg-[#2b59e0] px-6 py-3 text-[16px] font-semibold text-white">Gửi yêu cầu đầu tiên</button>
        </div>
      )}
      {groups.map((g) => (
        <GroupCard key={g.key} label={g.label} items={g.items}
          onOpenGroup={() => push({ s: "group", key: g.key })} onOpenTicket={(t) => push({ s: "chat", ticket: t })} />
      ))}
      {rows && rows.length > 0 && <p className="px-2 text-[14px] leading-5 text-[#6b7488]">Yêu cầu sau 6 tháng sẽ được tự động ẩn để bạn dễ quản lý hơn.</p>}
    </Screen>
  );
            }
