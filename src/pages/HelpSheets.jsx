// src/pages/help/HelpSheets.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase.js";
import Icon from "./HelpIcons.jsx";
import { CATEGORIES, TICKET_STATUS, fmtDate, makeTicketCode } from "./helpData.js";

function Sheet({ title, onClose, children }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setShow(true));
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, []);
  const close = () => {
    setShow(false);
    setTimeout(onClose, 220);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        onClick={close}
        className={`absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-200 ${show ? "opacity-100" : "opacity-0"}`}
      />
      <div
        className={`relative flex max-h-[90vh] w-full max-w-md flex-col rounded-t-[28px] bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-slate-900 md:max-w-xl ${
          show ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
        <div className="flex items-center justify-between px-5 pb-2 pt-3">
          <h3 className="text-[17px] font-extrabold text-slate-800 dark:text-white">{title}</h3>
          <button onClick={close} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800">
            <Icon name="x" size={16} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-8">{children(close)}</div>
      </div>
    </div>
  );
}

// ================= FORM GỬI YÊU CẦU =================
export function TicketSheet({ preset = {}, onClose, onHistory }) {
  const [cat, setCat] = useState(preset.category || "other");
  const [title, setTitle] = useState(preset.title || "");
  const [desc, setDesc] = useState(preset.description || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [doneCode, setDoneCode] = useState("");

  const submit = async () => {
    setErr("");
    if (title.trim().length < 5) return setErr("Tiêu đề cần ít nhất 5 ký tự.");
    if (desc.trim().length < 10) return setErr("Hãy mô tả chi tiết hơn một chút (ít nhất 10 ký tự).");
    setBusy(true);
    const { data } = await supabase.auth.getSession();
    const user = data?.session?.user;
    if (!user) {
      setBusy(false);
      return setErr("Bạn cần đăng nhập để gửi yêu cầu.");
    }
    const code = makeTicketCode();
    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id,
      ticket_code: code,
      title: title.trim(),
      category: cat,
      description: desc.trim(),
    });
    setBusy(false);
    if (error) return setErr(`Chưa gửi được, thử lại sau nhé. (${error.message})`);
    setDoneCode(code);
  };

  const input =
    "w-full rounded-2xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-800 ring-1 ring-slate-200 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-pink-300 dark:bg-slate-800 dark:text-white dark:ring-slate-700";

  return (
    <Sheet title={doneCode ? "Đã gửi yêu cầu" : "Gửi yêu cầu hỗ trợ"} onClose={onClose}>
      {(close) =>
        doneCode ? (
          <div className="py-6 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg">
              <Icon name="check" size={30} stroke={3} />
            </span>
            <p className="mt-4 text-base font-extrabold text-slate-800 dark:text-white">NXX315 đã nhận yêu cầu của bạn</p>
            <p className="mt-1 text-sm text-slate-500">
              Mã yêu cầu: <span className="font-black text-pink-600">{doneCode}</span>
            </p>
            <p className="mt-1 text-xs text-slate-400">Bạn có thể theo dõi phản hồi trong mục Lịch sử.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={close} className="flex-1 rounded-2xl bg-slate-100 py-3 text-sm font-extrabold text-slate-600">
                Đóng
              </button>
              <button
                onClick={() => {
                  close();
                  setTimeout(onHistory, 260);
                }}
                className="flex-1 rounded-2xl bg-gradient-to-r from-pink-500 to-fuchsia-500 py-3 text-sm font-extrabold text-white"
              >
                Xem lịch sử
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div>
              <p className="mb-2 text-xs font-extrabold text-slate-500">Chủ đề</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setCat(c.key)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold transition ${
                      cat === c.key ? "bg-pink-500 text-white shadow" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-extrabold text-slate-500">Tiêu đề</p>
              <input value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder="Ví dụ: Đơn chưa nhận được hàng" className={input} />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-extrabold text-slate-500">Mô tả chi tiết</p>
                <span className="text-[11px] text-slate-400">{desc.length}/1000</span>
              </div>
              <textarea
                value={desc}
                maxLength={1000}
                rows={5}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Bạn gặp vấn đề gì? Nhớ ghi mã đơn / tên Roblox nếu có nhé."
                className={`${input} resize-none`}
              />
            </div>
            {err && <p className="rounded-2xl bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-600">{err}</p>}
            <button
              onClick={submit}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-fuchsia-500 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-pink-500/30 transition active:scale-[0.98] disabled:opacity-60"
            >
              <Icon name="send" size={16} />
              {busy ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
          </div>
        )
      }
    </Sheet>
  );
}

// ================= LỊCH SỬ YÊU CẦU =================
export function HistorySheet({ onClose, onNew }) {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      const uid = s?.session?.user?.id;
      if (!uid) return setRows([]);
      const { data } = await supabase
        .from("support_tickets")
        .select("id,ticket_code,title,category,status,admin_reply,created_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(20);
      setRows(data || []);
    })();
  }, []);

  return (
    <Sheet title="Lịch sử yêu cầu" onClose={onClose}>
      {(close) => (
        <div className="space-y-3 pt-2">
          {rows === null && [0, 1].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />)}
          {rows && rows.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Bạn chưa gửi yêu cầu nào</p>
              <button
                onClick={() => {
                  close();
                  setTimeout(onNew, 260);
                }}
                className="mt-4 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-5 py-2.5 text-xs font-extrabold text-white"
              >
                Gửi yêu cầu đầu tiên
              </button>
            </div>
          )}
          {rows &&
            rows.map((t) => {
              const st = TICKET_STATUS[t.status] || { label: t.status, cls: "bg-slate-100 text-slate-500" };
              const cat = CATEGORIES.find((c) => c.key === t.category);
              return (
                <div key={t.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100 dark:bg-slate-800/60 dark:ring-slate-700">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[14px] font-extrabold leading-5 text-slate-800 dark:text-white">{t.title}</p>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${st.cls}`}>{st.label}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {t.ticket_code} · {cat ? cat.label : t.category} · {fmtDate(t.created_at)}
                  </p>
                  {t.admin_reply && (
                    <div className="mt-3 rounded-xl bg-pink-50 p-3 dark:bg-pink-500/10">
                      <p className="text-[11px] font-extrabold text-pink-600">NXX315 phản hồi</p>
                      <p className="mt-1 whitespace-pre-line text-[13px] leading-5 text-slate-600 dark:text-slate-300">{t.admin_reply}</p>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </Sheet>
  );
}
