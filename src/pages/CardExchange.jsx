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

// dot: màu chấm vuông nhỏ. Chỉ "chờ" dùng màu hổ phách (màu cảnh báo duy nhất)
const STATUS = {
  pending: { label: "Chờ gửi thẻ", dot: "bg-[#f0a000]" },
  processing: { label: "Đang xử lý", dot: "bg-[#f0a000]" },
  needs_review: { label: "Đang kiểm tra", dot: "bg-[#b2b2b2]" },
  completed: { label: "Đã gửi thẻ", dot: "bg-black" },
  failed: { label: "Từ chối · đã hoàn xu", dot: "bg-[#b2b2b2]" },
};

function HistoryItem({ order }) {
  const st = STATUS[order.status] || STATUS.pending;
  return (
    <div className="border-t border-[#e5e5e5] py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-black text-[15px] font-light text-black">
          {telcoName(order.telco).charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[19px] font-light leading-[1.15] text-black">
            {telcoName(order.telco)} {fmt(order.denomination)}đ
          </p>
          <p className="mt-1 text-[13px] font-extralight text-black">
            {new Date(order.created_at).toLocaleString("vi-VN")} · {fmt(order.coins_charged)} xu
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 text-[13px] font-light text-black">
          <span className={`h-2 w-2 ${st.dot}`} />
          {st.label}
        </span>
      </div>

      {order.status === "pending" && (
        <p className="mt-2 text-[13px] font-extralight leading-[1.5] text-black">
          Admin sẽ gửi thẻ qua <b className="font-normal">{order.contact}</b> trong vòng 24 giờ.
        </p>
      )}
      {order.status === "completed" && (
        <p className="mt-2 text-[13px] font-extralight leading-[1.5] text-black">
          Thẻ đã được gửi qua {order.contact}. Kiểm tra tin nhắn nhé!
        </p>
      )}
      {order.status === "failed" && order.error_message && (
        <p className="mt-2 text-[13px] font-extralight leading-[1.5] text-black">Lý do: {order.error_message}</p>
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
      <div className="min-h-screen bg-white pb-24">
        <TopHeader />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-[#b2b2b2]" strokeWidth={1.25} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white pb-24 font-['Be_Vietnam_Pro',sans-serif] font-light text-black">
        <TopHeader />
        <div className="mx-auto max-w-lg px-4 py-16">
          <h2 className="text-[26px] font-light leading-[1.15]">Vui lòng đăng nhập</h2>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 bg-black px-6 py-3 text-[13px] font-light uppercase tracking-wide text-white"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-28 font-['Be_Vietnam_Pro',sans-serif] font-light text-black">
      <TopHeader />

      <main className="mx-auto max-w-2xl px-4 py-4">
        <div className="flex items-center gap-3 border-b border-[#e5e5e5] pb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center border border-black bg-white"
          >
            <ArrowLeft size={18} strokeWidth={1.25} />
          </button>
          <h1 className="flex-1 text-[24px] font-light leading-[1.15]">Đổi xu thành thẻ cào</h1>
        </div>

        {/* Số dư — khối tối như tủ trưng bày */}
        <div className="mt-6 bg-[#0f0e12] p-5 text-white">
          <div className="flex items-center gap-2 text-[#b2b2b2]">
            <Coins size={16} strokeWidth={1.25} />
            <p className="text-[13px] font-extralight">Số dư của bạn</p>
          </div>
          <p className="mt-3 text-[40px] font-light leading-[1.11]">{fmt(balance)} xu</p>
        </div>

        <p className="mt-6 border-y border-[#e5e5e5] py-3 text-[13px] font-extralight leading-[1.5]">
          Chọn mệnh giá và để lại Zalo hoặc Discord. Admin sẽ gửi thẻ cho bạn trong vòng 24 giờ.
        </p>

        {products.length === 0 ? (
          <div className="mt-8 border border-[#e5e5e5] p-8">
            <CreditCard size={28} strokeWidth={1} />
            <p className="mt-4 text-[19px] font-light leading-[1.15]">Sắp ra mắt</p>
            <p className="mt-2 text-[13px] font-extralight leading-[1.5]">
              Tính năng đổi xu thành thẻ cào đang được chuẩn bị. Quay lại sau nhé!
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            <div className="flex gap-2 overflow-x-auto">
              {telcos.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTelco(t)}
                  className={`shrink-0 border px-4 py-2 text-[13px] font-light transition ${
                    activeTelco === t
                      ? "border-black bg-black text-white"
                      : "border-[#e5e5e5] bg-white text-black"
                  }`}
                >
                  {telcoName(t)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-px border border-[#e5e5e5] bg-[#e5e5e5]">
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
                    className={`bg-white p-4 text-left transition ${
                      enough ? "hover:bg-[#f6f8f7] active:bg-[#f6f8f7]" : "text-[#b2b2b2]"
                    }`}
                  >
                    <p className="text-[24px] font-light leading-[1.15]">{fmt(p.denomination)}đ</p>
                    <p className="mt-2 flex items-center gap-1 text-[13px] font-light">
                      <Coins size={13} strokeWidth={1.25} /> {fmt(p.coin_price)} xu
                    </p>
                    {!enough && (
                      <p className="mt-1 text-[13px] font-extralight">Thiếu {fmt(p.coin_price - balance)} xu</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
                <div className="mt-12">
          <h2 className="mb-3 text-[19px] font-light leading-[1.15]">Lịch sử đổi thẻ</h2>
          {orders.length === 0 ? (
            <div className="border-t border-[#e5e5e5] py-6 text-[13px] font-extralight">
              Bạn chưa đổi thẻ nào
            </div>
          ) : (
            orders.map((o) => <HistoryItem key={o.id} order={o} />)
          )}
        </div>
      </main>

      {/* Xác nhận */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="w-full max-w-md border-t border-black bg-white p-5 sm:border">
            <div className="flex items-center justify-between">
              <h3 className="text-[24px] font-light leading-[1.15]">Xác nhận đổi thẻ</h3>
              <button
                type="button"
                onClick={() => !submitting && setSelected(null)}
                className="flex h-8 w-8 items-center justify-center border border-[#e5e5e5]"
              >
                <X size={16} strokeWidth={1.25} />
              </button>
            </div>

            <div className="mt-5 border border-[#e5e5e5] p-4">
              <p className="text-[13px] font-extralight">Thẻ</p>
              <p className="text-[24px] font-light leading-[1.15]">
                {telcoName(selected.telco)} {fmt(selected.denomination)}đ
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-[#e5e5e5] pt-3 text-[13px]">
                <span className="font-extralight">Số xu</span>
                <span className="font-light">-{fmt(selected.coin_price)} xu</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[13px]">
                <span className="font-extralight">Số dư sau khi đổi</span>
                <span className="font-light">{fmt(balance - selected.coin_price)} xu</span>
              </div>
            </div>

            <label className="mt-5 block text-[13px] font-light">
              Zalo hoặc Discord nhận thẻ
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="VD: 09xxxxxxxx hoặc ten_discord"
                maxLength={100}
                className="mt-2 w-full rounded-none border border-[#e5e5e5] bg-white px-3.5 py-3 text-[14px] font-light outline-none placeholder:text-[#b2b2b2] focus:border-black"
              />
            </label>
            <p className="mt-2 text-[13px] font-extralight leading-[1.5]">
              Xu bị trừ ngay khi gửi yêu cầu. Nếu admin từ chối, xu sẽ được hoàn lại. Nhập đúng thông tin để nhận thẻ nhanh.
            </p>
            {error && (
              <p className="mt-3 border border-[#f0a000] px-3 py-2 text-[13px] font-light">{error}</p>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="mt-5 flex w-full items-center justify-center gap-2 bg-black py-3.5 text-[13px] font-light uppercase tracking-wide text-white disabled:opacity-60"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
          </div>
        </div>
      )}

      {/* Đã gửi yêu cầu */}
      {result && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="w-full max-w-md border-t border-black bg-white p-5 sm:border">
            <div className="flex h-12 w-12 items-center justify-center border border-black">
              <Check size={24} strokeWidth={1.25} />
            </div>
            <h3 className="mt-4 text-[24px] font-light leading-[1.15]">Đã gửi yêu cầu!</h3>
            <p className="mt-1 text-[13px] font-extralight">
              {telcoName(result.telco)} {fmt(result.denomination)}đ
            </p>
            <div className="mt-5 flex items-start gap-2 border border-[#e5e5e5] p-3 text-[13px] font-extralight leading-[1.5]">
              <Clock size={16} className="mt-0.5 shrink-0" strokeWidth={1.25} />
              <span>
                Admin sẽ gửi thẻ qua <b className="font-normal">{result.contact}</b> trong vòng 24 giờ. Bạn có thể theo dõi ở Lịch sử đổi thẻ.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="mt-5 w-full bg-black py-3.5 text-[13px] font-light uppercase tracking-wide text-white"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {!selected && !result && <BottomNav />}
    </div>
  );
}            
            
