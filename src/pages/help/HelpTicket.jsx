// src/pages/help/HelpTicket.jsx — chi tiết một yêu cầu + nhắn tin với CSKH (nền đen, xanh lá phát sáng)
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient.js";
import { Icon } from "./HelpUI.jsx";
import { MAX_IMAGES, MAX_MB, statusOf } from "./HelpScreen.jsx";
import { ATTACH_BUCKET, CATEGORIES, CSKH_AVATAR, CSKH_NAME, fmtDate } from "./helpData.js";

const CLOSED = ["resolved", "closed"];
const QUALITY = { 1: "Không hài lòng", 2: "Bình thường", 3: "Hài lòng", 4: "Rất hài lòng" };

const sans = { fontFamily: '"Whyte Inktrap","Inter",Arial,sans-serif' };
const serif = { fontFamily: '"GrandSlang","Bodoni Moda",Georgia,serif' };
const mono = { fontFamily: '"Whyte Inktrap Mono","Space Mono",ui-monospace,monospace' };

const chip = (on) =>
  `rounded-full border border-white/10 px-4 py-2 text-[14px] font-medium transition active:scale-95 ${
    on ? "bg-[#34e58a] text-[#090909] shadow-[0_0_20px_rgba(52,229,138,0.3)]" : "bg-white/10 text-white"
  }`;

function StatusPill({ st }) {
  return (
    <span className="inline-flex items-center gap-2 text-[14px] text-[#f7f9fa]">
      <span className={`h-2 w-2 rounded-full ${st.dot || "bg-slate-400"}`} />
      {st.label}
    </span>
  );
}

function CskhAvatar() {
  const [bad, setBad] = useState(false);
  if (CSKH_AVATAR && !bad) {
    return <img src={CSKH_AVATAR} alt={CSKH_NAME} onError={() => setBad(true)} className="mt-6 h-9 w-9 shrink-0 rounded-full border border-white/20 object-cover" />;
  }
  return (
    <span className="mt-6 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[14px] font-semibold text-white">
      {CSKH_NAME.slice(0, 1)}
    </span>
  );
}

function Lightbox({ url, onClose }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      <button aria-label="Đóng" onClick={onClose}
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white">
        <Icon name="x" size={20} />
      </button>
      <img src={url} alt="Ảnh đính kèm" onClick={(e) => e.stopPropagation()} className="max-h-full max-w-full rounded-2xl object-contain" />
    </div>
  );
}

function ChatBubble({ mine, time, label, auto, children, hasText }) {
  if (mine) {
    return (
      <div className="flex flex-col items-end">
        {time && <span className="mb-1.5 pr-1 text-[12px] text-white/40" style={mono}>{time}</span>}
        {hasText ? (
          <div className="max-w-[84%] space-y-2 whitespace-pre-line break-words rounded-[20px] rounded-br-[6px] bg-[#34e58a] px-4 py-3 text-[15px] leading-[22px] text-[#04140b] shadow-[0_0_28px_rgba(52,229,138,0.22)]">{children}</div>
        ) : (
          <div className="max-w-[84%]">{children}</div>
        )}
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2.5">
      <CskhAvatar />
      <div className="min-w-0 max-w-[80%]">
        <p className="mb-1.5 pl-1 text-[12px] text-white/40">
          <span className="text-[14px] font-bold text-white">{label || CSKH_NAME}</span>
          {time ? <span style={mono}>{"  "}{time}</span> : null}
        </p>
        <div className="whitespace-pre-line break-words rounded-[20px] rounded-tl-[6px] border border-white/10 bg-white/10 px-4 py-3 text-[15px] font-light leading-[22px] text-[#f7f9fa] backdrop-blur-[11px]">
          {auto && (
            <span className="mb-2 block w-fit rounded-full border border-[#34e58a]/40 px-2.5 py-0.5 text-[11px] uppercase tracking-[0.07em] text-[#34e58a]" style={mono}>
              Tin nhắn tự động
            </span>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

function Card({ title, open, onToggle, children }) {
  return (
    <section className="rounded-[20px] border-[0.5px] border-white/20 border-t-[#3fbf8a] bg-white/[0.07] px-4 backdrop-blur-[11px]">
      <button onClick={onToggle} className="flex w-full items-center justify-between gap-3 py-4 text-left">
        <span className="text-[19px] font-normal text-white">{title}</span>
        <Icon name="chevD" size={19} className={`shrink-0 text-white/60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t-[0.5px] border-white/15">{children}</div>}
    </section>
  );
}

const AUTO_REPLY = "Xin chào bạn,\nNXX315 đã nhận được yêu cầu của bạn. Đội ngũ CSKH sẽ phản hồi tại đây sớm nhất có thể. Bạn có thể nhắn thêm thông tin bất cứ lúc nào.";

const followUpText = (name) =>
  `Xin chào bạn${name ? ` ${name}` : ""},\nNếu bạn vẫn cần trợ giúp về vấn đề trên, hãy để lại phản hồi để đội ngũ CSKH của Nxx315 Studio kịp thời hỗ trợ bạn nhé.\n\nTrong 12 giờ tiếp theo, Nxx315 Studio xin được phép đóng yêu cầu trợ giúp này nếu không có thêm phản hồi nào khác từ bạn. Cảm ơn bạn đã sử dụng dịch vụ!`;

export function ChatScreen({ ticket, onClose }) {
  const [msgs, setMsgs] = useState([]);
  const [imgs, setImgs] = useState([]);
  const [info, setInfo] = useState(true);
  const [chat, setChat] = useState(true);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [status, setStatus] = useState(ticket.status);
  const [name, setName] = useState("");
  const [rating, setRating] = useState({ q: ticket.rating_quality ?? null, r: ticket.rating_resolved ?? null, done: !!ticket.rated_at });
  const [pickQ, setPickQ] = useState(null);
  const [pickR, setPickR] = useState(null);
  const [rateBusy, setRateBusy] = useState(false);
  const [rateErr, setRateErr] = useState("");
  const [rateOpen, setRateOpen] = useState(true);
  const endRef = useRef(null);
  const pick = useRef(null);
  const [view, setView] = useState(null);
  const [files, setFiles] = useState([]);
  const [urls, setUrls] = useState({});
  const filesRef = useRef(files);
  filesRef.current = files;
  useEffect(() => () => filesRef.current.forEach((f) => URL.revokeObjectURL(f.url)), []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      const uid = s?.session?.user?.id;
      if (!uid) return;
      const { data } = await supabase.from("profiles").select("display_name,username").eq("id", uid).maybeSingle();
      if (alive && data) setName(data.display_name || data.username || "");
    })();
    return () => { alive = false; };
  }, []);

  // làm mới trạng thái + đánh giá mỗi lần mở phiếu
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.from("support_tickets")
        .select("status,rating_quality,rating_resolved,rated_at").eq("id", ticket.id).maybeSingle();
      if (!alive || !data) return;
      setStatus(data.status);
      setRating({ q: data.rating_quality, r: data.rating_resolved, done: !!data.rated_at });
    })();
    return () => { alive = false; };
  }, [ticket.id]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.from("support_ticket_messages").select("id,sender,body,images,created_at").eq("ticket_id", String(ticket.id)).order("created_at", { ascending: true });
      if (alive) setMsgs(data || []);
    })();
    const ch = supabase
      .channel(`ticket-${ticket.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_ticket_messages", filter: `ticket_id=eq.${ticket.id}` },
        (p) => setMsgs((cur) => (cur.some((m) => m.id === p.new.id) ? cur : [...cur, p.new])))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "support_tickets", filter: `id=eq.${ticket.id}` },
        (p) => setStatus(p.new.status))
      .subscribe();
    return () => { alive = false; supabase.removeChannel(ch); };
  }, [ticket.id]);

  useEffect(() => {
    if (!ticket.images?.length) return;
    let alive = true;
    (async () => {
      const { data } = await supabase.storage.from(ATTACH_BUCKET).createSignedUrls(ticket.images, 3600);
      if (alive) setImgs((data || []).map((d) => d.signedUrl).filter(Boolean));
    })();
    return () => { alive = false; };
  }, [ticket.images]);

  useEffect(() => {
    const need = [...new Set(msgs.flatMap((m) => m.images || []))].filter((p) => !urls[p]);
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
  }, [msgs]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [msgs.length, imgs.length]);

  const closed = CLOSED.includes(status);
  const last = msgs[msgs.length - 1];
  const lastIsStaff = last ? last.sender !== "user" : !!ticket.admin_reply;
  const showFollowUp = !closed && lastIsStaff;
  const followUpTime = last?.created_at || ticket.updated_at || ticket.created_at;
  const typeLabel = ticket.type === "idea" ? "Góp ý ý tưởng" : CATEGORIES.find((c) => c.key === ticket.category)?.label || "Hỗ trợ";

  const addFiles = (list) => {
    setErr("");
    const ok = [];
    for (const f of Array.from(list)) {
      if (!f.type.startsWith("image/")) continue;
      if (f.size > MAX_MB * 1024 * 1024) { setErr(`Mỗi ảnh tối đa ${MAX_MB}MB.`); continue; }
      ok.push({ file: f, url: URL.createObjectURL(f) });
    }
    setFiles((cur) => {
      const all = [...cur, ...ok];
      all.slice(MAX_IMAGES).forEach((x) => URL.revokeObjectURL(x.url));
      return all.slice(0, MAX_IMAGES);
    });
  };
  const removeFile = (i) => setFiles((cur) => { URL.revokeObjectURL(cur[i].url); return cur.filter((_, k) => k !== i); });

  const submitRating = async () => {
    if (pickQ === null || pickR === null || rateBusy) return;
    setRateErr("");
    setRateBusy(true);
    const { error } = await supabase.rpc("rate_support_ticket", { p_ticket_id: ticket.id, p_quality: pickQ, p_resolved: pickR });
    setRateBusy(false);
    if (error) return setRateErr("Chưa gửi được đánh giá, thử lại sau nhé.");
    setRating({ q: pickQ, r: pickR, done: true });
  };

  const send = async () => {
    const body = text.trim();
    if ((!body && files.length === 0) || busy || closed) return;
    setErr("");
    setBusy(true);
    const { data: s } = await supabase.auth.getSession();
    const uid = s?.session?.user?.id;
    if (!uid) { setBusy(false); return setErr("Bạn cần đăng nhập để nhắn tin."); }

    const paths = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i].file;
      const ext = (f.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${uid}/chat/${ticket.id}-${Date.now()}-${i + 1}.${ext}`;
      const { error: upErr } = await supabase.storage.from(ATTACH_BUCKET).upload(path, f, { contentType: f.type });
      if (upErr) { setBusy(false); return setErr(`Chưa tải được ảnh ${i + 1}, thử lại sau nhé.`); }
      paths.push(path);
    }

    const { data, error } = await supabase.from("support_ticket_messages")
      .insert({ ticket_id: String(ticket.id), user_id: uid, sender: "user", body, images: paths })
      .select("id,sender,body,images,created_at").single();
    setBusy(false);
    if (error) return setErr("Chưa gửi được tin nhắn, thử lại sau nhé.");
    setText("");
    files.forEach((f) => URL.revokeObjectURL(f.url));
    setFiles([]);
    setMsgs((cur) => (cur.some((m) => m.id === data.id) ? cur : [...cur, data]));
  };

  const thumbs = (list) =>
    list.length ? (
      <span className="flex flex-wrap gap-2">
        {list.map((u, i) =>
          u ? (
            <button key={u} type="button" onClick={() => setView(u)} className="block">
              <img src={u} alt="Ảnh đính kèm" className={list.length === 1 ? "max-h-64 w-auto max-w-full rounded-2xl" : "h-28 w-28 rounded-2xl object-cover"} />
            </button>
          ) : (
            <span key={i} className="h-28 w-28 animate-pulse rounded-2xl bg-white/10" />
          )
        )}
      </span>
    ) : null;

  const row = "flex items-center justify-between gap-4 border-b-[0.5px] border-white/15 py-3.5 text-[15px] last:border-b-0";

  return (
    <>
    <div className="fixed inset-0 z-50 flex flex-col bg-[#090909] text-[#f7f9fa]" style={{ ...sans, colorScheme: "dark" }}>
      {/* ánh sáng xanh lá phía sau phần đầu trang */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[440px] opacity-[0.45]"
        style={{ backgroundImage: "radial-gradient(circle closest-corner at 12% 0%, #1fbf75, rgba(0,0,0,0) 60%)" }} />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[440px]"
        style={{ backgroundImage: "linear-gradient(180deg, rgba(9,9,9,0) 55%, #090909 100%)" }} />

      {/* thanh điều hướng 54px, đường kẻ mảnh */}
      <header className="relative z-10 border-b-[0.5px] border-white/40 bg-black/40 backdrop-blur-[12px]" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="mx-auto flex h-[54px] w-full max-w-md items-center gap-3 px-4 md:max-w-xl">
          <button onClick={onClose} aria-label="Quay lại"
            className="flex h-8 items-center gap-1.5 rounded-[4px] bg-white/10 px-3 text-[12px] uppercase text-white transition active:bg-white/40">
            <Icon name="back" size={14} />
            Quay lại
          </button>
          <span className="h-5 w-px bg-white/40" />
          <span className="text-[12px] uppercase text-white/75">Trợ giúp</span>
        </div>
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-md space-y-3 px-3 pb-8 pt-7 md:max-w-xl">
          {/* tiêu đề: chữ thẳng + chữ serif nghiêng */}
          <div className="px-2 pb-3">
            <p className="mb-3 text-[12px] uppercase tracking-[0.2em] text-white/40" style={mono}>
              #{ticket.ticket_code}
            </p>
            <h1 className="text-[46px] font-medium leading-[0.9] tracking-[-0.03em] text-white">
              Chi tiết <span className="font-normal italic text-[#34e58a]" style={serif}>yêu cầu</span>
            </h1>
          </div>

          <Card title={typeLabel} open={info} onToggle={() => setInfo(!info)}>
            <div className={row}><span className="text-white/40">Mã yêu cầu</span><span className="font-medium text-white" style={mono}>#{ticket.ticket_code}</span></div>
            <div className={row}><span className="text-white/40">Thời gian gửi</span><span className="font-medium text-white">{fmtDate(ticket.created_at)}</span></div>
            <div className={row}><span className="text-white/40">Trạng thái</span><StatusPill st={statusOf(status)} /></div>
          </Card>

          {closed && (
            <Card title="Đánh giá của bạn" open={rateOpen} onToggle={() => setRateOpen(!rateOpen)}>
              {rating.done ? (
                <>
                  <div className={row}><span className="text-white/40">Chất lượng hỗ trợ</span><span className="font-medium text-white">{QUALITY[rating.q]}</span></div>
                  <div className={row}><span className="text-white/40">Mức độ giải quyết</span><span className="font-medium text-white">{rating.r ? "Đã giải quyết" : "Chưa giải quyết"}</span></div>
                </>
              ) : (
                <div className="space-y-5 py-5">
                  <div>
                    <p className="mb-2.5 text-[14px] text-white/40">Chất lượng hỗ trợ</p>
                    <div className="flex flex-wrap gap-2">
                      {[4, 3, 2, 1].map((v) => (
                        <button key={v} type="button" onClick={() => setPickQ(v)} className={chip(pickQ === v)}>{QUALITY[v]}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2.5 text-[14px] text-white/40">Mức độ giải quyết</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setPickR(true)} className={chip(pickR === true)}>Đã giải quyết</button>
                      <button type="button" onClick={() => setPickR(false)} className={chip(pickR === false)}>Chưa giải quyết</button>
                    </div>
                  </div>
                  {rateErr && <p className="rounded-2xl bg-rose-500/10 px-4 py-2 text-[13px] font-medium text-rose-300">{rateErr}</p>}
                  <button onClick={submitRating} disabled={pickQ === null || pickR === null || rateBusy}
                    className="flex h-14 w-full items-center justify-center rounded-full border-[0.5px] border-white/25 border-r-white/50 border-b-[#34e58a]/30 bg-[#34e58a]/5 text-[18px] font-light text-white backdrop-blur-[12px] transition active:shadow-[inset_0_0_0_2px_#34e58a] disabled:opacity-40">
                    {rateBusy ? "Đang gửi..." : "Gửi đánh giá"}
                  </button>
                </div>
              )}
            </Card>
          )}

          <Card title="Chi tiết vấn đề" open={chat} onToggle={() => setChat(!chat)}>
            <div className="space-y-6 py-6">
              <ChatBubble mine time={fmtDate(ticket.created_at)} hasText={!!ticket.description && ticket.description.trim().length > 0}>
                {ticket.description}
                {thumbs(imgs)}
              </ChatBubble>

              <ChatBubble auto time={fmtDate(ticket.created_at)}>{AUTO_REPLY}</ChatBubble>
              {ticket.admin_reply && <ChatBubble>{ticket.admin_reply}</ChatBubble>}

              {msgs.map((m) => (
                <ChatBubble key={m.id} mine={m.sender === "user"} time={fmtDate(m.created_at)} hasText={!!m.body && m.body.trim().length > 0}>
                  {m.body}
                  {thumbs((m.images || []).map((p) => urls[p] || null))}
                </ChatBubble>
              ))}

              {showFollowUp && <ChatBubble auto time={fmtDate(followUpTime)}>{followUpText(name)}</ChatBubble>}
              <div ref={endRef} />
            </div>
          </Card>
        </div>
      </div>

      {!closed && (
        <div className="relative z-10 border-t-[0.5px] border-white/15 bg-[#090909]/85 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-[12px]">
          <div className="mx-auto max-w-md md:max-w-xl">
            {err && <p className="mb-2 rounded-2xl bg-rose-500/10 px-4 py-2 text-[13px] font-medium text-rose-300">{err}</p>}
            {files.length > 0 && (
              <div className="mb-3 flex gap-3">
                {files.map((f, i) => (
                  <div key={f.url} className="relative h-16 w-16">
                    <img src={f.url} alt={`Ảnh ${i + 1}`} className="h-full w-full rounded-2xl object-cover" />
                    <button type="button" onClick={() => removeFile(i)} aria-label="Xoá ảnh"
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#34e58a] text-[#090909]">
                      <Icon name="x" size={13} stroke={3} />
                    </button>
                  </div>
                ))}
              </div>
            )}
               <div className="flex items-end gap-2">
              <button type="button" onClick={() => pick.current?.click()} disabled={files.length >= MAX_IMAGES} aria-label="Thêm ảnh"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition active:bg-white/10 disabled:opacity-40">
                <Icon name="camera" size={22} />
              </button>
              <input ref={pick} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
              <textarea value={text} rows={1} maxLength={1000} onChange={(e) => setText(e.target.value)} placeholder="Nhập tin nhắn..."
                className="max-h-28 min-h-[40px] flex-1 resize-none rounded-[20px] border border-white/10 bg-white/10 px-4 py-2 text-[15px] font-light text-white outline-none placeholder:text-white/40 focus:border-[#34e58a]/60 focus:ring-1 focus:ring-[#34e58a]/60" />
              <button onClick={send} disabled={(!text.trim() && files.length === 0) || busy} aria-label="Gửi"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#34e58a] text-[#090909] shadow-[0_0_20px_rgba(52,229,138,0.35)] transition active:scale-95 disabled:bg-white/10 disabled:text-white/35 disabled:shadow-none">
                <Icon name="send" size={17} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    {view && <Lightbox url={view} onClose={() => setView(null)} />}
    </>
  );
}
