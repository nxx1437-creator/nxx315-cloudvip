// src/pages/CardExchange.jsx — đổi xu thành thẻ cào điện thoại (route: /cards)
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Clock, Coins, Copy, CreditCard, Eye, EyeOff, Loader2, X } from "lucide-react";
import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { supabase } from "../lib/supabaseClient.js";
import { SUPABASE_URL } from "../lib/withdrawData.js";

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const TELCO_NAMES = { viettel: "Viettel", mobifone: "Mobifone", vinaphone: "Vinaphone" };
const TELCO_COLORS = { viettel: "#E2231A", mobifone: "#0067B1", vinaphone: "#00A1E4" };

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");
const telcoName = (t) => TELCO_NAMES[t] || t;

const STATUS = {
  processing: { label: "Đang xử lý", cls: "bg-amber-50 text-amber-700" },
  completed: { label: "Hoàn thành", cls: "bg-emerald-50 text-emerald-700" },
  needs_review: { label: "Đang kiểm tra", cls: "bg-sky-50 text-sky-700" },
  failed: { label: "Thất bại · đã hoàn xu", cls: "bg-slate-100 text-slate-500" },
};

function CopyRow({ label, value }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      /* bỏ qua */
    }
  };
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-3">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-0.5 break-all font-mono text-[16px] font-bold tracking-wide text-slate-900">{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 text-[12px] font-bold text-slate-700 shadow-sm"
      >
        {done ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
        {done ? "Đã chép" : "Chép"}
      </button>
    </div>
  );
}

function HistoryItem({ order }) {
  const [show, setShow] = useState(false);
  const st = STATUS[order.status] || STATUS.processing;
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

      {order.status === "completed" && order.pin_code && (
        <div className="mt-3">
          {show ? (
            <div className="space-y-2">
              {order.serial && <CopyRow label="Seri" value={order.serial} />}
              <CopyRow label="Mã thẻ" value={order.pin_code} />
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="mt-2 flex items-center gap-1.5 text-[12.5px] font-bold text-emerald-700"
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
            {show ? "Ẩn mã thẻ" : "Hiện mã thẻ"}
          </button>
        </div>
      )}
      {order.status === "needs_review" && (
        <p className="mt-2 text-[12px] text-slate-500">
          Đơn đang được kiểm tra, thẻ sẽ hiện ở đây trong vòng 24 giờ. Xu không bị mất.
        </p>
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const loadOrders = useCallback(async (uid) => {
    const { data } = await supabase
      .from("card_orders")
      .select("id, telco, denomination, coins_charged, status, pin_code, serial, created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(20);
    setOrders(data || []);
  }, []);

  const loadAll = useCallback(async () => {
    try {
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      if (!u) return;
      setUser(u);

      const [{ data: prof }, { data: prods }] = await Promise.all([
        supabase.from("profiles").select("coins").eq("id", u.id).single(),
        supabase
          .from("card_products")
          .select("id, telco, denomination, coin_price, sort_order")
          .eq("active", true)
          .order("sort_order", { ascending: true }),
      ]);
      setBalance(prof?.coins || 0);
      setProducts(prods || []);
      await loadOrders(u.id);
    } catch (err) {
      console.error("Load cards error:", err);
    } finally {
      setLoading(false);
    }
  }, [loadOrders]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const telcos = useMemo(() => [...new Set(products.map((p) => p.telco))], [products]);
  const activeTelco = telcos.includes(telco) ? telco : telcos[0] || "";
  const list = products.filter((p) => p.telco === activeTelco);

  const submit = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Vui lòng đăng nhập lại.");

      const res = await fetch(`${SUPABASE_URL}/functions/v1/buy-card`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ product_id: selected.id }),
      });
      const data = await res.json().catch(() => ({}));

      if (typeof data.new_balance === "number") setBalance(data.new_balance);

      if (data.error) {
        setSelected(null);
        setResult({ kind: "error", message: data.error });
      } else if (data.status === "completed") {
        setSelected(null);
        setResult({ kind: "success", data });
      } else {
        setSelected(null);
        setResult({ kind: "pending", message: data.message });
      }
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

            <p className="mt-3 text-[12px] leading-5 text-slate-500">
              Mã thẻ hiện ngay sau khi đổi và được lưu trong Lịch sử. Sau khi nhận mã, xu không thể hoàn lại.
            </p>
            {error && <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-[12.5px] font-semibold text-rose-600">{error}</p>}

            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 py-3.5 text-[15px] font-black text-white shadow-md disabled:opacity-60"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
              {submitting ? "Đang lấy thẻ..." : "Đổi ngay"}
            </button>
          </div>
        </div>
      )}

      {/* Kết quả */}
      {result && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
            {result.kind === "success" ? (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                  <Check size={28} className="text-emerald-600" strokeWidth={3} />
                </div>
                <h3 className="mt-3 text-center text-[18px] font-black">Đổi thẻ thành công!</h3>
                <p className="mt-1 text-center text-[13px] text-slate-500">
                  {telcoName(result.data.telco)} {fmt(result.data.denomination)}đ
                </p>
                <div className="mt-4 space-y-2">
                  {result.data.serial && <CopyRow label="Seri" value={result.data.serial} />}
                  <CopyRow label="Mã thẻ" value={result.data.pin} />
                </div>
                <p className="mt-3 text-center text-[11.5px] text-slate-400">Mã cũng được lưu trong Lịch sử đổi thẻ.</p>
              </>
            ) : result.kind === "pending" ? (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-50">
                  <Clock size={28} className="text-sky-600" />
                </div>
                <h3 className="mt-3 text-center text-[18px] font-black">Đơn đang được kiểm tra</h3>
                <p className="mt-2 text-center text-[13.5px] leading-6 text-slate-500">{result.message}</p>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
                  <X size={28} className="text-rose-500" strokeWidth={3} />
                </div>
                <h3 className="mt-3 text-center text-[18px] font-black">Không đổi được thẻ</h3>
                <p className="mt-2 text-center text-[13.5px] leading-6 text-slate-500">{result.message}</p>
              </>
            )}
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
