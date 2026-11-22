import React, { useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { Btn, Modal } from "./admin/AdminUI";
import { STEPS, deriveStep } from "./OrderProgressTracker.jsx";
import { REPLY_WINDOW_HOURS } from "../lib/orderView.js";

const MAX_IMAGES = 6;

// lockedStep: số bước cố định (vd 3 = Hoàn tất khi bấm "Đã giao"), null thì cho admin tự chọn bước
// onSubmit(fields) trả về chuỗi lỗi nếu thất bại, hoặc null nếu thành công
export default function OrderMessageModal({
  order,
  table,
  title,
  confirmLabel = "Lưu",
  lockedStep = null,
  onClose,
  onSubmit,
}) {
  const fileRef = useRef(null);
  const [step, setStep] = useState(lockedStep ?? deriveStep(order));
  const [note, setNote] = useState(order.progress_note || "");
  const [proofs, setProofs] = useState(order.proof_urls || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const upload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    setUploading(true);
    setError("");
    const urls = [];

    for (const file of files) {
      if (proofs.length + urls.length >= MAX_IMAGES) {
        setError(`Tối đa ${MAX_IMAGES} ảnh.`);
        break;
      }
      if (!file.type.startsWith("image/")) {
        setError("Chỉ tải được file ảnh.");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Mỗi ảnh tối đa 5MB.");
        continue;
      }

      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${table}/${order.id}/${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("order_proofs")
        .upload(path, file, { contentType: file.type });

      if (upErr) {
        setError(upErr.message);
        continue;
      }

      urls.push(supabase.storage.from("order_proofs").getPublicUrl(path).data.publicUrl);
    }

    if (urls.length) setProofs((cur) => [...cur, ...urls]);
    setUploading(false);
  };

  const submit = async () => {
    if (saving || uploading) return;
    setSaving(true);
    setError("");

    const cleanNote = note.trim();
    const now = new Date().toISOString();

    const messageChanged =
      cleanNote !== (order.progress_note || "") ||
      JSON.stringify(proofs) !== JSON.stringify(order.proof_urls || []);

    const fields = {
      progress_step: lockedStep ?? step,
      progress_note: cleanNote || null,
      proof_urls: proofs,
      progress_updated_at: now,
    };

    // Có tin nhắn mới thì mở lại 23 giờ cho người dùng trả lời
    if (messageChanged && (cleanNote || proofs.length)) {
      fields.progress_msg_at = now;
      fields.user_reply = null;
      fields.user_reply_at = null;
    }

    const err = await onSubmit(fields);
    setSaving(false);

    if (err) setError(err);
    else onClose();
  };

  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-3">
        {order.user_reply && (
          <div className="rounded-lg bg-[#f4f4f4] p-3 text-[13px] text-[#242424]">
            <p className="mb-1 font-semibold text-[#6b7280]">Người dùng đã trả lời:</p>
            <p className="whitespace-pre-wrap break-words">{order.user_reply}</p>
          </div>
        )}

        {lockedStep === null && (
          <div className="grid grid-cols-4 gap-1.5">
            {STEPS.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => setStep(i)}
                className={`rounded-lg px-1 py-2 text-[11px] font-semibold leading-tight ${
                  step === i
                    ? "bg-[#101010] text-white"
                    : "border border-[#e5e7eb] bg-white text-[#6b7280]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="Ghi chú gửi cho người dùng (hiện như bình luận của admin)..."
          className="w-full rounded-lg border border-[#e5e7eb] p-3 text-[14px] outline-none focus:border-[#101010]"
        />

        {proofs.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {proofs.map((url) => (
              <div
                key={url}
                className="relative aspect-square overflow-hidden rounded-lg border border-[#e5e7eb] bg-white"
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setProofs((cur) => cur.filter((u) => u !== url))}
                  className="absolute right-1 top-1 h-5 w-5 rounded-full bg-black/70 text-xs leading-5 text-white"
                  aria-label="Xoá ảnh"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={upload} />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="w-full rounded-lg border border-dashed border-[#d1d5db] bg-white px-3 py-2.5 text-[14px] font-semibold text-[#242424] disabled:opacity-60"
        >
          {uploading ? "Đang tải ảnh..." : "+ Đính kèm ảnh"}
        </button>

        <p className="text-[12px] text-[#6b7280]">
          Người dùng có {REPLY_WINDOW_HOURS} giờ để trả lời tin nhắn này. Gửi tin mới sẽ thay
          thế phản hồi cũ của họ.
        </p>

        {error && <p className="text-[13px] text-red-600">{error}</p>}

        <Btn className="w-full" disabled={saving || uploading} onClick={submit}>
          {saving ? "Đang lưu..." : confirmLabel}
        </Btn>
      </div>
    </Modal>
  );
  }
