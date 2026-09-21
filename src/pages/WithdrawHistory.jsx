import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertCircle,
  Building2,
  RotateCw,
  Copy,
} from "lucide-react";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { supabase } from "../lib/supabaseClient.js";

const SUPABASE_URL = "https://rwglwovohbyqmbbzdvdj.supabase.co";
const STORAGE_BUCKET = "game_logos";
const SECRET_KEY = "NXX315_SECRET_KEY_2026";

const getImageUrl = (file) =>
  `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${file}`;

const BANKS = [
  { code: "VCB", name: "Vietcombank", logo: "vcb.png" },
  { code: "TCB", name: "Techcombank", logo: "tcb.png" },
  { code: "MB",  name: "MB Bank",     logo: "mb.png"  },
  { code: "BIDV", name: "BIDV",       logo: "bidv.png" },
  { code: "VTB", name: "VietinBank",  logo: "vtb.png" },
  { code: "VPB", name: "VPBank",      logo: "vpb.png" },
  { code: "ACB", name: "ACB",         logo: "acb.png" },
  { code: "TPB", name: "TPBank",      logo: "tpb.png" },
  { code: "STB", name: "Sacombank",   logo: "stb.png" },
  { code: "AGR", name: "Agribank",    logo: "agr.png" },
  { code: "SHB", name: "SHB",         logo: "shb.png" },
  { code: "VIB", name: "VIB",         logo: "vib.png" },
];

const WALLETS = {
  momo: { name: "Ví MoMo", logo: "momo.png" },
  zalopay: { name: "ZaloPay", logo: "zalopay.png" },
};

const STATUS_INFO = {
  pending: { label: "Chờ duyệt", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: Clock3 },
  processing: { label: "Đang xử lý", color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200", icon: Loader2 },
  completed: { label: "Đã chuyển", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2 },
  rejected: { label: "Từ chối", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", icon: XCircle },
  cancelled: { label: "Đã hủy", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", icon: XCircle },
};

const FILTERS = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ duyệt" },
  { id: "completed", label: "Đã chuyển" },
  { id: "rejected", label: "Từ chối" },
];

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

function maskText(text, visible = 4) {
  if (!text) return "—";
  const s = String(text);
  if (s.length <= visible) return s;
  return "*".repeat(s.length - visible) + s.slice(-visible);
}

function getBankInfo(code) {
  return BANKS.find((b) => b.code === code);
}

export default function WithdrawHistory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState([]);
  const [filter, setFilter] = useState("all");

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

      const decrypted = await Promise.all(
        (data || []).map(async (w) => {
          const [number, name, phone] = await Promise.all([
            decrypt(w.account_number_enc),
            decrypt(w.account_name_enc),
            decrypt(w.contact_phone_enc),
          ]);
          return {
            ...w,
            _account_number: number,
            _account_name: name,
            _contact_phone: phone,
          };
        })
      );

      setWithdrawals(decrypted);
    } catch (err) {
      console.error("Load history error:", err);
    } finally {
      setLoading(false);
    }
  };

  const decrypt = async (encrypted) => {
    if (!encrypted) return null;
    try {
      const { data, error } = await supabase.rpc("decrypt_sensitive", {
        p_encrypted: encrypted,
        p_key: SECRET_KEY,
      });
      if (error) return null;
      return data;
    } catch {
      return null;
    }
  };

  const filtered = useMemo(() => {
    if (filter === "all") return withdrawals;
    return withdrawals.filter((w) => w.status === filter);
  }, [withdrawals, filter]);

  const stats = useMemo(() => {
    const total = withdrawals.length;
    const successCount = withdrawals.filter(
      (w) => w.status === "completed"
    ).length;
    const pending = withdrawals.filter(
      (w) => w.status === "pending" || w.status === "processing"
    ).length;
    return { total, successCount, pending };
  }, [withdrawals]);

  const copyText = (text) => {
    if (text) navigator.clipboard?.writeText(text);
  };
     return (
    <div className="min-h-screen bg-white pb-24 text-slate-900">
      <TopHeader />

      {/* HEADER TRẮNG */}
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center"
        >
          <ArrowLeft size={22} strokeWidth={2} className="text-slate-900" />
        </button>
        <h1 className="flex-1 text-[17px] font-black tracking-tight text-slate-900">
          Lịch sử rút tiền
        </h1>
        <button
          onClick={loadHistory}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100"
        >
          <RotateCw size={18} strokeWidth={2.4} className="text-slate-700" />
        </button>
      </div>

      <div className="mx-auto w-full max-w-2xl px-4 py-5">
        {/* STATS */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
            <p className="text-[11px] text-slate-500">Tổng yêu cầu</p>
            <p className="mt-1 text-[20px] font-black text-slate-900">
              {stats.total}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-center">
            <p className="text-[11px] text-amber-700">Đang chờ</p>
            <p className="mt-1 text-[20px] font-black text-amber-700">
              {stats.pending}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-center">
            <p className="text-[11px] text-emerald-700">Thành công</p>
            <p className="mt-1 text-[20px] font-black text-emerald-700">
              {stats.successCount}
            </p>
          </div>
        </div>

        {/* FILTER */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-[12.5px] font-bold transition ${
                filter === f.id
                  ? "border-sky-500 bg-sky-500 text-white"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* LIST */}
        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center">
              <AlertCircle
                size={36}
                className="mx-auto text-slate-300"
                strokeWidth={2}
              />
              <p className="mt-3 text-[14px] font-bold text-slate-700">
                {withdrawals.length === 0
                  ? "Chưa có yêu cầu rút nào"
                  : "Không có yêu cầu phù hợp"}
              </p>
              {withdrawals.length === 0 && (
                <button
                  onClick={() => navigate("/withdraw")}
                  className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-[13px] font-bold text-white"
                >
                  Rút tiền ngay
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((w) => {
                const info = STATUS_INFO[w.status] || STATUS_INFO.pending;
                const Icon = info.icon;
                const bank = w.bank_code ? getBankInfo(w.bank_code) : null;
                const wallet = WALLETS[w.method];
                const logoFile = bank ? bank.logo : wallet?.logo;
                const label = bank ? bank.name : wallet?.name || w.method;

                return (
                  <div
                    key={w.id}
                    className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                  >
                    {/* Row 1 */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white">
                        {logoFile ? (
                          <img
                            src={getImageUrl(logoFile)}
                            alt=""
                            className="h-6 w-6 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.parentElement.innerHTML = `<span style="color:#0A2540;font-weight:900;font-size:10px">${(bank?.code || "V").slice(0, 4)}</span>`;
                            }}
                          />
                        ) : (
                          <Building2 size={18} className="text-slate-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-bold text-slate-900">
                          {label}
                        </p>
                        <p className="mt-0.5 text-[10.5px] text-slate-400">
                          {formatDate(w.created_at)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${info.bg} ${info.color} ${info.border}`}
                      >
                        <Icon size={10} strokeWidth={2.6} />
                        {info.label}
                      </span>
                    </div>

                    {/* Row 2 */}
                    <div className="mt-3 flex items-baseline justify-between border-t border-slate-100 pt-3">
                      <div>
                        <p className="text-[10.5px] text-slate-400">Số tiền rút</p>
                        <p className="text-[18px] font-black text-slate-900">
                          {formatMoney(w.amount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10.5px] text-slate-400">Phí</p>
                        <p className="text-[12.5px] font-bold text-rose-600">
                          -{formatMoney(w.fee)}
                        </p>
                      </div>
                    </div>

                    {/* Row 3 */}
                    <div className="mt-3 space-y-1.5 rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center justify-between text-[11.5px]">
                        <span className="text-slate-500">
                          {w.method === "bank" ? "Số TK" : "SĐT ví"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-800">
                            {maskText(w._account_number, 4)}
                          </span>
                          {w._account_number && (
                            <button
                              onClick={() => copyText(w._account_number)}
                              className="rounded p-0.5 text-slate-400 hover:bg-slate-200"
                            >
                              <Copy size={11} />
                            </button>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11.5px]">
                        <span className="text-slate-500">Tên chủ TK</span>
                        <span className="truncate text-right font-bold uppercase text-slate-800">
                          {w._account_name || "—"}
                        </span>
                      </div>
                    </div>

                    {w.rejected_reason && (
                      <div className="mt-3 rounded-lg bg-rose-50 p-2.5 text-[11.5px] text-rose-700">
                        <b>Lý do từ chối:</b> {w.rejected_reason}
                      </div>
                    )}

                    {(w.status === "pending" || w.status === "processing") && (
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-600">
                        <Clock3 size={11} strokeWidth={2.4} />
                        Vui lòng chờ admin duyệt trong 24h
                      </div>
                    )}
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
