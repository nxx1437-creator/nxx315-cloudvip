import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { supabase } from "../lib/supabaseClient.js";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import useProfile from "../hooks/useProfile.js";
import PaymentSection from "../components/RobloxPayment.jsx";
import {
  Stepper,
  PackageStep,
  AccountStep,
} from "../components/RobloxSteps.jsx";
import { useI18n } from "../i18n/index.js";
import {
  PACKAGES,
  GAME_INFO,
  DRAFT_KEY,
  LAST_USERNAME_KEY,
} from "../lib/robloxData.js";

function loadDraft() {
  try {
    return JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "{}");
  } catch {
    return {};
  }
}

function lastUsername() {
  try {
    return localStorage.getItem(LAST_USERNAME_KEY) || "";
  } catch {
    return "";
  }
}

export default function Roblox() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { profile } = useProfile();

  // Khôi phục lựa chọn dở dang (khi tải lại trang) + nhớ username lần trước
  const [draft] = useState(loadDraft);

  const [step, setStep] = useState("package"); // package | account | payment
  const [selectedId, setSelectedId] = useState(draft.packageId || "");
  const [username, setUsername] = useState(draft.username || lastUsername());
  const [robloxUser, setRobloxUser] = useState(null);
  const [receiveMethod, setReceiveMethod] = useState(draft.receiveMethod || "");
  const [contactValue, setContactValue] = useState(draft.contactValue || "");
  const [agreed, setAgreed] = useState(false);

  const [order, setOrder] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const selectedPackage = PACKAGES.find((p) => p.id === selectedId) || null;
  const isCard = selectedPackage?.method === "Card Robux";
  const coins = Number(profile?.coins || 0);

  // Lưu nháp
  useEffect(() => {
    try {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          packageId: selectedId,
          username,
          receiveMethod,
          contactValue,
        })
      );
    } catch {}
  }, [selectedId, username, receiveMethod, contactValue]);

  // Đổi bước thì cuộn lên đầu
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const goStep = (next) => {
    setError("");
    setStep(next);
  };

  const createOrder = async () => {
    setError("");

    if (!selectedPackage) return setError(t("rb.err.needPkg"));
    if (!robloxUser) return setError(t("rb.err.needCheck"));

    if (isCard) {
      if (!receiveMethod) return setError(t("rb.err.needMethod"));
      const contact = contactValue.trim();
      if (!contact)
        return setError(
          receiveMethod === "zalo"
            ? t("rb.err.needContactZalo")
            : t("rb.err.needContactEmail")
        );
      if (
        receiveMethod === "zalo" &&
        !/^(0|\+84)[0-9]{9,10}$/.test(contact.replace(/\s/g, ""))
      )
        return setError(t("rb.err.badPhone"));
      if (receiveMethod === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact))
        return setError(t("rb.err.badEmail"));
    }

    // Quay lại từ bước thanh toán mà không đổi gì -> dùng lại đơn cũ, không tạo đơn trùng
    if (
      order &&
      order.status === "pending" &&
      order.package_id === selectedPackage.id &&
      Number(order.roblox_user_id) === Number(robloxUser.id) &&
      (order.contact_value || "") === (isCard ? contactValue.trim() : "")
    ) {
      goStep("payment");
      return;
    }

    setCreating(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error(t("rb.err.session"));

      const body = {
        roblox_user_id: robloxUser.id,
        roblox_username: robloxUser.username,
        roblox_display_name: robloxUser.displayName,
        package_id: selectedPackage.id,
      };
      if (isCard) {
        body.receive_method = receiveMethod;
        body.contact_value = contactValue.trim();
      }

      const response = await fetch(
        "https://rwglwovohbyqmbbzdvdj.supabase.co/functions/v1/create-roblox-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || t("rb.err.create"));

      setOrder(data.order);
      goStep("payment");
    } catch (e) {
      setError(e.message || t("rb.err.create"));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-['Be_Vietnam_Pro',sans-serif] text-slate-900">
      <TopHeader />

      <main className="mx-auto w-full max-w-3xl px-4 py-5">
        {/* Tiêu đề */}
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() =>
              step === "account"
                ? goStep("package")
                : step === "payment"
                ? goStep("account")
                : navigate("/store")
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <img
              src={GAME_INFO.icon}
              alt=""
              className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 object-cover"
            />
            <div className="min-w-0">
              <h1 className="truncate text-lg font-extrabold leading-tight">
                {t("rb.title")}
              </h1>
              <p className="text-xs text-slate-500">
                {GAME_INFO.name} · {GAME_INFO.server}
              </p>
            </div>
          </div>
        </div>

        {/* Các bước */}
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <Stepper step={step} onJump={goStep} />
        </div>

        {step === "package" && (
          <PackageStep
            selected={selectedPackage}
            onSelect={(pkg) => setSelectedId(pkg.id)}
            onNext={() => goStep("account")}
            coins={coins}
          />
        )}

        {step === "account" && (
          <AccountStep
            pkg={selectedPackage}
            username={username}
            setUsername={setUsername}
            robloxUser={robloxUser}
            setRobloxUser={setRobloxUser}
            receiveMethod={receiveMethod}
            setReceiveMethod={setReceiveMethod}
            contactValue={contactValue}
            setContactValue={setContactValue}
            agreed={agreed}
            setAgreed={setAgreed}
            onBack={() => goStep("package")}
            onCreate={createOrder}
            creating={creating}
            error={error}
            setError={setError}
          />
        )}

        {step === "payment" && (
          <PaymentSection
            order={order}
            onBack={() => goStep("account")}
            onPaid={(updated) => setOrder(updated)}
          />
        )}
      </main>

      <BottomNav />
    </div>
  );
                                           }
    
  
