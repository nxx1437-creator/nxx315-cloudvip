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
const MAX_PER_MONTH = 3000000;
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

const HOT_BANKS = ["VCB", "TCB", "MB", "BIDV"];
const WALLETS = ["momo", "zalopay", "viettelpay"];

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000];

function formatMoney(v) {
  return new Intl.NumberFormat("vi-VN").format(Number(v || 0)) + "đ";
}

function getBankInfo(code) {
  return BANKS.find((b) => b.code === code);
}

export default function Withdraw() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);

  // Modal state
  const [modalType, setModalType] = useState(null); // 'bank' | 'wallet' | 'all'
  const [modalBankCode, setModalBankCode] = useState(null);
  const [modalWallet, setModalWallet] = useState(null);

  // Form state
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [saveAccount, setSaveAccount] = useState(true);

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
        setError("Vui lòng đăng nhập để rút tiền.");
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

  const rateLimit = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayList = withdrawals.filter((w) => new Date(w.created_at) >= today);

    return {
      todayCount: todayList.length,
      todayAmount: todayList.reduce((s, w) => s + w.amount, 0),
    };
  }, [withdrawals]);

  const closeModal = () => {
    setModalType(null);
    setModalBankCode(null);
    setModalWallet(null);
    setAmount("");
    setAccountNumber("");
    setAccountName("");
    setContactPhone("");
    setError("");
    setSuccess("");
  };

  const openBank = (code) => {
    setModalType("bank");
    setModalBankCode(code);
  };

  const openWallet = (type) => {
    setModalType("wallet");
    setModalWallet(type);
  };

  const openAllBanks = () => {
    setModalType("all");
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    const isBank = modalType === "bank" || (modalType === "all" && modalBankCode);
    const numericAmount = Number(amount) || 0;
    const totalDeduct = numericAmount + FEE;

    if (numericAmount < MIN_AMOUNT)
      return setError(`Số tiền rút tối thiểu ${formatMoney(MIN_AMOUNT)}.`);
    if (numericAmount > MAX_AMOUNT)
      return setError(`Số tiền rút tối đa ${formatMoney(MAX_AMOUNT)} / lần.`);
    if (totalDeduct > (profile?.coins || 0))
      return setError(
        `Số dư không đủ. Cần ${formatMoney(totalDeduct)} (đã gồm phí ${formatMoney(FEE)}).`
      );
    if (rateLimit.todayCount >= MAX_TIMES_PER_DAY)
      return setError(`Đã đạt giới hạn ${MAX_TIMES_PER_DAY} lần/ngày.`);
    if (rateLimit.todayAmount + numericAmount > MAX_PER_DAY)
      return setError(`Vượt giới hạn ${formatMoney(MAX_PER_DAY)}/ngày.`);
    if (!accountNumber.trim()) return setError("Vui lòng nhập số tài khoản / SĐT ví.");
    if (!accountName.trim()) return setError("Vui lòng nhập tên chủ tài khoản.");
    if (!/^[0-9]{10,11}$/.test(contactPhone.trim()))
      return setError("SĐT liên hệ không hợp lệ.");

    setSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Chưa đăng nhập");

      const method = isBank ? "bank" : modalWallet;
      const bankCode = isBank ? modalBankCode : null;

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
            save_account: saveAccount,
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

      setTimeout(() => {
        closeModal();
      }, 2000);
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
        <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
      </div>
    </div>
  );
}

if (!user) {
  return (
    <div className="min-h-screen bg-white pb-24">
      <TopHeader />
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <AlertCircle size={40} className="mx-auto text-rose-500" strokeWidth={2} />
        <h2 className="mt-4 text-lg font-bold">Vui lòng đăng nhập</h2>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 rounded-xl bg-[#0A2540] px-6 py-3 font-bold text-white"
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
}

return (
  <div className="min-h-screen bg-slate-50 pb-24 text-slate-900">
    <TopHeader />

    <div className="mx-auto w-full max-w-2xl">
      {/* HEADER NAVY */}
      <div className="bg-[#0A2540] px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white"
          >
            <ArrowLeft size={20} strokeWidth={2.4} />
          </button>
          <h1 className="flex-1 text-[16px] font-bold tracking-tight text-white">
            Rút tiền về ngân hàng
          </h1>
          <button
            onClick={() => navigate("/withdraw/history")}
            className="flex h-9 items-center gap-1.5 rounded-full bg-white/10 px-3 text-white"
          >
            <History size={15} strokeWidth={2.4} />
            <span className="text-[12px] font-bold">Lịch sử</span>
          </button>
        </div>
      </div>

      {/* CARD SỐ DƯ — GRADIENT XANH BIỂN */}
      <div className="px-4 pt-4">
        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 p-5 shadow-[0_12px_32px_rgba(14,165,233,0.3)]">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-white/10" />

          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Wallet size={16} className="text-white" strokeWidth={2.4} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">
                Số dư khả dụng
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-[34px] font-black leading-none text-white drop-shadow-sm">
                {Number(profile?.coins || 0).toLocaleString("vi-VN")}
              </span>
              <span className="text-[14px] font-bold text-white/80">xu</span>
            </div>
            <p className="mt-1 text-[13px] text-white/80">
              ≈ {formatMoney(profile?.coins || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* RATE LIMIT */}
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between rounded-[14px] bg-white px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <span className="text-[11.5px] font-bold uppercase tracking-wide text-slate-500">
            Hôm nay
          </span>
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-bold text-sky-600">
              {rateLimit.todayCount}/{MAX_TIMES_PER_DAY} lần
            </span>
            <span className="text-[12px] font-bold text-sky-600">
              {formatMoney(rateLimit.todayAmount)}/{formatMoney(MAX_PER_DAY)}
            </span>
          </div>
        </div>
      </div>

      {/* CARD 8 ICON */}
      <div className="px-4 pt-4">
        <div className="rounded-[20px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
          <h3 className="text-[13px] font-black uppercase tracking-wider text-slate-500">
            Chọn kênh rút tiền
          </h3>

          {/* Hàng 1: 4 bank hot */}
          <div className="mt-4 grid grid-cols-4 gap-3">
            {HOT_BANKS.map((code) => {
              const bank = getBankInfo(code);
              if (!bank) return null;
              return (
                <button
                  key={code}
                  onClick={() => openBank(code)}
                  className="flex flex-col items-center gap-2 transition active:scale-95"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 ring-1 ring-sky-100">
                    <img
                      src={getImageUrl(bank.logo)}
                      alt={bank.name}
                      className="h-8 w-8 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement.innerHTML = `<span style="color:#0EA5E9;font-weight:900;font-size:13px">${bank.code}</span>`;
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">
                    {code}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Hàng 2: 3 ví + Tất cả */}
          <div className="mt-4 grid grid-cols-4 gap-3">
            <button
              onClick={() => openWallet("momo")}
              className="flex flex-col items-center gap-2 transition active:scale-95"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 ring-1 ring-pink-100">
                <img
                  src={getImageUrl("momo.png")}
                  alt="MoMo"
                  className="h-8 w-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement.innerHTML = '<span style="font-size:24px">📱</span>';
                  }}
                />
              </div>
              <span className="text-[11px] font-bold text-slate-700">MoMo</span>
            </button>

            <button
              onClick={() => openWallet("zalopay")}
              className="flex flex-col items-center gap-2 transition active:scale-95"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 ring-1 ring-blue-100">
                <img
                  src={getImageUrl("zalopay.png")}
                  alt="ZaloPay"
                  className="h-8 w-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement.innerHTML = '<span style="font-size:24px">💵</span>';
                  }}
                />
              </div>
              <span className="text-[11px] font-bold text-slate-700">ZaloPay</span>
            </button>

            <button
              onClick={() => openWallet("viettelpay")}
              className="flex flex-col items-center gap-2 transition active:scale-95"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 ring-1 ring-red-100">
                <img
                  src={getImageUrl("viettelpay.png")}
                  alt="ViettelPay"
                  className="h-8 w-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement.innerHTML = '<span style="font-size:24px">📲</span>';
                  }}
                />
              </div>
              <span className="text-[11px] font-bold text-slate-700">VTM</span>
            </button>

            <button
              onClick={openAllBanks}
              className="flex flex-col items-center gap-2 transition active:scale-95"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                <Building2 size={22} className="text-slate-600" strokeWidth={2.2} />
              </div>
              <span className="text-[11px] font-bold text-slate-700">Tất cả</span>
            </button>
          </div>
        </div>
      </div>

      {/* BANNER INFO */}
      <div className="px-4 pt-4 pb-8">
        <div className="flex items-start gap-2.5 rounded-[14px] bg-sky-100/60 p-3.5">
          <Info size={15} className="mt-0.5 shrink-0 text-sky-600" strokeWidth={2.4} />
          <p className="text-[12px] font-medium leading-5 text-sky-800">
            Chọn kênh rút tiền phù hợp. Tiền sẽ được chuyển trong vòng 24h sau khi admin duyệt.
          </p>
        </div>
      </div>
    </div>
          {/* MODAL */}
      {modalType && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={closeModal}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-hidden rounded-t-[24px] bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                {modalType === "bank" && modalBankCode && (
                  <>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50">
                      <img
                        src={getImageUrl(getBankInfo(modalBankCode)?.logo)}
                        alt=""
                        className="h-6 w-6 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement.innerHTML = `<span style="color:#0EA5E9;font-weight:900;font-size:11px">${modalBankCode}</span>`;
                        }}
                      />
                    </div>
                    <h3 className="text-[15px] font-black text-slate-900">
                      Rút qua {getBankInfo(modalBankCode)?.name}
                    </h3>
                  </>
                )}

                {modalType === "wallet" && modalWallet && (
                  <>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                      <Smartphone size={18} className="text-slate-600" />
                    </div>
                    <h3 className="text-[15px] font-black text-slate-900">
                      Rút qua {modalWallet === "momo" ? "MoMo" : modalWallet === "zalopay" ? "ZaloPay" : "ViettelPay"}
                    </h3>
                  </>
                )}

                {modalType === "all" && (
                  <h3 className="text-[15px] font-black text-slate-900">
                    Chọn ngân hàng
                  </h3>
                )}
              </div>

              <button
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600"
              >
                <X size={16} strokeWidth={2.4} />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto px-5 py-4">
              {/* LIST ALL BANKS */}
              {modalType === "all" && (
                <div className="grid grid-cols-2 gap-2.5">
                  {BANKS.map((bank) => (
                    <button
                      key={bank.code}
                      onClick={() => {
                        setModalBankCode(bank.code);
                        setModalType("bank");
                      }}
                      className="flex items-center gap-3 rounded-xl border-2 border-slate-100 bg-white p-3 text-left transition hover:border-sky-200 active:scale-[0.98]"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                        <img
                          src={getImageUrl(bank.logo)}
                          alt=""
                          className="h-7 w-7 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement.innerHTML = `<span style="color:#0EA5E9;font-weight:900;font-size:11px">${bank.code}</span>`;
                          }}
                        />
                      </div>
                      <span className="min-w-0 flex-1 truncate text-[12.5px] font-bold text-slate-800">
                        {bank.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* FORM */}
              {(modalType === "bank" || modalType === "wallet") && (
                <div className="space-y-4">
                  {/* Số tiền */}
                  <div>
                    <label className="text-[12.5px] font-black uppercase tracking-wider text-slate-500">
                      Số tiền rút
                    </label>
                    <div className="relative mt-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={amount ? Number(amount).toLocaleString("vi-VN") : ""}
                        onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                        placeholder="0"
                        className="w-full rounded-[14px] border-2 border-slate-100 bg-slate-50 px-4 py-3.5 pr-14 text-[18px] font-black text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-slate-400">
                        VNĐ
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {QUICK_AMOUNTS.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setAmount(String(v))}
                          className={`rounded-lg border py-2 text-[11.5px] font-black transition ${
                            amount === String(v)
                              ? "border-sky-500 bg-sky-500 text-white"
                              : "border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          {v / 1000}K
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* STK */}
                  <div>
                    <label className="text-[12.5px] font-bold text-slate-700">
                      {modalType === "bank" ? "Số tài khoản" : "Số điện thoại ví"}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder={modalType === "bank" ? "Nhập số tài khoản" : "Nhập SĐT ví"}
                      className="mt-2 w-full rounded-[14px] border-2 border-slate-100 bg-slate-50 px-4 py-3 text-[15px] font-bold outline-none transition focus:border-sky-500 focus:bg-white"
                    />
                  </div>

                  {/* Tên */}
                  <div>
                    <label className="text-[12.5px] font-bold text-slate-700">
                      Tên chủ tài khoản
                    </label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                      placeholder="NGUYEN VAN A"
                      className="mt-2 w-full rounded-[14px] border-2 border-slate-100 bg-slate-50 px-4 py-3 text-[15px] font-bold uppercase outline-none transition focus:border-sky-500 focus:bg-white"
                    />
                  </div>

                  {/* SĐT */}
                  <div>
                    <label className="text-[12.5px] font-bold text-slate-700">
                      SĐT liên hệ
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="0865245988"
                      maxLength={11}
                      className="mt-2 w-full rounded-[14px] border-2 border-slate-100 bg-slate-50 px-4 py-3 text-[15px] font-bold outline-none transition focus:border-sky-500 focus:bg-white"
                    />
                  </div>

                  {/* Save */}
                  <label className="flex cursor-pointer items-center gap-3 rounded-[14px] bg-slate-50 p-3">
                    <input
                      type="checkbox"
                      checked={saveAccount}
                      onChange={(e) => setSaveAccount(e.target.checked)}
                      className="h-4 w-4 accent-sky-500"
                    />
                    <span className="text-[12.5px] font-bold text-slate-700">
                      Lưu thông tin cho lần sau
                    </span>
                  </label>

                  {/* Tổng kết */}
                  {Number(amount) > 0 && (
                    <div className="rounded-[14px] border-2 border-dashed border-sky-200 bg-sky-50/50 p-3.5">
                      <div className="space-y-1.5 text-[12.5px]">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Tiền rút:</span>
                          <span className="font-bold">{formatMoney(amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Phí:</span>
                          <span className="font-bold text-rose-600">-{formatMoney(FEE)}</span>
                        </div>
                        <div className="flex justify-between border-t border-sky-200 pt-1.5">
                          <span className="font-bold text-slate-800">Tổng trừ:</span>
                          <span className="font-black text-sky-600">
                            {formatMoney(Number(amount) + FEE)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error/Success */}
                  {error && (
                    <div className="flex items-start gap-2 rounded-[12px] border border-rose-200 bg-rose-50 p-3 text-[12.5px] text-rose-700">
                      <AlertCircle size={14} className="mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                  {success && (
                    <div className="flex items-start gap-2 rounded-[12px] border border-emerald-200 bg-emerald-50 p-3 text-[12.5px] text-emerald-700">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                      <span>{success}</span>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !Number(amount)}
                    className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-sky-500 to-blue-600 py-4 text-[14px] font-black uppercase tracking-wide text-white shadow-[0_8px_24px_rgba(14,165,233,0.3)] transition active:scale-[0.98] disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      "XÁC NHẬN RÚT TIỀN"
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
                      }
