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

// =====================================================
// CARD TYPES
// =====================================================

const CARD_TYPES = {
  Viettel: [
    { value: 10000, received: 8100 },
    { value: 20000, received: 16200 },
    { value: 30000, received: 24300 },
    { value: 50000, received: 40500 },
    { value: 100000, received: 81000 },
    { value: 200000, received: 162000 },
    { value: 300000, received: 243000 },
    { value: 500000, received: 405000 },
  ],
  Mobifone: [
    { value: 10000, received: 8050 },
    { value: 20000, received: 16100 },
    { value: 30000, received: 24150 },
    { value: 50000, received: 40250 },
    { value: 100000, received: 80500 },
    { value: 200000, received: 161000 },
    { value: 300000, received: 241500 },
    { value: 500000, received: 402500 },
  ],
  Vinaphone: [
    { value: 10000, received: 8000 },
    { value: 20000, received: 16000 },
    { value: 30000, received: 24000 },
    { value: 50000, received: 40000 },
    { value: 100000, received: 80000 },
    { value: 200000, received: 160000 },
    { value: 300000, received: 240000 },
    { value: 500000, received: 400000 },
  ],
  Garena: [
    { value: 20000, received: 17100 },
    { value: 50000, received: 42750 },
    { value: 100000, received: 85500 },
    { value: 200000, received: 171000 },
    { value: 500000, received: 427500 },
  ],
  Zing: [
    { value: 10000, received: 8700 },
    { value: 20000, received: 17400 },
    { value: 30000, received: 26100 },
    { value: 50000, received: 43500 },
    { value: 100000, received: 87000 },
    { value: 200000, received: 174000 },
    { value: 300000, received: 261000 },
    { value: 500000, received: 435000 },
  ],
};

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN").format(Number(value || 0)) + "đ";

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function PlayTogether() {
  const navigate = useNavigate();

  const [step, setStep] = useState("package");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [uid, setUid] = useState("");

  const [method, setMethod] = useState("direct");
  const [cards, setCards] = useState([
    {
      id: Date.now(),
      type: "Viettel",
      amount: "",
      serial: "",
      code: "",
    },
  ]);

  const [cardResult, setCardResult] = useState(null);
  const [cardChecking, setCardChecking] = useState(false);
  const resultRef = useRef(null);

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

  const continueToPayment = () => {
    if (!selectedPackage) {
      alert("Vui lòng chọn gói thỏi vàng.");
      return;
    }
    if (!uid.trim()) {
      alert("Vui lòng nhập UID Play Together.");
      return;
    }
    setStep("payment");
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
      prev.map((card) =>
        card.id === id ? { ...card, [field]: value } : card
      )
    );
  };

  const checkCardTransactions = async (requestIds) => {
    const ids = requestIds.filter(Boolean);

    if (!ids.length) {
      throw new Error("API không trả về mã giao dịch.");
    }

    setCardChecking(true);

    try {
      for (let attempt = 0; attempt < 40; attempt++) {
        const results = [];

        for (const requestId of ids) {
          const { data, error } = await supabase.functions.invoke(
            "apidoithe-webhook",
            {
              body: { transaction_id: requestId },
            }
          );

          if (error) {
            throw new Error(
              error.message || "Không thể kiểm tra trạng thái thẻ."
            );
          }

          results.push({
            requestId,
            status: String(data?.status || "").toLowerCase(),
            netAmount: Number(data?.net_amount || 0),
            reason:
              data?.reason ||
              data?.message ||
              "Giao dịch không thành công.",
          });
        }

        if (results.some((item) => item.status === "failed")) {
          return { status: "failed", results };
        }

        if (
          results.length &&
          results.every((item) => item.status === "success")
        ) {
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
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }

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

        if (error) {
          throw new Error(
            error.message || "Không thể gửi thẻ lên hệ thống."
          );
        }

        if (!data?.success || !data?.request_id) {
          throw new Error(
            data?.message ||
              data?.error ||
              "API không trả về mã giao dịch."
          );
        }

        requestIds.push(String(data.request_id));
      }

      const result = await checkCardTransactions(requestIds);

      if (result.status === "success") {
        const totalNetAmount = result.results.reduce(
          (sum, item) => sum + Number(item.netAmount || 0),
          0
        );

        setCardResult({
          status: "success",
          totalNetAmount,
          results: result.results,
        });

        setCards([
          {
            id: Date.now(),
            type: "Viettel",
            amount: "",
            serial: "",
            code: "",
          },
        ]);

        return;
      }

      if (result.status === "failed") {
        const failed = result.results.find(
          (item) => item.status === "failed"
        );

        setCardResult({
          status: "failed",
          reason:
            failed?.reason ||
            "Thẻ không hợp lệ hoặc giao dịch bị từ chối.",
          results: result.results,
        });

        return;
      }

      setCardResult({
        status: "processing",
        results: result.results,
      });
    } catch (error) {
      console.error("Play Together card payment error:", error);

      setCardResult({
        status: "error",
        message:
          error?.message ||
          "Không thể xử lý thẻ. Vui lòng thử lại sau.",
      });
    }
  };

  const handleDirectPayment = () => {
    alert(
      "Phần nạp trực tiếp đã có giao diện. Cần API/backend Play Together để xử lý UID và giao vàng."
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] pb-24 text-slate-900">
      <TopHeader />

      <main className="mx-auto w-full max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate("/store")}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              Nạp Play Together
            </h1>
            <p className="text-xs text-slate-500">
              Chọn gói thỏi vàng để nạp
            </p>
          </div>
        </div>

        {/* Step indicator */}
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
            cards={cards}
            updateCard={updateCard}
            addCard={addCard}
            removeCard={removeCard}
            onBack={() => setStep("uid")}
            onDirectPayment={handleDirectPayment}
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
      {/* Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-black text-amber-900">
            Thông báo quan trọng
          </p>
          <p className="mt-1 text-xs leading-5 text-amber-800">
            Bạn vui lòng kiểm tra kỹ UID Play Together trước khi nạp.
            NXX315 Studio Rewards chưa hỗ trợ hoàn tiền với trường hợp nhập sai UID.
          </p>
        </div>
      </div>

      {/* Packages */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-sm">
            <Wallet size={16} />
          </span>
          <h2 className="text-base font-black text-slate-900">Gói thỏi vàng</h2>
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

      {/* Continue */}
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
          alt={`${pkg.gold} thỏi vàng`}
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
          {pkg.gold} thỏi vàng
        </p>

        <p className="mt-0.5 text-xs font-medium text-slate-500">
          {pkg.name}
        </p>

        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-base font-black text-sky-600">
            {formatPrice(pkg.price)}
          </span>
          {pkg.originalPrice && (
            <span className="text-xs text-slate-400 line-through">
              {formatPrice(pkg.originalPrice)}
            </span>
          )}
        </div>
      </div>

      {pkg.discount && (
        <div className="shrink-0 flex flex-col items-end gap-1.5">
          <span className="rounded-md bg-sky-500 px-2 py-1 text-[10px] font-black text-white">
            -{pkg.discount}%
          </span>
          <span className="text-[10px] font-medium text-slate-400">
            Còn hàng
          </span>
        </div>
      )}
    </button>
  );
    }
      function UidStep({
  uid,
  setUid,
  selectedPackage,
  onBack,
  onContinue,
}) {
  const [showGuide, setShowGuide] = useState(false);

  const GUIDE_IMAGES = [
    {
      step: 1,
      url: `${SUPABASE_STORAGE}/playtogether-guide-1.png`,
      title: "Bước 1: Mở game Play Together và bấm vô điện thoại",
    },
    {
      step: 2,
      url: `${SUPABASE_STORAGE}/playtogether-guide-2.png`,
      title: "Bước 2: bấm vào cài đặt ",
    },
    {
      step: 3,
      url: `${SUPABASE_STORAGE}/playtogether-guide-3.png`,
      title: "Bước 3: Copy UID người chơi",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Order info */}
      {selectedPackage && (
        <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={selectedPackage.image}
                alt={`${selectedPackage.gold} thỏi vàng`}
                className="h-12 w-12 rounded-lg object-cover bg-slate-50"
                onError={(e) => {
                  e.currentTarget.style.opacity = "0.25";
                }}
              />
              <div>
                <p className="text-xs font-medium text-slate-500">Gói đã chọn</p>
                <p className="text-sm font-black text-slate-900">
                  {selectedPackage.gold} thỏi vàng
                </p>
              </div>
            </div>
            <p className="text-base font-black text-sky-600">
              {formatPrice(selectedPackage.price)}
            </p>
          </div>
        </div>
      )}

      {/* Main card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-sm">
            <User size={20} />
          </span>
          <div>
            <h2 className="text-base font-black text-slate-900">
              Tài khoản Play Together
            </h2>
            <p className="text-xs text-slate-500">
              Nhập UID người chơi để nhận thỏi vàng
            </p>
          </div>
        </div>

        {/* Input */}
        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
          UID Play Together
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

        {/* Nút hướng dẫn */}
        <button
          onClick={() => setShowGuide(true)}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 transition hover:text-sky-700 hover:underline"
        >
          <Info size={13} />
          Hướng dẫn lấy UID Play Together
        </button>

        {/* Info box */}
        <div className="mt-5 flex gap-3 rounded-xl border border-sky-100 bg-sky-50/50 p-3.5">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-sky-600" />
          <div>
            <p className="text-xs font-bold text-sky-900">
              Kiểm tra chính xác trước khi thanh toán
            </p>
            <p className="mt-1 text-[11px] leading-5 text-sky-700">
              Hãy kiểm tra kỹ UID Play Together. Thỏi vàng sẽ được nạp theo UID đã xác nhận — sai UID không hoàn tiền.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Quay lại
          </button>

          <button
            onClick={onContinue}
            disabled={!uid.trim()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 py-3.5 text-sm font-bold text-white shadow-md shadow-sky-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Thanh toán
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Modal hướng dẫn — 3 ảnh dọc */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="relative flex max-h-[90vh] w-full max-w-md flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Hướng dẫn lấy UID Play Together
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Làm theo 3 bước dưới đây
                </p>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body — scroll ảnh dọc */}
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

            {/* Footer */}
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
  cards,
  updateCard,
  addCard,
  removeCard,
  onBack,
  onDirectPayment,
  onCardPayment,
  cardResult,
  cardChecking,
  resultRef,
}) {
  const expectedCoins = Math.floor(selectedPackage.price);

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
            {formatPrice(selectedPackage.price)}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
            UID: {uid}
          </div>
        </div>

        <div className="space-y-4 p-5">
          {/* Package info */}
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <img
                src={selectedPackage.image}
                alt={selectedPackage.name}
                className="h-12 w-12 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.style.opacity = "0.25";
                }}
              />
              <div>
                <p className="text-xs text-slate-400">Gói đã chọn</p>
                <p className="text-sm font-black text-slate-900">
                  {selectedPackage.gold} thỏi vàng
                </p>
                <p className="text-xs text-slate-500">{selectedPackage.name}</p>
              </div>
            </div>
          </div>

          {/* Method tabs */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMethod("direct")}
              className={`rounded-xl border px-3 py-3 text-xs font-black transition ${
                method === "direct"
                  ? "border-sky-500 bg-sky-50 text-sky-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              🎮 Nạp trực tiếp
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

          {/* ==================== DIRECT ==================== */}
          {method === "direct" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0 text-amber-600"
                  />
                  <div>
                    <p className="text-sm font-black text-amber-900">
                      Nạp trực tiếp vào UID
                    </p>
                    <p className="mt-1 text-xs leading-5 text-amber-700">
                      Admin sẽ nạp thỏi vàng trực tiếp vào UID{" "}
                      <strong>{uid}</strong> trong vòng 24 giờ. Vui lòng kiểm
                      tra kỹ UID trước khi xác nhận.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">UID nhận vàng</span>
                  <span className="font-mono text-sm font-black text-slate-900">
                    {uid}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Gói nạp</span>
                  <span className="text-sm font-black text-slate-900">
                    {selectedPackage.gold} thỏi vàng
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Số tiền</span>
                  <span className="text-sm font-black text-sky-600">
                    {formatPrice(selectedPackage.price)}
                  </span>
                </div>
              </div>

              <button
                onClick={onDirectPayment}
                className="w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 py-4 text-sm font-black text-white shadow-md shadow-sky-500/30 transition hover:brightness-110"
              >
                Xác nhận nạp trực tiếp
              </button>
            </div>
          )}

          {/* ==================== CARD ==================== */}
          {method === "card" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Nạp bằng thẻ cào
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Coin nạp từ thẻ cào sẽ được cộng vào ví CloudVIP.
                </p>
              </div>

              {/* Card list */}
              {cards.map((card, index) => {
                const options = CARD_TYPES[card.type] || [];

                return (
                  <div
                    key={card.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-black text-slate-900">
                        Thẻ #{index + 1}
                      </p>

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
                        <label className="mb-1.5 block text-xs font-bold text-slate-700">
                          Loại thẻ *
                        </label>
                        <select
                          value={card.type}
                          onChange={(e) => {
                            updateCard(card.id, "type", e.target.value);
                            updateCard(card.id, "amount", "");
                          }}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-sky-500"
                        >
                          {Object.keys(CARD_TYPES).map((type) => (
                            <option key={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-bold text-slate-700">
                          Mệnh giá *
                        </label>
                        <select
                          value={card.amount}
                          onChange={(e) =>
                            updateCard(card.id, "amount", e.target.value)
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-sky-500"
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
                              <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-emerald-700">
                                    Coin nhận được
                                  </span>
                                  <span className="text-xs font-black text-emerald-700">
                                    +{formatPrice(sel.received)}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-bold text-slate-700">
                          Số Serial *
                        </label>
                        <input
                          value={card.serial}
                          onChange={(e) =>
                            updateCard(card.id, "serial", e.target.value)
                          }
                          placeholder="Nhập số serial"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-bold text-slate-700">
                          Mã thẻ *
                        </label>
                        <input
                          value={card.code}
                          onChange={(e) =>
                            updateCard(card.id, "code", e.target.value)
                          }
                          placeholder="Nhập mã thẻ"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={addCard}
                className="w-full rounded-xl border-2 border-dashed border-sky-200 bg-sky-50 py-3 text-sm font-black text-sky-600 transition hover:bg-sky-100"
              >
                + Thêm thẻ
              </button>

              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5">
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    size={16}
                    className="mt-0.5 shrink-0 text-rose-600"
                  />
                  <p className="text-xs font-black text-rose-700">
                    Quý khách điền sai mệnh giá sẽ bị mất thẻ!
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-sm font-black text-blue-900">
                  Coin dự kiến cần: {formatPrice(expectedCoins)}
                </p>
                <p className="mt-1 text-xs leading-5 text-blue-700">
                  Số Coin thực tế được cộng sẽ theo net_amount từ APIĐổiThẻ.
                </p>
              </div>

              <button
                onClick={onCardPayment}
                disabled={cardChecking}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 py-4 text-sm font-black text-white shadow-md shadow-sky-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cardChecking ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Đang kiểm tra thẻ...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    Nạp tiền
                  </>
                )}
              </button>

              {/* Result */}
              <div ref={resultRef} className="scroll-mt-24 space-y-3">
                {cardResult?.status === "success" && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                        <CheckCircle2 size={22} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-emerald-900">
                          Nạp thẻ thành công!
                        </p>
                        <p className="mt-0.5 text-xs text-emerald-700">
                          Đã cộng{" "}
                          <b>{formatPrice(cardResult.totalNetAmount)}</b> Coin
                          vào ví CloudVIP.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {cardResult?.status === "failed" && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white">
                        <XCircle size={22} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-rose-900">
                          Thanh toán không thành công
                        </p>
                        <p className="mt-1 text-xs font-semibold text-rose-700">
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
                        className="mt-0.5 shrink-0 animate-spin text-amber-600"
                      />
                      <div>
                        <p className="text-sm font-black text-amber-900">
                          Giao dịch đang xử lý
                        </p>
                        <p className="mt-1 text-xs text-amber-700">
                          API chưa xác nhận thành công. Coin chưa được cộng
                          cho đến khi giao dịch thành công.
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
                        className="mt-0.5 shrink-0 text-rose-600"
                      />
                      <div>
                        <p className="text-sm font-black text-rose-900">
                          Không thể xử lý
                        </p>
                        <p className="mt-1 text-xs text-rose-700">
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
            className="w-full rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}
