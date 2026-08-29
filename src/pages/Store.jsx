import React, { useState, useEffect } from "react";
import { 
  Coins, Gift, Loader2, CheckCircle2, XCircle, 
  Gamepad2, Swords, Clock, Wallet, ArrowLeft, 
  Copy, Check, ChevronRight 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

const ADMIN_CHAT_ID = 8637128924;

export default function Store() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile, setProfile } = useProfile();
  const [toast, setToast] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  
  const [view, setView] = useState("home");
  const [category, setCategory] = useState("robux");
  const [version, setVersion] = useState("vng");
  const [selectedPkg, setSelectedPkg] = useState(null);
  
  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }
      
      const { data: pkgData } = await supabase
        .from("redemption_packages")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      setPackages(pkgData ?? []);
      
      const { data: orderData } = await supabase
        .from("redemption_orders")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      setHistory(orderData ?? []);
      setLoading(false);
    };
    fetchData();
  }, [session]);

  const filteredPackages = packages.filter((pkg) => {
    const name = String(pkg.name || "").toLowerCase().trim();

    if (category === "quanhuy") {
      if (pkg.reward_type) return pkg.reward_type === "quan_huy";
      return name.includes("quân huy") || name.includes("qh") || name.includes("liên quân");
    }

    if (category === "robux") {
      if (pkg.reward_type) {
        if (pkg.reward_type !== "robux") return false;
        if (pkg.version) return pkg.version === version;
        return true;
      }

      const isRobux = name.includes("robux") || name.includes("r$") || name.includes("rb");
      if (!isRobux) return false;

      if (version === "vng") {
        return name.includes("vng") || name.includes("40") || name.includes("80");
      }
      return name.includes("quốc tế") || name.includes("quoc te") || name.includes("100") || name.includes("500");
    }

    return false;
  });

  const handleRedeem = async () => {
    if (!session?.user?.id) {
      setToast({ message: "Vui lòng đăng nhập!", type: "error" });
      return;
    }

    if (!selectedPkg || !deliveryMethod || !deliveryInfo.trim()) {
      setToast({ message: "Vui lòng nhập đầy đủ thông tin!", type: "error" });
      return;
    }

    setIsRedeeming(true);

    const { data, error } = await supabase.rpc("create_redemption_order", {
      p_user_id: session.user.id,
      p_package_id: selectedPkg.id,
      p_delivery_method: deliveryMethod,
      p_delivery_target: deliveryInfo.trim()
    });

    setIsRedeeming(false);

    if (error || !data?.success) {
      setToast({ message: error?.message || data?.error || "Đổi thưởng thất bại!", type: "error" });
      return;
    }

    await setProfile((prev) => ({ ...prev, coins: data.coins_remaining }));

    try {
      await supabase.functions.invoke("telegram-webhook", {
        body: {
          message: {
            text: `🎁 Đơn hàng mới!\n📦 ${selectedPkg.name}\n👤 ${session.user.email}\n💰 ${selectedPkg.coin_cost} Coin\n🆔 ${data.order_code}`,
            chat: { id: ADMIN_CHAT_ID }
          }
        }
      });
    } catch (teleError) {
      console.error("Lỗi gửi Telegram:", teleError);
    }

    const { data: newOrders } = await supabase
      .from("redemption_orders")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    setHistory(newOrders ?? []);

    setToast({ 
      message: `✅ Đơn ${data.order_code} đã tạo! Admin sẽ duyệt sớm.`, 
      type: "success" 
    });
    
    setSelectedPkg(null);
    setDeliveryInfo("");
    setDeliveryMethod("");
    setView("home");
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { label: "Đang xử lý", color: "bg-amber-50 text-amber-600", icon: Clock },
      delivered: { label: "Đã giao", color: "bg-emerald-50 text-emerald-600", icon: CheckCircle2 },
      rejected: { label: "Đã từ chối", color: "bg-rose-50 text-rose-600", icon: XCircle },
      cancelled: { label: "Đã hủy", color: "bg-slate-50 text-slate-500", icon: XCircle },
    };
    return configs[status] || configs.pending;
  };

  const formatNumber = (num) => num?.toLocaleString() || 0;

  const renderHome = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Cửa hàng</h1>
          <p className="text-sm text-slate-500">Đổi Coin lấy phần thưởng</p>
        </div>
        <Gift size={24} className="text-sky-500" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <Coins size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Số dư</p>
              <p className="text-lg font-bold text-slate-900">{formatNumber(profile.coins)} Coin</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-300" />
        </div>
      </div>

      <p className="text-sm font-medium text-slate-700 mb-3">Bạn muốn đổi gì?</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => { setCategory("robux"); setVersion("vng"); setView("catalog"); }}
          className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex justify-center mb-2">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
              <Gamepad2 size={24} className="text-white" />
            </div>
          </div>
          <p className="font-bold text-slate-900">Robux</p>
          <p className="text-xs text-slate-400 mt-0.5">Xem gói →</p>
        </button>

        <button
          onClick={() => { setCategory("quanhuy"); setView("catalog"); }}
          className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex justify-center mb-2">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
              <Swords size={24} className="text-white" />
            </div>
          </div>
          <p className="font-bold text-slate-900">Quân Huy</p>
          <p className="text-xs text-slate-400 mt-0.5">Xem gói →</p>
        </button>
      </div>

      {renderHistory()}
    </>
  );

  const renderHistory = () => (
    <div className="mt-8 pt-4 border-t border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900">🧾 Lịch sử</h3>
        <span className="text-xs text-slate-400">{history.length} đơn</span>
      </div>
      <div className="space-y-2">
        {history.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">Chưa có đơn hàng</p>
        ) : (
          history.slice(0, 5).map((order) => {
            const status = getStatusConfig(order.status);
            const StatusIcon = status.icon;
            return (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-900">{order.package_name}</p>
                  <p className="text-xs text-slate-400 font-mono">
                    {order.order_code || String(order.id).slice(0, 8)}
                  </p>
                </div>
                <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
                  <StatusIcon size={10} /> {status.label}
                </span>
              </div>
            );
          })
        )}
      </div>
      {history.length > 5 && (
        <p className="text-xs text-sky-500 text-center mt-2">+{history.length - 5} đơn khác</p>
      )}
    </div>
  );
    const renderCatalog = () => (
    <div>
      <button
        onClick={() => { setView("home"); setSelectedPkg(null); }}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-sky-600 mb-4"
      >
        <ArrowLeft size={16} /> Quay lại
      </button>

      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900">
          {category === "robux" ? "Robux" : "Quân Huy"}
        </h2>
        <p className="text-sm text-slate-500">Chọn gói bạn muốn đổi</p>
      </div>

      {category === "robux" && (
        <div className="mb-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => setVersion("vng")}
            className={`rounded-2xl border p-3 transition ${
              version === "vng"
                ? "border-sky-400 bg-sky-50 text-sky-600"
                : "border-slate-200 bg-white text-slate-500"
            }`}
          >
            🇻🇳
            <p className="mt-1 text-sm font-bold">VNG</p>
            <p className="text-[10px] text-slate-400">Nạp trực tiếp</p>
          </button>

          <button
            onClick={() => setVersion("quoc_te")}
            className={`rounded-2xl border p-3 transition ${
              version === "quoc_te"
                ? "border-orange-400 bg-orange-50 text-orange-600"
                : "border-slate-200 bg-white text-slate-500"
            }`}
          >
            🌎
            <p className="mt-1 text-sm font-bold">Quốc tế</p>
            <p className="text-[10px] text-slate-400">Nhận mã</p>
          </button>
        </div>
      )}

      {filteredPackages.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-400">Không có gói nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              category={category}
              onClick={() => {
                setSelectedPkg(pkg);
                setView("delivery");
              }}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderDelivery = () => (
    <div>
      <button
        onClick={() => { setView("catalog"); setSelectedPkg(null); }}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-sky-600 mb-4"
      >
        <ArrowLeft size={16} /> Quay lại
      </button>

      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">{selectedPkg?.name}</h3>
        <p className="text-sm text-slate-500">
          <Coins size={14} className="inline text-amber-500" /> {formatNumber(selectedPkg?.coin_cost)} Coin
        </p>
      </div>

      {version === "vng" && (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Tài khoản Roblox</label>
            <input
              type="text"
              value={deliveryInfo}
              onChange={(e) => setDeliveryInfo(e.target.value)}
              placeholder="Nhập Username"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
            />
          </div>
          <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
            ⚠️ Chỉ nhập Username. Không yêu cầu mật khẩu.
          </div>
        </div>
      )}

      {version === "quoc_te" && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">Nhận code qua</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDeliveryMethod("discord")}
              className={`rounded-xl border p-3 text-center transition ${
                deliveryMethod === "discord" ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-white"
              }`}
            >
              <span className="text-xl">🔵</span>
              <p className="text-xs font-medium mt-1">Discord</p>
            </button>
            <button
              onClick={() => setDeliveryMethod("zalo")}
              className={`rounded-xl border p-3 text-center transition ${
                deliveryMethod === "zalo" ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-white"
              }`}
            >
              <span className="text-xl">💚</span>
              <p className="text-xs font-medium mt-1">Zalo</p>
            </button>
          </div>

          {(deliveryMethod === "discord" || deliveryMethod === "zalo") && (
            <div>
              <label className="text-sm font-medium text-slate-700">
                {deliveryMethod === "discord" ? "Discord Username" : "Số điện thoại Zalo"}
              </label>
              <input
                type="text"
                value={deliveryInfo}
                onChange={(e) => setDeliveryInfo(e.target.value)}
                placeholder={deliveryMethod === "discord" ? "@username" : "Số điện thoại"}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
              />
            </div>
          )}
        </div>
      )}

      {(deliveryInfo.trim() && (version === "vng" || deliveryMethod === "discord" || deliveryMethod === "zalo")) && (
        <button
          onClick={handleRedeem}
          disabled={isRedeeming}
          className="mt-6 w-full rounded-full bg-sky-500 py-3.5 text-sm font-semibold text-white shadow-md shadow-sky-500/25 transition hover:brightness-110 disabled:opacity-50"
        >
          {isRedeeming ? <Loader2 size={20} className="animate-spin mx-auto" /> : "Xác nhận đổi"}
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5FAFF] pb-24 font-[Be_Vietnam_Pro]">
      <div className="mx-auto max-w-md px-4 py-5">
        {toast && (
          <div className={`mb-4 rounded-2xl p-4 ${
            toast.type === 'success' ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'
          }`}>
            <p className={`text-sm ${toast.type === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
              {toast.message}
            </p>
          </div>
        )}

        {view === "home" && renderHome()}
        {view === "catalog" && renderCatalog()}
        {view === "delivery" && renderDelivery()}
      </div>
      <BottomNav />
    </div>
  );
}

function PackageCard({ pkg, category, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex justify-center mb-2">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-2xl">
          {category === "robux" ? "🪙" : "⚔️"}
        </div>
      </div>
      <p className="text-sm font-bold text-slate-900">{pkg.name}</p>
      <p className="text-xs text-slate-400 mt-0.5">
        <Coins size={10} className="inline text-amber-500" /> {pkg.coin_cost?.toLocaleString()} Coin
      </p>
      <span className="inline-block mt-2 text-xs text-sky-500 font-medium">Đổi ngay</span>
    </button>
  );
          }
