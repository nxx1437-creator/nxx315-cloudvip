// src/pages/StaffSupport.jsx — hộp thư hỗ trợ cho nhân viên (route gợi ý: /staff/support)
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import { Icon, StatusDot, ring } from "./help/HelpUI.jsx";
import { Screen, Lightbox } from "./help/HelpRequest.jsx";
import { CATEGORIES, TICKET_STATUS, ATTACH_BUCKET, CSKH_NAME, fmtDate } from "./help/helpData.js";

const statusOf = (s) => TICKET_STATUS[s] || { label: s, dot: "bg-slate-400" };
const catLabel = (t) => (t.type === "idea" ? "Góp ý" : CATEGORIES.find((c) => c.key === t.category)?.label || "Khác");
const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "open", label: "Mới" },
  { key: "in_progress", label: "Đang xử lý" },
  { key: "done", label: "Đã xong" },
];
const inTab = (t, tab) =>
  tab === "all" || (tab === "done" ? t.status === "resolved" || t.status === "closed" : t.status === tab);

/* ---------- Bong bóng: khách bên trái, nhân viên bên phải ---------- */
function Bubble({ staff, label, time, children }) {
  return (
    <div className={`flex flex-col ${staff ? "items-end" : "items-start"}`}>
      <span className="mb-1.5 text-[13px] text-[#6a6b6f]">
        <span className="font-semibold text-[#20282b]">{label}</span>{time ? `  ${time}` : ""}
      </span>
      <div className={`max-w-[88%] space-y-2 whitespace-pre-line break-words rounded-[22px] px-4 py-3 text-[16px] leading-6 text-[#20282b] ${staff ? "rounded-br-md bg-[#a1e5e4]" : "rounded-bl-md bg-[#e9ecee]"}`}>
        {children}
      </div>
    </div>
  );
}

/* ---------- Chi tiết + chat ---------- */
function StaffChat({ ticket, onBack, onStatus }) {
  const [msgs, setMsgs] = useState([]);
  const [urls, setUrls] = useState({});
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [view, setView] = useState(null);
  const endRef = useRef(null);
  const who = `Khách #${String(ticket.user_id || "").slice(0, 6)}`;

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.from("support_ticket_messages").select("id,sender,body,images,created_at").eq("ticket_id", String(ticket.id)).order("created_at", { ascending: true });
      if (alive) setMsgs(data || []);
    })();
    const ch = supabase
      .channel(`staff-ticket-${ticket.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_ticket_messages", filter: `ticket_id=eq.${ticket.id}` },
        (p) => setMsgs((cur) => (cur.some((m) => m.id === p.new.id) ? cur : [...cur, p.new])))
      .subscribe();
    return () => { alive = false; supabase.removeChannel(ch); };
  }, [ticket.id]);

  useEffect(() => {
    const all = [...(ticket.images || []), ...msgs.flatMap((m) => m.images || [])];
    const need = [...new Set(all)].filter((p) => !urls[p]);
    if (!need.length) return;
    let alive = true;
    (async () => {
      const { data } = await supabase.storage.from(ATTACH_BUCKET).createSignedUrls(need, 3600);
      if (!alive || !data) return;
      setUrls((cur) => {
        const next = { ...cur };
        data.forEach((d) => { if (d.path && d.signedUrl) next[d.path] = d.signedUrl; });
        return next;
      });
    })();
    return () => { alive = false; };
  }, [msgs, ticket.images]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [msgs.length]);

  const thumbs = (paths) =>
    paths?.length ? (
      <span className="mt-1 flex flex-wrap gap-2">
        {paths.map((p) =>
          urls[p] ? (
            <button key={p} type="button" onClick={() => setView(urls[p])} className="block">
              <img src={urls[p]} alt="Ảnh đính kèm" className={paths.length === 1 ? "max-h-64 w-auto max-w-full rounded-2xl" : "h-28 w-28 rounded-2xl object-cover"} />
            </button>
          ) : (
            <span key={p} className="h-28 w-28 animate-pulse rounded-2xl bg-black/5" />
          )
        )}
      </span>
    ) : null;

  const setStatus = async (status) => {
    setErr("");
    const { error } = await supabase.from("support_tickets").update({ status }).eq("id", ticket.id);
    if (error) return setErr("Chưa đổi được trạng thái.");
    onStatus(ticket.id, status);
  };

  const send = async () => {
    const body = text.trim();
    if (!body || busy) return;
    setErr("");
    setBusy(true);
    const { data: s } = await supabase.auth.getSession();
    const uid = s?.session?.user?.id;
    const { data, error } = await supabase.from("support_ticket_messages")
      .insert({ ticket_id: String(ticket.id), user_id: uid, sender: "staff", body })
      .select("id,sender,body,images,created_at").single();
    setBusy(false);
    if (error) return setErr("Chưa gửi được. Tài khoản này đã được thêm vào support_staff chưa?");
    setText("");
    setMsgs((cur) => (cur.some((m) => m.id === data.id) ? cur : [...cur, data]));
    if (ticket.status === "open") setStatus("in_progress");
  };

  const st = statusOf(ticket.status);
  const sbtn = "rounded-full bg-[#e9ecee] px-4 py-2 text-[14px] font-medium text-[#20282b] transition active:bg-[#20282b]/10";
  return (
    <>
      <Screen
        title={`#${ticket.ticket_code}`}
        big={false}
        onClose={onBack}
        footer={
          <>
            {err && <p className="mb-2 rounded-2xl bg-rose-50 px-4 py-2 text-[13px] font-medium text-rose-600">{err}</p>}
            <div className="flex items-end gap-2">
              <textarea value={text} rows={1} maxLength={1000} onChange={(e) => setText(e.target.value)} placeholder={`Trả lời với tên ${CSKH_NAME}...`}
                className="max-h-28 min-h-[44px] flex-1 resize-none rounded-[22px] bg-[#e9ecee] px-4 py-2.5 text-[16px] text-[#20282b] outline-none placeholder:text-[#6a6b6f] focus:ring-1 focus:ring-[#20282b]" />
              <button onClick={send} disabled={!text.trim() || busy} aria-label="Gửi"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#20282b] text-white transition active:scale-95 disabled:bg-[#20282b]/10 disabled:text-[#20282b]/35">
                <Icon name="send" size={18} />
              </button>
            </div>
          </>
        }
      >
        <section className="rounded-[30px] bg-[#fafbfb] p-6">
          <p className="text-[14px] text-[#6a6b6f]">{catLabel(ticket)} · {fmtDate(ticket.created_at)} · {who}</p>
          <h2 className="mt-1 text-[22px] font-semibold leading-tight tracking-[-0.5px] text-[#20282b]">{ticket.title}</h2>
          <div className="mt-3"><StatusDot st={st} /></div>
          <div className="mt-4 flex flex-wrap gap-2">
            {ticket.status !== "in_progress" && <button onClick={() => setStatus("in_progress")} className={sbtn}>Đang xử lý</button>}
            {ticket.status !== "resolved" && <button onClick={() => setStatus("resolved")} className={sbtn}>Đã giải quyết</button>}
            {ticket.status !== "open" && <button onClick={() => setStatus("open")} className={sbtn}>Mở lại</button>}
          </div>
        </section>

        <section className="rounded-[30px] bg-[#fafbfb] p-6">
          <div className="space-y-6">
            <Bubble label={who} time={fmtDate(ticket.created_at)}>
              {ticket.description}
              {thumbs(ticket.images)}
            </Bubble>
            {ticket.admin_reply && <Bubble staff label={CSKH_NAME}>{ticket.admin_reply}</Bubble>}
            {msgs.map((m) => (
              <Bubble key={m.id} staff={m.sender === "staff"} label={m.sender === "staff" ? CSKH_NAME : who} time={fmtDate(m.created_at)}>
                {m.body}
                {thumbs(m.images)}
              </Bubble>
            ))}
            <div ref={endRef} />
          </div>
        </section>
      </Screen>
      {view && <Lightbox url={view} onClose={() => setView(null)} />}
    </>
  );
}

/* ---------- Trang chính: danh sách yêu cầu ---------- */
export default function StaffSupport() {
  const navigate = useNavigate();
  const [ok, setOk] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [selId, setSelId] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("support_tickets")
      .select("id,ticket_code,title,category,type,status,description,images,admin_reply,user_id,created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    setTickets(data || []);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      const uid = s?.session?.user?.id;
      if (!uid) return setOk(false);
      const { data } = await supabase.from("support_staff").select("user_id").eq("user_id", uid).maybeSingle();
      if (!data) return setOk(false);
      setOk(true);
      load();
    })();
  }, []);

  const list = useMemo(() => tickets.filter((t) => inTab(t, tab)), [tickets, tab]);
  const sel = tickets.find((t) => t.id === selId);
  const count = (k) => tickets.filter((t) => inTab(t, k)).length;

  if (ok === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e9ecee] px-6">
        <div className="max-w-sm rounded-[30px] bg-[#fafbfb] p-8 text-center">
          <p className="text-[20px] font-semibold tracking-[-0.4px] text-[#20282b]">Chưa có quyền truy cập</p>
          <p className="mt-2 text-[15px] leading-6 text-[#6a6b6f]">Tài khoản này chưa được thêm vào danh sách nhân viên hỗ trợ.</p>
          <button onClick={() => navigate("/")} className="mt-6 rounded-full bg-[#20282b] px-6 py-3 text-[16px] font-semibold text-white">Về trang chủ</button>
        </div>
      </div>
    );
  }
  if (sel) {
    return (
      <StaffChat ticket={sel} onBack={() => setSelId(null)}
        onStatus={(id, status) => setTickets((cur) => cur.map((t) => (t.id === id ? { ...t, status } : t)))} />
    );
  }

  return (
    <div className="min-h-screen bg-[#e9ecee] pb-10">
      <div className="mx-auto max-w-md px-4 pt-3 md:max-w-2xl">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} aria-label="Quay lại" className={`flex h-11 w-11 items-center justify-center rounded-full bg-[#fafbfb] text-[#20282b] ${ring}`}>
            <Icon name="back" size={20} />
          </button>
          <span className="flex-1" />
          <button onClick={load} aria-label="Tải lại" className={`flex h-11 w-11 items-center justify-center rounded-full bg-[#fafbfb] text-[#20282b] ${ring}`}>
            <Icon name="history" size={19} />
          </button>
        </div>
        <h1 className="mt-5 text-[34px] font-semibold leading-[1.05] tracking-[-1px] text-[#20282b]">Hộp thư hỗ trợ</h1>

        <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-[15px] font-medium transition ${tab === t.key ? "bg-[#20282b] text-white" : "bg-[#fafbfb] text-[#20282b]"}`}>
              {t.label} <span className={tab === t.key ? "text-white/70" : "text-[#6a6b6f]"}>{count(t.key)}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 divide-y divide-[#20282b]/10 overflow-hidden rounded-[30px] bg-[#fafbfb]">
          {loading && <div className="h-24 animate-pulse" />}
          {!loading && list.length === 0 && <p className="px-6 py-10 text-center text-[15px] text-[#6a6b6f]">Không có yêu cầu nào.</p>}
          {list.map((t) => (
            <button key={t.id} onClick={() => setSelId(t.id)} className="flex w-full items-center gap-3 px-6 py-5 text-left transition active:bg-[#e9ecee]">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[17px] font-semibold tracking-[-0.3px] text-[#20282b]">{t.title}</span>
                <span className="mt-1 block text-[14px] text-[#6a6b6f]">#{t.ticket_code} · {catLabel(t)} · {fmtDate(t.created_at)}</span>
                <span className="mt-2 block"><StatusDot st={statusOf(t.status)} /></span>
              </span>
              <Icon name="chevR" size={17} className="shrink-0 text-[#6a6b6f]" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
