import React, { useState } from "react";
import {
  ShoppingBag, Link2, Copy, Check, Loader2, Star, Wallet,
  ArrowLeftRight, Landmark, X, Clock3, CheckCircle2, XCircle, Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

const formatVND = (v) =>
  Number(v || 0).toLocaleString("vi-VN") + "đ";

const formatCoins = (v) =>
  Number(v || 0).toLocaleString("vi-VN");

export default function ShopEarn() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile, setProfile } = useProfile();

  const [productUrl, setProductUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [resultLink, setResultLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const [showConvert, setShowConvert] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const starPoints = Number(profile?.star_points || 0);

  const handleGenerate = async () => {
    if (!productUrl.trim()) {
      setGenError("Vui lòng dán link sản phẩm TikTok Shop.");
      return;
    }

    setGenerating(true);
    setGenError("");
    setResultLink(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    try {
      const { data, error } = await supabase.functions.invoke("create-affiliate-link", {
        headers: { Authorization: `Bearer ${token}` },
        body: { product_url: productUrl.trim(), platform: "tiktok" },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Không tạo được link.");

      setResultLink(data.short_link || data.full_link);
    } catch (err) {
      setGenError(err.message || "Có lỗi xảy ra, thử lại sau.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!resultLink) return;
    navigator.clipboard.writeText(resultLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] pb-28 text-slate-900">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-sky-300/10 blur-3xl" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-2xl px-4 py-5">
        <header className="mb-5 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-100"
          >
            ←
          </button>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-500">
              NXX315 Studio
            </p>
            <h1 className="text-xl font-black text-slate-950">Mua hàng kiếm sao</h1>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-[28px] border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5 shadow-[0_12px_40px_rgba(245,158,11,0.08)]">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-200/20 blur-3xl" />

          <div className="relative flex items-center justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-600">
                <Star size={13} className="fill-amber-500 text-amber-500" />
                Điểm sao của bạn
              </p>
              <p className="mt-1 text-3xl font-black text-slate-900">
                {formatVND(starPoints)}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Quy đổi từ hoa hồng mua hàng thực tế
              </p>
            </div>

            <Wallet size={40} className="text-amber-300" />
          </div>

          <div className="relative mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowWithdraw(true)}
              disabled={starPoints < 20000}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-white px-3 py-3 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-100 disabled:opacity-40"
            >
              <Landmark size={14} />
              Rút về ngân hàng
            </button>
            <button
              onClick={() => setShowConvert(true)}
              disabled={starPoints <= 0}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-3 text-xs font-bold text-white shadow-sm disabled:opacity-40"
            >
              <ArrowLeftRight size={14} />
              Đổi sang Xu
            </button>
          </div>

          {starPoints < 20000 && (
            <p className="relative mt-2 flex items-center gap-1 text-[10px] text-slate-400">
              <Info size={11} />
              Cần tối thiểu 20.000đ để rút về ngân hàng
            </p>
          )}
        </section>
