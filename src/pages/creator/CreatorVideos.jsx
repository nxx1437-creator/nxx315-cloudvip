import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Plus,
  Send,
  Loader2,
  ExternalLink,
  Film,
  Eye,
  Heart,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import useSession from "../../hooks/useSession.js";
import { supabase } from "../../lib/supabaseClient.js";
import {
  Card,
  Eyebrow,
  StatusPill,
  CodeBox,
  PLATFORMS,
  useMyVideos,
  fmt,
} from "../../components/creator/creatorUi.jsx";

function Chip({ active, onClick, dot, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
        active ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-200" : "border-white/10 text-slate-400"
      }`}
    >
      {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
      {label}
      <span className="font-mono text-xs opacity-70">{count}</span>
    </button>
  );
}

function Stats({ it }) {
  if (it.views == null && it.likes == null && it.comments == null) return null;
  const rows = [
    [Eye, it.views],
    [Heart, it.likes],
    [MessageCircle, it.comments],
  ];
  return (
    <div className="mt-2 flex items-center gap-4">
      {rows.map(([Icon, v], i) => (
        <span key={i} className="flex items-center gap-1 text-xs font-semibold text-slate-300">
          <Icon size={13} className="text-cyan-400" /> {fmt(v)}
        </span>
      ))}
    </div>
  );
}

export default function CreatorVideos() {
  const { session } = useSession();
  const { ov, reload: reloadOv } = useOutletContext();
  const { items, loading, reload } = useMyVideos(session?.user?.id);
  const hashtags = ov?.settings?.hashtags || "#Nxx315Studio";

  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pf, setPf] = useState("all");
  const [st, setSt] = useState("all");

  const refresh = async () => {
    setRefreshing(true);
    await supabase.functions.invoke("creator-verify", { body: { action: "refresh_stats" } });
    await reload();
    setRefreshing(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    if (sending || !url.trim() || !confirmed) return;
    setSending(true);
    setNotice(null);
    const { data, error } = await supabase.functions.invoke("creator-verify", {
      body: { action: "submit_video", url },
    });
    setSending(false);
    if (error || !data) {
      setNotice({ kind: "error", text: "Có lỗi xảy ra, vui lòng thử lại." });
      return;
    }
    if (!data.ok) {
      setNotice({ kind: "error", text: data.message });
      return;
    }
    setNotice({
      kind: data.status === "rejected" ? "error" : "ok",
      text: data.status === "rejected" ? "Video bị từ chối: " + data.message : data.message,
    });
    setUrl("");
    setConfirmed(false);
    setOpen(false);
    reload();
    reloadOv();
  };

  const count = (fn) => items.filter(fn).length;
  const shown = items.filter(
    (i) => (pf === "all" || i.platform === pf) && (st === "all" || i.status === st)
  );

  return (
    <>
      <div className="px-1">
        <h1 className="text-3xl font-extrabold text-white">Video của tôi</h1>
        <p className="mt-1 text-sm text-slate-400">Tất cả video được theo dõi tại đây.</p>
      </div>

      {notice && (
        <p
          className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
            notice.kind === "ok"
              ? "bg-emerald-400/10 text-emerald-300"
              : "bg-rose-400/10 text-rose-300"
          }`}
        >
          {notice.text}
        </p>
      )}

      {!open ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setOpen(true);
              setNotice(null);
            }}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-base font-bold text-white"
          >
            <Plus size={20} /> Gửi video
          </button>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-slate-300 disabled:opacity-50"
            aria-label="Làm mới số liệu"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      ) : (
        <Card>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Dán link video YouTube hoặc TikTok của bạn"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            maxLength={300}
            className="w-full rounded-full border border-cyan-400/40 bg-black/30 px-5 py-3 text-sm text-white outline-none placeholder:text-slate-500"
          />
          <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-cyan-400"
            />
            <span>
              Video đã có hashtag <b className="text-cyan-300">{hashtags}</b> trong tiêu đề hoặc mô tả
            </span>
          </label>
          <div className="mt-3 flex gap-2">
            <button
              onClick={submit}
              disabled={sending || !url.trim() || !confirmed}
              className="flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-40"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
              {sending ? "Đang kiểm tra..." : "Gửi"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold text-slate-300"
            >
              Huỷ
            </button>
          </div>
          <p className="mt-3 font-mono text-[11px] leading-relaxed text-slate-500">
            Hệ thống tự kiểm tra video có thuộc kênh bạn đã liên kết và có hashtag không. Video hợp lệ sẽ
            chờ admin duyệt rồi gửi code xu.
          </p>
        </Card>
      )}

      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <Eyebrow className="mr-1">▸ Nền tảng</Eyebrow>
          <Chip active={pf === "all"} onClick={() => setPf("all")} label="Tất cả" count={items.length} />
          {Object.entries(PLATFORMS).map(([k, v]) => (
            <Chip
              key={k}
              active={pf === k}
              onClick={() => setPf(k)}
              dot={v.dot}
              label={v.name}
              count={count((i) => i.platform === k)}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            ["all", "Tất cả"],
            ["pending", "Đang chờ"],
            ["approved", "Đã duyệt"],
            ["rejected", "Bị từ chối"],
          ].map(([k, label]) => (
            <Chip
              key={k}
              active={st === k}
              onClick={() => setSt(k)}
              label={label}
              count={k === "all" ? items.length : count((i) => i.status === k)}
            />
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 size={22} className="animate-spin text-cyan-400" />
        </div>
      ) : shown.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 px-5 py-14 text-center">
          <Film size={36} className="mx-auto text-slate-600" />
          <p className="mt-3 text-lg font-bold text-white">Chưa có video.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((it) => (
            <Card key={it.id} className="!p-4">
              <div className="flex gap-3">
                {it.thumbnail_url ? (
                  <img
                    src={it.thumbnail_url}
                    alt=""
                    referrerPolicy="no-referrer"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                    className="h-20 w-14 shrink-0 rounded-xl border border-white/10 object-cover"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-bold text-white">
                      <span className={`h-2.5 w-2.5 rounded-full ${PLATFORMS[it.platform]?.dot}`} />
                      {PLATFORMS[it.platform]?.name}
                    </span>
                    <StatusPill status={it.status} />
                  </div>
                  {it.title && (
                    <p className="mt-1.5 line-clamp-2 text-sm text-slate-200">{it.title}</p>
                  )}
                  <Stats it={it} />
                  <a
                    href={it.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center gap-1.5 text-xs text-cyan-300"
                  >
                    <ExternalLink size={12} className="shrink-0" />
                    <span className="truncate">{it.url}</span>
                  </a>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {new Date(it.created_at).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>

              {it.status === "approved" && it.gift_code && (
                <CodeBox code={it.gift_code} coins={it.coins} />
              )}
              {it.status === "rejected" && it.admin_note && (
                <p className="mt-3 rounded-xl bg-rose-400/10 px-3 py-2 text-xs text-rose-300">
                  Lý do: {it.admin_note}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
                                                   }
