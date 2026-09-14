import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, Eye, EyeOff, User, Loader2 } from "lucide-react";
import AuthShell from "../components/AuthShell.jsx";
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

  return (
    <AuthShell
      title="Tạo tài khoản"
      subtitle="Đăng ký NXX315 Studio Rewards — hoàn toàn miễn phí"
      icon={UserPlus}
      promo={{
        heading: "Đã có tài khoản?",
        ctaLabel: "Đăng nhập",
        ctaHref: "/login",
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tên hiển thị
          </label>
          <div className="relative">
            <User
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Tên của bạn (tùy chọn)"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Email
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Mật khẩu
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Ít nhất 6 ký tự"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
            <p className="text-xs font-medium text-rose-600">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 py-4 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition-all hover:-translate-y-0.5 hover:bg-sky-600 hover:shadow-xl hover:shadow-sky-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Đang tạo tài khoản...
            </>
          ) : (
            <>
              <UserPlus size={16} />
              Đăng ký miễn phí
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
