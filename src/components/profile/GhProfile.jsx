// src/components/profile/GhProfile.jsx — khung hồ sơ kiểu GitHub: bìa, avatar, tên, số liệu, thông tin, huy hiệu (chỉ hiện cái đã đạt)
import React, { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import VerifiedBadge from "../VerifiedBadge.jsx";

export const GH_LINE = "border-[#d0d7de] dark:border-[#30363d]";
export const GH_INK = "text-[#1f2328] dark:text-[#e6edf3]";
export const GH_MUTED = "text-[#59636e] dark:text-[#9198a1]";
export const GH_BTN =
  "flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#d0d7de] bg-[#f6f8fa] px-3 text-[14px] font-semibold whitespace-nowrap text-[#1f2328] transition active:scale-[0.98] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#e6edf3]";

function Achievements({ badges }) {
  const [pick, setPick] = useState(null);
  if (!badges.length) return null; // chưa có huy hiệu nào thì không hiện mục này
  const sel = badges.find((b) => b.id === pick);
  return (
    <div className={`mt-5 border-t px-4 pt-4 ${GH_LINE}`}>
      <div className="flex items-baseline justify-between">
        <h2 className={`text-[16px] font-semibold ${GH_INK}`}>Huy hiệu</h2>
        <span className={`text-[12.5px] ${GH_MUTED}`}>{badges.length}</span>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-x-2 gap-y-4">
        {badges.map(({ id, name, Icon, grad }) => (
          <button
            key={id}
            type="button"
            onClick={() => setPick(pick === id ? null : id)}
            className="flex flex-col items-center gap-1.5 active:scale-95"
          >
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${grad} text-white shadow-sm ring-2 ring-offset-2 ring-offset-white transition dark:ring-offset-[#0d1117] ${
                pick === id ? "ring-[#0969da]" : "ring-transparent"
              }`}
            >
              <Icon size={25} strokeWidth={2} />
            </span>
            <span className={`line-clamp-2 text-center text-[11.5px] leading-tight ${GH_MUTED}`}>{name}</span>
          </button>
        ))}
      </div>

      {sel && (
        <p className={`mt-4 rounded-md bg-[#f6f8fa] px-3 py-2.5 text-[13.5px] leading-5 dark:bg-[#161b22] ${GH_MUTED}`}>
          <b className={`font-semibold ${GH_INK}`}>{sel.name}</b> · {sel.desc}
        </p>
      )}
    </div>
  );
}

export default function GhProfile({
  cover, onPickCover, coverBusy = false, coverErr = "",
  avatarUrl, initial = "T", onAvatar,
  name, verified = false, sub,
  stats = [], meta = [], badges = [], actions,
}) {
  const fileRef = useRef(null);
  const Avatar = onAvatar ? "button" : "div";
  const hasBackdrop = !cover && !!avatarUrl; // chưa có bìa → lấy avatar làm nền mờ

  return (
    <div className="pb-4">
      {/* ẢNH BÌA */}
      <div
        className={`relative h-36 w-full overflow-hidden ${
          cover || hasBackdrop ? "bg-[#d0d7de] dark:bg-[#21262d]" : "bg-gradient-to-br from-accent-400 to-accent-600"
        }`}
      >
        {cover && <img src={cover} alt="" className="h-full w-full object-cover" />}
        {hasBackdrop && (
          <>
            <img src={avatarUrl} alt="" aria-hidden="true" className="h-full w-full scale-125 object-cover opacity-70 blur-2xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/25" />
          </>
        )}
        {onPickCover && (
          <>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={coverBusy}
              className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md bg-black/50 px-2.5 py-1.5 text-[12.5px] font-semibold text-white backdrop-blur transition active:scale-95 disabled:opacity-60"
            >
              {coverBusy ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              {coverBusy ? "Đang tải..." : "Đổi ảnh bìa"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) onPickCover(f);
              }}
            />
          </>
        )}
        {coverErr && (
          <p className="absolute inset-x-3 bottom-2 rounded-md bg-rose-600/90 px-3 py-1.5 text-[12px] font-medium text-white">
            {coverErr}
          </p>
        )}
      </div>

      <div className="px-4">
        {/* AVATAR */}
        <Avatar
          {...(onAvatar ? { type: "button", onClick: onAvatar, "aria-label": "Đổi ảnh đại diện" } : {})}
          className="relative z-10 -mt-12 block h-24 w-24 rounded-full bg-white ring-4 ring-white dark:bg-[#0d1117] dark:ring-[#0d1117]"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center rounded-full bg-accent-500 text-4xl font-bold text-white">
              {initial}
            </span>
          )}
          {onAvatar && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-[#d0d7de] bg-[#f6f8fa] text-[#59636e] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#9198a1]">
              <Camera size={13} />
            </span>
          )}
        </Avatar>

        {/* TÊN */}
        <h1 className={`mt-3 flex min-w-0 items-center gap-1.5 text-[24px] font-semibold leading-8 ${GH_INK}`}>
          <span className="truncate">{name}</span>
          {verified && <VerifiedBadge size={20} />}
        </h1>
        {sub && <p className={`truncate text-[16px] leading-6 ${GH_MUTED}`}>{sub}</p>}

        {/* NÚT */}
        {actions && <div className="mt-4">{actions}</div>}

        {/* SỐ LIỆU 1 DÒNG */}
        {stats.length > 0 && (
          <p className={`mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[14px] ${GH_MUTED}`}>
            {stats.map((s) => (
              <span key={s.label}>
                <b className={`font-semibold ${GH_INK}`}>{s.value}</b> {s.label}
              </span>
            ))}
          </p>
        )}

        {/* THÔNG TIN */}
        {meta.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {meta.map(({ Icon, text, onClick }, i) => {
              const T = onClick ? "button" : "span";
              return (
                <li key={i}>
                  <T
                    {...(onClick ? { type: "button", onClick } : {})}
                    className={`flex items-center gap-2 text-left text-[14px] leading-5 ${GH_INK} ${onClick ? "hover:underline" : ""}`}
                  >
                    <Icon size={16} className={`shrink-0 ${GH_MUTED}`} />
                    <span className="min-w-0">{text}</span>
                  </T>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Achievements badges={badges} />
    </div>
  );
              }
