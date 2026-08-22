import React, { useState } from "react";
import {
  Wallet,
  ArrowRightLeft,
  CreditCard,
  Landmark,
  ShieldCheck,
  History,
  Clock3,
  TrendingUp,
  CircleDollarSign,
  Info,
} from "lucide-react";

export default function MarketingWallet() {
  const [activeTab, setActiveTab] = useState("overview");

  // TODO: Sau này lấy trực tiếp từ Supabase
  const marketingCoins = 0;
  const mainCoins = 372;

  const tabs = [
    { id: "overview", label: "Tổng quan", icon: Wallet },
    { id: "main", label: "Đổi Main", icon: ArrowRightLeft },
    { id: "card", label: "Thẻ cào", icon: CreditCard },
    { id: "bank", label: "Bank/Ví", icon: Landmark },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white px-4 pb-28 pt-5">
      <div className="mx-auto w-full max-w-2xl">
        {/* Header */}
        <div className="rounded-3xl border border-blue-100 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
              <Wallet className="h-7 w-7 text-blue-500" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Ví Marketing
              </h1>

              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-500 px-4 py-1.5 text-sm font-semibold text-white">
                  🔗 Marketing: {marketingCoins.toLocaleString()}
                </span>

                <span className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-700">
                  Main: {mainCoins.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-7 flex overflow-x-auto rounded-2xl bg-slate-100 p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex min-w-fit items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-blue-500 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tổng quan */}
        {activeTab === "overview" && (
          <div className="mt-4 space-y-4">
            {/* Balance */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex items-start gap-4">
                <ShieldCheck className="mt-1 h-7 w-7 text-blue-500" />

                <div>
                  <p className="text-lg text-slate-500">
                    Số dư Marketing Coin của bạn
                  </p>

                  <div className="mt-2 flex items-end gap-3">
                    <span className="text-5xl font-bold text-blue-500">
                      {marketingCoins.toLocaleString()}
                    </span>

                    <span className="pb-1 text-sm text-slate-400">
                      ≈ {marketingCoins.toLocaleString()} VNĐ (trước phí)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={History}
                title="Đã hoàn tất"
                value="0"
              />

              <StatCard
                icon={Clock3}
                title="Đang chờ"
                value="0"
              />

              <StatCard
                icon={TrendingUp}
                title="Tổng nhận VND"
                value="0"
              />

              <StatCard
                icon={ArrowRightLeft}
                title="Đã đổi Main"
                value="0"
              />
            </div>

            {/* Rules */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Info className="h-6 w-6 text-blue-500" />

                <h2 className="text-xl font-bold text-slate-900">
                  Quy tắc thanh toán
                </h2>
              </div>

              <div className="mt-5 space-y-3 text-sm leading-6 text-slate-500">
                <p>
                  • 1 Marketing Coin = 1 VNĐ khi đổi sang Main.
                </p>
                <p>
                  • Đơn đổi thưởng sẽ được kiểm tra trước khi xử lý.
                </p>
                <p>
                  • Coin từ video chỉ được cộng sau khi Admin xác nhận.
                </p>
                <p>
                  • Không tính view ảo hoặc hành vi gian lận.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Đổi Main */}
        {activeTab === "main" && (
          <ExchangeCard
            title="Đổi Marketing Coin → Main"
            description="Chuyển Marketing Coin sang số dư Main để sử dụng trong cửa hàng."
            balance={marketingCoins}
          />
        )}

        {/* Thẻ cào */}
        {activeTab === "card" && (
          <ExchangeCard
            title="Đổi thẻ cào"
            description="Đổi Marketing Coin thành thẻ cào điện thoại."
            balance={marketingCoins}
          />
        )}

        {/* Bank/Ví */}
        {activeTab === "bank" && (
          <ExchangeCard
            title="Rút về Bank / Ví"
            description="Yêu cầu rút tiền về phương thức thanh toán của bạn."
            balance={marketingCoins}
          />
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="h-6 w-6 text-slate-500" />

      <p className="mt-4 text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function ExchangeCard({ title, description, balance }) {
  return (
    <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <CircleDollarSign className="h-10 w-10 text-blue-500" />

      <h2 className="mt-4 text-2xl font-bold text-slate-900">
        {title}
      </h2>

      <p className="mt-2 leading-6 text-slate-500">
        {description}
      </p>

      <div className="mt-6 rounded-2xl bg-blue-50 p-5">
        <p className="text-sm text-slate-500">
          Số dư Marketing
        </p>

        <p className="mt-1 text-3xl font-bold text-blue-500">
          {balance.toLocaleString()} Coin
        </p>
      </div>

      <button
        disabled={balance <= 0}
        className="mt-5 w-full rounded-2xl bg-blue-500 py-4 font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
      >
        Tiếp tục
      </button>
    </div>
  );
      }
