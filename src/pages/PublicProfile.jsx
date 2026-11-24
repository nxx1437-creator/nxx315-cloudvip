// src/pages/PublicProfile.jsx — trang cá nhân của người khác: /u/:userId
// danh sách theo dõi mở bằng /u/:userId?list=followers | following (giống GitHub: hồ sơ ở trên, danh sách ở dưới)
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Calendar, Coins, TrendingUp } from "lucide-react";

import useSession from "../hooks/useSession.js";
import { supabase } from "../lib/supabaseClient.js";
import { getBadges } from "../lib/profileBadges.js";
import TopHeader from "../components/TopHeader.jsx";
import FollowList, { FollowCounts } from "../components/profile/FollowList.jsx";
import GhProfile, { BadgeList, GH_BTN, GH_INK, GH_LINE, GhTabs, StatList, statItems } from "../components/profile/GhProfile.jsx";

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");

export default function PublicProfile() {
  const { userId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const rawList = searchParams.get("list");
  const list = rawList === "followers" || rawList === "following" ? rawList : null;
  const inList = !!list;

  const [data, setData] = useState(undefined); // undefined = đang tải, null = không có
  const [tab, setTab] = useState("overview");
  // null = chưa tải được / server chưa hỗ trợ theo dõi (khi đó ẩn nút, không làm hỏng trang)
  const [follow, setFollow] = useState(null);
  const [followBusy, setFollowBusy] = useState(false);

  useEffect(() => {
    if (!userId) return;
    // trang của chính mình thì chuyển sang /profile; riêng danh sách theo dõi của mình thì vẫn mở ở đây
    if (session?.user?.id === userId && !inList) {
      navigate("/profile", { replace: true, state: { screen: "profile" } });
      return;
    }
    let alive = true;
    setTab("overview");
    setFollow(null);
    (async () => {
      const [prof, fol] = await Promise.all([
        supabase.rpc("get_public_profile", { p_user_id: userId }),
        supabase.rpc("get_follow_info", { p_user_id: userId }),
      ]);
      if (!alive) return;
      setData(prof.error ? null : prof.data);
      setFollow(fol.error || !fol.data ? null : fol.data);
    })();
    return () => {
      alive = false;
    };
  }, [userId, session?.user?.id]);

  // Theo dõi / Bỏ theo dõi: đổi ngay, không hiệu ứng; lỗi thì trả về như cũ.
  // Gọi theo kiểu "đặt thành" (không phải đảo) nên bấm nhanh nhiều lần cũng không bị lệch.
  const applyFollow = async (want) => {
    if (!follow || followBusy || !!follow.is_following === want) return;
    const prev = follow;
    setFollowBusy(true);
    setFollow({
      ...prev,
      is_following: want,
      followers: Math.max(0, Number(prev.followers || 0) + (want ? 1 : -1)),
    });
    const { data: r, error } = await supabase.rpc("set_follow", { p_user_id: userId, p_follow: want });
    if (error || !r) setFollow(prev);
    else setFollow((cur) => ({ ...cur, is_following: r.is_following, followers: r.followers }));
    setFollowBusy(false);
  };

  const openList = (kind) => setSearchParams({ list: kind });
  const back = () => {
    if (inList) return navigate(`/u/${userId}`, { replace: true });
    return window.history.length > 1 ? navigate(-1) : navigate("/leaderboard");
  };

  const badges = data ? getBadges(data).filter((b) => b.earned) : [];
  const tabs = [
    { id: "overview", label: "Tổng quan" },
    { id: "badges", label: "Huy hiệu", count: badges.length },
    { id: "stats", label: "Thống kê" },
  ];
  const listTabs = [
    { id: "followers", label: "Người theo dõi" },
    { id: "following", label: "Đang theo dõi" },
  ];

  // khung hồ sơ (dùng chung cho trang chính và đầu trang danh sách)
  const overview = data && (
    <GhProfile
      cover={data.cover_url}
      avatarUrl={data.avatar_url}
      initial={(data.name || "T").charAt(0).toUpperCase()}
      name={data.name}
      verified={data.is_verified === true}
      actions={
        follow && (
          <div className="space-y-3">
            <FollowCounts followers={follow.followers} following={follow.following} onOpen={openList} />
            <button
              type="button"
              onClick={() => applyFollow(!follow.is_following)}
              disabled={followBusy}
              className={`${GH_BTN} w-full !transition-none active:!scale-100`}
            >
              {follow.is_following ? "Bỏ theo dõi" : "Theo dõi"}
            </button>
          </div>
        )
      }
      stats={[
        { value: `Lv.${data.level || 1}`, label: "cấp độ" },
        { value: data.streak_days || 0, label: "chuỗi ngày" },
        { value: fmt(data.tasks_done), label: "nhiệm vụ" },
      ]}
      meta={[
        { Icon: Calendar, text: `Tham gia ${new Date(data.joined_at).toLocaleDateString("vi-VN")}` },
        { Icon: TrendingUp, text: `Kiếm ${fmt(data.earned_week)} coin trong 7 ngày` },
        { Icon: Coins, text: `Kiếm ${fmt(data.earned_month)} coin trong 30 ngày` },
      ]}
      badges={badges}
    />
  );

  return (
    <div className="min-h-screen bg-white pb-10 dark:bg-[#0d1117]">
      <TopHeader variant="gh" />

      {/* hàng tab luôn hiện (kể cả lúc đang tải / không tìm thấy) nên nút quay lại không bao giờ mất */}
      <div className="sticky top-[64px] z-20 bg-white/95 backdrop-blur dark:bg-[#0d1117]/95">
        <GhTabs
          tabs={inList ? listTabs : data ? tabs : []}
          value={inList ? list : tab}
          onChange={inList ? (id) => setSearchParams({ list: id }, { replace: true }) : setTab}
          leading={
            <button
              onClick={back}
              aria-label="Quay lại"
              className={`flex w-12 shrink-0 items-center justify-center py-3 ${GH_INK}`}
            >
              <ArrowLeft size={20} />
            </button>
          }
        />
      </div>

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

        {/* TRANG DANH SÁCH: hồ sơ ở trên, danh sách (hoặc thông báo trống) ở dưới */}
        {inList && data && (
          <>
            {overview}
            <div className={`border-t ${GH_LINE}`}>
              <FollowList
                key={`${userId}-${list}`}
                userId={userId}
                kind={list}
                meId={session?.user?.id}
                ownerName={data.name}
              />
            </div>
          </>
        )}

        {!inList && data && tab === "overview" && overview}
        {!inList && data && tab === "badges" && <BadgeList badges={badges} />}
        {!inList && data && tab === "stats" && <StatList items={statItems(data)} />}
      </main>
    </div>
  );
}
