import React, { useEffect, useMemo, useState } from "react";
import {
  Coins,
  Gift,
  Loader2,
  CheckCircle2,
  Clock3,
  XCircle,
  Copy,
  Gamepad2,
  Globe2,
  ShieldCheck,
  ChevronRight,
  History,
  X,
  AlertCircle,
  Swords,
} from "lucide-react";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

export default function Store() {
  const { session } = useSession();
  const { profile } = useProfile();

  const [shopTab, setShopTab] = useState("robux");
  const [version, setVersion] = useState("vng");

  const [packages, setPackages] = useState([]);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const [selectedPkg, setSelectedPkg] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState("");

  const [toast, setToast] = useState(null);

  /* =========================
     TOAST
  ========================= */

  const showToast = (message, type = "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  /* =========================
     LOAD DATA
  ========================= */

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;

      setLoading(true);

      try {
        const [
          { data: pkgData, error: pkgError },
          { data: orderData, error: orderError },
        ] = await Promise.all([
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

        if (pkgError) {
          console.error("Package error:", pkgError);
        }

        if (orderError) {
          console.error("Order error:", orderError);
        }

        setPackages(pkgData || []);
        setHistory(orderData || []);
      } catch (error) {
        console.error(error);
        showToast("Không thể tải dữ liệu cửa hàng.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  /* =========================
     PACKAGE FILTER
     
     Hỗ trợ database mới:
     reward_type = robux / quan_huy
     version = vng / quoc_te
     
     Đồng thời fallback về name
     để không làm hỏng database cũ.
  ========================= */

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const name = String(pkg.name || "").toLowerCase();

      // QUÂN HUY
      if (shopTab === "quanHuy") {
        if (pkg.reward_type) {
          return pkg.reward_type === "quan_huy";
        }

        return (
          name.includes("quân huy") ||
          name.includes("quan huy") ||
          name.includes("qh")
        );
      }

      // ROBUX
      if (pkg.reward_type) {
        if (pkg.reward_type !== "robux") return false;

        if (pkg.version) {
          return pkg.version === version;
        }
      }

      // Fallback database cũ
      if (version === "vng") {
        return (
          name.includes("vng") ||
          name.includes("40 robux") ||
          name.includes("80 robux")
        );
      }

      return (
        name.includes("quốc tế") ||
        name.includes("quoc te") ||
        name.includes("international") ||
        name.includes("500 robux") ||
        name.includes("100 robux")
      );
    });
  }, [packages, shopTab, version]);

  /* =========================
     RESET MODAL
  ========================= */

  const closeModal = () => {
    if (isRedeeming) return;

    setSelectedPkg(null);
    setDeliveryMethod("");
    setDeliveryInfo("");
  };

  /* =========================
     SELECT PACKAGE
  ========================= */

  const openPackage = (pkg) => {
    setSelectedPkg(pkg);
    setDeliveryMethod("");
    setDeliveryInfo("");
  };

  /* =========================
     COPY
  ========================= */

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Đã sao chép!", "success");
    } catch {
      showToast("Không thể sao chép.", "error");
    }
  };

  /* =========================
     DELIVERY CONFIG
  ========================= */

  const getDeliveryType = () => {
    if (!selectedPkg) return "";

    const rewardType = selectedPkg.reward_type;
    const pkgVersion = selectedPkg.version;

    // Database mới
    if (rewardType === "quan_huy") {
      return "uid";
    }

    if (rewardType === "robux") {
      if (pkgVersion === "vng") {
        return "roblox_username";
      }

      return "code";
    }

    // Fallback theo giao diện hiện tại
    if (shopTab === "quanHuy") {
      return "uid";
    }

    if (version === "vng") {
      return "roblox_username";
    }

    return "code";
  };

  /* =========================
     VALIDATE DELIVERY
  ========================= */

  const validateDelivery = () => {
    const type = getDeliveryType();

    if (type === "code") {
      if (!deliveryMethod) {
        showToast("Vui lòng chọn phương thức nhận.", "error");
        return false;
      }

      if (!deliveryInfo.trim()) {
        showToast("Vui lòng nhập thông tin nhận thưởng.", "error");
        return false;
      }

      if (deliveryMethod === "zalo") {
        const phone = deliveryInfo.replace(/\s/g, "");

        if (!/^0\d{9}$/.test(phone)) {
          showToast("Số Zalo không hợp lệ.", "error");
          return false;
        }
      }

      return true;
    }

    if (!deliveryInfo.trim()) {
      showToast("Vui lòng nhập thông tin nhận thưởng.", "error");
      return false;
    }

    return true;
  };

  /* =========================
     REDEEM
  ========================= */

  const handleRedeem = async () => {
    if (!session?.user?.id) {
      showToast("Bạn chưa đăng nhập.", "error");
      return;
    }

    if (!selectedPkg) {
      showToast("Vui lòng chọn gói.", "error");
      return;
    }

    if (!validateDelivery()) return;

    const coinCost = Number(selectedPkg.coin_cost || 0);
    const currentCoins = Number(profile?.coins || 0);

    if (coinCost <= 0) {
      showToast("Gói này chưa được cấu hình giá.", "error");
      return;
    }

    if (currentCoins < coinCost) {
      showToast("Bạn không đủ Coin để đổi gói này.", "error");
      return;
    }

    setIsRedeeming(true);

    try {
      const deliveryType = getDeliveryType();

      let finalMethod = deliveryMethod;

      if (deliveryType === "roblox_username") {
        finalMethod = "roblox";
      }

      if (deliveryType === "uid") {
        finalMethod = "lien_quan";
      }

      const { error } = await supabase
        .from("redemption_orders")
        .insert({
          user_id: session.user.id,
          package_name: selectedPkg.name,
          coins_charged: coinCost,
          delivery_method: finalMethod,
          delivery_target: deliveryInfo.trim(),
          status: "processing",
        });

      if (error) {
        console.error(error);
        throw error;
      }

      showToast(
        "Đã tạo đơn thành công! Vui lòng chờ Admin xử lý.",
        "success"
      );

      closeModal();

      // Refresh history
      const { data: newOrders } = await supabase
        .from("redemption_orders")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      setHistory(newOrders || []);
    } catch (error) {
      console.error(error);

      showToast(
        error?.message
          ? `Không thể tạo đơn: ${error.message}`
          : "Không thể tạo đơn.",
        "error"
      );
    } finally {
      setIsRedeeming(false);
    }
  };

  /* =========================
     STATUS
  ========================= */

  const getStatus = (status) => {
    const config = {
      processing: {
        label: "Đang xử lý",
        className: "bg-amber-50 text-amber-600",
        icon: Clock3,
      },

      pending: {
        label: "Chờ xử lý",
        className: "bg-amber-50 text-amber-600",
        icon: Clock3,
      },

      delivered: {
        label: "Đã giao",
        className: "bg-emerald-50 text-emerald-600",
        icon: CheckCircle2,
      },

      rejected: {
        label: "Đã từ chối",
        className: "bg-rose-50 text-rose-600",
        icon: XCircle,
      },

      cancelled: {
        label: "Đã hủy",
        className: "bg-slate-100 text-slate-500",
        icon: XCircle,
      },
    };

    return config[status] || config.processing;
  };

  /* =========================
     DELIVERY LABEL
  ========================= */

  const getDeliveryLabel = (method) => {
    const labels = {
      discord: "Discord",
      zalo: "Zalo",
      roblox: "Roblox",
      lien_quan: "Liên Quân",
    };

    return labels[method] || "Nạp trực tiếp";
  };

  /* =========================
     MODAL DESCRIPTION
  ========================= */

  const getModalDescription = () => {
    const type = getDeliveryType();

    if (type === "roblox_username") {
      return "Robux VNG sẽ được nạp trực tiếp vào tài khoản Roblox.";
    }

    if (type === "code") {
      return "Bạn sẽ nhận mã Robux qua phương thức đã chọn.";
    }

    if (type === "uid") {
      return "Quân Huy sẽ được nạp theo UID tài khoản Liên Quân.";
    }

    return "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-28 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');

        .font-display {
          font-family: 'Baloo 2', sans-serif;
        }

        ::-webkit-scrollbar {
          width: 5px;
        }

        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }
      `}</style>

      {/* =========================
          TOAST
      ========================= */}

      {toast && (
        <div className="fixed left-4 right-4 top-4 z-[100] mx-auto max-w-md">
          <div
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur ${
              toast.type === "error"
                ? "border-rose-100 bg-white text-rose-600"
                : "border-emerald-100 bg-white text-emerald-600"
            }`}
          >
            {toast.type === "error" ? (
              <AlertCircle className="mt-0.5 shrink-0" size={19} />
            ) : (
              <CheckCircle2 className="mt-0.5 shrink-0" size={19} />
            )}

            <p className="flex-1 text-sm font-semibold">{toast.message}</p>

            <button onClick={() => setToast(null)}>
              <X size={17} />
            </button>
          </div>
        </div>
      )}

      {/* =========================
          HEADER
      ========================= */}

      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto max-w-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-500">
                NXX315 Studio
              </p>

              <h1 className="font-display text-2xl font-extrabold text-slate-900">
                Cửa hàng
              </h1>

              <p className="text-xs text-slate-500">
                Đổi Coin lấy phần thưởng
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-500">
              <Gift size={22} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-5">
        {/* =========================
            BALANCE
        ========================= */}

        <section className="relative mb-5 overflow-hidden rounded-[28px] bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 p-5 text-white shadow-xl shadow-blue-500/20">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 left-16 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white/75">
                  Số dư hiện tại
                </p>

                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-4xl font-extrabold">
                    {Number(profile?.coins || 0).toLocaleString("vi-VN")}
                  </span>

                  <span className="text-sm font-semibold text-white/70">
                    Coin
                  </span>
                </div>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <Coins className="text-amber-300" size={24} />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs text-white/85">
              <ShieldCheck size={15} />
              <span>Đổi thưởng an toàn và minh bạch</span>
            </div>
          </div>
        </section>

        {/* =========================
            MAIN TABS
        ========================= */}

        <div className="mb-4 rounded-2xl bg-slate-100 p-1">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => {
                setShopTab("robux");
                setSelectedPkg(null);
              }}
              className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition ${
                shopTab === "robux"
                  ? "bg-white text-sky-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <Gamepad2 size={17} />
              Robux
            </button>

            <button
              onClick={() => {
                setShopTab("quanHuy");
                setSelectedPkg(null);
              }}
              className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition ${
                shopTab === "quanHuy"
                  ? "bg-white text-violet-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <Swords size={17} />
              Quân Huy
            </button>
          </div>
        </div>

        {/* =========================
            ROBUX VERSION
        ========================= */}

        {shopTab === "robux" && (
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Phiên bản
              </p>

              <span className="text-[11px] text-slate-400">
                Chọn phương thức phù hợp
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setVersion("vng");
                  setSelectedPkg(null);
                }}
                className={`rounded-2xl border p-3 text-left transition ${
                  version === "vng"
                    ? "border-sky-200 bg-sky-50 shadow-sm"
                    : "border-slate-100 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇻🇳</span>

                  <div>
                    <p
                      className={`text-sm font-bold ${
                        version === "vng"
                          ? "text-sky-600"
                          : "text-slate-700"
                      }`}
                    >
                      VNG
                    </p>

                    <p className="text-[10px] text-slate-400">
                      Nạp trực tiếp
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setVersion("quocTe");
                  setSelectedPkg(null);
                }}
                className={`rounded-2xl border p-3 text-left transition ${
                  version === "quocTe"
                    ? "border-orange-200 bg-orange-50 shadow-sm"
                    : "border-slate-100 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌎</span>

                  <div>
                    <p
                      className={`text-sm font-bold ${
                        version === "quocTe"
                          ? "text-orange-600"
                          : "text-slate-700"
                      }`}
                    >
                      Quốc tế
                    </p>

                    <p className="text-[10px] text-slate-400">
                      Nhận mã
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* =========================
            SECTION TITLE
        ========================= */}

        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {shopTab === "robux"
                ? version === "vng"
                  ? "Robux VNG"
                  : "Robux Quốc tế"
                : "Liên Quân Mobile"}
            </p>

            <h2 className="font-display text-xl font-extrabold text-slate-900">
              Chọn gói
            </h2>
          </div>

          {filteredPackages.length > 0 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
              {filteredPackages.length} gói
            </span>
          )}
        </div>

        {/* =========================
            PACKAGE LIST
        ========================= */}

        <section className="space-y-3">
          {loading ? (
            <div className="rounded-3xl border border-slate-100 bg-white px-5 py-10 text-center shadow-sm">
              <Loader2
                className="mx-auto animate-spin text-sky-500"
                size={25}
              />

              <p className="mt-3 text-sm font-medium text-slate-400">
                Đang tải gói thưởng...
              </p>
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center">
              <Gift className="mx-auto text-slate-300" size={30} />

              <p className="mt-3 text-sm font-semibold text-slate-500">
                Chưa có gói nào
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Admin chưa mở gói thưởng cho danh mục này.
              </p>
            </div>
          ) : (
            filteredPackages.map((pkg) => (
              <article
                key={pkg.id}
                className="group rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center
