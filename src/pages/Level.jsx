import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { LevelCard } from "../components/LevelBadge.jsx";
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

      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center"
        >
          <ArrowLeft size={20} strokeWidth={2} className="text-slate-900" />
        </button>
        <h1 className="flex-1 text-[16px] font-bold tracking-tight text-slate-900">
          Cấp độ & Ưu đãi
        </h1>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-4">
        {/* Card level hiện tại */}
        {userLevel && <LevelCard userLevel={userLevel} />}

        {/* Bảng tất cả cấp độ */}
        <div className="mt-6">
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Tất cả cấp độ
          </h2>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            {allLevels.map((lv, idx) => {
              const isCurrent = lv.level === userLevel?.level;
              const isUnlocked = lv.level <= (userLevel?.level || 1);

              return (
                <div
                  key={lv.level}
                  className={`flex items-center gap-3 px-4 py-3.5 ${
                    idx > 0 ? "border-t border-slate-100" : ""
                  } ${isCurrent ? "bg-amber-50/50" : ""}`}
                >
                  {/* Level number */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white ${
                      !isUnlocked ? "opacity-40" : ""
                    }`}
                    style={{ backgroundColor: lv.color }}
                  >
                    <span className="text-[14px] font-bold leading-none">
                      {lv.level}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[14px] font-bold leading-tight ${
                          isUnlocked ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {lv.label}
                      </span>
                      {isCurrent && (
                        <span className="rounded-sm bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                          Hiện tại
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11.5px] text-slate-500">
                      {Number(lv.coins_required).toLocaleString("vi-VN")} coin
                    </p>
                  </div>

                  {/* Ưu đãi */}
                  <div className="shrink-0 text-right">
                    <p className="text-[12px] font-bold text-slate-900">
                      -{lv.shop_discount}%
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Shop
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[12px] font-bold text-slate-900">
                      +{lv.task_bonus}%
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Task
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
