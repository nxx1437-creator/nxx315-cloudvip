import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Smartphone,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronRight,
  History,
  Wallet,
  X,
  Info,
  Trophy,
  Headphones,
  Gift,
  Users,
  Search,
  Clock3,
} from "lucide-react";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { supabase } from "../lib/supabaseClient.js";

const SUPABASE_URL = "https://rwglwovohbyqmbbzdvdj.supabase.co";
const STORAGE_BUCKET = "game_logos";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const getImageUrl = (file) =>
  `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${file}`;

const FEE = 2000;
const MIN_AMOUNT = 10000;
const MAX_AMOUNT = 500000;
const MAX_PER_DAY = 500000;
const MAX_TIMES_PER_DAY = 5;

const BANKS = [
  { code: "VCB", name: "Vietcombank", logo: "vcb.png" },
  { code: "TCB", name: "Techcombank", logo: "tcb.png" },
  { code: "MB",  name: "MB Bank",     logo: "mb.png"  },
  { code: "VPB", name: "VPBank",      logo: "vpb.png" },
  { code: "TPB", name: "TPBank",      logo: "tpb.png" },
  { code: "ACB", name: "ACB",         logo: "acb.png" },
  { code: "BIDV", name: "BIDV",       logo: "bidv.png" },
  { code: "VTB", name: "VietinBank",  logo: "vtb.png" },
  { code: "STB", name: "Sacombank",   logo: "stb.png" },
  { code: "EIB", name: "Eximbank",    logo: "eib.png" },
  { code: "OCB", name: "OCB",         logo: "ocb.png" },
  { code: "MSB", name: "MSB",         logo: "msb.png" },
  { code: "HDB", name: "HDBank",      logo: "hdb.png" },
  { code: "SEAB", name: "SeABank",    logo: "seab.png" },
  { code: "NAB", name: "Nam A Bank",  logo: "nab.png" },
];

const TOP_BANKS = ["VCB", "TCB", "MB", "BIDV", "VPB", "ACB", "VTB", "TPB"];

const WALLETS = [
  { id: "momo", name: "MoMo", logo: "momo.png", color: "#A50064" },
  { id: "zalopay", name: "ZaloPay", logo: "zalopay.png", color: "#0068FF" },
  { id: "viettelpay", name: "ViettelPay", logo: "viettelpay.png", color: "#EE0033" },
];

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000];

function formatMoney(v) {
  return new Intl.NumberFormat("vi-VN").format(Number(v || 0)) + "đ";
}

function getBankInfo(code) {
  return BANKS.find((b) => b.code === code);
}

function getWalletInfo(id) {
  return WALLETS.find((w) => w.id === id);
}

export default function Withdraw() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);

  // Modal flow
  const [modalStep, setModalStep] = useState(null); // null | 'pickWallet' | 'pickBank' | 'form'
  const [bankSearch, setBankSearch] = useState("");
  const [selectedMethod, setSelectedMethod] = useState(null); // {type: 'bank'|'wallet', code?, wallet?}

  // Form
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // UI
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUser(user);

      const { data: prof } = await supabase
        .from("profiles")
        .select("coins")
        .eq("id", user.id)
        .single();

      setProfile(prof);

      const { data: hist } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      setWithdrawals(hist || []);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const numericAmount = Number(amount) || 0;
  const totalDeduct = numericAmount + FEE;
  const remaining = (profile?.coins || 0) - totalDeduct;

  const todayInfo = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const list = withdrawals.filter((w) => new Date(w.created_at) >= today);
    return {
      count: list.length,
      amount: list.reduce((s, w) => s + w.amount, 0),
    };
  }, [withdrawals]);

  const filteredBanks = useMemo(() => {
    const kw = bankSearch.trim().toLowerCase();
    if (!kw) return BANKS;
    return BANKS.filter(
      (b) =>
        b.name.toLowerCase().includes(kw) ||
        b.code.toLowerCase().includes(kw)
    );
  }, [bankSearch]);

  const closeModal = () => {
    setModalStep(null);
    setBankSearch("");
    setSelectedMethod(null);
    setAmount("");
    setAccountNumber("");
    setAccountName("");
    setContactPhone("");
    setError("");
    setSuccess("");
  };

  const openPickWallet = () => {
    setModalStep("pickWallet");
    setBankSearch("");
    setError("");
  };

  const openPickBank = () => {
    setModalStep("pickBank");
    setBankSearch("");
    setError("");
  };

  const chooseWallet = (walletId) => {
    setSelectedMethod({ type: "wallet", wallet: walletId });
    setModalStep("form");
  };

  const chooseBank = (bankCode) => {
    setSelectedMethod({ type: "bank", code: bankCode });
    setModalStep("form");
  };

  const goBackModal = () => {
    if (modalStep === "form") {
      if (selectedMethod?.type === "bank") setModalStep("pickBank");
      else setModalStep("pickWallet");
      setError("");
    } else {
      closeModal();
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!user) return setError("Vui lòng đăng nhập.");
    if (!selectedMethod) return setError("Chưa chọn phương thức.");
    if (numericAmount < MIN_AMOUNT)
      return setError(`Số tiền tối thiểu ${formatMoney(MIN_AMOUNT)}.`);
    if (numericAmount > MAX_AMOUNT)
      return setError(`Số tiền tối đa ${formatMoney(MAX_AMOUNT)}.`);
    if (totalDeduct > (profile?.coins || 0))
      return setError(
        `Số dư không đủ. Cần ${formatMoney(totalDeduct)} (gồm phí ${formatMoney(FEE)}).`
      );
    if (todayInfo.count >= MAX_TIMES_PER_DAY)
      return setError(`Đã đạt ${MAX_TIMES_PER_DAY} lần/ngày.`);
    if (todayInfo.amount + numericAmount > MAX_PER_DAY)
      return setError(`Vượt ${formatMoney(MAX_PER_DAY)}/ngày.`);
    if (!accountNumber.trim()) return setError("Nhập số tài khoản.");
    if (!accountName.trim()) return setError("Nhập tên chủ tài khoản.");
    if (!/^[0-9]{10,11}$/.test(contactPhone.trim()))
      return setError("SĐT liên hệ không hợp lệ.");

    setSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Chưa đăng nhập");

      const method = selectedMethod.type === "bank" ? "bank" : selectedMethod.wallet;
      const bankCode = selectedMethod.type === "bank" ? selectedMethod.code : null;

      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/request-withdrawal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            amount: numericAmount,
            method,
            bank_code: bankCode,
            account_number: accountNumber.trim(),
            account_name: accountName.trim(),
            contact_phone: contactPhone.trim(),
            save_account: true,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Có lỗi xảy ra.");
        setSubmitting(false);
        return;
      }

      setSuccess(`Đã gửi yêu cầu rút ${formatMoney(data.amount)}. Chờ 24h.`);
      setAmount("");
      setAccountNumber("");
      setAccountName("");
      await loadData();
      setTimeout(() => closeModal(), 2000);
    } catch (err) {
      setError(err?.message || "Không thể gửi yêu cầu.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-24">
        <TopHeader />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white pb-24">
        <TopHeader />
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <AlertCircle size={40} className="mx-auto text-slate-300" strokeWidth={2} />
          <h2 className="mt-4 text-lg font-bold">Vui lòng đăng nhập</h2>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 rounded-lg bg-slate-900 px-6 py-3 font-bold text-white"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  const savedCards = withdrawals
    .filter((w) => w.status !== "rejected")
    .slice(0, 3)
    .map((w) => ({
      ...w,
      bankInfo: w.bank_code ? getBankInfo(w.bank_code) : null,
      walletInfo: w.method !== "bank" ? getWalletInfo(w.method) : null,
    }));
    return (
  <div className="min-h-screen bg-white pb-24 text-slate-900">
    <TopHeader />

    {/* HEADER */}
    <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
      <button
        onClick={() => navigate(-1)}
        className="flex h-9 w-9 items-center justify-center"
      >
        <ArrowLeft size={22} strokeWidth={2} />
      </button>
      <h1 className="flex-1 text-[17px] font-bold">Rút tiền</h1>
      <button
        onClick={() => navigate("/withdraw/history")}
        className="flex h-9 items-center gap-1.5 rounded-full bg-slate-100 px-3"
      >
        <History size={15} strokeWidth={2.2} className="text-slate-700" />
        <span className="text-[12px] font-semibold text-slate-700">
          Lịch sử
        </span>
      </button>
    </div>

    <div className="mx-auto max-w-2xl">
      {/* SEARCH BOX */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
          <Search size={18} className="shrink-0 text-slate-400" strokeWidth={2.4} />
          <input
            type="text"
            inputMode="numeric"
            value={amount ? Number(amount).toLocaleString("vi-VN") : ""}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            placeholder="Nhập số tiền muốn rút"
            className="flex-1 bg-transparent text-[14px] font-semibold outline-none placeholder:font-normal placeholder:text-slate-400"
          />
          {amount && (
            <button
              onClick={() => setAmount("")}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200"
            >
              <X size={12} strokeWidth={2.6} />
            </button>
          )}
        </div>

        {/* Quick amount */}
        <div className="mt-2.5 grid grid-cols-4 gap-2">
          {QUICK_AMOUNTS.map((v) => (
            <button
              key={v}
              onClick={() => setAmount(String(v))}
              className={`rounded-xl border py-2.5 text-[12px] font-bold transition ${
                amount === String(v)
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {v / 1000}K
            </button>
          ))}
        </div>
      </div>

      {/* SỐ DƯ */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3.5">
          <span className="text-[13px] text-slate-500">Số dư khả dụng</span>
          <span className="text-[15px] font-bold text-slate-900">
            {formatMoney(profile?.coins || 0)}
          </span>
        </div>
      </div>

      {/* RÚT TIỀN ĐẾN */}
      <div className="px-4 pt-5">
        <h3 className="text-[14px] font-bold text-slate-900">
          Rút tiền đến
        </h3>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {/* Ví điện tử */}
          <button
            onClick={openPickWallet}
            className="flex items-center gap-3 rounded-2xl border-2 border-pink-100 bg-pink-50/60 p-4 text-left transition active:scale-[0.98]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-500">
              <Smartphone size={18} className="text-white" strokeWidth={2.4} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-pink-900">
                Ví điện tử
              </p>
              <p className="mt-0.5 truncate text-[11px] text-pink-700">
                MoMo, ZaloPay...
              </p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-pink-500" />
          </button>

          {/* Ngân hàng */}
          <button
            onClick={openPickBank}
            className="flex items-center gap-3 rounded-2xl border-2 border-sky-100 bg-sky-50/60 p-4 text-left transition active:scale-[0.98]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500">
              <Building2 size={18} className="text-white" strokeWidth={2.4} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-sky-900">Ngân hàng</p>
              <p className="mt-0.5 truncate text-[11px] text-sky-700">
                Vietcombank, MB...
              </p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-sky-500" />
          </button>
        </div>
      </div>

      {/* NGÂN HÀNG PHỔ BIẾN — scroll ngang */}
      <div className="pt-5">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-[14px] font-bold text-slate-900">
            Ngân hàng phổ biến
          </h3>
          <button
            onClick={openPickBank}
            className="text-[12px] font-bold text-sky-500"
          >
            Xem tất cả
          </button>
        </div>

        <div className="mt-3 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TOP_BANKS.map((code) => {
            const bank = getBankInfo(code);
            if (!bank) return null;
            return (
              <button
                key={code}
                onClick={() => {
                  setSelectedMethod({ type: "bank", code });
                  setModalStep("form");
                }}
                className="flex w-[68px] shrink-0 flex-col items-center gap-2 transition active:scale-95"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-100 bg-white shadow-sm">
                  <img
                    src={getImageUrl(bank.logo)}
                    alt=""
                    className="h-8 w-8 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement.innerHTML = `<span style="color:#0A2540;font-weight:900;font-size:11px">${bank.code}</span>`;
                    }}
                  />
                </div>
                <span className="w-full truncate text-center text-[10.5px] font-semibold text-slate-700">
                  {bank.code === "TCB" ? "Techcombank" : bank.code === "VTB" ? "VietinBank" : bank.code === "VPB" ? "VPBank" : bank.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RÚT NHANH — List đã lưu */}
      {savedCards.length > 0 && (
        <div className="pt-6">
          <h3 className="px-4 text-[14px] font-bold text-slate-900">
            Rút nhanh
          </h3>
          <div className="mt-3 space-y-2 px-4">
            {savedCards.map((w, idx) => {
              const bank = w.bankInfo;
              const wallet = w.walletInfo;
              const label = bank ? bank.name : wallet ? wallet.name : "Ví";
              const logo = bank ? bank.logo : wallet?.logo;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedMethod({
                      type: w.method === "bank" ? "bank" : "wallet",
                      code: w.bank_code,
                      wallet: w.method !== "bank" ? w.method : null,
                    });
                    setAccountNumber(w.account_number || "");
                    setAccountName(w.account_name || "");
                    setModalStep("form");
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 text-left transition active:scale-[0.99]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-white">
                    {logo ? (
                      <img
                        src={getImageUrl(logo)}
                        alt=""
                        className="h-7 w-7 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement.innerHTML = `<span style="color:#0A2540;font-weight:900;font-size:11px">${(bank?.code || "V").slice(0, 4)}</span>`;
                        }}
                      />
                    ) : (
                      <Smartphone size={18} className="text-slate-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-bold text-slate-900">
                      {label} - ****{(w.account_number || "").slice(-3)}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] uppercase text-slate-500">
                      {w.account_name}
                    </p>
                  </div>
                  <Clock3 size={18} className="shrink-0 text-slate-300" strokeWidth={2.2} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* DỊCH VỤ KHÁC */}
<div className="pt-6 pb-6">
  <h3 className="px-4 text-[14px] font-bold text-slate-900">
    Dịch vụ khác
  </h3>

  <div className="mt-3 grid grid-cols-3 gap-3 px-4">
    {[
      { icon: History, label: "Lịch sử", href: "/withdraw/history", color: "#FE2C55" },
      { icon: Wallet, label: "Ví của tôi", href: "/wallet", color: "#0EA5E9" },
      { icon: Gift, label: "Nạp tiền", href: "/store", color: "#10B981" },
      { icon: Headphones, label: "Trợ giúp", href: "/support", color: "#8B5CF6" },
      { icon: Trophy, label: "Ưu đãi", href: "/tasks", color: "#F59E0B" },
      { icon: Users, label: "Bạn bè", href: "/invite", color: "#EC4899" },
    ].map((item, idx) => {
      const Icon = item.icon;
      return (
        <button
          key={idx}
          onClick={() => navigate(item.href)}
          className="flex flex-col items-center gap-2 transition active:scale-95"
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${item.color}15` }}
          >
            <Icon
              size={22}
              style={{ color: item.color }}
              strokeWidth={2.2}
            />
          </div>
          <span className="text-[11px] font-semibold text-slate-700">
            {item.label}
          </span>
        </button>
      );
    })}
  </div>
</div>
          {/* MODAL */}
      {modalStep && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={closeModal}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] flex-col overflow-hidden rounded-t-3xl bg-white">
            {/* MODAL HEADER */}
            <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-4 py-3.5">
              {modalStep !== "pickWallet" && (
                <button
                  onClick={goBackModal}
                  className="flex h-8 w-8 items-center justify-center"
                >
                  <ArrowLeft size={20} strokeWidth={2.2} />
                </button>
              )}
              <h3 className="flex-1 text-[16px] font-bold text-slate-900">
                {modalStep === "pickWallet" && "Chọn ví điện tử"}
                {modalStep === "pickBank" && "Chọn ngân hàng"}
                {modalStep === "form" && "Nhập thông tin rút"}
              </h3>
              <button
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100"
              >
                <X size={16} strokeWidth={2.4} />
              </button>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto">
              {/* STEP 1: PICK WALLET */}
              {modalStep === "pickWallet" && (
                <div className="p-4 space-y-2">
                  {WALLETS.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => chooseWallet(w.id)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 text-left transition hover:bg-slate-50 active:scale-[0.99]"
                    >
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: `${w.color}15` }}
                      >
                        <img
                          src={getImageUrl(w.logo)}
                          alt=""
                          className="h-7 w-7 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement.innerHTML = `<span style="color:${w.color};font-weight:900;font-size:13px">${w.name.slice(0,2)}</span>`;
                          }}
                        />
                      </div>
                      <span className="flex-1 text-[15px] font-bold text-slate-900">
                        {w.name}
                      </span>
                      <ChevronRight size={18} className="text-slate-400" />
                    </button>
                  ))}
                </div>
              )}

              {/* STEP 2: PICK BANK */}
              {modalStep === "pickBank" && (
                <div className="p-4">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
                    <Search size={16} className="shrink-0 text-slate-400" />
                    <input
                      type="text"
                      value={bankSearch}
                      onChange={(e) => setBankSearch(e.target.value)}
                      placeholder="Tìm ngân hàng..."
                      className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-slate-400"
                    />
                    {bankSearch && (
                      <button
                        onClick={() => setBankSearch("")}
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200"
                      >
                        <X size={11} strokeWidth={2.6} />
                      </button>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-4 gap-2.5">
                    {filteredBanks.map((bank) => (
                      <button
                        key={bank.code}
                        onClick={() => chooseBank(bank.code)}
                        className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-white p-2.5 transition hover:border-sky-200 active:scale-95"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-100 bg-white">
                          <img
                            src={getImageUrl(bank.logo)}
                            alt=""
                            className="h-7 w-7 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.parentElement.innerHTML = `<span style="color:#0A2540;font-weight:900;font-size:11px">${bank.code}</span>`;
                            }}
                          />
                        </div>
                        <span className="line-clamp-2 text-center text-[10px] font-semibold leading-tight text-slate-700">
                          {bank.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  {filteredBanks.length === 0 && (
                    <div className="py-10 text-center text-[13px] text-slate-400">
                      Không tìm thấy ngân hàng
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: FORM */}
              {modalStep === "form" && selectedMethod && (
                <div className="space-y-4 p-4">
                  {/* Selected info */}
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-white">
                      {selectedMethod.type === "bank" ? (
                        <img
                          src={getImageUrl(getBankInfo(selectedMethod.code)?.logo)}
                          alt=""
                          className="h-7 w-7 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement.innerHTML = `<span style="color:#0A2540;font-weight:900;font-size:11px">${selectedMethod.code}</span>`;
                          }}
                        />
                      ) : (
                        <img
                          src={getImageUrl(getWalletInfo(selectedMethod.wallet)?.logo)}
                          alt=""
                          className="h-7 w-7 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement.innerHTML = '<span style="font-size:16px">📱</span>';
                          }}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-slate-500">Rút qua</p>
                      <p className="text-[14px] font-bold text-slate-900">
                        {selectedMethod.type === "bank"
                          ? getBankInfo(selectedMethod.code)?.name
                          : getWalletInfo(selectedMethod.wallet)?.name}
                      </p>
                    </div>
                  </div>

                  {/* Số tiền */}
                  <div>
                    <label className="text-[13px] font-semibold text-slate-700">
                      Số tiền rút
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={amount ? Number(amount).toLocaleString("vi-VN") : ""}
                      onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                      placeholder="Nhập số tiền"
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-[16px] font-bold outline-none focus:border-slate-900"
                    />
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {QUICK_AMOUNTS.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setAmount(String(v))}
                          className={`rounded-lg border py-2 text-[11.5px] font-bold transition ${
                            amount === String(v)
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          {v / 1000}K
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Số TK */}
                  <div>
                    <label className="text-[13px] font-semibold text-slate-700">
                      {selectedMethod.type === "bank"
                        ? "Số tài khoản"
                        : "Số điện thoại ví"}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder={
                        selectedMethod.type === "bank"
                          ? "Nhập số tài khoản"
                          : "Nhập SĐT ví"
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-[15px] font-semibold outline-none focus:border-slate-900"
                    />
                  </div>

                  {/* Tên */}
                  <div>
                    <label className="text-[13px] font-semibold text-slate-700">
                      Tên chủ tài khoản
                    </label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                      placeholder="NGUYEN VAN A"
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-[15px] font-semibold uppercase outline-none focus:border-slate-900"
                    />
                  </div>

                  {/* SĐT */}
                  <div>
                    <label className="text-[13px] font-semibold text-slate-700">
                      SĐT liên hệ
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="0865245988"
                      maxLength={11}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-[15px] font-semibold outline-none focus:border-slate-900"
                    />
                  </div>

                  {/* Tổng kết */}
                  {numericAmount > 0 && (
                    <div className="space-y-2 rounded-2xl bg-slate-50 p-4 text-[13px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tiền rút</span>
                        <span className="font-bold">{formatMoney(numericAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Phí</span>
                        <span className="font-bold text-rose-600">-{formatMoney(FEE)}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-2">
                        <span className="font-bold text-slate-900">Tổng trừ</span>
                        <span className="text-[15px] font-black">
                          {formatMoney(totalDeduct)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[12px]">
                        <span className="text-slate-500">Còn lại</span>
                        <span
                          className={`font-bold ${
                            remaining < 0 ? "text-rose-600" : "text-slate-700"
                          }`}
                        >
                          {formatMoney(remaining)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Notifications */}
                  {error && (
                    <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[12.5px] text-rose-700">
                      <AlertCircle size={14} className="mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                  {success && (
                    <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[12.5px] text-emerald-700">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                      <span>{success}</span>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !numericAmount}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 text-[15px] font-bold text-white transition active:scale-[0.99] disabled:opacity-40"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      "Xác nhận rút tiền"
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
            <BottomNav />
    </div>
  );
    }
