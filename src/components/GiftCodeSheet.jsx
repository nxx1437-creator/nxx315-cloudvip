import React, { useState, useEffect } from "react";
import { Gift, X, Loader2, CheckCircle2, AlertCircle, Info, Check, Youtube } from "lucide-react";
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
      setResult({ ok: false, message: "Có lỗi xảy ra, vui lòng thử lại." });
      return;
    }
    if (!data.ok && data.error === "invalid") {
      setResult({ ok: false, message: "Gift Code không hợp lệ hoặc đã được sử dụng" });
      return;
    }
    setResult(data);
    if (data.ok) setCode("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={close}>
      <div
        className="mx-auto flex max-h-[85dvh] w-full max-w-md flex-col rounded-t-3xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (cố định) */}
        <div className="shrink-0 rounded-t-3xl border-b border-[#E8ECF3] bg-gradient-to-b from-[#EEF3FC] to-white px-4 pb-3 pt-2">
          <div className="mx-auto h-1 w-10 rounded-full bg-[#D1D5DB]" />
          <div className="mt-3 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#3478F6] to-[#0878C9] text-white">
              <Gift size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-[#111827]">Nhập Gift Code</h3>
              <p className="text-xs leading-snug text-[#667085]">
                Nhập mã quà tặng để nhận xu vào tài khoản
              </p>
            </div>
            <button
              onClick={close}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-500"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Nội dung (cuộn được) */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
          <label className="text-sm font-semibold text-[#111827]">Gift Code</label>

          <div className="relative mt-1.5">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Nhập mã quà tặng"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              maxLength={64}
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-10 py-3 text-center font-mono text-base tracking-widest text-[#111827] outline-none focus:border-[#3478F6]"
            />
            {code && (
              <button
                onClick={() => {
                  setCode("");
                  setResult(null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#111827]"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Kết quả */}
          {result &&
            (result.ok ? (
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <CheckCircle2 size={24} className="shrink-0 text-emerald-500" />
                <div>
                  <p className="text-sm font-bold text-emerald-700">Nhập mã thành công!</p>
                  <p className="text-xs text-emerald-600">
                    Bạn nhận được +{Number(result.coins).toLocaleString("vi-VN")} xu
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-500" />
                  <p className="text-sm leading-snug text-rose-500">{result.message}</p>
                </div>

                <div className="mt-2.5 rounded-lg border border-rose-200 bg-rose-100/50 p-2.5">
                  <p className="text-xs leading-snug text-[#374151]">
                    Không có gift code? Theo dõi kênh YouTube để biết code mới nhé.
                  </p>
                  <a
                    href={YOUTUBE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-rose-300 bg-rose-100 py-2.5 text-sm font-semibold text-rose-600"
                  >
                    <Youtube size={17} /> Theo dõi YouTube
                  </a>
                </div>
              </div>
            ))}

          {/* Nút xác nhận */}
          <button
            onClick={submit}
            disabled={loading || !code.trim()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3478F6] to-[#0878C9] py-3 text-sm font-bold text-white shadow-md shadow-[#3478F6]/25 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Xác nhận"}
          </button>

          {/* Lưu ý */}
          <div className="mt-4 rounded-xl border border-[#D6E0F5] bg-[#EEF3FC] p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D6E4FB] text-[#3478F6]">
                <Info size={15} />
              </span>
              <span className="text-sm font-bold text-[#111827]">Lưu ý:</span>
            </div>
            <div className="space-y-1.5">
              {NOTES.map((n) => (
                <div
                  key={n}
                  className="flex items-center gap-2 rounded-lg border border-[#E1E8F5] bg-white px-2.5 py-2 text-xs text-[#374151]"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#4C8DF6] text-white">
                    <Check size={11} strokeWidth={3} />
                  </span>
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
