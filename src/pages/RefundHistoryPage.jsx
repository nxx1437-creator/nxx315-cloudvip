// src/pages/RefundHistoryPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Clock3, CheckCircle2, XCircle, Wallet2, ChevronRight, Copy, ExternalLink } from "lucide-react";
import useSession from "../hooks/useSession.js";
import { supabase } from "../lib/supabaseClient.js";

const formatVND = (v) => Number(v || 0).toLocaleString("vi-VN") + "đ";

export default function RefundHistoryPage() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRefund, setTotalRefund] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalOverdue, setTotalOverdue] = useState(0);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchRefunds = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('affiliate_transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .in('status', [3, 4, 5])
        .order('transaction_time', { ascending: false })
        .limit(50);

      if (!error && data) {
        setRefunds(data);
        
        const refund = data.filter(t => t.status === 3);
        const paid = data.filter(t => t.status === 4);
        const overdue = data.filter(t => t.status === 5);
        
        setTotalRefund(refund.reduce((sum, t) => sum + (t.star_points_awarded || 0), 0));
        setTotalPaid(paid.reduce((sum, t) => sum + (t.star_points_awarded || 0), 0));
        setTotalOverdue(overdue.reduce((sum, t) => sum + (t.star_points_awarded || 0), 0));
      }

      setLoading(false);
    };

    fetchRefunds();
  }, [session?.user?.id]);

  const statusMap = {
    3: { label: "Cần hoàn trả", icon: AlertTriangle, cls: "text-orange-500 bg-orange-50 border-orange-200", badge: "CÂN HOÀN TRẢ" },
    4: { label: "Đã hoàn trả", icon: CheckCircle2, cls: "text-emerald-500 bg-emerald-50 border-emerald-200", badge: "ĐÃ HOÀN TRẢ" },
    5: { label: "Quá hạn", icon: XCircle, cls: "text-rose-500 bg-rose-50 border-rose-200", badge: "QUÁ HẠN" },
  };

  const tabs = [
    { key: "all", label: "Tất cả" },
    { key: "refund", label: "Cần hoàn trả" },
    { key: "paid", label: "Đã hoàn trả" },
    { key: "overdue", label: "Quá hạn" },
  ];

  const filteredRefunds = refunds.filter(item => {
    if (activeTab === "all") return true;
    if (activeTab === "refund") return item.status === 3;
    if (activeTab === "paid") return item.status === 4;
    if (activeTab === "overdue") return item.status === 5;
    return true;
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-[#F5F8F4] text-[#18231D]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-[#1A8C3F] to-[#45B967] px-4 py-4">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white">
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-[17px] font-bold text-white">Đơn cần hoàn trả</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-3.5 pt-3.5 pb-28">
        {/* Card thống kê */}
        <div className="rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <p className="text-[11px] font-semibold text-[#6B7280]">Cài đặt tính năng Hoàn nhanh 48H</p>
          <p className="mt-1 text-[10px] leading-4 text-[#9CA3AF]">
            Bạn có đơn cần hoàn trả, hãy đảm bảo số dư ví tương ứng để tự động thu hồi trong 7 ngày. 
            Nếu không, tính năng mua hàng kiếm sao sẽ tạm khóa.
          </p>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-orange-50 p-2.5 text-center border border-orange-100">
              <p className="text-[8px] font-semibold text-orange-600">Cần hoàn trả</p>
              <p className="text-[15px] font-bold text-orange-500">{formatVND(totalRefund)}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-center border border-emerald-100">
              <p className="text-[8px] font-semibold text-emerald-600">Đã hoàn trả</p>
              <p className="text-[15px] font-bold text-emerald-500">{formatVND(totalPaid)}</p>
            </div>
            <div className="rounded-xl bg-rose-50 p-2.5 text-center border border-rose-100">
              <p className="text-[8px] font-semibold text-rose-600">Quá hạn thu hồi</p>
              <p className="text-[15px] font-bold text-rose-500">{formatVND(totalOverdue)}</p>
            </div>
          </div>
        </div>

        {/* Tabs - Style MoMo */}
        <div className="mt-3.5 flex gap-1 overflow-x-auto rounded-xl bg-white p-1 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-center text-[10px] font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-[#45B967] text-white shadow-sm"
                  : "text-[#7A897F] hover:bg-[#F5F8F4]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Danh sách đơn */}
        {loading ? (
          <div className="mt-6 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#45B967] border-t-transparent" />
          </div>
        ) : filteredRefunds.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-[#9CA3AF]">Không có đơn cần hoàn trả</p>
            <p className="mt-1 text-[10px] text-[#C6CEC8]">Bạn đã hoàn tất tất cả các khoản</p>
          </div>
        ) : (
          <div className="mt-3.5 space-y-3">
            {filteredRefunds.map((item) => {
              const status = statusMap[item.status] || statusMap[3];
              const StatusIcon = status.icon;
              return (
                <div key={item.id} className="rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#18231D]">Mã hoàn: #{item.refund_id || item.id.slice(-9)}</span>
                      <button 
                        onClick={() => copyToClipboard(item.refund_id || item.id)}
                        className="text-[#9CA3AF] hover:text-[#6B7280]"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-bold border ${status.cls}`}>
                      <StatusIcon size={8} />
                      {status.badge}
                    </span>
                  </div>

                  {/* Thông tin đơn hàng */}
                  <div className="mt-2 flex items-center gap-1 text-[9px] text-[#9CA3AF]">
                    <span>Thuộc đơn hàng: #{item.order_id || ""}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <div className="flex items-center gap-2 text-[9px] text-[#9CA3AF]">
                      <span>{item.platform || "TikTok Shop"}</span>
                      <span className="w-1 h-1 rounded-full bg-[#D1D9D3]" />
                      <span>{item.transaction_time ? new Date(item.transaction_time).toLocaleString("vi-VN") : ""}</span>
                    </div>
                    <p className="text-[15px] font-bold text-orange-500">+{formatVND(item.star_points_awarded || 0)}</p>
                  </div>

                  {/* mua hàng kiếm sao */}
                  <div className="mt-2 flex items-center gap-2 rounded-lg bg-[#F0F7FF] p-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E3F0FF]">
                      <Clock3 size={12} className="text-[#1A8C3F]" />
                    </div>
                    <span className="text-[9px] font-semibold text-[#1A8C3F]">Hoàn Nhanh 48H</span>
                    <span className={`ml-auto text-[8px] font-bold px-2 py-0.5 rounded-full ${status.cls}`}>
                      {status.badge}
                    </span>
                  </div>

                  {/* Hướng dẫn */}
                  {item.status === 3 && (
                    <div className="mt-2 rounded-lg bg-orange-50 p-2.5 border border-orange-100">
                      <p className="text-[8px] text-orange-600 leading-4">
                        Truy thu được thực hiện tự động lúc 8h sáng và 8h tối, trong 7 ngày kể từ khi đơn bị từ chối. 
                        Theo dõi trạng thái tại danh sách "Đơn cần hoàn trả".
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-3 flex items-center justify-between border-t border-[#F3F4F6] pt-3">
                    <div>
                      <p className="text-[8px] text-[#9CA3AF]">Tổng cần trả</p>
                      <p className="text-[13px] font-bold text-orange-500">{formatVND(item.star_points_awarded || 0)}</p>
                    </div>
                    {item.status === 3 && (
                      <button className="rounded-xl bg-orange-500 px-6 py-2 text-[10px] font-bold text-white shadow-sm hover:bg-orange-600 transition-colors">
                        Nạp tiền
                      </button>
                    )}
                    {item.status === 4 && (
                      <span className="text-[10px] font-semibold text-emerald-500">✓ Đã hoàn tất</span>
                    )}
                    {item.status === 5 && (
                      <span className="text-[10px] font-semibold text-rose-500">⚠️ Quá hạn</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
