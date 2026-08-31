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
} from "lucide-react";

import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

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
    <div className="min-h-screen bg-[#F7FAFC] pb-28 text-slate-900">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-sky-300/10 blur-3xl" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

        {toast && (
          <div
            className={`fixed left-1/2 top-4 z-50 flex w-[calc(100%-32px)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-xl ${
              toast.type === "error"
                ? "border-rose-200 bg-white/95 text-rose-700"
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

        <Hero
          balance={profile?.coins}
        />

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

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">

          <section>
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-500">
                  Cửa hàng
                </p>

                <h2 className="mt-1 text-lg font-black">
                  Chọn gói {category === "robux" ? "Robux" : "Quân Huy"}
                </h2>
              </div>

              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-400 shadow-sm ring-1 ring-slate-100">
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
    <header className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-100 transition hover:text-sky-600"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-500">
            NXX315 Studio
          </p>

          <h1 className="text-xl font-black text-slate-950">
            Cửa hàng
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-amber-100 bg-white px-3 py-2 shadow-sm">
        <Coins size={17} className="text-amber-500" />

        <div className="leading-none">
          <p className="text-[10px] font-medium text-slate-400">
            Số dư
          </p>

          <p className="mt-1 text-sm font-black text-slate-900">
            {formatCoins(profile?.coins)}
          </p>
        </div>
      </div>
    </header>
  );
}

function Hero({ balance }) {
  return (
    <section className="relative mb-5 overflow-hidden rounded-[28px] border border-sky-100 bg-white p-5 shadow-[0_12px_40px_rgba(14,165,233,0.08)] sm:p-6">
      <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-sky-300/15 blur-3xl" />
      <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-cyan-300/10 blur-3xl" />

      <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-[10px] font-bold text-sky-600">
            <Sparkles size={12} />
            ĐỔI THƯỞNG NHANH
          </div>

          <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Đổi Coin lấy quà game
            <span className="text-sky-500"> cực dễ</span>
          </h2>

          <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm">
            Chọn phần thưởng, nhập thông tin nhận hàng và gửi
            đơn. Mọi giao dịch đều được ghi nhận trên hệ thống.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <InfoBadge text="Giao dịch minh bạch" />
            <InfoBadge text="Không cần mật khẩu" />
            <InfoBadge text="Xử lý theo đơn" />
          </div>
        </div>

        <div className="hidden min-w-[170px] rounded-2xl border border-sky-100 bg-sky-50/70 p-4 sm:block">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
              <WalletIcon />
            </div>

            <span className="text-xs font-semibold text-slate-500">
              Coin hiện có
            </span>
          </div>

          <p className="mt-3 text-2xl font-black text-slate-900">
            {formatCoins(balance)}
          </p>

          <p className="text-[10px] text-slate-400">
            Coin khả dụng
          </p>
        </div>
      </div>
    </section>
  );
}

function WalletIcon() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Coins size={18} className="text-amber-500" />
    </div>
  );
}

function InfoBadge({ text }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold text-slate-500">
      <Check size={11} className="text-emerald-500" />
      {text}
    </span>
  );
}

function CategoryTabs({ category, onChange }) {
  const items = [
    {
      id: "robux",
      icon: Gamepad2,
      title: "Robux Roblox",
      subtitle: "Nhận quà game",
      active: "from-sky-500 to-cyan-400",
    },
    {
      id: "quanhuy",
      icon: Swords,
      title: "Quân Huy Liên Quân",
      subtitle: "Nạp phần thưởng",
      active: "from-blue-600 to-sky-400",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const Icon = item.icon;
        const active = category === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`group relative overflow-hidden rounded-[22px] border p-4 text-left transition duration-200 ${
              active
                ? "border-sky-300 bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-lg shadow-sky-500/15"
                : "border-slate-200 bg-white text-slate-800 shadow-sm hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
            }`}
          >
            {active && (
              <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
            )}

            <div className="relative flex items-center gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                  active
                    ? "bg-white/15"
                    : "bg-sky-50 text-sky-600"
                }`}
              >
                <Icon size={21} />
              </div>

              <div>
                <p className="text-sm font-black">
                  {item.title}
                </p>

                <p
                  className={`mt-0.5 text-[10px] ${
                    active
                      ? "text-white/70"
                      : "text-slate-400"
                  }`}
                >
                  {item.subtitle}
                </p>
              </div>

              <ChevronRight
                size={17}
                className={`ml-auto ${
                  active
                    ? "text-white/70"
                    : "text-slate-300"
                }`}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}

function VersionTabs({ version, onChange }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
      <VersionButton
        active={version === "vng"}
        onClick={() => onChange("vng")}
        icon="🇻🇳"
        title="VNG"
        subtitle="Nạp trực tiếp"
      />

      <VersionButton
        active={version === "quoc_te"}
        onClick={() => onChange("quoc_te")}
        icon="🌎"
        title="Quốc tế"
        subtitle="Nhận mã"
      />
    </div>
  );
}

function VersionButton({
  active,
  onClick,
  icon,
  title,
  subtitle,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-3 text-left transition ${
        active
          ? "bg-white shadow-sm ring-1 ring-sky-100"
          : "text-slate-500"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>

        <div>
          <p
            className={`text-xs font-black ${
              active ? "text-slate-900" : ""
            }`}
          >
            {title}
          </p>

          <p className="text-[9px] text-slate-400">
            {subtitle}
          </p>
        </div>
      </div>
    </button>
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
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="h-48 animate-pulse rounded-[24px] bg-white ring-1 ring-slate-100"
          />
        ))}
      </div>
    );
  }

  if (!packages.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-slate-200 bg-white px-5 py-14 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50">
          <Gift size={23} className="text-sky-400" />
        </div>

        <p className="mt-4 text-sm font-black text-slate-700">
          Chưa có gói phù hợp
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Các gói thưởng hiện chưa được mở bán.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
      {packages.map((pkg) => (
        <PackageCard
          key={pkg.id}
          pkg={pkg}
          category={category}
          selected={selectedPackage?.id === pkg.id}
          onClick={() => onSelect(pkg)}
        />
      ))}
    </div>
  );
}

function PackageCard({
  pkg,
  category,
  selected,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[24px] border bg-white p-4 text-left transition duration-200 ${
        selected
          ? "border-sky-400 shadow-[0_8px_30px_rgba(14,165,233,0.16)] ring-2 ring-sky-100"
          : "border-slate-200 shadow-sm hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
      }`}
    >
      {selected && (
        <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-white shadow-sm">
          <Check size={13} strokeWidth={3} />
        </div>
      )}

      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${
          category === "robux"
            ? "bg-sky-50 text-sky-500"
            : "bg-cyan-50 text-cyan-600"
        }`}
      >
        {category === "robux" ? (
          <Gamepad2 size={21} />
        ) : (
          <Swords size={21} />
        )}
      </div>

      <p className="min-h-[40px] text-sm font-black leading-5 text-slate-900">
        {pkg.name}
      </p>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Chi phí
          </p>

          <p className="mt-0.5 text-base font-black text-sky-600">
            {formatCoins(pkg.coin_cost)}
          </p>
        </div>

        <Coins
          size={17}
          className="mb-1 text-amber-400"
        />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-[10px] font-bold text-sky-500">
          Đổi ngay
        </span>

        <ChevronRight
          size={14}
          className="text-slate-300 transition group-hover:translate-x-0.5"
        />
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
  const isForcedVng = category === "robux" && version === "vng";

  const targetLabel =
    category === "robux"
      ? "Tên đăng nhập Roblox"
      : "ID tài khoản Liên Quân";

  const targetPlaceholder =
    category === "robux"
      ? "Nhập username Roblox..."
      : "Nhập ID game...";

  if (!selectedPackage) {
    return (
      <div
        id="store-order-panel"
        className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-white px-6 py-14 text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50">
          <Gift size={23} className="text-sky-400" />
        </div>

        <p className="mt-4 text-sm font-black text-slate-700">
          Chưa chọn gói thưởng
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Chọn 1 gói ở bên trái để bắt đầu đổi thưởng.
        </p>
      </div>
    );
  }

  return (
    <div
      id="store-order-panel"
      className="h-fit rounded-[24px] border border-sky-100 bg-white p-5 shadow-[0_12px_40px_rgba(14,165,233,0.08)]"
    >
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 transition hover:text-sky-600"
        >
          <ArrowLeft size={14} />
          Đổi gói khác
        </button>

        <ShieldCheck size={16} className="text-emerald-500" />
      </div>

      <div className="rounded-2xl bg-sky-50/70 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-sky-500">
          Gói đã chọn
        </p>

        <p className="mt-1 text-base font-black text-slate-900">
          {selectedPackage.name}
        </p>

        <div className="mt-2 flex items-center gap-1.5 text-sm font-black text-sky-600">
          <Coins size={15} />
          {formatCoins(selectedPackage.coin_cost)} Coin
        </div>
      </div>

      {!isForcedVng && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-bold text-slate-600">
            Phương thức nhận
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDeliveryMethod("direct")}
              className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                deliveryMethod === "direct"
                  ? "border-sky-300 bg-sky-500 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-500 hover:border-sky-200"
              }`}
            >
              Nhận trực tiếp
            </button>

            <button
              type="button"
              onClick={() => setDeliveryMethod("code")}
              className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                deliveryMethod === "code"
                  ? "border-sky-300 bg-sky-500 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-500 hover:border-sky-200"
              }`}
            >
              Nhận mã
            </button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <label className="mb-2 block text-xs font-bold text-slate-600">
          {targetLabel}
        </label>

        <input
          type="text"
          value={deliveryTarget}
          onChange={(event) => setDeliveryTarget(event.target.value)}
          placeholder={targetPlaceholder}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
        />
      </div>

      <button
        type="button"
        disabled={!canRedeem}
        onClick={onRedeem}
        className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-black shadow-lg transition ${
          canRedeem
            ? "bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-sky-500/25 hover:-translate-y-0.5"
            : "cursor-not-allowed bg-slate-100 text-slate-400 shadow-none"
        }`}
      >
        {redeeming ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Đang xử lý...
          </>
        ) : (
          "Xác nhận đổi thưởng"
        )}
      </button>
    </div>
  );
}

function History({ history, copied, onCopy }) {
  if (!history?.length) {
    return (
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-black">
          Lịch sử đổi thưởng
        </h2>

        <div className="rounded-[24px] border border-dashed border-slate-200 bg-white px-5 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50">
            <Clock3 size={23} className="text-sky-400" />
          </div>

          <p className="mt-4 text-sm font-black text-slate-700">
            Chưa có đơn nào
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Đơn đổi thưởng của bạn sẽ hiện ở đây.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-black">
        Lịch sử đổi thưởng
      </h2>

      <div className="space-y-3">
        {history.map((order) => {
          const status =
            statusConfig[order.status] || statusConfig.pending;
          const StatusIcon = status.icon;

          return (
            <div
              key={order.id}
              className="rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-900">
                    {order.package_name || "Gói đổi thưởng"}
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {formatDate(order.created_at)}
                  </p>
                </div>

                <span
                  className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${status.className}`}
                >
                  <StatusIcon size={12} />
                  {status.label}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600">
                  <Coins size={13} />
                  {formatCoins(order.coin_cost)} Coin
                </div>

                {order.order_code && (
                  <button
                    type="button"
                    onClick={() => onCopy(order.order_code)}
                    className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold text-slate-500 transition hover:bg-slate-100"
                  >
                    {copied === order.order_code ? (
                      <>
                        <Check size={11} className="text-emerald-500" />
                        Đã chép
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        {order.order_code}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
            }
