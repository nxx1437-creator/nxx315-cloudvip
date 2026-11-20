// src/pages/Support/HomeDemo.jsx — thẻ minh họa tự chạy kiểu Cofounder: vòng sơ đồ + khung ứng dụng có tab
import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUp } from "lucide-react";
import { SUGGESTIONS_BY_CATEGORY } from "./constants.js";

// Mỗi tab chat liên tiếp nhiều câu; câu đầu lấy từ constants.js, các câu sau viết ở đây.
// think: dòng trạng thái thứ 2 (dòng thứ 1 luôn là "Đang suy nghĩ...")
// done: chữ hiện khi hoàn tất
const SCENES = [
  { id: "order", tab: "Đơn hàng", node: "Đơn hàng", turns: [
    { q: "Đơn của mình đang ở trạng thái nào?", think: "Đang kiểm tra đơn hàng...", done: "Đã kiểm tra đơn hàng",
      a: "Đơn của bạn đang ở bước **chuẩn bị giao**. Có cập nhật mới mình sẽ báo ngay." },
    { q: "Khi nào mình nhận được hàng?", think: "Đang tra thời gian giao...", done: "Đã tra thời gian giao",
      a: "Dự kiến **1–2 ngày** nữa là tới. Đơn xuất kho mình sẽ nhắn bạn liền." },
    { q: "Mình đổi địa chỉ nhận được không?", think: "Đang kiểm tra khả năng đổi...", done: "Đã kiểm tra khả năng đổi",
      a: "Đơn chưa giao nên **đổi được**. Bạn gửi địa chỉ mới vào đây giúp mình nhé." },
  ] },
  { id: "payment", tab: "Thanh toán", node: "Thanh toán", turns: [
    { q: "Mình thanh toán rồi mà chưa thấy cập nhật.", think: "Đang kiểm tra thanh toán...", done: "Đã kiểm tra thanh toán",
      a: "Bạn gửi giúp mình **ảnh biên lai hoặc mã giao dịch**, mình sẽ đối chiếu ngay." },
    { q: "Mình vừa gửi mã giao dịch rồi đó.", think: "Đang đối chiếu giao dịch...", done: "Đã đối chiếu giao dịch",
      a: "Mình thấy giao dịch rồi, đang **chờ ngân hàng xác nhận**. Thường mất vài phút." },
    { q: "Có bị trừ tiền hai lần không?", think: "Đang kiểm tra lịch sử giao dịch...", done: "Đã kiểm tra lịch sử giao dịch",
      a: "Không có giao dịch trùng. Nếu có phát sinh, mình sẽ **hoàn lại** cho bạn." },
  ] },
  { id: "account", tab: "Tài khoản", node: "Tài khoản", turns: [
    { q: "Mình quên mật khẩu, đăng nhập không được.", think: "Đang xác định vấn đề...", done: "Đã xác định vấn đề",
      a: "Bạn bấm **Quên mật khẩu** ở trang đăng nhập để đặt lại nhé." },
    { q: "Mình không nhận được email đặt lại.", think: "Đang kiểm tra email đăng ký...", done: "Đã kiểm tra email đăng ký",
      a: "Bạn xem thêm mục **Thư rác (Spam)**, hoặc đăng nhập bằng Google nếu từng đăng ký như vậy." },
    { q: "Mình muốn đổi email tài khoản.", think: "Đang kiểm tra tài khoản...", done: "Đã kiểm tra tài khoản",
      a: "Bạn vào **Cài đặt tài khoản** để đổi email. Cần hỗ trợ thì cứ nhắn mình." },
  ] },
  { id: "bug", tab: "Báo lỗi", node: "Báo lỗi", turns: [
    { q: "Trang bị lỗi, mình không bấm được nút.", think: "Đang đọc mô tả lỗi...", done: "Đã đọc mô tả lỗi",
      a: "Bạn **chụp màn hình lỗi** gửi vào đây giúp mình nhé." },
    { q: "Mình gửi ảnh rồi nè.", think: "Đang phân tích hình ảnh...", done: "Đã phân tích hình ảnh",
      a: "Mình thấy rồi, có vẻ do **trang chưa tải xong**. Bạn thử tải lại trang xem sao." },
    { q: "Tải lại rồi mà vẫn lỗi.", think: "Đang tìm cách xử lý...", done: "Đã tìm cách xử lý",
      a: "Bạn **thoát và đăng nhập lại**. Nếu vẫn lỗi, mình chuyển cho bộ phận kỹ thuật." },
  ] },
];

// 8 nút nằm trên một vòng elip quanh tâm
const CX = 180, CY = 140, RX = 132, RY = 94;
const NODES = ["Đơn hàng", "Thanh toán", "Tài khoản", "Hoàn tiền", "Báo lỗi", "Nhiệm vụ", "Hình ảnh", "Zalo"].map((name, k) => {
  const a = (-90 + k * 45) * (Math.PI / 180);
  return { name, x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a) };
});
const bold = (s) => s.split("**").map((p, i) => (i % 2 ? <b key={i}>{p}</b> : p));
const questionOf = (id) => SUGGESTIONS_BY_CATEGORY[id]?.[0] || "";
// câu đầu ưu tiên lấy từ constants.js (để khớp nút "Thử hỏi câu này")
const turnsOf = (scene) => scene.turns.map((t, k) => (k === 0 ? { ...t, q: questionOf(scene.id) || t.q } : t));

// stage: 0 = vừa gửi câu hỏi, 1 = "Đang suy nghĩ...", 2 = đang kiểm tra, 3 = hoàn tất + trả lời
const INIT = { typed: "", turns: [], fade: false };

function usePlay(scene, restart, onEnd) {
  const [s, set] = useState(INIT);
  useEffect(() => {
    set(INIT);
    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    const list = turnsOf(scene);
    let t = 700;
    list.forEach((turn, k) => {
      const q = turn.q;
      const setStage = (n) => set((p) => ({ ...p, turns: p.turns.map((x, j) => (j === k ? { ...x, stage: n } : x)) }));
      for (let i = 1; i <= q.length; i++) at(t + i * 30, () => set((p) => ({ ...p, typed: q.slice(0, i) })));
      t += q.length * 30 + 400;
      at(t, () => set((p) => ({ ...p, typed: "", turns: [...p.turns, { q, stage: 0 }] }))); t += 500;
      at(t, () => setStage(1)); t += 1200;   // Đang suy nghĩ...
      at(t, () => setStage(2)); t += 1600;   // Đang kiểm tra...
      at(t, () => setStage(3)); t += 1800;   // Hoàn tất + trả lời
    });
    t += 1800;
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
  const bodyRef = useRef(null);
  const flowRef = useRef(null);
  const pinned = useRef(true);      // đang bám đáy thì tự cuộn theo tin mới
  const userRef = useRef(false);    // true khi người dùng đang chạm/lăn thật
  const userT = useRef(0);
  const running = s.turns.some((x) => x.stage === 1 || x.stage === 2);
  const q = questionOf(scene.id) || scene.turns[0].q;

  // chỉ coi là "kéo lên xem lại" khi có thao tác thật của người dùng
  const touch = () => {
    userRef.current = true;
    clearTimeout(userT.current);
    userT.current = setTimeout(() => { userRef.current = false; }, 900);
  };
  const onBodyScroll = () => {
    const el = bodyRef.current;
    if (el && userRef.current) pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
  };
  const toBottom = () => {
    const el = bodyRef.current;
    if (el && pinned.current) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  // về đầu khi đổi tab
  useEffect(() => { pinned.current = true; if (bodyRef.current) bodyRef.current.scrollTop = 0; }, [i, restart]);
  // nội dung dài ra lúc nào là cuộn xuống đáy lúc đó (không bị cắt dòng cuối)
  useEffect(() => {
    const flow = flowRef.current;
    if (!flow || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(toBottom);
    ro.observe(flow);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const id = requestAnimationFrame(toBottom);
    return () => cancelAnimationFrame(id);
  }, [s.turns]);
  useEffect(() => () => clearTimeout(userT.current), []);

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
            <div className="nxh-wbody" ref={bodyRef} onScroll={onBodyScroll}
              onTouchStart={touch} onTouchMove={touch} onTouchEnd={touch} onWheel={touch} onMouseDown={touch}>
              <div className="nxh-wflow" ref={flowRef} data-fade={s.fade}>
                {s.turns.length === 0 && <p className="nxh-ai nxh-in"><span className="nxh-dots" />Chào bạn, NXX giúp gì cho bạn nè?</p>}
                {s.turns.map((turn, k) => {
                  const d = scene.turns[k];
                  const run = turn.stage === 1 || turn.stage === 2;
                  return (
                    <React.Fragment key={k}>
                      <div className="nxh-b me nxh-in">{turn.q}</div>
                      {turn.stage >= 1 && (
                        <p key={turn.stage} className={run ? "nxh-st run" : "nxh-st nxh-in"}>
                          {turn.stage === 1 ? "Đang suy nghĩ..." : turn.stage === 2 ? d.think : d.done}
                        </p>
                      )}
                      {turn.stage >= 3 && <p className="nxh-ai nxh-in"><span className="nxh-dots" />{bold(d.a)}</p>}
                    </React.Fragment>
                  );
                })}
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
                
