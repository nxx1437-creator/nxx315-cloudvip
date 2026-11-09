import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabaseClient.js";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { PageShell } from "../components/pay/DimensionKit.jsx";
import {
  FreeFireHero,
  PackageStep,
  PaymentStep,
} from "../components/freefire/FreeFireSteps.jsx";
import UidStep from "../components/freefire/FreeFireUid.jsx";

export default function FreeFire() {
  const navigate = useNavigate();

  const [step, setStep] = useState("package");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [uid, setUid] = useState("");

  const [order, setOrder] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [paying, setPaying] = useState(false);
  const payingRef = useRef(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  // Đổi bước thì cuộn lên đầu
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

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

  const continueToPayment = async () => {
    if (!selectedPackage) {
      alert("Vui lòng chọn gói Kim Cương.");
      return;
    }
    if (!uid.trim()) {
      alert("Vui lòng nhập UID Free Fire.");
      return;
    }

    setCreatingOrder(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        alert("Bạn chưa đăng nhập.");
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "create-freefire-order",
        {
          body: {
            uid: uid.trim(),
            package_id: selectedPackage.id,
            payment_method: "coin",
          },
        }
      );

      if (error) {
        let errorMessage = "Không thể tạo đơn hàng.";

        try {
          if (error.context && typeof error.context.json === "function") {
            const errorBody = await error.context.json();
            if (errorBody?.error) {
              errorMessage = errorBody.error;
            }
          } else if (error.message && !error.message.includes("non-2xx")) {
            errorMessage = error.message;
          }
        } catch (parseErr) {
          console.warn("Cannot parse error body:", parseErr);
        }

        throw new Error(errorMessage);
      }
      if (!data?.order) throw new Error("Không nhận được đơn hàng.");

      setOrder(data.order);
      setStep("payment");
    } catch (error) {
      console.error("Create Free Fire order:", error);
      alert(error?.message || "Không thể tạo đơn. Hãy thử lại sau.");
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleCoinPayment = async () => {
    if (payingRef.current) return;
    if (!order?.id) return alert("Không tìm thấy đơn hàng.");
    if (order.status !== "pending")
      return alert("Đơn hàng này không còn ở trạng thái chờ thanh toán.");

    const requiredCoins = Number(order.amount || 0);
    const coinBalance = Number(profile?.coins || 0);

    if (coinBalance < requiredCoins) {
      return alert(
        `Không đủ Coin.\n\nCần: ${requiredCoins.toLocaleString(
          "vi-VN"
        )} Coin\nBạn có: ${coinBalance.toLocaleString("vi-VN")} Coin`
      );
    }

    payingRef.current = true;
    setPaying(true);

    try {
      const { data: paymentResult, error: paymentError } = await supabase.rpc(
        "pay_freefire_order_with_coins",
        { p_order_id: order.id }
      );

      if (paymentError) throw new Error(paymentError.message);

      if (!paymentResult?.success) {
        const err = paymentResult?.error || "";
        if (err === "INSUFFICIENT_COINS")
          throw new Error("Không đủ Coin để thanh toán.");
        if (err === "ORDER_NOT_FOUND")
          throw new Error("Không tìm thấy đơn hàng.");
        if (err === "NOT_YOUR_ORDER")
          throw new Error("Bạn không có quyền thanh toán đơn này.");
        if (err === "ORDER_NOT_PENDING")
          throw new Error("Đơn hàng đã được thanh toán.");
        throw new Error("Thanh toán thất bại: " + err);
      }

      
      navigate(`/thanh-toan-thanh-cong/${order.id}`, {
  replace: true,
  state: {
    game: "Free Fire",
    logo: FREEFIRE_LOGO,
    packageLabel: `${Number(
      selectedPackage?.diamond ?? order.ff_diamond ?? 0
    ).toLocaleString("vi-VN")} Kim Cương`,
    accountLabel: "UID Free Fire",
    accountValue: order.ff_uid || uid,
    amount: requiredCoins,
    orderCode: order.order_code,
    remainingCoins: paymentResult.remaining_coins,
    paidAt: new Date().toISOString(),
  },
});
  return (
    // Thêm bg-gray-50 để cả trang có nền xám nhạt (giúp các thẻ trắng nổi bật)
    <div className="min-h-screen bg-white">
      <PageShell>
        <TopHeader />

        <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:py-6">
          <FreeFireHero onBack={() => navigate("/store")} />

          <div className="mt-5" />

          {step === "package" && (
            <PackageStep
              selectedPackage={selectedPackage}
              setSelectedPackage={setSelectedPackage}
              onContinue={() => setStep("uid")}
              agreedTerms={agreedTerms}
              setAgreedTerms={setAgreedTerms}
            />
          )}

          {step === "uid" && (
            <UidStep
              uid={uid}
              setUid={setUid}
              selectedPackage={selectedPackage}
              creatingOrder={creatingOrder}
              onBack={() => setStep("package")}
              onContinue={continueToPayment}
            />
          )}

          {step === "payment" && (
            <PaymentStep
              selectedPackage={selectedPackage}
              uid={uid}
              order={order}
              profile={profile}
              loadingProfile={loadingProfile}
              paying={paying}
              onBack={() => setStep("uid")}
              onCoinPayment={handleCoinPayment}
              onEarn={() => navigate("/tasks")}
            />
          )}
        </main>

        <BottomNav />
      </PageShell>
    </div>
  );
        }
