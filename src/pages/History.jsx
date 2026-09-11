import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Clock3, Coins, History as HistoryIcon, Package, RefreshCw } from 'lucide-react';
import TopHeader from '../components/TopHeader.jsx';
import BottomNav from '../components/BottomNav.jsx';
import { supabase } from '../lib/supabaseClient.js';

const STATUS = {
  pending: ['Đang xử lý', 'bg-amber-50 text-amber-600'],
  processing: ['Đang xử lý', 'bg-amber-50 text-amber-600'],
  completed: ['Hoàn thành', 'bg-emerald-50 text-emerald-600'],
  success: ['Thành công', 'bg-emerald-50 text-emerald-600'],
  cancelled: ['Đã hủy', 'bg-red-50 text-red-500'],
  canceled: ['Đã hủy', 'bg-red-50 text-red-500'],
  failed: ['Thất bại', 'bg-red-50 text-red-500'],
};

const date = v => v ? new Date(v).toLocaleString('vi-VN', {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit'
}) : '—';

function statusOf(v) {
  return STATUS[String(v || '').toLowerCase()] || ['Không rõ', 'bg-gray-100 text-gray-500'];
}

function amount(order) {
  const coins = order?.coins ?? order?.coin_amount ?? order?.amount_coins ?? order?.price_coins;
  if (coins != null) return `${Number(coins).toLocaleString('vi-VN')} xu`;
  const money = order?.amount_vnd ?? order?.price_vnd ?? order?.amount;
  return money != null ? `${Number(money).toLocaleString('vi-VN')}đ` : '—';
}

function orderName(order) {
  return order?.product_name || order?.package_name || order?.name || order?.game_name || 'Giao dịch';
}

export default function History() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function load(silent = false) {
    silent ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      const { data, error: e } = await supabase
        .from('redemption_orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (e) throw e;
      setOrders(data || []);
    } catch (e) {
      console.error(e);
      setError('Không thể tải lịch sử. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-[#f7faff] pb-24">
      <TopHeader />
      <main className="px-4 pt-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white border border-blue-50 flex items-center justify-center text-blue-500 shadow-sm">
                <ArrowLeft size={19} />
              </button>
              <div>
                <p className="text-[10px] font-bold tracking-[0.16em] text-blue-400 uppercase">Giao dịch</p>
                <h1 className="text-2xl font-extrabold text-slate-900">Lịch sử</h1>
              </div>
            </div>
            <button onClick={() => load(true)} disabled={refreshing} className="w-10 h-10 rounded-full bg-white border border-blue-50 flex items-center justify-center text-blue-500 shadow-sm disabled:opacity-50">
              <RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-28 rounded-2xl bg-white border border-blue-50 animate-pulse" />)}
            </div>
          ) : error ? (
            <div className="rounded-3xl bg-white border border-red-100 p-8 text-center">
              <p className="text-sm font-bold text-red-500">{error}</p>
              <button onClick={() => load()} className="mt-4 px-4 py-2 rounded-xl bg-blue-500 text-white text-xs font-bold">Thử lại</button>
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl bg-white border border-blue-50 p-10 text-center shadow-sm">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                <HistoryIcon size={28} className="text-blue-400" />
              </div>
              <h2 className="mt-4 text-base font-extrabold text-slate-900">Chưa có giao dịch</h2>
              <p className="mt-1 text-xs text-slate-400">Các đơn hàng của bạn sẽ xuất hiện ở đây.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => {
                const [label, cls] = statusOf(order.status);
                return (
                  <button
                    key={order.id}
                    onClick={() => navigate(`/history/order/${order.id}`)}
                    className="w-full text-left bg-white border border-blue-50 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-blue-100 active:scale-[0.995] transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Package size={20} className="text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-extrabold text-sm text-slate-900 truncate">{orderName(order)}</p>
                          <ChevronRight size={17} className="text-blue-300 shrink-0" />
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400">
                          <Clock3 size={12} /> {date(order.created_at)}
                        </div>
                        <div className="flex items-center justify-between gap-3 mt-3">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold ${cls}`}>{label}</span>
                          <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                            <Coins size={13} /> {amount(order)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
