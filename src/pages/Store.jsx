import React, { useState } from "react";
import "./Store.css";

/* =========================================================
   NXX STORE
   ROBLOX / ROBUX STORE
   ========================================================= */

/* =========================================================
   DANH SÁCH GÓI ROBUX
   ========================================================= */

const ROBUX_PACKAGES = [
  {
    id: "robux-40",
    robux: 40,
    price: 14000,
    image: "/images/robux-40.jpg",
    popular: false,
  },

  {
    id: "robux-80",
    robux: 80,
    price: 28000,
    image: "/images/robux-80.jpg",
    popular: false,
  },

  {
    id: "robux-145",
    robux: 145,
    price: 50000,
    image: "/images/robux-145.jpg",
    popular: true,
  },

  {
    id: "robux-300",
    robux: 300,
    price: 100000,
    image: "/images/robux-300.jpg",
    popular: true,
  },

  {
    id: "robux-500",
    robux: 500,
    bonus: 100,
    price: 140000,
    image: "/images/robux-500.jpg",
    popular: false,
  },

  {
    id: "robux-1000",
    robux: 1000,
    bonus: 200,
    price: 280000,
    image: "/images/robux-1000.jpg",
    popular: false,
  },
];

/* =========================================================
   HÀM FORMAT TIỀN
   14000 -> 14.000 VNĐ
   ========================================================= */

const formatMoney = (number) => {
  return new Intl.NumberFormat("vi-VN").format(number) + " VNĐ";
};

/* =========================================================
   COMPONENT CHÍNH
   ========================================================= */

export default function Store() {

  /* =======================================================
     SCREEN

     home
     account
     verify
     packages
     checkout
     qr
     success
     orders
     ======================================================= */

  const [screen, setScreen] = useState("home");

  /* =======================================================
     TÀI KHOẢN ROBLOX
     ======================================================= */

  const [username, setUsername] = useState("");

  const [account, setAccount] = useState(null);

  /* =======================================================
     SẢN PHẨM ĐANG CHỌN
     ======================================================= */

  const [selectedPackage, setSelectedPackage] =
    useState(null);

  /* =======================================================
     GIỎ HÀNG
     ======================================================= */

  const [cart, setCart] = useState([]);

  /* =======================================================
     PHƯƠNG THỨC THANH TOÁN
     ======================================================= */

  const [paymentMethod, setPaymentMethod] =
    useState("vietqr");

  /* =======================================================
     HIỂN THỊ GIỎ HÀNG
     ======================================================= */

  const [cartOpen, setCartOpen] = useState(false);

  /* =======================================================
     ĐƠN HÀNG HIỆN TẠI
     ======================================================= */

  const [currentOrder, setCurrentOrder] =
    useState(null);

  /* =======================================================
     TRẠNG THÁI KIỂM TRA USERNAME
     ======================================================= */

  const [checkingAccount, setCheckingAccount] =
    useState(false);

  /* =======================================================
     THÔNG BÁO
     ======================================================= */

  const [toast, setToast] = useState(null);

  /* =======================================================
     TÍNH SỐ LƯỢNG SẢN PHẨM TRONG GIỎ
     ======================================================= */

  const cartCount = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  /* =======================================================
     TÍNH TỔNG TIỀN
     ======================================================= */

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      item.price *
        item.quantity,
    0
  );

  /* =======================================================
     HIỂN THỊ TOAST
     ======================================================= */

  const showToast = (
    message,
    type = "success"
  ) => {

    setToast({
      message,
      type,
    });

    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  /* =======================================================
     QUAY LẠI
     ======================================================= */

  const goBack = () => {

    if (screen === "account") {
      setScreen("home");
      return;
    }

    if (screen === "verify") {
      setScreen("account");
      return;
    }

    if (screen === "packages") {
      setScreen("verify");
      return;
    }

    if (screen === "checkout") {
      setScreen("packages");
      return;
    }

    if (screen === "qr") {
      setScreen("checkout");
      return;
    }

    setScreen("home");
  };

  /* =======================================================
     KIỂM TRA USERNAME ROBLOX
     ======================================================= */

  const verifyUsername = async () => {

    const cleanUsername =
      username.trim();

    if (!cleanUsername) {

      showToast(
        "Vui lòng nhập tên tài khoản Roblox",
        "error"
      );

      return;
    }

    setCheckingAccount(true);

    /*
      DEMO

      Sau này chỗ này có thể
      gọi API Roblox thật.
    */

    setTimeout(() => {

      const fakeAccount = {
        username: cleanUsername,
        displayName: cleanUsername,
        userId: "123456789",
        avatar:
          `https://tr.rbxcdn.com/30DAY-AvatarHeadshot-${cleanUsername}/150/150/AvatarHeadshot/Png`,
      };

      setAccount(fakeAccount);

      setCheckingAccount(false);

      setScreen("verify");

    }, 900);
  };

  /* =======================================================
     THÊM SẢN PHẨM VÀO GIỎ
     ======================================================= */

  const addToCart = (product) => {

    setCart((currentCart) => {

      const exists =
        currentCart.find(
          (item) =>
            item.id === product.id
        );

      if (exists) {

        return currentCart.map(
          (item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity:
                    item.quantity + 1,
                }
              : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });

    showToast(
      `${product.robux} Robux đã thêm vào giỏ`
    );
  };

  /* =======================================================
     TĂNG SỐ LƯỢNG
     ======================================================= */

  const increaseQuantity = (productId) => {

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item
      )
    );
  };

  /* =======================================================
     GIẢM SỐ LƯỢNG
     ======================================================= */

  const decreaseQuantity = (productId) => {

    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  };

  /* =======================================================
     XÓA SẢN PHẨM
     ======================================================= */

  const removeFromCart = (productId) => {

    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          item.id !== productId
      )
    );
  };

  /* =======================================================
     CHỌN GÓI
     ======================================================= */

  const choosePackage = (product) => {

    setSelectedPackage(product);

    /*
      Nếu tài khoản chưa được nhập
      thì chuyển sang bước tài khoản.
    */

    if (!account) {
      setScreen("account");
      return;
    }

    setScreen("checkout");
  };

  /* =======================================================
     MUA NGAY
     ======================================================= */

  const buyNow = (product) => {

    setSelectedPackage(product);

    if (!account) {
      setScreen("account");
      return;
    }

    setScreen("checkout");
  };

  /* =======================================================
     TIẾP TỤC SAU KHI XÁC NHẬN ACCOUNT
     ======================================================= */

  const continueToPackages = () => {

    setScreen("packages");
  };

  /* =======================================================
     ĐI TỚI CHECKOUT
     ======================================================= */

  const continueToCheckout = () => {

    if (!selectedPackage) {

      showToast(
        "Vui lòng chọn một gói Robux",
        "error"
      );

      return;
    }

    setScreen("checkout");
  };

  /* =======================================================
     TẠO ĐƠN HÀNG
     ======================================================= */

  const createOrder = () => {

    if (!selectedPackage) {

      showToast(
        "Chưa chọn gói Robux",
        "error"
      );

      return;
    }

    const orderId =
      "NXX" +
      Math.floor(
        100000 +
        Math.random() * 900000
      );

    const order = {

      id: orderId,

      username:
        account?.username ||
        username,

      userId:
        account?.userId ||
        "123456789",

      product:
        selectedPackage,

      amount:
        selectedPackage.price,

      payment:
        paymentMethod,

      createdAt:
        new Date().toLocaleString(
          "vi-VN"
        ),

      status:
        "pending",
    };

    setCurrentOrder(order);

    setScreen("qr");
  };

  /* =======================================================
     HOÀN TẤT THANH TOÁN
     ======================================================= */

  const completePayment = () => {

    if (!currentOrder) return;

    const completedOrder = {
      ...currentOrder,
      status: "success",
    };

    setCurrentOrder(
      completedOrder
    );

    /*
      Xóa sản phẩm đã mua
      khỏi giỏ hàng.
    */

    if (selectedPackage) {

      setCart((currentCart) =>
        currentCart.filter(
          (item) =>
            item.id !==
            selectedPackage.id
        )
      );
    }

    setScreen("success");
  };

  /*============
     RESET STORE
     ===========

  const resetStore = () => {

    setSelectedPackage(null);

    setCurrentOrder(null);

    setScreen("home");
  };

    /* =======================================================
     RENDER PRODUCT CARD
     ======================================================= */

  const ProductCard = ({ product }) => {
    const isSelected =
      selectedPackage?.id === product.id;

    return (
      <div
        className={`product-card ${
          isSelected ? "selected" : ""
        }`}
      >

        {product.popular && (
          <div className="popular-badge">
            🔥 BÁN CHẠY
          </div>
        )}

        <div className="product-image">

          <div className="product-glow"></div>

          <RobuxIcon size={58} />

          <span className="product-amount">
            {product.robux}
          </span>

        </div>

        <div className="product-info">

          <h3>
            {product.robux} Robux
          </h3>

          {product.bonus && (
            <span className="product-bonus">
              +{product.bonus} BONUS
            </span>
          )}

          <div className="product-bottom">

            <div className="product-price">
              {formatMoney(product.price)}
            </div>

            <button
              className="add-button"
              onClick={() =>
                addToCart(product)
              }
            >
              +
            </button>

          </div>

        </div>

      </div>
    );
  };


  /* =======================================================
     HEADER
     ======================================================= */

  const Header = () => {
    return (
      <header className="store-header">

        <button
          className="brand"
          onClick={() => setScreen("home")}
        >

          <div className="brand-mark">
            ◇
          </div>

          <div className="brand-text">

            <strong>
              NXX STORE
            </strong>

            <span>
              ROBUX SHOP
            </span>

          </div>

        </button>


        <div className="header-right">

          <button
            className="header-icon"
            onClick={() =>
              setCartOpen(true)
            }
          >

            🛒

            {cartCount > 0 && (
              <span className="header-cart-count">
                {cartCount}
              </span>
            )}

          </button>


          <button className="header-icon">
            ☰
          </button>

        </div>

      </header>
    );
  };


  /* =======================================================
     HERO
     ======================================================= */

  const Hero = () => {
    return (
      <section className="hero-section">

        <div className="hero-background"></div>

        <div className="hero-content">

          <div className="hero-label">
            ⚡ ROBLOX TOP UP
          </div>

          <h1>

            Nạp Robux

            <span>
              nhanh chóng
            </span>

          </h1>

          <p>
            Nạp Robux tự động,
            an toàn và tiện lợi.
            Hỗ trợ 24/7.
          </p>

          <button
            className="hero-button"
            onClick={() =>
              setScreen("account")
            }
          >

            <span>
              Mua Robux ngay
            </span>

            <b>
              →
            </b>

          </button>

        </div>


        <div className="hero-art">

          <div className="hero-circle hero-circle-one"></div>

          <div className="hero-circle hero-circle-two"></div>

          <div className="hero-robux">

            <RobuxIcon size={96} />

          </div>

          <div className="hero-controller">
            🎮
          </div>

        </div>

      </section>
    );
  };


  /* =======================================================
     BENEFITS
     ======================================================= */

  const Benefits = () => {
    return (
      <section className="benefits-section">

        <div className="benefit-item">

          <div className="benefit-icon">
            ⚡
          </div>

          <div>
            <strong>
              Tự động
            </strong>

            <span>
              Xử lý nhanh
            </span>
          </div>

        </div>


        <div className="benefit-item">

          <div className="benefit-icon">
            🛡️
          </div>

          <div>
            <strong>
              An toàn
            </strong>

            <span>
              Bảo mật
            </span>
          </div>

        </div>


        <div className="benefit-item">

          <div className="benefit-icon">
            💬
          </div>

          <div>
            <strong>
              Hỗ trợ
            </strong>

            <span>
              24/7
            </span>
          </div>

        </div>

      </section>
    );
  };


  /* =======================================================
     PRODUCT SECTION
     ======================================================= */

  const ProductSection = () => {
    return (
      <section className="products-section">

        <div className="section-header">

          <div>

            <span className="section-label">
              🔥 SẢN PHẨM NỔI BẬT
            </span>

            <h2>
              Chọn gói Robux
            </h2>

          </div>


          <button
            className="view-all-button"
            onClick={() =>
              setScreen("packages")
            }
          >
            Xem tất cả
            <span>→</span>
          </button>

        </div>


        <div className="products-grid">

          {ROBUX_PACKAGES
            .slice(0, 4)
            .map((product) => (

              <ProductCard
                key={product.id}
                product={product}
              />

            ))}

        </div>

      </section>
    );
  };


  /* =======================================================
     HOW TO BUY
     ======================================================= */

  const HowToBuy = () => {
    return (
      <section className="how-section">

        <div className="how-header">

          <span>
            ✨ ĐƠN GIẢN
          </span>

          <h2>
            Mua Robux chỉ 3 bước
          </h2>

          <p>
            Không cần thao tác phức tạp.
          </p>

        </div>


        <div className="how-grid">

          <div className="how-card">

            <div className="how-number">
              01
            </div>

            <div className="how-icon">
              👤
            </div>

            <h3>
              Nhập tài khoản
            </h3>

            <p>
              Nhập username Roblox
              của bạn.
            </p>

          </div>


          <div className="how-card">

            <div className="how-number">
              02
            </div>

            <div className="how-icon">
              ◇
            </div>

            <h3>
              Chọn gói Robux
            </h3>

            <p>
              Chọn số Robux
              bạn muốn mua.
            </p>

          </div>


          <div className="how-card">

            <div className="how-number">
              03
            </div>

            <div className="how-icon">
              💳
            </div>

            <h3>
              Thanh toán
            </h3>

            <p>
              Thanh toán và
              nhận Robux.
            </p>

          </div>

        </div>

      </section>
    );
  };


  /* =======================================================
     FOOTER
     ======================================================= */

  const Footer = () => {
    return (
      <footer className="store-footer">

        <div className="footer-brand">

          <div className="brand-mark">
            ◇
          </div>

          <div>

            <strong>
              NXX STORE
            </strong>

            <span>
              Roblox Top Up
            </span>

          </div>

        </div>


        <p>
          © 2026 NXX STORE.
          All rights reserved.
        </p>

      </footer>
    );
  };


  /* =======================================================
     BOTTOM NAVIGATION
     ======================================================= */

  const BottomNavigation = () => {
    return (
      <nav className="bottom-navigation">

        <button
          className={
            screen === "home"
              ? "active"
              : ""
          }
          onClick={() =>
            setScreen("home")
          }
        >

          <span>
            🏠
          </span>

          <small>
            Trang chủ
          </small>

        </button>


        <button
          onClick={() =>
            setScreen("packages")
          }
        >

          <span>
            ◇
          </span>

          <small>
            Robux
          </small>

        </button>


        <button
          onClick={() =>
            setScreen("orders")
          }
        >

          <span>
            📋
          </span>

          <small>
            Đơn hàng
          </small>

        </button>


        <button
          onClick={() =>
            setScreen("account")
          }
        >

          <span>
            👤
          </span>

          <small>
            Tài khoản
          </small>

        </button>

      </nav>
    );
  };


  /* =======================================================
     HOME SCREEN
     ======================================================= */

  const HomeScreen = () => {
    return (
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
  };


  /* =======================================================
     CART DRAWER
     ======================================================= */

  const CartDrawer = () => {

    if (!cartOpen) {
      return null;
    }

    return (
      <div className="cart-overlay">

        <div
          className="cart-backdrop"
          onClick={() =>
            setCartOpen(false)
          }
        ></div>


        <aside className="cart-drawer">

          <div className="cart-header">

            <div>

              <span>
                GIỎ HÀNG
              </span>

              <h2>
                {cartCount} sản phẩm
              </h2>

            </div>

            <button
              onClick={() =>
                setCartOpen(false)
              }
            >
              ×
            </button>

          </div>


          {cart.length === 0 ? (

            <div className="empty-cart">

              <div className="empty-cart-icon">
                🛒
              </div>

              <h3>
                Giỏ hàng trống
              </h3>

              <p>
                Hãy chọn một gói Robux
                để bắt đầu.
              </p>

              <button
                className="primary-button"
                onClick={() => {
                  setCartOpen(false);
                  setScreen("packages");
                }}
              >
                Xem gói Robux
              </button>

            </div>

          ) : (

            <>

              <div className="cart-items">

                {cart.map((item) => (

                  <div
                    className="cart-item"
                    key={item.id}
                  >

                    <div className="cart-item-image">
                      <RobuxIcon size={42} />
                    </div>


                    <div className="cart-item-info">

                      <strong>
                        {item.robux} Robux
                      </strong>

                      <span>
                        {formatMoney(item.price)}
                      </span>


                      <div className="quantity">

                        <button
                          onClick={() =>
                            decreaseQuantity(
                              item.id
                            )
                          }
                        >
                          −
                        </button>

                        <b>
                          {item.quantity}
                        </b>

                        <button
                          onClick={() =>
                            increaseQuantity(
                              item.id
                            )
                          }
                        >
                          +
                        </button>

                      </div>

                    </div>


                    <button
                      className="remove-item"
                      onClick={() =>
                        removeFromCart(
                          item.id
                        )
                      }
                    >
                      ×
                    </button>

                  </div>

                ))}

              </div>


              <div className="cart-bottom">

                <div className="cart-total">

                  <span>
                    Tổng cộng
                  </span>

                  <strong>
                    {formatMoney(cartTotal)}
                  </strong>

                </div>


                <button
                  className="primary-button full"
                  onClick={() => {

                    setCartOpen(false);

                    if (!account) {
                      setScreen("account");
                    } else {
                      setScreen("checkout");
                    }

                  }}
                >
                  Thanh toán →
                </button>

              </div>

            </>

          )}

        </aside>

      </div>
    );
  };


  /* =======================================================
     TOAST
     ======================================================= */

  const Toast = () => {

    if (!toast) {
      return null;
    }

    return (
      <div
        className={`toast ${
          toast.type === "error"
            ? "toast-error"
            : ""
        }`}
      >

        <span>
          {toast.type === "error"
            ? "!"
            : "✓"}
        </span>

        {toast.message}

      </div>
    );
  };


  /* =======================================================
     MAIN RENDER
     ======================================================= */

  return (
    <div className="store-app">

      <HomeScreen />

      <CartDrawer />

      <Toast />

      <BottomNavigation />

    </div>
  );
}
  /* =======================================================
     PAGE CONTAINER
     ======================================================= */

  const PageContainer = ({
    title,
    subtitle,
    children,
  }) => {
    return (
      <div className="inner-page">

        <div className="inner-page-header">

          <button
            className="back-button"
            onClick={goBack}
          >
            ←
          </button>

          <div>
            <span className="page-kicker">
              NXX STORE
            </span>

            <h1>{title}</h1>

            {subtitle && (
              <p>{subtitle}</p>
            )}
          </div>

        </div>

        {children}

      </div>
    );
  };


  /* =======================================================
     PROGRESS BAR
     ======================================================= */

  const ProgressBar = ({ step }) => {
    return (
      <div className="checkout-progress">

        <div
          className={
            step >= 1
              ? "progress-step active"
              : "progress-step"
          }
        >
          <div className="progress-circle">
            {step > 1 ? "✓" : "1"}
          </div>

          <span>
            Tài khoản
          </span>
        </div>


        <div
          className={
            step >= 2
              ? "progress-line active"
              : "progress-line"
          }
        ></div>


        <div
          className={
            step >= 2
              ? "progress-step active"
              : "progress-step"
          }
        >
          <div className="progress-circle">
            {step > 2 ? "✓" : "2"}
          </div>

          <span>
            Gói Robux
          </span>
        </div>


        <div
          className={
            step >= 3
              ? "progress-line active"
              : "progress-line"
          }
        ></div>


        <div
          className={
            step >= 3
              ? "progress-step active"
              : "progress-step"
          }
        >
          <div className="progress-circle">
            3
          </div>

          <span>
            Thanh toán
          </span>
        </div>

      </div>
    );
  };


  /* =======================================================
     ACCOUNT SCREEN
     ======================================================= */

  const AccountScreen = () => {
    return (
      <PageContainer
        title="Tài khoản Roblox"
        subtitle="Nhập tài khoản nhận Robux"
      >

        <ProgressBar step={1} />


        <div className="account-card">

          <div className="account-card-top">

            <div className="account-big-icon">
              👤
            </div>

            <div>

              <span className="card-label">
                BƯỚC 1
              </span>

              <h2>
                Nhập Username
              </h2>

            </div>

          </div>


          <p className="account-description">
            Nhập chính xác tên tài khoản Roblox
            mà bạn muốn nhận Robux.
          </p>


          <label className="input-label">
            Username Roblox
          </label>


          <div className="username-input">

            <span className="input-icon">
              @
            </span>

            <input
              type="text"
              value={username}
              placeholder="Ví dụ: Builderman"
              autoComplete="off"
              onChange={(event) =>
                setUsername(
                  event.target.value
                )
              }
            />

            {username.length > 0 && (
              <button
                className="clear-input"
                onClick={() =>
                  setUsername("")
                }
              >
                ×
              </button>
            )}

          </div>


          <div className="username-note">

            <span>
              🔒
            </span>

            <p>
              Chúng tôi chỉ sử dụng Username
              để xác định tài khoản nhận Robux.
            </p>

          </div>


          <button
            className="primary-button full account-button"
            disabled={checkingAccount}
            onClick={verifyUsername}
          >

            {checkingAccount ? (
              <>
                <span className="loading-spinner"></span>

                Đang kiểm tra...
              </>
            ) : (
              <>
                Kiểm tra tài khoản
                <span>→</span>
              </>
            )}

          </button>


          <button
            className="text-button"
            onClick={() => {
              showToast(
                "Hãy nhập Username, không phải Display Name."
              );
            }}
          >
            Không biết Username ở đâu?
            <span>
              Xem hướng dẫn
            </span>
          </button>

        </div>


        {/* TRUST */}

        <div className="security-card">

          <div className="security-icon">
            🛡️
          </div>

          <div>

            <strong>
              Thông tin của bạn được bảo mật
            </strong>

            <p>
              NXX STORE không yêu cầu mật khẩu
              Roblox của bạn.
            </p>

          </div>

        </div>

      </PageContainer>
    );
  };


  /* =======================================================
     VERIFIED ACCOUNT SCREEN
     ======================================================= */

  const VerifyScreen = () => {
    return (
      <PageContainer
        title="Xác nhận tài khoản"
        subtitle="Kiểm tra thông tin trước khi tiếp tục"
      >

        <ProgressBar step={1} />


        <div className="verified-card">

          {/* SUCCESS ICON */}

          <div className="verified-success">
            ✓
          </div>


          <span className="verified-label">
            TÀI KHOẢN HỢP LỆ
          </span>


          <h2>
            Tìm thấy tài khoản!
          </h2>


          <p>
            Hãy kiểm tra thông tin bên dưới.
          </p>


          {/* ACCOUNT PROFILE */}

          <div className="roblox-profile">

            <div className="profile-avatar">

              {account?.avatar ? (
                <img
                  src={account.avatar}
                  alt="Roblox avatar"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              ) : (
                <span>
                  👤
                </span>
              )}

            </div>


            <div className="profile-info">

              <span>
                Username
              </span>

              <strong>
                @{account?.username || username}
              </strong>

              <small>
                ID: {account?.userId || "123456789"}
              </small>

            </div>


            <div className="profile-check">
              ✓
            </div>

          </div>


          {/* NOTICE */}

          <div className="verified-notice">

            <span>
              ℹ
            </span>

            <p>
              Robux sẽ được nạp vào đúng tài
              khoản này. Hãy chắc chắn Username
              là chính xác.
            </p>

          </div>


          {/* ACTION */}

          <button
            className="primary-button full"
            onClick={continueToPackages}
          >
            Chọn gói Robux
            <span>→</span>
          </button>


          <button
            className="outline-button full"
            onClick={() => {
              setAccount(null);
              setUsername("");
              setScreen("account");
            }}
          >
            ← Nhập tài khoản khác
          </button>

        </div>

      </PageContainer>
    );
  };


  /* =======================================================
     ACCOUNT SCREEN ROUTING
     ======================================================= */

  const AccountPage = () => {

    if (screen === "verify") {
      return <VerifyScreen />;
    }

    return <AccountScreen />;
  };
  /* =======================================================
     PACKAGES SCREEN
     ======================================================= */

  const PackagesScreen = () => {
    const [category, setCategory] = useState("robux");

    return (
      <PageContainer
        title="Chọn gói Robux"
        subtitle={
          account
            ? `Nạp cho @${account.username}`
            : "Chọn gói bạn muốn mua"
        }
      >

        <ProgressBar step={2} />

        {/* ================================================
           USER MINI PROFILE
        ================================================= */}

        {account && (
          <div className="mini-account">

            <div className="mini-avatar">
              👤
            </div>

            <div className="mini-account-info">

              <span>
                ĐANG NẠP CHO
              </span>

              <strong>
                @{account.username}
              </strong>

            </div>

            <div className="mini-account-status">
              ✓
            </div>

          </div>
        )}


        {/* ================================================
           CATEGORY TABS
        ================================================= */}

        <div className="store-tabs">

          <button
            className={
              category === "robux"
                ? "active"
                : ""
            }
            onClick={() =>
              setCategory("robux")
            }
          >
            <RobuxIcon size={20} />

            <span>
              Robux
            </span>
          </button>


          <button
            className={
              category === "giftcard"
                ? "active"
                : ""
            }
            onClick={() =>
              setCategory("giftcard")
            }
          >
            🎁

            <span>
              Gift Card
            </span>
          </button>

        </div>


        {/* ================================================
           ROBUX TAB
        ================================================= */}

        {category === "robux" && (
          <>

            <div className="packages-heading">

              <div>
                <span className="packages-kicker">
                  ROBUX
                </span>

                <h2>
                  Chọn số lượng
                </h2>
              </div>

              <span className="packages-count">
                {ROBUX_PACKAGES.length} gói
              </span>

            </div>


            {/* ============================================
               PRODUCT GRID
            ============================================ */}

            <div className="packages-grid">

              {ROBUX_PACKAGES.map(
                (product) => {

                  const selected =
                    selectedPackage?.id ===
                    product.id;

                  return (
                    <div
                      key={product.id}
                      className={
                        `package-card ${
                          selected
                            ? "selected"
                            : ""
                        }`
                      }
                      onClick={() =>
                        setSelectedPackage(
                          product
                        )
                      }
                    >

                      {/* POPULAR */}

                      {product.popular && (
                        <div className="package-popular">
                          🔥 BÁN CHẠY
                        </div>
                      )}


                      {/* SELECT CHECK */}

                      {selected && (
                        <div className="package-selected">
                          ✓
                        </div>
                      )}


                      {/* IMAGE */}

                      <div className="package-image">

                        <div className="package-image-glow"></div>

                        <RobuxIcon size={54} />

                      </div>


                      {/* INFO */}

                      <div className="package-info">

                        <h3>
                          {product.robux}
                          {" "}
                          Robux
                        </h3>


                        {product.bonus && (
                          <span className="package-bonus">
                            +{product.bonus} BONUS
                          </span>
                        )}


                        <div className="package-footer">

                          <strong>
                            {formatMoney(
                              product.price
                            )}
                          </strong>


                          <button
                            className={
                              selected
                                ? "package-add selected"
                                : "package-add"
                            }
                            onClick={(event) => {

                              event.stopPropagation();

                              setSelectedPackage(
                                product
                              );

                            }}
                          >

                            {selected
                              ? "✓"
                              : "+"}

                          </button>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>


            {/* ============================================
               SELECTED PACKAGE
            ============================================ */}

            {selectedPackage && (
              <div className="selected-package-box">

                <div className="selected-package-left">

                  <div className="selected-package-icon">
                    <RobuxIcon size={38} />
                  </div>

                  <div>

                    <span>
                      GÓI ĐÃ CHỌN
                    </span>

                    <strong>
                      {selectedPackage.robux}
                      {" "}
                      Robux
                    </strong>

                  </div>

                </div>


                <div className="selected-package-price">

                  <span>
                    Tổng
                  </span>

                  <strong>
                    {formatMoney(
                      selectedPackage.price
                    )}
                  </strong>

                </div>

              </div>
            )}


            {/* ============================================
               CONTINUE
            ============================================ */}

            <div className="packages-action">

              <button
                className="primary-button full"
                disabled={!selectedPackage}
                onClick={
                  continueToCheckout
                }
              >

                Tiếp tục thanh toán

                <span>
                  →
                </span>

              </button>

            </div>

          </>
        )}


        {/* ================================================
           GIFT CARD TAB
        ================================================= */}

        {category === "giftcard" && (
          <div className="coming-soon">

            <div className="coming-soon-icon">
              🎁
            </div>

            <span>
              SẮP RA MẮT
            </span>

            <h2>
              Roblox Gift Card
            </h2>

            <p>
              Tính năng Gift Card đang được
              hoàn thiện. Bạn có thể mua Robux
              trực tiếp ngay bây giờ.
            </p>

            <button
              className="outline-button"
              onClick={() =>
                setCategory("robux")
              }
            >
              ← Quay lại Robux
            </button>

          </div>
        )}

      </PageContainer>
    );
  };
  /* =======================================================
     CHECKOUT SCREEN
     ======================================================= */

  const CheckoutScreen = () => {
    if (!selectedPackage) {
      return (
        <PageContainer
          title="Thanh toán"
          subtitle="Chưa có sản phẩm được chọn"
        >
          <div className="empty-state">
            <div className="empty-state-icon">
              🛒
            </div>

            <h2>
              Chưa chọn gói Robux
            </h2>

            <p>
              Hãy chọn một gói Robux trước
              khi thanh toán.
            </p>

            <button
              className="primary-button"
              onClick={() =>
                setScreen("packages")
              }
            >
              Chọn gói Robux →
            </button>
          </div>
        </PageContainer>
      );
    }


    const total = selectedPackage.price;


    return (
      <PageContainer
        title="Thanh toán"
        subtitle="Kiểm tra đơn hàng trước khi thanh toán"
      >

        <ProgressBar step={3} />


        {/* =================================================
           ORDER SUMMARY
        ================================================= */}

        <section className="checkout-section">

          <div className="checkout-section-title">

            <div>
              <span>
                ĐƠN HÀNG
              </span>

              <h2>
                Thông tin đơn hàng
              </h2>
            </div>

            <div className="checkout-secure">
              🔒
            </div>

          </div>


          <div className="order-summary">

            {/* PRODUCT */}

            <div className="order-product">

              <div className="order-product-image">
                <RobuxIcon size={48} />
              </div>


              <div className="order-product-info">

                <span>
                  Gói Robux
                </span>

                <strong>
                  {selectedPackage.robux}
                  {" "}
                  Robux
                </strong>

                {selectedPackage.bonus && (
                  <small>
                    +{selectedPackage.bonus} Robux bonus
                  </small>
                )}

              </div>


              <div className="order-product-price">

                <strong>
                  {formatMoney(
                    selectedPackage.price
                  )}
                </strong>

              </div>

            </div>


            {/* DIVIDER */}

            <div className="summary-divider"></div>


            {/* ACCOUNT */}

            <div className="summary-row">

              <span>
                👤 Tài khoản
              </span>

              <strong>
                @{account?.username || username}
              </strong>

            </div>


            <div className="summary-row">

              <span>
                🆔 User ID
              </span>

              <strong>
                {account?.userId || "123456789"}
              </strong>

            </div>


            <div className="summary-row">

              <span>
                ⚡ Phí giao dịch
              </span>

              <strong className="free-text">
                Miễn phí
              </strong>

            </div>


            <div className="summary-divider"></div>


            {/* TOTAL */}

            <div className="summary-total">

              <span>
                Tổng thanh toán
              </span>

              <strong>
                {formatMoney(total)}
              </strong>

            </div>

          </div>

        </section>


        {/* =================================================
           PAYMENT METHODS
        ================================================= */}

        <section className="checkout-section">

          <div className="checkout-section-title">

            <div>
              <span>
                THANH TOÁN
              </span>

              <h2>
                Phương thức thanh toán
              </h2>
            </div>

          </div>


          <div className="payment-methods">

            {/* VIETQR */}

            <button
              className={
                paymentMethod === "vietqr"
                  ? "payment-method active"
                  : "payment-method"
              }
              onClick={() =>
                setPaymentMethod("vietqr")
              }
            >

              <div className="payment-logo vietqr-logo">
                QR
              </div>


              <div className="payment-info">

                <strong>
                  VietQR
                </strong>

                <span>
                  Quét mã QR để thanh toán
                </span>

              </div>


              <div className="radio">

                {paymentMethod === "vietqr" && (
                  <div></div>
                )}

              </div>

            </button>


            {/* MOMO */}

            <button
              className={
                paymentMethod === "momo"
                  ? "payment-method active"
                  : "payment-method"
              }
              onClick={() =>
                setPaymentMethod("momo")
              }
            >

              <div className="payment-logo momo-logo">
                M
              </div>


              <div className="payment-info">

                <strong>
                  MoMo
                </strong>

                <span>
                  Thanh toán qua MoMo
                </span>

              </div>


              <div className="radio">

                {paymentMethod === "momo" && (
                  <div></div>
                )}

              </div>

            </button>


            {/* ZALOPAY */}

            <button
              className={
                paymentMethod === "zalopay"
                  ? "payment-method active"
                  : "payment-method"
              }
              onClick={() =>
                setPaymentMethod("zalopay")
              }
            >

              <div className="payment-logo zalopay-logo">
                Z
              </div>


              <div className="payment-info">

                <strong>
                  ZaloPay
                </strong>

                <span>
                  Thanh toán nhanh chóng
                </span>

              </div>


              <div className="radio">

                {paymentMethod === "zalopay" && (
                  <div></div>
                )}

              </div>

            </button>

          </div>

        </section>


        {/* =================================================
           PAYMENT NOTICE
        ================================================= */}

        <div className="payment-notice">

          <div className="payment-notice-icon">
            🛡️
          </div>

          <div>

            <strong>
              Thanh toán an toàn
            </strong>

            <p>
              Giao dịch được xử lý qua
              phương thức thanh toán bảo mật.
            </p>

          </div>

        </div>


        {/* =================================================
           CHECKOUT ACTION
        ================================================= */}

        <div className="checkout-bottom">

          <div className="checkout-total">

            <span>
              Tổng thanh toán
            </span>

            <strong>
              {formatMoney(total)}
            </strong>

          </div>


          <button
            className="primary-button full"
            onClick={createOrder}
          >

            Thanh toán ngay

            <span>
              →
            </span>

          </button>

        </div>

      </PageContainer>
    );
  };
  /* =======================================================
     QR PAYMENT SCREEN
     ======================================================= */

  const QRPaymentScreen = () => {
    if (!currentOrder) {
      return (
        <PageContainer
          title="Thanh toán"
          subtitle="Không tìm thấy đơn hàng"
        >
          <div className="empty-state">
            <div className="empty-state-icon">
              ⚠️
            </div>

            <h2>Không có đơn hàng</h2>

            <p>
              Vui lòng tạo đơn hàng trước khi
              thanh toán.
            </p>

            <button
              className="primary-button"
              onClick={() => setScreen("packages")}
            >
              Chọn gói Robux →
            </button>
          </div>
        </PageContainer>
      );
    }


    const paymentName =
      paymentMethod === "vietqr"
        ? "VietQR"
        : paymentMethod === "momo"
        ? "MoMo"
        : "ZaloPay";


    return (
      <PageContainer
        title="Thanh toán"
        subtitle="Hoàn tất giao dịch để nhận Robux"
      >

        <ProgressBar step={4} />


        {/* =================================================
           ORDER HEADER
        ================================================= */}

        <div className="qr-order-header">

          <div>

            <span className="qr-order-label">
              MÃ ĐƠN HÀNG
            </span>

            <strong>
              #{currentOrder.id}
            </strong>

          </div>


          <div className="qr-status waiting">
            ● Đang chờ thanh toán
          </div>

        </div>


        {/* =================================================
           QR CARD
        ================================================= */}

        <section className="qr-payment-card">

          <div className="qr-card-top">

            <span>
              THANH TOÁN QUA
            </span>

            <strong>
              {paymentName}
            </strong>

          </div>


          {/* QR PLACEHOLDER */}

          <div className="qr-code-wrapper">

            <div className="qr-code">

              <div className="qr-corner top-left"></div>
              <div className="qr-corner top-right"></div>
              <div className="qr-corner bottom-left"></div>

              <div className="qr-pattern">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>

            </div>

          </div>


          <p className="qr-scan-text">
            Mở ứng dụng ngân hàng và quét mã QR
          </p>


          {/* =================================================
             AMOUNT
          ================================================= */}

          <div className="qr-amount">

            <span>
              Số tiền cần thanh toán
            </span>

            <strong>
              {formatMoney(currentOrder.total)}
            </strong>

          </div>


          {/* =================================================
             PAYMENT INFO
          ================================================= */}

          <div className="qr-info-list">

            <div className="qr-info-row">

              <span>
                Nội dung chuyển khoản
              </span>

              <button
                className="copy-value"
                onClick={() => {
                  navigator.clipboard?.writeText(
                    currentOrder.transferContent
                  );

                  showToast(
                    "Đã sao chép nội dung chuyển khoản",
                    "success"
                  );
                }}
              >
                {currentOrder.transferContent}
                <span>⧉</span>
              </button>

            </div>


            <div className="qr-info-row">

              <span>
                Tài khoản Roblox
              </span>

              <strong>
                @{currentOrder.username}
              </strong>

            </div>


            <div className="qr-info-row">

              <span>
                Gói Robux
              </span>

              <strong>
                {currentOrder.robux} Robux
              </strong>

            </div>

          </div>

        </section>


        {/* =================================================
           COUNTDOWN
        ================================================= */}

        <div className="payment-countdown">

          <div className="countdown-icon">
            ⏱
          </div>

          <div>

            <span>
              Mã thanh toán có hiệu lực trong
            </span>

            <strong>
              10:00
            </strong>

          </div>

        </div>


        {/* =================================================
           PAYMENT GUIDE
        ================================================= */}

        <section className="payment-guide">

          <div className="payment-guide-title">

            <span className="guide-number">
              1
            </span>

            <strong>
              Mở ứng dụng ngân hàng
            </strong>

          </div>


          <div className="payment-guide-title">

            <span className="guide-number">
              2
            </span>

            <strong>
              Chọn chức năng quét QR
            </strong>

          </div>


          <div className="payment-guide-title">

            <span className="guide-number">
              3
            </span>

            <strong>
              Kiểm tra số tiền và nội dung
            </strong>

          </div>


          <div className="payment-guide-title">

            <span className="guide-number">
              4
            </span>

            <strong>
              Xác nhận thanh toán
            </strong>

          </div>

        </section>


        {/* =================================================
           CONFIRM PAYMENT
        ================================================= */}

        <div className="qr-actions">

          <button
            className="primary-button full"
            onClick={completePayment}
          >
            Tôi đã thanh toán
            <span>✓</span>
          </button>


          <button
            className="text-button"
            onClick={() => setScreen("checkout")}
          >
            ← Quay lại
          </button>

        </div>


        <div className="payment-warning">
          ⚠️ Vui lòng chuyển đúng số tiền và nội dung
          chuyển khoản để hệ thống tự động xác nhận.
        </div>

      </PageContainer>
    );
  };
  /* =======================================================
     SUCCESS SCREEN
     ======================================================= */

  const SuccessScreen = () => {
    if (!currentOrder) {
      return (
        <PageContainer
          title="Hoàn tất"
          subtitle="Không tìm thấy đơn hàng"
        >
          <div className="empty-state">
            <div className="empty-state-icon">
              ⚠️
            </div>

            <h2>Không có đơn hàng</h2>

            <button
              className="primary-button"
              onClick={() => setScreen("home")}
            >
              Về trang chủ
            </button>
          </div>
        </PageContainer>
      );
    }

    return (
      <PageContainer
        title="Thanh toán thành công"
        subtitle="Đơn hàng của bạn đã được ghi nhận"
      >

        <div className="success-page">

          {/* ICON SUCCESS */}

          <div className="success-icon">
            ✓
          </div>


          <h1>
            Thanh toán thành công! 🎉
          </h1>

          <p className="success-description">
            Đơn hàng của bạn đã được xác nhận.
            Robux sẽ được xử lý cho tài khoản
            Roblox của bạn.
          </p>


          {/* ORDER CARD */}

          <div className="success-order-card">

            <div className="success-order-header">

              <span>
                MÃ ĐƠN HÀNG
              </span>

              <strong>
                #{currentOrder.id}
              </strong>

            </div>


            <div className="summary-divider"></div>


            <div className="success-account">

              <div className="success-avatar">
                👤
              </div>

              <div>

                <span>
                  Tài khoản Roblox
                </span>

                <strong>
                  @{currentOrder.username}
                </strong>

              </div>

            </div>


            <div className="success-detail-list">

              <div className="summary-row">

                <span>
                  Gói Robux
                </span>

                <strong>
                  {currentOrder.robux} Robux
                </strong>

              </div>


              <div className="summary-row">

                <span>
                  Phương thức
                </span>

                <strong>
                  {currentOrder.paymentMethod === "vietqr"
                    ? "VietQR"
                    : currentOrder.paymentMethod === "momo"
                    ? "MoMo"
                    : "ZaloPay"}
                </strong>

              </div>


              <div className="summary-row">

                <span>
                  Trạng thái
                </span>

                <strong className="success-text">
                  ✓ Đã thanh toán
                </strong>

              </div>


              <div className="summary-row">

                <span>
                  Tổng tiền
                </span>

                <strong>
                  {formatMoney(currentOrder.total)}
                </strong>

              </div>

            </div>


            <div className="summary-divider"></div>


            <div className="success-total">

              <span>
                Tổng thanh toán
              </span>

              <strong>
                {formatMoney(currentOrder.total)}
              </strong>

            </div>

          </div>


          {/* ROBUX DELIVERY STATUS */}

          <div className="delivery-status">

            <div className="delivery-status-icon">
              ⚡
            </div>

            <div>

              <strong>
                Đang xử lý Robux
              </strong>

              <p>
                Hệ thống đang xử lý đơn hàng.
              </p>

            </div>

            <span className="delivery-dot"></span>

          </div>


          {/* ACTIONS */}

          <div className="success-actions">

            <button
              className="primary-button full"
              onClick={() => setScreen("orders")}
            >
              Xem đơn hàng
              <span>→</span>
            </button>


            <button
              className="secondary-button full"
              onClick={() => setScreen("home")}
            >
              Về trang chủ
            </button>

          </div>

        </div>

      </PageContainer>
    );
  };


  /* =======================================================
     ORDER HISTORY
     ======================================================= */

  const OrdersScreen = () => {

    return (
      <PageContainer
        title="Đơn hàng"
        subtitle="Theo dõi các giao dịch của bạn"
      >

        <div className="orders-page">

          <div className="orders-header">

            <div>
              <span>
                LỊCH SỬ
              </span>

              <h2>
                Đơn hàng của bạn
              </h2>
            </div>

            <div className="orders-count">
              1 đơn
            </div>

          </div>


          {/* ORDER */}

          {currentOrder ? (
            <div className="order-history-card">

              <div className="order-history-top">

                <div className="order-history-icon">
                  <RobuxIcon size={42} />
                </div>


                <div className="order-history-info">

                  <strong>
                    {currentOrder.robux} Robux
                  </strong>

                  <span>
                    @{currentOrder.username}
                  </span>

                </div>


                <div className="order-history-status">
                  ✓ Thành công
                </div>

              </div>


              <div className="summary-divider"></div>


              <div className="order-history-details">

                <div>
                  <span>
                    Mã đơn
                  </span>

                  <strong>
                    #{currentOrder.id}
                  </strong>
                </div>


                <div>
                  <span>
                    Số tiền
                  </span>

                  <strong>
                    {formatMoney(currentOrder.total)}
                  </strong>
                </div>


                <div>
                  <span>
                    Thanh toán
                  </span>

                  <strong>
                    {currentOrder.paymentMethod === "vietqr"
                      ? "VietQR"
                      : currentOrder.paymentMethod === "momo"
                      ? "MoMo"
                      : "ZaloPay"}
                  </strong>
                </div>

              </div>


              <button
                className="order-detail-button"
                onClick={() => setScreen("success")}
              >
                Xem chi tiết
                <span>→</span>
              </button>

            </div>
          ) : (

            <div className="empty-state">

              <div className="empty-state-icon">
                📦
              </div>

              <h2>
                Chưa có đơn hàng
              </h2>

              <p>
                Các đơn hàng sau khi thanh toán
                sẽ xuất hiện ở đây.
              </p>

              <button
                className="primary-button"
                onClick={() => setScreen("packages")}
              >
                Mua Robux →
              </button>

            </div>

          )}


          {/* SUPPORT */}

          <div className="order-support">

            <div className="order-support-icon">
              💬
            </div>

            <div>

              <strong>
                Cần hỗ trợ?
              </strong>

              <p>
                Liên hệ quản trị viên nếu đơn hàng
                gặp vấn đề.
              </p>

            </div>

            <button
              onClick={() =>
                showToast(
                  "Tính năng liên hệ đang được phát triển",
                  "info"
                )
              }
            >
              Liên hệ
            </button>

          </div>

        </div>

      </PageContainer>
    );
  };
/* =========================================================
   8A — STORE.CSS
   GIAO DIỆN CHÍNH
   ========================================================= */

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  padding: 0;
}

.store-app {
  min-height: 100vh;

  background:
    radial-gradient(
      circle at 50% -10%,
      rgba(37, 99, 235, 0.16),
      transparent 35%
    ),
    #f5f8ff;

  color: #172033;

  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

button,
input {
  font: inherit;
}

button {
  border: 0;
  cursor: pointer;
}


/* =========================================================
   PAGE CONTAINER
   ========================================================= */

.page-container {
  width: min(1180px, calc(100% - 32px));

  margin: 0 auto;

  padding: 30px 0 120px;
}

.page-header {
  margin-bottom: 25px;
}

.page-header span {
  display: block;

  margin-bottom: 7px;

  color: #2563eb;

  font-size: 11px;
  font-weight: 900;

  letter-spacing: 0.12em;
}

.page-header h1 {
  margin: 0;

  font-size: clamp(28px, 5vw, 42px);

  line-height: 1.1;

  letter-spacing: -0.03em;
}

.page-header p {
  margin: 9px 0 0;

  color: #6b7280;

  font-size: 14px;

  line-height: 1.5;
}


/* =========================================================
   HEADER
   ========================================================= */

.store-header {
  position: sticky;
  top: 0;
  z-index: 50;

  height: 72px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding:
    0 max(20px, calc((100% - 1180px) / 2));

  background: rgba(255, 255, 255, 0.9);

  backdrop-filter: blur(18px);

  border-bottom: 1px solid #e7ebf4;
}

.brand {
  display: flex;
  align-items: center;

  gap: 10px;

  cursor: pointer;
}

.brand-logo {
  width: 42px;
  height: 42px;

  display: grid;
  place-items: center;

  border-radius: 13px;

  color: white;

  background:
    linear-gradient(
      135deg,
      #2563eb,
      #60a5fa
    );

  box-shadow:
    0 8px 22px rgba(37, 99, 235, 0.28);
}

.brand-logo span {
  font-size: 22px;
  font-weight: 900;
}

.brand-text strong {
  display: block;

  font-size: 17px;
  line-height: 1.1;
}

.brand-text span {
  display: block;

  margin-top: 2px;

  color: #8b95a7;

  font-size: 10px;
}

.header-actions {
  display: flex;
  align-items: center;

  gap: 9px;
}

.icon-button {
  position: relative;

  width: 42px;
  height: 42px;

  display: grid;
  place-items: center;

  border-radius: 13px;

  background: #f2f5fb;
  color: #263247;

  transition: 0.2s;
}

.icon-button:hover {
  background: #e7efff;
  color: #2563eb;
}

.cart-count {
  position: absolute;

  top: -4px;
  right: -4px;

  min-width: 19px;
  height: 19px;

  display: grid;
  place-items: center;

  padding: 0 5px;

  border-radius: 99px;

  background: #2563eb;
  color: white;

  font-size: 10px;
  font-weight: 900;
}


/* =========================================================
   HERO
   ========================================================= */

.hero {
  position: relative;

  overflow: hidden;

  margin-top: 25px;

  padding: 48px;

  border-radius: 30px;

  color: white;

  background:
    radial-gradient(
      circle at 85% 15%,
      rgba(255,255,255,0.25),
      transparent 25%
    ),
    linear-gradient(
      135deg,
      #155eef,
      #2563eb 50%,
      #38bdf8
    );

  box-shadow:
    0 22px 55px rgba(37, 99, 235, 0.24);
}

.hero::before {
  content: "";

  position: absolute;

  width: 320px;
  height: 320px;

  right: -120px;
  bottom: -180px;

  border-radius: 50%;

  background:
    rgba(255,255,255,0.08);
}

.hero::after {
  content: "";

  position: absolute;

  width: 180px;
  height: 180px;

  right: 100px;
  top: -90px;

  border-radius: 50%;

  background:
    rgba(255,255,255,0.06);
}

.hero-content {
  position: relative;

  z-index: 2;

  max-width: 650px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;

  gap: 7px;

  padding: 7px 12px;

  border-radius: 99px;

  background:
    rgba(255,255,255,0.15);

  border:
    1px solid rgba(255,255,255,0.2);

  font-size: 11px;
  font-weight: 800;
}

.hero h1 {
  margin: 18px 0 12px;

  font-size: clamp(35px, 7vw, 62px);

  line-height: 0.98;

  letter-spacing: -0.045em;
}

.hero p {
  max-width: 570px;

  margin: 0;

  color: rgba(255,255,255,0.85);

  font-size: 14px;

  line-height: 1.65;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;

  gap: 10px;

  margin-top: 27px;
}

.hero-button {
  min-height: 45px;

  padding: 0 18px;

  border-radius: 13px;

  background: white;

  color: #1754d1;

  font-size: 13px;
  font-weight: 900;
}

.hero-button.secondary {
  background:
    rgba(255,255,255,0.13);

  color: white;

  border:
    1px solid rgba(255,255,255,0.23);
}


/* =========================================================
   BUTTON
   ========================================================= */

.primary-button {
  min-height: 48px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  gap: 9px;

  padding: 0 20px;

  border-radius: 14px;

  background:
    linear-gradient(
      135deg,
      #2563eb,
      #3b82f6
    );

  color: white;

  font-weight: 900;

  box-shadow:
    0 10px 25px rgba(37,99,235,0.2);

  transition: 0.2s;
}

.primary-button:hover {
  transform: translateY(-2px);

  box-shadow:
    0 14px 30px rgba(37,99,235,0.27);
}

.primary-button.full {
  width: 100%;
}

.secondary-button {
  min-height: 48px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 0 20px;

  border-radius: 14px;

  background: #edf2f8;

  color: #344054;

  font-weight: 900;
}

.secondary-button.full {
  width: 100%;
}

.text-button {
  background: transparent;

  color: #2563eb;

  font-weight: 800;
}


/* =========================================================
   BENEFITS
   ========================================================= */

.benefits-grid {
  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 14px;

  margin: 26px 0;
}

.benefit-card {
  padding: 20px;

  border-radius: 20px;

  background: white;

  border: 1px solid #e9edf5;

  box-shadow:
    0 8px 25px rgba(30,50,90,0.05);

  transition: 0.2s;
}

.benefit-card:hover {
  transform: translateY(-3px);
}

.benefit-icon {
  width: 44px;
  height: 44px;

  display: grid;
  place-items: center;

  margin-bottom: 14px;

  border-radius: 13px;

  background: #edf4ff;

  color: #2563eb;

  font-size: 20px;
}

.benefit-card strong {
  display: block;

  margin-bottom: 5px;

  font-size: 14px;
}

.benefit-card p {
  margin: 0;

  color: #7b8495;

  font-size: 12px;

  line-height: 1.5;
}


/* =========================================================
   SECTION
   ========================================================= */

.section {
  margin-top: 34px;
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;

  gap: 15px;

  margin-bottom: 16px;
}

.section-heading h2 {
  margin: 0;

  font-size: 25px;

  letter-spacing: -0.02em;
}

.section-heading p {
  margin: 5px 0 0;

  color: #7b8495;

  font-size: 12px;
}


/* =========================================================
   PRODUCT GRID
   ========================================================= */

.product-grid {
  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 16px;
}

.product-card {
  position: relative;

  padding: 20px;

  border-radius: 22px;

  background: white;

  border: 2px solid transparent;

  box-shadow:
    0 10px 30px rgba(30,50,90,0.06);

  transition:
    transform 0.2s,
    box-shadow 0.2s,
    border-color 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);

  box-shadow:
    0 18px 38px rgba(30,50,90,0.1);
}

.product-card.selected {
  border-color: #2563eb;

  background: #f7faff;
}

.product-popular {
  position: absolute;

  top: 12px;
  right: 12px;

  padding: 5px 9px;

  border-radius: 99px;

  background: #eaf2ff;

  color: #2563eb;

  font-size: 9px;
  font-weight: 900;
}

.product-icon {
  margin-bottom: 17px;
}

.robux-icon {
  display: grid;
  place-items: center;

  flex-shrink: 0;

  border-radius: 50%;

  background:
    linear-gradient(
      135deg,
      #2563eb,
      #60a5fa
    );

  color: white;

  box-shadow:
    0 7px 18px rgba(37,99,235,0.22);
}

.robux-icon span {
  font-size: 21px;
  font-weight: 900;
}

.product-card h3 {
  margin: 0 0 5px;

  font-size: 23px;

  letter-spacing: -0.02em;
}

.product-card .bonus {
  display: block;

  margin-bottom: 14px;

  color: #16a34a;

  font-size: 11px;
  font-weight: 800;
}

.product-price {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 10px;
}

.product-price strong {
  color: #1f2937;

  font-size: 15px;
}

.product-buy {
  width: 40px;
  height: 40px;

  display: grid;
  place-items: center;

  border-radius: 12px;

  background: #edf4ff;

  color: #2563eb;

  font-size: 17px;
  font-weight: 900;

  transition: 0.2s;
}

.product-buy:hover {
  background: #2563eb;
  color: white;
}


/* =========================================================
   ROBUX PACKAGE TABS
   ========================================================= */

.store-tabs {
  display: flex;

  gap: 7px;

  padding: 6px;

  margin-bottom: 20px;

  border-radius: 15px;

  background: #edf1f7;
}

.store-tab {
  flex: 1;

  min-height: 42px;

  border-radius: 11px;

  background: transparent;

  color: #7b8495;

  font-size: 12px;
  font-weight: 800;
}

.store-tab.active {
  background: white;

  color: #2563eb;

  box-shadow:
    0 4px 12px rgba(30,50,90,0.08);
}


/* =========================================================
   SELECTED PACKAGE
   ========================================================= */

.selected-package {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;

  margin-top: 22px;

  padding: 20px;

  border-radius: 20px;

  background: #eff6ff;

  border: 1px solid #bfdbfe;
}

.selected-package-info {
  display: flex;
  align-items: center;

  gap: 12px;
}

.selected-package-info strong {
  display: block;
}

.selected-package-info span {
  display: block;

  margin-top: 3px;

  color: #64748b;

  font-size: 11px;
}


/* =========================================================
   ACCOUNT
   ========================================================= */

.account-card {
  padding: 25px;

  border-radius: 24px;

  background: white;

  border: 1px solid #e6ebf3;

  box-shadow:
    0 12px 35px rgba(30,50,90,0.06);
}

.account-input-wrapper {
  position: relative;
}

.account-input {
  width: 100%;
  height: 56px;

  padding: 0 18px;

  outline: none;

  border-radius: 15px;

  border: 2px solid #e5eaf2;

  background: #f9fbff;

  color: #172033;

  transition: 0.2s;
}

.account-input::placeholder {
  color: #a1aaba;
}

.account-input:focus {
  border-color: #3b82f6;

  background: white;

  box-shadow:
    0 0 0 4px rgba(59,130,246,0.08);
}

.account-preview {
  display: flex;
  align-items: center;

  gap: 14px;

  margin-top: 18px;

  padding: 16px;

  border-radius: 17px;

  background: #f6f9ff;
}

.account-avatar {
  width: 54px;
  height: 54px;

  display: grid;
  place-items: center;

  flex-shrink: 0;

  border-radius: 15px;

  background: #dbeafe;

  color: #2563eb;

  font-size: 22px;
}

.account-preview strong {
  display: block;

  font-size: 14px;
}

.account-preview span {
  display: block;

  margin-top: 3px;

  color: #7b8495;

  font-size: 11px;
}


/* =========================================================
   PROGRESS
   ========================================================= */

.progress-wrapper {
  display: flex;
  align-items: center;

  width: 100%;

  margin-bottom: 28px;
}

.progress-step {
  display: flex;
  align-items: center;

  gap: 7px;

  color: #9aa3b2;

  font-size: 10px;
  font-weight: 800;

  white-space: nowrap;
}

.progress-step.active {
  color: #2563eb;
}

.progress-circle {
  width: 30px;
  height: 30px;

  display: grid;
  place-items: center;

  flex-shrink: 0;

  border-radius: 50%;

  background: #e9edf4;

  font-size: 10px;
}

.progress-step.active .progress-circle {
  background: #2563eb;

  color: white;

  box-shadow:
    0 5px 15px rgba(37,99,235,0.25);
}

.progress-line {
  width: 55px;
  height: 2px;

  margin: 0 8px;

  background: #e4e8ef;
}

.progress-line.active {
  background: #2563eb;
}


/* =========================================================
   FOOTER
   ========================================================= */

.store-footer {
  margin-top: 60px;

  padding: 35px 0 25px;

  border-top: 1px solid #e3e8f1;

  color: #7b8495;

  text-align: center;

  font-size: 12px;
}


/* =========================================================
   BOTTOM NAVIGATION
   ========================================================= */

.bottom-navigation {
  position: fixed;

  left: 50%;
  bottom: 16px;

  z-index: 100;

  width: min(480px, calc(100% - 28px));

  display: flex;
  align-items: center;
  justify-content: space-around;

  transform: translateX(-50%);

  padding: 8px;

  border-radius: 20px;

  background:
    rgba(255,255,255,0.94);

  backdrop-filter: blur(18px);

  border: 1px solid #e2e7f0;

  box-shadow:
    0 15px 45px rgba(30,50,90,0.16);
}

.bottom-nav-item {
  min-width: 75px;

  display: flex;
  flex-direction: column;
  align-items: center;

  gap: 3px;

  padding: 8px 12px;

  border-radius: 14px;

  background: transparent;

  color: #8a94a6;

  font-size: 10px;
  font-weight: 800;
}

.bottom-nav-item.active {
  background: #edf4ff;

  color: #2563eb;
}

.bottom-nav-item span:first-child {
  font-size: 19px;
}


/* =========================================================
   MOBILE — 8A
   ========================================================= */

@media (max-width: 900px) {

  .benefits-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .product-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

}


@media (max-width: 640px) {

  .store-header {
    height: 64px;

    padding: 0 14px;
  }

  .brand-logo {
    width: 38px;
    height: 38px;
  }

  .brand-text strong {
    font-size: 15px;
  }

  .page-container {
    width: calc(100% - 22px);

    padding-top: 20px;
    padding-bottom: 105px;
  }

  .hero {
    margin-top: 14px;

    padding: 30px 22px;

    border-radius: 24px;
  }

  .hero h1 {
    font-size: 39px;
  }

  .hero-actions {
    display: grid;
  }

  .hero-button {
    width: 100%;
  }

  .benefits-grid {
    grid-template-columns:
      repeat(2, 1fr);

    gap: 9px;
  }

  .benefit-card {
    padding: 14px;
  }

  .benefit-icon {
    width: 38px;
    height: 38px;

    margin-bottom: 10px;
  }

  .product-grid {
    grid-template-columns:
      repeat(2, 1fr);

    gap: 10px;
  }

  .product-card {
    padding: 15px;

    border-radius: 18px;
  }

  .product-card h3 {
    font-size: 19px;
  }

  .product-price strong {
    font-size: 12px;
  }

  .selected-package {
    align-items: stretch;

    flex-direction: column;
  }

  .progress-step span:not(.progress-circle) {
    display: none;
  }

  .progress-line {
    flex: 1;
  }

}


@media (max-width: 380px) {

  .product-grid {
    grid-template-columns: 1fr;
  }

  .benefits-grid {
    grid-template-columns: 1fr;
  }

  .hero h1 {
    font-size: 34px;
  }

}
/* =========================================================
   8B — CHECKOUT / QR / SUCCESS / ORDERS / CART / TOAST
   ========================================================= */


/* =========================================================
   CHECKOUT
   ========================================================= */

.checkout-layout {
  display: grid;

  grid-template-columns:
    minmax(0, 1.4fr)
    minmax(300px, 0.8fr);

  gap: 20px;
}

.checkout-card {
  padding: 22px;

  border-radius: 22px;

  background: white;

  border: 1px solid #e6ebf3;

  box-shadow:
    0 10px 30px rgba(30,50,90,0.06);
}

.checkout-card + .checkout-card {
  margin-top: 16px;
}

.checkout-card h3 {
  margin: 0 0 16px;

  font-size: 16px;
}

.checkout-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 15px;

  padding: 15px;

  margin-bottom: 12px;

  border-radius: 16px;

  background: #f7f9fc;
}

.checkout-summary-info {
  display: flex;
  align-items: center;

  gap: 12px;
}

.checkout-summary-info strong {
  display: block;

  font-size: 14px;
}

.checkout-summary-info span {
  display: block;

  margin-top: 3px;

  color: #7b8495;

  font-size: 11px;
}

.checkout-total {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding-top: 17px;

  margin-top: 17px;

  border-top: 1px dashed #dce2eb;
}

.checkout-total span {
  color: #697386;

  font-size: 12px;
}

.checkout-total strong {
  color: #2563eb;

  font-size: 21px;
}


/* =========================================================
   PAYMENT METHOD
   ========================================================= */

.payment-methods {
  display: grid;

  gap: 10px;
}

.payment-method {
  position: relative;

  display: flex;
  align-items: center;

  gap: 12px;

  width: 100%;

  padding: 15px;

  border-radius: 16px;

  background: #f8fafc;

  border: 2px solid #e8edf4;

  text-align: left;

  transition: 0.2s;
}

.payment-method:hover {
  border-color: #bfdbfe;
}

.payment-method.active {
  border-color: #2563eb;

  background: #f3f7ff;
}

.payment-method-icon {
  width: 42px;
  height: 42px;

  display: grid;
  place-items: center;

  flex-shrink: 0;

  border-radius: 12px;

  background: #eaf2ff;

  color: #2563eb;

  font-size: 18px;
}

.payment-method-info {
  flex: 1;
}

.payment-method-info strong {
  display: block;

  color: #1f2937;

  font-size: 13px;
}

.payment-method-info span {
  display: block;

  margin-top: 3px;

  color: #8a94a6;

  font-size: 10px;
}

.payment-method-check {
  width: 20px;
  height: 20px;

  display: grid;
  place-items: center;

  border-radius: 50%;

  border: 2px solid #d5dce7;

  color: transparent;

  font-size: 10px;
}

.payment-method.active .payment-method-check {
  border-color: #2563eb;

  background: #2563eb;

  color: white;
}


/* =========================================================
   QR PAYMENT
   ========================================================= */

.qr-page {
  text-align: center;
}

.qr-card {
  width: min(440px, 100%);

  margin: 0 auto;

  padding: 28px;

  border-radius: 26px;

  background: white;

  border: 1px solid #e5eaf2;

  box-shadow:
    0 15px 40px rgba(30,50,90,0.08);
}

.qr-card h2 {
  margin: 0 0 7px;

  font-size: 22px;
}

.qr-card > p {
  margin: 0 0 22px;

  color: #7b8495;

  font-size: 12px;

  line-height: 1.5;
}

.qr-box {
  width: 240px;
  height: 240px;

  display: grid;
  place-items: center;

  margin: 0 auto 20px;

  padding: 12px;

  border-radius: 18px;

  background: white;

  border: 1px solid #e1e6ef;

  box-shadow:
    0 8px 25px rgba(30,50,90,0.06);
}

.qr-placeholder {
  width: 100%;
  height: 100%;

  display: grid;
  place-items: center;

  border-radius: 9px;

  background:
    repeating-linear-gradient(
      45deg,
      #111 0,
      #111 4px,
      #fff 4px,
      #fff 8px
    );

  color: white;

  font-size: 13px;
  font-weight: 900;

  text-shadow:
    0 1px 4px black;
}

.qr-amount {
  margin-bottom: 18px;

  padding: 14px;

  border-radius: 15px;

  background: #eff6ff;
}

.qr-amount span {
  display: block;

  margin-bottom: 3px;

  color: #64748b;

  font-size: 10px;
}

.qr-amount strong {
  color: #2563eb;

  font-size: 23px;
}

.transfer-info {
  display: grid;

  gap: 8px;

  padding: 15px;

  margin-bottom: 18px;

  border-radius: 16px;

  background: #f7f9fc;

  text-align: left;
}

.transfer-row {
  display: flex;
  justify-content: space-between;

  gap: 15px;
}

.transfer-row span {
  color: #7b8495;

  font-size: 11px;
}

.transfer-row strong {
  color: #253047;

  font-size: 11px;

  text-align: right;
}


/* =========================================================
   SUCCESS
   ========================================================= */

.success-page {
  min-height: 65vh;

  display: flex;
  align-items: center;
  justify-content: center;

  text-align: center;
}

.success-card {
  width: min(520px, 100%);

  padding: 38px 25px;

  border-radius: 28px;

  background: white;

  border: 1px solid #e5eaf2;

  box-shadow:
    0 18px 45px rgba(30,50,90,0.08);
}

.success-icon {
  width: 75px;
  height: 75px;

  display: grid;
  place-items: center;

  margin: 0 auto 18px;

  border-radius: 50%;

  background: #dcfce7;

  color: #16a34a;

  font-size: 32px;
  font-weight: 900;
}

.success-card h1 {
  margin: 0 0 8px;

  font-size: 27px;

  letter-spacing: -0.03em;
}

.success-card > p {
  margin: 0 auto 23px;

  max-width: 380px;

  color: #7b8495;

  font-size: 12px;

  line-height: 1.6;
}

.success-order {
  padding: 15px;

  margin-bottom: 20px;

  border-radius: 16px;

  background: #f7f9fc;

  text-align: left;
}

.success-order-row {
  display: flex;
  justify-content: space-between;

  gap: 15px;

  padding: 7px 0;
}

.success-order-row span {
  color: #7b8495;

  font-size: 11px;
}

.success-order-row strong {
  color: #263247;

  font-size: 11px;

  text-align: right;
}


/* =========================================================
   ORDERS
   ========================================================= */

.orders-list {
  display: grid;

  gap: 12px;
}

.order-card {
  display: flex;
  align-items: center;

  gap: 15px;

  padding: 17px;

  border-radius: 19px;

  background: white;

  border: 1px solid #e6ebf3;

  box-shadow:
    0 7px 22px rgba(30,50,90,0.05);
}

.order-icon {
  width: 48px;
  height: 48px;

  display: grid;
  place-items: center;

  flex-shrink: 0;

  border-radius: 14px;

  background: #edf4ff;

  color: #2563eb;
}

.order-info {
  flex: 1;
}

.order-info strong {
  display: block;

  font-size: 13px;
}

.order-info span {
  display: block;

  margin-top: 4px;

  color: #8a94a6;

  font-size: 10px;
}

.order-status {
  padding: 6px 9px;

  border-radius: 99px;

  background: #dcfce7;

  color: #15803d;

  font-size: 9px;
  font-weight: 900;
}


/* =========================================================
   EMPTY STATE
   ========================================================= */

.empty-state {
  padding: 60px 20px;

  border-radius: 22px;

  background: white;

  border: 1px dashed #d8dfe9;

  text-align: center;
}

.empty-state-icon {
  width: 62px;
  height: 62px;

  display: grid;
  place-items: center;

  margin: 0 auto 14px;

  border-radius: 18px;

  background: #f0f3f8;

  color: #94a0b3;

  font-size: 25px;
}

.empty-state h3 {
  margin: 0 0 6px;

  font-size: 17px;
}

.empty-state p {
  margin: 0;

  color: #8a94a6;

  font-size: 12px;
}


/* =========================================================
   CART DRAWER
   ========================================================= */

.cart-overlay {
  position: fixed;

  inset: 0;

  z-index: 200;

  background:
    rgba(15,23,42,0.42);

  backdrop-filter: blur(3px);
}

.cart-drawer {
  position: fixed;

  top: 0;
  right: 0;

  z-index: 201;

  width: min(430px, 100%);

  height: 100vh;

  display: flex;
  flex-direction: column;

  background: #f8faff;

  box-shadow:
    -15px 0 45px rgba(15,23,42,0.16);
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 19px;

  background: white;

  border-bottom: 1px solid #e6ebf3;
}

.cart-header h2 {
  margin: 0;

  font-size: 18px;
}

.cart-close {
  width: 38px;
  height: 38px;

  display: grid;
  place-items: center;

  border-radius: 11px;

  background: #f1f4f8;

  color: #596579;

  font-size: 17px;
}

.cart-items {
  flex: 1;

  overflow-y: auto;

  padding: 15px;
}

.cart-item {
  display: flex;
  align-items: center;

  gap: 12px;

  padding: 14px;

  margin-bottom: 10px;

  border-radius: 17px;

  background: white;

  border: 1px solid #e6ebf3;
}

.cart-item-info {
  flex: 1;
}

.cart-item-info strong {
  display: block;

  font-size: 13px;
}

.cart-item-info span {
  display: block;

  margin-top: 3px;

  color: #2563eb;

  font-size: 11px;
  font-weight: 800;
}

.cart-quantity {
  display: flex;
  align-items: center;

  gap: 6px;
}

.quantity-button {
  width: 28px;
  height: 28px;

  display: grid;
  place-items: center;

  border-radius: 8px;

  background: #edf2f8;

  color: #344054;

  font-weight: 900;
}

.quantity-number {
  min-width: 20px;

  text-align: center;

  font-size: 11px;
  font-weight: 900;
}

.cart-remove {
  width: 30px;
  height: 30px;

  display: grid;
  place-items: center;

  border-radius: 9px;

  background: #fff1f2;

  color: #e11d48;

  font-size: 12px;
}

.cart-footer {
  padding: 17px;

  background: white;

  border-top: 1px solid #e6ebf3;
}

.cart-total {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 13px;
}

.cart-total span {
  color: #7b8495;

  font-size: 12px;
}

.cart-total strong {
  color: #2563eb;

  font-size: 20px;
}


/* =========================================================
   TOAST
   ========================================================= */

.store-toast {
  position: fixed;

  left: 50%;
  bottom: 90px;

  z-index: 300;

  max-width: calc(100% - 30px);

  padding: 12px 17px;

  transform: translateX(-50%);

  border-radius: 13px;

  background: #172033;

  color: white;

  box-shadow:
    0 12px 35px rgba(15,23,42,0.2);

  font-size: 12px;
  font-weight: 700;

  animation:
    toast-in 0.25s ease;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform:
      translate(-50%, 10px);
  }

  to {
    opacity: 1;
    transform:
      translate(-50%, 0);
  }
}


/* =========================================================
   CHECKOUT RESPONSIVE
   ========================================================= */

@media (max-width: 850px) {

  .checkout-layout {
    grid-template-columns: 1fr;
  }

}


@media (max-width: 640px) {

  .checkout-card {
    padding: 17px;

    border-radius: 19px;
  }

  .qr-card {
    padding: 22px 15px;

    border-radius: 22px;
  }

  .qr-box {
    width: 210px;
    height: 210px;
  }

  .success-card {
    padding: 30px 18px;

    border-radius: 22px;
  }

  .order-card {
    padding: 13px;

    gap: 10px;
  }

  .order-icon {
    width: 43px;
    height: 43px;
  }

  .cart-drawer {
    width: 100%;
  }

}


/* =========================================================
   SMALL SCREEN FIX
   ========================================================= */

@media (max-width: 380px) {

  .qr-box {
    width: 185px;
    height: 185px;
  }

  .payment-method {
    padding: 12px;
  }

  .payment-method-icon {
    width: 37px;
    height: 37px;
  }

}