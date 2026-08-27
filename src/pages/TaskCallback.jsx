import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";

export default function TaskCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Đang xác nhận...");
  const [loading, setLoading] = useState(true);
  const token = params.get("token");

  useEffect(() => {
    const completeTask = async () => {
      if (!token) {
        setMessage("❌ Thiếu token!");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc("consume_task_token", { p_token: token });

        if (error) {
          setMessage("❌ Lỗi: " + error.message);
          setLoading(false);
          return;
        }

        if (data?.success) {
          setMessage(`✅ ${data.message} +${data.reward} Coin!`);
        } else {
          setMessage("❌ " + (data?.message || "Thất bại!"));
        }
      } catch (err) {
        setMessage("❌ Lỗi: " + err.message);
      }
      setLoading(false);
    };

    completeTask();
  }, [token]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          {loading ? "⏳ Đang xác nhận..." : message}
        </h1>
        {!loading && (
          <button
            onClick={() => navigate("/tasks")}
            className="mt-6 px-6 py-2 bg-sky-500 text-white rounded-full"
          >
            Quay lại nhiệm vụ
          </button>
        )}
      </div>
    </div>
  );
}
