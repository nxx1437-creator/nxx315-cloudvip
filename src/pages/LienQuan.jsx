import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Copy,
  CreditCard,
  Loader2,
  Search,
  ShieldCheck,
  User,
  Wallet,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Sparkles,
  Zap,
  Crown,
  TrendingUp,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient.js";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";

const LIENQUAN_BANNER_URL =
  "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/lienquan-banner.png";

const LIENQUAN_LOGO =
  "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/lienquan.png";

const PACKAGES = [
  { id: "lq-5", amount: 6000, quanhuy: 10, originalPrice: 6000, discount: 0, image: "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/quanhuy.png" },
  { id: "lq-10", amount: 11000, quanhuy: 20, originalPrice: 12000, discount: 8, image: "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/quanhuy.png" },
  { id: "lq-20", amount: 21000, quanhuy: 40, originalPrice: 24000, discount: 13, image: "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/quanhuy.png" },
  { id: "lq-50", amount: 51000, quanhuy: 102, originalPrice: 60000, discount: 15, image: "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/quanhuy.png" },
  { id: "lq-100", amount: 100500, quanhuy: 204, originalPrice: 120000, discount: 16, image: "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/quanhuy.png" },
  { id: "lq-200", amount: 200500, quanhuy: 408, originalPrice: 240000, discount: 16, image: "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/quanhuy.png" },
  { id: "lq-500", amount: 500500, quanhuy: 1020, originalPrice: 600000, discount: 17, image: "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/quanhuy.png" },
  { id: "lq-1000", amount: 1000500, quanhuy: 2090, originalPrice: 1200000, discount: 17, image: "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/quanhuy.png" },
  { id: "lq-2000", amount: 2000500, quanhuy: 4180, originalPrice: 2400000, discount: 17, image: "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/quanhuy.png" },
];

const BANK = {
  name: "MB Bank",
  account: "0939339622",
  holder: "NGUYEN VAN CO",
};

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN").format(value) + "đ";

function copyText(text) {
  navigator.clipboard?.writeText(text);
}
export default function LienQuan() {
  const navigate = useNavigate();

  const [step, setStep] = useState("package");
  const [selectedPackage, setSelectedPackage] = useState(null);

  const [uid, setUid] = useState("");
  const [player, setPlayer] = useState(null);
  const [playerError, setPlayerError] = useState("");

  const [order, setOrder] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const checkPlayer = () => {
    const cleanUid = String(uid || "").trim();
    setPlayerError("");
    setPlayer(null);

    if (!cleanUid) {
      setPlayerError("Vui lòng nhập ID người chơi.");
      return;
    }
    if (!/^\d+$/.test(cleanUid)) {
      setPlayerError("ID người chơi chỉ được chứa số.");
      return;
    }
    if (cleanUid.length < 8 || cleanUid.length > 15) {
      setPlayerError("ID người chơi không hợp lệ (phải từ 8-15 chữ số).");
      return;
    }

    setPlayer({ userId: cleanUid });
  };

  const createOrder = async () => {
    if (!selectedPackage) {
      setPlayerError("Vui lòng chọn mệnh giá nạp.");
      setStep("package");
      return;
    }
    if (!player) {
      setPlayerError("Vui lòng xác nhận ID người chơi trước.");
      return;
    }

    setCreatingOrder(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        alert("Bạn chưa đăng nhập.");
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "create-lienquan-order",
        {
          body: {
            uid: Number(player.userId),
            amount: Number(selectedPackage.amount),
            quanhuy: Number(selectedPackage.quanhuy),
            package_id: selectedPackage.id,
          },
        }
      );

      if (error) throw new Error(error.message || "Không thể tạo đơn hàng.");
      if (!data?.order) throw new Error("Không nhận được đơn hàng.");

      setOrder(data.order);
      setStep("payment");
    } catch (error) {
      console.error("Create Liên Quân order:", error);
      alert(error?.message || "Không thể tạo đơn. Hãy thử lại sau.");
    } finally {
      setCreatingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b14] pb-24 text-white">
      <TopHeader />

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute top-1/3 right-0 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <main className="relative mx-auto w-full max-w-4xl px-4 py-5 sm:py-6">
        {/* Hero Banner */}
        <HeroBanner onBack={() => navigate("/store")} />

        {/* Stepper */}
        <div className="mt-5 mb-5 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-5 backdrop-blur-xl">
          <Stepper step={step} />
        </div>

        {step === "package" && (
          <PackageSection
            selectedPackage={selectedPackage}
            onSelect={setSelectedPackage}
            onContinue={() => setStep("username")}
          />
        )}

        {step === "username" && (
          <UsernameSection
            uid={uid}
            setUid={setUid}
            player={player}
            playerError={playerError}
            setPlayerError={setPlayerError}
            onCheck={checkPlayer}
            onBack={() => setStep("package")}
            onContinue={createOrder}
            creatingOrder={creatingOrder}
            selectedPackage={selectedPackage}
          />
        )}

        {step === "payment" && (
          <PaymentSection
            order={order}
            onBack={() => setStep("username")}
            onPaid={(updatedOrder) => setOrder(updatedOrder)}
          />
        )}
      </main>

      <BottomNav />
    </div>
  );
}
function HeroBanner({ onBack }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-amber-500/10 via-[#0f1420] to-blue-500/10">
      {/* Banner image */}
      <div className="relative h-48 overflow-hidden sm:h-64">
        <img
          src={LIENQUAN_BANNER_URL}
          alt="Liên Quân Mobile"
          className="h-full w-full object-cover opacity-80"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b14] via-[#080b14]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080b14]/80 via-transparent to-transparent" />

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Live badge */}
        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1.5 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[11px] font-bold text-emerald-300">
            ĐANG HOẠT ĐỘNG
          </span>
        </div>
      </div>

      {/* Info block */}
      <div className="relative -mt-12 px-5 pb-5 sm:-mt-16">
        <div className="flex items-end gap-4">
          {/* Logo */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 blur-xl opacity-60" />
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-2 border-amber-400/50 bg-[#0f1420] shadow-2xl sm:h-24 sm:w-24">
              <img
                src={LIENQUAN_LOGO}
                alt="Liên Quân"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement.innerHTML =
                    '<div class="flex h-full w-full items-center justify-center text-3xl">⚔️</div>';
                }}
              />
            </div>
          </div>

          {/* Title */}
          <div className="min-w-0 flex-1 pb-2">
            <div className="flex items-center gap-2">
              <Crown size={14} className="text-amber-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                Premium Store
              </span>
            </div>
            <h1 className="mt-1 bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-xl font-black tracking-tight text-transparent sm:text-2xl">
              Liên Quân Mobile
            </h1>
            <p className="mt-0.5 text-xs text-gray-400 sm:text-sm">
              Nạp Quân Huy · Tự động 24/7 · An toàn
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <StatPill icon={Zap} label="Tức thì" />
          <StatPill icon={ShieldCheck} label="Bảo mật" />
          <StatPill icon={TrendingUp} label="Giảm 17%" />
        </div>
      </div>
    </div>
  );
}

function StatPill({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 backdrop-blur-sm">
      <Icon size={14} className="text-amber-400" />
      <span className="text-[11px] font-semibold text-gray-300">{label}</span>
    </div>
  );
}

function Stepper({ step }) {
  const steps = [
    { key: "package", label: "Chọn gói" },
    { key: "username", label: "Nhập ID" },
    { key: "payment", label: "Thanh toán" },
  ];
  const order = ["package", "username", "payment"];
  const currentIdx = order.indexOf(step);

  return (
    <div className="flex items-center">
      {steps.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <React.Fragment key={s.key}>
            <div className="flex items-center gap-2.5">
              <div
                className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black transition ${
                  done || active
                    ? "bg-gradient-to-br from-amber-400 to-orange-600 text-black shadow-lg shadow-amber-500/30"
                    : "border border-white/10 bg-white/5 text-gray-500"
                }`}
              >
                {done ? <CheckCircle2 size={15} strokeWidth={2.5} /> : i + 1}
              </div>
              <span
                className={`hidden text-sm font-bold sm:inline ${
                  active ? "text-white" : done ? "text-amber-400" : "text-gray-500"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-3 h-0.5 flex-1 rounded-full transition ${
                  i < currentIdx
                    ? "bg-gradient-to-r from-amber-400 to-orange-500"
                    : "bg-white/5"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
                 }
function PackageSection({ selectedPackage, onSelect, onContinue }) {
  return (
    <div className="space-y-4">
      {/* Alert */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-amber-500/20 blur-2xl" />
        <div className="relative flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20">
            <AlertTriangle size={16} className="text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-300">
              Kiểm tra kỹ ID trước khi nạp
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-100/60">
              Quân Huy sẽ nạp vào ID đã xác nhận. Sai ID không hoàn tiền.
            </p>
          </div>
        </div>
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-black shadow-lg shadow-amber-500/20">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="text-base font-black text-white">Chọn mệnh giá</h2>
            <p className="text-[11px] text-gray-500">
              {PACKAGES.length} gói khả dụng
            </p>
          </div>
        </div>
        <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
          SALE
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        {PACKAGES.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            active={selectedPackage?.id === pkg.id}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* Continue button */}
      <div className="sticky bottom-24 z-10 pt-2">
        <button
          onClick={onContinue}
          disabled={!selectedPackage}
          className="group relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 to-orange-600 text-sm font-black text-black shadow-2xl shadow-amber-500/30 transition hover:shadow-amber-500/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <span className="relative">Tiếp tục</span>
          <ChevronRight size={18} className="relative" />
        </button>
        {!selectedPackage && (
          <p className="mt-2 text-center text-xs text-gray-500">
            Chọn một gói để tiếp tục
          </p>
        )}
      </div>
    </div>
  );
}

function PackageCard({ pkg, active, onSelect }) {
  return (
    <button
      onClick={() => onSelect(pkg)}
      className={`group relative overflow-hidden rounded-2xl border p-3 text-left transition-all duration-200 ${
        active
          ? "border-amber-400 bg-gradient-to-br from-amber-500/20 to-orange-500/10 shadow-lg shadow-amber-500/20"
          : "border-white/5 bg-white/[0.03] hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"
      }`}
    >
      {/* Active glow */}
      {active && (
        <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-amber-400/30 blur-2xl" />
      )}

      {/* Check icon */}
      {active && (
        <div className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-black shadow-md">
          <CheckCircle2 size={12} strokeWidth={3} />
        </div>
      )}

      {/* Discount badge */}
      {pkg.discount > 0 && (
        <div className="absolute left-0 top-0 z-10 rounded-br-xl rounded-tl-2xl bg-gradient-to-r from-rose-500 to-red-600 px-2 py-1 text-[10px] font-black text-white shadow-md">
          -{pkg.discount}%
        </div>
      )}

      {/* Image */}
      <div className="relative mx-auto mb-2.5 aspect-square w-full max-w-[100px] overflow-hidden rounded-xl border border-white/10">
        <img
          src={pkg.image}
          alt={`${pkg.quanhuy} QH`}
          className="h-full w-full object-cover transition group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = LIENQUAN_LOGO;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Info */}
      <div className="relative text-center">
        <p className="text-xs font-medium text-gray-400">Nhận được</p>
        <p className="mt-0.5 text-lg font-black leading-none text-white">
          {pkg.quanhuy.toLocaleString("vi-VN")}
        </p>
        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
          Quân Huy
        </p>

        <div className="mt-2 border-t border-white/5 pt-2">
          <p className="text-sm font-black text-amber-400">
            {formatPrice(pkg.amount)}
          </p>
          {pkg.originalPrice > pkg.amount && (
            <p className="mt-0.5 text-[10px] text-gray-500 line-through">
              {formatPrice(pkg.originalPrice)}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
function UsernameSection({
  uid,
  setUid,
  player,
  playerError,
  setPlayerError,
  onCheck,
  onBack,
  onContinue,
  creatingOrder,
  selectedPackage,
}) {
  const [showGuide, setShowGuide] = useState(false);

  const GUIDE_IMAGES = [
    {
      step: 1,
      url: "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/lienquan-guide-1.png",
      title: "Mở game Liên Quân Mobile",
    },
    {
      step: 2,
      url: "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/lienquan-guide-2.png",
      title: "Vào Hồ sơ cá nhân",
    },
    {
      step: 3,
      url: "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/lienquan-guide-3.png",
      title: "Copy ID người chơi",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Selected package summary */}
      {selectedPackage && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-4">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10">
              <img
                src={selectedPackage.image}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => (e.currentTarget.src = LIENQUAN_LOGO)}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Gói đã chọn
              </p>
              <p className="mt-0.5 text-base font-black text-white">
                {selectedPackage.quanhuy.toLocaleString("vi-VN")} Quân Huy
              </p>
            </div>
            <p className="shrink-0 text-base font-black text-amber-400">
              {formatPrice(selectedPackage.amount)}
            </p>
          </div>
        </div>
      )}

      {/* Main card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5 backdrop-blur-xl sm:p-6">
        <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative">
          {/* Header */}
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
              <User size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                Tài khoản Liên Quân
              </h2>
              <p className="text-xs text-gray-400">
                Nhập ID người chơi để nhận Quân Huy
              </p>
            </div>
          </div>

          {/* Label */}
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-amber-400">
            ID người chơi
          </label>

          {/* Input */}
          <div className="flex gap-2">
            <input
              value={uid}
              onChange={(e) => {
                setUid(e.target.value);
                setPlayerError?.("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") onCheck();
              }}
              inputMode="numeric"
              placeholder="Ví dụ: 123456789"
              className="h-12 min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 text-sm font-medium text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/20"
            />
            <button
              onClick={onCheck}
              className="flex h-12 shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-600 px-4 text-sm font-black text-black shadow-lg shadow-amber-500/30 transition hover:brightness-110"
            >
              <Search size={18} />
              <span className="hidden sm:inline">Xác nhận</span>
            </button>
          </div>

          {/* Guide button */}
          <button
            onClick={() => setShowGuide(true)}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 transition hover:text-amber-300"
          >
            <Info size={13} />
            Hướng dẫn lấy ID Liên Quân
          </button>

          {/* Error */}
          {playerError && !player && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5">
              <XCircle size={16} className="mt-0.5 shrink-0 text-rose-400" />
              <p className="text-xs font-semibold text-rose-300">
                {playerError}
              </p>
            </div>
          )}

          {/* Success */}
          {player && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
                <CheckCircle2 size={22} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-emerald-300">
                  Đã xác nhận ID
                </p>
                <p className="mt-0.5 font-mono text-xs text-emerald-400/80">
                  {player.userId}
                </p>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="mt-5 flex gap-2.5 rounded-xl border border-blue-400/20 bg-blue-500/5 p-3.5">
            <ShieldCheck
              size={16}
              className="mt-0.5 shrink-0 text-blue-400"
            />
            <p className="text-[11px] leading-5 text-blue-200/70">
              Kiểm tra kỹ ID. Quân Huy nạp theo ID đã xác nhận — sai ID không
              hoàn tiền.
            </p>
          </div>

          {/* Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={onBack}
              className="h-12 rounded-xl border border-white/10 bg-white/5 text-sm font-bold text-gray-300 transition hover:bg-white/10"
            >
              Quay lại
            </button>
            <button
              onClick={onContinue}
              disabled={creatingOrder}
              className="group flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-600 text-sm font-black text-black shadow-lg shadow-amber-500/30 transition hover:brightness-110 disabled:opacity-40"
            >
              {creatingOrder ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  Tạo đơn
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && <GuideModal onClose={() => setShowGuide(false)} steps={GUIDE_IMAGES} />}
    </div>
  );
}

function GuideModal({ onClose, steps }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md sm:items-center sm:p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#0f1420] shadow-2xl sm:rounded-3xl">
        {/* Header */}
        <div className="relative border-b border-white/5 p-5">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-amber-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  Hướng dẫn
                </span>
              </div>
              <h3 className="mt-1 text-base font-black text-white">
                Lấy ID Liên Quân
              </h3>
              <p className="mt-0.5 text-xs text-gray-500">
                Làm theo 3 bước đơn giản
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/5"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {steps.map((item) => (
            <div key={item.step}>
              <div className="mb-2 flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-[11px] font-black text-black shadow-md shadow-amber-500/30">
                  {item.step}
                </span>
                <p className="text-sm font-bold text-white">{item.title}</p>
              </div>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full object-contain"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 p-5">
          <button
            onClick={onClose}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-600 text-sm font-black text-black shadow-lg shadow-amber-500/30 transition hover:brightness-110"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
      }
function PaymentSection({ order, onBack, onPaid }) {
  const navigate = useNavigate();
  const [method, setMethod] = useState("coin");
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [cards, setCards] = useState([
    { id: Date.now(), type: "Viettel", amount: "", serial: "", code: "" },
  ]);
  const [cardResult, setCardResult] = useState(null);
  const [cardChecking, setCardChecking] = useState(false);
  const cardResultRef = useRef(null);

  useEffect(() => {
    if (cardResult?.status === "success") {
      requestAnimationFrame(() => {
        cardResultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }
  }, [cardResult?.status]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoadingProfile(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("coins")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Load coins error:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  if (!order) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-xl">
        <XCircle className="mx-auto mb-3 text-rose-400" size={42} />
        <h2 className="text-base font-black text-white">
          Không tìm thấy đơn hàng
        </h2>
        <button
          onClick={onBack}
          className="mt-5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-600 px-5 py-3 text-sm font-black text-black"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const transferContent = `NAP LIENQUAN ${order.order_code} ${order.uid} ${order.quanhuy}QH`;
  const coinBalance = Number(profile?.coins || 0);
  const requiredCoins = Number(order.amount || 0);
  const enoughCoins = coinBalance >= requiredCoins;

  const cardDiscounts = {
    Viettel: 24,
    Mobifone: 21,
    Vinaphone: 21,
    Garena: 17.5,
    Zing: 15.5,
  };

  const cardDenominations = {
    Viettel: [
      { value: 10000, received: 7600 },
      { value: 20000, received: 15800 },
      { value: 30000, received: 23700 },
      { value: 50000, received: 42500 },
      { value: 100000, received: 85000 },
      { value: 200000, received: 168000 },
      { value: 300000, received: 252000 },
      { value: 500000, received: 405000 },
      { value: 1000000, received: 810000 },
    ],
    Mobifone: [
      { value: 10000, received: 7900 },
      { value: 20000, received: 15800 },
      { value: 30000, received: 23700 },
      { value: 50000, received: 39500 },
      { value: 100000, received: 80000 },
      { value: 200000, received: 162000 },
      { value: 300000, received: 243000 },
      { value: 500000, received: 405000 },
    ],
    Vinaphone: [
      { value: 10000, received: 7900 },
      { value: 20000, received: 16600 },
      { value: 30000, received: 24900 },
      { value: 50000, received: 43000 },
      { value: 100000, received: 87000 },
      { value: 200000, received: 174000 },
      { value: 300000, received: 261000 },
      { value: 500000, received: 435000 },
    ],
    Garena: [
      { value: 10000, received: 8250 },
      { value: 20000, received: 16500 },
      { value: 50000, received: 41250 },
      { value: 100000, received: 82500 },
      { value: 200000, received: 165000 },
      { value: 500000, received: 412500 },
      { value: 1000000, received: 825000 },
    ],
    Zing: [
      { value: 10000, received: 8450 },
      { value: 20000, received: 16600 },
      { value: 50000, received: 42250 },
      { value: 100000, received: 84500 },
      { value: 200000, received: 169000 },
      { value: 500000, received: 422500 },
      { value: 1000000, received: 845000 },
    ],
  };

  const cardTypes = Object.keys(cardDiscounts);

  const addCard = () => {
    setCards((c) => [
      ...c,
      { id: Date.now(), type: "Viettel", amount: "", serial: "", code: "" },
    ]);
  };

  const removeCard = (id) => {
    setCards((c) => (c.length === 1 ? c : c.filter((card) => card.id !== id)));
  };

  const updateCard = (id, field, value) => {
    setCards((c) =>
      c.map((card) => (card.id === id ? { ...card, [field]: value } : card))
    );
  };

  const handleCoinPayment = async () => {
    if (!order?.id) return alert("Không tìm thấy đơn hàng.");
    if (order.status !== "pending")
      return alert("Đơn hàng này không còn ở trạng thái chờ thanh toán.");

    if (!requiredCoins || requiredCoins <= 0)
      return alert("Số Coin thanh toán không hợp lệ.");
    if (!profile)
      return alert("Không thể tải số dư Coin. Vui lòng thử lại.");

    if (coinBalance < requiredCoins) {
      return alert(
        `Không đủ Coin.\n\nCần: ${requiredCoins.toLocaleString(
          "vi-VN"
        )} Coin\nBạn có: ${coinBalance.toLocaleString("vi-VN")} Coin`
      );
    }

    setProcessing(true);
    try {
      const { data: paymentResult, error: paymentError } = await supabase.rpc(
        "pay_lienquan_order_with_coins",
        {
          p_order_id: order.id,
        }
      );

      if (paymentError) {
        const m = paymentError.message || "";
        if (m.includes("INSUFFICIENT_COINS"))
          throw new Error("Không đủ Coin để thanh toán.");
        if (m.includes("ORDER_NOT_FOUND"))
          throw new Error("Không tìm thấy đơn hàng.");
        if (m.includes("NOT_YOUR_ORDER"))
          throw new Error("Bạn không có quyền thanh toán đơn hàng này.");
        if (m.includes("ORDER_NOT_PENDING"))
          throw new Error("Đơn hàng này đã được thanh toán hoặc xử lý.");
        throw new Error("Thanh toán bằng Coin thất bại.\n\n" + m);
      }

      const updatedOrder = { ...order, status: "paid", payment_method: "coin" };
      onPaid?.(updatedOrder);

      alert(
        `🎉 Thanh toán thành công!\n\n` +
          `Mã đơn: ${order.order_code}\n` +
          `Quân Huy: ${Number(order.quanhuy).toLocaleString("vi-VN")} QH\n` +
          `Đã trừ: ${requiredCoins.toLocaleString("vi-VN")} Coin\n` +
          `Coin còn lại: ${Number(
            paymentResult?.remaining_coins ?? coinBalance - requiredCoins
          ).toLocaleString("vi-VN")} Coin`
      );

      navigate(`/history/order/${order.id}`);
    } catch (error) {
      alert(
        error?.message || "Không thể thanh toán bằng Coin. Vui lòng thử lại."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmTransfer = async () => {
    if (!order?.id || order.status !== "pending") return;

    const ok = window.confirm(
      "Bạn đã chuyển đúng số tiền và đúng nội dung chuyển khoản chưa?"
    );
    if (!ok) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "paid", payment_method: "bank" })
        .eq("id", order.id)
        .eq("status", "pending");

      if (error) throw error;

      onPaid?.({ ...order, status: "paid", payment_method: "bank" });
      navigate(`/history/order/${order.id}`);
    } catch (error) {
      alert(
        "Không thể xác nhận đơn hàng.\n\n" +
          (error?.message || "Vui lòng thử lại.")
      );
    } finally {
      setProcessing(false);
    }
  };

  const checkCardTransactions = async (requestIds) => {
    const ids = requestIds.filter(Boolean);
    if (!ids.length) throw new Error("API không trả về mã giao dịch.");

    setCardChecking(true);
    try {
      for (let attempt = 0; attempt < 40; attempt++) {
        const results = [];

        for (const requestId of ids) {
          const { data, error } = await supabase.functions.invoke(
            "apidoithe-webhook",
            {
              body: { transaction_id: requestId },
            }
          );

          if (error)
            throw new Error(
              error.message || "Không thể kiểm tra trạng thái thẻ."
            );

          results.push({
            requestId,
            status: String(data?.status || "").toLowerCase(),
            netAmount: Number(data?.net_amount || 0),
            reason:
              data?.reason || data?.message || "Giao dịch không thành công.",
            order_id: data?.order_id || null,
            order_code: data?.order_code || null,
          });
        }

        if (results.some((item) => item.status === "failed")) {
          return { status: "failed", results };
        }
        if (results.length && results.every((item) => item.status === "success")) {
          return { status: "success", results };
        }

        await new Promise((r) => setTimeout(r, 2500));
      }
      return { status: "processing", results: [] };
    } finally {
      setCardChecking(false);
    }
  };

  const handleCardPayment = async () => {
    for (const card of cards) {
      if (!card.type || !card.amount || !card.serial || !card.code) {
        return alert("Vui lòng nhập đầy đủ thông tin tất cả thẻ.");
      }
    }
    if (cards.some((card) => Number(card.amount) <= 0))
      return alert("Mệnh giá thẻ không hợp lệ.");

    const ok = window.confirm(
      "Bạn đã kiểm tra kỹ loại thẻ và mệnh giá chưa?\n\nĐiền sai mệnh giá có thể khiến thẻ bị mất."
    );
    if (!ok) return;

    setProcessing(true);
    setCardResult(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token)
        throw new Error("Phiên đăng nhập đã hết hạn.");

      const requestIds = [];
      for (const card of cards) {
        const { data, error } = await supabase.functions.invoke(
          "submit-card",
          {
            body: {
              telco: card.type,
              denomination: Number(card.amount),
              serial: card.serial.trim(),
              code: card.code.trim(),
            },
          }
        );

        if (error)
          throw new Error(error.message || "Không thể gửi thẻ lên hệ thống.");
        if (!data?.success || !data?.request_id) {
          throw new Error(
            data?.message || data?.error || "API không trả về mã giao dịch."
          );
        }
        requestIds.push(String(data.request_id));
      }

      const result = await checkCardTransactions(requestIds);

      if (result.status === "success") {
        const totalNetAmount = result.results.reduce(
          (sum, item) => sum + Number(item.netAmount || 0),
          0
        );
        const firstOrderId = result.results[0]?.order_id;

        setCardResult({
          status: "success",
          totalNetAmount,
          results: result.results,
          requestIds,
          cards: cards.map((c) => ({ type: c.type, amount: Number(c.amount) })),
        });
        await loadProfile();
        setCards([
          { id: Date.now(), type: "Viettel", amount: "", serial: "", code: "" },
        ]);

        if (firstOrderId) {
          setTimeout(() => {
            navigate(`/nap-thanh-cong/${firstOrderId}`, {
              state: { coinsAdded: totalNetAmount },
            });
          }, 1500);
        }
        return;
      }

      if (result.status === "failed") {
        const failed = result.results.find(
          (item) => item.status === "failed"
        );
        setCardResult({
          status: "failed",
          reason:
            failed?.reason || "Thẻ không hợp lệ hoặc giao dịch bị từ chối.",
          requestIds,
          results: result.results,
        });
        return;
      }

      setCardResult({
        status: "processing",
        requestIds,
        results: result.results,
      });
    } catch (error) {
      setCardResult({
        status: "error",
        message:
          error?.message || "Không thể xử lý thẻ. Vui lòng thử lại sau.",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg shadow-amber-500/30">
          <CreditCard size={20} className="text-black" />
        </div>
        <div>
          <h2 className="text-base font-black text-white">Thanh toán</h2>
          <p className="text-xs text-gray-500">Chọn phương thức phù hợp</p>
        </div>
      </div>

      {/* Order summary */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
        {/* Amount header */}
        <div className="relative overflow-hidden border-b border-white/5 p-5">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="relative">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
              Tổng thanh toán
            </p>
            <p className="mt-1 text-3xl font-black text-white">
              {formatPrice(order.amount)}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] font-bold text-gray-300 backdrop-blur-sm">
              Mã đơn: <span className="font-mono text-amber-400">{order.order_code}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          {/* Method tabs */}
          <div className="grid grid-cols-3 gap-1 rounded-2xl border border-white/5 bg-black/20 p-1">
            {[
              { key: "coin", label: "Coin", icon: "🪙" },
              { key: "bank", label: "Chuyển khoản", icon: "🏦" },
              { key: "card", label: "Thẻ cào", icon: "🎫" },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => setMethod(m.key)}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition ${
                  method === m.key
                    ? "bg-gradient-to-r from-amber-400 to-orange-600 text-black shadow-lg shadow-amber-500/20"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{m.icon}</span>
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            ))}
          </div>

          {/* ============ COIN ============ */}
          {method === "coin" && (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/20 text-lg">
                      🪙
                    </div>
                    <span className="text-xs font-bold text-amber-300">
                      Số dư Coin
                    </span>
                  </div>
                  <span className="text-lg font-black text-white">
                    {loadingProfile
                      ? "..."
                      : coinBalance.toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 rounded-2xl border border-white/5 bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Cần thanh toán</span>
                  <span className="text-sm font-black text-white">
                    {requiredCoins.toLocaleString("vi-VN")} Coin
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-2.5">
                  <span className="text-xs text-gray-400">Sau thanh toán</span>
                  <span
                    className={`text-sm font-black ${
                      enoughCoins ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {Math.max(coinBalance - requiredCoins, 0).toLocaleString(
                      "vi-VN"
                    )}{" "}
                    Coin
                  </span>
                </div>
              </div>

              <button
                onClick={handleCoinPayment}
                disabled={processing || loadingProfile || !enoughCoins}
                className="group relative h-12 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 to-orange-600 text-sm font-black text-black shadow-lg shadow-amber-500/30 transition hover:shadow-amber-500/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">
                  {processing
                    ? "Đang xử lý..."
                    : enoughCoins
                    ? `Thanh toán ${requiredCoins.toLocaleString("vi-VN")} Coin`
                    : "Không đủ Coin"}
                </span>
              </button>
            </div>
          )}

          {/* ============ BANK ============ */}
          {method === "bank" && (
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-black text-white">
                    Thông tin ngân hàng
                  </h3>
                  <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold text-blue-300">
                    {BANK.name}
                  </span>
                </div>
                <div className="space-y-2.5">
                  <BankRow label="Số tài khoản" value={BANK.account} copy />
                  <BankRow label="Chủ tài khoản" value={BANK.holder} />
                  <BankRow
                    label="Số tiền"
                    value={formatPrice(order.amount)}
                    copyValue={String(order.amount)}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-amber-400/30 bg-amber-500/5 p-4">
                <p className="text-xs font-black text-amber-300">
                  Nội dung chuyển khoản
                </p>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-amber-400/20 bg-black/30 p-2.5">
                  <code className="min-w-0 flex-1 break-all font-mono text-xs font-bold text-amber-200">
                    {transferContent}
                  </code>
                  <button
                    onClick={() => copyText(transferContent)}
                    className="shrink-0 rounded-lg bg-amber-400/20 p-2 text-amber-300 transition hover:bg-amber-400/30"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>

                 {order.status === "paid" ? (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
                  <CheckCircle2 size={22} className="text-emerald-400" />
                  <div>
                    <p className="text-sm font-black text-emerald-300">
                      Đã gửi xác nhận
                    </p>
                    <p className="mt-0.5 text-xs text-emerald-400/70">
                      Đơn đang chờ admin kiểm tra.
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleConfirmTransfer}
                  disabled={processing}
                  className="group relative h-12 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 to-orange-600 text-sm font-black text-black shadow-lg shadow-amber-500/30 transition hover:shadow-amber-500/50 disabled:opacity-50"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative">
                    {processing ? "Đang xác nhận..." : "Xác nhận đã chuyển khoản"}
                  </span>
                </button>
              )}
            </div>
          )}

          {/* ============ CARD ============ */}
          {method === "card" && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-black text-white">Thẻ cào</h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  Chọn loại thẻ và nhập thông tin
                </p>
              </div>

              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                {cardTypes.map((type) => (
                  <div
                    key={type}
                    className="rounded-xl border border-white/5 bg-black/20 p-2 text-center"
                  >
                    <p className="text-[10px] font-bold text-gray-400">
                      {type}
                    </p>
                    <p className="mt-0.5 text-xs font-black text-amber-400">
                      {cardDiscounts[type]}%
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2.5 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3.5">
                <AlertTriangle
                  size={16}
                  className="mt-0.5 shrink-0 text-rose-400"
                />
                <p className="text-xs font-bold text-rose-300">
                  Điền sai mệnh giá sẽ bị mất thẻ!
                </p>
              </div>

              {cards.map((card, index) => (
                <div
                  key={card.id}
                  className="rounded-2xl border border-white/5 bg-black/20 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 text-[11px] font-black text-black">
                        {index + 1}
                      </span>
                      <p className="text-sm font-black text-white">
                        Thẻ #{index + 1}
                      </p>
                    </div>
                    {cards.length > 1 && (
                      <button
                        onClick={() => removeCard(card.id)}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-400 transition hover:bg-rose-500/10"
                      >
                        Xóa
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-amber-400">
                        Loại thẻ
                      </label>
                      <select
                        value={card.type}
                        onChange={(e) => {
                          updateCard(card.id, "type", e.target.value);
                          updateCard(card.id, "amount", "");
                        }}
                        className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm font-semibold text-white outline-none focus:border-amber-400"
                      >
                        {cardTypes.map((t) => (
                          <option key={t} value={t} className="bg-[#0f1420]">
                            {t} — CK {cardDiscounts[t]}%
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-amber-400">
                        Mệnh giá
                      </label>
                      <select
                        value={card.amount}
                        onChange={(e) =>
                          updateCard(card.id, "amount", e.target.value)
                        }
                        className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm font-semibold text-white outline-none focus:border-amber-400"
                      >
                        <option value="" className="bg-[#0f1420]">
                          Chọn mệnh giá
                        </option>
                        {(cardDenominations[card.type] || []).map((item) => (
                          <option
                            key={item.value}
                            value={item.value}
                            className="bg-[#0f1420]"
                          >
                            {item.value.toLocaleString("vi-VN")}đ →{" "}
                            {item.received.toLocaleString("vi-VN")}đ
                          </option>
                        ))}
                      </select>
                      {card.amount &&
                        (() => {
                          const sel = (
                            cardDenominations[card.type] || []
                          ).find(
                            (item) =>
                              Number(item.value) === Number(card.amount)
                          );
                          if (!sel) return null;
                          return (
                            <div className="mt-2 flex items-center justify-between rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2">
                              <span className="text-xs font-semibold text-emerald-400">
                                Coin nhận
                              </span>
                              <span className="text-xs font-black text-emerald-300">
                                +{sel.received.toLocaleString("vi-VN")}
                              </span>
                            </div>
                          );
                        })()}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-amber-400">
                          Số seri
                        </label>
                        <input
                          value={card.serial}
                          onChange={(e) =>
                            updateCard(card.id, "serial", e.target.value)
                          }
                          placeholder="Nhập seri"
                          className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-amber-400">
                          Mã thẻ
                        </label>
                        <input
                          value={card.code}
                          onChange={(e) =>
                            updateCard(card.id, "code", e.target.value)
                          }
                          placeholder="Nhập mã"
                          className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addCard}
                className="h-11 w-full rounded-2xl border-2 border-dashed border-amber-400/30 text-sm font-black text-amber-400 transition hover:border-amber-400/60 hover:bg-amber-500/5"
              >
                + Thêm thẻ
              </button>

              <button
                onClick={handleCardPayment}
                disabled={processing || cardChecking}
                className="group relative h-12 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 to-orange-600 text-sm font-black text-black shadow-lg shadow-amber-500/30 transition hover:shadow-amber-500/50 disabled:opacity-50"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">
                  {processing || cardChecking ? "Đang xử lý..." : "Nạp tiền"}
                </span>
              </button>

              {cardResult && (
                <div ref={cardResultRef} className="scroll-mt-24 space-y-3">
                  {cardResult.status === "success" && (
                    <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
                          <CheckCircle2 size={20} className="text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-emerald-300">
                            Nạp thẻ thành công!
                          </p>
                          <p className="mt-0.5 text-xs text-emerald-400/70">
                            APIĐổiThẻ đã xác nhận và Coin đã được cộng.
                          </p>
                          <div className="mt-3 flex items-center justify-between rounded-xl bg-black/30 p-3">
                            <span className="text-xs text-gray-400">
                              Coin nhận được
                            </span>
                            <span className="text-lg font-black text-emerald-400">
                              +
                              {Number(
                                cardResult.totalNetAmount || 0
                              ).toLocaleString("vi-VN")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {cardResult.status === "failed" && (
                    <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 shadow-lg shadow-rose-500/30">
                          <XCircle size={20} className="text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-rose-300">
                            Thanh toán không thành công
                          </p>
                          <p className="mt-1 text-xs font-semibold text-rose-400/80">
                            {cardResult.reason ||
                              "Thẻ không hợp lệ hoặc giao dịch bị từ chối."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {cardResult.status === "processing" && (
                    <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4">
                      <div className="flex items-start gap-3">
                        <Loader2
                          className="mt-0.5 shrink-0 animate-spin text-amber-400"
                          size={20}
                        />
                        <div>
                          <p className="text-sm font-black text-amber-300">
                            Thẻ đang được xử lý
                          </p>
                          <p className="mt-1 text-xs text-amber-400/70">
                            Coin chỉ được cộng khi giao dịch thành công.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {cardResult.status === "error" && (
                    <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4">
                      <div className="flex items-start gap-3">
                        <XCircle
                          className="mt-0.5 shrink-0 text-rose-400"
                          size={20}
                        />
                        <div>
                          <p className="text-sm font-black text-rose-300">
                            Không thể xử lý thẻ
                          </p>
                          <p className="mt-1 text-xs text-rose-400/80">
                            {cardResult.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <button
            onClick={onBack}
            disabled={processing}
            className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 text-sm font-bold text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
                        }
function BankRow({ label, value, copy = false, copyValue }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(copyValue || value);
      alert("Đã sao chép!");
    } catch (error) {
      console.error("Copy error:", error);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <span className="break-all text-right text-sm font-black text-white">
          {value}
        </span>
        {(copy || copyValue) && (
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded-lg p-1.5 text-gray-500 transition hover:bg-white/10 hover:text-amber-400"
            title="Sao chép"
          >
            <Copy size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
