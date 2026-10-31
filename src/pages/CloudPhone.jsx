import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { supabase } from "../lib/supabaseClient.js";
import IntroView from "../components/cloudphone/IntroView.jsx";
import TopBar from "../components/cloudphone/TopBar.jsx";
import BuyView from "../components/cloudphone/BuyView.jsx";
import BuyBar from "../components/cloudphone/BuyBar.jsx";
import MineView from "../components/cloudphone/MineView.jsx";
import {
  EARN_PATH,
  EMAIL_RE,
  BUY_ERRORS,
  fmt,
  hoursLabel,
} from "../components/cloudphone/cpUtils.js";

export default function CloudPhone() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(null); // intro | buy | mine
  const [coins, setCoins] = useState(0);
  const [pkgs, setPkgs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [account, setAccount] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());
  const busyRef = useRef(false);
  const initRef = useRef(false);

  const load = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const [p, k, o] = await Promise.all([
        supabase.from("profiles").select("coins").eq("id", user.id).single(),
        supabase.from("cloudphone_packages").select("*").order("sort_order"),
        supabase
          .from("cloudphone_orders")
          .select("*")
          .eq("user_id", user.id)
          .order("id", { ascending: false })
          .limit(5),
      ]);

      setCoins(Number(p.data?.coins || 0));
      const list = k.data || [];
      const myOrders = o.data || [];
      setPkgs(list);
      setSelectedId((cur) => cur || list[0]?.id || null);
      setOrders(myOrders);

      if (!initRef.current) {
        initRef.current = true;
        setView(myOrders.length ? "mine" : "intro");
      }
    } catch (e) {
      console.error("Load cloud phone:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const active = orders.find(
    (o) =>
      o.status === "paid" ||
      o.status === "fulfilling" ||
      (o.status === "delivered" &&
        o.expires_at &&
        new Date(o.expires_at).getTime() > now)
  );

  // Đơn đang giao: tự làm mới để thấy kết quả khi cron xử lý xong
  useEffect(() => {
    if (!active || active.status === "delivered") return;
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [active?.id, active?.status]);

  const callFulfill = async (orderId, newAccount) => {
    const body = { order_id: orderId };
    if (newAccount) body.vmos_account = newAccount.trim();
    const { data, error } = await supabase.functions.invoke(
      "fulfill-cloudphone-order",
      { body }
    );
    if (error) throw new Error(error.message || "Không thể giao máy.");
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const handleBuy = async () => {
    if (busyRef.current) return;
    const pkg = pkgs.find((p) => p.id === selectedId);
    const acc = account.trim().toLowerCase();

    if (!pkg) return alert("Vui lòng chọn gói thuê.");
    if (!EMAIL_RE.test(acc))
      return alert("Vui lòng nhập đúng email tài khoản VMOS Cloud của bạn.");
    if (coins < pkg.price_coins)
      return alert(
        `Không đủ Coin.\n\nCần: ${fmt(pkg.price_coins)} Coin\nBạn có: ${fmt(coins)} Coin`
      );

    const ok = window.confirm(
      `Máy sẽ được chuyển vào tài khoản VMOS:\n${acc}\n\n` +
        `Sai email sẽ không lấy lại được máy.\n` +
        `Xác nhận thuê ${hoursLabel(pkg.duration_hours)} với ${fmt(pkg.price_coins)} Coin?`
    );
    if (!ok) return;

    busyRef.current = true;
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("buy_cloudphone_with_coins", {
        p_package_id: pkg.id,
        p_vmos_account: acc,
      });
      if (error) throw new Error(error.message);
      if (!data?.success)
        throw new Error(
          BUY_ERRORS[data?.error] || "Thuê máy thất bại: " + (data?.error || "")
        );

      setCoins(Number(data.remaining_coins));
      setView("mine");
      try {
        await callFulfill(data.order_id);
      } catch (e) {
        alert(e.message);
      }
    } catch (e) {
      alert(e?.message || "Không thể thuê máy.");
    } finally {
      busyRef.current = false;
      setBusy(false);
      await load();
    }
  };

  const handleRetry = async (order, newAccount) => {
    if (busyRef.current) return;
    if (newAccount && !EMAIL_RE.test(newAccount.trim()))
      return alert("Email tài khoản VMOS không hợp lệ.");
    busyRef.current = true;
    setBusy(true);
    try {
      await callFulfill(order.id, newAccount);
    } catch (e) {
      alert(e.message);
    } finally {
      busyRef.current = false;
      setBusy(false);
      await load();
    }
  };

  const pkg = pkgs.find((p) => p.id === selectedId);
  const soldOut = pkgs.length === 0;
  const canBuy = !soldOut && !!pkg && agreed && !!account.trim() && !busy && !active;

  return (
    <div className="relative min-h-screen bg-[#eefaf7] font-['Be_Vietnam_Pro',sans-serif] text-slate-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{
          background:
            "linear-gradient(180deg,#d6f0e9 0,#e6f6f2 55%,#eefaf7 100%)",
        }}
      />
      <div className="relative mx-auto w-full max-w-md px-4 pb-48 pt-4">
        {loading || !view ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-emerald-600" size={30} />
          </div>
        ) : view === "intro" ? (
          <IntroView
            onBack={() => navigate("/store")}
            onStart={() => setView("buy")}
          />
        ) : (
          <>
            <TopBar
              view={view}
              setView={setView}
              onBack={() => navigate("/store")}
            />
            {view === "buy" ? (
              <BuyView
                pkgs={pkgs}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                account={account}
                setAccount={setAccount}
                agreed={agreed}
                setAgreed={setAgreed}
                hasActive={!!active}
              />
            ) : (
              <MineView
                orders={orders}
                active={active}
                now={now}
                busy={busy}
                onRetry={handleRetry}
                onNew={() => setView("buy")}
              />
            )}
          </>
        )}
      </div>

      {view === "buy" && !loading && (
        <BuyBar
          coins={coins}
          pkg={pkg}
          soldOut={soldOut}
          hasActive={!!active}
          canBuy={canBuy}
          busy={busy}
          onBuy={handleBuy}
          onEarn={() => navigate(EARN_PATH)}
        />
      )}
    </div>
  );
}
