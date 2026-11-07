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
        <Glass className="flex items-center gap-3 p-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[16px] bg-white/10">
            <img
              src={selectedPackage.image}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => (e.currentTarget.style.opacity = "0.3")}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-[#c2c2c2]">Gói đã chọn</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[20px] leading-none tracking-[-0.035em] text-white">
              {selectedPackage.diamond.toLocaleString("vi-VN")}
              <Gem size={14} />
            </p>
          </div>
          <p className="shrink-0 text-[17px] text-white">
            {formatPrice(selectedPackage.amount)}
          </p>
        </Glass>
      )}

      <Panel className="p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <IconBox icon={User} />
          <div>
            <h2 className="text-[20px] leading-tight tracking-[-0.035em] text-white">
              Tài khoản Free Fire
            </h2>
            <p className="text-[13px] text-[#c2c2c2]">
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
          className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-[#c2c2c2] underline-offset-4 transition hover:text-white hover:underline"
        >
          <Info size={13} />
          Hướng dẫn lấy UID Free Fire
        </button>

        <div className="mt-5 flex gap-3 rounded-[16px] border border-white/10 bg-white/[0.04] p-4">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-white" />
          <div>
            <p className="text-[14px] text-white">
              Kiểm tra chính xác trước khi thanh toán
            </p>
            <p className="mt-1 text-[13px] leading-5 text-[#c2c2c2]">
              Kim Cương sẽ được nạp theo UID đã xác nhận — sai UID không hoàn
              tiền.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <GhostButton onClick={onBack}>Quay lại</GhostButton>
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-[32px] border border-white/15 bg-[#161616] text-[#ededed] sm:rounded-[32px]">
        <div className="flex items-start justify-between border-b border-white/10 p-5">
          <div>
            <p className="text-[13px] tracking-[0.025em] text-[#c2c2c2]">
              Hướng dẫn
            </p>
            <h3 className="mt-1 text-[22px] leading-tight tracking-[-0.035em] text-white">
              Lấy UID Free Fire
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/85 transition hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {steps.map((item) => (
            <div key={item.step}>
              <div className="mb-2.5 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[13px] text-[#161616]">
                  {item.step}
                </span>
                <p className="text-[15px] text-white">{item.title}</p>
              </div>
              <div className="overflow-hidden rounded-[16px] border border-white/10 bg-[#0a0a0a]">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full object-contain"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 p-5">
          <PillButton onClick={onClose}>Đã hiểu</PillButton>
        </div>
      </div>
    </div>
  );
          }
