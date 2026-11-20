// src/pages/Support/HomeDemo.jsx
import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUp, Check, Loader2 } from "lucide-react";
import { SUGGESTIONS_BY_CATEGORY } from "./constants.js";

const SCENES = [
  {
    id: "order",
    tab: "Đơn hàng",
    node: "Đơn hàng",
    agents: [
      { name: "Order Agent", desc: "Đang kiểm tra trạng thái đơn..." },
      { name: "Support Agent", desc: "Đang chuẩn bị phản hồi..." },
    ],
    reply:
      "Đơn hàng của bạn đang ở bước **chuẩn bị giao**. Mình đã kiểm tra trạng thái và sẽ thông báo nếu có cập nhật mới.",
  },
  {
    id: "payment",
    tab: "Thanh toán",
    node: "Thanh toán",
    agents: [
      { name: "Payment Agent", desc: "Đang đối chiếu giao dịch..." },
      { name: "Support Agent", desc: "Đang tổng hợp thông tin..." },
    ],
    reply:
      "Mình có thể kiểm tra giao dịch giúp bạn. Hãy gửi **mã giao dịch hoặc ảnh biên lai** để mình xác minh chính xác.",
  },
  {
    id: "account",
    tab: "Tài khoản",
    node: "Tài khoản",
    agents: [
      { name: "Account Agent", desc: "Đang xác định vấn đề..." },
      { name: "Support Agent", desc: "Đang tìm hướng xử lý..." },
    ],
    reply:
      "Bạn thử chọn **Quên mật khẩu** tại trang đăng nhập nhé. Nếu vẫn không được, gửi mình ảnh lỗi để kiểm tra tiếp.",
  },
  {
    id: "bug",
    tab: "Báo lỗi",
    node: "Báo lỗi",
    agents: [
      { name: "Diagnostic Agent", desc: "Đang phân tích lỗi..." },
      { name: "Support Agent", desc: "Đang đề xuất giải pháp..." },
    ],
    reply:
      "Mình đã xác định được thông tin cần kiểm tra. Bạn gửi thêm **ảnh chụp màn hình lỗi** để mình hướng dẫn chính xác hơn.",
  },
];

const NODES = [
  "Đơn hàng", "Thanh toán", "Tài khoản", "Hoàn tiền",
  "Báo lỗi", "Nhiệm vụ", "Hình ảnh", "Zalo",
];

const CX = 180;
const CY = 140;
const RX = 132;
const RY = 94;

const NODE_POSITIONS = NODES.map((name, k) => {
  const a = (-90 + k * 45) * (Math.PI / 180);
  return {
    name,
    x: CX + RX * Math.cos(a),
    y: CY + RY * Math.sin(a),
  };
});

const bold = (s) =>
  s.split("**").map((p, i) => (i % 2 ? <b key={i}>{p}</b> : p));

const questionOf = (id) => SUGGESTIONS_BY_CATEGORY[id]?.[0] || "";

const INIT = { typed: "", sent: false, agents: [], reply: false, fade: false };

function usePlay(scene, restart, onEnd) {
  const [state, setState] = useState(INIT);

  useEffect(() => {
    setState(INIT);
    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    const q = questionOf(scene.id);

    let t = 600;

    for (let i = 1; i <= q.length; i++) {
      at(t + i * 25, () => setState((p) => ({ ...p, typed: q.slice(0, i) })));
    }
    t += q.length * 25 + 500;

    at(t, () => setState((p) => ({ ...p, typed: "", sent: true, agents: ["running", "queued"] })));
    t += 1300;

    at(t, () => setState((p) => ({ ...p, agents: ["done", "running"] })));
    t += 1200;

    at(t, () => setState((p) => ({ ...p, agents: ["done", "done"] })));
    t += 600;

    at(t, () => setState((p) => ({ ...p, reply: true })));
    t += 4000;

    at(t, () => setState((p) => ({ ...p, fade: true })));
    t += 500;

    at(t, onEnd);

    return () => timers.forEach(clearTimeout);
  }, [scene, restart, onEnd]);

  return state;
}

const STATUS = {
  running: "Running",
  queued: "Queued",
  done: "Completed",
};

export default function HomeDemo({ onTry }) {
  const [index, setIndex] = useState(0);
  const [restart, setRestart] = useState(0);

  const scene = SCENES[index];

  const s = usePlay(scene, restart, () => setIndex((x) => (x + 1) % SCENES.length));

  const bodyRef = useRef(null);
  const pinned = useRef(true);

  const running = s.agents.includes("running");
  const q = questionOf(scene.id);

  const onBodyScroll = () => {
    const el = bodyRef.current;
    if (el) {
      pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    }
  };

  useEffect(() => {
    pinned.current = true;
    if (bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  }, [index, restart]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el && pinned.current) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [s.sent, s.agents, s.reply]);

  return (
    <div className="nxh-sec nxh-demo">
      <div className="nxh-eyebrow">Xem NXX làm việc</div>

      <div className="nxh-stage">
        {/* AI NETWORK */}
        <svg className="nxh-graph" viewBox="0 0 360 300" fill="none" aria-hidden="true">
          <ellipse cx={CX} cy={CY} rx={RX} ry={RY} className="nxh-orbit" />

          {NODE_POSITIONS.map(({ name, x, y }) => {
            const on = running && name === scene.node;
            return (
              <g key={name}>
                <line x1={CX} y1={CY} x2={x} y2={y} className={on ? "nxh-ln on" : "nxh-ln"} />
                {on && (
                  <circle r="3" fill="#1686d6">
                    <animateMotion dur="1.2s" repeatCount="indefinite" path={`M${CX} ${CY} L${x} ${y}`} />
                  </circle>
                )}
              </g>
            );
          })}

          <rect x={CX - 34} y={CY - 15} width="68" height="30" rx="8" className="nxh-core" />
          <text x={CX} y={CY + 4.5} textAnchor="middle" className="nxh-nt core">NXX</text>
          
          <path
            transform={`translate(${CX - 11} ${CY - 44}) scale(.92)`}
            d="M12 0C12 6.6 17.4 12 24 12 17.4 12 12 17.4 12 24 12 17.4 6.6 12 0 12 6.6 12 12 6.6 12 0Z"
            fill="#f2a516"
          />

          {NODE_POSITIONS.map(({ name, x, y }) => {
            const on = running && name === scene.node;
            return (
              <g key={name}>
                <rect x={x - 34} y={y - 12} width="68" height="24" rx="8" className={on ? "nxh-nd on" : "nxh-nd"} />
                <text x={x} y={y + 4} textAnchor="middle" className={on ? "nxh-nt on" : "nxh-nt"}>
                  {name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* CHAT WINDOW */}
        <div className="nxh-win">
          <div className="nxh-wtabs">
            {["Home", "Company", "Cofounder", "Work", "Context"].map((tab, k) => (
              <button key={tab} type="button" className={k === 0 ? "active" : ""}>
                {tab}
              </button>
            ))}
          </div>

          <div className="nxh-wbwrap">
            <div className="nxh-wbody" ref={bodyRef} onScroll={onBodyScroll}>
              <div className="nxh-wflow" data-fade={s.fade}>
                {!s.sent && (
                  <div className="nxh-ai nxh-in">
                    <span className="nxh-dots" />
                    Chào bạn, NXX có thể giúp gì cho bạn hôm nay?
                  </div>
                )}

                {s.sent && (
                  <div className="nxh-b me nxh-in">{q}</div>
                )}

                {s.sent && !s.reply && s.agents.length > 0 && (
                  <div className="nxh-agents nxh-in">
                    {scene.agents.map((agent, k) => {
                      const status = s.agents[k];
                      return (
                        <div key={agent.name + k} className="nxh-agent" data-st={status}>
                          <div className="nxh-agent-icon">
                            {status === "done" ? (
                              <Check size={13} strokeWidth={3} />
                            ) : status === "running" ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <span className="nxh-agent-dot" />
                            )}
                          </div>

                          <div className="nxh-agent-info">
                            <b>{agent.name}</b>
                            <span>{agent.desc}</span>
                          </div>

                          <span className="nxh-agent-status">{STATUS[status]}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {s.reply && (
                  <div className="nxh-ai nxh-in">
                    <span className="nxh-dots" />
                    {bold(scene.reply)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="nxh-winput">
            <span className={s.typed ? "typed" : ""}>
              {s.typed || "Ask cofounder to spin up new tasks agents..."}
              {s.typed && <i className="nxh-caret" />}
            </span>
            <span className="nxh-wsend">
              <ArrowUp size={15} strokeWidth={2.6} />
            </span>
          </div>
        </div>
      </div>

      <button type="button" className="nxh-more" onClick={() => onTry({ text: q, category: scene.id })}>
        Thử hỏi câu này
        <ArrowRight size={15} />
      </button>
    </div>
  );
                }
              
            
            
