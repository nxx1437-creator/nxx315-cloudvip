import React, { useState } from "react";
import { Building2, Smartphone, ChevronRight, Info } from "lucide-react";
import {
  FEE,
  MIN_BANK,
  MIN_WALLET,
  MAX_AMOUNT,
  MAX_PER_DAY,
  MAX_TIMES_PER_DAY,
  WALLETS,
  TOP_BANKS,
  getBankInfo,
  getImageUrl,
  formatMoney,
} from "../../lib/withdrawData.js";

// Logo tròn, tự đổi sang chữ nếu ảnh lỗi
export function Logo({ file, fallback, size = 44, color = "#0A2540" }) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full border border-slate-100 bg-white"
      style={{ width: size, height: size }}
    >
      {file && !failed ? (
        <img
          src={getImageUrl(file)}
          alt=""
          className="object-contain"
          style={{ width: size * 0.62, height: size * 0.62 }}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-[11px] font-black" style={{ color }}>
          {fallback}
        </span>
      )}
    </div>
  );
}

export function BalanceHero({ balance, today }) {
  const pct = Math.min(100, Math.round((today.amount / MAX_PER_DAY) * 100));
  return (
    <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 p-5 text-white shadow-sm">
      <p className="text-[12px] font-medium text-emerald-100">Số dư khả dụng</p>
      <p className="mt-1 text-[32px] font-extrabold leading-none tracking-tight tabular-nums">
        {formatMoney(balance)}
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold">
        <span className="rounded-full bg-white/15 px-2.5 py-1">
          Phí {formatMoney(FEE)}/lần
        </span>
        <span className="rounded-full bg-white/15 px-2.5 py-1">
          Tối đa {formatMoney(MAX_AMOUNT)}/lần
        </span>
      </div>

      <div className="mt-4 border-t border-white/15 pt-3">
        <div className="flex items-center justify-between text-[11px] text-emerald-50">
          <span>Hôm nay đã rút</span>
          <span className="tabular-nums">
            {today.count}/{MAX_TIMES_PER_DAY} lần · {formatMoney(today.amount)}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1.5 text-[10.5px] text-emerald-100/90">
          Giới hạn làm mới lúc 7:00 sáng mỗi ngày
        </p>
      </div>
    </div>
  );
}

export function MethodTabs({ tab, onChange }) {
  const items = [
    { id: "wallet", label: "Ví điện tử", note: `Từ ${formatMoney(MIN_WALLET)}`, Icon: Smartphone },
    { id: "bank", label: "Ngân hàng", note: `Từ ${formatMoney(MIN_BANK)}`, Icon: Building2 },
  ];
  return (
    <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
      {items.map(({ id, label, note, Icon }) => {
        const active = tab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 transition ${
              active ? "bg-white shadow-sm" : ""
            }`}
          >
            <Icon size={16} className={active ? "text-emerald-600" : "text-slate-400"} />
            <span className="text-left leading-tight">
              <span className={`block text-[13px] font-bold ${active ? "text-slate-900" : "text-slate-500"}`}>
                {label}
              </span>
              <span className="block text-[10.5px] text-slate-400">{note}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function WalletGrid({ onPick }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {WALLETS.map((w) => (
        <button
          key={w.id}
          type="button"
          onClick={() => onPick(w.id)}
          className="flex flex-col items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-3 py-5 transition active:scale-[0.98]"
        >
          <Logo file={w.logo} fallback={w.name.slice(0, 2)} size={56} color={w.color} />
          <span className="text-[14px] font-bold text-slate-900">{w.name}</span>
        </button>
      ))}
    </div>
  );
}

export function BankGrid({ onPick, onMore }) {
  return (
    <>
      <div className="grid grid-cols-4 gap-2">
        {TOP_BANKS.map((code) => {
          const b = getBankInfo(code);
          if (!b) return null;
          return (
            <button
              key={code}
              type="button"
              onClick={() => onPick(code)}
              className="flex flex-col items-center gap-1.5 rounded-xl py-2 transition active:scale-95"
            >
              <Logo file={b.logo} fallback={b.code} size={52} />
              <span className="w-full truncate text-center text-[10.5px] font-semibold text-slate-700">
                {b.name}
              </span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onMore}
        className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-slate-200 py-2.5 text-[12.5px] font-bold text-emerald-700 transition active:bg-slate-50"
      >
        Xem tất cả ngân hàng
        <ChevronRight size={14} />
      </button>
    </>
  );
}

export function RecentMethods({ items, onPick }) {
  if (!items.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-[13px] font-bold text-slate-900">Dùng lại gần đây</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((it) => (
          <button
            key={it.key}
            type="button"
            onClick={() => onPick(it.method)}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-1.5 pr-3 transition active:scale-95"
          >
            <Logo file={it.logo} fallback={it.fallback} size={28} />
            <span className="text-[12px] font-semibold text-slate-700">{it.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function Notes() {
  const rows = [
    `Phí rút ${formatMoney(FEE)} mỗi lần, trừ thêm vào số dư.`,
    `Tối đa ${MAX_TIMES_PER_DAY} lần và ${formatMoney(MAX_PER_DAY)} mỗi ngày.`,
    "Yêu cầu được xử lý trong vòng 24 giờ.",
    "Kiểm tra kỹ số tài khoản và tên chủ tài khoản trước khi gửi.",
  ];
  return (
    <div className="rounded-2xl bg-slate-100/70 p-4">
      <div className="flex items-center gap-1.5 text-[12.5px] font-bold text-slate-700">
        <Info size={14} /> Lưu ý
      </div>
      <ul className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-slate-500">
        {rows.map((r) => (
          <li key={r} className="flex gap-2">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-slate-400" />
            <span>{r}</span>
          </li>
        ))}
      </ul>
    </div>
  );
      }
