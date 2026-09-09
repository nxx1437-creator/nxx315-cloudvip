import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Gift, Trophy, CreditCard, Percent, Coins, Flame, Gamepad2, Smartphone, Laptop } from 'lucide-react';
import useProfile from '../hooks/useProfile.js';
import BottomNav from '../components/BottomNav.jsx';

// ============================================
// SUPABASE CONFIG
// ============================================
const SUPABASE_URL = 'https://rwglwovohbyqmbbzdvdj.supabase.co';
const STORAGE_BUCKET = 'game_logos';

// ============================================
// DATA
// ============================================
const BENEFITS = [
  { icon: Gift, label: 'Ưu đãi hấp dẫn' },
  { icon: Trophy, label: 'Vật phẩm độc quyền' },
  { icon: CreditCard, label: 'Thanh toán trực tiếp' },
  { icon: Percent, label: 'Giá tốt nhất' },
];

const GAMES = [
  { id: 1, name: 'Play Together VNG', category: 'mobile', logo: 'play-together.png', path: '/store/play-together', bg: 'from-purple-500 to-pink-500' },
  { id: 2, name: 'Roblox VN', category: 'mobile', logo: 'roblox-vn.png', path: '/shop-earn', bg: 'from-blue-500 to-cyan-500' },
  { id: 3, name: 'PUBG Mobile VN', category: 'mobile', logo: 'pubg-mobile.png', path: '/store/pubg', bg: 'from-orange-500 to-red-500' },
  { id: 4, name: 'VALORANT', category: 'pc', logo: 'valorant.png', path: '/store/valorant', bg: 'from-red-600 to-red-800' },
  { id: 5, name: 'ZingSpeed Mobile', category: 'mobile', logo: 'zing-speed.png', path: '/store/zing-speed', bg: 'from-yellow-500 to-orange-500' },
  { id: 6, name: 'Liên Minh Tốc Chiến', category: 'mobile', logo: 'lien-minh.png', path: '/store/lien-minh', bg: 'from-blue-600 to-indigo-800' },
];

// ============================================
// MAIN
// ============================================
export default function Store() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const userCoins = profile?.coins || 0;

  const getLogoUrl = (fileName) => {
    return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;
  };

  const filteredGames = GAMES.filter((g) => {
    const matchesTab = activeTab === 'all' || g.category === activeTab;
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f5f7fa] pb-20">
      
      {/* ===== HEADER ===== */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">G</div>
          <span className="font-bold text-gray-800 text-sm">UNGAMES Shop</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            🪙 {userCoins.toLocaleString()}
          </span>
          <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm">🔔</button>
        </div>
      </div>

      {/* ===== BANNER ===== */}
      <div className="mx-4 mt-3">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 aspect-[4/3] flex items-center justify-center p-5">
          <div className="absolute right-3 top-3 text-right">
            <div className="text-2xl font-black text-white">12</div>
            <div className="text-[8px] text-white/60">BÁN ĐÃ XEM</div>
            <div className="text-[9px] font-bold text-yellow-300">UNGAMES</div>
          </div>
          <div className="text-center text-white">
            <p className="text-[10px] font-semibold text-yellow-300">ZingSpeed Mobile</p>
            <p className="text-[8px] opacity-70">Duy nhất 10:00 - 23:59 | 09.09.2026</p>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="text-3xl font-black">9.9</span>
              <span className="text-[10px] font-bold">CHỐT DEAL</span>
            </div>
            <button className="mt-2 px-5 py-1 bg-yellow-400 text-blue-900 text-xs font-bold rounded-full">
              Khám phá ngay →
            </button>
          </div>
        </div>
      </div>

      {/* ===== LỢI ÍCH ===== */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-4 gap-2">
          {BENEFITS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="bg-white rounded-xl py-2.5 flex flex-col items-center gap-0.5 border border-gray-100 shadow-sm">
                <Icon size={18} className="text-blue-500" />
                <span className="text-[8px] font-medium text-gray-600 text-center leading-tight">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== DÀNH CHO BẠN ===== */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-gray-800">🎮 DÀNH CHO BẠN</h2>
          <button className="text-[10px] text-blue-500 font-medium">Xem thêm</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {GAMES.filter(g => g.id === 2 || g.id === 5).map(game => (
            <div key={game.id} className="shrink-0 w-32 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className={`aspect-square bg-gradient-to-br ${game.bg} flex items-center justify-center p-3`}>
                <img 
                  src={getLogoUrl(game.logo)} 
                  alt={game.name} 
                  className="w-full h-full object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="p-2 text-center">
                <p className="text-[10px] font-semibold text-gray-700 truncate">{game.name}</p>
                <button 
                  onClick={() => navigate(game.path)}
                  className="mt-1 w-full bg-blue-500 text-white text-[9px] font-bold rounded-full py-1 hover:bg-blue-600 transition"
                >
                  Nạp ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== DANH SÁCH GAME ===== */}
      <div className="px-4 mt-4 pb-20">
        <h2 className="text-sm font-bold text-gray-800 mb-2">📋 DANH SÁCH GAME</h2>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-3">
          {[
            { key: 'all', label: 'TẤT CẢ' },
            { key: 'mobile', label: 'MOBILE' },
            { key: 'pc', label: 'PC' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1 rounded-full text-[9px] font-bold transition ${
                activeTab === tab.key ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center bg-white rounded-xl px-3 py-2 border border-gray-200 mb-3">
          <Search size={14} className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm game..."
            className="flex-1 bg-transparent outline-none text-xs ml-2 placeholder:text-gray-400"
          />
        </div>

        {/* Game Grid - 3 cột như ảnh mẫu */}
        <div className="grid grid-cols-3 gap-2.5">
          {filteredGames.map(game => (
            <div 
              key={game.id} 
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition"
              onClick={() => navigate(game.path)}
            >
              <div className={`aspect-square bg-gradient-to-br ${game.bg} flex items-center justify-center p-3`}>
                <img 
                  src={getLogoUrl(game.logo)} 
                  alt={game.name} 
                  className="w-full h-full object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="p-1.5 text-center">
                <p className="text-[8px] font-semibold text-gray-700 truncate">{game.name}</p>
                <button className="mt-0.5 w-full bg-blue-500 text-white text-[7px] font-bold rounded-full py-0.5 hover:bg-blue-600 transition">
                  Nạp
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}