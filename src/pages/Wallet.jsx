import React, { useState } from "react";
import { Coins, ArrowDownLeft, ArrowUpRight, Wallet, Gift, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import BottomNav from "../components/BottomNav.jsx";

// Dữ liệu mẫu cho lịch sử (sau này thay bằng API thật)
const MOCK_HISTORY = [
  { id: 1, type: "earn", title: "Hoàn thành nhiệm vụ", amount: 50, date: "Hôm nay" },
  { id: 2, type: "redeem", title: "Đổi Gói 500 Robux", amount: -14000, date: "Hôm qua" },
  { id: 3, type: "bonus", title: "Thưởng chuỗi ngày", amount: 100, date: "2 ngày trước" },
];

export default function Wallet() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [history] = useState(MOCK_HISTORY); // Dữ liệu mẫu

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 px-4 py-4 backdrop-blur-md">
        <h1 className="font-display text-xl font-bold text-slate-900">Ví của tôi</h1>
      </header>

      <main className="mx-auto max-w-md space-y-5 px-4 py-5">
        {/* Balance Card */}
        <div className="rounded-3xl bg-gradient-to-br from-sky-400 to-blue-600 p-6 text-white shadow-lg shadow-blue-500/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/80">Số dư khả dụng</span>
            <Wallet size={20} className="text-white/80" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Coins size={32} className="text-amber-300" />
            <span className="font-display text-4xl font-bold">{profile.coins?.toLocaleString() || 0}</span>
            <span className="text-lg font-medium text-white/80">Coin</span>
          </div>
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => navigate("/store")}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/20 py-3 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/30"
            >
              <Gift size={16} /> Đổi quà
            </button>
            <button
              onClick={() => navigate("/tasks")}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-semibold text-sky-600 shadow-sm transition hover:bg-sky-50"
            >
              <Plus size={16} /> Kiếm thêm
            </button>
          </div>
        </div>

        {/* Lịch sử giao dịch */}
        <div className="rounded-2xl border border-white bg-white p-4 shadow-sm shadow-slate-200/70">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Lịch sử giao dịch</h2>
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full ${item.amount > 0 ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"}`}>
                    {item.amount > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.date}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${item.amount > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                  {item.amount > 0 ? "+" : ""}{item.amount.toLocaleString()} Coin
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
        }
