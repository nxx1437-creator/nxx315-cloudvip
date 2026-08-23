import React, { useState, useEffect } from "react";
import { Coins, Gift, Loader2, CheckCircle2, Gamepad2, Flame, Swords, Sparkles, Zap, ShieldCheck, Trophy, ExternalLink, Search, User, ArrowRightLeft, Ban, XCircle, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { useStoreData } from "../hooks/useStoreData.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

export default function Store() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile } = useProfile();
  const { packages } = useStoreData();
  const [toast, setToast] = useState(null);
  const [version, setVersion] = useState("vng");
  
  const [username, setUsername] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [redeemMethod, setRedeemMethod] = useState("");
  const [discordName, setDiscordName] = useState("");
  const [zaloPhone, setZaloPhone] = useState("");
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
    if (version === "vng") return name.includes("40") || name.includes("80");
    if (version === "quoc_te") return name.includes("100");
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
      setToast({ message: "Vui lòng nhập Username!", type: "error" });
      return;
    }
    
    if (version === "quoc_te") {
      if (!redeemMethod) {
        setToast({ message: "Vui lòng chọn phương thức nhận code!", type: "error" });
        return;
      }
      if (redeemMethod === "discord" && !discordName.trim()) {
        setToast({ message: "Vui lòng nhập tên Discord!", type: "error" });
        return;
      }
      if (redeemMethod === "zalo" && !zaloPhone.trim()) {
        setToast({ message: "Vui lòng nhập SĐT Zalo!", type: "error" });
        return;
      }
    }
    
    setIsRedeeming(true);
    const { error } = await supabase.from("redemption_orders").insert({
      user_id: session.user.id,
      package_name: selectedPkg.name,
      coins_charged: selectedPkg.coin_cost,
      receive_method: version === "vng" ? "roblox_username" : redeemMethod,
      contact_value: version === "vng" ? username.trim() : (redeemMethod === "discord" ? discordName.trim() : zaloPhone.trim()),
      target_username: searchResult?.name || username.trim(),
      target_uid: searchResult?.id || username.trim(),
      status: "processing"
    });

    setIsRedeeming(false);
    if (error) {
      setToast({ message: "Lỗi tạo đơn: " + error.message, type: "error" });
      return;
    }

    setSelectedPkg(null);
    setUsername("");
    setSearchResult(null);
    setDiscordName("");
    setZaloPhone("");
    setRedeemMethod("");
    setToast({ message: "Đã tạo đơn thành công! Chờ admin xử lý.", type: "success" });
    const { data: newOrders } = await supabase.from("redemption_orders").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
    setHistory(newOrders ?? []);
  };

  const getStatus = (status) => {
    const config = {
      processing: { label: "Chờ xử lý", color: "bg-amber-100 text-amber-700 border-amber-200" },
      delivered: { label: "Đã giao", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
      cancelled: { label: "Đã hủy", color: "bg-rose-100 text-rose-700 border-rose-200" },
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
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Đổi Coin lấy quà game cực dễ</h1>
          <p className="mt-2 text-sm text-slate-500">Robux Roblox — admin xử lý nhanh, hoàn coin nếu lỗi.</p>
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

        {/* Chọn phiên bản */}
        <div className="mb-6 mt-6 flex gap-2">
          <button
            onClick={() => { setVersion("vng"); setSelectedPkg(null); setRedeemMethod(""); }}
            className={`flex-1 rounded-full py-3 text-sm font-bold transition ${
              version === "vng" ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg" : "bg-white text-slate-600 shadow-sm"
            }`}
          >
            Phiên bản VNG
          </button>
          <button
            onClick={() => { setVersion("quoc_te"); setSelectedPkg(null); setRedeemMethod(""); }}
            className={`flex-1 rounded-full py-3 text-sm font-bold transition ${
              version === "quoc_te" ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg" : "bg-white text-slate-600 shadow-sm"
            }`}
          >
            Phiên bản Quốc tế
          </button>
        </div>

        {/* Chọn gói */}
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-bold text-slate-900">Chọn gói Robux</h2>
          <div className="space-y-4">
            {filteredPackages.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm"><p className="text-sm text-slate-400">Chưa có gói nào cho phiên bản này.</p></div>
            ) : filteredPackages.map((pkg) => {
              const discount = pkg.original_price_text ? Math.round((1 - (pkg.coin_cost / parseFloat(pkg.original_price_text.replace(/\D/g, '')))) * 100) : 0;
              const isSelected = selectedPkg?.id === pkg.id;
              
              return (
                <div key={pkg.id} onClick={() => setSelectedPkg(pkg)}
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

        {/* Thông tin giao hàng */}
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-bold text-slate-900">Thông tin giao hàng</h2>
          
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">Username Roblox</p>
            <div className="mt-2 flex gap-2">
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="VD: PlayerName123" className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400" />
              <button onClick={handleSearch} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white">
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

          {/* Phương thức nhận code (Chỉ hiện cho Quốc tế) */}
          {version === "quoc_te" && (
            <div className="mt-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-slate-400">Phương thức nhận code</p>
              <div className="mt-3 flex flex-col gap-3">
                <button onClick={() => { setRedeemMethod("discord"); setDiscordName(""); }}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left font-semibold transition ${
                    redeemMethod === "discord" ? "border-cyan-500 bg-cyan-50 text-cyan-700" : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}>
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${redeemMethod === "discord" ? "border-cyan-500" : "border-slate-400"}`}>
                    {redeemMethod === "discord" && <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />}
                  </span>
                  Nhận code qua Discord
                </button>
                {redeemMethod === "discord" && (
                  <input type="text" value={discordName} onChange={(e) => setDiscordName(e.target.value)} placeholder="Tên Discord của bạn" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400" />
                )}

                <button onClick={() => { setRedeemMethod("zalo"); setZaloPhone(""); }}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left font-semibold transition ${
                    redeemMethod === "zalo" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}>
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${redeemMethod === "zalo" ? "border-blue-500" : "border-slate-400"}`}>
                    {redeemMethod === "zalo" && <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />}
                  </span>
                  Nhận code qua Zalo
                </button>
                {redeemMethod === "zalo" && (
                  <input type="text" value={zaloPhone} onChange={(e) => setZaloPhone(e.target.value)} placeholder="Số điện thoại Zalo của bạn" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Đã chọn */}
        {selectedPkg && (
          <div className="mb-4 rounded-2xl bg-sky-50 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Đã chọn</p>
            <p className="mt-1 text-sm font-bold text-slate-900">{selectedPkg.name}</p>
            <p className="mt-1 text-lg font-bold text-amber-500">{selectedPkg.coin_cost} Coin {selectedPkg.original_price_text && <span className="ml-2 text-xs font-normal text-slate-400 line-through">{selectedPkg.original_price_text}</span>}</p>
          </div>
        )}

        {/* Nút Đặt đơn - LUÔN SÁNG, bấm được (không disabled) */}
        <button onClick={handleRedeem} disabled={isRedeeming} className="w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-sky-500/25 disabled:opacity-50">
          {isRedeeming ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Đặt đơn"}
        </button>
        <p className="mt-2 text-center text-xs text-slate-400">Số dư: {profile.coins} Coin</p>

        {/* Hướng dẫn */}
        <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-800">Hướng dẫn đặt Robux {version === "vng" ? "VNG" : "Quốc tế"}</p>
          <ol className="mt-3 list-decimal list-inside space-y-2 text-sm text-slate-600">
            <li>Chọn gói Robux mà bạn muốn.</li>
            <li>Nhập Username Roblox của bạn.</li>
            <li>Kiểm tra tên và ảnh đại diện, sau đó đặt đơn.</li>
            {version === "vng" ? (
              <li>Sau khi đặt đơn, admin sẽ nạp trực tiếp vào tài khoản VNG của bạn.</li>
            ) : (
              <li>Sau khi đặt đơn, admin sẽ gửi code qua {redeemMethod === "discord" ? "Discord" : "Zalo"} cho bạn.</li>
            )}
          </ol>
        </div>
      </main>

      {/* Lịch sử đơn hàng */}
      <div className="px-4 pb-5">
        <h2 className="mb-3 text-lg font-bold text-slate-900">Lịch sử đơn hàng</h2>
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm"><p className="text-sm text-slate-400">Chưa có đơn hàng nào.</p></div>
          ) : history.map((order) => {
            const statusConfig = getStatus(order.status);
            return (
              <div key={order.id} className="rounded-2xl border border-white bg-white p-4 shadow-sm">
                <p className="font-bold text-slate-900">{order.package_name}</p>
                <p className="mt-1 text-xs text-slate-400">Thời gian: {new Date(order.created_at).toLocaleString("vi-VN")}</p>
                <p className="mt-1 text-xs text-slate-400">Username: {order.target_username || order.contact_value}</p>
                <p className="mt-1 text-xs text-slate-400">ID Đơn: {order.id}</p>
                {order.receive_method === "discord" && <p className="mt-1 text-xs text-slate-400">Nhận qua Discord: {order.contact_value}</p>}
                {order.receive_method === "zalo" && <p className="mt-1 text-xs text-slate-400">Nhận qua Zalo: {order.contact_value}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.color}`}>{statusConfig.label}</span>
                  <span className="font-bold text-amber-500">-{order.coins_charged} Coin</span>
                </div>
                {order.admin_note && (
                  <p className="mt-2 rounded-lg bg-slate-50 p-3 text-xs italic text-slate-500">Ghi chú: {order.admin_note}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
                                                                     }
