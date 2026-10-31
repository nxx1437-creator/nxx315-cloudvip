import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Cloud,
  Clock,
  Cpu,
  HardDrive,
  Gamepad2,
  Globe,
  Layers,
  Mail,
  Smartphone,
  ShieldCheck,
  Zap,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Coins,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient.js";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import TermsCheckbox from "../components/TermsCheckbox.jsx";

// ---- Cấu hình dễ sửa ----
const EARN_PATH = "/tasks"; // trang kiếm xu, đổi nếu route khác
const VMOS_URL = "https://www.vmoscloud.com"; // nơi tải app / đăng ký VMOS
const REGION_LABEL = "Hồng Kông"; // đổi thành "Việt Nam" nếu đặt VMOS_COUNTRY_CODE=VN

const SPECS = [
  { icon: Cpu, label: "CPU", value: "8 nhân" },
  { icon: HardDrive, label: "RAM", value: "5.4GB" },
  { icon: Smartphone, label: "Hệ điều hành", value: "Android 13" },
  { icon: Globe, label: "Khu vực", value: REGION_LABEL },
];

const FEATURES = [
  { icon: Cloud, text: "Chạy 24/24, tắt app vẫn treo tiếp" },
  { icon: Layers, text: "Không tốn pin, không tốn data máy bạn" },
  { icon: Gamepad2, text: "Chạy được nhiều game Android" },
];

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const BUY_ERRORS = {
  NOT_AUTHENTICATED: "Bạn chưa đăng nhập.",
  INVALID_ACCOUNT: "Email tài khoản VMOS không hợp lệ.",
  PACKAGE_NOT_FOUND: "Gói này hiện không còn bán.",
  PACKAGE_UNAVAILABLE: "Gói này đang tạm hết hàng.",
  PROFILE_NOT_FOUND: "Không tìm thấy tài khoản của bạn.",
  ACCOUNT_BANNED: "Tài khoản của bạn đang bị khóa.",
  ACCOUNT_RESTRICTED: "Tài khoản bị hạn chế, vui lòng liên hệ admin.",
  ALREADY_HAVE_ACTIVE: "Bạn đang có một máy còn hạn hoặc đang được giao.",
  INSUFFICIENT_COINS: "Không đủ Coin để thuê máy.",
};

const fmt = (n) => new Intl.NumberFormat("vi-VN").format(Number(n || 0));

const hoursLabel = (h) =>
  Number(h) % 24 === 0 ? `${Number(h) / 24} ngày` : `${h} giờ`;

const fmtDate = (v) =>
  v
    ? new Date(v).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export default function CloudPhone() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState(0);
  const [pkgs, setPkgs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [account, setAccount] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

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
      setPkgs(list);
      setSelectedId((cur) => cur || list[0]?.id || null);
      setOrders(o.data || []);
    } catch (e) {
      console.error("Load cloud phone:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const active = orders.find(
    (o) =>
      o.status === "paid" ||
      o.status === "fulfilling" ||
      (o.status === "delivered" &&
        o.expires_at &&
        new Date(o.expires_at).getTime() > Date.now())
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

  return (
    <div className="min-h-screen bg-[#fef8f5] pb-40 text-slate-900">
      <TopHeader />

      <main className="mx-auto w-full max-w-4xl px-4 py-5 sm:py-6">
        <Hero onBack={() => navigate("/store")} />

        <div className="mt-5 space-y-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-sky-500" size={28} />
            </div>
          ) : active ? (
            <ActiveCard
              key={active.id}
              order={active}
              busy={busy}
              onRetry={handleRetry}
            />
          ) : (
            <BuyForm
              pkgs={pkgs}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              account={account}
              setAccount={setAccount}
              agreed={agreed}
              setAgreed={setAgreed}
              busy={busy}
              onBuy={handleBuy}
            />
          )}

          <BalanceBar coins={coins} onEarn={() => navigate(EARN_PATH)} />
          <OrderList orders={orders} />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
