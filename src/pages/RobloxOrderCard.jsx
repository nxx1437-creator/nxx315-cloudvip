import React from "react";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Copy,
  Mail,
  MessageCircle,
  PackageCheck,
  RefreshCw,
  Ticket,
  XCircle,
} from "lucide-react";
import {
  PassBox,
  PaymentMethodBadge,
  ReceiveMethodBadge,
  formatDate,
  formatMoney,
  getStatusInfo,
} from "./RobloxOrderParts.jsx";

export default function RobloxOrderCard({
  order,
  updating,
  copiedKey,
  onCopy,
  onApprove,
  onDeliver,
  onReject,
}) {
  const isPass = order.receive_method === "gamepass";
  const info = getStatusInfo(order.status, order.payment_method, isPass);
  const Icon = info.icon;
  const copyKey = `contact-${order.id}`;
  const isCopied = copiedKey === copyKey;
  const isBank =
    order.payment_method === "bank" || order.payment_method === "banking";

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold">
              {order.order_code || `#${order.id}`}
            </span>

            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${info.className}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {info.label}
            </span>

            <PaymentMethodBadge method={order.payment_method} />
            <ReceiveMethodBadge method={order.receive_method} />
          </div>

          <div className="grid gap-x-8 gap-y-1 text-sm text-gray-600 md:grid-cols-2">
            <div>
              Roblox:{" "}
              <span className="font-medium text-gray-900">
                {order.roblox_username || "—"}
              </span>
            </div>
            <div>
              Roblox ID:{" "}
              <span className="font-medium text-gray-900">
                {order.roblox_user_id || "—"}
              </span>
            </div>
            <div>
              Robux:{" "}
              <span className="font-semibold text-gray-900">
                {Number(order.robux || 0).toLocaleString("vi-VN")} R$
              </span>
            </div>
            <div>
              Số tiền:{" "}
              <span className="font-semibold text-gray-900">
                {formatMoney(order.amount)}
              </span>
            </div>
          </div>

          {isPass ? (
            <PassBox order={order} onCopy={onCopy} copiedKey={copiedKey} />
          ) : order.contact_value ? (
            <div className="mt-1 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-2.5">
              <span className="text-xs font-semibold text-gray-600">
                Nhận code qua:
              </span>

              <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                {order.receive_method === "zalo" && (
                  <MessageCircle className="h-4 w-4 text-blue-600" />
                )}
                {order.receive_method === "email" && (
                  <Mail className="h-4 w-4 text-purple-600" />
                )}
                {order.contact_value}
              </span>

              <button
                type="button"
                onClick={() => onCopy(order.contact_value, copyKey)}
                className="inline-flex items-center gap-1 rounded-lg border bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <Copy className="h-3 w-3" />
                {isCopied ? "Đã copy!" : "Copy"}
              </button>

              {order.receive_method === "zalo" && (
                <a
                  href={`https://zalo.me/${String(order.contact_value).replace(
                    /[^0-9]/g,
                    ""
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  <MessageCircle className="h-3 w-3" />
                  Mở Zalo
                </a>
              )}

              {order.receive_method === "email" && (
                <a
                  href={`mailto:${order.contact_value}?subject=Mã Robux đơn ${
                    order.order_code || `#${order.id}`
                  }`}
                  className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-2 py-1 text-xs font-semibold text-white hover:bg-purple-700"
                >
                  <Mail className="h-3 w-3" />
                  Gửi Email
                </a>
              )}
            </div>
          ) : (
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-dashed border-red-200 bg-red-50/50 p-2.5 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              Đơn này chưa có thông tin nhận code.
            </div>
          )}

          <div className="text-xs text-gray-400">
            Tạo: {formatDate(order.created_at)}
            {order.updated_at && order.updated_at !== order.created_at && (
              <> · Cập nhật: {formatDate(order.updated_at)}</>
            )}
          </div>

          {order.note && (
            <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
              <span className="font-semibold">Ghi chú:</span> {order.note}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {order.status === "paid" && (
            <>
              <button
                type="button"
                disabled={updating}
                onClick={() => onApprove(order)}
                className={
                  isPass
                    ? "inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
                    : isBank
                    ? "inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    : "inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                }
              >
                {isPass ? (
                  <>
                    <Ticket className="h-4 w-4" />
                    Đã mua game pass
                  </>
                ) : isBank ? (
                  <>
                    <BadgeCheck className="h-4 w-4" />
                    Đã nhận tiền
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Duyệt đơn
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={updating}
                onClick={() => onReject(order)}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                <XCircle className="h-4 w-4" />
                Từ chối
              </button>
            </>
          )}

          {order.status === "processing" && (
            <button
              type="button"
              disabled={updating}
              onClick={() => onDeliver(order)}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              <PackageCheck className="h-4 w-4" />
              Đã giao Robux
            </button>
          )}

          {order.status === "delivered" && (
            <span className="inline-flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Đã giao thành công
            </span>
          )}

          {order.status === "rejected" && (
            <span className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
              <XCircle className="h-4 w-4" />
              Đã từ chối
            </span>
          )}

          {updating && (
            <span className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-500">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Đang cập nhật...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
