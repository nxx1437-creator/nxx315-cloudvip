// src/pages/Support/HomeSections.jsx — các khối giới thiệu trên trang chủ chat AI (kiểu Cofounder)
import React, { useEffect, useState } from "react";
import { ArrowRight, Headphones } from "lucide-react";
import { Link } from "react-router-dom";
import { PixelScene } from "../help/HelpPixel.jsx";
import { SUPPORT, SUGGESTIONS_BY_CATEGORY } from "./constants.js";

export const SupportTiles = () => (
  <div className="nxh-tiles">
    {[
      ["Trả lời tức thì", "NXX là trợ lý AI, hỏi lúc nào cũng có người đáp."],
      ["Gửi ảnh lỗi", "Chụp màn hình gửi vào chat, NXX đọc được ảnh."],
      ["Có người thật", `Nhân viên qua Zalo, ${SUPPORT.hours}.`],
      ["Xem lại chat cũ", "Mọi cuộc trò chuyện đều lưu trong lịch sử."],
    ].map(([t, d]) => (
      <div key={t} className="nxh-tile"><b>{t}</b><span>{d}</span></div>
    ))}
  </div>
);

export const Statement = () => (
  <div className="nxh-sec">
    <h2 className="nxh-h">
      NXX là trợ lý AI giúp bạn xử lý đơn hàng, thanh toán và tài khoản <span>mà không phải chờ đợi.</span>
    </h2>
  </div>
);

const DEMOS = [
  { id: "order", tab: "Đơn hàng", ai: "Đơn của bạn đang ở bước **chuẩn bị giao**. Có cập nhật mới mình sẽ báo ngay nha." },
  { id: "payment", tab: "Thanh toán", ai: "Bạn gửi giúp mình ảnh biên lai hoặc mã giao dịch, mình kiểm tra ngay nhé." },
  { id: "account", tab: "Tài khoản", ai: "Bạn dùng chức năng Quên mật khẩu ở trang đăng nhập, hoặc đăng nhập bằng Google nếu từng đăng ký như vậy." },
  { id: "bug", tab: "Báo lỗi", ai: "Bạn chụp màn hình lỗi gửi vào đây giúp mình, mình xem và hướng dẫn cách xử lý." },
];
const bold = (s) => s.split("**").map((p, i) => (i % 2 ? <b key={i}>{p}</b> : p));

export function DemoCard({ onTry }) {
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  useEffect(() => {
    if (hold) return undefined;
    const t = setInterval(() => setI((x) => (x + 1) % DEMOS.length), 6500);
    return () => clearInterval(t);
  }, [hold]);
  const d = DEMOS[i];
  const q = SUGGESTIONS_BY_CATEGORY[d.id]?.[0] || "";
  return (
    <div className="nxh-sec" style={{ paddingTop: 48 }}>
      <div className="nxh-eyebrow">Xem NXX trả lời thế nào</div>
      <div className="nxh-demo" onTouchStart={() => setHold(true)} onMouseEnter={() => setHold(true)}>
        <div className="nxh-tabs" role="tablist">
          {DEMOS.map((x, k) => (
            <button key={x.id} type="button" role="tab" aria-selected={k === i} onClick={() => { setHold(true); setI(k); }}>{x.tab}</button>
          ))}
        </div>
        <div className="nxh-demo-body" key={d.id}>
          <div className="nxh-b me">{q}</div>
          <div className="nxh-b ai">{bold(d.ai)}</div>
          <button type="button" className="nxh-try" onClick={() => onTry({ text: q, category: d.id })}>
            Hỏi câu này <ArrowRight size={15} />
          </button>
        </div>
      </div>
      <p className="nxh-cap" style={{ marginTop: 8, fontSize: 12.5, color: "#a2a29b" }}>Ví dụ minh họa. Câu trả lời thật phụ thuộc vào đơn và tài khoản của bạn.</p>
    </div>
  );
}

export const Features = ({ onStart }) => (
  <div className="nxh-sec" style={{ paddingTop: 44 }}>
    <div className="nxh-feat">
      <p style={{ margin: 0 }}><b>AI trước, người thật sau</b> — NXX xử lý ngay những việc thường gặp, việc phức tạp thì chuyển nhân viên.</p>
      <p style={{ margin: 0 }}><b>Hiểu cả hình ảnh</b> — Gửi ảnh biên lai hoặc ảnh lỗi, NXX đọc và hướng dẫn tiếp.</p>
      <p style={{ margin: 0 }}><b>Dẫn thẳng tới đúng trang</b> — Câu trả lời kèm nút mở cửa hàng, nhiệm vụ, ví hoặc lịch sử đơn.</p>
    </div>
    <div className="nxh-cta">
      <h3>Hỏi NXX ngay.</h3>
      <p>Mô tả vấn đề bằng một câu, NXX lo phần còn lại.</p>
      <button type="button" className="nxh-btn dark" onClick={onStart}>Bắt đầu chat <ArrowRight size={16} /></button>
    </div>
  </div>
);

export const FinalCard = ({ onStart }) => (
  <>
    <div className="nxh-final">
      <PixelScene className="nxh-art" kind="flowers" seed={11} />
      <div className="nxh-final-in">
        <h2>NXX luôn sẵn sàng giúp bạn.</h2>
        <button type="button" className="nxh-btn white" onClick={onStart}>Bắt đầu chat</button>
        <a className="nxh-btn glass" href={SUPPORT.zaloUrl} target="_blank" rel="noopener noreferrer"><Headphones size={16} />Gặp nhân viên</a>
      </div>
    </div>
    <div className="nxh-foot">
      <Link to="/help">Trung tâm trợ giúp</Link>
      <Link to="/contact">Liên hệ</Link>
      <Link to="/terms">Điều khoản</Link>
      <a href="mailto:support@nxx315.com">support@nxx315.com</a>
    </div>
  </>
);
