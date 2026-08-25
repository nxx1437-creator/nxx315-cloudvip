import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, MailCheck, Gift } from "lucide-react";
import AuthShell from "../components/AuthShell.jsx";
import SocialRow from "../components/SocialRow.jsx";
import { supabase } from "../lib/supabaseClient.js";
import { getDeviceId } from "../lib/deviceId.js";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "", referralCode: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);
  const [fingerprint, setFingerprint] = useState(null);
  const [ip, setIp] = useState(null);

  // Khởi tạo fingerprint khi component mount
  React.useEffect(() => {
    const initFingerprint = async () => {
      const fp = await generateFingerprint();
      setFingerprint(fp);
      const publicIP = await getPublicIP();
      setIp(publicIP);
    };
    initFingerprint();
  }, []);

  const generateReferralCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.username || !form.email || !form.password) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (form.password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }
    setError("");
    setLoading(true);

    const newReferralCode = generateReferralCode();

    // 1. Đăng ký user
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { 
        data: { 
          username: form.username,
          referral_code: newReferralCode,
          device_id: fingerprint?.deviceId || null,
          fingerprint: fingerprint?.fingerprint || null
        } 
      },
    });
    
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }

    if (!data.user) {
      setError("Đăng ký thất bại, vui lòng thử lại.");
      return;
    }

    // 2. Lưu fingerprint vào bảng devices
    if (fingerprint) {
      await supabase.from("devices").insert({
        user_id: data.user.id,
        device_id: fingerprint.deviceId,
        fingerprint: fingerprint.fingerprint,
        fingerprint_components: fingerprint.components,
        ip: ip || null,
        user_agent: navigator.userAgent
      });
    }

    // 3. Cập nhật referral_code vào profiles
    await supabase.from("profiles").update({ 
      referral_code: newReferralCode 
    }).eq("id", data.user.id);

    // 4. Xử lý mã giới thiệu
    if (form.referralCode && data.user) {
      const { data: referrer } = await supabase
        .from("profiles")
        .select("id, coins")
        .eq("referral_code", form.referralCode.toUpperCase())
        .single();

      if (referrer) {
        await supabase.from("referrals").insert({
          referrer_id: referrer.id,
          referred_id: data.user.id,
          code: form.referralCode.toUpperCase(),
        });

        await supabase.from("profiles").update({ coins: 200 }).eq("id", data.user.id);
        await supabase.from("profiles").update({ coins: referrer.coins + 30 }).eq("id", referrer.id);
      }
    }

    // 5. Log đăng ký
    await supabase.from("fraud_logs").insert({
      user_id: data.user.id,
      action: "register",
      result: "success",
      device_id: fingerprint?.deviceId || null,
      fingerprint: fingerprint?.fingerprint || null,
      ip: ip || null,
      metadata: {
        username: form.username,
        has_referral: !!form.referralCode
      }
    });

    if (data.session) {
      navigate("/dashboard");
    } else {
      setConfirmSent(true);
    }
  };

  const handleSocial = async (provider, supported) => {
    setError("");
    if (!supported) {
      setError("Đăng ký bằng TikTok sắp ra mắt, bạn dùng cách khác giúp mình nhé.");
      return;
    }
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (authError) setError(authError.message);
  };

  if (confirmSent) {
    return (
      <AuthShell title="Kiểm tra email của bạn" subtitle="Còn một bước nữa thôi">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-400/10">
            <MailCheck size={26} className="text-sky-400" />
          </span>
          <p className="text-sm text-sky-200/70">
            Mình đã gửi email xác nhận tới <span className="text-white">{form.email}</span>. Mở email và bấm vào
            liên kết để kích hoạt tài khoản nhé.
          </p>
          <Link to="/login" className="mt-2 text-sm font-semibold text-sky-400 hover:underline">
            Quay lại Đăng nhập
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Đăng ký"
      subtitle="Đăng ký với tài khoản mạng xã hội"
      promo={{
        heading: "Bắt đầu kiếm Coin ngay",
        body: "Đã có tài khoản rồi? Đăng nhập để tiếp tục nhận thưởng.",
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
            placeholder="Tên đăng nhập"
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
              placeholder="Tối thiểu 8 ký tự"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-11 text-sm text-white placeholder:text-sky-200/30 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sky-300/50 hover:text-sky-200"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
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

        {/* Ô nhập mã giới thiệu */}
        <div className="relative">
          <Gift size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sky-300/50" />
          <input
            type="text"
            value={form.referralCode}
            onChange={(e) => setForm({ ...form, referralCode: e.target.value.toUpperCase() })}
            placeholder="Mã giới thiệu (nếu có)"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-sky-200/30 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
          />
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <p className="text-center text-xs text-sky-200/40">
          Bằng việc đăng ký, bạn đồng ý với{" "}
          <a href="/terms" className="text-sky-400 hover:underline">Điều khoản</a> và{" "}
          <a href="/privacy" className="text-sky-400 hover:underline">Chính sách bảo mật</a>.
        </p>
      </form>
    </AuthShell>
  );
      }
// Thêm vào sau khi tạo user
const handleSubmit = async (e) => {
  // ... existing code ...

  // 🔥 KIỂM TRA CLUSTER TRƯỚC KHI CHO ĐĂNG KÝ
  if (fingerprint) {
    const existingDevices = await supabase
      .from('devices')
      .select('user_id, users!inner(username)')
      .eq('fingerprint', fingerprint.fingerprint);
    
    if (existingDevices.data && existingDevices.data.length >= 5) {
      setError(`⚠️ Phát hiện ${existingDevices.data.length} tài khoản trên thiết bị này. 
                Vui lòng liên hệ hỗ trợ để được giải quyết.`);
      setLoading(false);
      return;
    }

    // Nếu có từ 3-4 account → cảnh báo
    if (existingDevices.data && existingDevices.data.length >= 3) {
      console.warn(`⚠️ Cảnh báo: ${existingDevices.data.length} accounts trên cùng thiết bị`);
      // Có thể cho đăng ký nhưng đánh dấu suspicious
      await supabase
        .from('users')
        .update({ risk_level: 'warning' })
        .eq('id', data.user.id);
    }
  }

  // ... tiếp tục code đăng ký ...
};
