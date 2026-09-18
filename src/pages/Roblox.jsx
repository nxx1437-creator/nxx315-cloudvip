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
} from "lucide-react";

import { supabase } from "../lib/supabaseClient.js";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import TermsCheckbox from "../components/TermsCheckbox.jsx";   

const ROBLOX_BANNER_URL =
  "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/Roblox-banner.png";

const GAME_INFO = {
  name: "Roblox",
  server: "Server 1",
  icon: "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox.png",
};

const PACKAGES = [
  {
    id: "card-400",
    name: "Card Robux",
    robux: 400,
    price: 170000,
    originalPrice: 200000,
    discount: 15,
    image:
      "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-400.png",
    method: "Card Robux",
  },
  {
    id: "vng-40",
    name: "Nạp trực tiếp",
    robux: 40,
    price: 14500,
    originalPrice: 20000,
    discount: 18,
    image:
      "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-40.png",
    method: "VNG",
  },
  {
    id: "vng-80",
    name: "Nạp trực tiếp",
    robux: 80,
    price: 28500,
    originalPrice: 40000,
    discount: 19,
    image:
      "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-80.png",
    method: "VNG",
  },
  {
    id: "vng-500",
    name: "Nạp trực tiếp",
    robux: 500,
    price: 140500,
    originalPrice: 175000,
    discount: 8,
    image:
      "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-500.png",
    method: "VNG",
  },
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
export default function Roblox() {
  const navigate = useNavigate();

  const [step, setStep] = useState("package");
  const [selectedPackage, setSelectedPackage] = useState(null);

  const [username, setUsername] = useState("");
  const [robloxUser, setRobloxUser] = useState(null);
  const [checkingUser, setCheckingUser] = useState(false);

  const [order, setOrder] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);  

  const [agreedTerms, setAgreedTerms] = useState(false);

  const checkRobloxUser = async () => {
    const value = username.trim();
    if (!value) {
      alert("Vui lòng nhập username Roblox.");
      return;
    }

    setCheckingUser(true);
    setRobloxUser(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        return;
      }

      const response = await fetch(
        `/api/roblox-user?username=${encodeURIComponent(value)}`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Không thể kiểm tra tài khoản Roblox.");
      }

      setRobloxUser(data);
    } catch (error) {
      alert(error.message || "Không thể kiểm tra tài khoản Roblox.");
    } finally {
      setCheckingUser(false);
    }
  };

  const createOrder = async () => {
    if (!selectedPackage) {
      alert("Vui lòng chọn gói Robux.");
      return;
    }
    if (!robloxUser) {
      alert("Vui lòng kiểm tra username Roblox trước.");
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

      const response = await fetch(
        "https://rwglwovohbyqmbbzdvdj.supabase.co/functions/v1/create-roblox-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            roblox_user_id: robloxUser.id,
            roblox_username: robloxUser.username,
            roblox_display_name: robloxUser.displayName,
            package_id: selectedPackage.id,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Không thể tạo đơn hàng.");
      }

      setOrder(data.order);
      setStep("payment");
    } catch (error) {
      alert(error.message || "Có lỗi xảy ra khi tạo đơn.");
    } finally {
      setCreatingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 text-gray-900">
      <TopHeader />

      <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:py-6">
        {/* Page header */}
        <div className="mb-5 flex items-center gap-3">
          <button
            onClick={() => navigate("/store")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
              Nạp Robux
            </h1>
            <p className="text-xs text-gray-500 sm:text-sm">
              Xử lý tự động · An toàn · Nhanh chóng
            </p>
          </div>
        </div>

        {/* Banner + game info */}
        <section className="mb-5 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="relative aspect-[16/6] overflow-hidden">
            <img
              src={ROBLOX_BANNER_URL}
              alt="Roblox"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-banner.png";
              }}
            />
          </div>
          <div className="flex items-center gap-3 border-t border-gray-100 p-4">
            <img
              src={GAME_INFO.icon}
              alt=""
              className="h-12 w-12 rounded-lg border border-gray-200 object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900">{GAME_INFO.name}</p>
              <p className="mt-0.5 text-xs text-gray-500">{GAME_INFO.server}</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              Online
            </span>
          </div>
        </section>

        {/* Stepper */}
        <div className="mb-5 rounded-xl border border-gray-200 bg-white px-4 py-5">
          <Stepper step={step} />
        </div>

        {step === "package" && (
  <UsernameAndPackageSection
    username={username}
    setUsername={setUsername}
    robloxUser={robloxUser}
    checkingUser={checkingUser}
    onCheck={checkRobloxUser}
    onContinue={() => setStep("username")}
    selectedPackage={selectedPackage}
    onSelect={setSelectedPackage}
    agreedTerms={agreedTerms}              {/* 👈 THÊM */}
    setAgreedTerms={setAgreedTerms}        {/* 👈 THÊM */}
  />
)}

        {step === "username" && (
          <UsernameSection
            username={username}
            setUsername={setUsername}
            robloxUser={robloxUser}
            checkingUser={checkingUser}
            onCheck={checkRobloxUser}
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
function Stepper({ step }) {
  const steps = [
    { key: "package", label: "Chọn gói" },
    { key: "username", label: "Tài khoản" },
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
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition ${
                  done || active
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? <CheckCircle2 size={15} strokeWidth={2.5} /> : i + 1}
              </div>
              <span
                className={`hidden text-sm font-medium sm:inline ${
                  active || done ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-3 h-px flex-1 transition ${
                  i < currentIdx ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function GuideModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-start justify-between">
          <h3 className="text-base font-semibold">
            Hướng dẫn lấy username Roblox
          </h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-sm leading-6 text-gray-600">
          Cung cấp chính xác{" "}
          <strong className="text-gray-900">Tên tài khoản (@username)</strong>{" "}
          để shop giao hàng đúng tài khoản.
        </p>

        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
          <img
            src="https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-guide.png"
            alt="Hướng dẫn"
            className="w-full object-contain"
          />
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Đã hiểu
        </button>
      </div>
    </div>
  );
}
function UsernameAndPackageSection({
  username,
  setUsername,
  robloxUser,
  checkingUser,
  onCheck,
  onContinue,
  selectedPackage,
  onSelect,
  agreedTerms,       
  setAgreedTerms,     
}) {
  const [showGuide, setShowGuide] = useState(false);

  // Chia gói theo phương thức
  const cardPackages = PACKAGES.filter((p) => p.method === "Card Robux");
  const vngPackages = PACKAGES.filter((p) => p.method === "VNG");

  return (
    <div className="space-y-4">
      {/* Nhập ID */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold">Tài khoản nhận Robux</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Nhập username Roblox để xác nhận chính xác.
          </p>
        </div>

        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Username Roblox
        </label>

        <div className="flex gap-2">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onCheck();
            }}
            placeholder="Ví dụ: Builderman"
            className="h-11 min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <button
            onClick={onCheck}
            disabled={checkingUser || !username.trim()}
            className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checkingUser ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            <span className="hidden sm:inline">
              {checkingUser ? "Đang kiểm tra..." : "Kiểm tra"}
            </span>
          </button>
        </div>

        <button
          onClick={() => setShowGuide(true)}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 transition hover:underline"
        >
          <Info size={13} />
          Hướng dẫn lấy username Roblox
        </button>

        {robloxUser && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            {robloxUser.avatar ? (
              <img
                src={robloxUser.avatar}
                alt=""
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <User size={20} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                <p className="truncate text-sm font-semibold">
                  {robloxUser.displayName || robloxUser.username}
                </p>
              </div>
              <p className="mt-0.5 truncate text-xs text-gray-500">
                @{robloxUser.username} · ID: {robloxUser.id}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ═══════════ NHÓM 1: CARD ROBUX ═══════════ */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <CreditCard size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold">Card Robux</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Thanh toán bằng thẻ cào Robux quốc tế
            </p>
          </div>
          <span className="shrink-0 rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600">
            {cardPackages.length} gói
          </span>
        </div>

        <div className="space-y-2">
          {cardPackages.map((pkg) => (
            <PackageRow
              key={pkg.id}
              pkg={pkg}
              active={selectedPackage?.id === pkg.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      </section>

      {/* ═══════════ NHÓM 2: NẠP ROBUX VIỆT NAM ═══════════ */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Wallet size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold">Nạp Robux Việt Nam</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Nạp trực tiếp qua kênh VNG — nhanh chóng
            </p>
          </div>
          <span className="shrink-0 rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600">
            {vngPackages.length} gói
          </span>
        </div>

        <div className="space-y-2">
          {vngPackages.map((pkg) => (
            <PackageRow
              key={pkg.id}
              pkg={pkg}
              active={selectedPackage?.id === pkg.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      </section>

      {/* ═══════════ Nút Tiếp tục ═══════════ */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <TermsCheckbox                                            {/* 👈 THÊM */}
  checked={agreedTerms}                                    {/* 👈 THÊM */}
  onChange={setAgreedTerms}                                {/* 👈 THÊM */}
  accentColor="blue"                                       {/* 👈 THÊM */}
/>                                                         {/* 👈 THÊM */}

<button
  onClick={onContinue}
  disabled={!selectedPackage || !robloxUser || !agreedTerms}   {/* 👈 SỬA: thêm `|| !agreedTerms` */}
  className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
>
  Tiếp tục
  <ChevronRight size={18} />
</button>
        {!robloxUser && (
          <p className="mt-2 text-center text-xs text-gray-500">
            Vui lòng xác nhận username Roblox trước
          </p>
        )}
        {robloxUser && !selectedPackage && (
          <p className="mt-2 text-center text-xs text-gray-500">
            Vui lòng chọn một gói Robux
          </p>
        )}
      </section>

      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
    </div>
  );
}

function PackageRow({ pkg, active, onSelect }) {
  return (
    <button
      onClick={() => onSelect(pkg)}
      className={`flex w-full items-center gap-3.5 rounded-lg border bg-white p-3 text-left transition ${
        active
          ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-600"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <img
        src={pkg.image}
        alt=""
        className="h-16 w-16 shrink-0 rounded-lg border border-gray-100 object-cover"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">
            {pkg.robux.toLocaleString("vi-VN")} Robux
          </p>
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
            {pkg.method}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-baseline gap-2">
          <span className="text-base font-bold text-blue-600">
            {formatPrice(pkg.price)}
          </span>
          <span className="text-xs text-gray-400 line-through">
            {formatPrice(pkg.originalPrice)}
          </span>
          <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">
            -{pkg.discount}%
          </span>
        </div>
      </div>

      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
          active ? "border-blue-600 bg-blue-600" : "border-gray-300 bg-white"
        }`}
      >
        {active && (
          <CheckCircle2 size={12} className="text-white" strokeWidth={3} />
        )}
      </div>
    </button>
  );
}

function UsernameSection({
  username,
  setUsername,
  robloxUser,
  checkingUser,
  onCheck,
  onBack,
  onContinue,
  creatingOrder,
  selectedPackage,
}) {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="space-y-4">
      {selectedPackage && (
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
          <img
            src={selectedPackage.image}
            alt=""
            className="h-12 w-12 shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500">Gói đã chọn</p>
            <p className="text-sm font-semibold">
              {selectedPackage.robux.toLocaleString("vi-VN")} Robux
            </p>
          </div>
          <p className="text-base font-bold text-blue-600">
            {formatPrice(selectedPackage.price)}
          </p>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <User size={20} />
          </div>
          <div>
            <h2 className="text-base font-semibold">Tài khoản Roblox</h2>
            <p className="text-xs text-gray-500">
              Nhập username cần nhận Robux
            </p>
          </div>
        </div>

        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Username Roblox
        </label>
        <div className="flex gap-2">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onCheck();
            }}
            placeholder="Ví dụ: Builderman"
            className="h-11 min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <button
            onClick={onCheck}
            disabled={checkingUser || !username.trim()}
            className="flex h-11 shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checkingUser ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            <span className="hidden sm:inline">Kiểm tra</span>
          </button>
        </div>

        <button
          onClick={() => setShowGuide(true)}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 transition hover:underline"
        >
          <Info size={13} />
          Hướng dẫn lấy username Roblox
        </button>

        {robloxUser && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            {robloxUser.avatar ? (
              <img
                src={robloxUser.avatar}
                alt=""
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <User size={20} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {robloxUser.displayName || robloxUser.username}
              </p>
              <p className="mt-0.5 truncate text-xs text-gray-500">
                @{robloxUser.username}
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 flex gap-2.5 rounded-lg border border-blue-100 bg-blue-50 p-3">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-blue-600" />
          <p className="text-xs leading-5 text-blue-800">
            Kiểm tra kỹ username. Robux sẽ được xử lý theo tài khoản đã xác
            nhận.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            onClick={onBack}
            className="h-11 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Quay lại
          </button>
          <button
            onClick={onContinue}
            disabled={!robloxUser || creatingOrder}
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
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

      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
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
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <XCircle className="mx-auto mb-3 text-rose-500" size={40} />
        <h2 className="text-base font-semibold">Không tìm thấy đơn hàng</h2>
        <button
          onClick={onBack}
          className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const transferContent = `NAP ROBLOX ${order.order_code} ${order.roblox_username} ${order.robux}ROBUX`;
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
        "pay_roblox_order_with_coins",
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
        ` Thanh toán thành công!\n\n` +
          `Mã đơn: ${order.order_code}\n` +
          `Robux: ${Number(order.robux).toLocaleString("vi-VN")} RB\n` +
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <CreditCard size={20} />
        </div>
        <div>
          <h2 className="text-base font-semibold">Thanh toán</h2>
          <p className="text-xs text-gray-500">Chọn phương thức phù hợp</p>
        </div>
      </div>

      {/* Order summary */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 bg-gray-50 p-4">
          <p className="text-xs text-gray-500">Tổng thanh toán</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {formatPrice(order.amount)}
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
            Mã đơn: <span className="font-mono">{order.order_code}</span>
          </div>
        </div>

        <div className="space-y-4 p-4">
          {/* Method tabs */}
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-gray-100 p-1">
            {[
              { key: "coin", label: "Coin" },
              { key: "bank", label: "Chuyển khoản" },
              { key: "card", label: "Thẻ cào" },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => setMethod(m.key)}
                className={`rounded-md py-2 text-xs font-semibold transition ${
                  method === m.key
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* COIN */}
          {method === "coin" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3.5">
                <span className="text-sm text-gray-600">Số dư Coin</span>
                <span className="text-base font-bold text-gray-900">
                  {loadingProfile
                    ? "..."
                    : `${coinBalance.toLocaleString("vi-VN")} Coin`}
                </span>
              </div>

              <div className="rounded-lg border border-gray-200 p-3.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Cần thanh toán</span>
                  <span className="font-semibold">
                    {requiredCoins.toLocaleString("vi-VN")} Coin
                  </span>
                </div>
                <div className="mt-2 flex justify-between">
                  <span className="text-gray-500">Còn lại</span>
                  <span
                    className={`font-semibold ${
                      enoughCoins ? "text-emerald-600" : "text-rose-500"
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
                className="h-11 w-full rounded-lg bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {processing
                  ? "Đang xử lý..."
                  : enoughCoins
                  ? `Thanh toán ${requiredCoins.toLocaleString("vi-VN")} Coin`
                  : "Không đủ Coin"}
              </button>
            </div>
          )}

          {/* BANK */}
          {method === "bank" && (
            <div className="space-y-3">
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Thông tin ngân hàng</h3>
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                    {BANK.name}
                  </span>
                </div>
                <div className="space-y-2.5">
                  <BankRow
                    label="Số tài khoản"
                    value={BANK.account}
                    copy
                  />
                  <BankRow label="Chủ tài khoản" value={BANK.holder} />
                  <BankRow
                    label="Số tiền"
                    value={formatPrice(order.amount)}
                    copyValue={String(order.amount)}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5">
                <p className="text-xs font-semibold text-amber-900">
                  Nội dung chuyển khoản
                </p>
                <div className="mt-2 flex items-center gap-2 rounded-md border border-amber-200 bg-white p-2.5">
                  <code className="min-w-0 flex-1 break-all text-xs font-semibold text-gray-800">
                    {transferContent}
                  </code>
                  <button
                    onClick={() => copyText(transferContent)}
                    className="shrink-0 rounded-md bg-amber-100 p-1.5 text-amber-700 transition hover:bg-amber-200"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              {order.status === "paid" ? (
                <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5">
                  <CheckCircle2 size={20} className="text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">
                      Đã gửi xác nhận
                    </p>
                    <p className="text-xs text-emerald-700">
                      Đơn đang chờ admin kiểm tra.
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleConfirmTransfer}
                  disabled={processing}
                  className="h-11 w-full rounded-lg bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing ? "Đang xác nhận..." : "Xác nhận đã chuyển khoản"}
                </button>
              )}
            </div>
          )}

          {/* CARD */}
          {method === "card" && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold">Thẻ cào</h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  Chọn loại thẻ và nhập thông tin
                </p>
              </div>

              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
                {cardTypes.map((type) => (
                  <div
                    key={type}
                    className="rounded-md border border-gray-200 bg-gray-50 p-2 text-center"
                  >
                    <p className="text-[10px] font-medium text-gray-600">
                      {type}
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-blue-600">
                      -{cardDiscounts[type]}%
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3">
                <AlertTriangle
                  size={15}
                  className="mt-0.5 shrink-0 text-rose-600"
                />
                <p className="text-xs font-semibold text-rose-700">
                  Điền sai mệnh giá sẽ bị mất thẻ!
                </p>
              </div>

              {cards.map((card, index) => (
                <div
                  key={card.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-3.5"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold">Thẻ #{index + 1}</p>
                    {cards.length > 1 && (
                      <button
                        onClick={() => removeCard(card.id)}
                        className="rounded-md px-2 py-1 text-xs font-semibold text-rose-500 transition hover:bg-rose-50"
                      >
                        Xóa
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        Loại thẻ
                      </label>
                      <select
                        value={card.type}
                        onChange={(e) => {
                          updateCard(card.id, "type", e.target.value);
                          updateCard(card.id, "amount", "");
                        }}
                        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        {cardTypes.map((t) => (
                          <option key={t} value={t}>
                            {t} — {cardDiscounts[t]}%
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        Mệnh giá
                      </label>
                      <select
                        value={card.amount}
                        onChange={(e) =>
                          updateCard(card.id, "amount", e.target.value)
                        }
                        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">Chọn mệnh giá</option>
                        {(cardDenominations[card.type] || []).map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.value.toLocaleString("vi-VN")}đ →{" "}
                            {item.received.toLocaleString("vi-VN")}đ
                          </option>
                        ))}
                      </select>
                      {card.amount &&
                        (() => {
                          const sel = (cardDenominations[card.type] || []).find(
                            (item) =>
                              Number(item.value) === Number(card.amount)
                          );
                          if (!sel) return null;
                          return (
                            <div className="mt-2 flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
                              <span className="text-xs font-medium text-emerald-700">
                                Coin nhận
                              </span>
                              <span className="text-xs font-bold text-emerald-700">
                                +{sel.received.toLocaleString("vi-VN")}
                              </span>
                            </div>
                          );
                        })()}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                          Số seri
                        </label>
                        <input
                          value={card.serial}
                          onChange={(e) =>
                            updateCard(card.id, "serial", e.target.value)
                          }
                          placeholder="Nhập seri"
                          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                          Mã thẻ
                        </label>
                        <input
                          value={card.code}
                          onChange={(e) =>
                            updateCard(card.id, "code", e.target.value)
                          }
                          placeholder="Nhập mã"
                          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addCard}
                className="h-11 w-full rounded-lg border-2 border-dashed border-gray-300 text-sm font-semibold text-gray-600 transition hover:border-blue-400 hover:text-blue-600"
              >
                + Thêm thẻ
              </button>

              <button
                onClick={handleCardPayment}
                disabled={processing || cardChecking}
                className="h-11 w-full rounded-lg bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {processing || cardChecking ? "Đang xử lý..." : "Nạp tiền"}
              </button>

              {cardResult && (
                <div ref={cardResultRef} className="scroll-mt-24 space-y-3">
                  {cardResult.status === "success" && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                          <CheckCircle2 size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-emerald-900">
                            Nạp thẻ thành công!
                          </p>
                          <p className="mt-0.5 text-xs text-emerald-700">
                            Coin đã được cộng vào tài khoản.
                          </p>
                          <div className="mt-3 flex items-center justify-between rounded-md bg-white p-3 ring-1 ring-emerald-100">
                            <span className="text-xs text-gray-500">
                              Coin nhận được
                            </span>
                            <span className="text-base font-bold text-emerald-600">
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
                    <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white">
                          <XCircle size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-rose-900">
                            Thanh toán không thành công
                          </p>
                          <p className="mt-1 text-xs font-medium text-rose-700">
                            {cardResult.reason ||
                              "Thẻ không hợp lệ hoặc giao dịch bị từ chối."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {cardResult.status === "processing" && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-start gap-3">
                        <Loader2
                          className="mt-0.5 shrink-0 animate-spin text-amber-600"
                          size={18}
                        />
                        <div>
                          <p className="text-sm font-semibold text-amber-900">
                            Thẻ đang được xử lý
                          </p>
                          <p className="mt-1 text-xs text-amber-700">
                            Coin chỉ được cộng khi giao dịch thành công.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {cardResult.status === "error" && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
                      <div className="flex items-start gap-3">
                        <XCircle
                          className="mt-0.5 shrink-0 text-rose-600"
                          size={18}
                        />
                        <div>
                          <p className="text-sm font-semibold text-rose-900">
                            Không thể xử lý thẻ
                          </p>
                          <p className="mt-1 text-xs text-rose-700">
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
            className="h-11 w-full rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
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
    <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-2.5 last:border-0 last:pb-0">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <span className="break-all text-right text-sm font-semibold text-gray-900">
          {value}
        </span>
        {(copy || copyValue) && (
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-blue-600"
            title="Sao chép"
          >
            <Copy size={14} />
          </button>
        )}
      </div>
    </div>
  );
      }                  
