import React from "react";
import { Copy, ShieldCheck } from "lucide-react";

const MOMO_QR_URL =
  "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/momo-qr.png";

const MOMO_INFO = {
  bank: "MoMo",
  account: "PSP2620310200000174",
  holder: "NGUYEN VAN CO",
};

function copyText(text) {
  navigator.clipboard?.writeText(text);
  alert("Đã sao chép!");
}

export default function BankTransfer({ amount, transferContent, accentColor = "amber" }) {
  const colorMap = {
    amber: {
      border: "border-amber-200",
      bg: "bg-amber-50",
      text: "text-amber-600",
      textDark: "text-amber-800",
      btn: "bg-amber-500 hover:bg-amber-600",
      code: "text-amber-700",
    },
    blue: {
      border: "border-blue-200",
      bg: "bg-blue-50",
      text: "text-blue-600",
      textDark: "text-blue-800",
      btn: "bg-blue-500 hover:bg-blue-600",
      code: "text-blue-700",
    },
    green: {
      border: "border-green-200",
      bg: "bg-green-50",
      text: "text-green-600",
      textDark: "text-green-800",
      btn: "bg-green-500 hover:bg-green-600",
      code: "text-green-700",
    },
    yellow: {
      border: "border-yellow-200",
      bg: "bg-yellow-50",
      text: "text-yellow-600",
      textDark: "text-yellow-800",
      btn: "bg-yellow-500 hover:bg-yellow-600",
      code: "text-yellow-700",
    },
  };

  const colors = colorMap[accentColor] || colorMap.amber;

  return (
    <div className="space-y-3">
      {/* QR + Info Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* QR Code */}
        <div className="border-b border-slate-100 bg-gradient-to-br from-pink-50 to-rose-50 p-5">
          <div className="mx-auto max-w-[240px]">
            <div className="rounded-2xl border-2 border-pink-200 bg-white p-4 shadow-sm">
              <img
                src={MOMO_QR_URL}
                alt="MoMo QR"
                className="aspect-square w-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement.innerHTML =
                    '<div class="flex aspect-square items-center justify-center text-center text-xs text-slate-400">QR MoMo đang cập nhật</div>';
                }}
              />
            </div>
          </div>

          <p className="mt-3 text-center text-xs font-semibold text-pink-600">
            Quét mã QR bằng app MoMo
          </p>
        </div>

        {/* Bank Info */}
        <div className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-500 text-white text-sm font-black">
              M
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Thông tin chuyển khoản
              </h3>
              <p className="text-[10px] text-slate-500">
                Chuyển đến ví MoMo
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <InfoRow
              label="Ngân hàng"
              value={MOMO_INFO.bank}
              accentColor={accentColor}
            />
            <InfoRow
              label="Số tài khoản"
              value={MOMO_INFO.account}
              copyable
              accentColor={accentColor}
            />
            <InfoRow
              label="Chủ tài khoản"
              value={MOMO_INFO.holder}
              accentColor={accentColor}
            />
            <InfoRow
              label="Số tiền"
              value={`${Number(amount).toLocaleString("vi-VN")}đ`}
              copyable
              copyValue={String(amount)}
              accentColor={accentColor}
            />
          </div>
        </div>
      </div>

      {/* Transfer Content */}
      <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-4`}>
        <p className={`text-xs font-black ${colors.textDark}`}>
          Nội dung chuyển khoản
        </p>
        <p className="mt-1 text-[11px] text-slate-600">
          Ghi chính xác nội dung để đơn được duyệt nhanh
        </p>

        <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5">
          <code className={`min-w-0 flex-1 break-all font-mono text-xs font-bold ${colors.code}`}>
            {transferContent}
          </code>
          <button
            type="button"
            onClick={() => copyText(transferContent)}
            className={`shrink-0 rounded-lg ${colors.btn} p-2 text-white shadow-md transition`}
          >
            <Copy size={14} />
          </button>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-rose-500" />
        <p className="text-[11px] leading-5 text-rose-700">
          Sau khi chuyển khoản, bấm nút <b>"Tôi đã chuyển khoản"</b> bên dưới. Admin sẽ kiểm tra và duyệt đơn trong vài phút.
        </p>
      </div>
    </div>
  );
}

function InfoRow({ label, value, copyable = false, copyValue, accentColor = "amber" }) {
  const colorMap = {
    amber: "text-amber-600",
    blue: "text-blue-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
  };

  const color = colorMap[accentColor] || colorMap.amber;

  const handleCopy = () => {
    copyText(copyValue || value);
  };

  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
      <span className="shrink-0 text-xs text-slate-500">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <span className="break-all text-right text-sm font-black text-slate-900">
          {value}
        </span>
        {copyable && (
          <button
            type="button"
            onClick={handleCopy}
            className={`shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 ${color}`}
            title="Sao chép"
          >
            <Copy size={14} />
          </button>
        )}
      </div>
    </div>
  );
        }
