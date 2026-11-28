// src/components/profile/EditProfileModal.jsx — màn hình "Chỉnh sửa trang cá nhân" (toàn màn hình, kiểu thẻ bo góc có đường kẻ)
// Gồm: tên hiển thị (+ nút đổi avatar), tiêu đề hồ sơ. Bấm "Xong" để lưu.
import React, { useState } from "react";
import { Loader2, UserRoundPlus, X } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import { GH_INK, GH_LINE, GH_MUTED } from "./GhProfile.jsx";

const NAME_MAX = 20;
const HEAD_MAX = 80;

export default function EditProfileModal({ profile, cooldown, onClose, onSaved, onAvatar }) {
  const [username, setUsername] = useState(profile.username || "");
  const [headline, setHeadline] = useState(profile.headline || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const nameChanged = username.trim() !== (profile.username || "");
  const headChanged = headline.trim() !== (profile.headline || "");
  const dirty = nameChanged || headChanged;

  const handleSave = async () => {
    if (saving) return;
    const name = username.trim();
    const head = headline.replace(/\s+/g, " ").trim();

    if (nameChanged) {
      if (!name) return setError("Tên hiển thị không được để trống.");
      if (name.length < 3) return setError("Tên hiển thị phải có ít nhất 3 ký tự.");
      if (name.length > NAME_MAX) return setError(`Tên hiển thị không được quá ${NAME_MAX} ký tự.`);
      if (!cooldown.canChange) return setError(`Bạn chỉ có thể đổi tên sau ${cooldown.remainingText} nữa.`);
    }
    if (head.length > HEAD_MAX) return setError(`Tiêu đề hồ sơ không được quá ${HEAD_MAX} ký tự.`);

    const patch = {};
    if (nameChanged) {
      patch.username = name;
      patch.last_username_change = new Date().toISOString();
    }
    if (headChanged) patch.headline = head || null;
    if (!Object.keys(patch).length) return onClose();

    setSaving(true);
    setError("");
    const { error: updateError } = await supabase.from("profiles").update(patch).eq("id", profile.id);
    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    // báo cho khung hồ sơ tải lại tiêu đề mới
    try {
      window.dispatchEvent(new Event("profile-headline-changed"));
    } catch {}
    onSaved(patch);
  };

  const nameLocked = !cooldown.canChange;

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-white font-[Be_Vietnam_Pro] dark:bg-[#0d1117]">
      {/* Thanh trên: X · tiêu đề · Xong */}
      <header
        className={`sticky top-0 z-10 flex items-center gap-3 border-b bg-white/95 px-4 py-3.5 backdrop-blur dark:bg-[#0d1117]/95 ${GH_LINE}`}
        style={{ paddingTop: "max(14px, env(safe-area-inset-top))" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${GH_INK} hover:bg-[#f6f8fa] dark:hover:bg-[#161b22]`}
        >
          <X size={22} />
        </button>
        <h2 className={`min-w-0 flex-1 truncate text-[17px] font-semibold ${GH_INK}`}>Chỉnh sửa trang cá nhân</h2>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty}
          className={`flex h-9 shrink-0 items-center justify-center rounded-md px-3 text-[15px] font-semibold transition ${
            dirty && !saving ? "text-[#0969da] hover:bg-[#f6f8fa] dark:hover:bg-[#161b22]" : "text-[#8c959f]"
          }`}
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : "Xong"}
        </button>
      </header>

      <main className="mx-auto w-full max-w-lg px-4 pb-16 pt-6">
        <div className={`overflow-hidden rounded-2xl border ${GH_LINE}`}>
          {/* TÊN + AVATAR */}
          <div className={`flex items-start gap-3 border-b px-4 py-4 ${GH_LINE}`}>
            <label className="min-w-0 flex-1">
              <span className={`block text-[15px] font-semibold ${GH_INK}`}>Tên hiển thị</span>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                disabled={nameLocked}
                maxLength={NAME_MAX}
                placeholder="Tên của bạn"
                className={`mt-1 w-full bg-transparent text-[16px] outline-none placeholder:text-[#8c959f] disabled:cursor-not-allowed disabled:opacity-60 ${GH_INK}`}
              />
              <span className={`mt-1 block text-[12.5px] ${GH_MUTED}`}>
                {nameLocked
                  ? `Bạn có thể đổi tên sau ${cooldown.remainingText} nữa.`
                  : `Đổi được 1 lần mỗi 7 ngày · ${username.length}/${NAME_MAX} ký tự`}
              </span>
            </label>

            <button
              type="button"
              onClick={onAvatar}
              aria-label="Đổi ảnh đại diện"
              className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eaeef2] text-[#59636e] dark:bg-[#21262d] dark:text-[#9198a1]"
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserRoundPlus size={26} />
              )}
            </button>
          </div>

          {/* TIÊU ĐỀ HỒ SƠ */}
          <label className="block px-4 py-4">
            <span className={`block text-[15px] font-semibold ${GH_INK}`}>Tiêu đề hồ sơ</span>
            <textarea
              value={headline}
              onChange={(e) => {
                setHeadline(e.target.value.replace(/\n/g, " "));
                setError("");
              }}
              maxLength={HEAD_MAX}
              rows={2}
              placeholder="+ Viết tiêu đề cho hồ sơ của bạn"
              className={`mt-1 w-full resize-none bg-transparent text-[16px] leading-6 outline-none placeholder:text-[#8c959f] ${GH_INK}`}
            />
            <span className={`block text-right text-[12.5px] ${GH_MUTED}`}>
              {headline.length}/{HEAD_MAX}
            </span>
          </label>
        </div>

        <p className={`mt-3 px-1 text-[13px] leading-5 ${GH_MUTED}`}>
          Tiêu đề hiển thị công khai ngay dưới tên của bạn, ai vào xem hồ sơ cũng thấy.
        </p>

        {error && (
          <p className="mt-4 rounded-md border border-[#cf222e] bg-[#ffebe9] px-3 py-2.5 text-[13.5px] font-medium text-[#cf222e]">
            {error}
          </p>
        )}
      </main>
    </div>
  );
}
