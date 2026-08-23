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
        setCompletedToday(3); 
        return;
      }

      let doneMap = {};
      let completed = 0;
      
      if (userId) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        // Lấy toàn bộ lịch sử hoàn thành nhiệm vụ (KHÔNG giới hạn ngày) để tính streak
        const { data: allCompletions } = await supabase
          .from("task_completions")
          .select("completed_at")
          .eq("user_id", userId)
          .order("completed_at", { ascending: false });

        // Tính số lượng hoàn thành hôm nay
        const todayCompletions = (allCompletions || []).filter(c => 
          new Date(c.completed_at) >= startOfDay
        );
        completed = todayCompletions.length;

        // Tính streak (chuỗi ngày liên tiếp)
        const uniqueDays = new Set(
          (allCompletions || []).map(c => new Date(c.completed_at).toDateString())
        );
        
        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        
        // Nếu hôm nay CHƯA làm, bắt đầu kiểm tra từ hôm qua (vì có thể hôm nay chưa làm nhưng hôm qua đã làm)
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
          // Nếu chuỗi hiện tại lớn hơn chuỗi cũ, cập nhật
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

        // Lấy dữ liệu task theo ngày hôm nay
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

  // === LOGIC NHIỆM VỤ MỚI (Không cần Edge Function) ===

  // Hàm tạo Token khi bắt đầu làm nhiệm vụ
  const startTask = async (taskId) => {
    const token = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 phút

    // Lưu phiên làm nhiệm vụ
    await supabase.from("task_sessions").insert({
      user_id: userId,
      task_id: taskId,
      token,
      expires_at: expiresAt,
      status: "pending"
    });

    // Trả về Token + link vượt
    return {
      token,
      expires_at: expiresAt,
      shortUrl: `https://link4m.io/your-short-link?token=${token}`
    };
  };

  // Hàm xác nhận Token để nhận thưởng
  const claimTask = async (token) => {
    // 1. Kiểm tra Token có tồn tại không
    const { data: session } = await supabase
      .from("task_sessions")
      .select("*")
      .eq("token", token)
      .single();

    if (!session) return { error: "Token không hợp lệ!" };

    // 2. Kiểm tra Token có thuộc về user này không
    if (session.user_id !== userId) return { error: "Token không thuộc về bạn!" };

    // 3. Kiểm tra hạn sử dụng
    if (new Date(session.expires_at) < new Date()) return { error: "Token đã hết hạn!" };

    // 4. Kiểm tra đã dùng chưa
    if (session.status === "used") return { error: "Token đã được sử dụng!" };

    // 5. Lấy thông tin nhiệm vụ
    const { data: task } = await supabase
      .from("tasks")
      .select("reward_coins")
      .eq("id", session.task_id)
      .single();

    // 6. Cộng coin cho user
    const { data: profile } = await supabase
      .from("profiles")
      .select("coins")
      .eq("id", userId)
      .single();

    await supabase
      .from("profiles")
      .update({ coins: profile.coins + task.reward_coins })
      .eq("id", userId);

    // 7. Đánh dấu Token đã dùng
    await supabase
      .from("task_sessions")
      .update({ status: "used", claimed_at: new Date().toISOString() })
      .eq("id", session.id);

    // 8. Lưu lịch sử hoàn thành
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
