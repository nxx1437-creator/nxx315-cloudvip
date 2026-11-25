// src/pages/Support/PermissionSheet.jsx — hộp xin quyền: Đồng ý / Chỉ một lần / Từ chối (kèm hướng dẫn tự làm)
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Image as ImageIcon } from "lucide-react";

const PREFIX = "nxx_perm_";

export const PERMS = {
  camera: {
    name: "Máy ảnh",
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
    name: "Ảnh trong máy (Album)",
    desc: "NXX muốn xem ảnh bạn chọn để gửi cho hỗ trợ. NXX chỉ đọc ảnh bạn bấm chọn, không xem các ảnh khác.",
    Icon: ImageIcon,
    guide: [
      "Cách 1: bấm dấu + rồi chọn Chụp ảnh để chụp trực tiếp màn hình cần hỗ trợ.",
      "Cách 2: mô tả vấn đề bằng chữ, NXX vẫn hỗ trợ được mà không cần ảnh.",
      "Muốn bật lại: bấm dấu + > Album rồi chọn Đồng ý.",
      "Nếu trình duyệt vẫn chặn: bấm biểu tượng ổ khóa cạnh địa chỉ web > Quyền > Ảnh và tệp > Cho phép, rồi tải lại trang.",
    ],
  },
};

function isAlwaysAllowed(key) {
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

  const sheet = info ? (
    <>
      <div className="nxx-fade fixed inset-0 z-[60] bg-black/25 backdrop-blur-sm" onClick={() => settle(false)} />
      <div
        role="dialog"
        aria-modal="true"
        className="nxx-sheet-in fixed bottom-0 left-0 right-0 z-[70] mx-auto max-w-2xl rounded-t-[28px] border border-[#e6e6df] bg-[#fbfbf8] px-6 pb-[max(20px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_40px_rgba(0,0,0,0.12)]"
      >
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-[#e3e3dc]" />

        {!denied ? (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#f2f2ee] text-[#2b2b2b]">
              <info.Icon size={30} strokeWidth={1.7} />
            </div>
            <h3 className="mt-4 text-center text-[19px] font-medium tracking-[-0.01em] text-[#2b2b2b]">
              Yêu cầu quyền truy cập
            </h3>
            <p className="mt-2 text-center text-[16px] font-semibold text-[#2b2b2b]">{info.name}</p>
            <p className="mx-auto mt-1.5 max-w-[22rem] text-center text-[14.5px] leading-6 text-[#6f6f68]">{info.desc}</p>

            <div className="mt-6 space-y-2.5">
              <button
                type="button"
                onClick={allowAlways}
                className="h-[52px] w-full rounded-full bg-[#2b2b2b] text-[16px] font-medium text-white transition active:scale-[0.98]"
              >
                Đồng ý
              </button>
              <button
                type="button"
                onClick={allowOnce}
                className="h-[52px] w-full rounded-full border border-[#d9d9d0] bg-white text-[16px] font-medium text-[#2b2b2b] transition active:scale-[0.98]"
              >
                Chỉ một lần
              </button>
              <button
                type="button"
                onClick={deny}
                className="h-[52px] w-full rounded-full border border-[#d9d9d0] bg-white text-[16px] font-medium text-[#2b2b2b] transition active:scale-[0.98]"
              >
                Từ chối
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-center text-[19px] font-medium tracking-[-0.01em] text-[#2b2b2b]">Bạn đã từ chối</h3>
            <p className="mt-2 text-center text-[14.5px] leading-6 text-[#6f6f68]">
              Không sao nè, bạn có thể tự làm theo các bước sau:
            </p>
            <ol className="mt-4 list-decimal space-y-2.5 rounded-[20px] bg-[#f2f2ee] py-4 pl-9 pr-5 text-[14.5px] leading-6 text-[#2b2b2b]">
              {info.guide.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => settle(false)}
              className="mt-6 h-[52px] w-full rounded-full bg-[#2b2b2b] text-[16px] font-medium text-white transition active:scale-[0.98]"
            >
              Đã hiểu
            </button>
          </>
        )}
      </div>
    </>
  ) : null;

  return { ask, sheet };
}
