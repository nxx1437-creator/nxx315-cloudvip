import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";

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
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-center text-slate-900">🔐 Đăng nhập</h1>
        <p className="text-center text-slate-500 mt-2">
          Chưa có tài khoản? <Link to="/register" className="text-sky-600 font-semibold">Đăng ký</Link>
        </p>

        {error && (
          <div className="mt-4 bg-rose-50 text-rose-600 p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-3 text-white font-semibold shadow-lg disabled:opacity-50"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/forgot-password" className="text-sm text-slate-400 hover:text-sky-600">
            Quên mật khẩu?
          </Link>
        </div>
      </div>
    </div>
  );
}
