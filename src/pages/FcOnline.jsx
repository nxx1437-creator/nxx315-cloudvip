import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Loader2,
  ShieldCheck,
  User,
  Wallet,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Coins,
  Copy,
  Trophy,
  Zap,
  TrendingUp,
  Goal,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient.js";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";

const SUPABASE_STORAGE =
  "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos";

const FCO_BANNER = `${SUPABASE_STORAGE}/fc-online-banner.png`;
const FCO_LOGO = `${SUPABASE_STORAGE}/fc-online.png`;

// Gói FC — giá VNĐ, số FC
const PACKAGES = [
  { id: "fco-50", amount: 20000, fc: 50, image: `${SUPABASE_STORAGE}/fc.png` },
  { id: "fco-100", amount: 40000, fc: 100, image: `${SUPABASE_STORAGE}/fc.png` },
  { id: "fco-250", amount: 100000, fc: 250, image: `${SUPABASE_STORAGE}/fc.png` },
  { id: "fco-500", amount: 200000, fc: 500, image: `${SUPABASE_STORAGE}/fc.png` },
  { id: "fco-1200", amount: 500000, fc: 1200, image: `${SUPABASE_STORAGE}/fc.png` },
  { id: "fco-2500", amount: 1000000, fc: 2500, image: `${SUPABASE_STORAGE}/fc.png` },
  { id: "fco-5000", amount: 2000000, fc: 5000, image: `${SUPABASE_STORAGE}/fc.png` },
  { id: "fco-10000", amount: 4000000, fc: 10000, image: `${SUPABASE_STORAGE}/fc.png` },
];

const BANK = {
  name: "MB Bank",
  account: "0939339622",
  holder: "NGUYEN VAN CO",
};

const CARD_TYPES = {
  Viettel: [
    { value: 10000, received: 7600 },
    { value: 20000, received: 15800 },
    { value: 30000, received: 23700 },
    { value: 50000, received: 42500 },
    { value: 100000, received: 85000 },
    { value: 200000, received: 168000 },
    { value: 300000, received: 252000 },
    { value: 500000, received: 405000 },
    { value: 1000000, received: 810000 },
  ],
  Mobifone: [
    { value: 10000, received: 7900 },
    { value: 20000, received: 15800 },
    { value: 30000, received: 23700 },
    { value: 50000, received: 39500 },
    { value: 100000, received: 80000 },
    { value: 200000, received: 162000 },
    { value: 300000, received: 243000 },
    { value: 500000, received: 405000 },
  ],
  Vinaphone: [
    { value: 10000, received: 7900 },
    { value: 20000, received: 16600 },
    { value: 30000, received: 24900 },
    { value: 50000, received: 43000 },
    { value: 100000, received: 87000 },
    { value: 200000, received: 174000 },
    { value: 300000, received: 261000 },
    { value: 500000, received: 435000 },
  ],
  Zing: [
    { value: 10000, received: 8450 },
    { value: 20000, received: 16600 },
    { value: 50000, received: 42250 },
    { value: 100000, received: 84500 },
    { value: 200000, received: 169000 },
    { value: 500000, received: 422500 },
    { value: 1000000, received: 845000 },
  ],
  Garena: [
    { value: 10000, received: 8250 },
    { value: 20000, received: 16500 },
    { value: 50000, received: 41250 },
    { value: 100000, received: 82500 },
    { value: 200000, received: 165000 },
    { value: 500000, received: 412500 },
    { value: 1000000, received: 825000 },
  ],
};

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN").format(Number(value || 0)) + "đ";

function copyText(text) {
  navigator.clipboard?.writeText(text);
}
export default function FcOnline() {
  const navigate = useNavigate();

  const [step, setStep] = useState("package");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [characterId, setCharacterId] = useState("");

  const [order, setOrder] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const [method, setMethod] = useState("coin");
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [cards, setCards] = useState([
    { id: Date.now(), type: "Viettel", amount: "", serial: "", code: "" },
  ]);

  const [cardResult, setCardResult] = useState(null);
  const [cardChecking, setCardChecking] = useState(false);
  const resultRef = useRef(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (cardResult) {
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }
  }, [cardResult]);

  const loadProfile = async () => {
    setLoadingProfile(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("coins")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Load coins error:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const continueToPayment = async () => {
    if (!selectedPackage) {
      alert("Vui lòng chọn gói FC.");
      return;
    }
    if (!characterId.trim()) {
      alert("Vui lòng nhập Character Name / ID.");
      return;
    }

    setCreatingOrder(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        alert("Bạn chưa đăng nhập.");
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "create-fco-order",
        {
          body: {
            character_id: characterId.trim(),
            package_id: selectedPackage.id,
            payment_method: method,
          },
        }
      );

      if (error) throw new Error(error.message || "Không thể tạo đơn hàng.");
      if (!data?.order) throw new Error("Không nhận được đơn hàng.");

      setOrder(data.order);
      setStep("payment");
    } catch (error) {
      console.error("Create FC Online order:", error);
      alert(error?.message || "Không thể tạo đơn. Hãy thử lại sau.");
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleCoinPayment = async () => {
    if (!order?.id) return alert("Không tìm thấy đơn hàng.");
    if (order.status !== "pending")
      return alert("Đơn hàng này không còn ở trạng thái chờ thanh toán.");

    const requiredCoins = Number(order.amount || 0);
    const coinBalance = Number(profile?.coins || 0);

    if (coinBalance < requiredCoins) {
      return alert(
        `Không đủ Coin.\n\nCần: ${requiredCoins.toLocaleString(
          "vi-VN"
        )} Coin\nBạn có: ${coinBalance.toLocaleString("vi-VN")} Coin`
      );
    }

    try {
      const { data: paymentResult, error: paymentError } = await supabase.rpc(
        "pay_fco_order_with_coins",
        { p_order_id: order.id }
      );

      if (paymentError) throw new Error(paymentError.message);

      if (!paymentResult?.success) {
        const err = paymentResult?.error || "";
        if (err === "INSUFFICIENT_COINS") throw new Error("Không đủ Coin để thanh toán.");
        if (err === "ORDER_NOT_FOUND") throw new Error("Không tìm thấy đơn hàng.");
        if (err === "NOT_YOUR_ORDER") throw new Error("Bạn không có quyền thanh toán đơn này.");
        if (err === "ORDER_NOT_PENDING") throw new Error("Đơn hàng đã được thanh toán.");
        throw new Error("Thanh toán thất bại: " + err);
      }

      alert(
        `🎉 Thanh toán thành công!\n\n` +
          `Đã trừ: ${requiredCoins.toLocaleString("vi-VN")} Coin\n` +
          `Coin còn lại: ${Number(paymentResult.remaining_coins).toLocaleString("vi-VN")} Coin`
      );

      navigate(`/history/order/${order.id}`);
    } catch (error) {
      alert(error?.message || "Không thể thanh toán bằng Coin.");
    }
  };

  const handleConfirmTransfer = async () => {
    if (!order?.id || order.status !== "pending") return;

    const ok = window.confirm(
      "Bạn đã chuyển đúng số tiền và đúng nội dung chuyển khoản chưa?"
    );
    if (!ok) return;

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "paid", payment_method: "bank" })
        .eq("id", order.id)
        .eq("status", "pending");

      if (error) throw error;

      alert("✅ Đã ghi nhận. Admin sẽ kiểm tra và duyệt đơn.");
      navigate(`/history/order/${order.id}`);
    } catch (error) {
      alert("Không thể xác nhận đơn hàng.\n\n" + (error?.message || ""));
    }
  };

  const addCard = () => {
    setCards((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), type: "Viettel", amount: "", serial: "", code: "" },
    ]);
  };

  const removeCard = (id) => {
    setCards((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((card) => card.id !== id);
    });
  };

  const updateCard = (id, field, value) => {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, [field]: value } : card))
    );
  };

  const checkCardTransactions = async (requestIds) => {
    const ids = requestIds.filter(Boolean);
    if (!ids.length) throw new Error("API không trả về mã giao dịch.");

    setCardChecking(true);
    try {
      for (let attempt = 0; attempt < 40; attempt++) {
        const results = [];

        for (const requestId of ids) {
          const { data, error } = await supabase.functions.invoke(
            "apidoithe-webhook",
            { body: { transaction_id: requestId } }
          );

          if (error) throw new Error(error.message || "Không thể kiểm tra trạng thái thẻ.");

          results.push({
            requestId,
            status: String(data?.status || "").toLowerCase(),
            netAmount: Number(data?.net_amount || 0),
            reason: data?.reason || data?.message || "Giao dịch không thành công.",
            order_id: data?.order_id || null,
            order_code: data?.order_code || null,
          });
        }

        if (results.some((item) => item.status === "failed"))
          return { status: "failed", results };
        if (results.length && results.every((item) => item.status === "success"))
          return { status: "success", results };

        await new Promise((resolve) => setTimeout(resolve, 2500));
      }

      return { status: "processing", results: [] };
    } finally {
      setCardChecking(false);
    }
  };

  const handleCardPayment = async () => {
    for (const card of cards) {
      if (!card.type || !card.amount || !card.serial || !card.code) {
        alert("Vui lòng nhập đầy đủ thông tin tất cả thẻ.");
        return;
      }
    }

    const ok = window.confirm(
      "Bạn đã kiểm tra kỹ loại thẻ và mệnh giá chưa?\n\nĐiền sai mệnh giá có thể khiến thẻ bị mất."
    );
    if (!ok) return;

    setCardResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token)
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");

      const requestIds = [];

      for (const card of cards) {
        const { data, error } = await supabase.functions.invoke("submit-card", {
          body: {
            telco: card.type,
            denomination: Number(card.amount),
            serial: card.serial.trim(),
            code: card.code.trim(),
          },
        });

        if (error) throw new Error(error.message || "Không thể gửi thẻ lên hệ thống.");
        if (!data?.success || !data?.request_id)
          throw new Error(data?.message || data?.error || "API không trả về mã giao dịch.");

        requestIds.push(String(data.request_id));
      }

      const result = await checkCardTransactions(requestIds);

      if (result.status === "success") {
        const totalNetAmount = result.results.reduce(
          (sum, item) => sum + Number(item.netAmount || 0),
          0
        );
        const firstOrderId = result.results[0]?.order_id;

        setCardResult({ status: "success", totalNetAmount, results: result.results });
        setCards([
          { id: Date.now(), type: "Viettel", amount: "", serial: "", code: "" },
        ]);

        if (firstOrderId) {
          setTimeout(() => {
            navigate(`/nap-thanh-cong/${firstOrderId}`, {
              state: { coinsAdded: totalNetAmount },
            });
          }, 1500);
        }
        return;
      }

      if (result.status === "failed") {
        const failed = result.results.find((item) => item.status === "failed");
        setCardResult({
          status: "failed",
          reason: failed?.reason || "Thẻ không hợp lệ hoặc giao dịch bị từ chối.",
          results: result.results,
        });
        return;
      }

      setCardResult({ status: "processing", results: result.results });
    } catch (error) {
      console.error("FC Online card payment error:", error);
      setCardResult({
        status: "error",
        message: error?.message || "Không thể xử lý thẻ. Vui lòng thử lại sau.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] pb-40 text-slate-900">
      <TopHeader />

      <main className="mx-auto w-full max-w-4xl px-4 py-5 sm:py-6">
        <HeroBanner onBack={() => navigate("/store")} />

        <div className="mt-5" />

        {step === "package" && (
          <PackageStep
            selectedPackage={selectedPackage}
            setSelectedPackage={setSelectedPackage}
            characterId={characterId}
            setCharacterId={setCharacterId}
            onContinue={continueToPayment}
            creatingOrder={creatingOrder}
          />
        )}

        {step === "payment" && (
          <PaymentStep
            method={method}
            setMethod={setMethod}
            selectedPackage={selectedPackage}
            characterId={characterId}
            order={order}
            profile={profile}
            loadingProfile={loadingProfile}
            cards={cards}
            updateCard={updateCard}
            addCard={addCard}
            removeCard={removeCard}
            onBack={() => setStep("package")}
            onCoinPayment={handleCoinPayment}
            onConfirmTransfer={handleConfirmTransfer}
            onCardPayment={handleCardPayment}
            cardResult={cardResult}
            cardChecking={cardChecking}
            resultRef={resultRef}
          />
        )}
      </main>

      <BottomNav />
    </div>
  );
      }
    function HeroBanner({ onBack }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm">
      <div className="relative h-48 overflow-hidden sm:h-64">
        <img
          src={FCO_BANNER}
          alt="FC Mobile VN"    
          ...
        />
        ...
      </div>

      <div className="relative -mt-10 px-5 pb-5">
        <div className="flex items-end gap-3.5">
          <div className="relative shrink-0">
            ...
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-green-50 shadow-lg sm:h-24 sm:w-24">
              <img
                src={FCO_LOGO}
                alt="FC Mobile VN"    
                ...
              />
            </div>
          </div>

          <div className="min-w-0 flex-1 pb-1">
            <div className="flex items-center gap-1.5">
              <Trophy size={12} className="text-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-green-600">
                Football Store
              </span>
            </div>
            <h1 className="mt-0.5 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              FC Mobile VN              {/* ← Đổi từ "FC Online" */}
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Nạp FC chính hãng · Tự động 24/7
            </p>
          </div>
        </div>
        ...
      </div>
    </div>
  );
          }

function StatPill({ icon: Icon, label, color }) {
  const colorMap = {
    green: "bg-green-50 text-green-700 border-green-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };
  return (
    <div
      className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 ${colorMap[color]}`}
    >
      <Icon size={14} className="shrink-0" />
      <span className="text-[11px] font-semibold">{label}</span>
    </div>
  );
}
function PackageStep({
  selectedPackage,
  setSelectedPackage,
  characterId,
  setCharacterId,
  onContinue,
  creatingOrder,
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500">
          <AlertTriangle size={16} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-amber-900">
            Kiểm tra kỹ id trước khi nạp
          </p>
          <p className="mt-1 text-xs leading-5 text-amber-800">
            FV sẽ nạp vào id đã xác nhận. Sai tên không hoàn tiền.
          </p>
        </div>
      </div>

      {/* Nhập Character Name */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-md shadow-green-200">
            <User size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">
              Tài khoản FC Mobile VN        
             </h2>
            <p className="text-xs text-slate-500">
              Nhập id để nhận FV
            </p>
          </div>
        </div>

        <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-green-600">
          id người dùng 
        </label>

        <div className="relative">
          <Goal
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={characterId}
            onChange={(e) => setCharacterId(e.target.value)}
            placeholder="Ví dụ: Ronaldo7"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-11 pr-4 text-sm font-bold text-slate-800 outline-none transition placeholder:font-medium placeholder:text-slate-300 focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-100"
          />
        </div>
      </section>

      {/* Chọn gói FC */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-md shadow-green-200">
              <Trophy size={16} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                Chọn gói FV
              </h2>
              <p className="text-[11px] text-slate-500">
                {PACKAGES.length} gói khả dụng
              </p>
            </div>
          </div>
          <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700">
            OFFICIAL
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          {PACKAGES.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              active={selectedPackage?.id === pkg.id}
              onSelect={setSelectedPackage}
            />
          ))}
        </div>
      </section>

      {/* Nút tiếp tục */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <button
          onClick={onContinue}
          disabled={!selectedPackage || !characterId.trim() || creatingOrder}
          className="group relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-sm font-black text-white shadow-lg shadow-green-300/50 transition hover:shadow-green-400/60 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          {creatingOrder ? (
            <>
              <Loader2 size={18} className="relative animate-spin" />
              <span className="relative">Đang tạo đơn...</span>
            </>
          ) : (
            <>
              <span className="relative">Tiếp tục</span>
              <ChevronRight size={18} className="relative" />
            </>
          )}
        </button>

        {!selectedPackage && (
          <p className="mt-2 text-center text-xs text-slate-400">
            Chọn một gói để tiếp tục
          </p>
        )}
        {selectedPackage && !characterId.trim() && (
          <p className="mt-2 text-center text-xs text-slate-400">
            Nhập Character Name để tiếp tục
          </p>
        )}
      </section>
    </div>
  );
}

function PackageCard({ pkg, active, onSelect }) {
  return (
    <button
      onClick={() => onSelect(pkg)}
      className={`group relative overflow-hidden rounded-2xl border-2 bg-white p-3 text-left transition-all duration-200 ${
        active
          ? "border-green-500 bg-green-50/40 shadow-lg shadow-green-200/60 -translate-y-1"
          : "border-slate-200 hover:-translate-y-1 hover:border-green-300 hover:shadow-lg"
      }`}
    >
      {active && (
        <div className="absolute right-2.5 top-2.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white shadow-md">
          <CheckCircle2 size={12} strokeWidth={3} />
        </div>
      )}

      <div className="relative mx-auto mb-3 aspect-square w-full max-w-[80px] overflow-hidden rounded-xl border border-slate-100 bg-gradient-to-br from-green-50 to-emerald-50">
        <img
          src={pkg.image}
          alt={`${pkg.fc} FC`}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.style.opacity = "0.3";
          }}
        />
      </div>

      <div className="relative text-center">
        <p className="text-lg font-black leading-none text-slate-900">
          {pkg.fc.toLocaleString("vi-VN")}
        </p>
        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-green-600">
          FC
        </p>

        <div className="mt-2.5 border-t border-slate-100 pt-2.5">
          <p className="text-sm font-black text-green-600">
            {formatPrice(pkg.amount)}
          </p>
        </div>
      </div>
    </button>
  );
}
function PaymentStep({
  method,
  setMethod,
  selectedPackage,
  characterId,
  order,
  profile,
  loadingProfile,
  cards,
  updateCard,
  addCard,
  removeCard,
  onBack,
  onCoinPayment,
  onConfirmTransfer,
  onCardPayment,
  cardResult,
  cardChecking,
  resultRef,
}) {
  const cardTypes = Object.keys(CARD_TYPES);
  const cardDiscounts = {
    Viettel: 24,
    Mobifone: 21,
    Vinaphone: 21,
    Zing: 15.5,
    Garena: 17.5,
  };
  const cardDenominations = CARD_TYPES;

  if (!order) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <XCircle className="mx-auto mb-3 text-rose-500" size={42} />
        <h2 className="text-base font-black text-slate-900">
          Không tìm thấy đơn hàng
        </h2>
        <button
          onClick={onBack}
          className="mt-5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-green-200"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const transferContent = `NAP FCO ${order.order_code} ${order.fco_character_id} ${order.fco_fc}FC`;
  const coinBalance = Number(profile?.coins || 0);
  const requiredCoins = Number(order.amount || 0);
  const enoughCoins = coinBalance >= requiredCoins;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-md shadow-green-200">
          <CreditCard size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-base font-black text-slate-900">Thanh toán</h2>
          <p className="text-xs text-slate-500">Chọn phương thức phù hợp</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-br from-green-50 to-emerald-50 p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-green-600">
            Tổng thanh toán
          </p>
          <p className="mt-1 text-3xl font-black text-slate-900">
            {formatPrice(order.amount)}
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600">
            Mã đơn:{" "}
            <span className="font-mono text-green-700">{order.order_code}</span>
          </div>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
            {[
              { key: "coin", label: "Coin" },
              { key: "bank", label: "Chuyển khoản" },
              { key: "card", label: "Thẻ cào" },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => setMethod(m.key)}
                className={`rounded-lg py-2.5 text-xs font-bold transition ${
                  method === m.key
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {method === "coin" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400">
                    <Coins size={16} className="text-white" />
                  </div>
                  <span className="text-xs font-bold text-amber-800">
                    Số dư Coin
                  </span>
                </div>
                <span className="text-lg font-black text-amber-700">
                  {loadingProfile
                    ? "..."
                    : coinBalance.toLocaleString("vi-VN")}
                </span>
              </div>

              <div className="space-y-2.5 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Cần thanh toán
                  </span>
                  <span className="text-sm font-black text-slate-800">
                    {requiredCoins.toLocaleString("vi-VN")} Coin
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-2.5">
                  <span className="text-xs text-slate-500">
                    Sau thanh toán
                  </span>
                  <span
                    className={`text-sm font-black ${
                      enoughCoins ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {Math.max(coinBalance - requiredCoins, 0).toLocaleString(
                      "vi-VN"
                    )}{" "}
                    Coin
                  </span>
                </div>
              </div>

              <button
                onClick={onCoinPayment}
                disabled={loadingProfile || !enoughCoins}
                className="group relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-sm font-bold text-white shadow-md shadow-green-200 transition hover:shadow-green-300/60 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">
                  {enoughCoins
                    ? `Thanh toán ${requiredCoins.toLocaleString(
                        "vi-VN"
                      )} Coin`
                    : "Không đủ Coin"}
                </span>
              </button>
            </div>
          )}

          {method === "bank" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800">
                    Thông tin ngân hàng
                  </h3>
                  <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700">
                    {BANK.name}
                  </span>
                </div>
                <div className="space-y-2.5">
                  <BankRow label="Số tài khoản" value={BANK.account} copy />
                  <BankRow label="Chủ tài khoản" value={BANK.holder} />
                  <BankRow
                    label="Số tiền"
                    value={formatPrice(order.amount)}
                    copyValue={String(order.amount)}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-black text-amber-800">
                  Nội dung chuyển khoản
                </p>
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-white p-2.5">
                  <code className="min-w-0 flex-1 break-all font-mono text-xs font-bold text-slate-700">
                    {transferContent}
                  </code>
                  <button
                    onClick={() => copyText(transferContent)}
                    className="shrink-0 rounded-lg bg-amber-400 p-2 text-white shadow-md transition hover:bg-amber-500"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              {order.status === "paid" ? (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <CheckCircle2 size={22} className="text-emerald-500" />
                  <div>
                    <p className="text-sm font-black text-emerald-700">
                      Đã gửi xác nhận
                    </p>
                    <p className="mt-0.5 text-xs text-emerald-600">
                      Đơn đang chờ admin kiểm tra
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={onConfirmTransfer}
                  className="group relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-sm font-bold text-white shadow-md shadow-green-200 transition hover:shadow-green-300/60"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative">Tôi đã chuyển khoản</span>
                </button>
              )}
            </div>
          )}
                      {method === "card" && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  Nạp bằng thẻ cào
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Coin nạp từ thẻ sẽ được cộng vào ví của bạn
                </p>
              </div>

              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                {cardTypes.map((type) => (
                  <div
                    key={type}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-center"
                  >
                    <p className="text-[10px] font-bold text-slate-600">
                      {type}
                    </p>
                    <p className="mt-0.5 text-xs font-black text-green-600">
                      {cardDiscounts[type]}%
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5">
                <AlertTriangle
                  size={16}
                  className="mt-0.5 shrink-0 text-rose-500"
                />
                <p className="text-xs font-bold text-rose-700">
                  Điền sai mệnh giá sẽ bị mất thẻ!
                </p>
              </div>

              {cards.map((card, index) => {
                const options = cardDenominations[card.type] || [];

                return (
                  <div
                    key={card.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 text-[11px] font-black text-white shadow-sm">
                          {index + 1}
                        </span>
                        <p className="text-sm font-black text-slate-800">
                          Thẻ #{index + 1}
                        </p>
                      </div>

                      {cards.length > 1 && (
                        <button
                          onClick={() => removeCard(card.id)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-500 transition hover:bg-rose-100"
                        >
                          Xóa
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-green-600">
                          Loại thẻ
                        </label>
                        <select
                          value={card.type}
                          onChange={(e) => {
                            updateCard(card.id, "type", e.target.value);
                            updateCard(card.id, "amount", "");
                          }}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-100"
                        >
                          {cardTypes.map((t) => (
                            <option key={t} value={t}>
                              {t} — CK {cardDiscounts[t]}%
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-green-600">
                          Mệnh giá
                        </label>
                        <select
                          value={card.amount}
                          onChange={(e) =>
                            updateCard(card.id, "amount", e.target.value)
                          }
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-100"
                        >
                          <option value="">Chọn mệnh giá</option>
                          {options.map((item) => (
                            <option key={item.value} value={item.value}>
                              {formatPrice(item.value)} →{" "}
                              {formatPrice(item.received)}
                            </option>
                          ))}
                        </select>

                        {card.amount &&
                          (() => {
                            const sel = options.find(
                              (item) =>
                                Number(item.value) === Number(card.amount)
                            );
                            if (!sel) return null;
                            return (
                              <div className="mt-2 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                                <span className="text-xs font-semibold text-emerald-600">
                                  Coin nhận được
                                </span>
                                <span className="text-xs font-black text-emerald-600">
                                  +{formatPrice(sel.received)}
                                </span>
                              </div>
                            );
                          })()}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-green-600">
                            Số serial
                          </label>
                          <input
                            value={card.serial}
                            onChange={(e) =>
                              updateCard(card.id, "serial", e.target.value)
                            }
                            placeholder="Nhập serial"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:font-normal placeholder:text-slate-300 focus:border-green-400 focus:ring-2 focus:ring-green-100"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-green-600">
                            Mã thẻ
                          </label>
                          <input
                            value={card.code}
                            onChange={(e) =>
                              updateCard(card.id, "code", e.target.value)
                            }
                            placeholder="Nhập mã"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:font-normal placeholder:text-slate-300 focus:border-green-400 focus:ring-2 focus:ring-green-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={addCard}
                className="h-11 w-full rounded-xl border-2 border-dashed border-green-200 text-sm font-bold text-green-600 transition hover:border-green-400 hover:bg-green-50"
              >
                + Thêm thẻ
              </button>

              <button
                onClick={onCardPayment}
                disabled={cardChecking}
                className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-sm font-bold text-white shadow-md shadow-green-200 transition hover:shadow-green-300/60 disabled:opacity-50"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                {cardChecking ? (
                  <>
                    <Loader2 size={18} className="relative animate-spin" />
                    <span className="relative">Đang kiểm tra thẻ...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={18} className="relative" />
                    <span className="relative">Nạp tiền</span>
                  </>
                )}
              </button>

              <div ref={resultRef} className="scroll-mt-24 space-y-3">
                {cardResult?.status === "success" && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <CheckCircle2 size={22} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-emerald-700">
                          Nạp thẻ thành công
                        </p>
                        <p className="mt-0.5 text-xs text-emerald-600">
                          Đã cộng{" "}
                          <b>{formatPrice(cardResult.totalNetAmount)}</b> Coin
                          vào ví
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {cardResult?.status === "failed" && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white">
                        <XCircle size={22} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-rose-700">
                          Thanh toán không thành công
                        </p>
                        <p className="mt-1 text-xs font-medium text-rose-600">
                          {cardResult.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {cardResult?.status === "processing" && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <Loader2
                        size={22}
                        className="mt-0.5 shrink-0 animate-spin text-amber-500"
                      />
                      <div>
                        <p className="text-sm font-black text-amber-700">
                          Giao dịch đang xử lý
                        </p>
                        <p className="mt-1 text-xs text-amber-600">
                          Coin chỉ được cộng khi giao dịch thành công
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {cardResult?.status === "error" && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                    <div className="flex items-start gap-3">
                      <XCircle
                        size={22}
                        className="mt-0.5 shrink-0 text-rose-500"
                      />
                      <div>
                        <p className="text-sm font-black text-rose-700">
                          Không thể xử lý
                        </p>
                        <p className="mt-1 text-xs text-rose-600">
                          {cardResult.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={onBack}
            disabled={cardChecking}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}

function BankRow({ label, value, copy = false, copyValue }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(copyValue || value);
      alert("Đã sao chép!");
    } catch (error) {
      console.error("Copy error:", error);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-2.5 last:border-0 last:pb-0">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <span className="break-all text-right text-sm font-black text-slate-800">
          {value}
        </span>
        {(copy || copyValue) && (
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-green-600"
            title="Sao chép"
          >
            <Copy size={14} />
          </button>
        )}
      </div>
    </div>
  );
                                }
  
