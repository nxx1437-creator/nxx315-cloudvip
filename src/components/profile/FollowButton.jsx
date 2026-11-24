// src/components/profile/FollowButton.jsx — nút Theo dõi kiểu TikTok:
// chưa theo dõi → nút xanh "Theo dõi"; đã theo dõi → "Đã theo dõi ▾" mở bảng chọn (Tùy chỉnh tên / Hủy theo dõi)
import React, { useEffect, useState } from "react";
import { Check, ChevronDown, Pencil, UserMinus, UserPlus, X } from "lucide-react";
import { GH_INK, GH_MUTED } from "./GhProfile.jsx";

const BTN =
  "flex h-10 w-full items-center justify-center gap-2 rounded-lg text-[15px] font-semibold transition active:scale-[0.98] disabled:opacity-60";
const ROW =
  "flex w-full items-center justify-between rounded-2xl bg-white px-4 py-4 text-left text-[16px] font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition active:scale-[0.99] dark:bg-[#161b22]";

const KEYFRAMES =
  "@keyframes fbUp{from{transform:translateY(100%)}to{transform:none}}" +
  "@keyframes fbFade{from{opacity:0}to{opacity:1}}" +
  "@keyframes fbPop{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:none}}";

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
        className={`${BTN} bg-accent-500 text-white shadow-sm`}
      >
        <UserPlus size={18} />
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
        className={`${BTN} bg-[#eef0f3] text-[#1f2328] dark:bg-[#21262d] dark:text-[#e6edf3]`}
      >
        <Check size={18} />
        Đã theo dõi
        <ChevronDown size={16} className="opacity-70" />
      </button>

      {/* BẢNG CHỌN (kéo từ dưới lên) */}
      {sheet && !editing && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/45"
          style={{ animation: "fbFade .18s ease-out" }}
          onClick={() => setSheet(false)}
        >
          <div
            className="w-full rounded-t-[28px] bg-[#f3f4f6] px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 dark:bg-[#0d1117]"
            style={{ animation: "fbUp .22s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-black/15 dark:bg-white/20" />

            <div className="mb-4 flex items-center justify-between gap-3 px-1">
              <div className="min-w-0">
                <h3 className={`truncate text-[18px] font-bold leading-6 ${GH_INK}`}>{nickname || name}</h3>
                {nickname && <p className={`truncate text-[13px] leading-5 ${GH_MUTED}`}>{name}</p>}
              </div>
              <button
                type="button"
                aria-label="Đóng"
                onClick={() => setSheet(false)}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/[0.07] dark:bg-white/10 ${GH_INK}`}
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-2.5">
              <button type="button" onClick={openEdit} className={`${ROW} ${GH_INK}`}>
                Tùy chỉnh tên
                <Pencil size={19} />
              </button>
              <button type="button" onClick={unfollow} className={`${ROW} text-rose-600 dark:text-rose-400`}>
                Hủy theo dõi
                <UserMinus size={19} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HỘP THOẠI ĐẶT TÊN */}
      {editing && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-8"
          style={{ animation: "fbFade .18s ease-out" }}
          onClick={() => !saving && setEditing(false)}
        >
          <div
            className="w-full max-w-[320px] overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#161b22]"
            style={{ animation: "fbPop .18s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 pb-4 pt-5 text-center">
              <h3 className={`text-[18px] font-bold ${GH_INK}`}>Tùy chỉnh tên</h3>
              <p className={`mt-1.5 text-[13.5px] leading-5 ${GH_MUTED}`}>
                Đặt cho người này một cái tên bạn quen thuộc. Chỉ bạn mới nhìn thấy tên này.
              </p>

              <div className="relative mt-4">
                <input
                  autoFocus
                  value={text}
                  maxLength={40}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && save()}
                  placeholder={name}
                  className={`w-full rounded-lg bg-[#f1f3f5] py-3 pl-3.5 pr-12 text-left text-[15.5px] outline-none ring-1 ring-transparent transition focus:ring-accent-500 dark:bg-[#0d1117] ${GH_INK}`}
                />
                <span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] ${GH_MUTED}`}>
                  {text.length}/40
                </span>
              </div>

              {failed && <p className="mt-2 text-[13px] font-medium text-rose-600">Chưa lưu được, bạn thử lại nhé.</p>}
            </div>

            <div className="grid grid-cols-2 border-t border-black/[0.08] dark:border-white/10">
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={saving}
                className={`py-3.5 text-[15.5px] ${GH_MUTED}`}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="border-l border-black/[0.08] py-3.5 text-[15.5px] font-bold text-accent-500 disabled:opacity-60 dark:border-white/10"
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
