import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabaseClient.js";

/**
 * useTasks — loads active tasks + how many times the current user
 * has completed each one today. Tự động tải lại khi quay lại tab.
 */
export default function useTasks(userId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedOnce = useRef(false);

  const reload = useCallback(async () => {
    const isFirstLoad = !hasLoadedOnce.current;
    if (isFirstLoad) {
      setLoading(true);
    }
    try {
      const { data: taskRows } = await supabase
        .from("tasks")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });

      if (!taskRows) {
        setTasks([]);
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

  return { tasks, loading, reload };
  }
