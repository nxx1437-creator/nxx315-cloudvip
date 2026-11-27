// src/components/profile/CosmeticPicker.jsx — bảng chọn khung avatar / hiệu ứng hồ sơ kiểu Discord (xem trước, Đồ của bạn, khóa + giá, mua ngay)
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ban, Coins, Lock, Store, X } from "lucide-react";
import { supabase } from "../../lib/supabaseClient.js";
import useSession from "../../hooks/useSession.js";
import { CosmeticAvatar, CosmeticEffect, refreshCosmetics } from "../cosmetics/Cosmetics.jsx";

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");
const TITLE = { frame: "Đổi khung avatar", effect: "Đổi hiệu ứng hồ sơ" };
const ERR = {
  not_enough_coins: "Bạn chưa đủ xu để mua vật phẩm này",
  already_owned: "Bạn đã sở hữu vật phẩm này rồi",
  banned: "Tài khoản đang bị khóa",
};

export default function CosmeticPicker({ kind = "frame", onClose, onChanged }) {
  const navigate = useNavigate();
  const { session } = useSession();
  const uid = session?.user?.id;

  const [items, setItems] = useState([]);
  const [owned, setOwned] = useState(new Set());
  const [equip, setEquip] = useState({ frame_id: null, effect_id: null });
  const [me, setMe] = useState(null);
  const [pick, setPick] = useState(null); // null = đang dùng | "none" | id vật phẩm đang xem thử
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    if (!uid) return;
    const [it, inv, eq, pr] = await Promise.all([
      supabase.from("cosmetic_items").select("*").order("sort_order"),
      supabase.from("user_cosmetics").select("item_id").eq("user_id", uid),
      supabase.from("user_cosmetic_equip").select("frame_id,effect_id").eq("user_id", uid).maybeSingle(),
      supabase.from("profiles").select("username,avatar_url,coins").eq("id", uid).single(),
    ]);
    setItems(it.data || []);
    setOwned(new Set((inv.data || []).map((r) => r.item_id)));
    setEquip(eq.data || { frame_id: null, effect_id: null });
    setMe(pr.data || null);
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

  const byId = useMemo(() => Object.fromEntries(items.map((i) => [i.id, i])), [items]);
  const list = items.filter((i) => i.kind === kind);
  const mine = list.filter((i) => owned.has(i.id));
  const shop = list.filter((i) => !owned.has(i.id));
  const curId = equip[`${kind}_id`];
  const shownId = pick === "none" ? null : pick || curId;
  const shown = shownId ? byId[shownId] : null;

  const other = kind === "frame" ? byId[equip.effect_id] : byId[equip.frame_id];
  const fr = kind === "frame" ? shown : other;
  const fx = kind === "effect" ? shown : other;
  const previewCos = {
    frame_style: fr?.style_key || null,
    frame_image: fr?.image_file || null,
    effect_style: fx?.style_key || null,
    effect_image: fx?.image_file || null,
  };

  const doEquip = async (itemId) => {
    if (busy) return;
    setBusy(true);
    const { data, error } = await supabase.rpc("equip_cosmetic", { p_kind: kind, p_item_id: itemId });
    setBusy(false);
    if (error || !data?.success) return flash("Không đổi được, thử lại nhé", false);
    setPick(null);
    await load();
    refreshCosmetics(uid);
    onChanged?.();
  };

  const doBuy = async (it) => {
    if (busy) return;
    setBusy(true);
    const { data, error } = await supabase.rpc("buy_cosmetic", { p_item_id: it.id });
    setBusy(false);
    if (error || !data?.success) return flash(ERR[data?.error] || "Không mua được, thử lại nhé", false);
    flash(`Đã mua ${it.name}`);
    setPick(null);
    await load();
    refreshCosmetics(uid);
    onChanged?.();
  };

  const tapItem = (it) => {
    if (owned.has(it.id)) {
      if (curId !== it.id) doEquip(it.id);
    } else {
      setPick(pick === it.id ? null : it.id);
    }
  };

  const name = me?.username || "Bạn";
  const previewing = pick && pick !== "none" && !owned.has(pick) ? byId[pick] : null;

  const Tile = ({ it, locked }) => {
    const on = curId === it.id;
    const cos =
      kind === "frame"
        ? { frame_style: it.style_key, frame_image: it.image_file }
        : { effect_style: it.style_key, effect_image: it.image_file };
    return (
      <button
        type="button"
        onClick={() => tapItem(it)}
        className={`relative flex flex-col items-center gap-1 rounded-2xl border p-2 transition active:scale-95 ${
          on || pick === it.id
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
            : "border-slate-200 bg-slate-50 dark:border-[#30363d] dark:bg-[#161b22]"
        }`}
      >
        <span className="relative flex h-[72px] w-full items-center justify-center overflow-hidden rounded-xl">
          {kind === "frame" ? (
            <CosmeticAvatar src={me?.avatar_url} size={46} name={name} cosmetic={cos} />
          ) : (
            <>
              <span className="absolute inset-0 bg-slate-100 dark:bg-[#21262d]" />
              <CosmeticEffect cosmetic={cos} count={8} />
            </>
          )}
        </span>
        <span className="w-full truncate text-center text-[12px] font-semibold text-slate-800 dark:text-slate-100">{it.name}</span>
        {locked && (
          <>
            <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/80 text-white">
              <Lock size={11} />
            </span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-600">
              <Coins size={11} strokeWidth={2.6} />
              {fmt(it.price)}
            </span>
          </>
        )}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-black/50" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white pb-28 dark:bg-[#0d1117]"
      >
        <div className="sticky top-0 z-20 flex items-center justify-between bg-white px-4 py-3 dark:bg-[#0d1117]">
          <span className="h-9 w-9" />
          <h2 className="text-[16px] font-bold text-slate-900 dark:text-white">{TITLE[kind]}</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Xem trước */}
        <div className="relative mx-4 overflow-hidden rounded-3xl bg-slate-100 px-4 py-6 text-center dark:bg-[#161b22]">
          <CosmeticEffect cosmetic={previewCos} />
          <div className="relative z-10 mx-auto w-fit">
            <CosmeticAvatar src={me?.avatar_url} size={88} name={name} cosmetic={previewCos} />
          </div>
          <p className="relative z-10 mt-3 text-[16px] font-bold text-slate-900 dark:text-white">{name}</p>
          <p className="relative z-10 mt-0.5 text-[13px] text-slate-500">{shown ? shown.name : "Không dùng"}</p>
          <p className="relative z-10 mt-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[12.5px] font-bold text-amber-600">
            <Coins size={13} strokeWidth={2.6} /> {fmt(me?.coins)} xu
          </p>
        </div>

        {/* Đồ của bạn */}
        <p className="px-4 pb-2 pt-5 text-[13px] font-bold uppercase tracking-wide text-slate-500">Đồ của bạn</p>
        <div className="grid grid-cols-3 gap-2.5 px-4">
          <button
            type="button"
            onClick={() => (curId ? doEquip(null) : setPick(null))}
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl border p-2 transition active:scale-95 ${
              !curId ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-slate-200 bg-slate-50 dark:border-[#30363d] dark:bg-[#161b22]"
            }`}
          >
            <span className="flex h-[72px] items-center justify-center text-slate-500">
              <Ban size={30} />
            </span>
            <span className="text-[12px] font-semibold text-slate-800 dark:text-slate-100">Không</span>
          </button>
          {mine.map((it) => (
            <Tile key={it.id} it={it} />
          ))}
        </div>

        {/* Trong cửa hàng */}
        <p className="px-4 pb-2 pt-6 text-[13px] font-bold uppercase tracking-wide text-slate-500">Mua bằng xu</p>
        <div className="grid grid-cols-3 gap-2.5 px-4">
          {shop.map((it) => (
            <Tile key={it.id} it={it} locked />
          ))}
        </div>
        {shop.length === 0 && <p className="px-4 text-[13px] text-slate-500">Bạn đã sở hữu tất cả 🎉</p>}

        {msg && (
          <div className={`fixed inset-x-4 bottom-28 z-[70] mx-auto max-w-sm rounded-2xl px-4 py-3 text-center text-[14px] font-semibold text-white shadow-lg ${msg.ok ? "bg-emerald-600" : "bg-rose-600"}`}>
            {msg.text}
          </div>
        )}

        {/* Nút dưới */}
        <div className="fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-white via-white to-transparent px-4 pb-5 pt-6 dark:from-[#0d1117] dark:via-[#0d1117]">
          {previewing ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => doBuy(previewing)}
              className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-[15px] font-bold text-white disabled:opacity-60"
            >
              <Coins size={16} strokeWidth={2.6} /> Mua {previewing.name} · {fmt(previewing.price)} xu
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/cosmetics")}
              className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-[15px] font-bold text-white"
            >
              <Store size={16} /> Tới cửa hàng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
