import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Coins } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";

export default function TaskCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: "loading", message: "", reward: 0 });

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setState({ status: "error", message: "Thiếu mã Token trong đường dẫn.", reward: 0 });
      return;
    }

    supabase.rpc("consume_task_token", { p_token: token }).then(({ data, error }) => {
      if (error) {
        setState({ status: "error", message: error.message, reward: 0 });
        return;
      }
      const row = data?.[0];
      if (row?.success) {
        setState({ status: "success", message: row.message, reward: row.reward_coins });
      } else {
        setState({ status: "error", message: row?.message || "Xác thực thất bại.", reward: 0 });
      }
    });
  }, [params]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-sky-50 via-white to-white px-6 text-center font-[Be_Vietnam_Pro]">
      {state.status === "loading" && (
        <>
          <Loader2 size={36} className="animate-spin text-sky-500" />
          <p className="mt-4 text-sm text-slate-500">Đang xác thực Token...</p>
        </>
      )}

      {state.status === "success" && (
        <>
          <CheckCircle2 size={48} className="text-emerald-500" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">{state.message}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-lg font-semibold text-amber-600">
            <Coins size={18} /> +{state.reward} Coin
          </p>
        </>
      )}

      {state.status === "error" && (
        <>
          <XCircle size={48} className="text-rose-500" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">Không thể nhận thưởng</h1>
          <p className="mt-2 text-sm text-slate-500">{state.message}</p>
        </>
      )}

      <button
        onClick={() => navigate("/tasks")}
        className="mt-8 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/30"
      >
        Quay lại Nhiệm vụ
      </button>
    </div>
  );
}
