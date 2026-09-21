import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertCircle,
  Building2,
  Smartphone,
  RotateCw,
} from "lucide-react";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { supabase } from "../lib/supabaseClient.js";

const SUPABASE_URL = "https://rwglwovohbyqmbbzdvdj.supabase.co";
const STORAGE_BUCKET = "game_logos";

const getImageUrl = (file) =>
  `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${file}`;

const BANKS = [
  { code: "VCB", name: "Vietcombank", logo: "vcb.png" },
  { code: "TCB", name: "Techcombank", logo: "tcb.png" },
  { code: "MB",  name: "MB Bank",     logo: "mb.png"  },
  { code: "VPB", name: "VPBank",      logo: "vpb.png" },
  { code: "TPB", name: "TPBank",      logo: "tpb.png" },
  { code: "ACB", name: "ACB",         logo: "acb.png" },
  { code: "BIDV", name: "BIDV",       logo: "bidv.png" },
  { code: "VTB", name: "VietinBank",  logo: "vtb.png" },
  { code: "STB", name: "Sacombank",   logo: "stb.png" },
  { code: "EIB", name: "Eximbank",    logo: "eib.png" },
  { code: "OCB", name: "OCB",         logo: "ocb.png" },
  { code: "MSB", name: "MSB",         logo: "msb.png" },
  { code: "HDB", name: "HDBank",      logo: "hdb.png" },
  { code: "SEAB", name: "SeABank",    logo: "seab.png" },
  { code: "NAB", name: "Nam A Bank",  logo: "nab.png" },
];

const STATUS_INFO = {
  pending: { label: "Chờ duyệt", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: Clock3 },
  processing: { label: "Đang xử lý", color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200", icon: Loader2 },
  completed: { label: "Đã chuyển", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2 },
  rejected: { label: "Từ chối", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", icon: XCircle },
  cancelled: { label: "Đã hủy", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", icon: XCircle },
};

function formatMoney(v) {
  return new Intl.NumberFormat("vi-VN").format(Number(v || 0)) + "đ";
}

function formatDate(v) {
  if (!v) return "—";
  return new Date(v).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getBankInfo(code) {
  return BANKS.find((b) => b.code === code);
}

export default function WithdrawHistory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (err) {
      console.error("Load history error:", err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter((w) => w.status === "pending").length,
    completed: withdrawals.filter((w) => w.status === "completed").length,
    totalAmount: withdrawals
      .filter((w) => w.status === "completed")
      .reduce((s, w) => s + w.amount, 0),
  };

  return (
    <div className="min-h-screen bg-white pb-24 text-slate-900">
      <TopHeader />

      {/* HEADER NAVY */}
      <div className="bg-[#0A2540] px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white"
          >
            <ArrowLeft size={20} strokeWidth={2.4} />
          </button>
          <h1 className="flex-1 text-[16px] font-bold tracking-tight text-white">
            Lịch sử rút tiền
          </h1>
          <button
            onClick={loadHistory}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
          >
            <RotateCw size={18} strokeWidth={2.4} />
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl px-4 py-5">
        {/* STATS */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
            <p className="text-[11px] text-slate-500">Tổng yêu cầu</p>
            <p className="mt-1 text-[20px] font-bold text-slate-900">
              {stats.total}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
            <p className="text-[11px] text-slate-500">Đang chờ</p>
            <p className="mt-1 text-[20px] font-bold text-amber-600">
              {stats.pending}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
            <p className="text-[11px] text-slate-500">Đã nhận</p>
            <p className="mt-1 text-[14px] font-bold text-emerald-600">
              {formatMoney(stats.totalAmount)}
            </p>
          </div>
        </div>

        {/* LIST */}
        <div className="mt-5">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-[#0A2540]" />
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center">
              <AlertCircle
                size={36}
                className="mx-auto text-slate-300"
                strokeWidth={2}
              />
              <p className="mt-3 text-[14px] font-bold text-slate-700">
                Chưa có yêu cầu rút nào
              </p>
              <button
                onClick={() => navigate("/withdraw")}
                className="mt-4 rounded-xl bg-[#0A2540] px-5 py-2.5 text-[13px] font-bold text-white"
              >
                Rút tiền ngay
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {withdrawals.map((w) => {
                const info = STATUS_INFO[w.status] || STATUS_INFO.pending;
                const Icon = info.icon;
                const bank = w.bank_code ? getBankInfo(w.bank_code) : null;

                return (
                  <div
                    key={w.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start gap-3">
                      {/* Logo/Icon */}
                      {bank ? (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50">
                          <img
                            src={getImageUrl(bank.logo)}
                            alt=""
                            className="h-7 w-7 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.parentElement.innerHTML = `<span style="color:#0A2540;font-weight:900;font-size:11px">${bank.code}</span>`;
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50">
                          {w.method === "momo" ? (
                            <img
                              src={getImageUrl("momo.png")}
                              alt=""
                              className="h-7 w-7 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.parentElement.innerHTML = '<span style="font-size:18px">📱</span>';
                              }}
                            />
                          ) : w.method === "zalopay" ? (
                            <img
                              src={getImageUrl("zalopay.png")}
                              alt=""
                              className="h-7 w-7 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.parentElement.innerHTML = '<span style="font-size:18px">💵</span>';
                              }}
                            />
                          ) : (
                            <Building2 size={20} className="text-slate-500" />
                          )}
                        </div>
                      )}

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[16px] font-bold text-slate-900">
                              {formatMoney(w.amount)}
                            </p>
                            <p className="mt-0.5 text-[11.5px] text-slate-500">
                              {bank
                                ? bank.name
                                : w.method === "momo"
                                ? "Ví MoMo"
                                : "ZaloPay"}{" "}
                              · {w.account_number}
                            </p>
                          </div>
                          <span
                            className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${info.bg} ${info.color} ${info.border}`}
                          >
                            <Icon size={10} strokeWidth={2.6} />
                            {info.label}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-[10.5px] text-slate-400">
                            {formatDate(w.created_at)}
                          </p>
                          <p className="text-[10.5px] text-slate-400">
                            Phí: {formatMoney(w.fee)}
                          </p>
                        </div>

                        {w.rejected_reason && (
                          <div className="mt-2 rounded-lg bg-rose-50 p-2 text-[11px] text-rose-700">
                            <b>Lý do từ chối:</b> {w.rejected_reason}
                          </div>
                        )}

                        {w.status === "pending" && (
                          <div className="mt-2 flex items-center gap-1.5 text-[10.5px] text-amber-600">
                            <Clock3 size={11} strokeWidth={2.4} />
                            Vui lòng chờ admin duyệt trong 24h
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
