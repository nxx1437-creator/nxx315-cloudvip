import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  XCircle, 
  WifiOff, 
  Database, 
  Clock, 
  Shield,
  RefreshCw,
  Mail,
  Home
} from 'lucide-react';

export default function Status() {
  const services = [
    { 
      name: 'Website', 
      status: 'error', 
      icon: WifiOff,
      message: 'Đang gặp sự cố'
    },
    { 
      name: 'Đăng nhập', 
      status: 'error', 
      icon: XCircle,
      message: 'Tạm thời không khả dụng'
    },
    { 
      name: 'Nhiệm vụ', 
      status: 'error', 
      icon: AlertTriangle,
      message: 'Tạm thời không khả dụng'
    },
    { 
      name: 'Đổi thưởng', 
      status: 'maintenance', 
      icon: Clock,
      message: 'Đang bảo trì'
    },
    { 
      name: 'Tài khoản', 
      status: 'error', 
      icon: Shield,
      message: 'Tạm thời không khả dụng'
    },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'error': return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'maintenance': return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'operational': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      default: return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'error': return <XCircle size={20} className="text-rose-500" />;
      case 'maintenance': return <Clock size={20} className="text-amber-500" />;
      case 'operational': return <span className="text-emerald-500">✅</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700">
            <AlertTriangle size={16} /> Trạng thái hệ thống
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mt-4">Trạng thái dịch vụ</h1>
          <p className="mt-2 text-sm text-slate-500">
            Cập nhật trạng thái hoạt động của các dịch vụ NXX315 Studio
          </p>
        </div>

        {/* Alert banner */}
        <div className="mb-6 rounded-2xl border-2 border-rose-200 bg-rose-50 p-5 shadow-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-rose-800">⚠️ NXX315 Studio đang bảo trì khẩn cấp</h2>
              <p className="mt-1 text-sm text-rose-700">
                Hệ thống hiện đang gặp sự cố khiến một số hoặc toàn bộ chức năng không hoạt động bình thường. 
                Đội ngũ đang kiểm tra và khắc phục. 
                <strong className="block mt-2">Vui lòng không thực hiện yêu cầu đổi thưởng trong thời gian này.</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Service status list */}
        <div className="space-y-3">
          {services.map((service, index) => (
            <div 
              key={index}
              className={`rounded-2xl border p-4 flex items-center justify-between ${getStatusColor(service.status)}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/50">
                  <service.icon size={20} className={
                    service.status === 'error' ? 'text-rose-500' : 
                    service.status === 'maintenance' ? 'text-amber-500' : 
                    'text-emerald-500'
                  } />
                </div>
                <div>
                  <p className="font-semibold">{service.name}</p>
                  <p className="text-sm opacity-80">{service.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(service.status)}
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  service.status === 'error' ? 'bg-rose-200/50 text-rose-700' :
                  service.status === 'maintenance' ? 'bg-amber-200/50 text-amber-700' :
                  'bg-emerald-200/50 text-emerald-700'
                }`}>
                  {service.status === 'error' ? '🔴 Lỗi' :
                   service.status === 'maintenance' ? '🟡 Bảo trì' :
                   '🟢 Hoạt động'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Last updated */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <p>Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}</p>
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-50"
          >
            <RefreshCw size={16} /> Kiểm tra lại
          </button>
          <Link 
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/25"
          >
            <Home size={16} /> Về trang chủ
          </Link>
          <Link 
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-50"
          >
            <Mail size={16} /> Liên hệ hỗ trợ
          </Link>
        </div>
      </div>
    </div>
  );
      }
