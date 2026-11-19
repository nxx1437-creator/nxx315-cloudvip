// src/pages/help/HelpStepper.jsx — thanh tiến trình: Đã gửi → Đã tiếp nhận → Đang xử lý → Đã xử lý
const STEPS = ["Đã gửi", "Đã tiếp nhận", "Đang xử lý", "Đã xử lý"];

export function stepOf(status) {
  if (["resolved", "closed", "done"].includes(status)) return 3;
  if (["in_progress", "processing", "answered", "replied", "handling"].includes(status)) return 2;
  return 1; // vừa gửi: hệ thống đã tự tiếp nhận
}

export default function TicketSteps({ status }) {
  const cur = stepOf(status);
  return (
    <div className="flex items-start px-1" role="list" aria-label="Tiến trình xử lý">
      {STEPS.map((label, i) => {
        const done = i <= cur;
        return (
          <div key={label} role="listitem" className="relative flex flex-1 flex-col items-center">
            {i > 0 && (
              <span className={`absolute right-1/2 top-[13px] h-[2px] w-full ${i <= cur ? "bg-sky-500" : "bg-slate-300/60"}`} />
            )}
            <span
              className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full ${done ? "bg-sky-500 text-white" : "bg-slate-300/70 text-white"} ${i === cur ? "ring-4 ring-sky-500/25" : ""}`}
            >
              {i === cur && cur < 3 ? (
                <span className="h-2.5 w-2.5 rounded-full bg-white" />
              ) : (
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              )}
            </span>
            <span className={`mt-2 px-0.5 text-center text-[12px] leading-[1.25] ${i === cur ? "font-semibold text-sky-600" : "hc-muted"}`}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}
