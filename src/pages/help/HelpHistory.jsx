// src/pages/help/HelpHistory.jsx — lịch sử yêu cầu: danh sách phẳng + tab theo nhóm (kiểu MoMo)
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient.js";
import { Icon } from "./HelpUI.jsx";
import { Screen, statusOf } from "./HelpScreen.jsx";
import { ChatScreen } from "./HelpTicket.jsx";
import { CATEGORIES, fmtDate } from "./helpData.js";

const SOURCES = { web: "Web", zalo: "Zalo", email: "Email", facebook: "Facebook", phone: "Tổng đài" };
const sourceOf = (s) => SOURCES[s] || s || "Web";

const groupKey = (t) => (t.type === "idea" ? "idea" : t.category || "other");
const groupLabel = (k) => (k === "idea" ? "Góp ý ý tưởng" : CATEGORIES.find((c) => c.key === k)?.label || "Khác");

function StatusPill({ st }) {
  return (
    <span className="hc-spill">
      <span className={`h-2 w-2 rounded-full ${st.dot || "bg-slate-400"}`} />
      {st.label}
    </span>
  );
}

function StatusText({ st }) {
  return (
    <span className="hc-text2 inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[13px]">
      <span className={`h-2 w-2 rounded-full ${st.dot || "bg-slate-400"}`} />
      {st.label}
    </span>
  );
}

function TicketCard({ t, onOpen }) {
  return (
    <button onClick={onOpen} className="hc-card block w-full px-4 py-4 text-left transition active:scale-[0.99]">
      <div className="flex items-start justify-between gap-3">
        <span className="hc-text hc-mono min-w-0 truncate text-[16px] font-bold">#{t.ticket_code}</span>
        <StatusPill st={statusOf(t.status)} />
      </div>
      <p className="hc-text2 mt-2 truncate text-[15px]">{t.title}</p>
      <p className="hc-muted mt-1 text-[14px]">Nguồn tiếp nhận: <span className="hc-text2">{sourceOf(t.source)}</span></p>
      <p className="hc-muted mt-0.5 text-[14px]">{fmtDate(t.created_at)}</p>
    </button>
  );
}

function TicketList({ items, onOpen }) {
  const [f, setF] = useState("all");
  const keys = [...new Set(items.map((t) => t.status))];
  const shown = f === "all" ? items : items.filter((t) => t.status === f);
  const chip = "hc-chip shrink-0 rounded-full px-4 py-2 text-[14px] font-medium transition active:scale-95";
  return (
    <>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        <button aria-pressed={f === "all"} onClick={() => setF("all")} className={chip}>Tất cả</button>
        {keys.map((k) => (
          <button key={k} aria-pressed={f === k} onClick={() => setF(k)} className={chip}>{statusOf(k).label}</button>
        ))}
      </div>
      {shown.map((t) => <TicketCard key={t.id} t={t} onOpen={() => onOpen(t)} />)}
      {shown.length === 0 && <p className="hc-muted py-10 text-center text-[15px]">Không có yêu cầu nào.</p>}
    </>
  );
}

function GroupCard({ label, items, onOpenGroup, onOpenTicket }) {
  return (
    <section className="hc-card pb-4 pt-4">
      <button onClick={onOpenGroup} className="flex w-full items-center gap-3 px-4 text-left">
        <span className="hc-iconbox"><Icon name="folder" size={20} /></span>
        <span className="min-w-0 flex-1">
          <span className="hc-text block truncate text-[16px] font-semibold tracking-[-0.01em]">{label}</span>
          <span className="hc-muted block text-[13px]">{items.length} yêu cầu</span>
        </span>
        <Icon name="chevR" size={18} className="hc-muted shrink-0" />
      </button>
      <div className="mt-3 flex snap-x gap-3 overflow-x-auto px-4 [scrollbar-width:none]">
        {items.map((t) => (
          <button key={t.id} onClick={() => onOpenTicket(t)} className="hc-mini min-w-[84%] snap-start text-left">
            <span className="flex items-center justify-between gap-3">
              <span className="hc-text hc-mono min-w-0 truncate text-[15px] font-bold">#{t.ticket_code}</span>
              <StatusText st={statusOf(t.status)} />
            </span>
            <span className="hc-muted mt-1 block text-[13px]">{fmtDate(t.created_at)}</span>
            <span className="hc-rule my-3 block border-t-[0.5px]" />
            <span className="hc-text2 block truncate text-[14px]">{t.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function HistoryFlow({ onClose, onNew }) {
  const [params, setParams] = useSearchParams();
  const [rows, setRows] = useState(null);
  const [tab, setTab] = useState("all");
  const gKey = params.get("g");
  const tId = params.get("t");

  // màn nhóm (g) và phiếu đang xem (t) nằm trên đường dẫn để tải lại trang vẫn ở đúng chỗ
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

  // phiếu không còn (quá 6 tháng hoặc đường dẫn cũ) thì bỏ tham số
  useEffect(() => {
    if (rows && tId && !ticket) change({ t: null });
  }, [rows]); // eslint-disable-line react-hooks/exhaustive-deps

  if (tId && ticket) return <ChatScreen ticket={ticket} onClose={pop} />;

  if (tId && rows === null) {
    return (
      <Screen title="Chi tiết yêu cầu" big={false} onClose={pop}>
        <div className="hc-card hc-skel h-40 animate-pulse" />
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
      <div className="hc-seg" role="tablist">
        <button role="tab" aria-selected={tab === "all"} onClick={() => setTab("all")}>Tất cả</button>
        <button role="tab" aria-selected={tab === "group"} onClick={() => setTab("group")}>Theo nhóm</button>
      </div>

      {rows === null && [0, 1].map((i) => <div key={i} className="hc-card hc-skel h-28 animate-pulse" />)}

      {rows && rows.length === 0 && (
        <div className="hc-card px-6 py-12 text-center">
          <p className="hc-text text-[20px] font-medium tracking-[-0.02em]">Bạn chưa gửi yêu cầu nào</p>
          <button onClick={onNew} className="hc-btn-solid mt-5 h-12 px-6 text-[16px]">Gửi yêu cầu đầu tiên</button>
        </div>
      )}

      {rows && rows.length > 0 && tab === "all" && <TicketList items={rows} onOpen={openTicket} />}

      {rows && rows.length > 0 && tab === "group" &&
        groups.map((x) => (
          <GroupCard key={x.key} label={x.label} items={x.items}
            onOpenGroup={() => change({ g: x.key })} onOpenTicket={openTicket} />
        ))}

      {rows && rows.length > 0 && (
        <div className="hc-info">
          <Icon name="info" size={20} className="hc-accent mt-0.5 shrink-0" />
          <p>Các yêu cầu hỗ trợ sau 6 tháng sẽ được tự động ẩn để bạn dễ dàng quản lý hơn.</p>
        </div>
      )}
    </Screen>
  );
    }
