// src/pages/Support/FeedbackSheet.jsx
// Sheet trượt từ dưới lên để lấy phản hồi 👍 / 👎.

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const COPY = {
  up: {
    title: "Bạn thích điều gì?",
    reasons: [
      "Đúng vấn đề",
      "Dễ hiểu",
      "Hướng dẫn rõ ràng",
      "Trả lời nhanh",
      "Thân thiện",
      "Giải quyết được",
    ],
  },
  down: {
    title: "Có gì chưa ổn?",
    reasons: [
      "Sai thông tin",
      "Không đúng ý mình",
      "Khó hiểu",
      "Quá dài dòng",
      "Chưa giải quyết được",
      "Trả lời chậm",
    ],
  },
};

export default function FeedbackSheet({ open, rating, onClose, onSubmit }) {
  const [picked, setPicked] = useState([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setPicked([]);
      setNote("");
    }
  }, [open, rating]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !rating) return null;
  const copy = COPY[rating] || COPY.up;

  const toggle = (r) =>
    setPicked((p) => (p.includes(r) ? p.filter((x) => x !== r) : [...p, r]));

  return createPortal(
    <div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true" aria-label={copy.title}>
      <div className="nxx-fade absolute inset-0 bg-black/25" onClick={onClose} />
      <div className="nxx-sheet-in absolute inset-x-0 bottom-0 mx-auto w-full max-w-2xl rounded-t-[28px] border border-[#dde0ea] bg-white px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-7 shadow-[0_-12px_40px_rgba(19,20,26,0.12)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="nxx-iconbtn absolute right-3 top-3 h-9 w-9 text-[#7b7e90] hover:bg-[#f5f6fb]"
        >
          <X size={20} />
        </button>

        <h3 className="text-center text-[22px] font-semibold tracking-[-0.01em] text-[#13141a]">
          {copy.title}
        </h3>
        <p className="mt-1 text-center text-[14px] text-[#7b7e90]">
          Phản hồi của bạn giúp NXX trả lời tốt hơn.
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-2.5">
          {copy.reasons.map((r) => {
            const on = picked.includes(r);
            return (
              <button
                key={r}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(r)}
                className={`rounded-full border px-4 py-2.5 text-[15px] transition active:scale-[0.97] ${
                  on
                    ? "border-[#13141a] bg-[#13141a] text-white"
                    : "border-[#dde0ea] bg-white text-[#13141a]"
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Thêm chi tiết (không bắt buộc)"
          className="mt-5 w-full resize-none rounded-2xl border border-[#dde0ea] bg-[#f5f6fb] px-4 py-3 text-[15px] text-[#13141a] outline-none placeholder:text-[#a2a5b8] focus:bg-white"
        />

        <button
          type="button"
          onClick={() => onSubmit({ reasons: picked, comment: note.trim() })}
          className="mt-3 h-12 w-full rounded-2xl bg-[#13141a] text-[16px] font-semibold text-white transition active:scale-[0.99]"
        >
          Gửi phản hồi
        </button>
      </div>
    </div>,
    document.body
  );
}

