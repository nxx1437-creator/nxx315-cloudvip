import React from "react";
import { ChevronRight } from "lucide-react";
import { Btn, Card, SectionHeader } from "../components/admin/AdminUI";

const TODO = [
  { key: "redeem", label: "Đơn đổi thưởng chờ duyệt", go: "orders" },
  { key: "game", label: "Đơn game đã thanh toán, chờ giao", go: "game-orders" },
  { key: "cards", label: "Thẻ cào chờ gửi", go: "card-orders" },
  { key: "withdrawals", label: "Yêu cầu rút tiền", go: "withdrawals" },
  { key: "tickets", label: "Yêu cầu hỗ trợ chưa trả lời", go: "support" },
  { key: "posts", label: "Bài viết chờ duyệt", go: "posts" },
];

const QUICK = [
  { label: "Gửi thẻ cào", go: "card-orders" },
  { label: "Trả lời hỗ trợ", go: "support" },
  { label: "Duyệt rút tiền", go: "withdrawals" },
  { label: "Gửi thông báo", go: "notify" },
  { label: "Tài khoản", go: "users" },
];

export default function AdminHome({ counts, onGo, onRefresh }) {
  const total = TODO.reduce((sum, t) => sum + (counts[t.key] || 0), 0);

  return (
    <div className="space-y-5">
      <SectionHeader title="Tổng quan" description="Việc cần xử lý hôm nay" onRefresh={onRefresh} />

      <div className="rounded-xl bg-[#eff6fe] px-4 py-3.5 text-[14px] font-medium text-[#0099ff]">
        {total > 0 ? `Bạn có ${total} việc cần xử lý` : "Không có việc nào cần xử lý"}
      </div>

      <Card className="overflow-hidden">
        {TODO.map((t, i) => {
          const n = counts[t.key];
          if (n === null || n === undefined) return null;
          return (
            <button
              key={t.key}
              onClick={() => onGo(t.go)}
              className={`flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-[#f4f4f4] ${
                i > 0 ? "border-t border-[#e5e7eb]" : ""
              }`}
            >
              <span className="flex-1 text-[15px] text-[#242424]">{t.label}</span>
              <span
                className={`rounded-full px-3 py-1 text-[13px] font-semibold ${
                  n > 0 ? "bg-[#101010] text-white" : "bg-[#f4f4f4] text-[#898989]"
                }`}
              >
                {n}
              </span>
              <ChevronRight size={16} className="text-[#898989]" />
            </button>
          );
        })}
      </Card>

      <div>
        <h3 className="mb-3 text-[20px] font-semibold tracking-[0.01em] text-[#242424]">Thao tác nhanh</h3>
        <div className="flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <Btn key={q.label} variant="ghost" onClick={() => onGo(q.go)}>
              {q.label}
            </Btn>
          ))}
        </div>
      </div>
    </div>
  );
}
