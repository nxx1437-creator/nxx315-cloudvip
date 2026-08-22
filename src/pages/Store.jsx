import React, { useState, useEffect } from "react";
import { Coins, Gift, Loader2, CheckCircle2, Gamepad2, Flame, Swords, Sparkles, Zap, ShieldCheck, Trophy, ExternalLink, Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import useStoreData from "../hooks/useStoreData.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

// Các category chính
const CATEGORIES = [
  { key: "roblox", label: "Robux Roblox", desc: "Nhận qua Gamepass", icon: Gamepad2, color: "from-purple-500 to-pink-500", iconBg: "bg-purple-500/20" },
  { key: "freefire", label: "Kim cương Free Fire", desc: "Nạp thẳng vào UID", icon: Flame, color: "from-red-500 to-orange-500", iconBg: "bg-red-500/20" },
  { key: "lienquan", label: "Quân Huy Liên Quân", desc: "Nạp thẳng vào ID", icon: Swords, color: "from-amber-400 to-yellow-500", iconBg: "bg-amber-500/20" },
];

export default function Store() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile } = useProfile();
  const { packages } = useStoreData();
  const [toast, setToast] = useState(null);
  const [activeCategory, setActiveCategory] = useState("roblox");
  
  const [username, setUsername] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [redeemMethod, setRedeemMethod] = useState("discord");
  const [contact, setContact] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!session?.user?.id) return;
      const { data } = await supabase.from("redemption_orders").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
      setHistory(data ?? []);
    };
    fetchHistory();
  }, [session]);

  const filteredPackages = packages.filter(pkg => {
    const name = pkg.name.toLowerCase();
    if (activeCategory === "roblox") return name.includes("robux");
    if (activeCategory === "freefire") return name.includes("kim cương") || name.includes("free fire");
    if (activeCategory === "lienquan") return name.includes("quân huy") || name.includes("liên quân");
    return true;
  });

  const handleSearch = async () => {
    if (!username.trim()) {
      setToast({ message: "Vui lòng nhập Username!", type: "error" });
      return;
    }
    setIsSearching(true);
    
    try {
      const userRes = await fetch("https://users.roblox.com/v1/usernames/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames: [username.trim()] }),
      });
      const userData = await userRes.json();
      
      if (!userData.data || userData.data.length === 0) {
        setToast({ message: "Không tìm thấy tài khoản!", type: "error" });
        setIsSearching(false);
        return;
      }

      const user = userData.data[0];
      const avatarRes = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-bust?userIds=${user.id}&size=150x150&format=Png`);
      const avatarData = await avatarRes.json();

      setSearchResult({
        name: user.displayName || user.name,
        avatar: avatarData.data?.[0]?.imageUrl || "",
        id: String(user.id)
      });
    } catch (error) {
      setToast({ message: "Lỗi tra cứu!", type: "error" });
    }
    
    setIsSearching(false);
  };

  const handleRedeem = async () => {
    if (!selectedPkg) {
      setToast({ message: "Vui lòng chọn gói trước!", type: "error" });
      return;
    }
    if (!username.trim()) {
      setToast({ message: "Vui lòng nhập Username/ID!", type: "error" });
      return;
    }
    if (!contact.trim()) {
      setToast({ message: "Vui lòng nhập thông tin liên hệ!", type: "error" });
      return;
    }
    
    setIsRedeeming(true);
    const { error } = await supabase.from("redemption_orders").insert({
      user_id: session.user.id,
      package_name: selectedPkg.name,
      coins_charged: selectedPkg.coin_cost,
      receive_method: redeemMethod,
      contact_value: contact,
      target_username: username.trim(),
      target_uid: searchResult?.id || username.trim(),
      status: "processing"
    });

    setIsRedeeming(false);
    if (error) {
      setToast({ message: "Lỗi tạo đơn: " + error.message, type: "error" });
      return;
    }

    setSelectedPkg(null);
    setContact("");
    setUsername("");
    setSearchResult(null);
    setToast({ message: "Đã tạo đơn đổi thưởng thành công!", type: "success" });
    const { data: newOrders } = await supabase.from("redemption_orders").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
    setHistory(newOrders ?? []);
  };

  const getStatus = (status) => {
    const config = {
      processing: { label: "Đang xử lý", color: "bg-amber-50 text-amber-600" },
      sent: { label: "Đã gửi", color: "bg-blue-50 text-blue-600" },
      completed: { label: "Đã giao", color: "bg-emerald-50 text-emerald-600" },
      failed: { label: "Thất bại", color: "bg-rose-50 text-rose-500" },
    };
    return config[status] || config.processing;
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
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sky-600 shadow-sm"><Gift size={16} /></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-600">TRUNG TÂM ĐỔI THƯỞNG</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Đổi Coin lấy quà game cực dễ</h1>
          <p className="mt-2 text-sm text-slate-500">Robux Roblox · Kim Cương Free Fire · Quân Huy Liên Quân — admin xử lý nhanh, hoàn coin nếu lỗi.</p>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-sky-600 shadow-sm"><Zap size={12} /> Giao trong vài phút</span>
            <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-emerald-600 shadow-sm"><ShieldCheck size={12} /> Bảo hành / hoàn coin</span>
            <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-amber-600 shadow-sm"><Trophy size={12} /> Giá tốt nhất</span>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-500"><Coins size={24} /></span>
            <div>
              <p className="text-xs text-slate-400">Số dư của bạn</p>
              <p className="text-xl font-bold text-amber-500">{profile.coins} <span className="text-sm font-normal text-slate-400">Coin</span></p>
            </div>
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="space-y-3 mb-6 mt-6">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            const Icon = cat.icon;
            return (
              <button
                key={cat.key}
                onClick={() => { setActiveCategory(cat.key); setSearchResult(null); setUsername(""); }}
                className={`flex w-full items-center justify-between rounded-2xl p-4 text-left transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                    : "bg-white text-slate-700 shadow-sm hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${isActive ? "bg-white/20" : cat.iconBg}`}>
                    <Icon size={24} />
                  </span>
                  <div>
                    <p className="font-bold">{cat.label}</p>
                    <p className={`text-xs ${isActive ? "text-white/80" : "text-slate-400"}`}>{cat.desc}</p>
                  </div>
                </div>
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"}`}>
                  {isActive ? <CheckCircle2 size={18} /> : <ExternalLink size={16} />}
                </span>
              </button>
            );
          })}
        </div>

        {/* LƯU Ý */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-500"><Sparkles size={20} /></span>
            <div>
              <p className="text-sm font-bold text-amber-700">Lưu ý quan trọng trước khi đặt đơn</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-600">Vui lòng xem video hướng dẫn ở phía dưới để tạo Gamepass đúng cách. Đặt sai giá / sai cài đặt sẽ bị hủy đơn và không được hoàn coin nhanh.</p>
            </div>
          </div>
        </div>

        {/* PACKAGES */}
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-bold text-slate-900">Chọn gói {activeCategory === "roblox" ? "Robux" : activeCategory === "freefire" ? "Kim Cương Free Fire" : "Quân Huy Liên Quân"}</h2>
          
          <div className="space-y-4">
            {filteredPackages.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm"><p className="text-sm text-slate-400">Chưa có gói nào.</p></div>
            ) : filteredPackages.map((pkg) => {
              const discount = pkg.original_price_text ? Math.round((1 - (pkg.coin_cost / parseFloat(pkg.original_price_text.replace(/\D/g, '')))) * 100) : 0;
              const isSelected = selectedPkg?.id === pkg.id;
              
              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPkg(pkg)}
                  className={`p-5 rounded-2xl relative cursor-pointer transition-all ${
                    isSelected ? "border-2 border-sky-400 bg-sky-50 shadow-lg" : "border border-white bg-white shadow-sm hover:shadow-md"
                  }`}
                >
                  {discount > 0 && <span className="absolute right-3 top-3 rounded-full bg-rose-500 px-2 py-1 text-[10px] font-bold text-white">-{discount}%</span>}
                  <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50">
                      <Coins size={32} className="text-blue-400" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-slate-500">{pkg.name}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{pkg.coin_cost}</p>
                    <p className="text-xs text-slate-400">Coin</p>
                    {pkg.original_price_text && <p className="mt-1 text-xs text-slate-400 line-through">{pkg.original_price_text}</p>}
                  </div>
                  {isSelected && <CheckCircle2 size={24} className="absolute left-3 top-3 text-sky-500" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ĐẶT HÀNG */}
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-bold text-slate-900">Đặt đơn {activeCategory === "roblox" ? "Robux" : activeCategory === "freefire" ? "KC" : "QH"}</h2>
          
          <div className="rounded-2xl border border-white bg-white p-5 shadow-sm mb-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">
              {activeCategory === "roblox" ? "Username Roblox" : activeCategory === "freefire" ? "ID Free Fire (UID)" : "ID Liên Quân Mobile"}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={activeCategory === "roblox" ? "VD: PlayerName123" : activeCategory === "freefire" ? "VD: 123456789" : "VD: 87654321"}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400"
              />
              {/* Nút tra cứu nhỏ (kính lúp) */}
              <button onClick={handleSearch} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white">
                {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              </button>
            </div>

            {searchResult && (
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-emerald-50 p-3">
                <img src={searchResult.avatar} alt="avatar" className="h-12 w-12 rounded-full" />
                <div>
                  <p className="text-sm font-bold text-emerald-700">{searchResult.name}</p>
                  <p className="text-xs text-emerald-600">ID: {searchResult.id}</p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white bg-white p-5 shadow-sm mb-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Phương thức nhận</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setRedeemMethod("discord")} className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${redeemMethod === "discord" ? "bg-cyan-50 text-cyan-600" : "bg-slate-50 text-slate-400"}`}>Discord</button>
              <button onClick={() => setRedeemMethod("zalo")} className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${redeemMethod === "zalo" ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400"}`}>Zalo</button>
            </div>
            <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} placeholder={`Nhập ${redeemMethod === "discord" ? "Discord" : "Zalo"} của bạn...`} className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400" />
          </div>

          {/* Đã chọn */}
          {selectedPkg && (
            <div className="mb-4 rounded-2xl bg-sky-50 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">Đã chọn</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{selectedPkg.name}</p>
              <p className="mt-1 text-lg font-bold text-amber-500">{selectedPkg.coin_cost} Coin {selectedPkg.original_price_text && <span className="ml-2 text-xs font-normal text-slate-400 line-through">{selectedPkg.original_price_text}</span>}</p>
            </div>
          )}

          <button onClick={handleRedeem} disabled={isRedeeming || !selectedPkg} className="w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-sky-500/25 disabled:opacity-50">
            {isRedeeming ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Đặt đơn"}
          </button>
          <p className="mt-2 text-center text-xs text-slate-400">Số dư: {profile.coins} Coin</p>
        </div>

        {/* HISTORY */}
        <div>
          <h2 className="mb-3 text-lg font-bold text-slate-900">Lịch sử đơn hàng</h2>
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm"><p className="text-sm text-slate-400">Chưa có đơn hàng nào.</p></div>
            ) : history.map((order) => {
              const statusConfig = getStatus(order.status);
              return (
                <div key={order.id} className="rounded-2xl border border-white bg-white p-4 shadow-sm">
                  <p className="font-bold text-slate-900">{order.package_name}</p>
                  <p className="mt-1 text-xs text-slate-400">User: {order.roblox_username || "—"} • {new Date(order.created_at).toLocaleString("vi-VN")}</p>
                  <p className="mt-1 text-xs text-slate-400">Gamepass <ExternalLink size={12} className="inline" /></p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.color}`}>{statusConfig.label}</span>
                    <span className="font-bold text-amber-500">-{order.coins_charged} Coin</span>
                  </div>
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
