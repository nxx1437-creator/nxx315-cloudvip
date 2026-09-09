import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  CreditCard,
  Search,
  User,
  Zap,
} from 'lucide-react';

import TopHeader from '../components/TopHeader';
import BottomNav from '../components/BottomNav';

const SUPABASE_URL =
  'https://rwglwovohbyqmbbzdvdj.supabase.co';

const BUCKET = 'game_logos';

const getImageUrl = (fileName) =>
  `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}`;

// =====================================================
// PACKAGES
// =====================================================

const CARD_PACKAGES = [
  {
    id: 'card-400',
    robux: 400,
    price: 170000,
    image: 'roblox-400.png',
  },
];

const VNG_PACKAGES = [
  {
    id: 'vng-40',
    robux: 40,
    price: 14500,
    image: 'roblox-40.png',
  },
  {
    id: 'vng-80',
    robux: 80,
    price: 28500,
    image: 'roblox-80.png',
  },
  {
    id: 'vng-500',
    robux: 500,
    price: 140500,
    image: 'roblox-500.png',
  },
];

// =====================================================
// FORMAT PRICE
// =====================================================

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price);
}

// =====================================================
// PACKAGE CARD
// =====================================================

function PackageCard({
  pkg,
  selected,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full overflow-hidden rounded-2xl border bg-white text-left transition-all duration-200 ${
        selected
          ? 'border-blue-500 ring-2 ring-blue-100 shadow-lg'
          : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
      }`}
    >
      <div className="aspect-[16/9] overflow-hidden bg-slate-100">
        <img
          src={getImageUrl(pkg.image)}
          alt={`${pkg.robux} Robux`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-bold text-slate-900">
              {pkg.robux} Robux
            </div>

            <div className="mt-1 text-sm font-semibold text-blue-600">
              {formatPrice(pkg.price)} VNĐ
            </div>
          </div>

          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
              selected
                ? 'border-blue-500 bg-blue-500 text-white'
                : 'border-slate-300 bg-white text-transparent'
            }`}
          >
            <Check size={16} strokeWidth={3} />
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
  const [method, setMethod] = useState('card');

  const packages =
    method === 'card'
      ? CARD_PACKAGES
      : VNG_PACKAGES;

  const changeMethod = (newMethod) => {
    setMethod(newMethod);
    setSelectedPackage(null);
  };

  return (
    <section className="mt-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900">
          Chọn phương thức nạp
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Chọn một phương thức và gói Robux bạn muốn nạp.
        </p>
      </div>

      {/* METHOD */}

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => changeMethod('card')}
          className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
            method === 'card'
              ? 'border-blue-500 bg-blue-50 shadow-sm'
              : 'border-slate-200 bg-white hover:border-blue-300'
          }`}
        >
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              method === 'card'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <CreditCard size={21} />
          </div>

          <div>
            <div className="font-bold text-slate-900">
              Card Robux
            </div>

            <div className="text-xs text-slate-500">
              Nạp bằng Card
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => changeMethod('vng')}
          className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
            method === 'vng'
              ? 'border-blue-500 bg-blue-50 shadow-sm'
              : 'border-slate-200 bg-white hover:border-blue-300'
          }`}
        >
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              method === 'vng'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Zap size={21} />
          </div>

          <div>
            <div className="font-bold text-slate-900">
              Nạp trực tiếp
            </div>

            <div className="text-xs text-slate-500">
              VNG
            </div>
          </div>
        </button>
      </div>

      {/* TITLE */}

      <div className="mb-3 mt-6">
        <h3 className="font-bold text-slate-900">
          {method === 'card'
            ? 'Mục 1: Card Robux'
            : 'Mục 2: Nạp trực tiếp (VNG)'}
        </h3>
      </div>

      {/* PACKAGES */}

      <div
        className={`grid gap-4 ${
          packages.length === 1
            ? 'grid-cols-1'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            selected={
              selectedPackage?.id === pkg.id
            }
            onClick={() =>
              setSelectedPackage(pkg)
            }
          />
        ))}
      </div>
    </section>
  );
}

// =====================================================
// MAIN
// =====================================================

export default function Roblox() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [player, setPlayer] = useState(null);
  const [selectedPackage, setSelectedPackage] =
    useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ===================================================
  // ROBLOX LOOKUP
  // ===================================================

  const handleConfirm = async () => {
    const cleanUsername = username.trim();

    if (!cleanUsername) {
      setError('Vui lòng nhập username Roblox.');
      return;
    }

    setLoading(true);
    setError('');
    setPlayer(null);

    try {
      const response = await fetch(
        `/api/roblox-user?username=${encodeURIComponent(
          cleanUsername
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Không thể kiểm tra tài khoản Roblox.'
        );
      }

      setPlayer(data);
    } catch (err) {
      console.error(
        'Roblox lookup error:',
        err
      );

      setError(
        err?.message ||
          'Không thể kiểm tra tài khoản Roblox. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // TOTAL
  // ===================================================

  const totalRobux = selectedPackage
    ? selectedPackage.robux
    : 0;

  const totalPrice = selectedPackage
    ? selectedPackage.price
    : 0;

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <TopHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8">

        {/* BACK */}

        <button
          type="button"
          onClick={() => navigate('/store')}
          className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Quay lại cửa hàng
        </button>

        {/* TITLE */}

        <div className="mb-6">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600">
            <Zap size={14} />
            ROBLOX
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Nạp Robux
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Nhập tài khoản Roblox và chọn gói Robux bạn muốn nạp.
          </p>
        </div>

        {/* ACCOUNT */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <User size={20} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Tài khoản Roblox
              </h2>

              <p className="text-xs text-slate-500">
                Kiểm tra chính xác tài khoản trước khi nạp
              </p>
            </div>
          </div>

          {/* INPUT */}

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirm();
                  }
                }}
                placeholder="Nhập username Roblox..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="h-12 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? 'Đang kiểm tra...'
                : 'Kiểm tra'}
            </button>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          {/* PLAYER */}

          {player && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white">
                {player.avatar ? (
                  <img
                    src={player.avatar}
                    alt={player.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-blue-500">
                    <User size={24} />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-bold text-slate-900">
                    {player.displayName}
                  </span>

                  <Check
                    size={16}
                    className="shrink-0 rounded-full bg-blue-500 p-0.5 text-white"
                  />
                </div>

                <div className="truncate text-sm text-slate-500">
                  @{player.username}
                </div>

                <div className="mt-1 text-xs font-semibold text-blue-600">
                  ID: {player.id}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* PACKAGES */}

        <PackageSection
          selectedPackage={selectedPackage}
          setSelectedPackage={setSelectedPackage}
        />

        {/* SUMMARY */}

        <section className="mt-6 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="font-bold text-slate-900">
              Thông tin đơn hàng
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Hiện tại chỉ tính tổng, chưa thực hiện thanh toán.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-slate-500">
                Tài khoản
              </span>

              <span className="max-w-[60%] truncate font-semibold text-slate-900">
                {player
                  ? `@${player.username}`
                  : 'Chưa kiểm tra'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-slate-500">
                Gói Robux
              </span>

              <span className="font-semibold text-slate-900">
                {selectedPackage
                  ? `${selectedPackage.robux} Robux`
                  : 'Chưa chọn'}
              </span>
            </div>

            <div className="h-px bg-slate-100" />

            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-sm text-slate-500">
                  Tổng Robux
                </div>

                <div className="mt-1 text-2xl font-black text-blue-600">
                  {totalRobux} Robux
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-slate-500">
                  Tổng tiền
                </div>

                <div className="mt-1 text-xl font-black text-slate-900">
                  {formatPrice(totalPrice)} VNĐ
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={!player || !selectedPackage}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            <Check size={18} />
            Tiếp tục
          </button>
        </section>
      </main>

      <BottomNav />
    </div>
  );
      }
