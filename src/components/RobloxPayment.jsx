import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, XCircle } from "lucide-react";

import { supabase } from "../lib/supabaseClient.js";
import {
  CoinPayPanel,
  Panel,
  PillButton,
  SectionHeader,
} from "./pay/DimensionKit.jsx";

// Bước 3: Thanh toán (chỉ Coin)
export default function PaymentSection({ order, onBack, onPaid, onEarn }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoadingProfile(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("coins")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Load coins error:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  if (!order) {
    return (
      <Panel className="mx-auto max-w-2xl p-8 text-center shadow-sm">
        <XCircle className="mx-auto mb-3 text-red-500" size={40} />
        <h2 className="text-[20px] font-semibold tracking-[-0.035em] text-gray-900">
          Không tìm thấy đơn hàng
        </h2>
        <div className="mx-auto mt-5 max-w-[200px]">
          <PillButton onClick={onBack}>Quay lại</PillButton>
        </div>
      </Panel>
    );
  }

  const coinBalance = Number(profile?.coins || 0);
  const requiredCoins = Number(order.amount || 0);

  const handleCoinPayment = async () => {
    if (processing) return;
    if (!order?.id) return alert("Không tìm thấy đơn hàng.");
    if (order.status !== "pending")
      return alert("Đơn hàng này không còn ở trạng thái chờ thanh toán.");

    if (!requiredCoins || requiredCoins <= 0)
      return alert("Số Coin thanh toán không hợp lệ.");
    if (!profile) return alert("Không thể tải số dư Coin. Vui lòng thử lại.");

    if (coinBalance < requiredCoins) {
      return alert(
        `Không đủ Coin.\n\nCần: ${requiredCoins.toLocaleString(
          "vi-VN"
        )} Coin\nBạn có: ${coinBalance.toLocaleString("vi-VN")} Coin`
      );
    }

    setProcessing(true);
    try {
      const { data: paymentResult, error: paymentError } = await supabase.rpc(
        "pay_roblox_order_with_coins",
        { p_order_id: order.id }
      );

      if (paymentError) {
        const m = paymentError.message || "";
        if (m.includes("INSUFFICIENT_COINS"))
          throw new Error("Không đủ Coin để thanh toán.");
        if (m.includes("ORDER_NOT_FOUND"))
          throw new Error("Không tìm thấy đơn hàng.");
        if (m.includes("NOT_YOUR_ORDER"))
          throw new Error("Bạn không có quyền thanh toán đơn hàng này.");
        if (m.includes("ORDER_NOT_PENDING"))
          throw new Error("Đơn hàng này đã được thanh toán hoặc xử lý.");
        throw new Error("Thanh toán bằng Coin thất bại.\n\n" + m);
      }

      onPaid?.({ ...order, status: "paid", payment_method: "coin" });

      alert(
        `🎉 Thanh toán thành công!\n\n` +
          `Mã đơn: ${order.order_code}\n` +
          `Robux: ${Number(order.robux).toLocaleString("vi-VN")} RB\n` +
          `Đã trừ: ${requiredCoins.toLocaleString("vi-VN")} Coin\n` +
          `Coin còn lại: ${Number(
            paymentResult?.remaining_coins ?? coinBalance - requiredCoins
          ).toLocaleString("vi-VN")} Coin`
      );

      navigate(`/history/order/${order.id}`);
    } catch (error) {
      alert(error?.message || "Không thể thanh toán bằng Coin. Vui lòng thử lại.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <SectionHeader
        icon={Wallet}
        title="Thanh toán"
        sub="Thanh toán bằng Coin trong ví"
      />

      <CoinPayPanel
        amount={order.amount}
        orderCode={order.order_code}
        rows={[
          {
            label: "Gói",
            value: `${Number(order.robux || 0).toLocaleString("vi-VN")} Robux`,
          },
          { label: "Tài khoản Roblox", value: order.roblox_username },
        ]}
        balance={profile?.coins}
        loading={loadingProfile}
        paying={processing}
        onPay={handleCoinPayment}
        onBack={onBack}
        onEarn={onEarn}
      />
    </div>
  );
        }
