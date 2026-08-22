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

  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [activeVideoTab, setActiveVideoTab] = useState("all");
  const [link, setLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingVideos = videos.filter((v) => v.status === "pending").length;
  const totalCoins = videos.reduce((sum, v) => sum + (v.coin_awarded || 0), 0);
  const filteredVideos = videos.filter((v) => (activeVideoTab === "all" ? true : v.status === activeVideoTab));

  return (
    <div className="min-h-screen bg-white pb-24 font-[Be_Vietnam_Pro]">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 px-4 py-4 backdrop-blur-md">
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Wallet size={20} className="text-blue-500" /> Ví Marketing
        </h1>
      </header>

      <main className="mx-auto max-w-md space-y-5 px-4 py-5">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <ShieldCheck size={16} className="text-blue-500" /> Số dư Marketing Coin của bạn
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-4xl font-bold text-blue-500">{profile.marketing_coins ?? 0}</span>
            <span className="text-sm text-slate-400">≈ {profile.marketing_coins ?? 0} VND (trước phí)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="flex items-center gap-1.5 text-xs text-slate-400"><Clock size={14} /> Đã hoàn tất</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">0</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="flex items-center gap-1.5 text-xs text-slate-400"><CheckCircle2 size={14} /> Đang chờ</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{pendingVideos}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="flex items-center gap-1.5 text-xs text-slate-400"><TrendingUp size={14} /> Tổng nhận VND</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{totalCoins}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="flex items-center gap-1.5 text-xs text-slate-400"><ArrowRightLeft size={14} /> Đã đổi Main</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">0</p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
    }
              
