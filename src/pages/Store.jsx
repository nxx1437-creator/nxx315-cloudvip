import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Gift,
  Trophy,
  CreditCard,
  Percent,
  ChevronRight,
  Gamepad2,
  Sparkles,
  History as HistoryIcon,
} from 'lucide-react';

import TopHeader from '../components/TopHeader.jsx';
import BottomNav from '../components/BottomNav.jsx';
import { supabase } from '../lib/supabaseClient.js';

// =====================================================
// SUPABASE STORAGE
// =====================================================

const SUPABASE_URL =
  'https://rwglwovohbyqmbbzdvdj.supabase.co';

const STORAGE_BUCKET = 'game_logos';

const getImageUrl = (fileName) =>
  `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;

// =====================================================
// BANNER
// =====================================================

const BANNER = 'store-banner.jpg';

// =====================================================
// GAMES
// =====================================================

const GAMES = [
  {
    id: 1,
    name: 'Roblox',
    category: 'pc',
    logo: 'roblox.png',
    path: '/store/roblox',
  },
  {
    id: 2,
    name: 'Play Together VNG',
    category: 'mobile',
    logo: 'play-together-vng.png',
    path: '/store/play-together',
  },
  {
    id: 3,
    name: 'Liên Quân Mobile',
    category: 'mobile',
    logo: 'lien-quan-mobile.png',
    path: '/store/lien-quan',
  },
  {
    id: 4,
    name: 'Free Fire',
    category: 'mobile',
    logo: 'free-fire.png',
    path: '/store/free-fire',
  },
  {
    id: 5,
    name: 'PUBG Mobile VN',
    category: 'mobile',
    logo: 'pubg-mobile-vn.png',
    path: '/store/pubg-mobile',
  },
  {
    id: 6,
    name: 'VALORANT',
    category: 'pc',
    logo: 'valorant.png',
    path: '/store/valorant',
  },
  {
    id: 7,
    name: 'OMG 3Q',
    category: 'mobile',
    logo: 'omg-3q.png',
    path: '/store/omg-3q',
  },
  {
    id: 8,
    name: 'Delta Force',
    category: 'mobile',
    logo: 'Delta.png',
    path: '/store/Delta-Force',
  },
  {
    id: 9,
    name: 'ZingSpeed Mobile',
    category: 'mobile',
    logo: 'zing-speed-mobile.png',
    path: '/store/zing-speed',
  },
  {
    id: 10,
    name: 'FC Online',
    category: 'pc',
    logo: 'fc-online.png',
    path: '/store/fc-online',
  },
  {
    id: 11,
    name: 'Minecraft',
    category: 'pc',
    logo: 'minecraft.png',
    path: '/store/minecraft',
  },
  {
    id: 12,
    name: 'Among Us',
    category: 'mobile',
    logo: 'among-us.png',
    path: '/store/among-us',
  },
];

// =====================================================
// BENEFITS
// =====================================================

const BENEFITS = [
  {
    id: 1,
    icon: Gift,
    title: 'Ưu đãi',
    text: 'Nhiều ưu đãi',
  },
  {
    id: 2,
    icon: Trophy,
    title: 'Độc quyền',
    text: 'Vật phẩm hot',
  },
  {
    id: 3,
    icon: CreditCard,
    title: 'An toàn',
    text: 'Thanh toán nhanh',
  },
  {
    id: 4,
    icon: Percent,
    title: 'Giá tốt',
    text: 'Tiết kiệm hơn',
  },
];

// =====================================================
// IMAGE FALLBACK
// =====================================================

function GameImage({ src, alt }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
        <Gamepad2 size={34} strokeWidth={1.5} />
        <span className="text-[9px] mt-1">
          Đang cập nhật
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="w-full h-full object-contain"
      onError={() => setError(true)}
    />
  );
}

// =====================================================
// SEARCH HEADER
// =====================================================

function StoreHeader({
  search,
  setSearch,
  navigate,
}) {
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
    navigate(game.path);
  };

  const handleKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    if (!keyword) return;

    const exactMatch = GAMES.find(
      (game) =>
        game.name.toLowerCase() === keyword
    );

    const firstMatch =
      exactMatch ||
      GAMES.find((game) =>
        game.name.toLowerCase().includes(keyword)
      );

    if (firstMatch) {
      goToGame(firstMatch);
    }
  };

  return (
    <div className="px-4 pt-3 pb-2">
      <div className="max-w-5xl mx-auto relative">
        <div
          className="
            flex items-center gap-3
            bg-white
            border border-gray-100
            rounded-2xl
            px-4 py-3
            shadow-sm
            focus-within:ring-2
            focus-within:ring-blue-100
          "
        >
          <Search
            size={18}
            className="text-gray-400 shrink-0"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setFocused(true);
            }}
            onFocus={() => setFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Tìm game bạn muốn nạp..."
            className="
              flex-1
              min-w-0
              bg-transparent
              outline-none
              text-sm
              text-gray-700
              placeholder:text-gray-400
            "
          />
        </div>

        {focused && keyword && (
          <div
            className="
              absolute
              z-50
              left-0
              right-0
              top-full
              mt-2
              bg-white
              rounded-2xl
              border border-gray-100
              shadow-xl
              overflow-hidden
            "
          >
            {results.length > 0 ? (
              <div className="py-1">
                {results.map((game) => (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => goToGame(game)}
                    className="
                      w-full
                      flex
                      items-center
                      gap-3
                      px-4
                      py-3
                      text-left
                      hover:bg-blue-50
                      active:bg-blue-100
                      transition
                    "
                  >
                    <div
                      className="
                        w-10 h-10
                        rounded-xl
                        bg-gray-50
                        border border-gray-100
                        flex items-center
                        justify-center
                        shrink-0
                        overflow-hidden
                      "
                    >
                      <GameImage
                        src={getImageUrl(game.logo)}
                        alt={game.name}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">
                        {game.name}
                      </p>

                      <p className="text-[9px] text-gray-400 mt-0.5">
                        {game.category === 'pc'
                          ? 'PC'
                          : 'Mobile'}
                      </p>
                    </div>

                    <div
                      className="
                        flex items-center gap-1
                        text-blue-500
                        text-[9px]
                        font-bold
                        shrink-0
                      "
                    >
                      Nạp
                      <ChevronRight size={12} />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Search
                  size={28}
                  className="mx-auto text-gray-300 mb-2"
                />

                <p className="text-xs font-bold text-gray-600">
                  Không tìm thấy game
                </p>

                <p className="text-[10px] text-gray-400 mt-1">
                  Thử nhập tên game khác
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// BANNER
// =====================================================

function Banner() {
  const [error, setError] = useState(false);

  return (
    <section className="px-4 pt-2">
      <div className="max-w-5xl mx-auto">
        <div
          className="
            relative
            overflow-hidden
            rounded-3xl
            bg-gradient-to-br
            from-blue-600
            via-blue-500
            to-cyan-400
            shadow-lg
            aspect-[16/7]
          "
        >
          {!error ? (
            <img
              src={getImageUrl(BANNER)}
              alt="Store banner"
              className="
                absolute inset-0
                w-full h-full
                object-cover
              "
              onError={() => setError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <Sparkles
                  size={28}
                  className="mx-auto mb-2"
                />

                <p className="font-bold text-lg">
                  NẠP GAME NHANH CHÓNG
                </p>

                <p className="text-xs opacity-80">
                  Chọn game và bắt đầu ngay
                </p>
              </div>
            </div>
          )}

          <div
            className="
              absolute inset-0
              pointer-events-none
              bg-gradient-to-t
              from-black/10
              to-transparent
            "
          />
        </div>
      </div>
    </section>
  );
        }
// =====================================================
// RECOMMENDED
// =====================================================

function Recommended({ navigate }) {
  const recommended = GAMES.slice(0, 4);

  return (
    <section className="px-4 pt-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">
              Dành cho bạn
            </h2>

            <p className="text-[11px] text-gray-400 mt-0.5">
              Những game được yêu thích
            </p>
          </div>

          <Sparkles
            size={18}
            className="text-blue-500"
          />
        </div>

        <div
          className="
            grid
            grid-cols-2
            sm:grid-cols-4
            gap-3
          "
        >
          {recommended.map((game) => (
            <button
              key={game.id}
              type="button"
              onClick={() => navigate(game.path)}
              className="
                group
                text-left
                bg-white
                rounded-2xl
                border border-gray-100
                overflow-hidden
                shadow-sm
                hover:shadow-md
                hover:-translate-y-0.5
                transition-all
              "
            >
              <div
                className="
                  aspect-[1.25/1]
                  bg-gray-50
                  flex items-center
                  justify-center
                  p-4
                "
              >
                <GameImage
                  src={getImageUrl(game.logo)}
                  alt={game.name}
                />
              </div>

              <div className="p-3">
                <p className="font-bold text-xs text-gray-800 truncate">
                  {game.name}
                </p>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-[9px] text-blue-500 font-semibold">
                    Nạp ngay
                  </span>

                  <ChevronRight
                    size={13}
                    className="
                      text-blue-500
                      group-hover:translate-x-0.5
                      transition
                    "
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// =====================================================
// BENEFITS
// =====================================================

function Benefits() {
  return (
    <section className="px-4 pt-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-base font-extrabold text-gray-900 mb-3">
          Vì sao nên nạp tại NXX315 Studio Rewards?
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {BENEFITS.map(
            ({ id, icon: Icon, title, text }) => (
              <div
                key={id}
                className="
                  bg-white
                  border border-gray-100
                  rounded-2xl
                  p-3
                  flex items-center gap-3
                  shadow-sm
                "
              >
                <div
                  className="
                    w-9 h-9
                    rounded-xl
                    bg-blue-50
                    flex items-center
                    justify-center
                    shrink-0
                  "
                >
                  <Icon
                    size={17}
                    className="text-blue-500"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-gray-800">
                    {title}
                  </p>

                  <p className="text-[9px] text-gray-400 truncate">
                    {text}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

// =====================================================
// GAME CARD
// =====================================================

function GameCard({ game, navigate }) {
  return (
    <button
      type="button"
      onClick={() => navigate(game.path)}
      className="
        group
        text-left
        bg-white
        rounded-2xl
        border border-gray-100
        overflow-hidden
        shadow-sm
        hover:shadow-lg
        hover:-translate-y-0.5
        transition-all
        w-full
      "
    >
      <div
        className="
          relative
          aspect-square
          bg-gray-50
          flex items-center
          justify-center
          p-5
        "
      >
        <GameImage
          src={getImageUrl(game.logo)}
          alt={game.name}
        />

        <span
          className="
            absolute
            top-2 left-2
            px-2 py-1
            rounded-full
            bg-white/90
            backdrop-blur
            text-[8px]
            font-bold
            text-gray-500
          "
        >
          {game.category === 'mobile'
            ? 'MOBILE'
            : 'PC'}
        </span>
      </div>

      <div className="p-3">
        <p className="font-bold text-xs text-gray-800 truncate">
          {game.name}
        </p>

        <div
          className="
            mt-2
            w-full
            rounded-xl
            bg-blue-500
            group-hover:bg-blue-600
            text-white
            text-[10px]
            font-bold
            text-center
            py-2
            transition
          "
        >
          Nạp ngay
        </div>
      </div>
    </button>
  );
}

// =====================================================
// GAME LIST
// =====================================================

function GameList({
  games,
  activeTab,
  setActiveTab,
  navigate,
}) {
  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'mobile', label: 'Mobile' },
    { id: 'pc', label: 'PC' },
  ];

  return (
    <section className="px-4 pt-7">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-3">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">
              Tất cả game
            </h2>

            <p className="text-[11px] text-gray-400 mt-0.5">
              Chọn game để nạp
            </p>
          </div>

          <span className="text-[10px] text-gray-400">
            {games.length} game
          </span>
        </div>

        <div className="flex gap-2 mb-4">
          {tabs.map((tab) => {
            const active =
              activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveTab(tab.id)
                }
                className={`
                  px-4 py-2
                  rounded-full
                  text-[10px]
                  font-bold
                  capitalize
                  transition
                  ${
                    active
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-white text-gray-500 border border-gray-100'
                  }
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {games.length > 0 ? (
          <div
            className="
              grid
              grid-cols-2
              sm:grid-cols-3
              lg:grid-cols-4
              gap-3
            "
          >
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                navigate={navigate}
              />
            ))}
          </div>
        ) : (
          <div
            className="
              bg-white
              border border-gray-100
              rounded-2xl
              py-12
              text-center
            "
          >
            <Search
              size={30}
              className="mx-auto text-gray-300 mb-2"
            />

            <p className="text-sm font-bold text-gray-600">
              Không tìm thấy game
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Thử tìm kiếm với từ khóa khác
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
// =====================================================
// HISTORY PREVIEW
// =====================================================

function formatHistoryDate(value) {
  if (!value) return '—';

  return new Date(value).toLocaleString(
    'vi-VN',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  );
}

function getHistoryStatus(status) {
  const key = String(status || '').toLowerCase();

  if (
    ['completed', 'success', 'done'].includes(key)
  ) {
    return {
      label: 'Hoàn thành',
      className:
        'bg-emerald-50 text-emerald-600 border-emerald-100',
    };
  }

  if (
    key === 'paid' ||
    ['pending', 'processing'].includes(key)
  ) {
    return {
      label: 'Đang kiểm tra',
      className:
        'bg-amber-50 text-amber-600 border-amber-100',
    };
  }

  if (
    [
      'cancelled',
      'canceled',
      'failed',
      'rejected',
    ].includes(key)
  ) {
    return {
      label:
        key === 'failed' ||
        key === 'rejected'
          ? 'Thất bại'
          : 'Đã hủy',
      className:
        'bg-rose-50 text-rose-500 border-rose-100',
    };
  }

  return {
    label: 'Đang xử lý',
    className:
      'bg-amber-50 text-amber-600 border-amber-100',
  };
}

function getHistoryAmount(order) {
  const coins =
    order?.coin_cost ??
    order?.coins ??
    order?.coin_amount ??
    order?.amount_coins ??
    order?.price_coins;

  if (coins != null) {
    return `${Number(coins).toLocaleString(
      'vi-VN'
    )} xu`;
  }

  const money =
    order?.price_vnd ??
    order?.amount_vnd ??
    order?.amount ??
    order?.amount_money;

  if (money != null) {
    return `${Number(money).toLocaleString(
      'vi-VN'
    )}đ`;
  }

  return '—';
}

function getHistoryName(order) {
  return (
    order?.package_name ||
    order?.product_name ||
    order?.game_name ||
    order?.game ||
    (order?.historySource === 'orders'
      ? 'Đơn nạp game'
      : 'Đơn đổi thưởng')
  );
}

function getHistoryImage(order) {
  const directImage =
    order?.image_url ||
    order?.product_image ||
    order?.package_image ||
    order?.image;

  if (directImage) {
    return directImage;
  }

  const text = `
    ${order?.game_name || ''}
    ${order?.game || ''}
    ${order?.product_name || ''}
    ${order?.package_name || ''}
  `.toLowerCase();

  if (text.includes('play together')) {
    return getImageUrl(
      'play-together-vng.png'
    );
  }

  if (
    text.includes('liên quân') ||
    text.includes('quan huy')
  ) {
    return getImageUrl(
      'lien-quan-mobile.png'
    );
  }

  if (text.includes('free fire')) {
    return getImageUrl(
      'free-fire.png'
    );
  }

  if (
    text.includes('roblox') ||
    text.includes('robux')
  ) {
    return getImageUrl(
      'roblox.png'
    );
  }

  return getImageUrl('store-banner.jpg');
}

function StoreHistoryPreview() {
  const navigate = useNavigate();

  const [history, setHistory] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let alive = true;

    const loadHistory = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (alive) {
            setLoading(false);
          }

          return;
        }

        // =================================================
        // LẤY CẢ 2 LOẠI ĐƠN
        // orders = đơn nạp game
        // redemption_orders = đơn đổi thưởng
        // =================================================

        const [
          ordersResult,
          redemptionResult,
        ] = await Promise.all([
          supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', {
              ascending: false,
            })
            .limit(5),

          supabase
            .from('redemption_orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', {
              ascending: false,
            })
            .limit(5),
        ]);

        if (ordersResult.error) {
          throw ordersResult.error;
        }

        if (redemptionResult.error) {
          throw redemptionResult.error;
        }

        const merged = [
          ...(ordersResult.data || []).map(
            (order) => ({
              ...order,
              historySource: 'orders',
            })
          ),

          ...(redemptionResult.data || []).map(
            (order) => ({
              ...order,
              historySource:
                'redemption_orders',
            })
          ),
        ]
          .sort(
            (a, b) =>
              new Date(
                b.created_at || 0
              ) -
              new Date(
                a.created_at || 0
              )
          )
          .slice(0, 5);

        if (alive) {
          setHistory(merged);
        }
      } catch (error) {
        console.error(
          'Store history error:',
          error
        );

        if (alive) {
          setHistory([]);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="px-4 pt-7 pb-28">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between gap-3 mb-3">
          <div>
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-blue-500
              "
            >
              Giao dịch
            </p>

            <h2 className="mt-1 text-xl font-black text-gray-900">
              Lịch sử
            </h2>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate('/history')
            }
            className="
              flex items-center gap-1
              text-[10px]
              font-bold
              text-blue-500
            "
          >
            Xem tất cả
            <ChevronRight size={14} />
          </button>
        </div>

        {loading ? (
          <div
            className="
              bg-white
              border border-gray-100
              rounded-2xl
              p-5
              shadow-sm
            "
          >
            <div
              className="
                h-4 w-28
                rounded
                bg-gray-100
                animate-pulse
              "
            />

            <div
              className="
                h-3 w-40
                rounded
                bg-gray-100
                animate-pulse
                mt-3
              "
            />
          </div>
        ) : history.length === 0 ? (
          <div
            className="
              bg-white
              border border-gray-100
              rounded-2xl
              p-6
              text-center
              shadow-sm
            "
          >
            <div
              className="
                w-11 h-11
                mx-auto
                rounded-full
                bg-blue-50
                flex items-center
                justify-center
              "
            >
              <HistoryIcon
                size={20}
                className="text-blue-400"
              />
            </div>

            <p className="mt-3 text-sm font-bold text-gray-700">
              Chưa có giao dịch
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Đơn hàng của mày sẽ xuất hiện ở đây.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((order) => {
              const status =
                getHistoryStatus(
                  order.status
                );

              return (
                <button
                  key={`
                    ${order.historySource}
                    -
                    ${order.id}
                  `}
                  type="button"
                  onClick={() =>
                    navigate(
                      `/history/order/${encodeURIComponent(
                        order.id
                      )}?source=${
                        order.historySource
                      }`
                    )
                  }
                  className="
                    w-full
                    rounded-2xl
                    bg-white
                    border border-gray-100
                    p-3.5
                    text-left
                    shadow-sm
                    transition
                    hover:border-blue-100
                    hover:shadow-md
                    active:scale-[0.995]
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        w-12 h-12
                        rounded-xl
                        bg-gray-50
                        border border-gray-100
                        flex items-center
                        justify-center
                        shrink-0
                        overflow-hidden
                      "
                    >
                      <img
                        src={getHistoryImage(
                          order
                        )}
                        alt=""
                        className="
                          w-full
                          h-full
                          object-contain
                          p-1.5
                        "
                        onError={(e) => {
                          e.currentTarget.src =
                            getImageUrl(
                              'store-banner.jpg'
                            );
                        }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className="
                          truncate
                          text-sm
                          font-black
                          text-gray-900
                        "
                      >
                        {getHistoryName(
                          order
                        )}
                      </p>

                      <p
                        className="
                          mt-1
                          text-[10px]
                          text-gray-400
                        "
                      >
                        {formatHistoryDate(
                          order.created_at
                        )}
                      </p>

                      <div
                        className="
                          mt-2
                          flex
                          items-center
                          justify-between
                          gap-2
                        "
                      >
                        <span
                          className={`
                            rounded-full
                            border
                            px-2 py-1
                            text-[9px]
                            font-bold
                            ${status.className}
                          `}
                        >
                          {status.label}
                        </span>

                        <span
                          className="
                            text-[10px]
                            font-bold
                            text-blue-600
                          "
                        >
                          {getHistoryAmount(
                            order
                          )}
                        </span>
                      </div>
                    </div>

                    <ChevronRight
                      size={17}
                      className="
                        shrink-0
                        text-blue-300
                      "
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
// =====================================================
// MAIN STORE
// =====================================================

export default function Store() {
  const navigate = useNavigate();

  const [search, setSearch] =
    useState('');

  const [activeTab, setActiveTab] =
    useState('all');

  const filteredGames = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return GAMES.filter((game) => {
      const matchesCategory =
        activeTab === 'all' ||
        game.category === activeTab;

      const matchesSearch =
        !keyword ||
        game.name
          .toLowerCase()
          .includes(keyword);

      return (
        matchesCategory &&
        matchesSearch
      );
    });
  }, [search, activeTab]);

  return (
    <div
      className="
        min-h-screen
        bg-[#f7f9fc]
      "
    >
      <TopHeader />

      <StoreHeader
        search={search}
        setSearch={setSearch}
        navigate={navigate}
      />

      <Banner />

      <Recommended
        navigate={navigate}
      />

      <Benefits />

      <GameList
        games={filteredGames}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navigate={navigate}
      />

      {/* ============================================
          LỊCH SỬ GIAO DỊCH
          Lấy cả orders + redemption_orders
          ============================================ */}
      <StoreHistoryPreview />

      <BottomNav />
    </div>
  );
}
