// src/components/profile/AccountSettingsScreen.jsx — trang "Cài đặt tài khoản" (kiểu MoMo)
import React, { useEffect } from "react";
import { ArrowLeft, Bell, KeyRound, Mail, Monitor, Moon, ShieldCheck, Sun, User } from "lucide-react";
import { IconLogoutAll, IconSpinner2, IconCheck } from "./ProfileIcons.jsx";
import { Badge, Group, PillButton, Row, Switch } from "./SettingsParts.jsx";

const THEME_OPTIONS = [
  { key: "light", label: "Sáng", icon: Sun },
  { key: "dark", label: "Tối", icon: Moon },
  { key: "system", label: "Thiết bị", icon: Monitor },
];
const ACCENT_OPTIONS = [
  { key: "blue", label: "Xanh dương", dot: "bg-sky-500" },
  { key: "purple", label: "Tím", dot: "bg-purple-500" },
  { key: "green", label: "Xanh lá", dot: "bg-emerald-500" },
];
const NOTIFS = [
  { field: "notif_orders", title: "Thông báo đơn hàng", sub: "Trạng thái đơn nạp game" },
  { field: "notif_promo", title: "Thông báo khuyến mãi", sub: "Ưu đãi, sự kiện mới" },
  { field: "notif_rewards", title: "Thông báo phần thưởng", sub: "Khi nhận Coin, quà tặng" },
  { field: "notif_system", title: "Thông báo hệ thống", sub: "Cập nhật, bảo trì" },
];

const choice = (on) =>
  `flex flex-col items-center gap-2 rounded-xl border p-3 text-[13px] font-semibold transition ${
    on
      ? "border-accent-500 bg-accent-500/5 text-accent-600"
      : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400"
  }`;

export default function AccountSettingsScreen({
  onClose, initialGroup, profile, session, sec, updateNotifPref,
  themeMode, accentColor, setThemeMode, setAccentColor, onEditProfile, onChangePassword,
}) {
  const {
    isMFAEnabled, pushState, pushLoading, pushError, handleTogglePush, handleStartMFA,
    generateRecoveryCodes, recoveryCodes, handleLogoutAllDevices, loadingForceLogout, forceLogoutSuccess,
  } = sec;

  useEffect(() => {
    if (!initialGroup) return;
    const t = setTimeout(
      () => document.getElementById(`grp-${initialGroup}`)?.scrollIntoView({ block: "start" }),
      60
    );
    return () => clearTimeout(t);
  }, [initialGroup]);

  return (
    <div className="min-h-screen bg-[#eef2f9] pb-10 font-[Be_Vietnam_Pro] dark:bg-slate-950">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-[#eef2f9]/95 px-4 pb-3 pt-4 backdrop-blur dark:bg-slate-950/95">
        <button
          onClick={onClose}
          aria-label="Quay lại"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[19px] font-bold text-slate-900 dark:text-white">Cài đặt tài khoản</h1>
      </header>

      <main className="mx-auto max-w-md px-4 md:max-w-3xl">
        <Group id="security" title="Đăng nhập và xác thực">
          <Row icon={KeyRound} title="Đổi mật khẩu" sub="Cập nhật mật khẩu đăng nhập" onClick={onChangePassword} />
          <Row
            icon={ShieldCheck}
            title="Xác thực 2 bước"
            sub="Dùng Google Authenticator"
            onClick={handleStartMFA}
            right={<Badge on={isMFAEnabled} onText="Đã bật" offText="Chưa bật" />}
          />
          <Row
            icon={Bell}
            title="Thông báo đẩy"
            sub={pushState === "unsupported" ? "Thiết bị không hỗ trợ" : "Nhận thông báo khi đóng app"}
            right={
              pushLoading ? (
                <IconSpinner2 size={22} />
              ) : (
                <Switch
                  label="Thông báo đẩy"
                  checked={pushState === "granted"}
                  disabled={pushState === "unsupported"}
                  onChange={handleTogglePush}
                />
              )
            }
          />
          <Row
            icon={KeyRound}
            title="Mã dự phòng"
            sub={`Số mã: ${recoveryCodes.length}/10`}
            right={<PillButton onClick={generateRecoveryCodes}>Tạo mã</PillButton>}
          />
        </Group>
        {pushError && <p className="px-1 pt-2 text-[13px] font-semibold text-rose-500">{pushError}</p>}

        <Group title="Thiết bị đang đăng nhập">
          <Row
            icon={IconLogoutAll}
            danger
            title={loadingForceLogout ? "Đang xử lý..." : "Đăng xuất mọi thiết bị khác"}
            sub="Giữ thiết bị này, thoát các thiết bị còn lại"
            onClick={handleLogoutAllDevices}
            disabled={loadingForceLogout}
          />
        </Group>
        {forceLogoutSuccess && (
          <div className="mt-3 flex items-start gap-2.5 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
            <IconCheck size={20} />
            <p className="text-[13px] leading-5 text-emerald-700 dark:text-emerald-300">
              Đã đăng xuất tất cả thiết bị khác. Các thiết bị đó sẽ tự thoát trong vòng 2 phút.
            </p>
          </div>
        )}

        <Group title="Cài đặt tài khoản">
          <Row icon={User} title="Tên hiển thị" sub={profile.username || "Chưa đặt"} onClick={onEditProfile} />
          <Row icon={Mail} title="Email" sub={session?.user?.email} />
        </Group>

        <Group id="notif" title="Thông báo nhận về">
          {NOTIFS.map((n) => (
            <Row
              key={n.field}
              title={n.title}
              sub={n.sub}
              right={
                <Switch
                  label={n.title}
                  checked={!!profile[n.field]}
                  onChange={(v) => updateNotifPref(n.field, v)}
                />
              }
            />
          ))}
        </Group>

        <Group id="theme" title="Giao diện">
          <Row title="Chế độ hiển thị">
            <span className="mt-3 grid grid-cols-3 gap-2">
              {THEME_OPTIONS.map((o) => (
                <button key={o.key} type="button" onClick={() => setThemeMode(o.key)} className={choice(themeMode === o.key)}>
                  <o.icon size={18} />
                  {o.label}
                </button>
              ))}
            </span>
          </Row>
          <Row title="Màu giao diện">
            <span className="mt-3 grid grid-cols-3 gap-2">
              {ACCENT_OPTIONS.map((o) => (
                <button key={o.key} type="button" onClick={() => setAccentColor(o.key)} className={choice(accentColor === o.key)}>
                  <span className={`h-4 w-4 rounded-full ${o.dot}`} />
                  {o.label}
                </button>
              ))}
            </span>
          </Row>
        </Group>
      </main>
    </div>
  );
}
