import React, { useEffect, useMemo, useState } from "react";
import { Coins, Gift, Loader2, Send, Gamepad2, Swords, Zap, ShieldCheck, Trophy, MessageCircle, Phone, Check } from "lucide-react";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { useStoreData } from "../hooks/useStoreData.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

const STATUS_LABEL = {
  pending: { text: "Đang xử lý", cls: "bg-amber-50 text-amber-600" },
  delivered: { text: "Đã giao", cls: "bg-emerald-50 text-emerald-600" },
  cancelled: { text: "Đã từ chối", cls: "bg-rose-50 text-rose-500" },
};

function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function Store() {
  const { session } = useSession();
  const { profile } = useProfile(session?.user?.id);
  const { packages, orders, loading, refetch } = useStoreData(session?.user?.id);

  const [mainTab, setMainTab] = useState("robux");
  const [subTab, setSubTab] = useState("VNG");
  const [selectedId, setSelectedId] = useState(null);
  const [robloxUsername, setRobloxUsername] = useState("");
  const [targetAccount, setTargetAccount] = useState("");
  const [receiveMethod, setReceiveMethod] = useState("");
  const [contactValue, setContactValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const robuxPackages = packages.filter((p) => (p.category ?? "robux") === "robux" && p.version === subTab);
  const quanHuyPackages = packages.filter((p) => p.category === "quanhuy");
  const visiblePackages = mainTab === "robux" ? robuxPackages : quanHuyPackages;

  const selectedPkg = useMemo(() => packages.find((p) => p.id === selectedId) ?? null, [packages, selectedId]);

  const handleSelect = (pkg) => {
    setSelectedId(pkg.id);
    setFeedback(null);
    setReceiveMethod("");
    setContactValue("");
    setRobloxUsername("");
    setTargetAccount("");
  };
  const handleSubmit = async () => {
    if (!selectedPkg) return;
    setSubmitting(true);
    setFeedback(null);
    const { data, error } = await supabase.rpc("place_redemption_order", {
      p_package_id: selectedPkg.id,
      p_roblox_username: selectedPkg.category === "robux" ? robloxUsername.trim() : null,
      p_receive_method: selectedPkg.category === "robux" && selectedPkg.version === "QUOC_TE" ? receiveMethod : null,
      p_contact_value: selectedPkg.category === "robux" && selectedPkg.version === "QUOC_TE" ? contactValue.trim() : null,
      p_target_account: selectedPkg.category === "quanhuy" ? targetAccount.trim() : null,
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
      setTargetAccount("");
      setReceiveMethod("");
      setContactValue("");
      refetch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
      <div className="mx-auto max-w-md px-4 pt-5">
        <div className="rounded-3xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 p-6 shadow-xl shadow-sky-500/25">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
            <Gift size={13} /> CỬA HÀNG
          </span>
          <h1 className="mt-3 text-2xl font-extrabold text-white">Đổi Coin lấy phần thưởng</h1>
          <p className="mt-1.5 text-sm text-white/80">Nhanh chóng • Minh bạch • Theo dõi đơn hàng</p>
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-3.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-orange-500">
              <Coins size={20} className="text-white" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-400">Số dư của bạn</p>
              <p className="text-xl font-extrabold text-amber-500">{(profile?.coins ?? 0).toLocaleString("vi-VN")} Coin</p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          {[
            { key: "robux", label: "Robux", icon: Gamepad2 },
            { key: "quanhuy", label: "Quân Huy", icon: Swords },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setMainTab(tab.key); setSelectedId(null); }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-bold transition ${
                mainTab === tab.key ? "bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md" : "bg-sky-50 text-sky-700"
              }`}
            >
              <tab.icon size={15} /> {tab.label}
            </button>
          ))}
        </div>
{mainTab === "robux" && (
          <div className="mt-3 flex gap-2">
            {[
              { key: "VNG", label: "🇻🇳 VNG" },
              { key: "QUOC_TE", label: "🌎 Quốc tế" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => { setSubTab(t.key); setSelectedId(null); }}
                className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
                  subTab === t.key ? "bg-sky-100 text-sky-700 border border-sky-300" : "bg-white text-slate-400 border border-slate-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 space-y-3">
          {visiblePackages.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-sky-200 bg-white p-6 text-center text-sm text-slate-400">
              Chưa có gói nào trong mục này.
            </p>
          ) : (
            visiblePackages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => handleSelect(pkg)}
                className={`flex w-full items-center gap-3.5 rounded-2xl p-4 text-left transition ${
                  selectedId === pkg.id
                    ? "bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-lg"
                    : "border border-sky-100 bg-white text-slate-900"
                }`}
              >
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${selectedId === pkg.id ? "bg-white/20" : "bg-sky-50"}`}>
                  {mainTab === "robux" ? <Gamepad2 size={20} className={selectedId === pkg.id ? "text-white" : "text-sky-500"} /> : <Swords size={20} className={selectedId === pkg.id ? "text-white" : "text-sky-500"} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{pkg.name}</p>
                  <p className={`text-xs ${selectedId === pkg.id ? "text-white/80" : "text-slate-400"}`}>
                    {pkg.coin_cost.toLocaleString("vi-VN")} Coin
                    {pkg.original_price_text && ` • Giá gốc ${pkg.original_price_text}`}
                  </p>
                </div>
                {selectedId === pkg.id && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                    <Check size={14} />
                  </span>
                )}
              </button>
            ))
          )}
        </div>
