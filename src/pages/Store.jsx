import { useState } from "react";
import "./Store.css";

const games = [
  { name: "Play Together VNG", type: "mobile", img: "/assets/play-together.jpg" },
  { name: "Roblox VN", type: "pc", img: "/assets/roblox.jpg" },
  { name: "PUBG Mobile VN", type: "mobile", img: "/assets/pubg.jpg" },
  { name: "VALORANT", type: "pc", img: "/assets/valorant.jpg" },
  { name: "Liên Minh Huyền Thoại: Tốc Chiến", type: "mobile", img: "/assets/lmht.jpg" },
  { name: "ZingSpeed Mobile", type: "mobile", img: "/assets/zingspeed.jpg" },
];

const benefits = [
  [ "Ưu đãi hấp dẫn"],
  [ "Vật phẩm độc quyền"],
  [ "Thanh toán trực tiếp"],
  [ "Giá tốt nhất"],
];

export default function Store() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = games.filter(
    (g) =>
      (filter === "all" || g.type === filter) &&
      g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="store">
      <header className="header">
        <img src="/assets/logo.png" className="logo" />

        <div className="header-right">
          <button>⠿</button>
          <button>🌐 VN</button>
          <div className="avatar">👤</div>
        </div>
      </header>

      <div className="search">
        🔍
        <input
          placeholder="Tìm kiếm game..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <main>
        <section className="hero">
          <img src="/assets/banner.jpg" />
        </section>

        <section>
          <h2>DÀNH CHO BẠN</h2>

          <div className="recommend">
            {games.slice(4, 6).map((game) => (
              <GameCard key={game.name} game={game} />
            ))}
          </div>
        </section>

        <section>
          <h2>DANH SÁCH GAME</h2>

          <div className="tabs">
            {[
              ["all", "TẤT CẢ"],
              ["mobile", "MOBILE"],
              ["pc", "PC"],
            ].map(([value, label]) => (
              <button
                className={filter === value ? "active" : ""}
                onClick={() => setFilter(value)}
                key={value}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="games">
            {filtered.map((game) => (
              <GameCard key={game.name} game={game} />
            ))}
          </div>

          <button className="more">Xem thêm</button>
        </section>

        <section className="benefits">
          <h2>LỢI ÍCH KHI NẠP TẠI<br />VNGGAMES</h2>

          <div className="benefit-grid">
            {benefits.map(([icon, title]) => (
              <div className="benefit" key={title}>
                <span>{icon}</span>
                <b>{title}</b>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer>
        <img src="/assets/logo-white.png" />
        <div>
          <b>Khám phá</b>
          <b>Hỗ trợ</b>
        </div>
        <small>© NXX315 Studio Rewards. All rights reserved.</small>
      </footer>
    </div>
  );
}

function GameCard({ game }) {
  return (
    <article className="game-card">
      <img src={game.img} />
      <h3>{game.name}</h3>
      <button>Nạp ngay</button>
    </article>
  );
}