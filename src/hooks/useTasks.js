import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabaseClient.js";

export default function useTasks(userId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedToday, setCompletedToday] = useState(0);
  const hasLoadedOnce = useRef(false);

  const reload = useCallback(async () => {
    const isFirstLoad = !hasLoadedOnce.current;
    if (isFirstLoad) setLoading(true);

    try {
      const { data: taskRows } = await supabase
        .from("tasks")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });

      // Nếu DB chưa có nhiệm vụ nào, hiện dữ liệu mẫu để giao diện sống động
      if (!taskRows || taskRows.length === 0) {
        setTasks([
          { id: "demo-1", title: "Làm 1 nhiệm vụ", provider: "Demo", reward_coins: 50, daily_limit: 1, completedToday: 1, remainingToday: 0 },
          { id: "demo-2", title: "Làm 5 nhiệm vụ", provider: "Demo", reward_coins: 200, daily_limit: 5, completedToday: 3, remainingToday: 2 },
          { id: "demo-3", title: "Làm 10 nhiệm vụ", provider: "Demo", reward_coins: 400, daily_limit: 10, completedToday: 8, remainingToday: 2 },
        ]);
        setCompletedToday(3); // Hiện 3/5 đã làm
        return;
      }

      let doneMap = {};
      let completed = 0;
      if (userId) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const { data: completions } = await supabase
          .from("task_completions")
          .select("task_id")
          .eq("user_id", userId)
          .gte("completed_at", startOfDay.toISOString());

        completed = completions?.length || 0;
        doneMap = (completions || []).reduce((acc, c) => {
          acc[c.task_id] = (acc[c.task_id] || 0) + 1;
          return acc;
        }, {});
      }

      setTasks(
        taskRows.map((t) => ({
          ...t,
          completedToday: doneMap[t.id] || 0,
          remainingToday: Math.max(0, t.daily_limit - (doneMap[t.id] || 0)),
        }))
      );
      setCompletedToday(completed);
    } finally {
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
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") handleFocus();
    });
    return () => window.removeEventListener("focus", handleFocus);
  }, [reload]);

  return { tasks, loading, completedToday, reload };
}
