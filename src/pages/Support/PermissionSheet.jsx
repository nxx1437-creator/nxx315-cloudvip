// src/pages/Support/PermissionSheet.jsx — hộp xin quyền: Đồng ý / Chỉ một lần / Từ chối (kèm hướng dẫn tự làm)
// Giao diện theo mẫu bảng "Đã tạm dừng" của Claude: thẻ trắng nổi, bo góc 4 phía, tiêu đề serif, không icon, 3 nút bầu dục gọn
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Image as ImageIcon, LifeBuoy, ShieldCheck } from "lucide-react";

const PREFIX = "nxx_perm_";
// Font Anthropic là bản quyền, dùng Source Serif 4 (hỗ trợ tiếng Việt) là bản miễn phí gần giống nhất
const SERIF = { fontFamily: '"Source Serif 4", "Tiempos Headline", Georgia, "Times New Roman", serif', fontWeight: 600 };
const FONT_ID = "nxx-font-source-serif";
const FONT_HREF = "https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,500;8..60,600&display=swap";

function ensureSerifFont() {
  if (typeof document === "undefined" || document.getElementById(FONT_ID)) return;
  const link = document.createElement("link");
  link.id = FONT_ID;
  link.rel = "stylesheet";
  link.href = FONT_HREF;
  document.head.appendChild(link);
}

export const PERMS = {
  camera: {
    name: "máy ảnh",
    desc: "NXX muốn mở máy ảnh để bạn chụp ảnh lỗi hoặc đơn hàng gửi cho hỗ trợ.",
    Icon: Camera,
    guide: [
      "Cách 1: bấm dấu + rồi chọn Album, chọn ảnh bạn đã chụp sẵn trong máy.",
      "Cách 2: mở app Máy ảnh của điện thoại, chụp màn hình cần hỗ trợ, rồi quay lại đây chọn ảnh đó ở Album.",
      "Muốn bật lại: bấm dấu + > Chụp ảnh rồi chọn Đồng ý.",
      "Nếu trình duyệt vẫn chặn: bấm biểu tượng ổ khóa cạnh địa chỉ web > Quyền > Máy ảnh > Cho phép, rồi tải lại trang.",
    ],
  },
  photos: {
    name: "ảnh trong máy",
    desc: "NXX muốn xem ảnh bạn chọn để gửi cho hỗ trợ. NXX chỉ đọc ảnh bạn bấm chọn, không xem các ảnh khác.",
    Icon: ImageIcon,
    guide: [
      "Cách 1: bấm dấu + rồi chọn Chụp ảnh để chụp trực tiếp màn hình cần hỗ trợ.",
      "Cách 2: mô tả vấn đề bằng chữ, NXX vẫn hỗ trợ được mà không cần ảnh.",
      "Muốn bật lại: bấm dấu + > Album rồi chọn Đồng ý.",
      "Nếu trình duyệt vẫn chặn: bấm biểu tượng ổ khóa cạnh địa chỉ web > Quyền > Ảnh và tệp > Cho phép, rồi tải lại trang.",
    ],
  },
  account: {
    name: "kiểm tra tài khoản",
    desc: "NXX muốn xem đơn hàng, số dư Coin và tình trạng tài khoản của bạn để trả lời chính xác. NXX chỉ đọc, không thay đổi gì.",
    Icon: ShieldCheck,
    guide: [
      "Xem đơn hàng: vào Lịch sử đơn, bấm vào đơn cần kiểm tra để xem trạng thái và mã đơn (dạng RBX-xxxxx).",
      "Xem số dư: vào Ví để xem số Coin và các lần cộng/trừ gần đây.",
      "Quay lại đây và gõ mã đơn hoặc nội dung bạn thấy, NXX sẽ hướng dẫn tiếp mà không cần xem tài khoản của bạn.",
      "Muốn NXX tự kiểm tra cho nhanh: gửi lại tin nhắn và chọn Đồng ý.",
    ],
  },
  ticket: {
    name: "tạo yêu cầu hỗ trợ",
    desc: "NXX muốn tạo giúp bạn một yêu cầu hỗ trợ để nhân viên xử lý vấn đề này. Bạn sẽ nhận mã yêu cầu để theo dõi.",
    Icon: LifeBuoy,
    guide: [
      "Vào Trung tâm trợ giúp, chọn Gửi yêu cầu, chọn nhóm vấn đề rồi mô tả chi tiết (kèm ảnh nếu có).",
      "Ghi rõ mã đơn (RBX-xxxxx), số tiền và thời gian xảy ra để nhân viên xử lý nhanh hơn.",
      "Cách khác: nhắn Zalo 0865245988 trong giờ hỗ trợ 12:00 - 13:00 (T2 - CN).",
      "Muốn NXX tạo giúp: gửi lại tin nhắn và chọn Đồng ý.",
    ],
  },
};

export function isAlwaysAllowed(key) {
  try {
    return localStorage.getItem(PREFIX + key) === "always";
  } catch {
    return false;
  }
}

// const { ask, sheet } = usePermissionSheet();  ->  const ok = await ask("camera");  rồi render {sheet}
export function usePermissionSheet() {
  const [req, setReq] = useState(null); // { key }
  const [denied, setDenied] = useState(false);
  const resolver = useRef(null);

  useEffect(() => {
    ensureSerifFont();
  }, []);

  const settle = useCallback((ok) => {
    const r = resolver.current;
    resolver.current = null;
    setReq(null);
    setDenied(false);
    if (r) r(ok);
  }, []);

  const ask = useCallback((key) => {
    if (!PERMS[key]) return Promise.resolve(true);
    if (isAlwaysAllowed(key)) return Promise.resolve(true);
    if (resolver.current) resolver.current(false); // có hộp cũ chưa trả lời thì huỷ
    return new Promise((resolve) => {
      resolver.current = resolve;
      setDenied(false);
      setReq({ key });
    });
  }, []);

  useEffect(
    () => () => {
      if (resolver.current) resolver.current(false);
    },
    []
  );

  const allowAlways = () => {
    try {
      localStorage.setItem(PREFIX + req.key, "always");
    } catch {
      // không lưu được thì lần sau hỏi lại
    }
    settle(true);
  };
  const allowOnce = () => settle(true); // không lưu: lần sau hỏi lại
  const deny = () => setDenied(true); // hiện hướng dẫn tự làm

  const info = req ? PERMS[req.key] : null;

  const primaryBtn =
    "h-[42px] w-full rounded-full bg-[#0f0f0e] text-[15.5px] font-medium text-white transition active:scale-[0.98]";
  const outlineBtn =
    "h-[42px] w-full rounded-full border border-[#e4e2dc] bg-[#fbfaf8] text-[15.5px] font-medium text-[#141413] transition active:scale-[0.98]";

  const sheet = info ? (
    <>
      <div className="nxx-fade fixed inset-0 z-[60] bg-black/20" onClick={() => settle(false)} />
      <div
        role="dialog"
        aria-modal="true"
        className="nxx-sheet-in fixed bottom-[max(12px,env(safe-area-inset-bottom))] left-3 right-3 z-[70] mx-auto max-h-[88vh] max-w-2xl overflow-y-auto rounded-[28px] bg-white px-7 pb-6 pt-8 shadow-[0_8px_40px_rgba(0,0,0,0.16)]"
      >
        {!denied ? (
          <>
            <h3
              className="text-center text-[22px] leading-tight tracking-[-0.01em] text-[#141413]"
              style={SERIF}
            >
              Yêu cầu quyền truy cập
            </h3>
            <p className="mt-4 text-center text-[15.5px] leading-[1.6] text-[#3d3d3a]">{info.desc}</p>
            <p className="mt-3 text-center text-[15.5px] text-[#141413]">
              Quyền: <span className="font-mono text-[14.5px]">{info.name}</span>
            </p>

            <div className="mt-6 space-y-3">
              <button type="button" onClick={allowAlways} className={primaryBtn}>
                Đồng ý
              </button>
              <button type="button" onClick={allowOnce} className={outlineBtn}>
                Chỉ một lần
              </button>
              <button type="button" onClick={deny} className={outlineBtn}>
                Từ chối
              </button>
            </div>
          </>
        ) : (
          <>
            <h3
              className="text-center text-[22px] leading-tight tracking-[-0.01em] text-[#141413]"
              style={SERIF}
            >
              Bạn đã từ chối
            </h3>
            <p className="mt-4 text-center text-[15.5px] leading-[1.6] text-[#3d3d3a]">
              Không sao nè, bạn có thể tự làm theo các bước sau:
            </p>
            <ol className="mt-4 list-decimal space-y-2.5 pl-5 text-[15px] leading-[1.6] text-[#3d3d3a]">
              {info.guide.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <div className="mt-6">
              <button type="button" onClick={() => settle(false)} className={primaryBtn}>
                Đã hiểu
              </button>
            </div>
          </>
        )}
      </div>
    </>
  ) : null;

  return { ask, sheet };
}
