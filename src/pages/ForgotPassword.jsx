import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, CheckCircle, AlertCircle } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);

  // Gửi email xác minh
  const handleSendEmail = async () => {
    if (!email) {
      setError("Vui lòng nhập email!");
      return;
    }
    setError("");
    // Gọi API gửi OTP
    setStep(2);
    // Bắt đầu đếm ngược
    let timer = 60;
    setCountdown(timer);
    const interval = setInterval(() => {
      timer--;
      setCountdown(timer);
      if (timer === 0) clearInterval(interval);
    }, 1000);
  };

  // Xác minh OTP
  const handleVerifyOTP = () => {
    if (!otp) {
      setError("Vui lòng nhập mã xác minh!");
      return;
    }
    if (otp.length < 6) {
      setError("Mã xác minh phải có 6 chữ số!");
      return;
    }
    setError("");
    // Gọi API xác minh OTP
    setStep(3);
  };

  // Cập nhật mật khẩu
  const handleUpdatePassword = () => {
    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }
    setError("");
    // Gọi API cập nhật mật khẩu
    alert("Đặt lại mật khẩu thành công! 🎉");
    navigate("/login");
  };

  // Resend OTP
  const handleResendOTP = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) clearInterval(interval);
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="bg-[#1E1E1E] rounded-2xl p-8 w-full max-w-[400px] shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => step === 1 ? navigate(-1) : setStep(step - 1)}
            className="text-gray-400 hover:text-white transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-white text-2xl font-bold">
            {step === 1 && "Khôi phục tài khoản"}
            {step === 2 && "Nhập mã xác minh"}
            {step === 3 && "Đặt lại mật khẩu"}
          </h1>
        </div>

        {/* Bước 1: Nhập Email */}
        {step === 1 && (
          <>
            <p className="text-gray-400 text-sm mb-4">
              Nhập email của bạn để nhận mã xác minh
            </p>

            <div className="relative mb-4">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="email"
                placeholder="Tên người dùng/Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#2A2A2A] text-white rounded-lg px-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm mb-4">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleSendEmail}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
            >
              Tiếp theo
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-700" />
              <span className="text-gray-500 text-sm">Hoặc</span>
              <div className="flex-1 h-px bg-gray-700" />
            </div>

            <button className="w-full border border-gray-700 hover:border-gray-500 text-white font-bold py-3 rounded-lg transition">
              Sử dụng điện thoại
            </button>
          </>
        )}

        {/* Bước 2: Nhập OTP */}
        {step === 2 && (
          <>
            <p className="text-gray-400 text-sm mb-4">
              Nếu đã có sẵn tài khoản cho email này, bạn sẽ nhận được mã xác minh.
              Vui lòng kiểm tra tất cả các thư mục, kể cả mục thứ rác.
            </p>

            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Nhập mã"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full bg-[#2A2A2A] text-white rounded-lg px-4 py-3 text-center text-2xl tracking-[8px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={6}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm mb-4">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleVerifyOTP}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
            >
              Xác nhận
            </button>

            <div className="text-center mt-4">
              <button
                onClick={handleResendOTP}
                disabled={countdown > 0}
                className={`text-sm transition ${countdown > 0 ? 'text-gray-500' : 'text-blue-500 hover:text-blue-400'}`}
              >
                {countdown > 0 ? `Gửi lại mã sau ${countdown} giây` : "Gửi lại mã"}
              </button>
            </div>
          </>
        )}

        {/* Bước 3: Đặt lại mật khẩu */}
        {step === 3 && (
          <>
            <div className="bg-[#2A2A2A] rounded-lg p-3 flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                n
              </div>
              <div>
                <p className="text-white font-bold">nxx315</p>
                <p className="text-gray-400 text-sm">@nxx315</p>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-4">
              Hãy tạo một mật khẩu mạnh, không trùng với mật khẩu cũ.
            </p>

            <div className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="password"
                  placeholder="Mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#2A2A2A] text-white rounded-lg px-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#2A2A2A] text-white rounded-lg px-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm mt-4">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleUpdatePassword}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition mt-6"
            >
              Cập nhật mật khẩu
            </button>
          </>
        )}
      </div>
    </div>
  );
    }
