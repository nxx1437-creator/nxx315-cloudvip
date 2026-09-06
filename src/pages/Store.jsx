import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Coins,
  Copy,
  Gamepad2,
  Gift,
  Home,
  Loader2,
  Menu,
  ShieldCheck,
  Sparkles,
  Star,
  Swords,
  User,
  Wallet,
  Zap,
  X,
  XCircle,
  Search,
  UserCheck,
  Mail,
  CreditCard,
  QrCode,
  Plus,
  Minus,
} from "lucide-react";

import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";

const formatCoins = (value) => Number(value || 0).toLocaleString("vi-VN");
const formatVND = (value) => Number(value || 0).toLocaleString("vi-VN") + " VND";

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusMap = {
  pending: { text: "Đang xử lý", className: "bg-amber-50 text-amber-600", icon: Clock3 },
  delivered: { text: "Đã giao", className: "bg-emerald-50 text-emerald-600", icon: CheckCircle2 },
  rejected: { text: "Từ chối", className: "bg-rose-50 text-rose-500", icon: XCircle },
  cancelled: { text: "Đã hủy", className: "bg-gray-100 text-gray-500", icon: XCircle },
};

// ======================== GAME CATEGORIES ========================
const GAME_CATEGORIES = [
  {
    id: "robux",
    name: "Roblox",
    icon: Gamepad2,
    color: "from-red-500 to-orange-500",
    bgColor: "from-red-50 to-orange-50",
  },
  {
    id: "quanhuy",
    name: "Quân Huy",
    icon: Swords,
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50",
  },
  {
    id: "pubg",
    name: "PUBG",
    icon: Target,
    color: "from-yellow-500 to-amber-500",
    bgColor: "from-yellow-50 to-amber-50",
  },
  {
    id: "freefire",
    name: "Free Fire",
    icon: Flame,
    color: "from-orange-500 to-red-500",
    bgColor: "from-orange-50 to-red-50",
  },
  {
    id: "lienminh",
    name: "Liên Minh",
    icon: Sword,
    color: "from-blue-600 to-indigo-600",
    bgColor: "from-blue-50 to-indigo-50",
  },
  {
    id: "zingcard",
    name: "ZingCard",
    icon: CreditCard,
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-50 to-pink-50",
  },
];

// ======================== ROBLOX PACKAGES ========================
const ROBLOX_PACKAGES = {
  vng: [
    { id: "vng_40", name: "Gói 40 Robux", robux: 40, price_vnd: 14000, coin_cost: 14000, badge: "Phổ biến" },
    { id: "vng_80", name: "Gói 80 Robux", robux: 80, price_vnd: 28000, coin_cost: 28000, badge: "Tiết kiệm" },
    { id: "vng_500", name: "Gói 500 Robux", robux: 500, price_vnd: 140000, coin_cost: 140000, badge: "Hot" },
    { id: "vng_1000", name: "Gói 1000 Robux", robux: 1000, price_vnd: 280000, coin_cost: 280000, badge: "VIP" },
  ],
  global: [
    { id: "global_55", name: "Gói 55 Robux", robux: 55, price_vnd: 20000, coin_cost: 20000 },
    { id: "global_145", name: "Gói 145 Robux", robux: 145, price_vnd: 50000, coin_cost: 50000 },
    { id: "global_300", name: "Gói 300 Robux", robux: 300, price_vnd: 100000, coin_cost: 100000 },
    { id: "global_600", name: "Gói 600 Robux", robux: 600, price_vnd: 180000, coin_cost: 180000, badge: "Hot" },
    { id: "global_1200", name: "Gói 1200 Robux", robux: 1200, price_vnd: 350000, coin_cost: 350000, badge: "VIP" },
  ],
};

export default function Store() {
  const { session } = useSession();
  const { profile, setProfile } = useProfile();

  const [packages, setPackages] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  
  // Game selection
  const [selectedGame, setSelectedGame] = useState("robux");
  const [robuxVersion, setRobuxVersion] = useState("vng");
  const [selectedPackage, setSelectedPackage] = useState(null);
  
  // Roblox user
  const [robloxUsername, setRobloxUsername] = useState("");
  const [robloxUserData, setRobloxUserData] = useState(null);
  const [searchingRoblox, setSearchingRoblox] = useState(false);
  const [robloxError, setRobloxError] = useState(null);
  
  // Delivery method
  const [deliveryMethod, setDeliveryMethod] = useState("vng"); // vng, global_code
  const [deliveryTarget, setDeliveryTarget] = useState("");
  
  // Payment
  const [paymentMethod, setPaymentMethod] = useState("coins"); // coins, vietqr, zalopay
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState("");
  const [showPackageSelector, setShowPackageSelector] = useState(false);

  const userId = session?.user?.id;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  const loadStore = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [packageResponse, historyResponse] = await Promise.all([
        supabase.from("redemption_packages").select("*").eq("active", true).order("sort_order", { ascending: true }),
        supabase.from("redemption_orders").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      ]);
      if (packageResponse.error) console.error("Package error:", packageResponse.error);
      if (historyResponse.error) console.error("History error:", historyResponse.error);
      setPackages(packageResponse.data || []);
      setHistory(historyResponse.data || []);
    } catch (error) {
      console.error("Store loading error:", error);
      showToast("Không thể tải dữ liệu cửa hàng.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStore();
  }, [userId]);

  // ======================== ROBLOX API ========================
  const searchRobloxUser = async () => {
    if (!robloxUsername.trim()) {
      setRobloxError("Vui lòng nhập tên tài khoản");
      return;
    }

    setSearchingRoblox(true);
    setRobloxError(null);
    setRobloxUserData(null);

    try {
      // Gọi API Roblox để tìm user
      const response = await fetch(
        `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(robloxUsername.trim())}&limit=1`
      );
      
      if (!response.ok) throw new Error("Không thể tìm kiếm người dùng");

      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const user = data.data[0];
        // Lấy thêm thông tin chi tiết
        const detailResponse = await fetch(`https://users.roblox.com/v1/users/${user.id}`);
        if (detailResponse.ok) {
          const detailData = await detailResponse.json();
          setRobloxUserData(detailData);
          showToast(`Đã tìm thấy: ${detailData.displayName || detailData.name}`, "success");
        } else {
          setRobloxUserData(user);
        }
      } else {
        setRobloxError("Không tìm thấy người dùng. Vui lòng kiểm tra lại tên.");
        setRobloxUserData(null);
      }
    } catch (error) {
      console.error("Roblox search error:", error);
      setRobloxError("Lỗi kết nối đến Roblox API. Vui lòng thử lại.");
    } finally {
      setSearchingRoblox(false);
    }
  };

  // ======================== SELECT PACKAGE ========================
  const getCurrentPackages = () => {
    if (selectedGame === "robux") {
      return robuxVersion === "vng" ? ROBLOX_PACKAGES.vng : ROBLOX_PACKAGES.global;
    }
    return packages.filter((pkg) => pkg.game_type === selectedGame);
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setShowPackageSelector(false);
    
    if (selectedGame === "robux") {
      if (robuxVersion === "vng") {
        setDeliveryMethod("vng");
      } else {
        setDeliveryMethod("global_code");
      }
    }
  };

  const handleRedeem = async () => {
    if (!userId) {
      showToast("Vui lòng đăng nhập trước.", "error");
      return;
    }

    if (!selectedPackage) {
      showToast("Bạn chưa chọn gói phần thưởng.", "error");
      return;
    }

    // Kiểm tra xu nếu thanh toán bằng xu
    if (paymentMethod === "coins") {
      const cost = Number(selectedPackage.coin_cost || 0);
      const balance = Number(profile?.coins || 0);
      if (balance < cost) {
        showToast(`Bạn cần thêm ${formatCoins(cost - balance)} xu.`, "error");
        return;
      }
    }

    if (selectedGame === "robux" && !robloxUserData) {
      showToast("Vui lòng xác nhận tên tài khoản Roblox.", "error");
      return;
    }

    if (!deliveryTarget.trim()) {
      showToast("Vui lòng nhập thông tin nhận thưởng.", "error");
      return;
    }

    setRedeeming(true);

    try {
      const orderData = {
        user_id: userId,
        game_type: selectedGame,
        package_id: selectedPackage.id,
        package_name: selectedPackage.name,
        robux_amount: selectedPackage.robux || 0,
        price_vnd: selectedPackage.price_vnd || 0,
        coin_cost: selectedPackage.coin_cost || 0,
        delivery_method: deliveryMethod,
        delivery_target: deliveryTarget,
        roblox_username: robloxUserData?.name || robloxUsername,
        roblox_user_id: robloxUserData?.id,
        payment_method: paymentMethod,
        status: "pending",
      };

      // Lưu vào database
      const { data, error } = await supabase
        .from("redemption_orders")
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;

      // Trừ xu nếu thanh toán bằng xu
      if (paymentMethod === "coins") {
        const newBalance = Number(profile?.coins || 0) - Number(selectedPackage.coin_cost || 0);
        if (typeof setProfile === "function") {
          setProfile((old) => ({ ...old, coins: newBalance }));
        }
        // Cập nhật coins trong database
        await supabase
          .from("profiles")
          .update({ coins: newBalance })
          .eq("id", userId);
      }

      await refreshHistory();
      showToast(`Đổi thưởng thành công! ${selectedPackage.name}`, "success");

      // Reset
      setSelectedPackage(null);
      setDeliveryTarget("");
      setShowPackageSelector(false);

    } catch (error) {
      console.error("Redeem error:", error);
      showToast(error?.message || "Đổi thưởng thất bại.", "error");
    } finally {
      setRedeeming(false);
    }
  };

  const refreshHistory = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("redemption_orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (!error) setHistory(data || []);
  };

  const copyCode = async (code) => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      showToast("Không thể sao chép.", "error");
    }
  };

  const totalAmount = selectedPackage ? 
    (paymentMethod === "coins" ? `${formatCoins(selectedPackage.coin_cost)} xu` : formatVND(selectedPackage.price_vnd)) 
    : "0";

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-[#f0f2ff] via-white to-[#faf0ff] pb-28 text-[#151827]">
      {toast && (
        <div
          className={`fixed left-1/2 top-4 z-[100] flex w-[calc(100%-32px)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border bg-white/95 backdrop-blur-xl px-4 py-3 shadow-2xl ${
            toast.type === "error" ? "border-rose-200 text-rose-600" : "border-emerald-200 text-emerald-600"
          }`}
        >
          {toast.type === "error" ? <XCircle size={19} /> : <CheckCircle2 size={19} />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      <StoreHeader balance={profile?.coins} onBack={() => window.history.back()} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6">
        <PageTitle balance={profile?.coins} onBack={() => window.history.back()} />
        <Hero balance={profile?.coins} />
        
        {/* Game Categories */}
        <GameCategories selectedGame={selectedGame} onSelectGame={setSelectedGame} />

        {/* Game Content */}
        <GameContent
          selectedGame={selectedGame}
          robuxVersion={robuxVersion}
          setRobuxVersion={setRobuxVersion}
          robloxUsername={robloxUsername}
          setRobloxUsername={setRobloxUsername}
          robloxUserData={robloxUserData}
          setRobloxUserData={setRobloxUserData}
          robloxError={robloxError}
          setRobloxError={setRobloxError}
          searchingRoblox={searchingRoblox}
          searchRobloxUser={searchRobloxUser}
          selectedPackage={selectedPackage}
          setSelectedPackage={setSelectedPackage}
          showPackageSelector={showPackageSelector}
          setShowPackageSelector={setShowPackageSelector}
          handleSelectPackage={handleSelectPackage}
          getCurrentPackages={getCurrentPackages}
        />

        {/* Order Summary */}
        <OrderSummary
          selectedPackage={selectedPackage}
          selectedGame={selectedGame}
          robloxUserData={robloxUserData}
          deliveryTarget={deliveryTarget}
          setDeliveryTarget={setDeliveryTarget}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          totalAmount={totalAmount}
          redeeming={redeeming}
          onRedeem={handleRedeem}
          onClearSelection={() => {
            setSelectedPackage(null);
            setShowPackageSelector(false);
          }}
        />

        <HistorySection history={history} copied={copied} onCopy={copyCode} />
      </main>

      <BottomNavigation />
    </div>
  );
    }
// ======================== GAME CATEGORIES ========================
function GameCategories({ selectedGame, onSelectGame }) {
  const categories = [
    { id: "robux", name: "Roblox", icon: Gamepad2, color: "from-red-500 to-orange-500" },
    { id: "quanhuy", name: "Quân Huy", icon: Swords, color: "from-blue-500 to-cyan-500" },
    { id: "pubg", name: "PUBG", icon: Target, color: "from-yellow-500 to-amber-500" },
    { id: "freefire", name: "Free Fire", icon: Flame, color: "from-orange-500 to-red-500" },
    { id: "lienminh", name: "Liên Minh", icon: Sword, color: "from-blue-600 to-indigo-600" },
    { id: "zingcard", name: "ZingCard", icon: CreditCard, color: "from-purple-500 to-pink-500" },
  ];

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-black">🎮 Chọn game</h2>
        <span className="text-xs text-gray-400">Chọn phần thưởng</span>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {categories.map((game) => {
          const Icon = game.icon;
          const isActive = selectedGame === game.id;
          return (
            <button
              key={game.id}
              type="button"
              onClick={() => onSelectGame(game.id)}
              className={`group relative rounded-[20px] border p-3 text-center transition-all duration-300 ${
                isActive
                  ? `border-transparent bg-gradient-to-br ${game.color} text-white shadow-lg scale-[1.02]`
                  : "border-gray-100 bg-white/80 hover:shadow-lg"
              }`}
            >
              <div className={`flex justify-center transition-all duration-300 ${isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"}`}>
                <Icon size={28} />
              </div>
              <p className={`mt-1 text-[10px] font-black ${isActive ? "text-white" : "text-gray-600"}`}>
                {game.name}
              </p>
              {isActive && (
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 shadow-lg flex items-center justify-center">
                  <Check size={10} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ======================== GAME CONTENT ========================
function GameContent({
  selectedGame,
  robuxVersion,
  setRobuxVersion,
  robloxUsername,
  setRobloxUsername,
  robloxUserData,
  setRobloxUserData,
  robloxError,
  setRobloxError,
  searchingRoblox,
  searchRobloxUser,
  selectedPackage,
  setSelectedPackage,
  showPackageSelector,
  setShowPackageSelector,
  handleSelectPackage,
  getCurrentPackages,
}) {
  // Roblox Content
  if (selectedGame === "robux") {
    return (
      <RobloxContent
        robuxVersion={robuxVersion}
        setRobuxVersion={setRobuxVersion}
        robloxUsername={robloxUsername}
        setRobloxUsername={setRobloxUsername}
        robloxUserData={robloxUserData}
        setRobloxUserData={setRobloxUserData}
        robloxError={robloxError}
        setRobloxError={setRobloxError}
        searchingRoblox={searchingRoblox}
        searchRobloxUser={searchRobloxUser}
        selectedPackage={selectedPackage}
        setSelectedPackage={setSelectedPackage}
        showPackageSelector={showPackageSelector}
        setShowPackageSelector={setShowPackageSelector}
        handleSelectPackage={handleSelectPackage}
        getCurrentPackages={getCurrentPackages}
      />
    );
  }

  // Other games content
  return (
    <section className="mb-6 rounded-[28px] bg-white/80 p-6 shadow-lg shadow-purple-100/40 ring-1 ring-purple-100 backdrop-blur-sm">
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🎮</div>
        <h3 className="text-xl font-black">Đang phát triển</h3>
        <p className="mt-2 text-sm text-gray-400">Phần thưởng cho game này sẽ sớm có mặt</p>
      </div>
    </section>
  );
}

// ======================== ROBLOX CONTENT ========================
function RobloxContent({
  robuxVersion,
  setRobuxVersion,
  robloxUsername,
  setRobloxUsername,
  robloxUserData,
  setRobloxUserData,
  robloxError,
  setRobloxError,
  searchingRoblox,
  searchRobloxUser,
  selectedPackage,
  setSelectedPackage,
  showPackageSelector,
  setShowPackageSelector,
  handleSelectPackage,
  getCurrentPackages,
}) {
  const packages = getCurrentPackages();

  return (
    <section className="mb-6 space-y-5">
      {/* Version Selector */}
      <div className="rounded-[28px] bg-white/80 p-5 shadow-lg shadow-purple-100/40 ring-1 ring-purple-100 backdrop-blur-sm">
        <h3 className="text-sm font-black mb-3">Chọn hình thức nhận Robux</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRobuxVersion("vng")}
            className={`rounded-[20px] border p-4 text-left transition-all duration-300 ${
              robuxVersion === "vng"
                ? "border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg"
                : "border-gray-100 bg-white/50 hover:shadow-md"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white">
                <Gamepad2 size={18} />
              </div>
              <div>
                <p className="font-black text-sm">VNG Nạp thẳng</p>
                <p className="text-[10px] text-gray-400">Nhận Robux trực tiếp</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRobuxVersion("global")}
            className={`rounded-[20px] border p-4 text-left transition-all duration-300 ${
              robuxVersion === "global"
                ? "border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg"
                : "border-gray-100 bg-white/50 hover:shadow-md"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                <Mail size={18} />
              </div>
              <div>
                <p className="font-black text-sm">Global Code</p>
                <p className="text-[10px] text-gray-400">Nhận code qua email/Discord</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Roblox Username Input */}
      <div className="rounded-[28px] bg-white/80 p-5 shadow-lg shadow-purple-100/40 ring-1 ring-purple-100 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black">1. Đăng nhập bằng tên tài khoản</h3>
          <button type="button" className="text-[10px] text-purple-500 font-bold hover:text-purple-600">
            Hướng dẫn tìm ID
          </button>
        </div>

        <div className="flex gap-2">
          <input
            value={robloxUsername}
            onChange={(e) => {
              setRobloxUsername(e.target.value);
              setRobloxUserData(null);
              setRobloxError(null);
            }}
            placeholder="Tên tài khoản Roblox"
            className="flex-1 h-12 rounded-2xl border border-gray-200 bg-gray-50/50 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-100"
          />
          <button
            type="button"
            onClick={searchRobloxUser}
            disabled={searchingRoblox || !robloxUsername.trim()}
            className="flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-5 text-sm font-black text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            {searchingRoblox ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            Tìm
          </button>
        </div>

        {robloxError && (
          <p className="mt-2 text-xs text-rose-500">{robloxError}</p>
        )}

        {robloxUserData && (
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-emerald-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <UserCheck size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">{robloxUserData.displayName || robloxUserData.name}</p>
              <p className="text-[10px] text-gray-400">ID: {robloxUserData.id}</p>
            </div>
            <Check size={16} className="ml-auto text-emerald-500" />
          </div>
        )}
      </div>

      {/* Package Selector */}
      <div className="rounded-[28px] bg-white/80 p-5 shadow-lg shadow-purple-100/40 ring-1 ring-purple-100 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black">2. Chọn gói</h3>
          {selectedPackage && (
            <button
              type="button"
              onClick={() => setShowPackageSelector(!showPackageSelector)}
              className="text-xs text-purple-500 font-bold"
            >
              {showPackageSelector ? "Đóng" : "Thay đổi"}
            </button>
          )}
        </div>

        {selectedPackage && !showPackageSelector ? (
          <div className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-4">
            <div>
              <p className="font-black">{selectedPackage.name}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-500">{selectedPackage.robux} Robux</span>
                <span className="text-xs font-bold text-orange-500">{formatCoins(selectedPackage.coin_cost)} xu</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-purple-500">{formatVND(selectedPackage.price_vnd)}</p>
              <button
                type="button"
                onClick={() => setShowPackageSelector(true)}
                className="text-[10px] text-purple-500"
              >
                Thay đổi
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => handleSelectPackage(pkg)}
                className={`w-full flex items-center justify-between rounded-2xl border p-4 text-left transition-all duration-300 ${
                  selectedPackage?.id === pkg.id
                    ? "border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md"
                    : "border-gray-100 bg-white/50 hover:shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-sm">{pkg.name}</p>
                    {pkg.badge && (
                      <span className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-2 py-0.5 text-[8px] font-black text-white">
                        {pkg.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{pkg.robux} Robux</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-purple-500">{formatVND(pkg.price_vnd)}</p>
                  <p className="text-[10px] text-orange-500">{formatCoins(pkg.coin_cost)} xu</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
        }
// ======================== ORDER SUMMARY ========================
function OrderSummary({
  selectedPackage,
  selectedGame,
  robloxUserData,
  deliveryTarget,
  setDeliveryTarget,
  paymentMethod,
  setPaymentMethod,
  totalAmount,
  redeeming,
  onRedeem,
  onClearSelection,
}) {
  if (!selectedPackage) return null;

  return (
    <section className="mb-7 overflow-hidden rounded-[30px] bg-white/80 shadow-xl shadow-purple-100/40 ring-1 ring-purple-100 backdrop-blur-sm">
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-violet-500 px-5 py-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">THÔNG TIN ĐƠN HÀNG</p>
            <h3 className="mt-1 text-lg font-black">Giỏ hàng</h3>
          </div>
          <button
            type="button"
            onClick={onClearSelection}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Selected Package */}
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-4">
          <div>
            <p className="font-black">{selectedPackage.name}</p>
            <p className="text-sm text-gray-500">{selectedPackage.robux} Robux</p>
          </div>
          <p className="font-bold text-purple-600">{formatVND(selectedPackage.price_vnd)}</p>
        </div>

        {/* Delivery Target */}
        <div>
          <p className="text-xs font-black mb-2">
            {selectedGame === "robux" ? "Thông tin nhận thưởng" : "Thông tin nhận"}
          </p>
          <input
            value={deliveryTarget}
            onChange={(e) => setDeliveryTarget(e.target.value)}
            placeholder={
              selectedGame === "robux" 
                ? "Nhập email hoặc Discord để nhận code" 
                : "Nhập thông tin nhận thưởng"
            }
            className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-100"
          />
          {robloxUserData && selectedGame === "robux" && (
            <p className="mt-1 text-[10px] text-emerald-500">
              ✓ Tài khoản Roblox: {robloxUserData.displayName || robloxUserData.name}
            </p>
          )}
        </div>

        {/* Payment Methods */}
        <div>
          <p className="text-xs font-black mb-2">Phương thức thanh toán</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("coins")}
              className={`rounded-2xl border p-3 text-center transition-all duration-300 ${
                paymentMethod === "coins"
                  ? "border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md"
                  : "border-gray-100 bg-white/50 hover:shadow-md"
              }`}
            >
              <Coins size={20} className="mx-auto text-amber-500" />
              <p className="mt-1 text-[9px] font-black">Xu</p>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("vietqr")}
              className={`rounded-2xl border p-3 text-center transition-all duration-300 ${
                paymentMethod === "vietqr"
                  ? "border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md"
                  : "border-gray-100 bg-white/50 hover:shadow-md"
              }`}
            >
              <QrCode size={20} className="mx-auto text-blue-500" />
              <p className="mt-1 text-[9px] font-black">VietQR</p>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("zalopay")}
              className={`rounded-2xl border p-3 text-center transition-all duration-300 ${
                paymentMethod === "zalopay"
                  ? "border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md"
                  : "border-gray-100 bg-white/50 hover:shadow-md"
              }`}
            >
              <CreditCard size={20} className="mx-auto text-blue-600" />
              <p className="mt-1 text-[9px] font-black">ZaloPay</p>
            </button>
          </div>
        </div>

        {/* Voucher */}
        <div className="flex items-center justify-between rounded-2xl border border-dashed border-gray-300 p-3">
          <p className="text-xs font-bold text-gray-400">Mã Voucher</p>
          <button type="button" className="text-xs font-black text-purple-500">
            Nhập mã &gt;
          </button>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-4">
          <p className="font-black">Tổng thanh toán</p>
          <p className="text-xl font-black text-orange-500">{totalAmount}</p>
        </div>

        {/* Terms */}
        <p className="text-[9px] text-gray-400 text-center leading-relaxed">
          Bằng việc nhấn nút “Thanh toán ngay”, bạn đồng ý rằng giao dịch này không hoàn, không hủy 
          và tuân thủ với Điều khoản sử dụng và Chính sách bảo mật.
        </p>

        {/* Pay Button */}
        <button
          type="button"
          disabled={redeeming || !deliveryTarget.trim()}
          onClick={onRedeem}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-violet-500 px-5 py-4 text-sm font-black text-white shadow-lg shadow-purple-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
        >
          {redeeming ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <CreditCard size={18} />
              Thanh toán ngay
            </>
          )}
        </button>
      </div>
    </section>
  );
}

// ======================== HISTORY SECTION ========================
function HistorySection({ history, copied, onCopy }) {
  return (
    <section className="mb-8">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black">📜 Lịch sử đổi thưởng</h2>
          <p className="mt-1 text-xs text-gray-400">Theo dõi những đơn đã đổi</p>
        </div>
        <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-gray-400 shadow-sm">
          {history.length} đơn
        </span>
      </div>

      {history.length === 0 ? (
        <div className="rounded-[28px] bg-white/80 px-5 py-12 text-center shadow-sm">
          <Clock3 size={38} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-black text-gray-500">Chưa có lịch sử đổi thưởng</p>
          <p className="mt-1 text-xs text-gray-400">Các đơn của bạn sẽ xuất hiện ở đây.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.slice(0, 5).map((order) => {
            const config = statusMap[order.status] || statusMap.pending;
            const StatusIcon = config.icon;
            const code = order.order_code || order.code || "";

            return (
              <div key={order.id} className="rounded-[25px] bg-white/80 p-4 shadow-sm ring-1 ring-gray-100 backdrop-blur-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">{order.package_name || "Đơn đổi thưởng"}</p>
                    <p className="mt-1 text-[10px] text-gray-400">{formatDate(order.created_at)}</p>
                  </div>
                  <div className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black ${config.className}`}>
                    <StatusIcon size={12} />
                    {config.text}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-3">
                    <p className="text-[9px] text-gray-400">Chi phí</p>
                    <p className="mt-1 text-xs font-black text-orange-500">
                      {order.coin_cost ? formatCoins(order.coin_cost) + " xu" : formatVND(order.price_vnd)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-3">
                    <p className="text-[9px] text-gray-400">Mã đơn</p>
                    <button
                      type="button"
                      onClick={() => onCopy(code)}
                      className="mt-1 flex max-w-full items-center gap-1 text-xs font-black text-purple-500 hover:text-purple-600"
                    >
                      <span className="truncate">{code || "N/A"}</span>
                      <Copy size={12} className="shrink-0" />
                    </button>
                  </div>
                </div>

                {copied === code && (
                  <p className="mt-2 text-[10px] font-bold text-emerald-500">✓ Đã sao chép mã đơn</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ======================== BOTTOM NAVIGATION ========================
function BottomNavigation() {
  const items = [
    { icon: Home, label: "Trang chủ", path: "/" },
    { icon: CheckCircle2, label: "Nhiệm vụ", path: "/tasks" },
    { icon: Gift, label: "Cửa hàng", path: "/store", active: true },
    { icon: Wallet, label: "Ví", path: "/wallet" },
    { icon: User, label: "Tôi", path: "/profile" },
  ];

  const go = (path) => {
    if (window.location.pathname !== path) {
      window.location.href = path;
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3">
      <div className="mx-auto flex max-w-xl items-center justify-between rounded-[30px] border border-white/20 bg-white/80 px-2 py-2 shadow-[0_-10px_40px_rgba(120,80,200,0.12)] backdrop-blur-xl">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => go(item.path)}
              className={`relative flex min-w-[62px] flex-1 flex-col items-center justify-center gap-1 rounded-[23px] px-2 py-2 transition-all duration-300 ${
                item.active
                  ? "bg-gradient-to-r from-purple-500 via-pink-500 to-violet-500 text-white shadow-lg shadow-purple-200"
                  : "text-gray-500 hover:bg-purple-50 hover:text-purple-500"
              }`}
            >
              <Icon size={23} strokeWidth={item.active ? 2.5 : 2} />
              <span className="text-[9px] font-black sm:text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ======================== ADDITIONAL ICONS ========================
// Thêm các icon còn thiếu
const Target = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const Flame = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const Sword = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="8 10 14 4 20 10 14 16 8 10" />
    <line x1="14" y1="16" x2="14" y2="20" />
    <line x1="10" y1="20" x2="14" y2="20" />
    <line x1="10" y1="20" x2="8" y2="22" />
    <line x1="14" y1="20" x2="16" y2="22" />
  </svg>
);
