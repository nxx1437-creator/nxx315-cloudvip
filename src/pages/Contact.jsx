import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  AlertCircle, 
  Gift, 
  Bug, 
  Lightbulb, 
  Clock, 
  Shield, 
  ExternalLink,
  CheckCircle2,
  Loader2,
  Youtube,
  XCircle
} from "lucide-react";
import { supabase } from '../lib/supabaseClient.js';
import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_i4ww7md';
const TEMPLATE_ID_USER = 'template_eoitihx';
const PUBLIC_KEY = 'RCMv-hwVtokArn48n';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    setSent(false);

    try {
      const { error: dbError } = await supabase
        .from('support_tickets')
        .insert({
          user_name: formData.name,
          user_email: formData.email,
          subject: formData.subject,
          message: formData.message,
          status: 'pending'
        });

      if (dbError) throw dbError;

      const result = await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID_USER,
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
        PUBLIC_KEY
      );

      if (result.status === 200) {
        setSent(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSent(false), 5000);
      } else {
        throw new Error('Gửi email thất bại');
      }

    } catch (err) {
      setError(err.message || 'Lỗi kết nối, vui lòng thử lại sau');
      console.error('Error:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">
            <Mail size={16} /> Liên hệ
          </div>
          <h1 className="font-display mt-4 text-3xl font-bold text-slate-900">Liên hệ NXX315 Studio Rewards</h1>
          <p className="mt-2 text-sm text-slate-500">
            Bạn cần hỗ trợ, muốn báo lỗi hoặc có vấn đề liên quan đến tài khoản?
            <br />
            Hãy liên hệ với NXX315 Studio Rewards thông qua các kênh hỗ trợ chính thức bên dưới.
          </p>
        </div>

        <div className="space-y-6">
          <Section icon={AlertCircle} title=" Hỗ trợ tài khoản" color="blue">
            <p>Bạn có thể liên hệ khi gặp các vấn đề như:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
              <li>Không thể đăng nhập</li>
              <li>Tài khoản gặp lỗi</li>
              <li>Xu/điểm không được cộng đúng</li>
              <li>Nhiệm vụ không được ghi nhận</li>
              <li>Yêu cầu đổi thưởng gặp vấn đề</li>
              <li>Cần hỗ trợ về đơn đổi thưởng</li>
              <li>Phát hiện hoạt động bất thường trên tài khoản</li>
            </ul>
          </Section>

          <Section icon={Gift} title=" Hỗ trợ đổi thưởng" color="emerald">
            <p>Khi liên hệ về một đơn đổi thưởng, vui lòng cung cấp:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
              <li>Tên tài khoản</li>
              <li>Mã đơn hàng</li>
              <li>Phần thưởng đã yêu cầu</li>
              <li>Mô tả vấn đề</li>
              <li>Ảnh chụp màn hình nếu cần thiết</li>
            </ul>
            <div className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
              ⚠️ <strong>Không gửi mật khẩu</strong> hoặc mã xác thực tài khoản cho bất kỳ ai.
            </div>
          </Section>

          <Section icon={Bug} title=" Báo lỗi" color="rose">
            <p>Nếu bạn phát hiện lỗi trên NXX315 Studio Rewards, hãy cung cấp:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
              <li>Mô tả lỗi</li>
              <li>Các bước khiến lỗi xảy ra</li>
              <li>Thiết bị/trình duyệt đang sử dụng</li>
              <li>Ảnh hoặc video minh họa nếu có</li>
            </ul>
            <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
              ⚠️ <strong>Không cố tình khai thác lỗi</strong> để nhận xu/điểm hoặc phần thưởng.
            </div>
          </Section>

          <Section icon={Lightbulb} title=" Góp ý" color="purple">
            <p>Bạn cũng có thể liên hệ để gửi:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
              <li>Góp ý cải thiện website</li>
              <li>Đề xuất nhiệm vụ</li>
              <li>Đề xuất phần thưởng</li>
              <li>Báo cáo trải nghiệm không tốt</li>
              <li>Ý tưởng cho các tính năng mới</li>
            </ul>
          </Section>

          <div className="rounded-2xl border-2 border-sky-200 bg-gradient-to-b from-sky-50 to-white p-6 shadow-lg">
            <h2 className="font-display text-2xl font-bold text-slate-900"> Kênh liên hệ chính thức</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Email hỗ trợ</p>
                  <a href="mailto:nxx315hub@gmail.com" className="text-sm text-sky-600 hover:underline">
                    nxx315hub@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <Youtube size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Kênh cộng đồng</p>
                  <a href="https://youtube.com/@nxx3155/community" target="_blank" rel="noopener noreferrer" className="text-sm text-sky-600 hover:underline flex items-center gap-1">
                    YouTube Community <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
              ⚠️ <strong>Chỉ sử dụng các kênh được công bố</strong> trên website NXX315 Studio Rewards.
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Clock size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900"> Thời gian phản hồi</h2>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Thời gian phản hồi có thể thay đổi tùy số lượng yêu cầu và mức độ phức tạp của vấn đề.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <Shield size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900"> Quyền riêng tư</h2>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Vui lòng xem <Link to="/privacy" className="text-sky-600 hover:underline">Chính sách quyền riêng tư</Link> để biết thêm chi tiết.
            </p>
          </div>

          <div className="rounded-2xl border-2 border-sky-200 bg-gradient-to-b from-sky-50 to-white p-6 shadow-lg">
            <h2 className="font-display text-2xl font-bold text-slate-900">📝 Gửi yêu cầu</h2>
            <p className="mt-1 text-sm text-slate-500">Điền thông tin bên dưới, chúng tôi sẽ phản hồi sớm nhất có thể.</p>

            {error && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
                <XCircle size={18} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Tên của bạn *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
                  placeholder="Nhập tên của bạn"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Chủ đề *</label>
                <select
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
                >
                  <option value="">Chọn chủ đề...</option>
                  <option value="Hỗ trợ tài khoản"> Hỗ trợ tài khoản</option>
                  <option value="Hỗ trợ đổi thưởng"> Hỗ trợ đổi thưởng</option>
                  <option value="Báo lỗi"> Báo lỗi</option>
                  <option value="Góp ý"> Góp ý</option>
                  <option value="Khác"> Khác</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Nội dung *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
                  placeholder="Mô tả chi tiết vấn đề của bạn..."
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-sky-500/25 transition hover:brightness-110 disabled:opacity-50"
              >
                {sending ? <Loader2 size={20} className="animate-spin mx-auto" /> : "📤 Gửi yêu cầu"}
              </button>

              {sent && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
                  <CheckCircle2 size={18} /> Yêu cầu của bạn đã được gửi! Chúng tôi sẽ phản hồi sớm.
                </div>
              )}
            </form>
          </div>

          <div className="mt-8 text-center">
            <Link to="/" className="inline-block rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:scale-105">
              Quay về trang chủ
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function Section({ icon: Icon, title, children, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
    purple: "bg-purple-50 text-purple-600"
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors[color] || colors.blue}`}>
          <Icon size={20} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      </div>
      <div className="mt-3 space-y-2 text-sm text-slate-600 leading-relaxed">
        {children}
      </div>
    </div>
  );
        }
