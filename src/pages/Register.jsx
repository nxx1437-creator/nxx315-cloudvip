import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }

    if (data.user) {
      alert("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-center text-slate-900">📝 Đăng ký</h1>
        <p className="text-center text-slate-500 mt-2">
          Đã có tài khoản? <Link to="/login" className="text-sky-600 font-semibold">Đăng nhập</Link>
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
            placeholder="Mật khẩu (tối thiểu 6 ký tự)"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400"
            required
            minLength={6}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-3 text-white font-semibold shadow-lg disabled:opacity-50"
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>
      </div>
    </div>
  );
}
