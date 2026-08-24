import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, X, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function AdminNotice() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_notices')
        .select('*')
        .eq('active', true)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotices(data || []);
    } catch (error) {
      console.error('Error fetching notices:', error);
      // Fallback: dùng data cứng nếu chưa có bảng
      setNotices([
        {
          id: 1,
          title: 'THÔNG BÁO TỪ ADMIN',
          content: `• Tự tạo nhiều tài khoản để kiếm tiền từ hoa hồng, rút tiền
• Tự view cho chính bản thân
• Sử dụng tool, bot, anti detect browser, boxphone, giả lập
• Không có nguồn view
• Nguồn view của bạn gian lận (không kiểm soát được nguồn traffic)
• Mọi hình thức gian lận đều không được thanh toán và nhiều loại bypass khác`,
          type: 'warning',
          priority: 1,
          link: 'https://t.me/traffic_68',
          link_text: 'Nhóm Tele hỗ trợ'
        },
        {
          id: 2,
          title: 'RATE CỦA CÁC HỆ THỐNG NHIỆM VỤ',
          content: 'Sẽ bị giảm xuống còn 500đ !!',
          type: 'danger',
          priority: 2
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading || dismissed || notices.length === 0) return null;

  const getTypeStyles = (type) => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          icon: 'text-rose-500',
          title: 'text-rose-700',
          text: 'text-rose-600'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: 'text-amber-500',
          title: 'text-amber-700',
          text: 'text-amber-600'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-500',
          title: 'text-blue-700',
          text: 'text-blue-600'
        };
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-4">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-rose-500" />
          <span className="text-sm font-bold text-slate-800">📢 Thông báo từ Admin</span>
          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-rose-100 text-rose-700">
            {notices.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDismissed(true);
            }}
            className="p-1 rounded-full hover:bg-slate-100 transition"
          >
            <X size={16} className="text-slate-400" />
          </button>
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {notices.map((notice) => {
            const styles = getTypeStyles(notice.type);
            return (
              <div 
                key={notice.id}
                className={`rounded-xl p-4 border ${styles.bg} ${styles.border}`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className={`${styles.icon} mt-0.5 shrink-0`} />
                  <div className="flex-1">
                    <h4 className={`text-sm font-bold ${styles.title}`}>
                      {notice.title}
                    </h4>
                    <div className={`mt-1 text-sm whitespace-pre-line ${styles.text}`}>
                      {notice.content}
                    </div>
                    {notice.link && (
                      <a 
                        href={notice.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sky-600 hover:text-sky-700 transition"
                      >
                        {notice.link_text || 'Liên hệ hỗ trợ'}
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
    }
