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
  const CHIPS = [
  { icon: Cloud, text: "Treo 24/24" },
  { icon: Layers, text: "Không tốn pin, data" },
  { icon: Gamepad2, text: "Nhiều game Android" },
];

const SPEC_ROW = [
  { icon: Cpu, label: "CPU", value: "8 nhân" },
  { icon: HardDrive, label: "RAM", value: "5.4GB" },
  { icon: Smartphone, label: "Android", value: "13" },
  { icon: Globe, label: "Khu vực", value: REGION_LABEL },
];

function Hero({ onBack }) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 p-4 text-white shadow-lg shadow-sky-500/20">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur transition hover:bg-white/30"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <Zap size={11} className="fill-yellow-300 text-yellow-300" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-sky-100">
              Cloud Phone
            </span>
          </div>
          <h1 className="text-lg font-black leading-tight">
            Điện thoại đám mây của bạn
          </h1>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
          <Smartphone size={24} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {CHIPS.map((c) => (
          <span
            key={c.text}
            className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold backdrop-blur"
          >
            <c.icon size={12} />
            {c.text}
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, text }) {
  return (
    <div className="mb-2.5 flex items-center gap-2">
      <Icon size={16} className="text-sky-500" />
      <p className="text-sm font-black text-slate-900">{text}</p>
    </div>
  );
}

function BuyForm({
  pkgs,
  selectedId,
  setSelectedId,
  account,
  setAccount,
  agreed,
  setAgreed,
  busy,
  onBuy,
}) {
  const soldOut = pkgs.length === 0;
  const pkg = pkgs.find((p) => p.id === selectedId);
  const canBuy = !soldOut && !!pkg && agreed && account.trim() && !busy;

  return (
    <div className="space-y-3">
      <div className="space-y-5 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        {/* Cấu hình */}
        <div className="grid grid-cols-4 gap-2">
          {SPEC_ROW.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center rounded-2xl bg-sky-50/70 px-1 py-2.5 text-center"
            >
              <s.icon size={16} className="text-sky-500" />
              <p className="mt-1 text-[13px] font-black leading-tight text-slate-800">
                {s.value}
              </p>
              <p className="text-[10px] font-semibold text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Thời hạn */}
        <div>
          <SectionTitle icon={Clock} text="Chọn thời hạn" />
          {soldOut ? (
            <p className="rounded-2xl bg-slate-100 py-4 text-center text-sm font-bold text-slate-400">
              Đang chờ hàng về
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {pkgs.map((p) => {
                const on = p.id === selectedId;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={`relative rounded-2xl p-3.5 text-left transition ${
                      on
                        ? "bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30"
                        : "bg-slate-50 text-slate-800 ring-1 ring-slate-200 hover:ring-sky-300"
                    }`}
                  >
                    {on && (
                      <CheckCircle2
                        size={16}
                        className="absolute right-2.5 top-2.5 text-white"
                      />
                    )}
                    <p className="text-xl font-black leading-none">
                      {hoursLabel(p.duration_hours)}
                    </p>
                    <p
                      className={`mt-2 flex items-center gap-1 text-sm font-bold ${
                        on ? "text-yellow-200" : "text-amber-600"
                      }`}
                    >
                      <Coins size={14} />
                      {fmt(p.price_coins)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Email VMOS */}
        <div>
          <SectionTitle icon={Mail} text="Email tài khoản VMOS Cloud" />
          <input
            type="email"
            inputMode="email"
            autoCapitalize="none"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder="ten@gmail.com"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
          />
          <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-4 text-amber-700">
            <AlertTriangle size={13} className="mt-0.5 shrink-0" />
            <span>
              Máy chuyển thẳng vào tài khoản này, nhập sai sẽ không lấy lại được.{" "}
              <a
                href={VMOS_URL}
                target="_blank"
                rel="noreferrer"
                className="font-bold underline"
              >
                Chưa có tài khoản?
              </a>
            </span>
          </p>
        </div>
      </div>

      <TermsCheckbox checked={agreed} onChange={setAgreed} accentColor="orange" />

      <button
        onClick={onBuy}
        disabled={!canBuy}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? (
          <Loader2 size={18} className="animate-spin" />
        ) : soldOut ? (
          "Đang chờ hàng về"
        ) : (
          <>
            Thuê máy{pkg ? ` · ${fmt(pkg.price_coins)} Coin` : ""}
            <ChevronRight size={18} />
          </>
        )}
      </button>
    </div>
  );
}

function ActiveCard({ order, busy, onRetry }) {
  const [acc, setAcc] = useState(order.vmos_account || "");
  const delivered = order.status === "delivered";
  const err = String(order.error || "");
  const transferFail = err.startsWith("transfer_");
  const stuck = Number(order.attempts) >= 99;

  if (delivered) {
    return (
      <div className="space-y-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={20} className="text-emerald-600" />
          <p className="text-base font-black text-emerald-900">Máy đã được giao</p>
        </div>
        <p className="text-sm text-emerald-900">
          Đã chuyển vào tài khoản VMOS{" "}
          <span className="font-bold">{order.vmos_account}</span>
        </p>
        <p className="text-sm text-emerald-900">
          Hết hạn: <span className="font-bold">{fmtDate(order.expires_at)}</span>
        </p>
        <div className="rounded-2xl bg-white p-3 text-xs leading-5 text-slate-600">
          Mở app VMOS Cloud, đăng nhập bằng email trên rồi vào danh sách máy để
          dùng. Máy hết hạn sẽ tự dừng.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-3xl border border-sky-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        {stuck || transferFail ? (
          <AlertTriangle size={20} className="text-amber-500" />
        ) : (
          <Loader2 size={20} className="animate-spin text-sky-500" />
        )}
        <p className="text-base font-black text-slate-900">
          {stuck
            ? "Đơn đang được admin kiểm tra"
            : transferFail
            ? "Chưa chuyển được máy"
            : "Đang chuẩn bị máy cho bạn"}
        </p>
      </div>

      <p className="text-xs leading-5 text-slate-500">
        {stuck
          ? `Mã đơn #${order.id}. Nếu quá 30 phút chưa có máy, hãy liên hệ admin kèm mã đơn này.`
          : transferFail
          ? "Kiểm tra lại email tài khoản VMOS Cloud, sửa nếu sai rồi bấm Thử lại."
          : "Thường mất 1–2 phút. Trang sẽ tự cập nhật, bạn không cần tải lại."}
      </p>

      {transferFail && !stuck && (
        <input
          type="email"
          inputMode="email"
          autoCapitalize="none"
          value={acc}
          onChange={(e) => setAcc(e.target.value)}
          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-sky-400 focus:bg-white"
        />
      )}

      {!stuck && (
        <button
          onClick={() => onRetry(order, transferFail ? acc : undefined)}
          disabled={busy || order.status === "fulfilling"}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 text-sm font-bold text-white transition hover:bg-sky-600 disabled:opacity-40"
        >
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <RefreshCw size={16} />
          )}
          Thử lại
        </button>
      )}
    </div>
  );
}

function BalanceBar({ coins, onEarn }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-amber-100">
      <div className="flex items-center gap-2">
        <Coins size={18} className="text-amber-500" />
        <span className="text-sm text-slate-500">Số dư</span>
        <span className="text-base font-black text-slate-900">{fmt(coins)}</span>
      </div>
      <button
        onClick={onEarn}
        className="flex items-center gap-0.5 text-sm font-bold text-sky-600"
      >
        Kiếm thêm Coin
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

const STATUS_LABEL = {
  paid: { text: "Đang giao", cls: "bg-sky-50 text-sky-600" },
  fulfilling: { text: "Đang giao", cls: "bg-sky-50 text-sky-600" },
  delivered: { text: "Đã giao", cls: "bg-emerald-50 text-emerald-600" },
  failed: { text: "Đã hoàn Coin", cls: "bg-rose-50 text-rose-600" },
};

function OrderList({ orders }) {
  if (!orders.length) return null;
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <SectionTitle icon={ShieldCheck} text="Lịch sử thuê máy" />
      <div className="space-y-2">
        {orders.map((o) => {
          const st = STATUS_LABEL[o.status] || STATUS_LABEL.paid;
          return (
            <div
              key={o.id}
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800">
                  Cloud Phone · {fmt(o.amount)} Coin
                </p>
                <p className="text-[11px] text-slate-400">
                  #{o.id} · {fmtDate(o.created_at)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${st.cls}`}
              >
                {st.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
              }
