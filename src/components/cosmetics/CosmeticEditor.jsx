// src/components/cosmetics/CosmeticEditor.jsx — trình chỉnh khung avatar / hiệu ứng hồ sơ (kiểu Roblox + Discord)
// - Tab Khung: avatar tròn lớn + khung, lưới 4 cột ô tối, bấm để xem thử, nút dưới "Lưu" hoặc "Mua"
// - Tab Hiệu ứng: thẻ hồ sơ mẫu (ảnh bìa + avatar của chính mình) đeo hiệu ứng, kèm mô tả
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Ban, Coins, Lock } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import useSession from "../../hooks/useSession.js";
import { CosmeticEffect, CosmeticFrame, refreshCosmetics } from "./Cosmetics.jsx";

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");

const DESC = {
  frame: "Hiển thị khung này quanh avatar của bạn.",
  effect: "Hiển thị hiệu ứng này khi người khác xem hồ sơ của bạn.",
};
const ERR = {
  not_enough_coins: "Bạn chưa đủ xu để mua vật phẩm này",
  already_owned: "Bạn đã sở hữu vật phẩm này rồi",
  banned: "Tài khoản đang bị khóa",
  item_not_found: "Vật phẩm không còn bán",
};

const cosOf = (it) => ({
  frame_style: it?.kind === "frame" ? it.style_key : null,
  frame_image: it?.kind === "frame" ? it.image_file : null,
  effect_style: it?.kind === "effect" ? it.style_key : null,
  effect_image: it?.kind === "effect" ? it.image_file : null,
});

export default function CosmeticEditor({ initialKind = "frame", onBack, onChanged }) {
  const navigate = useNavigate();
  const { session } = useSession();
  const uid = session?.user?.id;

  const [kind, setKind] = useState(initialKind === "effect" ? "effect" : "frame");
  const [items, setItems] = useState([]);
  const [owned, setOwned] = useState(new Set());
  const [equip, setEquip] = useState({ frame_id: null, effect_id: null });
  const [me, setMe] = useState(null);
  const [sel, setSel] = useState(null); // null = giữ nguyên | "none" | id vật phẩm đang xem thử
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    if (!uid) return;
    const [it, inv, eq, pr, pub] = await Promise.all([
      supabase.from("cosmetic_items").select("*").order("sort_order"),
      supabase.from("user_cosmetics").select("item_id").eq("user_id", uid),
      supabase.from("user_cosmetic_equip").select("frame_id,effect_id").eq("user_id", uid).maybeSingle(),
      supabase.from("profiles").select("username,avatar_url,coins").eq("id", uid).single(),
      supabase.rpc("get_public_profile", { p_user_id: uid }),
    ]);
    setItems(it.data || []);
    setOwned(new Set((inv.data || []).map((r) => r.item_id)));
    setEquip(eq.data || { frame_id: null, effect_id: null });
    setMe({ ...(pr.data || {}), cover: pub.data?.cover_url || null });
  }, [uid]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const flash = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 2400);
  };

  const switchKind = (k) => {
    setKind(k);
    setSel(null);
  };

  const byId = useMemo(() => Object.fromEntries(items.map((i) => [i.id, i])), [items]);
  const list = items.filter((i) => i.kind === kind);
  const curId = equip[`${kind}_id`];
  const shownId = sel === "none" ? null : sel || curId;
  const shown = shownId ? byId[shownId] : null;

  const frameIt = kind === "frame" ? shown : byId[equip.frame_id];
  const effectIt = kind === "effect" ? shown : byId[equip.effect_id];
  const previewCos = {
    frame_style: frameIt?.style_key || null,
    frame_image: frameIt?.image_file || null,
    effect_style: effectIt?.style_key || null,
    effect_image: effectIt?.image_file || null,
  };

  const selItem = sel && sel !== "none" ? byId[sel] : null;
  const locked = !!selItem && !owned.has(selItem.id);
  const dirty = sel !== null && (sel === "none" ? !!curId : sel !== curId);
  const coins = Number(me?.coins || 0);
  const cantAfford = locked && coins < selItem.price;

  const save = async () => {
    if (busy) return;
    setBusy(true);
    let res;
    if (locked) {
      res = await supabase.rpc("buy_cosmetic", { p_item_id: selItem.id });
    } else {
      res = await supabase.rpc("equip_cosmetic", { p_kind: kind, p_item_id: sel === "none" ? null : sel });
    }
    setBusy(false);
    if (res.error || !res.data?.success) {
      flash(ERR[res.data?.error] || "Không thực hiện được, thử lại nhé", false);
      return;
    }
    flash(locked ? `Đã mua ${selItem.name}` : "Đã lưu");
    setSel(null);
    await load();
    refreshCosmetics(uid);
    onChanged?.();
  };

  const name = me?.username || "Bạn";
  const letter = String(name).slice(0, 1).toUpperCase();

  const avatarFill = me?.avatar_url ? (
    <img src={me.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
  ) : (
    <span className="flex h-full w-full items-center justify-center rounded-full bg-sky-100 text-3xl font-bold text-sky-700">
      {letter}
    </span>
  );

  const Tile = ({ it }) => {
    const isLocked = !owned.has(it.id);
    const on = curId === it.id;
    const picked = sel === it.id;
    return (
      <button type="button" onClick={() => setSel(picked ? null : it.id)} className="flex flex-col items-center gap-1.5 active:scale-95">
        <span
          className={`relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-[#2a2b32] ${
            picked ? "ring-2 ring-white" : ""
          }`}
        >
          {it.kind === "frame" ? (
            <span className="cx-avatar" style={{ width: 44, height: 44 }}>
              <CosmeticFrame cosmetic={cosOf(it)} w={4} />
            </span>
          ) : (
            <CosmeticEffect cosmetic={cosOf(it)} count={8} />
          )}
          {isLocked && (
            <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white">
              <Lock size={11} />
            </span>
          )}
          {on && <span className="absolute left-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-400" />}
        </span>
        <span className="w-full truncate text-center text-[12.5px] font-semibold text-white">{it.name}</span>
        {isLocked && (
          <span className="-mt-1 inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-400">
            <Coins size={10} strokeWidth={2.6} />
            {fmt(it.price)}
          </span>
        )}
      </button>
    );
  };

  const btnLabel = locked
    ? cantAfford
      ? `Chưa đủ xu · cần ${fmt(selItem.price)}`
      : `Mua · ${fmt(selItem.price)} xu`
    : "Lưu";
  const btnDisabled = busy || cantAfford || (!locked && !dirty);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#14151a] text-white">
      {/* Xem trước */}
      <div className="relative shrink-0 px-5 pb-3 pt-[max(16px,env(safe-area-inset-top))]">
        <button type="button" onClick={onBack} aria-label="Quay lại" className="flex h-10 w-10 items-center justify-center rounded-full">
          <ArrowLeft size={24} />
        </button>

        {kind === "frame" ? (
          <div className="mx-auto -mt-1 flex justify-center">
            <div className="relative" style={{ width: "min(220px, 27vh)", height: "min(220px, 27vh)" }}>
              <div className="h-full w-full overflow-hidden rounded-full bg-slate-700">{avatarFill}</div>
              <CosmeticFrame cosmetic={previewCos} w={12} />
            </div>
          </div>
        ) : (
          <div className="relative mx-auto -mt-1 w-full max-w-[330px] overflow-hidden rounded-[26px] bg-white shadow-xl">
            <div className="relative h-[92px] w-full bg-gradient-to-br from-sky-300 via-cyan-200 to-emerald-200">
              {me?.cover && <img src={me.cover} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="relative px-4 pb-4">
              <div className="relative -mt-9 h-[72px] w-[72px] rounded-full bg-white ring-4 ring-white">
                {avatarFill}
                <CosmeticFrame cosmetic={previewCos} w={5} />
              </div>
              <p className="mt-2 text-[19px] font-bold leading-6 text-slate-900">{name}</p>
              <p className="text-[13px] text-slate-500">@{name}</p>
              <div className="mt-3 h-9 rounded-xl bg-slate-100" />
            </div>
            <CosmeticEffect cosmetic={previewCos} count={16} />
          </div>
        )}

        <div className="mt-3 text-center">
          <p className="text-[17px] font-bold">{shown ? shown.name : "Không dùng"}</p>
          <p className="mx-auto mt-0.5 max-w-xs text-[13px] text-white/60">{DESC[kind]}</p>
        </div>
      </div>

      {/* Bảng chọn */}
      <div className="min-h-0 flex-1 overflow-y-auto rounded-t-3xl bg-[#0e0f13] px-4 pb-32 pt-4">
        <div className="mb-3 flex gap-2">
          {[
            ["frame", "Khung"],
            ["effect", "Hiệu ứng"],
          ].map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => switchKind(k)}
              className={`rounded-full px-4 py-1.5 text-[14px] font-bold transition ${
                kind === k ? "bg-white text-black" : "bg-[#2a2b32] text-white/70"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between rounded-2xl bg-[#1b1c22] px-4 py-3">
          <span className="flex items-center gap-2 text-[13.5px] text-white/80">
            <Coins size={18} className="text-amber-400" strokeWidth={2.4} />
            Mở khóa bằng xu · Bạn có <b className="text-white">{fmt(coins)}</b> xu
          </span>
          <button type="button" onClick={() => navigate("/tasks")} className="text-[13px] font-semibold text-white underline">
            Kiếm xu
          </button>
        </div>

        <div className="grid grid-cols-4 gap-x-2.5 gap-y-4">
          <button type="button" onClick={() => setSel(sel === "none" ? null : "none")} className="flex flex-col items-center gap-1.5 active:scale-95">
            <span
              className={`flex aspect-square w-full items-center justify-center rounded-2xl bg-[#2a2b32] text-white/60 ${
                sel === "none" ? "ring-2 ring-white" : ""
              }`}
            >
              <Ban size={28} />
            </span>
            <span className="text-[12.5px] font-semibold text-white">Không</span>
          </button>
          {list.map((it) => (
            <Tile key={it.id} it={it} />
          ))}
        </div>
      </div>

      {msg && (
        <div
          className={`fixed inset-x-4 bottom-24 z-[70] mx-auto max-w-sm rounded-2xl px-4 py-3 text-center text-[14px] font-semibold text-white shadow-lg ${
            msg.ok ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Nút dưới */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0e0f13] via-[#0e0f13] to-transparent px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-8">
        <button
          type="button"
          onClick={save}
          disabled={btnDisabled}
          className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-full bg-[#3b6cff] py-4 text-[16px] font-bold text-white transition active:scale-[0.98] disabled:bg-[#2a2b32] disabled:text-white/40"
        >
          {locked && !cantAfford && <Coins size={17} strokeWidth={2.6} />}
          {btnLabel}
        </button>
      </div>
    </div>
  );
}
