import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Coins,
  Gamepad2,
  Landmark,
  ShieldCheck,
  Smartphone,
  Ticket,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";

const PACKAGES = [
  { id: "lq-5", amount: 5000, quanhuy: 10 },
  { id: "lq-10", amount: 10000, quanhuy: 20 },
  { id: "lq-20", amount: 20000, quanhuy: 40 },
  { id: "lq-50", amount: 50000, quanhuy: 102 },
  { id: "lq-100", amount: 100000, quanhuy: 204 },
  { id: "lq-200", amount: 200000, quanhuy: 408 },
  { id: "lq-500", amount: 500000, quanhuy: 1020 },
  { id: "lq-1000", amount: 1000000, quanhuy: 2090 },
  { id: "lq-2000", amount: 2000000, quanhuy: 4180 },
];

const PAYMENT_METHODS = [
  { id: "coin", title: "Coin", description: "Thanh toán bằng số dư Coin", icon: Coins },
  { id: "bank", title: "Ngân hàng", description: "Chuyển khoản ngân hàng / VietQR", icon: Landmark },
  { id: "card", title: "Thẻ cào", description: "Nạp bằng thẻ cào hỗ trợ", icon: Ticket },
];

function money(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} ₫`;
}

function PackageCard({ item, selected, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`relative rounded-2xl border p-3 text-left transition active:scale-[0.98] ${
        disabled
          ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-50"
          : selected
          ? "border-blue-500 bg-blue-50/70 ring-2 ring-blue-100"
          : "border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50"
      }`}
    >
      {selected && !disabled && (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
          <Check size={12} strokeWidth={3} />
        </span>
      )}
      <div className="pr-5 text-sm font-bold text-slate-900">{money(item.amount)}</div>
      <div className="mt-2 inline-flex rounded-lg bg-orange-50 px-2 py-1 text-xs font-bold text-orange-600">
        {item.quanhuy.toLocaleString("vi-VN")} Quân huy
      </div>
    </button>
  );
}

function PaymentCard({ method, selected, onClick }) {
  const Icon = method.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
        selected ? "border-blue-500 bg-blue-50/60 ring-2 ring-blue-100" : "border-slate-100 bg-white hover:border-blue-200"
      }`}
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-500"}`}>
        <Icon size={21} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-bold text-slate-900">{method.title}</div>
        <div className="mt-0.5 text-xs text-slate-500">{method.description}</div>
      </div>
      <div className={`h-5 w-5 rounded-full border-2 ${selected ? "border-blue-600 bg-blue-600" : "border-slate-300"}`}>
        {selected && <div className="m-1 h-2.5 w-2.5 rounded-full bg-white" />}
      </div>
    </button>
  );
}

export default function LienQuan() {
  const navigate = useNavigate();

  const [uid, setUid] = useState("");
  const [player, setPlayer] = useState(null);
  const [playerError, setPlayerError] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("coin");
  const [coinBalance, setCoinBalance] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const enoughCoins = useMemo(() => {
    if (coinBalance == null || !selectedPackage) return false;
    return Number(coinBalance) >= Number(selectedPackage.amount);
  }, [coinBalance, selectedPackage]);

  useEffect(() => {
    loadCoins();
  }, []);

  async function loadCoins() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return;
    const { data } = await supabase
      .from("profiles")
      .select("coins")
      .eq("id", auth.user.id)
      .maybeSingle();
    setCoinBalance(Number(data?.coins || 0));
  }

  const checkPlayer = () => {
    const cleanUid = String(uid || "").trim();
    setPlayerError("");
    setPlayer(null);

    if (!cleanUid) {
      setPlayerError("Vui lòng nhập ID người chơi.");
      return;
    }
    if (!/^\d+$/.test(cleanUid)) {
      setPlayerError("ID người chơi chỉ được chứa số.");
      return;
    }
    if (cleanUid.length < 8 || cleanUid.length > 15) {
      setPlayerError("ID người chơi không hợp lệ (phải từ 8-15 chữ số).");
      return;
    }

    setPlayer({ userId: cleanUid });
    setSelectedPackage(null);
  };

  async function createOrder() {
    setError("");
    if (!player?.userId) {
      setError("Vui lòng nhập và xác nhận UID trước.");
      return;
    }
    if (!selectedPackage) {
      setError("Vui lòng chọn mệnh giá nạp.");
      return;
    }
    if (paymentMethod === "coin" && !enoughCoins) {
      setError(`Không đủ Coin. Cần ${selectedPackage.amount.toLocaleString("vi-VN")} Coin.`);
      return;
    }

    setCreating(true);
    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        "create-lienquan-order",
        {
          body: {
            uid: Number(player.userId),
            amount: Number(selectedPackage.amount),
            quanhuy: Number(selectedPackage.quanhuy),
            package_id: selectedPackage.id,
            payment_method: paymentMethod,
          },
        }
      );
      if (functionError) throw functionError;
      if (!data?.order) throw new Error("Không nhận được đơn hàng.");
      navigate(`/history/order/${data.order.id}`);
    } catch (err) {
      console.error("Create Liên Quân order:", err);
      setError(err?.message || "Không thể tạo đơn. Hãy thử lại sau.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate("/store")}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-700 transition hover:bg-slate-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Gamepad2 size={21} />
          </div>
          <h1 className="text-base font-bold text-slate-900">Liên Quân Mobile</h1>
          <div className="ml-auto hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 sm:flex">
            <ShieldCheck size={14} />
            Thanh toán an toàn 100%
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-5 pb-12">
        {error && (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">1</div>
            <h2 className="text-base font-bold">Nhập ID</h2>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <UserRound size={17} />
              ID người chơi
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={uid}
                onChange={(e) => {
                  setUid(e.target.value);
                  setPlayer(null);
                  setPlayerError("");
                  setError("");
                }}
                inputMode="numeric"
                placeholder="Nhập UID Liên Quân của bạn"
                className="h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
              <button
                onClick={checkPlayer}
                className="h-12 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Xác nhận
              </button>
            </div>

            {playerError && (
              <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {playerError}
              </div>
            )}

            {player && (
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-green-600">
                  <Check size={18} strokeWidth={3} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-green-700">Đã xác nhận UID</p>
                  <p className="text-xs text-green-600">UID: {player.userId}</p>
                </div>
              </div>
            )}

            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <Smartphone size={14} />
              Kiểm tra kỹ UID trước khi nạp — sai UID không hoàn tiền
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">2</div>
            <h2 className="text-base font-bold">Mệnh giá nạp</h2>
          </div>

          {!player && (
            <p className="mb-3 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
              ⚠️ Vui lòng nhập ID người chơi trước khi chọn mệnh giá.
            </p>
          )}

          <div className="mb-4 flex rounded-xl bg-slate-100 p-1">
            <button className="flex-1 rounded-lg bg-white px-3 py-2.5 text-sm font-bold text-blue-600 shadow-sm">Nạp Online</button>
            <button
              onClick={() => setError("Thẻ Garena sẽ được hỗ trợ ở bước tiếp theo.")}
              className="flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-500"
            >
              Thẻ Garena
            </button>
          </div>

          <div className={!player ? "pointer-events-none select-none opacity-50" : ""}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {PACKAGES.map((item) => (
                <PackageCard
                  key={item.id}
                  item={item}
                  disabled={!player}
                  selected={selectedPackage?.id === item.id}
                  onClick={() => {
                    setSelectedPackage(item);
                    setError("");
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">3</div>
            <h2 className="text-base font-bold">Phương thức thanh toán</h2>
          </div>

          <div className="grid gap-3">
            {PAYMENT_METHODS.map((method) => (
              <PaymentCard
                key={method.id}
                method={method}
                selected={paymentMethod === method.id}
                onClick={() => {
                  setPaymentMethod(method.id);
                  setError("");
                }}
              />
            ))}
          </div>

          {paymentMethod === "coin" && (
            <div className="mt-3 flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3 text-sm">
              <span className="font-semibold text-amber-800">Số dư Coin</span>
              <span className="font-extrabold text-amber-700">
                {coinBalance == null ? "—" : `${coinBalance.toLocaleString("vi-VN")} Coin`}
              </span>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <div className="text-xs text-slate-500">Đơn hàng</div>
              <div className="mt-1 font-bold text-slate-900">
                {selectedPackage
                  ? `${selectedPackage.quanhuy.toLocaleString("vi-VN")} Quân huy · ${money(selectedPackage.amount)}`
                  : "Chưa chọn mệnh giá"}
              </div>
            </div>

            <button
              onClick={createOrder}
              disabled={creating || !player || !selectedPackage}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? "Đang tạo đơn..." : "Tiếp tục thanh toán"}
              {!creating && <ChevronRight size={18} />}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
