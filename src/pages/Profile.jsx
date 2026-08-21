import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Calendar, Medal, ShieldCheck, Coins, LogOut, QrCode, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile } = useProfile();
  
  const [showLogout, setShowLogout] = useState(false);
  const [showMFA, setShowMFA] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Trạng thái MFA (Đã bật / Chưa bật)
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);

  const displayName = profile.username || "Thành viên";
  const initial = displayName.charAt(0).toUpperCase();

  // 1. Kiểm tra trạng thái MFA
  const checkMFAStatus = async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) return;
    const verifiedFactor = data.totp?.find(f => f.status === 'verified');
    setIsMFAEnabled(!!verifiedFactor); // Nếu có factor verified => true
  };

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // 2. Bắt đầu đăng ký Authenticator
  const handleStartMFA = async () => {
    setError("");
    setSuccess("");
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (error) { setError("Lỗi khởi tạo: " + error.message); return; }
    
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setFactorId(data.id);
    setShowMFA(true);
  };

  // 3. Xác minh mã OTP
  const handleVerifyMFA = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) { setError("Lỗi xác minh: " + challengeError.message); return; }
    
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code: verifyCode,
    });
    if (error) { setError("Mã không đúng hoặc đã hết hạn."); return; }
    
    setSuccess("Xác minh 2 bước đã được bật thành công!");
    setVerifyCode("");
    setShowMFA(false);
    checkMFAStatus(); // Cập nhật lại nút hiển thị
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 px-4 py-4 backdrop-blur-md">
        <h1 className="font-display text-xl font-bold text-slate-900">Tài khoản</h1>
      </header>

      <main className="mx-auto max-w-md space-y-5 px-4 py-5">
        
        {/* THÔNG TIN TÀI KHOẢN */}
        <div className="rounded-3xl border border-white bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Thông tin tài khoản</h2>
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-500"><User size={18} /></span>
            <div>
              <p className="text-xs uppercase text-slate-400">Họ tên</p>
              <p className="text-sm font-semibold text-slate-800">{displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-b border-slate-100 py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-500"><Mail size={18} /></span>
            <div>
              <p className="text-xs uppercase text-slate-400">Email</p>
              <p className="text-sm font-semibold text-slate-800">{session?.user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-b border-slate-100 py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-500"><Phone size={18} /></span>
            <div>
              <p className="text-xs uppercase text-slate-400">SĐT</p>
              <p className="text-sm font-semibold text-slate-800">-</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-b border-slate-100 py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-500"><Calendar size={18} /></span>
            <div>
              <p className="text-xs uppercase text-slate-400">Ngày tham gia</p>
              <p className="text-sm font-semibold text-slate-800">{session?.user?.created_at ? new Date(session.user.created_at).toLocaleDateString('vi-VN') : '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-500"><Medal size={18} /></span>
            <div>
              <p className="text-xs uppercase text-slate-400">Kinh nghiệm</p>
              <p className="text-sm font-semibold text-slate-800">{profile.exp || 0} Exp</p>
            </div>
          </div>
        </div>

        {/* SỐ DƯ & ĐĂNG XUẤT */}
        <div className="rounded-3xl border border-white bg-white p-4 shadow-sm">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide text-slate-400">Số dư</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{profile.coins || 0} <span className="text-sm text-amber-500">Coin</span></p>
          </div>
          <button
            onClick={() => setShowLogout(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
          >
            <LogOut size={16} /> Đăng Xuất
          </button>
        </div>

        {/* CÀI ĐẶT BẢO MẬT */}
        <div className="rounded-3xl border border-white bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-bold text-slate-900">Cài đặt bảo mật</h3>
          
          <button
            onClick={handleStartMFA}
            className="flex w-full items-center justify-between rounded-2xl bg-slate-50 p-4 text-left transition hover:bg-slate-100"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                <ShieldAlert size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800">Xác minh 2 bước (Google Authenticator)</p>
                <p className="text-xs text-slate-400">Tăng cường bảo mật tài khoản</p>
              </div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isMFAEnabled ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-600"
            }`}>
              {isMFAEnabled ? "Đã bật" : "Chưa bật"}
            </span>
          </button>
        </div>
      </main>

      {/* Modal đăng ký Authenticator */}
      {showMFA && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl">
            <h3 className="font-display text-lg font-bold text-slate-900">Bật Xác minh 2 bước</h3>
            <p className="mt-2 text-sm text-slate-500">Mở ứng dụng Google Authenticator và quét mã QR bên dưới:</p>
            
            {qrCode && (
              <img
                src={`data:image/svg+xml;base64,${btoa(qrCode)}`}
                alt="QR Code"
                className="mx-auto mt-4 h-48 w-48 rounded-xl border border-slate-200"
              />
            )}
            
            <p className="mt-2 text-xs text-slate-400">Hoặc nhập mã: <span className="font-mono font-bold text-slate-600">{secret || "..."}</span></p>

            <form onSubmit={handleVerifyMFA} className="mt-4">
              <input
                type="text"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="Nhập mã 6 số từ app"
                maxLength={6}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-center text-lg tracking-widest outline-none focus:border-blue-400"
              />
              {error && <p className="mt-2 text-xs font-medium text-rose-500">{error}</p>}
              {success && <p className="mt-2 text-xs font-medium text-emerald-600">{success}</p>}
              
              <div className="mt-5 flex gap-3">
                <button type="button" onClick={() => setShowMFA(false)} className="flex-1 rounded-full bg-slate-100 py-2.5 text-sm font-semibold text-slate-600">Huỷ</button>
                <button type="submit" className="flex-1 rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Xác nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Logout */}
      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl">
            <h3 className="font-display text-lg font-bold text-slate-900">Xác nhận đăng xuất?</h3>
            <p className="mt-1 text-sm text-slate-500">Bạn sẽ cần đăng nhập lại để sử dụng dịch vụ.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowLogout(false)} className="flex-1 rounded-full bg-slate-100 py-2.5 text-sm font-semibold text-slate-600">Huỷ</button>
              <button onClick={handleLogout} className="flex-1 rounded-full bg-rose-500 py-2.5 text-sm font-semibold text-white">Đăng xuất</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
      }
