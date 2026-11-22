import React, { useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { STEPS, deriveStep } from "./OrderProgressTracker.jsx";

export default function OrderProgressAdmin({ order, table, onSaved }) {
  const fileRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(deriveStep(order));
  const [note, setNote] = useState(order.progress_note || "");
  const [proofs, setProofs] = useState(order.proof_urls || []);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true);
    setError("");
    const { error: err } = await supabase
      .from(table)
      .update({
        progress_step: step,
        progress_note: note.trim() || null,
        progress_updated_at: new Date().toISOString(),
        proof_urls: proofs,
      })
      .eq("id", order.id);
    setSaving(false);
    if (err) return setError(err.message);
    onSaved?.();
  };

  const persistProofs = async (next) => {
    setProofs(next);
    const { error: err } = await supabase
      .from(table)
      .update({ proof_urls: next, progress_updated_at: new Date().toISOString() })
      .eq("id", order.id);
    if (err) setError(err.message);
    else onSaved?.();
  };

  const upload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    setUploading(true);
    setError("");
    const urls = [];

    for (const file of files) {
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

    if (urls.length) await persistProofs([...proofs, ...urls]);
    setUploading(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
      >
        Cập nhật tiến độ
      </button>
    );
  }

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
      <div className="grid grid-cols-4 gap-1.5">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(i)}
            className={`rounded-lg px-1 py-2 text-[11px] font-semibold leading-tight ${
              step === i ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        placeholder="Ghi chú gửi cho người dùng (hiện như bình luận của admin)..."
        className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm outline-none focus:border-gray-900"
      />

      {proofs.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {proofs.map((url) => (
            <div key={url} className="relative aspect-square overflow-hidden rounded-lg border bg-white">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => persistProofs(proofs.filter((u) => u !== url))}
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
        className="w-full rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 disabled:opacity-60"
      >
        {uploading ? "Đang tải ảnh..." : "+ Tải thêm giao dịch thành công từ nhà phát hành"}
      </button>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="flex-1 rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Đang lưu..." : "Lưu tiến độ"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
