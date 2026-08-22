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
      alert("Vui lĂ²ng nháº­p link video!");
      return;
    }
    if (!isValidLink(link)) {
      alert("Link khĂ´ng há»£p lá»‡! Vui lĂ²ng chá»‰ dĂ¡n link TikTok hoáº·c YouTube.");
      return;
    }

    setIsSubmitting(true);

    let fetchedTitle = "";
    try {
      const noembed = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(link)}`);
      const noembedData = await noembed.json();
      if (noembedData.title) fetchedTitle = noembedData.title;
    } catch (err) {
      /* Bá» qua náº¿u lá»—i */
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
      alert("Lá»—i gá»­i video: " + error.message);
      return;
    }
    alert("ÄĂ£ gá»­i video thĂ nh cĂ´ng! Chá» admin duyá»‡t nhĂ©!");
    setLink("");
    fetchVideos();
  };

  const filteredVideos = videos.filter((v) => (activeVideoTab === "all" ? true : v.status === activeVideoTab));
  const pendingVideos = videos.filter((v) => v.status === "pending").length;
  const totalCoins = videos.reduce((sum, v) => sum + (v.coin_awarded || 0), 0);

  const TABS = [
    { key: "overview", label: "Tá»•ng quan", icon: Wallet },
    { key: "main", label: "Äá»•i Main", icon: ArrowRightLeft },
    { key: "card", label: "Tháº» cĂ o", icon: CreditCard },
    { key: "bank", label: "Bank/VĂ­", icon: Landmark },
  ];

  return (
    <div className="min-h-screen bg-white pb-24 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
      `}</style>

      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 px-4 py-4 backdrop-blur-md">
        <h1 className="text-xl font-bold text-slate-900">VĂ­ Marketing</h1>
      </header>

      <main className="mx-auto max-w-md space-y-5 px-4 py-5">
        {/* ===== 1. VĂ MARKETING ===== */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><Wallet size={20} className="text-blue-500" /> VĂ­ Marketing</h2>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-bold text-white">Marketing: {profile.marketing_coins ?? 0}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">Main: {profile.coins ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Tab chá»©c nÄƒng */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === tab.key ? "bg-blue-500 text-white shadow-md shadow-blue-500/25" : "bg-slate-100 text-slate-500"
              }`}
            >
              <tab.icon size={15} /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-slate-500"><ShieldCheck size={16} className="text-blue-500" /> Sá»‘ dÆ° Marketing Coin cá»§a báº¡n</div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-4xl font-bold text-blue-500">{profile.marketing_coins ?? 0}</span>
                <span className="text-sm text-slate-400">â‰ˆ {profile.marketing_coins ?? 0} VND (trÆ°á»›c phĂ­)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><p className="flex items-center gap-1.5 text-xs text-slate-400"><Clock size={14} /> ÄĂ£ hoĂ n táº¥t</p><p className="mt-2 text-2xl font-bold text-slate-900">0</p></div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><p className="flex items-center gap-1.5 text-xs text-slate-400"><CheckCircle2 size={14} /> Äang chá»</p><p className="mt-2 text-2xl font-bold text-slate-900">{pendingVideos}</p></div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><p className="flex items-center gap-1.5 text-xs text-slate-400"><TrendingUp size={14} /> Tá»•ng nháº­n VND</p><p className="mt-2 text-2xl font-bold text-slate-900">{totalCoins}</p></div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><p className="flex items-center gap-1.5 text-xs text-slate-400"><ArrowRightLeft size={14} /> ÄĂ£ Ä‘á»•i Main</p><p className="mt-2 text-2xl font-bold text-slate-900">0</p></div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-900"><Info size={18} className="text-blue-500" /> Quy táº¯c thanh toĂ¡n</h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                <li>â€¢ <strong className="text-slate-900">1 Marketing Coin = 1 VND</strong> khi rĂºt tiá»n.</li>
                <li>â€¢ Äá»•i sang <strong className="text-slate-900">Main coin</strong>: 1.000 mkt â†’ 900 main (phĂ­ sĂ n 10%).</li>
                <li>â€¢ RĂºt <strong className="text-slate-900">tháº» cĂ o</strong>: <strong className="text-emerald-600">miá»…n phĂ­</strong> (rĂºt 100.000 â€“ nháº­n tháº» 100.000).</li>
                <li>â€¢ RĂºt <strong className="text-slate-900">bank/vĂ­</strong>: phĂ­ 20% (rĂºt 100.000 â€“ nháº­n 80.000 VND).</li>
                <li>â€¢ Tá»‘i thiá»ƒu má»—i láº§n rĂºt: <strong className="text-slate-900">10.000 VND</strong>.</li>
                <li>â€¢ Marketing Coin <strong className="text-slate-900">tĂ¡ch riĂªng</strong> khá»i Main coin â€” khĂ´ng gá»™p.</li>
              </ul>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { key: "main", label: "Äá»•i Main", icon: ArrowRightLeft },
                { key: "card", label: "RĂºt tháº»", icon: CreditCard },
                { key: "bank", label: "RĂºt bank", icon: Landmark },
              ].map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => setActiveTab(btn.key)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <btn.icon size={15} /> {btn.label}
                </button>
              ))}
              
