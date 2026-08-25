import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';
import { Loader2 } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">Đăng ký</h1>
          <p className="mt-2 text-sm text-slate-500">
            Đã có tài khoản? <Link to="/login" className="text-sky-600 font-semibold">Đăng nhập</Link>
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="mt-6 space-y-4">
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
            {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'Đăng ký'}
          </button>
        </form>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1 border-t border-slate-200" />
          <span className="text-xs text-slate-400">Hoặc</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>

        <button
          onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })}
          className="mt-4 w-full rounded-full border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          🚀 Đăng ký với Google
        </button>
      </div>
    </div>
  );
}
