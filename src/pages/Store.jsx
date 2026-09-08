// src/pages/Store.jsx - PHẦN 1
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Gift, Coins, Star, ShoppingBag, 
  ChevronRight, User, Check, Loader2, X,
  CreditCard, Landmark, Wallet, QrCode, Clock,
  Plus, Minus, Shield, Home, ShoppingCart,
  Menu, Copy, CheckCheck, AlertCircle
} from "lucide-react";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

export default function Store() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile, setProfile } = useProfile();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("vietqr");
  const [processing, setProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [showUserIdGuide, setShowUserIdGuide] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900);

  const userCoins = profile?.coins || 0;

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    if (showQR) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showQR]);

  const fetchPackages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('redemption_packages')
      .select('*')
      .order('sort_order', { ascending: true });
    setPackages(data || []);
    setLoading(false);
  };

  const handleCheckAccount = async () => {
    if (!username.trim()) {
      setUsernameError("Vui lòng nhập tên tài khoản!");
      return;
    }
    setIsChecking(true);
    setUsernameError("");
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAccountVerified(true);
    setIsChecking(false);
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handlePayment = async () => {
    if (!selectedPackage) return;
    setProcessing(true);

    const orderId = "NXX" + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { error: orderError } = await supabase
      .from('redemption_orders')
      .insert({
        user_id: session.user.id,
        package_name: selectedPackage.name,
        package_id: selectedPackage.id,
        coins_charged: selectedPackage.coin_cost,
        delivery_target: username.trim(),
        delivery_method: paymentMethod,
        status: 'pending',
        order_code: orderId,
      });

    if (!orderError) {
      setOrderData({
        id: orderId,
        package: selectedPackage,
        username: username.trim(),
        amount: selectedPackage.price || selectedPackage.coin_cost,
        method: paymentMethod,
      });
      setShowQR(true);
      setProcessing(false);
    }
  };

  const handleConfirmPayment = async () => {
    setOrderSuccess(true);
    setShowQR(false);
  };

  const formatPrice = (price) => {
    if (!price) return "0₫";
    return Number(price).toLocaleString('vi-VN') + "₫";
  };

  const formatCoin = (coin) => {
    return Number(coin).toLocaleString('vi-VN');
  };

  const getPackageIcon = (robux) => {
    if (robux >= 1000) return "👑";
    if (robux >= 500) return "🌟";
    if (robux >= 200) return "⭐";
    return "🪙";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F8FC] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F8FC] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 px-3">
            <h1 className="text-lg font-bold text-white">NXX STORE</h1>
            <p className="text-xs text-white/70">🎮 Nạp Robux nhanh chóng</p>
          </div>
          <button className="text-white/80 hover:text-white relative">
            <ShoppingCart size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-4 mb-4 text-white">
          <div className="flex items-center gap-3">
            <Gift size={28} className="text-yellow-300" />
            <div>
              <p className="font-bold">🎮 Nạp Robux nhanh chóng</p>
              <div className="flex gap-3 mt-1 text-xs opacity-90">
                <span>✅ An toàn</span>
                <span>⚡ Tự động</span>
                <span>🕐 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Nhập tài khoản */}
        {step === 1 && !orderSuccess && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">1. Nhập tài khoản Roblox</h2>
            <div className="mt-3">
              <label className="text-xs font-medium text-gray-600">Tên tài khoản</label>
              <div className="relative mt-1">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setAccountVerified(false);
                  }}
                  placeholder="Nhập username"
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
              {usernameError && <p className="text-xs text-red-500 mt-1">{usernameError}</p>}
              <button 
                onClick={() => setShowUserIdGuide(true)}
                className="text-xs text-blue-500 underline mt-1"
              >
                Bạn chưa biết Username? Hướng dẫn tìm ID
              </button>
            </div>

            {accountVerified && (
              <div className="mt-3 bg-green-50 rounded-xl p-3 border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Check size={20} className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Roblox Account</p>
                    <p className="text-xs text-gray-500">Username: <span className="font-medium">{username}</span></p>
                    <p className="text-xs text-green-600 font-medium">✓ Tài khoản hợp lệ</p>
                  </div>
                </div>
              </div>
            )}

            {!accountVerified ? (
              <button
                onClick={handleCheckAccount}
                disabled={isChecking}
                className="mt-4 w-full py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-all disabled:opacity-50"
              >
                {isChecking ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Xác nhận'}
              </button>
            ) : (
              <button
                onClick={() => setStep(2)}
                className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-lg transition-all"
              >
                Tiếp tục →
              </button>
            )}
          </div>
        )}

        {/* Step 2: Chọn gói */}
        {step === 2 && !orderSuccess && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">2. Chọn gói Robux</h2>
              <button onClick={() => setStep(1)} className="text-xs text-blue-500">← Đổi tài khoản</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {packages.map((pkg) => {
                const isSelected = selectedPackage?.id === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    onClick={() => handleSelectPackage(pkg)}
                    className={`bg-white rounded-2xl p-4 border-2 transition-all text-left ${
                      isSelected ? 'border-blue-500 shadow-lg shadow-blue-100' : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getPackageIcon(pkg.robux)}</span>
                      <div>
                        <p className="text-xs font-bold text-gray-500">{pkg.robux || "Robux"}</p>
                        <p className="text-sm font-bold text-gray-900">{pkg.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-bold text-blue-600">{formatPrice(pkg.price || pkg.coin_cost)}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-500'
                      }`}>
                        {isSelected ? <Check size={16} /> : <Plus size={16} />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedPackage && (
              <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Đã chọn</p>
                    <p className="font-semibold text-gray-900">{selectedPackage.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{formatPrice(selectedPackage.price || selectedPackage.coin_cost)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setStep(3)}
                  className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-lg transition-all"
                >
                  Tiếp tục →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Thanh toán - TIẾP TỤC PHẦN 2 */}
      </main>

      {/* User ID Guide Modal */}
      {showUserIdGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-900">Hướng dẫn tìm ID</h3>
              <button onClick={() => setShowUserIdGuide(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-500 text-xs font-bold flex items-center justify-center">1</span>
                <p>Mở ứng dụng Roblox</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-500 text-xs font-bold flex items-center justify-center">2</span>
                <p>Vào trang cá nhân của bạn</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-500 text-xs font-bold flex items-center justify-center">3</span>
                <p>Nhấn vào avatar của bạn</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-500 text-xs font-bold flex items-center justify-center">4</span>
                <p>ID sẽ hiển thị trong URL</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg text-xs">
                📌 Ví dụ: roblox.com/users/<span className="font-bold text-blue-500">123456789</span>/profile
              </div>
            </div>
            <button
              onClick={() => setShowUserIdGuide(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
// src/pages/Store.jsx - PHẦN 2
// THAY THẾ PHẦN <></> Ở TRÊN BẰNG CODE NÀY

{/* Step 3: Thanh toán */}
{step === 3 && !orderSuccess && !showQR && (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-gray-900">3. Thanh toán</h2>
      <button onClick={() => setStep(2)} className="text-xs text-gray-400">← Quay lại</button>
    </div>

    <div className="bg-gray-50 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <User size={18} className="text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500">🎮 Roblox</p>
          <p className="text-sm font-semibold text-gray-900 truncate">{username}</p>
          <p className="text-xs text-gray-500">{selectedPackage?.name}</p>
        </div>
      </div>
      <div className="border-t border-gray-200 mt-3 pt-3 space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Tạm tính</span>
          <span className="font-medium text-gray-900">{formatPrice(selectedPackage?.price || selectedPackage?.coin_cost)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Giảm giá</span>
          <span className="font-medium text-green-500">0₫</span>
        </div>
        <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
          <span className="text-gray-900">Tổng tiền</span>
          <span className="text-blue-600">{formatPrice(selectedPackage?.price || selectedPackage?.coin_cost)}</span>
        </div>
      </div>
    </div>

    <p className="text-xs font-semibold text-gray-600 mb-2">Phương thức thanh toán</p>
    <div className="space-y-2">
      {[
        { id: 'vietqr', label: 'VietQR', icon: '🟢' },
        { id: 'zalopay', label: 'ZaloPay', icon: '🔵' },
        { id: 'momo', label: 'MoMo', icon: '🟣' },
      ].map((method) => (
        <button
          key={method.id}
          onClick={() => setPaymentMethod(method.id)}
          className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
            paymentMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">{method.icon}</span>
            <span className="text-sm font-medium text-gray-700">{method.label}</span>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            paymentMethod === method.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
          }`}>
            {paymentMethod === method.id && <Check size={12} className="text-white" />}
          </div>
        </button>
      ))}
    </div>

    <button
      onClick={handlePayment}
      disabled={processing}
      className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-500/30 disabled:opacity-50 transition-all"
    >
      {processing ? <Loader2 size={18} className="animate-spin mx-auto" /> : `Thanh toán ${formatPrice(selectedPackage?.price || selectedPackage?.coin_cost)}`}
    </button>
  </div>
)}

{/* QR Payment */}
{showQR && !orderSuccess && (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
    <h2 className="text-lg font-bold text-gray-900">Quét mã QR để thanh toán</h2>
    <p className="text-sm text-gray-500 mt-1">Số tiền: {formatPrice(orderData?.amount)}</p>
    
    <div className="my-4 flex justify-center">
      <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
        <QrCode size={80} className="text-gray-400" />
      </div>
    </div>
    
    <div className="bg-gray-50 rounded-xl p-3 text-left space-y-1">
      <p className="text-xs text-gray-500">🏦 Ngân hàng: Vietcombank</p>
      <p className="text-xs text-gray-500">📝 Nội dung: {orderData?.id || "NXX315-145"}</p>
      <p className="text-xs text-yellow-600">⏱ Mã QR hết hạn sau: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</p>
    </div>
    
    <button
      onClick={handleConfirmPayment}
      className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg transition-all"
    >
      Tôi đã thanh toán
    </button>
    
    <button
      onClick={() => setStep(3)}
      className="mt-2 text-xs text-gray-400"
    >
      ← Quay lại
    </button>
  </div>
)}

{/* Success */}
{orderSuccess && (
  <div className="animate-in fade-in duration-500">
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
      <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
        <Check size={40} className="text-green-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mt-4">Thanh toán thành công! 🎉</h2>
      <p className="text-sm text-gray-500">+{orderData?.package?.robux || 0} Robux</p>

      <div className="mt-4 bg-gray-50 rounded-xl p-4 text-left space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Tài khoản</span>
          <span className="font-medium text-gray-900">{orderData?.username}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Gói</span>
          <span className="font-medium text-gray-900">{orderData?.package?.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Số tiền</span>
          <span className="font-medium text-blue-600">{formatPrice(orderData?.amount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Mã đơn hàng</span>
          <span className="font-medium text-gray-900">{orderData?.id}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Trạng thái</span>
          <span className="font-medium text-green-500">✓ Đã xử lý</span>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={() => navigate("/order-history")}
          className="flex-1 py-3 rounded-xl border-2 border-blue-500 text-blue-500 font-semibold hover:bg-blue-50 transition-all"
        >
          Xem đơn hàng
        </button>
        <button
          onClick={() => {
            setOrderSuccess(false);
            setStep(1);
            setSelectedPackage(null);
            setAccountVerified(false);
            setUsername("");
            setShowQR(false);
            navigate("/");
          }}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-lg transition-all"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  </div>
)}