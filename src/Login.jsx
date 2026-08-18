import React, { useState } from "react";
import { User, Lock, Eye, EyeOff, ArrowRight, MessageCircle } from "lucide-react";
import AuthShell from "./components/AuthShell.jsx";

/**
 * Login.jsx
 * -----------------------------------------------------------------
 * UI only — wire `handleSubmit` up to your auth backend (e.g. Supabase
 * `supabase.auth.signInWithPassword({ email, password })`). Social
 * buttons are placeholders; hook them to your OAuth provider calls.
 * -----------------------------------------------------------------
 */
export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.identifier || !form.password) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập/email và mật khẩu.");
      return;
    }
    if (!agreed) {
      setError("Bạn cần đồng ý với Điều khoản sử dụng để tiếp tục.");
      return;
    }
    setError("");
    // TODO: gọi API đăng nhập thật ở đây, ví dụ:
    // await supabase.auth.signInWithPassword({ email: form.identifier, password: form.password });
    console.log("Đăng nhập với:", form);
  };

  return (
    <AuthShell
      title="Đăng nhập vào tài khoản"
      subtitle="Nhập thông tin để tiếp tục kiếm Coin."
      footer={
        <span>
          Chưa có tài khoản?{" "}
          <a href="/register" className="font-semibold text-pink-400 hover:underline">
            Đăng ký ngay
          </a>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-pink-300/80">
            Tên đăng nhập hoặc Email
          </label>
          <div className="relative">
            <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-300/60" />
            <input
              type="text"
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
              placeholder="Tên đăng nhập hoặc Email"
              className="w-full rounded-full border border-white/15 bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-pink-50 placeholder:text-pink-200/40 outline-none transition focus:border-pink-400/60 focus:ring-2 focus:ring-pink-400/20"
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wide text-pink-300/80">
              Mật khẩu
            </label>
            <a href="/forgot-password" className="text-xs font-medium text-pink-400 hover:underline">
              Quên mật khẩu?
            </a>
          </div>
          <div className="relative">
            <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-300/60" />
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Mật khẩu"
              className="w-full rounded-full border border-white/15 bg-white/[0.03] py-3 pl-10 pr-11 text-sm text-pink-50 placeholder:text-pink-200/40 outline-none transition focus:border-pink-400/60 focus:ring-2 focus:ring-pink-400/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-pink-300/60 hover:text-pink-200"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-pink-200/80">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded accent-pink-500"
          />
          <span>
            Bằng việc đăng nhập, bạn đồng ý với{" "}
            <a href="/terms" className="font-medium text-pink-400 hover:underline">
              Điều khoản sử dụng
            </a>
          </span>
        </label>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-400 to-fuchsia-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:shadow-pink-500/50 hover:brightness-110"
        >
          Đăng nhập <ArrowRight size={16} />
        </button>

        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[11px] font-medium uppercase tracking-wide text-pink-300/50">
            Hoặc tiếp tục với
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] py-2.5 text-sm font-medium text-pink-100 transition hover:bg-white/[0.07]"
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
            className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] py-2.5 text-sm font-medium text-pink-100 transition hover:bg-white/[0.07]"
          >
            <MessageCircle size={16} className="text-indigo-400" />
            Discord
          </button>
        </div>
      </form>
    </AuthShell>
  );
        }
