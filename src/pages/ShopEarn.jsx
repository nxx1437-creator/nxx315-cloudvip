import React, { useState } from "react";
import {
  Link2, Copy, Check, Loader2, Star, ArrowLeftRight,
  Landmark, X, Clock3, CheckCircle2, XCircle, ChevronRight, ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

const formatVND = (v) => Number(v || 0).toLocaleString("vi-VN") + "đ";
const formatCoins = (v) => Number(v || 0).toLocaleString("vi-VN");

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
  const canWithdraw = starPoints >= 20000;

  const handleGenerate = async () => {
    if (!productUrl.trim()) {
      setGenError("Vui lòng dán link sản phẩm.");
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
    <div className="min-h-screen bg-[#F7F9FC] pb-28 text-[#111827]">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[#E5E7EB] bg-[#F7F9FC]/95 px-4 py-3.5 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#6B7280] hover:bg-white"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-[15px] font-bold text-[#111827]">Mua hàng kiếm sao</h1>
          <p className="text-[11px] text-[#6B7280]">Kiếm Sao từ các đơn mua sắm</p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md space-y-4 px-4 py-4">

        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-[#6B7280]">
            <Star size={13} className="fill-amber-500 text-amber-500" />
            Sao của bạn
          </p>

          <p className="mt-1.5 text-[28px] font-bold leading-none text-[#111827]">
            {formatVND(starPoints)}
          </p>
          <p className="mt-1 text-xs text-[#6B7280]">Từ hoa hồng mua sắm</p>

          <button
            onClick={() => setShowConvert(true)}
            disabled={starPoints <= 0}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 text-sm font-bold text-white transition disabled:opacity-40"
          >
            <ArrowLeftRight size={15} />
            Đổi sang Xu
          </button>

          <button
            onClick={() => canWithdraw && setShowWithdraw(true)}
            disabled={!canWithdraw}
            className="mt-2 flex w-full items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-[#6B7280] disabled:opacity-50"
          >
            <Landmark size={12} />
            Rút ngân hàng · Tối thiểu 20.000đ
          </button>
        </section>

        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <p className="text-sm font-bold text-[#111827]">🛍️ Tạo link mua sắm</p>
          <p className="mt-1 text-xs text-[#6B7280]">
            Dán link sản phẩm để nhận Sao khi có đơn hàng.
          </p>

          <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F7F9FC] px-3.5 py-3">
            <Link2 size={15} className="shrink-0 text-[#9CA3AF]" />
            <input
              type="text"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="Dán link sản phẩm"
              className="w-full bg-transparent text-sm text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            />
          </div>

          <p className="mt-1.5 text-[11px] text-[#9CA3AF]">Hỗ trợ: TikTok Shop</p>

          {genError && <p className="mt-2 text-xs font-semibold text-rose-500">{genError}</p>}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {generating ? <Loader2 size={16} className="animate-spin" /> : "Tạo link"}
          </button>

          {resultLink && (
            <div className="mt-3 rounded-xl bg-[#F7F9FC] p-3">
              <div className="flex items-center gap-2">
                <p className="flex-1 truncate text-xs font-medium text-[#374151]">{resultLink}</p>
                <button
                  onClick={handleCopy}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#6B7280] shadow-sm"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
              <a
                href={resultLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-sky-500 py-2 text-xs font-bold text-white"
              >
                Mở lại link này
              </a>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <p className="text-sm font-bold text-[#111827]">💡 Cách nhận Sao</p>

          <div className="mt-3 space-y-3">
            <GuideStep number="1" title="Tạo link" desc="Dán link sản phẩm từ sàn được hỗ trợ." />
            <GuideStep number="2" title="Mua hàng" desc="Mở link và hoàn tất đơn hàng." />
            <GuideStep number="3" title="Chờ xác nhận" desc="Sao được cộng sau khi đơn được xác nhận." />
          </div>
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

function GuideStep({ number, title, desc }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[11px] font-bold text-sky-600">
        {number}
      </span>
      <div>
        <p className="text-xs font-bold text-[#111827]">{title}</p>
        <p className="mt-0.5 text-xs text-[#6B7280]">{desc}</p>
      </div>
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
    0: { label: "Chờ duyệt", icon: Clock3, cls: "bg-amber-50 text-amber-600" },
    1: { label: "Đã duyệt", icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-600" },
    2: { label: "Từ chối", icon: XCircle, cls: "bg-rose-50 text-rose-600" },
  };

  if (loading) return null;
  if (history.length === 0) return null;

  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <p className="mb-3 text-sm font-bold text-[#111827]">Lịch sử đơn hàng</p>

      <div className="space-y-3">
        {history.map((tx) => {
          const status = statusMap[tx.status] || statusMap[0];
          const StatusIcon = status.icon;

          return (
            <div key={tx.id} className="flex items-center justify-between border-b border-[#F3F4F6] pb-3 last:border-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-[#111827]">
                  {tx.product_name || tx.merchant || "Đơn hàng"}
                </p>
                <p className="mt-0.5 text-[11px] text-[#9CA3AF]">
                  {tx.transaction_time ? new Date(tx.transaction_time).toLocaleDateString("vi-VN") : "—"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {tx.credited && (
                  <span className="text-xs font-bold text-amber-600">+{formatVND(tx.star_points_awarded)}</span>
                )}
                <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${status.cls}`}>
                  <StatusIcon size={10} />
                  {status.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
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
      <div className="w-full max-w-sm rounded-2xl bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#111827]">Đổi sang Xu</h3>
          <button onClick={onClose} className="text-[#9CA3AF]"><X size={18} /></button>
        </div>

        <p className="mt-1 text-xs text-[#6B7280]">Số dư khả dụng: {formatVND(starPoints)}</p>

        <p className="mb-1.5 mt-4 text-xs font-semibold text-[#6B7280]">Số điểm muốn đổi</p>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="w-full rounded-xl border border-[#E5E7EB] bg-[#F7F9FC] px-3.5 py-3 text-sm font-semibold text-[#111827] outline-none focus:border-sky-400"
        />

        {numAmount > 0 && (
          <div className="mt-3 space-y-1.5 rounded-xl bg-[#F7F9FC] p-3 text-xs">
            <div className="flex justify-between text-[#6B7280]">
              <span>Phí sàn (5%)</span>
              <span className="font-semibold text-rose-500">-{formatVND(fee)}</span>
            </div>
            <div className="flex justify-between font-bold text-[#111827]">
              <span>Xu nhận được</span>
              <span>{formatCoins(coinsReceived)} Xu</span>
            </div>
          </div>
        )}

        {error && <p className="mt-2 text-xs font-semibold text-rose-500">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl bg-[#F3F4F6] py-2.5 text-sm font-semibold text-[#6B7280]">Huỷ</button>
          <button
            onClick={handleConvert}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-500 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : "Xác nhận"}
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
      <div className="w-full max-w-sm rounded-2xl bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#111827]">Rút về ngân hàng</h3>
          <button onClick={onClose} className="text-[#9CA3AF]"><X size={18} /></button>
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
            <p className="mt-1 text-xs text-[#6B7280]">Số dư khả dụng: {formatVND(starPoints)}</p>

            <p className="mb-1.5 mt-4 text-xs font-semibold text-[#6B7280]">Số tiền rút (tối thiểu 20.000đ)</p>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="20000"
              className="w-full rounded-xl border border-[#E5E7EB] bg-[#F7F9FC] px-3.5 py-3 text-sm font-semibold text-[#111827] outline-none focus:border-sky-400"
            />

            <p className="mb-1.5 mt-3 text-xs font-semibold text-[#6B7280]">Ngân hàng</p>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="VD: Agribank, MoMo..."
              className="w-full rounded-xl border border-[#E5E7EB] bg-[#F7F9FC] px-3.5 py-3 text-sm font-semibold text-[#111827] outline-none focus:border-sky-400"
            />

            <p className="mb-1.5 mt-3 text-xs font-semibold text-[#6B7280]">Số tài khoản</p>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full rounded-xl border border-[#E5E7EB] bg-[#F7F9FC] px-3.5 py-3 text-sm font-semibold text-[#111827] outline-none focus:border-sky-400"
            />

            <p className="mb-1.5 mt-3 text-xs font-semibold text-[#6B7280]">Chủ tài khoản</p>
            <input
              type="text"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-[#E5E7EB] bg-[#F7F9FC] px-3.5 py-3 text-sm font-semibold uppercase text-[#111827] outline-none focus:border-sky-400"
            />

            {error && <p className="mt-2 text-xs font-semibold text-rose-500">{error}</p>}

            <div className="mt-5 flex gap-3">
              <button onClick={onClose} className="flex-1 rounded-xl bg-[#F3F4F6] py-2.5 text-sm font-semibold text-[#6B7280]">Huỷ</button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-500 py-2.5 text-sm font-bold text-white disabled:opacity-60"
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
import Tooltip from "../components/Tooltip.jsx";

// ...
<p className="flex items-center gap-1.5 text-xs font-semibold text-[#6B7280]">
  <Star size={13} className="fill-amber-500 text-amber-500" />
  Sao của bạn
  <Tooltip text="Điểm sao được cộng từ hoa hồng thực tế khi bạn mua hàng qua link liên kết." />
</p>
