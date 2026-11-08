import React, { useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Btn, Card, EmptyState, ErrorState, FilterPills, Loading, Modal, SearchBox, SectionHeader,
  StatusBadge, fmtNum, fmtTime, useAdminList,
} from "../components/admin/AdminUI";

const ADMIN_CHAT_ID = import.meta.env.VITE_ADMIN_CHAT_ID;

const loadOrders = () =>
  supabase.from("redemption_orders").select("*").order("created_at", { ascending: false }).limit(200);

const FILTERS = [
  { id: "pending", label: "Chờ duyệt" },
  { id: "all", label: "Tất cả" },
];

async function notifyTelegram(message) {
  if (!ADMIN_CHAT_ID) return;
  try {
    await fetch("/api/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: message }),
    });
  } catch (err) {
    console.error("Telegram:", err);
  }
}

export default function AdminOrdersTab({ onChanged }) {
  const { data: orders, loading, error, reload } = useAdminList(loadOrders);
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [rejectOrder, setRejectOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busyId, setBusyId] = useState(null);

  const shown = useMemo(() => {
    const kw = search.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (filter === "all" || o.status === "pending") &&
        (!kw ||
          [o.id, o.order_code, o.package_name, o.delivery_target, o.status]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(kw)))
    );
  }, [orders, filter, search]);

  const refresh = async () => {
    await reload();
    onChanged?.();
  };

  const deliver = async (order) => {
    if (busyId) return;
    setBusyId(order.id);
    const { error: err } = await supabase
      .from("redemption_orders")
      .update({ status: "delivered", delivered_at: new Date().toISOString() })
      .eq("id", order.id);
    setBusyId(null);
    if (err) return alert("Có lỗi: " + err.message);
    notifyTelegram(`✅ Đơn #${order.order_code || order.id} đã giao thành công.`);
    await refresh();
  };

  // Từ chối bằng hàm reject_order trên Supabase: hoàn xu cho người dùng
  const reject = async () => {
    if (!rejectOrder || busyId) return;
    setBusyId(rejectOrder.id);
    const reason = rejectReason.trim() || "Đơn hàng bị từ chối";
    const { data, error: err } = await supabase.rpc("reject_order", {
      p_order_id: rejectOrder.id,
      p_reason: reason,
    });
    setBusyId(null);
    if (err || data?.success === false) return alert("Có lỗi: " + (err?.message || data?.error));
    notifyTelegram(`❌ Đơn #${rejectOrder.order_code || rejectOrder.id} bị từ chối và đã hoàn xu.\nLý do: ${reason}`);
    setRejectOrder(null);
    setRejectReason("");
    await refresh();
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Đổi thưởng" description="Đơn đổi thưởng của người dùng" onRefresh={reload} loading={loading} />
      <SearchBox value={search} onChange={setSearch} placeholder="Tìm mã đơn, gói, thông tin nhận..." />
      <FilterPills options={FILTERS} value={filter} onChange={setFilter} />

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : shown.length === 0 ? (
        <EmptyState text={filter === "pending" ? "Không có đơn nào chờ duyệt" : "Không có đơn nào"} />
      ) : (
        <div className="space-y-3">
          {shown.map((o) => (
            <Card key={o.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[17px] font-semibold text-[#242424]">{o.package_name || "-"}</p>
                  <p className="mt-0.5 text-[13px] text-[#6b7280]">
                    #{o.order_code || String(o.id).slice(0, 8)} · {fmtNum(o.coins_charged)} xu · {fmtTime(o.created_at)}
                  </p>
                </div>
                <StatusBadge status={o.status} />
              </div>

              <div className="mt-3 rounded-lg bg-[#f4f4f4] px-3 py-2.5 text-[14px] text-[#242424]">
                <span className="text-[#6b7280]">{o.delivery_method || "Nhận qua"}: </span>
                {o.delivery_target || "-"}
              </div>
              {o.admin_note && <p className="mt-2 text-[13px] text-[#6b7280]">Ghi chú: {o.admin_note}</p>}

              {o.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <Btn className="flex-1" disabled={busyId === o.id} onClick={() => deliver(o)}>
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
          title="Từ chối đơn hàng"
          onClose={() => {
            setRejectOrder(null);
            setRejectReason("");
          }}
        >
          <p className="mb-3 text-[14px] text-[#6b7280]">
            {fmtNum(rejectOrder.coins_charged)} xu sẽ được hoàn lại cho người dùng.
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Nhập lý do từ chối..."
            rows={3}
            className="w-full rounded-lg border border-[#e5e7eb] p-3 text-[14px] outline-none focus:border-[#101010]"
          />
          <Btn className="mt-3 w-full" disabled={busyId === rejectOrder.id} onClick={reject}>
            {busyId === rejectOrder.id ? "Đang xử lý..." : "Xác nhận từ chối và hoàn xu"}
          </Btn>
        </Modal>
      )}
    </div>
  );
}
