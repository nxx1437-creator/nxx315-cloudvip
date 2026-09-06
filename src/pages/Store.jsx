import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Coins,
  Copy,
  Gamepad2,
  Gift,
  Home,
  Loader2,
  Menu,
  ShieldCheck,
  Sparkles,
  Star,
  Swords,
  User,
  Wallet,
  Zap,
  X,
  XCircle,
} from "lucide-react";

import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";

const formatCoins = (value) => {
  return Number(value || 0).toLocaleString("vi-VN");
};

const formatDate = (value) => {
  if (!value) return "";

  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusMap = {
  pending: {
    text: "Đang xử lý",
    className: "bg-orange-50 text-orange-500",
    icon: Clock3,
  },

  delivered: {
    text: "Đã giao",
    className: "bg-green-50 text-green-600",
    icon: CheckCircle2,
  },

  rejected: {
    text: "Từ chối",
    className: "bg-red-50 text-red-500",
    icon: XCircle,
  },

  cancelled: {
    text: "Đã hủy",
    className: "bg-gray-100 text-gray-500",
    icon: XCircle,
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
    setToast({
      message,
      type,
    });

    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const loadStore = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [packageResponse, historyResponse] =
        await Promise.all([
          supabase
            .from("redemption_packages")
            .select("*")
            .eq("active", true)
            .order("sort_order", {
              ascending: true,
            }),

          supabase
            .from("redemption_orders")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", {
              ascending: false,
            }),
        ]);

      if (packageResponse.error) {
        console.error(
          "Package error:",
          packageResponse.error
        );
      }

      if (historyResponse.error) {
        console.error(
          "History error:",
          historyResponse.error
        );
      }

      setPackages(packageResponse.data || []);
      setHistory(historyResponse.data || []);
    } catch (error) {
      console.error("Store loading error:", error);

      showToast(
        "Không thể tải dữ liệu cửa hàng.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStore();
  }, [userId]);

  const filteredPackages = useMemo(() => {
    return packages.filter((item) => {
      const type = String(
        item.reward_type || ""
      ).toLowerCase();

      const itemVersion = String(
        item.version || ""
      ).toLowerCase();

      if (category === "quanhuy") {
        if (type) {
          return (
            type === "quan_huy" ||
            type === "quanhuy" ||
            type === "quan huy"
          );
        }

        const name = String(
          item.name || ""
        ).toLowerCase();

        return (
          name.includes("quân huy") ||
          name.includes("quan huy")
        );
      }

      if (type && type !== "robux") {
        return false;
      }

      if (itemVersion) {
        return itemVersion === version;
      }

      return true;
    });
  }, [
    packages,
    category,
    version,
  ]);

  const changeCategory = (value) => {
    setCategory(value);
    setSelectedPackage(null);
    setDeliveryMethod("");
    setDeliveryTarget("");

    if (value === "robux") {
      setVersion("vng");
    }
  };

  const changeVersion = (value) => {
    setVersion(value);
    setSelectedPackage(null);
    setDeliveryMethod("");
    setDeliveryTarget("");
  };

  const selectPackage = (item) => {
    setSelectedPackage(item);
    setDeliveryMethod("");
    setDeliveryTarget("");

    if (
      category === "robux" &&
      version === "vng"
    ) {
      setDeliveryMethod("vng");
    }

    setTimeout(() => {
      document
        .getElementById("exchange-box")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 100);
  };

  const refreshHistory = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("redemption_orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false,
      });

    if (!error) {
      setHistory(data || []);
    }
  };

  const handleRedeem = async () => {
    if (!userId) {
      showToast(
        "Vui lòng đăng nhập trước.",
        "error"
      );
      return;
    }

    if (!selectedPackage) {
      showToast(
        "Bạn chưa chọn gói phần thưởng.",
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
        `Bạn cần thêm ${formatCoins(
          cost - balance
        )} xu.`,
        "error"
      );
      return;
    }

    if (!deliveryTarget.trim()) {
      showToast(
        "Vui lòng nhập thông tin nhận thưởng.",
        "error"
      );
      return;
    }

    setRedeeming(true);

    try {
      const { data, error } =
        await supabase.rpc(
          "create_redemption_order",
          {
            p_user_id: userId,
            p_package_id:
              selectedPackage.id,
            p_delivery_method:
              deliveryMethod || "account",
            p_delivery_target:
              deliveryTarget.trim(),
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
            "Không thể tạo đơn đổi thưởng."
        );
      }

      if (typeof setProfile === "function") {
        setProfile((old) => ({
          ...old,
          coins:
            result.coins_remaining,
        }));
      }

      await refreshHistory();

      showToast(
        result.order_code
          ? `Đổi thưởng thành công • ${result.order_code}`
          : "Đổi thưởng thành công!"
      );

      setSelectedPackage(null);
      setDeliveryMethod("");
      setDeliveryTarget("");
    } catch (error) {
      console.error(
        "Redeem error:",
        error
      );

      showToast(
        error?.message ||
          "Đổi thưởng thất bại.",
        "error"
      );
    } finally {
      setRedeeming(false);
    }
  };

  const copyCode = async (code) => {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(
        code
      );

      setCopied(code);

      setTimeout(() => {
        setCopied("");
      }, 1500);
    } catch {
      showToast(
        "Không thể sao chép.",
        "error"
      );
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f5f7] pb-28 text-[#151827]">

      {toast && (
        <div
          className={`fixed left-1/2 top-4 z-[100] flex w-[calc(100%-32px)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-2xl ${
            toast.type === "error"
              ? "border-red-200 text-red-600"
              : "border-green-200 text-green-600"
          }`}
        >
          {toast.type === "error" ? (
            <XCircle size={19} />
          ) : (
            <CheckCircle2 size={19} />
          )}

          <span className="text-sm font-bold">
            {toast.message}
          </span>
        </div>
      )}

      <StoreHeader
        balance={profile?.coins}
        onBack={() =>
          window.history.back()
        }
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6">

        <PageTitle
          balance={profile?.coins}
          onBack={() =>
            window.history.back()
          }
        />

        <Hero
          balance={profile?.coins}
        />

        <BalanceSection
          balance={profile?.coins}
        />

        <CategorySection
          category={category}
          onChange={changeCategory}
        />

        {category === "robux" && (
          <VersionSection
            version={version}
            onChange={changeVersion}
          />
        )}

        <RewardSection
          packages={filteredPackages}
          loading={loading}
          selectedPackage={selectedPackage}
          onSelect={selectPackage}
        />

        <ExchangeBox
          selectedPackage={selectedPackage}
          category={category}
          version={version}
          deliveryMethod={deliveryMethod}
          setDeliveryMethod={setDeliveryMethod}
          deliveryTarget={deliveryTarget}
          setDeliveryTarget={setDeliveryTarget}
          redeeming={redeeming}
          onRedeem={handleRedeem}
          onClose={() => {
            setSelectedPackage(null);
            setDeliveryMethod("");
            setDeliveryTarget("");
          }}
        />

        <RecentSection
          packages={packages}
          onSelect={selectPackage}
        />

        <ExploreSection />

        <HistorySection
          history={history}
          copied={copied}
          onCopy={copyCode}
        />

      </main>

      <BottomNavigation />
    </div>
  );
}
function StoreHeader({
  balance,
  onBack,
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-3 px-4">

        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100"
        >
          <ArrowLeft size={21} />
        </button>

        <div className="flex items-center gap-1 text-lg font-black">
          <span>
            NXX315
          </span>

          <span className="text-cyan-500">
            Studio
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">

          <div className="hidden items-center gap-2 rounded-full border border-gray-100 bg-white px-3 py-2 shadow-sm sm:flex">

            <Coins
              size={17}
              className="text-yellow-500"
            />

            <span className="text-sm font-black">
              {formatCoins(balance)}
            </span>

          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100"
          >
            <Bell size={19} />
          </button>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100"
          >
            <Menu size={20} />
          </button>

        </div>
      </div>
    </header>
  );
}

function PageTitle({
  balance,
  onBack,
}) {
  return (
    <section className="flex items-center justify-between gap-4 py-5">

      <div className="flex items-center gap-4">

        <button
          type="button"
          onClick={onBack}
          className="hidden h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100 sm:flex"
        >
          <ArrowLeft size={26} />
        </button>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-pink-500">
            CỬA HÀNG
          </p>

          <h1 className="mt-1 text-3xl font-black leading-tight sm:text-4xl">
            Cộng Sản
            <br className="sm:hidden" /> Thưởng
          </h1>
        </div>

      </div>

      <div className="flex shrink-0 items-center gap-2 rounded-[25px] bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-yellow-100">
          <Coins
            size={22}
            className="text-yellow-500"
          />
        </div>

        <div>
          <p className="text-[10px] text-gray-400">
            Số xu
          </p>

          <p className="text-lg font-black">
            {formatCoins(balance)}
          </p>
        </div>

      </div>
    </section>
  );
}

function Hero({ balance }) {
  return (
    <section className="relative mb-6 min-h-[330px] overflow-hidden rounded-[35px] bg-gradient-to-br from-[#d9ecff] via-[#fbe3f4] to-[#fff0b9] shadow-[0_20px_60px_rgba(220,100,180,0.15)]">

      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-300/30 blur-3xl" />

      <div className="absolute right-[-50px] top-[-50px] h-72 w-72 rounded-full bg-pink-300/30 blur-3xl" />

      <div className="absolute bottom-[-100px] left-1/3 h-72 w-72 rounded-full bg-yellow-300/40 blur-3xl" />

      <Sparkles
        size={20}
        className="absolute left-[55%] top-8 text-white"
      />

      <Sparkles
        size={15}
        className="absolute right-[25%] top-16 text-white"
      />

      <Star
        size={28}
        fill="currentColor"
        className="absolute right-8 top-7 text-pink-300"
      />

      <div className="relative z-10 flex min-h-[330px] items-center px-6 py-8 sm:px-10 lg:px-14">

        <div className="max-w-[580px]">

          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2.5 text-xs font-black text-pink-500 shadow-md">
            <Sparkles size={15} />
            SĂN QUÀ MỖI NGÀY
          </div>

          <h2 className="text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl">

            Đổi xu lấy

            <span className="block bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              phần thưởng
            </span>

          </h2>

          <p className="mt-4 max-w-[510px] text-sm leading-6 text-gray-600 sm:text-base">
            Dùng xu của bạn để đổi
            Robux, Quân Huy và nhiều
            phần quà hấp dẫn.
          </p>

          <div className="mt-5 inline-flex items-center gap-3 rounded-[22px] bg-white/90 px-4 py-3 shadow-lg">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <Coins
                size={25}
                className="text-yellow-500"
              />
            </div>

            <div>
              <p className="text-[10px] text-gray-400">
                Xu hiện có
              </p>

              <p className="text-xl font-black">
                {formatCoins(balance)}
              </p>
            </div>

          </div>

        </div>

        <div className="absolute bottom-0 right-5 hidden h-[290px] w-[330px] lg:block">

          <div className="absolute bottom-4 right-8 h-52 w-52 rounded-full bg-pink-200/50 blur-2xl" />

          <div className="absolute bottom-12 right-12 flex h-48 w-48 rotate-[-5deg] items-center justify-center rounded-[48%] bg-gradient-to-br from-pink-400 via-fuchsia-500 to-violet-500 shadow-2xl">

            <Gift
              size={105}
              strokeWidth={1.1}
              className="text-white"
            />

          </div>

          <div className="absolute bottom-0 right-0 h-20 w-64 rounded-t-[100%] bg-white/50 blur-sm" />

        </div>

      </div>
    </section>
  );
}

function BalanceSection({
  balance,
}) {
  return (
    <section className="mb-7 grid gap-4 md:grid-cols-2">

      <div className="relative overflow-hidden rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-gray-100">

        <div className="absolute right-[-30px] top-[-30px] h-32 w-32 rounded-full bg-yellow-100 blur-2xl" />

        <div className="relative flex items-center gap-4">

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-yellow-300 to-orange-400 shadow-lg shadow-orange-200">
            <Coins
              size={30}
              className="text-white"
            />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-wider text-gray-400">
              VÍ XU CỦA BẠN
            </p>

            <p className="mt-1 text-2xl font-black">
              {formatCoins(balance)}

              <span className="ml-1 text-sm text-orange-500">
                xu
              </span>
            </p>
          </div>

        </div>
      </div>

      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-violet-500 to-fuchsia-500 p-5 text-white shadow-lg shadow-fuchsia-200">

        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex items-center gap-4">

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-white/15">
            <Zap size={31} />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-wider text-white/70">
              ƯU ĐÃI
            </p>

            <p className="mt-1 text-xl font-black">
              Đổi quà nhanh chóng
            </p>

            <p className="mt-1 text-xs text-white/75">
              Chọn gói → nhập thông tin → xác nhận
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}

function CategorySection({
  category,
  onChange,
}) {
  return (
    <section className="mb-5">

      <div className="mb-3 flex items-center justify-between">

        <h2 className="text-xl font-black">
          Danh mục phần thưởng
        </h2>

        <Sparkles
          size={19}
          className="text-orange-400"
        />

      </div>

      <div className="grid grid-cols-2 gap-3">

        <button
          type="button"
          onClick={() =>
            onChange("robux")
          }
          className={`rounded-[24px] border p-4 text-left transition ${
            category === "robux"
              ? "border-pink-300 bg-pink-50 shadow-lg shadow-pink-100"
              : "border-gray-100 bg-white"
          }`}
        >

          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100">
            <Gamepad2
              size={24}
              className="text-pink-500"
            />
          </div>

          <p className="font-black">
            Robux
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Đổi Robux bằng xu
          </p>

        </button>

        <button
          type="button"
          onClick={() =>
            onChange("quanhuy")
          }
          className={`rounded-[24px] border p-4 text-left transition ${
            category === "quanhuy"
              ? "border-orange-300 bg-orange-50 shadow-lg shadow-orange-100"
              : "border-gray-100 bg-white"
          }`}
        >

          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100">
            <Swords
              size={24}
              className="text-orange-500"
            />
          </div>

          <p className="font-black">
            Quân Huy
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Phần thưởng Liên Quân
          </p>

        </button>

      </div>
    </section>
  );
}

function VersionSection({
  version,
  onChange,
}) {
  return (
    <section className="mb-6">

      <div className="mb-3 flex items-center justify-between">

        <h3 className="text-sm font-black">
          Chọn phiên bản Robux
        </h3>

        <span className="text-[10px] text-gray-400">
          Hình thức nhận
        </span>

      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">

        <button
          type="button"
          onClick={() =>
            onChange("vng")
          }
          className={`whitespace-nowrap rounded-full px-5 py-3 text-xs font-black transition ${
            version === "vng"
              ? "bg-pink-500 text-white shadow-lg shadow-pink-200"
              : "bg-white text-gray-500 ring-1 ring-gray-100"
          }`}
        >
          🇻🇳 Robux Việt Nam
        </button>

        <button
          type="button"
          onClick={() =>
            onChange("global")
          }
          className={`whitespace-nowrap rounded-full px-5 py-3 text-xs font-black transition ${
            version === "global"
              ? "bg-violet-500 text-white shadow-lg shadow-violet-200"
              : "bg-white text-gray-500 ring-1 ring-gray-100"
          }`}
        >
          🌎 Robux Global
        </button>

      </div>
    </section>
  );
}
function RewardSection({
  packages,
  loading,
  selectedPackage,
  onSelect,
}) {
  return (
    <section className="mb-7">

      <div className="mb-4 flex items-end justify-between">

        <div>

          <div className="flex items-center gap-2">

            <span className="text-xl">
              ✨
            </span>

            <h2 className="text-2xl font-black">
              Đề xuất cho bạn
            </h2>

          </div>

          <p className="mt-1 text-xs text-gray-400">
            Chọn phần thưởng bạn muốn đổi
          </p>

        </div>

        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-gray-400 shadow-sm">
          {packages.length} gói
        </span>

      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="h-56 animate-pulse rounded-[28px] bg-white"
              />
            )
          )}

        </div>
      ) : packages.length === 0 ? (
        <div className="rounded-[28px] bg-white px-5 py-14 text-center shadow-sm">

          <Gift
            size={42}
            className="mx-auto mb-3 text-gray-300"
          />

          <p className="font-black text-gray-600">
            Chưa có gói thưởng
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Hiện chưa có phần thưởng phù hợp.
          </p>

        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

          {packages.map((item) => (
            <RewardCard
              key={item.id}
              item={item}
              selected={
                selectedPackage?.id ===
                item.id
              }
              onClick={() =>
                onSelect(item)
              }
            />
          ))}

        </div>
      )}
    </section>
  );
}

function RewardCard({
  item,
  selected,
  onClick,
}) {
  const image =
    item.image_url ||
    item.image ||
    item.icon_url ||
    "";

  const cost = Number(
    item.coin_cost || 0
  );

  const amount =
    item.reward_amount ||
    item.amount ||
    "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[28px] border bg-white text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl ${
        selected
          ? "border-pink-400 ring-2 ring-pink-200"
          : "border-gray-100"
      }`}
    >

      {item.badge && (
        <div className="absolute left-3 top-3 z-10 rounded-full bg-pink-500 px-2.5 py-1 text-[9px] font-black text-white shadow-md">
          {item.badge}
        </div>
      )}

      <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50">

        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-pink-200/50 blur-2xl" />

        <div className="absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-yellow-200/50 blur-2xl" />

        {image ? (
          <img
            src={image}
            alt={item.name || "Phần thưởng"}
            className="relative z-10 h-28 w-28 object-contain drop-shadow-xl transition duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-[28px] bg-white shadow-lg">

            <Gift
              size={43}
              className="text-pink-400"
            />

          </div>
        )}

      </div>

      <div className="p-4">

        <p className="line-clamp-2 min-h-[40px] text-sm font-black text-gray-800">
          {item.name ||
            (amount
              ? `${amount} phần thưởng`
              : "Gói phần thưởng")}
        </p>

        <div className="mt-3 flex items-center justify-between gap-2">

          <div className="flex items-center gap-1.5">

            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-100">
              <Coins
                size={14}
                className="text-yellow-500"
              />
            </div>

            <span className="text-sm font-black text-orange-500">
              {formatCoins(cost)}
            </span>

          </div>

          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
              selected
                ? "bg-pink-500 text-white"
                : "bg-gray-50 text-gray-400 group-hover:bg-pink-50 group-hover:text-pink-500"
            }`}
          >
            {selected ? (
              <Check size={15} />
            ) : (
              <ChevronRight size={16} />
            )}
          </div>

        </div>

      </div>
    </button>
  );
}

function ExchangeBox({
  selectedPackage,
  category,
  version,
  deliveryMethod,
  setDeliveryMethod,
  deliveryTarget,
  setDeliveryTarget,
  redeeming,
  onRedeem,
  onClose,
}) {
  if (!selectedPackage) {
    return null;
  }

  const cost = Number(
    selectedPackage.coin_cost || 0
  );

  const reward =
    selectedPackage.reward_amount ||
    selectedPackage.amount ||
    selectedPackage.name ||
    "Phần thưởng";

  const isVng =
    category === "robux" &&
    version === "vng";

  return (
    <section
      id="exchange-box"
      className="mb-7 overflow-hidden rounded-[30px] bg-white shadow-xl ring-1 ring-gray-100"
    >

      <div className="flex items-center justify-between bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 px-5 py-5 text-white">

        <div>

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
            XÁC NHẬN ĐỔI THƯỞNG
          </p>

          <h3 className="mt-1 text-xl font-black">
            {selectedPackage.name ||
              "Gói phần thưởng"}
          </h3>

        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
        >
          <X size={19} />
        </button>

      </div>

      <div className="space-y-5 p-5">

        <div className="grid grid-cols-2 gap-3">

          <div className="rounded-2xl bg-gray-50 p-3">

            <p className="text-[10px] text-gray-400">
              Phần thưởng
            </p>

            <p className="mt-1 text-base font-black">
              {reward}
            </p>

          </div>

          <div className="rounded-2xl bg-yellow-50 p-3">

            <p className="text-[10px] text-yellow-600">
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

            <p className="mb-2 text-xs font-black">
              Phương thức nhận
            </p>

            <div className="grid grid-cols-2 gap-2">

              <button
                type="button"
                onClick={() =>
                  setDeliveryMethod(
                    "account"
                  )
                }
                className={`rounded-2xl border p-3 text-left ${
                  deliveryMethod ===
                  "account"
                    ? "border-pink-400 bg-pink-50"
                    : "border-gray-100 bg-white"
                }`}
              >

                <p className="text-xs font-black">
                  Tài khoản
                </p>

                <p className="mt-1 text-[9px] text-gray-400">
                  Nhận trực tiếp
                </p>

              </button>

              <button
                type="button"
                onClick={() =>
                  setDeliveryMethod(
                    "code"
                  )
                }
                className={`rounded-2xl border p-3 text-left ${
                  deliveryMethod ===
                  "code"
                    ? "border-pink-400 bg-pink-50"
                    : "border-gray-100 bg-white"
                }`}
              >

                <p className="text-xs font-black">
                  Mã quà
                </p>

                <p className="mt-1 text-[9px] text-gray-400">
                  Nhận mã
                </p>

              </button>

            </div>
          </div>
        )}

        <div>

          <p className="mb-2 text-xs font-black">
            {isVng
              ? "Thông tin tài khoản"
              : "Thông tin nhận thưởng"}
          </p>

          <input
            value={deliveryTarget}
            onChange={(event) =>
              setDeliveryTarget(
                event.target.value
              )
            }
            placeholder={
              isVng
                ? "Nhập UID / username"
                : "Nhập thông tin nhận thưởng"
            }
            className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100"
          />

        </div>

        <div className="flex items-start gap-2 rounded-2xl bg-green-50 p-3 text-green-700">

          <ShieldCheck
            size={18}
            className="mt-0.5 shrink-0"
          />

          <p className="text-[10px] leading-5">
            Hãy kiểm tra kỹ thông tin trước
            khi xác nhận đổi thưởng.
          </p>

        </div>

        <button
          type="button"
          disabled={
            redeeming ||
            !deliveryTarget.trim()
          }
          onClick={onRedeem}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-fuchsia-500 px-5 py-4 text-sm font-black text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >

          {redeeming ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />

              Đang xử lý...
            </>
          ) : (
            <>
              <Gift size={18} />

              Đổi ngay •{" "}
              {formatCoins(cost)} xu
            </>
          )}

        </button>

      </div>
    </section>
  );
                }
function RecentSection({
  packages,
  onSelect,
}) {
  const recent = packages.slice(0, 4);

  return (
    <section className="mb-7">

      <div className="mb-4 flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-black">
            Bạn chơi gần đây
          </h2>

          <p className="mt-1 text-xs text-gray-400">
            Những phần thưởng được quan tâm
          </p>

        </div>

        <ChevronRight
          size={20}
          className="text-gray-400"
        />

      </div>

      {recent.length === 0 ? (
        <div className="rounded-[28px] bg-white p-8 text-center shadow-sm">
          <Gamepad2
            size={36}
            className="mx-auto mb-3 text-gray-300"
          />

          <p className="text-sm font-black text-gray-500">
            Chưa có dữ liệu
          </p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">

          {recent.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() =>
                onSelect(item)
              }
              className="min-w-[155px] max-w-[170px] overflow-hidden rounded-[25px] bg-white text-left shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-lg"
            >

              <div className="flex h-28 items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50">

                {item.image_url ||
                item.image ||
                item.icon_url ? (
                  <img
                    src={
                      item.image_url ||
                      item.image ||
                      item.icon_url
                    }
                    alt=""
                    className="h-20 w-20 object-contain"
                  />
                ) : (
                  <Gift
                    size={38}
                    className="text-pink-400"
                  />
                )}

              </div>

              <div className="p-3">

                <p className="line-clamp-2 min-h-[36px] text-xs font-black">
                  {item.name ||
                    "Phần thưởng"}
                </p>

                <p className="mt-2 text-[10px] font-bold text-gray-400">
                  Đổi bằng xu
                </p>

              </div>

            </button>
          ))}

        </div>
      )}
    </section>
  );
}

function ExploreSection() {
  const items = [
    {
      icon: Gift,
      title: "Quà mỗi ngày",
      text: "Nhận thêm xu",
      className:
        "bg-gradient-to-br from-pink-100 to-orange-50",
    },

    {
      icon: Gamepad2,
      title: "Game thưởng",
      text: "Chơi nhận quà",
      className:
        "bg-gradient-to-br from-violet-100 to-blue-50",
    },

    {
      icon: Star,
      title: "Ưu đãi đặc biệt",
      text: "Gói giới hạn",
      className:
        "bg-gradient-to-br from-yellow-100 to-orange-50",
    },
  ];

  return (
    <section className="mb-8">

      <div className="mb-4">

        <h2 className="text-2xl font-black">
          Khám phá
        </h2>

        <p className="mt-1 text-xs text-gray-400">
          Nhiều cách nhận xu và phần thưởng
        </p>

      </div>

      <div className="grid gap-3 sm:grid-cols-3">

        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              type="button"
              key={item.title}
              className={`relative overflow-hidden rounded-[28px] p-5 text-left shadow-sm ${item.className}`}
            >

              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/40 blur-xl" />

              <div className="relative">

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 shadow-sm">

                  <Icon
                    size={23}
                    className="text-pink-500"
                  />

                </div>

                <p className="text-base font-black">
                  {item.title}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {item.text}
                </p>

              </div>

            </button>
          );
        })}

      </div>
    </section>
  );
}

function HistorySection({
  history,
  copied,
  onCopy,
}) {
  return (
    <section className="mb-8">

      <div className="mb-4 flex items-end justify-between">

        <div>

          <h2 className="text-2xl font-black">
            Lịch sử đổi thưởng
          </h2>

          <p className="mt-1 text-xs text-gray-400">
            Theo dõi những đơn đã đổi
          </p>

        </div>

        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-gray-400 shadow-sm">
          {history.length} đơn
        </span>

      </div>

      {history.length === 0 ? (
        <div className="rounded-[28px] bg-white px-5 py-12 text-center shadow-sm">

          <Clock3
            size={38}
            className="mx-auto mb-3 text-gray-300"
          />

          <p className="text-sm font-black text-gray-500">
            Chưa có lịch sử đổi thưởng
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Các đơn của bạn sẽ xuất hiện ở đây.
          </p>

        </div>
      ) : (
        <div className="space-y-3">

          {history.map((order) => {

            const config =
              statusMap[
                order.status
              ] ||
              statusMap.pending;

            const StatusIcon =
              config.icon;

            const code =
              order.order_code ||
              order.code ||
              "";

            const cost =
              order.coin_cost ||
              order.cost ||
              0;

            return (
              <div
                key={order.id}
                className="rounded-[25px] bg-white p-4 shadow-sm ring-1 ring-gray-100"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <p className="truncate text-sm font-black">
                      {order.package_name ||
                        order.reward_name ||
                        order.name ||
                        "Đơn đổi thưởng"}
                    </p>

                    <p className="mt-1 text-[10px] text-gray-400">
                      {formatDate(
                        order.created_at
                      )}
                    </p>

                  </div>

                  <div
                    className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black ${config.className}`}
                  >

                    <StatusIcon size={12} />

                    {config.text}

                  </div>

                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">

                  <div className="rounded-xl bg-gray-50 p-3">

                    <p className="text-[9px] text-gray-400">
                      Chi phí
                    </p>

                    <div className="mt-1 flex items-center gap-1">

                      <Coins
                        size={13}
                        className="text-yellow-500"
                      />

                      <span className="text-xs font-black">
                        {formatCoins(cost)}
                      </span>

                    </div>

                  </div>

                  <div className="rounded-xl bg-gray-50 p-3">

                    <p className="text-[9px] text-gray-400">
                      Mã đơn
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        onCopy(code)
                      }
                      className="mt-1 flex max-w-full items-center gap-1 text-xs font-black text-pink-500"
                    >

                      <span className="truncate">
                        {code || "N/A"}
                      </span>

                      <Copy
                        size={12}
                        className="shrink-0"
                      />

                    </button>

                  </div>

                </div>

                {order.delivery_target && (
                  <div className="mt-2 rounded-xl bg-gray-50 p-3">

                    <p className="text-[9px] text-gray-400">
                      Thông tin nhận
                    </p>

                    <p className="mt-1 truncate text-xs font-semibold text-gray-600">
                      {order.delivery_target}
                    </p>

                  </div>
                )}

                {copied === code && (
                  <p className="mt-2 text-[10px] font-bold text-green-500">
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

function BottomNavigation() {
  const items = [
    {
      icon: Home,
      label: "Trang chủ",
      path: "/",
    },

    {
      icon: CheckCircle2,
      label: "Nhiệm vụ",
      path: "/tasks",
    },

    {
      icon: Gift,
      label: "Cửa hàng",
      path: "/store",
      active: true,
    },

    {
      icon: Wallet,
      label: "Ví",
      path: "/wallet",
    },

    {
      icon: User,
      label: "Tôi",
      path: "/profile",
    },
  ];

  const go = (path) => {
    if (
      window.location.pathname !== path
    ) {
      window.location.href = path;
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3">

      <div className="mx-auto flex max-w-xl items-center justify-between rounded-[30px] border border-white bg-white/95 px-2 py-2 shadow-[0_-10px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl">

        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              type="button"
              key={item.label}
              onClick={() =>
                go(item.path)
              }
              className={`relative flex min-w-[62px] flex-1 flex-col items-center justify-center gap-1 rounded-[23px] px-2 py-2 transition ${
                item.active
                  ? "bg-gradient-to-b from-cyan-400 to-blue-500 text-white shadow-lg shadow-blue-200"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >

              <Icon
                size={23}
                strokeWidth={
                  item.active
                    ? 2.5
                    : 2
                }
              />

              <span className="text-[9px] font-black sm:text-[10px]">
                {item.label}
              </span>

            </button>
          );
        })}

      </div>
    </nav>
  );
}
