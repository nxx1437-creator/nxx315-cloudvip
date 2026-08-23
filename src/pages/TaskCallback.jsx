import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";

export default function TaskCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  const token = searchParams.get("token"); // Token từ link callback

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Thiếu Token xác thực!");
        return;
      }

      const { data, error } = await supabase.functions.invoke("claim-task", {
        body: { token },
      });

      if (error) {
        let errMsg = error.message;
        try {
          const body = await error.context.json();
          if (body?.error) errMsg = body.error;
        } catch {}
        setStatus("error");
        setMessage(errMsg);
        return;
      }

      if (data?.success) {
        setStatus("success");
        setMessage(`Bạn đã nhận ${data.coins_earned} Coin!`);
      } else {
        setStatus("error");
        setMessage(data?.error || "Token không hợp lệ!");
      }
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
