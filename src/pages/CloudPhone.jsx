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
function Hero({ onBack }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
      <div className="relative bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 px-5 pb-6 pt-14">
        <button
          onClick={onBack}
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/90 text-slate-700 shadow-md backdrop-blur-md transition hover:bg-white"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white shadow-lg backdrop-blur">
            <Smartphone size={30} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Zap size={12} className="fill-yellow-300 text-yellow-300" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-sky-100">
                Cloud Phone
              </span>
            </div>
            <h1 className="mt-0.5 text-xl font-black text-white sm:text-2xl">
              Điện thoại đám mây của riêng bạn
            </h1>
          </div>
        </div>
      </div>

      <div className="space-y-2 p-4">
        {FEATURES.map((f) => (
          <div
            key={f.text}
            className="flex items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-2.5"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-white">
              <f.icon size={15} />
            </div>
            <span className="text-sm font-semibold text-slate-700">{f.text}</span>
          </div>
        ))}
      </div>
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
    <div className="space-y-4">
      {/* Cấu hình máy */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-black text-slate-900">Cấu hình máy</p>
        <div className="grid grid-cols-2 gap-2">
          {SPECS.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5"
            >
              <s.icon size={16} className="shrink-0 text-sky-500" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase text-slate-400">
                  {s.label}
                </p>
                <p className="truncate text-sm font-bold text-slate-800">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Combo */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Clock size={16} className="text-sky-500" />
          <p className="text-sm font-black text-slate-900">Chọn thời hạn</p>
        </div>

        {soldOut ? (
          <p className="rounded-xl bg-slate-100 py-4 text-center text-sm font-bold text-slate-400">
            Đang chờ hàng về
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {pkgs.map((p) => {
              const on = p.id === selectedId;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`relative rounded-2xl border-2 p-3 text-center transition ${
                    on
                      ? "-translate-y-0.5 border-sky-500 bg-sky-50 shadow-lg shadow-sky-200/60"
                      : "border-slate-200 bg-white hover:border-sky-300"
                  }`}
                >
                  {on && (
                    <CheckCircle2
                      size={16}
                      className="absolute right-2 top-2 text-sky-500"
                    />
                  )}
                  <p className="text-lg font-black text-slate-900">
                    {hoursLabel(p.duration_hours)}
                  </p>
                  <p className="mt-1 flex items-center justify-center gap-1 text-sm font-bold text-amber-600">
                    <Coins size={13} />
                    {fmt(p.price_coins)}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Email VMOS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Mail size={16} className="text-sky-500" />
          <p className="text-sm font-black text-slate-900">Email tài khoản VMOS Cloud</p>
        </div>
        <input
          type="email"
          inputMode="email"
          autoCapitalize="none"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          placeholder="ten@gmail.com"
          className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
        />
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-xs leading-5 text-amber-800">
            Máy được chuyển thẳng vào tài khoản này. Nhập sai email sẽ không lấy lại
            được máy và không hoàn Coin. Chưa có tài khoản?{" "}
            <a
              href={VMOS_URL}
              target="_blank"
              rel="noreferrer"
              className="font-bold underline"
            >
              Tải app VMOS Cloud và đăng ký
            </a>
            .
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
      <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
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
        <div className="rounded-xl bg-white p-3 text-xs leading-5 text-slate-600">
          Mở app VMOS Cloud, đăng nhập bằng email trên rồi vào danh sách máy để
          dùng. Máy hết hạn sẽ tự dừng.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-sky-200 bg-white p-4 shadow-sm">
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
          className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-sky-400 focus:bg-white"
        />
      )}

      {!stuck && (
        <button
          onClick={() => onRetry(order, transferFail ? acc : undefined)}
          disabled={busy || order.status === "fulfilling"}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-500 text-sm font-bold text-white transition hover:bg-sky-600 disabled:opacity-40"
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
    <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white">
          <Coins size={17} />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-amber-700">Số dư Coin</p>
          <p className="text-lg font-black text-slate-900">{fmt(coins)}</p>
        </div>
      </div>
      <button
        onClick={onEarn}
        className="flex items-center gap-1 text-sm font-bold text-sky-600"
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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck size={16} className="text-sky-500" />
        <p className="text-sm font-black text-slate-900">Lịch sử thuê máy</p>
      </div>
      <div className="space-y-2">
        {orders.map((o) => {
          const st = STATUS_LABEL[o.status] || STATUS_LABEL.paid;
          return (
            <div
              key={o.id}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5"
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
