// src/pages/Support/HomeSections.jsx — các khối giới thiệu trên trang chủ chat AI (kiểu Cofounder)
import React from "react";
import { ArrowRight, Headphones } from "lucide-react";
import { Link } from "react-router-dom";
import { PixelScene } from "../help/HelpPixel.jsx";
import { SUPPORT } from "./constants.js";

const SUPPORT_TILES = [
  ["Trả lời tức thì", "NXX là trợ lý AI, hỏi lúc nào cũng có người đáp."],
  ["Gửi ảnh lỗi", "Chụp màn hình gửi vào chat, NXX đọc được ảnh."],
  ["Có người thật", `Nhân viên qua Zalo, ${SUPPORT.hours}.`],
  ["Xem lại chat cũ", "Mọi cuộc trò chuyện đều lưu trong lịch sử."],
];

export const SupportTiles = React.memo(function SupportTiles() {
  return (
    <div className="nxh-tiles">
      {SUPPORT_TILES.map(([title, desc]) => (
        <div key={title} className="nxh-tile">
          <b>{title}</b>
          <span>{desc}</span>
        </div>
      ))}
    </div>
  );
});

export const Statement = React.memo(function Statement() {
  return (
    <div className="nxh-sec">
      <h2 className="nxh-h">
        NXX là trợ lý AI giúp bạn xử lý đơn hàng, thanh toán và tài khoản{" "}
        <span>mà không phải chờ đợi.</span>
      </h2>
    </div>
  );
});

export const Features = React.memo(function Features({ onStart }) {
  return (
    <div className="nxh-sec" style={{ paddingTop: 44 }}>
      <div className="nxh-feat">
        <p>
          <b>AI trước, người thật sau</b> — NXX xử lý ngay những việc thường gặp, việc phức tạp thì chuyển nhân viên.
        </p>
        <p>
          <b>Hiểu cả hình ảnh</b> — Gửi ảnh biên lai hoặc ảnh lỗi, NXX đọc và hướng dẫn tiếp.
        </p>
        <p>
          <b>Dẫn thẳng tới đúng trang</b> — Câu trả lời kèm nút mở cửa hàng, nhiệm vụ, ví hoặc lịch sử đơn.
        </p>
      </div>
      <div className="nxh-cta">
        <h3>Hỏi NXX ngay.</h3>
        <p>Mô tả vấn đề bằng một câu, NXX lo phần còn lại.</p>
        <button type="button" className="nxh-btn dark" onClick={onStart}>
          Bắt đầu chat <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
});

export const FinalCard = React.memo(function FinalCard({ onStart }) {
  return (
    <>
      <div className="nxh-final">
        <PixelScene className="nxh-art" kind="flowers" seed={11} />
        <div className="nxh-final-in">
          <h2>NXX luôn sẵn sàng giúp bạn.</h2>
          <button type="button" className="nxh-btn white" onClick={onStart}>
            Bắt đầu chat
          </button>
          <a
            className="nxh-btn glass"
            href={SUPPORT.zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Headphones size={16} />
            Gặp nhân viên
          </a>
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
});
