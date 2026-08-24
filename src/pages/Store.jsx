import React, { useState, useEffect } from "react";
import { Coins, Gift, Loader2, CheckCircle2, XCircle, Gamepad2, Flame, Swords, Sparkles, Zap, ShieldCheck, Trophy, ExternalLink, Search, Tag, Clock } from "lucide-react";
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
  const [deliveryMethod, setDeliveryMethod] = useState("");
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
    const { error } = await supabase.from("redemption_orders").insert({
      user_id: session.user.id,
      package_name: selectedPkg.name,
      coins_charged: selectedPkg.coin_cost,
      delivery_method: deliveryMethod,
      delivery_target: deliveryInfo.trim(),
      status: "pending"
    });

    setIsRedeeming(false);
    if (error) {
      setToast({ message: "Lỗi tạo đơn: " + error.message, type: "error" });
      return;
    }

    setSelectedPkg(null);
    setDeliveryInfo("");
    setDeliveryMethod("");
    setToast({ message: "Đã tạo đơn thành công! Chờ admin xử lý.", type: "success" });
    const { data: newOrders } = await supabase.from("redemption_orders").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
    setHistory(newOrders ?? []);
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

      {/* HERO GIỚI THIỆU CỬA HÀNG */}
      <div className="bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 pb-20 text-white">
        <div className="mx-auto max-w-md px-4 pt-8 pb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            <Gift size={12} /> TRUNG TÂM ĐỔI THƯỞNG
          </span>
          <h1 className="font-display mt-4 text-3xl font-bold leading-tight">Cửa hàng</h1>
          <p className="mt-2 text-sm text-white/80">Đổi Coin lấy phần thưởng. Nhanh chóng • Minh bạch • Theo dõi đơn hàng</p>
        </div>
      </div>

      <main className="mx-auto max-w-md px-4">
        {/* SỐ DƯ COIN */}
        <div className="-mt-10 rounded-3xl bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">💰 Số dư của bạn</span>
            <Coins size={20} className="text-amber-400" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-display text-4xl font-bold text-slate-900">{profile.coins}</span>
            <span className="text-lg font-medium text-slate-400">Coin</span>
          </div>
        </div>

        {/* TAB CHÍNH */}
        <div className="mt-6 rounded-full bg-slate-100 p-1">
          <div className="flex gap-2">
            <button onClick={() => { setShopTab("robux"); setSelectedPkg(null); }} className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${shopTab === "robux" ? "bg-white text-sky-600 shadow-md" : "text-slate-500"}`}>🎮 Robux</button>
            <button onClick={() => { setShopTab("quanHuy"); setSelectedPkg(null); }} className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${shopTab === "quanHuy" ? "bg-white text-sky-600 shadow-md" : "text-slate-500"}`}>⚔️ Quân Huy</button>
          </div>
        </div>

        {/* TAB PHỤ ROBUX */}
        {shopTab === "robux" && (
          <div className="mt-3 rounded-full bg-slate-100 p-1">
            <div className="flex gap-2">
              <button onClick={() => { setVersion("vng"); setSelectedPkg(null); }} className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${version === "vng" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg" : "text-slate-500"}`}>🇻🇳 VNG</button>
              <button onClick={() => { setVersion("quocTe"); setSelectedPkg(null); }} className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${version === "quocTe" ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg" : "text-slate-500"}`}>🌎 Quốc tế</button>
            </div>
          </div>
        )}

        {/* DANH SÁCH GÓI */}
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-bold text-slate-900">Chọn gói</h2>
          <div className="space-y-4">
            {loading ? (
              <p className="py-8 text-center text-sm text-slate-400">Đang tải...</p>
            ) : filteredPackages.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">Chưa có gói nào cho loại này.</div>
            ) : filteredPackages.map((pkg) => (
              <div key={pkg.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
                      {shopTab === "robux" ? <Gamepad2 size={20} /> : <Swords size={20} />}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">{pkg.name}</p>
                      <p className="text-xs text-slate-400">{pkg.version === "vng" ? "Nạp trực tiếp" : pkg.version === "quocTe" ? "Nhận mã" : "Nạp trực tiếp"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-500">{pkg.coin_cost} <span className="text-xs text-slate-400">Coin</span></p>
                  </div>
                </div>
                <button onClick={() => setSelectedPkg(pkg)} className="mt-4 w-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/25">
                  Đổi ngay
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* MODAL XÁC NHẬN ĐỔI */}
        {selectedPkg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <h2 className="text-lg font-bold text-slate-900">{selectedPkg.name}</h2>
              <p className="mt-2 text-sm text-slate-500">Số coin cần: <span className="font-bold text-amber-500">{selectedPkg.coin_cost}</span></p>
              
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

              <div className="mt-6 flex gap-3">
                <button onClick={() => setSelectedPkg(null)} className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-600">Hủy</button>
                <button onClick={handleRedeem} disabled={isRedeeming} className="flex-1 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-50">
                  {isRedeeming ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Xác nhận đổi"}
                </button>
              </div>
            </div>
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
