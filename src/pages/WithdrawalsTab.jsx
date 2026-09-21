import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  X,
  Check,
  AlertCircle,
  Loader2,
  EyeOff,
  Copy,
  Building2,
  Smartphone,
  Clock3,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const SECRET_KEY = "NXX315_SECRET_KEY_2026";

const BANKS = [
  { code: "VCB", name: "Vietcombank" },
  { code: "TCB", name: "Techcombank" },
  { code: "MB",  name: "MB Bank" },
  { code: "BIDV", name: "BIDV" },
  { code: "VTB", name: "VietinBank" },
  { code: "VPB", name: "VPBank" },
  { code: "ACB", name: "ACB" },
  { code: "TPB", name: "TPBank" },
  { code: "STB", name: "Sacombank" },
  { code: "AGR", name: "Agribank" },
  { code: "SHB", name: "SHB" },
  { code: "VIB", name: "VIB" },
];

const WALLETS = {
  momo: { name: "Ví MoMo" },
  zalopay: { name: "ZaloPay" },
};

const STATUS_INFO = {
  pending: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700", icon: Clock3 },
  processing: { label: "Đang xử lý", className: "bg-sky-100 text-sky-700", icon: Loader2 },
  completed: { label: "Đã chuyển", className: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  rejected: { label: "Từ chối", className: "bg-rose-100 text-rose-700", icon: XCircle },
  cancelled: { label: "Đã hủy", className: "bg-slate-100 text-slate-600", icon: XCircle },
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

function getBankName(code) {
  return BANKS.find((b) => b.code === code)?.name || code;
}

function maskText(text, visible = 4) {
  if (!text) return "—";
  const s = String(text);
  if (s.length <= visible) return s;
  return "*".repeat(s.length - visible) + s.slice(-visible);
}

export default function WithdrawalsTab() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // Modal chi tiết
  const [detail, setDetail] = useState(null);
  const [revealed, setRevealed] = useState({});

  // Modal từ chối
  const [rejectItem, setRejectItem] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // ========== FETCH ==========
  const fetchData = async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const { data, error: fetchErr } = await supabase
        .from("withdrawals")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (fetchErr) throw fetchErr;

      // Giải mã từng record
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
      console.error("Fetch withdrawals error:", err);
      setError(err?.message || "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  useEffect(() => {
    fetchData();
  }, []);

  // ========== ACTIONS ==========
  const handleComplete = async (w) => {
    if (!confirm(`Xác nhận đã chuyển ${formatMoney(w.amount)} cho user?`)) return;

    setProcessing(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Chưa đăng nhập");

      const { data, error: rpcErr } = await supabase.rpc("complete_withdrawal", {
        p_admin_id: user.id,
        p_withdrawal_id: w.id,
      });

      if (rpcErr) throw rpcErr;
      if (data?.error) throw new Error(data.error);

      await fetchData(true);
      setDetail(null);
    } catch (err) {
      setError(err?.message || "Không thể duyệt.");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectItem) return;
    if (!rejectReason.trim()) {
      setError("Vui lòng nhập lý do từ chối.");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Chưa đăng nhập");

      const { data, error: rpcErr } = await supabase.rpc("reject_withdrawal", {
        p_admin_id: user.id,
        p_withdrawal_id: rejectItem.id,
        p_reason: rejectReason.trim(),
      });

      if (rpcErr) throw rpcErr;
      if (data?.error) throw new Error(data.error);

      await fetchData(true);
      setRejectItem(null);
      setRejectReason("");
      setDetail(null);
    } catch (err) {
      setError(err?.message || "Không thể từ chối.");
    } finally {
      setProcessing(false);
    }
  };

  const copyText = (text) => {
    navigator.clipboard?.writeText(text);
  };

  const toggleReveal = (key) => {
    setRevealed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ========== FILTER ==========
  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();

    return withdrawals.filter((w) => {
      if (filter !== "all" && w.status !== filter) return false;
      if (!kw) return true;

      return [
        w.id,
        w.user_id,
        w._account_number,
        w._account_name,
        w._contact_phone,
        w.bank_code,
        w.method,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(kw));
    });
  }, [withdrawals, search, filter]);

  const stats = useMemo(
    () => ({
      total: withdrawals.length,
      pending: withdrawals.filter((w) => w.status === "pending").length,
      completed: withdrawals.filter((w) => w.status === "completed").length,
      rejected: withdrawals.filter((w) => w.status === "rejected").length,
    }),
    [withdrawals]
  );
    if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        <span className="ml-2 text-slate-500">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Rút tiền</h2>
          <p className="mt-1 text-sm text-slate-500">
            Duyệt yêu cầu rút tiền của user
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="rounded-xl border bg-white p-2.5 text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
        >
          <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard title="Tổng" value={stats.total} />
        <StatCard title="Chờ duyệt" value={stats.pending} color="text-amber-600" />
        <StatCard title="Đã chuyển" value={stats.completed} color="text-emerald-600" />
        <StatCard title="Từ chối" value={stats.rejected} color="text-rose-600" />
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4 md:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo STK, tên, SĐT, user_id..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
        >
          <option value="all">Tất cả</option>
          <option value="pending">Chờ duyệt</option>
          <option value="processing">Đang xử lý</option>
          <option value="completed">Đã chuyển</option>
          <option value="rejected">Từ chối</option>
        </select>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TABLE */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border bg-white py-16 text-center text-slate-500">
          Không có yêu cầu rút nào
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Số tiền</th>
                  <th className="px-4 py-3 text-left">Phương thức</th>
                  <th className="px-4 py-3 text-left">STK / Ví</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Thời gian</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((w) => {
                  const info = STATUS_INFO[w.status] || STATUS_INFO.pending;
                  const Icon = info.icon;
                  const methodLabel =
                    w.method === "bank"
                      ? getBankName(w.bank_code)
                      : WALLETS[w.method]?.name || w.method;

                  return (
                    <tr key={w.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 font-mono text-xs text-slate-500">
                        {String(w.id).slice(0, 8)}
                      </td>

                      <td className="px-4 py-4 font-mono text-xs text-slate-500">
                        {String(w.user_id).slice(0, 8)}
                      </td>

                      <td className="px-4 py-4 font-bold text-slate-900">
                        {formatMoney(w.amount)}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {w.method === "bank" ? (
                            <Building2 size={14} className="text-sky-600" />
                          ) : (
                            <Smartphone size={14} className="text-pink-600" />
                          )}
                          <span className="font-medium text-slate-700">
                            {methodLabel}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-mono text-xs text-slate-700">
                          {w._account_number
                            ? maskText(w._account_number, 4)
                            : "—"}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {w._account_name || "—"}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${info.className}`}
                        >
                          <Icon size={10} strokeWidth={2.6} />
                          {info.label}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-500">
                        {formatDate(w.created_at)}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => {
                            setDetail(w);
                            setRevealed({});
                          }}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DETAIL */}
      {detail && (
        <Modal
          title={`Yêu cầu #${String(detail.id).slice(0, 8)}`}
          onClose={() => setDetail(null)}
        >
          <div className="space-y-3">
            <InfoBox
              label="User ID"
              value={
                <span className="font-mono text-xs">{detail.user_id}</span>
              }
            />

            <InfoBox label="Số tiền rút" value={formatMoney(detail.amount)} />
            <InfoBox label="Phí" value={formatMoney(detail.fee)} />
            <InfoBox
              label="Tổng trừ xu"
              value={formatMoney(detail.total_deducted)}
            />

            <InfoBox
              label="Phương thức"
              value={
                detail.method === "bank"
                  ? `Ngân hàng - ${getBankName(detail.bank_code)}`
                  : WALLETS[detail.method]?.name || detail.method
              }
            />

            {/* Số TK - encrypted */}
            <SecretBox
              label="Số tài khoản"
              value={detail._account_number}
              revealed={revealed.number}
              onToggle={() => toggleReveal("number")}
              onCopy={() => copyText(detail._account_number)}
            />

            {/* Tên chủ TK */}
            <SecretBox
              label="Tên chủ tài khoản"
              value={detail._account_name}
              revealed={revealed.name}
              onToggle={() => toggleReveal("name")}
              onCopy={() => copyText(detail._account_name)}
            />

            {/* SĐT */}
            <SecretBox
              label="SĐT liên hệ"
              value={detail._contact_phone}
              revealed={revealed.phone}
              onToggle={() => toggleReveal("phone")}
              onCopy={() => copyText(detail._contact_phone)}
            />

            <InfoBox
              label="Trạng thái"
              value={
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                    STATUS_INFO[detail.status]?.className
                  }`}
                >
                  {STATUS_INFO[detail.status]?.label || detail.status}
                </span>
              }
            />

            {detail.rejected_reason && (
              <InfoBox label="Lý do từ chối" value={detail.rejected_reason} />
            )}

            {/* ACTIONS */}
            {["pending", "processing"].includes(detail.status) && (
              <div className="flex gap-2 pt-3">
                <button
                  disabled={processing}
                  onClick={() => handleComplete(detail)}
                  className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Check size={17} className="mr-2 inline" />
                  Đã chuyển khoản
                </button>

                <button
                  disabled={processing}
                  onClick={() => setRejectItem(detail)}
                  className="flex-1 rounded-xl bg-rose-600 px-4 py-3 font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
                >
                  <X size={17} className="mr-2 inline" />
                  Từ chối
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* MODAL REJECT */}
      {rejectItem && (
        <Modal
          title="Từ chối yêu cầu rút tiền"
          onClose={() => {
            setRejectItem(null);
            setRejectReason("");
          }}
        >
          <div className="space-y-3">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              <b>Lưu ý:</b> User sẽ được hoàn lại{" "}
              <b>{formatMoney(rejectItem.amount)}</b> (giữ phí{" "}
              {formatMoney(rejectItem.fee)}).
            </div>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              rows={4}
              className="w-full rounded-xl border p-3 outline-none focus:border-blue-500"
            />

            <button
              disabled={processing || !rejectReason.trim()}
              onClick={handleReject}
              className="w-full rounded-xl bg-rose-600 py-3 font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
            >
              {processing ? "Đang xử lý..." : "Xác nhận từ chối"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
          }
// ========== HELPER COMPONENTS ==========
function StatCard({ title, value, color = "text-slate-900" }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-xs text-slate-500">{title}</div>
      <div className={`mt-1 text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-3">
      <div className="mb-1 text-xs font-semibold uppercase text-slate-400">
        {label}
      </div>
      <div className="text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}

function SecretBox({ label, value, revealed, onToggle, onCopy }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase text-amber-700">
          {label} 🔒
        </div>
        <div className="flex gap-1">
          <button
            onClick={onToggle}
            className="rounded-lg p-1.5 text-amber-700 hover:bg-amber-100"
            title={revealed ? "Ẩn" : "Hiện"}
          >
            {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button
            onClick={onCopy}
            className="rounded-lg p-1.5 text-amber-700 hover:bg-amber-100"
            title="Copy"
          >
            <Copy size={14} />
          </button>
        </div>
      </div>
      <div className="font-mono text-sm text-slate-800">
        {revealed ? value || "—" : maskText(value, 4)}
      </div>
    </div>
  );
}
