import React, { useState, useEffect } from "react";
import { Coins, Gift, Loader2, CheckCircle2, Gamepad2, Flame, Swords, Sparkles, Zap, ShieldCheck, Trophy, ExternalLink, Search, User, ArrowRightLeft, Ban, XCircle } from "lucide-react";
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
    <div className="min-h-screen bg-[#F0F4F8] pb-24 font-[Be_Vietnam_Pro] text-slate-800">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
        
        /* Các class Neumorphic */
        .neu-flat {
          background: #F0F4F8;
          box-shadow: 8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff;
        }
        .neu-flat-lg {
          background: #F0F4F8;
          box-shadow: 12px 12px 24px #d1d9e6, -12px -12px 24px #ffffff;
        }
        .neu-inset {
          background: #F0F4F8;
          box-shadow: inset 6px 6px 12px #d1d9e6, inset -6px -6px 12px #ffffff;
        }
        
        /* Input focus */
        .input-neu:focus {
          outline: none;
          border: 1.5px solid #3B82F6;
          box-shadow: inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff, 0 0 0 3px rgba(59, 130, 246, 0.15);
          transition: all 0.3s ease;
        }
        
        /* Radio button tùy chỉnh */
        .radio-neu {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #F0F4F8;
          box-shadow: inset 3px 3px 6px #d1d9e6, inset -3px -3px 6px #ffffff;
          display: inline-block;
          cursor: pointer;
          position: relative;
        }
        .radio-neu:checked::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #3B82F6;
        }
      `}</style>

      <main className="mx-auto max-w-md px-5 py-5">
        {/* HERO */}
        <div className="neu-flat-lg rounded-[32px] p-6 mb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-blue-500/30">
              <Gift size={20} />
            </span>
            <div>
              <h1 className="font-display text-xl font-bold text-slate-900">Đổi Coin lấy quà</h1>
              <p className="text-xs text-slate-500">Robux Roblox — admin xử lý nhanh, hoàn coin nếu lỗi.</p>
            </div>
          </div>
          
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-sky-600 shadow-sm"><Zap size={12} /> Giao trong vài phút</span>
            <span className="flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-emerald-600 shadow-sm"><ShieldCheck size={12} /> Bảo hành / hoàn coin</span>
            <span className="flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-amber-600 shadow-sm"><Trophy size={12} /> Giá tốt nhất</span>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-3xl bg-white/60 p-4 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-500"><Coins size={24} /></span>
            <div>
              <p className="text-xs text-slate-500">Số dư của bạn</p>
              <p className="text-xl font-bold text-amber-500">{profile.coins} <span className="text-sm font-normal text-slate-400">Coin</span></p>
            </div>
          </div>
        </div>

        {/* Header & Tab */}
        <div className="neu-flat rounded-[28px] p-2 mb-6">
          <div className="flex gap-2">
            <button onClick={() => { setVersion("vng"); setSelectedPkg(null); setRedeemMethod(""); }}
              className={`flex-1 rounded-2xl py-3 text-sm font-bold transition-all duration-300 ${
                version === "vng" ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-purple-500/30" : "text-slate-600"
              }`}>
              Phiên bản VNG
            </button>
            <button onClick={() => { setVersion("quoc_te"); setSelectedPkg(null); setRedeemMethod(""); }}
              className={`flex-1 rounded-2xl py-3 text-sm font-bold transition-all duration-300 ${
                version === "quoc_te" ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-orange-500/30" : "text-slate-600"
              }`}>
              Phiên bản Quốc tế
            </button>
          </div>
        </div>

        {/* Chọn gói */}
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-bold text-slate-800">Chọn gói Robux</h2>
          <div className="space-y-4">
            {filteredPackages.length === 0 ? (
              <div className="neu-flat rounded-[28px] p-8 text-center"><p className="text-sm text-slate-500">Chưa có gói nào cho phiên bản này.</p></div>
            ) : filteredPackages.map((pkg) => {
              const discount = pkg.original_price_text ? Math.round((1 - (pkg.coin_cost / parseFloat(pkg.original_price_text.replace(/\D/g, '')))) * 100) : 0;
              const isSelected = selectedPkg?.id === pkg.id;
              return (
                <div key={pkg.id} onClick={() => setSelectedPkg(pkg)}
                  className={`neu-flat rounded-[28px] relative cursor-pointer p-5 transition-all duration-300 ${
                    isSelected ? "border-2 border-sky-400 bg-sky-50 shadow-lg" : "hover:shadow-xl"
                  }`}
                >
                  {discount > 0 && <span className="absolute right-4 top-4 rounded-full bg-rose-500 px-2.5 py-1 text-xs font-bold text-white">-{discount}%</span>}
                  <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-purple-50 shadow-inner">
                      <Coins size={30} className="text-blue-400" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-slate-600">{pkg.name}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{pkg.coin_cost}</p>
                    <p className="text-xs text-slate-500">Coin</p>
                    {pkg.original_price_text && <p className="mt-1 text-xs text-slate-400 line-through">{pkg.original_price_text}</p>}
                  </div>
                  {isSelected && <CheckCircle2 size={26} className="absolute left-4 top-4 text-sky-500" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Thông tin giao hàng */}
        <div className="neu-flat-lg rounded-[32px] p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Thông tin giao hàng</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Username Roblox</label>
              <div className="mt-2 flex gap-2">
                <div className="flex-1">
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="VD: PlayerName123" className="input-neu neu-inset w-full rounded-2xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400" />
                </div>
                <button onClick={handleSearch} className="group flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-sky-500 text-white shadow-md shadow-sky-500/30 transition-all duration-300 hover:bg-sky-600 hover:shadow-lg">
                  {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                </button>
              </div>
              {searchResult && (
                <div className="mt-3 flex items-center gap-3 rounded-2xl bg-emerald-50 p-3 border border-emerald-100">
                  <img src={searchResult.avatar} alt="avatar" className="h-12 w-12 rounded-full" />
                  <div>
                    <p className="text-sm font-bold text-emerald-700">{searchResult.name}</p>
                    <p className="text-xs text-emerald-600">ID: {searchResult.id}</p>
                  </div>
                </div>
              )}
            </div>

            {version === "quoc_te" && (
              <div className="mt-4 rounded-3xl bg-white/60 p-4 shadow-inner">
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">Phương thức nhận code</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input type="radio" id="discord" name="method" className="radio-neu" checked={redeemMethod === "discord"} onChange={() => setRedeemMethod("discord")} />
                    <label htmlFor="discord" className="cursor-pointer text-sm font-medium text-slate-700">Nhận code qua Discord</label>
                  </div>
                  {redeemMethod === "discord" && (
                    <input type="text" value={discordName} onChange={(e) => setDiscordName(e.target.value)} placeholder="Tên Discord của bạn" className="input-neu neu-inset w-full rounded-2xl px-4 py-3 text-sm" />
                  )}
                  
                  <div className="flex items-center gap-3">
                    <input type="radio" id="zalo" name="method" className="radio-neu" checked={redeemMethod === "zalo"} onChange={() => setRedeemMethod("zalo")} />
                    <label htmlFor="zalo" className="cursor-pointer text-sm font-medium text-slate-700">Nhận code qua Zalo</label>
                  </div>
                  {redeemMethod === "zalo" && (
                    <input type="text" value={zaloPhone} onChange={(e) => setZaloPhone(e.target.value)} placeholder="Số điện thoại Zalo của bạn" className="input-neu neu-inset w-full rounded-2xl px-4 py-3 text-sm" />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Đã chọn */}
          {selectedPkg && (
            <div className="mt-5 rounded-3xl bg-sky-50 p-4 border border-sky-100">
              <p className="text-xs uppercase tracking-wider text-slate-500">Đã chọn</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{selectedPkg.name}</p>
              <p className="mt-1 text-lg font-bold text-amber-500">{selectedPkg.coin_cost} Coin {selectedPkg.original_price_text && <span className="ml-2 text-xs font-normal text-slate-400 line-through">{selectedPkg.original_price_text}</span>}</p>
            </div>
          )}

          <button onClick={handleRedeem} disabled={isRedeeming || !selectedPkg} className="mt-6 w-full rounded-2xl bg-gradient-to-r from-sky-400 to-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-xl disabled:opacity-50">
            {isRedeeming ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Đặt đơn"}
          </button>
          <p className="mt-2 text-center text-xs text-slate-500">Số dư: {profile.coins} Coin</p>
        </div>

        {/* Hướng dẫn */}
        <div className="neu-flat rounded-[32px] p-6 mb-6">
          <p className="text-base font-bold text-slate-800 mb-4">Hướng dẫn đặt Robux {version === "vng" ? "VNG" : "Quốc tế"}</p>
          <div className="space-y-3">
            {[
              { icon: <Gamepad2 size={18} />, text: "Chọn gói Robux mà bạn muốn." },
              { icon: <User size={18} />, text: "Nhập Username Roblox của bạn." },
              { icon: <Search size={18} />, text: "Kiểm tra tên và ảnh đại diện, sau đó đặt đơn." },
              { icon: version === "vng" ? <Swords size={18} /> : <ExternalLink size={18} />, text: version === "vng" ? "Admin sẽ nạp trực tiếp vào tài khoản VNG của bạn." : "Admin sẽ gửi code qua Discord/Zalo cho bạn." },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl bg-white/60 p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">{step.icon}</span>
                <p className="text-sm text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lịch sử đơn hàng */}
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-bold text-slate-800">Lịch sử đơn hàng</h2>
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="neu-flat rounded-[28px] p-8 text-center"><p className="text-sm text-slate-500">Chưa có đơn hàng nào.</p></div>
            ) : history.map((order) => {
              const statusConfig = getStatus(order.status);
              return (
                <div key={order.id} className="neu-flat rounded-[24px] p-4 relative overflow-hidden">
                  <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-sky-400 to-blue-600" />
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{order.package_name}</p>
                      <p className="mt-1 text-xs text-slate-500">Thời gian: {new Date(order.created_at).toLocaleString("vi-VN")}</p>
                      <p className="mt-1 text-xs text-slate-500">Username: {order.target_username || order.contact_value}</p>
                      <p className="mt-1 text-xs text-slate-400">ID: {order.id}</p>
                      {order.receive_method === "discord" && <p className="mt-1 text-xs text-slate-500">Discord: {order.contact_value}</p>}
                      {order.receive_method === "zalo" && <p className="mt-1 text-xs text-slate-500">Zalo: {order.contact_value}</p>}
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusConfig.color}`}>{statusConfig.label}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold text-amber-500">-{order.coins_charged} Coin</span>
                  </div>
                  {order.admin_note && <p className="mt-2 rounded-xl bg-slate-100 p-3 text-xs italic text-slate-500">Ghi chú: {order.admin_note}</p>}
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
