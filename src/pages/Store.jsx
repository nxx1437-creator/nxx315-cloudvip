const handleRedeem = async () => {
  // ... code kiểm tra hiện tại (giữ nguyên)

  setIsRedeeming(true);

  const { data: order, error } = await supabase.from("redemption_orders").insert({
    user_id: session.user.id,
    package_name: selectedPkg.name,
    coins_charged: selectedPkg.coin_cost,
    delivery_method: deliveryMethod,
    delivery_target: deliveryInfo.trim(),
    status: "pending",
    risk_score: risk?.score || 0,
  }).select().single();

  if (error) {
    setToast({ message: "Lỗi tạo đơn: " + error.message, type: "error" });
    setIsRedeeming(false);
    return;
  }

  // 👉 Gửi thông báo lên Telegram
  try {
    await supabase.functions.invoke("telegram-webhook", {
      body: {
        message: {
          text: ` Đơn hàng mới!\n📦 Gói: ${selectedPkg.name}\n👤 User: ${session.user.email}\n💰 Coin: ${selectedPkg.coin_cost}\n🆔 Mã đơn: ${order.id}`,
          chat: { id: ADMIN_CHAT_ID }
        }
      }
    });
  } catch (teleError) {
    console.error("Lỗi gửi Telegram:", teleError);
  }

  // ... code còn lại (giữ nguyên)
};
