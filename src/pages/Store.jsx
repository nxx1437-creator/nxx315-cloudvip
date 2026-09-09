import { useState } from 'react';
import { Search, Globe, ChevronDown, Gift, Trophy, CreditCard, Percent } from 'lucide-react';

// ===== MOCK DATA (thay bằng data thật / Supabase sau) =====
const BANNERS = [
  { id: 1, imageUrl: null, title: 'CHỐT DEAL TRONG NGÀY', subtitle: 'CHIẾN GAME LIỀN TAY' },
];

const RECOMMENDED = [
  { id: 1, name: 'Roblox VN', imageUrl: null },
  { id: 2, name: 'Play Together VNG', imageUrl: null },
];

const BENEFITS = [
  { id: 1, icon: Gift, label: 'Ưu đãi hấp dẫn' },
  { id: 2, icon: Trophy, label: 'Vật phẩm độc quyền' },
  { id: 3, icon: CreditCard, label: 'Thanh toán trực tiếp' },
  { id: 4, icon: Percent, label: 'Giá tốt nhất' },
];

const GAMES = [
  { id: 1, name: 'Roblox VN', category: 'mobile', imageUrl: null },
  { id: 2, name: 'PUBG Mobile VN', category: 'mobile', imageUrl: null },
  { id: 3, name: 'VALORANT', category: 'pc', imageUrl: null },
  { id: 4, name: 'Play Together VNG', category: 'mobile', imageUrl: null },
];

// ===== HEADER =====
function Header({ search, setSearch }) {
  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-sky-100">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
        <span className="font-baloo text-xl font-bold text-sky-600 shrink-0">
          Nxx315
        </span>

        <div className="flex-1 flex items-center gap-2 bg-sky-50 rounded-full px-4 py-2.5 border border-sky-100">
          <Search size={18} className="text-sky-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm game, vật phẩm..."
            className="bg-transparent outline-none text-sm w-full placeholder:text-slate-400"
          />
        </div>

        <button className="hidden sm:flex items-center gap-1 text-slate-500 shrink-0">
          <Globe size={20} />
        </button>

        <button className="flex items-center gap-1 shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
            N
          </div>
          <ChevronDown size={16} className="text-slate-400 hidden sm:block" />
        </button>
      </div>
    </header>
  );
}

// ===== BANNER CAROUSEL =====
function BannerCarousel() {
  const banner = BANNERS[0];
  return (
    <div className="max-w-5xl mx-auto px-4 pt-4">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-sky-500 via-cyan-500 to-blue-500 aspect-[16/9] sm:aspect-[21/9] flex items-center justify-center">
        {banner.imageUrl ? (
          <img src={banner.imageUrl} alt={banner.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="text-center text-white px-6">
            <p className="font-baloo text-2xl sm:text-3xl font-extrabold">{banner.title}</p>
            <p className="text-sm sm:text-base mt-1 opacity-90">{banner.subtitle}</p>
          </div>
        )}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {BANNERS.map((b, i) => (
            <span key={b.id} className={`h-1.5 rounded-full transition-all ${i === 0 ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== RECOMMENDED SECTION =====
function RecommendedSection() {
  return (
    <section className="max-w-5xl mx-auto px-4 pt-8">
      <h2 className="font-baloo text-xl font-bold text-slate-800 mb-4">Dành cho bạn</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {RECOMMENDED.map((item) => (
          <div key={item.id} className="shrink-0 w-40 bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
            <div className="aspect-square bg-sky-50 flex items-center justify-center">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sky-300 text-xs">No image</span>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold text-slate-700 line-clamp-1">{item.name}</p>
              <button className="mt-2 w-full border border-sky-400 text-sky-600 text-xs font-bold rounded-full py-1.5 hover:bg-sky-50 transition">
                Nạp ngay
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ===== BENEFITS SECTION =====
function BenefitsSection() {
  return (
    <section className="max-w-5xl mx-auto px-4 pt-10">
      <h2 className="font-baloo text-xl font-bold text-slate-800 mb-4">
        Lợi ích khi nạp tại Nxx315
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {BENEFITS.map(({ id, icon: Icon, label }) => (
          <div key={id} className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-5 flex flex-col items-center text-center gap-2 border border-sky-100">
            <Icon size={28} className="text-sky-500" />
            <span className="text-sm font-semibold text-slate-700">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ===== GAME LIST SECTION =====
function GameListSection({ activeTab, setActiveTab, games }) {
  const tabs = [
    { key: 'all', label: 'TẤT CẢ' },
    { key: 'mobile', label: 'MOBILE' },
    { key: 'pc', label: 'PC' },
  ];

  return (
    <section className="max-w-5xl mx-auto px-4 pt-10 pb-16">
      <h2 className="font-baloo text-xl font-bold text-slate-800 mb-4">Danh sách game</h2>

      <div className="flex gap-2 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition ${
              activeTab === tab.key
                ? 'bg-sky-500 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {games.map((game) => (
          <div key={game.id} className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden flex flex-col">
            <div className="aspect-square bg-sky-50 flex items-center justify-center">
              {game.imageUrl ? (
                <img src={game.imageUrl} alt={game.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sky-300 text-xs">No image</span>
              )}
            </div>
            <div className="p-3 flex flex-col flex-1">
              <p className="text-sm font-semibold text-slate-700 line-clamp-1">{game.name}</p>
              <button className="mt-auto pt-2 w-full border border-sky-400 text-sky-600 text-xs font-bold rounded-full py-1.5 hover:bg-sky-50 transition">
                Nạp ngay
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ===== MAIN PAGE =====
export default function Store() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const filteredGames = GAMES.filter((g) => {
    const matchesTab = activeTab === 'all' || g.category === activeTab;
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50/40 to-white">
      <Header search={search} setSearch={setSearch} />
      <BannerCarousel />
      <RecommendedSection />
      <BenefitsSection />
      <GameListSection activeTab={activeTab} setActiveTab={setActiveTab} games={filteredGames} />
    </div>
  );
}