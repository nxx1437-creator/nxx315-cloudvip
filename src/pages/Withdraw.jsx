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
  Zap,
  Shield,
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

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000];

function formatMoney(v) {
  return new Intl.NumberFormat("vi-VN").format(Number(v || 0)) + "đ";
}

function getBankInfo(code) {
  return BANKS.find((b) => b.code === code) || BANKS[0];
}

export default function Withdraw() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank");
  const [bankCode, setBankCode] = useState("VCB");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [saveAccount, setSaveAccount] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);

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
      setError("Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  const numericAmount = Number(amount) || 0;
  const totalDeduct = numericAmount + FEE;
  const remaining = (profile?.coins || 0) - totalDeduct;

  const rateLimit = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const todayList = withdrawals.filter((w) => new Date(w.created_at) >= today);
    const monthList = withdrawals.filter((w) => new Date(w.created_at) >= thisMonth);

    return {
      todayCount: todayList.length,
      todayAmount: todayList.reduce((s, w) => s + w.amount, 0),
      monthAmount: monthList.reduce((s, w) => s + w.amount, 0),
    };
  }, [withdrawals]);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!user) return setError("Vui lòng đăng nhập.");
    if (numericAmount < MIN_AMOUNT)
      return setError(`Số tiền rút tối thiểu ${formatMoney(MIN_AMOUNT)}.`);
    if (numericAmount > MAX_AMOUNT)
      return setError(`Số tiền rút tối đa ${formatMoney(MAX_AMOUNT)} / lần.`);
    if (totalDeduct > (profile?.coins || 0))
      return setError(
        `Số dư không đủ. Cần ${formatMoney(totalDeduct)} (đã gồm phí ${formatMoney(FEE)}).`
      );
    if (rateLimit.todayCount >= MAX_TIMES_PER_DAY)
      return setError(`Đã đạt giới hạn ${MAX_TIMES_PER_DAY} lần rút/ngày.`);
    if (rateLimit.todayAmount + numericAmount > MAX_PER_DAY)
      return setError(`Vượt giới hạn ${formatMoney(MAX_PER_DAY)}/ngày.`);
    if (rateLimit.monthAmount + numericAmount > MAX_PER_MONTH)
      return setError(`Vượt giới hạn ${formatMoney(MAX_PER_MONTH)}/tháng.`);
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
            bank_code: method === "bank" ? bankCode : null,
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

      setSuccess(`Đã gửi yêu cầu rút ${formatMoney(data.amount)}. Vui lòng chờ 24h.`);
      setAmount("");
      setAccountNumber("");
      setAccountName("");
      await loadData();
    } catch (err) {
      console.error("Submit error:", err);
      setError(err?.message || "Không thể gửi yêu cầu.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-50 pb-24">
        <TopHeader />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-sky-50 pb-24">
        <TopHeader />
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <AlertCircle size={40} className="mx-auto text-rose-500" strokeWidth={2} />
          <h2 className="mt-4 text-lg font-bold">Vui lòng đăng nhập</h2>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 rounded-xl bg-sky-500 px-6 py-3 font-bold text-white"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  const bankInfo = getBankInfo(bankCode);
  return (
  <div className="min-h-screen bg-sky-50 pb-24 text-slate-900">
    <TopHeader />

    <div className="mx-auto w-full max-w-2xl">
      {/* HEADER */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <ArrowLeft size={20} strokeWidth={2.4} />
        </button>
        <h1 className="flex-1 text-[17px] font-black tracking-tight">
          Rút tiền về ngân hàng
        </h1>
        <button
          onClick={() => navigate("/withdraw/history")}
          className="flex h-9 items-center gap-1.5 rounded-full bg-white px-3 shadow-sm"
        >
          <History size={15} strokeWidth={2.4} className="text-sky-500" />
          <span className="text-[12px] font-bold text-sky-600">Lịch sử</span>
        </button>
      </div>

      {/* CARD SỐ DƯ — GRADIENT XANH BIỂN */}
      <div className="px-4">
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 p-5 shadow-[0_12px_32px_rgba(14,165,233,0.3)]">
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
              <span className="text-[36px] font-black leading-none text-white drop-shadow-sm">
                {Number(profile?.coins || 0).toLocaleString("vi-VN")}
              </span>
              <span className="text-[15px] font-bold text-white/80">xu</span>
            </div>
            <p className="mt-1 text-[13px] text-white/80">
              ≈ {formatMoney(profile?.coins || 0)}
            </p>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 backdrop-blur-sm">
              <Zap size={13} className="text-yellow-300" strokeWidth={2.6} />
              <span className="text-[11.5px] font-bold text-white">
                Rút tối đa {formatMoney(MAX_AMOUNT)} / lần · Phí {formatMoney(FEE)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RATE LIMIT */}
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between rounded-[16px] bg-white px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 text-slate-500">
            <Shield size={14} strokeWidth={2.4} />
            <span className="text-[11.5px] font-bold uppercase tracking-wide">
              Hôm nay
            </span>
          </div>
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

      {/* THÔNG BÁO */}
      {(error || success) && (
        <div className="px-4 pt-3">
          {error && (
            <div className="flex items-start gap-2 rounded-[16px] border border-rose-200 bg-rose-50 p-3.5 text-[13px] text-rose-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 rounded-[16px] border border-emerald-200 bg-emerald-50 p-3.5 text-[13px] text-emerald-700">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </div>
      )}

      {/* TAB PHƯƠNG THỨC — bo tròn, active có màu */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { key: "bank", icon: Building2, label: "Ngân hàng", desc: "1-3 ngày", logo: null, color: "#0EA5E9" },
            { key: "momo", icon: Smartphone, label: "MoMo", desc: "24h", logo: "momo.png", color: "#A50064" },
            { key: "zalopay", icon: Smartphone, label: "ZaloPay", desc: "24h", logo: "zalopay.png", color: "#0068FF" },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = method === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setMethod(item.key)}
                className={`relative flex flex-col items-center gap-1.5 rounded-[16px] border-2 py-3 transition ${
                  isActive
                    ? "border-sky-500 bg-white shadow-[0_4px_12px_rgba(14,165,233,0.15)]"
                    : "border-transparent bg-white/60 hover:bg-white"
                }`}
              >
                {item.logo ? (
                  <img
                    src={getImageUrl(item.logo)}
                    alt={item.label}
                    className="h-7 w-7 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${isActive ? "#0EA5E9" : "#94a3b8"}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>`;
                    }}
                  />
                ) : (
                  <Icon
                    size={24}
                    className={isActive ? "text-sky-500" : "text-slate-400"}
                    strokeWidth={2.2}
                  />
                )}
                <span
                  className={`text-[12px] font-black ${
                    isActive ? "text-sky-600" : "text-slate-600"
                  }`}
                >
                  {item.label}
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  {item.desc}
                </span>
                {isActive && (
                  <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500">
                    <CheckCircle2 size={12} className="text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SỐ TIỀN */}
      <div className="px-4 pt-4">
        <div className="rounded-[20px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
          <label className="text-[12px] font-black uppercase tracking-wider text-slate-500">
            Số tiền muốn rút
          </label>

          <div className="mt-3 rounded-[16px] bg-sky-50 px-4 py-4">
            <input
              type="text"
              inputMode="numeric"
              value={amount ? Number(amount).toLocaleString("vi-VN") : ""}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              placeholder="0"
              className="w-full bg-transparent text-center text-[32px] font-black text-sky-600 outline-none placeholder:text-slate-300"
            />
            <p className="mt-1 text-center text-[12px] font-bold uppercase tracking-wider text-slate-400">
              VNĐ
            </p>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(String(v))}
                className={`rounded-[10px] border-2 py-2.5 text-[12px] font-black transition ${
                  amount === String(v)
                    ? "border-sky-500 bg-sky-500 text-white"
                    : "border-sky-100 bg-sky-50 text-sky-600 hover:border-sky-300"
                }`}
              >
                {v / 1000}K
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FORM THÔNG TIN */}
      <div className="px-4 pt-4">
        <div className="space-y-4 rounded-[20px] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
          <h3 className="text-[13px] font-black uppercase tracking-wider text-slate-500">
            Thông tin nhận tiền
          </h3>

          {method === "bank" && (
            <div>
              <label className="text-[12.5px] font-bold text-slate-700">
                Ngân hàng
              </label>
              <button
                type="button"
                onClick={() => setShowBankModal(true)}
                className="mt-2 flex w-full items-center gap-3 rounded-[14px] border-2 border-sky-100 bg-sky-50 px-3.5 py-3 text-left transition hover:border-sky-300"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  <img
                    src={getImageUrl(bankInfo.logo)}
                    alt=""
                    className="h-6 w-6 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement.innerHTML = `<span style="color:#0EA5E9;font-weight:900;font-size:11px">${bankInfo.code}</span>`;
                    }}
                  />
                </div>
                <span className="min-w-0 flex-1 truncate text-[14px] font-black text-slate-800">
                  {bankInfo.name}
                </span>
                <span className="shrink-0 rounded-full bg-sky-500 px-2.5 py-1 text-[10px] font-black text-white">
                  ĐỔI
                </span>
              </button>
            </div>
          )}

          <div>
            <label className="text-[12.5px] font-bold text-slate-700">
              {method === "bank" ? "Số tài khoản" : "Số điện thoại ví"}
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
              placeholder={method === "bank" ? "Nhập số tài khoản" : "Nhập SĐT ví"}
              className="mt-2 w-full rounded-[14px] border-2 border-slate-100 bg-slate-50 px-4 py-3 text-[15px] font-bold outline-none transition focus:border-sky-500 focus:bg-white"
            />
          </div>

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

          <label className="flex cursor-pointer items-center gap-3 rounded-[14px] bg-sky-50 p-3.5">
            <input
              type="checkbox"
              checked={saveAccount}
              onChange={(e) => setSaveAccount(e.target.checked)}
              className="h-5 w-5 accent-sky-500"
            />
            <span className="text-[13px] font-bold text-sky-700">
              Lưu thông tin cho lần sau
            </span>
          </label>
        </div>
      </div>
              {/* TỔNG KẾT */}
        {numericAmount > 0 && (
          <div className="px-4 pt-4">
            <div className="rounded-[20px] border-2 border-dashed border-sky-300 bg-white p-5">
              <h3 className="text-[12px] font-black uppercase tracking-wider text-sky-600">
                Tổng kết
              </h3>
              <div className="mt-3 space-y-2.5 text-[13.5px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Số tiền rút:</span>
                  <span className="font-black text-slate-900">
                    {formatMoney(numericAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Phí giao dịch:</span>
                  <span className="font-black text-rose-600">
                    -{formatMoney(FEE)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-sky-100 pt-2.5">
                  <span className="font-black text-slate-800">
                    Tổng trừ xu:
                  </span>
                  <span className="text-[16px] font-black text-sky-600">
                    {formatMoney(totalDeduct)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="text-slate-500">Số dư còn lại:</span>
                  <span
                    className={`font-black ${
                      remaining < 0 ? "text-rose-600" : "text-emerald-600"
                    }`}
                  >
                    {formatMoney(remaining)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBMIT */}
        <div className="px-4 pt-5">
          <button
            onClick={handleSubmit}
            disabled={submitting || !numericAmount}
            className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-sky-500 to-blue-600 py-4 text-[15px] font-black uppercase tracking-wide text-white shadow-[0_8px_24px_rgba(14,165,233,0.35)] transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "XÁC NHẬN RÚT TIỀN"
            )}
          </button>

          <button
            onClick={() => navigate("/withdraw/history")}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-[16px] bg-white py-3.5 text-[13px] font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <History size={15} strokeWidth={2.4} />
            Xem toàn bộ lịch sử rút tiền
          </button>
        </div>

        {/* FOOTER INFO */}
        <div className="px-4 pt-5 pb-6">
          <div className="flex items-center gap-2 rounded-[14px] bg-sky-100/50 p-3">
            <Shield size={14} className="shrink-0 text-sky-600" strokeWidth={2.4} />
            <p className="text-[11.5px] font-medium text-sky-700">
              Tiền sẽ được chuyển trong vòng 24h sau khi admin duyệt.
            </p>
          </div>
        </div>
      </div>

      {/* BANK MODAL */}
      {showBankModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setShowBankModal(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-hidden rounded-t-[24px] bg-white">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
              <h3 className="text-[16px] font-black text-slate-900">
                Chọn ngân hàng
              </h3>
              <button
                onClick={() => setShowBankModal(false)}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-bold text-slate-600"
              >
                Đóng
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-4">
              <div className="grid grid-cols-3 gap-2.5">
                {BANKS.map((bank) => {
                  const isActive = bankCode === bank.code;
                  return (
                    <button
                      key={bank.code}
                      onClick={() => {
                        setBankCode(bank.code);
                        setShowBankModal(false);
                      }}
                      className={`flex flex-col items-center gap-2 rounded-[14px] border-2 p-3 transition ${
                        isActive
                          ? "border-sky-500 bg-sky-50"
                          : "border-slate-100 bg-white hover:border-sky-200"
                      }`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                        <img
                          src={getImageUrl(bank.logo)}
                          alt={bank.name}
                          className="h-8 w-8 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement.innerHTML = `<span style="color:#0EA5E9;font-weight:900;font-size:12px">${bank.code}</span>`;
                          }}
                        />
                      </div>
                      <span
                        className={`line-clamp-2 text-center text-[11px] font-bold leading-tight ${
                          isActive ? "text-sky-600" : "text-slate-700"
                        }`}
                      >
                        {bank.name}
                      </span>
                      {isActive && (
                        <CheckCircle2
                          size={14}
                          className="text-sky-500"
                          strokeWidth={2.8}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
