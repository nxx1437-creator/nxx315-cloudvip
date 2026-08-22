import React, { useState, useEffect } from "react";
import {
  Wallet, ShieldCheck, Clock, CheckCircle2, TrendingUp, ArrowRightLeft, CreditCard, Landmark,
  History, Info, Megaphone, Music, Youtube, Sparkles, Send, Coins, Loader2,
} from "lucide-react";
import BottomNav from "../components/BottomNav.jsx";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";

export default function Marketing() {
  const { session } = useSession();
  const { profile } = useProfile(session?.user?.id);

  const [activeTab, setActiveTab] = useState("overview");
  const [link, setLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [activeVideoTab, setActiveVideoTab] = useState("all");
  const [calcPlatform, setCalcPlatform] = useState("tiktok");

  const PLATFORM_RATES = [
    { key: "tiktok", label: "TikTok", ratePer1K: 2500 },
    { key: "yt_long", label: "YT Long", ratePer1K: 25000 },
    { key: "yt_short", label: "YT Short", ratePer1K: 10000 },
  ];
  const MILESTONES = [1000, 5000, 10000, 50000];

  const estimateCoins = (platformKey, views) => {
    const platform = PLATFORM_RATES.find((p) => p.key === platformKey);
    if (!platform) return 0;
    let base = (views / 1000) * platform.ratePer1K;
    if (views >= 10000) base *= 1.2;
    else if (views >= 5000) base *= 1.1;
    return Math.round(base);
  };

  const isValidLink = (url) => {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname;
      return host.includes("tiktok.com") || host.includes("youtube.com") || host.includes("youtu.be");
    } catch {
      return false;
    }
  };

  const fetchVideos = async () => {
    if (!session?.user?.id) return;
    setLoadingVideos(true);
    const { data } = await supabase
      .from("marketing_videos")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    setVideos(data ?? []);
    setLoadingVideos(false);
  };

  useEffect(() => {
    fetchVideos();
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!link.trim()) {
      alert("Vui lòng nhập link video!");
      return;
    }
    if (!isValidLink(link)) {
      alert("Link không hợp lệ! Vui lòng chỉ dán link TikTok hoặc YouTube.");
      return;
    }

    setIsSubmitting(true);

    let fetchedTitle = "";
    try {
      const noembed = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(link)}`);
      const noembedData = await noembed.json();
      if (noembedData.title) fetchedTitle = noembedData.title;
    } catch (err) {
      /* Bỏ qua nếu lỗi */
    }

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

    if (error) {
      alert("Lỗi gửi video: " + error.message);
      return;
    }
    alert("Đã gửi video thành công! Chờ admin duyệt nhé!");
    setLink("");
    fetchVideos();
  };

  const filteredVideos = videos.filter((v) => (activeVideoTab === "all" ? true : v.status === activeVideoTab));
  const pendingVideos = videos.filter((v) => v.status === "pending").length;
  const totalCoins = videos.reduce((sum, v) => sum + (v.coin_awarded || 0), 0);

  const TABS = [
    { key: "overview", label: "Tổng quan", icon: Wallet },
    { key: "main", label: "Đổi Main", icon: ArrowRightLeft },
    { key: "card", label: "Thẻ cào", icon: CreditCard },
    { key: "bank", label: "Bank/Ví", icon: Landmark },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      <header className="sticky top-0 z-20 border-b border-sky-100 bg-white/90 px-4 py-3.5 backdrop-blur-md">
        <h1 className="font-display flex items-center gap-2 text-xl font-bold text-slate-900">
          <Wallet size={20} className="text-sky-500" /> Ví Marketing
        </h1>
      </header>

      <main className="mx-auto max-w-md space-y-5 px-4 py-5">
        {/* ===== 1. THẺ VÍ TỔNG ===== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 p-5 shadow-xl shadow-sky-500/25">
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Wallet size={22} className="text-white" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-base font-bold text-white">Ví Marketing</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-sky-600 shadow-sm">
                  Marketing: {profile.marketing_coins ?? 0}
                </span>
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  Main: {(profile.coins ?? 0).toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab chức năng */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-150 active:scale-95 ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/30"
                  : "bg-sky-50 text-sky-700"
              }`}
            >
              <tab.icon size={15} /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <ShieldCheck size={16} className="text-sky-500" /> Số dư Marketing Coin của bạn
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-amber-500">{profile.marketing_coins ?? 0}</span>
                <span className="text-sm text-slate-400">≈ {profile.marketing_coins ?? 0} VND (trước phí)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
                <p className="flex items-center gap-1.5 text-xs text-slate-400"><Clock size={14} className="text-sky-400" /> Đã hoàn tất</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">0</p>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
                <p className="flex items-center gap-1.5 text-xs text-slate-400"><CheckCircle2 size={14} className="text-sky-400" /> Đang chờ</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{pendingVideos}</p>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
                <p className="flex items-center gap-1.5 text-xs text-slate-400"><TrendingUp size={14} className="text-sky-400" /> Tổng nhận VND</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{totalCoins}</p>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
                <p className="flex items-center gap-1.5 text-xs text-slate-400"><ArrowRightLeft size={14} className="text-sky-400" /> Đã đổi Main</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">0</p>
              </div>
            </div>

            <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <Info size={18} className="text-sky-500" /> Quy tắc thanh toán
              </h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                <li>• <strong className="text-slate-900">1 Marketing Coin = 1 VND</strong> khi rút tiền.</li>
                <li>• Đổi sang <strong className="text-slate-900">Main coin</strong>: 1.000 mkt → 900 main (phí sàn 10%).</li>
                <li>• Rút <strong className="text-slate-900">thẻ cào</strong>: <strong className="text-emerald-600">miễn phí</strong> (rút 100.000 – nhận thẻ 100.000).</li>
                <li>• Rút <strong className="text-slate-900">bank/ví</strong>: phí 20% (rút 100.000 – nhận 80.000 VND).</li>
                <li>• Tối thiểu mỗi lần rút: <strong className="text-slate-900">10.000 VND</strong>.</li>
                <li>• Marketing Coin <strong className="text-slate-900">tách riêng</strong> khỏi Main coin — không gộp.</li>
              </ul>
            </div>

            {/* Nút thao tác nhanh */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { key: "main", label: "Đổi Main", icon: ArrowRightLeft },
                { key: "card", label: "Rút thẻ", icon: CreditCard },
                { key: "bank", label: "Rút bank", icon: Landmark },
              ].map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => setActiveTab(btn.key)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-sky-200 bg-white px-4 py-2.5 text-sm font-semibold text-sky-700 transition-all duration-150 active:scale-95 hover:bg-sky-50"
                >
                  <btn.icon size={15} /> {btn.label}
                </button>
              ))}
            </div>

            <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <History size={18} className="text-slate-400" /> Lịch sử rút
              </h3>
              <p className="mt-3 text-center text-sm text-slate-400">Chưa có giao dịch rút tiền.</p>
            </div>
          </>
        )}

        {/* ===== 2. GIỚI THIỆU ===== */}
        <div className="rounded-3xl border border-sky-100 bg-gradient-to-b from-sky-50 to-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/30">
              <Megaphone size={22} />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-bold leading-snug text-slate-900">Marketing Video — Kiếm coin từ TikTok / YouTube</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Quay video giới thiệu trang web, đăng lên TikTok hoặc YouTube, gửi link tại đây — admin duyệt và trả coin theo số lượt xem.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-3 rounded-xl border border-sky-100 bg-white p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500"><Music size={16} /></span>
              <div><p className="text-[11px] text-slate-400">TikTok</p><p className="text-sm font-bold text-slate-800">1K view = 2.500 coin</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-sky-100 bg-white p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500"><Youtube size={16} /></span>
              <div><p className="text-[11px] text-slate-400">YouTube Long</p><p className="text-sm font-bold text-slate-800">1K view = 25.000 coin</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-sky-100 bg-white p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500"><Youtube size={16} /></span>
              <div><p className="text-[11px] text-slate-400">YouTube Short</p><p className="text-sm font-bold text-slate-800">1K view = 10.000 coin</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-500"><Sparkles size={16} /></span>
              <div><p className="text-[11px] text-amber-500">Bonus theo view</p><p className="text-sm font-bold text-amber-600">≥5K +10% • ≥10K +20%</p></div>
            </div>
          </div>
        </div>

        {/* ===== 2.5 BẢNG TÍNH COIN THEO MỐC VIEW ===== */}
        <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900">Ước tính Coin theo mốc view</h3>
          <div className="mt-3 flex gap-2">
            {PLATFORM_RATES.map((p) => (
              <button
                key={p.key}
                onClick={() => setCalcPlatform(p.key)}
                className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
                  calcPlatform === p.key ? "bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-sm" : "bg-sky-50 text-sky-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {MILESTONES.map((m) => (
              <div key={m} className="rounded-xl border border-sky-100 bg-sky-50/40 p-3">
                <p className="text-xs text-slate-400">{m.toLocaleString("vi-VN")} view</p>
                <p className="mt-1 flex items-center gap-1 text-base font-extrabold text-amber-500">
                  <Coins size={14} /> {estimateCoins(calcPlatform, m).toLocaleString("vi-VN")}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            *Tính theo tỉ lệ 1K view + bonus mốc (≥5K +10%, ≥10K +20%). Số coin thực tế do admin duyệt.
          </p>
        </div>
        <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Gửi link video của bạn</h2>
          <form onSubmit={handleSubmit} className="mt-4">
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Dán link TikTok / YouTube..."
              className="w-full rounded-xl border border-sky-100 bg-sky-50/40 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-150 hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Gửi duyệt
            </button>
          </form>
        </div>

        {/* ===== 3.5 THỐNG KÊ VIDEO ===== */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-400">Tổng video</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{videos.length}</p>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-400">Chờ duyệt</p>
            <p className="mt-1 text-2xl font-bold text-amber-500">{videos.filter((v) => v.status === "pending").length}</p>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-400">Đã duyệt</p>
            <p className="mt-1 text-2xl font-bold text-sky-500">{videos.filter((v) => v.status === "approved").length}</p>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-400">Coin đã nhận</p>
            <p className="mt-1 flex items-center gap-1 text-2xl font-bold text-emerald-600">
              <Coins size={16} /> {totalCoins.toLocaleString("vi-VN")}
            </p>
          </div>
        </div>

        {/* ===== 4. DANH SÁCH VIDEO ===== */}
        <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Video của bạn</h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { key: "all", label: "Tất cả" },
              { key: "pending", label: "Chờ duyệt" },
              { key: "approved", label: "Đã duyệt" },
              { key: "paid", label: "Đã trả coin" },
              { key: "rejected", label: "Từ chối" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveVideoTab(tab.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  activeVideoTab === tab.key ? "bg-gradient-to-r from-sky-400 to-blue-600 text-white" : "bg-sky-50 text-sky-700"
                }`}
              >
                {tab.label} <span className="ml-1">{videos.filter((v) => (tab.key === "all" ? true : v.status === tab.key)).length}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-4">
            {loadingVideos ? (
              <p className="py-8 text-center text-sm text-slate-400">Đang tải...</p>
            ) : filteredVideos.length === 0 ? (
              <div className="py-10 text-center">
                <Megaphone size={40} className="mx-auto text-sky-100" />
                <p className="mt-3 text-sm font-medium text-slate-500">Bắt đầu ngay để kiếm coin nào!</p>
                <p className="mt-1 text-xs text-slate-400">Quay video và gửi link đầu tiên của bạn</p>
              </div>
            ) : (
              filteredVideos.map((video) => (
                <div key={video.id} className="rounded-2xl border border-sky-100 p-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        video.platform === "TikTok" ? "bg-slate-100 text-slate-700" : "bg-red-50 text-red-600"
                      }`}
                    >
                      {video.platform === "TikTok" ? <Music size={12} /> : <Youtube size={12} />} {
