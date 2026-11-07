// src/pages/CardExchange.jsx — đổi xu thành thẻ cào (route: /cards)
// Luồng thủ công: người dùng gửi yêu cầu + Zalo/Discord, xu bị trừ ngay, admin gửi thẻ rồi bấm hoàn thành.
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Clock, Coins, CreditCard, Loader2, X } from "lucide-react";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { supabase } from "../lib/supabaseClient.js";

const TELCO_NAMES = { viettel: "Viettel", mobifone: "Mobifone", vinaphone: "Vinaphone" };
const TELCO_COLORS = { viettel: "#E2231A", mobifone: "#0067B1", vinaphone: "#00A1E4" };
const CONTACT_KEY = "card_contact";

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");
const telcoName = (t) => TELCO_NAMES[t] || t;

const STATUS = {
  pending: { label: "Chờ gửi thẻ", cls: "bg-amber-50 text-amber-700" },
  processing: { label: "Đang xử lý", cls: "bg-amber-50 text-amber-700" },
  needs_review: { label: "Đang kiểm tra", cls: "bg-sky-50 text-sky-700" },
  completed: { label: "Đã gửi thẻ", cls: "bg-emerald-50 text-emerald-700" },
  failed: { label: "Từ chối · đã hoàn xu", cls: "bg-slate-100 text-slate-500" },
};

function HistoryItem({ order }) {
  const st = STATUS[order.status] || STATUS.pending;
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[15px] font-black text-white"
          style={{ backgroundColor: TELCO_COLORS[order.telco] || "#10B981" }}
        >
          {telcoName(order.telco).charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold text-slate-900">
            {telcoName(order.telco)} {fmt(order.denomination)}đ
          </p>
          <p className="text-[11.5px] text-slate-400">
            {new Date(order.created_at).toLocaleString("vi-VN")} · {fmt(order.coins_charged)} xu
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-bold ${st.cls}`}>{st.label}</span>
      </div>

      {order.status === "pending" && (
        <p className="mt-2 text-[12px] leading-5 text-slate-500">
          Admin sẽ gửi thẻ qua <b className="text-slate-700">{order.contact}</b> trong vòng 24 giờ.
        </p>
      )}
      {order.status === "completed" && (
        <p className="mt-2 text-[12px] text-emerald-700">Thẻ đã được gửi qua {order.contact}. Kiểm tra tin nhắn nhé!</p>
      )}
      {order.status === "failed" && order.error_message && (
        <p className="mt-2 text-[12px] text-slate-500">Lý do: {order.error_message}</p>
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
      <div className="min-h-screen bg-slate-50 pb-24">
        <TopHeader />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24">
        <TopHeader />
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <h2 className="text-lg font-bold">Vui lòng đăng nhập</h2>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-['Be_Vietnam_Pro',sans-serif] text-slate-900">
      <TopHeader />

      <main className="mx-auto max-w-2xl space-y-4 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="flex-1 text-[18px] font-extrabold tracking-tight">Đổi xu thành thẻ cào</h1>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-white">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
            <Coins size={22} />
          </div>
          <div>
            <p className="text-[12.5px] font-medium text-white/80">Số dư của bạn</p>
            <p className="text-[24px] font-black leading-tight">{fmt(balance)} xu</p>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-[12.5px] leading-5 text-emerald-800">
          Chọn mệnh giá và để lại Zalo hoặc Discord. Admin sẽ gửi thẻ cho bạn trong vòng 24 giờ.
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <CreditCard size={26} className="text-emerald-600" />
            </div>
            <p className="mt-3 text-[15px] font-bold text-slate-800">Sắp ra mắt</p>
            <p className="mt-1 text-[13px] text-slate-500">
              Tính năng đổi xu thành thẻ cào đang được chuẩn bị. Quay lại sau nhé!
            </p>
          </div>
        ) : (
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex gap-2 overflow-x-auto">
              {telcos.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTelco(t)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-bold transition ${
                    activeTelco === t
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-500"
                  }`}
                >
                  {telcoName(t)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
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
                    className={`rounded-xl border p-3.5 text-left transition active:scale-[0.98] ${
                      enough
                        ? "border-slate-200 bg-white hover:border-emerald-300"
                        : "border-slate-100 bg-slate-50 opacity-60"
                    }`}
                  >
                    <p className="text-[18px] font-black text-slate-900">{fmt(p.denomination)}đ</p>
                    <p className="mt-1 flex items-center gap-1 text-[12.5px] font-bold text-amber-600">
                      <Coins size={13} /> {fmt(p.coin_price)} xu
                    </p>
                    {!enough && (
                      <p className="mt-1 text-[11px] text-slate-400">Thiếu {fmt(p.coin_price - balance)} xu</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-2.5">
          <h2 className="px-1 text-[14px] font-extrabold text-slate-900">Lịch sử đổi thẻ</h2>
          {orders.length === 0 ? (
            <div className="rounded-xl border border-slate-100 bg-white p-6 text-center text-[13px] text-slate-400">
              Bạn chưa đổi thẻ nào
            </div>
          ) : (
            orders.map((o) => <HistoryItem key={o.id} order={o} />)
          )}
        </div>
      </main>

      {/* Xác nhận */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-black">Xác nhận đổi thẻ</h3>
              <button
                type="button"
                onClick={() => !submitting && setSelected(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-[13px] text-slate-500">Thẻ</p>
              <p className="text-[18px] font-black">
                {telcoName(selected.telco)} {fmt(selected.denomination)}đ
              </p>
              <div className="mt-3 flex items-center justify-between text-[13.5px]">
                <span className="text-slate-500">Số xu</span>
                <span className="font-bold text-amber-600">-{fmt(selected.coin_price)} xu</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[13.5px]">
                <span className="text-slate-500">Số dư sau khi đổi</span>
                <span className="font-bold">{fmt(balance - selected.coin_price)} xu</span>
              </div>
            </div>

            <label className="mt-4 block text-[12.5px] font-bold text-slate-700">
              Zalo hoặc Discord nhận thẻ
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="VD: 09xxxxxxxx hoặc ten_discord"
                maxLength={100}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-[14px] font-medium outline-none focus:border-emerald-400"
              />
            </label>
            <p className="mt-2 text-[12px] leading-5 text-slate-500">
              Xu bị trừ ngay khi gửi yêu cầu. Nếu admin từ chối, xu sẽ được hoàn lại. Nhập đúng thông tin để nhận thẻ nhanh.
            </p>
            {error && (
              <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-[12.5px] font-semibold text-rose-600">{error}</p>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 py-3.5 text-[15px] font-black text-white shadow-md disabled:opacity-60"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
              {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
          </div>
        </div>
      )}

      {/* Đã gửi yêu cầu */}
      {result && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-5 text-center shadow-2xl sm:rounded-3xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <Check size={28} className="text-emerald-600" strokeWidth={3} />
            </div>
            <h3 className="mt-3 text-[18px] font-black">Đã gửi yêu cầu!</h3>
            <p className="mt-1 text-[13.5px] text-slate-500">
              {telcoName(result.telco)} {fmt(result.denomination)}đ
            </p>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-sky-50 p-3 text-left text-[12.5px] leading-5 text-sky-800">
              <Clock size={16} className="mt-0.5 shrink-0" />
              <span>
                Admin sẽ gửi thẻ qua <b>{result.contact}</b> trong vòng 24 giờ. Bạn có thể theo dõi ở Lịch sử đổi thẻ.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="mt-5 w-full rounded-full bg-slate-900 py-3 text-[14px] font-bold text-white"
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
            
