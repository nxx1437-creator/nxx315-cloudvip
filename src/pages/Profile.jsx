import React, { useState, useEffect } from "react";
import { 
  User, Mail, Phone, Calendar, Award, ShieldCheck, Coins, LogOut, 
  Camera, ShieldAlert, Smartphone, Plus, ChevronRight, QrCode
} from "lucide-react";
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
  
  // State lưu dữ liệu QR
  const [qrImage, setQrImage] = useState("");
  const [secret, setSecret] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);
  const [factorCount, setFactorCount] = useState(0);
  const [activeSection, setActiveSection] = useState("info");

  const displayName = profile.username || "Thành viên";
  const initial = displayName.charAt(0).toUpperCase();

  const checkMFAStatus = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    const verifiedFactors = data.totp?.filter(f => f.status === 'verified');
    setIsMFAEnabled(!!verifiedFactors?.length);
    setFactorCount(verifiedFactors?.length || 0);
  };

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Hàm tạo mới QR (Đã sửa lỗi useState)
  const handleStartMFA = async () => {
    setError("");
    setSuccess("");
    
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (error) { 
      setError("Lỗi khởi tạo: " + error.message); 
      return; 
    }
    
    // Lưu dữ liệu vào state (Đây là cách đúng)
    const qrCode = data?.totp?.qr_code;
    if (qrCode) {
      setQrImage(`data:image/svg+xml;base64,${qrCode}`);
    } else {
      setQrImage("");
    }
    
    setSecret(data?.totp?.secret || "");
    setFactorId(data?.id || "");
    setShowMFA(true);
  };

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
    
    setSuccess("Thiết bị đã được thêm thành công!");
    setVerifyCode("");
    setShowMFA(false);
    checkMFAStatus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 px-4 py-4 backdrop-blur-md">
        <h1 className="font-display text-xl font-bold text-slate-900">Tài khoản</h1>
      </header>

      <main className="mx-auto max-w-md space-y-5 px-4 py-5">
        {/* Khung Avatar + VIP */}
        <div className="rounded-3xl border border-white bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-sky-100 bg-gradient-to-br from-sky-400 to-blue-600 text-4xl font-bold text-white shadow-md">
                {initial}
              </div>
              <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-white shadow">
                <Camera size={14} />
              </button>
            </div>
            <h2 className="mt-3 text-xl font-bold text-slate-900">{displayName}</h2>
            <p className="text-xs text-slate-400">{session?.user?.email}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">Lv.{profile.level || 1}</span>
              <span className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">
                <ShieldCheck size={12} /> Active
              </span>
            </div>
          </div>
        </div>

        {/* Số dư & Đăng xuất */}
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

        {/* Menu chuyển tab */}
        <div className="space-y-2">
          <button 
            onClick={() => setActiveSection("info")}
            className={`flex w-full items-center justify-between rounded-2xl border p-4 transition ${activeSection === "info" ? "border-sky-100 bg-white shadow-sm" : "border-transparent"}`}
          >
            <span className={`text-sm font-semibold ${activeSection === "info" ? "text-slate-800" : "text-slate-500"}`}>Thông tin</span>
            <ChevronRight size={16} className="text-slate-300" />
          </button>
          <button 
            onClick={() => setActiveSection("security")}
            className={`flex w-full items-center justify-between rounded-2xl border p-4 transition ${activeSection === "security" ? "border-sky-100 bg-white shadow-sm" : "border-transparent"}`}
          >
            <span className={`text-sm font-semibold ${activeSection === "security" ? "text-slate-800" : "text-slate-500"}`}>Bảo mật</span>
            <ChevronRight size={16} className="text-slate-300" />
          </button>
        </div>

        {/* Nội dung tab Thông tin */}
        {activeSection === "info" && (
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
            <div className="flex items-center gap-3 pt-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-500"><Award size={18} /></span>
              <div>
                <p className="text-xs uppercase text-slate-400">Kinh nghiệm</p>
                <p className="text-sm font-semibold text-slate-800">{profile.exp || 0} Exp</p>
              </div>
            </div>
          </div>
        )}

        {/* Nội dung tab Bảo mật */}
        {activeSection === "security" && (
          <div className="rounded-3xl border border-white bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-lg font-bold text-slate-900">Cài đặt bảo mật</h3>
            <button
              onClick={handleStartMFA}
              className="flex w-full items-center justify-between rounded-2xl bg-slate-50 p-4 text-left transition hover:bg-slate-100"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-500"><ShieldAlert size={18} /></span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Xác minh 2 bước (Google Authenticator)</p>
                  <p className="text-xs text-slate-400">Tăng cường bảo mật tài khoản</p>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isMFAEnabled ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-600"}`}>
                {isMFAEnabled ? "Đã bật" : "Chưa bật"}
              </span>
            </button>

            {isMFAEnabled && (
              <button
                onClick={handleStartMFA}
                className="mt-3 flex w-full items-center justify-between rounded-2xl bg-sky-50 p-4 text-left transition hover:bg-sky-100"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-500"><Smartphone size={18} /></span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Thêm thiết bị dự phòng</p>
                    <p className="text-xs text-slate-400">Dùng khi mất điện thoại (Đã có: {factorCount}/10)</p>
                  </div>
                </div>
                <Plus size={18} className="text-sky-500" />
              </button>
            )}
          </div>
        )}
      </main>

      {/* Modal hiển thị QR (Đã sửa bằng useState) */}
      {showMFA && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl">
            <h3 className="font-display text-lg font-bold text-slate-900">Thêm thiết bị</h3>
            <p className="mt-2 text-sm text-slate-500">Mở Google Authenticator (hoặc Authy) và quét mã QR bên dưới:</p>
            
            {qrImage && (
              <img 
                src={qrImage} 
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
