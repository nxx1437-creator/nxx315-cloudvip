import React, { useState, useEffect } from "react";
import { Gift, X, Loader2, CheckCircle2, AlertCircle, Info, Youtube } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";

const YOUTUBE_URL = "https://youtube.com/@nxx3155";

const NOTES = [
  "Mỗi mã chỉ dùng được 1 lần cho mỗi tài khoản",
  "Xu được cộng ngay lập tức",
  "Giao dịch hiển thị trong mục Hoạt động",
  "Nhập sai quá 5 lần sẽ bị khóa 10 phút",
];

export default function GiftCodeSheet({ open, onClose }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (open) {
      setCode("");
      setResult(null);
    }
  }, [open]);

  if (!open) return null;

  const close = () => {
    const ok = result?.ok;
    onClose();
    if (ok) window.location.reload();
  };

  const submit = async () => {
    if (loading || !code.trim()) return;
    setLoading(true);
    setResult(null);
    const { data, error } = await supabase.rpc("redeem_gift_code", { p_code: code });
    setLoading(false);
    if (error || !data) {
      setResult({ ok: false, message: "Có lỗi, thử lại nhé." });
      return;
    }
    setResult(data);
    if (data.ok) setCode("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50" onClick={close}>
      <div
        className="mx-auto max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-[#D1D5DB]" />

        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3478F6] to-[#0878C9] text-white">
            <Gift size={22} />
          </span>
          <div className="flex-1">
            <h3 className="text-base font-bold text-[#111827]">Nhập Gift Code</h3>
            <p className="text-xs text-[#667085]">Nhập mã quà tặng để nhận xu vào tài khoản</p>
          </div>
          <button
            onClick={close}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-500"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pt-5">
          <label className="text-sm font-semibold text-[#111827]">Gift Code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Nhập mã quà tặng"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            maxLength={64}
            className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3.5 text-center font-mono text-base tracking-widest text-[#111827] outline-none focus:border-[#3478F6]"
          />

          {/* Kết quả */}
          {result &&
            (result.ok ? (
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2 size={26} className="shrink-0 text-emerald-500" />
                <div>
                  <p className="text-base font-bold text-emerald-700">Nhập mã thành công!</p>
                  <p className="text-sm text-emerald-600">
                    Bạn nhận được +{Number(result.coins).toLocaleString("vi-VN")} xu
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={22} className="mt-0.5 shrink-0 text-rose-500" />
                  <p className="text-base font-medium leading-snug text-rose-600">
                    {result.message}
                  </p>
                </div>

                <div className="mt-3 rounded-xl border border-rose-200 bg-white/70 p-3">
                  <p className="text-sm text-[#667085]">
                    Không có gift code? Theo dõi kênh YouTube để biết code mới nhé.
                  </p>
                  <a
                    href={YOUTUBE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF0000] py-2.5 text-sm font-semibold text-white"
                  >
                    <Youtube size={18} /> Theo dõi YouTube
                  </a>
                </div>
              </div>
            ))}

          {/* Nút xác nhận */}
          <button
            onClick={submit}
            disabled={loading || !code.trim()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3478F6] to-[#0878C9] py-3.5 text-sm font-bold text-white shadow-md shadow-[#3478F6]/25 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Xác nhận"}
          </button>

          {/* Lưu ý */}
          <div className="mt-5 rounded-2xl border border-[#DBE4F5] bg-[#EEF3FC] p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[#111827]">
              <Info size={16} className="text-[#3478F6]" /> Lưu ý:
            </div>
            <div className="space-y-1.5">
              {NOTES.map((n) => (
                <div
                  key={n}
                  className="flex items-start gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs text-[#374151]"
                >
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#3478F6]" />
                  {n}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
        }
