import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import useSession from '../hooks/useSession.js';
import useProfile from '../hooks/useProfile.js';

export default function Store() {
  console.log("🟢 Store đang chạy");
  
  const { session } = useSession();
  console.log("📱 Session:", session);
  
  const { profile, setProfile } = useProfile();
  console.log("👤 Profile:", profile);

  // Kiểm tra nếu đang loading
  if (!session) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f0f2ff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="animate-spin" size={40} />
          <p style={{ marginTop: '10px', color: '#6b7280' }}>Đang tải...</p>
        </div>
      </div>
    );
  }

  // Nếu có session thì hiển thị
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #a855f7, #ec4899)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '30px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#7c3aed' }}>
          🎮 Cửa Hàng
        </h1>
        <p style={{ marginTop: '10px', color: '#6b7280' }}>
          Chào {session?.user?.email || 'bạn'}!
        </p>
        <p style={{ marginTop: '5px', color: '#f59e0b' }}>
          Xu: {profile?.coins || 0}
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            marginTop: '20px',
            padding: '12px 30px',
            background: '#7c3aed',
            color: 'white',
            border: 'none',
            borderRadius: '15px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
}
