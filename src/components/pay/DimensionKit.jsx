import React, { useEffect } from "react";
import { AlertTriangle, ArrowLeft, Coins } from "lucide-react";

// Bộ giao diện dùng chung cho các trang nạp (phong cách Dimension: nền tối, kính mờ, nút viên thuốc)
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
      className="min-h-screen bg-[#0a0a0a] pb-36 text-[#ededed] antialiased"
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
      className={`rounded-[24px] border border-white/15 bg-[#d4d4d4]/10 backdrop-blur-[4px] ${className}`}
    >
      {children}
    </div>
  );
}

export function Panel({ className = "", children }) {
  return (
    <div
      className={`rounded-[24px] border border-white/15 bg-[#161616] ${className}`}
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
      className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-[15px] text-[#161616] transition hover:bg-[#ededed] disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
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
      className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/25 px-5 text-[15px] text-white/85 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

export function Caption({ children }) {
  return (
    <label className="mb-2 block text-[13px] tracking-[0.025em] text-[#c2c2c2]">
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
          className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#686868]"
        />
      )}
      <input
        {...props}
        className={`h-14 w-full rounded-full border border-white/20 bg-white/[0.04] pr-5 text-[15px] tracking-[0.02em] text-white outline-none transition placeholder:text-[#686868] focus:border-white/70 ${
          Icon ? "pl-12" : "pl-5"
        } ${className}`}
      />
    </div>
  );
}

export function IconBox({ icon: Icon }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-white/10">
      <Icon size={20} className="text-white" />
    </div>
  );
}

export function SectionHeader({ icon, title, sub, right }) {
  return (
    <div className="flex items-center justify-between gap-3 px-1">
      <div className="flex items-center gap-3">
        <IconBox icon={icon} />
        <div>
          <h2 className="text-[20px] leading-tight tracking-[-0.035em] text-white">
            {title}
          </h2>
          {sub && <p className="text-[13px] text-[#c2c2c2]">{sub}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function Notice({ icon: Icon = AlertTriangle, title, children }) {
  return (
    <Panel className="flex items-start gap-3 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white/10">
        <Icon size={16} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[15px] text-white">{title}</p>
        <p className="mt-1 text-[13px] leading-5 text-[#c2c2c2]">{children}</p>
      </div>
    </Panel>
  );
}

// Khung trắng đặt quanh ô đồng ý điều khoản (giữ nguyên TermsCheckbox gốc, luôn đọc được trên nền tối)
export function TermsPanel({ children }) {
  return (
    <div className="mb-3 rounded-[24px] bg-white p-4 text-[#161616]">
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
    <section className="relative overflow-hidden rounded-[40px] border border-white/15 bg-[#161616]">
      <div className="relative h-44 sm:h-60">
        {banner && (
          <img
            src={banner}
            alt=""
            className="h-full w-full object-cover opacity-80"
            onError={hide}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-[#161616]/40 to-transparent" />
        <button
          type="button"
          onClick={onBack}
          aria-label="Quay lại"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-[#0a0a0a]/60 text-white backdrop-blur-[4px] transition hover:bg-white/10"
        >
          <ArrowLeft size={18} />
        </button>
        {badge && (
          <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-white/25 bg-[#0a0a0a]/60 px-3 py-1.5 text-[13px] text-white backdrop-blur-[4px]">
            {badge}
          </div>
        )}
      </div>

      <div className="relative -mt-9 px-5 pb-5">
        <div className="flex items-end gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[22px] border border-white/20 bg-[#0a0a0a] sm:h-24 sm:w-24">
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
              <p className="text-[13px] tracking-[0.025em] text-[#c2c2c2]">
                {eyebrow}
              </p>
            )}
            <h1 className="text-[30px] leading-none tracking-[-0.035em] text-white sm:text-[36px]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-[14px] text-[#c2c2c2]">{subtitle}</p>
            )}
          </div>
        </div>

        {perks.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {perks.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3.5 py-1.5 text-[13px] text-white/85"
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
      <span className="text-[#c2c2c2]">{label}</span>
      <span className="text-right text-white">{value}</span>
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
          <p className="text-[13px] tracking-[0.025em] text-[#c2c2c2]">
            Tổng thanh toán
          </p>
          <p className="mt-2 flex items-baseline gap-2 text-[44px] leading-none tracking-[-0.035em] text-white">
            {formatCoin(need)}
            <span className="text-[18px] tracking-normal text-[#c2c2c2]">
              Coin
            </span>
          </p>
          {orderCode && (
            <span className="mt-4 inline-flex items-center rounded-full border border-white/15 px-3 py-1.5 text-[13px] text-[#c2c2c2]">
              Mã đơn
              <span className="ml-2 font-mono text-white">{orderCode}</span>
            </span>
          )}
        </div>
        {rows.length > 0 && (
          <div className="space-y-3 border-t border-white/10 px-6 py-5">
            {rows.map((r) => (
              <KV key={r.label} label={r.label} value={r.value} />
            ))}
          </div>
        )}
      </Panel>

      <Glass className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[14px] text-[#c2c2c2]">
            <Coins size={15} /> Số dư Coin
          </span>
          <span className="text-[17px] text-white">
            {loading ? "..." : formatCoin(have)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-3">
          <span className="text-[14px] text-[#c2c2c2]">Sau thanh toán</span>
          <span className="text-[17px] text-white">
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
