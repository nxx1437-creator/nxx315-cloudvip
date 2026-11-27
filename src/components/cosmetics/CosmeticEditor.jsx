// src/components/cosmetics/CosmeticEditor.jsx — trình chỉnh khung avatar / hiệu ứng hồ sơ (phong cách GitHub: mộc mạc, chuyên nghiệp, responsive web)
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Ban, Check, Coins, Lock } from "lucide-react";
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
const SWATCHES = ["#24292f", "#d0d7de", "#cf222e", "#0969da", "#1a7f37", "#bf8700"];

const cosOf = (it) => ({
  frame_style: it?.kind === "frame" ? it.style_key : null,
  frame_image: it?.kind === "frame" ? it.image_file : null,
  effect_style: it?.kind === "effect" ? it.style_key : null,
  effect_image: it?.kind === "effect" ? it.image_file : null,
});

const FONT = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
};

// Khung có tiêu đề, viền mảnh, bo 6px như các "Box" của GitHub
function Box({ title, right, children, className = "" }) {
  return (
    <section className={`overflow-hidden rounded-md border border-[#d0d7de] bg-white ${className}`}>
      {title && (
        <header className="flex items-center justify-between gap-2 border-b border-[#d0d7de] bg-[#f6f8fa] px-4 py-2.5">
          <h2 className="text-[14px] font-semibold text-[#1f2328]">{title}</h2>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}

export default function CosmeticEditor({ initialKind = "frame", onBack, onChanged }) {
  const navigate = useNavigate();
  const { session } = useSession();
  const uid = session?.user?.id;

  const [kind, setKind] = useState(initialKind === "effect" ? "effect" : "frame");
  const [items, setItems] = useState([]);
  const [owned, setOwned] = useState(new Set());
  const [equip, setEquip] = useState({ frame_id: null, effect_id: null });
  const [me, setMe] = useState(null);
  const [sel, setSel] = useState(null); // null = giữ nguyên | "none" | id đang xem thử
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [color, setColor] = useState("#24292f");

  // màu hồ sơ: hiện lưu trên trình duyệt (chưa lưu lên server)
  useEffect(() => {
    if (!uid) return;
    try {
      const c = localStorage.getItem(`cx_profile_color_${uid}`);
      if (c) setColor(c);
    } catch {}
  }, [uid]);
  const pickColor = (c) => {
    setColor(c);
    try {
      localStorage.setItem(`cx_profile_color_${uid}`, c);
    } catch {}
  };

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
    const res = locked
      ? await supabase.rpc("buy_cosmetic", { p_item_id: selItem.id })
      : await supabase.rpc("equip_cosmetic", { p_kind: kind, p_item_id: sel === "none" ? null : sel });
    setBusy(false);
    if (res.error || !res.data?.success) {
      flash(ERR[res.data?.error] || "Không thực hiện được, thử lại nhé", false);
      return;
    }
    flash(locked ? `Đã mua ${selItem.name}` : "Đã lưu thay đổi");
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
    <span className="flex h-full w-full items-center justify-center rounded-full bg-[#eaeef2] text-3xl font-semibold text-[#656d76]">
      {letter}
    </span>
  );

  const renderTile = (it) => {
    const isLocked = !owned.has(it.id);
    const on = curId === it.id;
    const picked = sel === it.id;
    return (
      <button
        key={it.id}
        type="button"
        onClick={() => setSel(picked ? null : it.id)}
        className={`relative flex flex-col items-center gap-2 rounded-md border bg-white px-2 pb-2.5 pt-3 text-center outline-none transition hover:bg-[#f6f8fa] focus-visible:ring-2 focus-visible:ring-[#0969da] ${
          picked ? "border-[#0969da] ring-1 ring-[#0969da]" : "border-[#d0d7de]"
        }`}
      >
        <span className="flex h-14 w-14 items-center justify-center overflow-hidden">
          {it.kind === "frame" ? (
            <span className="cx-avatar" style={{ width: 44, height: 44 }}>
              <CosmeticFrame cosmetic={cosOf(it)} w={4} />
            </span>
          ) : (
            <CosmeticEffect cosmetic={cosOf(it)} count={8} />
          )}
        </span>
        <span className="w-full truncate text-[13px] font-semibold text-[#1f2328]">{it.name}</span>
        {isLocked ? (
          <span className="inline-flex items-center gap-1 text-[12px] text-[#656d76]">
            <Lock size={11} />
            <Coins size={11} />
            {fmt(it.price)}
          </span>
        ) : (
          <span className="text-[12px] text-[#656d76]">{on ? "Đang dùng" : "Đã sở hữu"}</span>
        )}
        {on && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1a7f37] text-white">
            <Check size={10} strokeWidth={3.5} />
          </span>
        )}
      </button>
    );
  };

  const btnLabel = locked
    ? cantAfford
      ? `Chưa đủ xu · cần ${fmt(selItem.price)}`
      : `Mua · ${fmt(selItem.price)} xu`
    : "Lưu thay đổi";
  const btnDisabled = busy || cantAfford || (!locked && !dirty);

  const SaveButton = (
    <button
      type="button"
      onClick={save}
      disabled={btnDisabled}
      className="flex w-full items-center justify-center gap-2 rounded-md border border-[#1f232826] bg-[#1f2328] px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-[#32383f] disabled:cursor-not-allowed disabled:border-[#d0d7de] disabled:bg-[#eaeef2] disabled:text-[#8c959f]"
    >
      {locked && !cantAfford && <Coins size={15} />}
      {btnLabel}
    </button>
  );

  return (
    <div className="min-h-screen bg-white text-[#1f2328]" style={FONT}>
      {/* Thanh trên cùng */}
      <div className="border-b border-[#d0d7de] bg-[#f6f8fa]">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={onBack}
            aria-label="Quay lại"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#d0d7de] bg-white text-[#1f2328] hover:bg-[#f3f4f6]"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-[16px] font-semibold">Tùy chỉnh hồ sơ</h1>
            <p className="truncate text-[12px] text-[#656d76]">Khung avatar và hiệu ứng hồ sơ</p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[#d0d7de] bg-white px-3 py-1 text-[13px]">
            <Coins size={14} className="text-[#656d76]" />
            <b className="font-semibold">{fmt(coins)}</b>
            <span className="text-[#656d76]">xu</span>
          </span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-10">
        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
          {/* ===== Xem trước ===== */}
          <aside className="space-y-4 lg:sticky lg:top-6">
            <Box title="Xem trước">
              <div className="bg-[#f6f8fa] px-4 py-6">
                {kind === "frame" ? (
                  <div className="flex justify-center">
                    <div className="relative" style={{ width: "min(200px, 50vw)", height: "min(200px, 50vw)" }}>
                      <div className="h-full w-full overflow-hidden rounded-full bg-[#eaeef2]">{avatarFill}</div>
                      <CosmeticFrame cosmetic={previewCos} w={12} />
                    </div>
                  </div>
                ) : (
                  <div className="relative mx-auto w-full max-w-[320px] overflow-hidden rounded-md border border-[#d0d7de] bg-white">
                    <div className="relative h-[84px] w-full" style={{ background: color }}>
                      {me?.cover && <img src={me.cover} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="relative px-4 pb-4">
                      <div className="relative -mt-9 h-[72px] w-[72px] rounded-full bg-white ring-4 ring-white">
                        {avatarFill}
                        <CosmeticFrame cosmetic={previewCos} w={5} />
                      </div>
                      <p className="mt-2 text-[18px] font-semibold leading-6">{name}</p>
                      <p className="text-[13px] text-[#656d76]">@{name}</p>
                      <div className="mt-3 h-8 rounded-md bg-[#f6f8fa]" />
                    </div>
                    <CosmeticEffect cosmetic={previewCos} count={16} />
                  </div>
                )}
              </div>
              <div className="border-t border-[#d0d7de] px-4 py-3">
                <p className="text-[14px] font-semibold">{shown ? shown.name : "Không dùng"}</p>
                <p className="mt-0.5 text-[13px] text-[#656d76]">{DESC[kind]}</p>
              </div>
            </Box>

            <Box title="Màu hồ sơ">
              <div className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  {SWATCHES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Màu ${c}`}
                      onClick={() => pickColor(c)}
                      className={`h-7 w-7 rounded-md border transition hover:scale-105 ${
                        color.toLowerCase() === c
                          ? "border-[#0969da] ring-2 ring-[#0969da] ring-offset-2"
                          : "border-[#d0d7de]"
                      }`}
                      style={{ background: c }}
                    />
                  ))}
                  <label className="relative flex h-7 cursor-pointer items-center gap-1.5 rounded-md border border-[#d0d7de] bg-white px-2 text-[12px] font-semibold hover:bg-[#f6f8fa]">
                    <span className="h-3.5 w-3.5 rounded-sm border border-[#d0d7de]" style={{ background: color }} />
                    Tùy chọn
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => pickColor(e.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      aria-label="Chọn màu tùy ý"
                    />
                  </label>
                </div>
                <p className="mt-2 text-[12px] text-[#656d76]">Màu này áp dụng cho ảnh bìa mặc định của hồ sơ.</p>
              </div>
            </Box>

            <div className="hidden lg:block">{SaveButton}</div>
          </aside>

          {/* ===== Bảng chọn ===== */}
          <div className="min-w-0">
            {/* Tab gạch chân kiểu GitHub */}
            <nav className="mb-4 flex gap-1 border-b border-[#d0d7de]">
              {[
                ["frame", "Khung"],
                ["effect", "Hiệu ứng"],
              ].map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => switchKind(k)}
                  className={`-mb-px border-b-2 px-4 py-2 text-[14px] transition ${
                    kind === k
                      ? "border-[#fd8c73] font-semibold text-[#1f2328]"
                      : "border-transparent text-[#656d76] hover:border-[#d0d7de] hover:text-[#1f2328]"
                  }`}
                >
                  {label}
                  <span className="ml-1.5 rounded-full bg-[#afb8c133] px-1.5 py-px text-[12px] font-medium text-[#1f2328]">
                    {items.filter((i) => i.kind === k).length}
                  </span>
                </button>
              ))}
            </nav>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#d0d7de] bg-[#f6f8fa] px-4 py-2.5 text-[13px] text-[#1f2328]">
              <span>Vật phẩm có biểu tượng khóa được mở bằng xu.</span>
              <button
                type="button"
                onClick={() => navigate("/tasks")}
                className="font-semibold text-[#0969da] hover:underline"
              >
                Kiếm xu
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 min-[420px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5">
              <button
                type="button"
                onClick={() => setSel(sel === "none" ? null : "none")}
                className={`flex flex-col items-center gap-2 rounded-md border bg-white px-2 pb-2.5 pt-3 text-center outline-none transition hover:bg-[#f6f8fa] focus-visible:ring-2 focus-visible:ring-[#0969da] ${
                  sel === "none" ? "border-[#0969da] ring-1 ring-[#0969da]" : "border-[#d0d7de]"
                }`}
              >
                <span className="flex h-14 w-14 items-center justify-center text-[#8c959f]">
                  <Ban size={26} />
                </span>
                <span className="text-[13px] font-semibold">Không dùng</span>
                <span className="text-[12px] text-[#656d76]">Gỡ {kind === "frame" ? "khung" : "hiệu ứng"}</span>
              </button>
              {list.map(renderTile)}
            </div>
          </div>
        </div>
      </div>

      {msg && (
        <div
          className={`fixed inset-x-4 bottom-24 z-[70] mx-auto max-w-sm rounded-md border px-4 py-2.5 text-center text-[14px] font-semibold shadow-md lg:bottom-8 ${
            msg.ok
              ? "border-[#1a7f37] bg-[#dafbe1] text-[#1a7f37]"
              : "border-[#cf222e] bg-[#ffebe9] text-[#cf222e]"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Thanh lưu cố định: chỉ hiện trên điện thoại / màn nhỏ */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#d0d7de] bg-white px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 lg:hidden">
        <div className="mx-auto max-w-md">{SaveButton}</div>
      </div>
    </div>
  );
}
