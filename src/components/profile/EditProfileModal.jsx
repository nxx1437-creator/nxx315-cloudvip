// src/components/profile/EditProfileModal.jsx — "Chỉnh sửa trang cá nhân" (toàn màn hình, gọn kiểu GitHub / Threads)
// Màn chính: TopHeader + nút quay lại + thẻ các dòng. Bấm một dòng → mở màn riêng (X · tiêu đề · ✓).
// ✓ chỉ áp thay đổi vào màn chính; nút "Lưu thay đổi" ở đáy mới ghi lên server.
// Thoát khi có thay đổi chưa lưu → hỏi "Bỏ thay đổi / Tiếp tục chỉnh sửa". Tắt hiện danh sách theo dõi → hỏi xác nhận.
import React, { useState } from "react";
import { ArrowLeft, Check, ChevronRight, Loader2, UserRoundPlus, X, XCircle } from "lucide-react";
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

// hộp thoại xác nhận nhỏ ở giữa màn hình
function Confirm({ title, text, okLabel, okDanger, cancelLabel, onOk, onCancel }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-6">
      <div className="w-full max-w-xs overflow-hidden rounded-2xl bg-white text-center dark:bg-[#161b22]">
        <div className="px-5 pb-4 pt-5">
          <p className={`text-[16px] font-semibold ${GH_INK}`}>{title}</p>
          <p className={`mt-1.5 text-[14px] leading-5 ${GH_MUTED}`}>{text}</p>
        </div>
        <button
          type="button"
          onClick={onOk}
          className={`block w-full border-t py-3 text-[15px] font-semibold ${GH_LINE} ${
            okDanger ? "text-[#cf222e]" : GH_INK
          }`}
        >
          {okLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`block w-full border-t py-3 text-[15px] ${GH_LINE} ${GH_INK}`}
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  );
}

// đường kẻ thụt vào hai bên (như ảnh mẫu)
const Divider = () => <div className={`mx-4 border-t ${GH_LINE}`} />;

export default function EditProfileModal({ profile, cooldown, onClose, onSaved, onAvatar }) {
  // giá trị đang chỉnh (chưa lưu lên server)
  const [username, setUsername] = useState(profile.username || "");
  const [headline, setHeadline] = useState(profile.headline || "");
  const [showFollowing, setShowFollowing] = useState(profile.show_following !== false);

  const [sub, setSub] = useState(null); // null | "name" | "headline" | "privacy"
  const [tmp, setTmp] = useState(""); // nháp của màn riêng
  const [tmpBool, setTmpBool] = useState(true);
  const [dialog, setDialog] = useState(null); // null | "discardMain" | "discardSub" | "goPrivate"
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [subError, setSubError] = useState("");

  const nameLocked = !cooldown.canChange;
  const nameChanged = username.trim() !== (profile.username || "");
  const headChanged = headline.trim() !== (profile.headline || "");
  const privChanged = showFollowing !== (profile.show_following !== false);
  const dirty = nameChanged || headChanged || privChanged;

  /* ---------- mở / đóng màn riêng ---------- */
  const openSub = (key) => {
    setSubError("");
    if (key === "name") setTmp(username);
    if (key === "headline") setTmp(headline);
    if (key === "privacy") setTmpBool(showFollowing);
    setSub(key);
  };

  const subDirty =
    (sub === "name" && tmp !== username) ||
    (sub === "headline" && tmp !== headline) ||
    (sub === "privacy" && tmpBool !== showFollowing);

  const closeSub = () => {
    if (subDirty) setDialog("discardSub");
    else setSub(null);
  };

  const applySub = () => {
    if (sub === "name") {
      const n = tmp.trim();
      if (n !== (profile.username || "")) {
        if (!n) return setSubError("Tên hiển thị không được để trống.");
        if (n.length < 3) return setSubError("Tên hiển thị phải có ít nhất 3 ký tự.");
        if (nameLocked) return setSubError(`Bạn chỉ có thể đổi tên sau ${cooldown.remainingText} nữa.`);
      }
      setUsername(n);
    }
    if (sub === "headline") setHeadline(tmp.replace(/\s+/g, " ").trim());
    if (sub === "privacy") setShowFollowing(tmpBool);
    setSub(null);
  };

  const toggleTmpPrivacy = (v) => {
    // chuyển sang riêng tư thì hỏi xác nhận
    if (!v) setDialog("goPrivate");
    else setTmpBool(true);
  };

  /* ---------- ghi lên server ---------- */
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

  const backMain = () => {
    if (dirty) setDialog("discardMain");
    else onClose();
  };

  /* ---------- màn riêng (X · tiêu đề · ✓) ---------- */
  if (sub) {
    const meta = {
      name: { title: "Chỉnh sửa tên", label: "Tên hiển thị", max: NAME_MAX, hint: nameLocked ? `Bạn có thể đổi tên sau ${cooldown.remainingText} nữa.` : "Bạn chỉ đổi được tên 1 lần mỗi 7 ngày." },
      headline: { title: "Chỉnh sửa tiêu đề hồ sơ", label: "Tiêu đề hồ sơ", max: HEAD_MAX, hint: "Tiêu đề hiển thị công khai ngay dưới tên của bạn." },
      privacy: { title: "Quyền riêng tư của trang cá nhân" },
    }[sub];

    return (
      <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-white font-[Be_Vietnam_Pro] dark:bg-[#0d1117]">
        <header
          className="flex items-center gap-3 px-3 py-3"
          style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
        >
          <button
            type="button"
            onClick={closeSub}
            aria-label="Đóng"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${GH_INK} hover:bg-[#f6f8fa] dark:hover:bg-[#161b22]`}
          >
            <X size={22} />
          </button>
          <h2 className={`min-w-0 flex-1 truncate text-center text-[17px] font-semibold ${GH_INK}`}>{meta.title}</h2>
          <button
            type="button"
            onClick={applySub}
            disabled={sub === "name" && nameLocked}
            aria-label="Xong"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md hover:bg-[#f6f8fa] disabled:opacity-30 dark:hover:bg-[#161b22] ${GH_INK}`}
          >
            <Check size={22} />
          </button>
        </header>

        <main className="mx-auto w-full max-w-lg px-4 pt-3">
          {sub === "privacy" ? (
            <>
              <div className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 ${GH_LINE}`}>
                <div className="min-w-0">
                  <p className={`text-[15px] font-semibold ${GH_INK}`}>Hiện người mình đang theo dõi</p>
                  <p className={`mt-0.5 text-[13px] ${GH_MUTED}`}>{tmpBool ? "Công khai" : "Chỉ mình tôi"}</p>
                </div>
                <Toggle checked={tmpBool} onChange={toggleTmpPrivacy} label="Hiện người mình đang theo dõi" />
              </div>
              <p className={`mt-3 px-1 text-[13px] leading-5 ${GH_MUTED}`}>
                Khi tắt, chỉ mình bạn xem được danh sách những người bạn đang theo dõi. Số lượng người theo dõi vẫn hiển thị.
              </p>
            </>
          ) : (
            <>
              <label className={`flex items-center gap-2 rounded-2xl border px-4 py-3 ${GH_LINE}`}>
                <span className="min-w-0 flex-1">
                  <span className={`block text-[14px] font-semibold ${GH_INK}`}>{meta.label}</span>
                  <input
                    autoFocus
                    type="text"
                    value={tmp}
                    onChange={(e) => {
                      setTmp(e.target.value.replace(/\n/g, " "));
                      setSubError("");
                    }}
                    disabled={sub === "name" && nameLocked}
                    maxLength={meta.max}
                    className={`mt-0.5 w-full bg-transparent text-[16px] outline-none disabled:opacity-60 ${GH_INK}`}
                  />
                </span>
                {tmp && !(sub === "name" && nameLocked) && (
                  <button
                    type="button"
                    onClick={() => setTmp("")}
                    aria-label="Xóa"
                    className="shrink-0 text-[#8c959f]"
                  >
                    <XCircle size={20} />
                  </button>
                )}
              </label>
              <p className={`mt-2 px-1 text-[12.5px] leading-5 ${GH_MUTED}`}>
                {meta.hint} · {tmp.length}/{meta.max}
              </p>
              {subError && (
                <p className="mt-3 rounded-md border border-[#cf222e] bg-[#ffebe9] px-3 py-2 text-[13px] font-medium text-[#cf222e]">
                  {subError}
                </p>
              )}
            </>
          )}
        </main>

        {dialog === "discardSub" && (
          <Confirm
            title="Thay đổi chưa lưu"
            text="Bạn chưa lưu các thay đổi. Bạn có chắc chắn muốn bỏ thay đổi không?"
            okLabel="Bỏ thay đổi"
            okDanger
            cancelLabel="Tiếp tục chỉnh sửa"
            onOk={() => {
              setDialog(null);
              setSub(null);
            }}
            onCancel={() => setDialog(null)}
          />
        )}
        {dialog === "goPrivate" && (
          <Confirm
            title="Chỉ mình tôi xem danh sách theo dõi?"
            text="Người khác sẽ không còn xem được danh sách những người bạn đang theo dõi."
            okLabel="Ok"
            cancelLabel="Hủy"
            onOk={() => {
              setTmpBool(false);
              setDialog(null);
            }}
            onCancel={() => setDialog(null)}
          />
        )}
      </div>
    );
  }

  /* ---------- màn chính ---------- */
  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-white font-[Be_Vietnam_Pro] dark:bg-[#0d1117]">
      <TopHeader variant="gh" />

      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-6 pt-2">
        {/* nút quay lại: ngay dưới TopHeader, không có thanh riêng */}
        <button
          type="button"
          onClick={backMain}
          aria-label="Quay lại"
          className={`-ml-2 mb-1 flex h-10 w-10 items-center justify-center rounded-md ${GH_INK} hover:bg-[#f6f8fa] dark:hover:bg-[#161b22]`}
        >
          <ArrowLeft size={20} />
        </button>

        <div className={`overflow-hidden rounded-2xl border ${GH_LINE}`}>
          {/* TÊN + AVATAR */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <button type="button" onClick={() => openSub("name")} className="min-w-0 flex-1 text-left">
              <span className={`block text-[14px] font-semibold ${GH_INK}`}>Tên hiển thị</span>
              <span className={`mt-0.5 block truncate text-[15px] ${username ? (nameLocked ? GH_MUTED : GH_INK) : "text-[#8c959f]"}`}>
                {username || "+ Thêm tên"}
              </span>
              {nameLocked && (
                <span className={`block text-[12px] leading-4 ${GH_MUTED}`}>Đổi lại sau {cooldown.remainingText}</span>
              )}
            </button>

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

          <Divider />

          {/* TIÊU ĐỀ HỒ SƠ */}
          <button type="button" onClick={() => openSub("headline")} className="block w-full px-4 py-3.5 text-left">
            <span className={`block text-[14px] font-semibold ${GH_INK}`}>Tiêu đề hồ sơ</span>
            <span className={`mt-0.5 block truncate text-[15px] ${headline ? GH_INK : "text-[#8c959f]"}`}>
              {headline || "+ Viết tiêu đề"}
            </span>
          </button>

          <Divider />

          {/* QUYỀN RIÊNG TƯ */}
          <button type="button" onClick={() => openSub("privacy")} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
            <span className="min-w-0 flex-1">
              <span className={`block text-[14px] font-semibold ${GH_INK}`}>Quyền riêng tư của trang cá nhân</span>
            </span>
            <span className={`shrink-0 text-[14px] ${GH_MUTED}`}>{showFollowing ? "Công khai" : "Chỉ mình tôi"}</span>
            <ChevronRight size={18} className={`shrink-0 ${GH_MUTED}`} />
          </button>
        </div>

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

      {dialog === "discardMain" && (
        <Confirm
          title="Thay đổi chưa lưu"
          text="Bạn chưa lưu các thay đổi. Bạn có chắc chắn muốn bỏ thay đổi không?"
          okLabel="Bỏ thay đổi"
          okDanger
          cancelLabel="Tiếp tục chỉnh sửa"
          onOk={() => {
            setDialog(null);
            onClose();
          }}
          onCancel={() => setDialog(null)}
        />
      )}
    </div>
  );
}
