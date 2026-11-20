// src/pages/Support/HomeDemo.jsx — thẻ minh họa tự chạy: gõ câu hỏi → gửi → NXX làm từng bước → trả lời (kiểu Cofounder)
import React, { useEffect, useState } from "react";
import { ArrowRight, ArrowUp, Check, Loader2 } from "lucide-react";
import { SUGGESTIONS_BY_CATEGORY } from "./constants.js";

const SCENES = [
  { id: "order", tab: "Đơn hàng", node: "Đơn hàng", steps: [["Tra cứu đơn", "Tìm đơn trong hệ thống"], ["Soạn câu trả lời", "Tóm tắt trạng thái cho bạn"]],
    reply: "Đơn của bạn đang ở bước **chuẩn bị giao**. Có cập nhật mới mình sẽ báo ngay nha." },
  { id: "payment", tab: "Thanh toán", node: "Thanh toán", steps: [["Kiểm tra thanh toán", "Đối chiếu giao dịch của bạn"], ["Soạn hướng dẫn", "Chuẩn bị các bước tiếp theo"]],
    reply: "Bạn gửi giúp mình **ảnh biên lai hoặc mã giao dịch**, mình kiểm tra ngay nhé." },
  { id: "account", tab: "Tài khoản", node: "Tài khoản", steps: [["Xác định vấn đề", "Quên mật khẩu hay lỗi đăng nhập"], ["Soạn hướng dẫn", "Các bước đặt lại mật khẩu"]],
    reply: "Bạn bấm **Quên mật khẩu** ở trang đăng nhập, hoặc đăng nhập bằng Google nếu từng đăng ký như vậy." },
  { id: "bug", tab: "Báo lỗi", node: "Báo lỗi", steps: [["Đọc mô tả lỗi", "Phân tích nội dung bạn gửi"], ["Soạn hướng dẫn", "Cách xử lý nhanh nhất"]],
    reply: "Bạn **chụp màn hình lỗi** gửi vào đây giúp mình, mình xem và hướng dẫn xử lý." },
];

const NODES = [
  ["Đơn hàng", 70, 46], ["Thanh toán", 180, 24], ["Tài khoản", 290, 46],
  ["Báo lỗi", 52, 128], ["Hình ảnh", 308, 128], ["Zalo", 180, 218],
];
const CX = 180, CY = 128;
const bold = (s) => s.split("**").map((p, i) => (i % 2 ? <b key={i}>{p}</b> : p));
const questionOf = (id) => SUGGESTIONS_BY_CATEGORY[id]?.[0] || "";

function usePlay(scene, restart, onEnd) {
  const [s, set] = useState({ typed: "", sent: false, steps: [], reply: false, fade: false });
  useEffect(() => {
    set({ typed: "", sent: false, steps: [], reply: false, fade: false });
    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    const q = questionOf(scene.id);
    let t = 600;
    for (let i = 1; i <= q.length; i++) at(t + i * 30, () => set((p) => ({ ...p, typed: q.slice(0, i) })));
    t += q.length * 30 + 350;
    at(t, () => set((p) => ({ ...p, typed: "", sent: true })));
    t += 600;
    scene.steps.forEach((_, i) => {
      at(t, () => set((p) => ({ ...p, steps: [...p.steps, "run"] }))); t += 1000;
      at(t, () => set((p) => ({ ...p, steps: p.steps.map((x, k) => (k === i ? "done" : x)) }))); t += 300;
    });
    at(t, () => set((p) => ({ ...p, reply: true }))); t += 3800;
    at(t, () => set((p) => ({ ...p, fade: true }))); t += 450;
    at(t, onEnd);
    return () => timers.forEach(clearTimeout);
  }, [scene, restart]); // eslint-disable-line react-hooks/exhaustive-deps
  return s;
}

export default function HomeDemo({ onTry }) {
  const [i, setI] = useState(0);
  const [restart, setRestart] = useState(0);
  const scene = SCENES[i];
  const s = usePlay(scene, restart, () => setI((x) => (x + 1) % SCENES.length));
  const running = s.steps.includes("run");
  const q = questionOf(scene.id);

  return (
    <div className="nxh-sec" style={{ paddingTop: 48 }}>
      <div className="nxh-eyebrow">Xem NXX làm việc</div>
      <div className="nxh-stage">
        <svg className="nxh-graph" viewBox="0 0 360 270" fill="none" aria-hidden="true">
          <ellipse cx={CX} cy={CY} rx="128" ry="86" className="nxh-orbit" />
          <ellipse cx={CX} cy={CY} rx="64" ry="42" className="nxh-orbit" />
          {NODES.map(([name, x, y]) => {
            const on = running && name === scene.node;
            return (
              <g key={name}>
                <line x1={CX} y1={CY} x2={x} y2={y} className={on ? "nxh-ln on" : "nxh-ln"} />
                <rect x={x - 39} y={y - 13} width="78" height="26" rx="7" className={on ? "nxh-nd on" : "nxh-nd"} />
                <text x={x} y={y + 4.5} textAnchor="middle" className={on ? "nxh-nt on" : "nxh-nt"}>{name}</text>
              </g>
            );
          })}
          <path transform={`translate(${CX - 17} ${CY - 17}) scale(1.4)`} d="M12 0C12 6.6 17.4 12 24 12 17.4 12 12 17.4 12 24 12 17.4 6.6 12 0 12 6.6 12 12 6.6 12 0Z" fill="#f2a516" />
        </svg>

        <div className="nxh-win">
          <div className="nxh-wtabs" role="tablist">
            {SCENES.map((x, k) => (
              <button key={x.id} type="button" role="tab" aria-selected={k === i} onClick={() => { setI(k); setRestart((r) => r + 1); }}>{x.tab}</button>
            ))}
          </div>
          <div className="nxh-wbody">
            <div className="nxh-wflow" data-fade={s.fade}>
              {!s.sent && <div className="nxh-b ai nxh-in">Chào bạn, NXX giúp gì cho bạn nè?</div>}
              {s.sent && <div className="nxh-b me nxh-in">{q}</div>}
              {scene.steps.map(([name], k) => s.steps[k] && (
                <div key={name} className="nxh-step nxh-in">
                  <span className="nxh-stepic">{s.steps[k] === "done" ? <Check size={13} strokeWidth={3} /> : <Loader2 size={13} className="animate-spin" />}</span>
                  <span className="nxh-stepx">{name}</span>
                  <span className={`nxh-badge ${s.steps[k] === "done" ? "" : "run"}`}>{s.steps[k] === "done" ? "Xong" : "Đang chạy"}</span>
                </div>
              ))}
              {s.reply && <div className="nxh-b ai nxh-in">{bold(scene.reply)}</div>}
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
            
