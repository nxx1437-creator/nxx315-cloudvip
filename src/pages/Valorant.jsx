import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Crosshair,
  Loader2,
  ShieldCheck,
  Target,
  TrendingUp,
  User,
  Wallet,
  XCircle,
  Zap,
  CheckCircle2,
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

const VALORANT_BANNER = `${SUPABASE_STORAGE}/valorant-banner.png`;
const VALORANT_LOGO = `${SUPABASE_STORAGE}/valorant.png`;

// Gói VP — giá VNĐ, số VP
const PACKAGES = [
  { id: "vp-52", amount: 11000, originalPrice: 13000, vp: 52, discount: 15, image: `${SUPABASE_STORAGE}/vp-52.png` },
  { id: "vp-110", amount: 22000, originalPrice: 26000, vp: 110, discount: 15, image: `${SUPABASE_STORAGE}/vp-110.png` },
  { id: "vp-275", amount: 52000, originalPrice: 60000, vp: 275, discount: 13, image: `${SUPABASE_STORAGE}/vp-275.png` },
  { id: "vp-610", amount: 105000, originalPrice: 120000, vp: 610, discount: 13, image: `${SUPABASE_STORAGE}/vp-610.png` },
  { id: "vp-1220", amount: 210000, originalPrice: 240000, vp: 1220, discount: 13, image: `${SUPABASE_STORAGE}/vp-1220.png` },
  { id: "vp-3040", amount: 525000, originalPrice: 600000, vp: 3040, discount: 13, image: `${SUPABASE_STORAGE}/vp-3040.png` },
  { id: "vp-6550", amount: 1050000, originalPrice: 1200000, vp: 6550, discount: 13, image: `${SUPABASE_STORAGE}/vp-6550.png` },
  { id: "vp-13250", amount: 2100000, originalPrice: 2400000, vp: 13250, discount: 13, image: `${SUPABASE_STORAGE}/vp-13250.png` },
];

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN").format(Number(value || 0)) + "đ";

export default function Valorant() {
  const navigate = useNavigate();

  const [step, setStep] = useState("package");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [riotId, setRiotId] = useState("");

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
      alert("Vui lòng chọn gói VP.");
      return;
    }
    if (!riotId.trim()) {
      alert("Vui lòng nhập Riot ID.");
      return;
    }

    // Validate Riot ID: dạng "PlayerName#TAG"
    const cleanRiotId = riotId.trim();
    const riotIdRegex = /^.{3,20}#.{3,5}$/;
    if (!riotIdRegex.test(cleanRiotId)) {
      alert(
        "Riot ID không hợp lệ.\n\nĐịnh dạng đúng: PlayerName#TAG\nVí dụ: SKT1#1234"
      );
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
        "create-valorant-order",
        {
          body: {
            riot_id: cleanRiotId,
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
      console.error("Create Valorant order:", error);
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
        "pay_valorant_order_with_coins",
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

      alert(
        `🎉 Thanh toán thành công!\n\n` +
          `Đã trừ: ${requiredCoins.toLocaleString("vi-VN")} Coin\n` +
          `Coin còn lại: ${Number(paymentResult.remaining_coins).toLocaleString(
            "vi-VN"
          )} Coin`
      );

      navigate(`/history/order/${order.id}`);
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
          <ValorantHero onBack={() => navigate("/store")} />

          <div className="mt-5" />

          {step === "package" && (
            <PackageStep
              selectedPackage={selectedPackage}
              setSelectedPackage={setSelectedPackage}
              riotId={riotId}
              setRiotId={setRiotId}
              onContinue={continueToPayment}
              creatingOrder={creatingOrder}
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

        <BottomNav />
      </PageShell>
    </div>
  );
}

/* ───────── Hero ───────── */

function ValorantHero({ onBack }) {
  return (
    <HeroPanel
      banner={VALORANT_BANNER}
      logo={VALORANT_LOGO}
      eyebrow="Riot Store"
      title="VALORANT"
      subtitle="Nạp VP chính hãng · Tự động 24/7"
      onBack={onBack}
      badge={
        <>
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> ONLINE
        </>
      }
      perks={[
        { icon: Zap, label: "Tức thì" },
        { icon: ShieldCheck, label: "Bảo mật" },
        { icon: TrendingUp, label: "Chính hãng" },
      ]}
    />
  );
}

/* ───────── Bước 1: Riot ID + chọn gói ───────── */

function PackageStep({
  selectedPackage,
  setSelectedPackage,
  riotId,
  setRiotId,
  onContinue,
  creatingOrder,
  agreedTerms,
  setAgreedTerms,
}) {
  return (
    <div className="space-y-4">
      <Notice title="Kiểm tra kỹ Riot ID trước khi nạp">
        VP sẽ nạp vào Riot ID đã xác nhận. Sai ID không hoàn tiền.
      </Notice>

      <Panel className="border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <IconBox icon={User} />
          <div>
            <h2 className="text-[20px] font-semibold leading-tight tracking-[-0.035em] text-gray-900">
              Tài khoản Riot
            </h2>
            <p className="text-[13px] text-gray-500">Nhập Riot ID để nhận VP</p>
          </div>
        </div>

        <Caption>Riot ID</Caption>
        <TextField
          icon={Crosshair}
          value={riotId}
          onChange={(e) => setRiotId(e.target.value)}
          placeholder="Ví dụ: SKT1#1234"
        />
        <p className="mt-2 text-[12px] text-gray-500">
          Định dạng: <b className="text-gray-900">PlayerName#TAG</b>
        </p>
      </Panel>

      <SectionHeader
        icon={Target}
        title="Chọn gói VP"
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
            !selectedPackage || !riotId.trim() || creatingOrder || !agreedTerms
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
        {selectedPackage && !riotId.trim() && (
          <p className="mt-3 text-center text-[13px] text-gray-500">
            Nhập Riot ID để tiếp tục
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
          alt={`${pkg.vp} VP`}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.opacity = "0.3";
          }}
        />
      </div>

      <div className="text-center">
        <p className="text-[22px] font-semibold leading-none tracking-[-0.035em] text-gray-900">
          {pkg.vp.toLocaleString("vi-VN")}
        </p>
        <p className="mt-1 text-[13px] text-gray-500">VP</p>
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="text-[15px] font-semibold text-gray-900">
            {formatPrice(pkg.amount)}
          </p>
          {pkg.originalPrice && pkg.originalPrice > pkg.amount && (
            <p className="mt-0.5 text-[12px] text-gray-400 line-through">
              {formatPrice(pkg.originalPrice)}
            </p>
          )}
        </div>
      </div>
    </button>
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
            value: `${Number(order.vp || 0).toLocaleString("vi-VN")} VP`,
          },
          { label: "Riot ID", value: order.riot_id },
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
