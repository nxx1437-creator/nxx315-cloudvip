import React, { useEffect, useRef, useState } from "react";
import { Search, Flame, ChevronRight, ChevronLeft, X } from "lucide-react";
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

// ===== Thẻ game =====
export const GameCard = React.memo(function GameCard({ game, onClick }) {
  const { t } = useI18n();
  const [imageError, setImageError] = useState(false);
  const imageUrl = React.useMemo(() => getImageUrl(game.logo), [game.logo]);

  return (
    <button
      type="button"
      onClick={() => onClick(game)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:border-emerald-400 hover:shadow-md active:scale-[0.99]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-slate-50 to-emerald-50/50">
        {!imageError ? (
          <img
            src={imageUrl}
            alt={game.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-4xl">🎮</span>
          </div>
        )}

        {game.hot && (
          <div className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-2 py-1 shadow-md">
            <Flame size={10} className="fill-yellow-200 text-yellow-200" />
            <span className="font-mono text-[9px] font-black uppercase tracking-wide text-white">
              HOT
            </span>
          </div>
        )}

        <span className="absolute bottom-2 left-2 rounded-md border border-slate-200 bg-white/90 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-slate-500">
          {t(`st.cat.${game.category}`)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-tight text-slate-900">
          {game.name}
        </h3>
        <div className="mt-auto flex w-full items-center justify-center rounded-xl border-2 border-emerald-600 bg-white py-2.5 font-mono text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white">
          {t("st.topUp")}
        </div>
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

// ===== Banner (tự chạy, có mũi tên, vuốt trái/phải được) =====
export function BannerSlideshow({ navigate }) {
  const { t } = useI18n();
  const [pos, setPos] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  const [isPaused, setIsPaused] = useState(false);
  const touch = useRef({ x: 0, swiped: false });

  const valid = BANNERS.map((_, i) => i).filter((i) => !imageErrors[i]);
  const total = valid.length;
  const current = total ? valid[pos % total] : -1;

  // Tạm dừng khi đang cuộn trang
  useEffect(() => {
    let timer;
    const onScroll = () => {
      setIsPaused(true);
      clearTimeout(timer);
      timer = setTimeout(() => setIsPaused(false), 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  // Tự chuyển (đổi pos thì đếm lại từ đầu)
  useEffect(() => {
    if (total < 2 || isPaused) return;
    const id = setInterval(() => setPos((p) => p + 1), BANNER_INTERVAL);
    return () => clearInterval(id);
  }, [total, isPaused, pos]);

  const next = () => setPos((p) => (p + 1) % total);
  const prev = () => setPos((p) => (p - 1 + total) % total);

  const handleClick = () => {
    if (touch.current.swiped) {
      touch.current.swiped = false;
      return;
    }
    const banner = BANNERS[current];
    if (banner?.path) navigate(banner.path);
  };

  if (total === 0) return null;

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={(e) => {
        touch.current = { x: e.touches[0].clientX, swiped: false };
        setIsPaused(true);
      }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touch.current.x;
        if (Math.abs(dx) > 40 && total > 1) {
          touch.current.swiped = true;
          dx < 0 ? next() : prev();
        }
        setIsPaused(false);
      }}
      className="relative aspect-[2/1] w-full cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm"
    >
      {BANNERS.map((banner, index) => {
        if (imageErrors[index]) return null;
        return (
          <img
            key={banner.image}
            src={getImageUrl(banner.image)}
            alt={t("st.slide", { n: index + 1 })}
            loading={index === 0 ? "eager" : "lazy"}
            draggable={false}
            className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${
              index === current ? "z-10 opacity-100" : "z-0 opacity-0"
            }`}
            onError={() => setImageErrors((prev) => ({ ...prev, [index]: true }))}
          />
        );
      })}

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50"
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50"
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
            {valid.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPos(i);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  i === pos % total
                    ? "w-6 bg-emerald-400"
                    : "w-1.5 bg-white/70 hover:bg-white"
                }`}
                aria-label={t("st.slide", { n: i + 1 })}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
        }
