import React from "react";
import {
  CheckCircle2,
  ChevronRight,
  Flame,
  Gem,
  ShieldCheck,
  TrendingUp,
  XCircle,
  Zap,
  Wallet,
} from "lucide-react";

import TermsCheckbox from "../TermsCheckbox.jsx";
import {
  CoinPayPanel,
  HeroPanel,
  Notice,
  Panel,
  PillButton,
  SectionHeader,
  TermsPanel,
} from "../pay/DimensionKit.jsx";
import {
  PACKAGES,
  FREEFIRE_BANNER,
  FREEFIRE_LOGO,
  formatPrice,
} from "../../lib/freefireData.js";

export function FreeFireHero({ onBack }) {
  return (
    <HeroPanel
      banner={FREEFIRE_BANNER}
      logo={FREEFIRE_LOGO}
      eyebrow="Premium Store"
      title="Free Fire"
      subtitle="Nạp Kim Cương tự động 24/7"
      onBack={onBack}
      badge={
        <>
          <Flame size={12} /> HOT
        </>
      }
      perks={[
        { icon: Zap, label: "Tức thì" },
        { icon: ShieldCheck, label: "Bảo mật" },
        { icon: TrendingUp, label: "Giá tốt" },
      ]}
    />
  );
}

/* ───────── Bước 1: chọn gói ───────── */

export function PackageStep({
  selectedPackage,
  setSelectedPackage,
  onContinue,
  agreedTerms,
  setAgreedTerms,
}) {
  return (
    <div className="space-y-4">
      <Notice title="Kiểm tra kỹ UID trước khi nạp">
        Kim Cương sẽ nạp vào UID đã xác nhận. Sai UID không hoàn tiền.
      </Notice>

      <SectionHeader
        icon={Gem}
        title="Chọn gói Kim Cương"
        sub={`${PACKAGES.length} gói khả dụng`}
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
            accentColor="orange"
          />
        </TermsPanel>

        <PillButton
          onClick={onContinue}
          disabled={!selectedPackage || !agreedTerms}
          className="h-14"
        >
          Tiếp tục
          <ChevronRight size={18} />
        </PillButton>
        {!selectedPackage && (
          <p className="mt-3 text-center text-[13px] text-[#686868]">
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
      className={`relative overflow-hidden rounded-[24px] border p-3.5 text-left transition ${
        active
          ? "border-white bg-white text-[#161616]"
          : "border-white/15 bg-[#d4d4d4]/10 text-white backdrop-blur-[4px] hover:border-white/40"
      }`}
    >
      {active && (
        <CheckCircle2
          size={18}
          className="absolute right-3 top-3 text-[#161616]"
        />
      )}

      <div
        className={`mx-auto mb-3 aspect-square w-full max-w-[84px] overflow-hidden rounded-[16px] ${
          active ? "bg-[#161616]/5" : "bg-white/10"
        }`}
      >
        <img
          src={pkg.image}
          alt={`${pkg.diamond} Kim Cương`}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.opacity = "0.3";
          }}
        />
      </div>

      <div className="text-center">
        <p className="text-[22px] leading-none tracking-[-0.035em]">
          {pkg.diamond.toLocaleString("vi-VN")}
        </p>
        <p
          className={`mt-1 text-[13px] ${
            active ? "text-[#686868]" : "text-[#c2c2c2]"
          }`}
        >
          Kim Cương
        </p>
        <div
          className={`mt-3 border-t pt-3 text-[15px] ${
            active ? "border-[#161616]/10" : "border-white/10"
          }`}
        >
          {formatPrice(pkg.amount)}
        </div>
      </div>
    </button>
  );
}

/* ───────── Bước 3: thanh toán (chỉ Coin) ───────── */

export function PaymentStep({
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
      <Panel className="mx-auto max-w-2xl p-8 text-center">
        <XCircle className="mx-auto mb-3 text-white" size={40} />
        <h2 className="text-[20px] tracking-[-0.035em] text-white">
          Không tìm thấy đơn hàng
        </h2>
        <div className="mx-auto mt-5 max-w-[200px]">
          <PillButton onClick={onBack}>Quay lại</PillButton>
        </div>
      </Panel>
    );
  }

  const diamond = selectedPackage?.diamond ?? order.ff_diamond;

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
            value: `${Number(diamond || 0).toLocaleString("vi-VN")} Kim Cương`,
          },
          { label: "UID", value: order.ff_uid || uid },
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
