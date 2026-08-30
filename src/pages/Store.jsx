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
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UserRound,
  XCircle,
  Zap,
} from "lucide-react";

import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

/* =========================================================
   STORE
   NXX315 Studio Rewards
   Premium / Minimal / Mobile-first
========================================================= */

export default function Store() {
  const { session } = useSession();
  const { profile } = useProfile();

  const [packages, setPackages] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);

  const [toast, setToast] = useState(null);

  /*
    Views:
    home
    catalog
    checkout
    detail
  */
  const [view, setView] = useState("home");

  const [category, setCategory] = useState("robux");
  const [version, setVersion] = useState("vng");

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [deliveryTarget, setDeliveryTarget] = useState("");

  const [copied, setCopied] = useState(false);

  /* =========================================================
     FETCH STORE DATA
  ========================================================= */

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    loadStore();
  }, [session?.user?.id]);

  const loadStore = async () => {
    setLoading(true);

    try {
      const [packagesResult, ordersResult] = await Promise.all([
        supabase
          .from("redemption_packages")
          .select("*")
          .eq("active", true)
          .order("sort_order", { ascending: true }),

        supabase
          .from("redemption_orders")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (!packagesResult.error) {
        setPackages(packagesResult.data || []);
      }

      if (!ordersResult.error) {
        setOrders(ordersResult.data || []);
      }
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

  /* =========================================================
     TOAST
  ========================================================= */

  const showToast = (message, type = "success") => {
    setToast({
      message,
      type,
    });

    window.setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  /* =========================================================
     HELPERS
  ========================================================= */

  const formatCoins = (value) => {
    const number = Number(value || 0);

    return number.toLocaleString("vi-VN");
  };

  const formatDate = (value) => {
    if (!value) return "—";

    return new Date(value).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPackageType = (pkg) => {
    const rewardType = String(
      pkg?.reward_type || ""
    ).toLowerCase();

    const name = String(
      pkg?.name || ""
    ).toLowerCase();

    if (
      rewardType === "quan_huy" ||
      rewardType === "quanhuy"
    ) {
      return "quanhuy";
    }

    if (
      rewardType === "robux"
    ) {
      return "robux";
    }

    /*
      Legacy fallback.
      Chỉ dùng khi database cũ chưa có reward_type.
    */
    if (
      name.includes("quân huy") ||
      name.includes("quan huy") ||
      name.includes("liên quân")
    ) {
      return "quanhuy";
    }

    if (
      name.includes("robux") ||
      name.includes("r$")
    ) {
      return "robux";
    }

    return null;
  };

  const getPackageVersion = (pkg) => {
    if (!pkg) return null;

    if (pkg.version) {
      return String(pkg.version).toLowerCase();
    }

    const name = String(
      pkg.name || ""
    ).toLowerCase();

    if (
      name.includes("quốc tế") ||
      name.includes("quoc te") ||
      name.includes("international")
    ) {
      return "quoc_te";
    }

    if (name.includes("vng")) {
      return "vng";
    }

    return null;
  };

  /* =========================================================
     FILTER PACKAGES
  ========================================================= */

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const type = getPackageType(pkg);

      if (type !== category) {
        return false;
      }

      /*
        Quân Huy không cần version.
      */
      if (category === "quanhuy") {
        return true;
      }

      /*
        Robux có VNG / Quốc tế.
      */
      const pkgVersion = getPackageVersion(pkg);

      /*
        Nếu package có version rõ ràng,
        bắt buộc khớp version đang chọn.
      */
      if (pkgVersion) {
        return pkgVersion === version;
      }

      /*
        Legacy package không có version:
        cho phép hiển thị thay vì tự đoán
        bằng số Robux.
      */
      return true;
    });
  }, [packages, category, version]);

  /* =========================================================
     OPEN CATALOG
  ========================================================= */

  const openCatalog = (type) => {
    setCategory(type);

    if (type === "robux") {
      setVersion("vng");
    }

    setSelectedPackage(null);
    setDeliveryMethod("");
    setDeliveryTarget("");

    setView("catalog");
  };

  /* =========================================================
     OPEN CHECKOUT
  ========================================================= */

  const openCheckout = (pkg) => {
    if (!pkg) return;

    setSelectedPackage(pkg);
    setDeliveryMethod("");
    setDeliveryTarget("");

    /*
      Tự xác định phương thức giao hàng mặc định
      theo loại package.

      VNG → Roblox
      Quốc tế → người dùng chọn Discord/Zalo
      Quân Huy → UID game
    */

    const type = getPackageType(pkg);
    const pkgVersion = getPackageVersion(pkg);

    if (type === "robux" && pkgVersion === "vng") {
      setDeliveryMethod("vng");
    }

    if (type === "quanhuy") {
      setDeliveryMethod("uid");
    }

    setView("checkout");
  };

  /* =========================================================
     DELIVERY LABEL
  ========================================================= */

  const getDeliveryLabel = () => {
    if (deliveryMethod === "vng") {
      return "Roblox Username";
    }

    if (deliveryMethod === "discord") {
      return "Discord Username";
    }

    if (deliveryMethod === "zalo") {
      return "Số điện thoại Zalo";
    }

    if (deliveryMethod === "uid") {
      return "UID Liên Quân";
    }

    return "Thông tin nhận thưởng";
  };

  const getDeliveryPlaceholder = () => {
    if (deliveryMethod === "vng") {
      return "Nhập Roblox Username";
    }

    if (deliveryMethod === "discord") {
      return "Ví dụ: nxx315";
    }

    if (deliveryMethod === "zalo") {
      return "Nhập số điện thoại Zalo";
    }

    if (deliveryMethod === "uid") {
      return "Nhập UID trong game";
    }

    return "Nhập thông tin";
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateCheckout = () => {
    if (!session?.user?.id) {
      showToast(
        "Vui lòng đăng nhập để đổi thưởng.",
        "error"
      );

      return false;
    }

    if (!selectedPackage) {
      showToast(
        "Vui lòng chọn một gói thưởng.",
        "error"
      );

      return false;
    }

    if (!deliveryMethod) {
      showToast(
        "Vui lòng chọn phương thức nhận.",
        "error"
      );

      return false;
    }

    if (!deliveryTarget.trim()) {
      showToast(
        `Vui lòng nhập ${getDeliveryLabel()}.`,
        "error"
      );

      return false;
    }

    const cost = Number(
      selectedPackage.coin_cost || 0
    );

    const balance = Number(
      profile?.coins || 0
    );

    if (cost <= 0) {
      showToast(
        "Gói thưởng không hợp lệ.",
        "error"
      );

      return false;
    }

    if (balance < cost) {
      showToast(
        "Bạn không đủ Coin để đổi gói này.",
        "error"
      );

      return false;
    }

    return true;
  };

  /* =========================================================
     CREATE ORDER
  ========================================================= */

  const handleRedeem = async () => {
    if (redeeming) return;

    if (!validateCheckout()) {
      return;
    }

    setRedeeming(true);

    try {
      /*
        Coin được kiểm tra và trừ ở RPC.
        Frontend KHÔNG tự trừ Coin.
      */

      const { data, error } = await supabase.rpc(
        "create_redemption_order",
        {
          p_user_id: session.user.id,
          p_package_id: selectedPackage.id,
          p_delivery_method: deliveryMethod,
          p_delivery_target: deliveryTarget.trim(),
        }
      );

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(
          data?.error ||
          "Không thể tạo đơn hàng."
        );
      }

      /*
        Reload orders + profile từ nguồn dữ liệu thật.
        Không tự đoán số dư ở frontend.
      */

      await loadStore();

      showToast(
        `Đơn ${data.order_code || "mới"} đã được tạo thành công!`,
        "success"
      );

      /*
        Nếu RPC trả về order_id,
        mở thẳng Order Detail.
      */

      if (data.order_id) {
        const { data: order } = await supabase
          .from("redemption_orders")
          .select("*")
          .eq("id", data.order_id)
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (order) {
          setSelectedOrder(order);
          setView("detail");
        } else {
          resetCheckout();
          setView("home");
        }
      } else {
        resetCheckout();
        setView("home");
      }
    } catch (error) {
      console.error(
        "Create redemption order error:",
        error
      );

      showToast(
        error?.message ||
          "Đổi thưởng thất bại. Vui lòng thử lại.",
        "error"
      );
    } finally {
      setRedeeming(false);
    }
  };

  /* =========================================================
     RESET CHECKOUT
  ========================================================= */

  const resetCheckout = () => {
    setSelectedPackage(null);
    setDeliveryMethod("");
    setDeliveryTarget("");
  };

  /* =========================================================
     OPEN ORDER
  ========================================================= */

  const openOrder = (order) => {
    setSelectedOrder(order);
    setCopied(false);
    setView("detail");
  };

  /* =========================================================
     COPY ORDER CODE
  ========================================================= */

  const copyOrderCode = async (code) => {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      showToast(
        "Không thể sao chép mã đơn.",
        "error"
      );
    }
  };

  /* =========================================================
     STATUS
  ========================================================= */

  const getStatus = (status) => {
    const map = {
      pending: {
        label: "Đang xử lý",
        icon: Clock3,
        className:
          "bg-amber-50 text-amber-700 border-amber-100",
      },

      delivered: {
        label: "Đã hoàn tất",
        icon: CheckCircle2,
        className:
          "bg-emerald-50 text-emerald-700 border-emerald-100",
      },

      rejected: {
        label: "Đã từ chối",
        icon: XCircle,
        className:
          "bg-rose-50 text-rose-700 border-rose-100",
      },

      cancelled: {
        label: "Đã hủy",
        icon: XCircle,
        className:
          "bg-slate-100 text-slate-600 border-slate-200",
      },
    };

    return (
      map[status] || map.pending
    );
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC]">
        <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-5">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <Loader2
                size={22}
                className="animate-spin text-sky-500"
              />
            </div>

            <p className="mt-4 text-sm font-medium text-slate-700">
              Đang mở cửa hàng...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Đang tải phần thưởng
            </p>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  /* =========================================================
     HOME
  ========================================================= */

  const renderHome = () => (
    <div className="space-y-6">

      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-500">
            NXX315 Studio
          </p>

          <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-950">
            Cửa hàng
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Đổi Coin lấy phần thưởng
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <ShoppingBag
            size={20}
            className="text-slate-700"
          />
        </div>
      </header>

      {/* Balance */}
      <section className="relative overflow-hidden rounded-[26px] bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/10">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-sky-400/20 blur-2xl" />
        <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-indigo-400/10 blur-2xl" />

        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-white/55">
                <Coins size={14} />
                SỐ DƯ COIN
              </div>

              <p className="mt-2 text-[32px] font-bold tracking-tight">
                {formatCoins(profile?.coins)}
              </p>

              <p className="mt-0.5 text-xs text-white/45">
                Coin khả dụng
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
              <Zap
                size={21}
                className="text-sky-300"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-white/55">
            <ShieldCheck size={14} />
            Giao dịch được xác nhận bởi hệ thống
          </div>
        </div>
      </section>

      {/* Rewards */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Phần thưởng
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              Chọn loại bạn muốn đổi
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">

          {/* Robux */}
          <button
            type="button"
            onClick={() => openCatalog("robux")}
            className="group relative overflow-hidden rounded-[22px] bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 transition duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-xl">
              🎮
            </div>

            <div className="mt-4">
              <p className="font-bold text-slate-900">
                Robux
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                VNG & Quốc tế
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-600">
                Xem gói
              </span>

              <ChevronRight
                size={15}
                className="text-slate-300 transition group-hover:translate-x-0.5"
              />
            </div>
          </button>

          {/* Quân Huy */}
          <button
            type="button"
            onClick={() => openCatalog("quanhuy")}
            className="group relative overflow-hidden rounded-[22px] bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 transition duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-xl">
              ⚔️
            </div>

            <div className="mt-4">
              <p className="font-bold text-slate-900">
                Quân Huy
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                Liên Quân Mobile
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-orange-600">
                Xem gói
              </span>

              <ChevronRight
                size={15}
                className="text-slate-300 transition group-hover:translate-x-0.5"
              />
            </div>
          </button>
        </div>
      </section>

      {/* Transparency */}
      <section className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
            <ShieldCheck
              size={19}
              className="text-emerald-600"
            />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900">
              Minh bạch trong đổi thưởng
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Mỗi đơn hàng có mã riêng. Coin được xử lý
              bởi hệ thống và lịch sử đơn luôn có thể kiểm tra.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Orders */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Đơn hàng gần đây
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              Theo dõi các lần đổi thưởng
            </p>
          </div>

          {orders.length > 0 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
              {orders.length} đơn
            </span>
    )}
        </div>

        {orders.length === 0 ? (
          <div className="rounded-[22px] bg-white px-5 py-8 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50">
              <Package
                size={19}
                className="text-slate-300"
              />
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-700">
              Chưa có đơn hàng
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Đơn hàng của bạn sẽ xuất hiện ở đây.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 3).map((order) => {
              const status = getStatus(order.status);
              const StatusIcon = status.icon;

              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => openOrder(order)}
                  className="flex w-full items-center gap-3 rounded-[20px] bg-white p-3.5 text-left shadow-sm ring-1 ring-slate-200 transition hover:shadow-md active:scale-[0.99]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50">
                    <Gift
                      size={17}
                      className="text-slate-500"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {order.package_name || "Đơn đổi thưởng"}
                    </p>

                    <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                      {order.order_code ||
                        String(order.id).slice(0, 8)}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold ${status.className}`}
                    >
                      <StatusIcon size={10} />
                      {status.label}
                    </span>

                    <p className="mt-1 text-[10px] text-slate-400">
                      {formatCoins(order.coins_charged)} Coin
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Bottom info */}
      <div className="flex items-center justify-center gap-2 pb-2 text-[11px] text-slate-400">
        <ShieldCheck size={13} />
        Hệ thống đổi thưởng NXX315 Studio
      </div>
    </div>
  );

  /* =========================================================
     CATALOG
  ========================================================= */

  const renderCatalog = () => (
    <div className="space-y-5">

      <button
        type="button"
        onClick={() => setView("home")}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Cửa hàng
      </button>

      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            {category === "robux"
              ? "🎮"
              : "⚔️"}
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              {category === "robux"
                ? "Robux"
                : "Quân Huy"}
            </h1>

            <p className="text-xs text-slate-400">
              Chọn gói phù hợp với bạn
            </p>
          </div>
        </div>
      </div>

      {/* Version */}
      {category === "robux" && (
        <div className="rounded-[20px] bg-white p-1.5 shadow-sm ring-1 ring-slate-200">
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setVersion("vng")}
              className={`rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                version === "vng"
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              🇻🇳 VNG
            </button>

            <button
              type="button"
              onClick={() => setVersion("quoc_te")}
              className={`rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                version === "quoc_te"
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              🌎 Quốc tế
            </button>
          </div>
        </div>
      )}

      {/* Package count */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">
          Các gói có sẵn
        </p>

        <span className="text-xs text-slate-400">
          {filteredPackages.length} gói
        </span>
      </div>

      {/* Empty */}
      {filteredPackages.length === 0 ? (
        <div className="rounded-[24px] bg-white px-5 py-12 text-center shadow-sm ring-1 ring-slate-200">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
            <Gift
              size={21}
              className="text-slate-300"
            />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-700">
            Chưa có gói phù hợp
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Vui lòng thử lựa chọn khác.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              category={category}
              onSelect={() => openCheckout(pkg)}
            />
          ))}
        </div>
      )}

      {/* Catalog note */}
      <div className="rounded-[20px] bg-slate-100/80 p-4">
        <div className="flex items-start gap-2.5">
          <ShieldCheck
            size={16}
            className="mt-0.5 shrink-0 text-slate-500"
          />

          <p className="text-[11px] leading-5 text-slate-500">
            Giá hiển thị là số Coin cần dùng để đổi.
            Hãy kiểm tra kỹ thông tin nhận thưởng trước
            khi xác nhận đơn.
          </p>
        </div>
      </div>
    </div>
  );

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-24
     font-[Be_Vietnam_Pro]">
      <main className="mx-auto w-full max-w-md px-4 py-5">

        {/* Toast */}
        {toast && (
          <div
            className={`fixed left-4 right-4 top-4 z-[100] mx-auto max-w-md rounded-2xl border px-4 py-3 shadow-xl backdrop-blur ${
              toast.type === "error"
                ? "border-rose-200 bg-rose-50/95 text-rose-700"
                : "border-emerald-200 bg-emerald-50/95 text-emerald-700"
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === "error" ? (
                <XCircle size={17} />
              ) : (
                <CheckCircle2 size={17} />
              )}

              <p className="text-sm font-semibold">
                {toast.message}
              </p>
            </div>
          </div>
        )}

        {view === "home" && renderHome()}

        {view === "catalog" && renderCatalog()}

        {view === "checkout" &&
          renderCheckout()}

        {view === "detail" &&
          renderOrderDetail()}
      </main>

      <BottomNav />
    </div>
  );
}

/* =========================================================
   PACKAGE CARD
========================================================= */

function PackageCard({
  pkg,
  category,
  onSelect,
}) {
  const isRobux = category === "robux";

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative overflow-hidden rounded-[22px] bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 transition duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${
          isRobux
            ? "bg-sky-50"
            : "bg-orange-50"
        }`}
      >
        {isRobux ? "🎮" : "⚔️"}
      </div>

      <div className="mt-4 min-h-[52px]">
        <p className="line-clamp-2 text-sm font-bold leading-5 text-slate-900">
          {pkg.name}
        </p>
      </div>

      <div className="mt-3 flex items-center gap-1">
        <Coins
          size={13}
          className="text-amber-500"
        />

        <span className="text-sm font-bold text-slate-900">
          {Number(
            pkg.coin_cost || 0
          ).toLocaleString("vi-VN")}
        </span>

        <span className="text-[10px] text-slate-400">
          Coin
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span
          className={`text-[11px] font-semibold ${
            isRobux
              ? "text-sky-600"
              : "text-orange-600"
          }`}
        >
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
const STATUS_CONFIG = {
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

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const loadStore = async () => {
      if (!session?.user?.id) {
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
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (!packageResult.error) {
        setPackages(packageResult.data || []);
      }

      if (!orderResult.error) {
        setHistory(orderResult.data || []);
      }

      setLoading(false);
    };

    loadStore();
  }, [session?.user?.id]);

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const name = String(pkg.name || "").toLowerCase();

      const rewardType = String(pkg.reward_type || "").toLowerCase();
      const pkgVersion = String(pkg.version || "").toLowerCase();

      if (category === "quanhuy") {
        if (rewardType) {
          return rewardType === "quan_huy";
        }

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

      if (!name.includes("robux") && !name.includes("r$")) {
        return false;
      }

      if (version === "vng") {
        return (
          name.includes("vng") ||
          name.includes("40") ||
          name.includes("80")
        );
      }

      return (
        name.includes("quốc tế") ||
        name.includes("quoc te") ||
        name.includes("100") ||
        name.includes("500")
      );
    });
  }, [packages, category, version]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

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
    setView("detail");
  };

  const getDeliveryMethod = () => {
    if (category === "robux" && version === "vng") {
      return "vng";
    }

    return deliveryMethod;
  };

  const canRedeem = () => {
    if (!selectedPackage) return false;

    const method = getDeliveryMethod();

    if (!method) return false;
    if (!deliveryTarget.trim()) return false;

    return true;
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

  const handleRedeem = async () => {
    if (!session?.user?.id) {
      showToast("Vui lòng đăng nhập để đổi thưởng.", "error");
      return;
    }

    if (!canRedeem()) {
      showToast("Vui lòng nhập đầy đủ thông tin.", "error");
      return;
    }

    if (
      Number(profile?.coins || 0) <
      Number(selectedPackage?.coin_cost || 0)
    ) {
      showToast("Bạn không đủ Coin cho gói này.", "error");
      return;
    }

    setRedeeming(true);

    const method = getDeliveryMethod();

    const { data, error } = await supabase.rpc(
      "create_redemption_order",
      {
        p_user_id: session.user.id,
        p_package_id: selectedPackage.id,
        p_delivery_method: method,
        p_delivery_target: deliveryTarget.trim(),
      }
    );

    if (error || !data?.success) {
      setRedeeming(false);

      showToast(
        error?.message ||
          data?.error ||
          "Không thể tạo đơn. Vui lòng thử lại.",
        "error"
      );

      return;
    }

    if (typeof setProfile === "function") {
      await setProfile((prev) => ({
        ...prev,
        coins: data.coins_remaining,
      }));
    }

    /*
      Thông báo Telegram chỉ là lớp phụ.
      Đơn hàng đã được tạo bởi RPC ở backend.
    */
    try {
      await supabase.functions.invoke("telegram-webhook", {
        body: {
          message: {
            chat: { id: ADMIN_CHAT_ID },
            text: [
              "🛍️ ĐƠN HÀNG MỚI",
              `📦 ${selectedPackage.name}`,
              `💰 ${formatCoins(selectedPackage.coin_cost)} Coin`,
              `🆔 ${data.order_code || "N/A"}`,
              `👤 ${session.user.email || "User"}`,
            ].join("\n"),
          },
        },
      });
    } catch {
      // Không làm thất bại đơn nếu Telegram lỗi.
    }

    await refreshHistory();

    setRedeeming(false);

    showToast(
      `Đã tạo đơn ${data.order_code || ""}. Đang chờ xử lý.`
    );

    setSelectedPackage(null);
    setDeliveryMethod("");
    setDeliveryTarget("");
    setView("home");
  };

  const copyOrderCode = async (code) => {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      showToast("Không thể sao chép mã đơn.", "error");
    }
  };

  const renderHeader = (backAction = null) => (
    <div className="mb-5 flex items-center gap-3">
      {backAction && (
        <button
          type="button"
          onClick={backAction}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-95"
        >
          <ArrowLeft size={18} />
        </button>
      )}

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-sky-500">
          NXX315 STORE
        </p>

        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          {view === "home" && "Cửa hàng"}
          {view === "catalog" &&
            (category === "robux" ? "Robux" : "Quân Huy")}
          {view === "delivery" && "Xác nhận đổi"}
          {view === "detail" && "Chi tiết đơn"}
        </h1>
      </div>
    </div>
  );

  const renderToast = () => {
    if (!toast) return null;

    const success = toast.type !== "error";

    return (
      <div
        className={`mb-4 flex items-start gap-3 rounded-2xl border p-4 shadow-sm ${
          success
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-rose-200 bg-rose-50 text-rose-700"
        }`}
      >
        {success ? (
          <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
        ) : (
          <XCircle className="mt-0.5 shrink-0" size={18} />
        )}

        <p className="text-sm font-medium leading-5">
          {toast.message}
        </p>
      </div>
    );
  };

  const renderBalance = () => (
    <section className="relative overflow-hidden rounded-[28px] bg-slate-950 p-5 text-white shadow-xl">
      <div className="absolute -right-10 -top-14 h-40 w-40 rounded-full bg-sky-500/20 blur-2xl" />
      <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-violet-500/15 blur-2xl" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">
              Số dư Coin
            </p>

            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight">
                {formatCoins(profile?.coins)}
              </span>

              <span className="text-sm font-semibold text-white/50">
                Coin
              </span>
            </div>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
            <Coins size={23} className="text-amber-300" />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-xs text-white/55">
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
      className={`group relative min-h-[150px] overflow-hidden rounded-[26px] p-5 text-left text-white shadow-lg transition duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${className}`}
    >
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-xl" />

      <div className="relative flex h-full flex-col justify-between">
        <span className="text-4xl">{emoji}</span>

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
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Lịch sử
          </p>
          <h2 className="text-lg font-black text-slate-900">
            Đơn gần đây
          </h2>
        </div>

        {history.length > 0 && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
            {history.length}
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        {history.length === 0 ? (
          <div className="px-5 py-9 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <Gift size={21} className="text-slate-400" />
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-700">
              Chưa có đơn hàng
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Các giao dịch của bạn sẽ xuất hiện ở đây.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.slice(0, 4).map((order) => {
              const config =
                STATUS[order.status] || STATUS.pending;

              const Icon = config.icon;

              return (
                <button
                  type="button"
                  key={order.id}
                  onClick={() => openOrder(order)}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-slate-50 active:bg-slate-100"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-lg">
                    {String(order.package_name || "")
                      .toLowerCase()
                      .includes("quân")
                      ? "⚔️"
                      : "🎮"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {order.package_name || "Gói đổi thưởng"}
                    </p>

                    <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                      {order.order_code ||
                        String(order.id).slice(0, 8)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold ${config.className}`}
                    >
                      <Icon size={11} />
                      {config.label}
                    </span>

                    <ChevronRight
                      size={14}
                      className="text-slate-300"
                    />
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
      {renderHeader()}

      {renderBalance()}

      <section className="mt-6">
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Rewards
          </p>

          <h2 className="text-lg font-black text-slate-900">
            Bạn muốn đổi gì?
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {renderCategoryCard({
            emoji: "🎮",
            title: "Robux",
            description: "Chọn gói Robux",
            className:
              "bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700",
            onClick: () => openCatalog("robux"),
          })}

          {renderCategoryCard({
            emoji: "⚔️",
            title: "Quân Huy",
            description: "Chọn gói Quân Huy",
            className:
              "bg-gradient-to-br from-orange-500 via-red-500 to-rose-600",
            onClick: () => openCatalog("quanhuy"),
          })}
        </div>
      </section>

      <section className="mt-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <ShieldCheck size={19} />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-800">
              Minh bạch từng giao dịch
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Bạn luôn thấy giá Coin, mã đơn và trạng thái xử lý.
              Coin được trừ bởi hệ thống khi tạo đơn.
            </p>
          </div>
        </div>
      </section>

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
      {renderHeader(() => goHome())}

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
              className="h-44 animate-pulse rounded-[24px] bg-slate-200"
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

          <p className="mt-1 text-xs text-slate-400">
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
            Giá hiển thị là số Coin thực tế cần dùng. Hãy kiểm tra
            kỹ gói trước khi xác nhận.
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
