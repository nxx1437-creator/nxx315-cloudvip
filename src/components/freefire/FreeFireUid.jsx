import React, { useState, useCallback, useMemo } from "react";
import {
  ChevronRight,
  Gem,
  Info,
  Loader2,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

import {
  Caption,
  Glass,
  GhostButton,
  IconBox,
  Panel,
  PillButton,
  TextField,
} from "../pay/DimensionKit.jsx";
import { SUPABASE_STORAGE, formatPrice } from "../../lib/freefireData.js";

/* =========================================================
 * DATA — khai báo ngoài component để không tạo lại mỗi render
 * =======================================================*/
const GUIDE_STEPS = [
  {
    step: 1,
    url: `${SUPABASE_STORAGE}/freefire-guide-1.png`,
    title: "Mở game Free Fire",
  },
  {
    step: 2,
    url: `${SUPABASE_STORAGE}/freefire-guide-2.png`,
    title: "Copy UID người chơi",
  },
];

/* =========================================================
 * MAIN
 * =======================================================*/
export default function UidStep({
  uid,
  setUid,
  selectedPackage,
  creatingOrder,
  onBack,
  onContinue,
}) {
  const [showGuide, setShowGuide] = useState(false);

  const openGuide = useCallback(() => setShowGuide(true), []);
  const closeGuide = useCallback(() => setShowGuide(false), []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") onContinue();
    },
    [onContinue]
  );

  // Memo hoá phần hiển thị gói — tránh tính lại khi uid thay đổi
  const packageInfo = useMemo(() => {
    if (!selectedPackage) return null;
    return {
      diamonds: selectedPackage.diamond.toLocaleString("vi-VN"),
      price: formatPrice(selectedPackage.amount),
      image: selectedPackage.image,
    };
  }, [selectedPackage]);

  const canContinue = Boolean(uid.trim()) && !creatingOrder;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* ---------- Gói đã chọn ---------- */}
      {packageInfo && (
        <Glass className="flex items-center gap-3 border-black/5 bg-black/[0.03] p-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[16px] bg-black/[0.05]">
            <img
              src={packageInfo.image}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
              onError={(e) => (e.currentTarget.style.opacity = "0.3")}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-neutral-500">Gói đã chọn</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[20px] leading-none tracking-[-0.035em] text-neutral-900">
              {packageInfo.diamonds}
              <Gem size={14} />
            </p>
          </div>
          <p className="shrink-0 text-[17px] text-neutral-900">
            {packageInfo.price}
          </p>
        </Glass>
      )}

      {/* ---------- Form UID ---------- */}
      <Panel className="border-black/5 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <IconBox icon={User} />
          <div>
            <h2 className="text-[20px] leading-tight tracking-[-0.035em] text-neutral-900">
              Tài khoản Free Fire
            </h2>
            <p className="text-[13px] text-neutral-500">
              Nhập UID để nhận Kim Cương
            </p>
          </div>
        </div>

        <Caption>UID Free Fire</Caption>
        <TextField
          icon={User}
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          onKeyDown={handleKeyDown}
          inputMode="numeric"
          autoComplete="off"
          placeholder="Ví dụ: 123456789"
        />

        <button
          type="button"
          onClick={openGuide}
          className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-neutral-500 underline-offset-4 transition hover:text-neutral-900 hover:underline"
        >
          <Info size={13} />
          Hướng dẫn lấy UID Free Fire
        </button>

        {/* ---------- Cảnh báo ---------- */}
        <div className="mt-5 flex gap-3 rounded-[16px] border border-amber-200 bg-amber-50 p-4">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="text-[14px] font-medium text-neutral-900">
              Kiểm tra chính xác trước khi thanh toán
            </p>
            <p className="mt-1 text-[13px] leading-5 text-neutral-600">
              Kim Cương sẽ được nạp theo UID đã xác nhận — sai UID không hoàn
              tiền.
            </p>
          </div>
        </div>

        {/* ---------- Actions ---------- */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <GhostButton onClick={onBack} disabled={creatingOrder}>
            Quay lại
          </GhostButton>
          <PillButton onClick={onContinue} disabled={!canContinue}>
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

      {showGuide && <GuideModal onClose={closeGuide} steps={GUIDE_STEPS} />}
    </div>
  );
}

/* =========================================================
 * GUIDE MODAL — tách riêng, không re-render khi uid đổi
 * =======================================================*/
function GuideModal({ onClose, steps }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-[32px] border border-black/5 bg-white text-neutral-900 shadow-2xl sm:rounded-[32px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-black/5 p-5">
          <div>
            <p className="text-[13px] tracking-[0.025em] text-neutral-500">
              Hướng dẫn
            </p>
            <h3 className="mt-1 text-[22px] leading-tight tracking-[-0.035em] text-neutral-900">
              Lấy UID Free Fire
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-neutral-600 transition hover:bg-black/5"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {steps.map((item) => (
            <div key={item.step}>
              <div className="mb-2.5 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-[13px] font-medium text-white">
                  {item.step}
                </span>
                <p className="text-[15px] text-neutral-900">{item.title}</p>
              </div>
              <div className="overflow-hidden rounded-[16px] border border-black/5 bg-neutral-50">
                <img
                  src={item.url}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full object-contain"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-black/5 p-5">
          <PillButton onClick={onClose}>Đã hiểu</PillButton>
        </div>
      </div>
    </div>
  );
            }
