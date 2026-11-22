import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Coins,
  Copy,
  ExternalLink,
  Landmark,
  Mail,
  MessageCircle,
  PackageCheck,
  Ticket,
  XCircle,
} from "lucide-react";

// Chưa tính phí 30%: pass đặt giá đúng bằng số Robux của gói
export const passPriceFor = (robux) => Number(robux || 0);

export function getStatusInfo(status, paymentMethod, isPass = false) {
  const isBank = paymentMethod === "bank" || paymentMethod === "banking";

  if (status === "pending") {
    return {
      label: isBank ? "Chờ chuyển khoản" : "Chờ thanh toán",
      className: "bg-yellow-100 text-yellow-700",
      icon: Clock3,
    };
  }

  if (status === "paid") {
    if (isPass) {
      return {
        label: "Chờ mua game pass",
        className: "bg-orange-100 text-orange-700",
        icon: Ticket,
      };
    }
    return {
      label: isBank ? "Chờ xác nhận CK" : "Chờ duyệt (Coin)",
      className: isBank
        ? "bg-amber-100 text-amber-700"
        : "bg-blue-100 text-blue-700",
      icon: isBank ? Landmark : Coins,
    };
  }

  if (status === "processing") {
    return {
      label: isPass ? "Chờ Robux về khách" : "Đang xử lý",
      className: "bg-orange-100 text-orange-700",
      icon: PackageCheck,
    };
  }

  if (status === "delivered") {
    return {
      label: "Đã giao",
      className: "bg-green-100 text-green-700",
      icon: CheckCircle2,
    };
  }

  if (status === "rejected") {
    return {
      label: "Đã từ chối",
      className: "bg-red-100 text-red-700",
      icon: XCircle,
    };
  }

  return {
    label: status || "Không rõ",
    className: "bg-gray-100 text-gray-700",
    icon: AlertCircle,
  };
}

export function formatMoney(value) {
  return new Intl.NumberFormat("vi-VN").format(Number(value || 0)) + "đ";
}

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("vi-VN");
}

export function ReceiveMethodBadge({ method }) {
  if (!method) return null;

  if (method === "gamepass") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
        <Ticket className="h-3 w-3" />
        Game Pass
      </span>
    );
  }

  if (method === "zalo") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
        <MessageCircle className="h-3 w-3" />
        Zalo
      </span>
    );
  }

  if (method === "email") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">
        <Mail className="h-3 w-3" />
        Email
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
      {method}
    </span>
  );
}

export function PaymentMethodBadge({ method }) {
  if (!method) return null;

  if (method === "coin") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-700">
        <Coins className="h-3 w-3" />
        Trả bằng Coin
      </span>
    );
  }

  if (method === "bank" || method === "banking") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <Landmark className="h-3 w-3" />
        Chuyển khoản
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
      {method}
    </span>
  );
}

// Khung thông tin game pass để admin mở link và mua
export function PassBox({ order, onCopy, copiedKey }) {
  const need = passPriceFor(order.robux);
  const url = String(order.contact_value || "");
  const safe = url.startsWith("https://www.roblox.com/game-pass/");
  const key = `contact-${order.id}`;

  return (
    <div className="mt-1 space-y-2 rounded-xl border border-dashed border-orange-300 bg-orange-50/60 p-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Ticket className="h-4 w-4 text-orange-600" />
        <span className="font-semibold text-gray-700">Game pass cần mua:</span>
        <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700">
          {need} R$
        </span>
        <span className="text-xs text-gray-500">
         (khách nhận khoảng {Math.floor(order.robux * 0.7)} R$ sau phí 30%)
        </span>
      </div>

      <div className="break-all rounded-lg bg-white/70 p-2 font-mono text-xs text-gray-700">
        {url || "—"}
      </div>

      {safe && (
        <div className="flex flex-wrap gap-2">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-700"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Mở game pass
          </a>
          <button
            type="button"
            onClick={() => onCopy(url, key)}
            className="inline-flex items-center gap-1 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <Copy className="h-3.5 w-3.5" />
            {copiedKey === key ? "Đã copy!" : "Copy link"}
          </button>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Mở link, kiểm tra giá đúng {need} R$ rồi mua. Mua xong bấm nút Đã mua game
        pass.
      </p>
    </div>
  );
}

export function StatCard({ title, value, accent }) {
  const accentClass =
    accent === "amber"
      ? "text-amber-600"
      : accent === "blue"
      ? "text-blue-600"
      : accent === "orange"
      ? "text-orange-600"
      : "text-gray-900";

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-xs text-gray-500">{title}</div>
      <div className={`mt-1 text-2xl font-bold ${accentClass}`}>{value}</div>
    </div>
  );
}
