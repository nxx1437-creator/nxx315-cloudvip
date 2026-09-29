import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Loader2, AlertTriangle, ShieldAlert, Lock } from "lucide-react";
import AuthShell from "../components/AuthShell.jsx";
import SocialRow from "../components/SocialRow.jsx";
import MfaChallenge from "../components/MfaChallenge.jsx";
import { supabase } from "../lib/supabaseClient.js";
import useLoginRateLimit from "../hooks/useLoginRateLimit.js";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState("error");
  const [loading, setLoading] = useState(false);
  const [showMfa, setShowMfa] = useState(false);

  const {
    isLocked,
    attemptsLeft,
    remainingSec,
    recordFailure,
    reset,
    maxAttempts,
  } = useLoginRateLimit(form.email);

  // Hiện thông báo nếu bị redirect từ check-user-ip
  useEffect(() => {
    const errParam = searchParams.get("error");
    if (errParam === "ip_duplicate") {
      setError(
        "IP của bạn đã có tài khoản khác. Vui lòng đăng nhập tài khoản cũ hoặc liên hệ Zalo 0865245988."
      );
      setErrorType("ip_duplicate");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e?.preventDefault();

    // ✅ Check locked trước khi login
    if (isLocked) {
      setError(
        `Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau ${remainingSec}s.`
      );
      setErrorType("locked");
      return;
    }

    if (!form.email || !form.password) {
      setError("Vui lòng điền đầy đủ thông tin.");
      setErrorType("error");
      return;
    }
    setError("");
    setErrorType("error");
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      // ✅ Ghi nhận lần sai
      const result = recordFailure();

      if (result.locked) {
        setError(
          `Bạn đã nhập sai ${maxAttempts} lần liên tiếp. Tài khoản bị khoá tạm thời trong 5 phút.`
        );
        setErrorType("locked");
      } else {
        setError(
          `Email hoặc mật khẩu không đúng. Còn ${result.attemptsLeft} lần thử.`
        );
        setErrorType("wrong_password");
      }
      setLoading(false);
      return;
    }

    // ✅ Login thành công → reset đếm
    reset();
    setLoading(false);

    if (data.session) {
      const { data: aalData } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.nextLevel === "aal2" && aalData?.currentLevel !== "aal2") {
        setShowMfa(true);
        return;
      }
      window.location.href = "/dashboard";
    }
  };

  const handleMfaCancel = async () => {
    await supabase.auth.signOut();
    setShowMfa(false);
  };

  const handleSocial = async (provider, supported) => {
    setError("");
    setErrorType("error");
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

  // Định dạng thời gian còn lại: 4:59
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <AuthShell
      title="Chào mừng trở lại"
      subtitle="Đăng nhập vào NXX315 Studio Rewards để tiếp tục."
    >
      {/* Cảnh báo chung */}
      <div className="mb-4 rounded-2xl border border-sky-200 bg-sky-50 p-3.5">
        <div className="flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-sky-600" />
          <div className="text-[12px] leading-5 text-sky-800">
            <p className="font-bold">Lưu ý</p>
            <p className="mt-1">
              Nếu bạn đã từng tạo tài khoản trên thiết bị này, vui lòng đăng nhập
              lại tài khoản <b>cũ</b>. Mỗi thiết bị chỉ được dùng 1 tài khoản.
            </p>
          </div>
        </div>
      </div>

      {/* Thông báo IP trùng */}
      {errorType === "ip_duplicate" && (
        <div className="mb-4 rounded-2xl border-2 border-rose-200 bg-rose-50 p-4">
          <div className="flex items-start gap-2">
            <ShieldAlert size={18} className="mt-0.5 shrink-0 text-rose-600" />
            <div>
              <p className="text-[13px] font-bold text-rose-800">
                IP của bạn đã có tài khoản khác
              </p>
              <p className="mt-1 text-[12px] leading-5 text-rose-700">
                Vui lòng đăng nhập tài khoản cũ hoặc liên hệ Zalo{" "}
                <a
                  href="https://zalo.me/0865245988"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline"
                >
                  0865245988
                </a>{" "}
                để được hỗ trợ.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Cảnh báo bị khoá */}
      {isLocked && (
        <div className="mb-4 rounded-2xl border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
              <Lock size={18} className="text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-red-800">
                Tài khoản bị khoá tạm thời
              </p>
              <p className="mt-1 text-[12px] leading-5 text-red-700">
                Bạn đã nhập sai mật khẩu quá {maxAttempts} lần liên tiếp.
              </p>
              <p className="mt-2 rounded-lg bg-white px-3 py-1.5 text-center text-[14px] font-black tracking-widest text-red-600">
                {formatTime(remainingSec)}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email của bạn"
          disabled={isLocked}
          className="w-full rounded-full border border-slate-300 bg-white px-5 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 disabled:bg-slate-100 disabled:opacity-60"
        />

        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Mật khẩu"
          disabled={isLocked}
          className="w-full rounded-full border border-slate-300 bg-white px-5 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 disabled:bg-slate-100 disabled:opacity-60"
        />

        {/* ✅ Cảnh báo số lần thử còn lại */}
        {!isLocked && attemptsLeft < maxAttempts && attemptsLeft > 0 && (
          <div className="rounded-full bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-700">
            ⚠️ Còn <b>{attemptsLeft}</b> lần thử. Nếu sai quá {maxAttempts} lần,
            tài khoản sẽ bị khoá 5 phút.
          </div>
        )}

        {error && errorType !== "ip_duplicate" && errorType !== "locked" && (
          <p className="rounded-2xl bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || isLocked}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLocked ? (
            <>
              <Lock size={16} />
              Đã khoá {formatTime(remainingSec)}
            </>
          ) : loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Đang đăng nhập...
            </>
          ) : (
            "Đăng nhập"
          )}
        </button>
      </form>

      <div className="mt-3 text-center">
        <Link
          to="/forgot-password"
          className="text-xs text-slate-500 hover:text-slate-700 hover:underline"
        >
          Quên mật khẩu?
        </Link>
      </div>

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

      <div className={isLocked ? "pointer-events-none opacity-50" : ""}>
        <SocialRow onSelect={handleSocial} />
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Chưa có tài khoản?{" "}
        <Link
          to="/register"
          className="font-semibold text-slate-900 hover:underline"
        >
          Đăng ký
        </Link>
      </p>

      {showMfa && (
        <MfaChallenge
          onVerified={() => {
            window.location.href = "/dashboard";
          }}
          onCancel={handleMfaCancel}
        />
      )}
    </AuthShell>
  );
          }
