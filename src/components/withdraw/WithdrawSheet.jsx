import React, { useMemo, useState } from "react";
import { X, Search, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  FEE,
  MAX_AMOUNT,
  BANKS,
  QUICK_AMOUNTS,
  minFor,
  formatMoney,
  getBankInfo,
  getWalletInfo,
} from "../../lib/withdrawData.js";
import { Logo } from "./WithdrawParts.jsx";

function Sheet({ title, onClose, children }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92vh] max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white">
        <div className="flex shrink-0 items-center gap-2 border-b border-slate-100 px-4 py-3.5">
          <h3 className="flex-1 text-[16px] font-bold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100"
          >
            <X size={16} strokeWidth={2.4} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}

export function BankPickerSheet({ onClose, onPick }) {
  const [kw, setKw] = useState("");
  const list = useMemo(() => {
    const k = kw.trim().toLowerCase();
    if (!k) return BANKS;
    return BANKS.filter(
      (b) => b.name.toLowerCase().includes(k) || b.code.toLowerCase().includes(k)
    );
  }, [kw]);

  return (
    <Sheet title="Chọn ngân hàng" onClose={onClose}>
      <div className="p-4">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
          <Search size={16} className="shrink-0 text-slate-400" />
          <input
            type="text"
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            placeholder="Tìm ngân hàng..."
            className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2.5">
          {list.map((b) => (
            <button
              key={b.code}
              type="button"
              onClick={() => onPick(b.code)}
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-white p-2.5 transition active:scale-95"
            >
              <Logo file={b.logo} fallback={b.code} size={44} />
              <span className="line-clamp-2 text-center text-[10px] font-semibold leading-tight text-slate-700">
                {b.name}
              </span>
            </button>
          ))}
        </div>

        {list.length === 0 && (
          <p className="py-10 text-center text-[13px] text-slate-400">
            Không tìm thấy ngân hàng
          </p>
        )}
      </div>
    </Sheet>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[13px] font-semibold text-slate-700">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] font-semibold outline-none focus:border-emerald-600";

export function WithdrawFormSheet({
  method,
  balance,
  form,
  setField,
  error,
  success,
  submitting,
  onSubmit,
  onClose,
}) {
  const isBank = method.type === "bank";
  const info = isBank ? getBankInfo(method.code) : getWalletInfo(method.wallet);
  const min = minFor(method.type);

  const amount = Number(form.amount) || 0;
  const total = amount + FEE;
  const remaining = balance - total;
  const maxByBalance = Math.max(0, Math.min(MAX_AMOUNT, balance - FEE));
  const quick = QUICK_AMOUNTS.filter((v) => v >= min && v <= maxByBalance);
  const tooLow = amount > 0 && amount < min;

  return (
    <Sheet title="Nhập thông tin rút" onClose={onClose}>
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5">
          <Logo
            file={info?.logo}
            fallback={isBank ? method.code : (info?.name || "Ví").slice(0, 2)}
            size={44}
            color={info?.color}
          />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-slate-500">Rút qua</p>
            <p className="truncate text-[14px] font-bold text-slate-900">
              {info?.name || method.code}
            </p>
          </div>
          <span className="rounded-full bg-white px-2.5 py-1 text-[10.5px] font-semibold text-slate-500">
            Từ {formatMoney(min)}
          </span>
        </div>

        <Field label="Số tiền rút">
          <input
            type="text"
            inputMode="numeric"
            value={form.amount ? Number(form.amount).toLocaleString("vi-VN") : ""}
            onChange={(e) => setField("amount", e.target.value.replace(/\D/g, ""))}
            placeholder="Nhập số tiền"
            className={`${inputCls} text-[17px] font-extrabold`}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {quick.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setField("amount", String(v))}
                className={`rounded-lg border px-3 py-1.5 text-[12px] font-bold transition ${
                  form.amount === String(v)
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {v / 1000}K
              </button>
            ))}
            {maxByBalance >= min && (
              <button
                type="button"
                onClick={() => setField("amount", String(maxByBalance))}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[12px] font-bold text-emerald-700"
              >
                Tối đa
              </button>
            )}
          </div>
          <p className={`mt-2 text-[11.5px] ${tooLow ? "font-semibold text-rose-600" : "text-slate-400"}`}>
            Tối thiểu {formatMoney(min)} · Tối đa {formatMoney(MAX_AMOUNT)}
          </p>
        </Field>

        <Field label={isBank ? "Số tài khoản" : "Số điện thoại ví"}>
          <input
            type="text"
            inputMode="numeric"
            value={form.accountNumber}
            onChange={(e) => setField("accountNumber", e.target.value.replace(/\D/g, ""))}
            placeholder={isBank ? "Nhập số tài khoản" : "Nhập SĐT ví"}
            className={inputCls}
          />
        </Field>

        <Field label="Tên chủ tài khoản">
          <input
            type="text"
            value={form.accountName}
            onChange={(e) => setField("accountName", e.target.value.toUpperCase())}
            placeholder="NGUYEN VAN A"
            className={`${inputCls} uppercase`}
          />
        </Field>

        <Field label="SĐT liên hệ">
          <input
            type="text"
            inputMode="numeric"
            maxLength={11}
            value={form.contactPhone}
            onChange={(e) => setField("contactPhone", e.target.value.replace(/\D/g, ""))}
            placeholder="0912345678"
            className={inputCls}
          />
        </Field>

        {amount > 0 && (
          <div className="space-y-2 rounded-2xl bg-slate-50 p-4 text-[13px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Tiền nhận</span>
              <span className="font-bold">{formatMoney(amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phí</span>
              <span className="font-bold text-rose-600">+{formatMoney(FEE)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <span className="font-bold text-slate-900">Tổng trừ khỏi số dư</span>
              <span className="text-[15px] font-black">{formatMoney(total)}</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-slate-500">Số dư còn lại</span>
              <span className={`font-bold ${remaining < 0 ? "text-rose-600" : "text-slate-700"}`}>
                {formatMoney(remaining)}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[12.5px] text-rose-700">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[12.5px] text-emerald-700">
            <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting || !amount}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 text-[15px] font-bold text-white transition active:scale-[0.99] disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Đang xử lý...
            </>
          ) : (
            "Xác nhận rút tiền"
          )}
        </button>
      </div>
    </Sheet>
  );
}
