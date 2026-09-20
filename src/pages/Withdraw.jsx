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
  History,
  Save,
  Info,
} from "lucide-react";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { supabase } from "../lib/supabaseClient.js";

const SUPABASE_URL = "https://rwglwovohbyqmbbzdvdj.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const FEE = 2000;
const MIN_AMOUNT = 10000;
const MAX_AMOUNT = 500000;
const MAX_PER_DAY = 500000;
const MAX_PER_MONTH = 3000000;
const MAX_TIMES_PER_DAY = 5;

const BANKS = [
  { code: "VCB", name: "Vietcombank" },
  { code: "TCB", name: "Techcombank" },
  { code: "MB", name: "MB Bank" },
  { code: "VPB", name: "VPBank" },
  { code: "TPB", name: "TPBank" },
  { code: "ACB", name: "ACB" },
  { code: "BIDV", name: "BIDV" },
  { code: "VTB", name: "VietinBank" },
  { code: "STB", name: "Sacombank" },
  { code: "EIB", name: "Eximbank" },
  { code: "OCB", name: "OCB" },
  { code: "MSB", name: "MSB" },
  { code: "HDB", name: "HDBank" },
  { code: "SEAB", name: "SeABank" },
  { code: "NAB", name: "Nam A Bank" },
];

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000];

const STATUS_INFO = {
  pending: {
    label: "Chờ duyệt",
    className: "bg-amber-100 text-amber-700",
    icon: Clock3,
  },
  processing: {
    label: "Đang xử lý",
    className: "bg-sky-100 text-sky-700",
    icon: Loader2,
  },
  completed: {
    label: "Đã chuyển",
    className: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Từ chối",
    className: "bg-rose-100 text-rose-700",
    icon: XCircle,
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-slate-100 text-slate-600",
    icon: XCircle,
  },
};

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
export default function Withdraw() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank");
  const [bankCode, setBankCode] = useState("VCB");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [saveAccount, setSaveAccount] = useState(true);

  // Submit
  const [submitting, setSubmitting] = useState(false);

  // ========== LOAD ==========
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

      // Load profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("coins, username, display_name, avatar_url")
        .eq("id", user.id)
        .single();

      setProfile(prof);

      // Load lịch sử rút
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

  // ========== TÍNH TOÁN ==========
  const numericAmount = Number(amount) || 0;
  const totalDeduct = numericAmount + FEE;
  const remaining = (profile?.coins || 0) - totalDeduct;

  const rateLimit = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const todayList = withdrawals.filter(
      (w) => new Date(w.created_at) >= today
    );
    const monthList = withdrawals.filter(
      (w) => new Date(w.created_at) >= thisMonth
    );

    return {
      todayCount: todayList.length,
      todayAmount: todayList.reduce((s, w) => s + w.amount, 0),
      monthAmount: monthList.reduce((s, w) => s + w.amount, 0),
    };
  }, [withdrawals]);

  // ========== SUBMIT ==========
  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!user) {
      setError("Vui lòng đăng nhập.");
      return;
    }

    if (numericAmount < MIN_AMOUNT) {
      setError(`Số tiền rút tối thiểu ${formatMoney(MIN_AMOUNT)}.`);
      return;
    }

    if (numericAmount > MAX_AMOUNT) {
      setError(`Số tiền rút tối đa ${formatMoney(MAX_AMOUNT)} / lần.`);
      return;
    }

    if (totalDeduct > (profile?.coins || 0)) {
      setError(
        `Số dư không đủ. Bạn cần ${formatMoney(
          totalDeduct
        )} xu (bao gồm phí ${formatMoney(FEE)}).`
      );
      return;
    }

    if (rateLimit.todayCount >= MAX_TIMES_PER_DAY) {
      setError(`Bạn đã đạt giới hạn ${MAX_TIMES_PER_DAY} lần rút/ngày.`);
      return;
    }

    if (rateLimit.todayAmount + numericAmount > MAX_PER_DAY) {
      setError(`Vượt giới hạn ${formatMoney(MAX_PER_DAY)}/ngày.`);
      return;
    }

    if (rateLimit.monthAmount + numericAmount > MAX_PER_MONTH) {
      setError(`Vượt giới hạn ${formatMoney(MAX_PER_MONTH)}/tháng.`);
      return;
    }

    if (!accountNumber.trim()) {
      setError("Vui lòng nhập số tài khoản / SĐT ví.");
      return;
    }

    if (!accountName.trim()) {
      setError("Vui lòng nhập tên chủ tài khoản.");
      return;
    }

    if (!/^[0-9]{10,11}$/.test(contactPhone.trim())) {
      setError("SĐT liên hệ không hợp lệ (10-11 số).");
      return;
    }

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
        `Đã gửi yêu cầu rút ${formatMoney(
          data.amount
        )}. Vui lòng chờ trong 24h.`
      );

      // Reset form
      setAmount("");
      setAccountNumber("");
      setAccountName("");

      // Reload
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
    <div className="min-h-screen bg-[#fafafa] pb-24">
      <TopHeader />
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
      </div>
    </div>
  );
}

if (!user) {
  return (
    <div className="min-h-screen bg-[#fafafa] pb-24">
      <TopHeader />
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <AlertCircle
          size={40}
          className="mx-auto text-rose-500"
          strokeWidth={2}
        />
        <h2 className="mt-4 text-lg font-bold">
          Vui lòng đăng nhập để rút tiền
        </h2>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 rounded-xl bg-[#FE2C55] px-6 py-3 font-bold text-white"
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
}

return (
  <div className="min-h-screen bg-[#fafafa] pb-24 text-slate-900">
    <TopHeader />

    <div className="mx-auto w-full max-w-2xl px-4">
      {/* Header */}
      <div className="flex items-center gap-3 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <ArrowLeft size={20} strokeWidth={2.2} />
        </button>
        <h1 className="text-[17px] font-extrabold tracking-[-0.02em]">
          Rút tiền về ngân hàng
        </h1>
      </div>

      {/* Số dư */}
      <div className="rounded-[20px] bg-gradient-to-br from-[#FE2C55] to-[#FF6B9D] p-5 shadow-[0_8px_24px_rgba(254,44,85,0.25)]">
        <div className="flex items-center gap-2 text-white/80">
          <Wallet size={16} strokeWidth={2.4} />
          <span className="text-[12px] font-semibold uppercase tracking-wider">
            Số dư khả dụng
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-[32px] font-black leading-none text-white">
            {Number(profile?.coins || 0).toLocaleString("vi-VN")}
          </span>
          <span className="text-[14px] font-bold text-white/80">xu</span>
        </div>
        <div className="mt-1 text-[12px] text-white/70">
          ≈ {formatMoney(profile?.coins || 0)}
        </div>
      </div>

      {/* Rate limit info */}
      <div className="mt-3 flex items-center justify-between rounded-[14px] border border-slate-200 bg-white px-4 py-3 text-[12px]">
        <div className="flex items-center gap-2 text-slate-600">
          <Info size={14} strokeWidth={2.4} />
          <span>Hôm nay:</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-semibold">
            {rateLimit.todayCount}/{MAX_TIMES_PER_DAY} lần
          </span>
          <span className="font-semibold">
            {formatMoney(rateLimit.todayAmount)}/{formatMoney(MAX_PER_DAY)}
          </span>
        </div>
      </div>

      {/* Error / Success */}
      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-[14px] border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mt-3 flex items-start gap-2 rounded-[14px] border border-emerald-200 bg-emerald-50 p-3 text-[13px] text-emerald-700">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Form */}
      <div className="mt-4 space-y-4 rounded-[20px] border border-slate-200 bg-white p-4">
        {/* Số tiền */}
        <div>
          <label className="text-[13px] font-bold text-slate-700">
            Số tiền muốn rút
          </label>
          <div className="mt-2 relative">
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                setAmount(raw);
              }}
              placeholder="Nhập số tiền"
              className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 pr-12 text-[16px] font-bold outline-none focus:border-[#FE2C55]"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-slate-400">
              VNĐ
            </span>
          </div>

          {/* Quick amounts */}
          <div className="mt-2 grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(String(v))}
                className={`rounded-lg border py-2 text-[12px] font-bold transition ${
                  amount === String(v)
                    ? "border-[#FE2C55] bg-[#FE2C55]/5 text-[#FE2C55]"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {v / 1000}K
              </button>
            ))}
          </div>
        </div>

        {/* Phương thức */}
        <div>
          <label className="text-[13px] font-bold text-slate-700">
            Nhận tiền qua
          </label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMethod("bank")}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 py-3 transition ${
                method === "bank"
                  ? "border-[#FE2C55] bg-[#FE2C55]/5"
                  : "border-slate-200 bg-white"
              }`}
            >
              <Building2
                size={20}
                className={
                  method === "bank" ? "text-[#FE2C55]" : "text-slate-500"
                }
                strokeWidth={2.2}
              />
              <span
                className={`text-[11px] font-bold ${
                  method === "bank"
                    ? "text-[#FE2C55]"
                    : "text-slate-600"
                }`}
              >
                Ngân hàng
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMethod("momo")}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 py-3 transition ${
                method === "momo"
                  ? "border-[#FE2C55] bg-[#FE2C55]/5"
                  : "border-slate-200 bg-white"
              }`}
            >
              <Smartphone
                size={20}
                className={
                  method === "momo" ? "text-[#FE2C55]" : "text-slate-500"
                }
                strokeWidth={2.2}
              />
              <span
                className={`text-[11px] font-bold ${
                  method === "momo"
                    ? "text-[#FE2C55]"
                    : "text-slate-600"
                }`}
              >
                MoMo
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMethod("zalopay")}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 py-3 transition ${
                method === "zalopay"
                  ? "border-[#FE2C55] bg-[#FE2C55]/5"
                  : "border-slate-200 bg-white"
              }`}
            >
              <Smartphone
                size={20}
                className={
                  method === "zalopay"
                    ? "text-[#FE2C55]"
                    : "text-slate-500"
                }
                strokeWidth={2.2}
              />
              <span
                className={`text-[11px] font-bold ${
                  method === "zalopay"
                    ? "text-[#FE2C55]"
                    : "text-slate-600"
                }`}
              >
                ZaloPay
              </span>
            </button>
          </div>
        </div>

        {/* Ngân hàng (nếu bank) */}
        {method === "bank" && (
          <div>
            <label className="text-[13px] font-bold text-slate-700">
              Ngân hàng
            </label>
            <select
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              className="mt-2 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-[14px] font-semibold outline-none focus:border-[#FE2C55]"
            >
              {BANKS.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Số TK / SĐT ví */}
        <div>
          <label className="text-[13px] font-bold text-slate-700">
            {method === "bank"
              ? "Số tài khoản"
              : `Số điện thoại ${getMethodLabel(method)}`}
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={accountNumber}
            onChange={(e) =>
              setAccountNumber(e.target.value.replace(/\D/g, ""))
            }
            placeholder={
              method === "bank"
                ? "VD: 0123456789"
                : "VD: 0865245988"
            }
            className="mt-2 w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-[15px] font-semibold outline-none focus:border-[#FE2C55]"
          />
        </div>

        {/* Tên chủ TK */}
        <div>
          <label className="text-[13px] font-bold text-slate-700">
            Tên chủ tài khoản (in hoa không dấu)
          </label>
          <input
            type="text"
            value={accountName}
            onChange={(e) =>
              setAccountName(e.target.value.toUpperCase())
            }
            placeholder="VD: NGUYEN VAN A"
            className="mt-2 w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-[15px] font-semibold uppercase outline-none focus:border-[#FE2C55]"
          />
        </div>

        {/* SĐT liên hệ */}
        <div>
          <label className="text-[13px] font-bold text-slate-700">
            SĐT liên hệ (để admin gọi nếu cần)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={contactPhone}
            onChange={(e) =>
              setContactPhone(e.target.value.replace(/\D/g, ""))
            }
            placeholder="VD: 0865245988"
            maxLength={11}
            className="mt-2 w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-[15px] font-semibold outline-none focus:border-[#FE2C55]"
          />
        </div>

        {/* Lưu thông tin */}
        <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <input
            type="checkbox"
            checked={saveAccount}
            onChange={(e) => setSaveAccount(e.target.checked)}
            className="h-5 w-5 accent-[#FE2C55]"
          />
          <div className="flex items-center gap-2">
            <Save size={14} className="text-slate-500" strokeWidth={2.4} />
            <span className="text-[13px] font-semibold text-slate-700">
              Lưu thông tin cho lần sau
            </span>
          </div>
        </label>
      </div>

      {/* Tổng kết */}
      {numericAmount > 0 && (
        <div className="mt-4 space-y-2 rounded-[20px] border-2 border-dashed border-[#FE2C55]/30 bg-[#FFF5F8] p-4">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-slate-600">Số tiền rút:</span>
            <span className="font-bold">
              {formatMoney(numericAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-slate-600">Phí giao dịch:</span>
            <span className="font-bold text-rose-600">
              -{formatMoney(FEE)}
            </span>
          </div>
          <div className="border-t border-[#FE2C55]/20 pt-2">
            <div className="flex items-center justify-between text-[14px]">
              <span className="font-bold text-slate-800">
                Tổng trừ xu:
              </span>
              <span className="font-black text-[#FE2C55]">
                {formatMoney(totalDeduct)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[12px]">
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
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#FE2C55] py-4 text-[15px] font-black text-white shadow-[0_6px_20px_rgba(254,44,85,0.25)] transition active:scale-[0.98] disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Đang gửi yêu cầu...
          </>
        ) : (
          <>
            <Wallet size={18} strokeWidth={2.4} />
            Gửi yêu cầu rút tiền
          </>
        )}
      </button>
              {/* Lịch sử rút */}
        <div className="mt-6 mb-8">
          <div className="mb-3 flex items-center gap-2">
            <History size={18} className="text-slate-600" strokeWidth={2.4} />
            <h3 className="text-[15px] font-extrabold text-slate-900">
              Lịch sử rút tiền
            </h3>
          </div>

          {withdrawals.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-slate-200 bg-white py-10 text-center text-[13px] text-slate-400">
              Chưa có yêu cầu rút nào
            </div>
          ) : (
            <div className="space-y-2">
              {withdrawals.map((w) => {
                const info = STATUS_INFO[w.status] || STATUS_INFO.pending;
                const Icon = info.icon;
                return (
                  <div
                    key={w.id}
                    className="rounded-[16px] border border-slate-200 bg-white p-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-black text-slate-900">
                            {formatMoney(w.amount)}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${info.className}`}
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
                      <ChevronRight
                        size={16}
                        className="mt-1 shrink-0 text-slate-300"
                        strokeWidth={2.4}
                      />
                    </div>
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
