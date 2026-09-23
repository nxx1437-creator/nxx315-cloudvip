import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Flame, Trophy, Sparkles, Check } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";

const ICONS = { bell: Bell, flame: Flame, trophy: Trophy, sparkles: Sparkles };

export default function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      setNotifications(data || []);
      setUnreadCount((data || []).filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Load notifications error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev].slice(0, 20));
          setUnreadCount((c) => c + 1);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllAsRead = async () => {
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

  const handleClickNotif = (notif) => {
    if (!notif.is_read) markAsRead(notif.id);
    if (notif.action_url) navigate(notif.action_url);
    setOpen(false);
  };

  const formatTime = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
      >
        <Bell size={20} strokeWidth={2.2} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[calc(100vw-32px)] max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-900">
              Thông báo {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700"
              >
                <Check size={12} /> Đọc hết
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-sm text-slate-400">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold text-slate-500">Chưa có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const Icon = ICONS[notif.icon] || Bell;
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleClickNotif(notif)}
                    className={`flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition last:border-0 ${
                      !notif.is_read ? "bg-sky-50/50 hover:bg-sky-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        notif.type === "task_reminder"
                          ? "bg-rose-100 text-rose-500"
                          : notif.type === "streak_complete"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      <Icon size={16} strokeWidth={2.4} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${!notif.is_read ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                        {notif.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-5 text-slate-500">{notif.body}</p>
                      <p className="mt-1 text-[10px] text-slate-400">{formatTime(notif.created_at)}</p>
                    </div>
                    {!notif.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-500" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
      }
