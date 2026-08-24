import React, { useState, useEffect } from "react";
import { Coins, Gift, Loader2, CheckCircle2, XCircle, Gamepad2, Flame, Swords, Sparkles, Zap, ShieldCheck, Trophy, ExternalLink, Search, Tag, Clock, Wallet, Info, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

export default function Store() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile } = useProfile();
  const [toast, setToast] = useState(null);
  const [shopTab, setShopTab] = useState("robux");
  const [version, setVersion] = useState("vng");
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState("username");
  const [deliveryInfo, setDeliveryInfo] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;
      const { data: pkgData } = await supabase.from("redemption_packages").select("*").eq("active", true).order("sort_order", { ascending: true });
      setPackages(pkgData ?? []);
      
      const { data: orderData } = await supabase.from("redemption_orders").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
      setHistory(orderData ?? []);
      setLoading(false);
    };
    fetchData();
  }, [session]);

  const filteredPackages = packages.filter(pkg => {
    const name = pkg.name.toLowerCase();
    if (shopTab === "quanHuy") return name.includes("quân huy") || name.includes("qh");
    if (shopTab === "robux") {
      if (version === "vng") return name.includes("vng") || name.includes("40") || name.includes("80");
      if (version === "quocTe") return name.includes("quốc tế") || name.includes("500") || name.includes("100");
    }
    return false;
  });

  const handleRedeem = async () => {
    if (!selectedPkg) {
      setToast({ message: "Vui lòng chọn gói trước!", type: "error" });
      return;
    }
    if (!deliveryInfo.trim()) {
      setToast({ message: "Vui lòng nhập thông tin nhận thưởng!", type: "error" });
      return;
    }

    setIsRedeeming(true);

    // GỌI RPC DUY NHẤT (Tạo đơn + Trừ coin) - KHÔNG LO LỖI RLS
    const { data, error } = await supabase.rpc("create_redeem_order", {
      p_user_id: session.user.id,
      p_package_name: selectedPkg.name,
      p_coin_cost: selectedPkg.coin_cost,
      p_delivery_method: deliveryMethod,
      p_delivery_target: deliveryInfo.trim()
    });

    setIsRedeeming(false);
    if (error) {
      setToast({ message: "Lỗi đặt hàng: " + error.message, type: "error" });
      return;
    }

    setSelectedPkg(null);
    setDeliveryInfo("");
    setDeliveryMethod("username");
    setToast({ message: "Đơn hàng đã được tạo thành công!", type: "success" });
    
    // Cập nhật lại lịch sử
    const { data: newOrders } = await supabase.from("redemption_orders").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
    setHistory(newOrders ?? []);
    window.location.reload();
  };

  const getStatus = (status) => {
    const config = {
      pending: { label: "Đang xử lý", color: "bg-amber-50 text-amber-600", icon: Clock },
      delivered: { label: "Đã giao", color: "bg-emerald-50 text-emerald-600", icon: CheckCircle2 },
      rejected: { label: "Từ chối", color: "bg-rose-50 text-rose-600", icon: XCircle },
    };
    return config[status] || config.pending;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      <main className="mx-auto max-w-md px-4 py-5">
        {/* HERO */}
        <div className="rounded-3xl border border-sky-100 bg-gradient-to-b from-sky-100 via-sky-50 to-white p-6 shadow-lg shadow-sky-100">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-700 shadow-sm">
            <Gift size={12} /> TRUNG TÂM ĐỔI THƯỞNG
          </span>
          <h1 className="font-display mt-3 text-3xl font-bold leading-tight text-slate-900">Đổi Coin lấy quà game cực dễ</h1>
          <p className="mt-2 text-sm text-slate-500">Robux Roblox · Kim Cương Free Fire · Quân Huy Liên Quân — admin xử lý nhanh, hoàn coin nếu lỗi.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-emerald-600 shadow-sm"><ShieldCheck size={12} /> Bảo hành / hoàn coin</span>
            <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-amber-600 shadow-sm"><Trophy size={12} /> Giá tốt nhất</span>
          </div>
          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-500"><Wallet size={24} /></span>
            <div>
              <p className="text-xs text-slate-400">Số dư của bạn</p>
              <p className="text-xl font-bold text-amber-500">{profile.coins} <span className="text-sm font-normal text-slate-400">Coin</span></p>
            </div>
          </div>
        </div>

        {/* TAB CHÍNH */}
        <div className="mt-6 rounded-full bg-slate-100 p-1">
          <div className="flex gap-2">
            <button onClick={() => { setShopTab("robux"); setSelectedPkg(null); setDeliveryMethod("username"); }} className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${shopTab === "robux" ? "bg-white text-sky-600 shadow-md" : "text-slate-500"}`}>🎮 Robux</button>
            <button onClick={() => { setShopTab("quanHuy"); setSelectedPkg(null); setDeliveryMethod("uid"); }} className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${shopTab === "quanHuy" ? "bg-white text-sky-600 shadow-md" : "text-slate-500"}`}>⚔️ Quân Huy</button>
          </div>
        </div>

        {/* TAB PHỤ ROBUX */}
        {shopTab === "robux" && (
          <div className="mt-3 rounded-full bg-slate-100 p-1">
            <div className="flex gap-2">
              <button onClick={() => { setVersion("vng"); setSelectedPkg(null); setDeliveryMethod("username"); }} className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${version === "vng" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg" : "text-slate-500"}`}>🇻🇳 VNG</button>
              <button onClick={() => { setVersion("quocTe"); setSelectedPkg(null); setDeliveryMethod(""); }} className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${version === "quocTe" ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg" : "text-slate-500"}`}>🌎 Quốc tế</button>
            </div>
          </div>
        )}

        {/* DANH SÁCH GÓI ROBUX */}
        {shopTab === "robux" && (
          <div className="mt-6">
            <h2 className="mb-3 text-lg font-bold text-slate-900">Chọn gói</h2>
            <div className="space-y-6">
              {loading ? (
                <p className="py-8 text-center text-sm text-slate-400">Đang tải...</p>
              ) : filteredPackages.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">Chưa có gói nào cho loại này.</div>
              ) : filteredPackages.map((pkg) => {
                const originalPrice = pkg.original_price_text ? parseInt(pkg.original_price_text.replace(/\D/g, "")) : 0;
                const discount = originalPrice > 0 ? Math.round((1 - (pkg.coin_cost / originalPrice)) * 100) : 0;
                
                return (
                  <div key={pkg.id} className="relative rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm transition hover:shadow-md">
                    {discount > 0 && (
                      <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-orange-400 to-red-500 px-2.5 py-1 text-xs font-bold text-white">
                        -{discount}%
                      </span>
                    )}
                    
                    <div className="mx-auto flex h-20 w-20 items-center justify-center">
                      {version === "quocTe" ? <Gamepad2 size={48} className="text-orange-500" /> : <Gamepad2 size={48} className="text-purple-500" />}
                    </div>
                    
                    <p className="mt-4 text-sm font-medium text-slate-500">{pkg.name}</p>
                    <div className="mt-2">
                      <p className="text-4xl font-bold text-slate-900">{pkg.coin_cost}</p>
                      <p className="text-xs text-slate-400">Coin</p>
                    </div>
                    
                    {originalPrice > 0 && (
                      <p className="mt-2 text-xs text-slate-400 line-through">{originalPrice.toLocaleString()}đ</p>
                    )}
                    
                    <button 
                      onClick={() => { 
                        setSelectedPkg(pkg); 
                        setDeliveryInfo(""); 
                        setDeliveryMethod(version === "vng" ? "username" : "");
                      }} 
                      className="mt-6 w-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/25"
                    >
                      Đổi ngay
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DANH SÁCH GÓI QUÂN HUY */}
        {shopTab === "quanHuy" && (
          <div className="mt-6">
            <h2 className="mb-3 text-lg font-bold text-slate-900">Chọn gói Quân Huy</h2>
            <div className="space-y-4">
              {loading ? (
                <p className="py-8 text-center text-sm text-slate-400">Đang tải...</p>
              ) : filteredPackages.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">Chưa có gói nào cho loại này.</div>
              ) : filteredPackages.map((pkg) => (
                <div key={pkg.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500"><Swords size={24} /></span>
                      <div>
                        <p className="font-bold text-slate-900">{pkg.name}</p>
                        <p className="text-xs text-slate-400">Nạp trực tiếp</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-500">{pkg.coin_cost} <span className="text-xs text-slate-400">Coin</span></p>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedPkg(pkg); setDeliveryInfo(""); setDeliveryMethod("uid"); }} className="mt-4 w-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/25">
                    Đổi ngay
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FORM ĐẶT HÀNG CHI TIẾT */}
        {selectedPkg && (
          <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Thông tin giao hàng</h2>
            <p className="mt-1 text-sm text-slate-500">Bạn đang chọn: <span className="font-bold text-slate-900">{selectedPkg.name}</span></p>

            <div className="mt-4 space-y-3">
              {shopTab === "robux" && version === "vng" && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tài khoản Roblox</p>
                  <input type="text" value={deliveryInfo} onChange={(e) => setDeliveryInfo(e.target.value)} placeholder="Username Roblox" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400" />
                  <p className="text-xs text-amber-600">⚠️ Chỉ nhập thông tin cần thiết. Không yêu cầu mật khẩu.</p>
                </>
              )}

              {shopTab === "robux" && version === "quocTe" && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phương thức nhận</p>
                  <div className="flex gap-2">
                    <button onClick={() => { setDeliveryMethod("discord"); setDeliveryInfo(""); }} className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold ${deliveryMethod === "discord" ? "bg-cyan-50 text-cyan-700 border border-cyan-200" : "bg-slate-50 text-slate-500"}`}>Discord</button>
                    <button onClick={() => { setDeliveryMethod("zalo"); setDeliveryInfo(""); }} className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold ${deliveryMethod === "zalo" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-slate-50 text-slate-500"}`}>Zalo</button>
                  </div>
                  {deliveryMethod === "discord" && <input type="text" value={deliveryInfo} onChange={(e) => setDeliveryInfo(e.target.value)} placeholder="@username..." className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400" />}
                  {deliveryMethod === "zalo" && <input type="text" value={deliveryInfo} onChange={(e) => setDeliveryInfo(e.target.value)} placeholder="Số điện thoại Zalo" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400" />}
                </>
              )}

              {shopTab === "quanHuy" && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">ID tài khoản Liên Quân</p>
                  <input type="text" value={deliveryInfo} onChange={(e) => setDeliveryInfo(e.target.value)} placeholder="UID + Server" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400" />
                  <p className="text-xs text-amber-600">⚠️ Chỉ nhập UID. Không yêu cầu mật khẩu.</p>
                </>
              )}
            </div>

            <button 
              onClick={handleRedeem} 
              disabled={isRedeeming} 
              className="mt-6 w-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-sky-500/25 disabled:opacity-50"
            >
              {isRedeeming ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Đặt đơn"}
            </button>
            <p className="mt-2 text-center text-xs text-slate-400">Số dư: {profile.coins} Coin</p>
          </div>
        )}

        {/* LỊCH SỬ ĐỔI THƯỞNG */}
        <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Lịch sử đổi thưởng</h2>
          <div className="space-y-3">
            {history.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Chưa có đơn hàng nào.</p>
            ) : history.map((order) => {
              const statusConfig = getStatus(order.status);
              const StatusIcon = statusConfig.icon;
              return (
                <div key={order.id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900">{order.package_name}</p>
                    <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.color}`}>
                      <StatusIcon size={12} /> {statusConfig.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Mã đơn: <span className="font-bold text-slate-600">#{String(order.id).slice(0, 8)}</span></p>
                  <p className="mt-1 text-xs text-slate-400">Ngày: {new Date(order.created_at).toLocaleString("vi-VN")}</p>
                  <p className="mt-1 text-xs text-slate-400">Phương thức: {order.delivery_method || "Nạp thẳng"}</p>
                  <p className="mt-1 text-xs text-slate-400">Thông tin nhận: {order.delivery_target || order.target_username || "—"}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold text-amber-500">-{order.coins_charged} Coin</span>
                  </div>
                  {order.status === "rejected" && order.admin_note && (
                    <div className="mt-2 rounded-lg bg-rose-50 p-3 text-xs">
                      <p className="font-semibold text-rose-600">Lý do từ chối:</p>
                      <p className="mt-1 text-rose-500">{order.admin_note}</p>
                    </div>
                  )}
                  {order.status === "rejected" && (
                    <p className="mt-2 rounded-lg bg-emerald-50 p-2 text-xs font-semibold text-emerald-600">+{order.coins_charged} Coin đã hoàn lại</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
      }
