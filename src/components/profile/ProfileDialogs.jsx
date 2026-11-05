// src/components/profile/ProfileDialogs.jsx — popup 2FA, mã dự phòng, xác nhận đăng xuất
import React from "react";
import { Copy, LogOut } from "lucide-react";
import { IconCheck } from "./ProfileIcons.jsx";

export function MfaSetupModal({ secret, isCopied, onCopy, verifyCode, setVerifyCode, onSubmit, error, success, onClose }) {
  return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Thêm thiết bị
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Mở Google Authenticator, chọn "Nhập mã thiết lập" và nhập chuỗi
              bên dưới:
            </p>

            <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Mã bí mật
                </p>
                <p className="break-all font-mono text-sm font-bold text-accent-600">
                  {secret}
                </p>
              </div>
              <button
                onClick={onCopy}
                className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-600 text-white transition hover:opacity-90"
              >
                {isCopied ? <IconCheck size={16} /> : <Copy size={16} />}
              </button>
            </div>

            <form onSubmit={onSubmit} className="mt-4">
              <input
                type="text"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="Nhập mã 6 số"
                maxLength={6}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-center text-lg font-semibold tracking-widest outline-none transition focus:border-accent-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {error && (
                <p className="mt-2 text-xs font-medium text-rose-500">
                  {error}
                </p>
              )}
              {success && (
                <p className="mt-2 text-xs font-medium text-emerald-600">
                  {success}
                </p>
              )}

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-accent-600 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
  );
}

export function RecoveryCodesModal({ recoveryCodes, onClose }) {
  return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Mã dự phòng
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Lưu lại những mã này ở nơi an toàn. Mỗi mã chỉ dùng được 1 lần.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {recoveryCodes.map((code, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center font-mono text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {code}
                </div>
              ))}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => onClose()}
                className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Đã lưu
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(recoveryCodes.join("\n"));
                  alert("Đã sao chép toàn bộ mã!");
                }}
                className="flex-1 rounded-lg bg-accent-600 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Sao chép tất cả
              </button>
            </div>
          </div>
        </div>
  );
}

export function LogoutModal({ onCancel, onConfirm }) {
  return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-xl dark:bg-slate-900">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/10">
              <LogOut size={20} className="text-rose-500" />
            </div>
            <h3 className="mt-3 font-display text-lg font-bold text-slate-900 dark:text-white">
              Đăng xuất?
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Bạn sẽ cần đăng nhập lại để sử dụng dịch vụ.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => onCancel()}
                className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Huỷ
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 rounded-lg bg-rose-500 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
  );
}
