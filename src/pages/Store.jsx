import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Coins,
  CreditCard,
  Gift,
  Home,
  Loader2,
  QrCode,
  ShieldCheck,
  Sparkles,
  User,
  Wallet,
  X,
  XCircle,
} from "lucide-react";

import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";
import TopHeader from "../components/TopHeader.jsx";

const ADMIN_CHAT_ID = 6152450878;

const formatCoins = (value) =>
  Number(value || 0).toLocaleString("vi-VN");

const formatMoney = (value) =>
  Number(value || 0).toLocaleString("vi-VN") + " VND";

/*
|--------------------------------------------------------------------------
| Gói Robux dự phòng
|--------------------------------------------------------------------------
| Nếu Supabase chưa có gói thì giao diện vẫn hiển thị.
| Khi database có dữ liệu, dữ liệu database sẽ được ưu tiên.
*/

const FALLBACK_PACKAGES = [
  {
    id: "robux-vng-40",
    name: "Gói 40 Robux",
    robux: 40,
    price_vnd: 14000,
    coin_cost: 14000,
    version: "vng",
    reward_type: "robux",
    image_url: "/images/games/roblox.png",
    active: true,
  },
  {
    id: "robux-vng-80",
    name: "Gói 80 Robux",
    robux: 80,
    price_vnd: 28000,
    coin_cost: 28000,
    version: "vng",
    reward_type: "robux",
    image_url: "/images/games/roblox.png",
    active: true,
  },
  {
    id: "robux-card-400",
    name: "Gói 400 Robux",
    robux: 400,
    price_vnd: 112000,
    coin_cost: 112000,
    version: "card",
    reward_type: "robux",
    image_url: "/images/games/roblox.png",
    active: true,
  },
  {
    id: "robux-card-800",
    name: "Gói 800 Robux",
    robux: 800,
    price_vnd: 224000,
    coin_cost: 224000,
    version: "card",
    reward_type: "robux",
    image_url: "/images/games/roblox.png",
    active: true,
  },
];

/*
|--------------------------------------------------------------------------
| Trang Store
|--------------------------------------------------------------------------
*/

export default function Store() {
  const { session } = useSession();
  const { profile, setProfile } = useProfile();

  const [dbPackages, setDbPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  /*
   * landing
   * packages
   * id
   * payment
   */
  const [step, setStep] = useState("landing");

  const [packageType, setPackageType] = useState("vng");

  const [selectedPackage, setSelectedPackage] = useState(null);

  const [robloxId, setRobloxId] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("");

  const [processing, setProcessing] = useState(false);

  const [toast, setToast] = useState(null);

  const userId = session?.user?.id;

  /*
   * Toast
   */
  const showToast = (message, type = "success") => {
    setToast({
      message,
      type,
    });

    window.clearTimeout(window.__storeToast);

    window.__storeToast = window.setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  /*
   * Load packages
   */
  useEffect(() => {
    const loadPackages = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("redemption_packages")
        .select("*")
        .eq("active", true)
        .order("sort_order", {
          ascending: true,
        });

      if (error) {
        console.error("Store package error:", error);
        setDbPackages([]);
      } else {
        setDbPackages(data || []);
      }

      setLoading(false);
    };

    loadPackages();
  }, []);

  /*
   * Chuẩn hóa package database
   */
  const normalizedPackages = useMemo(() => {
    if (!dbPackages.length) {
      return FALLBACK_PACKAGES;
    }

    return dbPackages
      .filter((pkg) => {
        const rewardType = String(
          pkg.reward_type || "robux"
        ).toLowerCase();

        return rewardType === "robux";
      })
      .map((pkg) => {
        const name = String(pkg.name || "");

        const match = name.match(/(\d+)/);

        return {
          ...pkg,
          robux:
            pkg.robux ||
            pkg.amount ||
            (match ? Number(match[1]) : 0),

          price_vnd:
            pkg.price_vnd ||
            pkg.price ||
            pkg.amount_vnd ||
            0,

          coin_cost:
            pkg.coin_cost ||
            pkg.price_vnd ||
            pkg.price ||
            0,
        };
      });
  }, [dbPackages]);

  /*
   * Gói theo loại
   */
  const packages = useMemo(() => {
    return normalizedPackages.filter((pkg) => {
      const version = String(
        pkg.version || ""
      ).toLowerCase();

      if (packageType === "vng") {
        return (
          version === "vng" ||
          version === "vn" ||
          version === ""
        );
      }

      return (
        version === "card" ||
        version === "quoc_te" ||
        version === "international" ||
        version === "quoc-te"
      );
    });
  }, [normalizedPackages, packageType]);

  /*
   * Nếu database không có version phù hợp,
   * dùng fallback đúng loại.
   */
  const visiblePackages =
    packages.length > 0
      ? packages
      : FALLBACK_PACKAGES.filter(
          (pkg) => pkg.version === packageType
        );

  /*
   * Chọn gói
   */
  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setRobloxId("");
    setPaymentMethod("");

    setStep("id");
  };

  /*
   * Sang bước thanh toán
   */
  const handleContinueToPayment = () => {
    if (!robloxId.trim()) {
      showToast(
        "Vui lòng nhập ID Roblox.",
        "error"
      );
      return;
    }

    setStep("payment");
  };

  /*
   * Quay lại
   */
  const handleBack = () => {
    if (step === "payment") {
      setPaymentMethod("");
      setStep("id");
      return;
    }

    if (step === "id") {
      setSelectedPackage(null);
      setRobloxId("");
      setStep("packages");
      return;
    }

    if (step === "packages") {
      setSelectedPackage(null);
      setStep("landing");
      return;
    }

    window.history.back();
  };

  /*
   * Thanh toán bằng xu
   *
   * Giữ lại RPC hiện tại của Store cũ.
   */
  const handleCoinPayment = async () => {
    if (!userId) {
      showToast(
        "Vui lòng đăng nhập để thanh toán.",
        "error"
      );
      return;
    }

    if (!selectedPackage) {
      showToast(
        "Bạn chưa chọn gói.",
        "error"
      );
      return;
    }

    if (!robloxId.trim()) {
      showToast(
        "Vui lòng nhập ID Roblox.",
        "error"
      );
      return;
    }

    const cost = Number(
      selectedPackage.coin_cost || 0
    );

    const balance = Number(
      profile?.coins || 0
    );

    if (balance < cost) {
      showToast(
        "Bạn không đủ xu để đổi gói này.",
        "error"
      );
      return;
    }

    setProcessing(true);

    try {
      const { data, error } =
        await supabase.rpc(
          "create_redemption_order",
          {
            p_user_id: userId,
            p_package_id: selectedPackage.id,
            p_delivery_method: "roblox",
            p_delivery_target:
              robloxId.trim(),
          }
        );

      if (error) {
        throw error;
      }

      const result = Array.isArray(data)
        ? data[0]
        : data;

      if (!result?.success) {
        throw new Error(
          result?.error ||
            "Không thể tạo đơn."
        );
      }

      /*
       * Cập nhật số xu trên giao diện
       */
      if (typeof setProfile === "function") {
        setProfile((prev) => ({
          ...prev,
          coins:
            result.coins_remaining ??
            Math.max(
              0,
              Number(prev?.coins || 0) -
                cost
            ),
        }));
      }

      /*
       * Gửi thông báo admin
       */
      try {
        await supabase.functions.invoke(
          "telegram-webhook",
          {
            body: {
              message: {
                text:
                  `🎮 ĐƠN ROBUX MỚI\n\n` +
                  `📦 ${selectedPackage.name}\n` +
                  `💰 ${formatCoins(
                    cost
                  )} xu\n` +
                  `👤 ${
                    session?.user?.email ||
                    "Không có email"
                  }\n` +
                  `🎮 Roblox ID: ${robloxId.trim()}\n` +
                  `💳 Thanh toán: Xu\n` +
                  `🔑 ${
                    result.order_code ||
                    "N/A"
                  }`,
                chat: {
                  id: ADMIN_CHAT_ID,
                },
              },
            },
          }
        );
      } catch (telegramError) {
        console.error(
          "Telegram error:",
          telegramError
        );
      }

      showToast(
        "Thanh toán bằng xu thành công!"
      );

      setTimeout(() => {
        setSelectedPackage(null);
        setRobloxId("");
        setPaymentMethod("");
        setStep("landing");
      }, 700);
    } catch (error) {
      console.error(
        "Coin payment error:",
        error
      );

      showToast(
        error?.message ||
          "Thanh toán thất bại.",
        "error"
      );
    } finally {
      setProcessing(false);
    }
  };

  /*
   * VietQR
   *
   * Bản này mới dựng UI.
   * API tạo giao dịch sẽ nối ở bước sau.
   */
  const handleVietQRPayment = () => {
    showToast(
      "VietQR đã được chọn. Phần tạo giao dịch sẽ tích hợp sau."
    );
  };

  /*
   * Thanh toán
   */
  const handlePayment = () => {
    if (paymentMethod === "coins") {
      handleCoinPayment();
      return;
    }

    if (paymentMethod === "vietqr") {
      handleVietQRPayment();
      return;
    }

    showToast(
      "Vui lòng chọn phương thức thanh toán.",
      "error"
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f7fa] pb-28 text-slate-900">

      <TopHeader />

      {toast && (
        <div
          className={`fixed left-1/2 top-4 z-[100] flex w-[calc(100%-32px)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-2xl ${
            toast.type === "error"
              ? "border-rose-200 text-rose-600"
              : "border-emerald-200 text-emerald-600"
          }`}
        >
          {toast.type === "error" ? (
            <XCircle size={19} />
          ) : (
            <CheckCircle2 size={19} />
          )}

          <p className="text-sm font-bold">
            {toast.message}
          </p>
        </div>
      )}

      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

        {step === "landing" && (
          <LandingPage
            balance={profile?.coins}
            onContinue={() =>
              setStep("packages")
            }
          />
        )}

        {step === "packages" && (
          <PackagePage
            balance={profile?.coins}
            packageType={packageType}
            setPackageType={setPackageType}
            packages={visiblePackages}
            loading={loading}
            onBack={handleBack}
            onSelect={handleSelectPackage}
          />
        )}

        {step === "id" && (
          <RobloxIdPage
            balance={profile?.coins}
            selectedPackage={selectedPackage}
            robloxId={robloxId}
            setRobloxId={setRobloxId}
            onBack={handleBack}
            onContinue={
              handleContinueToPayment
            }
          />
        )}

        {step === "payment" && (
          <PaymentPage
            balance={profile?.coins}
            selectedPackage={selectedPackage}
            robloxId={robloxId}
            paymentMethod={paymentMethod}
            setPaymentMethod={
              setPaymentMethod
            }
            processing={processing}
            onBack={handleBack}
            onPayment={handlePayment}
          />
        )}

      </main>

      <BottomNav />
    </div>
  );
  }
/*
|--------------------------------------------------------------------------
| LANDING PAGE
|--------------------------------------------------------------------------
*/

function LandingPage({
  balance,
  onContinue,
}) {
  return (
    <section>

      {/* Tiêu đề */}
      <div className="mb-5 flex items-start justify-between gap-4">

        <div>
          <p className="text-[12px] font-black uppercase tracking-[0.22em] text-pink-500">
            CỬA HÀNG
          </p>

          <h1 className="mt-1 text-4xl font-black leading-none tracking-tight text-slate-950 sm:text-5xl">
            Cộng Sản
            <br />
            Thưởng
          </h1>
        </div>

        {/* Số xu */}
        <div className="flex shrink-0 items-center gap-2 rounded-[24px] bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-yellow-100">
            <Coins
              size={23}
              className="text-yellow-500"
            />
          </div>

          <div>
            <p className="text-[10px] text-slate-400">
              Số xu
            </p>

            <p className="mt-0.5 text-xl font-black text-slate-950">
              {formatCoins(balance)}
            </p>
          </div>

        </div>

      </div>

      {/* Banner */}
      <div className="relative mb-7 overflow-hidden rounded-[34px] bg-gradient-to-br from-[#cce5ff] via-[#f6d8f4] to-[#ffe68d] px-6 py-7 shadow-[0_18px_50px_rgba(230,120,200,0.15)] sm:px-8 sm:py-9">

        {/* Background decoration */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-pink-300/30 blur-3xl" />

        <div className="absolute bottom-0 right-0 h-36 w-48 rounded-full bg-yellow-200/40 blur-3xl" />

        <Sparkles
          className="absolute right-12 top-10 text-white/80"
          size={30}
        />

        <Sparkles
          className="absolute right-28 top-28 text-white"
          size={22}
        />

        <div className="relative z-10 max-w-[620px]">

          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-md">
            <Sparkles
              size={16}
              className="text-pink-500"
            />

            <span className="text-sm font-black text-pink-500">
              SĂN QUÀ MỖI NGÀY
            </span>
          </div>

          <h2 className="mt-7 text-4xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-5xl">
            Đổi xu lấy
            <span className="block bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              phần thưởng
            </span>
          </h2>

          <p className="mt-5 max-w-[550px] text-base leading-7 text-slate-600 sm:text-lg">
            Dùng xu của bạn để đổi Robux
            và nhiều phần quà hấp dẫn.
          </p>

          <div className="mt-6 inline-flex items-center gap-3 rounded-[22px] bg-white px-4 py-3 shadow-lg">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <Coins
                size={25}
                className="text-yellow-500"
              />
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Xu hiện có
              </p>

              <p className="text-2xl font-black text-slate-950">
                {formatCoins(balance)}
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Tiêu đề Roblox */}
      <div className="mb-4 flex items-center justify-between">

        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-pink-500">
            TRÒ CHƠI
          </p>

          <h2 className="mt-1 text-2xl font-black">
            Roblox
          </h2>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-black text-pink-500 shadow-sm ring-1 ring-pink-100"
        >
          Xem gói
          <ChevronRight size={16} />
        </button>

      </div>

      {/* Preview 2 loại */}
      <div className="grid gap-4 sm:grid-cols-2">

        <button
          type="button"
          onClick={onContinue}
          className="group relative overflow-hidden rounded-[26px] bg-white p-5 text-left shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-xl"
        >

          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-pink-100" />

          <div className="relative">

            <div className="mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-blue-100">
              <img
                src="/images/games/roblox.png"
                alt="Roblox"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display =
                    "none";
                }}
              />
            </div>

            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              NẠP ROBUX
            </p>

            <h3 className="mt-1 text-xl font-black">
              VNG
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Nạp trực tiếp vào tài khoản
            </p>

            <div className="mt-4 flex items-center gap-2 text-pink-500">
              <span className="text-sm font-black">
                Xem gói
              </span>

              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-1"
              />
            </div>

          </div>
        </button>

        <button
          type="button"
          onClick={onContinue}
          className="group relative overflow-hidden rounded-[26px] bg-white p-5 text-left shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-xl"
        >

          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-violet-100" />

          <div className="relative">

            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100">
              <CreditCard
                size={30}
                className="text-violet-500"
              />
            </div>

            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              ROBUX CARD
            </p>

            <h3 className="mt-1 text-xl font-black">
              Card Robux
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Các gói Robux lớn
            </p>

            <div className="mt-4 flex items-center gap-2 text-violet-500">
              <span className="text-sm font-black">
                Xem gói
              </span>

              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-1"
              />
            </div>

          </div>
        </button>

      </div>

    </section>
  );
}

/*
|--------------------------------------------------------------------------
| PACKAGE PAGE
|--------------------------------------------------------------------------
*/

function PackagePage({
  balance,
  packageType,
  setPackageType,
  packages,
  loading,
  onBack,
  onSelect,
}) {
  return (
    <section>

      {/* Header */}
      <div className="mb-5 flex items-center gap-3">

        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100"
        >
          <ArrowLeft size={22} />
        </button>

        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-pink-500">
            ROBLOX
          </p>

          <h1 className="text-2xl font-black">
            Chọn gói Robux
          </h1>
        </div>

        <div className="ml-auto flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-sm">
          <Coins
            size={18}
            className="text-yellow-500"
          />

          <span className="text-sm font-black">
            {formatCoins(balance)}
          </span>
        </div>

      </div>

      {/* Tabs */}
      <div className="mb-6 rounded-[22px] bg-white p-1.5 shadow-sm ring-1 ring-slate-100">

        <div className="grid grid-cols-2 gap-1">

          <button
            type="button"
            onClick={() =>
              setPackageType("vng")
            }
            className={`rounded-[17px] px-3 py-3 text-sm font-black transition ${
              packageType === "vng"
                ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md"
                : "text-slate-500"
            }`}
          >
            <div>
              VNG
            </div>

            <span
              className={`text-[10px] ${
                packageType === "vng"
                  ? "text-white/75"
                  : "text-slate-400"
              }`}
            >
              Nạp trực tiếp
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setPackageType("card")
            }
            className={`rounded-[17px] px-3 py-3 text-sm font-black transition ${
              packageType === "card"
                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md"
                : "text-slate-500"
            }`}
          >
            <div>
              Card Robux
            </div>

            <span
              className={`text-[10px] ${
                packageType === "card"
                  ? "text-white/75"
                  : "text-slate-400"
              }`}
            >
              Gói lớn
            </span>
          </button>

        </div>

      </div>

      {/* Heading */}
      <div className="mb-4 flex items-end justify-between">

        <div>
          <p className="text-xs font-bold text-slate-400">
            {packageType === "vng"
              ? "Nạp trực tiếp"
              : "Danh sách gói"}
          </p>

          <h2 className="mt-1 text-xl font-black">
            {packageType === "vng"
              ? "Gói Robux VNG"
              : "Gói Card Robux"}
          </h2>
        </div>

        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-400 shadow-sm">
          {packages.length} gói
        </span>

      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">

          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-[24px] bg-white"
              />
            )
          )}

        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {packages.map((pkg) => (
            <RobuxPackageCard
              key={pkg.id}
              pkg={pkg}
              onClick={() =>
                onSelect(pkg)
              }
            />
          ))}
        </div>
      )}

    </section>
  );
      }
/*
|--------------------------------------------------------------------------
| ROBUX PACKAGE CARD
|--------------------------------------------------------------------------
*/

function RobuxPackageCard({
  pkg,
  onClick,
}) {
  const robux =
    pkg.robux ||
    pkg.amount ||
    0;

  const price =
    pkg.price_vnd ||
    pkg.price ||
    0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group overflow-hidden rounded-[22px] bg-white text-left shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-xl active:scale-[0.98]"
    >

      {/* Image */}
      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-[#171717] via-[#303030] to-[#111]">

        {pkg.image_url ? (
          <img
            src={pkg.image_url}
            alt={pkg.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display =
                "none";
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Gift
              size={42}
              className="text-yellow-300"
            />
          </div>
        )}

        {/* Robux badge */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-xl bg-white px-4 py-1.5 shadow-lg">

          <span className="text-base font-black text-slate-900">
            ◈ {robux}
          </span>

        </div>

      </div>

      {/* Content */}
      <div className="p-3">

        <p className="truncate text-[14px] font-bold text-slate-800">
          {pkg.name ||
            `Gói ${robux} Robux`}
        </p>

        <div className="mt-2 flex items-end justify-between gap-2">

          <div>

            <p className="text-[10px] text-slate-400">
              Giá
            </p>

            <p className="text-base font-black text-orange-500">
              {formatMoney(price)}
            </p>

          </div>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
            <ChevronRight size={18} />
          </div>

        </div>

      </div>

    </button>
  );
}

/*
|--------------------------------------------------------------------------
| NHẬP ID ROBLOX
|--------------------------------------------------------------------------
*/

function RobloxIdPage({
  balance,
  selectedPackage,
  robloxId,
  setRobloxId,
  onBack,
  onContinue,
}) {
  if (!selectedPackage) {
    return null;
  }

  const robux =
    selectedPackage.robux ||
    selectedPackage.amount ||
    0;

  const price =
    selectedPackage.price_vnd ||
    selectedPackage.price ||
    0;

  return (
    <section className="mx-auto max-w-xl">

      {/* Header */}
      <div className="mb-5 flex items-center gap-3">

        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100"
        >
          <ArrowLeft size={22} />
        </button>

        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-pink-500">
            ROBLOX
          </p>

          <h1 className="text-2xl font-black">
            Thông tin tài khoản
          </h1>
        </div>

      </div>

      {/* Selected package */}
      <div className="mb-4 overflow-hidden rounded-[26px] bg-white shadow-sm ring-1 ring-slate-100">

        <div className="flex items-center gap-4 p-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <span className="text-xl font-black">
              ◈
            </span>
          </div>

          <div className="min-w-0 flex-1">

            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Gói đã chọn
            </p>

            <p className="mt-1 truncate text-lg font-black">
              {selectedPackage.name ||
                `Gói ${robux} Robux`}
            </p>

            <p className="mt-1 text-sm font-bold text-orange-500">
              {formatMoney(price)}
            </p>

          </div>

        </div>

      </div>

      {/* Form */}
      <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">

        <div className="mb-5 flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
            <User
              size={23}
              className="text-blue-500"
            />
          </div>

          <div>
            <h2 className="text-lg font-black">
              ID Roblox
            </h2>

            <p className="text-xs text-slate-400">
              Nhập đúng tên tài khoản Roblox
            </p>
          </div>

        </div>

        <label className="mb-2 block text-sm font-black text-slate-700">
          Tên tài khoản
        </label>

        <input
          type="text"
          value={robloxId}
          onChange={(e) =>
            setRobloxId(
              e.target.value
            )
          }
          placeholder="Nhập username Roblox..."
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base font-semibold outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100"
        />

        <div className="mt-4 rounded-2xl bg-amber-50 p-4">

          <div className="flex gap-3">

            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-amber-500"
            />

            <p className="text-xs leading-5 text-amber-700">
              Hãy kiểm tra kỹ ID Roblox
              trước khi tiếp tục. Nhập sai
              tài khoản có thể khiến phần
              thưởng được gửi nhầm.
            </p>

          </div>

        </div>

        <button
          type="button"
          onClick={onContinue}
          disabled={!robloxId.trim()}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-base font-black transition ${
            robloxId.trim()
              ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg shadow-pink-500/20 hover:-translate-y-0.5"
              : "cursor-not-allowed bg-slate-100 text-slate-400"
          }`}
        >
          Tiếp tục
          <ArrowRight size={19} />
        </button>

      </div>

      {/* Balance */}
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">

        <div className="flex items-center gap-2">
          <Coins
            size={18}
            className="text-yellow-500"
          />

          <span className="text-sm font-bold text-slate-500">
            Số xu hiện có
          </span>
        </div>

        <span className="text-sm font-black">
          {formatCoins(balance)} xu
        </span>

      </div>

    </section>
  );
}
/*
|--------------------------------------------------------------------------
| PAYMENT PAGE
|--------------------------------------------------------------------------
*/

function PaymentPage({
  balance,
  selectedPackage,
  robloxId,
  paymentMethod,
  setPaymentMethod,
  processing,
  onBack,
  onPayment,
}) {
  if (!selectedPackage) {
    return null;
  }

  const robux =
    selectedPackage.robux ||
    selectedPackage.amount ||
    0;

  const price =
    selectedPackage.price_vnd ||
    selectedPackage.price ||
    0;

  const coinCost =
    Number(
      selectedPackage.coin_cost ||
        price ||
        0
    );

  const enoughCoins =
    Number(balance || 0) >=
    coinCost;

  return (
    <section className="mx-auto max-w-xl">

      {/* Header */}
      <div className="mb-5 flex items-center gap-3">

        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100"
        >
          <ArrowLeft size={22} />
        </button>

        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-pink-500">
            THANH TOÁN
          </p>

          <h1 className="text-2xl font-black">
            Thanh toán đơn hàng
          </h1>
        </div>

      </div>

      {/* Order */}
      <div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-100">

        <div className="border-b border-slate-100 p-5">

          <div className="flex items-center gap-3">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <span className="text-xl font-black">
                ◈
              </span>
            </div>

            <div className="min-w-0 flex-1">

              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Giỏ hàng
              </p>

              <p className="mt-1 truncate text-base font-black">
                {selectedPackage.name ||
                  `Gói ${robux} Robux`}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Roblox ID:{" "}
                <span className="font-bold text-slate-700">
                  {robloxId}
                </span>
              </p>

            </div>

            <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-500">
              x1
            </span>

          </div>

        </div>

        {/* Payment methods */}
        <div className="p-5">

          <h2 className="mb-3 text-lg font-black">
            Phương thức thanh toán
          </h2>

          {/* Xu */}
          <button
            type="button"
            onClick={() =>
              setPaymentMethod(
                "coins"
              )
            }
            className={`mb-3 flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${
              paymentMethod === "coins"
                ? "border-orange-400 bg-orange-50"
                : "border-slate-200 bg-white hover:border-orange-200"
            }`}
          >

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-100">
              <Coins
                size={24}
                className="text-yellow-500"
              />
            </div>

            <div className="min-w-0 flex-1">

              <p className="font-black text-slate-900">
                Dùng xu
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Số dư:{" "}
                {formatCoins(balance)} xu
              </p>

            </div>

            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                paymentMethod === "coins"
                  ? "border-orange-500 bg-orange-500"
                  : "border-slate-300"
              }`}
            >
              {paymentMethod ===
                "coins" && (
                <Check
                  size={14}
                  className="text-white"
                  strokeWidth={3}
                />
              )}
            </div>

          </button>

          {/* VietQR */}
          <button
            type="button"
            onClick={() =>
              setPaymentMethod(
                "vietqr"
              )
            }
            className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${
              paymentMethod === "vietqr"
                ? "border-orange-400 bg-orange-50"
                : "border-slate-200 bg-white hover:border-orange-200"
            }`}
          >

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <QrCode
                size={25}
                className="text-blue-600"
              />
            </div>

            <div className="min-w-0 flex-1">

              <p className="font-black text-slate-900">
                VietQR
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Chuyển khoản ngân hàng
              </p>

            </div>

            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                paymentMethod === "vietqr"
                  ? "border-orange-500 bg-orange-500"
                  : "border-slate-300"
              }`}
            >
              {paymentMethod ===
                "vietqr" && (
                <Check
                  size={14}
                  className="text-white"
                  strokeWidth={3}
                />
              )}
            </div>

          </button>

        </div>

      </div>

      {/* Total */}
      <div className="mt-4 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100">

        <div className="flex items-center justify-between">

          <span className="text-base font-bold text-slate-500">
            Tổng thanh toán
          </span>

          <span className="text-2xl font-black text-orange-500">
            {formatMoney(price)}
          </span>

        </div>

        {paymentMethod === "coins" && (
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-yellow-50 px-4 py-3">

            <div className="flex items-center gap-2">
              <Coins
                size={18}
                className="text-yellow-500"
              />

              <span className="text-sm font-bold text-slate-600">
                Số xu cần dùng
              </span>
            </div>

            <span className="text-sm font-black text-orange-500">
              {formatCoins(
                coinCost
              )}{" "}
              xu
            </span>

          </div>
        )}

        {paymentMethod === "coins" &&
          !enoughCoins && (
            <div className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-xs font-bold text-rose-600">
              Bạn không đủ xu để
              thanh toán gói này.
            </div>
          )}

        {paymentMethod === "vietqr" && (
          <div className="mt-3 rounded-2xl bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-700">
            Sau khi kết nối hệ thống
            VietQR, tại đây sẽ hiển thị
            mã QR và thông tin chuyển
            khoản.
          </div>
        )}

        {/* Agreement */}
        <p className="mt-4 text-xs leading-5 text-slate-400">
          Bằng việc nhấn nút
          <span className="font-bold text-slate-600">
            {" "}
            "Thanh toán"
          </span>
          , bạn xác nhận thông tin
          Roblox ID là chính xác và
          đồng ý với điều khoản sử dụng
          của hệ thống.
        </p>

        {/* Button */}
        <button
          type="button"
          disabled={
            processing ||
            !paymentMethod ||
            (paymentMethod ===
              "coins" &&
              !enoughCoins)
          }
          onClick={onPayment}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-base font-black transition ${
            processing ||
            !paymentMethod ||
            (paymentMethod ===
              "coins" &&
              !enoughCoins)
              ? "cursor-not-allowed bg-slate-100 text-slate-400"
              : "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/20 hover:-translate-y-0.5"
          }`}
        >

          {processing ? (
            <>
              <Loader2
                size={19}
                className="animate-spin"
              />
              Đang xử lý...
            </>
          ) : (
            <>
              Thanh toán
              <ArrowRight size={19} />
            </>
          )}

        </button>

      </div>

    </section>
  );
            }
