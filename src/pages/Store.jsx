// src/pages/Store.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Search, Gift, Coins, Star, ShoppingBag, 
  ChevronRight, Sparkles, TrendingUp, Package, Zap, 
  Gamepad2, Smartphone, Laptop 
} from "lucide-react";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

// ============================================
// SUPABASE CONFIG
// ============================================
const SUPABASE_URL = 'https://rwglwovohbyqmbbzdvdj.supabase.co';
const STORAGE_BUCKET = 'game_logos';

// ============================================
// DANH SÁCH GAME
// ============================================
const GAMES = [
  { 
    id: "play-together", 
    name: "Play Together VNG", 
    platform: "mobile",
    path: "/store/play-together",
    bg: "from-purple-500 to-pink-500",
    popular: true,
    logo: "play-together.png"
  },
  { 
    id: "roblox-vn", 
    name: "Roblox VN", 
    platform: "mobile",
    path: "/shop-earn",
    bg: "from-blue-500 to-cyan-500",
    popular: true,
    logo: "roblox-vn.png"
  },
  { 
    id: "pubg-mobile", 
    name: "PUBG Mobile VN", 
    platform: "mobile",
    path: "/store/pubg",
    bg: "from-orange-500 to-red-500",
    popular: false,
    logo: "pubg-mobile.png"
  },
  { 
    id: "valorant", 
    name: "VALORANT", 
    platform: "pc",
    path: "/store/valorant",
    bg: "from-red-600 to-red-800",
    popular: false,
    logo: "valorant.png"
  },
  { 
    id: "zing-speed", 
    name: "ZingSpeed Mobile", 
    platform: "mobile",
    path: "/store/zing-speed",
    bg: "from-yellow-500 to-orange-500",
    popular: true,
    logo: "zing-speed.png"
  },
  { 
    id: "lien-minh", 
    name: "Liên Minh Tốc Chiến", 
    platform: "mobile",
    path: "/store/lien-minh",
    bg: "from-blue-600 to-indigo-800",
    popular: false,
    logo: "lien-minh.png"
  },
];

// ============================================
// FORMAT TIỀN
// ============================================
const formatMoney = (n) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

// ============================================
// COMPONENT CHÍNH
// ============================================
export default function Store() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile } = useProfile();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const userCoins = profile?.coins || 0;

  const filteredGames = GAMES.filter(game => {
    const matchTab = activeTab === "all" || game.platform === activeTab;
    const matchSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTab && matchSearch;
  });

  // ===== TẠO URL LOGO =====
  const getLogoUrl = (fileName) => {
    return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;
  };

  // ===== XỬ LÝ LỖI ẢNH =====
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    // Hiển thị fallback icon
    const parent = e.target.parentElement;
    const fallback = document.createElement('span');
    fallback.style.fontSize = '28px';
    fallback.textContent = '🎮';
    parent.appendChild(fallback);
  };

  const popularGames = GAMES.filter(g => g.popular);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f8ff', paddingBottom: 80 }}>
      {/* ===== HEADER ===== */}
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 50, 
        padding: '12px 16px', 
        background: 'white', 
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 12, 
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)', 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: 18, 
            fontWeight: 900 
          }}>G</div>
          <div>
            <strong style={{ display: 'block', fontSize: 16, color: '#1a1a2e' }}>UNGAMES Shop</strong>
            <span style={{ fontSize: 10, color: '#8b95a7' }}>Game Store</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#2563eb', fontWeight: 700, background: '#e8f0fe', padding: '4px 12px', borderRadius: 20 }}>
            🪙 {userCoins.toLocaleString()}
          </span>
          <button style={{ width: 36, height: 36, borderRadius: '50%', background: '#f0f2f5', border: 'none', fontSize: 18, cursor: 'pointer' }}>
            🔔
          </button>
        </div>
      </header>

      {/* ===== BANNER ===== */}
      <div style={{ margin: '12px 16px', padding: '20px', borderRadius: 16, background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -20, fontSize: 80, opacity: 0.1 }}>🎮</div>
        <div style={{ position: 'absolute', bottom: -30, left: -10, fontSize: 60, opacity: 0.08 }}>🕹️</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24' }}>🔥 CHỐT DEAL TRONG NGÀY</span>
            <span style={{ fontSize: 11, fontWeight: 900, background: '#fbbf24', color: '#1a1a2e', padding: '0 8px', borderRadius: 4 }}>9.9</span>
          </div>
          <h2 style={{ margin: '4px 0', fontSize: 20, fontWeight: 800 }}>ZingSpeed Mobile</h2>
          <p style={{ fontSize: 12, opacity: 0.8, margin: '4px 0 12px' }}>Duy nhất 10:00 - 23:59 | 09.09.2026</p>
          <button 
            onClick={() => navigate("/store/zing-speed")}
            style={{ 
              padding: '8px 20px', 
              borderRadius: 20, 
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', 
              color: '#1a1a2e', 
              border: 'none', 
              fontWeight: 700, 
              fontSize: 13,
              cursor: 'pointer'
            }}
          >
            Khám phá ngay →
          </button>
        </div>
      </div>

      {/* ===== LỢI ÍCH ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: '0 16px', marginBottom: 12 }}>
        {[
          { icon: '🎁', label: 'Ưu đãi hấp dẫn' },
          { icon: '✨', label: 'Vật phẩm độc quyền' },
          { icon: '💳', label: 'Thanh toán trực tiếp' },
          { icon: '💰', label: 'Giá tốt nhất' },
        ].map(item => (
          <div key={item.label} style={{ textAlign: 'center', padding: '8px 4px', background: 'white', borderRadius: 12, border: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: 20 }}>{item.icon}</div>
            <p style={{ fontSize: 8, color: '#6b7280', margin: '4px 0 0' }}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* ===== TÌM KIẾM ===== */}
      <div style={{ padding: '0 16px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: 12, padding: '0 12px', border: '1px solid #e5e7eb' }}>
          <Search size={18} color="#9ca3af" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm game..."
            style={{ width: '100%', padding: '10px 8px', border: 'none', outline: 'none', fontSize: 14, background: 'transparent' }}
          />
        </div>
      </div>

      {/* ===== TAB ===== */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px', marginBottom: 12 }}>
        {[
          { key: 'all', label: 'TẤT CẢ', icon: <Gamepad2 size={16} /> },
          { key: 'mobile', label: 'MOBILE', icon: <Smartphone size={16} /> },
          { key: 'pc', label: 'PC', icon: <Laptop size={16} /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 20,
              border: 'none',
              background: activeTab === tab.key ? '#2563eb' : '#f0f2f5',
              color: activeTab === tab.key ? 'white' : '#6b7280',
              fontWeight: 700,
              fontSize: 11,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== DANH SÁCH GAME ===== */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>🎮 DANH SÁCH GAME</h3>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>{filteredGames.length} game</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {filteredGames.map(game => {
            const logoUrl = getLogoUrl(game.logo);
            return (
              <button
                key={game.id}
                onClick={() => navigate(game.path)}
                style={{
                  padding: '16px',
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${game.bg})`,
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                {/* Logo */}
                <img 
                  src={logoUrl}
                  alt={game.name}
                  onError={handleImageError}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    objectFit: 'cover',
                    background: 'rgba(255,255,255,0.1)',
                    marginBottom: 4
                  }}
                />
                <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{game.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <span style={{ fontSize: 9, opacity: 0.7, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 10 }}>
                    {game.platform === 'mobile' ? '📱 Mobile' : '💻 PC'}
                  </span>
                  <span style={{ fontSize: 9, opacity: 0.7, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 10 }}>
                    Nạp ngay
                  </span>
                </div>
                {game.popular && (
                  <span style={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8, 
                    fontSize: 8, 
                    fontWeight: 700, 
                    background: 'rgba(255,255,255,0.2)', 
                    padding: '2px 8px', 
                    borderRadius: 10 
                  }}>
                    🔥 HOT
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div style={{ marginTop: 20, padding: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-around' }}>
        <button onClick={() => navigate("/store")} style={{ background: 'none', border: 'none', fontSize: 12, fontWeight: 600, color: '#2563eb', cursor: 'pointer' }}>
          🏠 Khám phá
        </button>
        <button style={{ background: 'none', border: 'none', fontSize: 12, fontWeight: 600, color: '#6b7280', cursor: 'pointer' }}>
          ❓ Hỗ trợ
        </button>
      </div>

      <BottomNav />
    </div>
  );
}