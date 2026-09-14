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
        data: { username: form.username || form.email.split("@")[0] },
      },
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }

    if (data.user) {
      navigate("/verify-email", { state: { email: form.email } });
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
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (authError) setError(authError.message);
  };

  return (
    <AuthShell
      title="Đăng ký"
      subtitle="Tạo tài khoản miễn phí chỉ trong 30 giây"
      promo={{
        heading: "Đã có tài khoản?",
        body: "Đăng nhập ngay để tiếp tục kiếm Coin và nhận thưởng.",
        ctaLabel: "Đăng nhập",
        ctaHref: "/login",
      }}
    >
      <SocialRow onSelect={handleSocial} />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-slate-400">
            hoặc đăng ký bằng email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <User
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="Tên hiển thị (tùy chọn)"
            className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </div>

        <div className="relative">
          <Mail
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-slate-400"
          />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </div>

        <div className="relative">
          <Lock
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-slate-400"
          />
          <input
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Mật khẩu (tối thiểu 6 ký tự)"
            className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3.5 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5">
            <p className="text-xs font-medium text-rose-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:shadow-sky-500/50 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Đang tạo tài khoản...
            </>
          ) : (
            <>
              Tạo tài khoản
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-0.5"
              />
            </>
          )}
        </button>
      </form>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-400">
        Bằng cách đăng ký, bạn đồng ý với{" "}
        <Link to="/terms" className="font-medium text-sky-600 hover:underline">
          Điều khoản
        </Link>{" "}
        và{" "}
        <Link to="/privacy" className="font-medium text-sky-600 hover:underline">
          Chính sách bảo mật
        </Link>
      </p>
    </AuthShell>
  );
}
