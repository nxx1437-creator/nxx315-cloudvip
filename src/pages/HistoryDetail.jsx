import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock3, Copy, FileText, Package, RefreshCw, XCircle } from 'lucide-react';
import TopHeader from '../components/TopHeader.jsx';
import BottomNav from '../components/BottomNav.jsx';
import { supabase } from '../lib/supabaseClient.js';

const date = v => v ? new Date(v).toLocaleString('vi-VN', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
}) : '—';

function statusOf(v) {
  const k = String(v || '').toLowerCase();
  if (['completed','success'].includes(k)) return ['Hoàn thành', CheckCircle2, 'bg-emerald-50 border-emerald-100 text-emerald-600'];
  if (['cancelled','canceled','failed'].includes(k)) return [k === 'failed' ? 'Thất bại' : 'Đã hủy', XCircle, 'bg-red-50 border-red-100 text-red-500'];
  return ['Đang xử lý', Clock3, 'bg-amber-50 border-amber-100 text-amber-600'];
}

function Row({ label, value, copyable }) {
  async function copy() {
    if (!value) return;
    try { await navigator.clipboard.writeText(String(value)); } catch {}
  }
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-400 shrink-0">{label}</span>
      <div className="flex items-center gap-2 text-right min-w-0">
        <span className="text-xs font-bold text-slate-800 break-all">{value ?? '—'}</span>
        {copyable && value && <button onClick={copy} className="text-blue-500 shrink-0"><Copy size={14} /></button>}
      </div>
    </div>
  );
}

export default function HistoryDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      const { data, error: e } = await supabase
        .from('redemption_orders')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (e) throw e;
      if (!data) return setError('Không tìm thấy đơn hàng.');
      setOrder(data);
    } catch (e) {
      console.error(e);
      setError('Không thể tải thông tin đơn hàng.');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [id]);

  const [label, Icon, statusClass] = statusOf(order?.status);
  const name = order?.product_name || order?.package_name || order?.name || order?.game_name || 'Giao dịch';
  const coins = order?.coins ?? order?.coin_amount ?? order?.amount_coins ?? order?.price_coins;
  const money = order?.amount_vnd ?? order?.price_vnd ?? order?.amount;

  return (
    <div className="min-h-screen bg-[#f7faff] pb-24">
      <TopHeader />
      <main className="px-4 pt-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white border border-blue-50 flex items-center justify-center text-blue-500 shadow-sm">
              <ArrowLeft size={19} />
            </button>
            <div>
              <p className="text-[10px] font-bold tracking-[0.16em] text-blue-400 uppercase">Chi tiết</p>
              <h1 className="text-xl font-extrabold text-slate-900">Đơn hàng</h1>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              <div className="h-44 rounded-3xl bg-white animate-pulse" />
              <div className="h-72 rounded-3xl bg-white animate-pulse" />
            </div>
          ) : error ? (
            <div className="rounded-3xl bg-white border border-red-100 p-8 text-center">
              <p className="text-sm font-bold text-red-500">{error}</p>
              <button onClick={load} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white text-xs font-bold">
                <RefreshCw size={14} /> Thử lại
              </button>
            </div>
          ) : (
            <>
              <section className="rounded-3xl bg-white border border-blue-50 shadow-sm overflow-hidden">
                <div className="p-6 text-center">
                  <div className={`mx-auto w-16 h-16 rounded-2xl border flex items-center justify-center ${statusClass}`}>
                    <Icon size={31} />
                  </div>
                  <p className="mt-4 text-[10px] font-bold text-blue-400 uppercase tracking-[0.15em]">Trạng thái đơn</p>
                  <h2 className="mt-1 text-xl font-extrabold text-slate-900">{label}</h2>
                  <p className="mt-2 text-sm font-bold text-slate-800">{name}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{date(order?.created_at)}</p>
                </div>
              </section>

              <section className="mt-3 rounded-3xl bg-white border border-blue-50 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={17} className="text-blue-500" />
                  <h3 className="text-sm font-extrabold text-slate-900">Thông tin giao dịch</h3>
                </div>
                <Row label="Mã đơn hàng" value={order?.id} copyable />
                <Row label="Tên" value={name} />
                <Row label="Thời gian" value={date(order?.created_at)} />
                <Row label="Trạng thái" value={label} />
                {coins != null && <Row label="Số xu" value={`${Number(coins).toLocaleString('vi-VN')} xu`} />}
                {money != null && <Row label="Số tiền" value={`${Number(money).toLocaleString('vi-VN')}đ`} />}
                {order?.game_name && <Row label="Game" value={order.game_name} />}
                {order?.uid && <Row label="UID" value={order.uid} copyable />}
                {order?.roblox_id && <Row label="Roblox ID" value={order.roblox_id} copyable />}
                {order?.payment_method && <Row label="Thanh toán" value={order.payment_method} />}
                {order?.note && <Row label="Ghi chú" value={order.note} />}
              </section>

              <section className="mt-3 rounded-3xl bg-blue-50 border border-blue-100 p-5">
                <div className="flex items-start gap-3">
                  <Package size={20} className="text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">Cần hỗ trợ?</p>
                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                      Lưu mã đơn hàng và liên hệ CSKH nếu giao dịch có vấn đề.
                    </p>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
