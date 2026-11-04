// src/pages/help/HelpRequest.jsx — trang gửi yêu cầu (kiểu MoMo) + lịch sử yêu cầu (gộp từ HelpSheets)
import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient.js";
import { Icon, IconBox } from "./HelpUI.jsx";
import { CATEGORIES, REQUEST_TYPES, TICKET_STATUS, ATTACH_BUCKET, ZALO_URL, fmtDate, makeTicketCode } from "./helpData.js";

const MAX_IMAGES = 3;
const MAX_MB = 5;

/* ---------- Khung toàn màn hình dùng chung ---------- */
function Screen({ title, onClose, right, footer, children }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  const round = "flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-sm transition active:bg-white dark:bg-slate-800 dark:text-slate-100";
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-950">
      <div className="bg-gradient-to-b from-emerald-100 to-slate-50 dark:from-emerald-950 dark:to-slate-950">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 pb-3 pt-3 md:max-w-xl">
          <button onClick={onClose} className={round} aria-label="Quay lại"><Icon name="back" size={19} /></button>
          <h1 className="flex-1 text-[18px] font-semibold text-slate-900 dark:text-white">{title}</h1>
          {right}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-md space-y-4 px-4 pb-6 pt-1 md:max-w-xl">{children}</div>
      </div>
      {footer && (
        <div className="border-t border-slate-200 bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto max-w-md md:max-w-xl">{footer}</div>
        </div>
      )}
    </div>
  );
}

/* ---------- Thẻ chọn loại yêu cầu (radio) ---------- */
function TypeCard({ on, title, sub, onSelect, children }) {
  return (
    <div className={`rounded-2xl bg-white p-4 transition dark:bg-slate-900 ${on ? "border border-emerald-600 shadow-sm" : "border border-transparent"}`}>
      <button type="button" onClick={onSelect} aria-pressed={on} className="flex w-full items-start gap-3 text-left">
        <span className="min-w-0 flex-1">
          <span className="block text-[17px] font-semibold text-slate-900 dark:text-white">{title}</span>
          <span className="mt-1 block text-[13.5px] leading-5 text-slate-500">{sub}</span>
        </span>
        <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${on ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300"}`}>
          {on && <Icon name="check" size={14} stroke={3.5} />}
        </span>
      </button>
      {on && <div className="mt-4 space-y-4 border-t border-dashed border-slate-200 pt-4 dark:border-slate-700">{children}</div>}
    </div>
  );
}

/* ---------- FORM GỬI YÊU CẦU ---------- */
export function RequestScreen({ preset = {}, orders = [], onClose, onHistory, onChat }) {
  const [type, setType] = useState(preset.type || "support");
  const [cat, setCat] = useState(preset.category || null);
  const [orderId, setOrderId] = useState(preset.orderId || null);
  const [desc, setDesc] = useState(preset.description || "");
  const [files, setFiles] = useState([]); // [{file, url}]
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
      const next = [...cur, ...ok].slice(0, MAX_IMAGES);
      [...cur, ...ok].slice(MAX_IMAGES).forEach((x) => URL.revokeObjectURL(x.url));
      return next;
    });
  };
  const removeFile = (i) => {
    setFiles((cur) => { URL.revokeObjectURL(cur[i].url); return cur.filter((_, k) => k !== i); });
  };

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
      user_id: user.id,
      ticket_code: code,
      title,
      category: type === "idea" ? "other" : cat,
      type,
      description,
      images: paths,
    });
    setBusy(false);
    if (error) return setErr(`Chưa gửi được, thử lại sau nhé. (${error.message})`);
    setDoneCode(code);
  };

  /* --- Màn hình thành công --- */
  if (doneCode) {
    return (
      <Screen title="Đã gửi yêu cầu" onClose={onClose}>
        <div className="rounded-2xl bg-white px-5 py-8 text-center dark:bg-slate-900">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Icon name="check" size={30} stroke={3} />
          </span>
          <p className="mt-4 text-base font-semibold text-slate-900 dark:text-white">NXX315 đã nhận yêu cầu của bạn</p>
          <p className="mt-1 text-sm text-slate-500">Mã yêu cầu: <span className="font-semibold text-emerald-700">{doneCode}</span></p>
          <p className="mt-1 text-xs text-slate-400">Phản hồi sẽ hiện trong mục Lịch sử yêu cầu.</p>
          <div className="mt-6 flex gap-3">
            <button onClick={onClose} className="flex-1 rounded-lg bg-slate-100 py-3 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">Về Trung tâm</button>
            <button onClick={onHistory} className="flex-1 rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Xem lịch sử</button>
          </div>
        </div>
      </Screen>
    );
  }

  const chip = (on) =>
    `rounded-full px-4 py-2 text-[14px] font-medium transition active:scale-95 ${
      on ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`;

  return (
    <Screen
      title="Gửi yêu cầu"
      onClose={onClose}
      right={
        <button onClick={onHistory} aria-label="Lịch sử yêu cầu"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-100">
          <Icon name="history" size={18} />
        </button>
      }
      footer={
        <>
          {err && <p className="mb-2 rounded-lg bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-600">{err}</p>}
          <button onClick={submit} disabled={!ready || busy}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-[16px] font-semibold text-white transition active:scale-[0.99] disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800">
            {busy ? "Đang gửi..." : "Gửi"}
          </button>
        </>
      }
    >
      {tip && (
        <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <IconBox name="chat" size={18} />
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] leading-5 text-slate-700 dark:text-slate-200">Cần câu trả lời ngay? Hỏi trợ lý AI hoặc nhắn Zalo để được hỗ trợ nhanh hơn.</p>
            <div className="mt-2 flex gap-5 text-[14px] font-semibold text-emerald-700 dark:text-emerald-300">
              <button onClick={onChat}>Trợ lý AI</button>
              <a href={ZALO_URL} target="_blank" rel="noopener noreferrer">Nhắn Zalo</a>
            </div>
          </div>
          <button onClick={() => setTip(false)} aria-label="Đóng" className="h-6 w-6 shrink-0 text-slate-500"><Icon name="x" size={18} /></button>
        </div>
      )}

      {about && (
        <p className="rounded-lg bg-white px-3.5 py-2.5 text-[13px] leading-5 text-slate-500 dark:bg-slate-900">
          Liên quan đến câu hỏi: <span className="font-medium text-slate-700 dark:text-slate-200">{about}</span>
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
              <p className="mb-2 text-xs font-medium text-slate-500">Đơn liên quan (không bắt buộc)</p>
              <div className="space-y-2">
                {orders.slice(0, 3).map((o) => {
                  const on = orderId === o.id;
                  return (
                    <button key={o.id} type="button" onClick={() => setOrderId(on ? null : o.id)}
                      className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition ${on ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" : "border-slate-200 dark:border-slate-700"}`}>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium text-slate-900 dark:text-white">{o.package_name}</span>
                        <span className="block truncate text-xs text-slate-500">{o.order_code || "—"} · {fmtDate(o.created_at)}</span>
                      </span>
                      {on && <Icon name="check" size={16} stroke={3} className="text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <label className="relative block">
            <span className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-slate-500 dark:bg-slate-900">
              Mô tả chi tiết<span className="text-rose-500">*</span>
            </span>
            <textarea
              value={desc}
              maxLength={500}
              rows={5}
              onChange={(e) => setDesc(e.target.value)}
              placeholder={t.key === "idea" ? "Bạn muốn NXX315 thay đổi hoặc thêm gì?" : "Mô tả vấn đề bạn gặp. Nhớ ghi tên Roblox nếu liên quan."}
              className="w-full resize-none rounded-xl border border-slate-300 bg-transparent px-4 pb-7 pt-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-600 dark:text-white"
            />
            <span className="absolute bottom-2.5 right-4 text-xs text-slate-400">{desc.length}/500</span>
          </label>

          <div className="flex flex-wrap gap-3">
            {files.map((f, i) => (
              <div key={f.url} className="relative h-20 w-20">
                <img src={f.url} alt={`Ảnh ${i + 1}`} className="h-full w-full rounded-lg object-cover" />
                <button type="button" onClick={() => removeFile(i)} aria-label="Xoá ảnh"
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-white shadow">
                  <Icon name="x" size={13} stroke={3} />
                </button>
              </div>
            ))}
            {files.length < MAX_IMAGES && (
              <button type="button" onClick={() => pick.current?.click()}
                className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-emerald-400 text-emerald-700 transition active:bg-emerald-50 dark:text-emerald-300">
                <Icon name="camera" size={22} />
                <span className="text-[12px] font-medium">Thêm ảnh</span>
              </button>
            )}
            <input ref={pick} type="file" accept="image/*" multiple hidden
              onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
          </div>
          <p className="-mt-1 text-xs text-slate-400">Tối đa {MAX_IMAGES} ảnh, mỗi ảnh {MAX_MB}MB.</p>
        </TypeCard>
      ))}
    </Screen>
  );
}

/* ================= LỊCH SỬ YÊU CẦU (nhóm → danh sách → chat) ================= */
const groupKey = (t) => (t.type === "idea" ? "idea" : t.category || "other");
const groupLabel = (k) => (k === "idea" ? "Góp ý ý tưởng" : CATEGORIES.find((c) => c.key === k)?.label || "Khác");
const statusOf = (s) => TICKET_STATUS[s] || { label: s, cls: "bg-slate-100 text-slate-500" };

function Chip({ status }) {
  const st = statusOf(status);
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${st.cls}`}>{st.label}</span>;
}

function GroupCard({ label, items, onOpenGroup, onOpenTicket }) {
  return (
    <section className="rounded-2xl bg-white p-4 dark:bg-slate-900">
      <button onClick={onOpenGroup} className="flex w-full items-start gap-3 text-left">
        <span className="mt-0.5 text-emerald-600"><Icon name="folder" size={22} /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] text-slate-500">{label}</span>
          <span className="mt-0.5 block truncate text-[16px] font-semibold text-slate-900 dark:text-white">{items[0].title}</span>
          <span className="mt-0.5 block text-xs text-slate-400">{items.length} yêu cầu</span>
        </span>
        <Icon name="chevR" size={18} className="mt-1 shrink-0 text-slate-400" />
      </button>
      <div className="-mx-1 mt-3 flex snap-x gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {items.map((t) => (
          <button key={t.id} onClick={() => onOpenTicket(t)}
            className="min-w-[78%] snap-start rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-left dark:border-slate-700 dark:bg-slate-800/60">
            <span className="flex items-start justify-between gap-2">
              <span>
                <span className="block text-[15px] font-semibold text-slate-800 dark:text-slate-100">#{t.ticket_code}</span>
                <span className="mt-0.5 block text-xs text-slate-400">{fmtDate(t.created_at)}</span>
              </span>
              <Chip status={t.status} />
            </span>
            <span className="mt-3 block truncate border-t border-slate-200 pt-2.5 text-[13.5px] text-slate-500 dark:border-slate-700">{t.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function TicketRow({ t, onOpen }) {
  return (
    <button onClick={() => onOpen(t)} className="flex w-full items-center gap-3 rounded-xl bg-white p-4 text-left transition active:bg-slate-50 dark:bg-slate-900">
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold text-slate-900 dark:text-white">{t.title}</span>
        <span className="mt-1 block text-xs text-slate-500">Mã: #{t.ticket_code}</span>
        <span className="mt-0.5 block text-xs text-slate-400">{fmtDate(t.created_at)}</span>
      </span>
      <Chip status={t.status} />
      <Icon name="chevR" size={16} className="shrink-0 text-slate-300" />
    </button>
  );
}

function ChatBubble({ mine, time, label, children }) {
  if (mine) {
    return (
      <div className="flex flex-col items-end">
        {time && <span className="mb-1 text-xs text-slate-400">{time}</span>}
        <div className="max-w-[85%] space-y-2 whitespace-pre-line rounded-2xl rounded-tr-md bg-emerald-600 px-4 py-2.5 text-[14.5px] leading-6 text-white">{children}</div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[13px] font-bold text-emerald-700">N</span>
      <div className="min-w-0 max-w-[85%]">
        <p className="mb-1 text-xs text-slate-400"><span className="font-semibold text-slate-600 dark:text-slate-300">{label || "CSKH"}</span>{time ? ` ${time}` : ""}</p>
        <div className="whitespace-pre-line rounded-2xl rounded-tl-md bg-slate-100 px-4 py-2.5 text-[14.5px] leading-6 text-slate-800 dark:bg-slate-800 dark:text-slate-100">{children}</div>
      </div>
    </div>
  );
}

function ChatScreen({ ticket, onClose }) {
  const [msgs, setMsgs] = useState([]);
  const [imgs, setImgs] = useState([]);
  const [info, setInfo] = useState(true);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.from("support_messages").select("id,sender,body,created_at").eq("ticket_id", String(ticket.id)).order("created_at", { ascending: true });
      if (alive) setMsgs(data || []);
    })();
    const ch = supabase
      .channel(`ticket-${ticket.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages", filter: `ticket_id=eq.${ticket.id}` },
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

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [msgs.length, imgs.length]);

  const send = async () => {
    const body = text.trim();
    if (!body || busy) return;
    setErr("");
    setBusy(true);
    const { data: s } = await supabase.auth.getSession();
    const uid = s?.session?.user?.id;
    if (!uid) { setBusy(false); return setErr("Bạn cần đăng nhập để nhắn tin."); }
    const { data, error } = await supabase.from("support_messages")
      .insert({ ticket_id: String(ticket.id), user_id: uid, sender: "user", body })
      .select("id,sender,body,created_at").single();
    setB
