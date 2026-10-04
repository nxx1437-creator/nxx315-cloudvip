import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  History as HistoryIcon,
  Wallet,
  Building2,
  Smartphone,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import { useI18n } from "../../i18n/index.js";
import {
  getImageUrl,
  formatHistoryDate,
  getHistoryStatus,
  getHistoryAmount,
  getHistoryName,
  getHistoryImage,
  getGameNameByPackage,
} from "../../lib/storeData.js";

// ===== Ảnh nhỏ có ảnh dự phòng =====
function Thumb({ src, alt = "", fallback, className = "" }) {
  const [error, setError] = useState(false);
  if (error || !src) return fallback;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setError(true)}
    />
  );
}

// ===== Khối rút tiền =====
export function WithdrawBanner({ navigate }) {
  const { t } = useI18n();

  const SERVICES = [
    {
      id: "bank",
      icon: Building2,
      logoFile: "bank-icon.png",
      label: t("st.wdBank"),
      desc: t("st.wdBankDesc"),
      color: "#10B981",
    },
    {
      id: "momo",
      icon: Smartphone,
      logoFile: "momo-icon.png",
      label: t("st.wdMomo"),
      desc: t("st.wdMomoDesc"),
      color: "#A50064",
    },
    {
      id: "zalopay",
      icon: Wallet,
      logoFile: "zalopay-icon.png",
      label: t("st.wdZalo"),
      desc: t("st.wdZaloDesc"),
      color: "#0068FF",
    },
  ];

  return (
    <section>
      <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50 via-teal-50/50 to-white p-3 shadow-sm">
        <button
          type="button"
          onClick={() => navigate("/withdraw")}
          className="group flex w-full items-center gap-3 px-2 pb-4 pt-1 text-left transition active:opacity-80"
        >
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-700">
              {t("st.wdKicker")}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <h3 className="text-[22px] font-black leading-tight tracking-[-0.02em] text-slate-900">
                {t("st.wdTitle")}
              </h3>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition group-hover:bg-emerald-50">
                <ChevronRight size={14} className="text-slate-700" strokeWidth={2.8} />
              </span>
            </div>
          </div>

          <Thumb
            src={getImageUrl("withdraw-banner-icon1.png")}
            className="h-20 w-20 shrink-0 object-contain"
            fallback={
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm">
                <Wallet size={36} className="text-white" strokeWidth={2.2} />
              </div>
            }
          />
        </button>

        <div className="space-y-2">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => navigate("/withdraw")}
                className="group flex w-full items-center gap-3 rounded-xl border border-white bg-white/90 p-3 text-left shadow-sm transition hover:border-emerald-200 hover:shadow-md active:scale-[0.99]"
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${s.color}14` }}
                >
                  <Thumb
                    src={getImageUrl(s.logoFile)}
                    alt={s.label}
                    className="h-7 w-7 object-contain"
                    fallback={
                      <Icon size={22} style={{ color: s.color }} strokeWidth={2.2} />
                    }
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] font-bold leading-tight text-slate-900">
                    {s.label}
                  </p>
                  <p className="mt-0.5 truncate text-[12px] leading-tight text-slate-500">
                    {s.desc}
                  </p>
                </div>

                <span className="shrink-0 rounded-lg bg-slate-100 px-3.5 py-2 font-mono text-[11px] font-extrabold uppercase tracking-wider text-slate-700 transition group-hover:bg-emerald-600 group-hover:text-white">
                  {t("st.wdBtn")}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ===== Lịch sử đơn hàng (3 đơn gần nhất) =====
export function StoreHistoryPreview() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const loadHistory = async () => {
      try {
        // getSession đọc từ máy (nhanh), không gọi mạng như getUser
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const user = session?.user;

        if (!user) {
          if (alive) setLoading(false);
          return;
        }

        const [ordersResult, redemptionResult] = await Promise.all([
          supabase
            .from("orders")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(3),
          supabase
            .from("redemption_orders")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(3),
        ]);

        if (ordersResult.error) throw ordersResult.error;
        if (redemptionResult.error) throw redemptionResult.error;

        const merged = [
          ...(ordersResult.data || []).map((o) => ({ ...o, historySource: "orders" })),
          ...(redemptionResult.data || []).map((o) => ({
            ...o,
            historySource: "redemption_orders",
          })),
        ]
          .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
          .slice(0, 3);

        if (alive) setHistory(merged);
      } catch (error) {
        console.error("Store history error:", error);
        if (alive) setHistory([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadHistory();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="px-5 pb-3 pt-5">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-700">
            {t("st.hKicker")}
          </p>
          <button
            type="button"
            onClick={() => navigate("/history")}
            className="mt-1 flex items-center gap-2 text-left"
          >
            <h2 className="text-xl font-black text-slate-900">
              {t("st.hTitle")}
            </h2>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50">
              <ChevronRight size={14} className="text-emerald-700" />
            </span>
          </button>
        </div>

        <div className="px-3 pb-3">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border border-slate-100 bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-32 rounded bg-slate-100" />
                      <div className="h-3 w-24 rounded bg-slate-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                <HistoryIcon size={22} className="text-emerald-600" />
              </div>
              <p className="mt-3 text-sm font-bold text-slate-700">
                {t("st.hEmpty")}
              </p>
              <p className="mt-1 text-xs text-slate-400">{t("st.hEmptySub")}</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {history.map((order) => {
                const status = getHistoryStatus(order.status);
                const gameName = getGameNameByPackage(order.package_id);

                return (
                  <button
                    key={`${order.historySource}-${order.id}`}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/history/order/${order.id}?source=${order.historySource}`
                      )
                    }
                    className="group flex w-full items-center gap-3.5 rounded-xl border border-slate-100 bg-white p-3.5 text-left shadow-sm transition hover:border-emerald-300 hover:shadow-md active:scale-[0.99]"
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${status.bg}`}
                    >
                      <Thumb
                        src={getHistoryImage(order)}
                        className="h-full w-full object-contain p-1"
                        fallback={<span className="text-xl">🎮</span>}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-slate-900">
                        {getHistoryName(order, lang, t)}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {gameName ? `${gameName} · ` : ""}
                        {formatHistoryDate(order.created_at, lang)}
                      </p>
                      <p className={`mt-1 inline-block text-[11px] font-bold ${status.cls}`}>
                        ● {t(status.key)}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className="text-[11px] font-bold text-emerald-700">
                        {getHistoryAmount(order, lang, t("dash.coin"))}
                      </span>
                      <span className="rounded-lg bg-emerald-50 px-3 py-1.5 font-mono text-[10px] font-bold uppercase text-emerald-700 transition group-hover:bg-emerald-100">
                        {t("st.hDetail")}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
