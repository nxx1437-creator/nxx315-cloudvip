import React, { useState } from "react";
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
    image:
      "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-400.png",
    method: "Card Robux",
  },
  {
    id: "vng-40",
    name: "Nạp trực tiếp",
    robux: 40,
    price: 14500,
    image:
      "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-40.png",
    method: "VNG",
  },
  {
    id: "vng-80",
    name: "Nạp trực tiếp",
    robux: 80,
    price: 28500,
    image:
      "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-80.png",
    method: "VNG",
  },
  {
    id: "vng-500",
    name: "Nạp trực tiếp",
    robux: 500,
    price: 140500,
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

  const checkRobloxUser = async () => {
    const value = username.trim();

    if (!value) {
      alert("Vui lòng nhập username Roblox.");
      return;
    }

    setCheckingUser(true);
    setRobloxUser(null);

    try {
      const response = await fetch(
        `/api/roblox-user?username=${encodeURIComponent(value)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Không tìm thấy tài khoản Roblox.");
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

  const goToUsername = () => {
    setStep("username");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <TopHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <button
          onClick={() => navigate("/store")}
          className="mb-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
          Quay lại cửa hàng
        </button>

        <div className="mb-7">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
            <Wallet size={17} />
            Roblox
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Nạp Robux
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Chọn gói Robux và nhập username Roblox để tiếp tục.
          </p>
        </div>

        {step === "package" && (
          <PackageSection
            selectedPackage={selectedPackage}
            onSelect={setSelectedPackage}
            onContinue={goToUsername}
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
function PackageSection({
  selectedPackage,
  onSelect,
  onContinue,
}) {
  const cardPackages = PACKAGES.filter(
    (pkg) => pkg.method === "Card Robux"
  );

  const vngPackages = PACKAGES.filter(
    (pkg) => pkg.method === "VNG"
  );

  return (
    <div className="space-y-8">
      <PackageGroup
        title="Card Robux"
        icon={<CreditCard size={20} />}
        packages={cardPackages}
        selectedPackage={selectedPackage}
        onSelect={onSelect}
      />

      <PackageGroup
        title="Nạp trực tiếp (VNG)"
        icon={<Wallet size={20} />}
        packages={vngPackages}
        selectedPackage={selectedPackage}
        onSelect={onSelect}
      />

      <button
        onClick={onContinue}
        disabled={!selectedPackage}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Tiếp tục
        <ChevronRight size={19} />
      </button>
    </div>
  );
}

function PackageGroup({
  title,
  icon,
  packages,
  selectedPackage,
  onSelect,
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          {icon}
        </div>

        <h2 className="text-xl font-black text-slate-900">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => {
          const active = selectedPackage?.id === pkg.id;

          return (
            <button
              key={pkg.id}
              onClick={() => onSelect(pkg)}
              className={`relative overflow-hidden rounded-2xl bg-white p-4 text-left shadow-sm ring-1 transition ${
                active
                  ? "ring-2 ring-blue-600 shadow-lg shadow-blue-600/10"
                  : "ring-slate-200 hover:-translate-y-0.5 hover:ring-blue-300"
              }`}
            >
              {active && (
                <div className="absolute right-3 top-3 rounded-full bg-blue-600 p-1 text-white">
                  <CheckCircle2 size={17} />
                </div>
              )}

              <div className="flex items-center gap-4">
                <img
                  src={pkg.image}
                  alt={`${pkg.robux} Robux`}
                  className="h-20 w-20 rounded-2xl object-contain"
                />

                <div className="min-w-0">
                  <p className="text-lg font-black text-slate-900">
                    {pkg.robux.toLocaleString("vi-VN")} Robux
                  </p>

                  <p className="mt-1 text-sm font-bold text-blue-600">
                    {formatPrice(pkg.price)}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {pkg.method}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
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
    <div className="mx-auto max-w-2xl">
      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <User size={21} />
          </div>

          <div>
            <h2 className="font-black text-slate-900">
              Tài khoản Roblox
            </h2>

            <p className="text-sm text-slate-500">
              Nhập username Roblox cần nhận Robux
            </p>
          </div>
        </div>

        <label className="mb-2 block text-sm font-bold text-slate-700">
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
            className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />

          <button
            onClick={onCheck}
            disabled={checkingUser || !username.trim()}
            className="flex shrink-0 items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {checkingUser ? (
              <Loader2 size={19} className="animate-spin" />
            ) : (
              <Search size={19} />
            )}

            <span className="hidden sm:inline">
              {checkingUser ? "Đang kiểm tra..." : "Kiểm tra"}
            </span>
          </button>
        </div>

        {robloxUser && (
          <div className="mt-5 flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            {robloxUser.avatar ? (
              <img
                src={robloxUser.avatar}
                alt={robloxUser.username}
                className="h-16 w-16 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <User size={28} />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={17}
                  className="shrink-0 text-emerald-600"
                />

                <p className="truncate font-black text-slate-900">
                  {robloxUser.displayName || robloxUser.username}
                </p>
              </div>

              <p className="mt-1 truncate text-sm text-slate-500">
                @{robloxUser.username}
              </p>

              <p className="mt-1 text-xs font-medium text-emerald-600">
                Đã xác minh tài khoản
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-2xl bg-blue-50 p-4">
          <div className="flex gap-3">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-blue-600"
            />

            <div>
              <p className="text-sm font-bold text-blue-900">
                Kiểm tra chính xác trước khi thanh toán
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-700">
                Hãy kiểm tra kỹ username Roblox. Robux sẽ được
                xử lý theo tài khoản đã xác nhận.
              </p>
            </div>
          </div>
        </div>

        {selectedPackage && (
          <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 p-4">
            <div>
              <p className="text-xs text-slate-400">
                Gói đã chọn
              </p>

              <p className="font-black text-slate-900">
                {selectedPackage.robux.toLocaleString("vi-VN")} Robux
              </p>
            </div>

            <p className="font-black text-blue-600">
              {formatPrice(selectedPackage.price)}
            </p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Quay lại
          </button>

          <button
            onClick={onContinue}
            disabled={!robloxUser || creatingOrder}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3.5 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {creatingOrder ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Đang tạo đơn...
              </>
            ) : (
              <>
                Tạo đơn
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
                }
function PaymentSection({ order, onBack, onPaid }) {
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(order?.status === "paid");

  if (!order) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <XCircle className="mx-auto mb-3 text-red-500" size={42} />

        <h2 className="font-black text-slate-900">
          Không tìm thấy đơn hàng
        </h2>

        <button
          onClick={onBack}
          className="mt-5 rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const transferContent =
    `NAP ROBLOX ${order.order_code} ${order.roblox_username} ${order.robux}ROBUX`;

  const handleConfirmTransfer = async () => {
    if (!order.id || order.status !== "pending") return;

    const ok = window.confirm(
      "Bạn đã chuyển đúng số tiền và đúng nội dung chuyển khoản chưa?"
    );

    if (!ok) return;

    setConfirming(true);

    try {
      const { data, error } = await supabase
        .from("orders")
        .update({
          status: "paid",
          payment_method: "bank",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)
        .eq("status", "pending")
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      setConfirmed(true);
      onPaid?.(data);
    } catch (error) {
      alert(
        error?.message ||
          "Không thể xác nhận chuyển khoản. Vui lòng thử lại."
      );
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
          <CreditCard size={21} />
        </div>

        <div>
          <h2 className="font-black text-slate-900">
            Thanh toán
          </h2>

          <p className="text-sm text-slate-500">
            Chuyển khoản theo thông tin bên dưới
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white">
          <p className="text-sm font-medium text-blue-100">
            Tổng thanh toán
          </p>

          <p className="mt-1 text-3xl font-black">
            {formatPrice(order.amount)}
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold">
            Mã đơn: {order.order_code}
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-black text-slate-900">
                Thông tin ngân hàng
              </h3>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                {BANK.name}
              </span>
            </div>

            <div className="space-y-4">
              <BankRow
                label="Ngân hàng"
                value={BANK.name}
              />

              <BankRow
                label="Số tài khoản"
                value={BANK.account}
                copy
              />

              <BankRow
                label="Chủ tài khoản"
                value={BANK.holder}
              />

              <BankRow
                label="Số tiền"
                value={formatPrice(order.amount)}
                copyValue={String(order.amount)}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-black text-amber-900">
              Nội dung chuyển khoản
            </p>

            <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-white p-3">
              <code className="min-w-0 flex-1 break-all text-sm font-bold text-slate-800">
                {transferContent}
              </code>

              <button
                onClick={() => copyText(transferContent)}
                className="shrink-0 rounded-xl bg-amber-100 p-2.5 text-amber-700 transition hover:bg-amber-200"
                title="Sao chép"
              >
                <Copy size={17} />
              </button>
            </div>

            <p className="mt-3 text-xs leading-5 text-amber-800">
              Vui lòng ghi chính xác nội dung trên để admin dễ
              dàng kiểm tra giao dịch.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex gap-3">
              <ShieldCheck
                size={21}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <div>
                <p className="font-bold text-blue-900">
                  Đơn hàng của bạn
                </p>

                <p className="mt-1 text-sm leading-6 text-blue-700">
                  {order.robux.toLocaleString("vi-VN")} Robux →{" "}
                  <span className="font-bold">
                    @{order.roblox_username}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {confirmed || order.status === "paid" ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-center gap-3">
                <CheckCircle2
                  size={25}
                  className="shrink-0 text-emerald-600"
                />

                <div>
                  <p className="font-black text-emerald-900">
                    Đã gửi xác nhận
                  </p>

                  <p className="mt-1 text-sm text-emerald-700">
                    Đơn hàng đang chờ admin kiểm tra giao dịch.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-white/70 p-3 text-sm">
                <span className="font-bold">Trạng thái:</span>{" "}
                <span className="font-semibold text-emerald-700">
                  Chờ kiểm tra
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleConfirmTransfer}
              disabled={confirming}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {confirming ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Đang xác nhận...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Tôi đã chuyển khoản
                </>
              )}
            </button>
          )}

          <button
            onClick={onBack}
            disabled={confirming}
            className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}

function BankRow({
  label,
  value,
  copy = false,
  copyValue,
}) {
  const handleCopy = () => {
    copyText(copyValue || value);
  };

  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <div className="flex min-w-0 items-center gap-2">
        <span className="break-all text-right text-sm font-black text-slate-900">
          {value}
        </span>

        {(copy || copyValue) && (
          <button
            onClick={handleCopy}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-blue-600"
            title="Sao chép"
          >
            <Copy size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
