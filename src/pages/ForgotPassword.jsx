import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // 1: Email, 2: Check email
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Gửi email reset password qua Supabase
  const handleSendEmail = async () => {
    if (!email) {
      setError("Vui lòng nhập email!");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/update-password',
      });

      if (error) throw error;

      setStep(2);
      setMessage("Đã gửi email xác minh! Vui lòng kiểm tra hộp thư.");
    } catch (error) {
      setError(error.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EAF3FC] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-[400px] shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800 transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Khôi phục mật khẩu</h1>
        </div>

        {/* Bước 1: Nhập Email */}
        {step === 1 && (
          <>
            <p className="text-gray-500 text-sm mb-4">
              Nhập email của bạn để nhận link đặt lại mật khẩu.
            </p>

            <div className="relative mb-4">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="Email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 text-gray-800 rounded-lg px-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleSendEmail}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang gửi..." : "Gửi email"}
            </button>

            <div className="text-center mt-4">
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-blue-600 hover:underline"
              >
                Quay lại đăng nhập
              </button>
            </div>
          </>
        )}

        {/* Bước 2: Kiểm tra email */}
        {step === 2 && (
          <>
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Kiểm tra email</h2>
              <p className="text-gray-500 text-sm">
                Chúng tôi đã gửi link đặt lại mật khẩu đến:
              </p>
              <p className="text-gray-700 font-medium text-sm mt-1">{email}</p>
              <p className="text-gray-400 text-xs mt-4">
                Vui lòng kiểm tra tất cả các thư mục, kể cả spam.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/login")}
                className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-lg transition"
              >
                Quay lại
              </button>
              <button
                onClick={handleSendEmail}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
              >
                Gửi lại
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
