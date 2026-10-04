import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Info,
  Loader2,
  Mail,
  Phone,
  Search,
  User,
  Wallet,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient.js";
import TermsCheckbox from "./TermsCheckbox.jsx";
import { useI18n } from "../i18n/index.js";
import {
  PACKAGES,
  ROBLOX_GUIDE_URL,
  LAST_USERNAME_KEY,
  formatPrice,
} from "../lib/robloxData.js";

const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n);

// =============== THANH CÁC BƯỚC ===============
export function Stepper({ step, onJump }) {
  const { t } = useI18n();
  const steps = [
    { key: "package", label: t("rb.step1") },
    { key: "account", label: t("rb.step2") },
    { key: "payment", label: t("rb.step3") },
  ];
  const current = steps.findIndex((s) => s.key === step);

  return (
    <div className="flex items-center">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        // Chỉ quay lại bước trước khi chưa sang bước thanh toán
        const clickable = done && step !== "payment";
        return (
          <React.Fragment key={s.key}>
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onJump(s.key)}
              className="flex items-center gap-2"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                  done || active
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {done ? <CheckCircle2 size={15} strokeWidth={2.5} /> : i + 1}
              </span>
              <span
                className={`text-xs font-semibold sm:text-sm ${
                  active ? "text-slate-900" : done ? "text-slate-600" : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div
                className={`mx-2 h-px flex-1 transition ${
                  i < current ? "bg-emerald-500" : "bg-slate-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// =============== HƯỚNG DẪN LẤY USERNAME ===============
function GuideModal({ onClose }) {
  const { t } = useI18n();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-start justify-between">
          <h3 className="text-base font-bold">{t("rb.guideTitle")}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-sm leading-6 text-slate-600">{t("rb.guideBody")}</p>
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <img src={ROBLOX_GUIDE_URL} alt="" className="w-full object-contain" />
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
        >
          {t("rb.guideOk")}
        </button>
      </div>
    </div>
  );
}

// =============== BƯỚC 1: CHỌN GÓI ===============
function PackageRow({ pkg, active, onSelect, coins }) {
  const { t } = useI18n();
  const enough = coins >= pkg.price;

  return (
    <button
      type="button"
      onClick={() => onSelect(pkg)}
      className={`flex w-full items-center gap-3.5 rounded-xl border bg-white p-3 text-left transition ${
        active
          ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <img
        src={pkg.image}
        alt=""
        className="h-16 w-16 shrink-0 rounded-lg border border-slate-100 object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[15px] font-bold text-slate-900">
            {t("rb.robux", { n: fmt(pkg.robux) })}
          </p>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
            {pkg.method}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-baseline gap-2">
          <span className="text-base font-extrabold text-emerald-700">
            {formatPrice(pkg.price)}
          </span>
          <span className="text-xs text-slate-400 line-through">
            {formatPrice(pkg.originalPrice)}
          </span>
          <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">
            -{pkg.discount}%
          </span>
        </div>
        <p
          className={`mt-1 text-[11px] font-medium ${
            enough ? "text-emerald-600" : "text-slate-400"
          }`}
        >
          {enough
            ? `✓ ${t("rb.coinOk")}`
            : t("rb.coinShort", { n: fmt(pkg.price - coins) })}
        </p>
      </div>
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
          active ? "border-emerald-600 bg-emerald-600" : "border-slate-300 bg-white"
        }`}
      >
        {active && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
      </span>
    </button>
  );
}

function PackageGroup({ icon: Icon, title, desc, list, selected, onSelect, coins }) {
  const { t } = useI18n();
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Icon size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-bold">{title}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
        </div>
        <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
          {t("rb.pkgCount", { n: list.length })}
        </span>
      </div>
      <div className="space-y-2">
        {list.map((pkg) => (
          <PackageRow
            key={pkg.id}
            pkg={pkg}
            active={selected?.id === pkg.id}
            onSelect={onSelect}
            coins={coins}
          />
        ))}
      </div>
    </section>
  );
}

export function PackageStep({ selected, onSelect, onNext, coins }) {
  const { t } = useI18n();
  const cardPkgs = PACKAGES.filter((p) => p.method === "Card Robux");
  const vngPkgs = PACKAGES.filter((p) => p.method === "VNG");

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-extrabold">{t("rb.pickTitle")}</h2>
        <p className="mt-0.5 text-sm text-slate-500">{t("rb.pickSub")}</p>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5">
        <span className="text-xs font-semibold text-emerald-800">
          {t("rb.yourCoins")}
        </span>
        <span className="text-sm font-extrabold text-emerald-700">
          {fmt(coins)} {t("dash.coin")}
        </span>
      </div>

      <PackageGroup
        icon={Wallet}
        title={t("rb.grpVng")}
        desc={t("rb.grpVngDesc")}
        list={vngPkgs}
        selected={selected}
        onSelect={onSelect}
        coins={coins}
      />
      <PackageGroup
        icon={CreditCard}
        title={t("rb.grpCard")}
        desc={t("rb.grpCardDesc")}
        list={cardPkgs}
        selected={selected}
        onSelect={onSelect}
        coins={coins}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        {selected ? (
          <div className="mb-3 flex items-center gap-3">
            <img
              src={selected.image}
              alt=""
              className="h-11 w-11 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500">{t("rb.selected")}</p>
              <p className="text-sm font-bold">
                {t("rb.robux", { n: fmt(selected.robux) })}
              </p>
            </div>
            <p className="text-base font-extrabold text-emerald-700">
              {formatPrice(selected.price)}
            </p>
          </div>
        ) : (
          <p className="mb-3 text-center text-xs text-slate-400">
            {t("rb.pickFirst")}
          </p>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={!selected}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-extrabold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("rb.next")} <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}

// =============== BƯỚC 2: TÀI KHOẢN NHẬN ===============
const inputCls =
  "h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

export function AccountStep({
  pkg,
  username,
  setUsername,
  robloxUser,
  setRobloxUser,
  receiveMethod,
  setReceiveMethod,
  contactValue,
  setContactValue,
  agreed,
  setAgreed,
  onBack,
  onCreate,
  creating,
  error,
  setError,
}) {
  const { t } = useI18n();
  const [checking, setChecking] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const isCard = pkg?.method === "Card Robux";

  const checkUser = async () => {
    const value = username.trim();
    if (!value) {
      setError(t("rb.err.noUser"));
      return;
    }
    setChecking(true);
    setError("");
    setRobloxUser(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError(t("rb.err.session"));
        return;
      }
      const response = await fetch(
        `/api/roblox-user?username=${encodeURIComponent(value)}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || t("rb.err.check"));
      setRobloxUser(data);
      try {
        localStorage.setItem(LAST_USERNAME_KEY, value);
      } catch {}
    } catch (e) {
      setError(e.message || t("rb.err.check"));
    } finally {
      setChecking(false);
    }
  };

  // Có sẵn username (đã nhớ từ lần trước) -> tự kiểm tra 1 lần
  useEffect(() => {
    if (username.trim() && !robloxUser) checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const missing = [];
  if (!robloxUser) missing.push(t("rb.miss.verify"));
  if (isCard && !receiveMethod) missing.push(t("rb.miss.method"));
  if (isCard && receiveMethod && !contactValue.trim())
    missing.push(t("rb.miss.contact"));
  if (!agreed) missing.push(t("rb.miss.terms"));

  const pickMethod = (m) => {
    setReceiveMethod(m);
    setContactValue("");
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-rose-600" />
          <p className="text-sm font-medium text-rose-700">{error}</p>
        </div>
      )}

      {/* Tài khoản Roblox */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <User size={19} />
          </span>
          <div>
            <h2 className="text-[15px] font-bold">{t("rb.accTitle")}</h2>
            <p className="text-xs text-slate-500">{t("rb.accSub")}</p>
          </div>
        </div>

        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {t("rb.username")}
        </label>
        <div className="flex gap-2">
          <input
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (robloxUser) setRobloxUser(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && checkUser()}
            placeholder={t("rb.usernamePh")}
            autoComplete="off"
            autoCapitalize="none"
            className={`${inputCls} min-w-0 flex-1`}
          />
          <button
            type="button"
            onClick={checkUser}
            disabled={checking || !username.trim()}
            className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checking ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            <span className="hidden sm:inline">
              {checking ? t("rb.checking") : t("rb.check")}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline"
        >
          <Info size={13} /> {t("rb.guide")}
        </button>

        {robloxUser && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            {robloxUser.avatar ? (
              <img
                src={robloxUser.avatar}
                alt=""
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <User size={20} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 size={14} /> {t("rb.verified")}
              </p>
              <p className="truncate text-sm font-semibold">
                {robloxUser.displayName || robloxUser.username}
              </p>
              <p className="truncate text-xs text-slate-500">
                @{robloxUser.username} · ID: {robloxUser.id}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Cách nhận code (chỉ Card Robux) */}
      {isCard && (
        <section className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 p-5">
          <div className="mb-4 flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Mail size={19} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[15px] font-bold">{t("rb.recvTitle")}</h2>
              <p className="mt-0.5 text-xs text-slate-600">{t("rb.recvSub")}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              ["zalo", Phone, t("rb.zalo")],
              ["email", Mail, t("rb.email")],
            ].map(([key, Icon, label]) => {
              const on = receiveMethod === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => pickMethod(key)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 bg-white p-4 transition ${
                    on
                      ? "border-emerald-600 shadow-md"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      on ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Icon size={19} />
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      on ? "text-emerald-700" : "text-slate-700"
                    }`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          {receiveMethod && (
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {receiveMethod === "zalo" ? t("rb.zaloLabel") : t("rb.emailLabel")}
              </label>
              <input
                type={receiveMethod === "zalo" ? "tel" : "email"}
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder={
                  receiveMethod === "zalo" ? t("rb.zaloPh") : t("rb.emailPh")
                }
                className={inputCls}
              />
              <p className="mt-1 text-xs text-slate-500">
                {receiveMethod === "zalo" ? t("rb.zaloHint") : t("rb.emailHint")}
              </p>
            </div>
          )}

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-xs font-medium text-amber-800">{t("rb.recvWarn")}</p>
          </div>
        </section>
      )}

      {/* Tóm tắt + điều khoản + tạo đơn */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {t("rb.summary")}
        </p>
        {pkg && (
          <div className="mt-3 flex items-center gap-3">
            <img src={pkg.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{t("rb.robux", { n: fmt(pkg.robux) })}</p>
              <p className="text-xs text-slate-500">{pkg.method}</p>
            </div>
            <div className="text-right">
              <p className="text-base font-extrabold text-emerald-700">
                {formatPrice(pkg.price)}
              </p>
              <button
                type="button"
                onClick={onBack}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                {t("rb.edit")}
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 border-t border-slate-100 pt-4">
          <TermsCheckbox checked={agreed} onChange={setAgreed} accentColor="blue" />
        </div>

        {missing.length > 0 && (
          <p className="mt-3 text-xs text-amber-600">
            {t("rb.missPrefix")} {missing.join(" · ")}
          </p>
        )}

        <div className="mt-4 grid grid-cols-[auto_1fr] gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="h-12 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {t("rb.back")}
          </button>
          <button
            type="button"
            onClick={onCreate}
            disabled={missing.length > 0 || creating}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-extrabold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {creating ? (
              <>
                <Loader2 size={16} className="animate-spin" /> {t("rb.creating")}
              </>
            ) : (
              <>
                {t("rb.create")} <ChevronRight size={17} />
              </>
            )}
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-400">
          {t("rb.hintAfter")}
        </p>
      </section>

      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
    </div>
  );
}
