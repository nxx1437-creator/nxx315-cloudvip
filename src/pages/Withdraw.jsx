import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, History, Loader2, AlertCircle, Headphones } from "lucide-react";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { supabase } from "../lib/supabaseClient.js";
import {
  SUPABASE_URL,
  FEE,
  MAX_AMOUNT,
  MAX_PER_DAY,
  MAX_TIMES_PER_DAY,
  minFor,
  formatMoney,
  getBankInfo,
  getWalletInfo,
  startOfServerDay,
} from "../lib/withdrawData.js";
import {
  BalanceHero,
  MethodTabs,
  WalletGrid,
  BankGrid,
  RecentMethods,
  Notes,
} from "../components/withdraw/WithdrawParts.jsx";
import {
  BankPickerSheet,
  WithdrawFormSheet,
} from "../components/withdraw/WithdrawSheet.jsx";

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const EMPTY_FORM = { amount: "", accountNumber: "", accountName: "", contactPhone: "" };

export default function Withdraw() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState([]);

  const [tab, setTab] = useState("wallet"); // wallet | bank
  const [sheet, setSheet] = useState(null); // null | pickBank | form
  const [method, setMethod] = useState(null); // {type:'bank',code} | {type:'wallet',wallet}
  const [form, setForm] = useState(EMPTY_FORM);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const loadData = async () => {
    setLoading(true);
    try {
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      if (!u) return;
      setUser(u);

      const { data: prof } = await supabase
        .from("profiles")
        .select("coins")
        .eq("id", u.id)
        .single();
      setBalance(prof?.coins || 0);

      const { data: hist } = await supabase
        .from("withdrawals")
        .select("id, amount, method, bank_code, status, created_at")
        .eq("user_id", u.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setWithdrawals(hist || []);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Máy chủ đếm giới hạn theo ngày UTC, không loại đơn bị từ chối
  const today = useMemo(() => {
    const start = startOfServerDay();
    const list = withdrawals.filter((w) => new Date(w.created_at) >= start);
    return { count: list.length, amount: list.reduce((s, w) => s + w.amount, 0) };
  }, [withdrawals]);

  // Phương thức đã dùng gần đây (không kèm số tài khoản vì được mã hóa)
  const recent = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const w of withdrawals) {
      const isBank = w.method === "bank";
      const key = isBank ? `bank-${w.bank_code}` : w.method;
      if (seen.has(key)) continue;
      const info = isBank ? getBankInfo(w.bank_code) : getWalletInfo(w.method);
      if (!info) continue;
      seen.add(key);
      out.push({
        key,
        label: info.name,
        logo: info.logo,
        fallback: isBank ? info.code : info.name.slice(0, 2),
        method: isBank
          ? { type: "bank", code: w.bank_code }
          : { type: "wallet", wallet: w.method },
      });
      if (out.length === 3) break;
    }
    return out;
  }, [withdrawals]);

  const openForm = (m) => {
    setMethod(m);
    setError("");
    setSuccess("");
    setSheet("form");
  };

  const closeSheet = () => {
    setSheet(null);
    setMethod(null);
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    const amount = Number(form.amount) || 0;
    const min = minFor(method?.type);
    const total = amount + FEE;

    if (!user) return setError("Vui lòng đăng nhập.");
    if (!method) return setError("Chưa chọn phương thức.");
    if (amount < min) return setError(`Số tiền tối thiểu ${formatMoney(min)}.`);
    if (amount > MAX_AMOUNT) return setError(`Số tiền tối đa ${formatMoney(MAX_AMOUNT)}.`);
    if (total > balance)
      return setError(`Số dư không đủ. Cần ${formatMoney(total)} (gồm phí ${formatMoney(FEE)}).`);
    if (today.count >= MAX_TIMES_PER_DAY)
      return setError(`Đã đạt ${MAX_TIMES_PER_DAY} lần rút/ngày.`);
    if (today.amount + amount > MAX_PER_DAY)
      return setError(`Vượt giới hạn ${formatMoney(MAX_PER_DAY)}/ngày.`);
    if (form.accountNumber.trim().length < 6) return setError("Số tài khoản không hợp lệ.");
    if (form.accountName.trim().length < 3) return setError("Nhập tên chủ tài khoản.");
    if (!/^[0-9]{10,11}$/.test(form.contactPhone.trim()))
      return setError("SĐT liên hệ không hợp lệ.");

    setSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Chưa đăng nhập");

      const isBank = method.type === "bank";
      const res = await fetch(`${SUPABASE_URL}/functions/v1/request-withdrawal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          amount,
          method: isBank ? "bank" : method.wallet,
          bank_code: isBank ? method.code : null,
          account_number: form.accountNumber.trim(),
          account_name: form.accountName.trim(),
          contact_phone: form.contactPhone.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Có lỗi xảy ra.");
        return;
      }

      setSuccess(`Đã gửi yêu cầu rút ${formatMoney(data.amount)}. Vui lòng chờ trong 24h.`);
      setForm(EMPTY_FORM);
      await loadData();
      setTimeout(closeSheet, 2200);
    } catch (err) {
      setError(err?.message || "Không thể gửi yêu cầu.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24">
        <TopHeader />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24">
        <TopHeader />
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <AlertCircle size={40} className="mx-auto text-slate-300" />
          <h2 className="mt-4 text-lg font-bold">Vui lòng đăng nhập</h2>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-['Be_Vietnam_Pro',sans-serif] text-slate-900">
      <TopHeader />

      <main className="mx-auto max-w-2xl space-y-4 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="flex-1 text-[18px] font-extrabold tracking-tight">Rút tiền</h1>
          <button
            type="button"
            onClick={() => navigate("/withdraw/history")}
            className="flex h-9 items-center gap-1.5 rounded-full bg-white px-3.5 shadow-sm"
          >
            <History size={15} className="text-slate-700" />
            <span className="text-[12px] font-semibold text-slate-700">Lịch sử</span>
          </button>
        </div>

        <BalanceHero balance={balance} today={today} />

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="text-[14px] font-bold text-slate-900">Rút về</h3>
          <MethodTabs tab={tab} onChange={setTab} />
          {tab === "wallet" ? (
            <WalletGrid onPick={(id) => openForm({ type: "wallet", wallet: id })} />
          ) : (
            <BankGrid
              onPick={(code) => openForm({ type: "bank", code })}
              onMore={() => setSheet("pickBank")}
            />
          )}
        </div>

        <RecentMethods items={recent} onPick={openForm} />
        <Notes />

        <button
          type="button"
          onClick={() => navigate("/support")}
          className="flex w-full items-center justify-center gap-2 py-2 text-[12.5px] font-semibold text-slate-500"
        >
          <Headphones size={15} /> Cần trợ giúp? Liên hệ hỗ trợ
        </button>
      </main>

      {sheet === "pickBank" && (
        <BankPickerSheet
          onClose={closeSheet}
          onPick={(code) => openForm({ type: "bank", code })}
        />
      )}
      {sheet === "form" && method && (
        <WithdrawFormSheet
          method={method}
          balance={balance}
          form={form}
          setField={setField}
          error={error}
          success={success}
          submitting={submitting}
          onSubmit={handleSubmit}
          onClose={closeSheet}
        />
      )}

      {!sheet && <BottomNav />}
    </div>
  );
}
