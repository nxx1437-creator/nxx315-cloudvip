import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, Clock, X, ChevronDown, ChevronUp, ExternalLink, CheckCircle, Info, AlertTriangle, Check } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function AdminNotice() {
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchActiveNotice();
  }, []);

  const fetchActiveNotice = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_notices')
        .select('*')
        .eq('active', true)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setNotice(data[0]);
      }
    } catch (error) {
      console.error('Error fetching notice:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || dismissed || !notice) return null;

  const getIcon = () => {
    switch (notice.icon) {
      case 'bell': return Bell;
      case 'alert': return AlertCircle;
      case 'info': return Info;
      case 'warning': return AlertTriangle;
      case 'success': return Check;
      default: return Bell;
    }
  };

  const getTypeStyles = () => {
    switch (notice.type) {
      case 'danger': return {
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        text: 'text-rose-700',
        textLight: 'text-rose-600',
        iconBg: 'bg-rose-100',
        iconColor: 'text-rose-600',
        button: 'bg-rose-600 hover:bg-rose-700'
      };
      case 'warning': return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-800',
        textLight: 'text-amber-700',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        button: 'bg-amber-600 hover:bg-amber-700'
      };
      case 'success': return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-800',
        textLight: 'text-emerald-700',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        button: 'bg-emerald-600 hover:bg-emerald-700'
      };
      default: return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        textLight: 'text-blue-700',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700'
      };
    }
  };

  const styles = getTypeStyles();
  const Icon = getIcon();

  return (
    <div className={`rounded-2xl border ${styles.border} ${styles.bg} p-4 shadow-sm mb-4`}>
      {/* Header */}
      <div 
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          <div className={`h-8 w-8 rounded-full ${styles.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
            <Icon size={16} className={styles.iconColor} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{notice.title}</p>
            <div className="flex items-center gap-2 text-xs mt-0.5">
              {notice.status_1 && (
                <>
                  <span className="text-emerald-600 font-medium">✓ {notice.status_1}</span>
                  <span className="text-slate-300">•</span>
                </>
              )}
              {notice.status_2 && (
                <>
                  <span className={`${notice.status_2 === 'Ký hợp đồng' ? 'text-amber-600 font-medium' : 'text-slate-400'}`}>
                    {notice.status_2}
                  </span>
                  <span className="text-slate-300">•</span>
                </>
              )}
              {notice.status_3 && (
                <span className="text-slate-400">{notice.status_3}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDismissed(true);
            }}
            className="p-1 rounded-full hover:bg-white/50 transition"
          >
            <X size={14} className="text-slate-400" />
          </button>
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-200/50">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={16} className={`${styles.iconColor} mt-0.5 shrink-0`} />
            <div className="flex-1">
              <p className={`text-sm font-semibold ${styles.text}`}>
                {notice.content}
              </p>
              {notice.progress_label && (
                <p className={`text-xs mt-1 ${styles.textLight}`}>
                  ⏱ {notice.progress_label}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {notice.action_label && (
                  <a 
                    href={notice.action_link || '#'}
                    className={`px-4 py-1.5 ${styles.button} text-white text-xs font-semibold rounded-full transition flex items-center gap-1`}
                  >
                    {notice.action_label}
                    {notice.link_icon === 'external' && <ExternalLink size={12} />}
                  </a>
                )}
                {notice.link && (
                  <a 
                    href={notice.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-full hover:bg-slate-50 transition flex items-center gap-1"
                  >
                    {notice.link_text || 'Tìm hiểu thêm'}
                    {notice.link_icon === 'external' && <ExternalLink size={12} />}
                  </a>
                )}
                {!notice.action_label && !notice.link && (
                  <span className="text-xs text-slate-400 italic">Không có hành động nào</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
      }
