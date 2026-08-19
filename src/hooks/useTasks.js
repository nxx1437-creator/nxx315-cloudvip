import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient.js";

/**
 * useTasks — loads active tasks + how many times the current user
 * has completed each one today (for the "2 còn" / "Hôm nay 0/2" UI).
 */
export default function useTasks(userId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data: taskRows } = await supabase
      .from("tasks")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (!taskRows) {
      setTasks([]);
      setLoading(false);
      return;
    }

    let doneMap = {};
    if (userId) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const { data: completions } = await supabase
        .from("task_completions")
        .select("task_id")
        .eq("user_id", userId)
        .gte("completed_at", startOfDay.toISOString());

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
    setLoading(false);
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

  return { tasks, loading, reload };
}
