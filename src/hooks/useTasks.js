import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { vnStartOfDay } from "../lib/taskHelpers.js";

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
        setTasks([
          { id: "demo-1", title: "Làm 1 nhiệm vụ", provider: "Demo", reward_coins: 50, daily_limit: 1, completedToday: 1, remainingToday: 0 },
          { id: "demo-2", title: "Làm 5 nhiệm vụ", provider: "Demo", reward_coins: 200, daily_limit: 5, completedToday: 3, remainingToday: 2 },
          { id: "demo-3", title: "Làm 10 nhiệm vụ", provider: "Demo", reward_coins: 400, daily_limit: 10, completedToday: 8, remainingToday: 2 },
        ]);
        setCompletedToday(3);
        return; // finally vẫn chạy
      }

      let doneMap = {};
      let completed = 0;

      if (userId) {
        // 0:00 theo giờ Việt Nam (khớp với máy chủ)
        const startOfDay = vnStartOfDay();

        // Lấy toàn bộ lịch sử hoàn thành nhiệm vụ (KHÔNG giới hạn ngày) để tính streak
        const { data: allCompletions, error: allErr } = await supabase
          .from("task_completions")
          .select("completed_at")
          .eq("user_id", userId)
          .order("completed_at", { ascending: false });

        if (allErr) console.error("allCompletions error:", allErr);

        // Tính số lượng hoàn thành hôm nay
        const todayCompletions = (allCompletions || []).filter(
          (c) => new Date(c.completed_at) >= startOfDay
        );
        completed = todayCompletions.length;

        // Tính streak (chuỗi ngày liên tiếp)
        const uniqueDays = new Set(
          (allCompletions || []).map((c) => new Date(c.completed_at).toDateString())
        );

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        // Nếu hôm nay CHƯA làm, bắt đầu kiểm tra từ hôm qua
        if (!uniqueDays.has(currentDate.toDateString())) {
          currentDate.setDate(currentDate.getDate() - 1);
        }

        // Đếm số ngày liên tiếp có hoàn thành nhiệm vụ
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

        if (profileData) {
          if (streak !== profileData.streak_days || streak > profileData.streak_record) {
            await supabase
              .from("profiles")
              .update({
                streak_days: streak,
                streak_record: Math.max(streak, profileData.streak_record || 0),
              })
              .eq("id", userId);
          }
        }

        // Lấy dữ liệu task theo ngày hôm nay
        const { data: completions, error: compErr } = await supabase
          .from("task_completions")
          .select("task_id")
          .eq("user_id", userId)
          .gte("completed_at", startOfDay.toISOString());

        if (compErr) console.error("completions error:", compErr);

        doneMap = (completions || []).reduce((acc, c) => {
          acc[c.task_id] = (acc[c.task_id] || 0) + 1;
          return acc;
        }, {});
      }

      const mapped = taskRows.map((t) => ({
        ...t,
        completedToday: doneMap[t.id] || 0,
        remainingToday: Math.max(0, t.daily_limit - (doneMap[t.id] || 0)),
      }));

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

  // Tải lần đầu. Việc tải lại khi quay về tab do trang Tasks.jsx lo (có giới hạn tần suất)
  useEffect(() => {
    reload();
  }, [reload]);

  return { tasks, loading, completedToday, reload };
}
