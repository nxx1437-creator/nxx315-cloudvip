import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, AlertTriangle } from "lucide-react";
import AuthShell from "../components/AuthShell.jsx";
import SocialRow from "../components/SocialRow.jsx";
import { supabase, getClientIp, logFraudEvent } from "../lib/supabaseClient.js";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [duplicateIpWarning, setDuplicateIpWarning] = useState(false);

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

    try {
      // ✅ BƯỚC 1: Lấy IP
      const ip = await getClientIp();

      // ✅ BƯỚC 2: Check IP đã đăng ký chưa
      if (ip) {
        const { data: checkResult } = await supabase.rpc(
          "check_registration_ip",
          { p_ip: ip }
        );

        if (checkResult?.already_registered) {
          // Cảnh báo lần 1 — user cần bấm "Đăng ký" lần 2 để xác nhận
          if (!duplicateIpWarning) {
            setDuplicateIpWarning(true);
            setError(
              `⚠️ IP của bạn đã được dùng để đăng ký ${checkResult.count} tài khoản khác.\n\n` +
              `Mỗi người chỉ được phép có 1 tài khoản duy nhất. ` +
              `Nếu bạn tiếp tục, tài khoản có thể bị đánh dấu và xem xét.\n\n` +
              `Bấm "Đăng ký" lần nữa nếu bạn chắc chắn muốn tiếp tục.`
            );
            setLoading(false);
            return;
          }
          // Đã cảnh báo 1 lần → cho phép tiếp tục
        }
      }

      // ✅ BƯỚC 3: Tạo tài khoản
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { username: form.username || form.email.split("@")[0] },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // ✅ BƯỚC 4: Ghi IP đăng ký vào DB
      if (data.user && ip) {
        await supabase.from("registration_ips").insert({
          ip,
          user_id: data.user.id,
        });

        // ✅ BƯỚC 5: Nếu có duplicate warning → log fraud event
        if (duplicateIpWarning) {
          await logFraudEvent(
            data.user.id,
            "multiple_accounts_same_ip",
            "high",
            {
              ip,
              existing_count: checkResult?.count || 0,
              email: form.email,
            }
          );
        }
      }

      if (data.user) {
        navigate("/verify-email", { state: { email: form.email } });
      }
    } catch (err) {
      console.error("[register] error:", err);
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
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
            className={`rounded-2xl px-4 py-3 text-xs font-medium whitespace-pre-line ${
              duplicateIpWarning
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-rose-50 text-rose-600"
            }`}
          >
            {duplicateIpWarning && (
              <div className="mb-1 flex items-center gap-1.5 font-bold">
                <AlertTriangle size={14} />
                Cảnh báo đa tài khoản
              </div>
            )}
            {error}
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
          ) : duplicateIpWarning ? (
            "Xác nhận đăng ký"
          ) : (
            "Đăng ký"
          )}
        </button>
      </form>

      {/* OR */}
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
