import React, { useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Btn, Card, EmptyState, ErrorState, FilterPills, Loading, Modal, SearchBox, SectionHeader,
  StatusBadge, fmtNum, fmtTime, useAdminList,
} from "../components/admin/AdminUI";

const loadOrders = () =>
  supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200);

const FILTERS = [
  { id: "paid", label: "Chờ giao" },
  { id: "all", label: "Tất cả" },
];

const GAME = { freefire: "Free Fire", pubg: "PUBG Mobile", fco: "FC Online", valorant: "Valorant" };

// Các cột hiển thị trong phần chi tiết (bỏ cột trống)
const DETAIL_KEYS = [
  "roblox_username", "roblox_user_id", "package_id", "robux", "uid", "quanhuy", "pt_uid", "pt_gold",
  "ff_uid", "ff_diamond", "pubg_uid", "pubg_uc", "pubg_bonus", "fco_character_id", "fco_fc",
  "riot_id", "vp", "receive_method", "contact_value", "payment_method", "note",
];

const whoOf = (o) =>
  o.roblox_username || o.fco_character_id || o.riot_id || o.ff_uid || o.pubg_uid || o.pt_uid || o.uid || "-";

export default function AdminGameOrdersTab({ onChanged }) {
  const { data: orders, loading, error, reload } = useAdminList(loadOrders);
  const [filter, setFilter] = useState("paid");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(null);
  const [rejectOrder, setRejectOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busyId, setBusyId] = useState(null);

  const shown = useMemo(() => {
    const kw = search.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (filter === "all" || o.status === "paid") &&
        (!kw ||
          [o.order_code, o.game, whoOf(o), o.package_id, o.contact_value]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(kw)))
    );
  }, [orders, filter, search]);

  const update = async (order, patch) => {
    if (busyId) return false;
    setBusyId(order.id);
    const { error: err } = await supabase
      .from("orders")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", order.id);
    setBusyId(null);
    if (err) {
      alert("Có lỗi: " + err.message);
      return false;
    }
    await reload();
    onChanged?.();
    return true;
  };

  const reject = async () => {
    const ok = await update(rejectOrder, { status: "rejected", note: rejectReason.trim() || "Đơn bị từ chối" });
    if (ok) {
      setRejectOrder(null);
      setRejectReason("");
    }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Đơn game" description="Đơn nạp game đã thanh toán, chờ giao" onRefresh={reload} loading={loading} />
      <SearchBox value={search} onChange={setSearch} placeholder="Tìm mã đơn, ID game, liên hệ..." />
      <FilterPills options={FILTERS} value={filter} onChange={setFilter} />

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : shown.length === 0 ? (
        <EmptyState text={filter === "paid" ? "Không có đơn nào chờ giao" : "Không có đơn nào"} />
      ) : (
        <div className="space-y-3">
          {shown.map((o) => (
            <Card key={o.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[17px] font-semibold text-[#242424]">{GAME[o.game] || "Roblox / khác"}</p>
                  <p className="mt-0.5 text-[13px] text-[#6b7280]">
                    #{o.order_code || String(o.id).slice(0, 8)} · {fmtNum(o.amount)}đ · {fmtTime(o.created_at)}
                  </p>
                </div>
                <StatusBadge status={o.status} />
              </div>

              <div className="mt-3 rounded-lg bg-[#f4f4f4] px-3 py-2.5 text-[14px] text-[#242424]">
                <span className="text-[#6b7280]">Tài khoản: </span>
                {whoOf(o)}
                {o.contact_value ? <span className="text-[#6b7280]"> · {o.contact_value}</span> : null}
              </div>

              <button
                onClick={() => setOpen(open === o.id ? null : o.id)}
                className="mt-2 text-[13px] font-medium text-[#0099ff]"
              >
                {open === o.id ? "Ẩn chi tiết" : "Xem chi tiết"}
              </button>

              {open === o.id && (
                <div className="mt-2 space-y-1 text-[13px] text-[#242424]">
                  {DETAIL_KEYS.filter((k) => o[k] !== null && o[k] !== undefined && o[k] !== "").map((k) => (
                    <p key={k}>
                      <span className="text-[#6b7280]">{k}: </span>
                      {String(o[k])}
                    </p>
                  ))}
                </div>
              )}

              {o.status === "paid" && (
                <div className="mt-3 flex gap-2">
                  <Btn className="flex-1" disabled={busyId === o.id} onClick={() => update(o, { status: "delivered" })}>
                    {busyId === o.id ? "Đang xử lý..." : "Đã giao"}
                  </Btn>
                  <Btn variant="ghost" className="flex-1" disabled={busyId === o.id} onClick={() => setRejectOrder(o)}>
                    Từ chối
                  </Btn>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {rejectOrder && (
        <Modal
          title="Từ chối đơn"
          onClose={() => {
            setRejectOrder(null);
            setRejectReason("");
          }}
        >
          <p className="mb-3 text-[14px] text-[#6b7280]">
            Đơn đã thanh toán {fmtNum(rejectOrder.amount)}đ, bạn cần hoàn tiền cho khách riêng.
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Nhập lý do từ chối..."
            rows={3}
            className="w-full rounded-lg border border-[#e5e7eb] p-3 text-[14px] outline-none focus:border-[#101010]"
          />
          <Btn className="mt-3 w-full" disabled={busyId === rejectOrder.id} onClick={reject}>
            {busyId === rejectOrder.id ? "Đang xử lý..." : "Xác nhận từ chối"}
          </Btn>
        </Modal>
      )}
    </div>
  );
}
