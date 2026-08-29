import React, { useState, useEffect } from "react";
import { Coins, Gift, Loader2, CheckCircle2, XCircle, Gamepad2, Swords, Sparkles, Zap, ShieldCheck, Trophy, ExternalLink, Search, Tag, Clock, Wallet, Info, ArrowRight, ArrowLeft, Copy, Check } from "lucide-react";
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
  const [category, setCategory] = useState("robux");
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [step, setStep] = useState("category");
  
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

  const filteredPackages = packages.filter(pkg => {
    const name = pkg.name.toLowerCase();
    if (category === "quanhuy") {
      return name.includes("quân huy") || name.includes("qh");
    }
    return name.includes("robux") || name.includes("r$") || name.includes("40") || name.includes("80") || name.includes("100") || name.includes("500");
  });

  const handleRedeem = async () => {
    if (!session?.user?.id) {
      setToast({ message: "Vui lòng đăng nhập!", type: "error" });
      return;
    }

    if (!selectedPkg) {
      setToast({ message: "Vui lòng chọn gói!", type: "error" });
      return;
    }

    if (!deliveryMethod || !deliveryInfo.trim()) {
      setToast({ message: "Vui lòng nhập thông tin nhận thưởng!", type: "error" });
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

    if (error) {
      setToast({ message: "Lỗi: " + error.message, type: "error" });
      return;
    }

    if (!data?.success) {
      setToast({ message: data?.error || "Đổi thưởng thất bại!", type: "error" });
      return;
    }

    await setProfile((prev) => ({ ...prev, coins: data.coins_remaining }));

    try {
      await supabase.functions.invoke("telegram-webhook", {
        body: {
          message: {
            text: `🎁 Đơn hàng mới!\n📦 Gói: ${selectedPkg.name}\n👤 User: ${session.user.email}\n💰 Coin: ${selectedPkg.coin_cost}\n🆔 Mã đơn: ${data.order_code}`,
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
      message: `✅ Đơn hàng ${data.order_code} đã được tạo! Admin sẽ duyệt trong ít phút.`, 
      type: "success" 
    });
    
    setSelectedPkg(null);
    setDeliveryInfo("");
    setDeliveryMethod("");
    setStep("category");
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

  const copyOrderCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const formatNumber = (num) => {
    return num?.toLocaleString() || 0;
  };

  const renderCategory = () => (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={() => setCategory("robux")}
        className={`rounded-3xl p-6 text-center border-2 transition-all ${
          category === "robux" 
            ? "border-sky-400 bg-sky-50 shadow-md" 
            : "border-slate-200 bg-white hover:border-sky-200"
        }`}
      >
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
            <Gamepad2 size={32} className="text-white" />
          </div>
        </div>
        <h3 className="font-bold text-slate-900 text-lg">🪙 ROBUX</h3>
        <p className="text-sm text-slate-500">🎮 Roblox</p>
        <p className="text-xs text-sky-500 mt-2 font-medium">Xem phần quà →</p>
      </button>

      <button
        onClick={() => setCategory("quanhuy")}
        className={`rounded-3xl p-6 text-center border-2 transition-all ${
          category === "quanhuy" 
            ? "border-sky-400 bg-sky-50 shadow-md" 
            : "border-slate-200 bg-white hover:border-sky-200"
        }`}
      >
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Swords size={32} className="text-white" />
          </div>
        </div>
        <h3 className="font-bold text-slate-900 text-lg">⚔️ QUÂN HUY</h3>
        <p className="text-sm text-slate-500">🎮 Liên Quân</p>
        <p className="text-xs text-sky-500 mt-2 font-medium">Xem phần quà →</p>
      </button>
    </div>
  );

  const renderPackages = () => (
    <div>
      <button
        onClick={() => setStep("category")}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-sky-600 mb-4"
      >
        <ArrowLeft size={16} /> Quay lại
      </button>

      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900">
          {category === "robux" ? "🎮 ROBUX" : "⚔️ QUÂN HUY"}
        </h2>
        <p className="text-sm text-slate-500">Đổi Coin lấy phần thưởng</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filteredPackages.map((pkg) => {
          const price = pkg.coin_cost || 0;
          const name = pkg.name || "Gói thưởng";
          
          return (
            <div
              key={pkg.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
                  {category === "robux" ? (
                    <Gamepad2 size={24} className="text-sky-600" />
                  ) : (
                    <Swords size={24} className="text-orange-600" />
                  )}
                </div>
              </div>
              <p className="text-center font-bold text-slate-900 text-sm">{name}</p>
              <p className="text-center text-xs text-slate-400">
                <Coins size={12} className="inline mr-0.5 text-amber-500" />
                {formatNumber(price)} Coin
              </p>
              <button
                onClick={() => {
                  setSelectedPkg(pkg);
                  setStep("delivery");
                }}
                className="mt-3 w-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-2 text-xs font-semibold text-white shadow-md shadow-sky-500/25 transition hover:brightness-110"
              >
                Đổi ngay
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDelivery = () => {
    const isQuocTe = selectedPkg?.name?.toLowerCase().includes("quốc tế") || 
                      selectedPkg?.name?.toLowerCase().includes("quoc te");
    const isVNG = !isQuocTe;

    return (
      <div>
        <button
          onClick={() => setStep("package")}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-sky-600 mb-4"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">{selectedPkg?.name}</h2>
          <p className="text-sm text-slate-500">
            <Coins size={14} className="inline text-amber-500" /> {formatNumber(selectedPkg?.coin_cost)} Coin
          </p>
        </div>

        <div className="space-y-3">
          {isVNG && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">🇻🇳 ROBUX VNG</p>
                  <p className="text-xs text-slate-400">Nạp trực tiếp</p>
                </div>
                <button
                  onClick={() => {
                    setDeliveryMethod("vng");
                    setStep("delivery-detail");
                  }}
                  className="text-sky-500 hover:text-sky-600"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {isQuocTe && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">🌎 ROBUX QUỐC TẾ</p>
                  <p className="text-xs text-slate-400">Nhận code</p>
                </div>
                <button
                  onClick={() => {
                    setDeliveryMethod("quocte");
                    setStep("delivery-detail");
                  }}
                  className="text-sky-500 hover:text-sky-600"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDeliveryDetail = () => {
    const isVNG = deliveryMethod === "vng";
    const isQuocTe = deliveryMethod === "quocte";

    return (
      <div>
        <button
          onClick={() => setStep("delivery")}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-sky-600 mb-4"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">
            {isVNG ? "🇻🇳 ROBUX VNG" : "🌎 ROBUX QUỐC TẾ"}
          </h2>
          <p className="text-sm text-slate-500">{selectedPkg?.name}</p>
        </div>

        {isVNG && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-slate-700">Tài khoản Roblox</label>
              <input
                type="text"
                value={deliveryInfo}
                onChange={(e) => setDeliveryInfo(e.target.value)}
                placeholder="Nhập Username Roblox"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400"
              />
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
              ⚠️ Chỉ nhập Username. Không bao giờ nhập mật khẩu!
            </div>
          </div>
        )}

        {isQuocTe && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">Nhận code qua</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeliveryMethod("discord")}
                className={`rounded-xl border p-3 text-center transition ${
                  deliveryMethod === "discord" 
                    ? "border-sky-400 bg-sky-50" 
                    : "border-slate-200 bg-white"
                }`}
              >
                <span className="text-2xl">🔵</span>
                <p className="text-xs font-medium mt-1">Discord</p>
              </button>
              <button
                onClick={() => setDeliveryMethod("zalo")}
                className={`rounded-xl border p-3 text-center transition ${
                  deliveryMethod === "zalo" 
                    ? "border-sky-400 bg-sky-50" 
                    : "border-slate-200 bg-white"
                }`}
              >
                <span className="text-2xl">💚</span>
                <p className="text-xs font-medium mt-1">Zalo</p>
              </button>
            </div>

            {(deliveryMethod === "discord" || deliveryMethod === "zalo") && (
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  {deliveryMethod === "discord" ? "@username" : "Số điện thoại Zalo"}
                </label>
                <input
                  type="text"
                  value={deliveryInfo}
                  onChange={(e) => setDeliveryInfo(e.target.value)}
                  placeholder={deliveryMethod === "discord" ? "@username..." : "Số điện thoại Zalo"}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400"
                />
              </div>
            )}
          </div>
        )}

        {(deliveryInfo.trim() && (isVNG || deliveryMethod === "discord" || deliveryMethod === "zalo")) && (
          <button
            onClick={handleRedeem}
            disabled={isRedeeming}
            className="mt-6 w-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-sky-500/25 transition hover:brightness-110 disabled:opacity-50"
          >
            {isRedeeming ? (
              <Loader2 size={20} className="animate-spin mx-auto" />
            ) : (
              "✅ Xác nhận đổi"
            )}
          </button>
        )}
      </div>
    );
  };
    const renderHistory = () => (
    <div className="mt-8 pt-4 border-t border-slate-200">
      <h3 className="text-lg font-bold text-slate-900">🧾 Lịch sử đổi thưởng</h3>
      <p className="text-xs text-slate-400 mb-4">Theo dõi các đơn hàng của bạn</p>

      <div className="space-y-3">
        {history.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-slate-400">Chưa có đơn hàng nào.</p>
          </div>
        ) : (
          history.map((order) => {
            const status = getStatusConfig(order.status);
            const StatusIcon = status.icon;
            const isRejected = order.status === "rejected";

            return (
              <div key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{order.package_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400 font-mono">
                        {order.order_code || String(order.id).slice(0, 8)}
                      </span>
                      <button
                        onClick={() => copyOrderCode(order.order_code || String(order.id).slice(0, 8))}
                        className="text-slate-400 hover:text-sky-600 transition"
                      >
                        {copySuccess ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${status.color}`}>
                    <StatusIcon size={12} /> {status.label}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div>
                    <p className="font-medium text-slate-400">Đặt hàng</p>
                    <p>{new Date(order.created_at).toLocaleString("vi-VN")}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-400">Giao hàng</p>
                    <p>
                      {order.delivered_at 
                        ? new Date(order.delivered_at).toLocaleString("vi-VN")
                        : "Chưa giao"}
                    </p>
                  </div>
                </div>

                {isRejected && order.admin_note && (
                  <div className="mt-3 rounded-xl bg-rose-50 p-3">
                    <p className="text-xs font-semibold text-rose-600">Lý do từ chối:</p>
                    <p className="text-xs text-rose-700">{order.admin_note}</p>
                    <p className="mt-1 text-xs font-medium text-emerald-600">
                      🪙 {formatNumber(order.coins_charged)} Coin đã được hoàn lại
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      <main className="mx-auto max-w-md px-4 py-5">
        {/* Header */}
        <div className="rounded-3xl border border-sky-100 bg-gradient-to-b from-sky-100 via-sky-50 to-white p-6 shadow-lg shadow-sky-100">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-700 shadow-sm">
            <Gift size={12} /> CỬA HÀNG
          </span>
          <h1 className="font-display mt-3 text-3xl font-bold leading-tight text-slate-900">🛍️ Đổi Coin lấy phần thưởng</h1>
          <p className="mt-2 text-sm text-slate-500">✨ Nhanh chóng • An toàn • Uy tín</p>

          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-500">
              <Wallet size={20} />
            </span>
            <div>
              <p className="text-xs text-slate-400">Số dư của bạn</p>
              <p className="text-xl font-bold text-amber-500">
                {formatNumber(profile.coins)} <span className="text-sm font-normal text-slate-400">Coin</span>
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400 text-center">
            💡 Coin sẽ được trừ khi đơn đổi thưởng được tạo.
          </p>
        </div>

        {toast && (
          <div className={`mt-4 rounded-2xl p-4 ${
            toast.type === 'success' 
              ? 'bg-emerald-50 border border-emerald-200' 
              : 'bg-rose-50 border border-rose-200'
          }`}>
            <p className={`text-sm ${
              toast.type === 'success' ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              {toast.message}
            </p>
          </div>
        )}

        {/* Bạn muốn đổi gì? */}
        {step === "category" && (
          <>
            <p className="text-center text-sm font-medium text-slate-700 mt-6 mb-3">
              Bạn muốn đổi gì?
            </p>
            {renderCategory()}
          </>
        )}

        {/* Package list */}
        {step === "package" && (
          <div className="mt-6">
            {renderPackages()}
          </div>
        )}

        {/* Delivery method */}
        {step === "delivery" && (
          <div className="mt-6">
            {renderDelivery()}
          </div>
        )}

        {/* Delivery detail */}
        {step === "delivery-detail" && (
          <div className="mt-6">
            {renderDeliveryDetail()}
          </div>
        )}

        {/* Lịch sử */}
        {renderHistory()}
      </main>
      <BottomNav />
    </div>
  );
      }
