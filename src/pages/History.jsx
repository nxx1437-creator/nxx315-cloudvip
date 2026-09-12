import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock3,
  CheckCircle2,
  XCircle,
  PackageCheck,
  CreditCard,
  Coins,
  RefreshCw,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import TopHeader from "../components/TopHeader";
import BottomNav from "../components/BottomNav";

const statusInfo = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "pending":
      return {
        label: "Chờ thanh toán",
        icon: Clock3,
        className: "text-amber-600 bg-amber-50",
      };

    case "paid":
      return {
        label: "Đang kiểm tra",
        icon: CreditCard,
        className: "text-blue-600 bg-blue-50",
      };

    case "processing":
      return {
        label: "Đang xử lý",
        icon: RefreshCw,
        className: "text-indigo-600 bg-indigo-50",
      };

    case "delivered":
      return {
        label: "Đã giao",
        icon: CheckCircle2,
        className: "text-emerald-600 bg-emerald-50",
      };

    case "rejected":
      return {
        label: "Đã từ chối",
        icon: XCircle,
        className: "text-red-600 bg-red-50",
      };

    case "cancelled":
    case "canceled":
      return {
        label: "Đã hủy",
        icon: XCircle,
        className: "text-gray-600 bg-gray-100",
      };

    case "failed":
      return {
        label: "Thất bại",
        icon: XCircle,
        className: "text-red-600 bg-red-50",
      };

    default:
      return {
        label: "Đang xử lý",
        icon: RefreshCw,
        className: "text-indigo-600 bg-indigo-50",
      };
  }
};

const formatMoney = (value) => {
  const number = Number(value || 0);
  return `${number.toLocaleString("vi-VN")}đ`;
};

const formatDate = (value) => {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

const getOrderAmount = (order) => {
  if (order?.amount != null) return order.amount;
  if (order?.price != null) return order.price;
  if (order?.coin_cost != null) return order.coin_cost;

  return 0;
};

const getOrderTitle = (order) => {
  if (order?.robux != null) {
    return `${Number(order.robux).toLocaleString("vi-VN")} Robux`;
  }

  if (order?.package_name) {
    return order.package_name;
  }

  if (order?.title) {
    return order.title;
  }

  if (order?.type === "redemption") {
    return "Đổi thưởng";
  }

  return "Đơn hàng";
};

const mergeOrder = (oldOrder, newOrder) => {
  return {
    ...oldOrder,
    ...newOrder,
    _source: oldOrder?._source || newOrder?._source,
  };
};

export default function History() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const sourceFromUrl = searchParams.get("source");

  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const selectedSource = useMemo(() => {
    if (selected?._source) {
      return selected._source;
    }

    return sourceFromUrl || null;
  }, [selected, sourceFromUrl]);

  const sortHistory = (items) => {
    return [...items].sort(
      (a, b) =>
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
    );
  };

  const updateSelectedFromHistory = (items) => {
    if (!id) {
      setSelected(null);
      return;
    }

    const found = items.find((item) => {
      const sameId = String(item.id) === String(id);

      if (!sameId) {
        return false;
      }

      if (selectedSource) {
        return item._source === selectedSource;
      }

      return true;
    });

    if (found) {
      setSelected(found);
    }
  };

  const loadHistory = async (showLoading = false) => {
    const currentRequestId = ++requestIdRef.current;

    if (showLoading) {
      setLoading(true);
    }

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        if (!mountedRef.current) return;

        setHistory([]);
        setSelected(null);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const [ordersResult, redemptionResult] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("redemption_orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          }),
      ]);

      if (ordersResult.error) {
        throw ordersResult.error;
      }

      if (redemptionResult.error) {
        throw redemptionResult.error;
      }

      if (
        !mountedRef.current ||
        currentRequestId !== requestIdRef.current
      ) {
        return;
      }

      const normalOrders = (ordersResult.data || []).map(
        (order) => ({
          ...order,
          _source: "orders",
        })
      );

      const redemptionOrders = (
        redemptionResult.data || []
      ).map((order) => ({
        ...order,
        _source: "redemption_orders",
      }));

      const merged = sortHistory([
        ...normalOrders,
        ...redemptionOrders,
      ]);

      setHistory(merged);
      updateSelectedFromHistory(merged);
    } catch (error) {
      console.error("History load error:", error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };
    const applyRealtimeChange = (source, payload) => {
    if (!mountedRef.current) {
      return;
    }

    const eventType = payload.eventType;

    console.log(
      `[History Realtime] ${source}`,
      eventType,
      payload
    );

    if (eventType === "DELETE") {
      const deletedId = payload.old?.id;

      if (deletedId == null) {
        return;
      }

      setHistory((current) => {
        const updated = current.filter(
          (item) =>
            !(
              item._source === source &&
              String(item.id) === String(deletedId)
            )
        );

        updateSelectedFromHistory(updated);

        return updated;
      });

      return;
    }

    const newRow = payload.new;

    if (!newRow?.id) {
      return;
    }

    setHistory((current) => {
      const index = current.findIndex(
        (item) =>
          item._source === source &&
          String(item.id) === String(newRow.id)
      );

      let updated;

      if (index === -1) {
        updated = [
          {
            ...newRow,
            _source: source,
          },
          ...current,
        ];
      } else {
        updated = [...current];

        updated[index] = mergeOrder(
          updated[index],
          {
            ...newRow,
            _source: source,
          }
        );
      }

      updated = sortHistory(updated);

      updateSelectedFromHistory(updated);

      return updated;
    });

    setSelected((current) => {
      if (!current) {
        return current;
      }

      if (current._source !== source) {
        return current;
      }

      if (
        String(current.id) !== String(newRow.id)
      ) {
        return current;
      }

      /*
       * QUAN TRỌNG:
       *
       * Nếu Admin đổi:
       *
       * paid -> processing
       *
       * hoặc:
       *
       * processing -> delivered
       *
       * thì payload.new.status sẽ được lấy trực tiếp
       * và ghi đè vào selected.
       */
      return {
        ...current,
        ...newRow,
        _source: source,
      };
    });
  };

  useEffect(() => {
    mountedRef.current = true;

    loadHistory(true);

    const ordersChannel = supabase
      .channel("history-orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          applyRealtimeChange(
            "orders",
            payload
          );
        }
      )
      .subscribe((status) => {
        console.log(
          "[History] orders realtime:",
          status
        );
      });

    const redemptionChannel = supabase
      .channel("history-redemption-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "redemption_orders",
        },
        (payload) => {
          applyRealtimeChange(
            "redemption_orders",
            payload
          );
        }
      )
      .subscribe((status) => {
        console.log(
          "[History] redemption realtime:",
          status
        );
      });

    /*
     * Fallback:
     *
     * Nếu Realtime không hoạt động vì chưa bật
     * publication thì vẫn kiểm tra DB định kỳ.
     */
    const interval = setInterval(() => {
      loadHistory(false);
    }, 5000);

    return () => {
      mountedRef.current = false;

      clearInterval(interval);

      supabase.removeChannel(
        ordersChannel
      );

      supabase.removeChannel(
        redemptionChannel
      );
    };
  }, [id, sourceFromUrl]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory(false);
  };

  if (id) {
    const order = selected;

    if (loading && !order) {
      return (
        <div className="min-h-screen bg-slate-50">
          <TopHeader />

          <main className="mx-auto max-w-2xl px-4 py-8">
            <div className="animate-pulse rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-5 h-8 w-32 rounded bg-slate-200" />

              <div className="mb-3 h-5 w-48 rounded bg-slate-200" />

              <div className="h-4 w-72 rounded bg-slate-200" />
            </div>
          </main>

          <BottomNav />
        </div>
      );
    }

    if (!order) {
      return (
        <div className="min-h-screen bg-slate-50">
          <TopHeader />

          <main className="mx-auto max-w-2xl px-4 py-8">
            <button
              onClick={() => navigate("/history")}
              className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-700"
            >
              <ArrowLeft size={18} />
              Quay lại lịch sử
            </button>

            <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
              <PackageCheck
                className="mx-auto mb-3 text-slate-400"
                size={42}
              />

              <h1 className="text-lg font-bold text-slate-900">
                Không tìm thấy đơn hàng
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Đơn hàng có thể không tồn tại hoặc
                không thuộc tài khoản này.
              </p>
            </div>
          </main>

          <BottomNav />
        </div>
      );
    }

    const status = statusInfo(order.status);
    const StatusIcon = status.icon;

    return (
      <div className="min-h-screen bg-slate-50 pb-24">
        <TopHeader />

        <main className="mx-auto max-w-2xl px-4 py-5">
          <button
            onClick={() => navigate("/history")}
            className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700"
          >
            <ArrowLeft size={18} />
            Quay lại lịch sử
          </button>

          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-400">
                    Chi tiết đơn hàng
                  </p>

                  <h1 className="mt-1 text-xl font-bold text-slate-900">
                    {getOrderTitle(order)}
                  </h1>

                  <p className="mt-1 text-xs text-slate-400">
                    Mã đơn: {order.order_code || order.id}
                  </p>
                </div>

                <div
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}
                >
                  <StatusIcon size={15} />

                  {status.label}
                </div>
              </div>
            </div>
                             <div className="space-y-4 p-5">
              {order.roblox_username && (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Tài khoản Roblox
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {order.roblox_username}
                  </p>

                  {order.roblox_user_id && (
                    <p className="mt-1 text-xs text-slate-500">
                      User ID: {order.roblox_user_id}
                    </p>
                  )}

                  {order.roblox_display_name &&
                    order.roblox_display_name !==
                      order.roblox_username && (
                      <p className="mt-1 text-xs text-slate-500">
                        Display Name:{" "}
                        {order.roblox_display_name}
                      </p>
                    )}
                </div>
              )}

              {order.package_id && (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Gói đã chọn
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {order.package_id}
                  </p>

                  {order.robux != null && (
                    <p className="mt-1 text-xs text-slate-500">
                      {Number(order.robux).toLocaleString(
                        "vi-VN"
                      )}{" "}
                      Robux
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Giá trị
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    {formatMoney(
                      getOrderAmount(order)
                    )}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Phương thức
                  </p>

                  <p className="mt-1 font-bold capitalize text-slate-900">
                    {order.payment_method || "—"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 p-4">
                <p className="text-xs text-slate-400">
                  Thời gian tạo đơn
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {formatDate(order.created_at)}
                </p>
              </div>

              {order.updated_at && (
                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-xs text-slate-400">
                    Cập nhật gần nhất
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatDate(order.updated_at)}
                  </p>
                </div>
              )}

              {order.status === "pending" && (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
                  <div className="flex items-start gap-3">
                    <Clock3
                      className="mt-0.5 shrink-0"
                      size={19}
                    />

                    <div>
                      <p className="font-bold">
                        Đơn hàng đang chờ thanh toán
                      </p>

                      <p className="mt-1 text-xs leading-5">
                        Vui lòng hoàn tất thanh toán
                        theo hướng dẫn để đơn hàng
                        được kiểm tra.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {order.status === "paid" && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                  <div className="flex items-start gap-3">
                    <CreditCard
                      className="mt-0.5 shrink-0"
                      size={19}
                    />

                    <div>
                      <p className="font-bold">
                        Đã ghi nhận chuyển khoản
                      </p>

                      <p className="mt-1 text-xs leading-5">
                        Hệ thống đã ghi nhận thanh toán.
                        Đơn hàng đang được kiểm tra.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {order.status === "processing" && (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-800">
                  <div className="flex items-start gap-3">
                    <RefreshCw
                      className="mt-0.5 shrink-0"
                      size={19}
                    />

                    <div>
                      <p className="font-bold">
                        Đang xử lý đơn hàng
                      </p>

                      <p className="mt-1 text-xs leading-5">
                        Đơn đã được duyệt và đang được
                        xử lý để giao Robux.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {order.status === "delivered" && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className="mt-0.5 shrink-0"
                      size={19}
                    />

                    <div>
                      <p className="font-bold">
                        Đơn hàng đã giao
                      </p>

                      <p className="mt-1 text-xs leading-5">
                        Robux đã được giao thành công.
                        Cảm ơn bạn đã sử dụng dịch vụ.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {order.status === "rejected" && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
                  <div className="flex items-start gap-3">
                    <XCircle
                      className="mt-0.5 shrink-0"
                      size={19}
                    />

                    <div>
                      <p className="font-bold">
                        Đơn hàng bị từ chối
                      </p>

                      {order.note && (
                        <p className="mt-1 text-xs leading-5">
                          Lý do: {order.note}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {order.status === "failed" && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
                  <div className="flex items-start gap-3">
                    <XCircle
                      className="mt-0.5 shrink-0"
                      size={19}
                    />

                    <div>
                      <p className="font-bold">
                        Đơn hàng thất bại
                      </p>

                      {order.note && (
                        <p className="mt-1 text-xs leading-5">
                          {order.note}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {order.coin_cost != null && (
                <div className="flex items-center justify-between rounded-2xl bg-amber-50 p-4">
                  <div className="flex items-center gap-2">
                    <Coins
                      className="text-amber-600"
                      size={19}
                    />

                    <span className="text-sm font-semibold text-slate-700">
                      Coin đã sử dụng
                    </span>
                  </div>

                  <span className="font-bold text-amber-700">
                    {Number(
                      order.coin_cost
                    ).toLocaleString("vi-VN")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <TopHeader />

      <main className="mx-auto max-w-2xl px-4 py-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Lịch sử đơn hàng
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Theo dõi trạng thái các đơn hàng của bạn
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 disabled:opacity-50"
            title="Làm mới"
          >
            <RefreshCw
              size={18}
              className={
                refreshing ? "animate-spin" : ""
              }
            />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-3xl bg-white p-5 shadow-sm"
              >
                <div className="mb-3 h-5 w-40 rounded bg-slate-200" />

                <div className="mb-2 h-4 w-28 rounded bg-slate-200" />

                <div className="h-4 w-52 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <PackageCheck
              className="mx-auto mb-4 text-slate-300"
              size={50}
            />

            <h2 className="text-lg font-bold text-slate-800">
              Chưa có đơn hàng
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Các đơn hàng của bạn sẽ xuất hiện ở đây.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((order) => {
              const status = statusInfo(
                order.status
              );

              const StatusIcon = status.icon;

              return (
                <button
                  key={`${order._source}-${order.id}`}
                  onClick={() =>
                    navigate(
                      `/history/order/${order.id}?source=${order._source}`
                    )
                  }
                  className="w-full rounded-3xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-bold text-slate-900">
                        {getOrderTitle(order)}
                      </h2>

                      <p className="mt-1 text-xs text-slate-400">
                        {order.order_code
                          ? `#${order.order_code}`
                          : `#${order.id}`}
                      </p>
                    </div>

                    <div
                      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}
                    >
                      <StatusIcon size={14} />

                      {status.label}
                    </div>
                  </div>
                                    <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">
                        Giá trị
                      </p>

                      <p className="mt-1 font-bold text-slate-900">
                        {formatMoney(
                          getOrderAmount(order)
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-400">
                        Ngày tạo
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-600">
                        {formatDate(
                          order.created_at
                        )}
                      </p>
                    </div>
                  </div>

                  {order.roblox_username && (
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-xs text-slate-400">
                        Roblox
                      </span>

                      <span className="max-w-[60%] truncate text-xs font-semibold text-slate-700">
                        {order.roblox_username}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
