import React, { useState, useEffect, useCallback } from "react";
import { Clock, CheckCircle2, XCircle, Loader2, Copy, Check, Gift } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";

export const PLATFORMS = {
  youtube: { name: "YouTube", dot: "bg-red-500", ph: "https://youtube.com/@ten-kenh-cua-ban" },
  tiktok: { name: "TikTok", dot: "bg-cyan-400", ph: "https://tiktok.com/@ten-nguoi-dung" },
};

export const STATUS = {
  pending: { label: "Đang chờ", cls: "border-amber-400/30 bg-amber-400/10 text-amber-300", Icon: Clock },
  approved: { label: "Đã duyệt", cls: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300", Icon: CheckCircle2 },
  rejected: { label: "Bị từ chối", cls: "border-rose-400/30 bg-rose-400/10 text-rose-300", Icon: XCircle },
};

export const getTier = (n) =>
  n >= 30
    ? { name: "ELITE", cls: "from-fuchsia-500 to-purple-600" }
    : n >= 15
    ? { name: "PRO", cls: "from-amber-400 to-orange-500" }
    : n >= 5
    ? { name: "RISING", cls: "from-cyan-400 to-blue-500" }
    : { name: "COMMON", cls: "from-slate-400 to-slate-600" };

export function Card({ children, className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#111C30] to-[#0B1322] p-5 ${className}`}
    >
      {children}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-cyan-400/0 via-cyan-400 to-blue-500/0" />
    </div>
  );
}

export function Eyebrow({ children, className = "" }) {
  return (
    <p className={`font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400 ${className}`}>
      {children}
    </p>
  );
}

export function StatusPill({ status }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${s.cls}`}>
      <s.Icon size={11} /> {s.label}
    </span>
  );
}

export function CodeBox({ code, coins }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      /* bỏ qua */
    }
  };
  return (
    <div className="mt-3 rounded-2xl border border-dashed border-emerald-400/40 bg-emerald-400/5 p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-emerald-300">
          <Gift size={14} /> Code nhận xu
        </span>
        <span className="rounded-full bg-amber-400/15 px-2 py-0.5 font-bold text-amber-300">
          +{Number(coins || 0).toLocaleString("vi-VN")} xu
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-xl bg-black/30 px-3 py-2.5 text-center font-mono text-sm font-bold tracking-wider text-white">
          {code}
        </code>
        <button
          onClick={copy}
          className="flex shrink-0 items-center gap-1 rounded-xl bg-emerald-500 px-3 py-2.5 text-xs font-bold text-white"
        >
          {done ? <Check size={13} /> : <Copy size={13} />} {done ? "Đã chép" : "Chép"}
        </button>
      </div>
      <p className="mt-2 text-[11px] text-emerald-300/80">Vào Ví → Nhập Gift Code để nhận xu.</p>
    </div>
  );
}

export const fmt = (n) => {
  if (n === null || n === undefined) return "—";
  const v = Number(n);
  if (v >= 1e6) return (v / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (v >= 1e3) return (v / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return String(v);
};

export function Avatar({ src, name, size = 48 }) {
  const [bad, setBad] = useState(false);
  const letter = (name || "?").trim().charAt(0).toUpperCase();
  return src && !bad ? (
    <img
      src={src}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => setBad(true)}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full border border-white/15 object-cover"
    />
  ) : (
    <span
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 font-bold text-white"
    >
      {letter}
    </span>
  );
}

export function useMyVideos(userId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("intro_video_submissions")
      .select(
        "id, url, platform, status, admin_note, gift_code, coins, created_at, title, thumbnail_url, views, likes, comments, shares"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    setItems(data || []);
    setLoading(false);
  }, [userId]);
  useEffect(() => {
    load();
  }, [load]);
  return { items, loading, reload: load };
}

export function ChannelLinkCard({ platform, channel, onChanged }) {
  const meta = PLATFORMS[platform];
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const done = (data, error) => {
    setBusy(false);
    if (error || !data) {
      setMsg({ ok: false, text: "Có lỗi xảy ra, vui lòng thử lại." });
      return;
    }
    setMsg({ ok: !!data.ok, text: data.message });
    if (data.ok) {
      setUrl("");
      onChanged?.();
    }
  };

  const link = async () => {
    setBusy(true);
    setMsg(null);
    const { data, error } = await supabase.functions.invoke("creator-verify", {
      body: { action: "link_channel", platform, url },
    });
    done(data, error);
  };

  const unlink = async () => {
    setBusy(true);
    setMsg(null);
    const { data, error } = await supabase.rpc("unlink_creator_channel", { p_platform: platform });
    done(data, error);
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${meta.dot}`} />
          <span className="text-base font-bold text-white">{meta.name}</span>
        </div>
        <span
          className={`rounded-full border px-3 py-1 font-mono text-[10px] tracking-widest ${
            channel
              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
              : "border-white/15 text-slate-400"
          }`}
        >
          {channel ? "✓ ĐÃ LIÊN KẾT" : "CHƯA LIÊN KẾT"}
        </span>
      </div>

      {channel ? (
        <>
          <div className="mt-4 flex items-center gap-3">
            <Avatar src={channel.avatar} name={channel.name} size={56} />
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-white">{channel.name || channel.handle}</p>
              <p className="truncate font-mono text-xs text-slate-400">{channel.handle}</p>
              {channel.followers !== null && channel.followers !== undefined && (
                <p className="text-xs text-cyan-300">{fmt(channel.followers)} người theo dõi</p>
              )}
            </div>
          </div>
          <button
            onClick={unlink}
            disabled={busy}
            className="mt-4 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-slate-300 disabled:opacity-50"
          >
            {busy ? "Đang xử lý..." : "Huỷ liên kết"}
          </button>
        </>
      ) : (
        <>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={meta.ph}
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            maxLength={200}
            className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60"
          />
          <button
            onClick={link}
            disabled={busy || !url.trim()}
            className="mt-3 flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {busy && <Loader2 size={15} className="animate-spin" />}
            {busy ? "Đang kiểm tra kênh..." : "Liên kết kênh"}
          </button>
        </>
      )}

      {msg && (
        <p className={`mt-3 text-xs font-semibold ${msg.ok ? "text-emerald-300" : "text-rose-300"}`}>
          {msg.text}
        </p>
      )}
    </Card>
  );
            }
