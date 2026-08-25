import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';

export default function TermsAcceptance({ user, onAccept, loading }) {
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccept = async () => {
    if (!accepted) return;
    setIsSubmitting(true);
    await onAccept(user.id);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white flex items-center justify-center p-4 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">
            <ShieldCheck size={16} /> Xác nhận điều khoản
          </div>
          <h1 className="font-display mt-4 text-3xl font-bold text-slate-900">Trước khi tiếp tục</h1>
          <p className="mt-2 text-sm text-slate-500">
            Để sử dụng NXX315 Studio Rewards, bạn cần xác nhận rằng mình đáp ứng điều kiện độ tuổi
            và đồng ý với các quy định của nền tảng.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          {/* Thông báo */}
          <div className="mb-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
            <p className="font-semibold">📌 Bạn chưa thể sử dụng NXX315 Studio Rewards</p>
            <p className="mt-1">Vui lòng xác nhận điều khoản bên dưới để tiếp tục.</p>
          </div>

          {/* Checkbox */}
          <label className="flex cursor-pointer items-start gap-3 rounded-xl p-3 transition hover:bg-slate-50">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <span className="text-sm text-slate-700">
              Tôi xác nhận mình <strong>từ 15 tuổi trở lên</strong> và đồng ý với{' '}
              <Link to="/terms" target="_blank" className="text-sky-600 hover:underline">
                Điều khoản sử dụng
              </Link>
              {' '}và{' '}
              <Link to="/privacy" target="_blank" className="text-sky-600 hover:underline">
                Chính sách quyền riêng tư
              </Link>
              .
            </span>
          </label>

          {/* Nút xác nhận */}
          <button
            onClick={handleAccept}
            disabled={!accepted || isSubmitting || loading}
            className="mt-6 w-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-sky-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={20} className="animate-spin mx-auto" />
            ) : (
              '✅ Xác nhận và tiếp tục'
            )}
          </button>

          <p className="mt-3 text-center text-xs text-slate-400">
            Bạn chưa thể sử dụng NXX315 Studio Rewards nếu không đáp ứng điều kiện độ tuổi
            hoặc không đồng ý với các điều khoản.
          </p>
        </div>

        {/* Link tới điều khoản */}
        <div className="mt-4 flex justify-center gap-4 text-xs text-slate-400">
          <Link to="/terms" className="hover:text-sky-600">📜 Điều khoản</Link>
          <Link to="/privacy" className="hover:text-sky-600">🔐 Quyền riêng tư</Link>
          <Link to="/fraud" className="hover:text-sky-600">🛡️ Chống gian lận</Link>
        </div>
      </div>
    </div>
  );
          }
