// src/pages/help/HelpHistory.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient.js";
import { Icon } from "./HelpUI.jsx";
import { Screen, statusOf } from "./HelpScreen.jsx";
import { CATEGORIES, fmtDate } from "./helpData.js";

const SOURCES = { web: "Web", zalo: "Zalo", email: "Email", facebook: "Facebook", phone: "Tổng đài" };
const sourceOf = (s) => SOURCES[s] || s || "Web";
const groupKey = (t) => (t.type === "idea" ? "idea" : t.category || "other");
const groupLabel = (k) => (k === "idea" ? "Góp ý ý tưởng" : CATEGORIES.find((c) => c.key === k)?.label || "Khác");

function StatusPill({ st }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#eef2ff] px-2.5 py-1 text-[12px] font-semibold text-[#625df5]">
      <span className={`h-1.5 w-1.5 rounded-full ${st.dot || "bg-[#625df5]"}`} />
      {st.label}
    </span>
  );
}

function TicketCard({ t, onOpen }) {
  return (
    <button onClick={onOpen} className="w-full px-5 py-4 text-left transition hover:bg-gray-50 active:bg-gray-100">
      <div className="flex items-center justify-between gap-3 mb-1">
        <span className="font-bold text-[15px] text-[#1e1e2f]">#{t.ticket_code}</span>
        <StatusPill st={statusOf(t.status)} />
      </div>
      <p className="truncate text-[14px] text-gray-600 font-medium mb-1">{t.title}</p>
      <p className="text-[13px] text-gray-500">
        Nguồn: <span className="text-[#1e1e2f]">{sourceOf(t.source)}</span> · {fmtDate(t.created_at)}
      </p>
    </button>
  );
}

function TicketList({ items, onOpen }) {
  const [f, setF] = useState("all");
  const keys = [...new Set(items.map((t) => t.status))];
  const shown = f === "all" ? items : items.filter((t) => t.status === f);

  return (
    <div className="space-y-4">
      {/* Thanh filter cuộn ngang */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button aria-pressed={f === "all"} onClick={() => setF("all")} className="hc-chip shrink-0">Tất cả</button>
        {keys.map((k) => (
          <button key={k} aria-pressed={f === k} onClick={() => setF(k)} className="hc-chip shrink-0">
            {statusOf(k).label}
          </button>
        ))}
      </div>
      
      {/* Danh sách thẻ */}
      <div className="hc-card">
        {shown.length > 0 ? (
          shown.map((t) => <TicketCard key={t.id} t={t} onOpen={() => onOpen(t)} />)
        ) : (
          <p className="py-10 text-center text-[15px] text-gray-500">Không có yêu cầu nào.</p>
        )}
      </div>
    </div>
  );
}

export function HistoryFlow({ onClose, onNew }) {
  const [params, setParams] = useSearchParams();
  const [rows, setRows] = useState(null);
  const [tab, setTab] = useState("all");
  const gKey = params.get("g");
  const tId = params.get("t");

  const change = (updates) => {
    const next = new URLSearchParams(params);
    Object.entries(updates).forEach(([k, v]) => (v === null ? next.delete(k) : next.set(k, v)));
    setParams(next, { replace: true });
  };
  
  const pop = () => {
    if (tId) change({ t: null });
    else if (gKey) change({ g: null });
    else onClose();
  };
  const openTicket = (t) => change({ t: String(t.id) });

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

  const ticket = tId && rows ? rows.find((r) => String(r.id) === tId) : null;

  useEffect(() => {
    if (rows && tId && !ticket) change({ t: null });
  }, [rows]); // eslint-disable-line

  // Nếu đang xem chi tiết ticket
  if (tId && ticket) return <Screen title="Chi tiết yêu cầu" big={false} onClose={pop}>
      {/* Nội dung ChatScreen ở đây, hiện tại đang giả lập */}
      <div className="hc-card p-5 text-center">Chi tiết Ticket: {ticket.ticket_code}</div>
  </Screen>;

  if (tId && rows === null) {
    return (
      <Screen title="Chi tiết yêu cầu" big={false} onClose={pop}>
        <div className="hc-card h-40 animate-pulse bg-gray-100" />
      </Screen>
    );
  }

  const g = gKey ? groups.find((x) => x.key === gKey) : null;
  if (gKey && g) {
    return (
      <Screen title={g.label} big={false} onClose={pop}>
        <TicketList items={g.items} onOpen={openTicket} />
      </Screen>
    );
  }

  return (
    <Screen title="Lịch sử yêu cầu" onClose={onClose}>
      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-xl bg-gray-100 p-1">
        <button onClick={() => setTab("all")} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${tab === "all" ? "bg-white text-[#1e1e2f] shadow-sm" : "text-gray-500"}`}>Tất cả</button>
        <button onClick={() => setTab("group")} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${tab === "group" ? "bg-white text-[#1e1e2f] shadow-sm" : "text-gray-500"}`}>Theo nhóm</button>
      </div>

      {rows === null && (
        <div className="space-y-4">
          <div className="hc-card h-28 animate-pulse bg-gray-100" />
          <div className="hc-card h-28 animate-pulse bg-gray-100" />
        </div>
      )}

      {rows && rows.length === 0 && (
        <div className="hc-card px-6 py-12 text-center">
          <p className="text-[18px] font-bold text-[#1e1e2f] mb-4">Bạn chưa gửi yêu cầu nào</p>
          <button onClick={onNew} className="hc-btn-solid h-11 px-6 text-[15px]">Gửi yêu cầu đầu tiên</button>
        </div>
      )}

      {rows && rows.length > 0 && tab === "all" && (
        <TicketList items={rows} onOpen={openTicket} />
      )}

      {rows && rows.length > 0 && tab === "group" && (
        <div className="space-y-4">
          {groups.map((x) => (
            <div key={x.key} className="hc-card p-4">
               <button onClick={() => change({ g: x.key })} className="flex w-full items-center justify-between text-left mb-3">
                  <span className="font-bold text-[16px] text-[#1e1e2f]">{x.label}</span>
                  <span className="text-sm text-[#625df5] font-medium">{x.items.length} yêu cầu <Icon name="chevR" size={14} className="inline ml-1"/></span>
               </button>
               <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {x.items.map(t => (
                     <button key={t.id} onClick={() => openTicket(t)} className="min-w-[200px] shrink-0 rounded-xl bg-gray-50 border border-gray-100 p-3 text-left">
                        <div className="font-bold text-sm text-[#1e1e2f] mb-1">#{t.ticket_code}</div>
                        <div className="text-xs text-gray-500 mb-2">{fmtDate(t.created_at)}</div>
                        <div className="text-sm text-gray-700 truncate">{t.title}</div>
                     </button>
                  ))}
               </div>
            </div>
          ))}
        </div>
      )}
    </Screen>
  );
            }
