// src/pages/AdminSupportTab.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { 
  Search, RefreshCw, Send, ArrowLeft, X, Zap, MessageCircle, 
  Clock, Tag, Plus, Check, Lock, History
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const BUCKET = "support-attachments";

const QUICK_REPLIES = [
  "Cảm ơn bạn đã liên hệ NXX315. Mình đã nhận được yêu cầu và đang kiểm tra, sẽ phản hồi bạn sớm nhất có thể.",
  "Bạn vui lòng gửi thêm ảnh chụp màn hình và tên Roblox để mình kiểm tra nhanh hơn nhé.",
  "Đơn của bạn đang được xử lý, bạn vui lòng chờ thêm ít phút nhé.",
  "Vấn đề đã được xử lý xong. Nếu còn cần hỗ trợ, bạn cứ nhắn tiếp tại đây nhé!",
];

// Bộ nhãn gợi ý (Hiển thị dạng viên thuốc)
const SUGGESTED_LABELS = [
  "Đơn hàng", "Thanh toán", "Tài khoản & bảo mật", "Báo lỗi", "Khác",
  "VIP", "Khách sộp", "Bom hàng", "Spam", "Chờ CK", "Đã xử lý"
];

const STATUS = {
  open: { label: "Mới", dot: "bg-amber-500", bg: "bg-amber-50 text-amber-700 border-amber-200" },
  in_progress: { label: "Đang xử lý", dot: "bg-sky-500", bg: "bg-sky-50 text-sky-700 border-sky-200" },
  answered: { label: "Đã phản hồi", dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  resolved: { label: "Đã xong", dot: "bg-slate-400", bg: "bg-slate-50 text-slate-600 border-slate-200" },
  closed: { label: "Đã xong", dot: "bg-slate-400", bg: "bg-slate-50 text-slate-600 border-slate-200" },
};
const statusOf = (s) => STATUS[s] || { label: s || "—", dot: "bg-slate-400", bg: "bg-slate-50 text-slate-600 border-slate-200" };
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
    <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-slate-600">
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
  
  const [labels, setLabels] = useState(ticket.labels || []);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [customLabelInput, setCustomLabelInput] = useState("");
  
  const endRef = useRef(null);
  const who = user?.username || user?.email || `Khách #${String(ticket.user_id || "").slice(0, 6)}`;
  const isLocked = isDone(ticket);

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

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" }); }, [msgs.length, ticket.id]);

  const changeStatus = async (status) => {
    setErr("");
    const { error } = await supabase.from("support_tickets").update({ status, updated_at: new Date().toISOString() }).eq("id", ticket.id);
    if (error) return setErr("Chưa đổi được trạng thái: " + error.message);
    onStatus(ticket.id, status);
  };

  const updateLabels = async (newLabels) => {
    setLabels(newLabels);
    const { error } = await supabase.from("support_tickets").update({ labels: newLabels }).eq("id", ticket.id);
    if (error) {
      setErr("Lỗi lưu nhãn: " + error.message);
      setLabels(ticket.labels || []);
    }
  };

  const toggleLabel = (labelName) => {
    if (labels.includes(labelName)) {
      updateLabels(labels.filter(l => l !== labelName));
    } else {
      updateLabels([...labels, labelName]);
    }
  };

  const handleAddCustomLabel = () => {
    const val = customLabelInput.trim();
    if (!val) return;
    if (!labels.includes(val)) {
      updateLabels([...labels, val]);
    }
    setCustomLabelInput("");
  };

  const send = async () => {
    if (isLocked) return;
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
      return setErr("Chưa gửi được. (" + error.message + ")");
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
              <img src={urls[p]} alt="Ảnh" className={paths.length === 1 ? "max-h-56 w-auto max-w-full rounded-xl" : "h-24 w-24 rounded-xl object-cover"} />
            </button>
          ) : (
            <span key={p} className="h-24 w-24 animate-pulse rounded-xl bg-slate-200" />
          )
        )}
      </span>
    ) : null;

  const Bubble = ({ staff, label, time, children }) => (
    <div className={`flex flex-col ${staff ? "items-end" : "items-start"}`}>
      <span className="mb-1 px-1 text-[11px] text-slate-400"><span className="font-semibold text-slate-600">{label}</span>{time ? ` • ${time}` : ""}</span>
      <div className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-6 ${staff ? "rounded-br-sm bg-slate-900 text-white" : "rounded-bl-sm bg-slate-100 text-slate-800"}`}>{children}</div>
    </div>
  );

  const btn = "rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50";

  return (
    <div className="relative flex h-[calc(100dvh-9rem)] min-h-[500px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* HEADER */}
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-start gap-3">
          <button onClick={onBack} aria-label="Quay lại" className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 lg:hidden">
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-slate-900">{titleOf(ticket)}</h3>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              #{codeOf(ticket)} · {catLabel(ticket)} · {who} · {fmtFull(ticket.created_at)}
            </p>
          </div>
          <div className={`hidden shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold sm:flex ${statusOf(ticket.status).bg}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${statusOf(ticket.status).dot}`} />
            {statusOf(ticket.status).label}
          </div>
        </div>
        
{/* KHU VỰC NHÃN & THAO TÁC */}
<div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
  
  {/* Hiển thị nhãn đã chọn (Dạng viên thuốc) */}
  {labels.map(l => (
    <span key={l} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
      {l}
      {!isLocked && (
        <button onClick={() => toggleLabel(l)} className="ml-0.5 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition">
          <X size={12} />
        </button>
      )}
    </span>
  ))}
  
  {/* Nút Thêm nhãn */}
  {!isLocked && (
    <div className="relative">
      <button 
        onClick={() => setShowLabelPicker(!showLabelPicker)}
        className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
      >
        <Plus size={13} /> Thêm nhãn
      </button>
      
      {/* Dropdown chọn nhãn - ĐÃ FIX GIAO DIỆN MOBILE */}
      {showLabelPicker && (
        <>
          {/* Lớp phủ mờ để bấm ra ngoài là đóng menu */}
          <div className="fixed inset-0 z-40" onClick={() => setShowLabelPicker(false)} />
          
          <div className="fixed sm:absolute left-1/2 sm:left-0 bottom-4 sm:bottom-auto sm:top-full z-50 w-[calc(100%-2rem)] sm:w-80 -translate-x-1/2 sm:translate-x-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-sm font-semibold text-slate-800">Gắn nhãn</span>
              <button onClick={() => setShowLabelPicker(false)} className="rounded-full bg-slate-100 p-1 text-slate-500 hover:bg-slate-200">
                <Check size={16} />
              </button>
            </div>

            <div className="mb-3 flex gap-1.5">
              <input 
                value={customLabelInput}
                onChange={(e) => setCustomLabelInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCustomLabel()}
                placeholder="Tạo nhãn mới..." 
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
              />
              <button onClick={handleAddCustomLabel} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
                Lưu
              </button>
            </div>

            <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto">
              {SUGGESTED_LABELS.map((lbl) => {
                const isActive = labels.includes(lbl);
                return (
                  <button 
                    key={lbl} 
                    onClick={() => toggleLabel(lbl)}
                    className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition ${
                      isActive ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {lbl}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )}

  {/* Action buttons */}
  <div className="ml-auto flex gap-2">
    {ticket.status !== "in_progress" && !isLocked && <button onClick={() => changeStatus("in_progress")} className={btn}>Đang xử lý</button>}
    {!isLocked && <button onClick={() => changeStatus("resolved")} className={`${btn} !border-emerald-200 !bg-emerald-50 !text-emerald-700`}>Đánh dấu đã xong</button>}
    {isLocked && (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
        <Lock size={12} /> Đã đóng
      </span>
    )}
  </div>
</div>
        
      {/* HỘI THOẠI */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/50 px-4 py-5">
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
        
        {/* Thông báo khóa chat */}
        {isLocked && (
          <div className="mx-auto mt-6 max-w-sm rounded-xl border border-slate-200 bg-slate-100 p-4 text-center">
            <Lock size={20} className="mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-medium text-slate-600">Yêu cầu này đã được đóng</p>
            <p className="mt-1 text-xs text-slate-500">Không thể gửi thêm tin nhắn mới.</p>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* SOẠN TIN NHẮN */}
      {!isLocked && (
        <div className="shrink-0 border-t border-slate-200 bg-white p-3 lg:p-4">
          {err && <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{err}</p>}
          
          {quick && (
            <div className="mb-3 flex flex-col gap-1.5">
              {QUICK_REPLIES.map((r) => (
                <button key={r} onClick={() => { setText(r); setQuick(false); }}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs leading-5 text-slate-700 hover:bg-slate-100">{r}</button>
              ))}
            </div>
          )}
          
          <div className="flex items-end gap-2">
            <button onClick={() => setQuick(!quick)} aria-label="Mẫu trả lời" title="Mẫu trả lời"
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-slate-600 transition ${quick ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 hover:bg-slate-100"}`}>
              <Zap size={18} />
            </button>
            <textarea
              value={text}
              rows={1}
              maxLength={1000}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Nhập câu trả lời... (Enter để gửi)"
              className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
            />
            <button onClick={send} disabled={!text.trim() || busy} aria-label="Gửi"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-700 disabled:opacity-40">
              <Send size={17} />
            </button>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {view && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4" onClick={() => setView(null)}>
          <button aria-label="Đóng" onClick={() => setView(null)} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-900">
            <X size={20} />
          </button>
          <img src={view} alt="Ảnh" onClick={(e) => e.stopPropagation()} className="max-h-full max-w-full rounded-xl object-contain" />
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
  const [filterLabel, setFilterLabel] = useState(null); 
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
      if (filterLabel && !(t.labels || []).includes(filterLabel)) return false;
      if (!kw) return true;
      const p = profiles[t.user_id] || {};
      return [titleOf(t), bodyOf(t), codeOf(t), p.username, p.email].filter(Boolean).some((v) => String(v).toLowerCase().includes(kw));
    });
  }, [tickets, tab, q, profiles, lastBy, filterLabel]); 

  const sel = tickets.find((t) => t.id === selId);
  const onStatus = (id, status) => { 
    setTickets((cur) => cur.map((t) => (t.id === id ? { ...t, status } : t))); 
    onChanged?.(); 
  };
  const onSent = (id) => setLastBy((c) => ({ ...c, [String(id)]: "staff" }));

  // Tự động gom các nhãn đang có để làm nút lọc
  const activeLabels = useMemo(() => {
    const s = new Set();
    tickets.forEach(t => (t.labels || []).forEach(l => s.add(l)));
    return Array.from(s);
  }, [tickets]);

  return (
    <div className="flex h-[calc(100dvh-9rem)] min-h-[600px] flex-col space-y-4 lg:space-y-5">
      {/* Header Tab */}
      <div className="flex shrink-0 items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Hỗ trợ</h2>
          <p className="mt-0.5 text-sm text-slate-500">Xem yêu cầu và trả lời trực tiếp cho khách</p>
        </div>
        <button onClick={load} disabled={loading} aria-label="Làm mới"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {err && <p className="shrink-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Không tải được yêu cầu: {err}</p>}

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 gap-4 lg:gap-5">
        
        {/* CỘT TRÁI: DANH SÁCH */}
        <div className={`w-full shrink-0 flex-col lg:flex lg:w-[360px] ${sel ? "hidden" : "flex"}`}>
          
          <div className="relative shrink-0">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm mã, nội dung, tên, email..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100" />
          </div>

          {/* Bộ lọc nhãn */}
          {activeLabels.length > 0 && (
            <div className="mt-3 flex shrink-0 items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap flex items-center gap-1">
                <Tag size={12} /> Lọc:
              </span>
              {activeLabels.map(l => (
                <button key={l} onClick={() => setFilterLabel(filterLabel === l ? null : l)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition border ${
                    filterLabel === l 
                      ? "border-slate-900 bg-slate-900 text-white" 
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}>
                  {l}
                </button>
              ))}
              {filterLabel && (
                <button onClick={() => setFilterLabel(null)} className="text-xs text-red-500 hover:underline whitespace-nowrap ml-1">
                  Bỏ lọc
                </button>
              )}
            </div>
          )}
          
          <div className="-mx-1 mt-3 flex shrink-0 gap-2 overflow-x-auto px-1 pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {TABS.map((t) => {
              const n = tickets.filter((x) => inTab(x, t.key)).length;
              const on = tab === t.key;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${on ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
                  {t.label} <span className={`ml-1 ${on ? "text-white/70" : "text-slate-400"}`}>{n}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="h-full divide-y divide-slate-100 overflow-y-auto">
              {loading && <div className="h-24 animate-pulse bg-slate-50" />}
              {!loading && list.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                  <MessageCircle size={28} className="mb-2 text-slate-300" />
                  <p className="text-sm text-slate-400">Không có yêu cầu nào</p>
                </div>
              )}
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
                        <span className="flex shrink-0 items-center gap-1 text-[11px] text-slate-400">
                          <Clock size={11} /> {fmtShort(t.created_at)}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-[13px] text-slate-600">{titleOf(t)}</span>
                      
                      {/* Hiển thị nhãn thu nhỏ trong list */}
                      {(t.labels && t.labels.length > 0) && (
                        <span className="mt-1.5 flex flex-wrap gap-1">
                          {t.labels.slice(0, 3).map(l => (
                            <span key={l} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                              {l}
                            </span>
                          ))}
                          {t.labels.length > 3 && <span className="text-[10px] text-slate-400">+{t.labels.length - 3}</span>}
                        </span>
                      )}

                      <span className="mt-2 flex items-center gap-2">
                        <Dot status={t.status} />
                        <span className="text-[11px] text-slate-400">#{codeOf(t)}</span>
                        {wait && <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">Chờ</span>}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: KHUNG CHAT */}
        <div className={`min-w-0 flex-1 ${sel ? "flex flex-col" : "hidden lg:flex"}`}>
          {sel ? (
            <AdminChat key={sel.id} ticket={sel} user={profiles[sel.user_id]} onBack={() => setSelId(null)} onStatus={onStatus} onSent={onSent} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 text-slate-400">
              <MessageCircle size={40} className="mb-3 text-slate-300" />
              <p className="text-sm font-medium">Chọn một yêu cầu để xem và trả lời</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
     }
