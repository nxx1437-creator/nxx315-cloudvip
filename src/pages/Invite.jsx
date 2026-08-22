import React, { useState, useEffect } from "react";
import { Users, TrendingUp, Gift, Copy, Share2, CheckCircle2, Coins } from "lucide-react";
import BottomNav from "../components/BottomNav.jsx";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";

export default function Invite() {
  const { session } = useSession();
  const { profile } = useProfile();
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [totalCommission, setTotalCommission] = useState(0);
  
  // Sinh mã giới thiệu ngẫu nhiên 8 ký tự
  const code = profile?.referral_code || "A8662459";

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!session?.user?.id) return;
      const { data } = await supabase.from("referrals").select("*").eq("referrer_id", session.user.id);
      setReferrals(data ?? []);
      
      // Tính tổng hoa hồng (Tạm thời lấy từ data dựa trên % hoặc giả định)
      const total = (data || []).reduce((sum, r) => sum + (r.total_commission || 0), 0);
      setTotalCommission(total);
    };
    fetchReferrals();
  }, [session]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Tham gia cùng tôi trên Nxx315 Studio Rewards!",
        text: `Nhập mã ${code} để nhận 200 Coin ngay khi đăng ký!`,
        url: window.location.origin + "/register",
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + "/register");
      alert("Đã sao chép link!");
    }
  };

  const link = `${window.location.origin}/register`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 px-4 py-4 backdrop-blur-md">
        <h1 className="font-display text-xl font-bold text-slate-900">Giới Thiệu Bạn Bè</h1>
      </header>

      <main className="mx-auto max-w-md space-y-5 px-4 py-5">
        {/* HEADER CARD */}
        <div className="rounded-3xl border border-sky-100 bg-gradient-to-b from-sky-50 to-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-500">
              <Gift size={24} />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">Giới Thiệu Bạn Bè</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Mời bạn — họ nhận 200 coin, bạn ăn 15% hoa hồng từ mỗi nhiệm vụ họ làm.
              </p>
            </div>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="flex items-center gap-1.5 text-xs text-slate-400"><Users size={14} /> ĐÃ GIỚI THIỆU</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{referrals.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="flex items-center gap-1.5 text-xs text-slate-400"><TrendingUp size={14} /> TỔNG HOA HỒNG</p>
            <p className="mt-2 text-2xl font-bold text-amber-500">{totalCommission.toLocaleString()}đ</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs text-slate-400"><TrendingUp size={14} /> TỈ LỆ</p>
          <p className="mt-2 text-2xl font-bold text-emerald-500">15%</p>
        </div>

        {/* CODE + LINK CARD */}
        <div className="rounded-3xl border border-blue-100 bg-blue-50/50 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mã giới thiệu của bạn</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 rounded-xl border-2 border-dashed border-blue-300 bg-white py-3 text-center">
              <span className="font-display text-2xl font-bold tracking-widest text-blue-600">{code}</span>
            </div>
            <button onClick={handleCopy} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-600">
              {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
            </button>
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">Link mời bạn bè</p>
          <div className="mt-3 flex items-center gap-2">
            <input readOnly value={link} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 outline-none" />
            <button onClick={handleShare} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* STEPS */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">1</span>
            <p className="text-sm text-slate-600">Chia sẻ mã/link cho bạn bè</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">2</span>
            <p className="text-sm text-slate-600">Bạn của bạn nhập mã khi đăng ký — <span className="font-bold text-emerald-600">+200 coin</span></p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">3</span>
            <p className="text-sm text-slate-600">Bạn ăn <span className="font-bold text-amber-600">15% coin</span> từ mỗi nhiệm vụ họ hoàn thành</p>
          </div>
        </div>

        {/* REFERRAL HISTORY */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900">Người đã giới thiệu</h2>
            <span className="text-sm text-slate-400">{referrals.length}</span>
          </div>
          
          <div className="mt-4 space-y-3">
            {referrals.length === 0 ? (
              <div className="py-10 text-center">
                <Users size={40} className="mx-auto text-slate-200" />
                <p className="mt-3 text-sm text-slate-400">Chưa có ai được giới thiệu.</p>
              </div>
            ) : referrals.map((ref) => (
              <div key={ref.id} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">?</span>
                  <div>
                    <p className="text-sm font-medium text-slate-700">—</p>
                    <p className="text-xs text-slate-400">{new Date(ref.created_at).toLocaleDateString("vi-VN")}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-emerald-500">+{ref.total_commission || 0}đ</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
      }
