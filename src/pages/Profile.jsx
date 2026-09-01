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
