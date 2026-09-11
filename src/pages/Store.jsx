import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  History as HistoryIcon,
  Loader2,
  QrCode,
  ShieldCheck,
  Sparkles,
  Swords,
  XCircle,
} from "lucide-react";

import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";
import TopHeader from "../components/TopHeader.jsx";

const ADMIN_CHAT_ID = 6152450878;

// ZaloPay configuration is server-side. The frontend only calls Supabase Edge Functions.
const ZALOPAY_CONFIG = {
  robux40Amount: 14500,
  fee: 0,
  expiresMinutes: 15,
};

const createLocalOrderCode = (prefix = "RB40") => {
  const time = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}${time}${random}`;
};

const createQrImageUrl = (qrCode) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=8&data=${encodeURIComponent(qrCode)}`;

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
  processing: {
    label: "Đang xử lý",
    icon: Clock3,
    className: "bg-amber-50 text-amber-600 border-amber-100",
  },
  success: {
    label: "Thành công",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  completed: {
    label: "Hoàn thành",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-600 border-emerald-100",
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
  const [paymentMethod, setPaymentMethod] = useState("coins");
  const [zaloPayPayment, setZaloPayPayment] = useState(null);

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
    setPaymentMethod("coins");

    if (nextCategory === "robux") {
      setVersion("vng");
    }
  };

  const selectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setDeliveryMethod("");
    setDeliveryTarget("");
    setPaymentMethod("coins");

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
    setPaymentMethod("coins");
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
    !!paymentMethod &&
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

    // ZaloPay order must be created on the server so app_id/key1/key2 never reach the browser.
    if (paymentMethod === "zalopay") {
      const amount = Number(selectedPackage.price_vnd || ZALOPAY_CONFIG.robux40Amount);
      const localOrderCode = createLocalOrderCode("RB40");
      setRedeeming(true);

      try {
        const { data, error } = await supabase.functions.invoke(
          "create-zalopay-order",
          {
            body: {
              packageId: selectedPackage.id,
              packageName: selectedPackage.name,
              amount,
              deliveryTarget: deliveryTarget.trim(),
              localOrderCode,
            },
          }
        );

        if (error) throw error;
        if (!data?.success || !data?.qr_code) {
          throw new Error(data?.message || "ZaloPay không tạo được đơn thanh toán.");
        }

        setZaloPayPayment({
          paymentId: data.payment_id,
          orderCode: data.order_code || localOrderCode,
          appTransId: data.app_trans_id,
          amount: Number(data.amount || amount),
          fee: 0,
          total: Number(data.amount || amount),
          qrCode: data.qr_code,
          qrUrl: createQrImageUrl(data.qr_code),
          orderUrl: data.order_url,
          packageName: selectedPackage.name,
          deliveryTarget: deliveryTarget.trim(),
          expiresAt: Date.now() + ZALOPAY_CONFIG.expiresMinutes * 60 * 1000,
        });
      } catch (error) {
        showToast(error?.message || "Không thể tạo giao dịch ZaloPay.", "error");
      } finally {
        setRedeeming(false);
      }

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
      setPaymentMethod("coins");
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

  if (zaloPayPayment) {
    return (
      <ZaloPayPaymentPage
        payment={zaloPayPayment}
        onCancel={() => setZaloPayPayment(null)}
        onDone={() => {
          setZaloPayPayment(null);
          showToast(`Đã ghi nhận giao dịch ${zaloPayPayment.orderCode}.`);
        }}
        onCopy={copyOrderCode}
        copied={copied}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC] pb-28 text-slate-900">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-sky-300/10 blur-3xl" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>

      <TopHeader />

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

        {toast && (
          <div
            className={`fixed left-1/2 top-4 z-50 flex w-[calc(100%-32px)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-xl ${
              toast.type === "error"
                  ? "border-rose-200 bg-white/95 text-rose-700"
                  : "border-emerald-200 bg-white/95 text-emerald-700"
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
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            canRedeem={canRedeem}
            redeeming={redeeming}
            onRedeem={handleRedeem}
            onBack={backToPackages}
          />
        </div>

        <History history={history} />
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
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-orange-100 transition hover:text-orange-500"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-400">
            Cửa hàng
          </p>

          <h1 className="text-xl font-black text-slate-900">
            Cộng Sản Thưởng
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-orange-100 bg-white px-3 py-2 shadow-sm">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
          <Coins size={17} className="text-amber-500" />
        </div>

        <div className="leading-none">
          <p className="text-[9px] font-medium text-slate-400">
            Số xu
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
    <section className="relative mb-5 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#ffd9df] via-[#ffe9d5] to-[#fff5c7] px-5 py-5 shadow-[0_12px_35px_rgba(244,165,28,0.12)] sm:px-6">
      <div className="absolute -right-10 -top-8 h-36 w-36 rounded-full bg-pink-300/30 blur-2xl" />
      <div className="absolute -bottom-16 left-1/3 h-32 w-32 rounded-full bg-yellow-300/30 blur-2xl" />

      <div className="relative flex items-center justify-between gap-4">
        <div className="max-w-[68%]">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-[10px] font-bold text-orange-500">
            <Sparkles size={12} />
            NHẬN THƯỞNG MỖI NGÀY
          </div>

          <h2 className="text-xl font-black leading-tight text-slate-900 sm:text-2xl">
            Đổi xu lấy
            <span className="text-pink-500"> phần thưởng</span>
          </h2>

          <p className="mt-2 text-[11px] leading-5 text-slate-600 sm:text-sm">
            Dùng xu của bạn để đổi Robux, Quân Huy và nhiều phần quà hấp dẫn.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/85 px-3 py-2 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
              <Coins size={19} className="text-amber-500" />
            </div>

            <div>
              <p className="text-[10px] text-slate-400">
                Xu hiện có
              </p>

              <p className="text-lg font-black text-slate-900">
                {formatCoins(balance)}
              </p>
            </div>
          </div>
        </div>

        <div className="hidden h-28 w-28 shrink-0 items-center justify-center rounded-full bg-white/50 sm:flex">
          <Gift size={58} strokeWidth={1.5} className="text-pink-400" />
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
  <div className="flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible">
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
  const gameName =
    pkg.game_name ||
    (category === "robux" ? "Roblox" : "Liên Quân Mobile");

  const gameLogo =
    pkg.game_logo ||
    (category === "robux"
      ? "/images/games/roblox.png"
      : "/images/games/lien-quan.png");

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative min-w-[160px] overflow-hidden rounded-[18px] border bg-white p-2 text-left transition ${
        selected
          ? "border-pink-400 ring-2 ring-pink-100"
          : "border-slate-100 shadow-sm hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      {selected && (
        <div className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-pink-500 text-white">
          <Check size={13} strokeWidth={3} />
        </div>
      )}

      <div className="flex h-[105px] items-center justify-center overflow-hidden rounded-[14px] bg-gradient-to-br from-pink-100 to-orange-100">
        {pkg.image_url ? (
          <img
            src={pkg.image_url}
            alt={pkg.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <Gift size={38} className="text-pink-400" />
        )}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <img
          src={gameLogo}
          alt={gameName}
          className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-100"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold text-slate-400">
            {gameName}
          </p>

          <p className="truncate text-xs font-black text-slate-900">
            {pkg.name}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
        <div className="flex items-center gap-1">
          <Coins size={14} className="text-amber-500" />

          <span className="text-xs font-black text-orange-500">
            {formatCoins(pkg.coin_cost)} xu
          </span>
        </div>

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
  paymentMethod,
  setPaymentMethod,
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

      {category === "robux" && String(selectedPackage.name || "").toLowerCase().includes("40") && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-bold text-slate-600">
            Phương thức thanh toán
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("coins")}
              className={`rounded-xl border px-3 py-3 text-left transition ${
                paymentMethod === "coins"
                  ? "border-amber-300 bg-amber-50 ring-1 ring-amber-200"
                  : "border-slate-200 bg-white hover:border-amber-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Coins size={17} className="text-amber-500" />
                <div>
                  <p className="text-xs font-black text-slate-800">Dùng xu</p>
                  <p className="text-[10px] text-slate-400">{formatCoins(selectedPackage.coin_cost)} xu</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("zalopay")}
              className={`rounded-xl border px-3 py-3 text-left transition ${
                paymentMethod === "zalopay"
                  ? "border-sky-300 bg-sky-50 ring-1 ring-sky-200"
                  : "border-slate-200 bg-white hover:border-sky-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <QrCode size={17} className="text-sky-500" />
                <div>
                  <p className="text-xs font-black text-slate-800">ZaloPay / VietQR</p>
                  <p className="text-[10px] text-slate-400">14.500đ</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

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

function ZaloPayPaymentPage({ payment, onCancel, onDone, onCopy, copied }) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((payment.expiresAt - Date.now()) / 1000))
  );
  const [showCancel, setShowCancel] = useState(false);
  const [cancelCountdown, setCancelCountdown] = useState(3);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const left = Math.max(
        0,
        Math.floor((payment.expiresAt - Date.now()) / 1000)
      );
      setSecondsLeft(left);
      if (left <= 0) window.clearInterval(timer);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [payment.expiresAt]);

  useEffect(() => {
    if (!showCancel) return;

    setCancelCountdown(3);
    const timer = window.setInterval(() => {
      setCancelCountdown((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [showCancel]);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");
  const expired = secondsLeft <= 0;
  const [paymentStatus, setPaymentStatus] = useState("PENDING");

  useEffect(() => {
    let active = true;

    const check = async () => {
      if (!payment.paymentId || paymentStatus === "PAID") return;

      const { data } = await supabase
        .from("payment_orders")
        .select("status")
        .eq("id", payment.paymentId)
        .maybeSingle();

      if (!active) return;
      if (data?.status) setPaymentStatus(String(data.status).toUpperCase());
    };

    check();
    const timer = window.setInterval(check, 4000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [payment.paymentId, paymentStatus]);

  useEffect(() => {
    if (paymentStatus === "PAID") {
      onDone();
    }
  }, [paymentStatus, onDone]);

  return (
    <div className="min-h-screen bg-[#F7FAFC] pb-10 text-slate-900">
      <TopHeader />

      <main className="mx-auto w-full max-w-lg px-4 py-5">
        <button
          type="button"
          onClick={onCancel}
          className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-500"
        >
          <ArrowLeft size={17} />
          Quay lại cửa hàng
        </button>

        <section className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
          <div className="bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                <QrCode size={23} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                  Thanh toán ZaloPay
                </p>
                <h1 className="text-lg font-black">Quét mã để thanh toán</h1>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Đơn hàng
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-900">
                    {payment.packageName}
                  </p>
                </div>
                <p className="text-lg font-black text-sky-600">
                  {formatCoins(payment.total)}đ
                </p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-white p-3">
                  <p className="text-slate-400">Tiền hàng</p>
                  <p className="mt-1 font-black">{formatCoins(payment.amount)}đ</p>
                </div>
                <div className="rounded-xl bg-white p-3">
                  <p className="text-slate-400">Phí</p>
                  <p className="mt-1 font-black">{formatCoins(payment.fee)}đ</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-center">
              <div className="rounded-3xl border border-slate-100 bg-white p-3 shadow-sm">
                {expired ? (
                  <div className="flex h-[280px] w-[280px] items-center justify-center rounded-2xl bg-slate-100 text-center">
                    <div>
                      <Clock3 className="mx-auto text-slate-400" size={32} />
                      <p className="mt-2 text-sm font-black text-slate-600">Mã QR đã hết hạn</p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={payment.qrUrl}
                    alt={`QR thanh toán ${payment.orderCode}`}
                    className="h-[280px] w-[280px] rounded-2xl object-contain"
                  />
                )}
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-[11px] font-semibold text-slate-400">Thời gian còn lại</p>
              <p className={`mt-1 text-xl font-black ${expired ? "text-rose-500" : "text-slate-900"}`}>
                {minutes}:{seconds}
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50 p-4">
              <p className="text-xs font-black text-sky-700">Mã đơn hàng</p>
              <button
                type="button"
                onClick={() => onCopy(payment.orderCode)}
                className="mt-2 flex w-full items-center justify-between gap-2 rounded-xl bg-white px-3 py-3 text-left ring-1 ring-sky-100"
              >
                <span className="truncate text-sm font-black text-slate-900">
                  {payment.orderCode}
                </span>
                {copied === payment.orderCode ? (
                  <Check size={16} className="shrink-0 text-emerald-500" />
                ) : (
                  <Copy size={16} className="shrink-0 text-sky-500" />
                )}
              </button>

              <div className="mt-3 text-xs leading-5 text-sky-700">
                <p>Quét QR bằng ZaloPay hoặc ứng dụng ngân hàng hỗ trợ NAPAS VietQR.</p>
                <p className="mt-1">Không cần tự nhập nội dung chuyển khoản.</p>
              </div>
            </div>

            <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">
              Vui lòng chuyển đúng số tiền và giữ nguyên nội dung chuyển khoản để hệ thống đối soát.
            </p>

            <div className={`mt-4 rounded-2xl px-4 py-3.5 text-center text-sm font-black ${paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
              {paymentStatus === "PAID" ? "✓ Thanh toán thành công" : "Đang tự động kiểm tra thanh toán..."}
            </div>

            <button
              type="button"
              onClick={() => setShowCancel(true)}
              className="mt-3 w-full rounded-2xl px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50"
            >
              Hủy giao dịch
            </button>
          </div>
        </section>
      </main>

      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50">
              <XCircle size={24} className="text-rose-500" />
            </div>
            <h2 className="mt-4 text-center text-lg font-black">Hủy giao dịch?</h2>
            <p className="mt-2 text-center text-xs leading-5 text-slate-500">
              Nếu bạn đã chuyển khoản, không nên hủy vì mã đơn sẽ không còn được dùng cho giao dịch này.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowCancel(false)}
                className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600"
              >
                Quay lại
              </button>
              <button
                type="button"
                disabled={cancelCountdown > 0}
                onClick={onCancel}
                className="rounded-xl bg-rose-500 px-4 py-3 text-sm font-black text-white disabled:opacity-50"
              >
                {cancelCountdown > 0 ? `Hủy sau ${cancelCountdown}s` : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function History({ history }) {
  const navigate = useNavigate();

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-500">
            Giao dịch
          </p>
          <h2 className="mt-1 text-lg font-black text-slate-900">Lịch sử</h2>
        </div>

        <button
          type="button"
          onClick={() => navigate("/history")}
          className="flex items-center gap-1.5 rounded-xl bg-sky-50 px-3 py-2 text-xs font-black text-sky-600 transition hover:bg-sky-100"
        >
          <HistoryIcon size={14} />
          Xem tất cả
        </button>
      </div>

      {!history.length ? (
        <div className="rounded-[24px] border border-dashed border-sky-100 bg-white px-5 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50">
            <HistoryIcon size={23} className="text-sky-400" />
          </div>
          <p className="mt-4 text-sm font-black text-slate-700">
            Chưa có giao dịch
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Các đơn của bạn sẽ hiện ở đây.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {history.slice(0, 5).map((order) => {
            const status =
              statusConfig[String(order.status || "").toLowerCase()] ||
              statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <button
                key={order.id}
                type="button"
                onClick={() =>
                  navigate(`/history/order/${encodeURIComponent(order.id)}`)
                }
                className="group w-full rounded-[20px] border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-500">
                    <Gift size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-900">
                          {order.package_name || "Giao dịch"}
                        </p>
                        <p className="mt-1 text-[10px] font-medium text-slate-400">
                          {formatDate(order.created_at)}
                        </p>
                      </div>

                      <span
                        className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${status.className}`}
                      >
                        <StatusIcon size={11} />
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="flex items-center gap-1.5 text-xs font-black text-sky-600">
                        <Coins size={14} />
                        {formatCoins(order.coin_cost)} xu
                      </span>

                      <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                        Chi tiết
                        <ChevronRight
                          size={15}
                          className="transition group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
