import React, { useEffect, useRef } from "react";

// Khung nhiệm vụ TASKVN (mã nhúng chính thức).
// Truyền userId = ID thành viên đang đăng nhập (Supabase auth user id).
// Khung chỉ hiện sau khi Admin Taskvn duyệt site nxx315.com.
const TASKVN_ORIGIN = "https://taskvn.site";
const TASKVN_SITE_KEY = "pk_3aebd2e629e06791cff5af46"; // key công khai, được phép để trong code

export default function TaskvnFrame({ userId, height = 800 }) {
  const boxRef = useRef(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || !userId) return undefined;

    const s = document.createElement("script");
    s.src = `${TASKVN_ORIGIN}/taskvn-embed.js`;
    s.async = true;
    s.setAttribute("data-key", TASKVN_SITE_KEY);
    s.setAttribute("data-sub", String(userId).replace(/[^\w.@:-]/g, ""));
    s.setAttribute("data-height", String(Number(height) || 800));
    box.appendChild(s);

    return () => {
      box.innerHTML = "";
    };
  }, [userId, height]);

  if (!userId) return null;
  return <div ref={boxRef} className="w-full overflow-hidden rounded-[2rem]" />;
}
