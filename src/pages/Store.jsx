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

const ROBUX_PACKAGE = {
  id: "robux-vng-40",
  name: "Gói 40 Robux",
  robux: 40,
  coin_cost: 12000,
  price_vnd: 14500,
  version: "vng",
  reward_type: "robux",
};

const formatCoins = (value = 0) =>
  new Intl.NumberFormat("vi-VN").format(
    Number(value || 0)
  );

const formatVND = (value = 0) =>
  `${new Intl.NumberFormat("vi-VN").format(
    Number(value || 0)
  )}đ`;

const formatDate = (value) => {
  if (!value) return "";

  return new Date(value).toLocaleString(
    "vi-VN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

const statusConfig = {
  pending: {
    label: "Đang xử lý",
    icon: Clock3,
  },

  delivered: {
    label: "Đã giao",
    icon: CheckCircle2,
  },

  rejected: {
    label: "Từ chối",
    icon: XCircle,
  },

  cancelled: {
    label: "Đã hủy",
    icon: XCircle,
  },

  PENDING: {
    label: "Chờ thanh toán",
    icon: Clock3,
  },

  PAID: {
    label: "Đã thanh toán",
    icon: CheckCircle2,
  },

  EXPIRED: {
    label: "Hết hạn",
    icon: XCircle,
  },

  CANCELLED: {
    label: "Đã hủy",
    icon: XCircle,
  },
};

/* =====================================================
   PAYMENT PAGE
===================================================== */

function NPayPaymentPage({
  payment,
  onBack,
  onCancel,
  onPaid,
  onCopy,
  copied,
}) {
  const [secondsLeft, setSecondsLeft] =
    useState(() => {
      return Math.max(
        0,
        Math.floor(
          (new Date(
            payment.expires_at
          ).getTime() -
            Date.now()) /
            1000
        )
      );
    });

  const [showCancel, setShowCancel] =
    useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const left = Math.max(
        0,
        Math.floor(
          (new Date(
            payment.expires_at
          ).getTime() -
            Date.now()) /
            1000
        )
      );

      setSecondsLeft(left);

      if (left <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [payment.expires_at]);

  useEffect(() => {
    let mounted = true;

    const checkPayment = async () => {
      const { data, error } =
        await supabase
          .from("payment_orders")
          .select("status, paid_at")
          .eq("id", payment.id)
          .maybeSingle();

      if (
        error ||
        !mounted ||
        !data
      ) {
        return;
      }

      if (data.status === "PAID") {
        onPaid({
          ...payment,
          status: "PAID",
          paid_at: data.paid_at,
        });
      }
    };

    checkPayment();

    const timer = setInterval(
      checkPayment,
      3000
    );

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [payment.id]);

  const minutes = Math.floor(
    secondsLeft / 60
  );

  const seconds = secondsLeft % 60;

  const expired = secondsLeft <= 0;

  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-28">
      <TopHeader />

      <main className="mx-auto w-full max-w-md px-4 pt-4">

        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700"
        >
          <ArrowLeft size={18} />

          Quay lại
        </button>

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">

          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 px-5 py-6 text-center text-white">

            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <QrCode size={30} />
            </div>

            <h1 className="text-xl font-bold">
              Thanh toán VietQR
            </h1>

            <p className="mt-1 text-sm text-white/80">
              Quét mã bằng ứng dụng ngân hàng
            </p>

          </div>

          <div className="p-5">

            <div className="rounded-2xl bg-gray-50 p-4">

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Sản phẩm
                </span>

                <b>
                  {payment.package_name}
                </b>
              </div>

              <div className="mt-2 flex justify-between text-sm">
                <span className="text-gray-500">
                  Số tiền
                </span>

                <b>
                  {formatVND(payment.amount)}
                </b>
              </div>

              <div className="mt-2 flex justify-between text-sm">
                <span className="text-gray-500">
                  Phí
                </span>

                <b>
                  {formatVND(payment.fee || 0)}
                </b>
              </div>

              <div className="my-3 border-t" />

              <div className="flex justify-between">
                <span className="font-semibold">
                  Tổng thanh toán
                </span>

                <strong className="text-xl text-blue-600">
                  {formatVND(payment.total)}
                </strong>
              </div>

            </div>

            <div className="mt-5 flex justify-center">

              {payment.qr_url ? (
                <div className="rounded-3xl border bg-white p-3 shadow-sm">

                  <img
                    src={payment.qr_url}
                    alt="VietQR thanh toán"
                    className="h-64 w-64 object-contain"
                  />

                </div>
              ) : (
                <div className="flex h-64 w-64 items-center justify-center rounded-3xl bg-gray-100">

                  <Loader2
                    size={32}
                    className="animate-spin text-blue-600"
                  />

                </div>
              )}

            </div>

            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">

              <p className="text-xs font-medium text-gray-500">
                Nội dung chuyển khoản
              </p>

              <div className="mt-2 flex items-center gap-2">

                <div className="min-w-0 flex-1 break-all font-bold text-blue-700">
                  {payment.payment_code}
                </div>

                <button
                  onClick={() =>
                    onCopy(
                      payment.payment_code
                    )
                  }
                  className="rounded-xl bg-white p-2 text-blue-600 shadow-sm"
                >
                  {copied ? (
                    <Check size={17} />
                  ) : (
                    <Copy size={17} />
                  )}
                </button>

              </div>

            </div>

            <div className="mt-4 rounded-2xl border p-4">

              <div className="font-semibold">
                MB Bank
              </div>

              <div className="mt-2 text-sm text-gray-600">
                Số tài khoản:{" "}
                <b>0939339622</b>
              </div>

              <div className="mt-1 text-sm text-gray-600">
                Chủ tài khoản:{" "}
                <b>NGUYEN VAN CO</b>
              </div>
            
            </div>
                        <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-600">
              <Clock3 size={17} />

              {expired
                ? "Mã thanh toán đã hết hạn"
                : `Thời gian còn lại: ${String(
                    minutes
                  ).padStart(2, "0")}:${String(
                    seconds
                  ).padStart(2, "0")}`}
            </div>

            <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-xs leading-5 text-gray-500">
              <b className="text-gray-700">
                Lưu ý:
              </b>{" "}
              Chuyển đúng số tiền và giữ nguyên
              nội dung chuyển khoản để hệ thống
              tự động xác nhận.
            </div>

            {!expired && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600">
                <ShieldCheck size={18} />

                Hệ thống đang tự động kiểm tra
                thanh toán
              </div>
            )}

            <button
              onClick={() => setShowCancel(true)}
              className="mt-5 w-full rounded-2xl border border-red-200 py-3 font-semibold text-red-500"
            >
              Hủy giao dịch
            </button>

          </div>
        </div>
      </main>

      {showCancel && (
        <CancelModal
          onClose={() =>
            setShowCancel(false)
          }
          onConfirm={() => {
            setShowCancel(false);
            onCancel();
          }}
        />
      )}

      <BottomNav />
    </div>
  );
}

/* =====================================================
   CANCEL MODAL
===================================================== */

function CancelModal({
  onClose,
  onConfirm,
}) {
  const [countdown, setCountdown] =
    useState(3);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((value) => value - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5">

      <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl">

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
          <XCircle
            size={25}
            className="text-red-500"
          />
        </div>

        <h2 className="mt-4 text-center text-lg font-bold">
          Hủy giao dịch?
        </h2>

        <p className="mt-2 text-center text-sm leading-6 text-gray-500">
          Nếu bạn đã chuyển khoản thì không
          nên hủy giao dịch. Hệ thống có thể
          không tự động xử lý đơn sau khi hủy.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">

          <button
            onClick={onClose}
            className="rounded-2xl bg-gray-100 py-3 font-semibold"
          >
            Quay lại
          </button>

          <button
            disabled={countdown > 0}
            onClick={onConfirm}
            className="rounded-2xl bg-red-500 py-3 font-semibold text-white disabled:opacity-40"
          >
            {countdown > 0
              ? `Hủy (${countdown})`
              : "Xác nhận hủy"}
          </button>

        </div>
      </div>
    </div>
  );
}

/* =====================================================
   ORDER PANEL
===================================================== */

function OrderPanel({
  pkg,
  deliveryTarget,
  setDeliveryTarget,
  paymentMethod,
  setPaymentMethod,
  onClose,
  onRedeem,
  loading,
}) {
  const validTarget =
    deliveryTarget.trim().length >= 3;

  const canSubmit =
    validTarget &&
    !!paymentMethod &&
    !loading;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 sm:items-center">

      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl">

        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-gray-200" />

        <div className="flex items-start justify-between">

          <div>
            <h2 className="text-xl font-bold">
              {pkg.name}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Nhập Roblox ID để nhận Robux
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl bg-gray-100 p-2"
          >
            <XCircle size={19} />
          </button>

        </div>

        <label className="mt-5 block text-sm font-semibold">
          Roblox ID
        </label>

        <input
          value={deliveryTarget}
          onChange={(event) =>
            setDeliveryTarget(
              event.target.value
            )
          }
          placeholder="Nhập Roblox ID"
          className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue-500"
        />

        <div className="mt-4 rounded-2xl bg-gray-50 p-4">

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">
              Gói
            </span>

            <b>
              {pkg.robux} Robux
            </b>
          </div>

          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-500">
              Giá
            </span>

            <b>
              {formatVND(pkg.price_vnd)}
            </b>
          </div>

        </div>

        <div className="mt-5">

          <div className="text-sm font-semibold">
            Phương thức thanh toán
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">

            <button
              onClick={() =>
                setPaymentMethod("coins")
              }
              className={`rounded-2xl border p-4 text-left ${
                paymentMethod === "coins"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <Coins
                size={22}
                className="text-yellow-500"
              />

              <div className="mt-2 font-bold">
                Dùng xu
              </div>

              <div className="mt-1 text-xs text-gray-500">
                {formatCoins(
                  pkg.coin_cost
                )}{" "}
                xu
              </div>
            </button>

            <button
              onClick={() =>
                setPaymentMethod("vietqr")
              }
              className={`rounded-2xl border p-4 text-left ${
                paymentMethod === "vietqr"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <QrCode
                size={22}
                className="text-blue-600"
              />

              <div className="mt-2 font-bold">
                VietQR
              </div>

              <div className="mt-1 text-xs text-gray-500">
                {formatVND(
                  pkg.price_vnd
                )}
              </div>
            </button>

          </div>
        </div>

        <button
          disabled={!canSubmit}
          onClick={onRedeem}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 font-bold text-white disabled:opacity-40"
        >
          {loading && (
            <Loader2
              size={18}
              className="animate-spin"
            />
          )}

          {paymentMethod === "vietqr"
            ? "Tạo mã thanh toán"
            : "Đổi ngay"}
        </button>

      </div>
    </div>
  );
}
/* =====================================================
   STORE
===================================================== */

export default function Store() {
  const session = useSession();
  const profile = useProfile();

  const user = session?.user;
  const userId = user?.id;

  const coins = Number(
    profile?.coins ??
      profile?.coin ??
      profile?.balance ??
      0
  );

  const [selectedPackage, setSelectedPackage] =
    useState(null);

  const [deliveryTarget, setDeliveryTarget] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("");

  const [payment, setPayment] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [history, setHistory] =
    useState([]);

  const [toast, setToast] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const [showHistory, setShowHistory] =
    useState(false);

  const packages = useMemo(
    () => [ROBUX_PACKAGE],
    []
  );

  /* ===============================
     TOAST
  =============================== */

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(
      () => setToast(""),
      2500
    );

    return () =>
      clearTimeout(timer);
  }, [toast]);

  /* ===============================
     LOAD HISTORY
  =============================== */

  const loadHistory = async () => {
    if (!userId) return;

    const { data, error } =
      await supabase
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

  useEffect(() => {
    loadHistory();
  }, [userId]);

  /* ===============================
     OPEN PACKAGE
  =============================== */

  const openPackage = (pkg) => {
    setSelectedPackage(pkg);
    setDeliveryTarget("");
    setPaymentMethod("");
  };

  const closePackage = () => {
    if (loading) return;

    setSelectedPackage(null);
    setDeliveryTarget("");
    setPaymentMethod("");
  };

  /* ===============================
     CREATE NPAY ORDER
  =============================== */

  const createNPayOrder = async () => {
    if (!userId) {
      throw new Error(
        "Bạn chưa đăng nhập."
      );
    }

    if (!selectedPackage) {
      throw new Error(
        "Chưa chọn gói."
      );
    }

    const target =
      deliveryTarget.trim();

    if (target.length < 3) {
      throw new Error(
        "Roblox ID không hợp lệ."
      );
    }

    const { data, error } =
      await supabase.functions.invoke(
        "create-npay-order",
        {
          body: {
            package_id:
              selectedPackage.id,

            package_name:
              selectedPackage.name,

            delivery_target: target,
          },
        }
      );

    if (error) {
      throw error;
    }

    if (
      !data ||
      !data.payment
    ) {
      throw new Error(
        "Không tạo được đơn thanh toán."
      );
    }

    return data.payment;
  };

  /* ===============================
     REDEEM COINS
  =============================== */

  const redeemWithCoins = async () => {
    if (!userId) {
      throw new Error(
        "Bạn chưa đăng nhập."
      );
    }

    if (
      coins <
      Number(
        selectedPackage.coin_cost
      )
    ) {
      throw new Error(
        "Bạn không đủ xu."
      );
    }

    const { error } =
      await supabase.rpc(
        "create_redemption_order",
        {
          p_user_id: userId,

          p_package_id:
            selectedPackage.id,

          p_delivery_method:
            "roblox_id",

          p_delivery_target:
            deliveryTarget.trim(),
        }
      );

    if (error) {
      throw error;
    }
  };

  /* ===============================
     REDEEM
  =============================== */

  const handleRedeem = async () => {
    if (!selectedPackage) return;

    setLoading(true);

    try {
      if (
        paymentMethod === "coins"
      ) {
        await redeemWithCoins();

        setToast(
          "Đổi xu thành công! Đơn hàng đang được xử lý."
        );

        closePackage();

        await loadHistory();

        return;
      }

      if (
        paymentMethod === "vietqr"
      ) {
        const created =
          await createNPayOrder();

        setPayment(created);
        setSelectedPackage(null);

        return;
      }

      throw new Error(
        "Vui lòng chọn phương thức thanh toán."
      );
    } catch (error) {
      console.error(
        "Redeem error:",
        error
      );

      setToast(
        error?.message ||
          "Có lỗi xảy ra, vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     CANCEL PAYMENT
  =============================== */

  const cancelPayment = async () => {
    if (!payment?.id) return;

    const { error } =
      await supabase
        .from("payment_orders")
        .update({
          status: "CANCELLED",
        })
        .eq("id", payment.id)
        .eq("user_id", userId)
        .eq("status", "PENDING");

    if (error) {
      setToast(
        "Không thể hủy giao dịch."
      );

      return;
    }

    setPayment(null);

    setToast(
      "Đã hủy giao dịch."
    );
  };

  /* ===============================
     PAYMENT SUCCESS
  =============================== */

  const handlePaid = async () => {
    setToast(
      "Thanh toán thành công! Đơn hàng đang được xử lý."
    );

    setPayment(null);

    await loadHistory();
  };

  /* ===============================
     COPY
  =============================== */

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(
        text
      );

      setCopied(true);

      setTimeout(
        () => setCopied(false),
        1500
      );
    } catch {
      setToast(
        "Không thể sao chép."
      );
    }
  };

  /* ===============================
     PAYMENT PAGE
  =============================== */

  if (payment) {
    return (
      <NPayPaymentPage
        payment={payment}
        onBack={() =>
          setPayment(null)
        }
        onCancel={
          cancelPayment
        }
        onPaid={
          handlePaid
        }
        onCopy={copyText}
        copied={copied}
      />
    );
  }

  /* ===============================
     MAIN STORE
  =============================== */

  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-24">

      <TopHeader />

      <main className="mx-auto w-full max-w-md px-4 pt-4">

        {/* HEADER */}

        <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 p-5 text-white shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <Gift size={25} />
            </div>

            <div>
              <div className="text-xl font-bold">
                Cửa hàng
              </div>

              <div className="text-sm text-white/80">
                Đổi xu hoặc thanh toán VietQR
              </div>
            </div>

          </div>

          <div className="mt-5 flex items-center justify-between rounded-2xl bg-white/10 p-4">

            <span className="text-sm">
              Số dư xu
            </span>

            <div className="flex items-center gap-2 font-bold">

              <Coins
                size={18}
                className="text-yellow-300"
              />

              {formatCoins(coins)}

            </div>

          </div>

        </div>

        {/* ROBLOX */}

        <div className="mt-6">

          <div className="mb-3 flex items-center justify-between">

            <h2 className="text-lg font-bold">
              Roblox
            </h2>

            <Gamepad2
              size={20}
              className="text-blue-600"
            />

          </div>

          <div className="space-y-3">

            {/* VNG */}

            <div className="rounded-2xl border bg-white p-4 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">

                  <Sparkles
                    className="text-red-500"
                  />

                </div>

                <div>

                  <div className="font-bold">
                    VNG – Nạp trực tiếp
                  </div>

                  <div className="text-xs text-gray-500">
                    Nạp Robux trực tiếp vào Roblox ID
                  </div>

                </div>

              </div>

              <button
                onClick={() =>
                  openPackage(
                    ROBUX_PACKAGE
                  )
                }
                className="mt-4 flex w-full items-center justify-between rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white"
              >

                <span>
                  40 Robux ·{" "}
                  {formatVND(
                    ROBUX_PACKAGE.price_vnd
                  )}
                </span>

                <ChevronRight
                  size={18}
                />

              </button>

            </div>

            {/* CARD ROBUX */}

            <div className="rounded-2xl border bg-white p-4 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50">

                  <Swords
                    className="text-purple-500"
                  />

                </div>

                <div>

                  <div className="font-bold">
                    Card Robux
                  </div>

                  <div className="text-xs text-gray-500">
                    Danh mục đang cập nhật
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>

        {/* HISTORY BUTTON */}

        <button
          onClick={() =>
            setShowHistory(
              (value) => !value
            )
          }
          className="mt-6 flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
        >

          <div className="font-bold">
            Lịch sử đơn hàng
          </div>

          <ChevronRight
            size={19}
            className={
              showHistory
                ? "rotate-90 transition"
                : "transition"
            }
          />

        </button>

        {/* HISTORY */}

        {showHistory && (
          <div className="mt-3 space-y-3">

            {history.length === 0 ? (

              <div className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500">
                Chưa có đơn hàng.
              </div>

            ) : (

              history.map((order) => {

                const config =
                  statusConfig[
                    order.status
                  ] ||
                  statusConfig.pending;

                const Icon =
                  config.icon;

                return (
                  <div
                    key={order.id}
                    className="rounded-2xl bg-white p-4 shadow-sm"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <div className="font-semibold">
                          {order.package_name}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {formatDate(
                            order.created_at
                          )}
                        </div>

                      </div>

                      <div className="flex items-center gap-1 text-xs font-semibold">

                        <Icon size={15} />

                        {config.label}

                      </div>

                    </div>

                    {order.order_code && (
                      <div className="mt-3 text-xs text-gray-500">

                        Mã đơn:{" "}

                        <b>
                          {order.order_code}
                        </b>

                      </div>
                    )}

                  </div>
                );
              })

            )}

          </div>
        )}

      </main>

      {/* ORDER PANEL */}

      {selectedPackage && (
        <OrderPanel
          pkg={selectedPackage}
          deliveryTarget={
            deliveryTarget
          }
          setDeliveryTarget={
            setDeliveryTarget
          }
          paymentMethod={
            paymentMethod
          }
          setPaymentMethod={
            setPaymentMethod
          }
          onClose={
            closePackage
          }
          onRedeem={
            handleRedeem
          }
          loading={loading}
        />
      )}

      {/* TOAST */}

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-2xl bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-xl">
          {toast}
        </div>
      )}

      <BottomNav />

    </div>
  );
        }
