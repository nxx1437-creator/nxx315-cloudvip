// src/pages/Support/HomeDemo.jsx — thẻ minh họa tự chạy kiểu Cofounder: vòng sơ đồ + khung ứng dụng có tab
import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUp, Check, Loader2 } from "lucide-react";
import { SUGGESTIONS_BY_CATEGORY } from "./constants.js";

const SCENES = [
  { id: "order", tab: "Đơn hàng", node: "Đơn hàng", steps: [["Tra cứu đơn", "Tìm đơn trong hệ thống"], ["Soạn câu trả lời", "Tóm tắt trạng thái cho bạn"]],
    reply: "Đơn của bạn đang ở bước **chuẩn bị giao**. Có cập nhật mới mình sẽ báo ngay, bạn không cần hỏi lại." },
  { id: "payment", tab: "Thanh toán", node: "Thanh toán", steps: [["Kiểm tra thanh toán", "Đối chiếu giao dịch của bạn"], ["Soạn hướng dẫn", "Chuẩn bị các bước tiếp theo"]],
    reply: "Bạn gửi giúp mình **ảnh biên lai hoặc mã giao dịch**, mình sẽ đối chiếu và báo kết quả ngay trong khung chat này." },
  { id: "account", tab: "Tài khoản", node: "Tài khoản", steps: [["Xác định vấn đề", "Quên mật khẩu hay lỗi đăng nhập"], ["Soạn hướng dẫn", "Các bước đặt lại mật khẩu"]],
    reply: "Bạn bấm **Quên mật khẩu** ở trang đăng nhập, hoặc đăng nhập bằng Google nếu từng đăng ký như vậy." },
  { id: "bug", tab: "Báo lỗi", node: "Báo lỗi", steps: [["Đọc mô tả lỗi", "Phân tích nội dung bạn gửi"], ["Soạn hướng dẫn", "Cách xử lý nhanh nhất"]],
    reply: "Bạn **chụp màn hình lỗi** gửi vào đây giúp mình. Mình xem ảnh rồi hướng dẫn cách xử lý." },
];

// 8 nút nằm trên một vòng elip quanh tâm
const CX = 180, CY = 140, RX = 132, RY = 94;
const NODES = ["Đơn hàng", "Thanh toán", "Tài khoản", "Hoàn tiền", "Báo lỗi", "Nhiệm vụ", "Hình ảnh", "Zalo"].map((name, k) => {
  const a = (-90 + k * 45) * (Math.PI / 180);
  return { name, x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a) };
});
const bold = (s) => s.split("**").map((p, i) => (i % 2 ? <b key={i}>{p}</b> : p));
const questionOf = (id) => SUGGESTIONS_BY_CATEGORY[id]?.[0] || "";
const INIT = { typed: "", sent: false, steps: [], reply: false, fade: false };

function usePlay(scene, restart, onEnd) {
  const [s, set] = useState(INIT);
  useEffect(() => {
    set(INIT);
    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    const q = questionOf(scene.id);
    let t = 700;
    for (let i = 1; i <= q.length; i++) at(t + i * 30, () => set((p) => ({ ...p, typed: q.slice(0, i) })));
    t += q.length * 30 + 400;
    at(t, () => set((p) => ({ ...p, typed: "", sent: true, steps: ["run", "wait"] }))); t += 1100;
    at(t, () => set((p) => ({ ...p, steps: ["done", "run"] }))); t += 1100;
    at(t, () => set((p) => ({ ...p, steps: ["done", "done"] }))); t += 450;
    at(t, () => set((p) => ({ ...p, reply: true }))); t += 4200;
    at(t, () => set((p) => ({ ...p, fade: true }))); t += 450;
    at(t, onEnd);
    return () => timers.forEach(clearTimeout);
  }, [scene, restart]); // eslint-disable-line react-hooks/exhaustive-deps
  return s;
}

const LABEL = { run: "Đang chạy", wait: "Chờ", done: "Xong" };

export default function HomeDemo({ onTry }) {
  const [i, setI] = useState(0);
  const [restart, setRestart] = useState(0);
  const scene = SCENES[i];
  const s = usePlay(scene, restart, () => setI((x) => (x + 1) % SCENES.length));
  const bodyRef = useRef(null);
  const pinned = useRef(true);
  const running = s.steps.includes("run");
  const q = questionOf(scene.id);

  // tự cuộn xuống tin mới; nếu người dùng kéo lên xem lại thì không giật về
  const onBodyScroll = () => {
    const el = bodyRef.current;
    if (el) pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
  };
  useEffect(() => { pinned.current = true; if (bodyRef.current) bodyRef.current.scrollTop = 0; }, [i, restart]);
  useEffect(() => {
    const el = bodyRef.current;
    if (el && pinned.current) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [s.sent, s.steps, s.reply]);

  return (
    <div className="nxh-sec" style={{ paddingTop: 48 }}>
      <div className="nxh-eyebrow">Xem NXX làm việc</div>
      <div className="nxh-stage">
        <svg className="nxh-graph" viewBox="0 0 360 300" fill="none" aria-hidden="true">
          <ellipse cx={CX} cy={CY} rx={RX} ry={RY} className="nxh-orbit" />
          {NODES.map(({ name, x, y }) => {
            const on = running && name === scene.node;
            return (
              <g key={name}>
                <line x1={CX} y1={CY} x2={x} y2={y} className={on ? "nxh-ln on" : "nxh-ln"} />
                {on && <circle r="2.8" fill="#0081c0"><animateMotion dur="1.1s" repeatCount="indefinite" path={`M${CX} ${CY} L${x} ${y}`} /></circle>}
              </g>
            );
          })}
          <rect x={CX - 34} y={CY - 15} width="68" height="30" rx="8" className="nxh-core" />
          <text x={CX} y={CY + 4.5} textAnchor="middle" className="nxh-nt core">NXX</text>
          <path transform={`translate(${CX - 11} ${CY - 44}) scale(.92)`} d="M12 0C12 6.6 17.4 12 24 12 17.4 12 12 17.4 12 24 12 17.4 6.6 12 0 12 6.6 12 12 6.6 12 0Z" fill="#f2a516" />
          {NODES.map(({ name, x, y }) => {
            const on = running && name === scene.node;
            return (
              <g key={name}>
                <rect x={x - 34} y={y - 12} width="68" height="24" rx="8" className={on ? "nxh-nd on" : "nxh-nd"} />
                <text x={x} y={y + 4} textAnchor="middle" className={on ? "nxh-nt on" : "nxh-nt"}>{name}</text>
              </g>
            );
          })}
        </svg>

        <div className="nxh-win">
          <div className="nxh-wtabs" role="tablist">
            {SCENES.map((x, k) => (
              <button key={x.id} type="button" role="tab" aria-selected={k === i} onClick={() => { setI(k); setRestart((r) => r + 1); }}>{x.tab}</button>
            ))}
          </div>
          <div className="nxh-wbwrap">
           <div className="nxh-wbody" ref={bodyRef} onScroll={onBodyScroll}>
            <div className="nxh-wflow" data-fade={s.fade}>
              {!s.sent && <p className="nxh-ai nxh-in"><span className="nxh-dots" />Chào bạn, NXX giúp gì cho bạn nè?</p>}
              {s.sent && <div className="nxh-b me nxh-in">{q}</div>}
              {s.sent && !s.reply && s.steps.length > 0 && (
                <div className="nxh-steps nxh-in">
                  {scene.steps.map(([name, desc], k) => (
                    <div key={name} className="nxh-step">
                      <span className="nxh-stepic" data-st={s.steps[k]}>{s.steps[k] === "done" ? <Check size={12} strokeWidth={3} /> : s.steps[k] === "run" ? <Loader2 size={12} className="animate-spin" /> : <i />}</span>
                      <span className="nxh-stepx"><b>{name}</b><em>{desc}</em></span>
                      <span className="nxh-badge" data-st={s.steps[k]}>{LABEL[s.steps[k]]}</span>
                    </div>
                  ))}
                </div>
              )}
              {s.reply && <p className="nxh-ai nxh-in"><span className="nxh-dots" />{bold(scene.reply)}</p>}
            </div>
           </div>
          </div>
          <div className="nxh-winput">
            <span className={s.typed ? "typed" : ""}>{s.typed || "Hỏi NXX về đơn hàng, thanh toán…"}{s.typed && <i className="nxh-caret" />}</span>
            <span className="nxh-wsend"><ArrowUp size={15} strokeWidth={2.6} /></span>
          </div>
        </div>
      </div>
      <button type="button" className="nxh-more" onClick={() => onTry({ text: q, category: scene.id })}>
        Thử hỏi câu này <ArrowRight size={15} />
      </button>
    </div>
  );
}
              
            
            
