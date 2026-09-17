import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock3,
  PackageCheck,
  AlertCircle,
} from "lucide-react";

const statusInfo = {
  pending: {
    label: "Chờ thanh toán",
    className: "bg-yellow-100 text-yellow-700",
    icon: Clock3,
  },
  paid: {
    label: "Chờ kiểm tra",
    className: "bg-blue-100 text-blue-700",
    icon: Clock3,
  },
  processing: {
    label: "Đang xử lý",
    className: "bg-orange-100 text-orange-700",
    icon: PackageCheck,
  },
  delivered: {
    label: "Đã giao",
    className: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Đã từ chối",
    className: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

function formatMoney(value) {
  return new Intl.NumberFormat("vi-VN").format(Number(value || 0)) + "đ";
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("vi-VN");
}

export default function FreeFireOrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [rejectOrder, setRejectOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const fetchOrders = async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .not("ff_uid", "is", null)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("FETCH FREEFIRE ORDERS ERROR:", fetchError);
        setError(
          `Không thể tải danh sách đơn Free Fire: ${
            fetchError.message || "Lỗi không xác định"
          }`
        );
        return;
      }

      setOrders(data || []);
    } catch (err) {
      console.error("FETCH FREEFIRE ORDERS EXCEPTION:", err);
      setError(
        `Không thể tải danh sách đơn Free Fire: ${
          err?.message || "Lỗi không xác định"
        }`
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("admin-freefire-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const row = payload.new || payload.old;
          const isFreeFire = row?.ff_uid != null;

          if (!isFreeFire) return;

          if (payload.eventType === "INSERT") {
            setOrders((current) => [payload.new, ...current]);
          }

          if (payload.eventType === "UPDATE") {
            setOrders((current) =>
              current.map((order) =>
                order.id === payload.new.id ? payload.new : order
              )
            );
          }

          if (payload.eventType === "DELETE") {
            setOrders((current) =>
              current.filter((order) => order.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error("Realtime Free Fire orders channel error");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateOrderStatus = async (
    order,
    expectedStatus,
    nextStatus,
    note
  ) => {
    if (updatingId !== null) return false;

    setUpdatingId(order.id);
    setError("");

    try {
      const updateData = {
        status: nextStatus,
        updated_at: new Date().toISOString(),
      };

      if (note !== undefined) {
        updateData.note = note;
      }

      const { data, error: updateError } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", order.id)
        .eq("status", expectedStatus)
        .select("*")
        .maybeSingle();

      if (updateError) {
        console.error("UPDATE FREEFIRE ORDERS ERROR:", updateError);
        setError(
          `Cập nhật trạng thái thất bại: ${
            updateError.message || "Lỗi không xác định"
          }`
        );
        return false;
      }

      if (!data) {
        setError(
          `Không cập nhật được đơn ${
            order.order_code || `#${order.id}`
          }. Có thể trạng thái đã thay đổi.`
        );
        await fetchOrders(true);
        return false;
      }

      setOrders((current) =>
        current.map((item) => (item.id === data.id ? data : item))
      );

      return true;
    } catch (err) {
      console.error("UPDATE FREEFIRE ORDERS EXCEPTION:", err);
      setError(
        `Lỗi cập nhật đơn: ${err?.message || "Lỗi không xác định"}`
      );
      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  const approveOrder = (order) => {
    if (order.status !== "paid") return;
    return updateOrderStatus(order, "paid", "processing");
  };

  const deliverOrder = (order) => {
    if (order.status !== "processing") return;
    return updateOrderStatus(order, "processing", "delivered");
  };

  const submitReject = async () => {
    if (!rejectOrder) return;

    const reason = rejectReason.trim();
    if (!reason) {
      setError("Vui lòng nhập lý do từ chối.");
      return;
    }

    const success = await updateOrderStatus(
      rejectOrder,
      "paid",
      "rejected",
      reason
    );

    if (success) {
      setRejectOrder(null);
      setRejectReason("");
    }
  };

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return orders.filter((order) => {
      if (filter !== "all" && order.status !== filter) {
        return false;
      }

      if (!keyword) return true;

      return [
        order.order_code,
        String(order.ff_uid || ""),
        String(order.ff_diamond || ""),
        order.package_id,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(keyword)
        );
    });
  }, [orders, search, filter]);

  const stats = useMemo(
    () => ({
      total: orders.length,
      waiting: orders.filter((o) => o.status === "paid").length,
      processing: orders.filter((o) => o.status === "processing").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      rejected: orders.filter((o) => o.status === "rejected").length,
    }),
    [orders]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Đang tải đơn Free Fire...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold">Đơn Free Fire</h2>
          <p className="text-sm text-gray-500">
            Quản lý đơn nạp Kim Cương Free Fire.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Làm mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard title="Tất cả" value={stats.total} />
        <StatCard title="Chờ kiểm tra" value={stats.waiting} />
        <StatCard title="Đang xử lý" value={stats.processing} />
        <StatCard title="Đã giao" value={stats.delivered} />
        <StatCard title="Đã từ chối" value={stats.rejected} />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search / Filter */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã đơn, UID, Kim Cương..."
            className="w-full rounded-xl border py-2.5 pl-10 pr-3 outline-none focus:border-orange-500"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border px-3 py-2.5 outline-none focus:border-orange-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ thanh toán</option>
          <option value="paid">Chờ kiểm tra</option>
          <option value="processing">Đang xử lý</option>
          <option value="delivered">Đã giao</option>
          <option value="rejected">Đã từ chối</option>
        </select>
      </div>

      {/* Orders */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border bg-white py-16 text-center text-gray-500">
          Không có đơn Free Fire phù hợp.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const info = statusInfo[order.status] || {
              label: order.status || "Không rõ",
              className: "bg-gray-100 text-gray-700",
              icon: AlertCircle,
            };
            const Icon = info.icon;
            const updating = updatingId === order.id;

            return (
              <div
                key={order.id}
                className="rounded-2xl border bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">
                        {order.order_code || `#${order.id}`}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${info.className}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {info.label}
                      </span>
                    </div>

                    <div className="grid gap-x-8 gap-y-1 text-sm text-gray-600 md:grid-cols-2">
                      <div>
                        UID:{" "}
                        <span className="font-medium text-gray-900">
                          {order.ff_uid || "—"}
                        </span>
                      </div>

                      <div>
                        Gói:{" "}
                        <span className="font-medium text-gray-900">
                          {order.package_id || "—"}
                        </span>
                      </div>

                      <div>
                        Kim Cương:{" "}
                        <span className="font-semibold text-gray-900">
                          {Number(order.ff_diamond || 0).toLocaleString("vi-VN")} KC
                        </span>
                      </div>

                      <div>
                        Số tiền:{" "}
                        <span className="font-semibold text-gray-900">
                          {formatMoney(order.amount)}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400">
                      Tạo: {formatDate(order.created_at)}
                      {order.updated_at &&
                        order.updated_at !== order.created_at && (
                          <> · Cập nhật: {formatDate(order.updated_at)}</>
                        )}
                    </div>

                    {order.note && (
                      <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
                        <span className="font-semibold">Ghi chú:</span>{" "}
                        {order.note}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {order.status === "paid" && (
                      <>
                        <button
                          type="button"
                          disabled={updating}
                          onClick={() => approveOrder(order)}
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Duyệt đơn
                        </button>

                        <button
                          type="button"
                          disabled={updating}
                          onClick={() => {
                            setError("");
                            setRejectOrder(order);
                            setRejectReason("");
                          }}
                          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          <XCircle className="h-4 w-4" />
                          Từ chối
                        </button>
                      </>
                    )}

                    {order.status === "processing" && (
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => deliverOrder(order)}
                        className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                      >
                        <PackageCheck className="h-4 w-4" />
                        Đã giao Kim Cương
                      </button>
                    )}

                    {order.status === "delivered" && (
                      <span className="inline-flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Đã giao thành công
                      </span>
                    )}

                    {order.status === "rejected" && (
                      <span className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
                        <XCircle className="h-4 w-4" />
                        Đã từ chối
                      </span>
                    )}

                    {updating && (
                      <span className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-500">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Đang cập nhật...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject modal */}
      {rejectOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-bold">Từ chối đơn Free Fire</h3>

            <p className="mt-1 text-sm text-gray-500">
              Đơn {rejectOrder.order_code || `#${rejectOrder.id}`}
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              rows={4}
              className="mt-4 w-full resize-none rounded-xl border p-3 outline-none focus:border-red-500"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setRejectOrder(null);
                  setRejectReason("");
                }}
                className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Hủy
              </button>

              <button
                type="button"
                disabled={updatingId === rejectOrder.id}
                onClick={submitReject}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
  }
