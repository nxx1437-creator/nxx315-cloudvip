import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Megaphone, Activity, ExternalLink, Coins } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import { useI18n } from "../../i18n/index.js";

export function Panel({ className = "", children }) {
  return (
    <div className={`border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function SectionLabel({ children, right }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
        <span className="h-2 w-2 bg-emerald-500" />
        {children}
      </span>
      {right}
    </div>
  );
}

function timeAgo(dateStr, t) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return t("dash2.agoNow");
  if (mins < 60) return t("dash2.agoMin", { n: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t("dash2.agoHour", { n: hours });
  return t("dash2.agoDay", { n: Math.floor(hours / 24) });
}

const KIND_STYLE = {
  news: "border-emerald-200 bg-emerald-50 text-emerald-700",
  update: "border-sky-200 bg-sky-50 text-sky-700",
  event: "border-violet-200 bg-violet-50 text-violet-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
};

// ===== Thông báo từ admin (tự ẩn nếu chưa có) =====
export function AnnouncementsCard() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("announcements")
          .select("id, title, body, kind, link_url, pinned, created_at")
          .order("pinned", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(3);
        if (error) throw error;
        if (alive) setItems(data || []);
      } catch (err) {
        console.warn("[announcements] lỗi:", err);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (items.length === 0) return null;

  const open = (url) => {
    if (!url) return;
    if (url.startsWith("/")) navigate(url);
    else if (/^https?:\/\//i.test(url))
      window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div>
      <SectionLabel>{t("dash2.annTitle")}</SectionLabel>
      <div className="space-y-2.5">
        {items.map((a) => {
          const isNew =
            Date.now() - new Date(a.created_at).getTime() < 3 * 86400000;
          const kind = KIND_STYLE[a.kind] ? a.kind : "news";
          return (
            <Panel key={a.id} className="p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-emerald-100 bg-emerald-50 text-emerald-600">
                  <Megaphone size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${KIND_STYLE[kind]}`}
                    >
                      {t(`dash2.kind.${kind}`)}
                    </span>
                    {isNew && (
                      <span className="bg-rose-500 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                        {t("dash2.annNew")}
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-slate-400">
                      {timeAgo(a.created_at, t)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[14px] font-bold leading-snug text-slate-900">
                    {a.title}
                  </p>
                  {a.body && (
                    <p className="mt-1 text-[13px] leading-5 text-slate-500">
                      {a.body}
                    </p>
                  )}
                  {a.link_url && (
                    <button
                      onClick={() => open(a.link_url)}
                      className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-700 hover:text-emerald-800"
                    >
                      {t("dash2.annOpen")} <ExternalLink size={12} />
                    </button>
                  )}
                </div>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

// ===== Hoạt động gần đây =====
export function ActivityCard({ userId }) {
  const { t, lang } = useI18n();
  const [rows, setRows] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("task_completions")
          .select("id, coins_earned, pending_reward, completed_at, provider, status")
          .eq("user_id", userId)
          .order("completed_at", { ascending: false })
          .limit(6);
        if (error) throw error;
        if (alive) setRows(data || []);
      } catch (err) {
        console.warn("[activity] lỗi:", err);
        if (alive) setRows([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [userId]);

  const fmt = (n) => Number(n || 0).toLocaleString(lang === "en" ? "en-US" : "vi-VN");

  return (
    <div>
      <SectionLabel>{t("dash2.actTitle")}</SectionLabel>
      <Panel>
        {rows === null ? (
          <div className="space-y-3 p-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-9 animate-pulse bg-slate-100" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <Activity size={26} className="mx-auto text-slate-300" />
            <p className="mt-2 text-sm font-bold text-slate-600">
              {t("dash2.actEmpty")}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {t("dash2.actEmptySub")}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rows.map((r) => {
              const pending = String(r.status || "").toLowerCase().includes("pending");
              const amount = r.coins_earned > 0 ? r.coins_earned : r.pending_reward;
              return (
                <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-amber-100 bg-amber-50 text-amber-500">
                    <Coins size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {r.provider || "—"}
                    </p>
                    <p className="font-mono text-[10px] text-slate-400">
                      {timeAgo(r.completed_at, t)}
                    </p>
                  </div>
                  {pending && (
                    <span className="border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-amber-700">
                      {t("dash2.actPending")}
                    </span>
                  )}
                  <span
                    className={`shrink-0 text-sm font-black ${
                      pending ? "text-slate-400" : "text-emerald-600"
                    }`}
                  >
                    +{fmt(amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
        }
