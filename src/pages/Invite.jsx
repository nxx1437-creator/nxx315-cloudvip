import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Coins, TrendingUp, Copy, Check, Share2, Loader2 } from "lucide-react";

import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

const formatCoins = (v) => Number(v || 0).toLocaleString("vi-VN");

export default function Invite() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile } = useProfile();

  const [referredUsers, setReferredUsers] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const referralCode = profile?.referral_code || "";
  const inviteLink = `${window.location.origin}/register?ref=${referralCode}`;

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchData = async () => {
      const [usersRes, commissionsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, username, created_at")
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
        // người dùng huỷ chia sẻ, bỏ qua
      }
    } else {
      handleCopy(inviteLink, "link");
    }
  };
  return (
    <div className="min-h-screen bg-[#F5F7FB] pb-24 text-[#111827]">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[#E5E7EB] bg-white/95 px-4 py-3.5 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#6B7280] hover:bg-[#F5F7FB]">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-[15px] font-bold text-[#111827]">Giới thiệu bạn bè</h1>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 py-5">

        <div className="flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
            <Users size={20} className="text-emerald-600" />
          </span>
          <div>
            <p className="text-base font-black text-[#111827]">Giới thiệu bạn bè</p>
            <p className="mt-0.5 text-xs leading-5 text-[#6B7280]">
              Mời bạn — họ nhận 200 Coin, bạn ăn 15% hoa hồng từ mỗi nhiệm vụ họ làm
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
              <Users size={12} /> Đã giới thiệu
            </p>
            <p className="mt-1.5 text-2xl font-bold text-[#111827]">{referredUsers.length}</p>
          </div>
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
              <Coins size={12} /> Tổng hoa hồng
            </p>
            <p className="mt-1.5 text-2xl font-bold text-[#F2A900]">{formatCoins(totalCommission)}đ</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
            <TrendingUp size={12} /> Tỉ lệ
          </p>
          <p className="mt-1.5 text-2xl font-bold text-emerald-600">15%</p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">Mã giới thiệu của bạn</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-xl border-2 border-dashed border-sky-300 bg-[#EAF2FE] py-3 text-center">
              <span className="text-lg font-black tracking-widest text-[#3478F6]">{referralCode || "..."}</span>
            </div>
            <button
              onClick={() => handleCopy(referralCode, "code")}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#3478F6] text-white"
            >
              {copiedCode ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>

          <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">Link mời bạn bè</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 truncate rounded-xl border border-[#E5E7EB] bg-[#F5F7FB] px-3.5 py-3 text-xs text-[#6B7280]">
              {inviteLink}
            </div>
            <button
              onClick={handleShare}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5F7FB] text-[#6B7280]"
            >
              <Share2 size={16} />
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            <StepRow number="1" text="Chia sẻ mã/link cho bạn bè" />
            <StepRow number="2" text="Bạn của bạn nhập mã khi đăng ký → +200 Coin" />
            <StepRow number="3" text="Bạn ăn 15% Coin từ mỗi nhiệm vụ họ hoàn thành" />
          </div>
        </div>

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
                <p className="py-6 text-center text-xs text-[#9CA3AF]">Chưa có ai dùng mã của bạn.</p>
              ) : (
                <div className="space-y-3">
                  {referredUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between border-b border-[#F3F4F6] pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F7FB] text-xs font-bold text-[#6B7280]">
                          {(u.username || "?").charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-[#374151]">{u.username || "Người dùng"}</p>
                          <p className="text-[10px] text-[#9CA3AF]">{new Date(u.created_at).toLocaleDateString("vi-VN")}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
                    <div key={c.id} className="flex items-center justify-between border-b border-[#F3F4F6] pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="text-xs font-semibold text-[#374151]">
                          {nameMap[c.referred_id] || "Người dùng"} · {c.source_amount}đ
                        </p>
                        <p className="text-[10px] text-[#9CA3AF]">{new Date(c.created_at).toLocaleString("vi-VN")}</p>
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

      <BottomNav />
    </div>
  );
}

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
