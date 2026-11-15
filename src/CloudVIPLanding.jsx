// src/CloudVIPLanding.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Video, Sparkles, UserPlus, PlaySquare, Gift } from "lucide-react"; 
import { supabase } from "./lib/supabaseClient.js"; 
import { SITE } from "./lib/siteInfo.js";
import { useI18n } from "./i18n/index.js";
import { COPY, CREATOR_URL } from "./lib/landingData.js";
import { CSS } from "./components/LandingStyle.js";
import {
  FloatingNav, Reveal, Trail, Flap, RankTicket, OrderCard,
  Skeletons, Wordmark, scrollToId,
} from "./components/LandingBits.jsx";

const HERO_IMAGE_URL = "https://i.postimg.cc/SspRfjP1/2820b7c3993087b1613784521f440e45.jpg";

export default function CloudVIPLanding() {
  const i18n = useI18n();
  const lang = i18n.lang === "en" ? "en" : "vi";
  const setLang = i18n.setLang || i18n.setLanguage || i18n.changeLanguage;
  const c = COPY[lang];
  const navigate = useNavigate();
  const [board, setBoard] = useState(undefined);
  const [orders, setOrders] = useState(undefined);

  useEffect(() => {
    let off = false;
    (async () => {
      try {
        const [lb, od] = await Promise.all([
          supabase.rpc("get_landing_leaderboard", { p_limit: 10 }),
          supabase.rpc("get_landing_recent_orders", { p_limit: 8 }),
        ]);
        if (off) return;
        setBoard(lb.error ? null : lb.data || []);
        setOrders(od.error ? null : od.data || []);
      } catch {
        if (!off) { setBoard(null); setOrders(null); }
      }
    })();
    return () => { off = true; };
  }, []);

  const top3 = Array.isArray(board) ? board.slice(0, 3) : [];
  const rest = Array.isArray(board) ? board.slice(3) : [];
  const state = (v) => (v === undefined ? "load" : v === null ? "err" : v.length ? "ok" : "empty");

  return (
    <div className="dp">
      <style>{CSS}</style>

      <FloatingNav items={c.nav} onItem={scrollToId} loginLabel={c.login} startLabel={c.start}
        langLabel={c.langBtn} onLang={typeof setLang === "function" ? () => setLang(lang === "vi" ? "en" : "vi") : undefined} />

      <main>
        {/* ===== 1. HERO ===== */}
        <section className="dp-stage">
          <img className="dp-hero-bg-image" src={HERO_IMAGE_URL} alt="Hero Background" />
          <div className="dp-hero-overlay"></div>
          <Trail />
          
          <div className="dp-wrap dp-hero">
            <div className="dp-hero-text-container">
              <h1 className="dp-h1">
                <span>{c.h1a} <em className="dp-serif">{c.h1b}</em></span>
                <span>{c.h1c}</span>
                <span className="dp-serif dim">{c.h1d}</span>
              </h1>
              <p className="dp-hs">{c.heroSub}</p>
            </div>

            <aside className="dp-ticket">
              <p className="meta dp-mono"><span>{c.ticketMeta}</span><span>No. 01</span></p>
              <h3>{c.ticketTitle}</h3>
              <p className="note">{c.ticketNote}</p>
              <Link to="/register" className="dp-pill"><span>{c.ctaAccount}</span><ArrowRight size={18} strokeWidth={1.5} /></Link>
              <a href={CREATOR_URL} className="dp-pill"><span>{c.ctaCreator}</span><ArrowUpRight size={18} strokeWidth={1.5} /></a>
            </aside>
          </div>
          
          <div className="dp-wrap dp-tele dp-mono"><span>+ NXX315 · STUDIO REWARDS</span><span>↓ {c.scroll}</span></div>
        </section>

        {/* ===== 2. HƯỚNG DẪN TẠO TÀI KHOẢN ===== */}
        <section id="onboarding" className="dp-sec">
          <div className="dp-wrap">
            <Reveal className="dp-head">
              <p className="dp-lbl">BẮT ĐẦU NGAY</p>
              <h2 className="dp-h2">Tạo tài khoản <span className="dp-serif">tại nxx315.com</span></h2>
              <p className="dp-body" style={{ marginTop: 20 }}>Chỉ mất 30 giây để bắt đầu hành trình kiếm xu và đổi quà cùng NXX315 Studio.</p>
            </Reveal>

            <div className="dp-trip">
              <Reveal delay={80}>
                <UserPlus size={40} color="#af50ff" style={{ marginBottom: 16 }} />
                <p className="num dp-mono">BƯỚC 01</p>
                <h3>Truy cập & Đăng ký</h3>
                <p>Truy cập <b>www.nxx315.com</b>, nhấn nút "Bắt đầu" ở góc trên bên phải và điền thông tin tài khoản.</p>
              </Reveal>
              <Reveal delay={160}>
                <PlaySquare size={40} color="#af50ff" style={{ marginBottom: 16 }} />
                <p className="num dp-mono">BƯỚC 02</p>
                <h3>Làm nhiệm vụ</h3>
                <p>Sau khi đăng nhập, hãy vào mục "Nhiệm vụ" để nhận xu miễn phí hàng ngày hoặc tham gia các sự kiện.</p>
              </Reveal>
              <Reveal delay={240}>
                <Gift size={40} color="#af50ff" style={{ marginBottom: 16 }} />
                <p className="num dp-mono">BƯỚC 03</p>
                <h3>Đổi quà</h3>
                <p>Dùng số xu tích lũy được để đổi thành Robux, Quân Huy, Kim Cương hoặc nhiều phần quà hấp dẫn khác.</p>
              </Reveal>
            </div>
            
            <div className="dp-cta-row">
              <Link to="/register" className="dp-pill big"><span>Tạo tài khoản ngay</span><ArrowRight size={20} strokeWidth={1.5} /></Link>
            </div>
          </div>
        </section>

        {/* ===== 3. MỜI BẠN ===== */}
        <section id="invite" className="dp-sec">
          <div className="dp-wrap">
            <Reveal className="dp-head">
              <p className="dp-lbl">{c.iLabel}</p>
              <h2 className="dp-h2">{c.iTitleA} <span className="dp-serif">{c.iTitleB}</span></h2>
              <p className="dp-body" style={{ marginTop: 20 }}>{c.iBody}</p>
            </Reveal>
            <div className="dp-trip">
              {c.iCols.map(([big, d], i) => (
                <Reveal key={big} delay={i * 80}>
                  <h3 style={{ fontSize: "clamp(40px,7vw,64px)" }}>{big}</h3>
                  <p>{d}</p>
                </Reveal>
              ))}
            </div>
            <div className="dp-cta-row">
              <button type="button" className="dp-pill big" onClick={() => navigate("/register")}>
                <span>{c.iCta}</span><ArrowRight size={20} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </section>

        {/* ===== 4. BẢNG XẾP HẠNG ===== */}
        <section id="rank" className="dp-sec">
          <div className="dp-wrap">
            <Reveal className="dp-head">
              <p className="dp-lbl">{c.rLabel}</p>
              <h2 className="dp-h2">{c.rTitleA} <span className="dp-serif">{c.rTitleB}</span></h2>
              <p className="dp-body" style={{ marginTop: 20 }}>{c.rSub}</p>
            </Reveal>
          </div>
          {state(board) === "load" && <div className="dp-rail"><Skeletons /></div>}
          {state(board) === "ok" && <div className="dp-rail">{top3.map((r) => <RankTicket key={r.rank} row={r} c={c} />)}</div>}
          {(state(board) === "empty" || state(board) === "err") && (
            <p className="dp-note">{state(board) === "err" ? c.failed : c.empty}</p>
          )}
          {rest.length > 0 && (
            <div className="dp-list">
              {rest.map((r) => (
                <div key={r.rank} className="dp-row">
                  <span className="rk dp-mono">{String(r.rank).padStart(2, "0")}</span>
                  <span className="nm">{r.name}</span>
                  <span className="cn">{Number(r.coins).toLocaleString("vi-VN")} {c.unit}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ===== 5. ĐƠN ĐÃ DUYỆT (Lịch sử đổi quà) ===== */}
        <section id="orders" className="dp-sec">
          <div className="dp-wrap">
            <Reveal className="dp-head">
              <p className="dp-lbl">{c.oLabel}</p>
              <h2 className="dp-h2">{c.oTitleA} <span className="dp-serif">{c.oTitleB}</span></h2>
              <p className="dp-body" style={{ marginTop: 20 }}>{c.oSub}</p>
            </Reveal>
          </div>
          {state(orders) === "load" && <div className="dp-rail"><Skeletons n={4} /></div>}
          {state(orders) === "ok" && (
            <div className="dp-rail">{orders.map((o, i) => <OrderCard key={`${o.approved_at}-${i}`} row={o} c={c} />)}</div>
          )}
          {(state(orders) === "empty" || state(orders) === "err") && (
            <p className="dp-note">{state(orders) === "err" ? c.failed : c.empty}</p>
          )}
        </section>

        {/* ===== 6. TÍNH NĂNG MỚI (CREATOR) - CÓ LỚP BỌC KHÁC BIỆT ===== */}
        <section id="creator" className="dp-sec">
          <div className="dp-wrap">
            {/* Lớp bọc (Wrapper) tạo sự khác biệt */}
            <div className="dp-feature-box">
              <div className="dp-feature-glow"></div>
              
              <Reveal className="dp-head" style={{ position: 'relative', zIndex: 2 }}>
                <p className="dp-lbl" style={{ color: '#af50ff' }}><Sparkles size={14} style={{ display: 'inline', marginRight: 6 }}/> TÍNH NĂNG MỚI</p>
                <h2 className="dp-h2">Trở thành Creator <span className="dp-serif">kiếm xu thật.</span></h2>
              </Reveal>

              <div className="dp-creator-showcase" style={{ position: 'relative', zIndex: 2 }}>
                <div className="dp-creator-text">
                  <h3>Quay video, nhận thưởng</h3>
                  <p>{c.vBody}</p>
                  
                  <ul className="dp-creator-perks">
                    <li><Sparkles size={18} /> Nhận ngay xu thưởng khi video được duyệt.</li>
                    <li><Video size={18} /> Không giới hạn số lượng video mỗi ngày.</li>
                    <li><ArrowUpRight size={18} /> Kết nối trực tiếp với hệ thống NXX315 Studio.</li>
                  </ul>

                  <div className="dp-cta-row" style={{ marginTop: '32px' }}>
                    <a href={CREATOR_URL} className="dp-pill big" style={{ width: 'fit-content' }}>
                      <span>Khám phá Creator Hub</span><ArrowUpRight size={20} strokeWidth={1.5} />
                    </a>
                  </div>
                </div>

                <div className="dp-creator-visual">
                  <div className="dp-console">
                    <div className="dp-cbar">
                      <i /><i /><i />
                      <span className="dp-url dp-mono">creator.nxx315.com</span>
                      <span className="dp-badge">{c.mockTag}</span>
                    </div>
                    <div className="dp-cbody" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <p style={{ opacity: 0.6, fontStyle: 'italic' }}>[Hình ảnh minh họa giao diện Creator]</p>
                    </div>
                  </div>
                  <span className="dp-float f1 dp-badge">+ {c.mockGift}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="dp-end">
        <div className="dp-glow" /><div className="dp-grain" /><div className="dp-horizon" />
        <div className="dp-close">
          <Reveal>
            <h2>{c.closeA} <span className="dp-serif">{c.closeB}</span></h2>
            <p>{c.closeSub}</p>
            <div className="acts">
              <Link to="/register" className="dp-pill big"><span>{c.ctaAccount}</span><ArrowRight size={20} strokeWidth={1.5} /></Link>
              <a href={CREATOR_URL} className="dp-pill big"><span>{c.ctaCreator}</span><ArrowUpRight size={20} strokeWidth={1.5} /></a>
            </div>
          </Reveal>
        </div>

        <div className="dp-wrap">
          <div className="dp-foot">
            <div className="brand"><Wordmark /><p>{c.manifesto}</p></div>
            <div>
              <h4>{c.fCols[0]}</h4>
              <ul>{c.fExplore.map(([id, l]) => <li key={id}><button type="button" onClick={() => scrollToId(id)}>{l}</button></li>)}</ul>
            </div>
            <div>
              <h4>{c.fCols[1]}</h4>
              <ul>{c.fAccount.map(([to, l]) => <li key={to}><Link to={to}>{l}</Link></li>)}</ul>
              <h4 style={{ marginTop: 24 }}>{c.fCols[2]}</h4>
              <ul>{c.fLegal.map(([to, l]) => <li key={to}><Link to={to}>{l}</Link></li>)}</ul>
            </div>
            <div>
              <h4>{c.fCols[3]}</h4>
              <ul>
                {SITE?.youtube && <li><a href={SITE.youtube} target="_blank" rel="noopener noreferrer">YouTube</a></li>}
                {SITE?.zaloUrl && <li><a href={SITE.zaloUrl} target="_blank" rel="noopener noreferrer">Zalo</a></li>}
                {SITE?.email && <li><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>}
                <li><a href={CREATOR_URL}>Creator</a></li>
              </ul>
            </div>
          </div>
          <div className="dp-bottom dp-mono">
            <span>© {new Date().getFullYear()} Nxx315 Studio</span>
            <span>Roblox · Creator · Rewards</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
            
