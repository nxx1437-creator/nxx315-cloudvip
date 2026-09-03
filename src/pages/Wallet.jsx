import React, { useState, useEffect } from "react";
import { Coins, Gift, Loader2, TrendingUp, ArrowDownLeft, ArrowUpRight, CheckSquare, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";
import TopHeader from "../components/TopHeader.jsx";

export default function Wallet() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      const userId = session.user.id;

      const [tasksRes, milestonesRes, ordersRes] = await Promise.all([
        supabase
          .from("task_completions")
          .select("id, completed_at, coins_earned")
          .eq("user_id", userId)
          .order("completed_at", { ascending: false })
          .limit(30),
        supabase
          .from("milestone_claims")
          .select("id, milestone, reward, claimed_at")
          .eq("user_id", userId)
          .order("claimed_at", { ascending: false })
          .limit(30),
        supabase
          .from("redemption_orders")
          .select("id, package_name, coins_charged, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(30),
      ]);

      const taskTx = (tasksRes.data || []).map((t) => ({
        id: "task-" + t.id,
        type: "task",
        title: "Hoàn thành nhiệm vụ",
        amount: t.coins_earned || 0,
        date: t.completed_at,
      }));

      const milestoneTx = (milestonesRes.data || []).map((m) => ({
        id: "milestone-" + m.id,
        type: "milestone",
        title: `Thưởng mốc ${m.milestone} nhiệm vụ`,
        amount: m.reward,
        date: m.claimed_at,
      }));

      const orderTx = (ordersRes.data || []).map((o) => ({
        id: "order-" + o.id,
        type: "spend",
        title: o.package_name || "Đổi phần thưởng",
        amount: -(o.coins_charged || 0),
        date: o.created_at,
      }));

      const merged = [...taskTx, ...milestoneTx, ...orderTx].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setTransactions(merged);
      setLoading(false);
    };

    fetchTransactions();
  }, [session]);

  const coins = profile?.coins || 0;
  const nextMilestone = (Math.floor(coins / 1000) + 1) * 1000;
  const ringPct = Math.round((coins % 1000) / 1000 * 100);

  const iconFor = (type) => {
    if (type === "task") return { Icon: CheckSquare, cls: "bg-[#EAF2FE] text-[#3478F6]" };
    if (type === "milestone") return { Icon: Sparkles, cls: "bg-[#FFF4DB] text-[#B87700]" };
    return { Icon: ArrowUpRight, cls: "bg-rose-50 text-rose-500" };
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] pb-24 text-[#111827]">
      <TopHeader />

      <main className="mx-auto max-w-md space-y-4 px-4 py-5">
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6">
          <p className="text-center text-sm font-medium text-[#667085]">Số dư khả dụng</p>

          <div
            className="relative mx-auto mt-4 flex h-44 w-44 items-center justify-center rounded-full"
            style={{ background: `conic-gradient(#3478F6 ${ringPct * 3.6}deg, #E5E7EB 0deg)` }}
          >
            <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white">
              <Coins size={26} className="text-[#F2A900]" />
              <span className="mt-1 text-3xl font-bold text-[#111827]">{coins.toLocaleString("vi-VN")}</span>
              <span className="text-xs text-[#9CA3AF]">Coin</span>
            </div>
          </div>

          <p className="mt-3 text-center text-xs text-[#9CA3AF]">
            Còn {(nextMilestone - coins).toLocaleString("vi-VN")} Coin nữa tới mốc {nextMilestone.toLocaleString("vi-VN")}
          </p>

          <div className="mt-5 flex gap-3">
            <button
              onClick={() => navigate("/store")}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white py-3 text-sm font-semibold text-[#374151] transition hover:border-[#3478F6]/30"
            >
              <Gift size={16} /> Đổi quà
            </button>
            <button
              onClick={() => navigate("/tasks")}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3478F6] to-[#0878C9] py-3 text-sm font-semibold text-white shadow-md shadow-[#3478F6]/25"
            >
              <TrendingUp size={16} /> Kiếm thêm
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <h2 className="mb-4 text-sm font-bold text-[#111827]">Hoạt động</h2>

          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="animate-spin text-[#D1D5DB]" />
              </div>
            ) : transactions.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#9CA3AF]">Chưa có giao dịch nào.</p>
            ) : (
              transactions.map((tx) => {
                const { Icon, cls } = iconFor(tx.type);
                return (
                  <div key={tx.id} className="flex items-center justify-between border-b border-[#F3F4F6] pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-full ${cls}`}>
                        <Icon size={17} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">{tx.title}</p>
                        <p className="text-xs text-[#9CA3AF]">{new Date(tx.date).toLocaleString("vi-VN")}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${tx.amount > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString("vi-VN")} Coin
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
                    }
