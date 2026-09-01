import React, { useState, useEffect } from "react";
import {
  User, Mail, ShieldCheck, Coins, LogOut, Camera, ShieldAlert,
  KeyRound, Plus, ChevronRight, Copy, Check, Bell, Palette,
  HelpCircle, FileText, Lock, Trash2, Sun, Moon, Monitor,
  Flame, Star, Pencil, X, Loader2, AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import useTheme from "../hooks/useTheme.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";
import MfaChallenge from "../components/MfaChallenge.jsx";

const ACCENT_OPTIONS = [
  { key: "blue", label: "Xanh dương", dot: "bg-sky-500" },
  { key: "purple", label: "Tím", dot: "bg-purple-500" },
  { key: "green", label: "Xanh lá", dot: "bg-emerald-500" },
];

const THEME_OPTIONS = [
  { key: "light", label: "Sáng", icon: Sun },
  { key: "dark", label: "Tối", icon: Moon },
  { key: "system", label: "Thiết bị", icon: Monitor },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile, setProfile } = useProfile();
  const { themeMode, accentColor, setThemeMode, setAccentColor } = useTheme();

  const [activeSection, setActiveSection] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showMFA, setShowMFA] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);

  const [secret, setSecret] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const [mfaError, setMfaError] = useState("");
  const [mfaSuccess, setMfaSuccess] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);

  const displayName = profile.username || "Thành viên";
  const initial = displayName.charAt(0).toUpperCase();

  const memberSince = session?.user?.created_at
    ? new Date(session.user.created_at).toLocaleDateString("vi-VN")
    : "—";

  const expPercent = Math.min(
    100,
    Math.round(((profile.exp || 0) / (profile.exp_target || 100)) * 100)
  );

  const checkMFAStatus = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    const verifiedFactors = data.totp?.filter((f) => f.status === "verified");
    setIsMFAEnabled(!!verifiedFactors?.length);
  };

  useEffect(() => {
    checkMFAStatus();
    if (profile?.recovery_codes && profile.recovery_codes.length > 0) {
      setRecoveryCodes(profile.recovery_codes);
    }
  }, [profile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleLogoutAllDevices = async () => {
    await supabase.auth.signOut({ scope: "global" });
    navigate("/");
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleStartMFA = async () => {
    setMfaError("");
    setMfaSuccess("");

    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    if (error) {
      setMfaError("Lỗi khởi tạo: " + error.message);
      return;
    }

    setSecret(data?.totp?.secret || "");
    setFactorId(data?.id || "");
    setIsCopied(false);
    setShowMFA(true);
  };

  const handleVerifyMFA = async (e) => {
    e.preventDefault();
    setMfaError("");
    setMfaSuccess("");

    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) {
      setMfaError("Lỗi xác minh: " + challengeError.message);
      return;
    }

    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code: verifyCode,
    });
    if (error) {
      setMfaError("Mã không đúng hoặc đã hết hạn.");
      return;
    }

    setMfaSuccess("Xác minh 2 bước đã được bật thành công!");
    setVerifyCode("");
    setShowMFA(false);
    checkMFAStatus();
  };

  const generateRecoveryCodes = async () => {
    const codes = Array.from({ length: 10 }, () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";
      for (let i = 0; i < 8; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
        if (i === 3) code += "-";
      }
      return code;
    });

    const { error } = await supabase
      .from("profiles")
      .update({ recovery_codes: codes })
      .eq("id", session?.user?.id);

    if (error) {
      alert("Lỗi lưu mã: " + error.message);
      return;
    }

    setRecoveryCodes(codes);
    setShowRecovery(true);
  };

  const toggleSection = (key) => {
    setActiveSection((prev) => (prev === key ? null : key));
  };

  const updateNotifPref = async (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    if (profile?.id) {
      await supabase.from("profiles").update({ [field]: value }).eq("id", profile.id);
    }
  };
return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro] dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 px-4 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
        <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
          Cài đặt
        </h1>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 py-5">

        <div className="rounded-3xl border border-white bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-accent-400/30 bg-gradient-to-br from-accent-400 to-accent-600 text-4xl font-bold text-white shadow-md">
                {initial}
              </div>
              <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-accent-500 text-white shadow dark:border-slate-900">
                <Camera size={14} />
              </button>
            </div>

            <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">
              {displayName}
            </h2>
            <p className="text-xs text-slate-400">Thành viên từ {memberSince}</p>

            <div className="mt-3 flex items-center gap-3">
              <span className="flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <Star size={12} className="text-amber-400" />
                Lv.{profile.level || 1}
              </span>
              <span className="flex items-center gap-1 rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-500 dark:bg-orange-500/10">
                <Flame size={12} />
                {profile.streak_days || 0} ngày
              </span>
            </div>

            <div className="mt-3 w-full">
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                <span>{profile.exp || 0} EXP</span>
                <span>{profile.exp_target || 100} EXP</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-accent-500"
                  style={{ width: `${expPercent}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => setShowEditProfile(true)}
              className="mt-4 flex items-center gap-1.5 rounded-full bg-accent-500/10 px-4 py-2 text-xs font-bold text-accent-600"
            >
              <Pencil size={12} />
              Chỉnh sửa hồ sơ
            </button>
          </div>
        </div>

        {profile?.multi_account_flag && !profile?.is_banned && (
          <button
            type="button"
            onClick={() => navigate("/account-review")}
            className="w-full rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left transition hover:bg-amber-100"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <ShieldAlert size={16} />
              </span>
              <div>
                <p className="text-sm font-bold text-amber-800">
                  Tài khoản đang được xem xét
                </p>
                <p className="mt-0.5 text-xs leading-5 text-amber-700">
                  Nhấn để xem chi tiết hoặc gửi giải trình nếu bạn cho rằng đây là nhầm lẫn.
                </p>
              </div>
            </div>
          </button>
        )}

        <SettingsGroup title="Tài khoản">
          <SettingsRow icon={User} label="Hồ sơ cá nhân" onClick={() => setShowEditProfile(true)} />
          <SettingsRow icon={Lock} label="Bảo mật" onClick={() => toggleSection("security")} active={activeSection === "security"} />
          <SettingsRow icon={Mail} label="Email" sub={session?.user?.email} onClick={() => toggleSection("security")} last />
        </SettingsGroup>

        {activeSection === "security" && (
          <div className="rounded-3xl border border-white bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-slate-400">
              Thông tin tài khoản
            </p>

            <div className="mb-4 overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <button
                onClick={() => setShowEditProfile(true)}
                className="flex w-full items-center justify-between border-b border-white px-4 py-3.5 text-left dark:border-slate-900"
              >
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Tên hiển thị</span>
                <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
                  {profile.username || "Chưa đặt"}
                  <ChevronRight size={14} className="text-slate-300" />
                </span>
              </button>

              <div className="flex w-full items-center justify-between px-4 py-3.5">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Email</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {session?.user?.email}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowChangePassword(true)}
              className="flex w-full items-center justify-between rounded-2xl bg-slate-50 p-4 text-left transition hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-500/10 text-accent-600"><KeyRound size={18} /></span>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Đổi mật khẩu</p>
                  <p className="text-xs text-slate-400">Cập nhật mật khẩu đăng nhập</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>

            <button
              onClick={handleStartMFA}
              className="mt-3 flex w-full items-center justify-between rounded-2xl bg-slate-50 p-4 text-left transition hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-500/10 text-accent-600"><ShieldAlert size={18} /></span>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Xác thực 2 bước</p>
                  <p className="text-xs text-slate-400">Google Authenticator</p>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isMFAEnabled ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"}`}>
                {isMFAEnabled ? "Đã bật" : "Chưa bật"}
              </span>
            </button>

            <button
              onClick={generateRecoveryCodes}
              className="mt-3 flex w-full items-center justify-between rounded-2xl bg-slate-50 p-4 text-left transition hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-500/10 text-accent-600"><KeyRound size={18} /></span>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Mã dự phòng</p>
                  <p className="text-xs text-slate-400">Số mã: {recoveryCodes.length}/10</p>
                </div>
              </div>
              <Plus size={18} className="text-accent-500" />
            </button>

            <button
              onClick={handleLogoutAllDevices}
              className="mt-3 flex w-full items-center justify-between rounded-2xl bg-slate-50 p-4 text-left transition hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-500"><LogOut size={18} /></span>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Đăng xuất mọi thiết bị</p>
                  <p className="text-xs text-slate-400">Kết thúc tất cả phiên đăng nhập</p>
                </div>
              </div>
            </button>
          </div>
        )}

        <SettingsGroup title="Trải nghiệm">
          <SettingsRow icon={Bell} label="Thông báo" onClick={() => toggleSection("notif")} active={activeSection === "notif"} />
          <SettingsRow icon={Palette} label="Giao diện" onClick={() => toggleSection("theme")} active={activeSection === "theme"} last />
        </SettingsGroup>

        {activeSection === "notif" && (
          <div className="space-y-2 rounded-3xl border border-white bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <NotifToggle label="Thông báo đơn hàng" checked={profile.notif_orders} onChange={(v) => updateNotifPref("notif_orders", v)} />
            <NotifToggle label="Thông báo khuyến mãi" checked={profile.notif_promo} onChange={(v) => updateNotifPref("notif_promo", v)} />
            <NotifToggle label="Thông báo phần thưởng" checked={profile.notif_rewards} onChange={(v) => updateNotifPref("notif_rewards", v)} />
            <NotifToggle label="Thông báo hệ thống" checked={profile.notif_system} onChange={(v) => updateNotifPref("notif_system", v)} last />
          </div>
        )}

        {activeSection === "theme" && (
          <div className="rounded-3xl border border-white bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">Chế độ hiển thị</p>
            <div className="grid grid-cols-3 gap-2">
              {THEME_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setThemeMode(opt.key)}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border py-3 text-xs font-bold transition ${
                      themeMode === opt.key
                        ? "border-accent-400 bg-accent-500/10 text-accent-600"
                        : "border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400"
                    }`}
                  >
                    <Icon size={17} />
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <p className="mb-2 mt-5 text-xs font-bold text-slate-500 dark:text-slate-400">Màu giao diện</p>
            <div className="grid grid-cols-3 gap-2">
              {ACCENT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setAccentColor(opt.key)}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border py-3 text-xs font-bold transition ${
                    accentColor === opt.key
                      ? "border-accent-400 bg-accent-500/10 text-accent-600"
                      : "border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400"
                  }`}
                >
                  <span className={`h-4 w-4 rounded-full ${opt.dot}`} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <SettingsGroup title="Hỗ trợ & pháp lý">
          <SettingsRow icon={HelpCircle} label="Trung tâm trợ giúp" onClick={() => navigate("/help")} />
          <SettingsRow icon={FileText} label="Điều khoản sử dụng" onClick={() => navigate("/terms")} />
          <SettingsRow icon={Lock} label="Chính sách quyền riêng tư" onClick={() => navigate("/privacy")} last />
        </SettingsGroup>

        <SettingsGroup title="Nguy hiểm" danger>
          <SettingsRow icon={LogOut} label="Đăng xuất" onClick={() => setShowLogout(true)} danger />
          <SettingsRow icon={Trash2} label="Xóa tài khoản" onClick={() => setShowDeleteAccount(true)} danger last />
        </SettingsGroup>
      </main>
  {showEditProfile && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditProfile(false)}
          onSaved={(newUsername) => {
            setProfile((prev) => ({ ...prev, username: newUsername }));
            setShowEditProfile(false);
          }}
        />
      )}

      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
          isMFAEnabled={isMFAEnabled}
        />
      )}

      {showDeleteAccount && (
        <DeleteAccountModal
          onClose={() => setShowDeleteAccount(false)}
          isMFAEnabled={isMFAEnabled}
        />
      )}
      {showMFA && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl dark:bg-slate-900">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Thêm thiết bị</h3>
            <p className="mt-2 text-sm text-slate-500">Mở Google Authenticator, chọn "Nhập mã thiết lập" và nhập chuỗi bên dưới:</p>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
              <div className="text-left">
                <p className="text-xs font-bold uppercase text-slate-400">Mã bí mật</p>
                <p className="break-all font-mono text-sm font-bold text-accent-600">{secret}</p>
              </div>
              <button
                onClick={handleCopySecret}
                className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-600 text-white transition hover:opacity-90"
              >
                {isCopied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            <form onSubmit={handleVerifyMFA} className="mt-4">
              <input
                type="text"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="Nhập mã 6 số từ app"
                maxLength={6}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-center text-lg tracking-widest outline-none focus:border-accent-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {mfaError && <p className="mt-2 text-xs font-medium text-rose-500">{mfaError}</p>}
              {mfaSuccess && <p className="mt-2 text-xs font-medium text-emerald-600">{mfaSuccess}</p>}

              <div className="mt-5 flex gap-3">
                <button type="button" onClick={() => setShowMFA(false)} className="flex-1 rounded-full bg-slate-100 py-2.5 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">Huỷ</button>
                <button type="submit" className="flex-1 rounded-full bg-accent-600 py-2.5 text-sm font-semibold text-white hover:opacity-90">Xác nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRecovery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl dark:bg-slate-900">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Mã dự phòng của bạn</h3>
            <p className="mt-2 text-sm text-slate-500">Lưu lại những mã này ở nơi an toàn. Mỗi mã chỉ dùng được 1 lần.</p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {recoveryCodes.map((code, idx) => (
                <div key={idx} className="rounded-lg bg-slate-50 p-2 font-mono text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {code}
                </div>
              ))}
            </div>

            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowRecovery(false)} className="flex-1 rounded-full bg-slate-100 py-2.5 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">Đã lưu</button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(recoveryCodes.join("\n"));
                  alert("Đã sao chép toàn bộ mã!");
                }}
                className="flex-1 rounded-full bg-accent-600 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                Sao chép tất cả
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl dark:bg-slate-900">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Xác nhận đăng xuất?</h3>
            <p className="mt-1 text-sm text-slate-500">Bạn sẽ cần đăng nhập lại để sử dụng dịch vụ.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowLogout(false)} className="flex-1 rounded-full bg-slate-100 py-2.5 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">Huỷ</button>
              <button onClick={handleLogout} className="flex-1 rounded-full bg-rose-500 py-2.5 text-sm font-semibold text-white">Đăng xuất</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

function SettingsGroup({ title, children, danger }) {
  return (
    <div>
      <p className={`mb-2 px-1 text-xs font-bold uppercase tracking-wider ${danger ? "text-rose-400" : "text-slate-400"}`}>
        {title}
      </p>
      <div className="overflow-hidden rounded-3xl border border-white bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ icon: Icon, label, sub, onClick, active, danger, last }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between px-4 py-4 text-left transition ${
        !last ? "border-b border-slate-50 dark:border-slate-800" : ""
      } ${active ? "bg-accent-500/5" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
    >
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${
          danger ? "bg-rose-50 text-rose-500" : "bg-accent-500/10 text-accent-600"
        }`}>
          <Icon size={16} />
        </span>
        <div>
          <p className={`text-sm font-semibold ${danger ? "text-rose-600" : "text-slate-800 dark:text-slate-100"}`}>
            {label}
          </p>
          {sub && <p className="text-xs text-slate-400">{sub}</p>}
        </div>
      </div>
      <ChevronRight size={16} className="text-slate-300" />
    </button>
  );
}

function NotifToggle({ label, checked, onChange, last }) {
  return (
    <div className={`flex items-center justify-between px-2 py-3 ${!last ? "border-b border-slate-50 dark:border-slate-800" : ""}`}>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</p>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-accent-500" : "bg-slate-200 dark:bg-slate-700"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function EditProfileModal({ profile, onClose, onSaved }) {
  const [username, setUsername] = useState(profile.username || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!username.trim()) {
      setError("Tên hiển thị không được để trống.");
      return;
    }

    setSaving(true);
    setError("");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ username: username.trim() })
      .eq("id", profile.id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    onSaved(username.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Chỉnh sửa hồ sơ</h3>
          <button onClick={onClose} className="text-slate-400"><X size={18} /></button>
        </div>

        <p className="mb-2 mt-4 text-xs font-bold text-slate-500 dark:text-slate-400">Tên hiển thị</p>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-accent-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />

        {error && <p className="mt-2 text-xs font-bold text-rose-500">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-full bg-slate-100 py-2.5 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">Huỷ</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent-600 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChangePasswordModal({ onClose, isMFAEnabled }) {
  const { session } = useSession();
  const [mfaVerified, setMfaVerified] = useState(!isMFAEnabled);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    if (!currentPassword) {
      setError("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setSaving(true);
    setError("");

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: session?.user?.email,
      password: currentPassword,
    });

    if (verifyError) {
      setSaving(false);
      setError("Mật khẩu hiện tại không đúng.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Đổi mật khẩu</h3>
          <button onClick={onClose} className="text-slate-400"><X size={18} /></button>
        </div>

        {success ? (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-emerald-50 p-4">
            <Check size={17} className="text-emerald-500" />
            <p className="text-sm font-semibold text-emerald-700">Đổi mật khẩu thành công!</p>
          </div>
        ) : (
          <>
            <p className="mb-2 mt-4 text-xs font-bold text-slate-500 dark:text-slate-400">Mật khẩu hiện tại</p>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-accent-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />

            <p className="mb-2 mt-3 text-xs font-bold text-slate-500 dark:text-slate-400">Mật khẩu mới</p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-accent-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />

            <p className="mb-2 mt-3 text-xs font-bold text-slate-500 dark:text-slate-400">Xác nhận mật khẩu mới</p>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-accent-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />

            {error && <p className="mt-2 text-xs font-bold text-rose-500">{error}</p>}

            <div className="mt-5 flex gap-3">
              <button onClick={onClose} className="flex-1 rounded-full bg-slate-100 py-2.5 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">Huỷ</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent-600 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : "Cập nhật"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DeleteAccountModal({ onClose, isMFAEnabled }) {
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
      const { error: fnError } = await supabase.functions.invoke("delete-account", {
        headers: { Authorization: `Bearer ${token}` },
      });

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50">
            <AlertTriangle size={19} className="text-rose-500" />
          </span>
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Xóa tài khoản</h3>
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Hành động này <span className="font-bold text-rose-500">không thể hoàn tác</span>. Toàn bộ dữ liệu, Coin, lịch sử đổi thưởng sẽ bị xóa vĩnh viễn.
        </p>

        <p className="mb-2 mt-4 text-xs font-bold text-slate-500 dark:text-slate-400">
          Gõ <span className="font-black text-rose-500">XOA</span> để xác nhận
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="XOA"
          className="w-full rounded-xl border border-rose-200 bg-rose-50/50 px-4 py-3 text-sm font-bold uppercase outline-none focus:border-rose-400 dark:bg-slate-800 dark:text-white"
        />

        {error && <p className="mt-2 text-xs font-bold text-rose-500">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-full bg-slate-100 py-2.5 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">Huỷ</button>
          <button
            onClick={handleDelete}
            disabled={!canDelete || deleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-rose-500 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            {deleting ? <Loader2 size={15} className="animate-spin" /> : "Xóa vĩnh viễn"}
          </button>
        </div>
      </div>
    </div>
  );
                       }    
