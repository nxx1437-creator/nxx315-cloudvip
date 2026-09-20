import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, AlertTriangle } from "lucide-react";
import AuthShell from "../components/AuthShell.jsx";
import SocialRow from "../components/SocialRow.jsx";
import { supabase, getClientIp } from "../lib/supabaseClient.js";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState("error");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!form.email || !form.password) {
      setError("Vui lòng điền đầy đủ thông tin.");
      setErrorType("error");
      return;
    }
    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      setErrorType("error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Email không hợp lệ. Vui lòng kiểm tra lại.");
      setErrorType("error");
      return;
    }

    setError("");
    setErrorType("error");
    setLoading(true);

    try {
      const ip = await getClientIp();

      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            username: form.username || form.email.split("@")[0],
            registration_ip: ip || null,
          },
        },
      });

      setLoading(false);

      if (authError) {
        const msg = authError.message?.toLowerCase() || "";

        // ✅ Bắt lỗi email đã tồn tại
        if (
          msg.includes("already registered") ||
          msg.includes("already been registered") ||
          msg.includes("user already exists") ||
          msg.includes("email address is already") ||
          msg.includes("email already exists")
        ) {
          setError(
            `Email "${form.email}" đã được đăng ký trước đó.\n\n` +
            `Vui lòng:\n` +
            `• Đăng nhập nếu đây là tài khoản của bạn\n` +
            `• Hoặc dùng email khác để đăng ký`
          );
          setErrorType("email_exists");
        } else if (msg.includes("invalid email")) {
          setError("Email không hợp lệ. Vui lòng kiểm tra lại.");
          setErrorType("error");
        } else if (msg.includes("password")) {
          setError("Mật khẩu không hợp lệ. Vui lòng dùng mật khẩu mạnh hơn.");
          setErrorType("error");
        } else if (msg.includes("rate limit") || msg.includes("too many")) {
          setError("Bạn thao tác quá nhanh. Vui lòng đợi 1 phút rồi thử lại.");
          setErrorType("error");
        } else {
          setError(authError.message);
          setErrorType("error");
        }
        return;
      }

      if (data.user) {
        navigate("/verify-email", { state: { email: form.email } });
      }
    } catch (err) {
      console.error("[register] error:", err);
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
      setErrorType("error");
      setLoading(false);
    }
  };

  const handleSocial = async (provider, supported) => {
    setError("");
    if (!supported) {
      setError("Đăng nhập bằng " + provider + " sắp ra mắt.");
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
      title="Tạo tài khoản"
      subtitle="Đăng ký NXX315 Studio Rewards — hoàn toàn miễn phí."
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          placeholder="Tên hiển thị (tùy chọn)"
          className="w-full rounded-full border border-slate-300 bg-white px-5 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
        />

        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email của bạn"
          className="w-full rounded-full border border-slate-300 bg-white px-5 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
        />

        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Mật khẩu (ít nhất 6 ký tự)"
          className="w-full rounded-full border border-slate-300 bg-white px-5 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
        />

        {error && (
          <div
            className={`rounded-2xl border px-4 py-3 text-xs font-medium whitespace-pre-line ${
              errorType === "email_exists"
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-rose-200 bg-rose-50 text-rose-600"
            }`}
          >
            {errorType === "email_exists" && (
              <div className="mb-1.5 flex items-center gap-1.5 font-bold">
                <AlertTriangle size={14} />
                Email đã được đăng ký
              </div>
            )}
            {errorType === "email_exists" && (
              <Link
                to="/login"
                className="mt-2 inline-block font-bold text-amber-800 underline"
              >
                → Đăng nhập ngay
              </Link>
            )}
            {errorType !== "email_exists" && error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Đang tạo tài khoản...
            </>
          ) : (
            "Đăng ký"
          )}
        </button>
      </form>

      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs font-medium uppercase tracking-wider text-slate-400">
            Hoặc
          </span>
        </div>
      </div>

      <SocialRow onSelect={handleSocial} />

      <p className="mt-6 text-center text-sm text-slate-500">
        Đã có tài khoản?{" "}
        <Link to="/login" className="font-semibold text-slate-900 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </AuthShell>
  );
        }
