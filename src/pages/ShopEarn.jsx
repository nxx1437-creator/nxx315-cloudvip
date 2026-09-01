import React, { useState } from "react";
import {
  ShoppingBag, Link2, Copy, Check, Loader2, Star, Wallet,
  ArrowLeftRight, Landmark, X, Clock3, CheckCircle2, XCircle, Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

const formatVND = (v) =>
  Number(v || 0).toLocaleString("vi-VN") + "đ";

const formatCoins = (v) =>
  Number(v || 0).toLocaleString("vi-VN");

export default function ShopEarn() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile, setProfile } = useProfile();

  const [productUrl, setProductUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [resultLink, setResultLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const [showConvert, setShowConvert] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const starPoints = Number(profile?.star_points || 0);

  const handleGenerate = async () => {
    if (!productUrl.trim()) {
      setGenError("Vui lòng dán link sản phẩm TikTok Shop.");
      return;
    }

    setGenerating(true);
    setGenError("");
    setResultLink(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    try {
      const { data, error } = await supabase.functions.invoke("create-affiliate-link", {
        headers: { Authorization: `Bearer ${token}` },
        body: { product_url: productUrl.trim(), platform: "tiktok" },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Không tạo được link.");

      const link = data.short_link || data.full_link;
      setResultLink(link);
      window.open(link, "_blank");
    } catch (err) {
      setGenError(err.message || "Có lỗi xảy ra, thử lại sau.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!resultLink) return;
    navigator.clipboard.writeText(resultLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] pb-28 text-slate-900">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-sky-300/10 blur-3xl" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-2xl px-4 py-5">
        <header className="mb-5 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-100"
          >
            ←
          </button>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-500">
              NXX315 Studio
            </p>
            <h1 className="text-xl font-black text-slate-950">Mua hàng kiếm sao</h1>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-[28px] border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5 shadow-[0_12px_40px_rgba(245,158,11,0.08)]">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-200/20 blur-3xl" />

          <div className="relative flex items-center justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-600">
                <Star size={13} className="fill-amber-500 text-amber-500" />
                Điểm sao của bạn
              </p>
              <p className="mt-1 text-3xl font-black text-slate-900">
                {formatVND(starPoints)}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Quy đổi từ hoa hồng mua hàng thực tế
              </p>
            </div>

            <Wallet size={40} className="text-amber-300" />
          </div>

          <div className="relative mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowWithdraw(true)}
              disabled={starPoints < 20000}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-white px-3 py-3 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-100 disabled:opacity-40"
            >
              <Landmark size={14} />
              Rút về ngân hàng
            </button>
            <button
              onClick={() => setShowConvert(true)}
              disabled={starPoints <= 0}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-3 text-xs font-bold text-white shadow-sm disabled:opacity-40"
            >
              <ArrowLeftRight size={14} />
              Đổi sang Xu
            </button>
          </div>

          {starPoints < 20000 && (
            <p className="relative mt-2 flex items-center gap-1 text-[10px] text-slate-400">
              <Info size={11} />
              Cần tối thiểu 20.000đ để rút về ngân hàng
            </p>
          )}
        </section>
<section className="mt-5 rounded-[24px] border border-sky-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <ShoppingBag size={17} className="text-sky-500" />
            <h2 className="text-sm font-black text-slate-900">Tạo link kiếm sao</h2>
          </div>

          <p className="mb-3 text-xs text-slate-400">
            Dán link sản phẩm TikTok Shop vào ô bên dưới để tạo link riêng của bạn.
          </p>

          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <Link2 size={15} className="shrink-0 text-slate-300" />
            <input
              type="text"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="Dán link sản phẩm TikTok Shop..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          {genError && (
            <p className="mt-2 text-xs font-bold text-rose-500">{genError}</p>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-3 text-sm font-black text-white shadow-lg shadow-sky-500/25 disabled:opacity-60"
          >
            {generating ? <Loader2 size={16} className="animate-spin" /> : "Tạo link ngay"}
          </button>

          {resultLink && (
            <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                Link của bạn (đã tự mở tab mới)
              </p>
              <div className="mt-2 flex items-center gap-2">
                <p className="flex-1 truncate text-sm font-semibold text-slate-700">{resultLink}</p>
                <button
                  onClick={handleCopy}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                </button>
              </div>

              <a
                href={resultLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 py-2.5 text-sm font-black text-white"
              >
                Mở lại link này
              </a>
            </div>
          )}

        <section className="mt-5 rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-black text-slate-900">Lưu ý để được ghi nhận đơn</h2>
          <ul className="space-y-2 text-xs leading-5 text-slate-500">
            <li className="flex gap-2">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
              Sau khi tạo link, bấm mua ngay, không xem Video/Livestream trước khi đặt hàng.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
              Xóa hết giỏ hàng TikTok Shop trước khi đặt qua link mới.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
              Mỗi lần tạo link chỉ tính cho 1 đơn hàng phát sinh ngay sau đó.
            </li>
            <li className="flex gap-2">
              <Clock3 size={14} className="mt-0.5 shrink-0 text-amber-500" />
              Điểm sao thường được duyệt sau vài ngày, không cộng ngay lập tức.
            </li>
          </ul>
        </section>

        <TransactionHistory userId={session?.user?.id} />
      </main>

      {showConvert && (
        <ConvertModal
          starPoints={starPoints}
          onClose={() => setShowConvert(false)}
          onDone={(newStar, newCoin) => {
            setProfile((prev) => ({ ...prev, star_points: newStar, coins: newCoin }));
            setShowConvert(false);
          }}
        />
      )}

      {showWithdraw && (
        <WithdrawModal
          starPoints={starPoints}
          userId={session?.user?.id}
          onClose={() => setShowWithdraw(false)}
          onDone={(newStar) => {
            setProfile((prev) => ({ ...prev, star_points: newStar }));
            setShowWithdraw(false);
          }}
        />
      )}

      <BottomNav />
    </div>
  );
}

function TransactionHistory({ userId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (!userId) return;

    supabase
      .from("affiliate_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("transaction_time", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setHistory(data || []);
        setLoading(false);
      });
  }, [userId]);

  const statusMap = {
    0: { label: "Đang chờ duyệt", icon: Clock3, cls: "bg-amber-50 text-amber-600 border-amber-100" },
    1: { label: "Đã duyệt", icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    2: { label: "Bị từ chối", icon: XCircle, cls: "bg-rose-50 text-rose-600 border-rose-100" },
  };

  if (loading) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-black">Lịch sử đơn hàng</h2>

      {history.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-white px-5 py-12 text-center">
          <p className="text-sm font-black text-slate-700">Chưa có đơn nào</p>
          <p className="mt-1 text-xs text-slate-400">Tạo link và mua hàng để bắt đầu kiếm sao.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((tx) => {
            const status = statusMap[tx.status] || statusMap[0];
            const StatusIcon = status.icon;

            return (
              <div key={tx.id} className="rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900">
                      {tx.product_name || tx.merchant || "Đơn hàng"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {tx.transaction_time ? new Date(tx.transaction_time).toLocaleString("vi-VN") : "—"}
                    </p>
                  </div>
                  <span className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${status.cls}`}>
                    <StatusIcon size={11} />
                    {status.label}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-amber-600">
                  <span>Hoa hồng: {formatVND(tx.commission)}</span>
                  {tx.credited && <span className="text-emerald-600">+{formatVND(tx.star_points_awarded)} điểm sao</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ConvertModal({ starPoints, onClose, onDone }) {
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const numAmount = Number(amount) || 0;
  const fee = numAmount * 0.05;
  const netPoints = numAmount - fee;
  const coinsReceived = netPoints * 10;

  const handleConvert = async () => {
    if (numAmount <= 0 || numAmount > starPoints) {
      setError("Số điểm không hợp lệ.");
      return;
    }

    setSaving(true);
    setError("");

    const { data, error: rpcError } = await supabase.rpc("convert_star_to_coin", {
      p_user_id: (await supabase.auth.getUser()).data.user.id,
      p_star_points: numAmount,
    });

    setSaving(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    const result = Array.isArray(data) ? data[0] : data;

    if (!result?.success) {
      setError(result?.error || "Đổi điểm thất bại.");
      return;
    }

    onDone(result.new_star_balance, result.new_coin_balance);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900">Đổi sang Xu</h3>
          <button onClick={onClose} className="text-slate-400"><X size={18} /></button>
        </div>

        <p className="mt-1 text-xs text-slate-400">Số dư khả dụng: {formatVND(starPoints)}</p>

        <p className="mb-2 mt-4 text-xs font-bold text-slate-500">Số điểm muốn đổi</p>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-amber-400"
        />

        {numAmount > 0 && (
          <div className="mt-3 space-y-1.5 rounded-xl bg-amber-50 p-3 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Phí sàn (5%)</span>
              <span className="font-bold text-rose-500">-{formatVND(fee)}</span>
            </div>
            <div className="flex justify-between font-black text-slate-800">
              <span>Xu nhận được</span>
              <span>{formatCoins(coinsReceived)} Xu</span>
            </div>
          </div>
        )}

        {error && <p className="mt-2 text-xs font-bold text-rose-500">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-full bg-slate-100 py-2.5 text-sm font-semibold text-slate-600">Huỷ</button>
          <button
            onClick={handleConvert}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-amber-500 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : "Xác nhận đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}

function WithdrawModal({ starPoints, userId, onClose, onDone }) {
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const numAmount = Number(amount) || 0;

  const handleSubmit = async () => {
    if (numAmount < 20000 || numAmount > starPoints) {
      setError("Số tiền rút phải từ 20.000đ và không vượt quá số dư.");
      return;
    }

    if (!bankName.trim() || !accountNumber.trim() || !accountHolder.trim()) {
      setError("Vui lòng điền đầy đủ thông tin ngân hàng.");
      return;
    }

    setSaving(true);
    setError("");

    const { error: insertError } = await supabase.from("star_withdrawals").insert({
      user_id: userId,
      amount: numAmount,
      bank_name: bankName.trim(),
      account_number: accountNumber.trim(),
      account_holder: accountHolder.trim(),
    });

    if (insertError) {
      setSaving(false);
      setError(insertError.message);
      return;
    }

    const { error: deductError } = await supabase
      .from("profiles")
      .update({ star_points: starPoints - numAmount })
      .eq("id", userId);

    setSaving(false);

    if (deductError) {
      setError(deductError.message);
      return;
    }

    setSuccess(true);
    onDone(starPoints - numAmount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900">Rút về ngân hàng</h3>
          <button onClick={onClose} className="text-slate-400"><X size={18} /></button>
        </div>

        {success ? (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-emerald-50 p-4">
            <Check size={17} className="text-emerald-500" />
            <p className="text-sm font-semibold text-emerald-700">
              Đã gửi yêu cầu, tiền sẽ về trong 1-3 ngày làm việc.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-1 text-xs text-slate-400">Số dư khả dụng: {formatVND(starPoints)}</p>

            <p className="mb-2 mt-4 text-xs font-bold text-slate-500">Số tiền rút (tối thiểu 20.000đ)</p>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="20000"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-sky-400"
            />

            <p className="mb-2 mt-3 text-xs font-bold text-slate-500">Ngân hàng</p>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="VD: Agribank, MoMo..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-sky-400"
            />

            <p className="mb-2 mt-3 text-xs font-bold text-slate-500">Số tài khoản</p>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-sky-400"
            />

            <p className="mb-2 mt-3 text-xs font-bold text-slate-500">Chủ tài khoản</p>
            <input
              type="text"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold uppercase outline-none focus:border-sky-400"
            />

            {error && <p className="mt-2 text-xs font-bold text-rose-500">{error}</p>}

            <div className="mt-5 flex gap-3">
              <button onClick={onClose} className="flex-1 rounded-full bg-slate-100 py-2.5 text-sm font-semibold text-slate-600">Huỷ</button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-sky-500 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : "Gửi yêu cầu"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
    }
