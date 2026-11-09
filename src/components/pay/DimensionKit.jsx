import React, { useEffect } from "react";
import { AlertTriangle, ArrowLeft, Coins } from "lucide-react";

// Bộ giao diện dùng chung cho các trang nạp (nền trắng, viền xám nhạt, nút viên thuốc đen)
const FONT = "'DM Sans','Be Vietnam Pro',ui-sans-serif,system-ui,sans-serif";
const VIOLET =
  "linear-gradient(90deg,rgba(0,0,0,0),rgba(0,0,0,0) 40%,rgba(107,98,242,.565) 50%,rgba(0,0,0,0) 60%,rgba(0,0,0,0))";

export const formatCoin = (n) => Number(n || 0).toLocaleString("vi-VN");

export function DimensionFont() {
  useEffect(() => {
    if (document.getElementById("dimension-font")) return;
    const link = document.createElement("link");
    link.id = "dimension-font";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);
  return null;
}

export function PageShell({ children }) {
  return (
    <div
      className="min-h-screen bg-white pb-36 text-gray-900 antialiased"
      style={{ fontFamily: FONT, fontWeight: 500 }}
    >
      <DimensionFont />
      {children}
    </div>
  );
}

export function Glass({ className = "", children }) {
  return (
    <div
      className={`rounded-[24px] border border-gray-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function Panel({ className = "", children }) {
  return (
    <div
      className={`rounded-[24px] border border-gray-200 bg-white ${className}`}
    >
      {children}
    </div>
  );
}

export function PillButton({ className = "", children, ...props }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gray-900 px-5 text-[15px] text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({ className = "", children, ...props }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-5 text-[15px] text-gray-800 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

export function Caption({ children }) {
  return (
    <label className="mb-2 block text-[13px] tracking-[0.025em] text-gray-600">
      {children}
    </label>
  );
}

export function TextField({ icon: Icon, className = "", ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={16}
          className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
        />
      )}
      <input
        {...props}
        className={`h-14 w-full rounded-full border border-gray-300 bg-white pr-5 text-[15px] tracking-[0.02em] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 ${
          Icon ? "pl-12" : "pl-5"
        } ${className}`}
      />
    </div>
  );
}

export function IconBox({ icon: Icon }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-gray-100">
      <Icon size={20} className="text-gray-900" />
    </div>
  );
}

export function SectionHeader({ icon, title, sub, right }) {
  return (
    <div className="flex items-center justify-between gap-3 px-1">
      <div className="flex items-center gap-3">
        <IconBox icon={icon} />
        <div>
          <h2 className="text-[20px] leading-tight tracking-[-0.035em] text-gray-900">
            {title}
          </h2>
          {sub && <p className="text-[13px] text-gray-500">{sub}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function Notice({ icon: Icon = AlertTriangle, title, children }) {
  return (
    <Panel className="flex items-start gap-3 bg-gray-50 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white border border-gray-200">
        <Icon size={16} className="text-gray-900" />
      </div>
      <div className="min-w-0">
        <p className="text-[15px] text-gray-900">{title}</p>
        <p className="mt-1 text-[13px] leading-5 text-gray-600">{children}</p>
      </div>
    </Panel>
  );
}

// Khung đặt quanh ô đồng ý điều khoản (giữ nguyên TermsCheckbox gốc)
export function TermsPanel({ children }) {
  return (
    <div className="mb-3 rounded-[24px] border border-gray-200 bg-gray-50 p-4 text-gray-900">
      {children}
    </div>
  );
}

export function HeroPanel({
  banner,
  logo,
  eyebrow,
  title,
  subtitle,
  badge,
  perks = [],
  onBack,
}) {
  const hide = (e) => {
    e.currentTarget.style.display = "none";
  };
  return (
    <section className="relative overflow-hidden rounded-[40px] border border-gray-200 bg-white shadow-sm">
      <div className="relative h-44 sm:h-60">
        {banner && (
          <img
            src={banner}
            alt=""
            className="h-full w-full object-cover"
            onError={hide}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
        <button
          type="button"
          onClick={onBack}
          aria-label="Quay lại"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white/80 text-gray-900 backdrop-blur-[4px] transition hover:bg-white"
        >
          <ArrowLeft size={18} />
        </button>
        {badge && (
          <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 text-[13px] text-gray-900 backdrop-blur-[4px]">
            {badge}
          </div>
        )}
      </div>

      <div className="relative -mt-9 px-5 pb-5">
        <div className="flex items-end gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-sm sm:h-24 sm:w-24">
            {logo && (
              <img
                src={logo}
                alt=""
                className="h-full w-full object-cover"
                onError={hide}
              />
            )}
          </div>
          <div className="min-w-0 flex-1 pb-1">
            {eyebrow && (
              <p className="text-[13px] tracking-[0.025em] text-gray-500">
                {eyebrow}
              </p>
            )}
            <h1 className="text-[30px] leading-none tracking-[-0.035em] text-gray-900 sm:text-[36px]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-[14px] text-gray-600">{subtitle}</p>
            )}
          </div>
        </div>

        {perks.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {perks.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-[13px] text-gray-700"
              >
                <Icon size={13} />
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function KV({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 text-[14px]">
      <span className="text-gray-500">{label}</span>
      <span className="text-right text-gray-900">{value}</span>
    </div>
  );
}

// Thanh toán bằng Coin (phương thức duy nhất). Dùng lại cho mọi trang nạp.
export function CoinPayPanel({
  amount,
  orderCode,
  rows = [],
  balance,
  loading,
  paying,
  onPay,
  onBack,
  onEarn,
}) {
  const need = Number(amount || 0);
  const have = Number(balance || 0);
  const enough = have >= need;

  return (
    <div className="space-y-4">
      <Panel className="overflow-hidden">
        <div className="h-px w-full" style={{ background: VIOLET }} />
        <div className="p-6">
          <p className="text-[13px] tracking-[0.025em] text-gray-500">
            Tổng thanh toán
          </p>
          <p className="mt-2 flex items-baseline gap-2 text-[44px] leading-none tracking-[-0.035em] text-gray-900">
            {formatCoin(need)}
            <span className="text-[18px] tracking-normal text-gray-500">
              Coin
            </span>
          </p>
          {orderCode && (
            <span className="mt-4 inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-[13px] text-gray-500">
              Mã đơn
              <span className="ml-2 font-mono text-gray-900">{orderCode}</span>
            </span>
          )}
        </div>
        {rows.length > 0 && (
          <div className="space-y-3 border-t border-gray-100 px-6 py-5">
            {rows.map((r) => (
              <KV key={r.label} label={r.label} value={r.value} />
            ))}
          </div>
        )}
      </Panel>

      <Glass className="space-y-3 bg-gray-50 p-5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[14px] text-gray-600">
            <Coins size={15} /> Số dư Coin
          </span>
          <span className="text-[17px] text-gray-900">
            {loading ? "..." : formatCoin(have)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 pt-3">
          <span className="text-[14px] text-gray-600">Sau thanh toán</span>
          <span className="text-[17px] text-gray-900">
            {formatCoin(Math.max(have - need, 0))}
          </span>
        </div>
      </Glass>

      {!loading && !enough && (
        <Notice title={`Bạn còn thiếu ${formatCoin(need - have)} Coin`}>
          Làm nhiệm vụ để kiếm thêm Coin rồi quay lại thanh toán đơn này.
        </Notice>
      )}

      {enough || loading ? (
        <PillButton onClick={onPay} disabled={loading || paying}>
          {paying
            ? "Đang thanh toán..."
            : `Thanh toán ${formatCoin(need)} Coin`}
        </PillButton>
      ) : (
        <PillButton onClick={onEarn}>Làm nhiệm vụ kiếm Coin</PillButton>
      )}
      <GhostButton onClick={onBack} disabled={paying}>
        Quay lại
      </GhostButton>
    </div>
  );
      }
