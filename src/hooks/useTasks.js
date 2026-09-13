import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabaseClient.js";

export default function useTasks(userId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedToday, setCompletedToday] = useState(0);
  const hasLoadedOnce = useRef(false);

  const reload = useCallback(async () => {
    console.log("🔥 reload chạy, userId =", userId);

    const isFirstLoad = !hasLoadedOnce.current;
    if (isFirstLoad) setLoading(true);

    try {
      const { data: taskRows, error: taskErr } = await supabase
        .from("tasks")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });

      console.log("📦 taskRows =", taskRows, "error =", taskErr);

      if (taskErr) throw taskErr;

      // Nếu DB chưa có nhiệm vụ nào, hiện dữ liệu mẫu
      if (!taskRows || taskRows.length === 0) {
        console.log("⚠️ Không có task active, dùng data demo");
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
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // Lấy toàn bộ lịch sử hoàn thành nhiệm vụ (KHÔNG giới hạn ngày) để tính streak
        const { data: allCompletions, error: allErr } = await supabase
          .from("task_completions")
          .select("completed_at")
          .eq("user_id", userId)
          .order("completed_at", { ascending: false });

        console.log("📜 allCompletions count =", allCompletions?.length, "error =", allErr);

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

        console.log("🔥 streak =", streak);

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

        console.log("✅ completions hôm nay =", completions, "error =", compErr);

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

      console.log("🎯 mapped tasks =", mapped);

      setTasks(mapped);
      setCompletedToday(completed);
    } catch (err) {
      console.error("❌ useTasks error:", err);
    } finally {
      console.log("✅ finally chạy, isFirstLoad =", isFirstLoad);
      if (isFirstLoad) {
        setLoading(false);
        hasLoadedOnce.current = true;
      }
    }
  }, [userId]);

  useEffect(() => {
    reload();

    const handleFocus = () => reload();
    window.addEventListener("focus", handleFocus);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") handleFocus();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [reload]);

  return { tasks, loading, completedToday, reload };
}
