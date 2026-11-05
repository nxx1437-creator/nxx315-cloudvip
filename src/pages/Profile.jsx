// src/pages/Profile.jsx — trang Hồ sơ (đã tách nhỏ, các phần nằm trong src/components/profile/)
import React, { useEffect, useState } from "react";
import { Bell, Lock, Palette, ShieldAlert, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import useTheme from "../hooks/useTheme.js";
import useProfileSecurity from "../hooks/useProfileSecurity.js";
import { supabase } from "../lib/supabaseClient.js";
import { checkUsernameChangeAllowed } from "../lib/usernameUtils.js";

import BottomNav from "../components/BottomNav.jsx";
import TopHeader from "../components/TopHeader.jsx";
import ProfileSkeleton from "../components/ProfileSkeleton.jsx";
import ProfileHeader from "../components/profile/ProfileHeader.jsx";
import HelpCenterCard from "../components/profile/HelpCenterCard.jsx";
import AppSettingsCard from "../components/profile/AppSettingsCard.jsx";
import SecurityPanel from "../components/profile/SecurityPanel.jsx";
import { NotifPanel, ThemePanel } from "../components/profile/PreferencePanels.jsx";
import { TileButton } from "../components/profile/ProfileUI.jsx";
import EditProfileModal from "../components/profile/EditProfileModal.jsx";
import ChangePasswordModal from "../components/profile/ChangePasswordModal.jsx";
import DeleteAccountModal from "../components/profile/DeleteAccountModal.jsx";
import {
  MfaSetupModal,
  RecoveryCodesModal,
  LogoutModal,
} from "../components/profile/ProfileDialogs.jsx";

const PAGE_STYLE = `
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
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-in { animation: fadeIn 0.5s ease-out; }
`;

export default function ProfilePage() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile, loading: profileHookLoading, setProfile } = useProfile();
  const { themeMode, accentColor, setThemeMode, setAccentColor } = useTheme();
  const sec = useProfileSecurity(session);

  const [activeSection, setActiveSection] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [userLevel, setUserLevel] = useState(null);
  const [usernameCooldown, setUsernameCooldown] = useState({
    canChange: true,
    remainingText: "",
  });

  const uid = session?.user?.id;

  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*, last_username_change")
          .eq("id", uid)
          .single();
        if (error) throw error;
        if (data) {
          setProfile(data);
          setUsernameCooldown(checkUsernameChangeAllowed(data.last_username_change));
        }
      } catch (err) {
        console.error("Load profile error:", err);
      }
      try {
        const { data, error } = await supabase.rpc("get_user_level", { p_user_id: uid });
        if (error) throw error;
        if (data) setUserLevel(data);
      } catch (err) {
        console.error("Load level error:", err);
      }
    })();
  }, [uid]);

  const toggleSection = (key) =>
    setActiveSection((prev) => (prev === key ? null : key));

  const updateNotifPref = async (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    if (profile?.id) {
      await supabase.from("profiles").update({ [field]: value }).eq("id", profile.id);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // open: "home" | "chat" | "faq" | "idea" | "history" — trang /help có thể đọc location.state.open
  const openHelp = (open) => navigate("/help", { state: { open } });

  return (
    <div className="min-h-screen bg-[#eef2f9] pb-28 font-[Be_Vietnam_Pro] dark:bg-slate-950">
      <style>{PAGE_STYLE}</style>
      <TopHeader />

      <main className="mx-auto max-w-md space-y-4 px-4 py-5 md:max-w-3xl">
        {profileHookLoading && !profile?.username ? (
          <ProfileSkeleton />
        ) : (
          <div className="fade-in space-y-4">
            <ProfileHeader
              userId={uid}
              session={session}
              profile={profile}
              userLevel={userLevel}
              onEdit={() => setShowEditProfile(true)}
              onAvatar={(url) => setProfile((prev) => ({ ...prev, avatar_url: url }))}
              onOpenLevel={() => navigate("/level")}
            />

            {profile?.multi_account_flag && !profile?.is_banned && (
              <button
                type="button"
                onClick={() => navigate("/account-review")}
                className="w-full rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left transition hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10"
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

            <section className="rounded-2xl bg-white p-4 dark:bg-slate-900">
              <h2 className="px-1 font-display text-[20px] font-bold text-slate-900 dark:text-white">
                Quản lý tài khoản
              </h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <TileButton icon={User} label="Hồ sơ cá nhân" onClick={() => setShowEditProfile(true)} />
                <TileButton icon={Lock} label="Bảo mật" active={activeSection === "security"} onClick={() => toggleSection("security")} />
                <TileButton icon={Bell} label="Thông báo" active={activeSection === "notif"} onClick={() => toggleSection("notif")} />
                <TileButton icon={Palette} label="Giao diện" active={activeSection === "theme"} onClick={() => toggleSection("theme")} />
              </div>
            </section>

            {activeSection === "security" && (
              <SecurityPanel
                profile={profile}
                session={session}
                sec={sec}
                onEditProfile={() => setShowEditProfile(true)}
                onChangePassword={() => setShowChangePassword(true)}
              />
            )}
            {activeSection === "notif" && (
              <NotifPanel profile={profile} updateNotifPref={updateNotifPref} />
            )}
            {activeSection === "theme" && (
              <ThemePanel
                themeMode={themeMode}
                accentColor={accentColor}
                setThemeMode={setThemeMode}
                setAccentColor={setAccentColor}
              />
            )}

            <HelpCenterCard userId={uid} onOpen={openHelp} />

            <AppSettingsCard
              onTerms={() => navigate("/terms")}
              onPrivacy={() => navigate("/privacy")}
              onLogout={() => setShowLogout(true)}
              onDelete={() => setShowDeleteAccount(true)}
            />
          </div>
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
          isMFAEnabled={sec.isMFAEnabled}
        />
      )}

      {showDeleteAccount && (
        <DeleteAccountModal
          onClose={() => setShowDeleteAccount(false)}
          isMFAEnabled={sec.isMFAEnabled}
        />
      )}

      {sec.showMFA && (
        <MfaSetupModal
          secret={sec.secret}
          isCopied={sec.isCopied}
          onCopy={sec.handleCopySecret}
          verifyCode={sec.verifyCode}
          setVerifyCode={sec.setVerifyCode}
          onSubmit={sec.handleVerifyMFA}
          error={sec.mfaError}
          success={sec.mfaSuccess}
          onClose={() => sec.setShowMFA(false)}
        />
      )}

      {sec.showRecovery && (
        <RecoveryCodesModal
          recoveryCodes={sec.recoveryCodes}
          onClose={() => sec.setShowRecovery(false)}
        />
      )}

      {showLogout && (
        <LogoutModal onCancel={() => setShowLogout(false)} onConfirm={handleLogout} />
      )}

      <BottomNav />
    </div>
  );
}
