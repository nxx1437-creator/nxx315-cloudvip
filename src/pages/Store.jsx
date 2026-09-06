import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Coins,
  Copy,
  Gamepad2,
  Gift,
  Loader2,
  ShieldCheck,
  Sparkles,
  Swords,
  XCircle,
  Star,
  Zap,
} from "lucide-react";

import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";
import TopHeader from "../components/TopHeader.jsx";

const ADMIN_CHAT_ID = 6152450878;

const formatCoins = (value) =>
  Number(value || 0).toLocaleString("vi-VN");

const formatDate = (value) => {
  if (!value) return "Chưa cập nhật";

  return new Date(value).toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const statusConfig = {
  pending: {
    label: "Đang xử lý",
    icon: Clock3,
    className: "bg-amber-50 text-amber-600 border-amber-100",
  },
  delivered: {
    label: "Đã giao",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  rejected: {
    label: "Đã từ chối",
    icon: XCircle,
    className: "bg-rose-50 text-rose-600 border-rose-100",
  },
  cancelled: {
    label: "Đã hủy",
    icon: XCircle,
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
};

export default function Store() {
  const { session } = useSession();
  const { profile, setProfile } = useProfile();

  const [packages, setPackages] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);

  const [category, setCategory] = useState("robux");
  const [version, setVersion] = useState("vng");
  const [selectedPackage, setSelectedPackage] = useState(null);

  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [deliveryTarget, setDeliveryTarget] = useState("");

  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState("");

  const userId = session?.user?.id;

  const showToast = (message, type = "success") => {
    setToast({ message, type });

    window.clearTimeout(window.__storeToast);

    window.__storeToast = window.setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const loadData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const [packageResult, orderResult] = await Promise.all([
      supabase
        .from("redemption_packages")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true }),

      supabase
        .from("redemption_orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

    if (packageResult.error) {
      console.error("Package error:", packageResult.error);
    }

    if (orderResult.error) {
      console.error("Order history error:", orderResult.error);
    }

    setPackages(packageResult.data || []);
    setHistory(orderResult.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const rewardType = String(pkg.reward_type || "").toLowerCase();
      const pkgVersion = String(pkg.version || "").toLowerCase();

      if (category === "quanhuy") {
        if (rewardType) {
          return rewardType === "quan_huy";
        }

        const name = String(pkg.name || "").toLowerCase();

        return (
          name.includes("quân huy") ||
          name.includes("quan huy") ||
          name.includes("liên quân")
        );
      }

      if (rewardType && rewardType !== "robux") {
        return false;
      }

      if (pkgVersion) {
        return pkgVersion === version;
      }

      const name = String(pkg.name || "").toLowerCase();

      return (
        name.includes("robux") ||
        name.includes("r$")
      );
    });
  }, [packages, category, version]);

  const selectCategory = (nextCategory) => {
    setCategory(nextCategory);
    setSelectedPackage(null);
    setDeliveryMethod("");
    setDeliveryTarget("");

    if (nextCategory === "robux") {
      setVersion("vng");
    }
  };

  const selectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setDeliveryMethod("");
    setDeliveryTarget("");

    if (category === "robux" && version === "vng") {
      setDeliveryMethod("vng");
    }

    setTimeout(() => {
      document
        .getElementById("store-order-panel")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 80);
  };

  const backToPackages = () => {
    setSelectedPackage(null);
    setDeliveryMethod("");
    setDeliveryTarget("");
  };

  const getMethod = () => {
    if (category === "robux" && version === "vng") {
      return "vng";
    }

    return deliveryMethod;
  };

  const canRedeem =
    !!selectedPackage &&
    !!getMethod() &&
    deliveryTarget.trim().length > 0 &&
    !redeeming;

  const refreshHistory = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("redemption_orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error) {
      setHistory(data || []);
    }
  };

  const handleRedeem = async () => {
    if (!userId) {
      showToast("Vui lòng đăng nhập để đổi thưởng.", "error");
      return;
    }

    if (!selectedPackage) {
      showToast("Bạn chưa chọn gói thưởng.", "error");
      return;
    }

    if (!getMethod() || !deliveryTarget.trim()) {
      showToast("Vui lòng nhập đầy đủ thông tin.", "error");
      return;
    }

    const cost = Number(selectedPackage.coin_cost || 0);
    const balance = Number(profile?.coins || 0);

    if (balance < cost) {
      showToast("Bạn không đủ Coin cho gói này.", "error");
      return;
    }

    setRedeeming(true);

    try {
      const { data, error } = await supabase.rpc(
        "create_redemption_order",
        {
          p_user_id: userId,
          p_package_id: selectedPackage.id,
          p_delivery_method: getMethod(),
          p_delivery_target: deliveryTarget.trim(),
        }
      );

      if (error) {
        throw error;
      }

      const result = Array.isArray(data) ? data[0] : data;

      if (!result?.success) {
        throw new Error(
          result?.error || "Không thể tạo đơn đổi thưởng."
        );
      }

      if (typeof setProfile === "function") {
        setProfile((prev) => ({
          ...prev,
          coins: result.coins_remaining,
        }));
      }

      try {
        await supabase.functions.invoke("telegram-webhook", {
          body: {
            message: {
              text:
                `🎁 ĐƠN HÀNG MỚI\n\n` +
                `📦 ${selectedPackage.name}\n` +
                `💰 ${formatCoins(cost)} Coin\n` +
                `👤 ${session?.user?.email || "Không có email"}\n` +
                `📮 ${deliveryTarget.trim()}\n` +
                `🔑 ${result.order_code || "N/A"}`,
              chat: {
                id: ADMIN_CHAT_ID,
              },
            },
          },
        });
      } catch (telegramError) {
        console.error("Telegram error:", telegramError);
      }

      await refreshHistory();

      showToast(
        `Đơn ${result.order_code || ""} đã được tạo thành công!`
      );

      setSelectedPackage(null);
      setDeliveryMethod("");
      setDeliveryTarget("");
    } catch (error) {
      console.error("Redeem error:", error);

      showToast(
        error?.message || "Đổi thưởng thất bại.",
        "error"
      );
    } finally {
      setRedeeming(false);
    }
  };

  const copyOrderCode = async (code) => {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);

      setTimeout(() => {
        setCopied("");
      }, 1500);
    } catch {
      showToast("Không thể sao chép.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] pb-28 text-slate-900">

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-pink-300/20 blur-3xl" />
        <div className="absolute right-0 top-32 h-96 w-96 rounded-full bg-violet-300/15 blur-3xl" />
        <div className="absolute bottom-20 left-1/3 h-80 w-80 rounded-full bg-yellow-200/20 blur-3xl" />
      </div>

      <TopHeader />

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">

        {toast && (
          <div
            className={`fixed left-1/2 top-4 z-[100] flex w-[calc(100%-32px)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border bg-white/95 px-4 py-3 shadow-2xl backdrop-blur-xl ${
              toast.type === "error"
                ? "border-rose-200 text-rose-700"
                : "border-emerald-200 text-emerald-700"
            }`}
          >
            {toast.type === "error" ? (
              <XCircle size={19} />
            ) : (
              <CheckCircle2 size={19} />
            )}

            <p className="text-sm font-semibold">
              {toast.message}
            </p>
          </div>
        )}

        <StoreHeader
          profile={profile}
          onBack={() => window.history.back()}
        />

        <Hero balance={profile?.coins} />

        <BalanceCard balance={profile?.coins} />

        <CategoryTabs
          category={category}
          onChange={selectCategory}
        />

        {category === "robux" && (
          <VersionTabs
            version={version}
            onChange={(value) => {
              setVersion(value);
              setSelectedPackage(null);
              setDeliveryMethod("");
              setDeliveryTarget("");
            }}
          />
        )}

        <section className="mt-6">

          <div className="mb-3 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles
                  size={18}
                  className="text-orange-400"
                />

                <h2 className="text-xl font-black">
                  Đề xuất cho bạn
                </h2>
              </div>

              <p className="mt-1 text-xs text-slate-400">
                Chọn phần thưởng bạn muốn đổi bằng xu
              </p>
            </div>

            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-400 shadow-sm">
              {filteredPackages.length} gói
            </span>
          </div>

          <PackageGrid
            packages={filteredPackages}
            category={category}
            selectedPackage={selectedPackage}
            loading={loading}
            onSelect={selectPackage}
          />
        </section>

        <div className="mt-6">
          <OrderPanel
            selectedPackage={selectedPackage}
            category={category}
            version={version}
            deliveryMethod={deliveryMethod}
            setDeliveryMethod={setDeliveryMethod}
            deliveryTarget={deliveryTarget}
            setDeliveryTarget={setDeliveryTarget}
            canRedeem={canRedeem}
            redeeming={redeeming}
            onRedeem={handleRedeem}
            onBack={backToPackages}
          />
        </div>

        <History
          history={history}
          copied={copied}
          onCopy={copyOrderCode}
        />

      </main>

      <BottomNav />
    </div>
  );
}

function StoreHeader({ profile, onBack }) {
  return (
    <header className="mb-4 flex items-center justify-between">

      <div className="flex items-center gap-3">

        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100 transition hover:scale-105"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-pink-500">
            Cửa hàng
          </p>

          <h1 className="text-xl font-black">
            Cộng Sản Thưởng
          </h1>
        </div>

      </div>

      <div className="flex items-center gap-2">

        <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm sm:flex">
          <Star
            size={19}
            className="text-yellow-400"
            fill="currentColor"
          />
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100">

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
            <Coins
              size={17}
              className="text-yellow-500"
            />
          </div>

          <div className="leading-none">
            <p className="text-[9px] font-medium text-slate-400">
              Số xu
            </p>

            <p className="mt-1 text-sm font-black">
              {formatCoins(profile?.coins)}
            </p>
          </div>

        </div>

      </div>
    </header>
  );
}

function Hero({ balance }) {
  return (
    <section className="relative mb-4 overflow-hidden rounded-[30px] bg-gradient-to-br from-[#ffd7e4] via-[#ffe9d5] to-[#fff6bd] px-5 py-6 shadow-[0_15px_50px_rgba(236,72,153,0.12)] sm:px-7">

      <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-pink-300/30 blur-3xl" />

      <div className="absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-yellow-300/30 blur-3xl" />

      <div className="relative flex items-center justify-between gap-4">

        <div className="max-w-[72%]">

          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1.5 text-[10px] font-black text-pink-500 shadow-sm">
            <Sparkles size={12} />
            SĂN QUÀ MỖI NGÀY
          </div>

          <h2 className="text-2xl font-black leading-tight sm:text-3xl">
            Đổi xu lấy
            <span className="text-pink-500">
              {" "}phần thưởng
            </span>
          </h2>

          <p className="mt-2 max-w-lg text-xs leading-5 text-slate-600 sm:text-sm">
            Dùng xu của bạn để đổi Robux, Quân Huy
            và nhiều phần quà hấp dẫn.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/85 px-3 py-2.5 shadow-sm">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100">
              <Coins
                size={19}
                className="text-yellow-500"
              />
            </div>

            <div>
              <p className="text-[10px] text-slate-400">
                Xu hiện có
              </p>

              <p className="text-lg font-black">
                {formatCoins(balance)}
              </p>
            </div>

          </div>

        </div>

        <div className="hidden h-28 w-28 shrink-0 items-center justify-center rounded-full bg-white/50 sm:flex">
          <Gift
            size={60}
            strokeWidth={1.5}
            className="text-pink-400"
          />
        </div>

      </div>
    </section>
  );
}

function BalanceCard({ balance }) {
  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2">

      <div className="relative overflow-hidden rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100">

        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-yellow-100 blur-xl" />

        <div className="relative flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-300 to-orange-400 shadow-lg shadow-orange-200">
            <Coins
              size={23}
              className="text-white"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Ví xu của bạn
            </p>

            <p className="mt-0.5 text-xl font-black text-slate-900">
              {formatCoins(balance)}
              <span className="ml-1 text-sm text-orange-500">
                xu
              </span>
            </p>
          </div>

        </div>
      </div>

      <div className="flex items-center gap-3 rounded-[24px] bg-gradient-to-r from-violet-500 to-fuchsia-500 p-4 text-white shadow-lg shadow-fuchsia-200">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
          <Zap size={23} />
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
            Ưu đãi
          </p>

          <p className="mt-0.5 text-sm font-black">
            Đổi quà nhanh chóng
          </p>

          <p className="mt-0.5 text-[10px] text-white/75">
            Chọn gói → nhập thông tin → xác nhận
          </p>
        </div>

      </div>

    </div>
  );
}
function CategoryTabs({ category, onChange }) {
  return (
    <div className="mb-4 rounded-[24px] bg-white p-2 shadow-sm ring-1 ring-slate-100">

      <div className="grid grid-cols-2 gap-2">

        <button
          type="button"
          onClick={() => onChange("robux")}
          className={`flex items-center justify-center gap-2 rounded-[18px] px-4 py-3 text-sm font-black transition ${
            category === "robux"
              ? "bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white shadow-lg shadow-pink-200"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <Gamepad2 size={18} />
          Robux
        </button>

        <button
          type="button"
          onClick={() => onChange("quanhuy")}
          className={`flex items-center justify-center gap-2 rounded-[18px] px-4 py-3 text-sm font-black transition ${
            category === "quanhuy"
              ? "bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg shadow-orange-200"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <Swords size={18} />
          Quân Huy
        </button>

      </div>
    </div>
  );
}

function VersionTabs({ version, onChange }) {
  return (
    <div className="mb-5">

      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-black text-slate-700">
          Chọn phiên bản
        </p>

        <span className="text-[10px] font-semibold text-slate-400">
          Hình thức nhận thưởng
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">

        <button
          type="button"
          onClick={() => onChange("vng")}
          className={`relative overflow-hidden rounded-[22px] border p-4 text-left transition ${
            version === "vng"
              ? "border-pink-400 bg-pink-50 shadow-md shadow-pink-100"
              : "border-slate-100 bg-white hover:border-pink-200"
          }`}
        >
          {version === "vng" && (
            <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-pink-500 text-white">
              <Check size={14} />
            </div>
          )}

          <div className="mb-2 text-2xl">
            🇻🇳
          </div>

          <p className="text-sm font-black">
            Robux Việt Nam
          </p>

          <p className="mt-1 text-[10px] text-slate-400">
            Nhận qua tài khoản / mã
          </p>
        </button>

        <button
          type="button"
          onClick={() => onChange("global")}
          className={`relative overflow-hidden rounded-[22px] border p-4 text-left transition ${
            version === "global"
              ? "border-violet-400 bg-violet-50 shadow-md shadow-violet-100"
              : "border-slate-100 bg-white hover:border-violet-200"
          }`}
        >
          {version === "global" && (
            <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-violet-500 text-white">
              <Check size={14} />
            </div>
          )}

          <div className="mb-2 text-2xl">
            🌎
          </div>

          <p className="text-sm font-black">
            Robux Global
          </p>

          <p className="mt-1 text-[10px] text-slate-400">
            Dành cho tài khoản quốc tế
          </p>
        </button>

      </div>
    </div>
  );
}

function PackageGrid({
  packages,
  category,
  selectedPackage,
  loading,
  onSelect,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">

        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-44 animate-pulse rounded-[24px] bg-white"
          />
        ))}

      </div>
    );
  }

  if (!packages.length) {
    return (
      <div className="rounded-[26px] bg-white px-5 py-12 text-center shadow-sm ring-1 ring-slate-100">

        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <Gift
            size={25}
            className="text-slate-400"
          />
        </div>

        <p className="font-black">
          Chưa có gói thưởng
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Hiện chưa có phần thưởng phù hợp.
        </p>

      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">

      {packages.map((pkg) => (
        <PackageCard
          key={pkg.id}
          pkg={pkg}
          category={category}
          selected={selectedPackage?.id === pkg.id}
          onSelect={() => onSelect(pkg)}
        />
      ))}

    </div>
  );
}

function PackageCard({
  pkg,
  category,
  selected,
  onSelect,
}) {
  const coinCost = Number(pkg.coin_cost || 0);
  const rewardAmount = pkg.reward_amount || pkg.amount || "";

  const image =
    pkg.image_url ||
    pkg.image ||
    pkg.icon_url ||
    "";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-[25px] border bg-white text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl ${
        selected
          ? "border-pink-400 ring-2 ring-pink-200"
          : "border-slate-100"
      }`}
    >

      {pkg.badge && (
        <div className="absolute left-2.5 top-2.5 z-10 rounded-full bg-pink-500 px-2.5 py-1 text-[9px] font-black text-white shadow-md">
          {pkg.badge}
        </div>
      )}

      <div className="relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50">

        <div className="absolute -right-7 -top-7 h-24 w-24 rounded-full bg-pink-200/40 blur-2xl" />

        <div className="absolute -bottom-8 -left-5 h-20 w-20 rounded-full bg-yellow-200/50 blur-2xl" />

        {image ? (
          <img
            src={image}
            alt={pkg.name || "Phần thưởng"}
            className="relative z-[1] h-24 w-24 object-contain drop-shadow-xl transition duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="relative z-[1] flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-lg">

            {category === "quanhuy" ? (
              <Swords
                size={37}
                className="text-orange-400"
              />
            ) : (
              <Coins
                size={37}
                className="text-yellow-400"
              />
            )}

          </div>
        )}

      </div>

      <div className="p-3.5">

        <p className="line-clamp-1 text-sm font-black text-slate-800">
          {pkg.name || `${rewardAmount} ${category === "quanhuy" ? "Quân Huy" : "Robux"}`}
        </p>

        <div className="mt-2 flex items-center justify-between gap-2">

          <div className="flex items-center gap-1.5">

            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100">
              <Coins
                size={13}
                className="text-yellow-500"
              />
            </div>

            <span className="text-xs font-black text-orange-500">
              {formatCoins(coinCost)}
            </span>

          </div>

          <ChevronRight
            size={16}
            className={`transition ${
              selected
                ? "translate-x-0 text-pink-500"
                : "-translate-x-1 text-slate-300 group-hover:translate-x-0 group-hover:text-pink-500"
            }`}
          />

        </div>

      </div>
    </button>
  );
}

function OrderPanel({
  selectedPackage,
  category,
  version,
  deliveryMethod,
  setDeliveryMethod,
  deliveryTarget,
  setDeliveryTarget,
  canRedeem,
  redeeming,
  onRedeem,
  onBack,
}) {
  if (!selectedPackage) {
    return (
      <section className="rounded-[28px] border border-dashed border-slate-200 bg-white/70 px-5 py-8 text-center">

        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
          <Gift
            size={22}
            className="text-slate-400"
          />
        </div>

        <p className="text-sm font-black text-slate-600">
          Chọn một gói phần thưởng
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Sau khi chọn, thông tin đổi thưởng sẽ xuất hiện ở đây.
        </p>

      </section>
    );
  }

  const cost = Number(selectedPackage.coin_cost || 0);
  const reward =
    selectedPackage.reward_amount ||
    selectedPackage.amount ||
    "";

  const isVng =
    category === "robux" &&
    version === "vng";

  return (
    <section
      id="store-order-panel"
      className="scroll-mt-20 overflow-hidden rounded-[30px] bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-100"
    >

      <div className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 px-5 py-5 text-white">

        <div className="flex items-start justify-between gap-4">

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
              Xác nhận đổi thưởng
            </p>

            <h3 className="mt-1 text-xl font-black">
              {selectedPackage.name || "Gói phần thưởng"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="rounded-full bg-white/15 p-2 transition hover:bg-white/25"
          >
            <XCircle size={19} />
          </button>

        </div>

      </div>

      <div className="space-y-5 p-5">

        <div className="grid grid-cols-2 gap-3">

          <div className="rounded-2xl bg-slate-50 p-3">

            <p className="text-[10px] font-semibold text-slate-400">
              Phần thưởng
            </p>

            <p className="mt-1 text-base font-black">
              {reward || selectedPackage.name}
            </p>

          </div>

          <div className="rounded-2xl bg-yellow-50 p-3">

            <p className="text-[10px] font-semibold text-yellow-600">
              Chi phí
            </p>

            <div className="mt-1 flex items-center gap-1.5">

              <Coins
                size={16}
                className="text-yellow-500"
              />

              <p className="text-base font-black text-orange-500">
                {formatCoins(cost)}
              </p>

            </div>

          </div>

        </div>

        {!isVng && (
          <div>
            <p className="mb-2 text-xs font-black text-slate-700">
              Phương thức nhận
            </p>

            <div className="grid grid-cols-2 gap-2">

              <MethodButton
                active={deliveryMethod === "account"}
                onClick={() => setDeliveryMethod("account")}
                title="Tài khoản"
                subtitle="Nhận trực tiếp"
              />

              <MethodButton
                active={deliveryMethod === "code"}
                onClick={() => setDeliveryMethod("code")}
                title="Mã quà"
                subtitle="Nhận mã"
              />

            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-black text-slate-700">
            {isVng
              ? "Nhập thông tin tài khoản"
              : deliveryMethod === "code"
                ? "Thông tin nhận mã"
                : "Tên tài khoản nhận thưởng"}
          </p>

          <input
            value={deliveryTarget}
            onChange={(event) =>
              setDeliveryTarget(event.target.value)
            }
            placeholder={
              isVng
                ? "Nhập UID / thông tin tài khoản"
                : deliveryMethod === "code"
                  ? "Nhập email hoặc thông tin nhận mã"
                  : "Nhập username / UID"
            }
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100"
          />

          <p className="mt-2 text-[10px] leading-4 text-slate-400">
            Kiểm tra kỹ thông tin trước khi xác nhận. Đơn đã tạo
            có thể không được hoàn lại nếu nhập sai thông tin.
          </p>
        </div>

        <div className="flex items-start gap-2 rounded-2xl bg-emerald-50 p-3 text-emerald-700">

          <ShieldCheck
            size={18}
            className="mt-0.5 shrink-0"
          />

          <p className="text-[11px] font-medium leading-5">
            Hệ thống sẽ ghi nhận đơn và chuyển sang trạng thái
            xử lý. Bạn có thể theo dõi đơn ở phần lịch sử bên dưới.
          </p>

        </div>

        <button
          type="button"
          disabled={!canRedeem}
          onClick={onRedeem}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-fuchsia-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {redeeming ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />
              Đang tạo đơn...
            </>
          ) : (
            <>
              <Gift size={18} />
              Đổi ngay · {formatCoins(cost)} xu
            </>
          )}
        </button>

      </div>
    </section>
  );
}

function MethodButton({
  active,
  onClick,
  title,
  subtitle,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-3 text-left transition ${
        active
          ? "border-pink-400 bg-pink-50 ring-2 ring-pink-100"
          : "border-slate-100 bg-white hover:border-pink-200"
      }`}
    >

      <div className="flex items-center justify-between">

        <div>
          <p
            className={`text-xs font-black ${
              active
                ? "text-pink-600"
                : "text-slate-700"
            }`}
          >
            {title}
          </p>

          <p className="mt-0.5 text-[9px] text-slate-400">
            {subtitle}
          </p>
        </div>

        {active && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-500 text-white">
            <Check size={13} />
          </div>
        )}

      </div>
    </button>
  );
}

function History({
  history,
  copied,
  onCopy,
}) {
  return (
    <section className="mt-7">

      <div className="mb-3 flex items-end justify-between">

        <div>
          <h2 className="text-xl font-black">
            Lịch sử đổi thưởng
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Theo dõi các gói bạn đã đổi
          </p>
        </div>

        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-400 shadow-sm">
          {history.length} đơn
        </span>

      </div>

      {!history.length ? (
        <div className="rounded-[26px] bg-white px-5 py-10 text-center shadow-sm ring-1 ring-slate-100">

          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <Clock3
              size={23}
              className="text-slate-400"
            />
          </div>

          <p className="text-sm font-black text-slate-600">
            Chưa có lịch sử
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Các đơn đổi thưởng của bạn sẽ xuất hiện ở đây.
          </p>

        </div>
      ) : (
        <div className="space-y-3">

          {history.map((order) => {
            const config =
              statusConfig[order.status] ||
              statusConfig.pending;

            const StatusIcon = config.icon;

            return (
              <div
                key={order.id}
                className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <p className="truncate text-sm font-black text-slate-800">
                      {order.package_name ||
                        order.reward_name ||
                        order.name ||
                        "Đơn đổi thưởng"}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      {formatDate(order.created_at)}
                    </p>

                  </div>

                  <span
                    className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-black ${config.className}`}
                  >
                    <StatusIcon size={12} />
                    {config.label}
                  </span>

                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">

                  <div className="rounded-xl bg-slate-50 px-3 py-2">

                    <p className="text-[9px] text-slate-400">
                      Chi phí
                    </p>

                    <div className="mt-0.5 flex items-center gap-1">

                      <Coins
                        size={13}
                        className="text-yellow-500"
                      />

                      <p className="text-xs font-black">
                        {formatCoins(
                          order.coin_cost ||
                          order.cost ||
                          0
                        )}
                      </p>

                    </div>

                  </div>

                  <div className="rounded-xl bg-slate-50 px-3 py-2">

                    <p className="text-[9px] text-slate-400">
                      Mã đơn
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        onCopy(
                          order.order_code ||
                          order.code
                        )
                      }
                      className="mt-0.5 flex max-w-full items-center gap-1 text-xs font-black text-pink-500"
                    >
                      <span className="truncate">
                        {order.order_code ||
                          order.code ||
                          "N/A"}
                      </span>

                      <Copy
                        size={12}
                        className="shrink-0"
                      />

                    </button>

                  </div>

                </div>

                {order.delivery_target && (
                  <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2">

                    <p className="text-[9px] text-slate-400">
                      Thông tin nhận
                    </p>

                    <p className="mt-0.5 truncate text-xs font-semibold text-slate-600">
                      {order.delivery_target}
                    </p>

                  </div>
                )}

                {copied ===
                  (order.order_code || order.code) && (
                  <p className="mt-2 text-[10px] font-bold text-emerald-500">
                    ✓ Đã sao chép mã đơn
                  </p>
                )}

              </div>
            );
          })}

        </div>
      )}

    </section>
  );
      }
