import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Coins,
  Copy,
  Gift,
  Loader2,
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";

import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

const ADMIN_CHAT_ID = 8637128924;

const STATUS = {
  pending: {
    label: "Đang xử lý",
    icon: Clock3,
    className: "bg-amber-50 text-amber-700 border-amber-100",
  },
  delivered: {
    label: "Đã giao",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  rejected: {
    label: "Đã từ chối",
    icon: XCircle,
    className: "bg-rose-50 text-rose-700 border-rose-100",
  },
  cancelled: {
    label: "Đã hủy",
    icon: XCircle,
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

const formatCoins = (value) =>
  Number(value || 0).toLocaleString("vi-VN");

const formatDate = (value) => {
  if (!value) return "Chưa cập nhật";

  return new Date(value).toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

function PackageCard({ pkg, category, onClick }) {
  const isRobux = category === "robux";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-[24px] border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
    >
      <div
        className={`mb-3 flex h-16 items-center justify-center rounded-2xl text-3xl ${
          isRobux ? "bg-sky-50" : "bg-orange-50"
        }`}
      >
        {isRobux ? "🎮" : "⚔️"}
      </div>

      <p className="line-clamp-2 min-h-[40px] text-sm font-black leading-5 text-slate-900">
        {pkg.name || "Gói phần thưởng"}
      </p>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <span className="text-sm font-bold text-slate-900">
            {formatCoins(pkg.coin_cost)}
          </span>

          <span className="ml-1 text-[10px] text-slate-400">
            Coin
          </span>
        </div>

        <ChevronRight
          size={15}
          className="text-slate-300 transition group-hover:translate-x-1"
        />
      </div>

      <div
        className={`mt-3 text-[11px] font-bold ${
          isRobux ? "text-sky-600" : "text-orange-600"
        }`}
      >
        Đổi ngay
      </div>
    </button>
  );
}

function DeliveryView({
  category,
  version,
  selectedPackage,
  deliveryMethod,
  setDeliveryMethod,
  deliveryTarget,
  setDeliveryTarget,
  redeeming,
  onBack,
  onRedeem,
}) {
  const isVng = category === "robux" && version === "vng";

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-600"
      >
        <ArrowLeft size={18} />
        Quay lại
      </button>

      <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
            {category === "robux" ? "🎮" : "⚔️"}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-400">
              Bạn đang đổi
            </p>

            <h2 className="truncate text-base font-black text-slate-900">
              {selectedPackage?.name || "Phần thưởng"}
            </h2>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 p-4">
          <span className="text-sm font-semibold text-slate-500">
            Chi phí
          </span>

          <span className="text-lg font-black text-slate-900">
            {formatCoins(selectedPackage?.coin_cost)} Coin
          </span>
        </div>

        {isVng ? (
          <div className="mt-5">
            <label className="mb-2 block text-xs font-bold text-slate-600">
              Roblox Username / ID
            </label>

            <input
              value={deliveryTarget}
              onChange={(e) => setDeliveryTarget(e.target.value)}
              placeholder="Nhập username Roblox"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </div>
        ) : (
          <>
            <div className="mt-5">
              <label className="mb-2 block text-xs font-bold text-slate-600">
                Phương thức nhận
              </label>

              <div className="grid grid-cols-2 gap-2">
                {[
                  ["code", "🎟️ Mã code"],
                  ["discord", "💬 Discord"],
                  ["zalo", "📱 Zalo"],
                  ["roblox", "🎮 Roblox"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDeliveryMethod(value)}
                    className={`rounded-2xl border px-3 py-3 text-left text-xs font-bold transition ${
                      deliveryMethod === value
                        ? "border-sky-300 bg-sky-50 text-sky-700"
                        : "border-slate-200 bg-white text-slate-500"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-xs font-bold text-slate-600">
                Thông tin nhận thưởng
              </label>

              <input
                value={deliveryTarget}
                onChange={(e) => setDeliveryTarget(e.target.value)}
                placeholder="Username, UID, email hoặc thông tin nhận"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium outline-none transition focus:border-sky-400 focus:bg-white"
              />
            </div>
          </>
        )}

        <button
          type="button"
          disabled={redeeming}
          onClick={onRedeem}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-4 text-sm font-black text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {redeeming ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Đang tạo đơn...
            </>
          ) : (
            <>
              <Gift size={18} />
              Xác nhận đổi thưởng
            </>
          )}
        </button>

        <div className="mt-4 flex gap-2 rounded-2xl bg-emerald-50 p-3 text-[11px] leading-5 text-emerald-700">
          <ShieldCheck size={16} className="shrink-0" />
          Kiểm tra kỹ thông tin nhận thưởng trước khi xác nhận.
        </div>
      </div>
    </div>
  );
}

function OrderDetail({ order, copied, onCopy, onBack }) {
  if (!order) return null;

  const status = STATUS[order.status] || STATUS.pending;
  const StatusIcon = status.icon;

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-600"
      >
        <ArrowLeft size={18} />
        Quay lại
      </button>

      <div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-100">
        <div className="bg-slate-950 p-5 text-white">
          <p className="text-xs text-white/50">
            Chi tiết đơn hàng
          </p>

          <h2 className="mt-1 text-xl font-black">
            {order.package_name || order.name || "Đơn đổi thưởng"}
          </h2>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-white/60">
              {formatDate(order.created_at)}
            </span>

            <span
              className={`flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold ${status.className}`}
            >
              <StatusIcon size={13} />
              {status.label}
            </span>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <InfoRow
            label="Mã đơn"
            value={order.id}
            copy
            copied={copied}
            onCopy={onCopy}
          />

          <InfoRow
            label="Chi phí"
            value={`${formatCoins(order.coin_cost)} Coin`}
          />

          <InfoRow
            label="Phương thức"
            value={order.delivery_method || "Chưa cập nhật"}
          />

          <InfoRow
            label="Thông tin nhận"
            value={order.delivery_target || "Chưa cập nhật"}
          />

          {order.admin_note && (
            <div className="rounded-2xl bg-sky-50 p-4">
              <p className="text-xs font-bold text-sky-700">
                Ghi chú từ hệ thống
              </p>

              <p className="mt-1 text-sm leading-6 text-sky-900">
                {order.admin_note}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, copy, copied, onCopy }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 p-3">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-all text-sm font-bold text-slate-800">
          {value}
        </p>
      </div>

      {copy && (
        <button
          type="button"
          onClick={() => onCopy(value)}
          className="shrink-0 rounded-xl bg-white p-2 text-slate-500 shadow-sm"
        >
          {copied ? (
            <Check size={16} className="text-emerald-500" />
          ) : (
            <Copy size={16} />
          )}
        </button>
      )}
    </div>
  );
}

export default function Store() {
  const { session } = useSession();
  const { profile, setProfile } = useProfile();

  const [view, setView] = useState("home");
  const [category, setCategory] = useState("robux");
  const [version, setVersion] = useState("vng");

  const [packages, setPackages] = useState([]);
  const [history, setHistory] = useState([]);

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [deliveryTarget, setDeliveryTarget] = useState("");

  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const refreshPackages = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("redemption_packages")
      .select("*")
      .eq("active", true)
      .order("coin_cost", { ascending: true });

    if (error) {
      showToast("Không thể tải danh sách phần thưởng.", "error");
      setPackages([]);
    } else {
      setPackages(data || []);
    }

    setLoading(false);
  };

  const refreshHistory = async () => {
    if (!session?.user?.id) return;

    const { data } = await supabase
      .from("redemption_orders")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    setHistory(data || []);
  };

  useEffect(() => {
    refreshPackages();
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [session?.user?.id]);

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const type = String(pkg.reward_type || "").toLowerCase();
      const pkgVersion = String(pkg.version || "").toLowerCase();
      const name = String(pkg.name || "").toLowerCase();

      if (category === "quanhuy") {
        return (
          type === "quan_huy" ||
          name.includes("quân huy") ||
          name.includes("quan huy") ||
          name.includes("liên quân")
        );
      }

      if (type && type !== "robux") return false;

      if (pkgVersion) {
        return pkgVersion === version;
      }

      return name.includes("robux") || name.includes("r$");
    });
  }, [packages, category, version]);

  const goHome = () => {
    setView("home");
    setSelectedPackage(null);
    setSelectedOrder(null);
    setDeliveryMethod("");
    setDeliveryTarget("");
  };

  const openCatalog = (nextCategory) => {
    setCategory(nextCategory);

    if (nextCategory === "robux") {
      setVersion("vng");
    }

    setView("catalog");
  };

  const openDelivery = (pkg) => {
    setSelectedPackage(pkg);
    setDeliveryMethod("");
    setDeliveryTarget("");
    setView("delivery");
  };

  const openOrder = (order) => {
    setSelectedOrder(order);
    setCopied(false);
    setView("detail");
  };

  const getDeliveryMethod = () => {
    if (category === "robux" && version === "vng") {
      return "vng";
    }

    return deliveryMethod;
  };

  const canRedeem = () => {
    return Boolean(
      selectedPackage &&
        getDeliveryMethod() &&
        deliveryTarget.trim()
    );
  };

  const handleRedeem = async () => {
    if (!session?.user?.id) {
      showToast("Vui lòng đăng nhập để đổi thưởng.", "error");
      return;
    }

    if (!canRedeem()) {
      showToast("Vui lòng nhập đầy đủ thông tin.", "error");
      return;
    }

    const cost = Number(selectedPackage?.coin_cost || 0);
    const balance = Number(profile?.coins || 0);

    if (balance < cost) {
      showToast("Bạn không đủ Coin cho gói này.", "error");
      return;
    }

    setRedeeming(true);

    try {
      const method = getDeliveryMethod();

      const { data: order, error } = await supabase
        .from("redemption_orders")
        .insert({
          user_id: session.user.id,
          package_id: selectedPackage.id,
          package_name: selectedPackage.name,
          coin_cost: cost,
          delivery_method: method,
          delivery_target: deliveryTarget.trim(),
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      const newBalance = balance - cost;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ coins: newBalance })
        .eq("id", session.user.id);

      if (profileError) throw profileError;

      if (setProfile) {
        setProfile((prev) => ({
          ...prev,
          coins: newBalance,
        }));
      }

      setHistory((prev) => [order, ...prev]);

      showToast("Tạo đơn đổi thưởng thành công.");

      setSelectedOrder(order);
      setSelectedPackage(null);
      setDeliveryMethod("");
      setDeliveryTarget("");
      setView("detail");
    } catch (error) {
      console.error(error);
      showToast(
        error?.message || "Không thể tạo đơn đổi thưởng.",
        "error"
      );
    } finally {
      setRedeeming(false);
    }
  };

  const copyOrderCode = async (value) => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      showToast("Không thể sao chép.", "error");
    }
  };
    const renderToast = () => {
    if (!toast) return null;

    const isError = toast.type === "error";

    return (
      <div
        className={`fixed left-1/2 top-4 z-50 flex w-[calc(100%-32px)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl px-4 py-3 shadow-xl ${
          isError
            ? "bg-rose-600 text-white"
            : "bg-slate-950 text-white"
        }`}
      >
        {isError ? (
          <XCircle size={19} className="shrink-0" />
        ) : (
          <CheckCircle2 size={19} className="shrink-0" />
        )}

        <p className="flex-1 text-sm font-semibold">
          {toast.message}
        </p>

        <button
          type="button"
          onClick={() => setToast(null)}
          className="rounded-lg p-1 transition hover:bg-white/10"
        >
          <X size={16} />
        </button>
      </div>
    );
  };

  const renderHeader = (onBack) => (
    <div className="mb-5 flex items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-100"
      >
        <ArrowLeft size={19} />
      </button>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          NXX315 Studio
        </p>

        <h1 className="text-xl font-black text-slate-950">
          Đổi thưởng
        </h1>
      </div>
    </div>
  );

  const renderBalance = () => (
    <section className="relative overflow-hidden rounded-[28px] bg-slate-950 p-5 text-white shadow-xl">
      <div className="absolute -right-10 -top-14 h-40 w-40 rounded-full bg-sky-500/20 blur-2xl" />
      <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-violet-500/20 blur-2xl" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/55">
              Số dư Coin
            </p>

            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight">
                {formatCoins(profile?.coins)}
              </span>

              <span className="text-sm font-bold text-white/45">
                Coin
              </span>
            </div>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
            <Coins
              size={23}
              className="text-amber-300"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-xs text-white/50">
          <ShieldCheck size={14} />
          Giao dịch được ghi nhận trên hệ thống
        </div>
      </div>
    </section>
  );

  const renderCategoryCard = ({
    emoji,
    title,
    description,
    className,
    onClick,
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`group relative min-h-[155px] overflow-hidden rounded-[26px] p-5 text-left text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] ${className}`}
    >
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-xl" />

      <div className="relative flex h-full flex-col justify-between">
        <span className="text-4xl">
          {emoji}
        </span>

        <div>
          <h3 className="text-xl font-black">
            {title}
          </h3>

          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-xs text-white/70">
              {description}
            </p>

            <ChevronRight
              size={17}
              className="transition group-hover:translate-x-1"
            />
          </div>
        </div>
      </div>
    </button>
  );

  const renderRecentOrders = () => (
    <section className="mt-6">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Lịch sử
          </p>

          <h2 className="mt-1 text-lg font-black text-slate-900">
            Đơn gần đây
          </h2>
        </div>

        {history.length > 0 && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
            {history.length}
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm">
        {history.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <Gift
                size={21}
                className="text-slate-400"
              />
            </div>

            <p className="mt-3 text-sm font-bold text-slate-700">
              Chưa có đơn hàng
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Các giao dịch của bạn sẽ xuất hiện ở đây.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.slice(0, 5).map((order) => {
              const status =
                STATUS[order.status] || STATUS.pending;

              const StatusIcon = status.icon;

              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => openOrder(order)}
                  className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-slate-50 active:bg-slate-100"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-xl">
                    {String(
                      order.package_name || ""
                    )
                      .toLowerCase()
                      .includes("quân")
                      ? "⚔️"
                      : "🎮"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {order.package_name ||
                        order.name ||
                        "Đơn đổi thưởng"}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-bold ${status.className}`}
                    >
                      <StatusIcon size={11} />
                      {status.label}
                    </span>

                    <span className="text-[10px] font-bold text-slate-400">
                      {formatCoins(order.coin_cost)} Coin
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );

  const renderHome = () => (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400">
            NXX315 Studio
          </p>

          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
            Rewards Store ✨
          </h1>

          <p className="mt-1 text-xs text-slate-400">
            Đổi Coin thành phần thưởng bạn muốn.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-slate-100">
          🎁
        </div>
      </div>

      {renderBalance()}

      <section className="mt-6">
        <div className="mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Cửa hàng
          </p>

          <h2 className="mt-1 text-lg font-black text-slate-900">
            Bạn muốn đổi gì?
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {renderCategoryCard({
            emoji: "🎮",
            title: "Robux",
            description: "VNG & Quốc tế",
            className: "bg-gradient-to-br from-sky-500 to-blue-600",
            onClick: () => openCatalog("robux"),
          })}

          {renderCategoryCard({
            emoji: "⚔️",
            title: "Quân Huy",
            description: "Liên Quân Mobile",
            className: "bg-gradient-to-br from-orange-500 to-rose-500",
            onClick: () => openCatalog("quanhuy"),
          })}
        </div>
      </section>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <Sparkles
            size={18}
            className="text-violet-500"
          />

          <p className="mt-3 text-xs font-black text-slate-800">
            Giá minh bạch
          </p>

          <p className="mt-1 text-[10px] leading-4 text-slate-400">
            Xem chính xác số Coin trước khi đổi.
          </p>
        </div>

        <div className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <ShieldCheck
            size={18}
            className="text-emerald-500"
          />

          <p className="mt-3 text-xs font-black text-slate-800">
            Có lịch sử
          </p>

          <p className="mt-1 text-[10px] leading-4 text-slate-400">
            Theo dõi trạng thái từng đơn hàng.
          </p>
        </div>
      </div>

      {renderRecentOrders()}
    </div>
  );

  const renderVersionSwitch = () => {
    if (category !== "robux") return null;

    return (
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setVersion("vng")}
          className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
            version === "vng"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500"
          }`}
        >
          🇻🇳 VNG

          <span className="mt-0.5 block text-[10px] font-medium text-slate-400">
            Nạp trực tiếp
          </span>
        </button>

        <button
          type="button"
          onClick={() => setVersion("quoc_te")}
          className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
            version === "quoc_te"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500"
          }`}
        >
          🌎 Quốc tế

          <span className="mt-0.5 block text-[10px] font-medium text-slate-400">
            Nhận mã
          </span>
        </button>
      </div>
    );
  };

  const renderCatalog = () => (
    <div>
      {renderHeader(goHome)}

      <div className="mb-5 rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${
              category === "robux"
                ? "bg-sky-50"
                : "bg-orange-50"
            }`}
          >
            {category === "robux" ? "🎮" : "⚔️"}
          </div>

          <div>
            <p className="text-sm font-black text-slate-900">
              Chọn phần thưởng
            </p>

            <p className="text-xs text-slate-400">
              Giá Coin hiển thị công khai trước khi đổi
            </p>
          </div>
        </div>
      </div>

      {renderVersionSwitch()}

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-48 animate-pulse rounded-[24px] bg-slate-200"
            />
          ))}
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
          <Sparkles
            size={25}
            className="mx-auto text-slate-300"
          />

          <p className="mt-3 text-sm font-bold text-slate-700">
            Chưa có gói phù hợp
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            Gói thưởng hiện chưa được mở bán.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              category={category}
              onClick={() => openDelivery(pkg)}
            />
          ))}
        </div>
      )}

      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <div className="flex gap-2">
          <ShieldCheck
            size={16}
            className="mt-0.5 shrink-0 text-emerald-500"
          />

          <p className="text-[11px] leading-5 text-slate-500">
            Giá hiển thị là số Coin thực tế cần dùng.
            Hãy kiểm tra kỹ gói trước khi xác nhận.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6F8FC] pb-28 font-[Be_Vietnam_Pro]">
      <main className="mx-auto w-full max-w-md px-4 py-5">
        {renderToast()}

        {view === "home" && renderHome()}

        {view === "catalog" && renderCatalog()}

        {view === "delivery" && (
          <DeliveryView
            category={category}
            version={version}
            selectedPackage={selectedPackage}
            deliveryMethod={deliveryMethod}
            setDeliveryMethod={setDeliveryMethod}
            deliveryTarget={deliveryTarget}
            setDeliveryTarget={setDeliveryTarget}
            redeeming={redeeming}
            onBack={() => {
              setView("catalog");
              setDeliveryMethod("");
              setDeliveryTarget("");
            }}
            onRedeem={handleRedeem}
          />
        )}

        {view === "detail" && (
          <OrderDetail
            order={selectedOrder}
            copied={copied}
            onCopy={copyOrderCode}
            onBack={() => {
              setSelectedOrder(null);
              setView("home");
            }}
          />
        )}
      </main>

      <BottomNav />
    </div>
  );
          }
