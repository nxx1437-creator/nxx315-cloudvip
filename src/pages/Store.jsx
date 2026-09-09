import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Gift, Trophy, CreditCard, Percent } from 'lucide-react';
import TopHeader from '../components/TopHeader.jsx';
import BottomNav from '../components/BottomNav.jsx';

// ============================================
// SUPABASE CONFIG
// ============================================
const SUPABASE_URL = 'https://rwglwovohbyqmbbzdvdj.supabase.co';
const STORAGE_BUCKET = 'game_logos';

const getLogoUrl = (fileName) => {
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;
};

// ============================================
// DATA
// ============================================
const BANNERS = [
  { id: 1, title: 'CHỐT DEAL TRONG NGÀY', subtitle: 'CHIẾN GAME LIỀN TAY' },
];

const RECOMMENDED = [
  { id: 1, name: 'Roblox VN', logo: 'roblox-vn.png', path: '/shop-earn' },
  { id: 2, name: 'Play Together VNG', logo: 'play-together.png', path: '/store/play-together' },
];

const BENEFITS = [
  { id: 1, icon: Gift, label: 'Ưu đãi hấp dẫn' },
  { id: 2, icon: Trophy, label: 'Vật phẩm độc quyền' },
  { id: 3, icon: CreditCard, label: 'Thanh toán trực tiếp' },
  { id: 4, icon: Percent, label: 'Giá tốt nhất' },
];

const GAMES = [
  { id: 1, name: 'Roblox VN', category: 'mobile', logo: 'roblox-vn.png', path: '/shop-earn' },
  { id: 2, name: 'PUBG Mobile VN', category: 'mobile', logo: 'pubg-mobile.png', path: '/store/pubg' },
  { id: 3, name: 'VALORANT', category: 'pc', logo: 'valorant.png', path: '/store/valorant' },
  { id: 4, name: 'Play Together VNG', category: 'mobile', logo: 'play-together.png', path: '/store/play-together' },
  { id: 5, name: 'ZingSpeed Mobile', category: 'mobile', logo: 'zing-speed.png', path: '/store/zing-speed' },
  { id: 6, name: 'Liên Minh Tốc Chiến', category: 'mobile', logo: 'lien-minh.png', path: '/store/lien-minh' },
];

// ============================================
// HEADER
// ============================================
function Header({ search, setSearch }) {
  return (
    <div className="bg-white px-4 py-2.5 border-b border-gray-100">
      <div className="max-w-md mx-auto flex items-center gap-2">
        <span className="text-sm font-bold text-blue-600 shrink-0">NXX315</span>
        <div className="flex-1 flex items-center bg-gray-100 rounded-full px-3 py-1.5">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm game, vật phẩm..."
            className="flex-1 bg-transparent outline-none text-xs ml-1.5 placeholder:text-gray-400 min-w-0"
          />
        </div>
        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
          N
        </div>
      </div>
    </div>
  );
}

// ============================================
// BANNER
// ============================================
function BannerCarousel() {
  return (
    <div className="px-4 pt-3">
      <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 aspect-[16/9] flex items-center justify-center p-4">
        <div className="text-center text-white">
          <p className="text-sm font-bold text-yellow-300">ZingSpeed Mobile</p>
          <p className="text-[10px] opacity-80">Duy nhất 10:00 - 23:59 | 09.09.2026</p>
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
  );
}

// ============================================
// RECOMMENDED
// ============================================
function RecommendedSection({ navigate }) {
  return (
    <div className="px-4 pt-4">
      <h2 className="text-sm font-bold text-gray-800 mb-2">🎮 Dành cho bạn</h2>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        {RECOMMENDED.map((item) => (
          <div 
            key={item.id} 
            className="shrink-0 w-[120px] bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition"
            onClick={() => navigate(item.path)}
          >
            <div className="aspect-square bg-gray-50 flex items-center justify-center p-3">
              <img 
                src={getLogoUrl(item.logo)} 
                alt={item.name} 
                className="w-full h-full object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div className="p-2 text-center">
              <p className="text-[10px] font-semibold text-gray-700 truncate">{item.name}</p>
              <button 
                onClick={() => navigate(item.path)}
                className="mt-1 w-full bg-blue-500 text-white text-[9px] font-bold rounded-full py-1 hover:bg-blue-600 transition"
              >
                Nạp ngay
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// BENEFITS
// ============================================
function BenefitsSection() {
  return (
    <div className="px-4 pt-4">
      <h2 className="text-sm font-bold text-gray-800 mb-2">✨ Lợi ích khi nạp</h2>
      <div className="grid grid-cols-4 gap-2">
        {BENEFITS.map(({ id, icon: Icon, label }) => (
          <div key={id} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl py-2.5 flex flex-col items-center gap-0.5 border border-blue-100">
            <Icon size={18} className="text-blue-500" />
            <span className="text-[8px] font-medium text-gray-600 text-center leading-tight">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// GAME LIST
// ============================================
function GameListSection({ activeTab, setActiveTab, games, navigate }) {
  const tabs = [
    { key: 'all', label: 'TẤT CẢ' },
    { key: 'mobile', label: 'MOBILE' },
    { key: 'pc', label: 'PC' },
  ];

  return (
    <div className="px-4 pt-4 pb-24">
      <h2 className="text-sm font-bold text-gray-800 mb-2">📋 Danh sách game</h2>

      <div className="flex gap-1.5 mb-3">
        {tabs.map((tab) => (
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

      <div className="grid grid-cols-3 gap-2.5">
        {games.map((game) => (
          <div 
            key={game.id} 
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition"
            onClick={() => navigate(game.path)}
          >
            <div className="aspect-square bg-gray-50 flex items-center justify-center p-3">
              <img 
                src={getLogoUrl(game.logo)} 
                alt={game.name} 
                className="w-full h-full object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div className="p-1.5 text-center">
              <p className="text-[8px] font-semibold text-gray-700 truncate">{game.name}</p>
              <button 
                onClick={() => navigate(game.path)}
                className="mt-0.5 w-full bg-blue-500 text-white text-[7px] font-bold rounded-full py-0.5 hover:bg-blue-600 transition"
              >
                Nạp
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// MAIN
// ============================================
export default function Store() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const filteredGames = GAMES.filter((g) => {
    const matchesTab = activeTab === 'all' || g.category === activeTab;
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <TopHeader />
      <Header search={search} setSearch={setSearch} />
      <BannerCarousel />
      <RecommendedSection navigate={navigate} />
      <BenefitsSection />
      <GameListSection 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        games={filteredGames} 
        navigate={navigate} 
      />
      <BottomNav />
    </div>
  );
}