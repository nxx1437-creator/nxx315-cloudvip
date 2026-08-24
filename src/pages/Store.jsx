import React, { useEffect, useMemo, useState } from "react";
import { Coins, Gift, Loader2, Send, Gamepad2, Swords, Zap, ShieldCheck, Trophy, MessageCircle, Phone, Check, Search } from "lucide-react";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import useStoreData from "../hooks/useStoreData.js";
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
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchRoblox = async () => {
    if (!robloxUsername.trim()) return;
    setIsSearching(true);
    setSearchResult(null);
    try {
      const userRes = await fetch("https://users.roblox.com/v1/usernames/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames: [robloxUsername.trim()] }),
      });
      const userData = await userRes.json();
      if (!userData.data || userData.data.length === 0) {
        setFeedback({ ok: false, message: "Không tìm thấy tài khoản Roblox này." });
        setIsSearching(false);
        return;
      }
      const user = userData.data[0];
      const avatarRes = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-bust?userIds=${user.id}&size=150x150&format=Png`);
      const avatarData = await avatarRes.json();
      setSearchResult({
        name: user.displayName || user.name,
        avatar: avatarData.data?.[0]?.imageUrl || "",
        id: String(user.id),
      });
    } catch {
      setFeedback({ ok: false, message: "Lỗi tra cứu, thử lại sau." });
    }
    setIsSearching(false);
  };

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
{selectedPkg.category === "robux" && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">Tài khoản Roblox</label>
                  <div className="flex gap-2">
                    <input
                      value={robloxUsername}
                      onChange={(e) => { setRobloxUsername(e.target.value); setSearchResult(null); }}
                      placeholder="VD: PlayerName123"
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-sky-400"
                    />
                    <button
                      type="button"
                      onClick={handleSearchRoblox}
                      disabled={isSearching}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md disabled:opacity-60"
                    >
                      {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                    </button>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    ⚠️ Chỉ nhập thông tin cần thiết để xác định tài khoản. Không yêu cầu mật khẩu.
                  </p>

                  {searchResult && (
                    <div className="mt-3 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                      {searchResult.avatar && (
                        <img src={searchResult.avatar} alt="avatar" className="h-12 w-12 rounded-full border-2 border-white shadow-sm" />
                      )}
                      <div>
                        <p className="text-sm font-bold text-emerald-700">{searchResult.name}</p>
                        <p className="text-xs text-emerald-600">ID: {searchResult.id}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedPkg.category === "quanhuy" && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">ID/UID Liên Quân Mobile</label>
                  <input
                    value={targetAccount}
                    onChange={(e) => setTargetAccount(e.target.value)}
                    placeholder="VD: 123456789"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-sky-400"
                  />
                  <p className="mt-1.5 text-[11px] text-amber-600">
                    ⓘ Liên Quân Mobile hiện chưa hỗ trợ tự động tra cứu tên/ảnh (VNG không có API công khai). Vui lòng nhập chính xác ID.
                  </p>
                </div>
              )}

              {selectedPkg.category === "quanhuy" && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">ID/UID Liên Quân Mobile</label>
                  <input
                    value={targetAccount}
                    onChange={(e) => setTargetAccount(e.target.value)}
                    placeholder="VD: 123456789"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-sky-400"
                  />
                </div>
              )}

              {selectedPkg.category === "robux" && selectedPkg.version === "QUOC_TE" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-500">Phương thức nhận</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => { setReceiveMethod("discord"); setContactValue(""); }}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-semibold transition ${
                          receiveMethod === "discord" ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500"
                        }`}
                      >
                        <MessageCircle size={15} /> Discord
                      </button>
                      <button
                        type="button"
                        onClick={() => { setReceiveMethod("zalo"); setContactValue(""); }}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-semibold transition ${
                          receiveMethod === "zalo" ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500"
                        }`}
                      >
                        <Phone size={15} /> Zalo
                      </button>
                    </div>
                  </div>

                  {receiveMethod && (
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                        {receiveMethod === "zalo" ? "Số Zalo" : "Discord của bạn"}
                      </label>
                      <input
                        value={contactValue}
                        onChange={(e) => setContactValue(e.target.value)}
                        placeholder={receiveMethod === "zalo" ? "0xxxxxxxxx" : "@username"}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-sky-400"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {feedback && (
              <p className={`mt-3 text-sm font-medium ${feedback.ok ? "text-emerald-600" : "text-rose-500"}`}>{feedback.message}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-60"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Xác nhận đổi — trừ {selectedPkg.coin_cost.toLocaleString("vi-VN")} Coin
            </button>
          </div>
        )}
 <div className="mt-6">
          <h2 className="mb-2 text-sm font-bold text-slate-900">Lịch sử đổi thưởng</h2>
          {loading ? (
            <p className="text-sm text-slate-400">Đang tải...</p>
          ) : orders.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-sky-200 bg-white p-5 text-center text-sm text-slate-400">
              Bạn chưa có đơn nào.
            </p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => {
                const st = STATUS_LABEL[o.status] ?? STATUS_LABEL.pending;
                return (
                  <div key={o.id} className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{o.package_name}</p>
                        <p className="text-xs text-slate-400">
                          {o.roblox_username || o.target_account} • {fmtTime(o.created_at)}
                        </p>
                        {o.receive_method && (
                          <p className="text-xs text-slate-400">
                            Nhận qua {o.receive_method === "zalo" ? "Zalo" : "Discord"}: {o.contact_value}
                          </p>
                        )}
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${st.cls}`}>{st.text}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <span className="font-semibold text-rose-500">-{o.coins_charged.toLocaleString("vi-VN")} Coin</span>
                      {o.status === "cancelled" && o.coins_refunded > 0 && (
                        <span className="font-semibold text-emerald-600">+{o.coins_refunded.toLocaleString("vi-VN")} Coin đã hoàn</span>
                      )}
                    </div>
                    {o.admin_note && (
                      <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700">Ghi chú admin: {o.admin_note}</p>
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
