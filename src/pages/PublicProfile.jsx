// src/pages/PublicProfile.jsx — trang cá nhân của người khác (từ bảng xếp hạng): /u/:userId
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Coins, TrendingUp } from "lucide-react";

import useSession from "../hooks/useSession.js";
import { supabase } from "../lib/supabaseClient.js";
import { getBadges } from "../lib/profileBadges.js";
import GhProfile, { GH_INK, GH_LINE } from "../components/profile/GhProfile.jsx";

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");

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
  }, [userId, session?.user?.id]);

  const back = () => (window.history.length > 1 ? navigate(-1) : navigate("/leaderboard"));

  return (
    <div className="min-h-screen bg-white pb-10 dark:bg-[#0d1117]">
      <header className={`sticky top-0 z-20 flex items-center gap-1 border-b bg-white/95 px-2 py-2 backdrop-blur dark:bg-[#0d1117]/95 ${GH_LINE}`}>
        <button
          onClick={back}
          aria-label="Quay lại"
          className={`flex h-10 w-10 items-center justify-center rounded-full ${GH_INK}`}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className={`text-[16px] font-semibold ${GH_INK}`}>Trang cá nhân</h1>
      </header>

      <main className="mx-auto max-w-md md:max-w-3xl">
        {data === undefined && <div className="m-4 h-80 animate-pulse rounded-lg bg-[#eaeef2] dark:bg-[#161b22]" />}

        {data === null && (
          <div className="px-6 py-16 text-center">
            <p className={`text-[18px] font-semibold ${GH_INK}`}>Không tìm thấy người dùng</p>
            <p className="mt-1 text-[14px] text-slate-500">Tài khoản này không tồn tại hoặc không còn hiển thị.</p>
            <button onClick={back} className="mt-5 rounded-md bg-accent-500 px-6 py-2.5 text-[14px] font-semibold text-white">
              Quay lại
            </button>
          </div>
        )}

        {data && (
          <GhProfile
            cover={data.cover_url}
            avatarUrl={data.avatar_url}
            initial={(data.name || "T").charAt(0).toUpperCase()}
            name={data.name}
            verified={data.is_verified === true}
            stats={[
              { value: `Lv.${data.level || 1}`, label: "cấp độ" },
              { value: data.streak_days || 0, label: "chuỗi ngày" },
              { value: fmt(data.tasks_done), label: "nhiệm vụ" },
            ]}
            meta={[
              { Icon: Calendar, text: `Tham gia ${new Date(data.joined_at).toLocaleDateString("vi-VN")}` },
              { Icon: Coins, text: `Kiếm ${fmt(data.earned_week)} coin trong 7 ngày` },
              { Icon: Coins, text: `Kiếm ${fmt(data.earned_month)} coin trong 30 ngày` },
              { Icon: TrendingUp, text: `Kiếm ${fmt(data.earned_week)} coin trong 7 ngày` },
            ]}
            badges={getBadges(data).filter((b) => b.earned)}
          />
        )}
      </main>
    </div>
  );
            }

