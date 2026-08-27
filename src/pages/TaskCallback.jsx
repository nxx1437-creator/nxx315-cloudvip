import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import { CheckCircle2, XCircle, Loader2, Coins } from "lucide-react";

export default function TaskCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: "loading", message: "", reward: 0 });
  const token = params.get("token");

  useEffect(() => {
    const completeTask = async () => {
      if (!token) {
        setState({ status: "error", message: "Thiếu mã Token!", reward: 0 });
        return;
      }

      try {
        // Gọi function consume_task_token
        const { data, error } = await supabase.rpc("consume_task_token", { p_token: token });

        if (error) {
          setState({ status: "error", message: error.message, reward: 0 });
          return;
        }

        // data là JSON: { success: true, message: "...", reward: 10 }
        if (data?.success) {
          setState({ 
            status: "success", 
            message: data.message, 
            reward: data.reward 
          });
        } else {
          setState({ 
            status: "error", 
            message: data?.message || "Token không hợp lệ hoặc đã hết hạn!", 
            reward: 0 
          });
        }
      } catch (err) {
        setState({ status: "error", message: err.message, reward: 0 });
      }
    };

    completeTask();
  }, [token]);

  // UI Loading
  if (state.status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 via-white to-white">
        <Loader2 size={48} className="animate-spin text-sky-500" />
        <p className="mt-4 text-slate-500">Đang xác nhận nhiệm vụ...</p>
      </div>
    );
  }

  // UI Error
  if (state.status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 via-white to-white px-4">
        <XCircle size={48} className="text-rose-500" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">Không thể nhận thưởng</h1>
        <p className="mt-2 text-sm text-slate-500 text-center">{state.message}</p>
        <button
          onClick={() => navigate("/tasks")}
          className="mt-6 px-6 py-2.5 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition"
        >
          Quay lại nhiệm vụ
        </button>
      </div>
    );
  }

  // UI Success
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 via-white to-white px-4">
      <CheckCircle2 size={48} className="text-emerald-500" />
      <h1 className="mt-4 text-xl font-bold text-slate-900">{state.message}</h1>
      <p className="mt-2 flex items-center gap-1.5 text-2xl font-bold text-amber-500">
        <Coins size={24} /> +{state.reward} Coin
      </p>
      <button
        onClick={() => navigate("/tasks")}
        className="mt-6 px-6 py-2.5 bg-gradient-to-r from-sky-400 to-blue-600 text-white rounded-full shadow-lg shadow-sky-500/30 hover:brightness-110 transition"
      >
        Tiếp tục làm nhiệm vụ
      </button>
    </div>
  );
      }
