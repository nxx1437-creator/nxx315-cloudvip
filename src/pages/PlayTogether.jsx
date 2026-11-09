import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ChevronRight,
  Gift,
  Info,
  Loader2,
  ShieldCheck,
  User,
  Wallet,
  X,
  XCircle,
  Zap,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient.js";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import TermsCheckbox from "../components/TermsCheckbox.jsx";
import {
  Caption,
  CoinPayPanel,
  GhostButton,
  Glass,
  HeroPanel,
  IconBox,
  Notice,
  PageShell,
  Panel,
  PillButton,
  SectionHeader,
  TermsPanel,
  TextField,
} from "../components/pay/DimensionKit.jsx";

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

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN").format(Number(value || 0)) + "đ";

export default function PlayTogether() {
  const navigate = useNavigate();

  const [step, setStep] = useState("package");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [uid, setUid] = useState("");

  const [order, setOrder] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [paying, setPaying] = useState(false);
  const payingRef = useRef(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  // Đổi bước thì cuộn lên đầu
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

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
            payment_method: "coin",
          },
        }
      );

      if (error) {
        let errorMessage = "Không thể tạo đơn hàng.";

        try {
          if (error.context && typeof error.context.json === "function") {
            const errorBody = await error.context.json();
            if (errorBody?.error) {
              errorMessage = errorBody.error;
            }
          } else if (error.message && !error.message.includes("non-2xx")) {
            errorMessage = error.message;
          }
        } catch (parseErr) {
          console.warn("Cannot parse error body:", parseErr);
        }

        throw new Error(errorMessage);
      }
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
    if (payingRef.current) return;
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

    payingRef.current = true;
    setPaying(true);

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
        if (err === "ORDER_NOT_FOUND")
          throw new Error("Không tìm thấy đơn hàng.");
        if (err === "NOT_YOUR_ORDER")
          throw new Error("Bạn không có quyền thanh toán đơn này.");
        if (err === "ORDER_NOT_PENDING")
          throw new Error("Đơn hàng đã được thanh toán.");
        throw new Error("Thanh toán thất bại: " + err);
      }

      navigate(`/thanh-toan-thanh-cong/${order.id}`, {
        replace: true,
        state: {
          game: "Play Together",
          logo: PLAYTOGETHER_LOGO,
          packageLabel: `${Number(
            selectedPackage?.gold ?? order.pt_gold ?? 0
          )} thỏi vàng`,
          accountLabel: "UID Play Together",
          accountValue: order.pt_uid || uid,
          amount: requiredCoins,
          orderCode: order.order_code,
          remainingCoins: paymentResult.remaining_coins,
          paidAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      alert(error?.message || "Không thể thanh toán bằng Coin.");
    } finally {
      payingRef.current = false;
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <PageShell>
        <TopHeader />

        <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:py-6">
          <PlayTogetherHero onBack={() => navigate("/store")} />

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
              selectedPackage={selectedPackage}
              uid={uid}
              order={order}
              profile={profile}
              loadingProfile={loadingProfile}
              paying={paying}
              onBack={() => setStep("uid")}
              onCoinPayment={handleCoinPayment}
              onEarn={() => navigate("/tasks")}
            />
          )}
        </main>

        <BottomNav />
      </PageShell>
    </div>
  );
}

/* ───────── Hero ───────── */

function PlayTogetherHero({ onBack }) {
  return (
    <HeroPanel
      banner={PLAYTOGETHER_BANNER}
      logo={PLAYTOGETHER_LOGO}
      eyebrow="Casual Store"
      title="Play Together"
      subtitle="Nạp thỏi vàng nhanh chóng"
      onBack={onBack}
      badge={
        <>
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> ONLINE
        </>
      }
      perks={[
        { icon: Zap, label: "Tức thì" },
        { icon: ShieldCheck, label: "Bảo mật" },
        { icon: Gift, label: "Giảm 17%" },
      ]}
    />
  );
}

/* ───────── Bước 1: chọn gói ───────── */

function PackageStep({
  selectedPackage,
  setSelectedPackage,
  onContinue,
  agreedTerms,
  setAgreedTerms,
}) {
  return (
    <div className="space-y-4">
      <Notice title="Kiểm tra kỹ UID trước khi nạp">
        Thỏi vàng sẽ nạp vào UID đã xác nhận. Sai UID không hoàn tiền.
      </Notice>

      <SectionHeader
        icon={Gift}
        title="Chọn gói thỏi vàng"
        sub={`${PACKAGES.length} gói khả dụng`}
        right={
          <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[12px] text-gray-600">
            SALE
          </span>
        }
      />

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

      <div className="pt-2">
        <TermsPanel>
          <TermsCheckbox
            checked={agreedTerms}
            onChange={setAgreedTerms}
            accentColor="gray"
          />
        </TermsPanel>

        <PillButton
          onClick={onContinue}
          disabled={!selectedPackage || !agreedTerms}
          className="mt-4 h-14 w-full"
        >
          Tiếp tục
          <ChevronRight size={18} />
        </PillButton>
        {!selectedPackage && (
          <p className="mt-3 text-center text-[13px] text-gray-500">
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
      type="button"
      onClick={() => onSelect(pkg)}
      className={`relative overflow-hidden rounded-[24px] border p-4 text-left transition-all duration-200 ${
        active
          ? "border-gray-900 bg-white shadow-md ring-1 ring-gray-900"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      {active && (
        <CheckCircle2
          size={20}
          className="absolute right-3 top-3 text-gray-900"
          fill="#111827"
          stroke="white"
        />
      )}

      {pkg.discount > 0 && (
        <span className="absolute left-3 top-3 rounded-full bg-gray-900 px-2 py-0.5 text-[11px] text-white">
          -{pkg.discount}%
        </span>
      )}

      <div className="mx-auto mb-3 mt-4 aspect-square w-full max-w-[100px] overflow-hidden rounded-[16px] bg-gray-100">
        <img
          src={pkg.image}
          alt={`${pkg.gold} thỏi vàng`}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.opacity = "0.3";
          }}
        />
      </div>

      <div className="text-center">
        <p className="text-[12px] text-gray-500">{pkg.name}</p>
        <p className="mt-0.5 flex items-center justify-center gap-1 text-[22px] font-semibold leading-none tracking-[-0.035em] text-gray-900">
          {pkg.gold}
          <span className="text-[16px]">🪙</span>
        </p>
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="text-[15px] font-semibold text-gray-900">
            {formatPrice(pkg.price)}
          </p>
          {pkg.originalPrice > pkg.price && (
            <p className="mt-0.5 text-[12px] text-gray-400 line-through">
              {formatPrice(pkg.originalPrice)}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

/* ───────── Bước 2: nhập UID ───────── */

function UidStep({
  uid,
  setUid,
  selectedPackage,
  creatingOrder,
  onBack,
  onContinue,
}) {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {selectedPackage && (
        <Glass className="flex items-center gap-3 border border-gray-200 bg-white p-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[16px] bg-gray-100">
            <img
              src={selectedPackage.image}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => (e.currentTarget.style.opacity = "0.3")}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-gray-500">Gói đã chọn</p>
            <p className="mt-0.5 text-[20px] font-semibold leading-none tracking-[-0.035em] text-gray-900">
              {selectedPackage.gold} thỏi vàng
            </p>
          </div>
          <p className="shrink-0 text-[17px] font-semibold text-gray-900">
            {formatPrice(selectedPackage.price)}
          </p>
        </Glass>
      )}

      <Panel className="border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <IconBox icon={User} />
          <div>
            <h2 className="text-[20px] font-semibold leading-tight tracking-[-0.035em] text-gray-900">
              Tài khoản Play Together
            </h2>
            <p className="text-[13px] text-gray-500">
              Nhập UID để nhận thỏi vàng
            </p>
          </div>
        </div>

        <Caption>UID Play Together</Caption>
        <TextField
          icon={User}
          value={uid}
          onChange={(e) => setUid(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") onContinue();
          }}
          placeholder="XXXX-XXXX-XXXX"
        />

        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-gray-900 underline underline-offset-4 transition hover:text-gray-600"
        >
          <Info size={13} />
          Hướng dẫn lấy UID Play Together
        </button>

        <div className="mt-5 flex gap-3 rounded-[16px] border border-gray-200 bg-gray-50 p-4">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-gray-900" />
          <div>
            <p className="text-[14px] font-semibold text-gray-900">
              Kiểm tra chính xác trước khi thanh toán
            </p>
            <p className="mt-1 text-[13px] leading-5 text-gray-600">
              UID Play Together có dạng <b>XXXX-XXXX-XXXX</b>. Sai UID sẽ không
              hoàn tiền.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <GhostButton onClick={onBack} disabled={creatingOrder}>
            Quay lại
          </GhostButton>
          <PillButton
            onClick={onContinue}
            disabled={!uid.trim() || creatingOrder}
          >
            {creatingOrder ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                Tiếp tục
                <ChevronRight size={16} />
              </>
            )}
          </PillButton>
        </div>
      </Panel>

      {showGuide && (
        <GuideModal onClose={() => setShowGuide(false)} steps={GUIDE_IMAGES} />
      )}
    </div>
  );
}

function GuideModal({ onClose, steps }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-[32px] border border-gray-200 bg-white shadow-xl sm:rounded-[32px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-100 p-5">
          <div>
            <p className="text-[13px] tracking-[0.025em] text-gray-500">
              Hướng dẫn
            </p>
            <h3 className="mt-1 text-[22px] font-semibold leading-tight tracking-[-0.035em] text-gray-900">
              Lấy UID Play Together
            </h3>
            <p className="mt-0.5 text-[13px] text-gray-500">
              Làm theo 3 bước đơn giản
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {steps.map((item) => (
            <div key={item.step}>
              <div className="mb-2.5 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-[13px] font-semibold text-white">
                  {item.step}
                </span>
                <p className="text-[15px] font-medium text-gray-900">
                  {item.title}
                </p>
              </div>
              <div className="overflow-hidden rounded-[16px] border border-gray-100 bg-gray-50">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full object-contain"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 p-5">
          <PillButton onClick={onClose}>Đã hiểu</PillButton>
        </div>
      </div>
    </div>
  );
}

/* ───────── Bước 3: thanh toán (chỉ Coin) ───────── */

function PaymentStep({
  selectedPackage,
  uid,
  order,
  profile,
  loadingProfile,
  paying,
  onBack,
  onCoinPayment,
  onEarn,
}) {
  if (!order) {
    return (
      <Panel className="mx-auto max-w-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <XCircle className="mx-auto mb-3 text-red-500" size={40} />
        <h2 className="text-[20px] font-semibold tracking-[-0.035em] text-gray-900">
          Không tìm thấy đơn hàng
        </h2>
        <div className="mx-auto mt-5 max-w-[200px]">
          <PillButton onClick={onBack}>Quay lại</PillButton>
        </div>
      </Panel>
    );
  }

  const gold = selectedPackage?.gold ?? order.pt_gold;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <SectionHeader
        icon={Wallet}
        title="Thanh toán"
        sub="Thanh toán bằng Coin trong ví"
      />

         <CoinPayPanel
        amount={order.amount}
        orderCode={order.order_code}
        rows={[
          { label: "Gói", value: `${Number(gold || 0)} thỏi vàng` },
          { label: "UID", value: order.pt_uid || uid },
        ]}
        balance={profile?.coins}
        loading={loadingProfile}
        paying={paying}
        onPay={onCoinPayment}
        onBack={onBack}
        onEarn={onEarn}
      />
    </div>
  );
}
