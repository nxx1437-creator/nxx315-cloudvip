import React from "react";
import { Ban, Clock3, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

import useProfile from "../hooks/useProfile.js";

const formatDateTime = (value) => {
  if (!value) return "Không xác định";

  return new Date(value).toLocaleString("vi-VN", {
    dateStyle: "long",
    timeStyle: "short",
  });
};

export default function Banned() {
  const { profile } = useProfile();
  const navigate = useNavigate();

  const isPermanent = !profile?.banned_until;

  const isExpired =
    !isPermanent &&
    profile?.banned_until &&
    new Date(profile.banned_until).getTime() <= Date.now();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7FAFC] px-4 py-10">
      <div className="w-full max-w-md rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-rose-500">
              <Ban size={19} className="text-rose-500" />
            </div>

            <h1 className="text-xl font-black text-slate-950">
              Đã bị khóa
            </h1>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          Tài khoản của bạn đã bị khóa do vi phạm quy định của
          hệ thống.
        </p>

        <div className="mt-5">
          <h2 className="mb-2 text-sm font-black text-slate-900">
            Chi tiết
          </h2>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Lý do
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {profile?.ban_reason || "Không xác định"}
            </p>

            {profile?.ban_note && (
              <>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Ghi chú từ người điều hành
                </p>

                <p className="mt-1 text-sm leading-5 text-slate-600">
                  {profile.ban_note}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
          <Clock3 size={16} className="shrink-0 text-amber-500" />

          <p className="text-xs font-bold text-amber-700">
            {isPermanent
              ? "Thời hạn: Vĩnh viễn"
              : `Hết hạn: ${formatDateTime(profile.banned_until)}`}
          </p>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Thời điểm xử lý
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            {formatDateTime(profile?.banned_at)}
          </p>
        </div>

        {profile?.id && (
          <p className="mt-4 text-center text-[10px] text-slate-300">
            {profile.id}
          </p>
        )}

        <button
          type="button"
          onClick={() => navigate("/contact")}
          className="mt-5 w-full rounded-2xl bg-sky-50 px-4 py-3 text-sm font-black text-sky-700 transition hover:bg-sky-100"
        >
          Khiếu nại / Báo lỗi
        </button>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-100 px-3 py-2">
          <ShieldAlert size={13} className="shrink-0 text-slate-300" />

          <p className="text-[10px] leading-4 text-slate-400">
            Nếu bạn cho rằng đây là nhầm lẫn, hãy liên hệ qua
            trang khiếu nại để được xem xét lại.
          </p>
        </div>
      </div>
    </div>
  );
            }
