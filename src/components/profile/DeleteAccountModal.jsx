// src/components/profile/DeleteAccountModal.jsx — xóa tài khoản
import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import MfaChallenge from "../MfaChallenge.jsx";
import { IconSpinner2 } from "./ProfileIcons.jsx";

export default function DeleteAccountModal({ onClose, isMFAEnabled }) {
  const [mfaVerified, setMfaVerified] = useState(!isMFAEnabled);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const canDelete = confirmText.trim().toUpperCase() === "XOA";

  const handleDelete = async () => {
    if (!canDelete) return;

    setDeleting(true);
    setError("");

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    try {
      const { error: fnError } = await supabase.functions.invoke(
        "swift-function",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (fnError) throw fnError;

      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (err) {
      setDeleting(false);
      setError(err.message || "Xóa tài khoản thất bại, thử lại sau.");
    }
  };

  if (!mfaVerified) {
    return (
      <MfaChallenge
        onVerified={() => setMfaVerified(true)}
        onCancel={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-500/10">
            <AlertTriangle size={19} className="text-rose-500" />
          </span>
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Xóa tài khoản
          </h3>
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
          Hành động này{" "}
          <span className="font-bold text-rose-500">không thể hoàn tác</span>.
          Toàn bộ dữ liệu, Coin, lịch sử đổi thưởng sẽ bị xóa vĩnh viễn.
        </p>

        <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Gõ <span className="font-black text-rose-500">XOA</span> để xác nhận
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="XOA"
          className="w-full rounded-lg border border-rose-200 bg-rose-50/50 px-4 py-3 text-sm font-bold uppercase outline-none transition focus:border-rose-400 focus:bg-white dark:border-rose-500/30 dark:bg-slate-800 dark:text-white"
        />

        {error && <p className="mt-2 text-xs font-bold text-rose-500">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Huỷ
          </button>
          <button
            onClick={handleDelete}
            disabled={!canDelete || deleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-rose-500 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-40"
          >
            {deleting ? <IconSpinner2 size={15} /> : "Xóa vĩnh viễn"}
          </button>
        </div>
      </div>
    </div>
  );
}
