import React, { useState, useEffect } from "react";
import { Coins, TrendingUp, Wallet, Loader2, Plus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

export default function MarketingWallet() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [wallet, setWallet] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("bank");
  const [accountInfo, setAccountInfo] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, [session]);

  const fetchWalletData = async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    
    const { data: walletData } = await supabase
      .from("marketing_wallets")
      .select("*")
      .eq("user_id", session.user.id)
      .single();
      
    const { data: ledgerData } = await supabase
      .from("marketing_ledger")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(20);
      
    setWallet(walletData);
    setLedger(ledgerData ?? []);
    setIsLoading(false);
  };

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ!");
      return;
    }
    if (!accountInfo.trim()) {
      alert("Vui lòng nhập thông tin tài khoản nhận tiền!");
      return;
    }

    setIsWithdrawing(true);
    
    // Gọi RPC để tạo yêu cầu rút tiền (Server mới quyết định)
    const { error } = await supabase.rpc("request_marketing_withdrawal", {
      p_amount: amount,
      p_method: withdrawMethod,
      p_account_info: accountInfo.trim()
    });

    setIsWithdrawing(false);
    if (error) {
      alert(error.message);
      return;
    }

    alert("Đã gửi yêu cầu rút tiền!");
    setWithdrawAmount("");
    setAccountInfo("");
    setWithdrawModal(false);
    fetchWalletData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 px-4 py-4 backdrop-blur-md">
        <h1 className="font-display text-xl font-bold text-slate-900">Ví Marketing</h1>
      </header>

      <main className="mx-auto max-w-md px-4 py-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-sky-500" />
          </div>
        ) : (
          <>
            {/* Số dư */}
            <div className="rounded-3xl bg-gradient-to-br from-sky-400 to-blue-600 p-6 text-white shadow-lg shadow-blue-500/30">
              <p className="text-sm text-white/80">Số dư khả dụng</p>
              <div className="mt-2 flex items-center gap-2">
                <Coins size={32} className="text-amber-300" />
                <span className="font-display text-4xl font-bold">{wallet?.available_balance || 0}</span>
                <span className="text-lg text-white/80">đ</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-white/80">
                <span>Đang khóa: {wallet?.locked_balance || 0}</span>
                <span>Tổng kiếm: {wallet?.total_earned || 0}</span>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => navigate("/marketing")} className="flex flex-col items-center gap-2 rounded-2xl bg-white p-5 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                  <TrendingUp size={18} />
                </span>
                <span className="text-sm font-semibold text-slate-700">Kiếm thêm</span>
              </button>
              <button onClick={() => setWithdrawModal(true)} className="flex flex-col items-center gap-2 rounded-2xl bg-white p-5 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                  <Wallet size={18} />
                </span>
                <span className="text-sm font-semibold text-slate-700">Rút tiền</span>
              </button>
            </div>

            {/* Ledger */}
            <div className="mt-6">
              <h2 className="mb-3 text-lg font-bold text-slate-900">Lịch sử giao dịch</h2>
              <div className="space-y-3">
                {ledger.length === 0 ? (
                  <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                    <p className="text-sm text-slate-400">Chưa có giao dịch nào.</p>
                  </div>
                ) : ledger.map((entry) => (
                  <div key={entry.id} className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-800">{entry.description}</p>
                      <span className={`font-bold ${
                        entry.net_amount > 0 ? "text-emerald-500" : "text-rose-500"
                      }`}>
                        {entry.net_amount > 0 ? "+" : ""}{entry.net_amount.toLocaleString()}đ
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-xs text-slate-400">{entry.type}</p>
                      <p className="text-xs text-slate-400">{new Date(entry.created_at).toLocaleString("vi-VN")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Modal rút tiền */}
      {withdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">Rút tiền</h2>
            <p className="mt-2 text-sm text-slate-500">Phí rút tiền là 5% (sẽ hiển thị khi xác nhận).</p>
            
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Số tiền (đ)"
              className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400"
            />

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phương thức</p>
              <div className="mt-2 flex gap-2">
                <button onClick={() => setWithdrawMethod("bank")} className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold ${withdrawMethod === "bank" ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400"}`}>Bank</button>
                <button onClick={() => setWithdrawMethod("momo")} className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold ${withdrawMethod === "momo" ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400"}`}>Momo</button>
              </div>
            </div>

            <input
              type="text"
              value={accountInfo}
              onChange={(e) => setAccountInfo(e.target.value)}
              placeholder={withdrawMethod === "bank" ? "Số tài khoản ngân hàng" : "Số điện thoại Momo"}
              className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400"
            />

            <div className="mt-6 flex gap-3">
              <button onClick={() => setWithdrawModal(false)} className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-600">Hủy</button>
              <button onClick={handleWithdraw} disabled={isWithdrawing} className="flex-1 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-50">
                {isWithdrawing ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Gửi yêu cầu"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
          }
