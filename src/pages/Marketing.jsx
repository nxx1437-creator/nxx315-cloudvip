import React, { useState } from "react";
import {
  Megaphone,
  Music2,
  Youtube,
  Sparkles,
  Send,
  Link as LinkIcon,
  CheckCircle2,
} from "lucide-react";

export default function Marketing() {
  const [platform, setPlatform] = useState("tiktok");
  const [videoUrl, setVideoUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!videoUrl.trim()) {
      alert("Vui lòng nhập link video.");
      return;
    }

    // TODO:
    // Gọi Supabase để tạo marketing_videos
    console.log({
      platform,
      videoUrl,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white px-4 pb-28 pt-5">
      <div className="mx-auto max-w-2xl">

        {/* Hero */}
        <div className="rounded-3xl border border-blue-100 bg-white p-7 shadow-sm">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-100">
              <Megaphone className="h-8 w-8 text-blue-500" />
            </div>

            <div>
              <h1 className="text-3xl font-bold leading-tight text-slate-900">
                Marketing Video
                <br />
                — Kiếm coin từ TikTok / YouTube
              </h1>

              <p className="mt-4 text-lg leading-7 text-slate-500">
                Quay video giới thiệu trang web, đăng lên
                TikTok hoặc YouTube, gửi link tại đây
                — admin duyệt và trả coin theo số lượt xem.
              </p>
            </div>
          </div>

          {/* Rates */}
          <div className="mt-8 space-y-4">
            <RateCard
              icon={<Music2 className="h-7 w-7 text-pink-500" />}
              title="TikTok"
              value="1K view = 2.500 coin"
            />

            <RateCard
              icon={<Youtube className="h-7 w-7 text-red-500" />}
              title="YouTube Long"
              value="1K view = 25.000 coin"
            />

            <RateCard
              icon={<Youtube className="h-7 w-7 text-red-500" />}
              title="YouTube Short"
              value="1K view = 10.000 coin"
            />

            <RateCard
              icon={<Sparkles className="h-7 w-7 text-yellow-500" />}
              title="Bonus theo view"
              value="≥5K +10% · ≥10K +20%"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Send className="h-6 w-6 text-blue-500" />

            <h2 className="text-2xl font-bold text-slate-900">
              Gửi video
            </h2>
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Gửi link video để Admin kiểm tra và xác nhận thưởng.
          </p>

          {/* Platform */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            <PlatformButton
              active={platform === "tiktok"}
              onClick={() => setPlatform("tiktok")}
            >
              TikTok
            </PlatformButton>

            <PlatformButton
              active={platform === "youtube_long"}
              onClick={() => setPlatform("youtube_long")}
            >
              YouTube Long
            </PlatformButton>

            <PlatformButton
              active={platform === "youtube_short"}
              onClick={() => setPlatform("youtube_short")}
            >
              YouTube Short
            </PlatformButton>
          </div>

          {/* URL */}
          <form onSubmit={handleSubmit} className="mt-5">
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 outline-none transition focus:border-blue-400 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-500 py-4 font-bold text-white shadow-sm transition hover:bg-blue-600"
            >
              <Send className="h-5 w-5" />
              Gửi video xét duyệt
            </button>
          </form>
        </div>

        {/* Notice */}
        <div className="mt-4 rounded-3xl border border-green-100 bg-green-50 p-5">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />

            <div>
              <p className="font-semibold text-green-800">
                Lưu ý
              </p>

              <p className="mt-1 text-sm leading-6 text-green-700">
                Coin chỉ được cộng sau khi Admin kiểm tra
                video và xác nhận số lượt xem hợp lệ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RateCard({ icon, title, value }) {
  return (
    <div className="flex items-center gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50">
        {icon}
      </div>

      <div>
        <p className="text-lg text-slate-500">
          {title}
        </p>

        <p className="mt-1 text-xl font-bold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function PlatformButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-2 py-3 text-xs font-semibold transition ${
        active
          ? "bg-blue-500 text-white"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {children}
    </button>
  );
}
