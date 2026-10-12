import React, { useState } from "react";
import { Flame, ChevronRight } from "lucide-react";
import { useI18n } from "../../i18n/index.js";
import { BANNERS, GAMES, getImageUrl } from "../../lib/storeData.js";

// ===== Tiêu đề section: chữ màu + chữ đen (kiểu Kick) =====
export function SectionTitle({ accent, rest, right, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <Tag
        type={onClick ? "button" : undefined}
        onClick={onClick}
        className="flex items-center gap-1 text-left"
      >
        <h2 className="text-xl font-extrabold leading-tight text-slate-900">
          <span className="text-emerald-600">{accent}</span> {rest}
        </h2>
        {onClick && <ChevronRight size={22} className="text-slate-400" />}
      </Tag>
      {right}
    </div>
  );
}

// ===== Nhãn nhỏ: chấm xanh + chữ =====
function DotPill({ children, small }) {
  return (
    <span
      className={`flex items-center rounded-lg bg-slate-900/80 font-mono font-bold uppercase text-white backdrop-blur-sm ${
        small ? "gap-1 px-1.5 py-0.5 text-[9px]" : "gap-1.5 px-2 py-1 text-[10px]"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      {children}
    </span>
  );
}

// ===== Chấm lửa HOT (chỉ icon, không chữ) =====
function HotDot() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-rose-500 shadow">
      <Flame size={11} className="fill-yellow-200 text-yellow-200" />
    </span>
  );
}

// ===== Thẻ Nổi bật (kiểu thẻ stream Kick) =====
function FeaturedCard({ item, onClick }) {
  const { t, lang } = useI18n();
  const [failed, setFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const { game } = item;

  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className="relative aspect-[4/3] w-[88%] max-w-[440px] shrink-0 snap-start overflow-hidden rounded-2xl bg-[#14161a] text-left shadow-sm transition active:scale-[0.99]"
    >
      {!failed && (
        <img
          src={getImageUrl(item.image)}
          alt={game.name}
          draggable={false}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}

      <div className="absolute left-3 top-3 flex items-center gap-1.5">
        <DotPill>{t(`st.cat.${game.category}`)}</DotPill>
        {game.hot && <HotDot />}
      </div>

      {/* Đáy: ảnh mờ dần vào nền tối đặc */}
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-[#14161a] via-[#14161a]/90 to-transparent px-3 pb-3.5 pt-24">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
          {!logoFailed ? (
            <img
              src={getImageUrl(game.logo)}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <span className="text-xl">🎮</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-lg font-extrabold leading-tight text-white">
              {game.name}
            </p>
            <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white/90">
              {t("st.topUp")}
            </span>
          </div>
          <p className="mt-0.5 truncate text-sm text-slate-400">
            {item.desc?.[lang === "en" ? "en" : "vi"]}
          </p>
        </div>
      </div>
    </button>
  );
}

// ===== Hàng "Nổi bật" cuộn ngang =====
export function FeaturedRow({ navigate, onTitleClick }) {
  const { lang } = useI18n();
  const en = lang === "en";

  const items = BANNERS.map((b) => ({
    ...b,
    game: GAMES.find((g) => g.path === b.path),
  })).filter((b) => b.game);

  if (items.length === 0) return null;

  return (
    <section>
      <SectionTitle
        accent={en ? "Featured" : "Nổi bật"}
        rest={en ? "for you" : "dành cho bạn"}
        onClick={onTitleClick}
      />
      <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <FeaturedCard
            key={item.image}
            item={item}
            onClick={(it) => navigate(it.path)}
          />
        ))}
      </div>
    </section>
  );
}

// ===== Thẻ dọc có vạch chồng phía trên =====
function CoverCard({ game, onClick }) {
  const { t } = useI18n();
  // 0 = ảnh cover, 1 = logo cũ, 2 = emoji
  const [step, setStep] = useState(game.cover ? 0 : 1);

  const src =
    step === 0 ? getImageUrl(game.cover) : step === 1 ? getImageUrl(game.logo) : null;

  return (
    <div>
      <div className="mx-3 h-[3px] rounded-t-full bg-slate-300" />
      <div className="mx-1.5 h-[3px] rounded-t-full bg-slate-200" />

      <button
        type="button"
        onClick={() => onClick(game)}
        className="relative block aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-emerald-50 text-left shadow-sm transition active:scale-[0.97]"
      >
        {src ? (
          <img
            src={src}
            alt={game.name}
            loading="lazy"
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setStep((s) => s + 1)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl">
            🎮
          </div>
        )}

        <div className="absolute left-1.5 top-1.5">
          <DotPill small>{t(`st.cat.${game.category}`)}</DotPill>
        </div>
        {game.hot && (
          <div className="absolute right-1.5 top-1.5">
            <HotDot />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-2.5 pb-2.5 pt-10">
          <p className="line-clamp-2 text-[13px] font-extrabold leading-tight text-white">
            {game.name}
          </p>
        </div>
      </button>
    </div>
  );
}

// ===== Lưới thẻ dọc =====
export function CoverGrid({ games, onSelect }) {
  return (
    <div className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4 lg:grid-cols-6">
      {games.map((game) => (
        <CoverCard key={game.id} game={game} onClick={onSelect} />
      ))}
    </div>
  );
                           }
