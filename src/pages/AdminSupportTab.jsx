// src/pages/AdminSupportTab.jsx — tab "Hỗ trợ" của trang Admin: hộp thư + chat trả lời khách
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, RefreshCw, Send, ArrowLeft, X, Zap, MessageCircle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const BUCKET = "support-attachments";

// Câu trả lời mẫu: bấm một cái là điền vào ô soạn. Sửa/thêm tuỳ ý.
const QUICK_REPLIES = [
  "Cảm ơn bạn đã liên hệ NXX315. Mình đã nhận được yêu cầu và đang kiểm tra, sẽ phản hồi bạn sớm nhất có thể.",
  "Bạn vui lòng gửi thêm ảnh chụp màn hình và tên Roblox để mình kiểm tra nhanh hơn nhé.",
  "Đơn của bạn đang được xử lý, bạn vui lòng chờ thêm ít phút nhé.",
  "Vấn đề đã được xử lý xong. Nếu còn cần hỗ trợ, bạn cứ nhắn tiếp tại đây nhé!",
];

const STATUS = {
  open: { label: "Mới", dot: "bg-amber-500" },
  in_progress: { label: "Đang xử lý", dot: "bg-sky-500" },
  answered: { label: "Đã phản hồi", dot: "bg-emerald-500" },
  resolved: { label: "Đã xong", dot: "bg-slate-400" },
  closed: { label: "Đã xong", dot: "bg-slate-400" },
};
const statusOf = (s) => STATUS[s] || { label: s || "—", dot: "bg-slate-400" };
const isDone = (t) => t.status === "resolved" || t.status === "closed";

const CATS = { order: "Đơn hàng", payment: "Thanh toán", account: "Tài khoản", bug: "Báo lỗi", other: "Khác" };
const catLabel = (t) => (t.type === "idea" ? "Góp ý" : CATS[t.category] || "Khác");
const titleOf = (t) => t.title || t.subject || (t.message || t.content || "Yêu cầu hỗ trợ").slice(0, 60);
const bodyOf = (t) => t.description || t.message || t.content || t.subject || "";
const codeOf = (t) => t.ticket_code || String(t.id).slice(0, 8);

const fmtFull = (iso) =>
  iso ? new Date(iso).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }) : "";
function fmtShort(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString()
    ? d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

function Dot({ status }) {
  const st = statusOf(status);
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-slate-600">
      <span className={`h-2 w-2 rounded-full ${st.dot}`} />
      {st.label}
    </span>
  );
}

/* ================= CHAT MỘT YÊU CẦU ================= */
function AdminChat({ ticket, user, onBack, onStatus, onSent }) {
  const [msgs, setMsgs] = useState([]);
  const [urls, setUrls] = useState({});
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [view, setView] = useState(null);
  const [quick, setQuick] = useState(false);
  const endRef = useRef(null);
  const who = user?.username || user?.email || `Khách #${String(ticket.user_id || "").slice(0, 6)}`;

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.from("support_ticket_messages").select("id,sender,body,images,created_at").eq("ticket_id", String(ticket.id)).order("created_at", { ascending: true });
      if (alive) setMsgs(data || []);
    })();
    const ch = supabase
      .channel(`admin-ticket-${ticket.id}`)
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
      const { data } = await supabase.storage.from(BUCKET).createSignedUrls(need, 3600);
      if (!alive || !data) return;
      setUrls((cur) => {
        const next = { ...cur };
        data.forEach((d) => { if (d.path && d.signedUrl) next[d.path] = d.signedUrl; });
        return next;
      });
    })();
    return () => { alive = false; };
  }, [msgs, ticket.images]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [msgs.length, ticket.id]);

  const changeStatus = async (status) => {
    setErr("");
    const { error } = await supabase.from("support_tickets").update({ status, updated_at: new Date().toISOString() }).eq("id", ticket.id);
    if (error) return setErr("Chưa đổi được trạng thái: " + error.message);
    onStatus(ticket.id, status);
  };

  const send = async () => {
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    setErr("");
    const { data: s } = await supabase.auth.getSession();
    const uid = s?.session?.user?.id;
    const { data, error } = await supabase.from("support_ticket_messages")
      .insert({ ticket_id: String(ticket.id), user_id: uid, sender: "staff", body })
      .select("id,sender,body,images,created_at").single();
    if (error) {
      setBusy(false);
      return setErr("Chưa gửi được. Tài khoản của bạn đã nằm trong bảng support_staff chưa? (" + error.message + ")");
    }
    setMsgs((cur) => (cur.some((m) => m.id === data.id) ? cur : [...cur, data]));
    setText("");
    setQuick(false);
    onSent(ticket.id);
    if (ticket.status === "open") await changeStatus("in_progress");
    setBusy(false);
  };

  const thumbs = (paths) =>
    paths?.length ? (
      <span className="mt-2 flex flex-wrap gap-2">
        {paths.map((p) =>
          urls[p] ? (
            <button key={p} type="button" onClick={() => setView(urls[p])}>
              <img src={urls[p]} alt="Ảnh đính kèm" className={paths.length === 1 ? "max-h-56 w-auto max-w-full rounded-xl" : "h-24 w-24 rounded-xl object-cover"} />
            </button>
          ) : (
            <span key={p} className="h-24 w-24 animate-pulse rounded-xl bg-slate-200" />
          )
        )}
      </span>
    ) : null;

  const Bubble = ({ staff, label, time, children }) => (
    <div className={`flex flex-col ${staff ? "items-end" : "items-start"}`}>
      <span className="mb-1 text-xs text-slate-400"><span className="font-semibold text-slate-600">{label}</span>{time ? `  ${time}` : ""}</span>
      <div className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-6 ${staff ? "rounded-br-sm bg-slate-900 text-white" : "rounded-bl-sm bg-slate-100 text-slate-800"}`}>{children}</div>
    </div>
  );

  const btn = "rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50";
  return (
    <div className="flex h-[calc(100vh-13rem)] min-h-[480px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* Đầu: thông tin + trạng thái */}
      <div className="border-b border-slate-200 px-4 py-3.5">
        <div className="flex items-start gap-3">
          <button onClick={onBack} aria-label="Quay lại" className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 lg:hidden">
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-slate-900">{titleOf(ticket)}</h3>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              #{codeOf(ticket)} · {catLabel(ticket)} · {who}{user?.email && user?.username ? ` · ${user.email}` : ""} · {fmtFull(ticket.created_at)}
            </p>
          </div>
          <Dot status={ticket.status} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {ticket.status !== "in_progress" && !isDone(ticket) && <button onClick={() => changeStatus("in_progress")} className={btn}>Đang xử lý</button>}
          {!isDone(ticket) && <button onClick={() => changeStatus("resolved")} className={`${btn} !border-emerald-200 !bg-emerald-50 !text-emerald-700`}>Đánh dấu đã xong</button>}
          {isDone(ticket) && <button onClick={() => changeStatus("open")} className={btn}>Mở lại</button>}
        </div>
      </div>

      {/* Hội thoại */}
      <div className="flex-1 space-y-5 overflow-y-auto bg-white px-4 py-5">
        <Bubble label={who} time={fmtFull(ticket.created_at)}>
          {bodyOf(ticket)}
          {thumbs(ticket.images)}
        </Bubble>
        {ticket.admin_reply && <Bubble staff label="CSKH">{ticket.admin_reply}</Bubble>}
        {msgs.map((m) => (
          <Bubble key={m.id} staff={m.sender === "staff"} label={m.sender === "staff" ? "CSKH" : who} time={fmtFull(m.created_at)}>
            {m.body}
            {thumbs(m.images)}
          </Bubble>
        ))}
        <div ref={endRef} />
      </div>

      {/* Soạn trả lời */}
      <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
        {err && <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{err}</p>}
        {quick && (
          <div className="mb-2 flex flex-col gap-1.5">
            {QUICK_REPLIES.map((r) => (
              <button key={r} onClick={() => { setText(r); setQuick(false); }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs leading-5 text-slate-700 hover:bg-slate-100">{r}</button>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2">
          <button onClick={() => setQuick(!quick)} aria-label="Câu trả lời mẫu" title="Câu trả lời mẫu"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-slate-600 transition ${quick ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:bg-slate-100"}`}>
            <Zap size={18} />
          </button>
          <textarea
            value={text}
            rows={2}
            maxLength={1000}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && window.innerWidth >= 1024) { e.preventDefault(); send(); } }}
            placeholder="Nhập câu trả lời (Enter để gửi, Shift+Enter xuống dòng)"
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-slate-900"
          />
          <button onClick={send} disabled={!text.trim() || busy} aria-label="Gửi"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-700 disabled:opacity-40">
            <Send size={17} />
          </button>
        </div>
      </div>

      {view && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4" onClick={() => setView(null)}>
          <button aria-label="Đóng" onClick={() => setView(null)} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-900">
            <X size={20} />
          </button>
          <img src={view} alt="Ảnh đính kèm" onClick={(e) => e.stopPropagation()} className="max-h-full max-w-full rounded-xl object-contain" />
        </div>
      )}
    </div>
  );
}

/* ================= TAB HỖ TRỢ ================= */
export default function AdminSupportTab({ onChanged }) {
  const [tickets, setTickets] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [lastBy, setLastBy] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("wait");
  const [q, setQ] = useState("");
  const [selId, setSelId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    const { data, error } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false }).limit(300);
    if (error) { setErr(error.message); setLoading(false); return; }
    const rows = data || [];
    setTickets(rows);

    const ids = [...new Set(rows.map((t) => t.user_id).filter(Boolean))].slice(0, 200);
    if (ids.length) {
      const { data: ps } = await supabase.from("profiles").select("id,username,email").in("id", ids);
      setProfiles(Object.fromEntries((ps || []).map((p) => [p.id, p])));
    }
    const { data: ms } = await supabase.from("support_ticket_messages").select("ticket_id,sender,created_at").order("created_at", { ascending: false }).limit(1000);
    const map = {};
    (ms || []).forEach((m) => { if (!(m.ticket_id in map)) map[m.ticket_id] = m.sender; });
    setLastBy(map);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const ch = supabase
      .channel("admin-support-all")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_ticket_messages" },
        (p) => { setLastBy((c) => ({ ...c, [String(p.new.ticket_id)]: p.new.sender })); onChanged?.(); })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_tickets" }, () => { load(); onChanged?.(); })
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [load, onChanged]);

  const needsReply = (t) => {
    if (isDone(t)) return false;
    const last = lastBy[String(t.id)];
    return last ? last === "user" : t.status === "open";
  };
  const inTab = (t, k) =>
    k === "all" ? true : k === "wait" ? needsReply(t) : k === "done" ? isDone(t) : !isDone(t) && !needsReply(t);

  const TABS = [
    { key: "wait", label: "Chờ trả lời" },
    { key: "follow", label: "Đã phản hồi" },
    { key: "done", label: "Đã xong" },
    { key: "all", label: "Tất cả" },
  ];

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return tickets.filter((t) => {
      if (!inTab(t, tab)) return false;
      if (!kw) return true;
      const p = profiles[t.user_id] || {};
      return [titleOf(t), bodyOf(t), codeOf(t), p.username, p.email].filter(Boolean).some((v) => String(v).toLowerCase().includes(kw));
    });
  }, [tickets, tab, q, profiles, lastBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const sel = tickets.find((t) => t.id === selId);

  const onStatus = (id, status) => { setTickets((cur) => cur.map((t) => (t.id === id ? { ...t, status } : t))); onChanged?.(); };
  const onSent = (id) => setLastBy((c) => ({ ...c, [String(id)]: "staff" }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Hỗ trợ</h2>
          <p className="mt-0.5 text-sm text-slate-500">Xem yêu cầu và trả lời trực tiếp cho khách</p>
        </div>
        <button onClick={load} disabled={loading} aria-label="Làm mới"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {err && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Không tải được yêu cầu: {err}</p>}

      <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* Danh sách */}
        <div className={sel ? "hidden lg:block" : ""}>
          <div className="relative">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm mã, nội dung, tên, email..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-slate-900" />
          </div>
          <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
            {TABS.map((t) => {
              const n = tickets.filter((x) => inTab(x, t.key)).length;
              const on = tab === t.key;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${on ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>
                  {t.label} <span className={on ? "text-white/70" : "text-slate-400"}>{n}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white lg:max-h-[calc(100vh-20rem)] lg:overflow-y-auto">
            {loading && <div className="h-24 animate-pulse bg-slate-50" />}
            {!loading && list.length === 0 && <p className="px-5 py-10 text-center text-sm text-slate-400">Không có yêu cầu nào</p>}
            {list.map((t) => {
              const p = profiles[t.user_id] || {};
              const name = p.username || p.email || `Khách #${String(t.user_id || "").slice(0, 6)}`;
              const wait = needsReply(t);
              return (
                <button key={t.id} onClick={() => setSelId(t.id)}
                  className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50 ${selId === t.id ? "bg-slate-100" : ""}`}>
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                    {name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className={`truncate text-sm ${wait ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>{name}</span>
                      <span className="shrink-0 text-xs text-slate-400">{fmtShort(t.created_at)}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-slate-600">{titleOf(t)}</span>
                    <span className="mt-1.5 flex items-center gap-2">
                      <Dot status={t.status} />
                      <span className="text-xs text-slate-400">#{codeOf(t)}</span>
                      {wait && <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Chờ trả lời</span>}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat */}
        <div className={sel ? "" : "hidden lg:block"}>
          {sel ? (
            <AdminChat key={sel.id} ticket={sel} user={profiles[sel.user_id]} onBack={() => setSelId(null)} onStatus={onStatus} onSent={onSent} />
          ) : (
            <div className="flex h-[calc(100vh-13rem)] min-h-[480px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 text-slate-400">
              <MessageCircle size={36} />
              <p className="mt-3 text-sm">Chọn một yêu cầu để xem và trả lời</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
                               }
                                                                 
