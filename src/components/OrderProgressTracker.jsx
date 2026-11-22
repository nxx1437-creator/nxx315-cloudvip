import React from "react";
import { Check, ShieldCheck, X } from "lucide-react";

export const STEPS = ["Đã nhận đơn", "Kiểm tra", "Xử lý", "Hoàn tất"];

export function deriveStep(order) {
  if (Number.isInteger(order?.progress_step)) {
    return Math.min(Math.max(order.progress_step, 0), STEPS.length - 1);
  }
  const s = String(order?.status || "").toLowerCase();
  if (["delivered", "success", "completed", "done"].includes(s)) return 3;
  if (s === "processing") return 2;
  if (s === "paid") return 1;
  return 0;
}

const TONE = {
  blue: { fill: "bg-blue-500", dot: "bg-blue-500 text-white", ring: "ring-blue-200", text: "text-blue-600" },
  green: { fill: "bg-emerald-500", dot: "bg-emerald-500 text-white", ring: "ring-emerald-200", text: "text-emerald-600" },
  red: { fill: "bg-rose-400", dot: "bg-rose-500 text-white", ring: "ring-rose-200", text: "text-rose-600" },
};

function fmt(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function OrderProgressTracker({ order }) {
  if (!order) return null;

  const status = String(order.status || "").toLowerCase();
  const failed = ["rejected", "failed", "cancelled", "canceled"].includes(status);
  const step = deriveStep(order);
  const complete = !failed && step === STEPS.length - 1;
  const tone = TONE[failed ? "red" : complete ? "green" : "blue"];
  const proofs = Array.isArray(order.proof_urls) ? order.proof_urls : [];
  const note = order.progress_note;

  return (
    <section className="mt-3 rounded-3xl border border-blue-50 bg-white p-5 shadow-sm">
      <h2 className="mb-5 text-sm font-black text-slate-900">Tiến độ đơn hàng</h2>

      <div className="relative">
        <div className="absolute left-[12.5%] right-[12.5%] top-[13px] h-1 rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${tone.fill}`}
            style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        <div className="relative grid grid-cols-4">
          {STEPS.map((label, i) => {
            const done = i < step || (i === step && complete);
            const current = i === step && !complete;

            return (
              <div key={label} className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-[30px] w-[30px] items-center justify-center rounded-full text-xs font-black transition-all duration-500 ${
                    done
                      ? tone.dot
                      : current
                      ? `${tone.dot} ring-4 ${tone.ring}`
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {current && failed ? (
                    <X size={15} />
                  ) : done || current ? (
                    <Check size={15} />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-center text-[11px] font-bold leading-tight ${
                    done || current ? tone.text : "text-slate-400"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {(note || proofs.length > 0) && (
        <div className="mt-6 border-t border-slate-100 pt-5">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
              <ShieldCheck size={19} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-slate-900">NXX315 Admin</span>
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-white">
                  <Check size={10} strokeWidth={3} />
                </span>
              </div>

              {note && (
                <p className="mt-1.5 whitespace-pre-wrap break-words text-[13px] leading-6 text-slate-700">
                  {note}
                </p>
              )}

              {proofs.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 text-[11px] font-bold text-slate-400">
                    Giao dịch thành công từ nhà phát hành
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {proofs.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="block aspect-square overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
                      >
                        <img src={url} alt="Minh chứng giao dịch" className="h-full w-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {order.progress_updated_at && (
                <p className="mt-2 text-xs text-slate-400">{fmt(order.progress_updated_at)}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
