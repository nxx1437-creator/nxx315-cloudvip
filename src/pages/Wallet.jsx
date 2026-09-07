import React, { useState, useEffect } from "react";
import { Coins, Gift, Loader2, TrendingUp, ArrowDownLeft, ArrowUpRight, CheckSquare, Sparkles, Star, ArrowLeftRight, Landmark, CheckCircle2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";
import TopHeader from "../components/TopHeader.jsx";

const formatCoins = (v) => Number(v || 0).toLocaleString("vi-VN");
const formatVND = (v) => Number(v || 0).toLocaleString("vi-VN") + "đ";

export default function Wallet() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [refundTransactions, setRefundTransactions] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      const userId = session.user.id;

      const [tasksRes, milestonesRes, ordersRes, gamesRes, historyRes, refundRes] = await Promise.all([
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
        supabase
          .from("game_plays")
          .select("id, game_type, reward, played_at")
          .eq("user_id", userId)
          .order("played_at", { ascending: false })
          .limit(30),
        // ===== LỊCH SỬ ĐỔI SAO SANG XU =====
        supabase
          .from("transaction_history")
          .select("*")
          .eq("user_id", userId)
          .in("type", ["convert_star_to_coin", "pay_refund"])
          .order("created_at", { ascending: false })
          .limit(30),
        // ===== LỊCH SỬ TRẢ NỢ TỪ AFFILIATE_TRANSACTIONS =====
        supabase
          .from("affiliate_transactions")
          .select("id, product_name, amount, star_points_awarded, refund_paid, refund_paid_at, refund_paid_amount, refund_paid_method, note, status")
          .eq("user_id", userId)
          .eq("refund_paid", true)
          .order("refund_paid_at", { ascending: false })
          .limit(30),
      ]);

      // ===== GỘP LỊCH SỬ =====
      const taskTx = (tasksRes.data || []).map((t) => ({
        id: "task-" + t.id,
        type: "task",
        title: "Hoàn thành nhiệm vụ",
        amount: t.coins_earned || 0,
        date: t.completed_at,
        icon: CheckSquare,
        iconCls: "bg-[#EAF2FE] text-[#3478F6]",
      }));

      const milestoneTx = (milestonesRes.data || []).map((m) => ({
        id: "milestone-" + m.id,
        type: "milestone",
        title: `Thưởng mốc ${m.milestone} nhiệm vụ`,
        amount: m.reward,
        date: m.claimed_at,
        icon: Sparkles,
        iconCls: "bg-[#FFF4DB] text-[#B87700]",
      }));

      const orderTx = (ordersRes.data || []).map((o) => ({
        id: "order-" + o.id,
        type: "spend",
        title: o.package_name || "Đổi phần thưởng",
        amount: -(o.coins_charged || 0),
        date: o.created_at,
        icon: Gift,
        iconCls: "bg-rose-50 text-rose-500",
      }));

      const gameLabel = (t) => (t === "wheel" ? "Vòng quay may mắn" : t === "scratch" ? "Cào thẻ trúng thưởng" : "Xúc xắc may mắn");

      const gameTx = (gamesRes.data || []).map((g) => ({
        id: "game-" + g.id,
        type: "game",
        title: gameLabel(g.game_type),
        amount: g.reward || 0,
        date: g.played_at,
        icon: Gift,
        iconCls: "bg-emerald-50 text-emerald-600",
      }));

      // ===== LỊCH SỬ ĐỔI SAO SANG XU =====
      const historyTx = (historyRes.data || []).map((h) => ({
        id: "history-" + h.id,
        type: h.type === "convert_star_to_coin" ? "convert_star" : "pay_refund",
        title: h.type === "convert_star_to_coin" 
          ? `Đổi ${h.star_points_used || 0} sao → ${h.coins_received || 0} Xu` 
          : `Trả nợ ${formatVND(h.amount)}`,
        amount: h.type === "convert_star_to_coin" 
          ? (h.coins_received || 0) 
          : -(h.coins_used || 0),
        date: h.created_at,
        icon: h.type === "convert_star_to_coin" ? ArrowLeftRight : CheckCircle2,
        iconCls: h.type === "convert_star_to_coin" 
          ? "bg-blue-50 text-blue-500" 
          : "bg-emerald-50 text-emerald-500",
        isRefund: h.type === "pay_refund",
      }));

      // ===== LỊCH SỬ TRẢ NỢ =====
      const refundTx = (refundRes.data || []).map((r) => ({
        id: "refund-" + r.id,
        type: "refund",
        title: `Trả nợ đơn "${r.product_name || "Sản phẩm"}"`,
        amount: -(r.refund_paid_amount || r.star_points_awarded || 0),
        date: r.refund_paid_at || r.updated_at,
        icon: CheckCircle2,
        iconCls: "bg-emerald-50 text-emerald-500",
        isRefund: true,
      }));

      const merged = [...taskTx, ...milestoneTx, ...orderTx, ...gameTx, ...historyTx, ...refundTx]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(merged);
      setRefundTransactions(refundTx);
      setLoading(false);
    };

    fetchTransactions();
  }, [session]);

  const coins = profile?.coins || 0;
  const starPoints = Number(profile?.star_points || 0);
  const nextMilestone = (Math.floor(coins / 1000) + 1) * 1000;
  const ringPct = Math.round((coins % 1000) / 1000 * 100);

  const displayTransactions = showAll ? transactions : transactions.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#F5F7FB] pb-24 text-[#111827]">
      <TopHeader />

      <main className="mx-auto max-w-md space-y-4 px-4 py-5">
        {/* Card số dư */}
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

          {/* ===== HIỂN THỊ SAO ===== */}
          <div className="mt-3 flex items-center justify-center gap-6">
            <div className="flex items-center gap-1.5">
              <Star size={16} className="fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-[#111827]">{formatCoins(starPoints)}</span>
              <span className="text-xs text-[#9CA3AF]">Sao</span>
            </div>
            <button
              onClick={() => navigate("/shop-earn")}
              className="text-xs font-semibold text-[#3478F6] hover:underline"
            >
              Đổi sao →
            </button>
          </div>

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

        {/* ===== LỊCH SỬ HOẠT ĐỘNG ===== */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#111827]">Hoạt động</h2>
            {transactions.length > 5 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-xs font-semibold text-[#3478F6] hover:underline"
              >
                {showAll ? "Thu gọn" : "Xem tất cả"}
              </button>
            )}
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="animate-spin text-[#D1D5DB]" />
              </div>
            ) : displayTransactions.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#9CA3AF]">Chưa có giao dịch nào.</p>
            ) : (
              displayTransactions.map((tx) => {
                const Icon = tx.icon || ArrowUpRight;
                const iconCls = tx.iconCls || "bg-rose-50 text-rose-500";
                const isRefund = tx.isRefund || false;
                
                return (
                  <div key={tx.id} className="flex items-center justify-between border-b border-[#F3F4F6] pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-full ${iconCls}`}>
                        <Icon size={17} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">{tx.title}</p>
                        <p className="text-xs text-[#9CA3AF]">
                          {tx.date ? new Date(tx.date).toLocaleString("vi-VN") : ""}
                          {isRefund && (
                            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[8px] font-bold text-emerald-600">
                              <CheckCircle2 size={8} /> Đã trả nợ
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${
                      tx.amount > 0 ? "text-emerald-600" : 
                      tx.amount < 0 ? "text-rose-500" : 
                      "text-[#9CA3AF]"
                    }`}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString("vi-VN")} 
                      {tx.type === "convert_star" ? " Xu" : 
                       tx.type === "pay_refund" || tx.type === "refund" ? "đ" : 
                       " Coin"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ===== THỐNG KÊ TRẢ NỢ ===== */}
        {refundTransactions.length > 0 && (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <h2 className="text-sm font-bold text-[#111827]">Đã trả nợ thành công</h2>
              <span className="ml-auto text-xs text-[#9CA3AF]">{refundTransactions.length} đơn</span>
            </div>
            <div className="space-y-2">
              {refundTransactions.slice(0, 3).map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl bg-emerald-50 p-2.5">
                  <div>
                    <p className="text-[10px] font-semibold text-[#111827]">{r.title}</p>
                    <p className="text-[8px] text-[#9CA3AF]">
                      {r.date ? new Date(r.date).toLocaleString("vi-VN") : ""}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600">
                    {formatVND(Math.abs(r.amount))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
              }
