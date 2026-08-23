import React, { useState, useEffect } from "react";
import {
  Cookie, ShieldCheck, Clock, CheckCircle2, TrendingUp, ArrowRightLeft, CreditCard, Landmark,
  History, Info, Megaphone, Music, Youtube, Sparkles, Send, Loader2,
} from "lucide-react";
import BottomNav from "../components/BottomNav.jsx";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";

export default function Marketing() {
  const { session } = useSession();
  const { profile } = useProfile(session?.user?.id);

  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [activeVideoTab, setActiveVideoTab] = useState("all");
  const [link, setLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!session?.user?.id) return;
      setLoadingVideos(true);
      const { data } = await supabase.from("marketing_videos").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
      setVideos(data ?? []);
      setLoadingVideos(false);
    };
    fetchVideos();
  }, [session]);

  const cookies = profile.marketing_coins ?? 0;
  const pendingVideos = videos.filter((v) => v.status === "pending").length;
  const totalCookiesEarned = videos.reduce((sum, v) => sum + (v.coin_awarded || 0), 0);
  const filteredVideos = videos.filter((v) => (activeVideoTab === "all" ? true : v.status === activeVideoTab));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!link.trim()) return alert("Vui lòng nhập link video!");
    const isValid = (() => {
      try {
        const host = new URL(link).hostname;
        return host.includes("tiktok.com") || host.includes("youtube.com") || host.includes("youtu.be");
      } catch {
        return false;
      }
    })();
    if (!isValid) return alert("Link không hợp lệ! Chỉ nhận link TikTok hoặc YouTube.");
    setIsSubmitting(true);
    let fetchedTitle = "";
    try {
      const noembed = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(link)}`);
      const noembedData = await noembed.json();
      if (noembedData.title) fetchedTitle = noembedData.title;
    } catch {}
    const { error } = await supabase.from("marketing_videos").insert({
      user_id: session.user.id,
      link: link.trim(),
      title: fetchedTitle,
      platform: link.includes("tiktok.com") ? "TikTok" : "YouTube",
      status: "pending",
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      ctr: "0%",
    });
    setIsSubmitting(false);
    if (error) return alert("Lỗi gửi video: " + error.message);
    alert("Đã gửi video thành công! Chờ admin duyệt nhé!");
    setLink("");
    const { data } = await supabase.from("marketing_videos").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
    setVideos(data ?? []);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      <header className="sticky top-0 z-20 border-b border-amber-100 bg-white/90 px-4 py-3.5 backdrop-blur-md">
        <h1 className="font-display flex items-center gap-2 text-xl font-bold text-slate-900">
          <Cookie size={20} className="text-amber-500" /> Ví Cookies
        </h1>
      </header>

      <main className="mx-auto max-w-md space-y-5 px-4 py-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-amber-600 p-6 shadow-xl shadow-amber-500/30">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Cookie size={28} className="text-white" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Số dư Cookies</p>
              <p className="font-display text-3xl font-extrabold text-white">{cookies.toLocaleString("vi-VN")}</p>
            </div>
          </div>
          <p className="relative mt-3 text-xs text-white/80">
            ≈ {cookies.toLocaleString("vi-VN")} VND (trước phí) — Cookies tách riêng khỏi Coin làm nhiệm vụ.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
            <p className="flex items-center gap-1.5 text-xs text-slate-400"><Clock size={14} className="text-amber-400" /> Đã hoàn tất</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">0</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
            <p className="flex items-center gap-1.5 text-xs text-slate-400"><CheckCircle2 size={14} className="text-amber-400" /> Đang chờ</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{pendingVideos}</p>
          </div>
