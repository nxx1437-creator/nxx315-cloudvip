import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  History,
  X,
} from "lucide-react";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { supabase } from "../lib/supabaseClient.js";
import useProfile from "../hooks/useProfile.js";

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

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000];

function formatMoney(v) {
  return new Intl.NumberFormat("vi-VN").format(Number(v || 0)) + "đ";
}

function getBankInfo(code) {
  return BANKS.find((b) => b.code === code) || BANKS[0];
}

export default function Withdraw() {
  const navigate = useNavigate();

  // Số dư & thông tin user lấy qua hook chung, đồng bộ với toàn app
  const { profile, loading: profileLoading, setProfile } = useProfile();

  const [user, setUser] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank");
  const [bankCode, setBankCode] = useState("VCB");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [showBankPicker, setShowBankPicker] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUserAndHistory();
  }, []);

  const loadUserAndHistory = async () => {
    setHistoryLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUser(null);
        setHistoryLoading(false);
        return;
      }
      setUser(user);

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
      setHistoryLoading(false);
    }
  };

  const loading = profileLoading || historyLoading;

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

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!user) return setError("Vui lòng đăng nhập.");
    if (numericAmount < MIN_AMOUNT)
      return setError(`Số tiền rút tối thiểu ${formatMoney(MIN_AMOUNT)}.`);
    if (numericAmount > MAX_AMOUNT)
      return setError(`Số tiền rút tối đa ${formatMoney(MAX_AMOUNT)}.`);
    if (totalDeduct > (profile?.coins || 0))
      return setError(
        `Số dư không đủ. Cần ${formatMoney(totalDeduct)} (gồm phí ${formatMoney(FEE)}).`
      );
    if (todayInfo.count >= MAX_TIMES_PER_DAY)
      return setError(`Đã đạt giới hạn ${MAX_TIMES_PER_DAY} lần/ngày.`);
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

      // Trừ số dư ngay trên UI (useProfile không có hàm refetch thủ công)
      setProfile((prev) => ({
        ...prev,
        coins: (prev?.coins || 0) - data.amount - FEE,
      }));

      setSuccess(`Đã gửi yêu cầu rút ${formatMoney(data.amount)}. Chờ 24h.`);
      setAmount("");
      setAccountNumber("");
      setAccountName("");
      await loadUserAndHistory();
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

  const bankInfo = getBankInfo(bankCode);

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
          className="flex items-center gap-1 text-[13px] font-semibold text-slate-600"
        >
          <History size={15} strokeWidth={2.2} />
          Lịch sử
        </button>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-4">
        {/* SỐ DƯ — 1 dòng text */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <span className="text-[14px] text-slate-500">Số dư khả dụng</span>
          <span className="text-[16px] font-bold text-slate-900">
            {formatMoney(profile?.coins || 0)}
          </span>
        </div>

        {/* HÔM NAY */}
        <div className="flex items-center justify-between border-b border-slate-100 py-3">
          <span className="text-[13px] text-slate-500">Hôm nay</span>
          <span className="text-[13px] font-semibold text-slate-700">
            {todayInfo.count}/{MAX_TIMES_PER_DAY} lần ·{" "}
            {formatMoney(todayInfo.amount)}/{formatMoney(MAX_PER_DAY)}
          </span>
        </div>

        {/* SỐ TIỀN */}
        <div className="pt-5">
          <label className="text-[14px] font-semibold text-slate-700">
            Số tiền muốn rút
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={amount ? Number(amount).toLocaleString("vi-VN") : ""}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            placeholder="Nhập số tiền"
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3.5 text-[16px] font-semibold outline-none focus:border-slate-900"
          />

          <div className="mt-2 grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(String(v))}
                className={`rounded-lg border py-2.5 text-[13px] font-semibold transition ${
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
        {/* PHƯƠNG THỨC — Tab đơn giản */}
        <div className="pt-5">
          <label className="text-[14px] font-semibold text-slate-700">
            Nhận tiền qua
          </label>
          <div className="mt-2 flex gap-2">
            {[
              { key: "bank", label: "Ngân hàng" },
              { key: "momo", label: "MoMo" },
              { key: "zalopay", label: "ZaloPay" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setMethod(item.key)}
                className={`flex-1 rounded-lg border py-2.5 text-[13px] font-semibold transition ${
                  method === item.key
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* NGÂN HÀNG — Chỉ hiện khi method = bank */}
        {method === "bank" && (
          <div className="pt-5">
            <label className="text-[14px] font-semibold text-slate-700">
              Ngân hàng
            </label>
            <button
              type="button"
              onClick={() => setShowBankPicker(true)}
              className="mt-2 flex w-full items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 text-left"
            >
              <img
                src={getImageUrl(bankInfo.logo)}
                alt=""
                className="h-7 w-7 shrink-0 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement.innerHTML = `<span style="font-weight:900;font-size:12px">${bankInfo.code}</span>`;
                }}
              />
              <span className="flex-1 text-[15px] font-semibold">
                {bankInfo.name}
              </span>
              <ChevronDown size={18} className="text-slate-400" />
            </button>
          </div>
        )}

        {/* SỐ TK */}
        <div className="pt-5">
          <label className="text-[14px] font-semibold text-slate-700">
            {method === "bank" ? "Số tài khoản" : "Số điện thoại ví"}
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
            placeholder={method === "bank" ? "Nhập số tài khoản" : "Nhập SĐT ví"}
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3.5 text-[15px] font-semibold outline-none focus:border-slate-900"
          />
        </div>

        {/* TÊN */}
        <div className="pt-5">
          <label className="text-[14px] font-semibold text-slate-700">
            Tên chủ tài khoản
          </label>
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value.toUpperCase())}
            placeholder="NGUYEN VAN A"
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3.5 text-[15px] font-semibold uppercase outline-none focus:border-slate-900"
          />
        </div>

        {/* SĐT */}
        <div className="pt-5">
          <label className="text-[14px] font-semibold text-slate-700">
            SĐT liên hệ
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ""))}
            placeholder="0865245988"
            maxLength={11}
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3.5 text-[15px] font-semibold outline-none focus:border-slate-900"
          />
        </div>

        {/* TỔNG KẾT */}
        {numericAmount > 0 && (
          <div className="mt-5 space-y-2 border-t border-slate-100 pt-5 text-[14px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Số tiền rút</span>
              <span className="font-semibold">{formatMoney(numericAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phí giao dịch</span>
              <span className="font-semibold text-slate-700">
                -{formatMoney(FEE)}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2">
              <span className="font-semibold">Tổng trừ</span>
              <span className="text-[16px] font-bold">
                {formatMoney(totalDeduct)}
              </span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-slate-500">Còn lại</span>
              <span
                className={`font-semibold ${
                  remaining < 0 ? "text-rose-600" : "text-slate-700"
                }`}
              >
                {formatMoney(remaining)}
              </span>
            </div>
          </div>
        )}

        {/* THÔNG BÁO */}
        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-[13px] text-rose-700">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[13px] text-emerald-700">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* NÚT SUBMIT */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !numericAmount}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-4 text-[15px] font-bold text-white transition active:scale-[0.99] disabled:opacity-40"
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

        <p className="mt-4 pb-6 text-center text-[12px] text-slate-400">
          Tiền sẽ được chuyển trong vòng 24h sau khi admin duyệt
        </p>
      </div>

      {/* BANK PICKER MODAL */}
      {showBankPicker && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setShowBankPicker(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-hidden rounded-t-2xl bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h3 className="text-[16px] font-bold">Chọn ngân hàng</h3>
              <button
                onClick={() => setShowBankPicker(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
              {BANKS.map((bank) => (
                <button
                  key={bank.code}
                  onClick={() => {
                    setBankCode(bank.code);
                    setShowBankPicker(false);
                  }}
                  className={`flex w-full items-center gap-3 border-b border-slate-50 px-4 py-3.5 text-left transition hover:bg-slate-50 ${
                    bankCode === bank.code ? "bg-slate-50" : ""
                  }`}
                >
                  <img
                    src={getImageUrl(bank.logo)}
                    alt=""
                    className="h-9 w-9 shrink-0 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement.innerHTML = `<span style="font-weight:900;font-size:11px">${bank.code}</span>`;
                    }}
                  />
                  <span className="flex-1 text-[14.5px] font-semibold text-slate-800">
                    {bank.name}
                  </span>
                  {bankCode === bank.code && (
                    <CheckCircle2 size={18} className="text-slate-900" strokeWidth={2.4} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
