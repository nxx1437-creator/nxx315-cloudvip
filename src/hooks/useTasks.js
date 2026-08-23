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

      if (!taskRows || taskRows.length === 0) {
        setTasks([
          { id: "demo-1", title: "Làm 1 nhiệm vụ", provider: "Demo", reward_coins: 50, daily_limit: 1, completedToday: 1, remainingToday: 0 },
          { id: "demo-2", title: "Làm 5 nhiệm vụ", provider: "Demo", reward_coins: 200, daily_limit: 5, completedToday: 3, remainingToday: 2 },
          { id: "demo-3", title: "Làm 10 nhiệm vụ", provider: "Demo", reward_coins: 400, daily_limit: 10, completedToday: 8, remainingToday: 2 },
        ]);
        setCompletedToday(3); 
        return;
      }

      let doneMap = {};
      let completed = 0;
      
      if (userId) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const { data: allCompletions } = await supabase
          .from("task_completions")
          .select("completed_at")
          .eq("user_id", userId)
          .order("completed_at", { ascending: false });

        const todayCompletions = (allCompletions || []).filter(c => 
          new Date(c.completed_at) >= startOfDay
        );
        completed = todayCompletions.length;

        const uniqueDays = new Set(
          (allCompletions || []).map(c => new Date(c.completed_at).toDateString())
        );
        
        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        
        if (!uniqueDays.has(currentDate.toDateString())) {
          currentDate.setDate(currentDate.getDate() - 1);
        }
        
        while (uniqueDays.has(currentDate.toDateString())) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        }

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
                streak_record: Math.max(streak, profileData.streak_record || 0) 
              })
              .eq("id", userId);
          }
        }

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

  // === LOGIC NHIỆM VỤ ===

  const startTask = async (taskId) => {
    const token = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    
    await supabase.from("task_sessions").insert({
      user_id: userId,
      task_id: taskId,
      token,
      expires_at: expiresAt,
      status: "pending"
    });

    // Gọi API từ Vercel
    const apiKey = import.meta.env.VITE_LINK4M_API_KEY;
    const callbackUrl = `${window.location.origin}/task/callback?token=${token}`;

    let generatedLink = "";
    try {
      const response = await fetch("https://api.link4m.io/api/v1/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          target_url: callbackUrl,
          domain: "link4m.io"
        })
      });

      const data = await response.json();
      
      if (response.ok && data.short_url) {
        generatedLink = data.short_url;
      } else {
        generatedLink = `TOKEN_CUA_BAN_LA: ${token}`;
      }
    } catch (error) {
      generatedLink = `TOKEN_CUA_BAN_LA: ${token}`;
    }

    return {
      token,
      expires_at: expiresAt,
      shortUrl: generatedLink
    };
  };

  const claimTask = async (token) => {
    const { data: session } = await supabase
      .from("task_sessions")
      .select("*")
      .eq("token", token)
      .single();

    if (!session) return { error: "Token không hợp lệ!" };
    if (session.user_id !== userId) return { error: "Token không thuộc về bạn!" };
    if (new Date(session.expires_at) < new Date()) return { error: "Token đã hết hạn!" };
    if (session.status === "used") return { error: "Token đã được sử dụng!" };

    const { data: task } = await supabase
      .from("tasks")
      .select("reward_coins")
      .eq("id", session.task_id)
      .single();

    const { data: profile } = await supabase
      .from("profiles")
      .select("coins")
      .eq("id", userId)
      .single();

    await supabase
      .from("profiles")
      .update({ coins: profile.coins + task.reward_coins })
      .eq("id", userId);

    await supabase
      .from("task_sessions")
      .update({ status: "used", claimed_at: new Date().toISOString() })
      .eq("id", session.id);

    await supabase
      .from("task_completions")
      .insert({
        user_id: userId,
        task_id: task.id,
        reward_claimed: true,
        reward_amount: task.reward_coins
      });

    return { success: true, coins_earned: task.reward_coins };
  };

  return { tasks, loading, completedToday, reload, startTask, claimTask };
                            }
