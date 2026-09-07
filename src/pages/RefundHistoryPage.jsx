import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Clock3, CheckCircle2, XCircle, Wallet2, ChevronRight } from "lucide-react";
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

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchRefunds = async () => {
      setLoading(true);
      
      // Lấy các đơn cần hoàn trả (status = 3)
      const { data, error } = await supabase
        .from('affiliate_transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .in('status', [3, 4, 5]) // 3: cần hoàn, 4: đã hoàn trả, 5: quá hạn
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
    3: { label: "Cần hoàn trả", icon: AlertTriangle, cls: "text-orange-600 bg-orange-50" },
    4: { label: "Đã hoàn trả", icon: CheckCircle2, cls: "text-emerald-600 bg-emerald-50" },
    5: { label: "Quá hạn thu hồi", icon: XCircle, cls: "text-rose-600 bg-rose-50" },
  };

  return (
    <div className="min-h-screen bg-[#F5F8F4] text-[#18231D]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-black/[0.04] bg-[#F5F8F4]/95 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#66736B] shadow-sm">
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-[15px] font-black text-[#18231D]">Đơn cần hoàn trả</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-3.5 pt-3.5 pb-28">
        {/* Cài đặt */}
        <div className="rounded-[22px] bg-white p-4 shadow-[0_5px_20px_rgba(31,55,40,0.05)]">
          <p className="text-[10px] font-black text-[#7A897F]">Cài đặt tính năng Hoàn nhanh 48H</p>
          <p className="mt-2 text-[10px] leading-4 text-[#6B7280]">
            Bạn có đơn cần hoàn trả, hãy đảm bảo số dư ví tương ứng để MoMo tự động thu hồi trong 7 ngày. 
            Nếu không, tính năng hoàn nhanh 48H sẽ tạm khóa.
          </p>
        </div>

        {/* Thống kê */}
        <div className="mt-3.5 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-orange-50 p-3 text-center border border-orange-100">
            <p className="text-[8px] font-black text-orange-600">Cần hoàn trả</p>
            <p className="text-[14px] font-black text-orange-600">{formatVND(totalRefund)}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 text-center border border-emerald-100">
            <p className="text-[8px] font-black text-emerald-600">Đã hoàn trả</p>
            <p className="text-[14px] font-black text-emerald-600">{formatVND(totalPaid)}</p>
          </div>
          <div className="rounded-xl bg-rose-50 p-3 text-center border border-rose-100">
            <p className="text-[8px] font-black text-rose-600">Quá hạn thu hồi</p>
            <p className="text-[14px] font-black text-rose-600">{formatVND(totalOverdue)}</p>
          </div>
        </div>

        {/* Danh sách */}
        {loading ? (
          <div className="mt-6 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#45B967] border-t-transparent" />
          </div>
        ) : refunds.length === 0 ? (
          <div className="mt-6 rounded-[22px] bg-white p-8 text-center shadow-[0_5px_20px_rgba(31,55,40,0.05)]">
            <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
            <p className="mt-3 text-sm font-medium text-[#7A897F]">Không có đơn cần hoàn trả</p>
          </div>
        ) : (
          <div className="mt-3.5 space-y-3">
            {refunds.map((item) => {
              const status = statusMap[item.status] || statusMap[3];
              const StatusIcon = status.icon;
              return (
                <div key={item.id} className="rounded-[18px] bg-white p-4 shadow-[0_5px_20px_rgba(31,55,40,0.05)]">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#18231D]">#{item.refund_id || item.id.slice(-9)}</span>
                        <span className="text-[9px] text-[#9CA3AF]">Thuộc đơn: #{item.order_id || ""}</span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-[#9CA3AF]">
                        {item.platform || "TikTok Shop"} | {item.transaction_time ? new Date(item.transaction_time).toLocaleString("vi-VN") : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-black text-orange-500">{formatVND(item.star_points_awarded || 0)}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${status.cls}`}>
                        <StatusIcon size={10} />
                        {status.label}
                      </span>
                    </div>
                  </div>
                  
                  {item.status === 3 && (
                    <div className="mt-2 rounded-lg bg-orange-50 p-2">
                      <p className="text-[8px] text-orange-600">
                        🔄 Truy thu được thực hiện tự động lúc 8h sáng và 8h tối, trong 7 ngày kể từ khi đơn bị từ chối.
                      </p>
                    </div>
                  )}
                  
                  {item.status === 3 && (
                    <button className="mt-2.5 w-full rounded-xl bg-orange-500 py-2 text-[10px] font-black text-white shadow-sm hover:bg-orange-600 transition-colors">
                      Nạp tiền
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
            }
