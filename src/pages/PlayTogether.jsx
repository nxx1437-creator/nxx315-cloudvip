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
  Sparkles,
  Zap,
  Gift,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient.js";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import TermsCheckbox from "../components/TermsCheckbox.jsx";

const SUPABASE_STORAGE =
  "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos";

const PLAYTOGETHER_BANNER = `${SUPABASE_STORAGE}/playtogether-banner1.png`;
const PLAYTOGETHER_LOGO = `${SUPABASE_STORAGE}/play-together-vng.png`;

const PACKAGES = [
  {
    id: "pt-9",
    name: "Một ít thỏi vàng",
    gold: 9,
    price: 25500,
    originalPrice: 30000,
    discount: 15,
    image: `${SUPABASE_STORAGE}/play-together-9.png`,
  },
  {
    id: "pt-18",
    name: "Thỏi vàng",
    gold: 18,
    price: 50000,
    originalPrice: 60000,
    discount: 17,
    image: `${SUPABASE_STORAGE}/play-together-18.png`,
  },
  {
    id: "pt-45",
    name: "Vài thỏi vàng",
    gold: 45,
    price: 130000,
    originalPrice: 150000,
    discount: 13,
    image: `${SUPABASE_STORAGE}/play-together-45.png`,
  },
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
  Garena: [
    { value: 10000, received: 8250 },
    { value: 20000, received: 16500 },
    { value: 50000, received: 41250 },
    { value: 100000, received: 82500 },
    { value: 200000, received: 165000 },
    { value: 500000, received: 412500 },
    { value: 1000000, received: 825000 },
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
};

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN").format(Number(value || 0)) + "đ";

function copyText(text) {
  navigator.clipboard?.writeText(text);
}
export default function PlayTogether() {
  const navigate = useNavigate();

  const [step, setStep] = useState("package");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [uid, setUid] = useState("");

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
  const [agreedTerms, setAgreedTerms] = useState(false);

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
      alert("Vui lòng chọn gói thỏi vàng.");
      return;
    }
    if (!uid.trim()) {
      alert("Vui lòng nhập UID Play Together.");
      return;
    }

    const cleanUid = uid.trim().toUpperCase();
    const uidRegex = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

    if (!uidRegex.test(cleanUid)) {
      alert(
        "UID Play Together không hợp lệ.\n\n" +
          "Định dạng đúng: XXXX-XXXX-XXXX\n" +
          "Ví dụ: XXXX-XXXX-XXXX"
      );
      return;
    }

    setUid(cleanUid);
    setCreatingOrder(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        alert("Bạn chưa đăng nhập.");
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "create-playtogether-order",
        {
          body: {
            uid: cleanUid,
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
      console.error("Create Play Together order:", error);
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
        "pay_playtogether_order_with_coins",
        { p_order_id: order.id }
      );

      if (paymentError) throw new Error(paymentError.message);

      if (!paymentResult?.success) {
        const err = paymentResult?.error || "";
        if (err === "INSUFFICIENT_COINS")
          throw new Error("Không đủ Coin để thanh toán.");
        if (err === "ORDER_NOT_FOUND") throw new Error("Không tìm thấy đơn hàng.");
        if (err === "NOT_YOUR_ORDER")
          throw new Error("Bạn không có quyền thanh toán đơn này.");
        if (err === "ORDER_NOT_PENDING")
          throw new Error("Đơn hàng đã được thanh toán.");
        throw new Error("Thanh toán thất bại: " + err);
      }

      alert(
        ` Thanh toán thành công!\n\n` +
          `Đã trừ: ${requiredCoins.toLocaleString("vi-VN")} Coin\n` +
          `Coin còn lại: ${Number(paymentResult.remaining_coins).toLocaleString(
            "vi-VN"
          )} Coin`
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

      alert(" Đã ghi nhận. Admin sẽ kiểm tra và duyệt đơn.");
      navigate(`/history/order/${order.id}`);
    } catch (error) {
      alert("Không thể xác nhận đơn hàng.\n\n" + (error?.message || ""));
    }
  };

  const addCard = () => {
    setCards((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        type: "Viettel",
        amount: "",
        serial: "",
        code: "",
      },
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

          if (error)
            throw new Error(
              error.message || "Không thể kiểm tra trạng thái thẻ."
            );

          results.push({
            requestId,
            status: String(data?.status || "").toLowerCase(),
            netAmount: Number(data?.net_amount || 0),
            reason:
              data?.reason || data?.message || "Giao dịch không thành công.",
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
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token)
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");

      const requestIds = [];

      for (const card of cards) {
        const { data, error } = await supabase.functions.invoke(
          "submit-card",
          {
            body: {
              telco: card.type,
              denomination: Number(card.amount),
              serial: card.serial.trim(),
              code: card.code.trim(),
            },
          }
        );

        if (error)
          throw new Error(error.message || "Không thể gửi thẻ lên hệ thống.");
        if (!data?.success || !data?.request_id)
          throw new Error(
            data?.message || data?.error || "API không trả về mã giao dịch."
          );

        requestIds.push(String(data.request_id));
      }

      const result = await checkCardTransactions(requestIds);

      if (result.status === "success") {
        const totalNetAmount = result.results.reduce(
          (sum, item) => sum + Number(item.netAmount || 0),
          0
        );
        const firstOrderId = result.results[0]?.order_id;

        setCardResult({
          status: "success",
          totalNetAmount,
          results: result.results,
        });
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
          reason:
            failed?.reason || "Thẻ không hợp lệ hoặc giao dịch bị từ chối.",
          results: result.results,
        });
        return;
      }

      setCardResult({ status: "processing", results: result.results });
    } catch (error) {
      console.error("Play Together card payment error:", error);
      setCardResult({
        status: "error",
        message:
          error?.message || "Không thể xử lý thẻ. Vui lòng thử lại sau.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-40 text-slate-900">
      <TopHeader />

      <main className="mx-auto w-full max-w-4xl px-4 py-5 sm:py-6">
        {/* Hero Banner */}
        <HeroBanner onBack={() => navigate("/store")} />

        {/* Spacer */}
       <div className="mt-5" />

        {step === "package" && (
  <PackageStep
    selectedPackage={selectedPackage}
    setSelectedPackage={setSelectedPackage}
    onContinue={() => setStep("uid")}
    agreedTerms={agreedTerms}
    setAgreedTerms={setAgreedTerms}
  />
)}

        {step === "uid" && (
          <UidStep
            uid={uid}
            setUid={setUid}
            selectedPackage={selectedPackage}
            creatingOrder={creatingOrder}
            onBack={() => setStep("package")}
            onContinue={continueToPayment}
          />
        )}

        {step === "payment" && (
          <PaymentStep
            method={method}
            setMethod={setMethod}
            selectedPackage={selectedPackage}
            uid={uid}
            order={order}
            profile={profile}
            loadingProfile={loadingProfile}
            cards={cards}
            updateCard={updateCard}
            addCard={addCard}
            removeCard={removeCard}
            onBack={() => setStep("uid")}
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
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Banner image */}
      <div className="relative h-44 overflow-hidden sm:h-60">
        <img
          src={PLAYTOGETHER_BANNER}
          alt="Play Together"
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/90 text-slate-700 shadow-md backdrop-blur-md transition hover:bg-white"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Live badge */}
        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[11px] font-bold text-emerald-600">
            ONLINE
          </span>
        </div>
      </div>

      {/* Info block */}
      <div className="relative -mt-8 px-5 pb-5">
        <div className="flex items-end gap-3.5">
          {/* Logo */}
          <div className="relative shrink-0">
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-blue-300 to-pink-300 opacity-50 blur-md" />
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl border-4 border-white bg-blue-50 shadow-lg sm:h-20 sm:w-20">
              <img
                src={PLAYTOGETHER_LOGO}
                alt="Play Together"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement.innerHTML =
                    '<div class="flex h-full w-full items-center justify-center text-3xl">🎮</div>';
                }}
              />
            </div>
          </div>

          {/* Title */}
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-blue-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">
                Casual Store
              </span>
            </div>
            <h1 className="mt-0.5 text-xl font-black tracking-tight text-slate-800 sm:text-2xl">
              Play Together
            </h1>
            <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
              Nạp thỏi vàng nhanh chóng
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <StatPill icon={Zap} label="Tức thì" color="blue" />
          <StatPill icon={ShieldCheck} label="Bảo mật" color="emerald" />
          <StatPill icon={Gift} label="Giảm 17%" color="amber" />
        </div>
      </div>
    </div>
  );
}

function StatPill({ icon: Icon, label, color }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div
      className={`flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-2 py-2.5 ${colorMap[color]}`}
    >
      <Icon size={14} className="shrink-0" />
      <span className="text-[11px] font-semibold">{label}</span>
    </div>
  );
}

function Stepper({ step }) {
  const steps = [
    { key: "package", label: "Chọn gói" },
    { key: "uid", label: "Nhập UID" },
    { key: "payment", label: "Thanh toán" },
  ];
  const order = ["package", "uid", "payment"];
  const currentIdx = order.indexOf(step);

  return (
    <div className="flex items-center">
      {steps.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <React.Fragment key={s.key}>
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black transition ${
                  done || active
                    ? "bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-md shadow-blue-200"
                    : "border border-slate-200 bg-white text-slate-400"
                }`}
              >
                {done ? <CheckCircle2 size={15} strokeWidth={2.5} /> : i + 1}
              </div>
              <span
                className={`hidden text-sm font-bold sm:inline ${
                  active
                    ? "text-slate-800"
                    : done
                    ? "text-blue-500"
                    : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-3 h-0.5 flex-1 rounded-full transition ${
                  i < currentIdx
                    ? "bg-gradient-to-r from-blue-400 to-blue-500"
                    : "bg-slate-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
function PackageStep({ selectedPackage, setSelectedPackage, onContinue, agreedTerms, setAgreedTerms }) {
  return ( 
    <div className="space-y-4">
      {/* Alert */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500">
          <AlertTriangle size={16} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-amber-900">
            Kiểm tra kỹ UID trước khi nạp
          </p>
          <p className="mt-1 text-xs leading-5 text-amber-800">
            Thỏi vàng sẽ nạp vào UID đã xác nhận. Sai UID không hoàn tiền.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-md shadow-blue-200">
            <Gift size={16} />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-800">
              Chọn gói thỏi vàng
            </h2>
            <p className="text-[11px] text-slate-500">
              {PACKAGES.length} gói khả dụng
            </p>
          </div>
        </div>
        <span className="rounded-full border border-pink-200 bg-pink-50 px-2.5 py-1 text-[10px] font-bold text-pink-500">
          SALE
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {PACKAGES.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            active={selectedPackage?.id === pkg.id}
            onSelect={setSelectedPackage}
          />
        ))}
      </div>

      {/* Continue */}
      <div className="pt-2">
        <TermsCheckbox
  checked={agreedTerms}
  onChange={setAgreedTerms}
  accentColor="blue"
/>

<button
  onClick={onContinue}
  disabled={!selectedPackage || !agreedTerms}
  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40"
>
  Tiếp tục
  <ChevronRight size={18} />
</button>
        {!selectedPackage && (
          <p className="mt-2 text-center text-xs text-slate-400">
            Chọn một gói để tiếp tục
          </p>
        )}
      </div>
    </div>
  );
}

function PackageCard({ pkg, active, onSelect }) {
  return (
    <button
      onClick={() => onSelect(pkg)}
      className={`group relative overflow-hidden rounded-2xl border-2 bg-white p-4 text-left transition-all duration-200 ${
        active
          ? "border-blue-400 bg-blue-50/50 shadow-lg shadow-blue-200/60 -translate-y-1"
          : "border-slate-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
      }`}
    >
      {/* Active check */}
      {active && (
        <div className="absolute right-3 top-3 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white shadow-md">
          <CheckCircle2 size={12} strokeWidth={3} />
        </div>
      )}

      {/* Discount badge */}
      {pkg.discount > 0 && (
        <div className="absolute left-3 top-3 z-10 rounded-md bg-gradient-to-r from-pink-400 to-rose-400 px-2 py-1 text-[10px] font-black text-white shadow-md">
          -{pkg.discount}%
        </div>
      )}

      {/* Image */}
      <div className="relative mx-auto mb-3 aspect-square w-full max-w-[110px] overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
        <img
          src={pkg.image}
          alt={`${pkg.gold} thỏi vàng`}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.style.opacity = "0.3";
          }}
        />
      </div>

      {/* Info */}
      <div className="relative text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {pkg.name}
        </p>
        <p className="mt-0.5 flex items-center justify-center gap-1 text-xl font-black text-slate-800">
          {pkg.gold}
          <span className="text-base">🪙</span>
        </p>

        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="text-base font-black text-blue-500">
            {formatPrice(pkg.price)}
          </p>
          {pkg.originalPrice > pkg.price && (
            <p className="mt-0.5 text-[11px] font-medium text-slate-300 line-through">
              {formatPrice(pkg.originalPrice)}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
function UidStep({
  uid,
  setUid,
  selectedPackage,
  creatingOrder,
  onBack,
  onContinue,
}) {
  const [showGuide, setShowGuide] = useState(false);

  const GUIDE_IMAGES = [
    {
      step: 1,
      url: `${SUPABASE_STORAGE}/playtogether-guide-1.png`,
      title: "Mở game và bấm vào điện thoại",
    },
    {
      step: 2,
      url: `${SUPABASE_STORAGE}/playtogether-guide-2.png`,
      title: "Bấm vào cài đặt",
    },
    {
      step: 3,
      url: `${SUPABASE_STORAGE}/playtogether-guide-3.png`,
      title: "Copy UID người chơi",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Selected package */}
      {selectedPackage && (
        <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-blue-100 bg-white">
            <img
              src={selectedPackage.image}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => (e.currentTarget.style.opacity = "0.3")}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
              Gói đã chọn
            </p>
            <p className="mt-0.5 text-base font-black text-slate-800">
              {selectedPackage.gold} thỏi vàng
            </p>
          </div>
          <p className="shrink-0 text-base font-black text-blue-500">
            {formatPrice(selectedPackage.price)}
          </p>
        </div>
      )}

      {/* Main card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 shadow-md shadow-blue-200">
            <User size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-800">
              Tài khoản Play Together
            </h2>
            <p className="text-xs text-slate-500">
              Nhập UID để nhận thỏi vàng
            </p>
          </div>
        </div>

        {/* Label */}
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-blue-500">
          UID Play Together
        </label>

        {/* Input */}
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <User size={16} />
          </span>
          <input
            value={uid}
            onChange={(e) => setUid(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") onContinue();
            }}
            placeholder="XXXX-XXXX-XXXX"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-11 pr-4 text-sm font-bold tracking-wider text-slate-800 outline-none transition placeholder:font-medium placeholder:tracking-normal placeholder:text-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>

        {/* Guide button */}
        <button
          onClick={() => setShowGuide(true)}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-500 transition hover:text-blue-600 hover:underline"
        >
          <Info size={13} />
          Hướng dẫn lấy UID Play Together
        </button>

        {/* Info */}
        <div className="mt-5 flex gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-blue-500" />
          <div>
            <p className="text-xs font-bold text-blue-800">
              Kiểm tra chính xác trước khi thanh toán
            </p>
            <p className="mt-1 text-[11px] leading-5 text-blue-700">
              UID Play Together có dạng <b>XXXX-XXXX-XXXX</b>. Sai UID sẽ
              không hoàn tiền.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={onBack}
            className="h-12 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Quay lại
          </button>
          <button
            onClick={onContinue}
            disabled={!uid.trim() || creatingOrder}
            className="group relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:shadow-blue-300/60 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            {creatingOrder ? (
              <>
                <Loader2 size={16} className="relative animate-spin" />
                <span className="relative">Đang tạo...</span>
              </>
            ) : (
              <>
                <span className="relative">Tiếp tục</span>
                <ChevronRight size={16} className="relative" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <GuideModal
          onClose={() => setShowGuide(false)}
          steps={GUIDE_IMAGES}
        />
      )}
    </div>
  );
}

function GuideModal({ onClose, steps }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-blue-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">
                  Hướng dẫn
                </span>
              </div>
              <h3 className="mt-1 text-base font-black text-slate-800">
                Lấy UID Play Together
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Làm theo 3 bước đơn giản
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {steps.map((item) => (
            <div key={item.step}>
              <div className="mb-2 flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 text-[11px] font-black text-white shadow-md shadow-blue-200">
                  {item.step}
                </span>
                <p className="text-sm font-bold text-slate-800">
                  {item.title}
                </p>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full object-contain"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-5">
          <button
            onClick={onClose}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:shadow-blue-300/60"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}
function PaymentStep({
  method,
  setMethod,
  selectedPackage,
  uid,
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
  if (!order) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <XCircle className="mx-auto mb-3 text-rose-500" size={42} />
        <h2 className="text-base font-black text-slate-800">
          Không tìm thấy đơn hàng
        </h2>
        <button
          onClick={onBack}
          className="mt-5 rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-200"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const transferContent = `NAP PLAYTOGETHER ${order.order_code} ${order.pt_uid} ${order.pt_gold}GOLD`;
  const coinBalance = Number(profile?.coins || 0);
  const requiredCoins = Number(order.amount || 0);
  const enoughCoins = coinBalance >= requiredCoins;

  const cardTypes = Object.keys(CARD_TYPES);
  const cardDiscounts = {
    Viettel: 24,
    Mobifone: 21,
    Vinaphone: 21,
    Garena: 17.5,
    Zing: 15.5,
  };
  const cardDenominations = CARD_TYPES;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 shadow-md shadow-blue-200">
          <CreditCard size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-base font-black text-slate-800">Thanh toán</h2>
          <p className="text-xs text-slate-500">Chọn phương thức phù hợp</p>
        </div>
      </div>

      {/* Order card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Amount header */}
        <div className="border-b border-slate-100 bg-gradient-to-br from-blue-50 to-pink-50 p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-blue-500">
            Tổng thanh toán
          </p>
          <p className="mt-1 text-3xl font-black text-slate-800">
            {formatPrice(order.amount)}
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600">
            Mã đơn:{" "}
            <span className="font-mono text-blue-500">{order.order_code}</span>
          </div>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          {/* Method tabs */}
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
                    ? "bg-white text-blue-500 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* ============ COIN ============ */}
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
                className="group relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:shadow-blue-300/60 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
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

          {/* ============ BANK ============ */}
          {method === "bank" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800">
                    Thông tin ngân hàng
                  </h3>
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600">
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
                  className="group relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:shadow-blue-300/60"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative">Tôi đã chuyển khoản</span>
                </button>
              )}
            </div>
          )}
          {/* ============ CARD ============ */}
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
                    <p className="mt-0.5 text-xs font-black text-blue-500">
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
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 text-[11px] font-black text-white shadow-sm">
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
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-blue-500">
                          Loại thẻ
                        </label>
                        <select
                          value={card.type}
                          onChange={(e) => {
                            updateCard(card.id, "type", e.target.value);
                            updateCard(card.id, "amount", "");
                          }}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        >
                          {cardTypes.map((type) => (
                            <option key={type} value={type}>
                              {type} — CK {cardDiscounts[type]}%
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-blue-500">
                          Mệnh giá
                        </label>
                        <select
                          value={card.amount}
                          onChange={(e) =>
                            updateCard(card.id, "amount", e.target.value)
                          }
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
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
                          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-blue-500">
                            Số serial
                          </label>
                          <input
                            value={card.serial}
                            onChange={(e) =>
                              updateCard(card.id, "serial", e.target.value)
                            }
                            placeholder="Nhập serial"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:font-normal placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-blue-500">
                            Mã thẻ
                          </label>
                          <input
                            value={card.code}
                            onChange={(e) =>
                              updateCard(card.id, "code", e.target.value)
                            }
                            placeholder="Nhập mã"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:font-normal placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={addCard}
                className="h-11 w-full rounded-xl border-2 border-dashed border-blue-200 text-sm font-bold text-blue-500 transition hover:border-blue-400 hover:bg-blue-50"
              >
                + Thêm thẻ
              </button>

              <button
                onClick={onCardPayment}
                disabled={cardChecking}
                className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:shadow-blue-300/60 disabled:opacity-50"
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

              {/* Result */}
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

          {/* Back */}
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
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-blue-500"
            title="Sao chép"
          >
            <Copy size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
