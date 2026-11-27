// src/pages/CosmeticsShop.jsx — cửa hàng khung avatar + hiệu ứng hồ sơ (trả bằng xu): /cosmetics
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Coins } from "lucide-react";

import TopHeader from "../components/TopHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import useSession from "../hooks/useSession.js";
import { supabase } from "../lib/supabaseClient.js";
import { CosmeticAvatar, CosmeticEffect, refreshCosmetics } from "../components/cosmetics/Cosmetics.jsx";

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");

const RARITY = {
  common: ["Thường", "bg-slate-100 text-slate-600"],
  rare: ["Hiếm", "bg-sky-100 text-sky-700"],
  epic: ["Sử thi", "bg-violet-100 text-violet-700"],
  legendary: ["Huyền thoại", "bg-amber-100 text-amber-700"],
};

const ERR = {
  not_enough_coins: "Bạn chưa đủ xu để mua vật phẩm này",
  already_owned: "Bạn đã sở hữu vật phẩm này rồi",
  banned: "Tài khoản đang bị khóa",
  item_not_found: "Vật phẩm không còn bán",
  not_logged_in: "Vui lòng đăng nhập lại",
  not_owned: "Bạn chưa sở hữu vật phẩm này",
};

const TABS = [
  { key: "frame", label: "Khung avatar" },
  { key: "effect", label: "Hiệu ứng hồ sơ" },
];

export default function CosmeticsShop() {
  const { session } = useSession();
  const uid = session?.user?.id;

  const [tab, setTab] = useState("frame");
  const [items, setItems] = useState([]);
  const [owned, setOwned] = useState(new Set());
  const [equip, setEquip] = useState({ frame_id: null, effect_id: null });
  const [me, setMe] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    if (!uid) return;
    const [it, inv, eq, pr] = await Promise.all([
      supabase.from("cosmetic_items").select("*").order("kind").order("sort_order"),
      supabase.from("user_cosmetics").select("item_id").eq("user_id", uid),
      supabase.from("user_cosmetic_equip").select("frame_id,effect_id").eq("user_id", uid).maybeSingle(),
      supabase.from("profiles").select("username,display_name,avatar_url,coins").eq("id", uid).single(),
    ]);
    setItems(it.data || []);
    setOwned(new Set((inv.data || []).map((r) => r.item_id)));
    setEquip(eq.data || { frame_id: null, effect_id: null });
    setMe(pr.data || null);
  }, [uid]);

  useEffect(() => {
    load();
  }, [load]);

  const flash = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 2600);
  };

  const byId = useMemo(() => Object.fromEntries(items.map((i) => [i.id, i])), [items]);
  const pf = preview?.kind === "frame" ? preview : byId[equip.frame_id];
  const px = preview?.kind === "effect" ? preview : byId[equip.effect_id];
  const previewCos = {
    frame_style: pf?.style_key || null,
    frame_image: pf?.image_file || null,
    effect_style: px?.style_key || null,
    effect_image: px?.image_file || null,
  };

  const buy = async (it) => {
    if (busy) return;
    setBusy(true);
    const { data, error } = await supabase.rpc("buy_cosmetic", { p_item_id: it.id });
    setBusy(false);
    if (error || !data?.success) {
      flash(ERR[data?.error] || "Không mua được, thử lại nhé", false);
      return;
    }
    flash(`Đã mua ${it.name}`);
    setPreview(null);
    await load();
    refreshCosmetics(uid);
  };

  const toggleEquip = async (it) => {
    if (busy) return;
    setBusy(true);
    const on = equip[`${it.kind}_id`] === it.id;
    const { data, error } = await supabase.rpc("equip_cosmetic", {
      p_kind: it.kind,
      p_item_id: on ? null : it.id,
    });
    setBusy(false);
    if (error || !data?.success) {
      flash(ERR[data?.error] || "Không thực hiện được", false);
      return;
    }
    setPreview(null);
    await load();
    refreshCosmetics(uid);
  };

  const name = me?.display_name || me?.username || "Bạn";
  const list = items.filter((i) => i.kind === tab);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#effbf7_0%,#e6f5fb_100%)] pb-32 dark:bg-slate-950 dark:bg-none">
      <TopHeader />

      <main className="mx-auto max-w-md space-y-4 px-4 py-5 md:max-w-3xl">
        {/* Xem trước */}
        <section className="relative overflow-hidden rounded-[32px] bg-white px-6 pb-6 pt-7 text-center shadow-[0_8px_30px_rgba(15,70,90,.06)] dark:bg-slate-900">
          <CosmeticEffect cosmetic={previewCos} />
          <div className="relative z-10 mx-auto w-fit">
            <CosmeticAvatar src={me?.avatar_url} size={92} name={name} cosmetic={previewCos} />
          </div>
          <p className="relative z-10 mt-4 text-[18px] font-extrabold text-slate-900 dark:text-white">{name}</p>
          <p className="relative z-10 mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-mono text-[13px] font-bold text-amber-600">
            <Coins size={14} strokeWidth={2.6} /> {fmt(me?.coins)} xu
          </p>
          {preview && (
            <p className="relative z-10 mt-3 text-[13px] text-slate-500">
              Đang xem thử: <b className="text-slate-800 dark:text-slate-100">{preview.name}</b> ·{" "}
              <button onClick={() => setPreview(null)} className="font-semibold text-sky-600">
                Bỏ xem thử
              </button>
            </p>
          )}
        </section>

        {/* Tab */}
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded-full border px-4 py-2 text-[13px] font-bold transition ${
                tab === t.key
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Lưới vật phẩm */}
        <div className="grid grid-cols-2 gap-3">
          {list.map((it) => {
            const isOwned = owned.has(it.id);
            const isOn = equip[`${it.kind}_id`] === it.id;
            const [rLabel, rCls] = RARITY[it.rarity] || RARITY.common;
            const cantAfford = !isOwned && Number(me?.coins || 0) < it.price;
            const cos =
              it.kind === "frame"
                ? { frame_style: it.style_key, frame_image: it.image_file }
                : { effect_style: it.style_key, effect_image: it.image_file };
            return (
              <div
                key={it.id}
                onClick={() => setPreview(preview?.id === it.id ? null : it)}
                className={`cursor-pointer rounded-3xl bg-white p-3 text-center shadow-sm transition active:scale-[0.98] dark:bg-slate-900 ${
                  preview?.id === it.id ? "ring-2 ring-emerald-400" : ""
                }`}
              >
                <div className="relative mx-auto flex h-[84px] items-center justify-center overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-800">
                  {it.kind === "frame" ? (
                    <CosmeticAvatar src={me?.avatar_url} size={54} name={name} cosmetic={cos} />
                  ) : (
                    <CosmeticEffect cosmetic={cos} count={10} />
                  )}
                </div>
                <p className="mt-2 truncate text-[14px] font-extrabold text-slate-900 dark:text-white">{it.name}</p>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10.5px] font-bold ${rCls}`}>{rLabel}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isOwned) toggleEquip(it);
                    else buy(it);
                  }}
                  disabled={busy}
                  className={`mt-2 flex w-full items-center justify-center gap-1 rounded-full py-2 text-[13px] font-bold transition disabled:opacity-60 ${
                    isOn
                      ? "bg-emerald-500 text-white"
                      : isOwned
                      ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      : cantAfford
                      ? "bg-rose-50 text-rose-600"
                      : "bg-sky-500 text-white"
                  }`}
                >
                  {isOn ? (
                    "Đang dùng · Gỡ"
                  ) : isOwned ? (
                    "Trang bị"
                  ) : (
                    <>
                      <Coins size={13} strokeWidth={2.6} /> {fmt(it.price)}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {list.length === 0 && <p className="py-10 text-center text-[14px] text-slate-500">Chưa có vật phẩm nào.</p>}
      </main>

      {msg && (
        <div
          className={`fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm rounded-2xl px-4 py-3 text-center text-[14px] font-semibold text-white shadow-lg ${
            msg.ok ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          {msg.text}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
