import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Copy,
  CreditCard,
  Loader2,
  Search,
  ShieldCheck,
  User,
  Wallet,
  XCircle,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient.js";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";

const PACKAGES = [
  {
    id: "card-400",
    name: "Card Robux",
    robux: 400,
    price: 170000,
    image:
      "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-400.png",
    method: "Card Robux",
  },
  {
    id: "vng-40",
    name: "Nạp trực tiếp",
    robux: 40,
    price: 14500,
    image:
      "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-40.png",
    method: "VNG",
  },
  {
    id: "vng-80",
    name: "Nạp trực tiếp",
    robux: 80,
    price: 28500,
    image:
      "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-80.png",
    method: "VNG",
  },
  {
    id: "vng-500",
    name: "Nạp trực tiếp",
    robux: 500,
    price: 140500,
    image:
      "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-500.png",
    method: "VNG",
  },
];

const BANK = {
  name: "MB Bank",
  account: "0939339622",
  holder: "NGUYEN VAN CO",
};

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN").format(value) + "đ";

function copyText(text) {
  navigator.clipboard?.writeText(text);
}

export default function Roblox() {
  const navigate = useNavigate();

  const [step, setStep] = useState("package");
  const [selectedPackage, setSelectedPackage] = useState(null);

  const [username, setUsername] = useState("");
  const [robloxUser, setRobloxUser] = useState(null);
  const [checkingUser, setCheckingUser] = useState(false);

  const [order, setOrder] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const checkRobloxUser = async () => {
    const value = username.trim();

    if (!value) {
      alert("Vui lòng nhập username Roblox.");
      return;
    }

    setCheckingUser(true);
    setRobloxUser(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        return;
      }

      const response = await fetch(
        `/api/roblox-user?username=${encodeURIComponent(value)}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Không thể kiểm tra tài khoản Roblox."
        );
      }

      setRobloxUser(data);
    } catch (error) {
      alert(error.message || "Không thể kiểm tra tài khoản Roblox.");
    } finally {
      setCheckingUser(false);
    }
  };

  const createOrder = async () => {
    if (!selectedPackage) {
      alert("Vui lòng chọn gói Robux.");
      return;
    }

    if (!robloxUser) {
      alert("Vui lòng kiểm tra username Roblox trước.");
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

      const response = await fetch(
        "https://rwglwovohbyqmbbzdvdj.supabase.co/functions/v1/create-roblox-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            roblox_user_id: robloxUser.id,
            roblox_username: robloxUser.username,
            roblox_display_name: robloxUser.displayName,
            package_id: selectedPackage.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Không thể tạo đơn hàng.");
      }

      setOrder(data.order);
      setStep("payment");
    } catch (error) {
      alert(error.message || "Có lỗi xảy ra khi tạo đơn.");
    } finally {
      setCreatingOrder(false);
    }
  };

  const goToUsername = () => {
    setStep("username");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <TopHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <button
          onClick={() => navigate("/store")}
          className="mb-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
          Quay lại cửa hàng
        </button>

        <div className="mb-7">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
            <Wallet size={17} />
            Roblox
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Nạp Robux
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Chọn gói Robux và nhập username Roblox để tiếp tục.
          </p>
        </div>

        {step === "package" && (
          <PackageSection
            selectedPackage={selectedPackage}
            onSelect={setSelectedPackage}
            onContinue={goToUsername}
          />
        )}

        {step === "username" && (
          <UsernameSection
            username={username}
            setUsername={setUsername}
            robloxUser={robloxUser}
            checkingUser={checkingUser}
            onCheck={checkRobloxUser}
            onBack={() => setStep("package")}
            onContinue={createOrder}
            creatingOrder={creatingOrder}
            selectedPackage={selectedPackage}
          />
        )}

        {step === "payment" && (
          <PaymentSection
            order={order}
            onBack={() => setStep("username")}
            onPaid={(updatedOrder) => setOrder(updatedOrder)}
          />
        )}
      </main>

      <BottomNav />
    </div>
  );
}
function PackageSection({
  selectedPackage,
  onSelect,
  onContinue,
}) {
  const cardPackages = PACKAGES.filter(
    (pkg) => pkg.method === "Card Robux"
  );

  const vngPackages = PACKAGES.filter(
    (pkg) => pkg.method === "VNG"
  );

  return (
    <div className="space-y-8">
      <PackageGroup
        title="Card Robux"
        icon={<CreditCard size={20} />}
        packages={cardPackages}
        selectedPackage={selectedPackage}
        onSelect={onSelect}
      />

      <PackageGroup
        title="Nạp trực tiếp (VNG)"
        icon={<Wallet size={20} />}
        packages={vngPackages}
        selectedPackage={selectedPackage}
        onSelect={onSelect}
      />

      <button
        onClick={onContinue}
        disabled={!selectedPackage}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Tiếp tục
        <ChevronRight size={19} />
      </button>
    </div>
  );
}

function PackageGroup({
  title,
  icon,
  packages,
  selectedPackage,
  onSelect,
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          {icon}
        </div>

        <h2 className="text-xl font-black text-slate-900">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => {
          const active = selectedPackage?.id === pkg.id;

          return (
            <button
              key={pkg.id}
              onClick={() => onSelect(pkg)}
              className={`relative overflow-hidden rounded-2xl bg-white p-4 text-left shadow-sm ring-1 transition ${
                active
                  ? "ring-2 ring-blue-600 shadow-lg shadow-blue-600/10"
                  : "ring-slate-200 hover:-translate-y-0.5 hover:ring-blue-300"
              }`}
            >
              {active && (
                <div className="absolute right-3 top-3 rounded-full bg-blue-600 p-1 text-white">
                  <CheckCircle2 size={17} />
                </div>
              )}

              <div className="flex items-center gap-4">
                <img
                  src={pkg.image}
                  alt={`${pkg.robux} Robux`}
                  className="h-20 w-20 rounded-2xl object-contain"
                />

                <div className="min-w-0">
                  <p className="text-lg font-black text-slate-900">
                    {pkg.robux.toLocaleString("vi-VN")} Robux
                  </p>

                  <p className="mt-1 text-sm font-bold text-blue-600">
                    {formatPrice(pkg.price)}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {pkg.method}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function UsernameSection({
  username,
  setUsername,
  robloxUser,
  checkingUser,
  onCheck,
  onBack,
  onContinue,
  creatingOrder,
  selectedPackage,
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <User size={21} />
          </div>

          <div>
            <h2 className="font-black text-slate-900">
              Tài khoản Roblox
            </h2>

            <p className="text-sm text-slate-500">
              Nhập username Roblox cần nhận Robux
            </p>
          </div>
        </div>

        <label className="mb-2 block text-sm font-bold text-slate-700">
          Username Roblox
        </label>

        <div className="flex gap-2">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onCheck();
            }}
            placeholder="Ví dụ: Builderman"
            className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />

          <button
            onClick={onCheck}
            disabled={checkingUser || !username.trim()}
            className="flex shrink-0 items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {checkingUser ? (
              <Loader2 size={19} className="animate-spin" />
            ) : (
              <Search size={19} />
            )}

            <span className="hidden sm:inline">
              {checkingUser ? "Đang kiểm tra..." : "Kiểm tra"}
            </span>
          </button>
        </div>

        {robloxUser && (
          <div className="mt-5 flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            {robloxUser.avatar ? (
              <img
                src={robloxUser.avatar}
                alt={robloxUser.username}
                className="h-16 w-16 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <User size={28} />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={17}
                  className="shrink-0 text-emerald-600"
                />

                <p className="truncate font-black text-slate-900">
                  {robloxUser.displayName || robloxUser.username}
                </p>
              </div>

              <p className="mt-1 truncate text-sm text-slate-500">
                @{robloxUser.username}
              </p>

              <p className="mt-1 text-xs font-medium text-emerald-600">
                Đã xác minh tài khoản
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-2xl bg-blue-50 p-4">
          <div className="flex gap-3">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-blue-600"
            />

            <div>
              <p className="text-sm font-bold text-blue-900">
                Kiểm tra chính xác trước khi thanh toán
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-700">
                Hãy kiểm tra kỹ username Roblox. Robux sẽ được
                xử lý theo tài khoản đã xác nhận.
              </p>
            </div>
          </div>
        </div>

        {selectedPackage && (
          <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 p-4">
            <div>
              <p className="text-xs text-slate-400">
                Gói đã chọn
              </p>

              <p className="font-black text-slate-900">
                {selectedPackage.robux.toLocaleString("vi-VN")} Robux
              </p>
            </div>

            <p className="font-black text-blue-600">
              {formatPrice(selectedPackage.price)}
            </p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Quay lại
          </button>

          <button
            onClick={onContinue}
            disabled={!robloxUser || creatingOrder}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3.5 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {creatingOrder ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Đang tạo đơn...
              </>
            ) : (
              <>
                Tạo đơn
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
                }
  function PaymentSection({ order, onBack, onPaid }) {
  const [method, setMethod] = useState("coin");
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [cards, setCards] = useState([
    {
      id: Date.now(),
      type: "Viettel",
      amount: "",
      serial: "",
      code: "",
    },
  ]);
  const [cardResult, setCardResult] = useState(null);
  const [cardChecking, setCardChecking] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoadingProfile(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setProfile(null);
        return;
      }

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
      <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <XCircle className="mx-auto mb-3 text-red-500" size={42} />

        <h2 className="font-black text-slate-900">
          Không tìm thấy đơn hàng
        </h2>

        <button
          onClick={onBack}
          className="mt-5 rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const transferContent =
    `NAP ROBLOX ${order.order_code} ${order.roblox_username} ${order.robux}ROBUX`;

  const coinBalance = Number(profile?.coins || 0);
  const requiredCoins = Number(order.amount || 0);
  const enoughCoins = coinBalance >= requiredCoins;

  const cardDiscounts = {
    Viettel: 19,
    Mobifone: 19.5,
    Vinaphone: 19.5,
    Garena: 14.5,
    Zing: 14,
  };

  const cardDenominations = {
    Viettel: [
      { value: 10000, received: 8100 },
      { value: 20000, received: 16200 },
      { value: 30000, received: 24300 },
      { value: 50000, received: 40500 },
      { value: 100000, received: 81000 },
      { value: 200000, received: 162000 },
      { value: 300000, received: 243000 },
      { value: 500000, received: 405000 },
      { value: 1000000, received: 810000 },
    ],
    Mobifone: [
      { value: 10000, received: 8050 },
      { value: 20000, received: 16100 },
      { value: 30000, received: 24150 },
      { value: 50000, received: 40250 },
      { value: 100000, received: 80500 },
      { value: 200000, received: 161000 },
      { value: 300000, received: 241500 },
      { value: 500000, received: 402500 },
    ],
    Vinaphone: [
      { value: 10000, received: 8000 },
      { value: 20000, received: 16000 },
      { value: 30000, received: 24000 },
      { value: 50000, received: 40000 },
      { value: 100000, received: 80000 },
      { value: 200000, received: 160000 },
      { value: 300000, received: 240000 },
      { value: 500000, received: 400000 },
    ],
    Garena: [
      { value: 20000, received: 17100 },
      { value: 50000, received: 42750 },
      { value: 100000, received: 85500 },
      { value: 200000, received: 171000 },
      { value: 500000, received: 427500 },
    ],
    Zing: [
      { value: 10000, received: 8700 },
      { value: 20000, received: 17400 },
      { value: 30000, received: 26100 },
      { value: 50000, received: 43500 },
      { value: 100000, received: 87000 },
      { value: 200000, received: 174000 },
      { value: 300000, received: 261000 },
      { value: 500000, received: 435000 },
      { value: 1000000, received: 870000 },
    ],
  };

  const cardTypes = Object.keys(cardDiscounts);

  const addCard = () => {
    setCards((current) => [
      ...current,
      {
        id: Date.now(),
        type: "Viettel",
        amount: "",
        serial: "",
        code: "",
      },
    ]);
  };

  const removeCard = (id) => {
    setCards((current) => {
      if (current.length === 1) return current;
      return current.filter((card) => card.id !== id);
    });
  };

  const updateCard = (id, field, value) => {
    setCards((current) =>
      current.map((card) =>
        card.id === id
          ? {
              ...card,
              [field]: value,
            }
          : card
      )
    );
  };

  const handleCoinPayment = async () => {
    if (!enoughCoins) {
      alert(
        `Bạn không đủ Coin.\n\n` +
          `Cần: ${requiredCoins.toLocaleString("vi-VN")} Coin\n` +
          `Hiện có: ${coinBalance.toLocaleString("vi-VN")} Coin`
      );
      return;
    }

    const ok = window.confirm(
      `Bạn có chắc muốn dùng ${requiredCoins.toLocaleString(
        "vi-VN"
      )} Coin để thanh toán đơn này?`
    );

    if (!ok) return;

    setProcessing(true);

    try {
      /*
       * QUAN TRỌNG:
       * Chỗ này chưa tự trừ Coin ở frontend.
       *
       * Cần dùng RPC / Edge Function để trừ Coin an toàn.
       */

      alert(
        "Phần thanh toán bằng Coin đã sẵn sàng giao diện.\n\n" +
          "Cần nối RPC/Edge Function để trừ Coin an toàn."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmTransfer = async () => {
    if (!order?.id || order.status !== "pending") return;

    const ok = window.confirm(
      "Bạn đã chuyển đúng số tiền và đúng nội dung chuyển khoản chưa?"
    );

    if (!ok) return;

    setProcessing(true);

    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: "paid",
          payment_method: "bank",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)
        .eq("status", "pending");

      if (error) throw error;

      const updatedOrder = {
        ...order,
        status: "paid",
        payment_method: "bank",
      };

      onPaid?.(updatedOrder);
    } catch (error) {
      console.error("Confirm payment error:", error);

      alert(
        "Không thể xác nhận đơn hàng.\n\n" +
          (error?.message || "Vui lòng thử lại.")
      );
    } finally {
      setProcessing(false);
    }
  };

  const checkCardTransactions = async (requestIds) => {
    const ids = requestIds.filter(Boolean);
    if (!ids.length) throw new Error("API không trả về mã giao dịch.");

    setCardChecking(true);
    try {
      for (let attempt = 0; attempt < 40; attempt++) {
        const results = [];

        for (const requestId of ids) {
          const { data, error } = await supabase.functions.invoke(
            "apidoithe-webhook",
            { body: { transaction_id: requestId } }
          );

          if (error) {
            throw new Error(
              error.message || "Không thể kiểm tra trạng thái thẻ."
            );
          }

          results.push({
            requestId,
            status: String(data?.status || "").toLowerCase(),
            netAmount: Number(data?.net_amount || 0),
          });
        }

        if (results.some((item) => item.status === "failed")) {
          return { status: "failed", results };
        }

        if (results.length && results.every((item) => item.status === "success")) {
          return { status: "success", results };
        }

        await new Promise((resolve) => setTimeout(resolve, 2500));
      }

      return { status: "processing", results: [] };
    } finally {
      setCardChecking(false);
    }
  };

  const handleCardPayment = async () => {
    for (const card of cards) {
      if (!card.type || !card.amount || !card.serial || !card.code) {
        alert("Vui lòng nhập đầy đủ thông tin tất cả thẻ.");
        return;
      }
    }

    if (cards.some((card) => Number(card.amount) <= 0)) {
      alert("Mệnh giá thẻ không hợp lệ.");
      return;
    }

    const ok = window.confirm(
      "Bạn đã kiểm tra kỹ loại thẻ và mệnh giá chưa?\\n\\n" +
        "Điền sai mệnh giá có thể khiến thẻ bị mất."
    );
    if (!ok) return;

    setProcessing(true);
    setCardResult(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error(
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );
      }

      const requestIds = [];

      for (const card of cards) {
        const { data, error } = await supabase.functions.invoke(
          "submit-card",
          {
            body: {
              telco: card.type,
              denomination: Number(card.amount),
              serial: card.serial.trim(),
              code: card.code.trim(),
            },
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (error) {
          throw new Error(error.message || "Không thể gửi thẻ.");
        }

        if (!data?.success || !data?.request_id) {
          throw new Error(
            data?.message || data?.error || "API không chấp nhận thẻ."
          );
        }

        requestIds.push(data.request_id);
      }

      setProcessing(false);

      const checked = await checkCardTransactions(requestIds);
      const cardInfo = cards.map((card) => ({
        type: card.type,
        amount: Number(card.amount),
      }));

      if (checked.status === "success") {
        const totalNetAmount = checked.results.reduce(
          (sum, item) => sum + Number(item.netAmount || 0),
          0
        );

        setCardResult({
          status: "success",
          requestIds,
          totalNetAmount,
          results: checked.results,
          cards: cardInfo,
        });

        await loadProfile();

        setCards([
          {
            id: Date.now(),
            type: "Viettel",
            amount: "",
            serial: "",
            code: "",
          },
        ]);
        return;
      }

      setCardResult({
        status: checked.status,
        requestIds,
        results: checked.results,
        cards: cardInfo,
      });
    } catch (error) {
      console.error("Card payment error:", error);
      setCardResult({
        status: "error",
        message:
          error?.message || "Không thể xử lý thẻ. Vui lòng thử lại.",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* HEADER */}

      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
          <CreditCard size={21} />
        </div>

        <div>
          <h2 className="font-black text-slate-900">
            Thanh toán
          </h2>

          <p className="text-sm text-slate-500">
            Chọn phương thức thanh toán
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        {/* ORDER SUMMARY */}

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white">
          <p className="text-sm font-medium text-blue-100">
            Tổng thanh toán
          </p>

          <p className="mt-1 text-3xl font-black">
            {formatPrice(order.amount)}
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold">
            Mã đơn: {order.order_code}
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {/* PAYMENT METHODS */}

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setMethod("coin")}
              className={`rounded-2xl border px-3 py-3 text-sm font-black transition ${
                method === "coin"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              🪙 Coin
            </button>

            <button
              onClick={() => setMethod("bank")}
              className={`rounded-2xl border px-3 py-3 text-sm font-black transition ${
                method === "bank"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              🏦 Chuyển khoản
            </button>

            <button
              onClick={() => setMethod("card")}
              className={`rounded-2xl border px-3 py-3 text-sm font-black transition ${
                method === "card"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              🎫 Thẻ cào
            </button>
          </div>

          {/* COIN */}

          {method === "coin" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-800">
                    Số dư Coin
                  </span>

                  <span className="text-xl font-black text-blue-700">
                    {loadingProfile
                      ? "..."
                      : `${coinBalance.toLocaleString("vi-VN")} Coin`}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Cần thanh toán
                  </span>

                  <span className="font-black text-slate-900">
                    {requiredCoins.toLocaleString("vi-VN")} Coin
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Sau thanh toán
                  </span>

                  <span
                    className={`font-black ${
                      enoughCoins
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {Math.max(
                      coinBalance - requiredCoins,
                      0
                    ).toLocaleString("vi-VN")}{" "}
                    Coin
                  </span>
                </div>
              </div>

              <button
                onClick={handleCoinPayment}
                disabled={
                  processing ||
                  loadingProfile ||
                  !enoughCoins
                }
                className="w-full rounded-2xl bg-blue-600 px-5 py-4 font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {processing
                  ? "Đang xử lý..."
                  : enoughCoins
                  ? `Thanh toán ${requiredCoins.toLocaleString(
                      "vi-VN"
                    )} Coin`
                  : "Không đủ Coin"}
              </button>
            </div>
          )}

          {/* BANK */}

          {method === "bank" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-black text-slate-900">
                    Thông tin ngân hàng
                  </h3>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                    MB Bank
                  </span>
                </div>

                <div className="space-y-4">
                  <BankRow
                    label="Ngân hàng"
                    value={BANK.name}
                  />

                  <BankRow
                    label="Số tài khoản"
                    value={BANK.account}
                    copy
                  />

                  <BankRow
                    label="Chủ tài khoản"
                    value={BANK.holder}
                  />

                  <BankRow
                    label="Số tiền"
                    value={formatPrice(order.amount)}
                    copyValue={String(order.amount)}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-sm font-black text-amber-900">
                  Nội dung chuyển khoản
                </p>

                <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-white p-3">
                  <code className="min-w-0 flex-1 break-all text-sm font-bold text-slate-800">
                    {transferContent}
                  </code>

                  <button
                    onClick={() => copyText(transferContent)}
                    className="shrink-0 rounded-xl bg-amber-100 p-2.5 text-amber-700"
                  >
                    <Copy size={17} />
                  </button>
                </div>

                <p className="mt-3 text-xs leading-5 text-amber-800">
                  Vui lòng ghi chính xác nội dung chuyển khoản.
                </p>
              </div>

              {order.status === "paid" ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      size={25}
                      className="text-emerald-600"
                    />

                    <div>
                      <p className="font-black text-emerald-900">
                        Đã gửi xác nhận
                      </p>

                      <p className="mt-1 text-sm text-emerald-700">
                        Đơn đang chờ admin kiểm tra.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleConfirmTransfer}
                  disabled={processing}
                  className="w-full rounded-2xl bg-blue-600 px-5 py-4 font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing
                    ? "Đang xác nhận..."
                    : "✓ Tôi đã chuyển khoản"}
                </button>
              )}
            </div>
          )}

          {/* CARD */}

          {method === "card" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Thẻ cào
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Chọn loại thẻ và nhập thông tin thẻ
                </p>
              </div>

              {/* DISCOUNTS */}

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {cardTypes.map((type) => (
                  <div
                    key={type}
                    className="rounded-xl bg-slate-50 p-3 text-center"
                  >
                    <p className="text-xs font-bold text-slate-600">
                      {type}
                    </p>

                    <p className="mt-1 text-sm font-black text-blue-600">
                      {cardDiscounts[type]}%
                    </p>
                  </div>
                ))}
              </div>

              {/* WARNING */}

              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-black text-red-700">
                   Nguy hiểm
                </p>

                <p className="mt-1 text-xs leading-5 text-red-600">
                  Quý khách điền sai Mệnh Giá sẽ bị mất thẻ!
                </p>
              </div>

              {cardResult?.status === "success" && (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <CheckCircle2 size={27} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xl font-black text-emerald-900">
                        Nạp thẻ thành công!
                      </p>
                      <p className="mt-1 text-sm text-emerald-700">
                        APIĐổiThẻ đã xác nhận và Coin đã được cộng.
                      </p>
                      <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-emerald-100">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm text-slate-500">
                            Coin nhận được
                          </span>
                          <span className="text-2xl font-black text-emerald-600">
                            +{Number(cardResult.totalNetAmount || 0).toLocaleString("vi-VN")} Coin
                          </span>
                        </div>
                        <div className="mt-3 space-y-2">
                          {cardResult.cards?.map((item, index) => (
                            <div key={`${item.type}-${item.amount}-${index}`} className="flex items-center justify-between gap-3 text-sm">
                              <span className="text-slate-500">
                                {item.type} {Number(item.amount).toLocaleString("vi-VN")}đ
                              </span>
                              <span className="font-bold text-slate-800">
                                {Number(cardResult.results?.[index]?.netAmount || 0).toLocaleString("vi-VN")} Coin
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="mt-3 break-all text-xs text-emerald-700">
                        Mã giao dịch: {cardResult.requestIds?.join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {cardResult?.status === "failed" && (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-5">
                  <div className="flex items-start gap-3">
                    <XCircle className="mt-0.5 shrink-0 text-red-600" size={25} />
                    <div>
                      <p className="font-black text-red-900">Thẻ bị từ chối</p>
                      <p className="mt-1 text-sm text-red-700">
                        Coin không được cộng cho giao dịch thất bại.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {cardResult?.status === "processing" && (
                <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
                  <div className="flex items-start gap-3">
                    <Loader2 className="mt-0.5 shrink-0 animate-spin text-amber-600" size={25} />
                    <div>
                      <p className="font-black text-amber-900">Thẻ đang được xử lý</p>
                      <p className="mt-1 text-sm text-amber-700">
                        APIĐổiThẻ chưa trả kết quả cuối. Coin chỉ được cộng khi giao dịch thành công.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {cardResult?.status === "error" && (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-5">
                  <div className="flex items-start gap-3">
                    <XCircle className="mt-0.5 shrink-0 text-red-600" size={25} />
                    <div>
                      <p className="font-black text-red-900">Không thể xử lý thẻ</p>
                      <p className="mt-1 text-sm text-red-700">{cardResult.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* CARDS */}

              {cards.map((card, index) => (
                <div
                  key={card.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <p className="font-black text-slate-900">
                      Thẻ #{index + 1}
                    </p>

                    {cards.length > 1 && (
                      <button
                        onClick={() => removeCard(card.id)}
                        className="rounded-xl px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50"
                      >
                        Xóa thẻ
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Loại thẻ *
                      </label>

                      <select
                        value={card.type}
                        onChange={(e) => {
                          updateCard(
                            card.id,
                            "type",
                            e.target.value
                          );
                          updateCard(
                            card.id,
                            "amount",
                            ""
                          );
                        }}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold outline-none focus:border-blue-500"
                      >
                        {cardTypes.map((type) => (
                          <option key={type} value={type}>
                            {type} — Chiết khấu{" "}
                            {cardDiscounts[type]}%
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Mệnh giá *
                      </label>

                      <select
                        value={card.amount}
                        onChange={(e) =>
                          updateCard(
                            card.id,
                            "amount",
                            e.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold outline-none focus:border-blue-500"
                      >
                        <option value="">
                          Chọn mệnh giá
                        </option>

                        {(cardDenominations[card.type] || []).map(
                          (item) => (
                            <option
                              key={item.value}
                              value={item.value}
                            >
                              {item.value.toLocaleString("vi-VN")}đ
                            </option>
                          )
                        )}
                      </select>
                      {card.amount && (() => {
                        const selected = (
                          cardDenominations[card.type] || []
                        ).find(
                          (item) => Number(item.value) === Number(card.amount)
                        );

                        if (!selected) return null;

                        return (
                          <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-semibold text-emerald-700">
                                Coin nhận được
                              </span>
                              <span className="font-black text-emerald-700">
                                +{selected.received.toLocaleString("vi-VN")} Coin
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Số Seri Thẻ *
                      </label>

                      <input
                        value={card.serial}
                        onChange={(e) =>
                          updateCard(
                            card.id,
                            "serial",
                            e.target.value
                          )
                        }
                        placeholder="Nhập số seri"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Mã Thẻ *
                      </label>

                      <input
                        value={card.code}
                        onChange={(e) =>
                          updateCard(
                            card.id,
                            "code",
                            e.target.value
                          )
                        }
                        placeholder="Nhập mã thẻ"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addCard}
                className="w-full rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 px-5 py-3.5 font-black text-blue-600 transition hover:bg-blue-100"
              >
                + Thêm thẻ
               </button>

              <button
                onClick={handleCardPayment}
                disabled={processing}
                className="w-full rounded-2xl bg-blue-600 px-5 py-4 font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
              >
                {processing ? "Đang xử lý..." : "Nạp tiền"}
              </button>
            </div>
          )}

          <button
            onClick={onBack}
            disabled={processing}
            className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}
function BankRow({
  label,
  value,
  copy = false,
  copyValue,
}) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(copyValue || value);
      alert("Đã sao chép!");
    } catch (error) {
      console.error("Copy error:", error);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <div className="flex min-w-0 items-center gap-2">
        <span className="break-all text-right text-sm font-black text-slate-900">
          {value}
        </span>

        {(copy || copyValue) && (
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-blue-600"
            title="Sao chép"
          >
            <Copy size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
