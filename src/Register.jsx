import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, MessageCircle, Loader2 } from "lucide-react";
import AuthShell from "./components/AuthShell.jsx";
import { Link } from "react-router-dom";
import { supabase } from "./lib/supabaseClient.js";

/**
 * Register.jsx
 * -----------------------------------------------------------------
 * Wired to Supabase Auth. By default Supabase requires email
 * confirmation before a session is created — if that's on, the user
 * gets a confirmation email instead of being logged in immediately.
 * You can turn confirmation off in Supabase Dashboard -> Authentication
 * -> Providers -> Email -> "Confirm email" while testing.
 * -----------------------------------------------------------------
 */
export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (form.password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (!agreed) {
      setError("Bạn cần đồng ý với Điều khoản sử dụng để tạo tài khoản.");
      return;
    }
    setError("");
    setLoading(true);
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { username: form.username } },
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    if (data.session) {
      navigate("/");
    } else {
      // Email confirmation is required before a session exists.
      setConfirmSent(true);
    }
  };

  const handleOAuth = async (provider) => {
    setError("");
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (authError) setError(authError.message);
  };

  return (
    <AuthShell
      title="Tạo tài khoản mới"
      subtitle="Đăng ký miễn phí để bắt đầu kiếm Coin."
      footer={
        <span>
          Đã có tài khoản?{" "}
          <Link to="/login" className="font-semibold text-sky-400 hover:underline">
            Đăng nhập
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-sky-300/80">
            Tên đăng nhập
          </label>
          <div className="relative">
            <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-300/60" />
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Tên đăng nhập"
              className="w-full rounded-full border border-white/15 bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-sky-50 placeholder:text-sky-200/40 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-sky-300/80">
            Email
          </label>
          <div className="relative">
            <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-300/60" />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@email.com"
              className="w-full rounded-full border border-white/15 bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-sky-50 placeholder:text-sky-200/40 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-sky-300/80">
            Mật khẩu
          </label>
          <div className="relative">
            <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-300/60" />
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Tối thiểu 8 ký tự"
              className="w-full rounded-full border border-white/15 bg-white/[0.03] py-3 pl-10 pr-11 text-sm text-sky-50 placeholder:text-sky-200/40 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sky-300/60 hover:text-sky-200"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-sky-300/80">
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-300/60" />
            <input
              type={showConfirm ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Nhập lại mật khẩu"
              className="w-full rounded-full border border-white/15 bg-white/[0.03] py-3 pl-10 pr-11 text-sm text-sky-50 placeholder:text-sky-200/40 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sky-300/60 hover:text-sky-200"
              aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-sky-200/80">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded accent-sky-500"
          />
          <span>
            Tôi đồng ý với{" "}
            <a href="/terms" className="font-medium text-sky-400 hover:underline">
              Điều khoản sử dụng
            </a>{" "}
            và{" "}
            <a href="/privacy" className="font-medium text-sky-400 hover:underline">
              Chính sách bảo mật
            </a>
          </span>
        </label>

        {error && <p className="text-sm text-rose-400">{error}</p>}
        {confirmSent && (
          <p className="text-sm text-emerald-400">
            Đã gửi email xác nhận tới {form.email}. Kiểm tra hộp thư để hoàn tất đăng ký.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:shadow-sky-500/50 hover:brightness-110 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              Đăng ký <ArrowRight size={16} />
            </>
          )}
        </button>

        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[11px] font-medium uppercase tracking-wide text-sky-300/50">
            Hoặc tiếp tục với
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleOAuth("google")}
            className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] py-2.5 text-sm font-medium text-sky-100 transition hover:bg-white/[0.07]"
          >
            <svg width="16" height="16" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
              <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.5 16 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.6 0-14.1 4.3-17.7 10.7z"/>
              <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.1-5.1l-6.5-5.5C29.5 35.1 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.8 39.6 16.3 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.5C40.9 36.5 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z"/>
            </svg>
            Google
          </button>
          <button
            type="button"
            onClick={() => handleOAuth("discord")}
            className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] py-2.5 text-sm font-medium text-sky-100 transition hover:bg-white/[0.07]"
          >
            <MessageCircle size={16} className="text-indigo-400" />
            Discord
          </button>
        </div>
      </form>
    </AuthShell>
  );
        }
            
