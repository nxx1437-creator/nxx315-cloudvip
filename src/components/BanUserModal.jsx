import React, { useState } from "react";
import { Ban, X, Loader2 } from "lucide-react";

import { supabase } from "../lib/supabaseClient.js";

const QUICK_REASONS = [
  "Spam / quảng cáo",
  "Gian lận điểm thưởng",
  "Ngôn từ không phù hợp",
  "Tài khoản ảo / trùng lặp",
  "Vi phạm quy định cộng đồng",
];

const QUICK_DURATIONS = [
  { label: "7 ngày", days: 7 },
  { label: "30 ngày", days: 30 },
  { label: "Vĩnh viễn", days: null },
];

export default function BanUserModal({ user, onClose, onBanned }) {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [note, setNote] = useState("");
  const [duration, setDuration] = useState(null); // số ngày, null = vĩnh viễn
  const [durationTouched, setDurationTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const finalReason = customReason.trim() || reason;

  const canSubmit =
    finalReason.trim().length > 0 && durationTouched && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    setError("");

    const bannedUntil =
      duration === null
        ? null
        : new Date(
            Date.now() + duration * 24 * 60 * 60 * 1000
          ).toISOString();

    const { error: updateError } = await supabase.rpc("ban_linked_group", {
      p_user_id: user.id,
      p_reason: finalReason.trim(),
      p_note: note.trim() || null,
      p_banned_until: bannedUntil,
    });

    setSubmitting(false);

    if (updateError) {
      setError(updateError.message || "Có lỗi xảy ra, thử lại.");
      return;
    }

    onBanned?.(user.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-[28px] bg-white p-5 sm:rounded-[28px]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50">
              <Ban size={17} className="text-rose-500" />
            </div>

            <div>
              <h2 className="text-base font-black text-slate-950">
                Khóa tài khoản
              </h2>

              <p className="text-[11px] text-slate-400">
                {user?.email || user?.username || user?.id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>

        {user?.multi_account_flag && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5">
            <p className="text-xs font-bold text-amber-700">
              ⚠️ Tài khoản này nằm trong nhóm nghi đa tài khoản.
            </p>
            <p className="mt-0.5 text-[11px] text-amber-600">
              Khóa tài khoản này sẽ tự động khóa luôn các tài khoản liên kết cùng nhóm.
            </p>
          </div>
        )}

        <div className="mb-4">
          <p className="mb-2 text-xs font-bold text-slate-600">
            Lý do
          </p>

          <div className="flex flex-wrap gap-1.5">
            {QUICK_REASONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setReason(item);
                  setCustomReason("");
                }}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${
                  reason === item && !customReason
                    ? "border-rose-300 bg-rose-500 text-white"
                    : "border-slate-200 bg-white text-slate-500 hover:border-rose-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={customReason}
            onChange={(event) => setCustomReason(event.target.value)}
            placeholder="Hoặc nhập lý do khác..."
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-rose-300 focus:bg-white focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <div className="mb-4">
          <p className="mb-2 text-xs font-bold text-slate-600">
            Ghi chú của người điều hành
          </p>

          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="Chi tiết nội bộ, không bắt buộc..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-rose-300 focus:bg-white focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <div className="mb-5">
          <p className="mb-2 text-xs font-bold text-slate-600">
            Thời gian cấm
          </p>

          <div className="grid grid-cols-3 gap-2">
            {QUICK_DURATIONS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setDuration(item.days);
                  setDurationTouched(true);
                }}
                className={`rounded-xl border px-2 py-2.5 text-[11px] font-bold transition ${
                  durationTouched && duration === item.days
                    ? "border-rose-300 bg-rose-500 text-white"
                    : "border-slate-200 bg-white text-slate-500 hover:border-rose-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="mb-3 text-xs font-bold text-rose-500">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-500"
          >
            Hủy
          </button>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black text-white transition ${
              canSubmit
                ? "bg-rose-500 hover:bg-rose-600"
                : "cursor-not-allowed bg-slate-200"
            }`}
          >
            {submitting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              "Xác nhận khóa"
            )}
          </button>
        </div>
      </div>
    </div>
  );
      }
