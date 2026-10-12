import React, { useEffect, useRef, useState } from "react";
import { Search, Flame, ChevronRight, X, ArrowRight } from "lucide-react";
import { useI18n } from "../../i18n/index.js";
import { BANNERS, BANNER_INTERVAL, GAMES, getImageUrl } from "../../lib/storeData.js";

// ===== Ảnh game (có ảnh dự phòng) =====
export function GameImage({ src, alt }) {
  const [error, setError] = useState(false);
  if (error) return <span className="text-lg">🎮</span>;
  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-contain"
      onError={() => setError(true)}
    />
  );
}

// ===== Thẻ game (gọn) =====
export const GameCard = React.memo(function GameCard({ game, onClick }) {
  const { t } = useI18n();
  const [imageError, setImageError] = useState(false);
  const imageUrl = React.useMemo(() => getImageUrl(game.logo), [game.logo]);

  return (
    <button
      type="button"
      onClick={() => onClick(game)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:border-emerald-400 active:scale-[0.98]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-slate-50 to-emerald-50/50">
        {!imageError ? (
          <img
            src={imageUrl}
            alt={game.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-4xl">🎮</span>
          </div>
        )}

        {game.hot && (
          <span className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-2 py-1 shadow">
            <Flame size={10} className="fill-yellow-200 text-yellow-200" />
            <span className="font-mono text-[9px] font-black text-white">HOT</span>
          </span>
        )}

        <span className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-lg bg-slate-900/80 px-2 py-1 font-mono text-[9px] font-bold uppercase text-white backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {t(`st.cat.${game.category}`)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <h3 className="truncate text-sm font-bold text-slate-900">
          {game.name}
        </h3>
        <ChevronRight size={16} className="shrink-0 text-emerald-600" />
      </div>
    </button>
  );
});
// ===== Tìm kiếm có nút xoá =====
export function StoreSearch({ search, setSearch, onSelect }) {
  const { t } = useI18n();
  const [focused, setFocused] = useState(false);
  const keyword = search.trim().toLowerCase();

  const results = keyword
    ? GAMES.filter((g) => g.name.toLowerCase().includes(keyword)).slice(0, 5)
    : [];

  const pick = (game) => {
    setSearch("");
    setFocused(false);
    onSelect(game);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && results[0]) pick(results[0]);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100">
        <Search size={19} className="shrink-0 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setFocused(true);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={t("st.searchPh")}
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {focused && keyword && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          {results.length > 0 ? (
            <div className="py-1">
              {results.map((game) => (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => pick(game)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-emerald-50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50 p-1">
                    <GameImage src={getImageUrl(game.logo)} alt={game.name} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {game.name}
                    </p>
                    <p className="font-mono text-[10px] uppercase text-slate-400">
                      {t(`st.cat.${game.category}`)}
                    </p>
                  </div>
                  <ChevronRight size={14} className="shrink-0 text-emerald-600" />
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Search size={26} className="mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-bold text-slate-600">{t("st.noGame")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
// ===== Carousel "Nổi bật" (thẻ lớn, tự chạy, vuốt được) =====
export function FeaturedCarousel({ navigate }) {
  const { t, lang } = useI18n();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState({});
  const touch = useRef({ x: 0, swiped: false });

  const items = BANNERS.map((b, i) => ({
    ...b,
    i,
    game: GAMES.find((g) => g.path === b.path),
  })).filter((b) => !failed[b.i]);

  const total = items.length;
  const cur = total ? index % total : 0;

  useEffect(() => {
    if (total < 2 || paused) return;
    const id = setInterval(() => setIndex((p) => p + 1), BANNER_INTERVAL);
    return () => clearInterval(id);
  }, [total, paused, index]);

  const next = () => setIndex((p) => (p + 1) % total);
  const prev = () => setIndex((p) => (p - 1 + total) % total);

  const go = (item) => {
    if (touch.current.swiped) {
      touch.current.swiped = false;
      return;
    }
    if (item.path) navigate(item.path);
  };

  if (total === 0) return null;

  return (
    <section>
      <div
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(e) => {
          touch.current = { x: e.touches[0].clientX, swiped: false };
          setPaused(true);
        }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touch.current.x;
          if (Math.abs(dx) > 40 && total > 1) {
            touch.current.swiped = true;
            dx < 0 ? next() : prev();
          }
          setPaused(false);
        }}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${cur * 100}%)` }}
        >
          {items.map((item) => {
            const game = item.game;
            return (
              <div
                key={item.image}
                onClick={() => go(item)}
                className="w-full shrink-0 cursor-pointer"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                  <img
                    src={getImageUrl(item.image)}
                    alt={game?.name || ""}
                    draggable={false}
                    className="pointer-events-none h-full w-full object-cover"
                    onError={() =>
                      setFailed((prev) => ({ ...prev, [item.i]: true }))
                    }
                  />
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {game && (
                      <span className="rounded-full border border-slate-200 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        {t(`st.cat.${game.category}`)}
                      </span>
                    )}
                    {game?.hot && (
                      <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-3 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-white">
                        <Flame size={11} className="fill-yellow-200 text-yellow-200" />
                        HOT
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-extrabold leading-tight text-slate-900">
                    {game?.name}
                  </h2>
                  <p className="text-sm leading-relaxed text-slate-500">
                    {item.desc?.[lang === "en" ? "en" : "vi"]}
                  </p>

                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white">
                    {t("st.topUp")}
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {total > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={t("st.slide", { n: i + 1 })}
              className={`h-2 rounded-full transition-all ${
                i === cur ? "w-6 bg-emerald-600" : "w-2 bg-slate-300"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ===== Hàng thẻ cuộn ngang có tiêu đề "Tên >" =====
export function GameRow({ title, games, onSelect, onTitleClick }) {
  const { t } = useI18n();

  return (
    <section>
      <button
        type="button"
        onClick={onTitleClick}
        disabled={!onTitleClick}
        className="mb-3 flex items-center gap-1 text-left text-lg font-extrabold text-slate-900 disabled:cursor-default"
      >
        {title}
        {onTitleClick && <ChevronRight size={20} className="text-slate-400" />}
      </button>

      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {games.map((game) => (
          <button
            key={game.id}
            type="button"
            onClick={() => onSelect(game)}
            className="group w-[210px] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition active:scale-[0.98]"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-slate-50 to-emerald-50/60">
              <img
                src={getImageUrl(game.logo)}
                alt={game.name}
                loading="lazy"
                draggable={false}
                className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-105"
              />
              <span className="absolute left-2 top-2 flex items-center gap-1.5 rounded-lg bg-slate-900/80 px-2 py-1 font-mono text-[10px] font-bold uppercase text-white backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {t(`st.cat.${game.category}`)}
              </span>
              {game.hot && (
                <span className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-2 py-1">
                  <Flame size={10} className="fill-yellow-200 text-yellow-200" />
                  <span className="font-mono text-[9px] font-black text-white">
                    HOT
                  </span>
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-bold text-slate-900">
                {game.name}
              </p>
              <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                {t("st.topUp")}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
