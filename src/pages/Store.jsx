import React, { useState } from "react";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

const ROBUX_PACKAGES = [
  { id: "robux-40", robux: 40, price: 14000, coin_cost: 14000, popular: false },
  { id: "robux-80", robux: 80, price: 28000, coin_cost: 28000, popular: false },
  { id: "robux-145", robux: 145, price: 50000, coin_cost: 50000, popular: true },
  { id: "robux-300", robux: 300, price: 100000, coin_cost: 100000, popular: true },
  { id: "robux-500", robux: 500, bonus: 100, price: 140000, coin_cost: 140000, popular: false },
  { id: "robux-1000", robux: 1000, bonus: 200, price: 280000, coin_cost: 280000, popular: false },
];

const formatMoney = (n) => new Intl.NumberFormat("vi-VN").format(n) + "đ";
// src/pages/Store.jsx - PHẦN 2
export default function Store() {
  const { session } = useSession();
  const { profile, setProfile } = useProfile();
  const [screen, setScreen] = useState("home");
  const [username, setUsername] = useState("");
  const [account, setAccount] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("coin");
  const [toast, setToast] = useState(null);
  const [checking, setChecking] = useState(false);
  const [processing, setProcessing] = useState(false);

  const userCoins = profile?.coins || 0;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const verifyUsername = () => {
    if (!username.trim()) { showToast("Vui lòng nhập username!", "error"); return; }
    setChecking(true);
    setTimeout(() => {
      setAccount({ username: username.trim(), userId: "123456789" });
      setChecking(false);
      setScreen("packages");
    }, 1000);
  };

  const handlePayment = async () => {
    if (!selectedPackage) return;
    if (!account) { setScreen("account"); return; }

    if (paymentMethod === "coin") {
      if (userCoins < selectedPackage.coin_cost) {
        showToast(`Không đủ Coin! Cần ${formatMoney(selectedPackage.coin_cost)}. Bạn có ${formatMoney(userCoins)}`, "error");
        return;
      }
      setProcessing(true);
      const { error: deductError } = await supabase
        .from('profiles')
        .update({ coins: userCoins - selectedPackage.coin_cost })
        .eq('id', session.user.id);
      if (deductError) {
        showToast("Lỗi: " + deductError.message, "error");
        setProcessing(false);
        return;
      }
      const orderId = "NXX" + Math.floor(100000 + Math.random() * 900000);
      await supabase.from('redemption_orders').insert({
        user_id: session.user.id,
        package_name: `${selectedPackage.robux} Robux`,
        package_id: selectedPackage.id,
        coins_charged: selectedPackage.coin_cost,
        delivery_target: account.username,
        delivery_method: 'coin',
        status: 'pending',
        order_code: orderId,
      });
      setProfile(prev => ({ ...prev, coins: userCoins - selectedPackage.coin_cost }));
      setProcessing(false);
      showToast(`Nạp ${selectedPackage.robux} Robux thành công!`, "success");
      setScreen("success");
    } else {
      const orderId = "NXX" + Math.floor(100000 + Math.random() * 900000);
      await supabase.from('redemption_orders').insert({
        user_id: session.user.id,
        package_name: `${selectedPackage.robux} Robux`,
        package_id: selectedPackage.id,
        coins_charged: selectedPackage.coin_cost,
        delivery_target: account.username,
        delivery_method: 'bank',
        status: 'pending',
        order_code: orderId,
      });
      showToast(`Chuyển khoản ${formatMoney(selectedPackage.price)} đến Vietcombank - Nội dung: ${orderId}`, "success");
      setScreen("bank_info");
    }
  };

  const goHome = () => {
    setScreen("home");
    setSelectedPackage(null);
    setAccount(null);
    setUsername("");
  };

  if (screen === "home") {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f8ff', paddingBottom: 80 }}>
        {/* Header */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, padding: '12px 16px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(18px)', borderBottom: '1px solid #e7ebf4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setScreen("home")}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #2563eb, #60a5fa)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900 }}>◆</div>
            <div><strong style={{ display: 'block', fontSize: 16 }}>NXX STORE</strong><span style={{ fontSize: 10, color: '#8b95a7' }}>ROBUX SHOP</span></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#2563eb', fontWeight: 700 }}>🪙 {userCoins.toLocaleString()}</span>
          </div>
        </div>

        {/* Hero */}
        <div style={{ margin: '16px', padding: '32px 24px', borderRadius: 24, background: 'linear-gradient(135deg, #155eef, #2563eb 50%, #38bdf8)', color: 'white', boxShadow: '0 22px 55px rgba(37,99,235,0.24)' }}>
          <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 99, background: 'rgba(255,255,255,0.15)', fontSize: 11, fontWeight: 800 }}>⚡ ROBLOX TOP UP</div>
          <h1 style={{ margin: '16px 0 8px', fontSize: 36, fontWeight: 900, lineHeight: 1 }}>Nạp Robux<br/><span style={{ color: 'rgba(255,255,255,0.7)' }}>nhanh chóng</span></h1>
          <p style={{ fontSize: 14, opacity: 0.85, margin: '8px 0 20px' }}>Nạp Robux tự động, an toàn và tiện lợi. Hỗ trợ 24/7.</p>
          <button onClick={() => setScreen("account")} style={{ padding: '12px 24px', borderRadius: 12, background: 'white', color: '#2563eb', border: 'none', fontWeight: 900, fontSize: 14, cursor: 'pointer' }}>
            Mua Robux ngay →
          </button>
        </div>

        {/* Benefits */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: '0 16px' }}>
          {[
            { icon: '⚡', label: 'Tự động', desc: 'Xử lý nhanh' },
            { icon: '🛡️', label: 'An toàn', desc: 'Bảo mật' },
            { icon: '💬', label: 'Hỗ trợ', desc: '24/7' },
          ].map(b => (
            <div key={b.label} style={{ padding: 14, borderRadius: 16, background: 'white', border: '1px solid #e9edf5', textAlign: 'center' }}>
              <div style={{ fontSize: 24 }}>{b.icon}</div>
              <strong style={{ display: 'block', fontSize: 13, marginTop: 4 }}>{b.label}</strong>
              <span style={{ fontSize: 11, color: '#7b8495' }}>{b.desc}</span>
            </div>
          ))}
        </div>

        {/* Products */}
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 20, margin: 0 }}>🔥 Sản phẩm nổi bật</h2>
            <button onClick={() => setScreen("packages")} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Xem tất cả →</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {ROBUX_PACKAGES.slice(0, 4).map(pkg => (
              <div key={pkg.id} style={{ padding: 16, borderRadius: 16, background: 'white', border: '1px solid #e9edf5' }}>
                {pkg.popular && <span style={{ fontSize: 9, fontWeight: 700, color: '#2563eb', background: '#eaf2ff', padding: '2px 8px', borderRadius: 99 }}>🔥 BÁN CHẠY</span>}
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #60a5fa)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontWeight: 900 }}>R$</div>
                  <div style={{ fontSize: 20, fontWeight: 900, marginTop: 4 }}>{pkg.robux}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{formatMoney(pkg.price)}</strong>
                  <button onClick={() => { setSelectedPackage(pkg); setScreen("account"); }} style={{ width: 32, height: 32, borderRadius: '50%', background: '#edf4ff', color: '#2563eb', border: 'none', fontSize: 18, fontWeight: 900, cursor: 'pointer' }}>+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }
  // ===== ACCOUNT SCREEN =====
  if (screen === "account") {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f8ff', padding: '16px', paddingBottom: 80 }}>
        <button onClick={goHome} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>←</button>
        <h2 style={{ fontSize: 24, margin: '8px 0 4px' }}>Tài khoản Roblox</h2>
        <p style={{ color: '#7b8495', fontSize: 14, marginBottom: 20 }}>Nhập tài khoản nhận Robux</p>
        
        <div style={{ background: 'white', borderRadius: 20, padding: 20, border: '1px solid #e9edf5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#edf4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>👤</div>
            <div><span style={{ fontSize: 10, color: '#2563eb', fontWeight: 700 }}>BƯỚC 1</span><h3 style={{ margin: 0 }}>Nhập Username</h3></div>
          </div>
          <p style={{ fontSize: 13, color: '#6b7280' }}>Nhập chính xác tên tài khoản Roblox mà bạn muốn nhận Robux.</p>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginTop: 12 }}>Username Roblox</label>
          <div style={{ display: 'flex', alignItems: 'center', background: '#f9fbff', border: '2px solid #e5eaf2', borderRadius: 12, padding: '0 12px', marginTop: 4 }}>
            <span style={{ color: '#9ca3af' }}>@</span>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ví dụ: Builderman" style={{ width: '100%', padding: '12px 8px', border: 'none', background: 'transparent', outline: 'none', fontSize: 14 }} />
            {username && <button onClick={() => setUsername("")} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>✕</button>}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, fontSize: 12, color: '#6b7280' }}>
            <span>🔒</span>
            <p style={{ margin: 0 }}>Chúng tôi chỉ sử dụng Username để xác định tài khoản nhận Robux.</p>
          </div>
          <button onClick={verifyUsername} disabled={checking} style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, marginTop: 16, cursor: 'pointer', opacity: checking ? 0.6 : 1 }}>
            {checking ? '⏳ Đang kiểm tra...' : 'Kiểm tra tài khoản →'}
          </button>
        </div>
        
        <div style={{ marginTop: 12, padding: 16, borderRadius: 16, background: 'white', border: '1px solid #e9edf5', display: 'flex', gap: 12 }}>
          <div style={{ fontSize: 24 }}>🛡️</div>
          <div><strong style={{ fontSize: 13 }}>Thông tin của bạn được bảo mật</strong><p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>NXX315 Studio Rewards không yêu cầu mật khẩu Roblox của bạn.</p></div>
        </div>
        
        <BottomNav />
      </div>
    );
  }

// ===== PACKAGES SCREEN =====
if (screen === "packages") {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f8ff', padding: '16px', paddingBottom: 100 }}>
      <button onClick={() => account ? setScreen("packages") : setScreen("home")} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>←</button>
      <h2 style={{ fontSize: 24, margin: '8px 0 4px' }}>Chọn gói Robux</h2>
      <p style={{ color: '#7b8495', fontSize: 14, marginBottom: 16 }}>{account ? `Nạp cho @${account.username}` : "Chọn gói bạn muốn mua"}</p>
      
      {/* Hiển thị account */}
      {account && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, background: '#edf4ff', marginBottom: 12 }}>
          <span style={{ fontSize: 20 }}>👤</span>
          <div><span style={{ fontSize: 10, color: '#6b7280' }}>ĐANG NẠP CHO</span><strong style={{ display: 'block', fontSize: 14 }}>@{account.username}</strong></div>
          <span style={{ marginLeft: 'auto', color: '#16a34a', fontWeight: 700 }}>✓</span>
        </div>
      )}

      {/* Danh sách gói */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {ROBUX_PACKAGES.map(pkg => {
          const selected = selectedPackage?.id === pkg.id;
          return (
            <div key={pkg.id} onClick={() => setSelectedPackage(pkg)} style={{ 
              padding: 16, 
              borderRadius: 16, 
              background: 'white', 
              border: selected ? '3px solid #2563eb' : '1px solid #e9edf5', 
              cursor: 'pointer', 
              position: 'relative',
              boxShadow: selected ? '0 0 0 4px rgba(37,99,235,0.15)' : 'none'
            }}>
              {pkg.popular && <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 9, fontWeight: 700, color: '#2563eb', background: '#eaf2ff', padding: '2px 8px', borderRadius: 99 }}>🔥 BÁN CHẠY</span>}
              {selected && <span style={{ position: 'absolute', top: 8, left: 8, width: 24, height: 24, borderRadius: '50%', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✓</span>}
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #60a5fa)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontWeight: 900, fontSize: 18 }}>R$</div>
                <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4 }}>{pkg.robux}</div>
                {pkg.bonus && <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>+{pkg.bonus} BONUS</span>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <strong style={{ fontSize: 15, color: '#2563eb' }}>{formatMoney(pkg.price)}</strong>
                <div style={{ 
                  width: 32, height: 32, borderRadius: '50%', 
                  background: selected ? '#2563eb' : '#edf4ff', 
                  color: selected ? 'white' : '#2563eb', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: 18, fontWeight: 900 
                }}>
                  {selected ? '✓' : '+'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gói đã chọn + Nút thanh toán - LÀM NỔI BẬT */}
      {selectedPackage && (
        <div style={{ 
          marginTop: 20, 
          padding: 16, 
          borderRadius: 16, 
          background: '#eff6ff', 
          border: '2px solid #2563eb',
          boxShadow: '0 4px 20px rgba(37,99,235,0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 600 }}>GÓI ĐÃ CHỌN</span>
              <strong style={{ display: 'block', fontSize: 18 }}>{selectedPackage.robux} Robux</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 600 }}>Tổng</span>
              <strong style={{ display: 'block', fontSize: 18, color: '#2563eb' }}>{formatMoney(selectedPackage.price)}</strong>
            </div>
          </div>
          
          {/* ===== NÚT THANH TOÁN ===== */}
          <button 
            onClick={() => setScreen("checkout")} 
            style={{ 
              width: '100%', 
              padding: '16px', 
              borderRadius: 14, 
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)', 
              color: 'white', 
              border: 'none', 
              fontWeight: 700, 
              fontSize: 16, 
              marginTop: 12,
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(37,99,235,0.3)',
              transition: 'transform 0.2s'
            }}
            onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
          >
            Tiếp tục thanh toán →
          </button>
        </div>
      )}

      {/* Nếu chưa chọn gói thì hiển thị nút mờ */}
      {!selectedPackage && (
        <div style={{ 
          marginTop: 20, 
          padding: 16, 
          borderRadius: 16, 
          background: '#f3f4f6', 
          border: '2px dashed #d1d5db',
          textAlign: 'center',
          color: '#9ca3af'
        }}>
          <p style={{ margin: 0, fontSize: 14 }}>👆 Vui lòng chọn một gói Robux</p>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
      }
  // ===== CHECKOUT SCREEN =====
  if (screen === "checkout") {
    if (!selectedPackage) {
      return (
        <div style={{ minHeight: '100vh', background: '#f5f8ff', padding: '16px', paddingBottom: 80 }}>
          <button onClick={goHome} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>←</button>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
            <h3>Chưa chọn gói Robux</h3>
            <button onClick={() => setScreen("packages")} style={{ padding: '12px 24px', borderRadius: 12, background: '#2563eb', color: 'white', border: 'none', fontWeight: 700, marginTop: 12, cursor: 'pointer' }}>Chọn gói Robux →</button>
          </div>
          <BottomNav />
        </div>
      );
    }

    return (
      <div style={{ minHeight: '100vh', background: '#f5f8ff', padding: '16px', paddingBottom: 80 }}>
        <button onClick={() => setScreen("packages")} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>←</button>
        <h2 style={{ fontSize: 24, margin: '8px 0 4px' }}>Thanh toán</h2>
        <p style={{ color: '#7b8495', fontSize: 14, marginBottom: 16 }}>Kiểm tra đơn hàng trước khi thanh toán</p>

        <div style={{ background: 'white', borderRadius: 20, padding: 16, border: '1px solid #e9edf5' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingBottom: 12, borderBottom: '1px dashed #dce2eb' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #60a5fa)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>R$</div>
            <div><span style={{ fontSize: 10, color: '#6b7280' }}>Gói Robux</span><strong style={{ display: 'block', fontSize: 16 }}>{selectedPackage.robux} Robux</strong></div>
            <div style={{ marginLeft: 'auto' }}><strong>{formatMoney(selectedPackage.price)}</strong></div>
          </div>
          <div style={{ padding: '12px 0', borderBottom: '1px dashed #dce2eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span>👤 Tài khoản</span><strong>@{account?.username || username}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 4 }}><span>⚡ Phí giao dịch</span><strong style={{ color: '#16a34a' }}>Miễn phí</strong></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, fontSize: 16, fontWeight: 700 }}>
            <span>Tổng thanh toán</span>
            <span style={{ color: '#2563eb' }}>{formatMoney(selectedPackage.price)}</span>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Phương thức thanh toán</p>
          {[
            { id: 'coin', label: 'Xu', icon: '🪙', desc: `Dùng ${userCoins.toLocaleString()} Xu` },
            { id: 'bank', label: 'Ngân hàng', icon: '🏦', desc: 'Chuyển khoản ngân hàng' },
          ].map(method => (
            <div key={method.id} onClick={() => setPaymentMethod(method.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, border: paymentMethod === method.id ? '2px solid #2563eb' : '1px solid #e9edf5', background: paymentMethod === method.id ? '#f3f7ff' : 'white', marginBottom: 8, cursor: 'pointer' }}>
              <span style={{ fontSize: 24 }}>{method.icon}</span>
              <div><strong style={{ display: 'block', fontSize: 13 }}>{method.label}</strong><span style={{ fontSize: 11, color: '#6b7280' }}>{method.desc}</span></div>
              <div style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', border: paymentMethod === method.id ? '2px solid #2563eb' : '2px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {paymentMethod === method.id && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2563eb' }} />}
              </div>
            </div>
          ))}
        </div>

        <button onClick={handlePayment} disabled={processing} style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, marginTop: 16, cursor: 'pointer', opacity: processing ? 0.6 : 1 }}>
          {processing ? '⏳ Đang xử lý...' : `Thanh toán ${formatMoney(selectedPackage.price)}`}
        </button>

        <BottomNav />
      </div>
    );
  }

  // ===== SUCCESS SCREEN =====
  if (screen === "success") {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f8ff', padding: '16px', paddingBottom: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: 24, padding: 32, textAlign: 'center', maxWidth: 400, width: '100%', border: '1px solid #e9edf5' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: 36 }}>✓</div>
          <h2 style={{ margin: '16px 0 8px' }}>Thanh toán thành công! 🎉</h2>
          <p style={{ color: '#6b7280', fontSize: 14 }}>+{selectedPackage?.robux || 0} Robux sẽ được nạp vào tài khoản của bạn.</p>
          <div style={{ background: '#f7f9fc', borderRadius: 12, padding: 12, textAlign: 'left', margin: '16px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}><span>👤 Tài khoản</span><strong>@{account?.username}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}><span>📦 Gói</span><strong>{selectedPackage?.robux} Robux</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}><span>💳 Thanh toán</span><strong>{paymentMethod === 'coin' ? 'Xu' : 'Ngân hàng'}</strong></div>
          </div>
          <button onClick={goHome} style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Về trang chủ
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ===== BANK INFO SCREEN =====
  if (screen === "bank_info") {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f8ff', padding: '16px', paddingBottom: 80 }}>
        <button onClick={() => setScreen("checkout")} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>←</button>
        <h2 style={{ fontSize: 24, margin: '8px 0 4px' }}>Chuyển khoản ngân hàng</h2>
        <p style={{ color: '#7b8495', fontSize: 14, marginBottom: 16 }}>Hoàn tất thanh toán qua ngân hàng</p>
        
        <div style={{ background: 'white', borderRadius: 20, padding: 20, border: '1px solid #e9edf5' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ background: '#f7f9fc', padding: 12, borderRadius: 12, textAlign: 'center' }}>
              <span style={{ fontSize: 10, color: '#6b7280' }}>Ngân hàng</span>
              <strong style={{ display: 'block', fontSize: 16 }}>Vietcombank</strong>
            </div>
            <div style={{ background: '#f7f9fc', padding: 12, borderRadius: 12, textAlign: 'center' }}>
              <span style={{ fontSize: 10, color: '#6b7280' }}>Số tiền</span>
              <strong style={{ display: 'block', fontSize: 16, color: '#2563eb' }}>{formatMoney(selectedPackage?.price)}</strong>
            </div>
          </div>
          <div style={{ background: '#f7f9fc', padding: 12, borderRadius: 12, textAlign: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 10, color: '#6b7280' }}>Nội dung chuyển khoản</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <strong style={{ fontSize: 16 }}>NXX{Math.floor(100000 + Math.random() * 900000)}</strong>
              <button onClick={() => { navigator.clipboard?.writeText(`NXX${Math.floor(100000 + Math.random() * 900000)}`); showToast("Đã sao chép!"); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>📋</button>
            </div>
          </div>
          <div style={{ background: '#fef3c7', padding: 12, borderRadius: 12, fontSize: 12, color: '#92400e', display: 'flex', gap: 8 }}>
            <span>⚠️</span>
            <p style={{ margin: 0 }}>Sau khi chuyển khoản, đơn hàng sẽ được xử lý trong 15-30 phút. Vui lòng giữ lại biên lai.</p>
          </div>
        </div>
        
        <button onClick={goHome} style={{ width: '100%', padding: '14px', borderRadius: 12, background: '#2563eb', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, marginTop: 16, cursor: 'pointer' }}>
          Về trang chủ
        </button>
        
        <BottomNav />
      </div>
    );
  }

  return null;
}
