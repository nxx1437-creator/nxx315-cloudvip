import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Loader2 } from "lucide-react";
import AuthShell from "../components/AuthShell.jsx";
import SocialRow from "../components/SocialRow.jsx";
import { supabase } from "../lib/supabaseClient.js";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.email || !form.password) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    setError("");
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { username: form.username || form.email.split("@")[0] }
      }
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }

    if (data.user) {
      alert(" Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.");
      navigate("/login");
    }
  };

  const handleSocial = async (provider, supported) => {
  setError("");
  if (!supported) {
    setError("Đăng nhập bằng " + provider + " sắp ra mắt, bạn dùng cách khác giúp mình nhé.");
    return;
  }
  const { error: authError } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/#/dashboard` }, 
  });
  if (authError) setError(authError.message);
};

  return (
    <AuthShell
      title="Đăng ký"
      subtitle="Đăng ký với tài khoản mạng xã hội"
      promo={{
        heading: "Đã có tài khoản?",
        body: "Đăng nhập ngay để tiếp tục kiếm Coin và nhận thưởng.",
        ctaLabel: "Đăng nhập",
        ctaHref: "/login",
      }}
    >
      <SocialRow onSelect={handleSocial} />

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="relative">
          <User size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sky-300/50" />
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="Tên hiển thị (tùy chọn)"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-sky-200/30 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
          />
        </div>

        <div className="relative">
          <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sky-300/50" />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-sky-200/30 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Lock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sky-300/50" />
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Mật khẩu (tối thiểu 6 ký tự)"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-11 text-sm text-white placeholder:text-sky-200/30 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sky-300/50 hover:text-sky-200"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            aria-label="Đăng ký"
            className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/30 transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
          </button>
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}
      </form>
    </AuthShell>
  );
      }
