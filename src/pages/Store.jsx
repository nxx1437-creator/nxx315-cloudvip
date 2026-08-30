import React, { useEffect, useMemo, useState } from "react";
import {
  Coins, Gift, Loader2, CheckCircle2, XCircle,
  Gamepad2, Swords, Clock, ArrowLeft, ShoppingBag,
  ChevronRight, AlertCircle
} from "lucide-react";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

const ADMIN_CHAT_ID = 8637128924;

export default function Store() {
  const { session } = useSession();
  const { profile, setProfile } = useProfile();

  const [packages, setPackages] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState("home");
  const [category, setCategory] = useState("robux");
  const [version, setVersion] = useState("vng");

  const [selected, setSelected] = useState(null);
  const [delivery, setDelivery] = useState("");
  const [target, setTarget] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [toast, setToast] = useState(null);

  const money = (n) => Number(n || 0).toLocaleString("vi-VN");

  const notify = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);

      const [p, h] = await Promise.all([
        supabase
          .from("redemption_packages")
          .select("*")
          .eq("active", true)
          .order("sort_order", { ascending: true }),

        supabase
          .from("redemption_orders")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
      ]);

      if (p.error) console.error(p.error);
      if (h.error) console.error(h.error);

      setPackages(p.data || []);
      setHistory(h.data || []);
      setLoading(false);
    };

    load();
  }, [session]);

  const filtered = useMemo(() => {
    return packages.filter((p) => {
      const name = String(p.name || "").toLowerCase();
      const type = String(p.reward_type || "").toLowerCase();
      const ver = String(p.version || "").toLowerCase();

      if (category === "quanhuy") {
        return (
          type === "quan_huy" ||
          name.includes("quân huy") ||
          name.includes("quan huy") ||
          name.includes("qh")
        );
      }

      const isRobux =
        type === "robux" ||
        name.includes("robux") ||
        name.includes("r$");

      if (!isRobux) return false;

      if (p.version) {
        return (
          ver === version ||
          (version === "quoc_te" && ver === "quoc te")
        );
      }

      if (version === "vng") {
        return (
          name.includes("vng") ||
          name.includes("40 robux") ||
          name.includes("80 robux")
        );
      }

      return (
        name.includes("quốc tế") ||
        name.includes("quoc te") ||
        name.includes("international")
      );
    });
  }, [packages, category, version]);

  const openCatalog = (type) => {
    setCategory(type);
    setVersion("vng");
    setSelected(null);
    setDelivery("");
    setTarget("");
    setPage("catalog");
  };

  const closeCatalog = () => {
    setSelected(null);
    setDelivery("");
    setTarget("");
    setPage("home");
  };

  const selectPackage = (pkg) => {
    setSelected(pkg);
    setTarget("");

    if (category === "quanhuy") {
      setDelivery("lien_quan");
    } else if (version === "vng") {
      setDelivery("roblox");
    } else {
      setDelivery("");
    }
  };

  const getStatus = (status) => {
    const map = {
      pending: ["Đang xử lý", "bg-amber-50 text-amber-600", Clock],
      processing: ["Đang xử lý", "bg-amber-50 text-amber-600", Clock],
      delivered: ["Đã giao", "bg-emerald-50 text-emerald-600", CheckCircle2],
      rejected: ["Đã từ chối", "bg-rose-50 text-rose-600", XCircle],
      cancelled: ["Đã hủy", "bg-slate-100 text-slate-500", XCircle]
    };

    return map[status] || map.pending;
  };

  const date = (value) => {
    if (!value) return "Chưa giao";

    return new Date(value).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const redeem = async () => {
    if (!session?.user?.id) {
      notify("Vui lòng đăng nhập!", "error");
      return;
    }

    if (!selected || !target.trim()) {
      notify("Vui lòng nhập đầy đủ thông tin!", "error");
      return;
    }

    if (category === "robux" && version === "quoc_te" && !delivery) {
      notify("Vui lòng chọn nơi nhận code!", "error");
      return;
    }

    if (
      delivery === "zalo" &&
      !/^0\d{9}$/.test(target.replace(/\s/g, ""))
    ) {
      notify("Số Zalo không hợp lệ!", "error");
      return;
    }

    setRedeeming(true);

    const { data, error } = await supabase.rpc(
      "create_redemption_order",
      {
        p_user_id: session.user.id,
        p_package_id: selected.id,
        p_delivery_method: delivery,
        p_delivery_target: target.trim()
      }
    );

    setRedeeming(false);

    if (error || !data?.success) {
      notify(
        error?.message || data?.error || "Đổi thưởng thất bại!",
        "error"
      );
      return;
    }

    if (setProfile) {
      await setProfile((prev) => ({
        ...prev,
        coins: data.coins_remaining
      }));
    }

    try {
      await supabase.functions.invoke("telegram-webhook", {
        body: {
          message: {
            text:
              `🎁 ĐƠN HÀNG MỚI\n\n` +
              `📦 ${selected.name}\n` +
              `💰 ${money(selected.coin_cost)} Coin\n` +
              `👤 ${session.user.email}\n` +
              `🆔 ${data.order_code}`,
            chat: { id: ADMIN_CHAT_ID }
          }
        }
      });
    } catch (e) {
      console.error("Telegram:", e);
    }

    const { data: orders } = await supabase
      .from("redemption_orders")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    setHistory(orders || []);

    notify(`Đã tạo đơn ${data.order_code}!`);

    setSelected(null);
    setTarget("");
    setDelivery("");
    setPage("home");
  };

  const title =
    category === "robux"
      ? version === "vng"
        ? "Robux VNG"
        : "Robux Quốc tế"
      : "Quân Huy";

  const deliveryLabel = {
    roblox: "Roblox",
    lien_quan: "Liên Quân",
    discord: "Discord",
    zalo: "Zalo"
  };

  return (
    <div className="min-h-screen bg-[#F5FAFF] pb-28 font-[Be_Vietnam_Pro]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
        .font-display { font-family: 'Baloo 2', sans-serif; }
      `}</style>

      <main className="mx-auto max-w-md px-4 py-5">

        {toast && (
          <div className={`mb-4 flex gap-2 rounded-2xl border p-4 ${
            toast.type === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}>
            {toast.type === "error"
              ? <AlertCircle size={19} />
              : <CheckCircle2 size={19} />}
            <p className="text-sm font-semibold">{toast.message}</p>
          </div>
        )}

        {page === "home" ? (
          <>
            <header className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-sky-500">
                  NXX315 Studio
                </p>
                <h1 className="font-display text-3xl font-extrabold text-slate-900">
                  Cửa hàng
                </h1>
                <p className="text-sm text-slate-500">
                  Đổi Coin lấy phần thưởng
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-500">
                <Gift size={25} />
              </div>
            </header>

            <section className="mb-6 rounded-[26px] bg-gradient-to-br from-sky-400 to-blue-600 p-5 text-white shadow-lg shadow-blue-500/20">
              <p className="text-sm text-white/75">Số dư của bạn</p>

              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-4xl font-extrabold">
                  {money(profile?.coins)}
                </span>
                <span className="font-semibold text-white/70">Coin</span>
              </div>

              <div className="mt-4 rounded-xl bg-white/10 px-3 py-2 text-xs">
                ⚡ Sẵn sàng đổi thưởng
              </div>
            </section>

            <h2 className="mb-3 text-lg font-bold text-slate-800">
              Bạn muốn đổi gì?
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => openCatalog("robux")}
                className="rounded-[24px] bg-gradient-to-br from-sky-400 to-blue-600 p-5 text-left text-white shadow-lg shadow-blue-500/20 active:scale-[.98]"
              >
                <div className="mb-4 text-4xl">🪙</div>
                <p className="text-2xl font-extrabold">Robux</p>
                <p className="mt-1 text-sm text-white/75">
                  Xem gói →
                </p>
              </button>

              <button
                onClick={() => openCatalog("quanhuy")}
                className="rounded-[24px] bg-gradient-to-br from-orange-400 to-red-500 p-5 text-left text-white shadow-lg shadow-orange-500/20 active:scale-[.98]"
              >
                <div className="mb-4 text-4xl">⚔️</div>
                <p className="text-2xl font-extrabold">Quân Huy</p>
                <p className="mt-1 text-sm text-white/75">
                  Xem gói →
                </p>
              </button>
            </div>

            <History orders={history} status={getStatus} date={date} />
          </>
        ) : (
          <>
            <button
              onClick={closeCatalog}
              className="mb-5 flex items-center gap-1 text-sm font-semibold text-slate-500"
            >
              <ArrowLeft size={17} />
              Cửa hàng
            </button>

            <div className="mb-5">
              <h1 className="font-display text-3xl font-extrabold text-slate-900">
                {selected ? selected.name : title}
              </h1>
              <p className="text-sm text-slate-500">
                {selected
                  ? `${money(selected.coin_cost)} Coin`
                  : "Chọn gói bạn muốn đổi"}
              </p>
            </div>

            {!selected && category === "robux" && (
              <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
                <button
                  onClick={() => setVersion("vng")}
                  className={`rounded-xl py-3 text-sm font-bold ${
                    version === "vng"
                      ? "bg-white text-sky-600 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  🇻🇳 VNG
                </button>

                <button
                  onClick={() => setVersion("quoc_te")}
                  className={`rounded-xl py-3 text-sm font-bold ${
                    version === "quoc_te"
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  🌎 Quốc tế
                </button>
              </div>
            )}

            {!selected ? (
              <Catalog
                packages={filtered}
                category={category}
                loading={loading}
                onSelect={selectPackage}
              />
            ) : (
              <RedeemForm
                pkg={selected}
                category={category}
                version={version}
                delivery={delivery}
                setDelivery={setDelivery}
                target={target}
                setTarget={setTarget}
                redeeming={redeeming}
                onRedeem={redeem}
                onBack={() => setSelected(null)}
              />
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
    }
function Catalog({ packages, category, loading, onSelect }) {
  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
        <Loader2
          size={28}
          className="mx-auto animate-spin text-sky-500"
        />
        <p className="mt-3 text-sm text-slate-400">
          Đang tải gói...
        </p>
      </div>
    );
  }

  if (!packages.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
        <Gift size={32} className="mx-auto text-slate-300" />
        <p className="mt-3 font-semibold text-slate-500">
          Chưa có gói nào
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Admin chưa mở gói thưởng.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {packages.map((pkg) => (
        <button
          key={pkg.id}
          onClick={() => onSelect(pkg)}
          className="rounded-[22px] border border-slate-100 bg-white p-4 text-left shadow-sm transition active:scale-[.97]"
        >
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-3xl">
            {category === "robux" ? "🪙" : "⚔️"}
          </div>

          <p className="font-bold text-slate-900">
            {pkg.name}
          </p>

          <div className="mt-2 flex items-center gap-1 text-sm font-bold text-amber-500">
            <Coins size={14} />
            {Number(pkg.coin_cost || 0).toLocaleString("vi-VN")}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs font-bold text-sky-500">
              Đổi ngay
            </span>
            <ChevronRight size={15} className="text-slate-300" />
          </div>
        </button>
      ))}
    </div>
  );
}

function RedeemForm({
  pkg,
  category,
  version,
  delivery,
  setDelivery,
  target,
  setTarget,
  redeeming,
  onRedeem,
  onBack
}) {
  const isRobuxVNG =
    category === "robux" && version === "vng";

  const isRobuxInternational =
    category === "robux" && version !== "vng";

  const isQuanHuy = category === "quanhuy";

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-1 text-sm font-semibold text-slate-500"
      >
        <ArrowLeft size={17} />
        Chọn gói khác
      </button>

      <div className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-3xl">
            {isQuanHuy ? "⚔️" : "🪙"}
          </div>

          <div>
            <p className="font-bold text-slate-900">
              {pkg.name}
            </p>

            <div className="mt-1 flex items-center gap-1 text-sm font-bold text-amber-500">
              <Coins size={14} />
              {Number(pkg.coin_cost || 0).toLocaleString("vi-VN")} Coin
            </div>
          </div>
        </div>
      </div>

      {isRobuxVNG && (
        <>
          <label className="text-sm font-bold text-slate-700">
            Roblox Username
          </label>

          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Nhập Username Roblox"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-sky-400"
          />

          <div className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs text-amber-700">
            ⚠️ Chỉ nhập Username Roblox.
            <br />
            Không bao giờ nhập mật khẩu.
          </div>
        </>
      )}

      {isQuanHuy && (
        <>
          <label className="text-sm font-bold text-slate-700">
            UID Liên Quân
          </label>

          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Nhập UID Liên Quân"
            inputMode="numeric"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-orange-400"
          />

          <div className="mt-3 rounded-2xl bg-orange-50 p-3 text-xs text-orange-700">
            ⚔️ Quân Huy sẽ được nạp theo UID bạn cung cấp.
          </div>
        </>
      )}

      {isRobuxInternational && (
        <>
          <p className="mb-3 text-sm font-bold text-slate-700">
            Nhận code qua
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDelivery("discord")}
              className={`rounded-2xl border p-4 ${
                delivery === "discord"
                  ? "border-sky-400 bg-sky-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="text-2xl">🔵</div>
              <p className="mt-1 text-sm font-bold">
                Discord
              </p>
            </button>

            <button
              onClick={() => setDelivery("zalo")}
              className={`rounded-2xl border p-4 ${
                delivery === "zalo"
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="text-2xl">💚</div>
              <p className="mt-1 text-sm font-bold">
                Zalo
              </p>
            </button>
          </div>

          {delivery && (
            <>
              <label className="mt-4 block text-sm font-bold text-slate-700">
                {delivery === "discord"
                  ? "Discord Username"
                  : "Số điện thoại Zalo"}
              </label>

              <input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder={
                  delivery === "discord"
                    ? "@username"
                    : "Số điện thoại"
                }
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-sky-400"
              />
            </>
          )}
        </>
      )}

      <button
        onClick={onRedeem}
        disabled={redeeming || !target.trim()}
        className="mt-6 flex w-full items-center justify-center rounded-full bg-sky-500 py-4 text-sm font-bold text-white shadow-lg shadow-sky-500/20 disabled:opacity-50"
      >
        {redeeming ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          `Đổi ${Number(pkg.coin_cost || 0).toLocaleString("vi-VN")} Coin`
        )}
      </button>
    </div>
  );
}

function History({ orders, status, date }) {
  return (
    <section className="mt-8 rounded-3xl bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-900">
          🧾 Lịch sử đổi
        </h2>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
          {orders.length}
        </span>
      </div>

      {!orders.length ? (
        <p className="py-6 text-center text-sm text-slate-400">
          Chưa có đơn hàng
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const [label, color, Icon] = status(order.status);

            return (
              <div
                key={order.id}
                className="rounded-2xl bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900">
                      {order.package_name}
                    </p>

                    <p className="mt-1 break-all font-mono text-[11px] text-slate-400">
                      ID: {order.order_code || order.id}
                    </p>
                  </div>

                  <span
                    className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${color}`}
                  >
                    <Icon size={12} />
                    {label}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-1 text-xs">
                  <p className="text-slate-500">
                    🕐 Đặt hàng:{" "}
                    <b className="text-slate-700">
                      {date(order.created_at)}
                    </b>
                  </p>

                  <p className="text-slate-500">
                    🚚 Giao hàng:{" "}
                    <b className="text-slate-700">
                      {date(
                        order.delivered_at ||
                        order.completed_at ||
                        order.delivery_at
                      )}
                    </b>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
            }
