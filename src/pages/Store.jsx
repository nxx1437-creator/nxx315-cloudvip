import React, { useState } from "react";
import { Coins, Gift, Loader2, CheckCircle2, XCircle, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import useStoreData from "../hooks/useStoreData.js";
import AppBackground from "../components/AppBackground.jsx";
import GlassCard from "../components/GlassCard.jsx";
import GlowButton from "../components/GlowButton.jsx";
import Toast from "../components/Toast.jsx";
import BottomNav from "../components/BottomNav.jsx";

export default function Store() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { packages } = useStoreData();
  const [toast, setToast] = useState(null);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [redeemMethod, setRedeemMethod] = useState("discord"); // discord / zalo
  const [contact, setContact] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleRedeem = async () => {
    if (!contact.trim()) {
      setToast({ message: "Vui lòng nhập thông tin liên hệ!", type: "error" });
      return;
    }
    
    setIsRedeeming(true);
    // Gọi API hoặc Supabase (Sẽ được cập nhật ở Gói 5 để gọi Edge Function)
    setTimeout(() => {
      setIsRedeeming(false);
      setSelectedPkg(null);
      setContact("");
      setToast({ message: "Đã tạo đơn đổi thưởng thành công!", type: "success" });
    }, 1500);
  };

  return (
    <AppBackground>
      <div className="mx-auto max-w-md px-4 py-5">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-white">Cửa hàng</h1>
          <p className="mt-1 text-sm text-slate-400">Đổi Coin lấy phần thưởng hấp dẫn!</p>
        </div>

        {/* Số dư */}
        <GlassCard className="mb-6 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">Số dư hiện có</p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-cyan-300">
                <Coins size={24} className="text-amber-400" /> {profile.coins}
              </p>
            </div>
            <Gift size={32} className="text-purple-400" />
          </div>
        </GlassCard>

        {/* Danh sách gói */}
        <div className="space-y-4">
          {packages.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <p className="text-sm text-slate-400">Chưa có phần thưởng nào.</p>
            </GlassCard>
          ) : packages.map((pkg) => (
            <GlassCard key={pkg.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-bold text-white">{pkg.name}</p>
                  <p className="mt-1 text-xs text-slate-400">{pkg.original_price_text || "Phần thưởng"}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                  pkg.active ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                }`}>
                  {pkg.active ? "Đang bán" : "Hết hàng"}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="flex items-center gap-1 text-lg font-bold text-amber-400">
                  <Coins size={18} /> {pkg.coin_cost}
                </span>
                <GlowButton
                  onClick={() => setSelectedPkg(pkg)}
                  disabled={!pkg.active || profile.coins < pkg.coin_cost}
                  variant={profile.coins < pkg.coin_cost ? "secondary" : "primary"}
                  className="px-6"
                >
                  Đổi ngay
                </GlowButton>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Modal xác nhận đổi */}
      {selectedPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0B1120] p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Xác nhận đổi thưởng</h2>
            <p className="mt-2 text-sm text-slate-400">
              Bạn đang đổi <span className="font-bold text-white">{selectedPkg.name}</span> với giá{" "}
              <span className="font-bold text-amber-400">{selectedPkg.coin_cost} Coin</span>
            </p>

            <div className="mt-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phương thức nhận</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setRedeemMethod("discord")}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    redeemMethod === "discord" ? "bg-cyan-500/20 text-cyan-300" : "bg-white/5 text-slate-400"
                  }`}
                >
                  Discord
                </button>
                <button
                  onClick={() => setRedeemMethod("zalo")}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    redeemMethod === "zalo" ? "bg-blue-500/20 text-blue-300" : "bg-white/5 text-slate-400"
                  }`}
                >
                  Zalo
                </button>
              </div>

              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={`Nhập ${redeemMethod === "discord" ? "Discord" : "Zalo"} của bạn...`}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedPkg(null)}
                className="flex-1 rounded-xl bg-white/5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
              >
                Huỷ
              </button>
              <GlowButton onClick={handleRedeem} disabled={isRedeeming} className="flex-1">
                {isRedeeming ? <Loader2 size={16} className="animate-spin" /> : "Xác nhận đổi"}
              </GlowButton>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AppBackground>
  );
}
