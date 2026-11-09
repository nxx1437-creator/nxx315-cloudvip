import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ChevronRight,
  Info,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
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

const STORAGE =
  "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos";

const LIENQUAN_BANNER_URL = `${STORAGE}/lienquan-banner.png`;
const LIENQUAN_LOGO = `${STORAGE}/lien-quan-mobile.png`;
const QUANHUY_IMG = `${STORAGE}/quanhuy.png`;

const PACKAGES = [
  { id: "lq-5", amount: 6000, quanhuy: 10, originalPrice: 6000, discount: 0, image: QUANHUY_IMG },
  { id: "lq-10", amount: 11000, quanhuy: 20, originalPrice: 12000, discount: 8, image: QUANHUY_IMG },
  { id: "lq-20", amount: 21000, quanhuy: 40, originalPrice: 24000, discount: 13, image: QUANHUY_IMG },
  { id: "lq-50", amount: 51000, quanhuy: 102, originalPrice: 60000, discount: 15, image: QUANHUY_IMG },
  { id: "lq-100", amount: 100500, quanhuy: 204, originalPrice: 120000, discount: 16, image: QUANHUY_IMG },
  { id: "lq-200", amount: 200500, quanhuy: 408, originalPrice: 240000, discount: 16, image: QUANHUY_IMG },
  { id: "lq-500", amount: 500500, quanhuy: 1020, originalPrice: 600000, discount: 17, image: QUANHUY_IMG },
  { id: "lq-1000", amount: 1000500, quanhuy: 2090, originalPrice: 1200000, discount: 17, image: QUANHUY_IMG },
  { id: "lq-2000", amount: 2000500, quanhuy: 4180, originalPrice: 2400000, discount: 17, image: QUANHUY_IMG },
];

const GUIDE_IMAGES = [
  {
    step: 1,
    url: `${STORAGE}/lienquan-guide-1.png`,
    title: "Mở game Liên Quân Mobile",
  },
  {
    step: 2,
    url: `${STORAGE}/lienquan-guide-2.png`,
    title: "Vào Hồ sơ cá nhân",
  },
  {
    step: 3,
    url: `${STORAGE}/lienquan-guide-3.png`,
    title: "Copy ID người chơi",
  },
];

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN").format(value) + "đ";

export default function LienQuan() {
  const navigate = useNavigate();

  const [step, setStep] = useState("package");
  const [selectedPackage, setSelectedPackage] = useState(null);

  const [uid, setUid] = useState("");
  const [player, setPlayer] = useState(null);
  const [playerError, setPlayerError] = useState("");

  const [order, setOrder] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Đổi bước thì cuộn lên đầu
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

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
  };

  const createOrder = async () => {
    if (!selectedPackage) {
      setPlayerError("Vui lòng chọn mệnh giá nạp.");
      setStep("package");
      return;
    }
    if (!player) {
      setPlayerError("Vui lòng xác nhận ID người chơi trước.");
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
        "create-lienquan-order",
        {
          body: {
            uid: Number(player.userId),
            amount: Number(selectedPackage.amount),
            quanhuy: Number(selectedPackage.quanhuy),
            package_id: selectedPackage.id,
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
      console.error("Create Liên Quân order:", error);
      alert(error?.message || "Không thể tạo đơn. Hãy thử lại sau.");
    } finally {
      setCreatingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <PageShell>
        <TopHeader />

        <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:py-6">
          <LienQuanHero onBack={() => navigate("/store")} />

          <div className="mt-5" />

          {step === "package" && (
            <PackageSection
              selectedPackage={selectedPackage}
              onSelect={setSelectedPackage}
              onContinue={() => setStep("username")}
              agreedTerms={agreedTerms}
              setAgreedTerms={setAgreedTerms}
            />
          )}

          {step === "username" && (
            <UsernameSection
              uid={uid}
              setUid={setUid}
              player={player}
              playerError={playerError}
              setPlayerError={setPlayerError}
              onCheck={checkPlayer}
              onBack={() => setStep("package")}
              onContinue={createOrder}
              creatingOrder={creatingOrder}
              selectedPackage={selectedPackage}
            />
          )}

          {step === "payment" && (
            <PaymentSection
              order={order}
              onBack={() => setStep("username")}
              onPaid={(updatedOrder) => setOrder(updatedOrder)}
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

function LienQuanHero({ onBack }) {
  return (
    <HeroPanel
      banner={LIENQUAN_BANNER_URL}
      logo={LIENQUAN_LOGO}
      eyebrow="Premium Store"
      title="Liên Quân Mobile"
      subtitle="Nạp Quân Huy · Tự động 24/7 · An toàn"
      onBack={onBack}
      badge={
        <>
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> ĐANG HOẠT
          ĐỘNG
        </>
      }
      perks={[
        { icon: Zap, label: "Tức thì" },
        { icon: ShieldCheck, label: "Bảo mật" },
        { icon: TrendingUp, label: "Giảm 17%" },
      ]}
    />
  );
}

/* ───────── Bước 1: chọn mệnh giá ───────── */

function PackageSection({
  selectedPackage,
  onSelect,
  onContinue,
  agreedTerms,
  setAgreedTerms,
}) {
  return (
    <div className="space-y-4">
      <Notice title="Kiểm tra kỹ ID trước khi nạp">
        Quân Huy sẽ nạp vào ID đã xác nhận. Sai ID không hoàn tiền.
      </Notice>

      <SectionHeader
        icon={Sparkles}
        title="Chọn mệnh giá"
        sub={`${PACKAGES.length} gói khả dụng`}
        right={
          <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[12px] text-gray-600">
            SALE
          </span>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PACKAGES.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            active={selectedPackage?.id === pkg.id}
            onSelect={onSelect}
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
        {selectedPackage && !agreedTerms && (
          <p className="mt-3 text-center text-[13px] text-gray-500">
            Vui lòng đồng ý điều khoản để tiếp tục
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

      {pkg.discount > 0 && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-gray-900 px-2 py-0.5 text-[11px] text-white">
          -{pkg.discount}%
        </span>
      )}

      <div className="mx-auto mb-3 mt-5 aspect-square w-full max-w-[84px] overflow-hidden rounded-[16px] bg-gray-100">
        <img
          src={pkg.image}
          alt={`${pkg.quanhuy} QH`}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = LIENQUAN_LOGO;
          }}
        />
      </div>

      <div className="text-center">
        <p className="text-[22px] font-semibold leading-none tracking-[-0.035em] text-gray-900">
          {pkg.quanhuy.toLocaleString("vi-VN")}
        </p>
        <p className="mt-1 text-[13px] text-gray-500">Quân Huy</p>
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="text-[15px] font-semibold text-gray-900">
            {formatPrice(pkg.amount)}
          </p>
          {pkg.originalPrice > pkg.amount && (
            <p className="mt-0.5 text-[12px] text-gray-400 line-through">
              {formatPrice(pkg.originalPrice)}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

/* ───────── Bước 2: nhập ID ───────── */

function UsernameSection({
  uid,
  setUid,
  player,
  playerError,
  setPlayerError,
  onCheck,
  onBack,
  onContinue,
  creatingOrder,
  selectedPackage,
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
              onError={(e) => (e.currentTarget.src = LIENQUAN_LOGO)}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-gray-500">Gói đã chọn</p>
            <p className="mt-0.5 text-[20px] font-semibold leading-none tracking-[-0.035em] text-gray-900">
              {selectedPackage.quanhuy.toLocaleString("vi-VN")} Quân Huy
            </p>
          </div>
          <p className="shrink-0 text-[17px] font-semibold text-gray-900">
            {formatPrice(selectedPackage.amount)}
          </p>
        </Glass>
      )}

      <Panel className="border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <IconBox icon={User} />
          <div>
            <h2 className="text-[20px] font-semibold leading-tight tracking-[-0.035em] text-gray-900">
              Tài khoản Liên Quân
            </h2>
            <p className="text-[13px] text-gray-500">
              Nhập ID người chơi để nhận Quân Huy
            </p>
          </div>
        </div>

        <Caption>ID người chơi</Caption>
        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <TextField
              icon={User}
              value={uid}
              onChange={(e) => {
                setUid(e.target.value);
                setPlayerError?.("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") onCheck();
              }}
              inputMode="numeric"
              placeholder="Ví dụ: 123456789"
            />
          </div>
          <button
            type="button"
            onClick={onCheck}
            className="flex h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-gray-900 px-5 text-[14px] text-white transition hover:bg-gray-700"
          >
            <Search size={16} />
            <span className="hidden sm:inline">Xác nhận</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-gray-900 underline underline-offset-4 transition hover:text-gray-600"
        >
          <Info size={13} />
          Hướng dẫn lấy ID Liên Quân
        </button>

        {playerError && !player && (
          <div className="mt-4 flex items-start gap-2.5 rounded-[16px] border border-red-200 bg-red-50 p-3.5">
            <XCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
            <p className="text-[14px] text-red-700">{playerError}</p>
          </div>
        )}

        {player && (
          <div className="mt-4 flex items-center gap-3 rounded-[16px] border border-gray-200 bg-gray-50 p-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-gray-900">
              <CheckCircle2 size={20} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-gray-900">
                Đã xác nhận ID
              </p>
              <p className="mt-0.5 font-mono text-[13px] text-gray-500">
                {player.userId}
              </p>
            </div>
          </div>
        )}

        <div className="mt-5 flex gap-3 rounded-[16px] border border-gray-200 bg-gray-50 p-4">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-gray-900" />
          <p className="text-[13px] leading-5 text-gray-600">
            Kiểm tra kỹ ID. Quân Huy nạp theo ID đã xác nhận — sai ID không hoàn
            tiền.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <GhostButton onClick={onBack} disabled={creatingOrder}>
            Quay lại
          </GhostButton>
          <PillButton onClick={onContinue} disabled={creatingOrder}>
            {creatingOrder ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                Tạo đơn
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
              Lấy ID Liên Quân
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

function PaymentSection({ order, onBack, onPaid, onEarn }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [processing, setProcessing] = useState(false);
  const processingRef = useRef(false);

  useEffect(() => {
    loadProfile();
  }, []);

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

  const coinBalance = Number(profile?.coins || 0);
  const requiredCoins = Number(order.amount || 0);

  const handleCoinPayment = async () => {
    if (processingRef.current) return;
    if (!order?.id) return alert("Không tìm thấy đơn hàng.");
    if (order.status !== "pending")
      return alert("Đơn hàng này không còn ở trạng thái chờ thanh toán.");

    if (!requiredCoins || requiredCoins <= 0)
      return alert("Số Coin thanh toán không hợp lệ.");
    if (!profile) return alert("Không thể tải số dư Coin. Vui lòng thử lại.");

    if (coinBalance < requiredCoins) {
      return alert(
        `Không đủ Coin.\n\nCần: ${requiredCoins.toLocaleString(
          "vi-VN"
        )} Coin\nBạn có: ${coinBalance.toLocaleString("vi-VN")} Coin`
      );
    }

    processingRef.current = true;
    setProcessing(true);
    try {
      const { data: paymentResult, error: paymentError } = await supabase.rpc(
        "pay_lienquan_order_with_coins",
        { p_order_id: order.id }
      );

      if (paymentError) {
        const m = paymentError.message || "";
        if (m.includes("INSUFFICIENT_COINS"))
          throw new Error("Không đủ Coin để thanh toán.");
        if (m.includes("ORDER_NOT_FOUND"))
          throw new Error("Không tìm thấy đơn hàng.");
        if (m.includes("NOT_YOUR_ORDER"))
          throw new Error("Bạn không có quyền thanh toán đơn hàng này.");
        if (m.includes("ORDER_NOT_PENDING"))
          throw new Error("Đơn hàng này đã được thanh toán hoặc xử lý.");
        throw new Error("Thanh toán bằng Coin thất bại.\n\n" + m);
      }

      onPaid?.({ ...order, status: "paid", payment_method: "coin" });

      alert(
        `🎉 Thanh toán thành công!\n\n` +
          `Mã đơn: ${order.order_code}\n` +
          `Quân Huy: ${Number(order.quanhuy).toLocaleString("vi-VN")} QH\n` +
          `Đã trừ: ${requiredCoins.toLocaleString("vi-VN")} Coin\n` +
          `Coin còn lại: ${Number(
            paymentResult?.remaining_coins ?? coinBalance - requiredCoins
          ).toLocaleString("vi-VN")} Coin`
      );

      navigate(`/history/order/${order.id}`);
    } catch (error) {
      alert(
        error?.message || "Không thể thanh toán bằng Coin. Vui lòng thử lại."
      );
    } finally {
      processingRef.current = false;
      setProcessing(false);
    }
  };

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
            value: `${Number(order.quanhuy || 0).toLocaleString(
              "vi-VN"
            )} Quân Huy`,
          },
          { label: "ID", value: order.uid },
        ]}
        balance={profile?.coins}
        loading={loadingProfile}
        paying={processing}
        onPay={handleCoinPayment}
        onBack={onBack}
        onEarn={onEarn}
      />
    </div>
  );
}
