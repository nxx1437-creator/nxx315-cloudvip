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

/* =========================================================
 * HERO BANNER
 * =======================================================*/
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

/* =========================================================
 * BƯỚC 1: CHỌN GÓI KIM CƯƠNG
 * =======================================================*/
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
          className="mt-4 h-14"
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

/* =========================================================
 * PACKAGE CARD (Nền sáng)
 * =======================================================*/
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
          className="absolute right-3 top-3 text-gray-900 fill-gray-900 text-white"
        />
      )}

      {/* Ảnh gói */}
      <div className="mx-auto mb-3 aspect-square w-full max-w-[84px] overflow-hidden rounded-[16px] bg-gray-100">
        <img
          src={pkg.image}
          alt={`${pkg.diamond} Kim Cương`}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.opacity = "0.3";
          }}
        />
      </div>

      {/* Thông tin gói */}
      <div className="text-center">
        <p className="text-[22px] font-semibold leading-none tracking-[-0.035em] text-gray-900">
          {pkg.diamond.toLocaleString("vi-VN")}
        </p>
        <p className="mt-1 text-[13px] text-gray-500">
          Kim Cương
        </p>
        <div className="mt-3 border-t border-gray-100 pt-3 text-[15px] font-semibold text-gray-900">
          {formatPrice(pkg.amount)}
        </div>
      </div>
    </button>
  );
}

/* =========================================================
 * BƯỚC 3: THANH TOÁN
 * =======================================================*/
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
      <Panel className="mx-auto max-w-2xl bg-white p-8 text-center shadow-sm border border-gray-200">
        <XCircle className="mx-auto mb-3 text-red-500" size={40} />
        <h2 className="text-[20px] font-semibold tracking-[-0.035em] text-gray-900">
          Không tìm thấy đơn hàng
        </h2>
        <p className="mt-1 text-[14px] text-gray-500">Vui lòng thử lại hoặc quay lại bước trước.</p>
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
      
      {/* Panel thanh toán - Nền sáng */}
      <div className="rounded-[24px] border border-gray-200 bg-white shadow-sm overflow-hidden">
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
    </div>
  );
          }
