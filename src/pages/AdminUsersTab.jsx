import React, { useMemo, useState } from "react";
import { Ban, Check, Eye, Search, UserCheck, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import BanUserModal from "../components/BanUserModal";
import {
  EmptyState, ErrorState, InfoBox, Loading, Modal, SectionHeader,
  fmtDate, fmtNum, useAdminList,
} from "../components/admin/AdminUI";

const loadUsers = () => supabase.from("profiles").select("*").order("created_at", { ascending: false });
const loadStarWithdrawals = () =>
  supabase.from("star_withdrawals").select("*").order("created_at", { ascending: false });

// ===== Tài khoản =====
export function UsersTab() {
  const { data: users, setData: setUsers, loading, error, reload } = useAdminList(loadUsers);
  const [search, setSearch] = useState("");
  const [banUser, setBanUser] = useState(null);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter((u) =>
      [u.username, u.display_name, u.email, u.id, u.roblox_username]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(keyword))
    );
  }, [users, search]);

  const togglePostPermission = async (user) => {
    const next = !user.can_post;
    const { error: err } = await supabase.from("profiles").update({ can_post: next }).eq("id", user.id);
    if (err) return alert("Có lỗi: " + err.message);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, can_post: next } : u)));
  };

  const unbanUser = async (user) => {
    const { error: err } = await supabase
      .from("profiles")
      .update({ is_banned: false, ban_reason: null, banned_at: null })
      .eq("id", user.id);
    if (err) return alert("Có lỗi: " + err.message);
    await reload();
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="Người dùng" description="Quản lý tài khoản người dùng" onRefresh={reload} loading={loading} />

      <div className="rounded-2xl border bg-white p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm username, email..."
            className="w-full rounded-xl border py-3 pl-10 pr-4 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : filteredUsers.length === 0 ? (
        <EmptyState text="Không tìm thấy người dùng" />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left">Người dùng</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Coin</th>
                  <th className="px-4 py-3 text-left">Đăng bài</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-4">
                      <div className="font-semibold">{user.username || user.display_name || "Không tên"}</div>
                      <div className="text-xs text-slate-400">{user.id}</div>
                    </td>
                    <td className="px-4 py-4">{user.email || "-"}</td>
                    <td className="px-4 py-4 font-semibold">{fmtNum(user.coins)}</td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => togglePostPermission(user)}
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          user.can_post ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {user.can_post ? "Được phép" : "Không"}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      {user.is_banned ? (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">Đã ban</span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">Hoạt động</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {user.is_banned ? (
                        <button
                          onClick={() => unbanUser(user)}
                          aria-label="Bỏ ban"
                          className="rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-100"
                        >
                          <UserCheck size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => setBanUser(user)}
                          aria-label="Ban"
                          className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                        >
                          <Ban size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {banUser && (
        <BanUserModal
          user={banUser}
          onClose={() => setBanUser(null)}
          onSuccess={async () => {
            setBanUser(null);
            await reload();
          }}
        />
      )}
    </div>
  );
}

// ===== Affiliate (yêu cầu rút tiền affiliate) =====
const STAR_STATUS = {
  pending: "Đang chờ", processing: "Đang xử lý", approved: "Đã duyệt",
  completed: "Đã thanh toán", rejected: "Đã từ chối", cancelled: "Đã hủy",
};

export function AffiliateTab() {
  const { data: items, loading, error, reload } = useAdminList(loadStarWithdrawals);
  const [detail, setDetail] = useState(null);
  const [rejectItem, setRejectItem] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const amountOf = (w) => fmtNum(w.amount || w.coins);

  const update = async (item, status, extra = {}) => {
    if (processing) return;
    setProcessing(true);
    const { error: err } = await supabase
      .from("star_withdrawals")
      .update({ status, ...extra, updated_at: new Date().toISOString() })
      .eq("id", item.id);
    if (err) alert("Có lỗi: " + err.message);
    else {
      await reload();
      setDetail(null);
      setRejectItem(null);
      setRejectReason("");
    }
    setProcessing(false);
  };

  const handleReject = () => {
    if (rejectItem) update(rejectItem, "rejected", { reject_reason: rejectReason.trim() || "Không có lý do" });
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="Affiliate" description="Quản lý yêu cầu rút tiền affiliate" onRefresh={reload} loading={loading} />

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState text="Chưa có yêu cầu rút tiền" />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Số tiền</th>
                  <th className="px-4 py-3 text-left">Ngân hàng</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Thời gian</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-semibold">#{w.id}</td>
                    <td className="px-4 py-4">{w.user_id || "-"}</td>
                    <td className="px-4 py-4 font-bold">{amountOf(w)}</td>
                    <td className="px-4 py-4">
                      <div className="font-medium">{w.bank_name || w.bank || "-"}</div>
                      <div className="text-xs text-slate-500">{w.account_number || "-"}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                        {STAR_STATUS[w.status] || w.status || "Không rõ"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-500">{fmtDate(w.created_at)}</td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => setDetail(w)}
                        aria-label="Xem chi tiết"
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detail && (
        <Modal title={`Yêu cầu #${detail.id}`} onClose={() => setDetail(null)}>
          <div className="space-y-3">
            <InfoBox label="User ID" value={detail.user_id || "-"} />
            <InfoBox label="Số tiền" value={amountOf(detail)} />
            <InfoBox label="Ngân hàng" value={detail.bank_name || detail.bank || "-"} />
            <InfoBox label="Số tài khoản" value={detail.account_number || "-"} />
            <InfoBox label="Chủ tài khoản" value={detail.account_name || detail.holder_name || "-"} />
            <InfoBox label="Trạng thái" value={STAR_STATUS[detail.status] || detail.status || "-"} />
            {detail.reject_reason && <InfoBox label="Lý do từ chối" value={detail.reject_reason} />}
            {detail.status === "pending" && (
              <div className="flex gap-2 pt-3">
                <button
                  disabled={processing}
                  onClick={() => update(detail, "approved")}
                  className="flex-1 rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  <Check size={17} className="mr-2 inline" />Duyệt
                </button>
                <button
                  disabled={processing}
                  onClick={() => setRejectItem(detail)}
                  className="flex-1 rounded-xl bg-red-600 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  <X size={17} className="mr-2 inline" />Từ chối
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {rejectItem && (
        <Modal
          title="Từ chối rút tiền"
          onClose={() => {
            setRejectItem(null);
            setRejectReason("");
          }}
        >
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            placeholder="Nhập lý do từ chối..."
            className="w-full rounded-xl border p-3 outline-none focus:border-blue-500"
          />
          <button
            disabled={processing}
            onClick={handleReject}
            className="mt-3 w-full rounded-xl bg-red-600 py-3 font-semibold text-white disabled:opacity-50"
          >
            {processing ? "Đang xử lý..." : "Xác nhận từ chối"}
          </button>
        </Modal>
      )}
    </div>
  );
      }
