import React, { useState } from "react";
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

const GUIDE_IMAGES = [
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

export default function UidStep({
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
        <Glass className="flex items-center gap-3 border border-gray-200 bg-gray-50 p-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[16px] bg-gray-200">
            <img
              src={selectedPackage.image}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => (e.currentTarget.style.opacity = "0.3")}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-gray-500">Gói đã chọn</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[20px] font-semibold leading-none tracking-[-0.035em] text-gray-900">
              {selectedPackage.diamond.toLocaleString("vi-VN")}
              <Gem size={14} className="text-blue-500" />
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
              Tài khoản Free Fire
            </h2>
            <p className="text-[13px] text-gray-500">
              Nhập UID để nhận Kim Cương
            </p>
          </div>
        </div>

        <Caption>UID Free Fire</Caption>
        <TextField
          icon={User}
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onContinue();
          }}
          inputMode="numeric"
          placeholder="Ví dụ: 123456789"
        />

        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-blue-600 underline-offset-4 transition hover:text-blue-700 hover:underline"
        >
          <Info size={13} />
          Hướng dẫn lấy UID Free Fire
        </button>

        <div className="mt-5 flex gap-3 rounded-[16px] border border-yellow-200 bg-yellow-50 p-4">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-yellow-600" />
          <div>
            <p className="text-[14px] font-semibold text-yellow-900">
              Kiểm tra chính xác trước khi thanh toán
            </p>
            <p className="mt-1 text-[13px] leading-5 text-yellow-700">
              Kim Cương sẽ được nạp theo UID đã xác nhận — sai UID không hoàn
              tiền.
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
              Lấy UID Free Fire
            </h3>
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
                <p className="text-[15px] font-medium text-gray-900">{item.title}</p>
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
