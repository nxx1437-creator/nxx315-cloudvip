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
} from "lucide-react";

import { supabase } from "../lib/supabaseClient.js";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";

const PACKAGES = [
  {
    id: "card-400",
    name: "Card Robux",
    robux: 400,
    price: 170000,
    originalPrice: 200000,
    discount: 15,
    image: "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-400.png",
    method: "Card Robux",
  },
  {
    id: "vng-40",
    name: "Nạp trực tiếp",
    robux: 40,
    price: 14500,
    originalPrice: 20000,
    discount: 18,
    image: "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-40.png",
    method: "VNG",
  },
  {
    id: "vng-80",
    name: "Nạp trực tiếp",
    robux: 80,
    price: 28500,
    originalPrice: 40000,
    discount: 19,
    image: "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-80.png",
    method: "VNG",
  },
  {
    id: "vng-500",
    name: "Nạp trực tiếp",
    robux: 500,
    price: 140500,
    originalPrice: 175000,
    discount: 8,
    image: "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-500.png",
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

  const checkRobloxUser = async () => {
    const value = username.trim();
    if (!value) {
      alert("Vui lòng nhập username Roblox.");
      return;
    }

    setCheckingUser(true);
    setRobloxUser(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
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
      const { data: { session } } = await supabase.auth.getSession();
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
    <div className="min-h-screen bg-[#F5F7FB] pb-24 text-slate-900">
      <TopHeader />

      <main className="mx-auto w-full max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate("/store")}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              Nạp Robux Roblox
            </h1>
            <p className="text-xs text-slate-500">
              Chọn gói và nhập username
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="mb-6 flex items-center gap-2">
          <StepDot active={step === "package"} number={1} label="Chọn gói" />
          <div className={`h-px flex-1 ${step !== "package" ? "bg-sky-500" : "bg-slate-200"}`} />
          <StepDot active={step === "username"} number={2} label="Nhập username" />
          <div className={`h-px flex-1 ${step === "payment" ? "bg-sky-500" : "bg-slate-200"}`} />
          <StepDot active={step === "payment"} number={3} label="Thanh toán" />
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

function StepDot({ active, number, label }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition ${
          active
            ? "bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/30"
            : "bg-white text-slate-400 ring-1 ring-slate-200"
        }`}
      >
        {number}
      </div>
      <span
        className={`hidden text-xs font-semibold sm:block ${
          active ? "text-slate-900" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
            }
function PackageSection({ selectedPackage, onSelect, onContinue }) {
  const vngPackages = PACKAGES.filter((pkg) => pkg.method === "VNG");
  const cardPackages = PACKAGES.filter((pkg) => pkg.method === "Card Robux");

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-black text-amber-900">
            Thông báo quan trọng
          </p>
          <p className="mt-1 text-xs leading-5 text-amber-800">
            Bạn vui lòng kiểm tra kỹ tên tài khoản Roblox trước khi mua hàng.
            NXX315 Studio Rewards chưa hỗ trợ hoàn tiền với trường hợp nhập sai thông tin tài khoản Roblox.
          </p>
        </div>
      </div>

      {/* Nạp trực tiếp (VNG) */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-sm">
            <Wallet size={16} />
          </span>
          <h2 className="text-base font-black text-slate-900">
            Nạp trực tiếp (VNG)
          </h2>
        </div>

        <div className="space-y-3">
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

      {/* Card Robux */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-sm">
            <CreditCard size={16} />
          </span>
          <h2 className="text-base font-black text-slate-900">Card Robux</h2>
        </div>

        <div className="space-y-3">
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

      {/* Continue */}
      <button
        onClick={onContinue}
        disabled={!selectedPackage}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40"
      >
        Tiếp tục
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function PackageRow({ pkg, active, onSelect }) {
  return (
    <button
      onClick={() => onSelect(pkg)}
      className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border-2 bg-white p-3.5 text-left transition ${
        active
          ? "border-sky-500 bg-sky-50/30 shadow-lg shadow-sky-500/10"
          : "border-slate-200 hover:border-sky-200 hover:bg-slate-50"
      }`}
    >
      {/* Ảnh */}
      <div className="relative shrink-0">
        <img
          src={pkg.image}
          alt={`${pkg.robux} Robux`}
          className="h-20 w-20 rounded-xl object-cover"
        />
        {active && (
          <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-white shadow-md">
            <CheckCircle2 size={14} strokeWidth={3} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-base font-black text-slate-900">
          {pkg.robux.toLocaleString("vi-VN")} Robux{" "}
          <span className="text-xs font-medium text-slate-500">
            {pkg.method === "VNG" ? "Việt Nam" : "Quốc Tế"}
          </span>
        </p>

        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-base font-black text-sky-600">
            {formatPrice(pkg.price)}
          </span>
          <span className="text-xs text-slate-400 line-through">
            {formatPrice(pkg.originalPrice)}
          </span>
        </div>
      </div>

      {/* Discount badge */}
      <div className="shrink-0 flex flex-col items-end gap-1.5">
        <span className="rounded-md bg-sky-500 px-2 py-1 text-[10px] font-black text-white">
          -{pkg.discount}%
        </span>
        <span className="text-[10px] font-medium text-slate-400">
          Còn hàng
        </span>
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
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Order info */}
      {selectedPackage && (
        <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={selectedPackage.image}
                alt={selectedPackage.robux}
                className="h-12 w-12 rounded-lg object-cover"
              />
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Gói đã chọn
                </p>
                <p className="text-sm font-black text-slate-900">
                  {selectedPackage.robux.toLocaleString("vi-VN")} Robux
                </p>
              </div>
            </div>
            <p className="text-base font-black text-sky-600">
              {formatPrice(selectedPackage.price)}
            </p>
          </div>
        </div>
      )}

      {/* Main card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-sm">
            <User size={20} />
          </span>
          <div>
            <h2 className="text-base font-black text-slate-900">
              Tài khoản Roblox
            </h2>
            <p className="text-xs text-slate-500">
              Nhập username Roblox cần nhận Robux
            </p>
          </div>
        </div>

        {/* Input */}
        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
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
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />

          <button
            onClick={onCheck}
            disabled={checkingUser || !username.trim()}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-sky-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checkingUser ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Search size={18} />
            )}
            <span className="hidden sm:inline">
              {checkingUser ? "Đang kiểm tra..." : "Kiểm tra"}
            </span>
          </button>
        </div>

        {/* Result */}
        {robloxUser && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
            {robloxUser.avatar ? (
              <img
                src={robloxUser.avatar}
                alt={robloxUser.username}
                className="h-14 w-14 rounded-xl object-cover ring-2 ring-white"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <User size={24} />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                <p className="truncate text-sm font-black text-slate-900">
                  {robloxUser.displayName || robloxUser.username}
                </p>
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                @{robloxUser.username}
              </p>
            </div>
          </div>
        )}

        {/* Info box */}
        <div className="mt-5 flex gap-3 rounded-xl border border-sky-100 bg-sky-50/50 p-3.5">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-sky-600" />
          <div>
            <p className="text-xs font-bold text-sky-900">
              Kiểm tra chính xác trước khi thanh toán
            </p>
            <p className="mt-1 text-[11px] leading-5 text-sky-700">
              Hãy kiểm tra kỹ username Roblox. Robux sẽ được xử lý theo tài khoản đã xác nhận.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Quay lại
          </button>

          <button
            onClick={onContinue}
            disabled={!robloxUser || creatingOrder}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 py-3.5 text-sm font-bold text-white shadow-md shadow-sky-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {creatingOrder ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang tạo đơn...
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
        cardResultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, [cardResult?.status]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoadingProfile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
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
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <XCircle className="mx-auto mb-3 text-rose-500" size={42} />
        <h2 className="text-base font-black text-slate-900">Không tìm thấy đơn hàng</h2>
        <button
          onClick={onBack}
          className="mt-5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 px-5 py-3 text-sm font-bold text-white"
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

  const cardDiscounts = { Viettel: 19, Mobifone: 19.5, Vinaphone: 19.5, Garena: 14.5, Zing: 14 };
  const cardDenominations = {
    Viettel: [
      { value: 10000, received: 8100 }, { value: 20000, received: 16200 },
      { value: 30000, received: 24300 }, { value: 50000, received: 40500 },
      { value: 100000, received: 81000 }, { value: 200000, received: 162000 },
      { value: 300000, received: 243000 }, { value: 500000, received: 405000 },
      { value: 1000000, received: 810000 },
    ],
    Mobifone: [
      { value: 10000, received: 8050 }, { value: 20000, received: 16100 },
      { value: 30000, received: 24150 }, { value: 50000, received: 40250 },
      { value: 100000, received: 80500 }, { value: 200000, received: 161000 },
      { value: 300000, received: 241500 }, { value: 500000, received: 402500 },
    ],
    Vinaphone: [
      { value: 10000, received: 8000 }, { value: 20000, received: 16000 },
      { value: 30000, received: 24000 }, { value: 50000, received: 40000 },
      { value: 100000, received: 80000 }, { value: 200000, received: 160000 },
      { value: 300000, received: 240000 }, { value: 500000, received: 400000 },
    ],
    Garena: [
      { value: 20000, received: 17100 }, { value: 50000, received: 42750 },
      { value: 100000, received: 85500 }, { value: 200000, received: 171000 },
      { value: 500000, received: 427500 },
    ],
    Zing: [
      { value: 10000, received: 8700 }, { value: 20000, received: 17400 },
      { value: 30000, received: 26100 }, { value: 50000, received: 43500 },
      { value: 100000, received: 87000 }, { value: 200000, received: 174000 },
      { value: 300000, received: 261000 }, { value: 500000, received: 435000 },
      { value: 1000000, received: 870000 },
    ],
  };
  const cardTypes = Object.keys(cardDiscounts);

  const addCard = () => {
    setCards((c) => [...c, { id: Date.now(), type: "Viettel", amount: "", serial: "", code: "" }]);
  };

  const removeCard = (id) => {
    setCards((c) => (c.length === 1 ? c : c.filter((card) => card.id !== id)));
  };

  const updateCard = (id, field, value) => {
    setCards((c) => c.map((card) => (card.id === id ? { ...card, [field]: value } : card)));
  };

  const handleCoinPayment = async () => {
    if (!order?.id) return alert("Không tìm thấy đơn hàng.");
    if (order.status !== "pending") return alert("Đơn hàng này không còn ở trạng thái chờ thanh toán.");

    if (!requiredCoins || requiredCoins <= 0) return alert("Số Coin thanh toán không hợp lệ.");
    if (!profile) return alert("Không thể tải số dư Coin. Vui lòng thử lại.");

    if (coinBalance < requiredCoins) {
      return alert(`Không đủ Coin.\n\nCần: ${requiredCoins.toLocaleString("vi-VN")} Coin\nBạn có: ${coinBalance.toLocaleString("vi-VN")} Coin`);
    }

    setProcessing(true);
    try {
      const { data: paymentResult, error: paymentError } = await supabase.rpc("pay_roblox_order_with_coins", {
        p_order_id: order.id,
      });

      if (paymentError) {
        const m = paymentError.message || "";
        if (m.includes("INSUFFICIENT_COINS")) throw new Error("Không đủ Coin để thanh toán.");
        if (m.includes("ORDER_NOT_FOUND")) throw new Error("Không tìm thấy đơn hàng.");
        if (m.includes("NOT_YOUR_ORDER")) throw new Error("Bạn không có quyền thanh toán đơn hàng này.");
        if (m.includes("ORDER_NOT_PENDING")) throw new Error("Đơn hàng này đã được thanh toán hoặc xử lý.");
        throw new Error("Thanh toán bằng Coin thất bại.\n\n" + m);
      }

      const updatedOrder = { ...order, status: "paid", payment_method: "coin" };
      onPaid?.(updatedOrder);

      alert(
        `🎉 Thanh toán thành công!\n\n` +
        `Mã đơn: ${order.order_code}\n` +
        `Robux: ${Number(order.robux).toLocaleString("vi-VN")} RB\n` +
        `Đã trừ: ${requiredCoins.toLocaleString("vi-VN")} Coin\n` +
        `Coin còn lại: ${Number(paymentResult?.remaining_coins ?? coinBalance - requiredCoins).toLocaleString("vi-VN")} Coin`
      );

      navigate(`/history/order/${order.id}`);
    } catch (error) {
      alert(error?.message || "Không thể thanh toán bằng Coin. Vui lòng thử lại.");
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmTransfer = async () => {
    if (!order?.id || order.status !== "pending") return;

    const ok = window.confirm("Bạn đã chuyển đúng số tiền và đúng nội dung chuyển khoản chưa?");
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
      alert("Không thể xác nhận đơn hàng.\n\n" + (error?.message || "Vui lòng thử lại."));
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
          const { data, error } = await supabase.functions.invoke("apidoithe-webhook", {
            body: { transaction_id: requestId },
          });

          if (error) throw new Error(error.message || "Không thể kiểm tra trạng thái thẻ.");

          results.push({
            requestId,
            status: String(data?.status || "").toLowerCase(),
            netAmount: Number(data?.net_amount || 0),
            reason: data?.reason || data?.message || "Giao dịch không thành công.",
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
    if (cards.some((card) => Number(card.amount) <= 0)) return alert("Mệnh giá thẻ không hợp lệ.");

    const ok = window.confirm(
      "Bạn đã kiểm tra kỹ loại thẻ và mệnh giá chưa?\n\nĐiền sai mệnh giá có thể khiến thẻ bị mất."
    );
    if (!ok) return;

    setProcessing(true);
    setCardResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Phiên đăng nhập đã hết hạn.");

      const requestIds = [];
      for (const card of cards) {
        const { data, error } = await supabase.functions.invoke("submit-card", {
          body: {
            telco: card.type,
            denomination: Number(card.amount),
            serial: card.serial.trim(),
            code: card.code.trim(),
          },
        });

        if (error) throw new Error(error.message || "Không thể gửi thẻ lên hệ thống.");
        if (!data?.success || !data?.request_id) {
          throw new Error(data?.message || data?.error || "API không trả về mã giao dịch.");
        }
        requestIds.push(String(data.request_id));
      }

      const result = await checkCardTransactions(requestIds);

      if (result.status === "success") {
        const totalNetAmount = result.results.reduce((sum, item) => sum + Number(item.netAmount || 0), 0);
        setCardResult({
          status: "success",
          totalNetAmount,
          results: result.results,
          requestIds,
          cards: cards.map((c) => ({ type: c.type, amount: Number(c.amount) })),
        });
        await loadProfile();
        setCards([{ id: Date.now(), type: "Viettel", amount: "", serial: "", code: "" }]);
        return;
      }

      if (result.status === "failed") {
        const failed = result.results.find((item) => item.status === "failed");
        setCardResult({
          status: "failed",
          reason: failed?.reason || "Thẻ không hợp lệ hoặc giao dịch bị từ chối.",
          requestIds,
          results: result.results,
        });
        return;
      }

      setCardResult({ status: "processing", requestIds, results: result.results });
    } catch (error) {
      setCardResult({
        status: "error",
        message: error?.message || "Không thể xử lý thẻ. Vui lòng thử lại sau.",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-sm">
          <CreditCard size={20} />
        </span>
        <div>
          <h2 className="text-base font-black text-slate-900">Thanh toán</h2>
          <p className="text-xs text-slate-500">Chọn phương thức thanh toán</p>
        </div>
      </div>

      {/* Order summary */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-sky-400 to-blue-600 p-5 text-white">
          <p className="text-xs font-medium text-sky-100">Tổng thanh toán</p>
          <p className="mt-1 text-2xl font-black">{formatPrice(order.amount)}</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
            Mã đơn: {order.order_code}
          </div>
        </div>

        <div className="space-y-4 p-5">
          {/* Method tabs */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "coin", label: "🪙 Coin" },
              { key: "bank", label: "🏦 Chuyển khoản" },
              { key: "card", label: "🎫 Thẻ cào" },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => setMethod(m.key)}
                className={`rounded-xl border px-3 py-3 text-xs font-black transition ${
                  method === m.key
                    ? "border-sky-500 bg-sky-50 text-sky-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Coin */}
          {method === "coin" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-sky-800">Số dư Coin</span>
                  <span className="text-lg font-black text-sky-700">
                    {loadingProfile ? "..." : `${coinBalance.toLocaleString("vi-VN")} Coin`}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Cần thanh toán</span>
                  <span className="text-sm font-black text-slate-900">
                    {requiredCoins.toLocaleString("vi-VN")} Coin
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Sau thanh toán</span>
                  <span className={`text-sm font-black ${enoughCoins ? "text-emerald-600" : "text-rose-500"}`}>
                    {Math.max(coinBalance - requiredCoins, 0).toLocaleString("vi-VN")} Coin
                  </span>
                </div>
              </div>

              <button
                onClick={handleCoinPayment}
                disabled={processing || loadingProfile || !enoughCoins}
                className="w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 py-4 text-sm font-black text-white shadow-md shadow-sky-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {processing ? "Đang xử lý..." : enoughCoins ? `Thanh toán ${requiredCoins.toLocaleString("vi-VN")} Coin` : "Không đủ Coin"}
              </button>
            </div>
          )}

          {/* Bank */}
          {method === "bank" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900">Thông tin ngân hàng</h3>
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-[10px] font-bold text-sky-700">
                    MB Bank
                  </span>
                </div>
                <div className="space-y-3">
                  <BankRow label="Ngân hàng" value={BANK.name} />
                  <BankRow label="Số tài khoản" value={BANK.account} copy />
                  <BankRow label="Chủ tài khoản" value={BANK.holder} />
                  <BankRow label="Số tiền" value={formatPrice(order.amount)} copyValue={String(order.amount)} />
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-black text-amber-900">Nội dung chuyển khoản</p>
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-white p-2.5">
                  <code className="min-w-0 flex-1 break-all text-xs font-bold text-slate-800">
                    {transferContent}
                  </code>
                  <button
                    onClick={() => copyText(transferContent)}
                    className="shrink-0 rounded-lg bg-amber-100 p-2 text-amber-700"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                <p className="mt-2 text-[11px] leading-5 text-amber-800">
                  Vui lòng ghi chính xác nội dung chuyển khoản.
                </p>
              </div>

              {order.status === "paid" ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={22} className="text-emerald-600" />
                    <div>
                      <p className="text-sm font-black text-emerald-900">Đã gửi xác nhận</p>
                      <p className="mt-0.5 text-xs text-emerald-700">Đơn đang chờ admin kiểm tra.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleConfirmTransfer}
                  disabled={processing}
                  className="w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 py-4 text-sm font-black text-white shadow-md shadow-sky-500/30 transition hover:brightness-110 disabled:opacity-50"
                >
                  {processing ? "Đang xác nhận..." : "✓ Tôi đã chuyển khoản"}
                </button>
              )}
            </div>
          )}

          {/* Card */}
          {method === "card" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Thẻ cào</h3>
                <p className="mt-1 text-xs text-slate-500">Chọn loại thẻ và nhập thông tin thẻ</p>
              </div>

              {/* Discounts */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {cardTypes.map((type) => (
                  <div key={type} className="rounded-lg bg-slate-50 p-2.5 text-center">
                    <p className="text-[10px] font-bold text-slate-600">{type}</p>
                    <p className="mt-0.5 text-xs font-black text-sky-600">{cardDiscounts[type]}%</p>
                  </div>
                ))}
              </div>

              {/* Warning */}
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-rose-600" />
                  <p className="text-xs font-black text-rose-700">
                    Quý khách điền sai Mệnh Giá sẽ bị mất thẻ!
                  </p>
                </div>
              </div>

                  {/* Cards */}
              {cards.map((card, index) => (
                <div key={card.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-black text-slate-900">Thẻ #{index + 1}</p>
                    {cards.length > 1 && (
                      <button
                        onClick={() => removeCard(card.id)}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-50"
                      >
                        Xóa
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700">Loại thẻ *</label>
                      <select
                        value={card.type}
                        onChange={(e) => {
                          updateCard(card.id, "type", e.target.value);
                          updateCard(card.id, "amount", "");
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-sky-500"
                      >
                        {cardTypes.map((t) => (
                          <option key={t} value={t}>
                            {t} — Chiết khấu {cardDiscounts[t]}%
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700">Mệnh giá *</label>
                      <select
                        value={card.amount}
                        onChange={(e) => updateCard(card.id, "amount", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-sky-500"
                      >
                        <option value="">Chọn mệnh giá</option>
                        {(cardDenominations[card.type] || []).map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.value.toLocaleString("vi-VN")}đ
                          </option>
                        ))}
                      </select>
                      {card.amount && (() => {
                        const sel = (cardDenominations[card.type] || []).find(
                          (item) => Number(item.value) === Number(card.amount)
                        );
                        if (!sel) return null;
                        return (
                          <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-emerald-700">Coin nhận được</span>
                              <span className="text-xs font-black text-emerald-700">
                                +{sel.received.toLocaleString("vi-VN")} Coin
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700">Số Seri Thẻ *</label>
                      <input
                        value={card.serial}
                        onChange={(e) => updateCard(card.id, "serial", e.target.value)}
                        placeholder="Nhập số seri"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700">Mã Thẻ *</label>
                      <input
                        value={card.code}
                        onChange={(e) => updateCard(card.id, "code", e.target.value)}
                        placeholder="Nhập mã thẻ"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addCard}
                className="w-full rounded-xl border-2 border-dashed border-sky-200 bg-sky-50 py-3 text-sm font-black text-sky-600 transition hover:bg-sky-100"
              >
                + Thêm thẻ
              </button>

              <button
                onClick={handleCardPayment}
                disabled={processing}
                className="w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 py-4 text-sm font-black text-white shadow-md shadow-sky-500/30 transition hover:brightness-110 disabled:opacity-50"
              >
                {processing ? "Đang xử lý..." : "Nạp tiền"}
              </button>

              {/* Results */}
              {cardResult && (
                <div ref={cardResultRef} className="scroll-mt-24 space-y-3">
                  {cardResult.status === "success" && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                          <CheckCircle2 size={22} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-emerald-900">Nạp thẻ thành công!</p>
                          <p className="mt-0.5 text-xs text-emerald-700">APIĐổiThẻ đã xác nhận và Coin đã được cộng.</p>
                          <div className="mt-3 rounded-lg bg-white p-3 ring-1 ring-emerald-100">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">Coin nhận được</span>
                              <span className="text-lg font-black text-emerald-600">
                                +{Number(cardResult.totalNetAmount || 0).toLocaleString("vi-VN")} Coin
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {cardResult.status === "failed" && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white">
                          <XCircle size={22} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-rose-900">Thanh toán không thành công</p>
                          <p className="mt-1 text-xs font-semibold text-rose-700">
                            {cardResult.reason || "Thẻ không hợp lệ hoặc giao dịch bị từ chối."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {cardResult.status === "processing" && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-start gap-3">
                        <Loader2 className="mt-0.5 shrink-0 animate-spin text-amber-600" size={20} />
                        <div>
                          <p className="text-sm font-black text-amber-900">Thẻ đang được xử lý</p>
                          <p className="mt-1 text-xs text-amber-700">
                            APIĐổiThẻ chưa trả kết quả cuối. Coin chỉ được cộng khi giao dịch thành công.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {cardResult.status === "error" && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                      <div className="flex items-start gap-3">
                        <XCircle className="mt-0.5 shrink-0 text-rose-600" size={20} />
                        <div>
                          <p className="text-sm font-black text-rose-900">Không thể xử lý thẻ</p>
                          <p className="mt-1 text-xs text-rose-700">{cardResult.message}</p>
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
            className="w-full rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
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
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <span className="break-all text-right text-sm font-black text-slate-900">{value}</span>
        {(copy || copyValue) && (
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-sky-600"
            title="Sao chép"
          >
            <Copy size={14} />
          </button>
        )}
      </div>
    </div>
  );
                        }
