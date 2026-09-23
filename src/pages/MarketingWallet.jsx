import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Wallet,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { supabase } from "../lib/supabaseClient.js";

const METHODS = [
  { value: "bank", label: "Ngân hàng" },
  { value: "momo", label: "MoMo" },
  { value: "zalopay", label: "ZaloPay" },
];

const WD_STATUS_META = {
  pending: { label: "Chờ duyệt", cls: "bg-amber-50 text-amber-600", Icon: Clock },
  approved: { label: "Đã duyệt", cls: "bg-emerald-50 text-emerald-600", Icon: CheckCircle2 },
  rejected: { label: "Từ chối", cls: "bg-rose-50 text-rose-600", Icon: XCircle },
};

function formatCoin(v) {
  return new Intl.NumberFormat("vi-VN").format(Number(v || 0));
}

export default function MarketingWallet() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("overview"); // overview | withdraw
  const [userId, setUserId] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [method, setMethod] = useState("bank");
  const [accountInfo, setAccountInfo] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);

      const [{ data: w }, { data: wd }] = await Promise.all([
        supabase.from("marketing_wallets").select("*").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("marketing_withdrawals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(30),
      ]);

      setWallet(
        w || {
          available_balance: 0,
          pending_balance: 0,
          locked_balance: 0,
          total_earned: 0,
          total_withdrawn: 0,
        }
      );
      setWithdrawals(wd || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const numericAmount = Number(amount) || 0;
  const estFee = Math.round(numericAmount * 0.05); // 5% — khớp với RPC request_marketing_withdrawal
  const estNet = numericAmount - estFee;

  const handleWithdraw = async () => {
    setError("");
    setSuccess("");

    if (!userId) return setError("Vui lòng đăng nhập.");
    if (numericAmount <= 0) return setError("Nhập số coin muốn rút.");
    if (numericAmount > (wallet?.available_balance || 0))
      return setError("Số dư khả dụng không đủ.");
    if (!accountInfo.trim()) return setError("Nhập thông tin tài khoản nhận tiền.");

    setSubmitting(true);
    try {
      const { error: rpcErr } = await supabase.rpc("request_marketing_withdrawal", {
        p_amount: numericAmount,
        p_method: method,
        p_account_info: accountInfo.trim(),
      });

      if (rpcErr) throw rpcErr;

      setSuccess("Đã gửi yêu cầu rút, chờ admin duyệt nhé!");
      setAmount("");
      setAccountInfo("");
      await loadAll();
    } catch (e) {
      setError(e?.message || "Không gửi được yêu cầu, thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-24">
        <TopHeader />
        <div className="flex justify-center py-24">
          <Loader2 size={20} className="animate-spin text-slate-300" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 text-slate-900">
      <TopHeader />

      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-[17px] font-bold">Ví Marketing</h1>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-4">
        {/* Balance card */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
              <Wallet size={18} />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Số dư khả dụng
              </p>
              <p className="text-xl font-black text-slate-900">
                {formatCoin(wallet?.available_balance)}
                <span className="ml-1 text-xs font-bold text-amber-600">Coin</span>
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-white p-2">
              <p className="text-[10px] text-slate-400">Đang khóa</p>
              <p className="text-[13px] font-bold">{formatCoin(wallet?.locked_balance)}</p>
            </div>
            <div className="rounded-lg bg-white p-2">
              <p className="text-[10px] text-slate-400">Tổng kiếm</p>
              <p className="text-[13px] font-bold">{formatCoin(wallet?.total_earned)}</p>
            </div>
            <div className="rounded-lg bg-white p-2">
              <p className="text-[10px] text-slate-400">Đã rút</p>
              <p className="text-[13px] font-bold">{formatCoin(wallet?.total_withdrawn)}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-2">
          {[
            { key: "overview", label: "Tổng quan" },
            { key: "withdraw", label: "Bank & Ví" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded-lg border py-2.5 text-[13px] font-semibold transition ${
                tab === t.key
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "withdraw" && (
          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <label className="text-[14px] font-semibold text-slate-700">Phương thức</label>
            <div className="mt-2 flex gap-2">
              {METHODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMethod(m.value)}
                  className={`flex-1 rounded-lg border py-2.5 text-[13px] font-semibold transition ${
                    method === m.value
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <label className="mt-4 block text-[14px] font-semibold text-slate-700">
              Thông tin nhận tiền
            </label>
            <input
              type="text"
              value={accountInfo}
              onChange={(e) => setAccountInfo(e.target.value)}
              placeholder={
                method === "bank"
                  ? "Ngân hàng - Số TK - Chủ TK"
                  : "Số điện thoại ví + Tên chủ ví"
              }
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-[14px] outline-none focus:border-slate-900"
            />

            <label className="mt-4 block text-[14px] font-semibold text-slate-700">
              Số coin muốn rút
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              placeholder="Nhập số coin"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-[14px] font-semibold outline-none focus:border-slate-900"
            />

            {numericAmount > 0 && (
              <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Phí (5%)</span>
                  <span className="font-semibold">-{formatCoin(estFee)} coin</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Thực nhận</span>
                  <span className="text-[15px] font-bold text-sky-600">
                    {formatCoin(estNet)} coin
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 p-2.5 text-[12px] text-rose-600">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-emerald-50 p-2.5 text-[12px] text-emerald-600">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                {success}
              </div>
            )}

            <button
              onClick={handleWithdraw}
              disabled={submitting || !numericAmount}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-[14px] font-bold text-white transition active:opacity-90 disabled:opacity-40"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Gửi yêu cầu rút
            </button>
          </div>
        )}

        {/* Lịch sử rút — hiện ở cả 2 tab, dưới cùng */}
        <div className="mt-5">
          <h3 className="text-[15px] font-bold">Lịch sử rút</h3>
          <div className="mt-2 space-y-2.5">
            {withdrawals.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-slate-400">
                Chưa có yêu cầu rút nào.
              </p>
            ) : (
              withdrawals.map((w) => {
                const meta = WD_STATUS_META[w.status] || WD_STATUS_META.pending;
                const Icon = meta.Icon;
                return (
                  <div key={w.id} className="rounded-xl border border-slate-200 p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[13px] font-bold capitalize">{w.method}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {new Date(w.created_at).toLocaleString("vi-VN")}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${meta.cls}`}
                      >
                        <Icon size={12} />
                        {meta.label}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 text-[13px]">
                      <span className="text-slate-500">
                        -{formatCoin(w.amount)} coin (phí {formatCoin(w.fee)})
                      </span>
                      <span className="font-bold text-sky-600">
                        {formatCoin(w.net_amount)} coin
                      </span>
                    </div>
                    {w.status === "rejected" && w.admin_note && (
                      <p className="mt-2 rounded-lg bg-rose-50 p-2 text-[12px] text-rose-600">
                        Admin: {w.admin_note}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
      }
