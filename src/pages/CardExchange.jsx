// src/pages/CardExchange.jsx — đổi xu thành thẻ cào (route: /cards)
// Luồng thủ công: người dùng gửi yêu cầu + Zalo/Discord, xu bị trừ ngay, admin gửi thẻ rồi bấm hoàn thành.
import React, { useCallback, useEffect, useMemo, useState } from "react";
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

// Lưới chấm xám (CSS tĩnh, không tốn hiệu năng)
function Dots() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: "radial-gradient(#d6d4cc 1.1px, transparent 1.3px)",
        backgroundSize: "9px 9px",
      }}
    />
  );
}

// Lưới chấm cam, mờ dần từ phải sang trái
function OrangeDots() {
  const mask = "linear-gradient(to left, #000 0%, transparent 75%)";
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: "radial-gradient(#ff5a00 1.2px, transparent 1.4px)",
        backgroundSize: "9px 9px",
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    />
  );
}

function HistoryItem({ order }) {
  const st = STATUS[order.status] || STATUS.pending;
  return (
    <div className="border-t border-[#e6e4dd] py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold">
            {telcoName(order.telco)} {fmt(order.denomination)}đ
          </p>
          <p className="mt-1 text-[12px] text-[#8a8880]">
            {new Date(order.created_at).toLocaleString("vi-VN")} · {fmt(order.coins_charged)} xu
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 text-[12px]">
          <span className={`h-2 w-2 rounded-full ${st.dot}`} />
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

  const loadAll = useCallback(async () => {
    try {
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      if (!u) return;
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
      setBalance(prof?.coins || 0);
      setProducts(prods || []);
      setOrders(ords || []);
    } catch (err) {
      console.error("Load cards error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const telcos = useMemo(() => [...new Set(products.map((p) => p.telco))], [products]);
  const activeTelco = telcos.includes(telco) ? telco : telcos[0] || "";
  const list = products.filter((p) => p.telco === activeTelco);

  const submit = async () => {
    if (!selected || submitting) return;
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
      setSubmitting(false);
    }
  };
    if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f5f1] pb-24">
        <TopHeader />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-[#8a8880]" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f6f5f1] pb-24 font-['JetBrains_Mono',ui-monospace,monospace] text-[#171612]">
        <TopHeader />
        <div className="mx-auto max-w-lg px-5 py-16">
          <h2 className="text-[26px] font-bold lowercase leading-[1.1]">
            vui lòng đăng nhập<span className="text-[#ff5a00]">.</span>
          </h2>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 rounded-full bg-[#ff5a00] px-7 py-3.5 text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(255,90,0,0.3)]"
          >
            đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f5f1] pb-28 font-['JetBrains_Mono',ui-monospace,monospace] text-[#171612]">
      <TopHeader />

      <main className="mx-auto max-w-2xl px-5 py-5">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fbfaf7] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10.5px] uppercase tracking-[0.2em] text-[#8a8880]">ví xu</p>
            <h1 className="mt-1 text-[24px] font-bold lowercase leading-[1.1]">
              đổi xu thành thẻ cào<span className="text-[#ff5a00]">.</span>
            </h1>
          </div>
        </div>

        {/* Số dư */}
        <div className="relative mt-6 overflow-hidden rounded-3xl bg-[#fbfaf7] p-5">
          <Dots />
          <OrangeDots />
          <div className="relative">
            <p className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.2em] text-[#8a8880]">
              <Coins size={13} /> số dư của bạn
            </p>
            <p className="mt-3 text-[36px] font-bold leading-none">
              {fmt(balance)}
              <span className="text-[#ff5a00]"> xu</span>
            </p>
          </div>
        </div>

        <p className="mt-4 text-[12px] leading-5 text-[#8a8880]">
          Chọn mệnh giá và để lại Zalo hoặc Discord. Admin sẽ gửi thẻ cho bạn trong vòng 24 giờ.
        </p>

        {products.length === 0 ? (
          <div className="mt-6 rounded-3xl bg-[#fbfaf7] p-7">
            <CreditCard size={26} />
            <p className="mt-4 text-[20px] font-bold lowercase leading-[1.1]">
              sắp ra mắt<span className="text-[#ff5a00]">.</span>
            </p>
            <p className="mt-2 text-[12px] leading-5 text-[#8a8880]">
              Tính năng đổi xu thành thẻ cào đang được chuẩn bị. Quay lại sau nhé!
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="flex gap-2 overflow-x-auto">
              {telcos.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTelco(t)}
                  className={`shrink-0 rounded-full px-5 py-2.5 text-[13px] font-bold ${
                    activeTelco === t
                      ? "bg-[#171612] text-white"
                      : "bg-[#fbfaf7] text-[#171612] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                  }`}
                >
                  {telcoName(t)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                    className={`rounded-3xl p-4 text-left active:scale-[0.98] ${
                      enough ? "bg-[#fbfaf7]" : "bg-[#efede7] opacity-60"
                    }`}
                  >
                    <p className="text-[22px] font-bold leading-none">
                      {fmt(p.denomination)}
                      <span className="text-[#ff5a00]">đ</span>
                    </p>
                    <p className="mt-3 flex items-center gap-1 text-[12px] text-[#8a8880]">
                      <Coins size={13} /> {fmt(p.coin_price)} xu
                    </p>
                    {!enough && (
                      <p className="mt-1 text-[11px] text-[#8a8880]">thiếu {fmt(p.coin_price - balance)} xu</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
                 <div className="mt-10">
          <p className="mb-1 text-[12px] text-[#8a8880]">lịch sử đổi thẻ</p>
          {orders.length === 0 ? (
            <div className="border-t border-[#e6e4dd] py-6 text-[12px] text-[#8a8880]">
              bạn chưa đổi thẻ nào
            </div>
          ) : (
            orders.map((o) => <HistoryItem key={o.id} order={o} />)
          )}
        </div>
      </main>

      {/* Xác nhận */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center">
          <div className="w-full max-w-md rounded-t-[36px] bg-[#fbfaf7] p-6 pb-8 sm:rounded-[36px]">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-[28px] font-bold lowercase leading-[1.1]">
                xác nhận đổi thẻ<span className="text-[#ff5a00]">.</span>
              </h3>
              <button
                type="button"
                onClick={() => !submitting && setSelected(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#efede7]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-lg bg-[#d9d6cc] px-2.5 py-1 text-[11px] font-bold uppercase">
                {telcoName(selected.telco)}
              </span>
              <span className="text-[12px] text-[#8a8880]">thẻ cào điện thoại</span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 border-b border-[#e6e4dd] pb-5">
              <div>
                <p className="text-[11px] text-[#8a8880]">mệnh giá</p>
                <p className="mt-1 text-[15px] font-bold">{fmt(selected.denomination)}đ</p>
              </div>
              <div>
                <p className="text-[11px] text-[#8a8880]">trừ</p>
                <p className="mt-1 text-[15px] font-bold text-[#ff5a00]">-{fmt(selected.coin_price)}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#8a8880]">còn lại</p>
                <p className="mt-1 text-[15px] font-bold">{fmt(balance - selected.coin_price)}</p>
              </div>
            </div>

            <label className="mt-5 block text-[12px] text-[#8a8880]">
              zalo hoặc discord nhận thẻ
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="VD: 09xxxxxxxx hoặc ten_discord"
                maxLength={100}
                className="mt-2 w-full rounded-full border border-[#e6e4dd] bg-white px-5 py-3.5 text-[14px] text-[#171612] outline-none placeholder:text-[#b5b3ab] focus:border-[#ff5a00]"
              />
            </label>
            <p className="mt-3 text-[11.5px] leading-5 text-[#8a8880]">
              Xu bị trừ ngay khi gửi yêu cầu. Nếu admin từ chối, xu sẽ được hoàn lại. Nhập đúng thông tin để nhận thẻ nhanh.
            </p>
            {error && (
              <p className="mt-3 rounded-2xl bg-[#fff0e6] px-4 py-3 text-[12.5px] font-bold text-[#d94a00]">{error}</p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => !submitting && setSelected(null)}
                className="flex-1 rounded-full bg-[#171612] py-3.5 text-[14px] font-bold text-white"
              >
                hủy
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="flex flex-[1.6] items-center justify-center gap-2 rounded-full bg-[#ff5a00] py-3.5 text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(255,90,0,0.3)] disabled:opacity-60"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {submitting ? "đang gửi..." : "gửi yêu cầu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Đã gửi yêu cầu */}
      {result && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center">
          <div className="w-full max-w-md rounded-t-[36px] bg-[#fbfaf7] p-6 pb-8 sm:rounded-[36px]">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff5a00] text-white">
              <Check size={24} strokeWidth={3} />
            </span>
            <h3 className="mt-4 text-[28px] font-bold lowercase leading-[1.1]">
              đã gửi yêu cầu<span className="text-[#ff5a00]">.</span>
            </h3>
            <p className="mt-2 text-[13px] text-[#8a8880]">
              {telcoName(result.telco)} {fmt(result.denomination)}đ
            </p>
            <div className="mt-5 flex items-start gap-2 rounded-2xl bg-[#f6f5f1] p-4 text-[12px] leading-5">
              <Clock size={16} className="mt-0.5 shrink-0" />
              <span>
                Admin sẽ gửi thẻ qua <b>{result.contact}</b> trong vòng 24 giờ. Bạn có thể theo dõi ở Lịch sử đổi thẻ.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="mt-5 w-full rounded-full bg-[#171612] py-3.5 text-[14px] font-bold text-white"
            >
              đóng
            </button>
          </div>
        </div>
      )}

      {!selected && !result && <BottomNav />}
    </div>
  );
}             
