import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  FileText,
  Package,
  RefreshCw,
  XCircle,
} from "lucide-react";

import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import OrderProgressTracker, { displayStep } from "../components/OrderProgressTracker.jsx";
import { supabase } from "../lib/supabaseClient.js";
import {
  formatDate,
  getAccountRows,
  getAmountText,
  getGameName,
  getItemRow,
  getOrderImage,
  getOrderTitle,
  getPayLabel,
  isCoinPayment,
  statusInfo,
} from "../lib/orderView.js";

const NOTICE_TONE = {
  amber: { box: "border-amber-100 bg-amber-50", icon: "text-amber-500", title: "text-amber-700", text: "text-amber-600" },
  blue: { box: "border-blue-100 bg-blue-50", icon: "text-blue-500", title: "text-blue-700", text: "text-blue-600" },
  indigo: { box: "border-indigo-100 bg-indigo-50", icon: "text-indigo-500", title: "text-indigo-700", text: "text-indigo-600" },
  emerald: { box: "border-emerald-100 bg-emerald-50", icon: "text-emerald-500", title: "text-emerald-700", text: "text-emerald-600" },
  rose: { box: "border-rose-100 bg-rose-50", icon: "text-rose-500", title: "text-rose-700", text: "text-rose-600" },
};

function getNotice(order, statusKey) {
  const method = String(order?.payment_method || "").toLowerCase();
  const coin = isCoinPayment(order);

  if (statusKey === "pending") {
    return {
      tone: "amber",
      Icon: Clock3,
      title: "Chờ thanh toán",
      text: "Đơn hàng đang chờ thanh toán. Hãy hoàn tất thanh toán theo hướng dẫn của đơn hàng.",
    };
  }

  if (statusKey === "paid") {
    return {
      tone: "blue",
      Icon: CreditCard,
      title: coin
        ? "Đã trừ xu"
        : method === "card"
        ? "Đã ghi nhận thẻ cào"
        : method === "bank"
        ? "Đã ghi nhận chuyển khoản"
        : "Đã ghi nhận thanh toán",
      text: coin
        ? "Hệ thống đã trừ xu từ ví của bạn. Đơn hàng đang chờ admin kiểm tra và duyệt trong 24h."
        : method === "card"
        ? "Hệ thống đã ghi nhận thẻ cào. Đơn hàng đang chờ admin kiểm tra trong 24h."
        : method === "bank"
        ? "Hệ thống đã ghi nhận chuyển khoản. Đơn hàng đang chờ admin kiểm tra."
        : "Hệ thống đang chờ kiểm tra giao dịch. Khi được xác nhận, trạng thái đơn sẽ được cập nhật.",
    };
  }

  if (statusKey === "processing") {
    return {
      tone: "indigo",
      Icon: RefreshCw,
      title: "Đang xử lý đơn hàng",
      text: "Đơn đã được duyệt và đang được xử lý để giao.",
    };
  }

  if (statusKey === "delivered") {
    return {
      tone: "emerald",
      Icon: CheckCircle2,
      title: "Đơn hàng đã giao",
      text: "Đơn hàng đã được quản trị viên xác nhận giao thành công.",
    };
  }

  if (["success", "completed", "done"].includes(statusKey)) {
    return {
      tone: "emerald",
      Icon: CheckCircle2,
      title: "Đơn hàng đã hoàn thành",
      text: "Giao dịch đã được xác nhận thành công.",
    };
  }

  if (statusKey === "rejected") {
    return {
      tone: "rose",
      Icon: XCircle,
      title: "Đơn hàng đã bị từ chối",
      text: "Quản trị viên đã từ chối giao dịch này.",
      reason: order?.note,
    };
  }

  if (["failed", "cancelled", "canceled"].includes(statusKey)) {
    return {
      tone: "rose",
      Icon: XCircle,
      title: "Giao dịch không thành công",
      text: "Giao dịch này hiện không thể tiếp tục. Nếu bạn cho rằng đây là lỗi, hãy liên hệ quản trị viên.",
    };
  }

  return null;
}

function InfoRow({ label, value, copy = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Copy error:", error);
    }
  };

  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-3 last:border-0">
      <span className="shrink-0 text-[13px] text-gray-400">{label}</span>

      <div className="flex min-w-0 items-center gap-2 text-right">
        <span className="break-all text-[13px] font-semibold text-gray-900">
          {value}
        </span>

        {copy && (
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 text-gray-400 active:text-gray-900"
            aria-label={`Sao chép ${label}`}
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-gray-100 ${className}`} />;
}

function DetailSkeleton() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 p-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex justify-between border-b border-gray-100 py-3 last:border-0">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HistoryDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const source = searchParams.get("source");

  const [order, setOrder] = useState(null);
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrder() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw new Error(userError.message);

      if (!user) {
        navigate("/login");
        return;
      }

      const tables = source ? [source] : ["orders", "redemption_orders"];
      let foundOrder = null;
      let foundTable = null;

      for (const table of tables) {
        const { data, error: queryError } = await supabase
          .from(table)
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (queryError) {
          console.error(`Lỗi query ${table}:`, queryError);
          continue;
        }

        if (data) {
          foundOrder = data;
          foundTable = table;
          break;
        }
      }

      if (!foundOrder) {
        setError(`Không tìm thấy đơn hàng #${id} của tài khoản hiện tại.`);
        return;
      }

      setOrder({ ...foundOrder, __source: foundTable });

      if (
        foundOrder.package_id &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          String(foundOrder.package_id)
        )
      ) {
        const { data: packageData } = await supabase
          .from("redemption_packages")
          .select("*")
          .eq("id", foundOrder.package_id)
          .maybeSingle();
        setPkg(packageData || null);
      } else {
        setPkg(null);
      }
    } catch (err) {
      console.error("HistoryDetail error:", err);
      setError(err?.message || "Không thể tải thông tin giao dịch.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
  }, [id, source]);

  // Admin cập nhật tiến độ / gửi tin nhắn thì trang tự đổi, không cần tải lại
  useEffect(() => {
    if (!order?.id || !order?.__source) return;

    const channel = supabase
      .channel(`order-detail-${order.__source}-${order.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: order.__source,
          filter: `id=eq.${order.id}`,
        },
        (payload) =>
          setOrder((prev) =>
            prev ? { ...prev, ...payload.new, __source: prev.__source } : prev
          )
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.id, order?.__source]);

    const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const statusKey = String(order?.status || "").toLowerCase();
  const step = order ? displayStep(order, now) : 0;
  const inFlight = ["pending", "paid", "processing"].includes(statusKey);
  const shownStatus =
    step === 1 && inFlight ? "paid" : step === 2 && inFlight ? "processing" : order?.status;
  const status = statusInfo(shownStatus);
  const StatusIcon = status.icon;

  const title = order ? getOrderTitle(order) : "";
  const gameName = order ? getGameName(order) : null;
  const image = order ? getOrderImage(order) || pkg?.image_url || null : null;
  const amountText = order ? getAmountText(order, pkg) : "";
  const notice = order ? getNotice(order, statusKey) : null;
  const tone = notice ? NOTICE_TONE[notice.tone] : null;

  const rows = order
    ? [
        { label: "Mã ID", value: order.id, copy: true },
        order.order_code && { label: "Mã đơn", value: order.order_code, copy: true },
        { label: "Thời gian", value: formatDate(order.created_at) },
        getItemRow(order),
        { label: "Thanh toán", value: getPayLabel(order) },
        { label: isCoinPayment(order) ? "Số xu" : "Số tiền", value: amountText },
        ...getAccountRows(order),
        order.delivery_target && { label: "Thông tin nhận", value: order.delivery_target },
        order.note && statusKey !== "rejected" && { label: "Ghi chú", value: order.note },
      ]
        .filter(Boolean)
        .filter((r) => r.value !== null && r.value !== undefined && r.value !== "")
    : [];

  return (
    <div className="min-h-screen bg-white pb-28 text-gray-900">
      <TopHeader />

      <main className="px-4 pt-5">
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            onClick={() => navigate("/history")}
            className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-500"
          >
            <ArrowLeft size={17} />
            Quay lại lịch sử
          </button>

          {loading && <DetailSkeleton />}

          {!loading && error && (
            <div className="rounded-2xl border border-rose-100 bg-white p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50">
                <XCircle size={28} className="text-rose-500" />
              </div>
              <h2 className="mt-4 text-base font-bold text-gray-900">
                Không thể tải đơn hàng
              </h2>
              <p className="mt-2 break-words text-xs leading-5 text-rose-500">{error}</p>
              <button
                type="button"
                onClick={loadOrder}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-xs font-bold text-white"
              >
                <RefreshCw size={14} />
                Thử lại
              </button>
            </div>
          )}

          {!loading && !error && order && (
            <>
              {/* Thẻ sản phẩm */}
              <section className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                    {image ? (
                      <img
                        src={image}
                        alt={title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package size={26} className="text-gray-300" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg font-bold leading-tight text-gray-900">
                      {title}
                    </h1>
                    {gameName && (
                      <p className="mt-1 text-xs font-semibold text-blue-600">{gameName}</p>
                    )}
                    <p className="mt-1 truncate text-xs text-gray-400">
                      #{order.order_code || order.id}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-[11px] text-gray-400">Giá trị</p>
                    <p className="mt-0.5 text-base font-bold text-gray-900">{amountText}</p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${status.className}`}
                  >
                    <StatusIcon size={14} />
                    {status.label}
                  </span>
                </div>
              </section>

              {/* Thông tin đơn hàng */}
              <section className="mt-3 rounded-2xl border border-gray-200 bg-white px-5 pb-2 pt-4">
                <div className="mb-1 flex items-center gap-2">
                  <FileText size={16} className="text-gray-400" />
                  <h2 className="text-sm font-bold text-gray-900">Thông tin đơn hàng</h2>
                </div>

                {rows.map((row) => (
                  <InfoRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                    copy={row.copy}
                  />
                ))}
              </section>

              {/* Thông báo theo trạng thái */}
              {notice && (
                <section className={`mt-3 rounded-2xl border p-5 ${tone.box}`}>
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white ${tone.icon}`}
                    >
                      <notice.Icon size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-bold ${tone.title}`}>{notice.title}</p>
                      <p className={`mt-1 text-xs leading-5 ${tone.text}`}>{notice.text}</p>

                      {notice.reason && (
                        <div className="mt-3 rounded-xl border border-rose-200 bg-white p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                            Lý do từ chối
                          </p>
                          <p className="mt-1 whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-rose-800">
                            {notice.reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

          
            </>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
      }
