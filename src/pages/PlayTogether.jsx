import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  HelpCircle,
  Loader2,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient.js";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";

const SUPABASE_STORAGE =
  "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos";

const PACKAGES = [
  {
    id: "pt-9",
    name: "Một ít thỏi vàng",
    gold: 9,
    price: 25500,
    image: `${SUPABASE_STORAGE}/playtogether-9.png`,
  },
  {
    id: "pt-18",
    name: "Thỏi vàng",
    gold: 18,
    price: 50000,
    image: `${SUPABASE_STORAGE}/playtogether-18.png`,
  },
  {
    id: "pt-45",
    name: "Vài thỏi vàng",
    gold: 45,
    price: 130000,
    image: `${SUPABASE_STORAGE}/playtogether-45.png`,
  },
];

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

export default function PlayTogether() {
  const navigate = useNavigate();

  const [step, setStep] = useState("package");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [uid, setUid] = useState("");
  const [confirmedUid, setConfirmedUid] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

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
              game: "playtogether",
              uid: uid.trim(),
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
    return (
    <div className="min-h-screen bg-[#F5F7FB] pb-24">
      <TopHeader />

      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <button
          onClick={() => navigate("/store")}
          className="mb-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
          Quay lại cửa hàng
        </button>

        {/* Header */}
        <div className="mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 p-6 text-white shadow-lg shadow-blue-500/20 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-100">
                NXX315 Studio Rewards
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Nạp Play Together
              </h1>
              <p className="mt-2 max-w-lg text-sm text-blue-50">
                Nạp thỏi vàng vào tài khoản Play Together VNG bằng thẻ cào.
              </p>
            </div>

            <button
              onClick={() => setShowGuide(true)}
              className="flex shrink-0 items-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5 text-sm font-bold backdrop-blur transition hover:bg-white/25"
            >
              <HelpCircle size={17} />
              <span className="hidden sm:inline">Cách lấy ID</span>
            </button>
          </div>
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
            confirmedUid={confirmedUid}
            setConfirmedUid={setConfirmedUid}
            selectedPackage={selectedPackage}
            onBack={() => setStep("package")}
            onContinue={() => setStep("payment")}
            onShowGuide={() => setShowGuide(true)}
          />
        )}

        {step === "payment" && (
          <PaymentStep
            selectedPackage={selectedPackage}
            uid={uid}
            cards={cards}
            updateCard={updateCard}
            addCard={addCard}
            removeCard={removeCard}
            onBack={() => setStep("uid")}
            onCardPayment={handleCardPayment}
            cardResult={cardResult}
            cardChecking={cardChecking}
            resultRef={resultRef}
          />
        )}
      </main>

      <BottomNav />

      {showGuide && (
        <GuideModal onClose={() => setShowGuide(false)} />
      )}
    </div>
  );
}

/* ---------------- STEP 1: CHỌN GÓI ---------------- */
function PackageStep({ selectedPackage, setSelectedPackage, onContinue }) {
  return (
    <div className="space-y-6">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900">
            Chọn gói thỏi vàng
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            Bước 1/3
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PACKAGES.map((pkg) => {
            const active = selectedPackage?.id === pkg.id;
            return (
              <button
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg)}
                className={`relative overflow-hidden rounded-3xl bg-white p-4 text-left shadow-sm ring-1 transition ${
                  active
                    ? "ring-2 ring-blue-600 shadow-lg shadow-blue-600/10"
                    : "ring-slate-200 hover:-translate-y-0.5 hover:ring-blue-300"
                }`}
              >
                {active && (
                  <div className="absolute right-3 top-3 rounded-full bg-blue-600 p-1 text-white">
                    <CheckCircle2 size={17} />
                  </div>
                )}

                <div className="flex flex-col items-center gap-3 text-center">
                  <img
                    src={pkg.image}
                    alt={pkg.name}
                    className="h-24 w-24 rounded-2xl bg-slate-50 object-contain p-1"
                    onError={(e) => {
                      e.currentTarget.style.opacity = "0.25";
                    }}
                  />

                  <div>
                    <p className="text-lg font-black text-slate-900">
                      {pkg.gold} thỏi vàng
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500">
                      {pkg.name}
                    </p>
                    <p className="mt-2 text-base font-black text-blue-600">
                      {formatPrice(pkg.price)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <button
        onClick={onContinue}
        disabled={!selectedPackage}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Tiếp tục
        <ChevronRight size={19} />
      </button>
    </div>
  );
}

/* ---------------- STEP 2: NHẬP UID ---------------- */
function UidStep({
  uid,
  setUid,
  confirmedUid,
  setConfirmedUid,
  selectedPackage,
  onBack,
  onContinue,
  onShowGuide,
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900">
          Nhập ID Play Together
        </h2>
        <span className="text-xs font-semibold text-slate-400">
          Bước 2/3
        </span>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-bold text-slate-700">
              ID tài khoản Play Together
            </label>
            <input
              value={uid}
              onChange={(e) => {
                setUid(e.target.value);
                setConfirmedUid(false);
              }}
              placeholder="VD: 123456789"
              inputMode="numeric"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <button
            onClick={onShowGuide}
            className="mt-7 flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
          >
            <HelpCircle size={15} />
            Xem cách lấy
          </button>
        </div>

        {selectedPackage && (
          <div className="mb-5 flex items-center justify-between rounded-2xl bg-slate-50 p-4">
            <div>
              <p className="text-xs text-slate-400">Gói đã chọn</p>
              <p className="font-black text-slate-900">
                {selectedPackage.gold} thỏi vàng
              </p>
            </div>
            <p className="font-black text-blue-600">
              {formatPrice(selectedPackage.price)}
            </p>
          </div>
        )}

        <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-2xl bg-amber-50 p-4">
          <input
            type="checkbox"
            checked={confirmedUid}
            onChange={(e) => setConfirmedUid(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-blue-600"
          />
          <span className="text-xs leading-5 text-amber-800">
            Tôi đã kiểm tra kỹ ID trên. Nạp sai ID sẽ{" "}
            <b>không được hoàn tiền</b>.
          </span>
        </label>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Quay lại
          </button>

          <button
            onClick={onContinue}
            disabled={!uid.trim() || !confirmedUid}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Thanh toán
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
            }
          /* ---------------- STEP 3: THANH TOÁN ---------------- */
function PaymentStep({
  selectedPackage,
  uid,
  cards,
  updateCard,
  addCard,
  removeCard,
  onBack,
  onCardPayment,
  cardResult,
  cardChecking,
  resultRef,
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900">
          Thanh toán bằng thẻ cào
        </h2>
        <span className="text-xs font-semibold text-slate-400">
          Bước 3/3
        </span>
      </div>

      {/* Tóm tắt đơn hàng */}
      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-slate-400">Gói Play Together</p>
            <h3 className="text-lg font-black text-slate-900">
              {selectedPackage.name} · {selectedPackage.gold} thỏi vàng
            </h3>
            <p className="mt-1 truncate text-sm text-slate-500">
              ID: <b>{uid}</b>
            </p>
          </div>

          <img
            src={selectedPackage.image}
            alt={selectedPackage.name}
            className="h-16 w-16 shrink-0 rounded-2xl object-contain"
          />
        </div>
      </div>

      {/* Danh sách thẻ */}
      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
        <div className="space-y-4">
          {cards.map((card, index) => {
            const options = CARD_TYPES[card.type] || [];

            return (
              <div
                key={card.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-black text-slate-900">
                    Thẻ #{index + 1}
                  </p>

                  {cards.length > 1 && (
                    <button
                      onClick={() => removeCard(card.id)}
                      className="text-sm font-bold text-red-500 hover:underline"
                    >
                      Xóa
                    </button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    value={card.type}
                    onChange={(e) =>
                      updateCard(card.id, "type", e.target.value)
                    }
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
                  >
                    {Object.keys(CARD_TYPES).map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>

                  <select
                    value={card.amount}
                    onChange={(e) =>
                      updateCard(card.id, "amount", e.target.value)
                    }
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
                  >
                    <option value="">Chọn mệnh giá</option>
                    {options.map((item) => (
                      <option key={item.value} value={item.value}>
                        {formatPrice(item.value)} →{" "}
                        {formatPrice(item.received)}
                      </option>
                    ))}
                  </select>

                  <input
                    value={card.serial}
                    onChange={(e) =>
                      updateCard(card.id, "serial", e.target.value)
                    }
                    placeholder="Serial"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-500"
                  />

                  <input
                    value={card.code}
                    onChange={(e) =>
                      updateCard(card.id, "code", e.target.value)
                    }
                    placeholder="Mã thẻ"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={addCard}
          className="mt-4 w-full rounded-2xl border border-dashed border-slate-300 px-4 py-3 font-bold text-slate-600 transition hover:bg-slate-50"
        >
          + Thêm thẻ
        </button>

        <button
          onClick={onCardPayment}
          disabled={cardChecking}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {cardChecking ? (
            <>
              <Loader2 size={19} className="animate-spin" />
              Đang kiểm tra thẻ...
            </>
          ) : (
            <>
              <CreditCard size={19} />
              Nạp tiền
            </>
          )}
        </button>

        <div ref={resultRef} className="mt-5">
          {cardResult?.status === "success" && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={30}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />
                <div>
                  <h3 className="text-lg font-black text-emerald-900">
                    Nạp thẻ thành công!
                  </h3>
                  <p className="mt-1 text-sm text-emerald-700">
                    Đã cộng{" "}
                    <b>{formatPrice(cardResult.totalNetAmount)}</b> Coin vào
                    tài khoản CloudVIP.
                  </p>
                </div>
              </div>
            </div>
          )}

          {cardResult?.status === "failed" && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-start gap-3">
                <XCircle
                  size={30}
                  className="mt-0.5 shrink-0 text-red-600"
                />
                <div>
                  <h3 className="text-lg font-black text-red-900">
                    Thanh toán không thành công
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    {cardResult.reason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {cardResult?.status === "processing" && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <Loader2
                  size={30}
                  className="mt-0.5 shrink-0 animate-spin text-amber-600"
                />
                <div>
                  <h3 className="text-lg font-black text-amber-900">
                    Giao dịch đang xử lý
                  </h3>
                  <p className="mt-1 text-sm text-amber-700">
                    API chưa xác nhận thành công. Coin chưa được cộng cho
                    đến khi giao dịch thành công.
                  </p>
                </div>
              </div>
            </div>
          )}

          {cardResult?.status === "error" && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-start gap-3">
                <XCircle
                  size={30}
                  className="mt-0.5 shrink-0 text-red-600"
                />
                <div>
                  <h3 className="text-lg font-black text-red-900">
                    Không thể xử lý
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    {cardResult.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onBack}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        Quay lại
      </button>
    </div>
  );
}

/* ---------------- MODAL HƯỚNG DẪN ---------------- */
function GuideModal({ onClose }) {
  const guideImages = [
    `${SUPABASE_STORAGE}/playtogether-guide-1.png`,
    `${SUPABASE_STORAGE}/playtogether-guide-2.png`,
    `${SUPABASE_STORAGE}/playtogether-guide-3.png`,
  ];

  const guideSteps = [
    {
      title: "Mở game và vào phần Cài đặt",
      desc: "Mở ứng dụng Play Together VNG trên điện thoại, bấm vào biểu tượng Cài đặt (hình bánh răng) ở góc màn hình.",
    },
    {
      title: "Chọn mục Tài khoản",
      desc: "Trong menu Cài đặt, chọn mục Tài khoản để xem thông tin cá nhân của bạn.",
    },
    {
      title: "Copy ID tài khoản của bạn",
      desc: "Dãy số hiển thị bên cạnh chữ ID chính là ID tài khoản. Bấm vào để copy và dán vào ô nhập ID ở trang nạp.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <ShieldCheck size={20} className="text-blue-600" />
            </span>
            <div>
              <h3 className="font-black text-slate-900">
                Cách lấy ID Play Together
              </h3>
              <p className="text-xs text-slate-500">
                Làm theo 3 bước đơn giản
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 p-5">
          {guideSteps.map((step, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                  {index + 1}
                </span>
                <p className="font-bold text-slate-900">{step.title}</p>
              </div>

              <img
                src={guideImages[index]}
                alt={`Hướng dẫn bước ${index + 1}`}
                className="w-full rounded-2xl border border-slate-200 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              <p className="text-sm leading-6 text-slate-600">
                {step.desc}
              </p>
            </div>
          ))}

          <div className="rounded-2xl bg-amber-50 p-4">
            <p className="text-xs leading-5 text-amber-800">
              <b>Lưu ý:</b> ID Play Together là dãy số (thường từ 8-12 chữ
              số). Nạp sai ID sẽ không được hoàn tiền, hãy kiểm tra thật
              kỹ trước khi thanh toán.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-slate-100 bg-white px-5 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:opacity-95"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}
