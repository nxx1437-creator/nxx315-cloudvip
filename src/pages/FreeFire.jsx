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
  Gem,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient.js";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";

// =====================================================
// SUPABASE STORAGE
// =====================================================

const SUPABASE_STORAGE =
  "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos";

// =====================================================
// PACKAGES
// =====================================================

const PACKAGES = [
  { id: "ff-25", amount: 5000, diamond: 25, image: `${SUPABASE_STORAGE}/kimcuong.png` },
  { id: "ff-51", amount: 10000, diamond: 51, image: `${SUPABASE_STORAGE}/kimcuong.png` },
  { id: "ff-113", amount: 20000, diamond: 113, image: `${SUPABASE_STORAGE}/kimcuong.png` },
  { id: "ff-283", amount: 50000, diamond: 283, image: `${SUPABASE_STORAGE}/kimcuong.png` },
  { id: "ff-566", amount: 100000, diamond: 566, image: `${SUPABASE_STORAGE}/kimcuong.png` },
  { id: "ff-1132", amount: 200000, diamond: 1132, image: `${SUPABASE_STORAGE}/kimcuong.png` },
  { id: "ff-2830", amount: 500000, diamond: 2830, image: `${SUPABASE_STORAGE}/kimcuong.png` },
  { id: "ff-5750", amount: 1000000, diamond: 5750, image: `${SUPABASE_STORAGE}/kimcuong.png` },
  { id: "ff-11500", amount: 2000000, diamond: 11500, image: `${SUPABASE_STORAGE}/kimcuong.png` },
];

// =====================================================
// BANK INFO
// =====================================================

const BANK = {
  name: "MB Bank",
  account: "0939339622",
  holder: "NGUYEN VAN CO",
};

// =====================================================
// CARD TYPES — CHIẾT KHẤU MỚI
// =====================================================

const CARD_TYPES = {
  Viettel: [
    { value: 10000, received: 7600 },     // -24%
    { value: 20000, received: 15800 },    // -21%
    { value: 30000, received: 23700 },    // -21%
    { value: 50000, received: 42500 },    // -16% (theo bảng mới: 50K là 16%)
    { value: 100000, received: 85000 },   // -16%
    { value: 200000, received: 168000 },  // -16%
    { value: 300000, received: 252000 },  // -16%
    { value: 500000, received: 405000 },  // -19%
    { value: 1000000, received: 810000 }, // -19%
  ],
  Mobifone: [
    { value: 10000, received: 7900 },     // -21%
    { value: 20000, received: 15800 },    // -21%
    { value: 30000, received: 23700 },    // -21%
    { value: 50000, received: 39500 },    // -21%
    { value: 100000, received: 80000 },   // -20%
    { value: 200000, received: 162000 },  // -19%
    { value: 300000, received: 243000 },  // -19%
    { value: 500000, received: 405000 },  // -19%
  ],
  Vinaphone: [
    { value: 10000, received: 7900 },     // -21%
    { value: 20000, received: 16600 },    // -17%
    { value: 30000, received: 24900 },    // -17%
    { value: 50000, received: 43000 },    // -14%
    { value: 100000, received: 87000 },   // -13%
    { value: 200000, received: 174000 },  // -13%
    { value: 300000, received: 261000 },  // -13%
    { value: 500000, received: 435000 },  // -13%
  ],
  Zing: [
    { value: 10000, received: 8450 },     // -15.5%
    { value: 20000, received: 16600 },    // -17%
    { value: 50000, received: 42250 },    // -15.5%
    { value: 100000, received: 84500 },   // -15.5%
    { value: 200000, received: 169000 },  // -15.5%
    { value: 500000, received: 422500 },  // -15.5%
    { value: 1000000, received: 845000 }, // -15.5%
  ],
  Garena: [
    { value: 10000, received: 8250 },     // -17.5%
    { value: 20000, received: 16500 },    // -17.5%
    { value: 50000, received: 41250 },    // -17.5%
    { value: 100000, received: 82500 },   // -17.5%
    { value: 200000, received: 165000 },  // -17.5%
    { value: 500000, received: 412500 },  // -17.5%
    { value: 1000000, received: 825000 }, // -17.5%
  ],
};

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN").format(Number(value || 0)) + "đ";

function copyText(text) {
  navigator.clipboard?.writeText(text);
     }
// =====================================================
// MAIN COMPONENT
// =====================================================

export default function FreeFire() {
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
      const { data: { user } } = await supabase.auth.getUser();
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
      alert("Vui lòng chọn gói Kim Cương.");
      return;
    }
    if (!uid.trim()) {
      alert("Vui lòng nhập UID Free Fire.");
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
        "create-freefire-order",
        {
          body: {
            uid: uid.trim(),
            package_id: selectedPackage.id,
            payment_method: method,
          },
        }
      );

      if (error) {
        throw new Error(error.message || "Không thể tạo đơn hàng.");
      }

      if (!data?.order) {
        throw new Error("Không nhận được đơn hàng.");
      }

      setOrder(data.order);
      setStep("payment");
    } catch (error) {
      console.error("Create Free Fire order:", error);
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
        "pay_freefire_order_with_coins",
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

          if (error) {
            throw new Error(error.message || "Không thể kiểm tra trạng thái thẻ.");
          }

          results.push({
            requestId,
            status: String(data?.status || "").toLowerCase(),
            netAmount: Number(data?.net_amount || 0),
            reason: data?.reason || data?.message || "Giao dịch không thành công.",
            order_id: data?.order_id || null,
            order_code: data?.order_code || null,
          });
        }

        if (results.some((item) => item.status === "failed")) {
          return { status: "failed", results };
        }

        if (results.length && results.every((item) => item.status === "success")) {
          return { status: "success", results };
        }

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
      if (!session?.access_token) {
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }

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

        if (error) {
          throw new Error(error.message || "Không thể gửi thẻ lên hệ thống.");
        }

        if (!data?.success || !data?.request_id) {
          throw new Error(data?.message || data?.error || "API không trả về mã giao dịch.");
        }

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

        // Chuyển sang trang nạp thành công sau 1.5 giây
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
      console.error("Free Fire card payment error:", error);
      setCardResult({
        status: "error",
        message: error?.message || "Không thể xử lý thẻ. Vui lòng thử lại sau.",
      });
    }
  };
    return (
    <div className="min-h-screen bg-[#F5F7FB] pb-24 text-slate-900">
      <TopHeader />

      <main className="mx-auto w-full max-w-4xl px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate("/store")}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              Nạp Free Fire
            </h1>
            <p className="text-xs text-slate-500">
              Chọn gói Kim Cương để nạp
            </p>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-2">
          <StepDot active={step === "package"} number={1} label="Chọn gói" />
          <div className={`h-px flex-1 ${step !== "package" ? "bg-sky-500" : "bg-slate-200"}`} />
          <StepDot active={step === "uid"} number={2} label="Nhập UID" />
          <div className={`h-px flex-1 ${step === "payment" ? "bg-sky-500" : "bg-slate-200"}`} />
          <StepDot active={step === "payment"} number={3} label="Thanh toán" />
        </div>

        {step === "package" && (
          <PackageStep
            selectedPackage={selectedPackage}
            setSelectedPackage={setSelectedPackage}
            onContinue={() => setStep("uid")}
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

function StepDot({ active, number, label }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition ${
          active
            ? "bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/30"
            : "bg-white text-slate-400 ring-1 ring-slate-200"
        }`}
      >
        {number}
      </div>
      <span
        className={`hidden text-xs font-semibold sm:block ${
          active ? "text-slate-900" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function PackageStep({ selectedPackage, setSelectedPackage, onContinue }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-black text-amber-900">
            Thông báo quan trọng
          </p>
          <p className="mt-1 text-xs leading-5 text-amber-800">
            Bạn vui lòng kiểm tra kỹ UID Free Fire trước khi nạp. NXX315 Studio
            Rewards chưa hỗ trợ hoàn tiền với trường hợp nhập sai UID.
          </p>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-sm">
            <Gem size={16} />
          </span>
          <h2 className="text-base font-black text-slate-900">
            Gói Kim Cương
          </h2>
        </div>

        <div className="space-y-3">
          {PACKAGES.map((pkg) => (
            <PackageRow
              key={pkg.id}
              pkg={pkg}
              active={selectedPackage?.id === pkg.id}
              onSelect={setSelectedPackage}
            />
          ))}
        </div>
      </section>

      <button
        onClick={onContinue}
        disabled={!selectedPackage}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40"
      >
        Tiếp tục
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function PackageRow({ pkg, active, onSelect }) {
  return (
    <button
      onClick={() => onSelect(pkg)}
      className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border-2 bg-white p-3.5 text-left transition ${
        active
          ? "border-sky-500 bg-sky-50/30 shadow-lg shadow-sky-500/10"
          : "border-slate-200 hover:border-sky-200 hover:bg-slate-50"
      }`}
    >
      <div className="relative shrink-0">
        <img
          src={pkg.image}
          alt={`${pkg.diamond} Kim Cương`}
          className="h-20 w-20 rounded-xl object-cover bg-slate-50"
          onError={(e) => {
            e.currentTarget.style.opacity = "0.25";
          }}
        />
        {active && (
          <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-white shadow-md">
            <CheckCircle2 size={14} strokeWidth={3} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-base font-black text-slate-900">
          {pkg.diamond.toLocaleString("vi-VN")} Kim Cương
        </p>

        <p className="mt-0.5 text-xs font-medium text-slate-500">
          Free Fire
        </p>

        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-base font-black text-sky-600">
            {formatPrice(pkg.amount)}
          </span>
        </div>
      </div>

      <div className="shrink-0 flex flex-col items-end gap-1.5">
        <span className="text-[10px] font-medium text-slate-400">
          Còn hàng
        </span>
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
      url: `${SUPABASE_STORAGE}/freefire-guide-1.png`,
      title: "Bước 1: Mở game Free Fire",
    },
    {
      step: 2,
      url: `${SUPABASE_STORAGE}/freefire-guide-2.png`,
      title: "Bước 2: Copy UID người chơi",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {selectedPackage && (
        <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={selectedPackage.image}
                alt={`${selectedPackage.diamond} Kim Cương`}
                className="h-12 w-12 rounded-lg object-cover bg-slate-50"
                onError={(e) => {
                  e.currentTarget.style.opacity = "0.25";
                }}
              />
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Gói đã chọn
                </p>
                <p className="text-sm font-black text-slate-900">
                  {selectedPackage.diamond.toLocaleString("vi-VN")} Kim Cương
                </p>
              </div>
            </div>
            <p className="text-base font-black text-sky-600">
              {formatPrice(selectedPackage.amount)}
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-sm">
            <User size={20} />
          </span>
          <div>
            <h2 className="text-base font-black text-slate-900">
              Tài khoản Free Fire
            </h2>
            <p className="text-xs text-slate-500">
              Nhập UID người chơi để nhận Kim Cương
            </p>
          </div>
        </div>

        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
          UID Free Fire
        </label>

        <div className="relative">
          <User
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onContinue();
            }}
            inputMode="numeric"
            placeholder="Ví dụ: 123456789"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        </div>

        <button
          onClick={() => setShowGuide(true)}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 transition hover:text-sky-700 hover:underline"
        >
          <Info size={13} />
          Hướng dẫn lấy UID Free Fire
        </button>

        <div className="mt-5 flex gap-3 rounded-xl border border-sky-100 bg-sky-50/50 p-3.5">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-sky-600" />
          <div>
            <p className="text-xs font-bold text-sky-900">
              Kiểm tra chính xác trước khi thanh toán
            </p>
            <p className="mt-1 text-[11px] leading-5 text-sky-700">
              Hãy kiểm tra kỹ UID Free Fire. Kim Cương sẽ được nạp theo UID đã
              xác nhận — sai UID không hoàn tiền.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Quay lại
          </button>

          <button
            onClick={onContinue}
            disabled={!uid.trim() || creatingOrder}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 py-3.5 text-sm font-bold text-white shadow-md shadow-sky-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {creatingOrder ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang tạo đơn...
              </>
            ) : (
              <>
                Thanh toán
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="relative flex max-h-[90vh] w-full max-w-md flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Hướng dẫn lấy UID Free Fire
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Làm theo 2 bước dưới đây
                </p>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {GUIDE_IMAGES.map((item) => (
                <div key={item.step}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-[10px] font-black text-white">
                      {item.step}
                    </span>
                    <p className="text-sm font-bold text-slate-900">
                      {item.title}
                    </p>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 p-5">
              <button
                onClick={() => setShowGuide(false)}
                className="w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-sky-500/30"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
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
  // Khai báo các biến cần thiết cho phần Card
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
          className="mt-5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 px-5 py-3 text-sm font-bold text-white"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const transferContent = `NAP FREEFIRE ${order.order_code} ${order.ff_uid} ${order.ff_diamond}KC`;
  const coinBalance = Number(profile?.coins || 0);
  const requiredCoins = Number(order.amount || 0);
  const enoughCoins = coinBalance >= requiredCoins;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-sm">
          <CreditCard size={20} />
        </span>
        <div>
          <h2 className="text-base font-black text-slate-900">Thanh toán</h2>
          <p className="text-xs text-slate-500">Chọn phương thức thanh toán</p>
        </div>
      </div>

      {/* Order summary */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-sky-400 to-blue-600 p-5 text-white">
          <p className="text-xs font-medium text-sky-100">Tổng thanh toán</p>
          <p className="mt-1 text-2xl font-black">
            {formatPrice(order.amount)}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
            Mã đơn: {order.order_code}
          </div>
        </div>

        <div className="space-y-4 p-5">
          {/* Method tabs */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setMethod("coin")}
              className={`rounded-xl border px-3 py-3 text-xs font-black transition ${
                method === "coin"
                  ? "border-sky-500 bg-sky-50 text-sky-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              🪙 Coin
            </button>
            <button
              onClick={() => setMethod("bank")}
              className={`rounded-xl border px-3 py-3 text-xs font-black transition ${
                method === "bank"
                  ? "border-sky-500 bg-sky-50 text-sky-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              🏦 Chuyển khoản
            </button>
            <button
              onClick={() => setMethod("card")}
              className={`rounded-xl border px-3 py-3 text-xs font-black transition ${
                method === "card"
                  ? "border-sky-500 bg-sky-50 text-sky-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              🎫 Thẻ cào
            </button>
          </div>

          {/* ============ COIN ============ */}
          {method === "coin" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-sky-800">
                    Số dư Coin
                  </span>
                  <span className="text-lg font-black text-sky-700">
                    {loadingProfile
                      ? "..."
                      : `${coinBalance.toLocaleString("vi-VN")} Coin`}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Cần thanh toán
                  </span>
                  <span className="text-sm font-black text-slate-900">
                    {requiredCoins.toLocaleString("vi-VN")} Coin
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Sau thanh toán
                  </span>
                  <span
                    className={`text-sm font-black ${
                      enoughCoins ? "text-emerald-600" : "text-rose-500"
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
                className="w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 py-4 text-sm font-black text-white shadow-md shadow-sky-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {enoughCoins
                  ? `Thanh toán ${requiredCoins.toLocaleString(
                      "vi-VN"
                    )} Coin`
                  : "Không đủ Coin"}
              </button>
            </div>
          )}

          {/* ============ BANK ============ */}
          {method === "bank" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900">
                    Thông tin ngân hàng
                  </h3>
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-[10px] font-bold text-sky-700">
                    MB Bank
                  </span>
                </div>

                <div className="space-y-3">
                  <BankRow label="Ngân hàng" value={BANK.name} />
                  <BankRow
                    label="Số tài khoản"
                    value={BANK.account}
                    copy
                  />
                  <BankRow label="Chủ tài khoản" value={BANK.holder} />
                  <BankRow
                    label="Số tiền"
                    value={formatPrice(order.amount)}
                    copyValue={String(order.amount)}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-black text-amber-900">
                  Nội dung chuyển khoản
                </p>
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-white p-2.5">
                  <code className="min-w-0 flex-1 break-all text-xs font-bold text-slate-800">
                    {transferContent}
                  </code>
                  <button
                    onClick={() => copyText(transferContent)}
                    className="shrink-0 rounded-lg bg-amber-100 p-2 text-amber-700"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                <p className="mt-2 text-[11px] leading-5 text-amber-800">
                  Vui lòng ghi chính xác nội dung chuyển khoản.
                </p>
              </div>

              {order.status === "paid" ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      size={22}
                      className="text-emerald-600"
                    />
                    <div>
                      <p className="text-sm font-black text-emerald-900">
                        Đã gửi xác nhận
                      </p>
                      <p className="mt-0.5 text-xs text-emerald-700">
                        Đơn đang chờ admin kiểm tra.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={onConfirmTransfer}
                  className="w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 py-4 text-sm font-black text-white shadow-md shadow-sky-500/30 transition hover:brightness-110"
                >
                  ✓ Tôi đã chuyển khoản
                </button>
              )}
            </div>
          )}

          {/* ============ CARD ============ */}
          {method === "card" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Thẻ cào</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Chọn loại thẻ và nhập thông tin thẻ
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {cardTypes.map((type) => (
                  <div key={type} className="rounded-lg bg-slate-50 p-2.5 text-center">
                    <p className="text-[10px] font-bold text-slate-600">{type}</p>
                    <p className="mt-0.5 text-xs font-black text-sky-600">
                      {cardDiscounts[type]}%
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-rose-600" />
                  <p className="text-xs font-black text-rose-700">
                    Quý khách điền sai Mệnh Giá sẽ bị mất thẻ!
                  </p>
                </div>
              </div>

              {cards.map((card, index) => (
                <div key={card.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-black text-slate-900">Thẻ #{index + 1}</p>
                    {cards.length > 1 && (
                      <button
                        onClick={() => removeCard(card.id)}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-50"
                      >
                        Xóa
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700">Loại thẻ *</label>
                      <select
                        value={card.type}
                        onChange={(e) => {
                          updateCard(card.id, "type", e.target.value);
                          updateCard(card.id, "amount", "");
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-sky-500"
                      >
                        {cardTypes.map((t) => (
                          <option key={t} value={t}>
                            {t} — Chiết khấu {cardDiscounts[t]}%
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700">Mệnh giá *</label>
                      <select
                        value={card.amount}
                        onChange={(e) => updateCard(card.id, "amount", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-sky-500"
                      >
                        <option value="">Chọn mệnh giá</option>
                        {(cardDenominations[card.type] || []).map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.value.toLocaleString("vi-VN")}đ → {item.received.toLocaleString("vi-VN")}đ
                          </option>
                        ))}
                      </select>
                      {card.amount && (() => {
                        const sel = (cardDenominations[card.type] || []).find(
                          (item) => Number(item.value) === Number(card.amount)
                        );
                        if (!sel) return null;
                        return (
                          <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-emerald-700">Coin nhận được</span>
                              <span className="text-xs font-black text-emerald-700">
                                +{sel.received.toLocaleString("vi-VN")} Coin
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700">Số Seri Thẻ *</label>
                      <input
                        value={card.serial}
                        onChange={(e) => updateCard(card.id, "serial", e.target.value)}
                        placeholder="Nhập số seri"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700">Mã Thẻ *</label>
                      <input
                        value={card.code}
                        onChange={(e) => updateCard(card.id, "code", e.target.value)}
                        placeholder="Nhập mã thẻ"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addCard}
                className="w-full rounded-xl border-2 border-dashed border-sky-200 bg-sky-50 py-3 text-sm font-black text-sky-600 transition hover:bg-sky-100"
              >
                + Thêm thẻ
              </button>

              <button
                onClick={onCardPayment}
                disabled={cardChecking}
                className="w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 py-4 text-sm font-black text-white shadow-md shadow-sky-500/30 transition hover:brightness-110 disabled:opacity-50"
              >
                {cardChecking ? "Đang xử lý..." : "Nạp tiền"}
              </button>

              {cardResult && (
                <div ref={resultRef} className="scroll-mt-24 space-y-3">
                  {cardResult.status === "success" && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                          <CheckCircle2 size={22} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-emerald-900">Nạp thẻ thành công!</p>
                          <p className="mt-0.5 text-xs text-emerald-700">APIĐổiThẻ đã xác nhận và Coin đã được cộng.</p>
                          <div className="mt-3 rounded-lg bg-white p-3 ring-1 ring-emerald-100">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">Coin nhận được</span>
                              <span className="text-lg font-black text-emerald-600">
                                +{Number(cardResult.totalNetAmount || 0).toLocaleString("vi-VN")} Coin
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {cardResult.status === "failed" && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white">
                          <XCircle size={22} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-rose-900">Thanh toán không thành công</p>
                          <p className="mt-1 text-xs font-semibold text-rose-700">
                            {cardResult.reason || "Thẻ không hợp lệ hoặc giao dịch bị từ chối."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {cardResult.status === "processing" && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-start gap-3">
                        <Loader2 className="mt-0.5 shrink-0 animate-spin text-amber-600" size={20} />
                        <div>
                          <p className="text-sm font-black text-amber-900">Thẻ đang được xử lý</p>
                          <p className="mt-1 text-xs text-amber-700">
                            APIĐổiThẻ chưa trả kết quả cuối. Coin chỉ được cộng khi giao dịch thành công.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                       {cardResult.status === "error" && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                      <div className="flex items-start gap-3">
                        <XCircle className="mt-0.5 shrink-0 text-rose-600" size={20} />
                        <div>
                          <p className="text-sm font-black text-rose-900">Không thể xử lý thẻ</p>
                          <p className="mt-1 text-xs text-rose-700">{cardResult.message}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <button
            onClick={onBack}
            disabled={cardChecking}
            className="w-full rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
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
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <span className="break-all text-right text-sm font-black text-slate-900">{value}</span>
        {(copy || copyValue) && (
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-sky-600"
            title="Sao chép"
          >
            <Copy size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
