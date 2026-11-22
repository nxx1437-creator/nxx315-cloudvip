import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { AlertCircle, RefreshCw, Search } from "lucide-react";
import RobloxOrderCard from "./RobloxOrderCard.jsx";
import { StatCard } from "./RobloxOrderParts.jsx";

const isPassOrder = (o) => o.receive_method === "gamepass";

export default function RobloxOrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all"); // all | pass | normal
  const [rejectOrder, setRejectOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState("");

  const handleCopy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const fetchOrders = async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .not("roblox_user_id", "is", null)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("FETCH ORDERS ERROR:", fetchError);
        setError(
          `Không thể tải danh sách đơn hàng: ${
            fetchError.message || "Lỗi không xác định"
          }`
        );
        return;
      }
      setOrders(data || []);
    } catch (err) {
      console.error("FETCH ORDERS EXCEPTION:", err);
      setError(
        `Không thể tải danh sách đơn hàng: ${err?.message || "Lỗi không xác định"}`
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("admin-roblox-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          const row = payload.new || payload.old;
          if (row?.roblox_user_id == null) return;

          if (payload.eventType === "INSERT") {
            setOrders((current) => [payload.new, ...current]);
          }
          if (payload.eventType === "UPDATE") {
            setOrders((current) =>
              current.map((o) => (o.id === payload.new.id ? payload.new : o))
            );
          }
          if (payload.eventType === "DELETE") {
            setOrders((current) => current.filter((o) => o.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error("Realtime orders channel error");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateOrderStatus = async (order, expectedStatus, nextStatus, note) => {
    if (updatingId !== null) return false;

    setUpdatingId(order.id);
    setError("");

    try {
      const updateData = {
        status: nextStatus,
        updated_at: new Date().toISOString(),
      };
      if (note !== undefined) updateData.note = note;

      const { data, error: updateError } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", order.id)
        .eq("status", expectedStatus)
        .select("*")
        .maybeSingle();

      if (updateError) {
        console.error("UPDATE ORDERS ERROR:", updateError);
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
          }. Có thể trạng thái đã thay đổi hoặc tài khoản Admin chưa có quyền UPDATE orders.`
        );
        await fetchOrders(true);
        return false;
      }

      setOrders((current) => current.map((o) => (o.id === data.id ? data : o)));
      return true;
    } catch (err) {
      console.error("UPDATE ORDERS EXCEPTION:", err);
      setError(`Lỗi cập nhật đơn: ${err?.message || "Lỗi không xác định"}`);
      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  // Duyệt đơn (với game pass: đã mua pass -> chờ Robux về khách)
  const approveOrder = (order) => {
    if (order.status !== "paid") return;
    return updateOrderStatus(order, "paid", "processing");
  };

  const deliverOrder = (order) => {
    if (order.status !== "processing") return;
    return updateOrderStatus(order, "processing", "delivered");
  };

  const openReject = (order) => {
    setError("");
    setRejectOrder(order);
    setRejectReason("");
  };

  const submitReject = async () => {
    if (!rejectOrder) return;
    const reason = rejectReason.trim();
    if (!reason) {
      setError("Vui lòng nhập lý do từ chối.");
      return;
    }
    const success = await updateOrderStatus(rejectOrder, "paid", "rejected", reason);
    if (success) {
      setRejectOrder(null);
      setRejectReason("");
    }
  };

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return orders.filter((order) => {
      if (filter !== "all" && order.status !== filter) return false;
      if (typeFilter === "pass" && !isPassOrder(order)) return false;
      if (typeFilter === "normal" && isPassOrder(order)) return false;
      if (!keyword) return true;

      return [
        order.order_code,
        order.roblox_username,
        order.roblox_display_name,
        String(order.roblox_user_id || ""),
        String(order.robux || ""),
        order.contact_value,
        order.receive_method,
        order.payment_method,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    });
  }, [orders, search, filter, typeFilter]);

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.status === "paid");
    return {
      total: orders.length,
      waitingPass: paid.filter(isPassOrder).length,
      waitingBank: paid.filter(
        (o) =>
          !isPassOrder(o) &&
          (o.payment_method === "bank" || o.payment_method === "banking")
      ).length,
      waitingCoin: paid.filter(
        (o) => !isPassOrder(o) && o.payment_method === "coin"
      ).length,
      processing: orders.filter((o) => o.status === "processing").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      rejected: orders.filter((o) => o.status === "rejected").length,
    };
  }, [orders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Đang tải đơn hàng...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold">Đơn Robux</h2>
          <p className="text-sm text-gray-500">
            Quản lý đơn hàng Roblox, game pass và trạng thái giao hàng.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-7">
        <StatCard title="Tất cả" value={stats.total} />
        <StatCard title="Chờ mua Game Pass" value={stats.waitingPass} accent="orange" />
        <StatCard title="Chờ xác nhận CK" value={stats.waitingBank} accent="amber" />
        <StatCard title="Chờ duyệt (Coin)" value={stats.waitingCoin} accent="blue" />
        <StatCard title="Đang xử lý" value={stats.processing} />
        <StatCard title="Đã giao" value={stats.delivered} />
        <StatCard title="Đã từ chối" value={stats.rejected} />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã đơn, username, Roblox ID, SĐT, Email, link pass..."
            className="w-full rounded-xl border py-2.5 pl-10 pr-3 outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-xl border px-3 py-2.5 outline-none focus:border-blue-500"
        >
          <option value="all">Tất cả loại đơn</option>
          <option value="pass">Chỉ Game Pass</option>
          <option value="normal">Không phải Game Pass</option>
        </select>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border px-3 py-2.5 outline-none focus:border-blue-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ thanh toán</option>
          <option value="paid">Chờ xử lý</option>
          <option value="processing">Đang xử lý</option>
          <option value="delivered">Đã giao</option>
          <option value="rejected">Đã từ chối</option>
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border bg-white py-16 text-center text-gray-500">
          Không có đơn hàng phù hợp.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <RobloxOrderCard
              key={order.id}
              order={order}
              updating={updatingId === order.id}
              copiedKey={copiedKey}
              onCopy={handleCopy}
              onApprove={approveOrder}
              onDeliver={deliverOrder}
              onReject={openReject}
            />
          ))}
        </div>
      )}

      {rejectOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-bold">Từ chối đơn hàng</h3>
            <p className="mt-1 text-sm text-gray-500">
              Đơn {rejectOrder.order_code || `#${rejectOrder.id}`}
            </p>

            {rejectOrder.contact_value && (
              <div className="mt-3 break-all rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                <span className="font-semibold">
                  {isPassOrder(rejectOrder) ? "Game pass:" : "Liên hệ khách:"}
                </span>{" "}
                {rejectOrder.receive_method === "zalo" && "Zalo "}
                {rejectOrder.receive_method === "email" && "Email "}
                <span className="font-mono">{rejectOrder.contact_value}</span>
              </div>
            )}

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
