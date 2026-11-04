import React, { useEffect, useState, useCallback } from "react";
import { CalendarDays, Gift, Check, Lock, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import { useI18n } from "../../i18n/index.js";

const TXT = {
  vi: {
    title: "Nhiệm vụ tháng",
    sub: "Hoàn thành nhiệm vụ trong tháng để nhận thưởng",
    daysLeft: (n) => `Còn ${n} ngày`,
    done: "Đã làm",
    tasks: "nhiệm vụ",
    claim: "Nhận",
    claimed: "Đã nhận",
    locked: "Chưa đạt",
    need: "Làm",
    success: (c) => `Nhận thành công +${c} xu!`,
    error: "Có lỗi xảy ra, vui lòng thử lại.",
  },
  en: {
    title: "Monthly missions",
    sub: "Complete tasks this month to earn rewards",
    daysLeft: (n) => `${n} days left`,
    done: "Done",
    tasks: "tasks",
    claim: "Claim",
    claimed: "Claimed",
    locked: "Locked",
    need: "Do",
    success: (c) => `Claimed +${c} coins!`,
    error: "Something went wrong, please try again.",
  },
};

const getDaysLeft = () => {
  try {
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
    );
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return last - now.getDate() + 1;
  } catch {
    return null;
  }
};

export default function MonthlyMissions() {
  const { lang } = useI18n();
  const s = TXT[lang] || TXT.vi;

  const [data, setData] = useState(null);
  const [claiming, setClaiming] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    const { data: res, error } = await supabase.rpc("get_monthly_mission");
    if (!error && res?.ok) setData(res);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const claim = async (tier) => {
    if (claiming) return;
    setClaiming(tier);
    setMsg(null);
    const { data: res, error } = await supabase.rpc("claim_monthly_mission", {
      p_tier: tier,
    });
    setClaiming(null);
    if (error || !res) {
      setMsg({ ok: false, text: s.error });
      return;
    }
    if (res.ok) {
      setMsg({
        ok: true,
        text: s.success(Number(res.coins).toLocaleString("vi-VN")),
      });
    } else {
      setMsg({ ok: false, text: res.message || s.error });
    }
    load();
  };

  if (!data || !data.tiers?.length) return null;

  const { done, tiers, claimed } = data;
  const maxNeed = tiers[tiers.length - 1].need;
  const pct = Math.min(100, Math.round((done / maxNeed) * 100));
  const daysLeft = getDaysLeft();

  return (
    <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-sky-50 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 text-white">
          <CalendarDays size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-slate-900">{s.title}</h2>
          <p className="text-xs text-slate-500">{s.sub}</p>
        </div>
        {daysLeft !== null && (
          <span className="shrink-0 rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
            {s.daysLeft(daysLeft)}
          </span>
        )}
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-600">
            {s.done}: {done}/{maxNeed} {s.tasks}
          </span>
          <span className="text-slate-400">{pct}%</span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-400 to-blue-600 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {tiers.map((tr) => {
          const isClaimed = claimed.includes(tr.tier);
          const reached = done >= tr.need;
          return (
            <div
              key={tr.tier}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  isClaimed
                    ? "bg-emerald-100 text-emerald-600"
                    : reached
                    ? "bg-amber-100 text-amber-600"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {isClaimed ? (
                  <Check size={17} strokeWidth={3} />
                ) : reached ? (
                  <Gift size={17} />
                ) : (
                  <Lock size={15} />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  {s.need} {tr.need} {s.tasks}
                </p>
                <p className="text-xs font-bold text-amber-600">
                  +{Number(tr.reward).toLocaleString("vi-VN")} xu
                </p>
              </div>

              {isClaimed ? (
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                  {s.claimed}
                </span>
              ) : reached ? (
                <button
                  onClick={() => claim(tr.tier)}
                  disabled={claiming !== null}
                  className="flex min-w-[64px] items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm disabled:opacity-60"
                >
                  {claiming === tr.tier ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    s.claim
                  )}
                </button>
              ) : (
                <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-400">
                  {Math.min(done, tr.need)}/{tr.need}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {msg && (
        <p
          className={`mt-3 rounded-xl px-3 py-2 text-xs font-semibold ${
            msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"
          }`}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
    }
