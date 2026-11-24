// src/components/profile/FollowButton.jsx — nút Theo dõi làm theo TikTok:
// chưa theo dõi → "Theo dõi"; đã theo dõi → "Đã theo dõi ▾" mở bảng chọn (Tùy chỉnh tên / Hủy theo dõi)
import React, { useEffect, useState } from "react";
import { Check, ChevronDown, Pencil, UserMinus, UserPlus, X } from "lucide-react";
import { GH_INK, GH_MUTED } from "./GhProfile.jsx";

// nút trên trang: viên thuốc nhỏ, không kéo dài hết chiều ngang
const BTN =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-5 text-[14.5px] font-semibold transition active:scale-[0.97] disabled:opacity-60";
// mục trong bảng chọn: thẻ trắng bo nhẹ, cao 52px
const ROW =
  "flex h-[52px] w-full items-center justify-between rounded-xl bg-white px-4 text-left text-[15px] font-semibold transition active:bg-[#f2f2f2] dark:bg-[#161b22] dark:active:bg-[#21262d]";

const KEYFRAMES =
  "@keyframes fbUp{from{transform:translateY(100%)}to{transform:none}}" +
  "@keyframes fbFade{from{opacity:0}to{opacity:1}}" +
  "@keyframes fbPop{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:none}}";

export default function FollowButton({
  following,
  busy = false,
  name = "",
  nickname = "",
  onFollow,
  onUnfollow,
  onSaveNickname,
}) {
  const [sheet, setSheet] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  // bỏ theo dõi xong thì đóng hết bảng/hộp thoại
  useEffect(() => {
    if (!following) {
      setSheet(false);
      setEditing(false);
    }
  }, [following]);

  // khóa cuộn trang nền khi bảng/hộp thoại đang mở
  useEffect(() => {
    if (!sheet && !editing) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheet, editing]);

  if (!following) {
    return (
      <button
        type="button"
        onClick={onFollow}
        disabled={busy}
        className={`${BTN} bg-accent-500 text-white`}
      >
        <UserPlus size={16} />
        Theo dõi
      </button>
    );
  }

  const openEdit = () => {
    setText(nickname || "");
    setFailed(false);
    setEditing(true);
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    setFailed(false);
    const ok = await onSaveNickname(text);
    setSaving(false);
    if (ok) {
      setEditing(false);
      setSheet(false);
    } else {
      setFailed(true);
    }
  };

  const unfollow = () => {
    setSheet(false);
    onUnfollow();
  };

  return (
    <>
      <style>{KEYFRAMES}</style>

      <button
        type="button"
        onClick={() => setSheet(true)}
        className={`${BTN} bg-[#efeff1] text-[#1f2328] dark:bg-[#21262d] dark:text-[#e6edf3]`}
      >
        Đã theo dõi
        <ChevronDown size={15} strokeWidth={2.5} />
      </button>

      {/* BẢNG CHỌN (kéo từ dưới lên, giống TikTok: không có thanh kéo, tiêu đề một dòng) */}
      {sheet && !editing && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/50"
          style={{ animation: "fbFade .16s ease-out" }}
          onClick={() => setSheet(false)}
        >
          <div
            className="w-full rounded-t-[20px] bg-[#fafafa] px-4 pb-5 pt-4 dark:bg-[#0d1117]"
            style={{ animation: "fbUp .2s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className={`min-w-0 truncate text-[17px] font-bold ${GH_INK}`}>{nickname || name}</h3>
              <button
                type="button"
                aria-label="Đóng"
                onClick={() => setSheet(false)}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/[0.07] dark:bg-white/10 ${GH_INK}`}
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-2.5">
              <button type="button" onClick={openEdit} className={`${ROW} ${GH_INK}`}>
                Tùy chỉnh tên
                <Pencil size={20} strokeWidth={1.75} />
              </button>
              <button type="button" onClick={unfollow} className={`${ROW} ${GH_INK}`}>
                Hủy theo dõi
                <UserMinus size={20} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HỘP THOẠI ĐẶT TÊN (rộng 280px như TikTok) */}
      {editing && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-6"
          style={{ animation: "fbFade .16s ease-out" }}
          onClick={() => !saving && setEditing(false)}
        >
          <div
            className="w-[280px] max-w-full overflow-hidden rounded-[20px] bg-white dark:bg-[#161b22]"
            style={{ animation: "fbPop .16s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 pb-5 pt-5 text-center">
              <h3 className={`text-[18px] font-bold leading-6 ${GH_INK}`}>Tùy chỉnh tên</h3>
              <p className={`mt-2 text-[14px] leading-[19px] ${GH_MUTED}`}>
                Hãy đặt cho người này một cái tên mà bạn quen thuộc. Chỉ bạn mới có thể nhìn thấy tên này.
              </p>
              <input
                autoFocus
                value={text}
                maxLength={40}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && save()}
                placeholder={name}
                className={`mt-4 h-12 w-full rounded-xl bg-[#f2f2f2] px-3 text-left text-[16px] outline-none dark:bg-[#0d1117] ${GH_INK}`}
              />
              {failed && <p className="mt-2 text-[13px] font-medium text-rose-600">Chưa lưu được, bạn thử lại nhé.</p>}
            </div>

            <div className="grid grid-cols-2 border-t border-black/[0.08] dark:border-white/10">
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={saving}
                className={`h-12 text-[16px] ${GH_MUTED}`}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className={`h-12 border-l border-black/[0.08] text-[16px] font-bold disabled:opacity-60 dark:border-white/10 ${GH_INK}`}
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
