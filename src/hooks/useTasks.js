import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient.js";

export default function useTasks(userId) {
  const [tasks, setTasks] = useState([]);
  const [completedToday, setCompletedToday] = useState({}); // { [task_id]: count }
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data: taskRows } = await supabase
      .from("tasks")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });
    setTasks(taskRows ?? []);

    if (userId) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const { data: completions } = await supabase
        .from("task_completions")
        .select("task_id")
        .eq("user_id", userId)
        .gte("completed_at", startOfDay.toISOString());

      const counts = {};
      (completions ?? []).forEach((c) => {
        counts[c.task_id] = (counts[c.task_id] ?? 0) + 1;
      });
      setCompletedToday(counts);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { tasks, completedToday, loading, refresh };
          }
