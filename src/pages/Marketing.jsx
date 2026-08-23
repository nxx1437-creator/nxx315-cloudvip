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

  const cookies = profile.marketing_coins ?? 0;
  const pendingVideos = videos.filter((v) => v.status === "pending").length;
  const totalCookiesEarned = videos.reduce((sum, v) => sum + (v.coin_awarded || 0), 0);
  const filteredVideos = videos.filter((v) => (activeVideoTab === "all" ? true : v.status === activeVideoTab));

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
          <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
            <p className="flex items-center gap-1.5 text-xs text-slate-400"><TrendingUp size={14} className="text-amber-400" /> Tổng Cookies nhận</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{totalCookiesEarned.toLocaleString("vi-VN")}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
            <p className="flex items-center gap-1.5 text-xs text-slate-400"><ArrowRightLeft size={14} className="text-amber-400" /> Đã đổi Main</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">0</p>
          </div>
        </div>
      </main>
<div className="rounded-3xl border border-amber-100 bg-gradient-to-b from-amber-50 to-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/30">
              <Megaphone size={22} />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-bold leading-snug text-slate-900">Marketing Video — Kiếm Cookies từ TikTok / YouTube</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">Quay video giới thiệu trang web, đăng lên TikTok hoặc YouTube, gửi link tại đây — admin duyệt và trả Cookies theo số lượt xem.</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-3 rounded-xl border border-amber-100 bg-white p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500"><Music size={16} /></span>
              <div><p className="text-[11px] text-slate-400">TikTok</p><p className="text-sm font-bold text-slate-800">1K view = 2.500 Cookies</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-amber-100 bg-white p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500"><Youtube size={16} /></span>
              <div><p className="text-[11px] text-slate-400">YouTube Long</p><p className="text-sm font-bold text-slate-800">1K view = 25.000 Cookies</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-amber-100 bg-white p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500"><Youtube size={16} /></span>
              <div><p className="text-[11px] text-slate-400">YouTube Short</p><p className="text-sm font-bold text-slate-800">1K view = 10.000 Cookies</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-100/50 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-600"><Sparkles size={16} /></span>
              <div><p className="text-[11px] text-amber-600">Bonus theo view</p><p className="text-sm font-bold text-amber-700">≥5K +10% • ≥10K +20%</p></div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Info size={18} className="text-amber-500" /> Quy tắc thanh toán
          </h3>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
            <li>• <strong className="text-slate-900">1 Cookie = 1 VND</strong> khi rút tiền.</li>
            <li>• Đổi sang <strong className="text-slate-900">Main Coin</strong>: 1.000 Cookies → 900 Coin (phí sàn 10%).</li>
            <li>• Rút <strong className="text-slate-900">thẻ cào</strong>: <strong className="text-emerald-600">miễn phí</strong> (rút 100.000 – nhận thẻ 100.000).</li>
            <li>• Rút <strong className="text-slate-900">bank/ví</strong>: phí 20% (rút 100.000 – nhận 80.000 VND).</li>
            <li>• Tối thiểu mỗi lần rút: <strong className="text-slate-900">10.000 VND</strong>.</li>
            <li>• Cookies <strong className="text-slate-900">tách riêng hoàn toàn</strong> khỏi Coin làm nhiệm vụ — không tự gộp.</li>
          </ul>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: "main", label: "Đổi Main", icon: ArrowRightLeft },
            { key: "card", label: "Rút thẻ", icon: CreditCard },
            { key: "bank", label: "Rút bank", icon: Landmark },
          ].map((btn) => (
            <button
              key={btn.key}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-amber-200 bg-white px-4 py-2.5 text-sm font-semibold text-amber-700"
            >
              <btn.icon size={15} /> {btn.label}
            </button>
          ))}
        </div>

        <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <History size={18} className="text-slate-400" /> Lịch sử rút
          </h3>
          <p className="mt-3 text-center text-sm text-slate-400">Chưa có giao dịch rút tiền.</p>
        </div>
      <BottomNav />
      <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Gửi link video của bạn</h2>
          <form
            onSubmit={async (e) => {
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
            }}
            className="mt-4"
          >
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Dán link TikTok / YouTube..."
              className="w-full rounded-xl border border-amber-100 bg-amber-50/40 px-4 py-3 text-sm outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Gửi duyệt
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-400">Tổng video</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{videos.length}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-400">Chờ duyệt</p>
            <p className="mt-1 text-2xl font-bold text-amber-500">{pendingVideos}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-400">Đã duyệt</p>
            <p className="mt-1 text-2xl font-bold text-orange-500">{videos.filter((v) => v.status === "approved").length}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-400">Cookies đã nhận</p>
            <p className="mt-1 flex items-center gap-1 text-2xl font-bold text-emerald-600">
              <Cookie size={16} /> {totalCookiesEarned.toLocaleString("vi-VN")}
            </p>
          </div>
        </div>
    </div>
    <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Video của bạn</h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { key: "all", label: "Tất cả" },
              { key: "pending", label: "Chờ duyệt" },
              { key: "approved", label: "Đã duyệt" },
              { key: "paid", label: "Đã trả Cookies" },
              { key: "rejected", label: "Từ chối" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveVideoTab(tab.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  activeVideoTab === tab.key ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white" : "bg-amber-50 text-amber-700"
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
                <Megaphone size={40} className="mx-auto text-amber-100" />
                <p className="mt-3 text-sm font-medium text-slate-500">Bắt đầu ngay để kiếm Cookies nào!</p>
                <p className="mt-1 text-xs text-slate-400">Quay video và gửi link đầu tiên của bạn</p>
              </div>
            ) : (
              filteredVideos.map((video) => (
                <div key={video.id} className="rounded-2xl border border-amber-100 p-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        video.platform === "TikTok" ? "bg-slate-100 text-slate-700" : "bg-red-50 text-red-600"
                      }`}
                    >
                      {video.platform === "TikTok" ? <Music size={12} /> : <Youtube size={12} />} {video.platform}
                    </span>
                    <p className="flex items-center gap-1 text-sm font-bold text-amber-500">
                      <Cookie size={14} /> {video.coin_awarded || 0}
                    </p>
                  </div>
                  <div className="mt-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        video.status === "rejected"
                          ? "bg-rose-50 text-rose-500"
                          : video.status === "paid"
                          ? "bg-emerald-50 text-emerald-600"
                          : video.status === "approved"
                          ? "bg-orange-50 text-orange-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {video.status === "pending" ? "Chờ duyệt" : video.status === "approved" ? "Đã duyệt" : video.status === "paid" ? "Đã trả Cookies" : "Từ chối"}
                    </span>
                    <p className="mt-1 text-xs text-slate-400">{new Date(video.created_at).toLocaleString("vi-VN")}</p>
                  </div>

                  <a href={video.link} target="_blank" rel="noopener noreferrer" className="mt-2 block break-all text-sm font-medium text-amber-600 hover:underline">
                    {video.title || video.link}
                  </a>

                  <div className="mt-3 grid grid-cols-4 gap-2">
                    <div className="rounded-lg bg-amber-50/60 p-2 text-center"><p className="text-[10px] text-slate-400">View</p><p className="text-sm font-bold text-slate-800">{video.view_count || "—"}</p></div>
                    <div className="rounded-lg bg-amber-50/60 p-2 text-center"><p className="text-[10px] text-slate-400">Like</p><p className="text-sm font-bold text-slate-800">{video.like_count || "—"}</p></div>
                    <div className="rounded-lg bg-amber-50/60 p-2 text-center"><p className="text-[10px] text-slate-400">Cmt</p><p className="text-sm font-bold text-slate-800">{video.comment_count || "—"}</p></div>
                    <div className="rounded-lg bg-amber-50/60 p-2 text-center"><p className="text-[10px] text-slate-400">CTR</p><p className="text-sm font-bold text-slate-800">{video.ctr || "0%"}</p></div>
                  </div>

                  {video.admin_note && (
                    <p className="mt-3 rounded-lg bg-amber-50/60 p-3 text-xs italic text-slate-500">Admin: {video.admin_note}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
  );
              }
