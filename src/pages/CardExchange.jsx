// src/pages/CardExchange.jsx — đổi xu thành thẻ cào (route: /cards)
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Clock, Coins, CreditCard, Loader2, X } from "lucide-react";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { supabase } from "../lib/supabaseClient.js";

const TELCO_NAMES = { viettel: "Viettel", mobifone: "Mobifone", vinaphone: "Vinaphone" };
const CONTACT_KEY = "card_contact";

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");
const telcoName = (t) => TELCO_NAMES[t] || t;

const STATUS = {
  pending: { label: "chờ gửi thẻ", dot: "bg-[#ff5a00]" },
  processing: { label: "đang xử lý", dot: "bg-[#ff5a00]" },
  needs_review: { label: "đang kiểm tra", dot: "bg-[#8a8880]" },
  completed: { label: "đã gửi thẻ", dot: "bg-[#171612]" },
  failed: { label: "từ chối · đã hoàn xu", dot: "bg-[#8a8880]" },
};

function safeDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("vi-VN");
}

// Lưới chấm bao phủ toàn màn hình (giống ảnh mẫu 3)
function FullScreenDots() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundImage: "radial-gradient(#d1d0c9 1.2px, transparent 1.2px)",
        backgroundSize: "12px 12px",
        opacity: 0.5,
      }}
    />
  );
}

function HistoryItem({ order }) {
  const st = STATUS[order.status] || STATUS.pending;
  return (
    <div className="border-t border-[#e6e4dd] py-4 first:border-t-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold tracking-tight">
            {telcoName(order.telco)} {fmt(order.denomination)}đ
          </p>
          <p className="mt-1 text-[11px] tracking-wide text-[#8a8880]">
            {safeDate(order.created_at)} · {fmt(order.coins_charged)} xu
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-medium tracking-wide">
          <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
          {st.label}
        </span>
      </div>

      {order.status === "pending" && (
        <p className="mt-2 text-[12px] leading-5 text-[#8a8880]">
          Admin sẽ gửi thẻ qua <b className="text-[#171612]">{order.contact}</b> trong vòng 24 giờ.
        </p>
      )}
      {order.status === "completed" && (
        <p className="mt-2 text-[12px] leading-5 text-[#8a8880]">
          Thẻ đã được gửi qua {order.contact}. Kiểm tra tin nhắn nhé!
        </p>
      )}
      {order.status === "failed" && order.error_message && (
        <p className="mt-2 text-[12px] leading-5 text-[#8a8880]">Lý do: {order.error_message}</p>
      )}
    </div>
  );
}

export default function CardExchange() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const aliveRef = useRef(true);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [telco, setTelco] = useState(params.get("telco") || "");
  const [selected, setSelected] = useState(null);
  const [contact, setContact] = useState(() => {
    try {
      return localStorage.getItem(CONTACT_KEY) || "";
    } catch {
      return "";
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  const loadAll = useCallback(async () => {
    try {
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      if (!aliveRef.current) return;
      if (!u) {
        setLoading(false);
        return;
      }
      setUser(u);

      const [{ data: prof }, { data: prods }, { data: ords }] = await Promise.all([
        supabase.from("profiles").select("coins").eq("id", u.id).single(),
        supabase
          .from("card_products")
          .select("id, telco, denomination, coin_price, sort_order")
          .eq("active", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("card_orders")
          .select("id, telco, denomination, coins_charged, status, contact, error_message, created_at")
          .eq("user_id", u.id)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      if (!aliveRef.current) return;
      setBalance(prof?.coins || 0);
      setProducts(prods || []);
      setOrders(ords || []);
    } catch (err) {
      console.error("Load cards error:", err);
    } finally {
      if (aliveRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const telcos = useMemo(() => [...new Set(products.map((p) => p.telco))], [products]);
  const activeTelco = useMemo(
    () => (telcos.includes(telco) ? telco : telcos[0] || ""),
    [telcos, telco]
  );
  const list = useMemo(
    () => products.filter((p) => p.telco === activeTelco),
    [products, activeTelco]
  );

  const handleTelcoChange = (t) => {
    setTelco(t);
    setSelected(null);
    setError("");
  };

  const closeConfirm = () => {
    if (submitting) return;
    setSelected(null);
    setError("");
  };

  const submit = async () => {
    if (!selected || submitting) return;
    if (balance < selected.coin_price) {
      setError("Số dư không đủ, vui lòng nạp thêm xu.");
      return;
    }
    const c = contact.trim();
    if (c.length < 3) {
      setError("Vui lòng nhập Zalo hoặc Discord để nhận thẻ.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const { data, error: rpcErr } = await supabase.rpc("request_card_exchange", {
        p_product_id: selected.id,
        p_contact: c,
      });
      if (rpcErr) throw new Error("Không thể gửi yêu cầu, vui lòng thử lại.");
      if (data?.error) {
        setError(data.error);
        return;
      }
      try {
        localStorage.setItem(CONTACT_KEY, c);
      } catch {
        /* bỏ qua */
      }
      if (typeof data?.new_balance === "number") setBalance(data.new_balance);
      setResult({ telco: selected.telco, denomination: selected.denomination, contact: c });
      setSelected(null);
      await loadAll();
    } catch (err) {
      setError(err?.message || "Không thể kết nối, vui lòng thử lại.");
    } finally {
      if (aliveRef.current) setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f3ee] pb-24">
        <TopHeader />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-[#8a8880]" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f4f3ee] pb-24 font-['JetBrains_Mono',ui-monospace,monospace] text-[#171612]">
        <TopHeader />
        <div className="mx-auto max-w-lg px-5 py-16">
          <h2 className="text-[28px] font-bold lowercase leading-[1.05] tracking-tight">
            vui lòng đăng nhập<span className="text-[#ff5a00]">.</span>
          </h2>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 rounded-full bg-[#171612] px-7 py-3.5 text-[13px] font-bold text-white transition-transform active:scale-95"
          >
            đăng nhập
          </button>
        </div>
      </div>
    );
  }

  const modalOpen = Boolean(selected) || Boolean(result);

  return (
    <div className="relative min-h-screen bg-[#f4f3ee] pb-28 font-['JetBrains_Mono',ui-monospace,monospace] text-[#171612] overflow-hidden">
      <TopHeader />

      {/* Lưới chấm toàn màn hình (như ảnh 3) */}
      <FullScreenDots />

      <main className="relative z-10 mx-auto max-w-xl px-5 py-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm transition-transform active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1 pt-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8a8880]">ví xu</p>
            <h1 className="mt-1.5 text-[28px] font-bold lowercase leading-[1.05] tracking-tight">
              đổi xu thành thẻ cào<span className="text-[#ff5a00]">.</span>
            </h1>
          </div>
        </div>

        {/* Số dư */}
        <div className="relative mt-8 overflow-hidden rounded-[28px] bg-white p-6 shadow-sm border border-[#e8e6df]">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a8880]">
            <Coins size={12} /> số dư khả dụng
          </p>
          <p className="mt-3 text-[42px] font-bold leading-none tracking-tighter">
            {fmt(balance)}
            <span className="text-[#ff5a00] text-[24px] ml-1.5">xu</span>
          </p>
        </div>

        <p className="mt-5 px-2 text-[11.5px] leading-relaxed text-[#8a8880] font-medium">
          Chọn mệnh giá và để lại Zalo hoặc Discord. Hệ thống sẽ gửi thẻ cho bạn trong vòng 24 giờ.
        </p>

        {/* Sản phẩm */}
        {products.length === 0 ? (
          <div className="mt-6 rounded-[28px] bg-white p-8 shadow-sm border border-[#e8e6df]">
            <CreditCard size={28} className="text-[#8a8880]" />
            <p className="mt-5 text-[22px] font-bold lowercase leading-[1.05] tracking-tight">
              sắp ra mắt<span className="text-[#ff5a00]">.</span>
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-[#8a8880]">
              Tính năng đổi xu thành thẻ cào đang được chuẩn bị.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {/* Nút chuyển Telco */}
            <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {telcos.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTelcoChange(t)}
                  className={`shrink-0 rounded-full px-5 py-2.5 text-[12px] font-bold tracking-wide transition-colors ${
                    activeTelco === t
                      ? "bg-[#171612] text-white shadow-md"
                      : "bg-white text-[#171612] border border-[#e8e6df] hover:bg-[#f8f7f3]"
                  }`}
                >
                  {telcoName(t)}
                </button>
              ))}
            </div>

            {/* Danh sách thẻ */}
            <div className="grid grid-cols-2 gap-3.5">
              {list.map((p) => {
                const enough = balance >= p.coin_price;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={!enough}
                    onClick={() => {
                      setError("");
                      setSelected(p);
                    }}
                    className={`group relative flex flex-col items-start overflow-hidden rounded-[24px] p-5 text-left transition-all ${
                      enough
                        ? "bg-white border border-[#e8e6df] shadow-sm hover:border-[#ff5a00]/30 active:scale-[0.98]"
                        : "bg-[#ebe9e3] opacity-60"
                    }`}
                  >
                    <p className="text-[24px] font-bold tracking-tighter leading-none">
                      {fmt(p.denomination)}
                      <span className="text-[#ff5a00] text-[16px] ml-0.5">đ</span>
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-[#8a8880]">
                      <Coins size={12} />
                      {fmt(p.coin_price)} xu
                    </div>
                    {!enough && (
                      <p className="mt-1 text-[10px] font-bold text-[#ff5a00]">
                        thiếu {fmt(p.coin_price - balance)} xu
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Lịch sử */}
        <div className="mt-10">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a8880]">lịch sử đổi thẻ</p>
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#d1d0c9] py-8 text-center text-[12px] text-[#8a8880]">
              bạn chưa đổi thẻ nào
            </div>
          ) : (
            <div className="rounded-[24px] bg-white border border-[#e8e6df] px-5 py-2">
              {orders.map((o) => (
                <HistoryItem key={o.id} order={o} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL XÁC NHẬN - Nổi, trong suốt, có animation */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeConfirm();
          }}
        >
          <div
            className="w-full max-w-[400px] rounded-[36px] bg-[#f6f5f1]/95 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/50 overflow-hidden flex flex-col animate-modal-pop"
            role="dialog"
            aria-modal="true"
          >
            {/* Header Modal */}
            <div className="px-6 pt-7 pb-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[26px] font-bold lowercase leading-[1.1] tracking-tight">
                    xác nhận đổi thẻ<span className="text-[#ff5a00]">.</span>
                  </h3>
                  <div className="mt-3 flex items-center gap-2.5">
                    <span className="rounded-md bg-[#e8e6df]/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#171612]">
                      {telcoName(selected.telco)}
                    </span>
                    <span className="text-[11px] font-medium text-[#8a8880] tracking-wide">
                      thẻ cào điện thoại
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeConfirm}
                  disabled={submitting}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8e6df]/80 text-[#171612] transition-transform active:scale-95 disabled:opacity-50"
                  aria-label="Đóng"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body Modal */}
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between border-y border-[#e8e6df]/80 py-4 mb-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#8a8880]">mệnh giá</p>
                  <p className="mt-1.5 text-[16px] font-bold tracking-tight">{fmt(selected.denomination)}đ</p>
                </div>
                <div className="w-px h-8 bg-[#e8e6df]/80" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#8a8880]">khấu trừ</p>
                  <p className="mt-1.5 text-[16px] font-bold text-[#ff5a00] tracking-tight">
                    -{fmt(selected.coin_price)} xu
                  </p>
                </div>
                <div className="w-px h-8 bg-[#e8e6df]/80" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#8a8880]">còn lại</p>
                  <p className="mt-1.5 text-[16px] font-bold tracking-tight">
                    {fmt(Math.max(0, balance - selected.coin_price))} xu
                  </p>
                </div>
              </div>

              <label className="block">
                <span className="text-[11px] font-bold text-[#8a8880] uppercase tracking-wider">
                  Zalo / Discord nhận thẻ
                </span>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="VD: 09xxxxxxxx hoặc ten_discord"
                  maxLength={100}
                  className="mt-2.5 w-full rounded-full border border-[#e8e6df] bg-white/60 px-5 py-3.5 text-[14px] font-medium text-[#171612] outline-none placeholder:text-[#c0beb6] focus:border-[#171612] focus:bg-white focus:ring-1 focus:ring-[#171612] transition-all"
                />
              </label>

              <p className="mt-4 text-[11px] leading-relaxed text-[#8a8880]">
                Xu bị trừ ngay khi gửi yêu cầu. Nếu Admin từ chối, xu sẽ được hoàn lại tự động. Vui
                lòng kiểm tra kỹ thông tin.
              </p>

              {error && (
                <div className="mt-3 rounded-2xl bg-[#fff0e6] px-4 py-3 text-[12px] font-bold text-[#d94a00]">
                  {error}
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="px-6 pb-7 pt-2 flex gap-3">
              <button
                type="button"
                onClick={closeConfirm}
                disabled={submitting}
                className="flex-1 rounded-full bg-[#171612] py-3.5 text-[13px] font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50"
              >
                hủy
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="flex flex-[1.6] items-center justify-center gap-2 rounded-full bg-[#ff5a00] py-3.5 text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(255,90,0,0.25)] transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {submitting ? "đang gửi..." : "gửi yêu cầu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÀNH CÔNG */}
      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-[400px] rounded-[36px] bg-[#f6f5f1]/95 backdrop-blur-2xl p-6 pb-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/50 animate-modal-pop flex flex-col items-start">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ff5a00] text-white shadow-lg">
              <Check size={28} strokeWidth={3} />
            </span>
            <h3 className="mt-5 text-[28px] font-bold lowercase leading-[1.05] tracking-tight">
              đã gửi yêu cầu<span className="text-[#ff5a00]">.</span>
            </h3>
            <p className="mt-2 text-[14px] font-bold">
              {telcoName(result.telco)} {fmt(result.denomination)}đ
            </p>

            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-white/80 border border-[#e8e6df] p-4 text-[12px] leading-relaxed w-full">
              <Clock size={18} className="mt-0.5 shrink-0 text-[#ff5a00]" />
              <span>
                Admin sẽ gửi thẻ qua <b>{result.contact}</b> trong vòng 24 giờ. Bạn có thể theo dõi
                trạng thái ở phần Lịch sử.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setResult(null)}
              className="mt-6 w-full rounded-full bg-[#171612] py-3.5 text-[13px] font-bold text-white transition-transform active:scale-[0.98]"
            >
              đóng
            </button>
          </div>
        </div>
      )}

      {!modalOpen && <BottomNav />}
    </div>
  );
}
