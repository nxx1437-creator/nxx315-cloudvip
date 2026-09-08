import React, { useState } from "react";
import "./Store.css";

// DANH SÁCH GÓI ROBUX

const ROBUX_PACKAGES = [
  { id: "robux-40", robux: 40, price: 14000, image: "/images/robux-40.jpg", popular: false },
  { id: "robux-80", robux: 80, price: 28000, image: "/images/robux-80.jpg", popular: false },
  { id: "robux-145", robux: 145, price: 50000, image: "/images/robux-145.jpg", popular: true },
  { id: "robux-300", robux: 300, price: 100000, image: "/images/robux-300.jpg", popular: true },
  { id: "robux-500", robux: 500, bonus: 100, price: 140000, image: "/images/robux-500.jpg", popular: false },
  { id: "robux-1000", robux: 1000, bonus: 200, price: 280000, image: "/images/robux-1000.jpg", popular: false },
];

/* =========================================================
   HÀM FORMAT TIỀN
   ========================================================= */

const formatMoney = (number) => {
  return new Intl.NumberFormat("vi-VN").format(number) + " VNĐ";
};
// ============================================
// PHẦN 2: MAIN COMPONENT & STATE
// ============================================

export default function Store() {
  /* ===== SCREEN ===== */
  const [screen, setScreen] = useState("home");

  /* ===== TÀI KHOẢN ROBLOX ===== */
  const [username, setUsername] = useState("");
  const [account, setAccount] = useState(null);

  /* ===== SẢN PHẨM ĐANG CHỌN ===== */
  const [selectedPackage, setSelectedPackage] = useState(null);

  /* ===== GIỎ HÀNG ===== */
  const [cart, setCart] = useState([]);

  /* ===== PHƯƠNG THỨC THANH TOÁN ===== */
  const [paymentMethod, setPaymentMethod] = useState("vietqr");

  /* ===== HIỂN THỊ GIỎ HÀNG ===== */
  const [cartOpen, setCartOpen] = useState(false);

  /* ===== ĐƠN HÀNG HIỆN TẠI ===== */
  const [currentOrder, setCurrentOrder] = useState(null);

  /* ===== TRẠNG THÁI KIỂM TRA USERNAME ===== */
  const [checkingAccount, setCheckingAccount] = useState(false);

  /* ===== THÔNG BÁO ===== */
  const [toast, setToast] = useState(null);

  /* ===== TÍNH SỐ LƯỢNG SẢN PHẨM TRONG GIỎ ===== */
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  /* ===== HIỂN THỊ TOAST ===== */
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  /* ===== QUAY LẠI ===== */
  const goBack = () => {
    if (screen === "account") { setScreen("home"); return; }
    if (screen === "verify") { setScreen("account"); return; }
    if (screen === "packages") { setScreen("verify"); return; }
    if (screen === "checkout") { setScreen("packages"); return; }
    if (screen === "qr") { setScreen("checkout"); return; }
    setScreen("home");
  };
// ============================================
// PHẦN 3: HANDLERS (XỬ LÝ)
// ============================================

  /* ===== KIỂM TRA USERNAME ROBLOX ===== */
  const verifyUsername = async () => {
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      showToast("Vui lòng nhập tên tài khoản Roblox", "error");
      return;
    }
    setCheckingAccount(true);
    setTimeout(() => {
      const fakeAccount = {
        username: cleanUsername,
        displayName: cleanUsername,
        userId: "123456789",
        avatar: `https://tr.rbxcdn.com/30DAY-AvatarHeadshot-${cleanUsername}/150/150/AvatarHeadshot/Png`,
      };
      setAccount(fakeAccount);
      setCheckingAccount(false);
      setScreen("verify");
    }, 900);
  };

  /* ===== THÊM SẢN PHẨM VÀO GIỎ ===== */
  const addToCart = (product) => {
    setCart((currentCart) => {
      const exists = currentCart.find((item) => item.id === product.id);
      if (exists) {
        return currentCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...currentCart, { ...product, quantity: 1 }];
    });
    showToast(`${product.robux} Robux đã thêm vào giỏ`);
  };

  /* ===== TĂNG/GIẢM SỐ LƯỢNG ===== */
  const increaseQuantity = (productId) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (productId) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  /* ===== XÓA SẢN PHẨM ===== */
  const removeFromCart = (productId) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId));
  };

  /* ===== CHỌN GÓI ===== */
  const choosePackage = (product) => {
    setSelectedPackage(product);
    if (!account) { setScreen("account"); return; }
    setScreen("checkout");
  };

  /* ===== MUA NGAY ===== */
  const buyNow = (product) => {
    setSelectedPackage(product);
    if (!account) { setScreen("account"); return; }
    setScreen("checkout");
  };

  /* ===== TIẾP TỤC ===== */
  const continueToPackages = () => setScreen("packages");
  const continueToCheckout = () => {
    if (!selectedPackage) {
      showToast("Vui lòng chọn một gói Robux", "error");
      return;
    }
    setScreen("checkout");
  };

  /* ===== TẠO ĐƠN HÀNG ===== */
  const createOrder = () => {
    if (!selectedPackage) {
      showToast("Chưa chọn gói Robux", "error");
      return;
    }
    const orderId = "NXX" + Math.floor(100000 + Math.random() * 900000);
    const order = {
      id: orderId,
      username: account?.username || username,
      userId: account?.userId || "123456789",
      product: selectedPackage,
      amount: selectedPackage.price,
      payment: paymentMethod,
      createdAt: new Date().toLocaleString("vi-VN"),
      status: "pending",
    };
    setCurrentOrder(order);
    setScreen("qr");
  };

  /* ===== HOÀN TẤT THANH TOÁN ===== */
  const completePayment = () => {
    if (!currentOrder) return;
    const completedOrder = { ...currentOrder, status: "success" };
    setCurrentOrder(completedOrder);
    if (selectedPackage) {
      setCart((currentCart) => currentCart.filter((item) => item.id !== selectedPackage.id));
    }
    setScreen("success");
  };
// ============================================
// PHẦN 4: SUB-COMPONENTS (Header, Hero, Benefits, ProductCard)
// ============================================

  /* ===== ROBUX ICON ===== */
  const RobuxIcon = ({ size = 58 }) => (
    <div className="robux-icon" style={{ width: size, height: size }}>
      <span>◇</span>
    </div>
  );

  /* ===== PRODUCT CARD ===== */
  const ProductCard = ({ product }) => {
    const isSelected = selectedPackage?.id === product.id;
    return (
      <div className={`product-card ${isSelected ? "selected" : ""}`}>
        {product.popular && <div className="popular-badge">🔥 BÁN CHẠY</div>}
        <div className="product-image">
          <div className="product-glow"></div>
          <RobuxIcon size={58} />
          <span className="product-amount">{product.robux}</span>
        </div>
        <div className="product-info">
          <h3>{product.robux} Robux</h3>
          {product.bonus && <span className="product-bonus">+{product.bonus} BONUS</span>}
          <div className="product-bottom">
            <div className="product-price">{formatMoney(product.price)}</div>
            <button className="add-button" onClick={() => addToCart(product)}>+</button>
          </div>
        </div>
      </div>
    );
  };

  /* ===== HEADER ===== */
  const Header = () => (
    <header className="store-header">
      <button className="brand" onClick={() => setScreen("home")}>
        <div className="brand-mark">◇</div>
        <div className="brand-text">
          <strong>NXX STORE</strong>
          <span>ROBUX SHOP</span>
        </div>
      </button>
      <div className="header-right">
        <button className="header-icon" onClick={() => setCartOpen(true)}>
          🛒
          {cartCount > 0 && <span className="header-cart-count">{cartCount}</span>}
        </button>
        <button className="header-icon">☰</button>
      </div>
    </header>
  );

  /* ===== HERO ===== */
  const Hero = () => (
    <section className="hero-section">
      <div className="hero-background"></div>
      <div className="hero-content">
        <div className="hero-label">⚡ ROBLOX TOP UP</div>
        <h1>Nạp Robux <span>nhanh chóng</span></h1>
        <p>Nạp Robux tự động, an toàn và tiện lợi. Hỗ trợ 24/7.</p>
        <button className="hero-button" onClick={() => setScreen("account")}>
          <span>Mua Robux ngay</span> <b>→</b>
        </button>
      </div>
      <div className="hero-art">
        <div className="hero-circle hero-circle-one"></div>
        <div className="hero-circle hero-circle-two"></div>
        <div className="hero-robux"><RobuxIcon size={96} /></div>
        <div className="hero-controller">🎮</div>
      </div>
    </section>
  );

  /* ===== BENEFITS ===== */
  const Benefits = () => (
    <section className="benefits-section">
      <div className="benefit-item">
        <div className="benefit-icon">⚡</div>
        <div><strong>Tự động</strong><span>Xử lý nhanh</span></div>
      </div>
      <div className="benefit-item">
        <div className="benefit-icon">🛡️</div>
        <div><strong>An toàn</strong><span>Bảo mật</span></div>
      </div>
      <div className="benefit-item">
        <div className="benefit-icon">💬</div>
        <div><strong>Hỗ trợ</strong><span>24/7</span></div>
      </div>
    </section>
  );
// ============================================
// PHẦN 5: PRODUCT SECTION, HOW TO BUY, FOOTER
// ============================================

  /* ===== PRODUCT SECTION ===== */
  const ProductSection = () => (
    <section className="products-section">
      <div className="section-header">
        <div>
          <span className="section-label">🔥 SẢN PHẨM NỔI BẬT</span>
          <h2>Chọn gói Robux</h2>
        </div>
        <button className="view-all-button" onClick={() => setScreen("packages")}>
          Xem tất cả <span>→</span>
        </button>
      </div>
      <div className="products-grid">
        {ROBUX_PACKAGES.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );

  /* ===== HOW TO BUY ===== */
  const HowToBuy = () => (
    <section className="how-section">
      <div className="how-header">
        <span>✨ ĐƠN GIẢN</span>
        <h2>Mua Robux chỉ 3 bước</h2>
        <p>Không cần thao tác phức tạp.</p>
      </div>
      <div className="how-grid">
        <div className="how-card">
          <div className="how-number">01</div>
          <div className="how-icon">👤</div>
          <h3>Nhập tài khoản</h3>
          <p>Nhập username Roblox của bạn.</p>
        </div>
        <div className="how-card">
          <div className="how-number">02</div>
          <div className="how-icon">◇</div>
          <h3>Chọn gói Robux</h3>
          <p>Chọn số Robux bạn muốn mua.</p>
        </div>
        <div className="how-card">
          <div className="how-number">03</div>
          <div className="how-icon">💳</div>
          <h3>Thanh toán</h3>
          <p>Thanh toán và nhận Robux.</p>
        </div>
      </div>
    </section>
  );

  /* ===== FOOTER ===== */
  const Footer = () => (
    <footer className="store-footer">
      <div className="footer-brand">
        <div className="brand-mark">◇</div>
        <div><strong>NXX STORE</strong><span>Roblox Top Up</span></div>
      </div>
      <p>© 2026 NXX STORE. All rights reserved.</p>
    </footer>
  );

  /* ===== BOTTOM NAVIGATION ===== */
  const BottomNavigation = () => (
    <nav className="bottom-navigation">
      <button className={screen === "home" ? "active" : ""} onClick={() => setScreen("home")}>
        <span>🏠</span><small>Trang chủ</small>
      </button>
      <button onClick={() => setScreen("packages")}>
        <span>◇</span><small>Robux</small>
      </button>
      <button onClick={() => setScreen("orders")}>
        <span>📋</span><small>Đơn hàng</small>
      </button>
      <button onClick={() => setScreen("account")}>
        <span>👤</span><small>Tài khoản</small>
      </button>
    </nav>
  );

  /* ===== HOME SCREEN ===== */
  const HomeScreen = () => (
    <>
      <Header />
      <main>
        <Hero />
        <Benefits />
        <ProductSection />
        <HowToBuy />
      </main>
      <Footer />
    </>
  );
// ============================================
// PHẦN 6: CART DRAWER, TOAST, ACCOUNT SCREEN
// ============================================

  /* ===== CART DRAWER ===== */
  const CartDrawer = () => {
    if (!cartOpen) return null;
    return (
      <div className="cart-overlay">
        <div className="cart-backdrop" onClick={() => setCartOpen(false)}></div>
        <aside className="cart-drawer">
          <div className="cart-header">
            <div>
              <span>GIỎ HÀNG</span>
              <h2>{cartCount} sản phẩm</h2>
            </div>
            <button onClick={() => setCartOpen(false)}>×</button>
          </div>
          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h3>Giỏ hàng trống</h3>
              <p>Hãy chọn một gói Robux để bắt đầu.</p>
              <button className="primary-button" onClick={() => { setCartOpen(false); setScreen("packages"); }}>
                Xem gói Robux
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div className="cart-item-image"><RobuxIcon size={42} /></div>
                    <div className="cart-item-info">
                      <strong>{item.robux} Robux</strong>
                      <span>{formatMoney(item.price)}</span>
                      <div className="quantity">
                        <button onClick={() => decreaseQuantity(item.id)}>−</button>
                        <b>{item.quantity}</b>
                        <button onClick={() => increaseQuantity(item.id)}>+</button>
                      </div>
                    </div>
                    <button className="remove-item" onClick={() => removeFromCart(item.id)}>×</button>
                  </div>
                ))}
              </div>
              <div className="cart-bottom">
                <div className="cart-total">
                  <span>Tổng cộng</span>
                  <strong>{formatMoney(cartTotal)}</strong>
                </div>
                <button className="primary-button full" onClick={() => {
                  setCartOpen(false);
                  if (!account) setScreen("account");
                  else setScreen("checkout");
                }}>
                  Thanh toán →
                </button>
              </div>
            </>
          )}
        </aside>
      </div>
    );
  };

  /* ===== TOAST ===== */
  const Toast = () => {
    if (!toast) return null;
    return <div className={`toast ${toast.type === "error" ? "toast-error" : ""}`}>
      <span>{toast.type === "error" ? "!" : "✓"}</span>
      {toast.message}
    </div>;
  };

  /* ===== ACCOUNT SCREEN ===== */
  const AccountScreen = () => (
    <div className="inner-page">
      <div className="inner-page-header">
        <button className="back-button" onClick={goBack}>←</button>
        <div>
          <span className="page-kicker">NXX STORE</span>
          <h1>Tài khoản Roblox</h1>
          <p>Nhập tài khoản nhận Robux</p>
        </div>
      </div>
      <div className="account-card">
        <div className="account-card-top">
          <div className="account-big-icon">👤</div>
          <div>
            <span className="card-label">BƯỚC 1</span>
            <h2>Nhập Username</h2>
          </div>
        </div>
        <p className="account-description">Nhập chính xác tên tài khoản Roblox mà bạn muốn nhận Robux.</p>
        <label className="input-label">Username Roblox</label>
        <div className="username-input">
          <span className="input-icon">@</span>
          <input type="text" value={username} placeholder="Ví dụ: Builderman" onChange={(e) => setUsername(e.target.value)} />
          {username.length > 0 && <button className="clear-input" onClick={() => setUsername("")}>×</button>}
        </div>
        <div className="username-note">
          <span>🔒</span>
          <p>Chúng tôi chỉ sử dụng Username để xác định tài khoản nhận Robux.</p>
        </div>
        <button className="primary-button full" disabled={checkingAccount} onClick={verifyUsername}>
          {checkingAccount ? <>⏳ Đang kiểm tra...</> : <>Kiểm tra tài khoản →</>}
        </button>
        <button className="text-button" onClick={() => showToast("Hãy nhập Username, không phải Display Name.")}>
          Không biết Username ở đâu? <span>Xem hướng dẫn</span>
        </button>
      </div>
      <div className="security-card">
        <div className="security-icon">🛡️</div>
        <div>
          <strong>Thông tin của bạn được bảo mật</strong>
          <p>NXX STORE không yêu cầu mật khẩu Roblox của bạn.</p>
        </div>
      </div>
    </div>
  );
// ============================================
// PHẦN 7: VERIFY, PACKAGES, CHECKOUT SCREENS
// ============================================

  /* ===== VERIFY SCREEN ===== */
  const VerifyScreen = () => (
    <div className="inner-page">
      <div className="inner-page-header">
        <button className="back-button" onClick={goBack}>←</button>
        <div>
          <span className="page-kicker">NXX STORE</span>
          <h1>Xác nhận tài khoản</h1>
          <p>Kiểm tra thông tin trước khi tiếp tục</p>
        </div>
      </div>
      <div className="verified-card">
        <div className="verified-success">✓</div>
        <span className="verified-label">TÀI KHOẢN HỢP LỆ</span>
        <h2>Tìm thấy tài khoản!</h2>
        <p>Hãy kiểm tra thông tin bên dưới.</p>
        <div className="roblox-profile">
          <div className="profile-avatar">{account?.avatar ? <img src={account.avatar} alt="avatar" /> : <span>👤</span>}</div>
          <div className="profile-info">
            <span>Username</span>
            <strong>@{account?.username || username}</strong>
            <small>ID: {account?.userId || "123456789"}</small>
          </div>
          <div className="profile-check">✓</div>
        </div>
        <div className="verified-notice">
          <span>ℹ</span>
          <p>Robux sẽ được nạp vào đúng tài khoản này. Hãy chắc chắn Username là chính xác.</p>
        </div>
        <button className="primary-button full" onClick={continueToPackages}>Chọn gói Robux →</button>
        <button className="outline-button full" onClick={() => { setAccount(null); setUsername(""); setScreen("account"); }}>
          ← Nhập tài khoản khác
        </button>
      </div>
    </div>
  );

  /* ===== PACKAGES SCREEN ===== */
  const PackagesScreen = () => (
    <div className="inner-page">
      <div className="inner-page-header">
        <button className="back-button" onClick={goBack}>←</button>
        <div>
          <span className="page-kicker">NXX STORE</span>
          <h1>Chọn gói Robux</h1>
          <p>{account ? `Nạp cho @${account.username}` : "Chọn gói bạn muốn mua"}</p>
        </div>
      </div>
      {account && (
        <div className="mini-account">
          <div className="mini-avatar">👤</div>
          <div className="mini-account-info">
            <span>ĐANG NẠP CHO</span>
            <strong>@{account.username}</strong>
          </div>
          <div className="mini-account-status">✓</div>
        </div>
      )}
      <div className="packages-grid">
        {ROBUX_PACKAGES.map((product) => {
          const selected = selectedPackage?.id === product.id;
          return (
            <div key={product.id} className={`package-card ${selected ? "selected" : ""}`} onClick={() => setSelectedPackage(product)}>
              {product.popular && <div className="package-popular">🔥 BÁN CHẠY</div>}
              {selected && <div className="package-selected">✓</div>}
              <div className="package-image"><RobuxIcon size={54} /></div>
              <div className="package-info">
                <h3>{product.robux} Robux</h3>
                {product.bonus && <span className="package-bonus">+{product.bonus} BONUS</span>}
                <div className="package-footer">
                  <strong>{formatMoney(product.price)}</strong>
                  <button className={selected ? "package-add selected" : "package-add"} onClick={(e) => { e.stopPropagation(); setSelectedPackage(product); }}>
                    {selected ? "✓" : "+"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {selectedPackage && (
        <div className="selected-package-box">
          <div className="selected-package-left">
            <div className="selected-package-icon"><RobuxIcon size={38} /></div>
            <div>
              <span>GÓI ĐÃ CHỌN</span>
              <strong>{selectedPackage.robux} Robux</strong>
            </div>
          </div>
          <div className="selected-package-price">
            <span>Tổng</span>
            <strong>{formatMoney(selectedPackage.price)}</strong>
          </div>
        </div>
      )}
      <button className="primary-button full" disabled={!selectedPackage} onClick={continueToCheckout}>
        Tiếp tục thanh toán →
      </button>
    </div>
  );

  /* ===== CHECKOUT SCREEN ===== */
  const CheckoutScreen = () => {
    if (!selectedPackage) {
      return (
        <div className="inner-page">
          <div className="inner-page-header">
            <button className="back-button" onClick={goBack}>←</button>
            <div>
              <span className="page-kicker">NXX STORE</span>
              <h1>Thanh toán</h1>
              <p>Chưa có sản phẩm được chọn</p>
            </div>
          </div>
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <h2>Chưa chọn gói Robux</h2>
            <p>Hãy chọn một gói Robux trước khi thanh toán.</p>
            <button className="primary-button" onClick={() => setScreen("packages")}>Chọn gói Robux →</button>
          </div>
        </div>
      );
    }
    return (
      <div className="inner-page">
        <div className="inner-page-header">
          <button className="back-button" onClick={goBack}>←</button>
          <div>
            <span className="page-kicker">NXX STORE</span>
            <h1>Thanh toán</h1>
            <p>Kiểm tra đơn hàng trước khi thanh toán</p>
          </div>
        </div>
        <div className="order-summary">
          <div className="order-product">
            <div className="order-product-image"><RobuxIcon size={48} /></div>
            <div className="order-product-info">
              <span>Gói Robux</span>
              <strong>{selectedPackage.robux} Robux</strong>
              {selectedPackage.bonus && <small>+{selectedPackage.bonus} Robux bonus</small>}
            </div>
            <div className="order-product-price"><strong>{formatMoney(selectedPackage.price)}</strong></div>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row"><span>👤 Tài khoản</span><strong>@{account?.username || username}</strong></div>
          <div className="summary-row"><span>🆔 User ID</span><strong>{account?.userId || "123456789"}</strong></div>
          <div className="summary-row"><span>⚡ Phí giao dịch</span><strong className="free-text">Miễn phí</strong></div>
          <div className="summary-divider"></div>
          <div className="summary-total"><span>Tổng thanh toán</span><strong>{formatMoney(selectedPackage.price)}</strong></div>
        </div>
        <div className="payment-methods">
          {[
            { id: 'vietqr', label: 'VietQR', icon: 'QR' },
            { id: 'momo', label: 'MoMo', icon: 'M' },
            { id: 'zalopay', label: 'ZaloPay', icon: 'Z' },
          ].map((method) => (
            <button key={method.id} className={`payment-method ${paymentMethod === method.id ? "active" : ""}`} onClick={() => setPaymentMethod(method.id)}>
              <div className="payment-logo">{method.icon}</div>
              <div className="payment-info"><strong>{method.label}</strong><span>Thanh toán qua {method.label}</span></div>
              <div className="radio">{paymentMethod === method.id && <div></div>}</div>
            </button>
          ))}
        </div>
        <div className="checkout-bottom">
          <div className="checkout-total"><span>Tổng thanh toán</span><strong>{formatMoney(selectedPackage.price)}</strong></div>
          <button className="primary-button full" onClick={createOrder}>Thanh toán ngay →</button>
        </div>
      </div>
    );
  };
// ============================================
// PHẦN 8: QR, SUCCESS, ORDERS SCREENS & MAIN RENDER
// ============================================

  /* ===== QR PAYMENT SCREEN ===== */
  const QRPaymentScreen = () => {
    if (!currentOrder) {
      return (
        <div className="inner-page">
          <div className="inner-page-header">
            <button className="back-button" onClick={goBack}>←</button>
            <div>
              <span className="page-kicker">NXX STORE</span>
              <h1>Thanh toán</h1>
              <p>Không tìm thấy đơn hàng</p>
            </div>
          </div>
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <h2>Không có đơn hàng</h2>
            <button className="primary-button" onClick={() => setScreen("packages")}>Chọn gói Robux →</button>
          </div>
        </div>
      );
    }
    return (
      <div className="inner-page">
        <div className="inner-page-header">
          <button className="back-button" onClick={goBack}>←</button>
          <div>
            <span className="page-kicker">NXX STORE</span>
            <h1>Thanh toán</h1>
            <p>Hoàn tất giao dịch để nhận Robux</p>
          </div>
        </div>
        <div className="qr-order-header">
          <div><span className="qr-order-label">MÃ ĐƠN HÀNG</span><strong>#{currentOrder.id}</strong></div>
          <div className="qr-status waiting">● Đang chờ thanh toán</div>
        </div>
        <section className="qr-payment-card">
          <div className="qr-card-top"><span>THANH TOÁN QUA</span><strong>{paymentMethod === "vietqr" ? "VietQR" : paymentMethod === "momo" ? "MoMo" : "ZaloPay"}</strong></div>
          <div className="qr-code-wrapper">
            <div className="qr-code">
              <div className="qr-corner top-left"></div>
              <div className="qr-corner top-right"></div>
              <div className="qr-corner bottom-left"></div>
              <div className="qr-pattern"></div>
            </div>
          </div>
          <p className="qr-scan-text">Mở ứng dụng ngân hàng và quét mã QR</p>
          <div className="qr-amount"><span>Số tiền cần thanh toán</span><strong>{formatMoney(currentOrder.amount)}</strong></div>
          <div className="qr-info-list">
            <div className="qr-info-row"><span>Nội dung chuyển khoản</span><button className="copy-value" onClick={() => { navigator.clipboard?.writeText(currentOrder.id); showToast("Đã sao chép nội dung"); }}>{currentOrder.id} <span>⧉</span></button></div>
            <div className="qr-info-row"><span>Tài khoản Roblox</span><strong>@{currentOrder.username}</strong></div>
            <div className="qr-info-row"><span>Gói Robux</span><strong>{currentOrder.product?.robux} Robux</strong></div>
          </div>
        </section>
        <div className="payment-countdown">
          <div className="countdown-icon">⏱</div>
          <div><span>Mã thanh toán có hiệu lực trong</span><strong>10:00</strong></div>
        </div>
        <div className="qr-actions">
          <button className="primary-button full" onClick={completePayment}>Tôi đã thanh toán <span>✓</span></button>
          <button className="text-button" onClick={() => setScreen("checkout")}>← Quay lại</button>
        </div>
        <div className="payment-warning">⚠️ Vui lòng chuyển đúng số tiền và nội dung chuyển khoản để hệ thống tự động xác nhận.</div>
      </div>
    );
  };

  /* ===== SUCCESS SCREEN ===== */
  const SuccessScreen = () => {
    if (!currentOrder) {
      return (
        <div className="inner-page">
          <div className="inner-page-header">
            <button className="back-button" onClick={goBack}>←</button>
            <div>
              <span className="page-kicker">NXX STORE</span>
              <h1>Hoàn tất</h1>
              <p>Không tìm thấy đơn hàng</p>
            </div>
          </div>
          <div className="empty-state"><div className="empty-state-icon">⚠️</div><h2>Không có đơn hàng</h2><button className="primary-button" onClick={() => setScreen("home")}>Về trang chủ</button></div>
        </div>
      );
    }
    return (
      <div className="inner-page">
        <div className="inner-page-header">
          <button className="back-button" onClick={goBack}>←</button>
          <div>
            <span className="page-kicker">NXX STORE</span>
            <h1>Thanh toán thành công</h1>
            <p>Đơn hàng của bạn đã được ghi nhận</p>
          </div>
        </div>
        <div className="success-page">
          <div className="success-icon">✓</div>
          <h1>Thanh toán thành công! 🎉</h1>
          <p className="success-description">Đơn hàng của bạn đã được xác nhận. Robux sẽ được xử lý cho tài khoản Roblox của bạn.</p>
          <div className="success-order-card">
            <div className="success-order-header"><span>MÃ ĐƠN HÀNG</span><strong>#{currentOrder.id}</strong></div>
            <div className="summary-divider"></div>
            <div className="success-account"><div className="success-avatar">👤</div><div><span>Tài khoản Roblox</span><strong>@{currentOrder.username}</strong></div></div>
            <div className="success-detail-list">
              <div className="summary-row"><span>Gói Robux</span><strong>{currentOrder.product?.robux} Robux</strong></div>
              <div className="summary-row"><span>Phương thức</span><strong>{currentOrder.payment === "vietqr" ? "VietQR" : currentOrder.payment === "momo" ? "MoMo" : "ZaloPay"}</strong></div>
              <div className="summary-row"><span>Trạng thái</span><strong className="success-text">✓ Đã thanh toán</strong></div>
              <div className="summary-row"><span>Tổng tiền</span><strong>{formatMoney(currentOrder.amount)}</strong></div>
            </div>
            <div className="summary-divider"></div>
            <div className="success-total"><span>Tổng thanh toán</span><strong>{formatMoney(currentOrder.amount)}</strong></div>
          </div>
          <div className="success-actions">
            <button className="primary-button full" onClick={() => setScreen("orders")}>Xem đơn hàng →</button>
            <button className="secondary-button full" onClick={() => setScreen("home")}>Về trang chủ</button>
          </div>
        </div>
      </div>
    );
  };

  /* ===== ORDER HISTORY ===== */
  const OrdersScreen = () => (
    <div className="inner-page">
      <div className="inner-page-header">
        <button className="back-button" onClick={goBack}>←</button>
        <div>
          <span className="page-kicker">NXX STORE</span>
          <h1>Đơn hàng</h1>
          <p>Theo dõi các giao dịch của bạn</p>
        </div>
      </div>
      <div className="orders-page">
        <div className="orders-header"><div><span>LỊCH SỬ</span><h2>Đơn hàng của bạn</h2></div><div className="orders-count">{currentOrder ? "1 đơn" : "0 đơn"}</div></div>
        {currentOrder ? (
          <div className="order-history-card">
            <div className="order-history-top">
              <div className="order-history-icon"><RobuxIcon size={42} /></div>
              <div className="order-history-info"><strong>{currentOrder.product?.robux} Robux</strong><span>@{currentOrder.username}</span></div>
              <div className="order-history-status">✓ Thành công</div>
            </div>
            <div className="summary-divider"></div>
            <div className="order-history-details">
              <div><span>Mã đơn</span><strong>#{currentOrder.id}</strong></div>
              <div><span>Số tiền</span><strong>{formatMoney(currentOrder.amount)}</strong></div>
              <div><span>Thanh toán</span><strong>{currentOrder.payment === "vietqr" ? "VietQR" : currentOrder.payment === "momo" ? "MoMo" : "ZaloPay"}</strong></div>
            </div>
            <button className="order-detail-button" onClick={() => setScreen("success")}>Xem chi tiết →</button>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h2>Chưa có đơn hàng</h2>
            <p>Các đơn hàng sau khi thanh toán sẽ xuất hiện ở đây.</p>
            <button className="primary-button" onClick={() => setScreen("packages")}>Mua Robux →</button>
          </div>
        )}
      </div>
    </div>
  );

  /* ===== MAIN RENDER ===== */
  const renderScreen = () => {
    switch (screen) {
      case "home": return <HomeScreen />;
      case "account": return <AccountScreen />;
      case "verify": return <VerifyScreen />;
      case "packages": return <PackagesScreen />;
      case "checkout": return <CheckoutScreen />;
      case "qr": return <QRPaymentScreen />;
      case "success": return <SuccessScreen />;
      case "orders": return <OrdersScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <div className="store-app">
      {renderScreen()}
      <CartDrawer />
      <Toast />
      <BottomNavigation />
    </div>
  );
}