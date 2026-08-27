import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }

    if (data.session) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-3xl font-bold text-slate-800">
            🎮 NXX315 Studio
          </div>
          <p className="text-slate-500 mt-1">Đăng nhập để bắt đầu kiếm Coin</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-sky-500/10 border border-white/50">
          <h1 className="text-2xl font-bold text-slate-800">🔐 Đăng nhập</h1>
          <p className="text-slate-500 text-sm mt-1">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-sky-600 font-semibold hover:underline">
              Đăng ký ngay
            </Link>
          </p>

          {error && (
            <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-2xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Địa chỉ email"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-12 pr-4 py-3.5 text-sm outline-none focus:border-sky-400 focus:bg-white transition"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-12 pr-4 py-3.5 text-sm outline-none focus:border-sky-400 focus:bg-white transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 py-3.5 text-white font-semibold shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Đăng nhập <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/forgot-password" className="text-sm text-slate-400 hover:text-sky-600 transition">
              Quên mật khẩu?
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Bằng việc đăng nhập, bạn đồng ý với{" "}
          <Link to="/terms" className="text-sky-500 hover:underline">Điều khoản</Link>{" "}
          và{" "}
          <Link to="/privacy" className="text-sky-500 hover:underline">Chính sách bảo mật</Link>
        </p>
      </div>
    </div>
  );
          }
