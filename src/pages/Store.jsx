import React, { useMemo, useState } from "react";
import {
  Gift, Sparkles, Zap, Shield, Trophy, Coins, Check,
  Loader2, MessageCircle, Phone, PlayCircle, Gamepad2,
} from "lucide-react";
import useProfile from "../hooks/useProfile.js";
import useSession from "../hooks/useSession.js";
import { useStoreData } from "../hooks/useStoreData.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

const STATUS_LABEL = {
  pending: { text: "Chờ xử lý", cls: "bg-amber-100 text-amber-700" },
  delivered: { text: "Đã giao", cls: "bg-emerald-100 text-emerald-700" },
  cancelled: { text: "Đã hủy", cls: "bg-rose-100 text-rose-700" },
};

function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", {
    hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export default function Store() {
  const { session } = useSession();
  const userId = session?.user?.id;
  const { profile } = useProfile(userId);
  const { packages, orders, loading, refetch } = useStoreData(userId);

  const [selectedId, setSelectedId] = useState(null);
  const [robloxUsername, setRobloxUsername] = useState("");
  const [receiveMethod, setReceiveMethod] = useState("");
  const [contactValue, setContactValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const selectedPkg = useMemo(
    () => packages.find((p) => p.id === selectedId) ?? null,
    [packages, selectedId]
  );

  const vngPackages = packages.filter((p) => p.version === "VNG");
  const quocTePackages = packages.filter((p) => p.version === "QUOC_TE");

  const handleSelect = (pkg) => {
    setSelectedId(pkg.id);
    setFeedback(null);
    setReceiveMethod("");
    setContactValue("");
  };

  const handleSubmit = async () => {
    if (!selectedPkg) return;
    if (!robloxUsername.trim()) {
      setFeedback({ ok: false, message: "Vui lòng nhập Username Roblox." });
      return;
    }
    if (selectedPkg.version === "QUOC_TE") {
      if (!receiveMethod) {
        setFeedback({ ok: false, message: "Vui lòng chọn cách nhận code (Discord hoặc Zalo)." });
        return;
      }
      if (!contactValue.trim()) {
        setFeedback({
          ok: false,
          message: receiveMethod === "zalo" ? "Vui lòng nhập số điện thoại Zalo." : "Vui lòng nhập tên Discord.",
        });
        return;
      }
    }

    setSubmitting(true);
    setFeedback(null);
    const { data, error } = await supabase.rpc("place_redemption_order", {
      p_package_id: selectedPkg.id,
      p_roblox_username: robloxUsername.trim(),
      p_receive_method: selectedPkg.version === "QUOC_TE" ? receiveMethod : null,
      p_contact_value: selectedPkg.version === "QUOC_TE" ? contactValue.trim() : null,
    });
    setSubmitting(false);

    if (error) {
      setFeedback({ ok: false, message: error.message });
      return;
    }
    const result = data[0];
    setFeedback({ ok: result.success, message: result.message });
    if (result.success) {
      setSelectedId(null);
      setRobloxUsername("");
      setReceiveMethod("");
      setContactValue("");
      refetch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
        @keyframes shine { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      `}</style>

      <div className="mx-auto max-w-md px-4 pt-5">
        {/* Header — xanh dương đậm, đúng tông thương hiệu */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 p-6 shadow-xl shadow-sky-500/30">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-amber-300/20 blur-2xl" />

          <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
            <Gift size={13} /> TRUNG TÂM ĐỔI THƯỞNG
          </span>
          <h1 className="font-display relative mt-3 flex items-center gap-1.5 text-2xl font-extrabold leading-tight text-white">
            <Sparkles size={20} className="text-amber-300" /> Đổi Coin lấy quà game cực dễ
          </h1>
          <p className="relative mt-2 text-sm text-white/80">
            Robux Roblox — admin xử lý nhanh, hoàn Coin nếu đơn bị hủy.
          </p>
          <div className="relative mt-3 flex flex-wrap gap-2">
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <Zap size={12} className="text-amber-300" /> Giao trong vài phút
            </span>
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <Shield size={12} className="text-emerald-300" /> Bảo hành / hoàn Coin
            </span>
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <Trophy size={12} className="text-amber-200" /> Giá tốt nhất
            </span>
          </div>

          <div className="relative mt-4 flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-lg">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 shadow-md shadow-amber-500/30">
              <Coins size={20} className="text-white" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Số dư của bạn</p>
              <p className="text-xl font-extrabold text-amber-500">
                {(profile?.coins ?? 0).toLocaleString("vi-VN")} <span className="text-sm font-semibold text-slate-400">Coin</span>
              </p>
            </div>
          </div>
        </div>

        {/* Gói VNG */}
        <div className="mb-2 mt-6 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
          <p className="text-xs font-bold uppercase tracking-wide text-sky-600">Phiên bản VNG</p>
        </div>
        <div className="space-y-3">
          {vngPackages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} selected={selectedId === pkg.id} onClick={() => handleSelect(pkg)} />
          ))}
        </div>

        {/* Gói Quốc tế */}
        <div className="mb-2 mt-6 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <p className="text-xs font-bold uppercase tracking-wide text-amber-600">Phiên bản Quốc tế</p>
        </div>
        <div className="space-y-3">
          {quocTePackages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} selected={selectedId === pkg.id} onClick={() => handleSelect(pkg)} />
          ))}
        </div>

        {/* Form đặt đơn */}
        {selectedPkg && (
          <div className="mt-6 animate-[fadeIn_0.2s_ease-out] rounded-3xl border border-sky-100 bg-white p-5 shadow-xl shadow-sky-100">
            <h2 className="text-base font-bold text-slate-900">Thông tin nhận {selectedPkg.name}</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Phiên bản:{" "}
              <span className="font-semibold text-sky-600">
                {selectedPkg.version === "VNG" ? "VNG" : "Quốc tế"}
              </span>
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Username Roblox</label>
                <input
                  value={robloxUsername}
                  onChange={(e) => setRobloxUsername(e.target.value)}
                  placeholder="VD: PlayerName123"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                />
              </div>

              {selectedPkg.version === "QUOC_TE" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-500">Cách nhận code</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => { setReceiveMethod("discord"); setContactValue(""); }}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-semibold transition-all duration-150 active:scale-95 ${
                          receiveMethod === "discord"
                            ? "border-transparent bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/30"
                            : "border-slate-200 text-slate-500 hover:border-sky-200 hover:bg-sky-50/50"
                        }`}
                      >
                        <MessageCircle size={15} /> Discord
                        {receiveMethod === "discord" && <Check size={14} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setReceiveMethod("zalo"); setContactValue(""); }}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-semibold transition-all duration-150 active:scale-95 ${
                          receiveMethod === "zalo"
                            ? "border-transparent bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/30"
                            : "border-slate-200 text-slate-500 hover:border-sky-200 hover:bg-sky-50/50"
                        }`}
                      >
                        <Phone size={15} /> Zalo
                        {receiveMethod === "zalo" && <Check size={14} />}
                      </button>
                    </div>
                  </div>

                  {receiveMethod && (
                    <div className="animate-[fadeIn_0.2s_ease-out]">
                      <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                        {receiveMethod === "zalo" ? "Số điện thoại Zalo" : "Tên Discord"}
                      </label>
                      <input
                        value={contactValue}
                        onChange={(e) => setContactValue(e.target.value)}
                        placeholder={receiveMethod === "zalo" ? "VD: 0912345678" : "VD: username#0000"}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {feedback && (
              <p className={`mt-3 text-sm font-medium ${feedback.ok ? "text-emerald-600" : "text-rose-500"}`}>
                {feedback.message}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition-all duration-150 hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Coins size={16} />}
              Đặt đơn — trừ {selectedPkg.coin_cost.toLocaleString("vi-VN")} Coin
            </button>
          </div>
        )}

        {/* Hướng dẫn nhận quà */}
        <div className="mt-6 rounded-3xl border border-sky-100 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
            <Sparkles size={15} className="text-sky-400" /> Hướng dẫn nhận quà
          </h2>
          <div className="mt-3 flex h-40 items-center justify-center rounded-2xl border border-dashed border-sky-200 bg-sky-50/40 text-sm text-slate-400">
            <div className="flex flex-col items-center gap-1.5">
              <PlayCircle size={26} className="text-sky-300" />
              Video hướng dẫn sẽ được cập nhật sau
            </div>
          </div>
        </div>

        {/* Lịch sử đơn */}
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-bold text-slate-900">Lịch sử đơn</h2>
          {loading ? (
            <p className="text-sm text-slate-400">Đang tải...</p>
          ) : orders.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-sky-200 bg-white p-5 text-center text-sm text-slate-400">
              Bạn chưa có đơn nào.
            </p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => {
                const st = STATUS_LABEL[o.status];
                return (
                  <div key={o.id} className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm transition hover:shadow-md">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{o.package_name}</p>
                        <p className="text-xs text-slate-400">
                          {o.roblox_username} • {fmtTime(o.created_at)}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${st.cls}`}>
                        {st.text}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <span className="font-semibold text-rose-500">-{o.coins_charged.toLocaleString("vi-VN")} Coin</span>
                      {o.status === "cancelled" && o.coins_refunded > 0 && (
                        <span className="font-semibold text-emerald-600">
                          +{o.coins_refunded.toLocaleString("vi-VN")} Coin đã hoàn
                        </span>
                      )}
                    </div>
                    {o.admin_note && (
                      <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700">
                        Ghi chú admin: {o.admin_note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function PackageCard({ pkg, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3.5 overflow-hidden rounded-2xl p-4 text-left transition-all duration-150 active:scale-[0.98] ${
        selected
          ? "bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/30"
          : "border border-sky-100 bg-white text-slate-900 shadow-sm hover:border-sky-200 hover:shadow-md"
      }`}
    >
      {pkg.is_promo && (
        <span
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-white/25"
          style={{ animation: "shine 2.2s ease-in-out infinite" }}
        />
      )}
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-150 group-active:scale-90 ${
          selected ? "bg-white/25" : "bg-gradient-to-br from-amber-300 to-orange-500"
        }`}
      >
        {selected ? <Coins size={20} className="text-white" /> : <Gamepad2 size={20} className="text-white" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{pkg.name}</p>
        <p className={`text-xs ${selected ? "text-white/80" : "text-slate-400"}`}>
          {pkg.coin_cost.toLocaleString("vi-VN")} Coin
          {pkg.original_price_text && ` • Giá gốc ${pkg.original_price_text}`}
        </p>
      </div>
      {pkg.is_promo && !selected && (
        <span className="shrink-0 animate-pulse rounded-full bg-rose-500 px-2 py-1 text-[10px] font-bold text-white shadow shadow-rose-500/40">
          KM
        </span>
      )}
      {selected && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/25">
          <Check size={14} />
        </span>
      )}
    </button>
  );
}
