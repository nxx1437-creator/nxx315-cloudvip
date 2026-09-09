import { useState, useEffect } from 'react';
import { Search, Globe, ChevronDown, Gift, Trophy, CreditCard, Percent, Coins, Flame } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import useProfile from '../hooks/useProfile.js';
import useSession from '../hooks/useSession.js';
import BottomNav from '../components/BottomNav.jsx';

// ============================================
// SUPABASE CONFIG
// ============================================
const SUPABASE_URL = 'https://rwglwovohbyqmbbzdvdj.supabase.co';
const STORAGE_BUCKET = 'game_logos';

// ============================================
// DATA
// ============================================
const BANNERS = [
  { id: 1, title: 'ZingSpeed Mobile', subtitle: 'Duy nhất 10:00 - 23:59 | 09.09.2026' },
];

const BENEFITS = [
  { id: 1, icon: Gift, label: 'Ưu đãi hấp dẫn' },
  { id: 2, icon: Trophy, label: 'Vật phẩm độc quyền' },
  { id: 3, icon: CreditCard, label: 'Thanh toán trực tiếp' },
  { id: 4, icon: Percent, label: 'Giá tốt nhất' },
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
// HEADER
// ============================================
function Header({ search, setSearch }) {
  const { profile } = useProfile();
  const userCoins = profile?.coins || 0;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center gap-3">
        <span className="text-xl font-bold text-blue-600 shrink-0">UNGAMES</span>

        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-100">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm game, vật phẩm..."
            className="bg-transparent outline-none text-sm w-full placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
            🪙 {userCoins.toLocaleString()}
          </span>
          <button className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
            N
          </button>
        </div>
      </div>
    </header>
  );
}

// ============================================
// BANNER
// ============================================
function BannerCarousel() {
  const banner = BANNERS[0];
  return (
    <div className="max-w-5xl mx-auto px-4 pt-4">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-500 aspect-[16/9] flex items-center justify-center p-6">
        <div className="absolute right-4 top-4 text-right">
          <div className="text-3xl font-black text-white">12</div>
          <div className="text-xs text-white/60">BÁN ĐÃ XEM</div>
          <div className="text-xs font-bold text-yellow-300">UNGAMES</div>
        </div>
        <div className="text-center text-white">
          <p className="text-sm font-semibold text-yellow-300">{banner.title}</p>
          <p className="text-xs opacity-80 mt-1">{banner.subtitle}</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-3xl font-black">9.9</span>
            <span className="text-sm opacity-80">CHỐT DEAL TRONG NGÀY</span>
          </div>
          <button className="mt-3 px-6 py-1.5 bg-yellow-400 text-blue-900 text-sm font-bold rounded-full hover:bg-yellow-300 transition">
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
  const getLogoUrl = (fileName) => {
    return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;
  };

  const recGames = GAMES.filter(g => g.id === 2 || g.id === 5);

  return (
    <section className="max-w-5xl mx-auto px-4 pt-6">
      <h2 className="text-lg font-bold text-gray-800 mb-3">🎮 DÀNH CHO BẠN</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {recGames.map((game) => {
          const logoUrl = getLogoUrl(game.logo);
          return (
            <div key={game.id} className="shrink-0 w-36 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className={`aspect-square bg-gradient-to-br ${game.bg} flex items-center justify-center p-4`}>
                <img 
                  src={logoUrl} 
                  alt={game.name} 
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="p-2.5 text-center">
                <p className="text-xs font-semibold text-gray-700 line-clamp-1">{game.name}</p>
                <button 
                  onClick={() => navigate(game.path)}
                  className="mt-1.5 w-full bg-blue-500 text-white text-xs font-bold rounded-full py-1 hover:bg-blue-600 transition"
                >
                  Nạp ngay
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ============================================
// BENEFITS
// ============================================
function BenefitsSection() {
  return (
    <section className="max-w-5xl mx-auto px-4 pt-8">
      <h2 className="text-lg font-bold text-gray-800 mb-3">✨ Lợi ích khi nạp tại UNGAMES</h2>
      <div className="grid grid-cols-2 gap-3">
        {BENEFITS.map(({ id, icon: Icon, label }) => (
          <div key={id} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 flex flex-col items-center text-center gap-1 border border-blue-100">
            <Icon size={24} className="text-blue-500" />
            <span className="text-xs font-semibold text-gray-700">{label}</span>
          </div>
        ))}
      </div>
    </section>
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

  const getLogoUrl = (fileName) => {
    return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;
  };

  return (
    <section className="max-w-5xl mx-auto px-4 pt-8 pb-20">
      <h2 className="text-lg font-bold text-gray-800 mb-3">📋 DANH SÁCH GAME</h2>

      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
              activeTab === tab.key ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {games.map((game) => {
          const logoUrl = getLogoUrl(game.logo);
          return (
            <div 
              key={game.id} 
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition"
              onClick={() => navigate(game.path)}
            >
              <div className={`aspect-square bg-gradient-to-br ${game.bg} flex items-center justify-center p-4`}>
                <img 
                  src={logoUrl} 
                  alt={game.name} 
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="p-2.5 text-center">
                <p className="text-xs font-semibold text-gray-700 line-clamp-1">{game.name}</p>
                <button className="mt-1 w-full bg-blue-500 text-white text-xs font-bold rounded-full py-1 hover:bg-blue-600 transition">
                  Nạp ngay
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
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
    <div className="min-h-screen bg-gray-50/80 pb-20">
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