import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Coins } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";

export default function TaskCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: "loading", message: "", reward: 0 });
  const token = params.get("token");

  useEffect(() => {
    const completeTask = async () => {
      if (!token) {
        setState({ status: "error", message: "Thiếu token!", reward: 0 });
        return;
      }

      try {
        const { data, error } = await supabase.rpc("consume_task_token", { p_token: token });

        if (error) {
          setState({ status: "error", message: error.message, reward: 0 });
          return;
        }

        if (data?.success) {
          setState({ status: "success", message: data.message, reward: data.reward });
        } else {
          setState({ status: "error", message: data?.message || "Thất bại", reward: 0 });
        }
      } catch (err) {
        setState({ status: "error", message: err.message, reward: 0 });
      }
    };

    completeTask();
  }, [token]);

  // UI
  if (state.status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-sky-500" />
        <p className="ml-3 text-slate-500">Đang xác nhận...</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <XCircle size={48} className="text-rose-500" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">Lỗi</h1>
        <p className="mt-2 text-slate-500">{state.message}</p>
        <button onClick={() => navigate("/tasks")} className="mt-6 px-6 py-2 bg-sky-500 text-white rounded-full">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <CheckCircle2 size={48} className="text-emerald-500" />
      <h1 className="mt-4 text-xl font-bold text-slate-900">{state.message}</h1>
      <p className="mt-2 text-amber-500 font-bold text-lg">+{state.reward} Coin</p>
      <button onClick={() => navigate("/tasks")} className="mt-6 px-6 py-2 bg-sky-500 text-white rounded-full">
        Quay lại
      </button>
    </div>
  );
}
