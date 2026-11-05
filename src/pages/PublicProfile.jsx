// src/pages/PublicProfile.jsx — trang cá nhân của người khác (từ bảng xếp hạng): /u/:userId
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Coins } from "lucide-react";

import useSession from "../hooks/useSession.js";
import { supabase } from "../lib/supabaseClient.js";
import { LbAvatar } from "./Leaderboard.jsx";
import { Group, Row } from "../components/profile/SettingsParts.jsx";

const COVER =
  "bg-[linear-gradient(135deg,#dbeafe_0%,#e0f2fe_45%,#ccfbf1_100%)] dark:bg-[linear-gradient(135deg,#0f2a44_0%,#0b3a4a_100%)]";
const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");

const Sparkle = ({ className = "", size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 1c.6 5.4 3.6 9.4 11 11-7.4 1.6-10.4 5.6-11 11-.6-5.4-3.6-9.4-11-11 7.4-1.6 10.4-5.6 11-11z" />
  </svg>
);

function Stat({ value, label }) {
  return (
    <div className="min-w-0 px-1 text-center">
      <p className="truncate text-[20px] font-bold leading-7 text-slate-900 dark:text-white">{value}</p>
      <p className="text-[12.5px] text-slate-500">{label}</p>
    </div>
  );
}

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const [data, setData] = useState(undefined); // undefined = đang tải, null = không có

  useEffect(() => {
    if (!userId) return;
    if (session?.user?.id === userId) {
      navigate("/profile", { replace: true, state: { screen: "profile" } });
      return;
    }
    let alive = true;
    (async () => {
      const { data: d, error } = await supabase.rpc("get_public_profile", { p_user_id: userId });
      if (alive) setData(error ? null : d);
    })();
    return () => {
      alive = false;
    };
  }, [userId, session?.user?.id, navigate]);

  const back = () => (window.history.length > 1 ? navigate(-1) : navigate("/leaderboard"));

  // Lấy chữ cái đầu tiên của tên để làm avatar fallback
  const getInitial = (name) => {
    if (!name) return "?";
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#eef2f9] pb-10 dark:bg-slate-950">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-[#eef2f9]/95 px-4 pb-3 pt-4 backdrop-blur dark:bg-slate-950/95">
        <button
          onClick={back}
          aria-label="Quay lại"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[19px] font-bold text-slate-900 dark:text-white">Trang cá nhân</h1>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 md:max-w-3xl">
        {data === undefined && <div className="h-80 animate-pulse rounded-2xl bg-white dark:bg-slate-900" />}

        {data === null && (
          <div className="rounded-2xl bg-white px-6 py-12 text-center dark:bg-slate-900">
            <p className="text-[18px] font-bold text-slate-900 dark:text-white">Không tìm thấy người dùng</p>
            <p className="mt-1 text-[14px] text-slate-500">Tài khoản này không tồn tại hoặc không còn hiển thị.</p>
            <button onClick={back} className="mt-5 rounded-xl bg-accent-500 px-6 py-3 text-[15px] font-semibold text-white">
              Quay lại
            </button>
          </div>
        )}

        {data && (
          <>
            <section className="rounded-2xl bg-white p-3 shadow-sm dark:bg-slate-900">
              <div className={`relative h-32 overflow-hidden rounded-xl ${COVER}`}>
                <Sparkle className="absolute left-5 top-4 text-white/80" size={26} />
                <Sparkle className="absolute right-6 top-8 text-white/70" size={38} />
                <Sparkle className="absolute bottom-3 right-24 text-white/60" size={18} />
              </div>

              <div className="px-2 pb-1">
                <div className="-mt-12 w-fit">
                  {/* Kiểm tra nếu có avatar_url thì hiện ảnh, không thì hiện chữ */}
                  {data.avatar_url ? (
                    <LbAvatar
                      src={data.avatar_url}
                      name={data.name}
                      size="h-[96px] w-[96px]"
                      text="text-4xl"
                      ring="ring-4 ring-white dark:ring-slate-900"
                    />
                  ) : (
                    <div className="flex h-[96px] w-[96px] items-center justify-center rounded-full bg-[#e2e8f0] text-4xl font-bold text-slate-600 ring-4 ring-white dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-900">
                      {getInitial(data.name)}
                    </div>
                  )}
                </div>
                <h2 className="mt-3 truncate text-[22px] font-bold text-slate-900 dark:text-white">{data.name}</h2>
                <p className="mt-0.5 text-[14px] text-slate-500">
                  Tham gia từ {new Date(data.joined_at).toLocaleDateString("vi-VN")}
                </p>

                <div className="mt-4 grid grid-cols-4 divide-x divide-slate-100 dark:divide-slate-800">
                  <Stat value={`Lv.${data.level || 1}`} label="Cấp độ" />
                  <Stat value={data.streak_days || 0} label="Chuỗi ngày" />
                  <Stat value={fmt(data.tasks_done)} label="Nhiệm vụ" />
                  <Stat value={fmt(data.earned_week)} label="Coin tuần" />
                </div>
              </div>
            </section>

            <div className="-mt-2">
              <Group title="Thành tích">
                <Row icon={Coins} title="Coin kiếm tuần này" sub={`${fmt(data.earned_week)} Coin trong 7 ngày gần nhất`} />
                <Row icon={Coins} title="Coin kiếm tháng này" sub={`${fmt(data.earned_month)} Coin trong 30 ngày gần nhất`} />
                <Row icon={Calendar} title="Thành viên từ" sub={new Date(data.joined_at).toLocaleDateString("vi-VN")} />
              </Group>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
