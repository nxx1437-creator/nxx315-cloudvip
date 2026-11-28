// src/components/profile/EditProfileModal.jsx — "Chỉnh sửa trang cá nhân" (toàn màn hình, gọn kiểu Threads)
// Header: X · tiêu đề · Xong. Một thẻ bo góc gồm các dòng; bấm Tên/Tiêu đề → màn riêng (X · tiêu đề · ✓).
// "Xong" ghi tên/tiêu đề/quyền riêng tư lên server. Ảnh bìa tải lên là lưu ngay.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Check, Loader2, UserRoundPlus, X, XCircle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import { uploadCover } from "../../lib/coverUpload.js";
import { GH_INK, GH_LINE, GH_MUTED } from "./GhProfile.jsx";
import CosmeticPicker from "./CosmeticPicker.jsx";
import { Confirm, Divider, Row, Toggle } from "./EditProfileParts.jsx";

const NAME_MAX = 20;
const HEAD_MAX = 80;

export default function EditProfileModal({ profile, cooldown, onClose, onSaved, onAvatar }) {
  const [username, setUsername] = useState(profile.username || "");
  const [headline, setHeadline] = useState(profile.headline || "");
  const [showFollowing, setShowFollowing] = useState(profile.show_following !== false);

  const [sub, setSub] = useState(null); // null | "name" | "headline"
  const [tmp, setTmp] = useState("");
  const [dialog, setDialog] = useState(null); // null | "discardMain" | "discardSub" | "goPrivate"
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [subError, setSubError] = useState("");

  const [email, setEmail] = useState("");
  const [coverUrl, setCoverUrl] = useState(profile.cover_url || null);
  const [coverBusy, setCoverBusy] = useState(false);
  const [coverErr, setCoverErr] = useState("");
  const [cos, setCos] = useState({ frame: null, effect: null });
  const [picker, setPicker] = useState(null); // null | "frame" | "effect"
  const fileRef = useRef(null);

  const nameLocked = !cooldown.canChange;
  const nameChanged = username.trim() !== (profile.username || "");
  const headChanged = headline.trim() !== (profile.headline || "");
  const privChanged = showFollowing !== (profile.show_following !== false);
  const dirty = nameChanged || headChanged || privChanged;

  /* ---------- email + khung/hiệu ứng đang dùng ---------- */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data?.user?.email || ""));
  }, []);

  const loadCos = useCallback(async () => {
    if (!profile.id) return;
    const { data: eq } = await supabase
      .from("user_cosmetic_equip")
      .select("frame_id,effect_id")
      .eq("user_id", profile.id)
      .maybeSingle();
    const ids = [eq?.frame_id, eq?.effect_id].filter(Boolean);
    const names = {};
    if (ids.length) {
      const { data } = await supabase.from("cosmetic_items").select("id,name").in("id", ids);
      (data || []).forEach((i) => {
        names[i.id] = i.name;
      });
    }
    setCos({ frame: names[eq?.frame_id] || null, effect: names[eq?.effect_id] || null });
  }, [profile.id]);

  useEffect(() => {
    loadCos();
  }, [loadCos]);

  /* ---------- ảnh bìa (lưu ngay) ---------- */
  const onCover = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCoverErr("");
    setCoverBusy(true);
    try {
      const url = await uploadCover(profile.id, file);
      setCoverUrl(url);
      window.dispatchEvent(new CustomEvent("profile-cover-changed", { detail: url }));
    } catch (err) {
      setCoverErr(err.message || "Không đổi được ảnh bìa.");
    } finally {
      setCoverBusy(false);
    }
  };

  /* ---------- màn riêng: tên / tiêu đề ---------- */
  const openSub = (key) => {
    setSubError("");
    setTmp(key === "name" ? username : headline);
    setSub(key);
  };

  const subDirty = (sub === "name" && tmp !== username) || (sub === "headline" && tmp !== headline);

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
    setSub(null);
  };

  const onTogglePrivacy = (v) => {
    if (!v) setDialog("goPrivate"); // tắt → hỏi xác nhận
    else setShowFollowing(true);
  };

  /* ---------- ghi lên server ---------- */
  const handleSave = async () => {
    if (saving || !dirty) return;
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

    setSaving(true);
    setError("");
    const { error: updateError } = await supabase.from("profiles").update(patch).eq("id", profile.id);
    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    try {
      window.dispatchEvent(new Event("profile-headline-changed"));
    } catch {}
    onSaved(patch);
  };

  const backMain = () => {
    if (dirty) setDialog("discardMain");
    else onClose();
  };

  const shell = "fixed inset-0 z-40 flex flex-col overflow-y-auto bg-white font-[Be_Vietnam_Pro] dark:bg-[#0d1117]";
  const iconBtn = `flex h-10 w-10 shrink-0 items-center justify-center rounded-md hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] ${GH_INK}`;
  const headStyle = { paddingTop: "max(12px, env(safe-area-inset-top))" };

  /* ---------- màn riêng (X · tiêu đề · ✓) ---------- */
  if (sub) {
    const meta = {
      name: {
        title: "Chỉnh sửa tên",
        label: "Tên hiển thị",
        max: NAME_MAX,
        hint: nameLocked ? `Bạn có thể đổi tên sau ${cooldown.remainingText} nữa.` : "Bạn chỉ đổi được tên 1 lần mỗi 7 ngày.",
      },
      headline: {
        title: "Chỉnh sửa tiêu đề hồ sơ",
        label: "Tiêu đề hồ sơ",
        max: HEAD_MAX,
        hint: "Tiêu đề hiển thị công khai ngay dưới tên của bạn.",
      },
    }[sub];
    const locked = sub === "name" && nameLocked;

    return (
      <div className={shell}>
        <header className="flex items-center gap-3 px-3 py-3" style={headStyle}>
          <button type="button" onClick={closeSub} aria-label="Đóng" className={iconBtn}>
            <X size={22} />
          </button>
          <h2 className={`min-w-0 flex-1 truncate text-center text-[17px] font-semibold ${GH_INK}`}>{meta.title}</h2>
          <button type="button" onClick={applySub} disabled={locked} aria-label="Xong" className={`${iconBtn} disabled:opacity-30`}>
            <Check size={22} />
          </button>
        </header>

        <main className="mx-auto w-full max-w-lg px-4 pt-3">
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
                disabled={locked}
                maxLength={meta.max}
                className={`mt-0.5 w-full bg-transparent text-[16px] outline-none disabled:opacity-60 ${GH_INK}`}
              />
            </span>
            {tmp && !locked && (
              <button type="button" onClick={() => setTmp("")} aria-label="Xóa" className="shrink-0 text-[#8c959f]">
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
      </div>
    );
  }

  /* ---------- màn chính ---------- */
  return (
    <div className={shell}>
      <header className="flex items-center gap-3 px-3 py-3" style={headStyle}>
        <button type="button" onClick={backMain} aria-label="Đóng" className={iconBtn}>
          <X size={22} />
        </button>
        <h2 className={`min-w-0 flex-1 truncate text-center text-[17px] font-semibold ${GH_INK}`}>
          Chỉnh sửa trang cá nhân
        </h2>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty}
          className={`flex h-10 min-w-[48px] shrink-0 items-center justify-center px-1 text-[16px] font-semibold ${
            dirty ? GH_INK : "text-[#8c959f]"
          }`}
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : "Xong"}
        </button>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-10 pt-3">
        <div className={`overflow-hidden rounded-3xl border ${GH_LINE}`}>
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

          {email && (
            <>
              <Divider />
              <Row label="Email" value={email} />
            </>
          )}

          <Divider />
          <Row label="Tiêu đề hồ sơ" value={headline} placeholder="+ Viết tiêu đề" onClick={() => openSub("headline")} />

          <Divider />
          <Row
            label="Ảnh bìa"
            value={coverBusy ? "Đang tải lên..." : coverUrl ? "Đã có ảnh bìa" : ""}
            placeholder="+ Thêm ảnh bìa"
            onClick={() => fileRef.current?.click()}
            disabled={coverBusy}
            right={
              coverUrl ? (
                <img src={coverUrl} alt="" className="h-10 w-[72px] shrink-0 rounded-md object-cover" />
              ) : null
            }
          />

          <Divider />
          <Row label="Khung avatar" value={cos.frame} placeholder="Chưa dùng · Mua bằng xu" onClick={() => setPicker("frame")} />

          <Divider />
          <Row label="Hiệu ứng hồ sơ" value={cos.effect} placeholder="Chưa dùng · Mua bằng xu" onClick={() => setPicker("effect")} />

          <Divider />
          {/* CÔNG TẮC QUYỀN RIÊNG TƯ */}
          <div className="px-4 py-3.5">
            <div className="flex items-center gap-3">
              <span className={`min-w-0 flex-1 text-[14px] font-semibold ${GH_INK}`}>Hiện người mình đang theo dõi</span>
              <Toggle checked={showFollowing} onChange={onTogglePrivacy} label="Hiện người mình đang theo dõi" />
            </div>
            <p className={`mt-1 pr-14 text-[13px] leading-5 ${GH_MUTED}`}>
              {showFollowing ? "Công khai." : "Chỉ mình bạn xem được."} Khi tắt, người khác không xem được danh sách
              bạn đang theo dõi. Số người theo dõi vẫn hiển thị.
            </p>
          </div>
        </div>

        {(error || coverErr) && (
          <p className="mt-3 rounded-md border border-[#cf222e] bg-[#ffebe9] px-3 py-2 text-[13px] font-medium text-[#cf222e]">
            {error || coverErr}
          </p>
        )}
      </main>

      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onCover} />

      {picker && (
        <CosmeticPicker
          kind={picker}
          onClose={() => setPicker(null)}
          onChanged={() => {
            loadCos();
            window.dispatchEvent(new Event("profile-cosmetics-changed"));
          }}
        />
      )}

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
      {dialog === "goPrivate" && (
        <Confirm
          title="Chỉ mình tôi xem danh sách theo dõi?"
          text="Người khác sẽ không còn xem được danh sách những người bạn đang theo dõi."
          okLabel="Ok"
          cancelLabel="Hủy"
          onOk={() => {
            setShowFollowing(false);
            setDialog(null);
          }}
          onCancel={() => setDialog(null)}
        />
      )}
    </div>
  );
}
