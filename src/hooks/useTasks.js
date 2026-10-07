import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabaseClient.js";

// Mỗi lượt hồi lại sau 24 giờ kể từ lúc hoàn thành (khớp với máy chủ)
const WINDOW_MS = 24 * 60 * 60 * 1000;

export default function useTasks(userId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedToday, setCompletedToday] = useState(0);
  const hasLoadedOnce = useRef(false);

  const reload = useCallback(async () => {
    const isFirstLoad = !hasLoadedOnce.current;
    if (isFirstLoad) setLoading(true);

    try {
      const { data: taskRows, error: taskErr } = await supabase
        .from("tasks")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });

      if (taskErr) throw taskErr;

      // Nếu DB chưa có nhiệm vụ nào, hiện dữ liệu mẫu
      if (!taskRows || taskRows.length === 0) {
        setTasks([]);
        setCompletedToday(0);
        return;
      }

      const timesMap = {}; // task_id -> [thời điểm hoàn thành, tăng dần]
      let completed = 0;

      if (userId) {
        const since = Date.now() - WINDOW_MS;

        // 1 lần lấy toàn bộ lịch sử: dùng cho cả streak và cửa sổ 24 giờ
        const { data: allCompletions, error: allErr } = await supabase
          .from("task_completions")
          .select("task_id, completed_at")
          .eq("user_id", userId)
          .order("completed_at", { ascending: false });

        if (allErr) console.error("completions error:", allErr);

        const list = allCompletions || [];

        // Các lượt trong 24 giờ qua
        list
          .filter((c) => new Date(c.completed_at).getTime() >= since)
          .reverse() // tăng dần
          .forEach((c) => {
            (timesMap[c.task_id] = timesMap[c.task_id] || []).push(c.completed_at);
            completed += 1;
          });

        // Tính streak (chuỗi ngày liên tiếp)
        const uniqueDays = new Set(
          list.map((c) => new Date(c.completed_at).toDateString())
        );

        let streak = 0;
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        // Nếu hôm nay CHƯA làm, bắt đầu kiểm tra từ hôm qua
        if (!uniqueDays.has(currentDate.toDateString())) {
          currentDate.setDate(currentDate.getDate() - 1);
        }
        while (uniqueDays.has(currentDate.toDateString())) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        }

        // Tự động cập nhật streak vào database (nếu có thay đổi)
        const { data: profileData } = await supabase
          .from("profiles")
          .select("streak_days, streak_record")
          .eq("id", userId)
          .single();

        if (
          profileData &&
          (streak !== profileData.streak_days ||
            streak > profileData.streak_record)
        ) {
          await supabase
            .from("profiles")
            .update({
              streak_days: streak,
              streak_record: Math.max(streak, profileData.streak_record || 0),
            })
            .eq("id", userId);
        }
      }

      const mapped = taskRows.map((t) => {
        const times = timesMap[t.id] || [];
        const done = times.length;
        const remaining = Math.max(0, t.daily_limit - done);

        // Khi hết lượt: lượt sớm nhất sẽ hồi sau 24 giờ kể từ lúc hoàn thành
        let nextRefillAt = null;
        if (t.daily_limit > 0 && done >= t.daily_limit) {
          nextRefillAt = new Date(
            new Date(times[done - t.daily_limit]).getTime() + WINDOW_MS
          ).toISOString();
        }

        return {
          ...t,
          completedToday: done, // = số lượt trong 24 giờ qua
          remainingToday: remaining,
          nextRefillAt,
        };
      });

      setTasks(mapped);
      setCompletedToday(completed);
    } catch (err) {
      console.error("❌ useTasks error:", err);
    } finally {
      if (isFirstLoad) {
        setLoading(false);
        hasLoadedOnce.current = true;
      }
    }
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { tasks, loading, completedToday, reload };
            }
