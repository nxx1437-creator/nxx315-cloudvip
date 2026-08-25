import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';

export default function TermsAcceptance({ user, onAccept, loading }) {
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log('TermsAcceptance render:', { user, loading }); // 👈 Thêm dòng này

  const handleAccept = async () => {
    if (!accepted) return;
    setIsSubmitting(true);
    await onAccept(user.id);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Trước khi tiếp tục</h1>
          <p className="mt-2 text-sm text-slate-500">
            Để sử dụng NXX315 Studio Rewards, bạn cần xác nhận...
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 h-5 w-5"
            />
            <span className="text-sm text-slate-700">
              Tôi xác nhận mình từ 15 tuổi trở lên và đồng ý với{' '}
              <Link to="/terms" className="text-sky-600 hover:underline">Điều khoản sử dụng</Link>
            </span>
          </label>

          <button
            onClick={handleAccept}
            disabled={!accepted || isSubmitting}
            className="mt-6 w-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-3 text-white disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'Xác nhận và tiếp tục'}
          </button>
        </div>
      </div>
    </div>
  );
}
