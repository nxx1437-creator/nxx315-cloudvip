// src/components/profile/EditProfileModal.jsx — màn hình "Chỉnh sửa trang cá nhân" (toàn màn hình, gọn kiểu GitHub)
// Trên cùng: TopHeader + chỉ một nút quay lại. Gồm: tên hiển thị (+ đổi avatar), tiêu đề hồ sơ, quyền riêng tư. Lưu bằng nút ở dưới.
import React, { useState } from "react";
import { ArrowLeft, Loader2, UserRoundPlus } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import TopHeader from "../TopHeader.jsx";
import { GH_INK, GH_LINE, GH_MUTED } from "./GhProfile.jsx";

const NAME_MAX = 20;
const HEAD_MAX = 80;

// công tắc đen/trắng
function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        checked ? "bg-[#1f2328] dark:bg-[#e6edf3]" : "bg-[#d0d7de] dark:bg-[#30363d]"
      }`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all dark:bg-[#0d1117] ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

export default function EditProfileModal({ profile, cooldown, onClose, onSaved, onAvatar }) {
  const [username, setUsername] = useState(profile.username || "");
  const [headline, setHeadline] = useState(profile.headline || "");
  const [showFollowing, setShowFollowing] = useState(profile.show_following !== false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const nameChanged = username.trim() !== (profile.username || "");
  const headChanged = headline.trim() !== (profile.headline || "");
  const privChanged = showFollowing !== (profile.show_following !== false);
  const dirty = nameChanged || headChanged || privChanged;
  const nameLocked = !cooldown.canChange;

  const handleSave = async () => {
    if (saving) return;
    const name = username.trim();
    const head = headline.replace(/\s+/g, " ").trim();

    if (nameChanged) {
      if (!name) return setError("Tên hiển thị không được để trống.");
      if (name.length < 3) return setError("Tên hiển thị phải có ít nhất 3 ký tự.");
      if (name.length > NAME_MAX) return setError(`Tên hiển thị không được quá ${NAME_MAX} ký tự.`);
      if (nameLocked) return setError(`Bạn chỉ có thể đổi tên sau ${cooldown.remainingText} nữa.`);
    }
    if (head.length > HEAD_MAX) return setError(`Tiêu đề hồ sơ không được quá ${HEAD_MAX} ký tự.`);

    const patch = {};
    if (nameChanged) {
      patch.username = name;
      patch.last_username_change = new Date().toISOString();
    }
    if (headChanged) patch.headline = head || null;
    if (privChanged) patch.show_following = showFollowing;
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

  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-white font-[Be_Vietnam_Pro] dark:bg-[#0d1117]">
      <TopHeader variant="gh" />

      {/* chỉ một nút quay lại */}
      <div className={`border-b bg-[#f6f8fa] dark:bg-[#161b22] ${GH_LINE}`}>
        <div className="mx-auto flex max-w-lg items-center px-2 py-1.5">
          <button
            type="button"
            onClick={onClose}
            aria-label="Quay lại"
            className={`flex h-9 w-9 items-center justify-center rounded-md ${GH_INK} hover:bg-black/5 dark:hover:bg-white/10`}
          >
            <ArrowLeft size={20} />
          </button>
        </div>
      </div>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-6 pt-4">
        <div className={`overflow-hidden rounded-md border ${GH_LINE}`}>
          {/* TÊN + AVATAR */}
          <div className={`flex items-start gap-3 border-b px-4 py-3.5 ${GH_LINE}`}>
            <label className="min-w-0 flex-1">
              <span className={`block text-[14px] font-semibold ${GH_INK}`}>Tên hiển thị</span>
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
                className={`mt-0.5 w-full bg-transparent text-[15px] outline-none placeholder:text-[#8c959f] disabled:cursor-not-allowed disabled:opacity-60 ${GH_INK}`}
              />
              <span className={`mt-0.5 block text-[12.5px] leading-4 ${GH_MUTED}`}>
                {nameLocked
                  ? `Đổi tên được sau ${cooldown.remainingText} nữa.`
                  : `Đổi được 1 lần mỗi 7 ngày · ${username.length}/${NAME_MAX}`}
              </span>
            </label>

            <button
              type="button"
              onClick={onAvatar}
              aria-label="Đổi ảnh đại diện"
              className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eaeef2] text-[#59636e] dark:bg-[#21262d] dark:text-[#9198a1]"
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserRoundPlus size={22} />
              )}
            </button>
          </div>

          {/* TIÊU ĐỀ HỒ SƠ */}
          <label className={`block border-b px-4 py-3.5 ${GH_LINE}`}>
            <span className={`block text-[14px] font-semibold ${GH_INK}`}>Tiêu đề hồ sơ</span>
            <textarea
              value={headline}
              onChange={(e) => {
                setHeadline(e.target.value.replace(/\n/g, " "));
                setError("");
              }}
              maxLength={HEAD_MAX}
              rows={2}
              placeholder="+ Viết tiêu đề cho hồ sơ của bạn"
              className={`mt-0.5 w-full resize-none bg-transparent text-[15px] leading-6 outline-none placeholder:text-[#8c959f] ${GH_INK}`}
            />
            <span className={`block text-right text-[12px] ${GH_MUTED}`}>
              {headline.length}/{HEAD_MAX}
            </span>
          </label>

          {/* QUYỀN RIÊNG TƯ */}
          <div className="px-4 py-3.5">
            <span className={`block text-[14px] font-semibold ${GH_INK}`}>Quyền riêng tư của trang cá nhân</span>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className={`text-[14.5px] ${GH_INK}`}>Hiện người mình đang theo dõi</p>
                <p className={`mt-0.5 text-[12.5px] leading-4 ${GH_MUTED}`}>
                  {showFollowing
                    ? "Công khai: ai xem hồ sơ cũng thấy danh sách bạn đang theo dõi."
                    : "Riêng tư: chỉ mình bạn thấy danh sách bạn đang theo dõi."}
                </p>
              </div>
              <Toggle
                checked={showFollowing}
                onChange={(v) => {
                  setShowFollowing(v);
                  setError("");
                }}
                label="Hiện người mình đang theo dõi"
              />
            </div>
          </div>
        </div>

        <p className={`mt-2.5 px-1 text-[12.5px] leading-5 ${GH_MUTED}`}>
          Tiêu đề hiển thị công khai ngay dưới tên của bạn.
        </p>

        {error && (
          <p className="mt-3 rounded-md border border-[#cf222e] bg-[#ffebe9] px-3 py-2 text-[13px] font-medium text-[#cf222e]">
            {error}
          </p>
        )}
      </main>

      {/* nút lưu */}
      <div
        className={`sticky bottom-0 border-t bg-white px-4 pt-3 dark:bg-[#0d1117] ${GH_LINE}`}
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !dirty}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-[#1f232826] bg-[#1f2328] px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-[#32383f] disabled:cursor-not-allowed disabled:border-[#d0d7de] disabled:bg-[#eaeef2] disabled:text-[#8c959f] dark:disabled:border-[#30363d] dark:disabled:bg-[#21262d]"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
