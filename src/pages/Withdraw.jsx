import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Wallet,
  Building2,
  Smartphone,
  CheckCircle2,
  Clock3,
  XCircle,
  Loader2,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  History,
  Info,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { supabase } from "../lib/supabaseClient.js";

const SUPABASE_URL = "https://rwglwovohbyqmbbzdvdj.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ========== CONFIG ==========
const FEE = 2000;
const MIN_AMOUNT = 10000;
const MAX_AMOUNT = 500000;
const MAX_PER_DAY = 500000;
const MAX_PER_MONTH = 3000000;
const MAX_TIMES_PER_DAY = 5;

// ========== NGÂN HÀNG (chữ viết tắt + màu) ==========
const BANKS = [
  { code: "VCB", name: "Vietcombank", short: "VCB", color: "#007B3F" },
  { code: "TCB", name: "Techcombank", short: "TCB", color: "#E30613" },
  { code: "MB",  name: "MB Bank",     short: "MB",  color: "#1A4D8F" },
  { code: "VPB", name: "VPBank",      short: "VPB", color: "#00A651" },
  { code: "TPB", name: "TPBank",      short: "TPB", color: "#6E2585" },
  { code: "ACB", name: "ACB",         short: "ACB", color: "#0066B3" },
  { code: "BIDV", name: "BIDV",       short: "BIDV", color: "#00539B" },
  { code: "VTB", name: "VietinBank",  short: "VTB", color: "#0066A5" },
  { code: "STB", name: "Sacombank",   short: "STB", color: "#005BAA" },
  { code: "EIB", name: "Eximbank",    short: "EIB", color: "#007A33" },
  { code: "OCB", name: "OCB",         short: "OCB", color: "#F58220" },
  { code: "MSB", name: "MSB",         short: "MSB", color: "#00AEEF" },
  { code: "HDB", name: "HDBank",      short: "HDB", color: "#00A651" },
  { code: "SEAB", name: "SeABank",    short: "SEAB", color: "#E60012" },
  { code: "NAB", name: "Nam A Bank",  short: "NAB", color: "#00A0B0" },
];

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000];

const STATUS_INFO = {
  pending: { label: "Chờ duyệt", className: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock3 },
  processing: { label: "Đang xử lý", className: "bg-sky-50 text-sky-700 border-sky-200", icon: Loader2 },
  completed: { label: "Đã chuyển", className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  rejected: { label: "Từ chối", className: "bg-rose-50 text-rose-700 border-rose-200", icon: XCircle },
  cancelled: { label: "Đã hủy", className: "bg-slate-50 text-slate-600 border-slate-200", icon: XCircle },
};

// ========== HELPERS ==========
function formatMoney(v) {
  return new Intl.NumberFormat("vi-VN").format(Number(v || 0)) + "đ";
}

function formatDate(v) {
  if (!v) return "—";
  return new Date(v).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMethodLabel(method, bankCode) {
  if (method === "momo") return "Ví MoMo";
  if (method === "zalopay") return "ZaloPay";
  if (method === "bank") {
    const bank = BANKS.find((b) => b.code === bankCode);
    return bank ? bank.name : "Ngân hàng";
  }
  return method;
}

function getBankInfo(bankCode) {
  return BANKS.find((b) => b.code === bankCode) || BANKS[0];
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
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [saveAccount, setSaveAccount] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

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
        .select("coins, username, display_name, avatar_url")
        .eq("id", user.id)
        .single();

      setProfile(prof);

      const { data: hist } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

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
        `Số dư không đủ. Bạn cần ${formatMoney(totalDeduct)} (bao gồm phí ${formatMoney(FEE)}).`
      );
    if (rateLimit.todayCount >= MAX_TIMES_PER_DAY)
      return setError(`Bạn đã đạt giới hạn ${MAX_TIMES_PER_DAY} lần rút/ngày.`);
    if (rateLimit.todayAmount + numericAmount > MAX_PER_DAY)
      return setError(`Vượt giới hạn ${formatMoney(MAX_PER_DAY)}/ngày.`);
    if (rateLimit.monthAmount + numericAmount > MAX_PER_MONTH)
      return setError(`Vượt giới hạn ${formatMoney(MAX_PER_MONTH)}/tháng.`);
    if (!accountNumber.trim()) return setError("Vui lòng nhập số tài khoản / SĐT ví.");
    if (!accountName.trim()) return setError("Vui lòng nhập tên chủ tài khoản.");
    if (!/^[0-9]{10,11}$/.test(contactPhone.trim()))
      return setError("SĐT liên hệ không hợp lệ (10-11 số).");

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

      setSuccess(
        `Đã gửi yêu cầu rút ${formatMoney(data.amount)}. Vui lòng chờ trong 24h.`
      );

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
  <div className="min-h-screen bg-slate-50 pb-24 text-slate-900">
    <TopHeader />

    <div className="mx-auto w-full max-w-2xl px-4">
      {/* Header */}
      <div className="flex items-center gap-3 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft size={20} strokeWidth={2.2} />
        </button>
        <h1 className="text-[17px] font-extrabold tracking-[-0.02em]">
          Rút tiền về ngân hàng
        </h1>
      </div>

      {/* Balance card — trắng, sạch */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(14,165,233,0.06)]">
        <div className="flex items-center gap-2 text-slate-500">
          <Wallet size={16} strokeWidth={2.4} />
          <span className="text-[12px] font-semibold uppercase tracking-wider">
            Số dư khả dụng
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-[34px] font-black leading-none tracking-tight text-slate-900">
            {Number(profile?.coins || 0).toLocaleString("vi-VN")}
          </span>
          <span className="text-[15px] font-bold text-slate-400">xu</span>
        </div>
        <div className="mt-1 text-[13px] text-slate-500">
          ≈ {formatMoney(profile?.coins || 0)}
        </div>

        {/* Rate limit row */}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-sky-50 px-3.5 py-2.5">
          <div className="flex items-center gap-2 text-sky-700">
            <TrendingUp size={14} strokeWidth={2.4} />
            <span className="text-[11.5px] font-semibold">
              Hôm nay:
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11.5px] font-bold text-sky-700">
              {rateLimit.todayCount}/{MAX_TIMES_PER_DAY} lần
            </span>
            <span className="text-[11.5px] font-bold text-sky-700">
              {formatMoney(rateLimit.todayAmount)}/{formatMoney(MAX_PER_DAY)}
            </span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-[14px] border border-rose-200 bg-rose-50 p-3.5 text-[13px] text-rose-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mt-3 flex items-start gap-2 rounded-[14px] border border-emerald-200 bg-emerald-50 p-3.5 text-[13px] text-emerald-700">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Form */}
      <div className="mt-4 space-y-5 rounded-[20px] border border-slate-200 bg-white p-5">
        {/* Số tiền */}
        <div>
          <label className="text-[13.5px] font-bold text-slate-800">
            Số tiền muốn rút
          </label>
          <div className="relative mt-2">
            <input
              type="text"
              inputMode="numeric"
              value={amount ? Number(amount).toLocaleString("vi-VN") : ""}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              placeholder="Nhập số tiền"
              className="w-full rounded-[14px] border-2 border-slate-200 bg-white px-4 py-3.5 pr-14 text-[16px] font-bold outline-none transition focus:border-sky-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-slate-400">
              VNĐ
            </span>
          </div>

          <div className="mt-2.5 grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(String(v))}
                className={`rounded-[10px] border-2 py-2.5 text-[12px] font-bold transition ${
                  amount === String(v)
                    ? "border-sky-500 bg-sky-50 text-sky-600"
                    : "border-slate-200 bg-white text-slate-600 hover:border-sky-300"
                }`}
              >
                {v / 1000}K
              </button>
            ))}
          </div>
        </div>

        {/* Phương thức */}
        <div>
          <label className="text-[13.5px] font-bold text-slate-800">
            Nhận tiền qua
          </label>
          <div className="mt-2 grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setMethod("bank")}
              className={`flex flex-col items-center gap-1.5 rounded-[14px] border-2 py-3.5 transition ${
                method === "bank"
                  ? "border-sky-500 bg-sky-50"
                  : "border-slate-200 bg-white hover:border-sky-300"
              }`}
            >
              <Building2
                size={22}
                className={method === "bank" ? "text-sky-600" : "text-slate-400"}
                strokeWidth={2.2}
              />
              <span
                className={`text-[11.5px] font-bold ${
                  method === "bank" ? "text-sky-600" : "text-slate-600"
                }`}
              >
                Ngân hàng
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMethod("momo")}
              className={`flex flex-col items-center gap-1.5 rounded-[14px] border-2 py-3.5 transition ${
                method === "momo"
                  ? "border-sky-500 bg-sky-50"
                  : "border-slate-200 bg-white hover:border-sky-300"
              }`}
            >
              <Smartphone
                size={22}
                className={method === "momo" ? "text-sky-600" : "text-slate-400"}
                strokeWidth={2.2}
              />
              <span
                className={`text-[11.5px] font-bold ${
                  method === "momo" ? "text-sky-600" : "text-slate-600"
                }`}
              >
                MoMo
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMethod("zalopay")}
              className={`flex flex-col items-center gap-1.5 rounded-[14px] border-2 py-3.5 transition ${
                method === "zalopay"
                  ? "border-sky-500 bg-sky-50"
                  : "border-slate-200 bg-white hover:border-sky-300"
              }`}
            >
              <Smartphone
                size={22}
                className={method === "zalopay" ? "text-sky-600" : "text-slate-400"}
                strokeWidth={2.2}
              />
              <span
                className={`text-[11.5px] font-bold ${
                  method === "zalopay" ? "text-sky-600" : "text-slate-600"
                }`}
              >
                ZaloPay
              </span>
            </button>
          </div>
        </div>

        {/* Ngân hàng (nếu bank) — có chữ viết tắt màu */}
        {method === "bank" && (
          <div>
            <label className="text-[13.5px] font-bold text-slate-800">
              Ngân hàng
            </label>
            <button
              type="button"
              onClick={() => setShowBankPicker(true)}
              className="mt-2 flex w-full items-center gap-3 rounded-[14px] border-2 border-slate-200 bg-white px-4 py-3 text-left transition hover:border-sky-300"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-black text-white"
                style={{ backgroundColor: bankInfo.color }}
              >
                {bankInfo.short.slice(0, 3)}
              </span>
              <span className="min-w-0 flex-1 truncate text-[14px] font-bold text-slate-800">
                {bankInfo.name}
              </span>
              <ChevronDown size={16} className="shrink-0 text-slate-400" />
            </button>
          </div>
        )}

        {/* Số TK / SĐT */}
        <div>
          <label className="text-[13.5px] font-bold text-slate-800">
            {method === "bank"
              ? "Số tài khoản"
              : `Số điện thoại ${getMethodLabel(method)}`}
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
            placeholder={
              method === "bank" ? "VD: 0123456789" : "VD: 0865245988"
            }
            className="mt-2 w-full rounded-[14px] border-2 border-slate-200 bg-white px-4 py-3.5 text-[15px] font-semibold outline-none transition focus:border-sky-500"
          />
        </div>

        {/* Tên chủ TK */}
        <div>
          <label className="text-[13.5px] font-bold text-slate-800">
            Tên chủ tài khoản (in hoa không dấu)
          </label>
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value.toUpperCase())}
            placeholder="VD: NGUYEN VAN A"
            className="mt-2 w-full rounded-[14px] border-2 border-slate-200 bg-white px-4 py-3.5 text-[15px] font-semibold uppercase outline-none transition focus:border-sky-500"
          />
        </div>

        {/* SĐT liên hệ */}
        <div>
          <label className="text-[13.5px] font-bold text-slate-800">
            SĐT liên hệ
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ""))}
            placeholder="VD: 0865245988"
            maxLength={11}
            className="mt-2 w-full rounded-[14px] border-2 border-slate-200 bg-white px-4 py-3.5 text-[15px] font-semibold outline-none transition focus:border-sky-500"
          />
        </div>

        {/* Lưu thông tin */}
        <label className="flex cursor-pointer items-center gap-3 rounded-[14px] bg-slate-50 p-3.5">
          <input
            type="checkbox"
            checked={saveAccount}
            onChange={(e) => setSaveAccount(e.target.checked)}
            className="h-5 w-5 accent-sky-500"
          />
          <span className="text-[13px] font-semibold text-slate-700">
            Lưu thông tin cho lần sau
          </span>
        </label>
      </div>

      {/* Tổng kết */}
      {numericAmount > 0 && (
        <div className="mt-4 space-y-2.5 rounded-[20px] border-2 border-dashed border-sky-200 bg-sky-50/50 p-4">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-slate-600">Số tiền rút:</span>
            <span className="font-bold text-slate-900">
              {formatMoney(numericAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-slate-600">Phí giao dịch:</span>
            <span className="font-bold text-rose-600">
              -{formatMoney(FEE)}
            </span>
          </div>
          <div className="border-t border-sky-200 pt-2.5">
            <div className="flex items-center justify-between text-[14px]">
              <span className="font-bold text-slate-800">Tổng trừ xu:</span>
              <span className="font-black text-sky-600">
                {formatMoney(totalDeduct)}
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[12px]">
              <span className="text-slate-500">Số dư còn lại:</span>
              <span
                className={`font-bold ${
                  remaining < 0 ? "text-rose-600" : "text-emerald-600"
                }`}
              >
                {formatMoney(remaining)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nút submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting || !numericAmount}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-[16px] bg-sky-500 py-4 text-[15px] font-black text-white shadow-[0_6px_20px_rgba(14,165,233,0.3)] transition hover:bg-sky-600 active:scale-[0.98] disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Đang gửi yêu cầu...
          </>
        ) : (
          <>
            <Zap size={18} strokeWidth={2.4} />
            Gửi yêu cầu rút tiền
          </>
        )}
      </button>
                 {/* BANK PICKER MODAL */}
        {showBankPicker && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setShowBankPicker(false)}
            />
            <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[20px] bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h3 className="text-[15px] font-extrabold">
                  Chọn ngân hàng
                </h3>
                <button
                  onClick={() => setShowBankPicker(false)}
                  className="text-[13px] font-bold text-sky-500"
                >
                  Đóng
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {BANKS.map((bank) => (
                  <button
                    key={bank.code}
                    onClick={() => {
                      setBankCode(bank.code);
                      setShowBankPicker(false);
                    }}
                    className={`flex w-full items-center gap-3 border-b border-slate-50 px-5 py-3.5 text-left transition hover:bg-sky-50 ${
                      bankCode === bank.code ? "bg-sky-50" : ""
                    }`}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[11px] font-black text-white"
                      style={{ backgroundColor: bank.color }}
                    >
                      {bank.short.slice(0, 3)}
                    </span>
                    <span className="min-w-0 flex-1 text-[14px] font-bold text-slate-800">
                      {bank.name}
                    </span>
                    {bankCode === bank.code && (
                      <CheckCircle2
                        size={18}
                        className="shrink-0 text-sky-500"
                        strokeWidth={2.4}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* LỊCH SỬ */}
        <div className="mt-6 mb-8">
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="mb-3 flex w-full items-center gap-2"
          >
            <History size={18} className="text-slate-600" strokeWidth={2.4} />
            <h3 className="text-[15px] font-extrabold text-slate-900">
              Lịch sử rút tiền
            </h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              {withdrawals.length}
            </span>
            <ChevronDown
              size={16}
              className={`ml-auto text-slate-400 transition-transform ${
                showHistory ? "rotate-180" : ""
              }`}
            />
          </button>

          {showHistory && (
            <>
              {withdrawals.length === 0 ? (
                <div className="rounded-[16px] border border-dashed border-slate-200 bg-white py-10 text-center text-[13px] text-slate-400">
                  Chưa có yêu cầu rút nào
                </div>
              ) : (
                <div className="space-y-2.5">
                  {withdrawals.map((w) => {
                    const info = STATUS_INFO[w.status] || STATUS_INFO.pending;
                    const Icon = info.icon;
                    const bank = w.bank_code ? getBankInfo(w.bank_code) : null;

                    return (
                      <div
                        key={w.id}
                        className="rounded-[16px] border border-slate-200 bg-white p-4"
                      >
                        <div className="flex items-start gap-3">
                          {bank ? (
                            <span
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[10px] font-black text-white"
                              style={{ backgroundColor: bank.color }}
                            >
                              {bank.short.slice(0, 3)}
                            </span>
                          ) : (
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                              <Smartphone size={18} className="text-slate-500" />
                            </span>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[15px] font-black text-slate-900">
                                {formatMoney(w.amount)}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${info.className}`}
                              >
                                <Icon size={10} strokeWidth={2.6} />
                                {info.label}
                              </span>
                            </div>
                            <div className="mt-1 text-[11.5px] text-slate-500">
                              {getMethodLabel(w.method, w.bank_code)} ·{" "}
                              {w.account_number}
                            </div>
                            <div className="mt-0.5 text-[10.5px] text-slate-400">
                              {formatDate(w.created_at)}
                            </div>
                            {w.rejected_reason && (
                              <div className="mt-2 rounded-lg bg-rose-50 p-2 text-[11px] text-rose-700">
                                <b>Lý do từ chối:</b> {w.rejected_reason}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}   
