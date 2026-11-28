import React, { useEffect, useRef } from "react";

// Khung nhiệm vụ TASKVN (mã nhúng chính thức).
// Truyền userId = ID thành viên đang đăng nhập (Supabase auth user id).
// Khung chỉ hiện sau khi Admin Taskvn duyệt site nxx315.com.
const TASKVN_ORIGIN = "https://taskvn.site";
const TASKVN_SITE_KEY = "pk_7f32bf5db3e63f44e06f3397"; // key công khai, được phép để trong code

// UUID 36 ký tự làm khung Taskvn vỡ bố cục trên điện thoại (pill "ID: ..." quá dài).
// Rút gọn UUID thành 22 ký tự (base64url). Hàm taskvn-postback tự giải mã ngược lại.
function shortSub(userId) {
  const hex = String(userId).replace(/-/g, "");
  if (!/^[0-9a-f]{32}$/i.test(hex)) {
    return String(userId).replace(/[^\w.@:-]/g, "");
  }
  const bytes = hex.match(/.{2}/g).map((h) => parseInt(h, 16));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export default function TaskvnFrame({ userId, height = 800 }) {
  const boxRef = useRef(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || !userId) return undefined;

    const s = document.createElement("script");
    s.src = `${TASKVN_ORIGIN}/taskvn-embed.js`;
    s.async = true;
    s.setAttribute("data-key", TASKVN_SITE_KEY);
    s.setAttribute("data-sub", shortSub(userId));
    s.setAttribute("data-height", String(Number(height) || 800));
    box.appendChild(s);

    return () => {
      box.innerHTML = "";
    };
  }, [userId, height]);

  if (!userId) return null;
  return <div ref={boxRef} className="w-full overflow-hidden rounded-[2rem]" />;
}
