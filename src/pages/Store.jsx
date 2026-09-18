import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Flame,
  ChevronRight,
  ChevronLeft,
  History as HistoryIcon,
  TrendingUp,
} from 'lucide-react';

import TopHeader from '../components/TopHeader.jsx';
import BottomNav from '../components/BottomNav.jsx';
import { supabase } from '../lib/supabaseClient.js';

const SUPABASE_URL = 'https://rwglwovohbyqmbbzdvdj.supabase.co';
const STORAGE_BUCKET = 'game_logos';

const getImageUrl = (fileName) =>
  `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;

// ============= BANNER SLIDES =============
const BANNERS = [
  { image: 'store-banner-1.png', path: '/store/free-fire' },
  { image: 'store-banner-2.png', path: '/store/play-together' },
  { image: 'store-banner-3.png', path: '/store/lien-quan' },
  { image: 'store-banner-4.png', path: '/store/roblox' },
  { image: 'store-banner-5.png', path: '/store/pubg-mobile' },
];

const BANNER_INTERVAL = 4000;

// ============= GAMES =============

const GAMES = [
  { id: 1, name: 'Roblox', category: 'pc', logo: 'roblox.png', path: '/store/roblox', hot: true },
  { id: 2, name: 'Play Together VNG', category: 'mobile', logo: 'play-together-vng.png', path: '/store/play-together', hot: true },
  { id: 3, name: 'Liên Quân Mobile', category: 'mobile', logo: 'lien-quan-mobile.png', path: '/store/lien-quan', hot: true },
  { id: 4, name: 'Free Fire', category: 'mobile', logo: 'free-fire.png', path: '/store/free-fire', hot: true },
  { id: 5, name: 'PUBG Mobile VN', category: 'mobile', logo: 'pubg-mobile-vn.png', path: '/store/pubg-mobile', hot: true },
  { id: 6, name: 'VALORANT', category: 'pc', logo: 'valorant.png', path: '/store/valorant' },
  { id: 7, name: 'OMG 3Q', category: 'mobile', logo: 'omg-3q.png', path: '/store/omg-3q' },
  { id: 8, name: 'Delta Force', category: 'mobile', logo: 'Delta.png', path: '/store/Delta-Force', hot: true },
  { id: 9, name: 'ZingSpeed Mobile', category: 'mobile', logo: 'zing-speed-mobile.png', path: '/store/zing-speed' },
  { id: 10, name: 'FC Mobile VN', category: 'mobile', logo: 'fc-mobile.png', path: '/store/fc-mobile' },
];

// ============= TRACKING =============

const VIEW_STORAGE_KEY = 'nxx315_viewed_games';

function getViewedGames() {
  try {
    const raw = localStorage.getItem(VIEW_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function trackGameView(gameId) {
  try {
    const viewed = getViewedGames();
    viewed[gameId] = (viewed[gameId] || 0) + 1;
    const entries = Object.entries(viewed)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
    localStorage.setItem(
      VIEW_STORAGE_KEY,
      JSON.stringify(Object.fromEntries(entries))
    );
  } catch {}
}

function getRecommendedGames(limit = 4) {
  const viewed = getViewedGames();
  const viewedIds = Object.keys(viewed).map((id) => Number(id));

  if (viewedIds.length === 0) {
    return GAMES.filter((g) => g.hot).slice(0, limit);
  }

  const scored = GAMES.map((game) => {
    const viewCount = viewed[game.id] || 0;
    const hotBonus = game.hot ? 5 : 0;
    return { game, score: viewCount * 10 + hotBonus };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.game);
    }
// ============= MAIN STORE =============

export default function Store() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    setRecommended(getRecommendedGames(4));
  }, []);

  const filteredGames = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return GAMES.filter((game) => {
      const matchesCategory =
        activeTab === 'all' || game.category === activeTab;
      const matchesSearch =
        !keyword || game.name.toLowerCase().includes(keyword);
      return matchesCategory && matchesSearch;
    });
  }, [search, activeTab]);

  const handleGameClick = (game) => {
    trackGameView(game.id);
    navigate(game.path);
  };

  const tabs = [
    { id: 'all', label: 'TẤT CẢ' },
    { id: 'mobile', label: 'MOBILE' },
    { id: 'pc', label: 'PC' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <TopHeader />

      <StoreHeader
        search={search}
        setSearch={setSearch}
        navigate={handleGameClick}
      />

      {/* Banner slideshow */}
      <BannerSlideshow navigate={navigate} />

      {/* ĐỀ XUẤT CHO BẠN */}
      {recommended.length > 0 && (
        <section className="pt-6">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-4 px-4 text-xl font-black uppercase text-gray-900">
              DÀNH CHO BẠN
            </h2>

            <div className="flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {recommended.map((game) => (
                <div
                  key={game.id}
                  className="w-[150px] shrink-0 sm:w-[170px]"
                >
                  <GameCard
                    game={game}
                    onClick={handleGameClick}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* DANH SÁCH GAME */}
      <section className="px-4 pt-7">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-xl font-black uppercase text-gray-900">
            DANH SÁCH GAME
          </h2>

          {/* Tab filter */}
          <div className="mb-4 flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 rounded-lg px-5 py-2.5 text-xs font-black uppercase tracking-wide transition ${
                    isActive
                      ? 'border-2 border-orange-500 bg-orange-50 text-orange-600'
                      : 'border-2 border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onClick={handleGameClick}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 py-16 text-center">
              <Search size={36} className="mx-auto mb-3 text-gray-300" />
              <p className="font-bold text-gray-600">Không tìm thấy game</p>
              <p className="mt-1 text-sm text-gray-400">Thử từ khóa khác</p>
            </div>
          )}
        </div>
      </section>

      {/* 👇 LỊCH SỬ ĐƠN HÀNG */}
      <StoreHistoryPreview />

      <BottomNav />
    </div>
  );
            }
// ============= STORE HEADER =============

function StoreHeader({ search, setSearch, navigate }) {
  const [focused, setFocused] = useState(false);

  const keyword = search.trim().toLowerCase();

  const results = keyword
    ? GAMES.filter((game) =>
        game.name.toLowerCase().includes(keyword)
      ).slice(0, 5)
    : [];

  const goToGame = (game) => {
    setSearch('');
    setFocused(false);
    navigate(game);
  };

  const handleKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    if (!keyword) return;

    const firstMatch = GAMES.find((game) =>
      game.name.toLowerCase().includes(keyword)
    );

    if (firstMatch) goToGame(firstMatch);
  };

  return (
    <div className="border-b border-gray-100 px-4 pb-3 pt-3">
      <div className="mx-auto max-w-5xl">
        <div className="relative">
          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100">
            <Search size={20} className="shrink-0 text-gray-500" />
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
              placeholder="Tìm game bạn muốn nạp..."
              className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-500"
            />
          </div>

          {focused && keyword && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
              {results.length > 0 ? (
                <div className="py-1">
                  {results.map((game) => (
                    <button
                      key={game.id}
                      type="button"
                      onClick={() => goToGame(game)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-orange-50 active:bg-orange-100"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50 p-1">
                        <GameImage
                          src={getImageUrl(game.logo)}
                          alt={game.name}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-gray-800">
                          {game.name}
                        </p>
                        <p className="mt-0.5 text-[9px] text-gray-400">
                          {game.category === 'pc' ? 'PC' : 'Mobile'}
                        </p>
                      </div>
                      <ChevronRight
                        size={14}
                        className="shrink-0 text-orange-500"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Search
                    size={28}
                    className="mx-auto mb-2 text-gray-300"
                  />
                  <p className="text-xs font-bold text-gray-600">
                    Không tìm thấy game
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============= BANNER SLIDESHOW =============

function BannerSlideshow({ navigate }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const validBanners = BANNERS.filter((_, idx) => !imageErrors[idx]);
  const hasBanners = validBanners.length > 0;

  useEffect(() => {
    if (!hasBanners || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
    }, BANNER_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasBanners, isPaused]);

  const goToSlide = (index, e) => {
    if (e) e.stopPropagation();
    setCurrentIndex(index);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const goPrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const goNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleBannerClick = () => {
    const currentBanner = BANNERS[currentIndex];
    if (currentBanner?.path) {
      navigate(currentBanner.path);
    }
  };

  if (!hasBanners) return null;

  return (
    <section className="px-4 pt-3">
      <div className="mx-auto max-w-5xl">
        <div
          onClick={handleBannerClick}
          className="relative aspect-[2/1] w-full cursor-pointer overflow-hidden rounded-2xl bg-gray-100"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {BANNERS.map((banner, index) => {
            if (imageErrors[index]) return null;

            return (
              <img
                key={banner.image}
                src={getImageUrl(banner.image)}
                alt={`Banner ${index + 1}`}
                className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                  index === currentIndex ? 'opacity-100' : 'opacity-0'
                }`}
                onError={() => {
                  setImageErrors((prev) => ({ ...prev, [index]: true }));
                }}
              />
            );
          })}

          {BANNERS.length > 1 && (
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50"
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {BANNERS.length > 1 && (
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50"
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
          )}

          {BANNERS.length > 1 && (
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
              {BANNERS.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => goToSlide(index, e)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-6 bg-orange-500'
                      : 'w-1.5 bg-white/70 hover:bg-white'
                  }`}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ============= GAME CARD =============

function GameCard({ game, onClick }) {
  const [imageError, setImageError] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onClick(game)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {!imageError ? (
          <img
            src={getImageUrl(game.logo)}
            alt={game.name}
            loading="lazy"
            className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-4xl">🎮</span>
          </div>
        )}

        {game.hot && (
          <div className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-2 py-1 shadow-md">
            <Flame size={10} className="fill-yellow-300 text-yellow-300" />
            <span className="text-[9px] font-black uppercase tracking-wide text-white">
              HOT
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <h3 className="line-clamp-2 text-sm font-bold leading-tight text-gray-900">
          {game.name}
        </h3>

        <div className="mt-auto flex w-full items-center justify-center rounded-lg border-2 border-orange-500 bg-white py-2.5 text-xs font-black uppercase text-orange-500 transition group-hover:bg-orange-500 group-hover:text-white">
          Nạp ngay
        </div>
      </div>
    </button>
  );
}

// ============= GAME IMAGE (fallback cho search) =============

function GameImage({ src, alt }) {
  const [error, setError] = useState(false);

  if (error) {
    return <span className="text-lg">🎮</span>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-contain"
      onError={() => setError(true)}
    />
  );
                       }
// ============= HISTORY HELPERS =============

function formatHistoryDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getHistoryStatus(status) {
  switch (String(status || '').toLowerCase()) {
    case 'pending':
      return {
        label: 'Chờ thanh toán',
        className: 'bg-gray-50 text-gray-500 border-gray-100',
      };
    case 'paid':
      return {
        label: 'Đang kiểm tra',
        className: 'bg-blue-50 text-blue-600 border-blue-100',
      };
    case 'processing':
      return {
        label: 'Đang xử lý',
        className: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      };
    case 'delivered':
      return {
        label: 'Đã giao',
        className: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      };
    case 'rejected':
      return {
        label: 'Đã từ chối',
        className: 'bg-red-50 text-red-600 border-red-100',
      };
    case 'cancelled':
    case 'canceled':
      return {
        label: 'Đã hủy',
        className: 'bg-gray-50 text-gray-600 border-gray-100',
      };
    case 'failed':
      return {
        label: 'Thất bại',
        className: 'bg-red-50 text-red-600 border-red-100',
      };
    default:
      return {
        label: 'Đang xử lý',
        className: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      };
  }
}

function getHistoryAmount(order) {
  const coins =
    order?.coin_cost ??
    order?.coins ??
    order?.coin_amount ??
    order?.amount_coins ??
    order?.price_coins;

  if (coins != null) return `${Number(coins).toLocaleString('vi-VN')} xu`;

  const money =
    order?.price_vnd ?? order?.amount_vnd ?? order?.amount ?? order?.amount_money;

  if (money != null) return `${Number(money).toLocaleString('vi-VN')}đ`;

  return '—';
}

function detectHistoryGame(packageId) {
  const pid = String(packageId || '').toLowerCase();

  if (
    pid.startsWith('vng-') ||
    pid.startsWith('card-') ||
    pid.includes('roblox') ||
    pid.includes('robux')
  ) {
    return 'roblox';
  }

  if (pid.startsWith('lq-') || pid.includes('lienquan')) return 'lienquan';

  if (pid.startsWith('pt-') || pid.includes('playtogether')) {
    return 'playtogether';
  }

  if (pid.startsWith('ff-') || pid.includes('freefire')) return 'freefire';

  if (pid.startsWith('pubg-') || pid.includes('pubg')) return 'pubg';

  if (pid.startsWith('fco-') || pid.includes('fco') || pid.includes('fcmobile')) {
    return 'fco';
  }

  return null;
}

function getGameNameByPackage(packageId) {
  const game = detectHistoryGame(packageId);
  if (game === 'roblox') return 'Roblox';
  if (game === 'lienquan') return 'Liên Quân Mobile';
  if (game === 'playtogether') return 'Play Together';
  if (game === 'freefire') return 'Free Fire';
  if (game === 'pubg') return 'PUBG Mobile VN';
  if (game === 'fco') return 'FC Mobile VN';
  return null;
}

function getHistoryName(order) {
  const gameKey = detectHistoryGame(order?.package_id);

  if (gameKey === 'playtogether' && order?.pt_gold != null) {
    return `${Number(order.pt_gold).toLocaleString('vi-VN')} Thỏi Vàng`;
  }
  if (gameKey === 'lienquan' && order?.quanhuy != null) {
    return `${Number(order.quanhuy).toLocaleString('vi-VN')} Quân Huy`;
  }
  if (gameKey === 'roblox' && order?.robux != null) {
    return `${Number(order.robux).toLocaleString('vi-VN')} Robux`;
  }
  if (gameKey === 'freefire' && order?.ff_diamond != null) {
    return `${Number(order.ff_diamond).toLocaleString('vi-VN')} Kim Cương`;
  }
  if (gameKey === 'pubg' && order?.pubg_uc != null) {
    const uc = Number(order.pubg_uc).toLocaleString('vi-VN');
    const bonus = Number(order.pubg_bonus || 0);
    return bonus > 0
      ? `${uc} UC + ${bonus.toLocaleString('vi-VN')} Bonus`
      : `${uc} UC`;
  }
  if (gameKey === 'fco' && order?.fco_fc != null) {
    return `${Number(order.fco_fc).toLocaleString('vi-VN')} FC`;
  }

  return 'Đơn nạp game';
}

function getHistoryImage(order) {
  const packageId = String(order?.package_id || '').toLowerCase();

  if (packageId.startsWith('pubg-') || packageId.includes('pubg')) {
    return getImageUrl('pubg-mobile-vn.png');
  }
  if (packageId.startsWith('ff-') || packageId.includes('freefire')) {
    return getImageUrl('free-fire.png');
  }
  if (packageId.startsWith('lq-') || packageId.includes('lienquan')) {
    return getImageUrl('lien-quan-mobile.png');
  }
  if (packageId.startsWith('pt-') || packageId.includes('playtogether')) {
    return getImageUrl('play-together-vng.png');
  }
  if (packageId.startsWith('vng-') || packageId.includes('roblox')) {
    return getImageUrl('roblox.png');
  }
  if (packageId.startsWith('fco-') || packageId.includes('fco')) {
    return getImageUrl('fc-mobile.png');
  }

  return getImageUrl('store-banner-1.png');
}
// ============= STORE HISTORY PREVIEW =============

function StoreHistoryPreview() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const loadHistory = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (alive) setLoading(false);
          return;
        }

        const [ordersResult, redemptionResult] = await Promise.all([
          supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('redemption_orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

        if (ordersResult.error) throw ordersResult.error;
        if (redemptionResult.error) throw redemptionResult.error;

        const merged = [
          ...(ordersResult.data || []).map((order) => ({
            ...order,
            historySource: 'orders',
          })),
          ...(redemptionResult.data || []).map((order) => ({
            ...order,
            historySource: 'redemption_orders',
          })),
        ]
          .sort(
            (a, b) =>
              new Date(b.created_at || 0) - new Date(a.created_at || 0)
          )
          .slice(0, 5);

        if (alive) setHistory(merged);
      } catch (error) {
        console.error('Store history error:', error);
        if (alive) setHistory([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadHistory();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="px-4 pb-6 pt-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">
              Giao dịch
            </p>
            <h2 className="mt-1 text-xl font-black uppercase text-gray-900">
              Lịch sử
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate('/history')}
            className="flex items-center gap-1 text-xs font-bold text-orange-500"
          >
            Xem tất cả
            <ChevronRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="w-full animate-pulse rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-gray-100" />
                  <div className="min-w-0 flex-1">
                    <div className="h-3.5 w-32 rounded bg-gray-100" />
                    <div className="mt-2 h-2.5 w-24 rounded bg-gray-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-orange-50">
              <HistoryIcon size={20} className="text-orange-400" />
            </div>
            <p className="mt-3 text-sm font-bold text-gray-700">
              Chưa có giao dịch
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Đơn hàng của bạn sẽ xuất hiện ở đây
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((order) => {
              const status = getHistoryStatus(order.status);
              const gameName = getGameNameByPackage(order.package_id);

              return (
                <button
                  key={`${order.historySource}-${order.id}`}
                  type="button"
                  onClick={() =>
                    navigate(
                      `/history/order/${order.id}?source=${order.historySource}`
                    )
                  }
                  className="w-full rounded-2xl border border-gray-100 bg-white p-3.5 text-left shadow-sm transition hover:border-orange-100 hover:shadow-md active:scale-[0.995]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                      <img
                        src={getHistoryImage(order)}
                        alt=""
                        className="h-full w-full object-contain p-1.5"
                        onError={(e) => {
                          if (e.currentTarget.dataset.fallback === '1') return;
                          e.currentTarget.dataset.fallback = '1';
                          e.currentTarget.src = getImageUrl(
                            'store-banner-1.png'
                          );
                        }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-gray-900">
                        {getHistoryName(order)}
                      </p>

                      {gameName && (
                        <p className="mt-0.5 text-[10px] font-semibold text-orange-600">
                          {gameName}
                        </p>
                      )}

                      <p className="mt-1 text-[10px] text-gray-400">
                        {formatHistoryDate(order.created_at)}
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span
                          className={`rounded-full border px-2 py-1 text-[9px] font-bold ${status.className}`}
                        >
                          {status.label}
                        </span>
                        <span className="text-[10px] font-bold text-orange-600">
                          {getHistoryAmount(order)}
                        </span>
                      </div>
                    </div>

                    <ChevronRight
                      size={17}
                      className="shrink-0 text-orange-300"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
                }
