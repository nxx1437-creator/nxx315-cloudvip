import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";

export default function TaskCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Thiếu Token xác thực!");
        return;
      }

      // 1. Kiểm tra Token
      const { data: session } = await supabase
        .from("task_sessions")
        .select("*")
        .eq("token", token)
        .single();

      if (!session) {
        setStatus("error");
        setMessage("Token không hợp lệ!");
        return;
      }

      // 2. Kiểm tra hạn sử dụng
      if (new Date(session.expires_at) < new Date()) {
        setStatus("error");
        setMessage("Token đã hết hạn!");
        return;
      }

      // 3. Kiểm tra đã dùng chưa
      if (session.status === "used") {
        setStatus("error");
        setMessage("Token đã được sử dụng!");
        return;
      }

      // 4. Lấy nhiệm vụ
      const { data: task } = await supabase
        .from("tasks")
        .select("reward_coins")
        .eq("id", session.task_id)
        .single();

      // 5. Cộng coin
      const { data: profile } = await supabase
        .from("profiles")
        .select("coins")
        .eq("id", session.user_id)
        .single();

      await supabase
        .from("profiles")
        .update({ coins: profile.coins + task.reward_coins })
        .eq("id", session.user_id);

      // 6. Đánh dấu đã dùng
      await supabase
        .from("task_sessions")
        .update({ status: "used", claimed_at: new Date().toISOString() })
        .eq("id", session.id);

      // 7. Lưu lịch sử
      await supabase
        .from("task_completions")
        .insert({
          user_id: session.user_id,
          task_id: task.id,
          reward_claimed: true,
          reward_amount: task.reward_coins
        });

      setStatus("success");
      setMessage(`Bạn đã nhận ${task.reward_coins} Coin!`);
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 via-white to-white px-4">
      <div className="max-w-sm w-full rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-lg">
        {status === "loading" && (
          <>
            <Loader2 size={40} className="mx-auto animate-spin text-sky-500" />
            <p className="mt-4 text-sm font-medium text-slate-600">Đang xác thực Token...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
            <h1 className="mt-4 text-lg font-bold text-slate-900">Xác thực thành công!</h1>
            <p className="mt-2 text-sm text-emerald-600">{message}</p>
            <button onClick={() => navigate("/tasks")} className="mt-6 w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 py-3 text-sm font-semibold text-white">
              Về trang nhiệm vụ
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle size={40} className="mx-auto text-rose-500" />
            <h1 className="mt-4 text-lg font-bold text-slate-900">Xác thực thất bại!</h1>
            <p className="mt-2 text-sm text-rose-500">{message}</p>
            <button onClick={() => navigate("/tasks")} className="mt-6 w-full rounded-xl bg-gradient-to-r from-rose-400 to-rose-600 py-3 text-sm font-semibold text-white">
              Về trang nhiệm vụ
            </button>
          </>
        )}
      </div>
    </div>
  );
}
