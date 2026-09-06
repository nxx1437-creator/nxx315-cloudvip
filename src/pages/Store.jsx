import React from 'react';

export default function Store() {
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
          Đang hoạt động bình thường
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
