import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Search, Gift, Coins, 
  Star, ShoppingBag, Clock, ChevronRight,
  Sparkles, TrendingUp, Package, Zap,
  CreditCard, Landmark, Wallet, X,
  Check, AlertCircle, Loader2, User,
  Eye, Copy, CheckCheck
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
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("coin");
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [showUserIdGuide, setShowUserIdGuide] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [showVoucher, setShowVoucher] = useState(false);

  const userCoins = profile?.coins || 0;

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('redemption_packages')
      .select('*')
      .order('sort_order', { ascending: true });
    setPackages(data || []);
    setLoading(false);
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setShowPayment(true);
    setOrderSuccess(false);
    setVoucherCode("");
  };

  const handlePayment = async () => {
    if (!username.trim()) {
      alert("Vui lòng nhập tên tài khoản Roblox!");
      return;
    }

    if (!selectedPackage) return;

    if (paymentMethod === "coin") {
      if (userCoins < selectedPackage.coin_cost) {
        alert(`⚠️ Không đủ Coin! Cần ${selectedPackage.coin_cost} Coin. Hiện có ${userCoins} Coin.`);
        return;
      }

      setProcessing(true);

      // Trừ Coin
      const { error: deductError } = await supabase
        .from('profiles')
        .update({ coins: userCoins - selectedPackage.coin_cost })
        .eq('id', session.user.id);

      if (deductError) {
        alert("Lỗi: " + deductError.message);
        setProcessing(false);
        return;
      }

      // Tạo đơn hàng
      const { error: orderError } = await supabase
        .from('redemption_orders')
        .insert({
          user_id: session.user.id,
          package_name: selectedPackage.name,
          package_id: selectedPackage.id,
          coins_charged: selectedPackage.coin_cost,
          delivery_target: username.trim(),
          delivery_method: 'coin',
          status: 'pending',
        });

      if (orderError) {
        alert("Lỗi tạo đơn: " + orderError.message);
        setProcessing(false);
        return;
      }

      // Cập nhật profile
      setProfile(prev => ({
        ...prev,
        coins: userCoins - selectedPackage.coin_cost
      }));

      setProcessing(false);
      setOrderSuccess(true);
      
      setTimeout(() => {
        setShowPayment(false);
        setSelectedPackage(null);
        setUsername("");
        setOrderSuccess(false);
      }, 3000);

    } else {
      // Thanh toán bằng ngân hàng - chuyển sang trang hướng dẫn
      alert("💳 Vui lòng chuyển khoản theo thông tin bên dưới:\n\n" +
        "🏦 Ngân hàng: Vietcombank\n" +
        "📌 Số TK: 123456789\n" +
        "👤 Chủ TK: NXX315\n" +
        "📝 Nội dung: " + session.user.id.slice(0, 8) + "\n\n" +
        "💰 Số tiền: " + selectedPackage.price?.toLocaleString('vi-VN') + "đ\n\n" +
        "⏳ Sau khi chuyển khoản, đơn sẽ được xử lý trong 15-30 phút.");
      
      // Tạo đơn chờ thanh toán
      const { error: orderError } = await supabase
        .from('redemption_orders')
        .insert({
          user_id: session.user.id,
          package_name: selectedPackage.name,
          package_id: selectedPackage.id,
          coins_charged: selectedPackage.coin_cost,
          delivery_target: username.trim(),
          delivery_method: 'bank',
          status: 'pending',
        });

      if (!orderError) {
        setShowPayment(false);
        setSelectedPackage(null);
        setUsername("");
      }
    }
  };

  const copyUserId = () => {
    navigator.clipboard.writeText(session?.user?.id || "");
  };

  const formatPrice = (price) => {
    if (!price) return "0đ";
    return Number(price).toLocaleString('vi-VN') + "đ";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Cửa hàng Roblox</h1>
            <div className="flex items-center gap-1 mt-0.5">
              <Coins size={14} className="text-yellow-300" />
              <span className="text-sm font-semibold text-white">{userCoins.toLocaleString('vi-VN')} Coin</span>
            </div>
          </div>
          <button className="text-white/80 hover:text-white">
            <Search size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4">
        {/* Banner */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 mb-4 text-white">
          <div className="flex items-center gap-3">
            <Gift size={28} className="text-yellow-300" />
            <div>
              <p className="font-bold">🎉 Ưu đãi đặc biệt</p>
              <p className="text-sm opacity-90">Giảm 10% khi mua gói 500 Robux trở lên</p>
            </div>
          </div>
        </div>

        {/* Danh sách gói */}
        <div className="grid grid-cols-2 gap-3">
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => handleSelectPackage(pkg)}
              className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all text-left"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold text-gray-500">{pkg.robux || "Robux"}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 mt-1">{pkg.name}</p>
                </div>
                <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full">
                  <Coins size={12} className="text-yellow-500" />
                  <span className="text-xs font-bold text-gray-700">{pkg.coin_cost.toLocaleString('vi-VN')}</span>
                </div>
              </div>
              {pkg.price && (
                <p className="text-xs text-gray-400 mt-1.5">{formatPrice(pkg.price)}</p>
              )}
              {pkg.discount && (
                <span className="inline-block mt-1.5 text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                  -{pkg.discount}%
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Lịch sử đơn hàng */}
        <button 
          onClick={() => navigate("/order-history")}
          className="mt-4 w-full flex items-center justify-between bg-white rounded-xl p-3 border border-gray-200"
        >
          <div className="flex items-center gap-2">
            <Package size={18} className="text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Lịch sử đơn hàng</span>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </button>
      </main>

      {/* Payment Modal */}
      {showPayment && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Xác nhận đơn hàng</h2>
              <button 
                onClick={() => {
                  setShowPayment(false);
                  setSelectedPackage(null);
                  setUsername("");
                  setOrderSuccess(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {orderSuccess ? (
              <div className="py-8 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <Check size={32} className="text-green-500" />
                </div>
                <p className="mt-3 text-lg font-bold text-gray-900">Đặt hàng thành công! 🎉</p>
                <p className="text-sm text-gray-500">Đơn hàng đang được xử lý</p>
              </div>
            ) : (
              <>
                {/* Step 1: Username */}
                <div className="bg-blue-50 rounded-xl p-3 mb-4">
                  <p className="text-xs font-bold text-blue-600">1. Đăng nhập bằng tên tài khoản</p>
                  <button 
                    onClick={() => setShowUserIdGuide(true)}
                    className="text-[10px] text-blue-500 underline mt-0.5"
                  >
                    Hướng dẫn tìm ID
                  </button>
                  <div className="flex items-center gap-2 mt-2">
                    <User size={16} className="text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Tên tài khoản"
                      className="flex-1 bg-white rounded-lg px-3 py-2 text-sm outline-none border border-gray-200 focus:border-blue-400"
                    />
                  </div>
                  {session?.user?.id && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-gray-400">ID: {session.user.id.slice(0, 8)}...</span>
                      <button onClick={copyUserId} className="text-[10px] text-blue-500">
                        <Copy size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Step 2: Package info */}
                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                  <p className="text-xs font-bold text-gray-600">2. Chọn gói</p>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="font-semibold text-gray-900">{selectedPackage.name}</p>
                      <p className="text-xs text-gray-500">{selectedPackage.robux || ""} Robux</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{selectedPackage.coin_cost.toLocaleString('vi-VN')} Coin</p>
                      {selectedPackage.price && (
                        <p className="text-xs text-gray-400 line-through">{formatPrice(selectedPackage.price)}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-600 mb-2">Phương thức thanh toán</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentMethod("coin")}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        paymentMethod === "coin" 
                          ? "border-blue-500 bg-blue-50" 
                          : "border-gray-200"
                      }`}
                    >
                      <Coins size={18} className="text-yellow-500" />
                      <div className="text-left">
                        <p className="text-xs font-semibold">Coin</p>
                        <p className="text-[8px] text-gray-400">Dùng Coin</p>
                      </div>
                      {paymentMethod === "coin" && <Check size={14} className="text-blue-500 ml-auto" />}
                    </button>
                    <button
                      onClick={() => setPaymentMethod("bank")}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        paymentMethod === "bank" 
                          ? "border-blue-500 bg-blue-50" 
                          : "border-gray-200"
                      }`}
                    >
                      <Landmark size={18} className="text-green-500" />
                      <div className="text-left">
                        <p className="text-xs font-semibold">Ngân hàng</p>
                        <p className="text-[8px] text-gray-400">VietQR / Bank</p>
                      </div>
                      {paymentMethod === "bank" && <Check size={14} className="text-blue-500 ml-auto" />}
                    </button>
                  </div>
                </div>

                {/* Voucher */}
                <button 
                  onClick={() => setShowVoucher(!showVoucher)}
                  className="flex items-center gap-2 text-xs text-blue-500 mb-3"
                >
                  <Gift size={14} /> Mã giảm giá
                  <ChevronRight size={14} className={`transition-transform ${showVoucher ? 'rotate-90' : ''}`} />
                </button>

                {showVoucher && (
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      placeholder="Nhập mã giảm giá"
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                    <button className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium">
                      Áp dụng
                    </button>
                  </div>
                )}

                {/* Total */}
                <div className="border-t border-gray-200 pt-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Tổng thanh toán</span>
                    <span className="text-lg font-bold text-gray-900">
                      {paymentMethod === "coin" 
                        ? selectedPackage.coin_cost.toLocaleString('vi-VN') + " Coin"
                        : formatPrice(selectedPackage.price || selectedPackage.coin_cost * 100)
                      }
                    </span>
                  </div>
                </div>

                {/* Button */}
                <button
                  onClick={handlePayment}
                  disabled={processing || !username.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  {processing ? (
                    <Loader2 size={18} className="animate-spin mx-auto" />
                  ) : (
                    paymentMethod === "coin" ? `Thanh toán ${selectedPackage.coin_cost} Coin` : "Thanh toán ngay"
                  )}
                </button>

                <p className="mt-2 text-[9px] text-gray-400 text-center">
                  Bằng việc nhấn nút “Thanh toán”, bạn đồng ý rằng giao dịch này không hoàn, không hủy.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* User ID Guide */}
      {showUserIdGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-900">Hướng dẫn tìm ID</h3>
              <button onClick={() => setShowUserIdGuide(false)} className="text-gray-400">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <p>1. Mở ứng dụng Roblox</p>
              <p>2. Vào trang cá nhân của bạn</p>
              <p>3. Nhấn vào avatar của bạn</p>
              <p>4. ID sẽ hiển thị trong URL</p>
              <div className="bg-gray-100 p-2 rounded-lg text-xs">
                📌 Ví dụ: roblox.com/users/<span className="font-bold text-blue-500">123456789</span>/profile
              </div>
            </div>
            <button
              onClick={() => setShowUserIdGuide(false)}
              className="mt-4 w-full py-2 rounded-lg bg-blue-500 text-white font-semibold"
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