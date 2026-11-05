// src/components/profile/EditProfileModal.jsx — đổi tên hiển thị
import React, { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import { IconWarning2, IconBulb, IconSpinner2 } from "./ProfileIcons.jsx";

export default function EditProfileModal({ profile, cooldown, onClose, onSaved }) {
  const [username, setUsername] = useState(profile.username || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const nameChanged = username.trim() !== (profile.username || "");

  const handleSave = async () => {
    if (!username.trim()) {
      setError("Tên hiển thị không được để trống.");
      return;
    }
    if (username.trim().length < 3) {
      setError("Tên hiển thị phải có ít nhất 3 ký tự.");
      return;
    }
    if (username.trim().length > 20) {
      setError("Tên hiển thị không được quá 20 ký tự.");
      return;
    }
    if (!nameChanged) {
      onClose();
      return;
    }
    if (!cooldown.canChange) {
      setError(`Bạn chỉ có thể đổi tên sau ${cooldown.remainingText} nữa.`);
      return;
    }

    setSaving(true);
    setError("");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username: username.trim(),
        last_username_change: new Date().toISOString(),
      })
      .eq("id", profile.id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    onSaved(username.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Chỉnh sửa hồ sơ
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {!cooldown.canChange && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-500/10">
            <IconWarning2 size={14} />
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              Bạn có thể đổi tên sau{" "}
              <span className="font-bold">{cooldown.remainingText}</span> nữa.
            </p>
          </div>
        )}

        {cooldown.canChange && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 p-3 dark:border-sky-500/30 dark:bg-sky-500/10">
            <IconBulb size={14} />
            <p className="text-xs text-sky-700 dark:text-sky-300">
              Bạn có thể đổi tên{" "}
              <span className="font-bold">1 lần mỗi 7 ngày</span>.
            </p>
          </div>
        )}

        <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Tên hiển thị
        </p>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={!cooldown.canChange}
          maxLength={20}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-accent-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        <p className="mt-1 text-[10px] text-slate-400">
          {username.length}/20 ký tự · tối thiểu 3 ký tự
        </p>

        {error && <p className="mt-2 text-xs font-bold text-rose-500">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Huỷ
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !cooldown.canChange || !nameChanged}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent-600 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
          >
            {saving ? <IconSpinner2 size={15} /> : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
