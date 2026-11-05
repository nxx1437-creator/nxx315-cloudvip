import React, { useEffect, useState, useCallback } from "react";
import { CalendarDays, Gift, Check, Lock, Loader2, ChevronDown } from "lucide-react";
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
    next: (n, r) => `Còn ${n} nhiệm vụ nữa để nhận +${r} xu`,
    allClaimed: "Bạn đã nhận hết thưởng tháng này 🎉",
    reached: (n) => `Đạt mốc ${n} nhiệm vụ`,
    showMore: "Xem chi tiết các mốc",
    showLess: "Thu gọn",
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
    next: (n, r) => `${n} more tasks to earn +${r} coins`,
    allClaimed: "You've claimed every reward this month 🎉",
    reached: (n) => `Reached ${n} tasks`,
    showMore: "See all milestones",
    showLess: "Collapse",
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

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");

export default function MonthlyMissions() {
  const { lang } = useI18n();
  const s = TXT[lang] || TXT.vi;

  const [data, setData] = useState(null);
  const [claiming, setClaiming] = useState(null);
  const [msg, setMsg] = useState(null);
  const [open, setOpen] = useState(false);

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
      setMsg({ ok: true, text: s.success(fmt(res.coins)) });
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

  const nextTier = tiers.find((tr) => done < tr.need);
  const claimable = tiers.filter((tr) => done >= tr.need && !claimed.includes(tr.tier));
  const allClaimed = tiers.every((tr) => claimed.includes(tr.tier));

  const ClaimBtn = ({ tier }) => (
    <button
      onClick={() => claim(tier)}
      disabled={claiming !== null}
      className="flex min-w-[64px] items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm disabled:opacity-60"
    >
      {claiming === tier ? <Loader2 size={14} className="animate-spin" /> : s.claim}
    </button>
  );

  return (
    <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-sky-50 p-3.5">
      {/* Hàng đầu: bấm để mở/thu chi tiết */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 text-left"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 text-white">
          <CalendarDays size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold leading-5 text-slate-900">{s.title}</span>
          <span className="block truncate text-xs text-slate-500">
            {s.done}: {done}/{maxNeed} {s.tasks}
          </span>
        </span>
        {daysLeft !== null && (
          <span className="shrink-0 rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
            {s.daysLeft(daysLeft)}
          </span>
        )}
        <ChevronDown
          size={18}
          className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Thanh tiến độ có cột mốc */}
      <div className="relative mx-2 mt-4 h-[54px]">
        <div className="absolute inset-x-0 top-[9px] h-2 overflow-hidden rounded-full bg-white ring-1 ring-violet-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-400 to-blue-600 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        {tiers.map((tr) => {
          const pos = (tr.need / maxNeed) * 100;
          const isClaimed = claimed.includes(tr.tier);
          const reached = done >= tr.need;
          const isLast = pos >= 99.9;
          return (
            <React.Fragment key={tr.tier}>
              <span
                className={`absolute top-[3px] flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                  isClaimed
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : reached
                    ? "border-amber-400 bg-amber-400 text-white"
                    : "border-violet-200 bg-white text-transparent"
                }`}
                style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
              >
                {isClaimed ? <Check size={11} strokeWidth={3.5} /> : reached ? <Gift size={11} /> : null}
              </span>
              <span
                className="absolute top-[28px] text-center leading-tight"
                style={isLast ? { right: 0 } : { left: `${pos}%`, transform: "translateX(-50%)" }}
              >
                <span className="block text-[11px] font-bold text-slate-600">{tr.need}</span>
                <span className="block whitespace-nowrap text-[10.5px] font-bold text-amber-600">
                  +{fmt(tr.reward)}
                </span>
              </span>
            </React.Fragment>
          );
        })}
      </div>

      {/* Mốc đã đạt, chưa nhận: nhận ngay không cần mở rộng */}
      {claimable.map((tr) => (
        <div
          key={tr.tier}
          className="mt-2 flex items-center gap-3 rounded-xl bg-amber-50 px-3 py-2 ring-1 ring-amber-200"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Gift size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-slate-800">{s.reached(tr.need)}</p>
            <p className="text-xs font-bold text-amber-600">+{fmt(tr.reward)} xu</p>
          </div>
          <ClaimBtn tier={tr.tier} />
        </div>
      ))}

      {/* Gợi ý mốc kế tiếp */}
      {nextTier ? (
        <p className="mt-2 text-center text-[12.5px] font-medium text-slate-600">
          {s.next(nextTier.need - done, fmt(nextTier.reward))}
        </p>
      ) : allClaimed ? (
        <p className="mt-2 text-center text-[12.5px] font-medium text-emerald-600">{s.allClaimed}</p>
      ) : null}

      {/* Chi tiết các mốc (thu gọn mặc định) */}
      {open && (
        <div className="mt-3 space-y-1.5 border-t border-violet-100 pt-3">
          {tiers.map((tr) => {
            const isClaimed = claimed.includes(tr.tier);
            const reached = done >= tr.need;
            return (
              <div
                key={tr.tier}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isClaimed
                      ? "bg-emerald-100 text-emerald-600"
                      : reached
                      ? "bg-amber-100 text-amber-600"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isClaimed ? (
                    <Check size={16} strokeWidth={3} />
                  ) : reached ? (
                    <Gift size={16} />
                  ) : (
                    <Lock size={14} />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-slate-800">
                    {s.need} {tr.need} {s.tasks}
                  </p>
                  <p className="text-xs font-bold text-amber-600">+{fmt(tr.reward)} xu</p>
                </div>

                {isClaimed ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                    {s.claimed}
                  </span>
                ) : reached ? (
                  <ClaimBtn tier={tr.tier} />
                ) : (
                  <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-400">
                    {Math.min(done, tr.need)}/{tr.need}
                  </span>
                )}
              </div>
            );
          })}
          <p className="pt-1 text-center text-[11.5px] text-slate-400">{s.sub}</p>
        </div>
      )}

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
              
