// src/components/profile/FollowButton.jsx — nút Theo dõi kiểu TikTok:
// chưa theo dõi → "Theo dõi"; đã theo dõi → "Đã theo dõi ▾" mở bảng chọn (Tùy chỉnh tên / Hủy theo dõi)
import React, { useEffect, useState } from "react";
import { ChevronDown, Pencil, UserCheck, UserMinus, UserPlus, X } from "lucide-react";
import { GH_BTN, GH_INK, GH_MUTED } from "./GhProfile.jsx";

const ROW =
  "flex w-full items-center justify-between rounded-xl bg-[#f6f8fa] px-4 py-4 text-left text-[16px] font-semibold transition active:scale-[0.99] dark:bg-[#21262d]";

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

  if (!following) {
    return (
      <button
        type="button"
        onClick={onFollow}
        disabled={busy}
        className={`${GH_BTN} w-full disabled:opacity-60`}
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
      <button type="button" onClick={() => setSheet(true)} className={`${GH_BTN} w-full`}>
        <UserCheck size={16} />
        Đã theo dõi
        <ChevronDown size={16} />
      </button>

      {/* BẢNG CHỌN (kéo từ dưới lên) */}
      {sheet && !editing && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50" onClick={() => setSheet(false)}>
          <div
            className="w-full rounded-t-3xl bg-white px-4 pb-8 pt-5 dark:bg-[#161b22]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className={`min-w-0 truncate text-[18px] font-bold ${GH_INK}`}>{nickname || name}</h3>
              <button
                type="button"
                aria-label="Đóng"
                onClick={() => setSheet(false)}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eaeef2] dark:bg-[#21262d] ${GH_INK}`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <button type="button" onClick={openEdit} className={`${ROW} ${GH_INK}`}>
                Tùy chỉnh tên
                <Pencil size={20} />
              </button>
              <button type="button" onClick={unfollow} className={`${ROW} ${GH_INK}`}>
                Hủy theo dõi
                <UserMinus size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HỘP THOẠI ĐẶT TÊN */}
      {editing && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-6"
          onClick={() => !saving && setEditing(false)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white dark:bg-[#161b22]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 pb-5 pt-6 text-center">
              <h3 className={`text-[20px] font-bold ${GH_INK}`}>Tùy chỉnh tên</h3>
              <p className={`mt-2 text-[14.5px] leading-6 ${GH_MUTED}`}>
                Hãy đặt cho người này một cái tên mà bạn quen thuộc. Chỉ bạn mới có thể nhìn thấy tên này.
              </p>
              <input
                autoFocus
                value={text}
                maxLength={40}
                onChange={(e) => setText(e.target.value)}
                placeholder={name}
                className={`mt-4 w-full rounded-xl bg-[#f1f3f5] px-4 py-3.5 text-[16px] outline-none dark:bg-[#0d1117] ${GH_INK}`}
              />
              {failed && (
                <p className="mt-2 text-[13px] font-medium text-rose-600">Chưa lưu được, bạn thử lại nhé.</p>
              )}
            </div>
            <div className="grid grid-cols-2 border-t border-[#d0d7de] dark:border-[#30363d]">
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={saving}
                className={`py-4 text-[16px] ${GH_MUTED}`}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className={`border-l border-[#d0d7de] py-4 text-[16px] font-bold disabled:opacity-60 dark:border-[#30363d] ${GH_INK}`}
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
