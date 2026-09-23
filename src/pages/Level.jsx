import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Crown, Trophy } from "lucide-react";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { LevelBadge, LevelProgress } from "../components/LevelBadge.jsx";
import { supabase } from "../lib/supabaseClient.js";
import useSession from "../hooks/useSession.js";

export default function Level() {
  const navigate = useNavigate();
  const { session } = useSession();
  const user = session?.user;

  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState(null);
  const [allLevels, setAllLevels] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      setLoading(true);
      try {
        const [levelRes, configRes] = await Promise.all([
          supabase.rpc("get_user_level", { p_user_id: user.id }),
          supabase.rpc("get_level_config"),
        ]);

        if (levelRes.data) setUserLevel(levelRes.data);
        if (configRes.data) setAllLevels(configRes.data);
      } catch (err) {
        console.error("Load level error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24">
        <TopHeader />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <TopHeader />

      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center"
        >
          <ArrowLeft size={22} strokeWidth={2} className="text-slate-900" />
        </button>
        <h1 className="flex-1 text-[17px] font-black tracking-tight text-slate-900">
          Cấp độ & Ưu đãi
        </h1>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-4">
        {/* Card Level hiện tại */}
        {userLevel && (
          <div
            className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${userLevel.color}, ${userLevel.color}CC)`,
            }}
          >
            <div className="pointer-events-none absolute -right-8 -top-8 text-8xl opacity-20">
              {userLevel.level >= 10 ? "👑" : userLevel.level >= 5 ? "⭐" : "✨"}
            </div>

            <div className="relative flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-2 ring-white/40">
                <Crown size={32} strokeWidth={2.4} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                  Cấp độ hiện tại
                </p>
                <p className="text-[26px] font-black leading-tight">
                  Level {userLevel.level}
                </p>
                <p className="text-[13px] font-bold text-white/90">
                  {userLevel.label}
                </p>
              </div>
            </div>

            <div className="relative mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm">
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-white/80">
                  Ưu đãi Shop
                </p>
                <p className="mt-1 text-[20px] font-black">
                  -{userLevel.shop_discount}%
                </p>
              </div>
              <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm">
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-white/80">
                  Bonus Task
                </p>
                <p className="mt-1 text-[20px] font-black">
                  +{userLevel.task_bonus}%
                </p>
              </div>
            </div>

            <div className="relative mt-3 rounded-xl bg-white/15 p-3 backdrop-blur-sm">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-white/80">
                Tổng coin đã kiếm
              </p>
              <p className="mt-1 text-[22px] font-black">
                {Number(userLevel.lifetime_coins || 0).toLocaleString("vi-VN")}
                <span className="ml-1 text-[13px] font-bold text-white/80">
                  coin
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Progress đến level tiếp */}
        {userLevel && (
          <div className="mt-4">
            <h2 className="mb-2 text-[14px] font-black text-slate-900">
              Tiến độ lên cấp
            </h2>
            <LevelProgress
              level={userLevel.level}
              lifetimeCoins={userLevel.lifetime_coins}
              nextLevel={userLevel.next_level}
              color={userLevel.color}
            />
          </div>
        )}

        {/* Bảng tất cả level */}
        <div className="mt-6">
          <h2 className="mb-3 flex items-center gap-2 text-[14px] font-black text-slate-900">
            <Trophy size={16} className="text-amber-500" />
            Tất cả cấp độ
          </h2>

          <div className="space-y-2">
            {allLevels.map((lv) => {
              const isCurrent = lv.level === userLevel?.level;
              const isUnlocked = lv.level <= (userLevel?.level || 1);

              return (
                <div
                  key={lv.level}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-3.5 transition ${
                    isCurrent
                      ? "border-amber-300 bg-amber-50 shadow-md"
                      : isUnlocked
                      ? "border-slate-200 bg-white"
                      : "border-slate-100 bg-slate-50 opacity-70"
                  }`}
                >
                  {/* Level circle */}
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: lv.color }}
                  >
                    <span className="text-[16px] font-black">{lv.level}</span>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] font-black text-slate-900">
                        {lv.label}
                      </span>
                      {isCurrent && (
                        <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[9.5px] font-black text-white">
                          HIỆN TẠI
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11.5px] text-slate-500">
                      Cần{" "}
                      <b className="text-slate-700">
                        {Number(lv.coins_required).toLocaleString("vi-VN")}
                      </b>{" "}
                      coin
                    </p>
                  </div>

                  {/* Ưu đãi */}
                  <div className="shrink-0 space-y-0.5 text-right">
                    <p className="text-[11px] font-black text-emerald-600">
                      -{lv.shop_discount}% Shop
                    </p>
                    <p className="text-[11px] font-black text-sky-600">
                      +{lv.task_bonus}% Task
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pb-6" />
      </div>

      <BottomNav />
    </div>
  );
}
