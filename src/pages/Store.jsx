import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Coins,
  Gamepad2,
  Gift,
  Home,
  Loader2,
  Menu,
  Swords,
  User,
  Wallet,
  CreditCard,
  QrCode,
  Check,
  X,
  Clock3,
  Copy,
  Mail,
  Sparkles,
  Star,
} from 'lucide-react';
import useSession from '../hooks/useSession.js';
import useProfile from '../hooks/useProfile.js';
import { supabase } from '../lib/supabaseClient.js';

const formatCoins = (value) => Number(value || 0).toLocaleString('vi-VN');
const formatVND = (value) => Number(value || 0).toLocaleString('vi-VN') + ' VND';

const ROBLOX_PACKAGES = {
  vng: [
    { id: 'vng_40', name: 'Gói 40 Robux', robux: 40, price: 14000, coins: 14000 },
    { id: 'vng_80', name: 'Gói 80 Robux', robux: 80, price: 28000, coins: 28000 },
    { id: 'vng_500', name: 'Gói 500 Robux', robux: 500, price: 140000, coins: 140000 },
    { id: 'vng_1000', name: 'Gói 1000 Robux', robux: 1000, price: 280000, coins: 280000 },
  ],
  code: [
    { id: 'code_55', name: 'Gói 55 Robux', robux: 55, price: 20000, coins: 20000 },
    { id: 'code_145', name: 'Gói 145 Robux', robux: 145, price: 50000, coins: 50000 },
    { id: 'code_300', name: 'Gói 300 Robux', robux: 300, price: 100000, coins: 100000 },
    { id: 'code_600', name: 'Gói 600 Robux', robux: 600, price: 180000, coins: 180000 },
  ],
};

export default function Store() {
  const { session } = useSession();
  const { profile, setProfile } = useProfile();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [game, setGame] = useState('robux');
  const [version, setVersion] = useState('vng');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [robloxUser, setRobloxUser] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('coins');
  const [toast, setToast] = useState(null);
  const [showPackages, setShowPackages] = useState(false);

  const userId = session?.user?.id;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load lịch sử
  useEffect(() => {
    const loadHistory = async () => {
      if (!userId) return;
      const { data } = await supabase
        .from('redemption_orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (data) setHistory(data);
      setLoading(false);
    };
    loadHistory();
  }, [userId]);

  const currentPackages = game === 'robux' 
    ? (version === 'vng' ? ROBLOX_PACKAGES.vng : ROBLOX_PACKAGES.code)
    : [];
  const handleRedeem = async () => {
  if (!selectedPackage) {
    showToast('Vui lòng chọn gói', 'error');
    return;
  }

  const cost = selectedPackage.coins;
  const balance = Number(profile?.coins || 0);

  if (paymentMethod === 'coins' && balance < cost) {
    showToast(`Cần thêm ${formatCoins(cost - balance)} xu`, 'error');
    return;
  }

  if (game === 'robux' && !robloxUser.trim()) {
    showToast('Vui lòng nhập tên Roblox', 'error');
    return;
  }

  setRedeeming(true);

  try {
    const order = {
      user_id: userId,
      game: game,
      package_name: selectedPackage.name,
      robux: selectedPackage.robux,
      price: selectedPackage.price,
      coins_cost: selectedPackage.coins,
      roblox_user: robloxUser,
      delivery: deliveryInfo,
      payment: paymentMethod,
      status: 'pending',
    };

    const { error } = await supabase.from('redemption_orders').insert([order]);
    if (error) throw error;

    if (paymentMethod === 'coins') {
      const newBalance = balance - cost;
      await supabase.from('profiles').update({ coins: newBalance }).eq('id', userId);
      setProfile((old) => ({ ...old, coins: newBalance }));
    }

    const { data } = await supabase
      .from('redemption_orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setHistory(data);

    showToast(`✅ Đổi thành công! ${selectedPackage.name}`);
    setSelectedPackage(null);
    setShowPackages(false);
    setDeliveryInfo('');

  } catch (error) {
    console.error(error);
    showToast('❌ Đổi thưởng thất bại', 'error');
  } finally {
    setRedeeming(false);
  }
};

return (
  <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 pb-28">
    {/* Toast */}
    {toast && (
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl shadow-xl ${
        toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'
      } border`}>
        {toast.msg}
      </div>
    )}

    {/* Header */}
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-purple-100">
      <div className="flex items-center h-16 px-4 max-w-7xl mx-auto">
        <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-purple-50">
          <ArrowLeft size={22} className="text-purple-600" />
        </button>
        <div className="flex-1 text-center font-bold text-lg">
          <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Cổng</span>
          <span className="text-gray-700"> Săn Thưởng</span>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
          <Coins size={18} className="text-amber-500" />
          <span className="font-bold text-amber-600">{formatCoins(profile?.coins)}</span>
        </div>
      </div>
    </header>

    <main className="max-w-7xl mx-auto px-4 py-4">
      {/* Chọn game */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { id: 'robux', name: 'Roblox', icon: Gamepad2, color: 'from-red-500 to-orange-500' },
          { id: 'quanhuy', name: 'Quân Huy', icon: Swords, color: 'from-blue-500 to-cyan-500' },
          { id: 'zingcard', name: 'ZingCard', icon: CreditCard, color: 'from-purple-500 to-pink-500' },
        ].map((g) => {
          const Icon = g.icon;
          const active = game === g.id;
          return (
            <button
              key={g.id}
              onClick={() => { setGame(g.id); setSelectedPackage(null); }}
              className={`p-4 rounded-2xl text-center transition-all ${
                active 
                  ? `bg-gradient-to-br ${g.color} text-white shadow-lg scale-105` 
                  : 'bg-white shadow-sm hover:shadow-md'
              }`}
            >
              <Icon size={28} className={active ? 'text-white' : 'text-gray-500'} />
              <p className="text-xs font-bold mt-1">{g.name}</p>
            </button>
          );
        })}
      </div>
              {/* Nội dung game */}
        {game === 'robux' && (
          <div className="space-y-4">
            {/* Chọn phiên bản */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="font-bold text-sm mb-3">Hình thức nhận Robux</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setVersion('vng'); setSelectedPackage(null); }}
                  className={`p-3 rounded-xl border text-center transition ${
                    version === 'vng' ? 'border-purple-400 bg-purple-50' : 'border-gray-200'
                  }`}
                >
                  <Gamepad2 size={20} className="mx-auto text-orange-500" />
                  <p className="text-xs font-bold mt-1">Nạp thẳng</p>
                </button>
                <button
                  onClick={() => { setVersion('code'); setSelectedPackage(null); }}
                  className={`p-3 rounded-xl border text-center transition ${
                    version === 'code' ? 'border-purple-400 bg-purple-50' : 'border-gray-200'
                  }`}
                >
                  <Mail size={20} className="mx-auto text-blue-500" />
                  <p className="text-xs font-bold mt-1">Nhận Code</p>
                </button>
              </div>
            </div>

            {/* Nhập tên Roblox */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="font-bold text-sm mb-2">Tên tài khoản Roblox</p>
              <input
                value={robloxUser}
                onChange={(e) => setRobloxUser(e.target.value)}
                placeholder="Nhập username Roblox"
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
              />
            </div>

            {/* Chọn gói */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <p className="font-bold text-sm">Chọn gói Robux</p>
                {selectedPackage && (
                  <button onClick={() => setShowPackages(!showPackages)} className="text-xs text-purple-500 font-bold">
                    {showPackages ? 'Đóng' : 'Thay đổi'}
                  </button>
                )}
              </div>

              {selectedPackage && !showPackages ? (
                <div className="bg-purple-50 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold">{selectedPackage.name}</p>
                    <p className="text-sm text-gray-500">{selectedPackage.robux} Robux</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">{formatVND(selectedPackage.price)}</p>
                    <p className="text-xs text-amber-500">{formatCoins(selectedPackage.coins)} xu</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {currentPackages.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => { setSelectedPackage(pkg); setShowPackages(false); }}
                      className="w-full p-3 rounded-xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50 flex justify-between items-center transition"
                    >
                      <div>
                        <p className="font-bold text-sm">{pkg.name}</p>
                        <p className="text-xs text-gray-400">{pkg.robux} Robux</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-purple-600">{formatVND(pkg.price)}</p>
                        <p className="text-xs text-amber-500">{formatCoins(pkg.coins)} xu</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Summary */}
        {selectedPackage && (
          <div className="mt-6 bg-white rounded-2xl p-5 shadow-lg border border-purple-100">
            <div className="flex justify-between items-center mb-4">
              <p className="font-bold text-lg">💳 Thanh toán</p>
              <button onClick={() => setSelectedPackage(null)} className="text-gray-400">
                <X size={20} />
              </button>
            </div>

            <div className="bg-purple-50 rounded-xl p-3 mb-4">
              <p className="font-bold">{selectedPackage.name}</p>
              <p className="text-sm text-gray-500">{selectedPackage.robux} Robux</p>
            </div>

            <input
              value={deliveryInfo}
              onChange={(e) => setDeliveryInfo(e.target.value)}
              placeholder={version === 'code' ? 'Email / Discord nhận code' : 'Thông tin nhận thưởng'}
              className="w-full p-3 rounded-xl border border-gray-200 mb-4 focus:border-purple-400 outline-none"
            />

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { id: 'coins', label: 'Xu', icon: Coins, color: 'text-amber-500' },
                { id: 'vietqr', label: 'VietQR', icon: QrCode, color: 'text-blue-500' },
                { id: 'zalopay', label: 'ZaloPay', icon: CreditCard, color: 'text-blue-600' },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3 rounded-xl border text-center transition ${
                      paymentMethod === m.id ? 'border-purple-400 bg-purple-50' : 'border-gray-200'
                    }`}
                  >
                    <Icon size={20} className={`mx-auto ${m.color}`} />
                    <p className="text-[10px] font-bold mt-1">{m.label}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center bg-amber-50 rounded-xl p-4 mb-4">
              <p className="font-bold">Tổng thanh toán</p>
              <p className="text-xl font-bold text-amber-500">
                {paymentMethod === 'coins' 
                  ? `${formatCoins(selectedPackage.coins)} xu` 
                  : formatVND(selectedPackage.price)}
              </p>
            </div>

            <button
              onClick={handleRedeem}
              disabled={redeeming || !robloxUser.trim() || !deliveryInfo.trim()}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg disabled:opacity-50"
            >
              {redeeming ? (
                <><Loader2 className="inline animate-spin mr-2" size={20} /> Đang xử lý...</>
              ) : (
                'Thanh toán ngay'
              )}
            </button>
          </div>
        )}

        {/* Lịch sử */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">📜 Lịch sử</h2>
            <span className="text-sm text-gray-400">{history.length} đơn</span>
          </div>

          {history.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
              <Clock3 size={40} className="mx-auto text-gray-300" />
              <p className="mt-3 text-gray-500">Chưa có lịch sử</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 5).map((order) => (
                <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold">{order.package_name}</p>
                      <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString('vi-VN')}</p>
                    </div>
                    <span className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full">
                      {order.status || 'Thành công'}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-amber-500">{formatCoins(order.coins_cost)} xu</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-purple-500">{order.robux} Robux</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 px-4 py-2">
        <div className="flex justify-around max-w-xl mx-auto">
          {[
            { icon: Home, label: 'Trang chủ', path: '/' },
            { icon: Gift, label: 'Cửa hàng', path: '/store', active: true },
            { icon: Wallet, label: 'Ví', path: '/wallet' },
            { icon: User, label: 'Tôi', path: '/profile' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => window.location.href = item.path}
                className={`flex flex-col items-center py-1 px-4 rounded-xl transition ${
                  item.active ? 'text-purple-600' : 'text-gray-400'
                }`}
              >
                <Icon size={22} />
                <span className="text-[10px] font-bold mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
                    }
