import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Check,
  Loader2,
  ShoppingBag,
  ListChecks,
  Megaphone,
  Flame,
  Trophy,
  Sparkles,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";

// ✅ Tab phân loại
const TABS = [
  { key: "all", label: "Tất cả", icon: Bell },
  { key: "task_reminder", label: "Nhiệm vụ", icon: ListChecks },
  { key: "streak_complete", label: "Chuỗi", icon: Trophy },
  { key: "top_rank", label: "Xếp hạng", icon: Sparkles },
  { key: "system", label: "Hệ thống", icon: Megaphone },
];

// ✅ Icon theo loại thông báo
const NOTIF_ICONS = {
  bell: Bell,
  flame: Flame,
  trophy: Trophy,
  sparkles: Sparkles,
  system: Megaphone,
};

// ✅ Màu theo loại
const NOTIF_COLORS = {
  task_reminder: "bg-rose-100 text-rose-500",
  streak_complete: "bg-amber-100 text-amber-600",
  top_rank: "bg-purple-100 text-purple-600",
  system: "bg-sky-100 text-sky-600",
};

const PAGE_SIZE = 20;

export default function Notifications() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // ✅ Load thông báo theo tab
  const loadNotifications = useCallback(
    async (reset = false) => {
      if (reset) {
        setLoading(true);
        setNotifications([]);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const offset = reset ? 0 : notifications.length;

        let query = supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1);

        if (activeTab !== "all") {
          query = query.eq("type", activeTab);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (reset) {
          setNotifications(data || []);
        } else {
          setNotifications((prev) => [...prev, ...(data || [])]);
        }

        setHasMore((data || []).length === PAGE_SIZE);

        // Đếm unread (chỉ khi tab "all")
        if (activeTab === "all" && reset) {
          const { count } = await supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("is_read", false);
          setUnreadCount(count || 0);
        }
      } catch (err) {
        console.error("Load notifications error:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeTab, notifications.length]
  );

  // Load lần đầu + khi đổi tab
  useEffect(() => {
    loadNotifications(true);
  }, [activeTab]);

  // ✅ Infinite scroll
  useEffect(() => {
    if (loading || loadingMore || !hasMore) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadNotifications(false);
        }
      },
      { threshold: 0.5 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [loading, loadingMore, hasMore, loadNotifications]);

  // ✅ Đánh dấu 1 thông báo đã đọc
  const handleClickNotif = async (notif) => {
    if (!notif.is_read) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    if (notif.action_url) navigate(notif.action_url);
  };

  // ✅ Đọc hết
  const handleMarkAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const formatTime = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return "vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-[Be_Vietnam_Pro]">
      <TopHeader />

      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3 md:max-w-5xl">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-slate-100"
          >
            <ArrowLeft size={20} className="text-slate-900" />
          </button>
          <h1 className="flex-1 text-[16px] font-bold tracking-tight text-slate-900">
            Thông báo
          </h1>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1.5 text-[11px] font-bold text-sky-600 transition hover:bg-sky-100"
            >
              <Check size={12} />
              Đọc hết
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[57px] z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-md gap-2 overflow-x-auto px-4 py-2.5 md:max-w-5xl">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition ${
                  isActive
                    ? "bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/30"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="mx-auto max-w-md px-4 pt-4 md:max-w-5xl">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-xl border border-slate-100 bg-white p-4"
              >
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
            <Bell size={36} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-bold text-slate-600">
              Chưa có thông báo nào
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Làm nhiệm vụ để nhận thông báo nhé!
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {notifications.map((n, idx) => {
                const Icon = NOTIF_ICONS[n.icon] || Bell;
                const colorClass =
                  NOTIF_COLORS[n.type] || "bg-slate-100 text-slate-500";
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClickNotif(n)}
                    className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-4 text-left transition last:border-0 ${
                      !n.is_read
                        ? "bg-sky-50/40 hover:bg-sky-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colorClass}`}
                    >
                      <Icon size={18} strokeWidth={2.4} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-[13.5px] leading-5 ${
                            !n.is_read
                              ? "font-bold text-slate-900"
                              : "font-semibold text-slate-700"
                          }`}
                        >
                          {n.title}
                        </p>
                        <span className="shrink-0 text-[10.5px] text-slate-400">
                          {formatTime(n.created_at)}
                        </span>
                      </div>
                      {n.body && (
                        <p className="mt-1 text-[12.5px] leading-5 text-slate-500">
                          {n.body}
                        </p>
                      )}
                    </div>
                    {!n.is_read && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sky-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Load more indicator */}
            <div ref={loadMoreRef} className="py-6 text-center">
              {loadingMore && (
                <Loader2
                  size={20}
                  className="mx-auto animate-spin text-slate-400"
                />
              )}
              {!hasMore && notifications.length > 0 && (
                <p className="text-xs text-slate-400">
                  Đã hết thông báo
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
  }
