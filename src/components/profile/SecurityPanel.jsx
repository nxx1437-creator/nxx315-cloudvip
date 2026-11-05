// src/components/profile/SecurityPanel.jsx — phần Bảo mật (mật khẩu, 2FA, thông báo đẩy, mã dự phòng, đăng xuất mọi thiết bị)
import React from "react";
import { Bell, ChevronRight, KeyRound, Plus, ShieldAlert } from "lucide-react";
import { IconCheck, IconSpinner2, IconLogoutAll } from "./ProfileIcons.jsx";

export default function SecurityPanel({ profile, session, sec, onEditProfile, onChangePassword }) {
  const {
    isMFAEnabled, pushState, pushLoading, pushError, handleTogglePush,
    handleStartMFA, generateRecoveryCodes, recoveryCodes,
    handleLogoutAllDevices, loadingForceLogout, forceLogoutSuccess,
  } = sec;

  return (
        <div className="rounded-2xl bg-white dark:bg-slate-900">
          <div className="border-b border-slate-100 p-4 dark:border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Thông tin tài khoản
            </p>
          </div>

          <div className="p-4">
            <div className="mb-4 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => onEditProfile()}
                className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
              >
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Tên hiển thị
                </span>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                  {profile.username || "Chưa đặt"}
                  <ChevronRight size={14} className="text-slate-400" />
                </span>
              </button>

              <div className="flex w-full items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Email
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {session?.user?.email}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => onChangePassword()}
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 p-3.5 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <KeyRound size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      Đổi mật khẩu
                    </p>
                    <p className="text-xs text-slate-500">
                      Cập nhật mật khẩu đăng nhập
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>

              <button
                onClick={handleStartMFA}
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 p-3.5 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <ShieldAlert size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      Xác thực 2 bước
                    </p>
                    <p className="text-xs text-slate-500">
                      Google Authenticator
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${
                    isMFAEnabled
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {isMFAEnabled ? "Đã bật" : "Chưa bật"}
                </span>
              </button>

              <button
                onClick={handleTogglePush}
                disabled={pushLoading || pushState === "unsupported"}
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 p-3.5 text-left transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Bell size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      Thông báo đẩy
                    </p>
                    <p className="text-xs text-slate-500">
                      {pushState === "unsupported"
                        ? "Thiết bị không hỗ trợ"
                        : "Nhận thông báo khi đóng app"}
                    </p>
                  </div>
                </div>
                {pushLoading ? (
                  <IconSpinner2 size={16} />
                ) : (
                  <span
                    className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${
                      pushState === "granted"
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {pushState === "granted" ? "Đã bật" : "Chưa bật"}
                  </span>
                )}
              </button>

              {pushError && (
                <p className="text-xs font-semibold text-rose-500">
                  {pushError}
                </p>
              )}

              <button
                onClick={generateRecoveryCodes}
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 p-3.5 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <KeyRound size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      Mã dự phòng
                    </p>
                    <p className="text-xs text-slate-500">
                      Số mã: {recoveryCodes.length}/10
                    </p>
                  </div>
                </div>
                <Plus size={16} className="text-slate-400" />
              </button>

              {/* ✅ Đăng xuất mọi thiết bị khác */}
              <button
                onClick={handleLogoutAllDevices}
                disabled={loadingForceLogout}
                className="flex w-full items-center justify-between rounded-lg border border-rose-200 bg-rose-50/50 p-3.5 text-left transition hover:bg-rose-50 disabled:opacity-60 dark:border-rose-500/30 dark:bg-rose-500/10 dark:hover:bg-rose-500/20"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-500/20">
                    {loadingForceLogout ? (
                      <IconSpinner2 size={16} />
                    ) : (
                      <IconLogoutAll size={16} />
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                      {loadingForceLogout
                        ? "Đang xử lý..."
                        : "Đăng xuất mọi thiết bị khác"}
                    </p>
                    <p className="text-xs text-rose-500/80">
                      Giữ thiết bị này, thoát các thiết bị còn lại
                    </p>
                  </div>
                </div>
              </button>

              {/* ✅ Thông báo thành công */}
              {forceLogoutSuccess && (
                <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                    <IconCheck size={14} />
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      Đã đăng xuất tất cả thiết bị khác
                    </p>
                    <p className="mt-0.5 text-[11px] leading-5 text-emerald-600 dark:text-emerald-400/80">
                      Các thiết bị khác sẽ tự động đăng xuất trong vòng 2
                      phút.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
  );
}
