import React, { useState } from 'react';
import {
  User,
  Search,
  CheckCircle2,
  AlertCircle,
  Gamepad2,
  ChevronRight,
  Loader2,
} from 'lucide-react';

import TopHeader from '../components/TopHeader.jsx';
import BottomNav from '../components/BottomNav.jsx';

// =====================================================
// SUPABASE STORAGE
// =====================================================

const SUPABASE_URL = 'https://rwglwovohbyqmbbzdvdj.supabase.co';
const STORAGE_BUCKET = 'game_logos';

const getImageUrl = (fileName) =>
  `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;

// =====================================================
// BANNER
// =====================================================

const BANNER = 'store-banner.png';

// =====================================================
// ROBUX PACKAGES
// =====================================================

const PACKAGES = [
  {
    id: 1,
    robux: 40,
    price: 14500,
    image: 'roblox-40.png',
  },
  {
    id: 2,
    robux: 80,
    price: 28500,
    image: 'roblox-80.png',
  },
  {
    id: 3,
    robux: 400,
    price: 170000,
    image: null,
  },
  {
    id: 4,
    robux: 500,
    price: 140500,
    image: 'roblox-500.png',
  },
];

// =====================================================
// FORMAT MONEY
// =====================================================

const formatMoney = (number) =>
  new Intl.NumberFormat('vi-VN').format(number) + ' VNĐ';

// =====================================================
// PACKAGE IMAGE
// =====================================================

function PackageImage({ image, robux }) {
  const [error, setError] = useState(false);

  if (!image || error) {
    return (
      <div className="w-full h-full min-h-[150px] bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center">
        <Gamepad2
          size={42}
          className="text-blue-300 mb-2"
          strokeWidth={1.5}
        />

        <span className="text-xs font-bold text-blue-400">
          {robux} ROBUX
        </span>

        <span className="text-[10px] text-gray-400 mt-1">
          Ảnh đang cập nhật
        </span>
      </div>
    );
  }

  return (
    <img
      src={getImageUrl(image)}
      alt={`${robux} Robux`}
      className="w-full h-full object-cover"
      onError={() => setError(true)}
    />
  );
}

// =====================================================
// ROBLOX USER LOOKUP
// =====================================================

async function findRobloxUser(username) {
  const cleanUsername = username.trim();

  const response = await fetch(
    'https://users.roblox.com/v1/usernames/users',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        usernames: [cleanUsername],
        excludeBannedUsers: false,
      }),
    }
  );

  // Lấy response để biết Roblox thực sự trả gì
  if (!response.ok) {
    let message = '';

    try {
      const errorData = await response.json();
      message =
        errorData?.errors?.[0]?.message ||
        errorData?.message ||
        '';
    } catch {
      // Không đọc được JSON
    }

    throw new Error(
      message || `Roblox API lỗi HTTP ${response.status}`
    );
  }

  const data = await response.json();

  if (!Array.isArray(data.data) || data.data.length === 0) {
    return null;
  }

  const user = data.data[0];

  // ===================================================
  // LẤY AVATAR
  // ===================================================

  let avatar = null;

  try {
    const avatarResponse = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.id}&size=150x150&format=Png&isCircular=false`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (avatarResponse.ok) {
      const avatarData = await avatarResponse.json();

      avatar = avatarData?.data?.[0]?.imageUrl || null;
    }
  } catch {
    // Avatar lỗi thì vẫn cho phép tài khoản được xác nhận
  }

  return {
    id: user.id,
    username: user.name,
    displayName: user.displayName,
    avatar,
  };
}

// =====================================================
// PLAYER SECTION
// =====================================================

function PlayerSection({
  username,
  setUsername,
  player,
  setPlayer,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    const value = username.trim();

    if (!value) {
      setError('Vui lòng nhập tên tài khoản Roblox.');
      setPlayer(null);
      return;
    }

    if (value.length < 3 || value.length > 20) {
      setError('Tên tài khoản Roblox không hợp lệ.');
      setPlayer(null);
      return;
    }

    setLoading(true);
    setError('');
    setPlayer(null);

    try {
      const user = await findRobloxUser(value);

      if (!user) {
        setError('Không tìm thấy tài khoản Roblox này.');
        return;
      }

      setPlayer(user);
    } catch {
      setError(
        'Không thể kiểm tra tài khoản Roblox. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-4 pt-5">
      <div className="max-w-5xl mx-auto">

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

          {/* TITLE */}

          <div className="p-5 pb-3">
            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                <User
                  size={20}
                  className="text-blue-500"
                />
              </div>

              <div>
                <h2 className="text-base font-extrabold text-gray-900">
                  1. Thông tin nhân vật
                </h2>

                <p className="text-[11px] text-gray-400 mt-0.5">
                  Nhập username Roblox của bạn
                </p>
              </div>

            </div>
          </div>

          {/* INPUT */}

          <div className="px-5 pb-5">

            <div
              className={`
                flex items-center gap-3
                border rounded-2xl
                px-4 py-3
                transition
                ${
                  error
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 bg-gray-50 focus-within:border-blue-400 focus-within:bg-white'
                }
              `}
            >

              <Search
                size={18}
                className="text-gray-400 shrink-0"
              />

              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                  setPlayer(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirm();
                  }
                }}
                placeholder="Tên tài khoản Roblox"
                className="
                  flex-1 min-w-0
                  bg-transparent
                  outline-none
                  text-sm
                  text-gray-800
                  placeholder:text-gray-400
                "
              />

            </div>

            {/* ERROR */}

            {error && (
              <div className="flex items-center gap-2 mt-3 text-red-500">

                <AlertCircle size={15} />

                <p className="text-xs font-medium">
                  {error}
                </p>

              </div>
            )}

            {/* CONFIRM BUTTON */}

            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="
                mt-3
                w-full
                rounded-2xl
                bg-blue-500
                hover:bg-blue-600
                active:scale-[0.99]
                disabled:opacity-60
                text-white
                font-bold
                text-sm
                py-3.5
                transition
                flex items-center justify-center gap-2
              "
            >

              {loading ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  Đang kiểm tra...
                </>
              ) : (
                <>
                  Xác nhận

                  <ChevronRight size={17} />
                </>
              )}

            </button>

            {/* PLAYER RESULT */}

            {player && (
              <div className="
                mt-4
                rounded-2xl
                border border-blue-100
                bg-blue-50/60
                p-4
              ">

                <div className="flex items-center gap-3">

                  <div className="
                    w-14 h-14
                    rounded-2xl
                    overflow-hidden
                    bg-white
                    border border-blue-100
                    flex items-center justify-center
                    shrink-0
                  ">

                    {player.avatar ? (
                      <img
                        src={player.avatar}
                        alt={player.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User
                        size={25}
                        className="text-blue-400"
                      />
                    )}

                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex items-center gap-1.5">

                      <p className="font-extrabold text-gray-900 truncate">
                        {player.displayName}
                      </p>

                      <CheckCircle2
                        size={15}
                        className="text-blue-500 shrink-0"
                      />

                    </div>

                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      @{player.username}
                    </p>

                    <p className="text-[10px] text-gray-400 mt-1">
                      ID: {player.id}
                    </p>

                  </div>

                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}

// =====================================================
// ROBLOX BANNER
// =====================================================

function RobloxBanner() {
  const [error, setError] = useState(false);

  return (
    <section className="px-4 pt-3">
      <div className="max-w-5xl mx-auto">

        <div className="
          relative
          overflow-hidden
          rounded-3xl
          aspect-[16/7]
          bg-gradient-to-br
          from-blue-700
          via-blue-500
          to-cyan-400
          shadow-lg
        ">

          {!error ? (
            <img
              src={getImageUrl(BANNER)}
              alt="Roblox VN"
              className="
                absolute inset-0
                w-full h-full
                object-cover
              "
              onError={() => setError(true)}
            />
          ) : (
            <div className="
              absolute inset-0
              flex items-center justify-center
              text-white
            ">

              <div className="text-center">

                <Gamepad2
                  size={35}
                  className="mx-auto mb-2"
                />

                <p className="font-extrabold text-lg">
                  ROBLOX VN
                </p>

                <p className="text-xs opacity-80">
                  Nạp Robux nhanh chóng
                </p>

              </div>

            </div>
          )}

          <div className="
            absolute inset-0
            bg-gradient-to-t
            from-black/20
            to-transparent
            pointer-events-none
          " />

        </div>
      </div>
    </section>
  );
}

// =====================================================
// PACKAGE CARD
// =====================================================

function PackageCard({
  pack,
  selected,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        text-left
        bg-white
        rounded-2xl
        overflow-hidden
        border-2
        w-full
        transition-all
        ${
          selected
            ? 'border-blue-500 shadow-lg shadow-blue-100'
            : 'border-gray-100 shadow-sm hover:shadow-md'
        }
      `}
    >

      <div className="
        relative
        aspect-[1.55/1]
        overflow-hidden
        bg-gray-50
      ">

        <PackageImage
          image={pack.image}
          robux={pack.robux}
        />

        {selected && (
          <div className="
            absolute
            top-2
            right-2
            w-7
            h-7
            rounded-full
            bg-blue-500
            text-white
            flex items-center justify-center
            shadow-md
          ">
            <CheckCircle2 size={17} />
          </div>
        )}

      </div>

      <div className="p-3">

        <p className="font-bold text-sm text-gray-800">
          Gói {pack.robux.toLocaleString('vi-VN')} Robux
        </p>

        <div className="
          flex
          items-center
          justify-between
          gap-2
          mt-2
        ">

          <p className="text-sm font-extrabold text-blue-500">
            {formatMoney(pack.price)}
          </p>

          <div className={`
            w-8 h-8
            rounded-xl
            flex items-center justify-center
            shrink-0
            ${
              selected
                ? 'bg-blue-500 text-white'
                : 'bg-blue-50 text-blue-500'
            }
          `}>

            {selected ? (
              <CheckCircle2 size={17} />
            ) : (
              <span className="text-lg font-bold">
                +
              </span>
            )}

          </div>

        </div>

      </div>

    </button>
  );
                }
// =====================================================
// PACKAGE SECTION
// =====================================================

function PackageSection({
  selectedPackage,
  setSelectedPackage,
}) {
  return (
    <section className="px-4 pt-6 pb-28">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-3">

          <div>
            <h2 className="text-base font-extrabold text-gray-900">
              2. Chọn gói Robux
            </h2>

            <p className="text-[11px] text-gray-400 mt-0.5">
              Chọn gói bạn muốn nạp
            </p>
          </div>

          <span className="
            text-[10px]
            font-bold
            text-blue-500
            bg-blue-50
            px-3 py-1.5
            rounded-full
          ">
            {PACKAGES.length} gói
          </span>

        </div>

        <div className="
          grid
          grid-cols-2
          sm:grid-cols-3
          lg:grid-cols-4
          gap-3
        ">
          {PACKAGES.map((pack) => (
            <PackageCard
              key={pack.id}
              pack={pack}
              selected={selectedPackage?.id === pack.id}
              onClick={() => setSelectedPackage(pack)}
            />
          ))}
        </div>

      </div>
    </section>
  );
}


// =====================================================
// SUMMARY
// =====================================================

function Summary({
  player,
  selectedPackage,
}) {
  return (
    <div className="
      fixed
      bottom-0
      left-0
      right-0
      z-40
      bg-white/95
      backdrop-blur-xl
      border-t
      border-gray-100
      shadow-[0_-8px_30px_rgba(0,0,0,0.08)]
    ">

      <div className="
        max-w-5xl
        mx-auto
        px-4
        py-3
      ">

        <div className="flex items-center gap-3">

          {/* TỔNG ROBUX */}

          <div className="flex-1 min-w-0">

            <p className="text-[10px] text-gray-400">
              Tổng Robux
            </p>

            <p className="
              text-base
              font-extrabold
              text-gray-900
            ">
              {selectedPackage
                ? `${selectedPackage.robux.toLocaleString('vi-VN')} Robux`
                : '0 Robux'}
            </p>

          </div>


          {/* TỔNG TIỀN */}

          <div className="text-right">

            <p className="text-[10px] text-gray-400">
              Tổng tiền
            </p>

            <p className="
              text-base
              font-extrabold
              text-blue-500
            ">
              {selectedPackage
                ? formatMoney(selectedPackage.price)
                : '0 VNĐ'}
            </p>

          </div>

        </div>


        {/* TIẾP TỤC */}

        <button
          type="button"
          disabled={!player || !selectedPackage}
          className="
            mt-2
            w-full
            rounded-2xl
            bg-blue-500
            hover:bg-blue-600
            disabled:bg-gray-200
            disabled:text-gray-400
            text-white
            font-extrabold
            text-sm
            py-3
            transition
          "
        >
          {selectedPackage
            ? 'Tiếp tục'
            : 'Chọn gói Robux'}
        </button>

      </div>
    </div>
  );
}


// =====================================================
// MAIN ROBLOX PAGE
// =====================================================

export default function Roblox() {

  const [username, setUsername] = useState('');
  const [player, setPlayer] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

  return (
    <div className="min-h-screen bg-[#f7f9fc]">

      <TopHeader />

      {/* BANNER */}

      <RobloxBanner />


      {/* NHẬP USERNAME */}

      <PlayerSection
        username={username}
        setUsername={setUsername}
        player={player}
        setPlayer={setPlayer}
      />


      {/* CHỌN GÓI */}

      <PackageSection
        selectedPackage={selectedPackage}
        setSelectedPackage={setSelectedPackage}
      />


      {/* TỔNG TIỀN */}

      <Summary
        player={player}
        selectedPackage={selectedPackage}
      />


      <BottomNav />

    </div>
  );
}
