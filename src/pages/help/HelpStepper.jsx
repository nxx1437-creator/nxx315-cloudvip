// src/pages/help/HelpStepper.jsx — Đã gửi → Đã tiếp nhận → Đang xử lý → Đã xử lý (có hiệu ứng chuyển bước)
import { useEffect, useState } from "react";

const STEPS = ["Đã gửi", "Đã tiếp nhận", "Đang xử lý", "Đã xử lý"];
const BLUE = "#0081c0";
const EASE = "cubic-bezier(.4,0,.2,1)";

export function stepOf(status) {
  if (["resolved", "closed", "done"].includes(status)) return 3;
  if (["in_progress", "processing", "answered", "replied", "handling"].includes(status)) return 2;
  return 1; // vừa gửi: hệ thống đã tự tiếp nhận
}

const CSS = `
@keyframes tsPop{0%{transform:scale(.6)}55%{transform:scale(1.22)}100%{transform:scale(1)}}
@keyframes tsPulse{0%{box-shadow:0 0 0 0 rgba(0,129,192,.45)}100%{box-shadow:0 0 0 12px rgba(0,129,192,0)}}
@keyframes tsDraw{from{stroke-dashoffset:24}to{stroke-dashoffset:0}}
@keyframes tsRise{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.ts-n,.ts-c,.ts-l{animation:none!important;transition:none!important}}
`;

export default function TicketSteps({ status }) {
  const target = stepOf(status);
  const [shown, setShown] = useState(-1); // bước đang hiển thị: chạy lần lượt từng bước cho đến target

  useEffect(() => {
    if (shown === target) return undefined;
    if (shown > target) { setShown(target); return undefined; }
    const t = setTimeout(() => setShown((s) => s + 1), shown < 0 ? 250 : 650);
    return () => clearTimeout(t);
  }, [shown, target]);

  return (
    <div className="flex items-start px-1" role="list" aria-label="Tiến trình xử lý">
      <style>{CSS}</style>
      {STEPS.map((label, i) => {
        const done = i <= shown;
        const current = i === shown;
        const working = current && i < 3; // bước đang chờ: chấm trắng + vòng nhịp thở
        return (
          <div key={label} role="listitem" className="relative flex flex-1 flex-col items-center">
            {i > 0 && (
              <span className="absolute right-1/2 top-[13px] h-[2px] w-full overflow-hidden rounded-full bg-slate-300/60">
                <span
                  className="ts-l block h-full"
                  style={{ width: i <= shown ? "100%" : "0%", background: BLUE, transition: `width .6s ${EASE}` }}
                />
              </span>
            )}
            <span
              key={done ? `on-${i}` : `off-${i}`}
              className="ts-n relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-white"
              style={{
                background: done ? BLUE : "rgba(203,213,225,.75)",
                transition: `background .35s ${EASE}`,
                animation: done ? "tsPop .5s " + EASE : "none",
              }}
            >
              {working ? (
                <>
                  <span className="ts-c absolute inset-0 rounded-full" style={{ animation: "tsPulse 1.6s ease-out infinite" }} />
                  <span className="h-2.5 w-2.5 rounded-full bg-white" />
                </>
              ) : (
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" strokeDasharray="24" style={{ animation: done ? "tsDraw .45s .1s both " + EASE : "none", strokeDashoffset: done ? undefined : 24 }} />
                </svg>
              )}
            </span>
            <span
              className={`mt-2 px-0.5 text-center text-[12px] leading-[1.25] ${current ? "font-semibold" : done ? "hc-text2" : "hc-muted"}`}
              style={{ color: current ? BLUE : undefined, transition: `color .35s ${EASE}` }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
            }


