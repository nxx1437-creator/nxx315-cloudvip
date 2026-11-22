import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  MessageCircle,
  PackageCheck,
  RefreshCw,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import TopHeader from "../components/TopHeader";
import BottomNav from "../components/BottomNav";
import {
  canReply,
  formatDate,
  getAccountRows,
  getAmountText,
  getGameName,
  getOrderImage,
  getOrderTitle,
  statusInfo,
} from "../lib/orderView.js";

const FILTERS = [
  { id: "all", label: "Tất cả" },
  { id: "active", label: "Đang xử lý" },
  { id: "done", label: "Hoàn thành" },
  { id: "failed", label: "Thất bại" },
];

const sortHistory = (items) =>
  [...items].sort(
    (a, b) =>
      new Date(b.created_at || 0).getTime() -
      new Date(a.created_at || 0).getTime()
  );

export default function History() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");

  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const userIdRef = useRef(null);

  const loadHistory = async (showLoading = false) => {
    const currentRequestId = ++requestIdRef.current;
    if (showLoading) setLoading(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        if (!mountedRef.current) return;
        setHistory([]);
        return;
      }

      userIdRef.current = user.id;

      const [ordersResult, redemptionResult] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("redemption_orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (ordersResult.error) throw ordersResult.error;
      if (redemptionResult.error) throw redemptionResult.error;

      if (!mountedRef.current || currentRequestId !== requestIdRef.current) return;

      const merged = sortHistory([
        ...(ordersResult.data || []).map((o) => ({ ...o, _source: "orders" })),
        ...(redemptionResult.data || []).map((o) => ({
          ...o,
          _source: "redemption_orders",
        })),
      ]);

      setHistory(merged);
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
    if (!mountedRef.current) return;

    if (payload.eventType === "DELETE") {
      const deletedId = payload.old?.id;
      if (deletedId == null) return;
      setHistory((cur) =>
        cur.filter(
          (i) => !(i._source === source && String(i.id) === String(deletedId))
        )
      );
      return;
    }

    const row = payload.new;
    if (!row?.id) return;

    // Chỉ nhận đơn của chính mình
    if (row.user_id && userIdRef.current && row.user_id !== userIdRef.current) return;

    setHistory((cur) => {
      const index = cur.findIndex(
        (i) => i._source === source && String(i.id) === String(row.id)
      );

      const next =
        index === -1
          ? [{ ...row, _source: source }, ...cur]
          : cur.map((item, i) =>
              i === index ? { ...item, ...row, _source: source } : item
            );

      return sortHistory(next);
    });
  };

  useEffect(() => {
    mountedRef.current = true;
    loadHistory(true);

    const ordersChannel = supabase
      .channel("history-orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => applyRealtimeChange("orders", payload)
      )
      .subscribe();

    const redemptionChannel = supabase
      .channel("history-redemption-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "redemption_orders" },
        (payload) => applyRealtimeChange("redemption_orders", payload)
      )
      .subscribe();

    const interval = setInterval(() => loadHistory(false), 5000);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(redemptionChannel);
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory(false);
  };

  const counts = useMemo(() => {
    const c = { all: history.length, active: 0, done: 0, failed: 0 };
    history.forEach((o) => {
      c[statusInfo(o.status).group] += 1;
    });
    return c;
  }, [history]);

  const shown = useMemo(
    () =>
      filter === "all"
        ? history
        : history.filter((o) => statusInfo(o.status).group === filter),
    [history, filter]
  );

  return (
    <div className="min-h-screen bg-white pb-28">
      <TopHeader />

      <main className="mx-auto max-w-2xl px-4 py-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Lịch sử đơn hàng
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Theo dõi trạng thái các đơn hàng của bạn
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition active:bg-gray-50 disabled:opacity-50"
            title="Làm mới"
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Bộ lọc */}
        <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                filter === f.id
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {f.label}
              <span className={`ml-1.5 ${filter === f.id ? "text-white/70" : "text-gray-400"}`}>
                {counts[f.id]}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-gray-100 p-4"
              >
                <div className="flex gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-36 rounded bg-gray-100" />
                    <div className="h-3 w-24 rounded bg-gray-100" />
                    <div className="h-3 w-44 rounded bg-gray-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 p-10 text-center">
            <PackageCheck className="mx-auto mb-4 text-gray-300" size={46} />
            <h2 className="text-base font-bold text-gray-800">
              {history.length === 0 ? "Chưa có đơn hàng" : "Không có đơn nào ở mục này"}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {history.length === 0
                ? "Các đơn hàng của bạn sẽ xuất hiện ở đây."
                : "Thử chọn mục khác để xem các đơn còn lại."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {shown.map((order) => {
              const status = statusInfo(order.status);
              const StatusIcon = status.icon;
              const image = getOrderImage(order);
              const gameName = getGameName(order);
              const account = getAccountRows(order)[0];
              const hasNewMessage =
                (order.progress_note || (order.proof_urls || []).length > 0) &&
                canReply(order);

              return (
                <button
                  key={`${order._source}-${order.id}`}
                  onClick={() =>
                    navigate(`/history/order/${order.id}?source=${order._source}`)
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left transition active:bg-gray-50"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                      {image ? (
                        <img
                          src={image}
                          alt={getOrderTitle(order)}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <PackageCheck size={20} className="text-gray-300" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="truncate text-[15px] font-bold text-gray-900">
                          {getOrderTitle(order)}
                        </h2>
                        <ChevronRight size={18} className="mt-0.5 shrink-0 text-gray-300" />
                      </div>

                      <p className="mt-0.5 truncate text-xs text-gray-400">
                        {gameName ? `${gameName} · ` : ""}#{order.order_code || order.id}
                      </p>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${status.className}`}
                        >
                          <StatusIcon size={12} />
                          {status.label}
                        </span>

                        <span className="text-[15px] font-bold text-gray-900">
                          {getAmountText(order)}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-gray-400">
                        <span className="truncate">
                          {account ? `${account.label}: ${account.value}` : ""}
                        </span>
                        <span className="shrink-0">{formatDate(order.created_at)}</span>
                      </div>

                      {hasNewMessage && (
                        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600">
                          <MessageCircle size={14} />
                          Admin đã gửi tin nhắn cho đơn này
                        </div>
                      )}
                    </div>
                  </div>
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
