import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Megaphone,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
} from "lucide-react";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { supabase } from "../lib/supabaseClient.js";

const PLATFORMS = [
  { value: "TikTok", label: "TikTok" },
  { value: "YouTube", label: "YouTube" },
];

const FILTERS = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ duyệt" },
  { key: "approved", label: "Đã duyệt" },
  { key: "paid", label: "Đã trả coin" },
  { key: "rejected", label: "Từ chối" },
];

const STATUS_META = {
  pending: { label: "Chờ duyệt", cls: "bg-amber-50 text-amber-600", Icon: Clock },
  approved: { label: "Đã duyệt", cls: "bg-sky-50 text-sky-600", Icon: CheckCircle2 },
  paid: { label: "Đã trả coin", cls: "bg-emerald-50 text-emerald-600", Icon: Coins },
  rejected: { label: "Từ chối", cls: "bg-rose-50 text-rose-600", Icon: XCircle },
};

export default function MarketingVideo() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [platform, setPlatform] = useState("TikTok");
  const [link, setLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);

      const { data, error: err } = await supabase
        .from("marketing_videos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (err) console.error("Load marketing videos error:", err);
      setVideos(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = videos.length;
    const pending = videos.filter((v) => v.status === "pending").length;
    const approved = videos.filter((v) => v.status === "approved" || v.status === "paid").length;
    const coinEarned = videos
      .filter((v) => v.status === "approved" || v.status === "paid")
      .reduce((s, v) => s + (v.coin_awarded || 0), 0);
    return { total, pending, approved, coinEarned };
  }, [videos]);

  const filteredVideos =
    filter === "all" ? videos : videos.filter((v) => v.status === filter);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!userId) return setError("Vui lòng đăng nhập.");
    if (!link.trim()) return setError("Dán link video vào đây.");
    if (!/^https?:\/\//i.test(link.trim()))
      return setError("Link không hợp lệ (phải bắt đầu bằng http:// hoặc https://).");

    setSubmitting(true);
    try {
      const { error: insertErr } = await supabase.from("marketing_videos").insert({
        user_id: userId,
        link: link.trim(),
        platform,
        status: "pending",
      });

      if (insertErr) throw insertErr;

      setSuccess("Đã gửi video, chờ admin duyệt nhé!");
      setLink("");
      await loadVideos();
    } catch (e) {
      setError(e?.message || "Không gửi được, thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-white pb-24 text-slate-900">
      <TopHeader />

      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center"
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-[17px] font-bold">Marketing Video</h1>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-4">
        {/* Banner giới thiệu */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
              <Megaphone size={18} />
            </span>
            <div>
              <h2 className="text-[15px] font-bold">
                Kiếm coin từ TikTok / YouTube
              </h2>
              <p className="mt-1 text-[13px] text-slate-500">
                Quay video giới thiệu trang web, đăng lên TikTok hoặc YouTube,
                gửi link tại đây — admin duyệt và trả coin theo lượt xem.
              </p>
            </div>
          </div>
        </div>

        {/* Form nộp video */}
        <div className="mt-4 rounded-xl border border-slate-200 p-4">
          <label className="text-[14px] font-semibold text-slate-700">
            Nền tảng
          </label>
          <div className="mt-2 flex gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPlatform(p.value)}
                className={`flex-1 rounded-lg border py-2.5 text-[13px] font-semibold transition ${
                  platform === p.value
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <label className="mt-4 block text-[14px] font-semibold text-slate-700">
            Link video
          </label>
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Dán link TikTok / YouTube"
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-[14px] outline-none focus:border-slate-900"
          />

          {error && <p className="mt-2 text-[13px] text-rose-600">{error}</p>}
          {success && <p className="mt-2 text-[13px] text-emerald-600">{success}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-[14px] font-bold text-white transition active:opacity-90 disabled:opacity-40"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
            Gửi duyệt
          </button>
        </div>

        {/* Thống kê */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="text-[12px] text-slate-500">Tổng video</p>
            <p className="mt-1 text-xl font-black">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="text-[12px] text-slate-500">Chờ duyệt</p>
            <p className="mt-1 text-xl font-black text-amber-600">{stats.pending}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="text-[12px] text-slate-500">Đã duyệt</p>
            <p className="mt-1 text-xl font-black text-sky-600">{stats.approved}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="text-[12px] text-slate-500">Coin đã nhận</p>
            <p className="mt-1 text-xl font-black text-emerald-600">
              {stats.coinEarned.toLocaleString("vi-VN")}
            </p>
          </div>
        </div>

        {/* Danh sách video */}
        <div className="mt-5">
          <h3 className="text-[15px] font-bold">Video của bạn</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition ${
                  filter === f.key
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="mt-3 space-y-3">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 size={20} className="animate-spin text-slate-300" />
              </div>
            ) : filteredVideos.length === 0 ? (
              <p className="py-10 text-center text-[13px] text-slate-400">
                Chưa có video nào.
              </p>
            ) : (
              filteredVideos.map((v) => {
                const meta = STATUS_META[v.status] || STATUS_META.pending;
                const StatusIcon = meta.Icon;
                return (
                  <div key={v.id} className="rounded-xl border border-slate-200 p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="inline-block rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          {v.platform}
                        </span>
                        <p className="mt-1.5 truncate text-[13px] text-sky-600">{v.link}</p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {new Date(v.created_at).toLocaleString("vi-VN")}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${meta.cls}`}
                        >
                          <StatusIcon size={12} />
                          {meta.label}
                        </span>
                        <p className="mt-1.5 text-[13px] font-bold text-amber-600">
                          {(v.coin_awarded || 0).toLocaleString("vi-VN")} coin
                        </p>
                      </div>
                    </div>

                    <div className="mt-2.5 grid grid-cols-4 gap-2 border-t border-slate-100 pt-2.5 text-center">
                      <div>
                        <p className="text-[10px] text-slate-400">View</p>
                        <p className="text-[12px] font-bold">{v.view_count || 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">Like</p>
                        <p className="text-[12px] font-bold">{v.like_count || 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">Cmt</p>
                        <p className="text-[12px] font-bold">{v.comment_count || 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">CTR</p>
                        <p className="text-[12px] font-bold">{v.ctr || "0%"}</p>
                      </div>
                    </div>

                    {v.status === "rejected" && v.admin_note && (
                      <p className="mt-2 rounded-lg bg-rose-50 p-2 text-[12px] text-rose-600">
                        Admin: {v.admin_note}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
          }
  
