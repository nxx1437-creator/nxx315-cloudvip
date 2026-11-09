import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ChevronRight,
  Goal,
  Info,
  Loader2,
  ShieldCheck,
  Trophy,
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

const FCM_BANNER = `${SUPABASE_STORAGE}/fc-mobile-banner.png`;
const FCM_LOGO = `${SUPABASE_STORAGE}/fc-mobile.png`;

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

const GUIDE_IMAGES = [
  {
    step: 1,
    url: `${SUPABASE_STORAGE}/fc-mobile-guide-1.png`,
    title: "Vào giao diện game FC Mobile VN",
  },
  {
    step: 2,
    url: `${SUPABASE_STORAGE}/fc-mobile-guide-2.png`,
    title: "Vào Hồ sơ → Copy Character Name",
  },
];

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN").format(Number(value || 0)) + "đ";

export default function FcMobile() {
  const navigate = useNavigate();

  const [step, setStep] = useState("package");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [characterId, setCharacterId] = useState("");

  const [order, setOrder] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [paying, setPaying] = useState(false);
  const payingRef = useRef(false);

  const [showGuide, setShowGuide] = useState(false);
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
      alert("Vui lòng chọn gói FC.");
      return;
    }
    if (!characterId.trim()) {
      alert("Vui lòng nhập Character Name.");
      return;
    }

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
        "create-fco-order",
        {
          body: {
            character_id: characterId.trim(),
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
      console.error("Create FC Mobile order:", error);

      const msg = error?.message || "Không thể tạo đơn. Hãy thử lại sau.";

      if (msg.includes("Vui lòng chờ")) {
        alert(`⏱️ ${msg}`);
      } else if (msg.includes("quá nhanh")) {
        alert(`🚫 ${msg}`);
      } else if (msg.includes("Bạn đã có đơn chưa thanh toán")) {
        alert(`⚠️ ${msg}`);
      } else {
        alert(msg);
      }
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
        "pay_fco_order_with_coins",
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
          game: "FC Mobile VN",
          logo: FCM_LOGO,
          packageLabel: `${Number(order.fco_fc || 0).toLocaleString("vi-VN")} FC`,
          accountLabel: "Character Name",
          accountValue: order.fco_character_id,
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
          <FcHero onBack={() => navigate("/store")} />

          <div className="mt-5" />

          {step === "package" && (
            <PackageStep
              selectedPackage={selectedPackage}
              setSelectedPackage={setSelectedPackage}
              characterId={characterId}
              setCharacterId={setCharacterId}
              onContinue={continueToPayment}
              creatingOrder={creatingOrder}
              onShowGuide={() => setShowGuide(true)}
              agreedTerms={agreedTerms}
              setAgreedTerms={setAgreedTerms}
            />
          )}

          {step === "payment" && (
            <PaymentStep
              order={order}
              profile={profile}
              loadingProfile={loadingProfile}
              paying={paying}
              onBack={() => setStep("package")}
              onCoinPayment={handleCoinPayment}
              onEarn={() => navigate("/tasks")}
            />
          )}
        </main>

        {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}

        <BottomNav />
      </PageShell>
    </div>
  );
}

/* ───────── Hero ───────── */

function FcHero({ onBack }) {
  return (
    <HeroPanel
      banner={FCM_BANNER}
      logo={FCM_LOGO}
      eyebrow="Football Store"
      title="FC Mobile VN"
      subtitle="Nạp FC chính hãng · Tự động 24/7"
      onBack={onBack}
      badge={
        <>
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> ONLINE
        </>
      }
      perks={[
        { icon: Zap, label: "Tức thì" },
        { icon: ShieldCheck, label: "Bảo mật" },
        { icon: Trophy, label: "Chính hãng" },
      ]}
    />
  );
}

/* ───────── Bước 1: Character Name + chọn gói ───────── */

function PackageStep({
  selectedPackage,
  setSelectedPackage,
  characterId,
  setCharacterId,
  onContinue,
  creatingOrder,
  onShowGuide,
  agreedTerms,
  setAgreedTerms,
}) {
  return (
    <div className="space-y-4">
      <Notice title="Kiểm tra kỹ Character Name trước khi nạp">
        FC sẽ nạp vào Character Name đã xác nhận. Sai tên không hoàn tiền.
      </Notice>

      <Panel className="border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <IconBox icon={User} />
          <div>
            <h2 className="text-[20px] font-semibold leading-tight tracking-[-0.035em] text-gray-900">
              Tài khoản FC Mobile VN
            </h2>
            <p className="text-[13px] text-gray-500">
              Nhập Character Name để nhận FC
            </p>
          </div>
        </div>

        <Caption>Character Name</Caption>
        <TextField
          icon={Goal}
          value={characterId}
          onChange={(e) => setCharacterId(e.target.value)}
          placeholder="Ví dụ: Ronaldo7"
        />

        <button
          type="button"
          onClick={onShowGuide}
          className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-gray-900 underline underline-offset-4 transition hover:text-gray-600"
        >
          <Info size={13} />
          Hướng dẫn lấy Character Name
        </button>
      </Panel>

      <SectionHeader
        icon={Trophy}
        title="Chọn gói FC"
        sub={`${PACKAGES.length} gói khả dụng`}
        right={
          <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[12px] text-gray-600">
            OFFICIAL
          </span>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
          disabled={
            !selectedPackage ||
            !characterId.trim() ||
            creatingOrder ||
            !agreedTerms
          }
          className="mt-4 h-14 w-full"
        >
          {creatingOrder ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Đang tạo đơn...
            </>
          ) : (
            <>
              Tiếp tục
              <ChevronRight size={18} />
            </>
          )}
        </PillButton>

        {!selectedPackage && (
          <p className="mt-3 text-center text-[13px] text-gray-500">
            Chọn một gói để tiếp tục
          </p>
        )}
        {selectedPackage && !characterId.trim() && (
          <p className="mt-3 text-center text-[13px] text-gray-500">
            Nhập Character Name để tiếp tục
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
      className={`relative overflow-hidden rounded-[24px] border p-3.5 text-left transition-all duration-200 ${
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

      <div className="mx-auto mb-3 aspect-square w-full max-w-[84px] overflow-hidden rounded-[16px] bg-gray-100">
        <img
          src={pkg.image}
          alt={`${pkg.fc} FC`}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.opacity = "0.3";
          }}
        />
      </div>

      <div className="text-center">
        <p className="text-[22px] font-semibold leading-none tracking-[-0.035em] text-gray-900">
          {pkg.fc.toLocaleString("vi-VN")}
        </p>
        <p className="mt-1 text-[13px] text-gray-500">FC</p>
        <div className="mt-3 border-t border-gray-100 pt-3 text-[15px] font-semibold text-gray-900">
          {formatPrice(pkg.amount)}
        </div>
      </div>
    </button>
  );
}

/* ───────── Hướng dẫn lấy Character Name ───────── */

function GuideModal({ onClose }) {
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
              Lấy Character Name FC Mobile VN
            </h3>
            <p className="mt-0.5 text-[13px] text-gray-500">
              Làm theo các bước dưới đây
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
          {GUIDE_IMAGES.map((item) => (
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
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement.innerHTML =
                      '<div class="flex h-32 items-center justify-center text-[13px] text-gray-400">Ảnh hướng dẫn đang cập nhật</div>';
                  }}
                />
              </div>
            </div>
          ))}

          <div className="rounded-[16px] border border-gray-200 bg-gray-50 p-4">
            <p className="text-[14px] font-semibold text-gray-900">Lưu ý</p>
            <p className="mt-1 text-[13px] leading-5 text-gray-600">
              Character Name phải nhập <b>chính xác</b> — phân biệt chữ
              hoa/thường. Sai tên sẽ không được hoàn tiền.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 p-5">
          <PillButton onClick={onClose}>Đã hiểu</PillButton>
        </div>
      </div>
    </div>
  );
}

/* ───────── Bước 2: thanh toán (chỉ Coin) ───────── */

function PaymentStep({
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
          {
            label: "Gói",
            value: `${Number(order.fco_fc || 0).toLocaleString("vi-VN")} FC`,
          },
          { label: "Character Name", value: order.fco_character_id },
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
