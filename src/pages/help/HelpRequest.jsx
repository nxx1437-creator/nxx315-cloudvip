// src/pages/help/HelpRequest.jsx — gửi yêu cầu + lịch sử (nhóm → danh sách → chat)
import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient.js";
import { Icon, StatusDot, ring } from "./HelpUI.jsx";
import { CATEGORIES, REQUEST_TYPES, TICKET_STATUS, ATTACH_BUCKET, CSKH_AVATAR, CSKH_NAME, ZALO_URL, fmtDate, makeTicketCode } from "./helpData.js";

const MAX_IMAGES = 3;
const MAX_MB = 5;
const statusOf = (s) => TICKET_STATUS[s] || { label: s, dot: "bg-slate-400" };

/* ---------- Khung toàn màn hình ---------- */
function Screen({ title, big = true, onClose, right, footer, children }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#e9ecee]">
      <div className="mx-auto w-full max-w-md px-4 pt-3 md:max-w-xl">
        <div className="flex items-center gap-3">
          <button onClick={onClose} aria-label="Quay lại"
            className={`flex h-11 w-11 items-center justify-center rounded-full bg-[#fafbfb] text-[#20282b] ${ring}`}>
            <Icon name="back" size={20} />
          </button>
          {big ? <span className="flex-1" /> : <h1 className="flex-1 text-[20px] font-semibold tracking-[-0.3px] text-[#20282b]">{title}</h1>}
          {right}
        </div>
        {big && <h1 className="mt-5 text-[34px] font-semibold leading-[1.05] tracking-[-1px] text-[#20282b]">{title}</h1>}
      </div>
      <div className="pointer-events-none relative z-10 -mb-5 h-5 bg-gradient-to-b from-[#e9ecee] to-transparent" />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-md space-y-4 px-4 pb-8 pt-5 md:max-w-xl">{children}</div>
      </div>
      {footer && (
        <div className="border-t border-[#20282b]/5 bg-white/85 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-[9px]">
          <div className="mx-auto max-w-md md:max-w-xl">{footer}</div>
        </div>
      )}
    </div>
  );
}

/* ---------- Thẻ chọn loại yêu cầu ---------- */
function TypeCard({ on, title, sub, onSelect, children }) {
  return (
    <div className={`rounded-[30px] bg-[#fafbfb] p-6 transition ${on ? "ring-[1.5px] ring-[#20282b]" : ""}`}>
      <button type="button" onClick={onSelect} aria-pressed={on} className="flex w-full items-start gap-4 text-left">
        <span className="min-w-0 flex-1">
          <span className="block text-[22px] font-semibold leading-tight tracking-[-0.5px] text-[#20282b]">{title}</span>
          <span className="mt-1.5 block text-[16px] leading-6 text-[#6a6b6f]">{sub}</span>
        </span>
        <span className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${on ? "border-[#20282b] bg-[#20282b] text-white" : "border-[#20282b]/25"}`}>
          {on && <Icon name="check" size={15} stroke={3.5} />}
        </span>
      </button>
      {on && <div className="mt-5 space-y-5 border-t border-[#20282b]/10 pt-5">{children}</div>}
    </div>
  );
}

/* ================= FORM GỬI YÊU CẦU ================= */
export function RequestScreen({ preset = {}, orders = [], onClose, onHistory, onChat }) {
  const [type, setType] = useState(preset.type || "support");
  const [cat, setCat] = useState(preset.category || null);
  const [orderId, setOrderId] = useState(preset.orderId || null);
  const [desc, setDesc] = useState(preset.description || "");
  const [files, setFiles] = useState([]);
  const [tip, setTip] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [doneCode, setDoneCode] = useState("");
  const pick = useRef(null);
  const filesRef = useRef(files);
  filesRef.current = files;
  useEffect(() => () => filesRef.current.forEach((f) => URL.revokeObjectURL(f.url)), []);

  const about = preset.about || "";
  const needOrder = type === "support" && (cat === "order" || cat === "payment") && orders.length > 0;
  const order = needOrder ? orders.find((o) => o.id === orderId) : null;
  const ready = (type === "idea" || !!cat) && desc.trim().length >= 10;

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

  const submit = async () => {
    setErr("");
    if (!ready) return;
    setBusy(true);
    const { data } = await supabase.auth.getSession();
    const user = data?.session?.user;
    if (!user) { setBusy(false); return setErr("Bạn cần đăng nhập để gửi yêu cầu."); }

    const code = makeTicketCode();
    const paths = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i].file;
      const ext = (f.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${user.id}/${code}-${i + 1}.${ext}`;
      const { error: upErr } = await supabase.storage.from(ATTACH_BUCKET).upload(path, f, { contentType: f.type });
      if (upErr) { setBusy(false); return setErr(`Chưa tải được ảnh ${i + 1}, thử lại sau nhé.`); }
      paths.push(path);
    }

    const catRow = CATEGORIES.find((c) => c.key === cat);
    const head = [order && `[Đơn ${order.order_code || ""} - ${order.package_name}]`, about && `[Câu hỏi: ${about}]`].filter(Boolean).join("\n");
    const description = (head ? `${head}\n` : "") + desc.trim();
    const title = (
      order ? `Hỏi về đơn ${order.order_code || ""}`.trim()
      : about ? `Về: ${about}`
      : `${type === "idea" ? "Góp ý" : catRow?.label || "Hỗ trợ"}: ${desc.trim()}`
    ).slice(0, 80);

    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id, ticket_code: code, title,
      category: type === "idea" ? "other" : cat,
      type, description, images: paths,
    });
    setBusy(false);
    if (error) return setErr(`Chưa gửi được, thử lại sau nhé. (${error.message})`);
    setDoneCode(code);
  };

  if (doneCode) {
    return (
      <Screen title="Đã gửi yêu cầu" onClose={onClose}>
        <div className="rounded-[30px] bg-[#fafbfb] px-6 py-10 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#a1e5e4] text-[#20282b]">
            <Icon name="check" size={30} stroke={3} />
          </span>
          <p className="mt-5 text-[22px] font-semibold tracking-[-0.5px] text-[#20282b]">NXX315 đã nhận yêu cầu</p>
          <p className="mt-2 text-[16px] text-[#6a6b6f]">Mã yêu cầu <span className="font-semibold text-[#20282b]">#{doneCode}</span></p>
          <p className="mt-1 text-[14px] text-[#6a6b6f]">Phản hồi sẽ hiện trong Lịch sử yêu cầu.</p>
          <div className="mt-7 flex gap-3">
            <button onClick={onClose} className="flex-1 rounded-full bg-[#e9ecee] py-3.5 text-[16px] font-semibold text-[#20282b]">Về Trợ giúp</button>
            <button onClick={onHistory} className="flex-1 rounded-full bg-[#20282b] py-3.5 text-[16px] font-semibold text-white">Xem lịch sử</button>
          </div>
        </div>
      </Screen>
    );
  }

  const chip = (on) =>
    `rounded-full px-4 py-2.5 text-[15px] font-medium transition active:scale-95 ${on ? "bg-[#20282b] text-white" : "bg-[#e9ecee] text-[#20282b]"}`;

  return (
    <Screen
      title="Gửi yêu cầu"
      onClose={onClose}
      right={
        <button onClick={onHistory} aria-label="Lịch sử yêu cầu"
          className={`flex h-11 w-11 items-center justify-center rounded-full bg-[#fafbfb] text-[#20282b] ${ring}`}>
          <Icon name="history" size={19} />
        </button>
      }
      footer={
        <>
          {err && <p className="mb-2 rounded-2xl bg-rose-50 px-4 py-2.5 text-[13px] font-medium text-rose-600">{err}</p>}
          <button onClick={submit} disabled={!ready || busy}
            className="h-14 w-full rounded-full bg-[#20282b] text-[18px] font-semibold text-white transition active:scale-[0.99] disabled:bg-[#20282b]/10 disabled:text-[#20282b]/35">
            {busy ? "Đang gửi..." : "Gửi"}
          </button>
        </>
      }
    >
      {tip && (
        <div className="flex gap-3 rounded-[24px] bg-[#d5efef] p-5">
          <div className="min-w-0 flex-1">
            <p className="text-[16px] leading-6 text-[#20282b]">Cần câu trả lời ngay? Hỏi trợ lý AI hoặc nhắn Zalo để được hỗ trợ nhanh hơn.</p>
            <div className="mt-3 flex gap-6 text-[16px] font-semibold text-[#20282b]">
              <button onClick={onChat} className="underline underline-offset-4">Trợ lý AI</button>
              <a href={ZALO_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Nhắn Zalo</a>
            </div>
          </div>
          <button onClick={() => setTip(false)} aria-label="Đóng" className="h-7 w-7 shrink-0 text-[#20282b]"><Icon name="x" size={19} /></button>
        </div>
      )}

      {about && (
        <p className="px-1 text-[14px] leading-5 text-[#6a6b6f]">
          Liên quan đến câu hỏi: <span className="font-medium text-[#20282b]">{about}</span>
        </p>
      )}

      {REQUEST_TYPES.map((t) => (
        <TypeCard key={t.key} on={type === t.key} title={t.title} sub={t.sub} onSelect={() => setType(t.key)}>
          {t.key === "support" && (
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c.key} type="button" onClick={() => setCat(c.key)} className={chip(cat === c.key)}>{c.label}</button>
              ))}
            </div>
          )}

          {t.key === "support" && needOrder && (
            <div>
              <p className="mb-2 text-[14px] text-[#6a6b6f]">Đơn liên quan (không bắt buộc)</p>
              <div className="space-y-2">
                {orders.slice(0, 3).map((o) => {
                  const on = orderId === o.id;
                  return (
                    <button key={o.id} type="button" onClick={() => setOrderId(on ? null : o.id)}
                      className={`flex w-full items-center gap-3 rounded-[20px] px-4 py-3 text-left transition ${on ? "bg-[#d5efef]" : "bg-[#e9ecee]"}`}>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[16px] font-semibold text-[#20282b]">{o.package_name}</span>
                        <span className="block truncate text-[13px] text-[#6a6b6f]">{o.order_code || "—"} · {fmtDate(o.created_at)}</span>
                      </span>
                      {on && <Icon name="check" size={18} stroke={3} className="text-[#20282b]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <label className="relative block">
            <span className="absolute -top-2.5 left-4 bg-[#fafbfb] px-1.5 text-[13px] font-medium text-[#6a6b6f]">
              Mô tả chi tiết<span className="text-rose-500">*</span>
            </span>
            <textarea
              value={desc}
              maxLength={500}
              rows={5}
              onChange={(e) => setDesc(e.target.value)}
              placeholder={t.key === "idea" ? "Bạn muốn NXX315 thay đổi hoặc thêm gì?" : "Mô tả vấn đề bạn gặp. Nhớ ghi tên Roblox nếu liên quan."}
              className="w-full resize-none rounded-[20px] border border-[#20282b]/20 bg-transparent px-4 pb-8 pt-4 text-[16px] leading-6 text-[#20282b] outline-none transition placeholder:text-[#6a6b6f] focus:border-[#20282b] focus:ring-1 focus:ring-[#20282b]"
            />
            <span className="absolute bottom-3 right-4 text-[13px] text-[#6a6b6f]">{desc.length}/500</span>
          </label>

          <div>
            <div className="flex flex-wrap gap-3">
              {files.map((f, i) => (
                <div key={f.url} className="relative h-20 w-20">
                  <img src={f.url} alt={`Ảnh ${i + 1}`} className="h-full w-full rounded-[18px] object-cover" />
                  <button type="button" onClick={() => removeFile(i)} aria-label="Xoá ảnh"
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#20282b] text-white">
                    <Icon name="x" size={13} stroke={3} />
                  </button>
                </div>
              ))}
              {files.length < MAX_IMAGES && (
                <button type="button" onClick={() => pick.current?.click()}
                  className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-[18px] border border-dashed border-[#20282b]/30 text-[#20282b] transition active:bg-[#e9ecee]">
                  <Icon name="camera" size={22} />
                  <span className="text-[12px] font-medium">Thêm ảnh</span>
                </button>
              )}
              <input ref={pick} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
            </div>
            <p className="mt-2 text-[13px] text-[#6a6b6f]">Tối đa {MAX_IMAGES} ảnh, mỗi ảnh {MAX_MB}MB.</p>
          </div>
        </TypeCard>
      ))}
    </Screen>
  );
}

/* ================= LỊCH SỬ YÊU CẦU ================= */
const groupKey = (t) => (t.type === "idea" ? "idea" : t.category || "other");
const groupLabel = (k) => (k === "idea" ? "Góp ý ý tưởng" : CATEGORIES.find((c) => c.key === k)?.label || "Khác");

function GroupCard({ label, items, onOpenGroup, onOpenTicket }) {
  return (
    <section className="rounded-[30px] bg-[#fafbfb] pb-5 pt-6">
      <button onClick={onOpenGroup} className="flex w-full items-start gap-3 px-6 text-left">
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] text-[#6a6b6f]">{label}</span>
          <span className="mt-1 block truncate text-[22px] font-semibold leading-tight tracking-[-0.5px] text-[#20282b]">{items[0].title}</span>
          <span className="mt-1.5 block text-[14px] text-[#6a6b6f]">{items.length} yêu cầu</span>
        </span>
        <Icon name="chevR" size={19} className="mt-2 shrink-0 text-[#6a6b6f]" />
      </button>
      <div className="mt-4 flex snap-x gap-3 overflow-x-auto px-6 [scrollbar-width:none]">
        {items.map((t) => (
          <button key={t.id} onClick={() => onOpenTicket(t)}
            className="min-w-[76%] snap-start rounded-[22px] bg-[#e9ecee] p-4 text-left">
            <span className="block text-[18px] font-semibold tracking-[-0.3px] text-[#20282b]">#{t.ticket_code}</span>
            <span className="mt-0.5 block text-[13px] text-[#6a6b6f]">{fmtDate(t.created_at)}</span>
            <span className="mt-4 flex items-center justify-between gap-3">
              <span className="min-w-0 flex-1 truncate text-[15px] text-[#4a4e52]">{t.title}</span>
              <StatusDot st={statusOf(t.status)} />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function CskhAvatar() {
  const [bad, setBad] = useState(false);
  if (CSKH_AVATAR && !bad) {
    return <img src={CSKH_AVATAR} alt={CSKH_NAME} onError={() => setBad(true)} className="h-10 w-10 shrink-0 rounded-full object-cover" />;
  }
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#a1e5e4] text-[16px] font-semibold text-[#20282b]">
      {CSKH_NAME.slice(0, 1)}
    </span>
  );
}

function Lightbox({ url, onClose }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4" onClick={onClose}>
      <button aria-label="Đóng" onClick={onClose}
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[#20282b]">
        <Icon name="x" size={20} />
      </button>
      <img src={url} alt="Ảnh đính kèm" onClick={(e) => e.stopPropagation()} className="max-h-full max-w-full rounded-2xl object-contain" />
    </div>
  );
}

function ChatBubble({ mine, time, label, auto, children, hasText }) {
  if (mine) {
    // Nếu KHÔNG có chữ (chỉ có ảnh), render ảnh trần không viền
    if (!hasText) {
      return (
        <div className="flex flex-col items-end">
          {time && <span className="mb-1.5 text-[13px] text-[#6a6b6f]">{time}</span>}
          <div className="max-w-[88%]">{children}</div>
        </div>
      );
    }
    
    // Nếu CÓ chữ, giữ nguyên bong bóng chat màu xanh
    return (
      <div className="flex flex-col items-end">
        {time && <span className="mb-1.5 text-[13px] text-[#6a6b6f]">{time}</span>}
        <div className="max-w-[88%] space-y-2 whitespace-pre-line break-words rounded-[22px] rounded-br-md bg-[#a1e5e4] px-4 py-3 text-[16px] leading-6 text-[#20282b]">{children}</div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3">
      <CskhAvatar />
      <div className="min-w-0 max-w-[88%]">
        <p className="mb-1.5 text-[13px] text-[#6a6b6f]"><span className="font-semibold text-[#20282b]">{label || CSKH_NAME}</span>{time ? `  ${time}` : ""}</p>
        <div className="whitespace-pre-line break-words rounded-[22px] rounded-tl-md bg-[#e9ecee] px-4 py-3 text-[16px] leading-6 text-[#20282b]">
          {auto && <span className="mb-2 block w-fit rounded-full bg-[#d5efef] px-3 py-1 text-[13px] font-medium text-[#20282b]">Tin nhắn tự động</span>}
          {children}
        </div>
      </div>
    </div>
  );
}

const AUTO_REPLY = "Xin chào bạn,\nNXX315 đã nhận được yêu cầu của bạn. Đội ngũ CSKH sẽ phản hồi tại đây sớm nhất có thể. Bạn có thể nhắn thêm thông tin bất cứ lúc nào.";

function ChatScreen({ ticket, onClose }) {
  const [msgs, setMsgs] = useState([]);
  const [imgs, setImgs] = useState([]);
  const [info, setInfo] = useState(true);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const endRef = useRef(null);
  const pick = useRef(null);
  const [view, setView] = useState(null);
  const [files, setFiles] = useState([]);
  const [urls, setUrls] = useState({});
  const filesRef = useRef(files);
  filesRef.current = files;
  useEffect(() => () => filesRef.current.forEach((f) => URL.revokeObjectURL(f.url)), []);

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

  const send = async () => {
    const body = text.trim();
    if ((!body && files.length === 0) || busy) return;
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
            <span key={i} className="h-28 w-28 animate-pulse rounded-2xl bg-black/5" />
          )
        )}
      </span>
    ) : null;

  const row = "flex items-center justify-between gap-4 border-t border-[#20282b]/10 py-4 text-[17px]";
  return (
    <>
    <Screen
      title="Chi tiết yêu cầu"
      big={false}
      onClose={onClose}
      footer={
        <>
          {err && <p className="mb-2 rounded-2xl bg-rose-50 px-4 py-2 text-[13px] font-medium text-rose-600">{err}</p>}
          {files.length > 0 && (
            <div className="mb-3 flex gap-3">
              {files.map((f, i) => (
                <div key={f.url} className="relative h-16 w-16">
                  <img src={f.url} alt={`Ảnh ${i + 1}`} className="h-full w-full rounded-2xl object-cover" />
                  <button type="button" onClick={() => removeFile(i)} aria-label="Xoá ảnh"
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#20282b] text-white">
                    <Icon name="x" size={13} stroke={3} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2">
            <button type="button" onClick={() => pick.current?.click()} disabled={files.length >= MAX_IMAGES} aria-label="Thêm ảnh"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#20282b] transition active:bg-[#e9ecee] disabled:opacity-40">
              <Icon name="camera" size={24} />
            </button>
            <input ref={pick} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
            <textarea value={text} rows={1} maxLength={1000} onChange={(e) => setText(e.target.value)} placeholder="Nhập tin nhắn..."
              className="max-h-28 min-h-[44px] flex-1 resize-none rounded-[22px] bg-[#e9ecee] px-4 py-2.5 text-[16px] text-[#20282b] outline-none placeholder:text-[#6a6b6f] focus:ring-1 focus:ring-[#20282b]" />
            <button onClick={send} disabled={(!text.trim() && files.length === 0) || busy} aria-label="Gửi"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#20282b] text-white transition active:scale-95 disabled:bg-[#20282b]/10 disabled:text-[#20282b]/35">
              <Icon name="send" size={18} />
            </button>
          </div>
        </>
      }
    >
      <section className="rounded-[30px] bg-[#fafbfb] px-6">
        <button onClick={() => setInfo(!info)} className="flex w-full items-center justify-between gap-3 py-5 text-left">
          <span className="text-[22px] font-semibold leading-tight tracking-[-0.5px] text-[#20282b]">{ticket.title}</span>
          <Icon name="chevD" size={20} className={`shrink-0 text-[#6a6b6f] transition-transform ${info ? "rotate-180" : ""}`} />
        </button>
                {info && (
          <>
            <div className={row}><span className="text-[#6a6b6f]">Mã yêu cầu</span><span className="font-semibold text-[#20282b]">#{ticket.ticket_code}</span></div>
            <div className={row}><span className="text-[#6a6b6f]">Thời gian gửi</span><span className="font-semibold text-[#20282b]">{fmtDate(ticket.created_at)}</span></div>
            <div className={row}><span className="text-[#6a6b6f]">Trạng thái</span><StatusDot st={statusOf(ticket.status)} /></div>
          </>
        )}
      </section>

      <section className="rounded-[30px] bg-[#fafbfb] p-6">
        <h2 className="border-b border-[#20282b]/10 pb-4 text-[22px] font-semibold tracking-[-0.5px] text-[#20282b]">Chi tiết vấn đề</h2>
        <div className="space-y-6 pt-5">
          <ChatBubble 
            mine 
            time={fmtDate(ticket.created_at)} 
            hasText={!!ticket.description && ticket.description.trim().length > 0}
          >
            {ticket.description}
            {thumbs(imgs)}
          </ChatBubble>
          
          <ChatBubble auto time={fmtDate(ticket.created_at)}>{AUTO_REPLY}</ChatBubble>
          {ticket.admin_reply && <ChatBubble>{ticket.admin_reply}</ChatBubble>}
          
          {msgs.map((m) => (
            <ChatBubble 
              key={m.id} 
              mine={m.sender === "user"} 
              time={fmtDate(m.created_at)}
              hasText={!!m.body && m.body.trim().length > 0}
            >
              {m.body}
              {thumbs((m.images || []).map((p) => urls[p] || null))}
            </ChatBubble>
          ))}
          <div ref={endRef} />
        </div>
      </section>
    </Screen>
    {view && <Lightbox url={view} onClose={() => setView(null)} />}
    </>
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
        .select("id,ticket_code,title,category,type,status,description,images,admin_reply,created_at")
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
        <div className="divide-y divide-[#20282b]/10 overflow-hidden rounded-[30px] bg-[#fafbfb]">
          {(g?.items || []).map((t) => (
            <button key={t.id} onClick={() => push({ s: "chat", ticket: t })} className="flex w-full items-center gap-3 px-6 py-5 text-left transition active:bg-[#e9ecee]">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[18px] font-semibold tracking-[-0.3px] text-[#20282b]">{t.title}</span>
                <span className="mt-1 block text-[14px] text-[#6a6b6f]">#{t.ticket_code} · {fmtDate(t.created_at)}</span>
                <span className="mt-2 block"><StatusDot st={statusOf(t.status)} /></span>
              </span>
              <Icon name="chevR" size={17} className="shrink-0 text-[#6a6b6f]" />
            </button>
          ))}
        </div>
      </Screen>
    );
  }

  return (
    <Screen title="Lịch sử yêu cầu" onClose={onClose}>
      {rows === null && [0, 1].map((i) => <div key={i} className="h-44 animate-pulse rounded-[30px] bg-[#fafbfb]" />)}
      {rows && rows.length === 0 && (
        <div className="rounded-[30px] bg-[#fafbfb] px-6 py-12 text-center">
          <p className="text-[20px] font-semibold tracking-[-0.4px] text-[#20282b]">Bạn chưa gửi yêu cầu nào</p>
          <button onClick={onNew} className="mt-5 rounded-full bg-[#20282b] px-6 py-3 text-[16px] font-semibold text-white">Gửi yêu cầu đầu tiên</button>
        </div>
      )}
      {groups.map((g) => (
        <GroupCard key={g.key} label={g.label} items={g.items}
          onOpenGroup={() => push({ s: "group", key: g.key })} onOpenTicket={(t) => push({ s: "chat", ticket: t })} />
      ))}
      {rows && rows.length > 0 && <p className="px-2 text-[14px] leading-5 text-[#6a6b6f]">Yêu cầu sau 6 tháng sẽ được tự động ẩn để bạn dễ quản lý hơn.</p>}
    </Screen>
  );
}
