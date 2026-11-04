// src/pages/help/HelpRequest.jsx — form gửi yêu cầu hỗ trợ
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient.js";
import { Icon, ring } from "./HelpUI.jsx";
import { Screen, MAX_IMAGES, MAX_MB } from "./HelpScreen.jsx";
import { CATEGORIES, REQUEST_TYPES, ATTACH_BUCKET, ZALO_URL, fmtDate, makeTicketCode } from "./helpData.js";

export { HistoryFlow } from "./HelpHistory.jsx";

/* ---------- Thẻ chọn loại yêu cầu ---------- */
function TypeCard({ on, title, sub, onSelect, children }) {
  return (
    <div className={`rounded-xl bg-[#ffffff] p-6 transition ${on ? "ring-[1.5px] ring-[#2b59e0]" : ""}`}>
      <button type="button" onClick={onSelect} aria-pressed={on} className="flex w-full items-start gap-4 text-left">
        <span className="min-w-0 flex-1">
          <span className="block text-[22px] font-semibold leading-tight tracking-[-0.5px] text-[#16213e]">{title}</span>
          <span className="mt-1.5 block text-[16px] leading-6 text-[#6b7488]">{sub}</span>
        </span>
        <span className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${on ? "border-[#2b59e0] bg-[#2b59e0] text-white" : "border-[#16213e]/25"}`}>
          {on && <Icon name="check" size={15} stroke={3.5} />}
        </span>
      </button>
      {on && <div className="mt-5 space-y-5 border-t border-[#16213e]/10 pt-5">{children}</div>}
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
        <div className="rounded-xl bg-[#ffffff] px-6 py-10 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#dbe7ff] text-[#16213e]">
            <Icon name="check" size={30} stroke={3} />
          </span>
          <p className="mt-5 text-[22px] font-semibold tracking-[-0.5px] text-[#16213e]">NXX315 đã nhận yêu cầu</p>
          <p className="mt-2 text-[16px] text-[#6b7488]">Mã yêu cầu <span className="font-semibold text-[#16213e]">#{doneCode}</span></p>
          <p className="mt-1 text-[14px] text-[#6b7488]">Phản hồi sẽ hiện trong Lịch sử yêu cầu.</p>
          <div className="mt-7 flex gap-3">
            <button onClick={onClose} className="flex-1 rounded-xl bg-[#eef2f9] py-3.5 text-[16px] font-semibold text-[#16213e]">Về Trợ giúp</button>
            <button onClick={onHistory} className="flex-1 rounded-xl bg-[#2b59e0] py-3.5 text-[16px] font-semibold text-white">Xem lịch sử</button>
          </div>
        </div>
      </Screen>
    );
  }

  const chip = (on) =>
    `rounded-full px-4 py-2.5 text-[15px] font-medium transition active:scale-95 ${on ? "bg-[#2b59e0] text-white" : "bg-[#eef2f9] text-[#16213e]"}`;

  return (
    <Screen
      title="Gửi yêu cầu"
      onClose={onClose}
      right={
        <button onClick={onHistory} aria-label="Lịch sử yêu cầu"
          className={`flex h-11 w-11 items-center justify-center rounded-full bg-[#ffffff] text-[#16213e] ${ring}`}>
          <Icon name="history" size={19} />
        </button>
      }
      footer={
        <>
          {err && <p className="mb-2 rounded-2xl bg-rose-50 px-4 py-2.5 text-[13px] font-medium text-rose-600">{err}</p>}
          <button onClick={submit} disabled={!ready || busy}
            className="h-14 w-full rounded-xl bg-[#2b59e0] text-[18px] font-semibold text-white transition active:scale-[0.99] disabled:bg-[#16213e]/10 disabled:text-[#16213e]/35">
            {busy ? "Đang gửi..." : "Gửi"}
          </button>
        </>
      }
    >
      {tip && (
        <div className="flex gap-3 rounded-xl bg-[#eaf1ff] p-5">
          <div className="min-w-0 flex-1">
            <p className="text-[16px] leading-6 text-[#16213e]">Cần câu trả lời ngay? Hỏi trợ lý AI hoặc nhắn Zalo để được hỗ trợ nhanh hơn.</p>
            <div className="mt-3 flex gap-6 text-[16px] font-semibold text-[#16213e]">
              <button onClick={onChat} className="underline underline-offset-4">Trợ lý AI</button>
              <a href={ZALO_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Nhắn Zalo</a>
            </div>
          </div>
          <button onClick={() => setTip(false)} aria-label="Đóng" className="h-7 w-7 shrink-0 text-[#16213e]"><Icon name="x" size={19} /></button>
        </div>
      )}

      {about && (
        <p className="px-1 text-[14px] leading-5 text-[#6b7488]">
          Liên quan đến câu hỏi: <span className="font-medium text-[#16213e]">{about}</span>
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
              <p className="mb-2 text-[14px] text-[#6b7488]">Đơn liên quan (không bắt buộc)</p>
              <div className="space-y-2">
                {orders.slice(0, 3).map((o) => {
                  const on = orderId === o.id;
                  return (
                    <button key={o.id} type="button" onClick={() => setOrderId(on ? null : o.id)}
                      className={`flex w-full items-center gap-3 rounded-[20px] px-4 py-3 text-left transition ${on ? "bg-[#eaf1ff]" : "bg-[#eef2f9]"}`}>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[16px] font-semibold text-[#16213e]">{o.package_name}</span>
                        <span className="block truncate text-[13px] text-[#6b7488]">{o.order_code || "—"} · {fmtDate(o.created_at)}</span>
                      </span>
                      {on && <Icon name="check" size={18} stroke={3} className="text-[#16213e]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <label className="relative block">
            <span className="absolute -top-2.5 left-4 bg-[#ffffff] px-1.5 text-[13px] font-medium text-[#6b7488]">
              Mô tả chi tiết<span className="text-rose-500">*</span>
            </span>
            <textarea
              value={desc}
              maxLength={500}
              rows={5}
              onChange={(e) => setDesc(e.target.value)}
              placeholder={t.key === "idea" ? "Bạn muốn NXX315 thay đổi hoặc thêm gì?" : "Mô tả vấn đề bạn gặp. Nhớ ghi tên Roblox nếu liên quan."}
              className="w-full resize-none rounded-[20px] border border-[#16213e]/20 bg-transparent px-4 pb-8 pt-4 text-[16px] leading-6 text-[#16213e] outline-none transition placeholder:text-[#6b7488] focus:border-[#2b59e0] focus:ring-1 focus:ring-[#2b59e0]"
            />
            <span className="absolute bottom-3 right-4 text-[13px] text-[#6b7488]">{desc.length}/500</span>
          </label>

          <div>
            <div className="flex flex-wrap gap-3">
              {files.map((f, i) => (
                <div key={f.url} className="relative h-20 w-20">
                  <img src={f.url} alt={`Ảnh ${i + 1}`} className="h-full w-full rounded-[18px] object-cover" />
                  <button type="button" onClick={() => removeFile(i)} aria-label="Xoá ảnh"
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#2b59e0] text-white">
                    <Icon name="x" size={13} stroke={3} />
                  </button>
                </div>
              ))}
              {files.length < MAX_IMAGES && (
                <button type="button" onClick={() => pick.current?.click()}
                  className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-[18px] border border-dashed border-[#16213e]/30 text-[#16213e] transition active:bg-[#eef2f9]">
                  <Icon name="camera" size={22} />
                  <span className="text-[12px] font-medium">Thêm ảnh</span>
                </button>
              )}
              <input ref={pick} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
            </div>
            <p className="mt-2 text-[13px] text-[#6b7488]">Tối đa {MAX_IMAGES} ảnh, mỗi ảnh {MAX_MB}MB.</p>
          </div>
        </TypeCard>
      ))}
    </Screen>
  );
}
  
