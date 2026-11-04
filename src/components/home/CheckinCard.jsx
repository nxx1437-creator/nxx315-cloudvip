import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import { useI18n } from "../../i18n/index.js";
import { Panel } from "./HomeUI.jsx";

// Thưởng theo ngày trong chuỗi (khớp hàm claim_daily_checkin trong database)
const REWARDS = [100, 150, 200, 300, 400, 500, 1000];

const vnDate = (offsetDays = 0) =>
  new Date(Date.now() + offsetDays * 86400000).toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

export default function CheckinCard({ userId, onClaimed }) {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const en = lang === "en";
  const [info, setInfo] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [needTask, setNeedTask] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    supabase
      .from("coin_checkins")
      .select("streak, last_date")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (alive) setInfo(data || { streak: 0, last_date: null });
      });
    return () => {
      alive = false;
    };
  }, [userId]);

  if (!userId || !info) return null;

  const today = vnDate(0);
  const doneToday = info.last_date === today;
  const alive = doneToday || info.last_date === vnDate(-1);
  const streak = alive ? info.streak || 0 : 0;
  // Đủ 7 ngày mà chưa điểm danh hôm nay -> bắt đầu chuỗi mới
  const filled = !doneToday && streak >= 7 ? 0 : streak;
  const nextReward = REWARDS[filled % 7];

  const claim = async () => {
    if (busy || doneToday) return;
    setBusy(true);
    setMsg("");
    setNeedTask(false);
    try {
      const { data, error } = await supabase.rpc("claim_daily_checkin");
      if (error) throw error;
      if (data?.success) {
        setInfo({ streak: data.streak, last_date: today });
        setMsg(`+${data.reward} ${en ? "coins" : "xu"}`);
        if (onClaimed) onClaimed(data.reward);
      } else if (data?.need_task) {
        setNeedTask(true);
        setMsg(
          en
            ? "Complete at least 1 task today to check in."
            : "Hoàn thành ít nhất 1 nhiệm vụ hôm nay để điểm danh."
        );
      } else {
        setMsg(data?.message || (en ? "Could not check in" : "Chưa điểm danh được"));
      }
    } catch (e) {
      setMsg(en ? "Error, please try again" : "Có lỗi, thử lại nhé");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel
      title={en ? "Daily check-in" : "Điểm danh hằng ngày"}
      right={<span className="text-xs tabular-nums text-[#6F6F6F]">{filled}/7</span>}
    >
      <div className="grid grid-cols-7 gap-1.5">
        {REWARDS.map((r, i) => {
          const done = i < filled;
          return (
            <div
              key={i}
              className={`flex flex-col items-center rounded-md border py-1.5 text-[10px] tabular-nums ${
                done
                  ? "border-[#24B47E] bg-[#3ECF8E]/15 text-[#0F7A4D]"
                  : "border-[#E6E6E6] bg-white text-[#6F6F6F]"
              }`}
            >
              {done ? <Check size={12} /> : <span>{r}</span>}
              <span className="mt-0.5 text-[9px] text-[#9A9A9A]">
                {en ? `D${i + 1}` : `N${i + 1}`}
              </span>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={claim}
        disabled={busy || doneToday}
        className={`mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-md border text-[13px] font-medium transition active:scale-[0.98] ${
          doneToday
            ? "border-[#E6E6E6] bg-[#F4F4F4] text-[#9A9A9A]"
            : "border-[#24B47E] bg-[#3ECF8E] text-[#0B1F17]"
        }`}
      >
        {busy && <Loader2 size={14} className="animate-spin" />}
        {doneToday
          ? en
            ? "Checked in today"
            : "Đã điểm danh hôm nay"
          : en
          ? `Check in +${nextReward} coins`
          : `Điểm danh +${nextReward} xu`}
      </button>

      {msg && (
        <p
          className={`mt-2 text-center text-xs ${
            needTask ? "text-amber-700" : "text-[#0F7A4D]"
          }`}
        >
          {msg}
        </p>
      )}

      {needTask && (
        <button
          type="button"
          onClick={() => navigate("/tasks")}
          className="mt-2 flex h-9 w-full items-center justify-center rounded-md border border-[#D4D4D4] bg-white text-[13px] font-medium text-[#171717] transition active:bg-[#F4F4F4]"
        >
          {en ? "Go to tasks" : "Đi làm nhiệm vụ"}
        </button>
      )}
    </Panel>
  );
        }
