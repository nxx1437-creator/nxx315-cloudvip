import React, { useEffect, useState } from "react";
import { BadgeCheck, Check, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";

// Dán ID (uuid) của tài khoản NXX315 admin vào đây
const ADMIN_USER_ID = "46b2fbbc-dc4a-411d-b140-7c67e8680695";
const ADMIN_FALLBACK_NAME = "NXX315 ";

export const STEPS = ["Đã nhận đơn", "Kiểm tra", "Xử lý", "Hoàn tất"];

export function deriveStep(order) {
  if (Number.isInteger(order?.progress_step)) {
    return Math.min(Math.max(order.progress_step, 0), STEPS.length - 1);
  }
  const s = String(order?.status || "").toLowerCase();
  if (["delivered", "success", "completed", "done"].includes(s)) return 3;
  if (s === "processing") return 2;
  if (s === "paid") return 1;
  return 0;
}

const TONE = {
  blue: { fill: "bg-blue-500", dot: "bg-blue-500 text-white", ring: "ring-blue-200", text: "text-blue-600" },
  green: { fill: "bg-emerald-500", dot: "bg-emerald-500 text-white", ring: "ring-emerald-200", text: "text-emerald-600" },
  red: { fill: "bg-rose-400", dot: "bg-rose-500 text-white", ring: "ring-rose-200", text: "text-rose-600" },
};

function fmt(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

// Lấy tên + ảnh từ hồ sơ NXX315, lưu tạm để không gọi lại nhiều lần
let adminCache = null;

function useAdminProfile() {
  const [admin, setAdmin] = useState(adminCache);

  useEffect(() => {
    if (!ADMIN_USER_ID || adminCache) return;
    let alive = true;

    (async () => {
      try {
        const { data, error } = await supabase.rpc("get_public_profile", {
          p_user_id: ADMIN_USER_ID,
        });
        if (error || !data) return;
        adminCache = {
          name: data.name || ADMIN_FALLBACK_NAME,
          avatar: data.avatar_url || "",
        };
        if (alive) setAdmin(adminCache);
      } catch {}
    })();

    return () => {
      alive = false;
    };
  }, []);

  return admin || { name: ADMIN_FALLBACK_NAME, avatar: "" };
}

function AdminAvatar({ src, name }) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className="h-10 w-10 shrink-0 rounded-full border border-slate-100 object-cover"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white">
      {(name || "N").charAt(0).toUpperCase()}
    </div>
  );
}

export default function OrderProgressTracker({ order }) {
  const admin = useAdminProfile();

  if (!order) return null;

  const status = String(order.status || "").toLowerCase();
  const failed = ["rejected", "failed", "cancelled", "canceled"].includes(status);
  const step = deriveStep(order);
  const complete = !failed && step === STEPS.length - 1;
  const tone = TONE[failed ? "red" : complete ? "green" : "blue"];
  const proofs = Array.isArray(order.proof_urls) ? order.proof_urls : [];
  const note = order.progress_note;

  return (
    <section className="mt-3 rounded-3xl border border-blue-50 bg-white p-5 shadow-sm">
      <h2 className="mb-5 text-sm font-black text-slate-900">Tiến độ đơn hàng</h2>

      <div className="relative">
        <div className="absolute left-[12.5%] right-[12.5%] top-[13px] h-1 rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${tone.fill}`}
            style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        <div className="relative grid grid-cols-4">
          {STEPS.map((label, i) => {
            const done = i < step || (i === step && complete);
            const current = i === step && !complete;

            return (
              <div key={label} className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-[30px] w-[30px] items-center justify-center rounded-full text-xs font-black transition-all duration-500 ${
                    done
                      ? tone.dot
                      : current
                      ? `${tone.dot} ring-4 ${tone.ring}`
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {current && failed ? (
                    <X size={15} />
                  ) : done || current ? (
                    <Check size={15} />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-center text-[11px] font-bold leading-tight ${
                    done || current ? tone.text : "text-slate-400"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {(note || proofs.length > 0) && (
        <div className="mt-6 border-t border-slate-100 pt-5">
          <div className="flex gap-3">
            <AdminAvatar key={admin.avatar} src={admin.avatar} name={admin.name} />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="truncate text-sm font-black text-slate-900">
                  {admin.name}
                </span>
                <BadgeCheck
                  size={17}
                  className="shrink-0 fill-blue-500 text-white"
                  aria-label="Tài khoản đã xác minh"
                />
              </div>

              {note && (
                <p className="mt-1.5 whitespace-pre-wrap break-words text-[13px] leading-6 text-slate-700">
                  {note}
                </p>
              )}

              {proofs.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 text-[11px] font-bold text-slate-400">
                    Giao dịch thành công từ nhà phát hành
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {proofs.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="block aspect-square overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
                      >
                        <img src={url} alt="Minh chứng giao dịch" className="h-full w-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {order.progress_updated_at && (
                <p className="mt-2 text-xs text-slate-400">{fmt(order.progress_updated_at)}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
    }
