// src/pages/Support/FeedbackSheet.jsx
// Bottom sheet phản hồi 👍 / 👎: chip chọn nhiều + ghi chú tuỳ chọn.
import React, { useEffect, useState } from "react";

const TAGS = {
  up: [
    "Đúng trọng tâm",
    "Dễ hiểu",
    "Trả lời nhanh",
    "Hướng dẫn rõ ràng",
    "Hữu ích",
    "Thân thiện",
  ],
  down: [
    "Sai thông tin",
    "Không hữu ích",
    "Chưa đúng ý mình",
    "Quá dài dòng",
    "Khó làm theo",
    "Trả lời chậm",
  ],
};

export default function FeedbackSheet({ open, rating, onClose, onSubmit }) {
  const [tags, setTags] = useState([]);
  const [note, setNote] = useState("");
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setTags([]);
      setNote("");
      setClosing(false);
    }
  }, [open, rating]);

  const close = () => {
    setClosing(true);
    setTimeout(onClose, 200);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open || !rating) return null;

  const isUp = rating === "up";
  const list = TAGS[isUp ? "up" : "down"];

  const toggle = (t) =>
    setTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  const submit = () => {
    onSubmit({ rating, tags, note: note.trim() });
    close();
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-[70] bg-black/20 backdrop-blur-[2px] ${
          closing ? "fade-out" : "fade-in"
        }`}
        onClick={close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isUp ? "Bạn thích điều gì?" : "Chưa tốt ở đâu?"}
        className={`fixed inset-x-0 bottom-0 z-[71] mx-auto w-full max-w-2xl rounded-t-[28px] border border-[var(--chat-border)] bg-white px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-6 shadow-[0_-12px_40px_rgba(17,20,24,0.12)] ${
          closing ? "sheet-down" : "sheet-up"
        }`}
      >
        <h3 className="font-hero text-center text-[26px] leading-tight tracking-[-0.01em] text-[var(--chat-ink)]">
          {isUp ? "Bạn thích điều gì?" : "Chưa tốt ở đâu?"}
        </h3>
        <p className="mt-1.5 text-center text-[13px] text-[var(--chat-muted)]">
          Phản hồi của bạn giúp NXX trả lời tốt hơn.
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {list.map((t) => {
            const on = tags.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggle(t)}
                aria-pressed={on}
                className={`rounded-full border px-4 py-2 text-[14px] font-medium transition active:scale-95 ${
                  on
                    ? "border-[var(--chat-ink)] bg-[var(--chat-ink)] text-white"
                    : "border-[var(--chat-border)] bg-white text-[var(--chat-ink)] hover:bg-[var(--chat-surface)]"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={300}
          placeholder="Thêm chi tiết (không bắt buộc)"
          className="mt-5 h-12 w-full rounded-xl border border-[var(--chat-border)] bg-[var(--chat-surface)] px-4 text-[14px] text-[var(--chat-ink)] outline-none transition placeholder:text-[var(--chat-muted)] focus:border-[#b9bdc5] focus:bg-white"
        />

        <button
          onClick={submit}
          className="mt-3 h-12 w-full rounded-xl bg-[var(--chat-ink)] text-[15px] font-semibold text-white transition active:scale-[0.98]"
        >
          Gửi phản hồi
        </button>
      </div>
    </>
  );
}
