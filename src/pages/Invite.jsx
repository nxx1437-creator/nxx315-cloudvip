import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Coins,
  TrendingUp,
  Copy,
  Check,
  Share2,
  Loader2,
  QrCode,
  Gift,
  Trophy,
  Crown,
  X,
  HelpCircle,
  ChevronRight,
  Flame,
  Sparkles,
} from "lucide-react";

import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

const formatCoins = (v) => Number(v || 0).toLocaleString("vi-VN");

// ✅ Mốc thưởng mời bạn
const REFERRAL_MILESTONES = [
  { count: 3, reward: 500 },
  { count: 5, reward: 1000 },
  { count: 10, reward: 3000 },
  { count: 20, reward: 10000 },
];

// ✅ Sub-component: Bước hướng dẫn
function StepRow({ number, text }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#F5F7FB] px-3.5 py-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3478F6] text-[11px] font-bold text-white">
        {number}
      </span>
      <p className="text-xs font-medium text-[#374151]">{text}</p>
    </div>
  );
}

// ✅ Sub-component: Nút chia sẻ mạng xã hội
function SocialShareButton({ icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white py-3 transition hover:border-[#3478F6]/30 hover:shadow-sm`}
    >
      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${color}`}>
        {icon}
      </span>
      <span className="text-[10px] font-semibold text-[#374151]">{label}</span>
    </button>
  );
}

// ✅ Sub-component: Mốc thưởng mời bạn
function MilestoneCard({ milestone, reward, currentCount, claimed, onClaim, claiming }) {
  const reached = currentCount >= milestone;
  const progressPct = Math.min(100, Math.round((currentCount / milestone) * 100));

  return (
    <button
      onClick={() => reached && !claimed && onClaim(milestone)}
      disabled={!reached || claimed || claiming}
      className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition ${
        claimed
          ? "border-emerald-200 bg-emerald-50"
          : reached
          ? "border-[#F2A900]/40 bg-[#FFF8ED]"
          : "border-[#E5E7EB] bg-white"
      }`}
    >
      <span className="text-xs font-bold text-[#111827]">{milestone} bạn</span>
      <span
        className={`flex items-center gap-1 text-sm font-bold ${
          claimed ? "text-emerald-600" : "text-[#B87700]"
        }`}
      >
        {claimed ? <Check size={13} /> : <Coins size={13} />}
        +{reward}
      </span>
      <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
        <div
          className={`h-full rounded-full ${claimed ? "bg-emerald-400" : "bg-[#F2A900]"}`}
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <span className="text-[10px] text-[#9CA3AF]">
        {currentCount}/{milestone}
      </span>
    </button>
  );
}
export default function Invite() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile } = useProfile();

  const [referredUsers, setReferredUsers] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [claimingMilestone, setClaimingMilestone] = useState(null);

  const referralCode = profile?.referral_code || "";
  const inviteLink = `${window.location.origin}/register?ref=${referralCode}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(inviteLink)}&bgcolor=FFFFFF&color=3478F6`;

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchData = async () => {
      const [usersRes, commissionsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, username, avatar_url, created_at, coins_earned_today")
          .eq("referred_by", session.user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("referral_commissions")
          .select("id, referred_id, source_amount, commission, created_at")
          .eq("referrer_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(30),
      ]);

      setReferredUsers(usersRes.data || []);
      setCommissions(commissionsRes.data || []);
      setLoading(false);
    };

    fetchData();
  }, [session?.user?.id]);

  const totalCommission = commissions.reduce((sum, c) => sum + c.commission, 0);
  const nameMap = Object.fromEntries(referredUsers.map((u) => [u.id, u.username]));

  // ✅ Top 3 người mời kiếm nhiều coin nhất
  const topReferrals = [...referredUsers]
    .sort((a, b) => (b.coins_earned_today || 0) - (a.coins_earned_today || 0))
    .slice(0, 3);

  // ✅ Biểu đồ hoa hồng 7 ngày qua
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    last7Days.push(d);
  }

  const commissionByDay = last7Days.map((d) => {
    const total = commissions
      .filter((c) => {
        const cd = new Date(c.created_at);
        cd.setHours(0, 0, 0, 0);
        return cd.getTime() === d.getTime();
      })
      .reduce((sum, c) => sum + c.commission, 0);
    return {
      date: d,
      total,
      label: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d.getDay()],
      isToday: d.toDateString() === new Date().toDateString(),
    };
  });

  const maxCommission = Math.max(...commissionByDay.map((d) => d.total), 1);

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "NXX315 Studio Rewards",
          text: `Dùng mã ${referralCode} để nhận 200 Coin miễn phí khi đăng ký NXX315 Studio!`,
          url: inviteLink,
        });
      } catch {
        // huỷ chia sẻ
      }
    } else {
      handleCopy(inviteLink, "link");
    }
  };

  const shareZalo = () => {
    window.open(`https://zalo.me/share?u=${encodeURIComponent(inviteLink)}`, "_blank");
  };

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}`,
      "_blank"
    );
  };

  const shareTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(
        `Dùng mã ${referralCode} để nhận 200 Coin miễn phí!`
      )}`,
      "_blank"
    );
  };

  const handleClaimMilestone = async (milestone) => {
    if (!session?.user?.id) return;
    setClaimingMilestone(milestone);

    const { data, error } = await supabase.rpc("claim_referral_milestone", {
      p_user_id: session.user.id,
      p_milestone: milestone,
    });

    setClaimingMilestone(null);

    if (error) {
      alert("Lỗi: " + error.message);
      return;
    }

    if (!data?.success) {
      alert(data?.message || "Không thể nhận thưởng.");
      return;
    }

    alert(`Nhận thành công +${data.reward} coin!`);
  };
return (
  <div className="min-h-screen bg-[#F5F7FB] pb-24 text-[#111827]">
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[#E5E7EB] bg-white/95 px-4 py-3.5 backdrop-blur-md">
      <button
        onClick={() => navigate(-1)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-[#6B7280] hover:bg-[#F5F7FB]"
      >
        <ArrowLeft size={18} />
      </button>
      <h1 className="flex-1 text-[15px] font-bold text-[#111827]">
        Giới thiệu bạn bè
      </h1>
      <button
        onClick={() => setShowGuide(true)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-[#6B7280] hover:bg-[#F5F7FB]"
      >
        <HelpCircle size={18} />
      </button>
    </header>

    <main className="mx-auto max-w-md space-y-4 px-4 py-5">
      {/* Hero gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-400 p-5 text-white shadow-lg shadow-emerald-500/20">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <Users size={22} />
          </span>
          <div>
            <p className="text-base font-black">Giới thiệu bạn bè</p>
            <p className="text-xs text-white/90">
              Mời bạn — họ nhận 200 Coin, bạn ăn 15% hoa hồng
            </p>
          </div>
        </div>
        <div className="relative mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/15 p-3 backdrop-blur">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/80">
              Đã giới thiệu
            </p>
            <p className="mt-1 text-xl font-black">{referredUsers.length}</p>
          </div>
          <div className="rounded-xl bg-white/15 p-3 backdrop-blur">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/80">
              Tổng hoa hồng
            </p>
            <p className="mt-1 text-xl font-black">
              {formatCoins(totalCommission)}đ
            </p>
          </div>
        </div>
      </div>

      {/* Mã giới thiệu + Link */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
          Mã giới thiệu của bạn
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-xl border-2 border-dashed border-sky-300 bg-[#EAF2FE] py-3 text-center">
            <span className="text-lg font-black tracking-widest text-[#3478F6]">
              {referralCode || "..."}
            </span>
          </div>
          <button
            onClick={() => handleCopy(referralCode, "code")}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white transition ${
              copiedCode ? "bg-emerald-500" : "bg-[#3478F6]"
            }`}
          >
            {copiedCode ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>

        <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
          Link mời bạn bè
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 truncate rounded-xl border border-[#E5E7EB] bg-[#F5F7FB] px-3.5 py-3 text-xs text-[#6B7280]">
            {inviteLink}
          </div>
          <button
            onClick={handleShare}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5F7FB] text-[#6B7280] hover:bg-[#EAF2FE] hover:text-[#3478F6]"
          >
            <Share2 size={16} />
          </button>
        </div>

        {/* Nút QR + Chia sẻ mạng xã hội */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <SocialShareButton
            icon={<span className="text-base font-bold text-white">Z</span>}
            label="Zalo"
            color="bg-[#0068FF]"
            onClick={shareZalo}
          />
          <SocialShareButton
            icon={<span className="text-base font-bold text-white">f</span>}
            label="Facebook"
            color="bg-[#1877F2]"
            onClick={shareFacebook}
          />
          <SocialShareButton
            icon={<span className="text-base font-bold text-white">✈</span>}
            label="Telegram"
            color="bg-[#229ED9]"
            onClick={shareTelegram}
          />
        </div>

        <button
          onClick={() => setShowQr(true)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white py-3 text-xs font-bold text-[#3478F6] transition hover:bg-[#EAF2FE]"
        >
          <QrCode size={14} />
          Hiện mã QR để bạn bè quét
        </button>
      </div>

      {/* Mốc thưởng mời bạn */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-sm font-bold text-[#111827]">
            <Gift size={14} className="text-[#F2A900]" />
            Nhiệm vụ mời bạn
          </p>
          <span className="text-xs font-semibold text-[#9CA3AF]">
            {referredUsers.length} bạn
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {REFERRAL_MILESTONES.map((m) => (
            <MilestoneCard
              key={m.count}
              milestone={m.count}
              reward={m.reward}
              currentCount={referredUsers.length}
              claimed={false}
              claiming={claimingMilestone === m.count}
              onClaim={handleClaimMilestone}
            />
          ))}
        </div>
      </div>
        {/* Top 3 người bạn */}
        {topReferrals.length > 0 && (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-[#111827]">
              <Trophy size={14} className="text-[#F2A900]" />
              Top 3 bạn kiếm nhiều nhất
            </p>

            <div className="grid grid-cols-3 gap-2.5">
              {topReferrals.map((u, idx) => {
                const rank = idx + 1;
                const bgColors = {
                  1: "from-amber-100 to-amber-50 border-amber-300",
                  2: "from-slate-200 to-slate-100 border-slate-300",
                  3: "from-orange-100 to-orange-50 border-orange-300",
                };
                const textColors = {
                  1: "text-amber-700",
                  2: "text-slate-700",
                  3: "text-orange-700",
                };
                const icons = {
                  1: <Crown size={16} className="text-amber-500" />,
                  2: <Trophy size={16} className="text-slate-500" />,
                  3: <Trophy size={16} className="text-orange-500" />,
                };
                return (
                  <div
                    key={u.id}
                    className={`flex flex-col items-center rounded-2xl border bg-gradient-to-br p-3 ${bgColors[rank]}`}
                  >
                    <div className="mb-1 flex h-6 items-center justify-center">
                      {icons[rank]}
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-[#6B7280] shadow-sm">
                      {(u.username || "?").charAt(0).toUpperCase()}
                    </span>
                    <p className={`mt-2 w-full truncate text-center text-[11px] font-bold ${textColors[rank]}`}>
                      {u.username || "Người dùng"}
                    </p>
                    <div className="mt-0.5 flex items-center gap-0.5 text-amber-500">
                      <Coins size={10} />
                      <span className="text-[10px] font-black">
                        {formatCoins(u.coins_earned_today || 0)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Biểu đồ hoa hồng 7 ngày */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-bold text-[#111827]">
              <TrendingUp size={14} className="text-emerald-500" />
              Hoa hồng 7 ngày qua
            </p>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
              +{formatCoins(commissionByDay.find((d) => d.isToday)?.total || 0)} hôm nay
            </span>
          </div>

          <div className="flex items-end justify-between gap-2" style={{ height: "100px" }}>
            {commissionByDay.map((d, i) => {
              const heightPct = d.total === 0 ? 6 : Math.max(12, Math.round((d.total / maxCommission) * 100));
              return (
                <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
                  <span className={`text-[9px] font-bold ${d.total > 0 ? "text-[#374151]" : "text-transparent"}`}>
                    {d.total > 0 ? d.total : "0"}
                  </span>
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        d.isToday ? "bg-gradient-to-t from-emerald-500 to-emerald-400" : d.total > 0 ? "bg-emerald-200" : "bg-[#EEF2F7]"
                      }`}
                      style={{ height: `${heightPct}%`, minHeight: "4px" }}
                    />
                  </div>
                  <span className={`text-[9px] ${d.isToday ? "font-bold text-emerald-600" : "text-[#9CA3AF]"}`}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Danh sách người đã giới thiệu */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={20} className="animate-spin text-[#D1D5DB]" />
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-bold text-[#111827]">Người đã giới thiệu</p>
                <span className="text-xs font-semibold text-[#9CA3AF]">{referredUsers.length}</span>
              </div>

              {referredUsers.length === 0 ? (
                <p className="py-6 text-center text-xs text-[#9CA3AF]">
                  Chưa có ai dùng mã của bạn.
                </p>
              ) : (
                <div className="space-y-3">
                  {referredUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between border-b border-[#F3F4F6] pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F7FB] text-xs font-bold text-[#6B7280]">
                          {(u.username || "?").charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-[#374151]">
                            {u.username || "Người dùng"}
                          </p>
                          <p className="text-[10px] text-[#9CA3AF]">
                            {new Date(u.created_at).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-500">
                        {formatCoins(u.coins_earned_today || 0)}đ
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lịch sử hoa hồng */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-bold text-[#111827]">Lịch sử hoa hồng</p>
                <span className="text-xs font-semibold text-[#9CA3AF]">{commissions.length}</span>
              </div>

              {commissions.length === 0 ? (
                <p className="py-6 text-center text-xs text-[#9CA3AF]">Chưa có hoa hồng nào.</p>
              ) : (
                <div className="space-y-3">
                  {commissions.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between border-b border-[#F3F4F6] pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="text-xs font-semibold text-[#374151]">
                          {nameMap[c.referred_id] || "Người dùng"} · {c.source_amount}đ
                        </p>
                        <p className="text-[10px] text-[#9CA3AF]">
                          {new Date(c.created_at).toLocaleString("vi-VN")}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-[#F2A900]">+{c.commission}đ</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Modal QR */}
      {showQr && (
        <div
          onClick={() => setShowQr(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Mã QR giới thiệu</h3>
              <button
                onClick={() => setShowQr(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Cho bạn bè quét mã này để đăng ký và nhận 200 Coin
            </p>

            <div className="mt-4 flex justify-center">
              <img
                src={qrUrl}
                alt="QR Code"
                className="h-60 w-60 rounded-2xl border-4 border-[#EAF2FE]"
              />
            </div>

            <p className="mt-3 text-xs font-bold tracking-widest text-[#3478F6]">
              {referralCode}
            </p>

            <button
              onClick={() => handleCopy(inviteLink, "link")}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#3478F6] py-3 text-sm font-bold text-white"
            >
              <Copy size={14} />
              Sao chép link
            </button>
          </div>
        </div>
      )}

      {/* Modal hướng dẫn */}
      {showGuide && (
        <div
          onClick={() => setShowGuide(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Cách mời bạn bè</h3>
              <button
                onClick={() => setShowGuide(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              <StepRow number="1" text="Chia sẻ mã hoặc link cho bạn bè" />
              <StepRow number="2" text="Bạn của bạn nhập mã khi đăng ký → +200 Coin" />
              <StepRow number="3" text="Bạn ăn 15% Coin từ mỗi nhiệm vụ họ làm" />
              <StepRow number="4" text="Đạt mốc 3/5/10/20 bạn → nhận thêm thưởng lớn" />
            </div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-[11px] leading-5 text-amber-700">
                💡 <b>Mẹo:</b> Chia sẻ link lên Facebook, Zalo, Telegram để có nhiều
                người đăng ký hơn.
              </p>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="mt-4 w-full rounded-xl bg-[#3478F6] py-3 text-sm font-bold text-white"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}