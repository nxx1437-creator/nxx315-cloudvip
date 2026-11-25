// src/pages/Support/RatingPrompt.jsx — thẻ "Đánh giá chất lượng hỗ trợ" trong khung chat + bảng chọn mức hài lòng + bảng cảm ơn
import React, { useState } from "react";
import { createPortal } from "react-dom";

const SERIF = { fontFamily: '"Source Serif 4", "Tiempos Headline", Georgia, "Times New Roman", serif', fontWeight: 600 };

const LABELS = { 1: "Không hài lòng", 2: "Bình thường", 3: "Rất hài lòng" };

const REASONS = {
  1: {
    title: "NXX gặp vấn đề gì khi hỗ trợ bạn?",
    items: ["Chưa giải quyết được vấn đề", "Không hiểu đúng yêu cầu", "Thông tin sai", "Thông tin chưa đầy đủ", "Muốn gặp nhân viên"],
  },
  2: {
    title: "NXX cần cải thiện điều gì?",
    items: ["Trả lời chưa rõ ràng", "Trả lời hơi chậm", "Thông tin chưa đầy đủ", "Muốn gặp nhân viên"],
  },
  3: {
    title: "Bạn thích điều gì ở NXX?",
    items: ["Trả lời nhanh", "Dễ hiểu", "Giải quyết được vấn đề", "Thân thiện"],
  },
};

const THANKS = {
  1: "Rất xin lỗi bạn vì trải nghiệm chưa tốt vừa qua. NXX sẽ nghiêm túc xem xét để thay đổi và phục vụ bạn tốt hơn nữa.",
  2: "Cảm ơn bạn đã chia sẻ. NXX sẽ cố gắng cải thiện để lần sau hỗ trợ bạn tốt hơn.",
  3: "Cảm ơn bạn đã ủng hộ NXX! Chúc bạn một ngày thật vui.",
};

// Ngôi sao 5 cánh cho mắt "rất hài lòng"
function starPoints(cx, cy, R = 13, r = 5.5) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? R : r;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

function Face({ kind, active = true, size = 52 }) {
  const skin = active ? "#fbd57c" : "#dcdce0";
  const ink = active ? "#3a3a37" : "#a9a9b0";
  const star = active ? "#f59e0b" : "#a9a9b0";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="48" fill={skin} />
      {kind === 1 && (
        <>
          <path d="M22 38 L43 46 M78 38 L57 46" stroke={ink} strokeWidth="6" strokeLinecap="round" fill="none" />
          <circle cx="34" cy="54" r="5.5" fill={ink} />
          <circle cx="66" cy="54" r="5.5" fill={ink} />
          <path d="M34 76 Q50 62 66 76" stroke={ink} strokeWidth="6" strokeLinecap="round" fill="none" />
        </>
      )}
      {kind === 2 && (
        <>
          <circle cx="35" cy="44" r="5.5" fill={ink} />
          <circle cx="65" cy="44" r="5.5" fill={ink} />
          <path d="M34 62 Q50 76 66 62" stroke={ink} strokeWidth="6" strokeLinecap="round" fill="none" />
        </>
      )}
      {kind === 3 && (
        <>
          <polygon points={starPoints(32, 42)} fill={star} />
          <polygon points={starPoints(68, 42)} fill={star} />
          <path d="M26 60 Q50 92 74 60 Z" fill="#fff" stroke={ink} strokeWidth="4" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

function ThanksArt() {
  return (
    <svg width="130" height="104" viewBox="0 0 150 120" aria-hidden="true">
      <path d="M22 18h86a14 14 0 0 1 14 14v38a14 14 0 0 1-14 14H70l-18 18v-18H22A14 14 0 0 1 8 70V32a14 14 0 0 1 14-14z" fill="#2b2b2b" />
      <rect x="30" y="38" width="60" height="7" rx="3.5" fill="#fff" />
      <rect x="30" y="54" width="38" height="7" rx="3.5" fill="#fff" opacity=".85" />
      <circle cx="112" cy="26" r="20" fill="#fff" stroke="#e6e6df" strokeWidth="3" />
      <path d="M112 37c-9-6-14-10-14-16a7.5 7.5 0 0 1 14-3.5A7.5 7.5 0 0 1 126 21c0 6-5 10-14 16z" fill="#f4523f" />
    </svg>
  );
}

const primaryBtn =
  "h-[44px] w-full rounded-full bg-[#0f0f0e] text-[15.5px] font-medium text-white transition active:scale-[0.98] disabled:bg-[#cfcfc8]";
// Bảng là thẻ nổi bo 4 góc. Chiều cao tối đa tính theo vùng nhìn thấy thật (trừ thanh trình duyệt), quá dài thì cuộn bên trong
// z-index rất cao + render qua portal ra document.body để lớp mờ phủ kín toàn màn hình (không bị header/khung chat đè lên)
const SHEET =
  "nxx-sheet-in fixed bottom-[max(12px,env(safe-area-inset-bottom))] left-3 right-3 z-[10001] mx-auto max-w-2xl overflow-y-auto overscroll-contain rounded-[28px] bg-white px-6 pt-6 shadow-[0_8px_40px_rgba(0,0,0,0.16)]";
const sheetStyle = () => ({
  maxHeight: `${(typeof window !== "undefined" ? window.innerHeight : 700) - 40}px`,
});

// onSubmit({ score, reasons, comment }) -> Promise<{ ok }> ; onDismiss: bỏ qua ; onDone: xong, ẩn thẻ
export default function RatingPrompt({ onSubmit, onDismiss, onDone }) {
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(null);
  const [reasons, setReasons] = useState([]);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [thanks, setThanks] = useState(false);

  const pick = (n) => {
    if (n !== score) setReasons([]);
    setScore(n);
    setOpen(true);
    setErr("");
  };
  const toggle = (r) => setReasons((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]));
  const closeSheet = () => {
    if (busy) return;
    if (thanks) return onDone?.();
    setOpen(false);
  };

  const send = async () => {
    if (!score || busy) return;
    setBusy(true);
    setErr("");
    const res = await onSubmit?.({ score, reasons, comment: comment.trim() });
    setBusy(false);
    if (!res?.ok) return setErr("Chưa gửi được đánh giá, thử lại sau nhé.");
    setThanks(true);
  };

  const group = score ? REASONS[score] : null;

  return (
    <>
      <div className="nxx-rise rounded-[22px] border border-[#e6e6df] bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[16.5px] font-semibold leading-snug text-[#2b2b2b]">Đánh giá chất lượng hỗ trợ của NXX</p>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Bỏ qua"
            className="nxx-iconbtn -mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f2f2ee] text-[#6f6f68]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <p className="mt-1.5 text-[14.5px] leading-6 text-[#6f6f68]">
          Cảm ơn bạn đã trò chuyện với NXX! Bạn hài lòng với hỗ trợ vừa rồi chứ? Hãy dành vài giây đánh giá giúp NXX nhé!
        </p>
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-[#efe3b8] bg-[#fbf6e4] px-6 py-3">
          {[1, 2, 3].map((n) => (
            <button key={n} type="button" onClick={() => pick(n)} aria-label={LABELS[n]} className="transition active:scale-90">
              <Face kind={n} />
            </button>
          ))}
        </div>
      </div>

      {open &&
        createPortal(
          <>
            <div className="nxx-fade fixed inset-0 z-[10000] bg-black/25" onClick={closeSheet} />
            <div role="dialog" aria-modal="true" className={SHEET} style={sheetStyle()}>
              {!thanks ? (
                <>
                  <h3 className="text-center text-[20px] leading-tight text-[#141413]" style={SERIF}>
                    Đánh giá mức độ hài lòng
                  </h3>

                  <div className="mt-4 flex items-center justify-between px-4">
                    {[1, 2, 3].map((n) => (
                      <button key={n} type="button" onClick={() => pick(n)} aria-label={LABELS[n]} aria-pressed={score === n} className="transition active:scale-90">
                        <Face kind={n} active={score === n} size={46} />
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-center text-[15px] text-[#2b2b2b]">{LABELS[score]}</p>

                  <div className="mx-auto mt-3 h-px w-4/5 bg-[#ececE6]" />

                  <p className="mt-3 text-center text-[15px] font-semibold leading-snug text-[#2b2b2b]">{group.title}</p>
                  <p className="text-center text-[13px] text-[#8b8b84]">(Có thể chọn nhiều)</p>

                  <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
                    {group.items.map((r) => {
                      const on = reasons.includes(r);
                      return (
                        <button
                          key={r}
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggle(r)}
                          className={`rounded-lg px-3 py-1.5 text-[13.5px] transition active:scale-95 ${
                            on ? "bg-[#2b2b2b] text-white" : "bg-[#f2f2ee] text-[#55554f]"
                          }`}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>

                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={300}
                    rows={2}
                    placeholder="Hãy giúp chúng tôi hiểu hơn"
                    className="mt-3 w-full resize-none rounded-xl bg-[#f6f6f3] px-4 py-2.5 text-[15px] leading-6 text-[#2b2b2b] outline-none placeholder:text-[#a2a29b]"
                  />

                  {err && <p className="mt-2 text-center text-[13.5px] text-rose-600">{err}</p>}

                  {/* Nút gửi dính đáy bảng: luôn thấy dù bảng phải cuộn */}
                  <div className="sticky bottom-0 -mx-6 bg-white px-6 pb-5 pt-3">
                    <button type="button" onClick={send} disabled={busy} className={primaryBtn}>
                      {busy ? "Đang gửi..." : "Gửi đánh giá"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center pb-5 text-center">
                  <ThanksArt />
                  <h3 className="mt-3 text-[21px] leading-tight text-[#141413]" style={SERIF}>
                    Cảm ơn bạn đã góp ý!
                  </h3>
                  <p className="mt-2.5 max-w-[22rem] text-[14.5px] leading-6 text-[#6f6f68]">{THANKS[score]}</p>
                  <div className="mt-5 w-full">
                    <button type="button" onClick={onDone} className={primaryBtn}>
                      Hoàn tất
                    </button>
                  </div>
                  <p className="mt-3 text-[13px] text-[#8b8b84]">Thông tin đánh giá của bạn đã được gửi tới NXX315.</p>
                </div>
              )}
            </div>
          </>,
          document.body
        )}
    </>
  );
}
