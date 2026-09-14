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
import TopHeader from "../components/TopHeader.jsx";
import MfaChallenge from "../components/MfaChallenge.jsx";
import AvatarUploader from "../components/AvatarUploader.jsx";
import ProfileSkeleton from "../components/ProfileSkeleton.jsx";
import { isPushSupported, getPushPermissionState, subscribeToPush, unsubscribeFromPush } from "../lib/pushNotifications.js";
import { checkUsernameChangeAllowed } from "../lib/usernameUtils.js";

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
  const [pushState, setPushState] = useState("default");
  const [pushLoading, setPushLoading] = useState(false);
  const [pushError, setPushError] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [usernameCooldown, setUsernameCooldown] = useState({ canChange: true, remainingText: "" });

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
    getPushPermissionState().then(setPushState);
    checkMFAStatus();
  }, []);

  useEffect(() => {
  if (!session?.user?.id) return;

  const skeletonTimer = setTimeout(() => {
    setProfileLoading(true);
  }, 300);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, last_username_change")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setUsernameCooldown(checkUsernameChangeAllowed(data.last_username_change));
      }
    } catch (err) {
      console.error("Load profile error:", err);
    } finally {
      clearTimeout(skeletonTimer);
      setProfileLoading(false);
    }
  };

  loadProfile();

  return () => clearTimeout(skeletonTimer);
}, [session?.user?.id]);

  const handleTogglePush = async () => {
    setPushError("");
    setPushLoading(true);

    try {
      if (pushState === "granted") {
        await unsubscribeFromPush();
        await supabase.from("push_subscriptions").delete().eq("user_id", session.user.id);
        setPushState("default");
      } else {
        const sub = await subscribeToPush();

        await supabase.from("push_subscriptions").upsert(
          {
            user_id: session.user.id,
            endpoint: sub.endpoint,
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
          },
          { onConflict: "endpoint" }
        );

        setPushState("granted");
      }
    } catch (err) {
      setPushError(err.message || "Có lỗi xảy ra.");
    } finally {
      setPushLoading(false);
    }
  };

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
    <div className="min-h-screen bg-[#FAFBFC] pb-24 font-[Be_Vietnam_Pro] dark:bg-slate-950">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .skeleton-shimmer {
          background-image: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
        }
        .dark .skeleton-shimmer {
          background-image: linear-gradient(90deg, #1e293b 0%, #334155 50%, #1e293b 100%);
        }
      `}</style>

      <TopHeader />

      <main className="mx-auto max-w-md md:max-w-3xl space-y-5 px-4 py-6">
        {profileLoading ? (
          <ProfileSkeleton />
        ) : (
          <>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Cài đặt
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                Quản lý tài khoản và tùy chỉnh trải nghiệm của bạn
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col items-center p-6">
                <AvatarUploader
                  userId={session?.user?.id}
                  currentUrl={profile?.avatar_url}
                  initial={initial}
                  onUploaded={(url) => {
                    setProfile((prev) => ({ ...prev, avatar_url: url }));
                  }}
                />

                <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                  {displayName}
                </h2>
                <p className="text-xs text-slate-500">Thành viên từ {memberSince}</p>

                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <Star size={11} className="text-amber-500" />
                    Lv.{profile.level || 1}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-500/10">
                    <Flame size={11} />
                    {profile.streak_days || 0} ngày
                  </span>
                </div>

                <div className="mt-4 w-full max-w-xs">
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                    <span>{profile.exp || 0} EXP</span>
                    <span>{profile.exp_target || 100} EXP</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-accent-500 transition-all duration-500"
                      style={{ width: `${expPercent}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setShowEditProfile(true)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
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
                className="w-full rounded-xl border border-amber-200 bg-amber-50 p-4 text-left transition hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/20">
                    <ShieldAlert size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                      Tài khoản đang được xem xét
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-amber-700 dark:text-amber-300/80">
                      Nhấn để xem chi tiết hoặc gửi giải trình nếu bạn cho rằng đây là nhầm lẫn.
                    </p>
                  </div>
                </div>
              </button>
            )}

            <SettingsGroup title="Tài khoản">
              <SettingsRow icon={User} label="Hồ sơ cá nhân" sub="Tên, avatar, thông tin" onClick={() => setShowEditProfile(true)} />
              <SettingsRow icon={Lock} label="Bảo mật" sub="Mật khẩu, 2FA, thiết bị" onClick={() => toggleSection("security")} active={activeSection === "security"} />
              <SettingsRow icon={Mail} label="Email" sub={session?.user?.email} onClick={() => toggleSection("security")} last />
            </SettingsGroup>

            {activeSection === "security" && (
              <div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-100 p-4 dark:border-slate-800">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Thông tin tài khoản
                  </p>
                </div>

                <div className="p-4">
                  <div className="mb-4 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => setShowEditProfile(true)}
                      className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                    >
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Tên hiển thị</span>
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                        {profile.username || "Chưa đặt"}
                        <ChevronRight size={14} className="text-slate-400" />
                      </span>
                    </button>

                    <div className="flex w-full items-center justify-between px-4 py-3">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Email</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {session?.user?.email}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => setShowChangePassword(true)}
                      className="flex w-full items-center justify-between rounded-lg border border-slate-200 p-3.5 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          <KeyRound size={16} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Đổi mật khẩu</p>
                          <p className="text-xs text-slate-500">Cập nhật mật khẩu đăng nhập</p>
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
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Xác thực 2 bước</p>
                          <p className="text-xs text-slate-500">Google Authenticator</p>
                        </div>
                      </div>
                      <span className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${isMFAEnabled ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
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
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Thông báo đẩy</p>
                          <p className="text-xs text-slate-500">
                            {pushState === "unsupported" ? "Thiết bị không hỗ trợ" : "Nhận thông báo khi đóng app"}
                          </p>
                        </div>
                      </div>
                      {pushLoading ? (
                        <Loader2 size={16} className="animate-spin text-slate-400" />
                      ) : (
                        <span className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${pushState === "granted" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                          {pushState === "granted" ? "Đã bật" : "Chưa bật"}
                        </span>
                      )}
                    </button>

                    {pushError && <p className="text-xs font-semibold text-rose-500">{pushError}</p>}

                    <button
                      onClick={generateRecoveryCodes}
                      className="flex w-full items-center justify-between rounded-lg border border-slate-200 p-3.5 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          <KeyRound size={16} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Mã dự phòng</p>
                          <p className="text-xs text-slate-500">Số mã: {recoveryCodes.length}/10</p>
                        </div>
                      </div>
                      <Plus size={16} className="text-slate-400" />
                    </button>

                    <button
                      onClick={handleLogoutAllDevices}
                      className="flex w-full items-center justify-between rounded-lg border border-rose-200 bg-rose-50/50 p-3.5 text-left transition hover:bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10 dark:hover:bg-rose-500/20"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-500 dark:bg-rose-500/20">
                          <LogOut size={16} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">Đăng xuất mọi thiết bị</p>
                          <p className="text-xs text-rose-500/80">Kết thúc tất cả phiên đăng nhập</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <SettingsGroup title="Trải nghiệm">
              <SettingsRow icon={Bell} label="Thông báo" sub="Tùy chỉnh loại thông báo nhận" onClick={() => toggleSection("notif")} active={activeSection === "notif"} />
              <SettingsRow icon={Palette} label="Giao diện" sub="Chế độ sáng/tối, màu chủ đạo" onClick={() => toggleSection("theme")} active={activeSection === "theme"} last />
            </SettingsGroup>

            {activeSection === "notif" && (
              <div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-100 p-4 dark:border-slate-800">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Loại thông báo
                  </p>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  <NotifToggle label="Thông báo đơn hàng" sub="Trạng thái đơn nạp game" checked={profile.notif_orders} onChange={(v) => updateNotifPref("notif_orders", v)} />
                  <NotifToggle label="Thông báo khuyến mãi" sub="Ưu đãi, sự kiện mới" checked={profile.notif_promo} onChange={(v) => updateNotifPref("notif_promo", v)} />
                  <NotifToggle label="Thông báo phần thưởng" sub="Khi nhận Coin, quà tặng" checked={profile.notif_rewards} onChange={(v) => updateNotifPref("notif_rewards", v)} />
                  <NotifToggle label="Thông báo hệ thống" sub="Cập nhật, bảo trì" checked={profile.notif_system} onChange={(v) => updateNotifPref("notif_system", v)} last />
                </div>
              </div>
            )}

            {activeSection === "theme" && (
              <div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-100 p-4 dark:border-slate-800">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Chế độ hiển thị
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 p-4">
                  {THEME_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => setThemeMode(opt.key)}
                        className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-xs font-semibold transition ${
                          themeMode === opt.key
                            ? "border-accent-500 bg-accent-500/5 text-accent-600 dark:bg-accent-500/10"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <Icon size={18} />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                <div className="border-b border-t border-slate-100 p-4 dark:border-slate-800">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Màu giao diện
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 p-4">
                  {ACCENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setAccentColor(opt.key)}
                      className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-xs font-semibold transition ${
                        accentColor === opt.key
                          ? "border-accent-500 bg-accent-500/5 text-accent-600 dark:bg-accent-500/10"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50"
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
              <SettingsRow icon={HelpCircle} label="Trung tâm trợ giúp" sub="Câu hỏi thường gặp, liên hệ" onClick={() => navigate("/help")} />
              <SettingsRow icon={FileText} label="Điều khoản sử dụng" sub="Quy định khi dùng dịch vụ" onClick={() => navigate("/terms")} />
              <SettingsRow icon={Lock} label="Chính sách quyền riêng tư" sub="Cách chúng tôi bảo vệ dữ liệu" onClick={() => navigate("/privacy")} last />
            </SettingsGroup>

            <SettingsGroup title="Nguy hiểm" danger>
              <SettingsRow icon={LogOut} label="Đăng xuất" sub="Thoát khỏi tài khoản hiện tại" onClick={() => setShowLogout(true)} danger />
              <SettingsRow icon={Trash2} label="Xóa tài khoản" sub="Xóa vĩnh viễn, không thể hoàn tác" onClick={() => setShowDeleteAccount(true)} danger last />
            </SettingsGroup>
          </>
        )}
      </main>

      {showEditProfile && (
        <EditProfileModal
          profile={profile}
          cooldown={usernameCooldown}
          onClose={() => setShowEditProfile(false)}
          onSaved={(newUsername) => {
            setProfile((prev) => ({
              ...prev,
              username: newUsername,
              last_username_change: new Date().toISOString(),
            }));
            setUsernameCooldown(checkUsernameChangeAllowed(new Date().toISOString()));
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Thêm thiết bị</h3>
            <p className="mt-2 text-sm text-slate-500">Mở Google Authenticator, chọn "Nhập mã thiết lập" và nhập chuỗi bên dưới:</p>

            <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Mã bí mật</p>
                <p className="break-all font-mono text-sm font-bold text-accent-600">{secret}</p>
              </div>
              <button
                onClick={handleCopySecret}
                className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-600 text-white transition hover:opacity-90"
              >
                {isCopied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            <form onSubmit={handleVerifyMFA} className="mt-4">
              <input
                type="text"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="Nhập mã 6 số"
                maxLength={6}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-center text-lg font-semibold tracking-widest outline-none transition focus:border-accent-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {mfaError && <p className="mt-2 text-xs font-medium text-rose-500">{mfaError}</p>}
              {mfaSuccess && <p className="mt-2 text-xs font-medium text-emerald-600">{mfaSuccess}</p>}

              <div className="mt-5 flex gap-3">
                <button type="button" onClick={() => setShowMFA(false)} className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                  Huỷ
                </button>
                <button type="submit" className="flex-1 rounded-lg bg-accent-600 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRecovery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Mã dự phòng</h3>
            <p className="mt-2 text-sm text-slate-500">Lưu lại những mã này ở nơi an toàn. Mỗi mã chỉ dùng được 1 lần.</p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {recoveryCodes.map((code, idx) => (
                <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center font-mono text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {code}
                </div>
              ))}
            </div>

            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowRecovery(false)} className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
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
      )}

      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-xl dark:bg-slate-900">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/10">
              <LogOut size={20} className="text-rose-500" />
            </div>
            <h3 className="mt-3 font-display text-lg font-bold text-slate-900 dark:text-white">Đăng xuất?</h3>
            <p className="mt-1 text-sm text-slate-500">Bạn sẽ cần đăng nhập lại để sử dụng dịch vụ.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowLogout(false)} className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                Huỷ
              </button>
              <button onClick={handleLogout} className="flex-1 rounded-lg bg-rose-500 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600">
                Đăng xuất
              </button>
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
      <p className={`mb-2 px-1 text-[11px] font-bold uppercase tracking-wider ${danger ? "text-rose-500" : "text-slate-500"}`}>
        {title}
      </p>
      <div className={`overflow-hidden rounded-xl border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-slate-900 ${
        danger
          ? "border-rose-200 dark:border-rose-500/30"
          : "border-slate-200 dark:border-slate-800"
      }`}>
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ icon: Icon, label, sub, onClick, active, danger, last }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between px-4 py-3.5 text-left transition ${
        !last ? "border-b border-slate-100 dark:border-slate-800" : ""
      } ${
        active
          ? "bg-slate-50 dark:bg-slate-800/50"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          danger
            ? "bg-rose-50 text-rose-500 dark:bg-rose-500/10"
            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        }`}>
          <Icon size={16} />
        </span>
        <div className="min-w-0">
          <p className={`truncate text-sm font-semibold ${
            danger ? "text-rose-600 dark:text-rose-400" : "text-slate-800 dark:text-slate-100"
          }`}>
            {label}
          </p>
          {sub && (
            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
              {sub}
            </p>
          )}
        </div>
      </div>
      <ChevronRight size={16} className="shrink-0 text-slate-400" />
    </button>
  );
}

function NotifToggle({ label, sub, checked, onChange, last }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {label}
        </p>
        {sub && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {sub}
          </p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-accent-500" : "bg-slate-200 dark:bg-slate-700"
        }`}
        aria-checked={checked}
        role="switch"
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
function EditProfileModal({ profile, cooldown, onClose, onSaved }) {
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
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-500" />
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              Bạn có thể đổi tên sau <span className="font-bold">{cooldown.remainingText}</span> nữa.
            </p>
          </div>
        )}

        {cooldown.canChange && (
          <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 p-3 dark:border-sky-500/30 dark:bg-sky-500/10">
            <p className="text-xs text-sky-700 dark:text-sky-300">
              💡 Bạn có thể đổi tên <span className="font-bold">1 lần mỗi 7 ngày</span>.
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

        {error && (
          <p className="mt-2 text-xs font-bold text-rose-500">{error}</p>
        )}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Đổi mật khẩu
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <Check size={18} className="shrink-0 text-emerald-500" />
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Đổi mật khẩu thành công!
            </p>
          </div>
        ) : (
          <>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-accent-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ít nhất 6 ký tự"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-accent-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-accent-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {error && (
              <p className="mt-3 text-xs font-bold text-rose-500">{error}</p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Huỷ
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent-600 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
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
      const { error: fnError } = await supabase.functions.invoke("swift-function", {
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
          Hành động này <span className="font-bold text-rose-500">không thể hoàn tác</span>.
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

        {error && (
          <p className="mt-2 text-xs font-bold text-rose-500">{error}</p>
        )}

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
            {deleting ? <Loader2 size={15} className="animate-spin" /> : "Xóa vĩnh viễn"}
          </button>
        </div>
      </div>
    </div>
  );
         }
