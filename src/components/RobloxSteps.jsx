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
import {
  Caption,
  GhostButton,
  IconBox,
  Panel,
  PillButton,
  SectionHeader,
  TermsPanel,
  TextField,
} from "./pay/DimensionKit.jsx";
import { useI18n } from "../i18n/index.js";
import {
  PACKAGES,
  ROBLOX_GUIDE_URL,
  LAST_USERNAME_KEY,
  formatCoin,
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
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] transition ${
                  done || active
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? <CheckCircle2 size={15} strokeWidth={2.5} /> : i + 1}
              </span>
              <span
                className={`text-[13px] sm:text-sm ${
                  active
                    ? "text-gray-900"
                    : done
                    ? "text-gray-600"
                    : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div
                className={`mx-2 h-px flex-1 transition ${
                  i < current ? "bg-gray-900" : "bg-gray-200"
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
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-[32px] border border-gray-200 bg-white shadow-xl sm:rounded-[32px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-100 p-5">
          <h3 className="text-[20px] font-semibold leading-tight tracking-[-0.035em] text-gray-900">
            {t("rb.guideTitle")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <p className="text-[14px] leading-6 text-gray-600">
            {t("rb.guideBody")}
          </p>
          <div className="mt-4 overflow-hidden rounded-[16px] border border-gray-100 bg-gray-50">
            <img src={ROBLOX_GUIDE_URL} alt="" className="w-full object-contain" />
          </div>
        </div>
        <div className="border-t border-gray-100 p-5">
          <PillButton onClick={onClose}>{t("rb.guideOk")}</PillButton>
        </div>
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
      className={`flex w-full items-center gap-3.5 rounded-[20px] border bg-white p-3 text-left transition ${
        active
          ? "border-gray-900 shadow-md ring-1 ring-gray-900"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <img
        src={pkg.image}
        alt=""
        className="h-16 w-16 shrink-0 rounded-[14px] border border-gray-100 bg-gray-100 object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[16px] font-semibold tracking-[-0.02em] text-gray-900">
            {t("rb.robux", { n: fmt(pkg.robux) })}
          </p>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
            {pkg.method}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-baseline gap-2">
          <span className="text-[16px] font-semibold text-gray-900">
            {formatCoin(pkg.price)}
          </span>
          <span className="text-[12px] text-gray-400 line-through">
            {formatCoin(pkg.originalPrice)}
          </span>
          <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[11px] text-white">
            -{pkg.discount}%
          </span>
        </div>
        <p
          className={`mt-1 text-[12px] ${
            enough ? "text-gray-700" : "text-gray-400"
          }`}
        >
          {enough
            ? `✓ ${t("rb.coinOk")}`
            : t("rb.coinShort", { n: fmt(pkg.price - coins) })}
        </p>
      </div>
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
          active ? "border-gray-900 bg-gray-900" : "border-gray-300 bg-white"
        }`}
      >
        {active && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
      </span>
    </button>
  );
}

function PackageGroup({ icon, title, desc, list, selected, onSelect, coins }) {
  const { t } = useI18n();
  return (
    <Panel className="space-y-3 p-4">
      <SectionHeader
        icon={icon}
        title={title}
        sub={desc}
        right={
          <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[12px] text-gray-600">
            {t("rb.pkgCount", { n: list.length })}
          </span>
        }
      />
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
    </Panel>
  );
}

export function PackageStep({ selected, onSelect, onNext, coins }) {
  const { t } = useI18n();
  const cardPkgs = PACKAGES.filter((p) => p.method === "Card Robux");
  const vngPkgs = PACKAGES.filter((p) => p.method === "VNG");

  return (
    <div className="space-y-4">
      <div className="px-1">
        <h2 className="text-[22px] font-semibold leading-tight tracking-[-0.035em] text-gray-900">
          {t("rb.pickTitle")}
        </h2>
        <p className="mt-0.5 text-[13px] text-gray-500">{t("rb.pickSub")}</p>
      </div>

      <div className="flex items-center justify-between rounded-full border border-gray-200 bg-gray-50 px-5 py-3">
        <span className="text-[13px] text-gray-600">{t("rb.yourCoins")}</span>
        <span className="text-[15px] font-semibold text-gray-900">
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

      <Panel className="p-4">
        {selected ? (
          <div className="mb-4 flex items-center gap-3">
            <img
              src={selected.image}
              alt=""
              className="h-12 w-12 rounded-[14px] bg-gray-100 object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-gray-500">{t("rb.selected")}</p>
              <p className="text-[15px] font-semibold text-gray-900">
                {t("rb.robux", { n: fmt(selected.robux) })}
              </p>
            </div>
            <p className="text-[17px] font-semibold text-gray-900">
              {formatCoin(selected.price)}
            </p>
          </div>
        ) : (
          <p className="mb-4 text-center text-[13px] text-gray-500">
            {t("rb.pickFirst")}
          </p>
        )}
        <PillButton onClick={onNext} disabled={!selected} className="h-14">
          {t("rb.next")} <ChevronRight size={17} />
        </PillButton>
      </Panel>
    </div>
  );
}

// =============== BƯỚC 2: TÀI KHOẢN NHẬN ===============
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
        <div className="flex items-start gap-2.5 rounded-[20px] border border-red-200 bg-red-50 p-4">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-600" />
          <p className="text-[14px] text-red-700">{error}</p>
        </div>
      )}

      {/* Tài khoản Roblox */}
      <Panel className="p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <IconBox icon={User} />
          <div>
            <h2 className="text-[20px] font-semibold leading-tight tracking-[-0.035em] text-gray-900">
              {t("rb.accTitle")}
            </h2>
            <p className="text-[13px] text-gray-500">{t("rb.accSub")}</p>
          </div>
        </div>

        <Caption>{t("rb.username")}</Caption>
        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <TextField
              icon={User}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (robloxUser) setRobloxUser(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && checkUser()}
              placeholder={t("rb.usernamePh")}
              autoComplete="off"
              autoCapitalize="none"
            />
          </div>
          <button
            type="button"
            onClick={checkUser}
            disabled={checking || !username.trim()}
            className="flex h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-gray-900 px-5 text-[14px] text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
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
          className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-gray-900 underline underline-offset-4 transition hover:text-gray-600"
        >
          <Info size={13} /> {t("rb.guide")}
        </button>

        {robloxUser && (
          <div className="mt-4 flex items-center gap-3 rounded-[16px] border border-gray-200 bg-gray-50 p-3">
            {robloxUser.avatar ? (
              <img
                src={robloxUser.avatar}
                alt=""
                className="h-12 w-12 rounded-[12px] object-cover"
              />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-gray-200 text-gray-600">
                <User size={20} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[13px] text-gray-900">
                <CheckCircle2 size={14} /> {t("rb.verified")}
              </p>
              <p className="truncate text-[15px] font-semibold text-gray-900">
                {robloxUser.displayName || robloxUser.username}
              </p>
              <p className="truncate text-[12px] text-gray-500">
                @{robloxUser.username} · ID: {robloxUser.id}
              </p>
            </div>
          </div>
        )}
      </Panel>

      {/* Cách nhận code (chỉ Card Robux) */}
      {isCard && (
        <Panel className="p-5 shadow-sm">
          <div className="mb-5 flex items-start gap-3">
            <IconBox icon={Mail} />
            <div className="min-w-0 flex-1">
              <h2 className="text-[20px] font-semibold leading-tight tracking-[-0.035em] text-gray-900">
                {t("rb.recvTitle")}
              </h2>
              <p className="mt-0.5 text-[13px] text-gray-500">
                {t("rb.recvSub")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
                  className={`flex flex-col items-center gap-2 rounded-[20px] border bg-white p-4 transition ${
                    on
                      ? "border-gray-900 shadow-md ring-1 ring-gray-900"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      on ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  <span
                    className={`text-[14px] ${
                      on ? "text-gray-900" : "text-gray-600"
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
              <Caption>
                {receiveMethod === "zalo" ? t("rb.zaloLabel") : t("rb.emailLabel")}
              </Caption>
              <TextField
                icon={receiveMethod === "zalo" ? Phone : Mail}
                type={receiveMethod === "zalo" ? "tel" : "email"}
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder={
                  receiveMethod === "zalo" ? t("rb.zaloPh") : t("rb.emailPh")
                }
              />
              <p className="mt-2 text-[12px] text-gray-500">
                {receiveMethod === "zalo" ? t("rb.zaloHint") : t("rb.emailHint")}
              </p>
            </div>
          )}

          <div className="mt-4 flex items-start gap-2.5 rounded-[16px] border border-gray-200 bg-gray-50 p-3.5">
            <AlertTriangle size={15} className="mt-0.5 shrink-0 text-gray-900" />
            <p className="text-[13px] leading-5 text-gray-600">
              {t("rb.recvWarn")}
            </p>
          </div>
        </Panel>
      )}

      {/* Tóm tắt + điều khoản + tạo đơn */}
      <Panel className="p-5 shadow-sm">
        <p className="text-[13px] uppercase tracking-[0.05em] text-gray-400">
          {t("rb.summary")}
        </p>
        {pkg && (
          <div className="mt-3 flex items-center gap-3">
            <img
              src={pkg.image}
              alt=""
              className="h-12 w-12 rounded-[14px] bg-gray-100 object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-gray-900">
                {t("rb.robux", { n: fmt(pkg.robux) })}
              </p>
              <p className="text-[13px] text-gray-500">{pkg.method}</p>
            </div>
            <div className="text-right">
              <p className="text-[17px] font-semibold text-gray-900">
                {formatCoin(pkg.price)}
              </p>
              <button
                type="button"
                onClick={onBack}
                className="text-[13px] text-gray-900 underline underline-offset-4 hover:text-gray-600"
              >
                {t("rb.edit")}
              </button>
            </div>
          </div>
        )}

        <div className="mt-5">
          <TermsPanel>
            <TermsCheckbox
              checked={agreed}
              onChange={setAgreed}
              accentColor="gray"
            />
          </TermsPanel>
        </div>

        {missing.length > 0 && (
          <p className="mt-1 text-[13px] text-gray-500">
            {t("rb.missPrefix")} {missing.join(" · ")}
          </p>
        )}

        <div className="mt-5 grid grid-cols-[auto_1fr] gap-3">
          <GhostButton onClick={onBack} disabled={creating} className="px-6">
            {t("rb.back")}
          </GhostButton>
          <PillButton
            onClick={onCreate}
            disabled={missing.length > 0 || creating}
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
          </PillButton>
        </div>
        <p className="mt-3 text-center text-[12px] text-gray-400">
          {t("rb.hintAfter")}
        </p>
      </Panel>

      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
    </div>
  );
}
