import React, { useState, useEffect } from "react";
import { 
  Wallet, ShieldCheck, Clock, CheckCircle2, TrendingUp, ArrowRightLeft, CreditCard, Landmark, 
  History, Info, Megaphone, Music, Youtube, Sparkles, Send, Coins, Loader2
} from "lucide-react";
import BottomNav from "../components/BottomNav.jsx";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";

export default function Marketing() {
  const { session } = useSession();
  const { profile } = useProfile();

  const [activeTab, setActiveTab] = useState("overview");
  const [link, setLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [activeVideoTab, setActiveVideoTab] = useState("all");

  const isValidLink = (url) => {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname;
      return host.includes("tiktok.com") || host.includes("youtube.com") || host.includes("youtu.be");
    } catch { return false; }
  };

  const fetchVideos = async () => {
    if (!session?.user?.id) return;
    setLoadingVideos(true);
    const { data } = await supabase.from("marketing_videos").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
    setVideos(data ?? []);
    setLoadingVideos(false);
  };

  useEffect(() => { fetchVideos(); }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!link.trim()) { alert("Vui lòng nhập link video!"); return; }
    if (!isValidLink(link)) { alert("Link không hợp lệ! Vui lòng chỉ dán link TikTok hoặc YouTube."); return; }

    setIsSubmitting(true);
    const { error } = await supabase.from("marketing_videos").insert({
      user_id: session.user.id,
      link: link.trim(),
      platform: link.includes("tiktok.com") ? "TikTok" : "YouTube",
      status: "pending"
    });
    setIsSubmitting(false);

    if (error) { alert("Lỗi gửi video: " + error.message); return; }
    alert("Đã gửi video thành công! Chờ admin duyệt nhé!");
    setLink("");
    fetchVideos();
  };

  const filteredVideos = videos.filter((v) => activeVideoTab === "all" ? true : v.status === activeVideoTab);
  const totalVideos = videos.length;
  const pendingVideos = videos.filter(v => v.status === "pending").length;
  const rejectedVideos = videos.filter(v => v.status === "rejected").length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-24 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 px-4 py-4 backdrop-blur-md">
        <h1 className="font-display text-xl font-bold text-slate-900">Ví Marketing</h1>
      </header>

      <main className="mx-auto max-w-md space-y-5 px-4 py-5">
        {/* Ví Marketing */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><Wallet size={20} className="text-blue-500" /> Ví Marketing</h2>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-bold text-white">Marketing: 0</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">Main: {profile.coins ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Tab chức năng */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: "overview", label: "Tổng quan", icon: Wallet },
            { key: "main", label: "Đổi Main", icon: ArrowRightLeft },
            { key: "card", label: "Thẻ cào", icon: CreditCard },
            { key: "bank", label: "Bank/Ví", icon: Landmark },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === tab.key ? "bg-blue-500 text-white shadow-md shadow-blue-500/25" : "bg-slate-100 text-slate-500"
              }`}>
              <tab.icon size={15} /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-slate-500"><ShieldCheck size={16} className="text-blue-500" /> Số dư Marketing Coin của bạn</div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-4xl font-bold text-blue-500">0</span>
                <span className="text-sm text-slate-400">≈ 0 VND (trước phí)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><p className="flex items-center gap-1.5 text-xs text-slate-400"><Clock size={14} /> Đã hoàn tất</p><p className="mt-2 text-2xl font-bold text-slate-900">0</p></div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><p className="flex items-center gap-1.5 text-xs text-slate-400"><CheckCircle2 size={14} /> Đang chờ</p><p className="mt-2 text-2xl font-bold text-slate-900">0</p></div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><p className="flex items-center gap-1.5 text-xs text-slate-400"><TrendingUp size={14} /> Tổng nhận VND</p><p className="mt-2 text-2xl font-bold text-slate-900">0</p></div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><p className="flex items-center gap-1.5 text-xs text-slate-400"><ArrowRightLeft size={14} /> Đã đổi Main</p><p className="mt-2 text-2xl font-bold text-slate-900">0</p></div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-900"><Info size={18} className="text-blue-500" /> Quy tắc thanh toán</h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                <li>• 1 Marketing Coin = 1 VND khi rút tiền.</li>
                <li>• Đổi sang Main coin: 1.000 mkt → 900 main (phí sàn 10%).</li>
                <li>• Rút thẻ cào: miễn phí (rút 100.000 – nhận thẻ 100.000).</li>
                <li>• Rút bank/ví: phí 20% (rút 100.000 – nhận 80.000 VND).</li>
                <li>• Tối thiểu mỗi lần rút: 10.000 VND.</li>
                <li>• Marketing Coin tách riêng khỏi Main coin — không gộp.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-900"><History size={18} className="text-slate-400" /> Lịch sử rút</h3>
              <p className="mt-3 text-center text-sm text-slate-400">Chưa có giao dịch rút tiền.</p>
            </div>
          </>
        )}

        {/* ===== GIỚI THIỆU ===== */}
        <div className="rounded-3xl border border-sky-100 bg-gradient-to-b from-sky-50 to-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-500"><Megaphone size={24} /></span>
            <div className="min-w-0">
              <h2 className="text-base font-bold leading-snug text-slate-900">Marketing Video — Kiếm coin từ TikTok / YouTube</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">Quay video giới thiệu trang web, đăng lên TikTok hoặc YouTube, gửi link tại đây — admin duyệt và trả coin theo số lượt xem.</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500"><Music size={16} /></span>
              <div><p className="text-[11px] text-slate-400">TikTok</p><p className="text-sm font-bold text-slate-800">1K view = 2.500 coin</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500"><Youtube size={16} /></span>
              <div><p className="text-[11px] text-slate-400">YouTube Long</p><p className="text-sm font-bold text-slate-800">1K view = 25.000 coin</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500"><Youtube size={16} /></span>
              <div><p className="text-[11px] text-slate-400">YouTube Short</p><p className="text-sm font-bold text-slate-800">1K view = 10.000 coin</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-500"><Sparkles size={16} /></span>
              <div><p className="text-[11px] text-amber-500">Bonus theo view</p><p className="text-sm font-bold text-amber-600">≥5K +10% • ≥10K +20%</p></div>
            </div>
          </div>
        </div>

        {/* ===== GỬI LINK ===== */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Gửi link video của bạn</h2>
          <form onSubmit={handleSubmit} className="mt-4">
            <input type="text" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Dán link TikTok / YouTube..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400" />
            <button type="submit" disabled={isSubmitting} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-blue-500 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-600 disabled:opacity-60">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Gửi duyệt
            </button>
          </form>
        </div>

        {/* ===== DANH SÁCH VIDEO ===== */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Video của bạn</h2>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { key: "all", label: "Tất cả" },
              { key: "pending", label: "Chờ duyệt" },
              { key: "approved", label: "Đã duyệt" },
              { key: "rejected", label: "Từ chối" },
            ].map((tab) => (
              <button key={tab.key} onClick={() => setActiveVideoTab(tab.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${activeVideoTab === tab.key ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                {tab.label} <span className="ml-1">{videos.filter(v => tab.key === "all" ? true : v.status === tab.key).length}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-4">
            {loadingVideos ? (
              <p className="py-8 text-center text-sm text-slate-400">Đang tải...</p>
            ) : filteredVideos.length === 0 ? (
              <div className="py-10 text-center">
                <Megaphone size={40} className="mx-auto text-slate-200" />
                <p className="mt-3 text-sm font-medium text-slate-500">Bắt đầu ngay để kiếm coin nào!</p>
                <p className="mt-1 text-xs text-slate-400">Quay video và gửi link đầu tiên của bạn</p>
              </div>
            ) : filteredVideos.map((video) => (
              <div key={video.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${video.platform === "TikTok" ? "bg-slate-100 text-slate-700" : "bg-red-50 text-red-600"}`}>
                    {video.platform === "TikTok" ? <Music size={12} /> : <Youtube size={12} />} {video.platform}
                  </span>
                  <p className="text-sm font-bold text-amber-500"><Coins size={14} className="inline" /> {video.coin_awarded || 0}</p>
                </div>
                <div className="mt-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${video.status === "rejected" ? "bg-rose-50 text-rose-500" : video.status === "approved" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                    {video.status === "pending" ? "Chờ duyệt" : video.status === "approved" ? "Đã duyệt" : "Từ chối"}
                  </span>
                  <p className="mt-1 text-xs text-slate-400">{new Date(video.created_at).toLocaleString("vi-VN")}</p>
                </div>

                {/* Tiêu đề video (màu xanh, bấm vào dẫn link) */}
                <a href={video.link} target="_blank" rel="noopener noreferrer" className="mt-2 block break-all text-sm font-medium text-blue-500 hover:underline">
                  {video.title || video.link}
                </a>

                {/* Các số liệu */}
                <div className="mt-3 grid grid-cols-4 gap-2">
                  <div className="rounded-lg bg-slate-50 p-2 text-center">
                    <p className="text-[10px] text-slate-400">View</p>
                    <p className="text-sm font-bold text-slate-800">{video.view_count || "—"}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2 text-center">
                    <p className="text-[10px] text-slate-400">Like</p>
                    <p className="text-sm font-bold text-slate-800">{video.like_count || "—"}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2 text-center">
                    <p className="text-[10px] text-slate-400">Cmt</p>
                    <p className="text-sm font-bold text-slate-800">{video.comment_count || "—"}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2 text-center">
                    <p className="text-[10px] text-slate-400">CTR</p>
                    <p className="text-sm font-bold text-slate-800">{video.ctr || "0%"}</p>
                  </div>
                </div>

                {video.admin_note && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs italic text-slate-500">Admin: {video.admin_note}</p>}
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
                                                              }
