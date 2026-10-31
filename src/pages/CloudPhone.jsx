import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Cloud,
  Clock,
  Cpu,
  HardDrive,
  Gamepad2,
  Globe,
  Mail,
  Smartphone,
  Server,
  Zap,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Coins,
  Plus,
  Check,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient.js";

// ---- Cấu hình dễ sửa ----
const EARN_PATH = "/tasks";
const VMOS_URL = "https://www.vmoscloud.com";
const REGION_LABEL = "Hồng Kông"; // đổi thành "Việt Nam" nếu đặt VMOS_COUNTRY_CODE=VN

const TEAL = "from-[#19e6c1] to-[#2bf0ff]";

const FEATURES = [
  { icon: Cloud, text: "Online 24/24, tắt app vẫn treo tiếp" },
  { icon: Smartphone, text: "Không tốn pin, không tốn data máy bạn" },
  { icon: Gamepad2, text: "Chạy được nhiều game Android" },
];

const SPEC_ROWS = [
  { icon: Cpu, label: "CORE", value: "8 nhân" },
  { icon: HardDrive, label: "RAM", value: "5.4GB" },
  { icon: Smartphone, label: "ANDROID", value: "13" },
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

const remainText = (ms) => {
  if (ms <= 0) return "Đã hết hạn";
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h} tiếng ${m % 60} phút` : `${m} phút`;
};

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
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="mx-auto w-full max-w-md px-4 pb-48 pt-4">
        {loading || !view ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-[#19e6c1]" size={30} />
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
function RoundBtn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2a2a2c] text-white transition active:scale-95"
    >
      {children}
    </button>
  );
}

function IntroView({ onBack, onStart }) {
  return (
    <div className="relative">
      <div className="absolute left-0 top-0 z-10">
        <RoundBtn onClick={onBack}>
          <ArrowLeft size={20} />
        </RoundBtn>
      </div>

      <div className="relative mx-auto mt-8 flex h-52 w-52 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#19e6c1]/30 to-indigo-500/20 blur-3xl" />
        <Cloud
          size={200}
          strokeWidth={0}
          fill="currentColor"
          className="absolute text-[#2a2f4a]"
        />
        <div className="relative flex h-28 w-20 items-center justify-center rounded-2xl border-4 border-white/90 bg-gradient-to-b from-indigo-400 to-indigo-600 shadow-2xl">
          <Zap size={36} className="fill-white text-white" />
        </div>
      </div>

      <h1 className="mt-6 text-center text-3xl font-black leading-tight">
        Cloud phone mới
        <br />
        của riêng bạn
      </h1>

      <div className="mt-8 space-y-4 rounded-3xl bg-[#1c1c1e] p-4 ring-1 ring-white/5">
        {FEATURES.map((f) => (
          <div key={f.text} className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#2c303c] text-white">
              <f.icon size={20} />
            </div>
            <p className="text-base font-semibold text-white/90">{f.text}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white text-base font-black text-black transition active:scale-[0.98]"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-black text-white">
          <Plus size={16} />
        </span>
        Nhận thiết bị mới
      </button>
    </div>
  );
}

function TopBar({ view, setView, onBack }) {
  const tabs = [
    { k: "buy", t: "Thuê máy" },
    { k: "mine", t: "Máy của tôi" },
  ];
  return (
    <div className="mb-5 flex items-center justify-between">
      <RoundBtn onClick={onBack}>
        <ArrowLeft size={20} />
      </RoundBtn>
      <div className="flex rounded-full bg-[#2a2a2c] p-1">
        {tabs.map((x) => (
          <button
            key={x.k}
            onClick={() => setView(x.k)}
            className={`rounded-full px-4 py-2 text-sm font-black transition ${
              view === x.k ? "bg-white text-black" : "text-white/60"
            }`}
          >
            {x.t}
          </button>
        ))}
      </div>
      <div className="w-11" />
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-white/80">
        <Icon size={18} />
        <p className="text-base font-bold">{title}</p>
      </div>
      {children}
    </div>
  );
}

function Chip({ text }) {
  return (
    <div className="relative flex h-14 items-center justify-center rounded-2xl border-2 border-white/90 bg-[#1c1c1e] px-3 text-base font-bold">
      {text}
      <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-tl-lg rounded-br-xl bg-white text-black">
        <Check size={13} strokeWidth={3} />
      </span>
    </div>
  );
}

function ComboCard({ p, on, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`overflow-hidden rounded-2xl text-center transition active:scale-[0.98] ${
        on ? "ring-2 ring-[#2bf0ff]" : "ring-1 ring-white/10"
      }`}
    >
      <div
        className={`flex h-24 items-center justify-center text-2xl font-black ${
          on
            ? "bg-gradient-to-b from-[#0f2a26] to-[#0c1d1b] text-[#2de8c8]"
            : "bg-[#1c1c1e] text-white"
        }`}
      >
        {hoursLabel(p.duration_hours)}
      </div>
      <div
        className={`flex h-12 items-center justify-center gap-1.5 text-lg font-black ${
          on
            ? `bg-gradient-to-r ${TEAL} text-black`
            : "bg-[#2b2b2d] text-yellow-400"
        }`}
      >
        <Coins size={18} />
        {fmt(p.price_coins)}
      </div>
    </button>
  );
}

function BuyView({
  pkgs,
  selectedId,
  setSelectedId,
  account,
  setAccount,
  agreed,
  setAgreed,
  hasActive,
}) {
  return (
    <div className="space-y-6">
      {hasActive && (
        <div className="rounded-2xl bg-amber-400/10 p-3 text-xs leading-5 text-amber-300 ring-1 ring-amber-400/30">
          Bạn đang có một máy còn hạn hoặc đang được giao. Xem ở tab "Máy của
          tôi".
        </div>
      )}

      {/* Cấu hình */}
      <div className="rounded-3xl bg-[#1c1c1e] p-4 ring-1 ring-white/5">
        <p className="mb-3 text-lg font-black">Cấu hình máy</p>
        <div className="grid grid-cols-[92px_1fr] gap-3">
          <div className="pt-[54px]">
            {SPEC_ROWS.map((s) => (
              <div
                key={s.label}
                className="flex h-14 items-center gap-1.5 text-xs font-bold text-white/60"
              >
                <s.icon size={14} />
                {s.label}
              </div>
            ))}
          </div>
          <div>
            <div className="mb-2 flex h-10 items-center justify-center gap-1.5 rounded-xl border-2 border-white/90 text-sm font-black">
              <Smartphone size={15} />
              Tiêu chuẩn
            </div>
            <div className="rounded-2xl border-2 border-white/90 bg-[#232326]">
              {SPEC_ROWS.map((s) => (
                <div
                  key={s.label}
                  className="flex h-14 items-center justify-center text-xl font-black"
                >
                  {s.value}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Section icon={Server} title="Máy chủ">
        <div className="grid grid-cols-2 gap-3">
          <Chip text={REGION_LABEL} />
        </div>
      </Section>

      <Section icon={Globe} title="Hệ thống">
        <div className="grid grid-cols-2 gap-3">
          <Chip text="Android 13" />
        </div>
      </Section>

      <Section icon={Clock} title="Combo">
        {pkgs.length === 0 ? (
          <p className="rounded-2xl bg-[#1c1c1e] py-6 text-center text-sm font-bold text-white/40">
            Đang chờ hàng về
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {pkgs.map((p) => (
              <ComboCard
                key={p.id}
                p={p}
                on={p.id === selectedId}
                onSelect={() => setSelectedId(p.id)}
              />
            ))}
          </div>
        )}
      </Section>

      <Section icon={Mail} title="Tài khoản VMOS Cloud nhận máy">
        <input
          type="email"
          inputMode="email"
          autoCapitalize="none"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          placeholder="ten@gmail.com"
          className="h-14 w-full rounded-2xl border border-white/10 bg-[#1c1c1e] px-4 text-base text-white outline-none transition placeholder:text-white/30 focus:border-[#19e6c1]"
        />
        <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-amber-300/90">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
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
      </Section>

      <label className="flex items-start gap-3 rounded-2xl bg-[#1c1c1e] p-3.5 ring-1 ring-white/5">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[#19e6c1]"
        />
        <span className="text-xs leading-5 text-white/60">
          Tôi đã đọc và đồng ý với{" "}
          <Link to="/redemption-policy" className="font-bold text-[#19e6c1]">
            Quy định đổi thưởng
          </Link>{" "}
          và{" "}
          <Link to="/privacy" className="font-bold text-[#19e6c1]">
            Chính sách quyền riêng tư
          </Link>
          .
        </span>
      </label>
    </div>
  );
}

function BuyBar({ coins, pkg, soldOut, hasActive, canBuy, busy, onBuy, onEarn }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-[#121212] via-[#121212] to-transparent px-4 pb-5 pt-8">
      <div className="mx-auto max-w-md">
        <button
          onClick={onBuy}
          disabled={!canBuy}
          className={`flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-black transition active:scale-[0.98] ${
            canBuy
              ? `bg-gradient-to-r ${TEAL} text-black shadow-lg shadow-[#19e6c1]/20`
              : "bg-[#3a3a3c] text-white/40"
          }`}
        >
          {busy ? (
            <Loader2 size={20} className="animate-spin" />
          ) : soldOut ? (
            "Đang chờ hàng về"
          ) : hasActive ? (
            "Bạn đang có máy"
          ) : (
            `Thuê máy${pkg ? ` · ${fmt(pkg.price_coins)} Coin` : ""}`
          )}
        </button>

        <div className="mt-3 flex items-center justify-between px-1">
          <div>
            <p className="text-sm font-semibold text-white/80">
              Số dư Coin: {fmt(coins)}
            </p>
            <p className="text-xs text-white/40">
              Coin nhận được từ nhiệm vụ miễn phí.
            </p>
          </div>
          <button
            onClick={onEarn}
            className="flex items-center text-sm font-bold text-[#19e6c1]"
          >
            Kiếm Coin
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
      }
function orderState(o, now) {
  if (o.status === "delivered") {
    const left = new Date(o.expires_at).getTime() - now;
    if (left > 0)
      return {
        main: remainText(left),
        pill: left < 3600000 ? "Sắp hết hạn" : "Đang chạy",
        mainCls: "text-[#19e6c1]",
        pillCls:
          left < 3600000 ? "bg-amber-400 text-black" : "bg-white text-black",
      };
    return {
      main: "Đã hết hạn",
      pill: "Hết hạn",
      mainCls: "text-white/40",
      pillCls: "bg-white/10 text-white/50",
    };
  }
  if (o.status === "failed")
    return {
      main: "Đã hoàn Coin",
      pill: "Hoàn Coin",
      mainCls: "text-rose-400",
      pillCls: "bg-rose-400/15 text-rose-300",
    };
  return {
    main: "Đang giao",
    pill: "Chờ máy",
    mainCls: "text-amber-300",
    pillCls: "bg-amber-400/15 text-amber-300",
  };
}

function PhoneCard({ o, now }) {
  const st = orderState(o, now);
  return (
    <div>
      <div className="flex h-44 flex-col items-center justify-center rounded-2xl bg-[#1c1c1e] p-3 text-center ring-1 ring-white/5">
        <Smartphone size={30} className="text-white/70" />
        <p className={`mt-3 text-base font-black ${st.mainCls}`}>{st.main}</p>
        <span
          className={`mt-3 rounded-full px-4 py-2 text-xs font-black ${st.pillCls}`}
        >
          {st.pill}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${TEAL} text-black`}
        >
          <Cloud size={14} />
        </span>
        <span className="text-sm font-bold">#{o.id}</span>
      </div>
    </div>
  );
}

function MineView({ orders, active, now, busy, onRetry, onNew }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {orders.map((o) => (
          <PhoneCard key={o.id} o={o} now={now} />
        ))}
        <div>
          <button
            onClick={onNew}
            className="flex h-44 w-full items-center justify-center rounded-2xl bg-[#1c1c1e] ring-1 ring-white/5 transition active:scale-[0.98]"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">
              <Plus size={28} strokeWidth={3} />
            </span>
          </button>
        </div>
      </div>

      {active && (
        <ActiveCard
          key={active.id + active.status}
          order={active}
          busy={busy}
          onRetry={onRetry}
        />
      )}
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
      <div className="space-y-3 rounded-3xl bg-[#0f2a26] p-4 ring-1 ring-[#19e6c1]/30">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={20} className="text-[#19e6c1]" />
          <p className="text-base font-black text-[#2de8c8]">Máy đã được giao</p>
        </div>
        <p className="text-sm text-white/80">
          Đã chuyển vào tài khoản VMOS{" "}
          <span className="font-bold text-white">{order.vmos_account}</span>
        </p>
        <p className="text-sm text-white/80">
          Hết hạn:{" "}
          <span className="font-bold text-white">{fmtDate(order.expires_at)}</span>
        </p>
        <div className="rounded-2xl bg-black/30 p-3 text-xs leading-5 text-white/60">
          Mở app VMOS Cloud, đăng nhập bằng email trên rồi vào danh sách máy để
          dùng. Máy hết hạn sẽ tự dừng.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-3xl bg-[#1c1c1e] p-4 ring-1 ring-white/10">
      <div className="flex items-center gap-2">
        {stuck || transferFail ? (
          <AlertTriangle size={20} className="text-amber-400" />
        ) : (
          <Loader2 size={20} className="animate-spin text-[#19e6c1]" />
        )}
        <p className="text-base font-black">
          {stuck
            ? "Đơn đang được admin kiểm tra"
            : transferFail
            ? "Chưa chuyển được máy"
            : "Đang chuẩn bị máy cho bạn"}
        </p>
      </div>

      <p className="text-xs leading-5 text-white/50">
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
          className="h-12 w-full rounded-2xl border border-white/10 bg-[#121212] px-4 text-sm text-white outline-none focus:border-[#19e6c1]"
        />
      )}

      {!stuck && (
        <button
          onClick={() => onRetry(order, transferFail ? acc : undefined)}
          disabled={busy || order.status === "fulfilling"}
          className={`flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r ${TEAL} text-sm font-black text-black transition active:scale-[0.98] disabled:opacity-40`}
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
