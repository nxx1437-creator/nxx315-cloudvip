// Style trang giới thiệu — phong cách Augen: trắng lâm sàng, chữ mảnh (350), xanh #0071e3 chỉ làm viền/chữ.
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300..500&display=swap');
.lp {
  --ink:#0f1012; --black:#020201; --canvas:#f2f2f4; --panel:#fdfdfd;
  --steel:#5e5e5e; --ash:#8f8f8f; --blue:#0071e3; --hair:rgba(0,0,0,.06);
  --ease:cubic-bezier(.22,1,.36,1);
  font-family:'Inter',ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  font-weight:350; letter-spacing:-.02em;
  font-feature-settings:"ss01","ss02","cv01","cv11";
  color:var(--ink); background:var(--canvas);
  -webkit-font-smoothing:antialiased;
  text-rendering:optimizeLegibility;
}
.lp button { font:inherit; letter-spacing:inherit; }
.lp *, .lp *::before, .lp *::after { box-sizing:border-box; }

/* Chữ: thứ bậc bằng cỡ chữ, không bằng độ đậm */
.lp-label { font-size:12px; line-height:1.2; color:var(--ash); }
.lp-h2 { font-size:27px; line-height:1.25; letter-spacing:-.54px; }
@media (min-width:640px){ .lp-h2 { font-size:34px; } }
.lp-sub { font-size:18px; line-height:1.3; letter-spacing:-.36px; }
.lp-body { font-size:16px; line-height:1.4; letter-spacing:-.32px; color:var(--steel); }
.lp-link { color:var(--blue); transition:opacity .2s; text-decoration:none; }
.lp-link:focus-visible { outline:2px solid var(--blue); outline-offset:2px; border-radius:4px; }
@media (hover:hover){ .lp-link:hover { opacity:.7; } }

/* Thẻ bo tròn lớn, không đổ bóng */
.lp-card { background:var(--panel); border:.5px solid var(--hair); border-radius:40px; }
@media (min-width:640px){ .lp-card { border-radius:54px; } }

/* Viền xanh mảnh, không nền */
.lp-tag {
  display:inline-flex; align-items:center; gap:4px;
  border:.5px solid var(--blue); color:var(--blue); background:transparent;
  border-radius:9999px; padding:3px 11px; font-size:12px; line-height:1.2;
}
/* Biến thể tag lớn hơn — thay cho !rounded-[14px] !py-1.5 */
.lp-tag-lg {
  border-radius:14px;
  padding-top:6px; padding-bottom:6px;
}

.lp-press { transition:transform .12s ease-out, opacity .2s; }
.lp-press:active { transform:scale(.97); }
.lp-press:focus-visible { outline:2px solid var(--blue); outline-offset:2px; }

/* Nền kính mờ cho thanh nổi */
.lp-glass {
  background:rgba(253,253,253,.78);
  -webkit-backdrop-filter:blur(20px) saturate(180%); backdrop-filter:blur(20px) saturate(180%);
  border:.5px solid var(--hair);
}
.lp-nav {
  position:fixed; left:0; right:0; top:0; z-index:50;
  display:flex; justify-content:center; gap:8px; pointer-events:none;
  padding:calc(env(safe-area-inset-top,0px) + 14px) 12px 0;
}
@media (min-width:640px){ .lp-nav { padding-top:calc(env(safe-area-inset-top,0px) + 34px); } }
.lp-nav > * { pointer-events:auto; }
.lp-nav-logo { display:flex; height:44px; width:44px; align-items:center; justify-content:center; border-radius:9999px; color:var(--ink); }
.lp-nav-bar { display:flex; align-items:center; height:44px; border-radius:10px; padding:0 6px; }
.lp-nav-link { padding:8px 11px; border-radius:8px; font-size:14px; color:var(--ink); white-space:nowrap; }
@media (min-width:640px){ .lp-nav-link { padding:8px 16px; font-size:16px; } }
@media (hover:hover){ .lp-nav-link:hover { opacity:.6; } }

/* Dải thông báo + nút nổi */
.lp-banner {
  display:inline-flex; align-items:center; gap:14px; max-width:92vw;
  padding:6px 6px 6px 22px; border-radius:26px; background:rgba(12,13,15,.05);
  font-size:12px; color:var(--steel); text-decoration:none;
  transition:opacity .2s;
}
@media (hover:hover){ .lp-banner:hover { opacity:.85; } }
.lp-arrow { display:flex; height:22px; width:34px; align-items:center; justify-content:center; border:.5px solid var(--blue); border-radius:9999px; color:var(--blue); flex:none; }
.lp-cta {
  display:inline-flex; align-items:center; justify-content:center; gap:10px;
  height:48px; padding:0 22px;
  border-radius:26px; background:rgba(12,13,15,.05); color:var(--black);
  font-size:14px; font-weight:400; border:0; text-decoration:none;
  transition:transform .12s ease-out, opacity .2s;
}
.lp-cta svg { color:var(--blue); flex:none; }
.lp-cta:focus-visible { outline:2px solid var(--blue); outline-offset:2px; }
.lp-cta:active { transform:scale(.97); }
@media (hover:hover){ .lp-cta:hover { opacity:.9; } }

/* Media đầu trang: nằm giữa banner và chữ, rìa tan dần vào nền trắng */
.lp-hero-media {
  position:absolute; left:50%; top:50%; width:min(820px,175vw); aspect-ratio:16/9;
  transform:translate3d(-50%,calc(-50% + var(--py,0px)),0) scale(var(--ps,1));
  opacity:var(--po,1); will-change:transform,opacity; pointer-events:none;
}
@media (min-width:900px){ .lp-hero-media { left:62%; top:48%; width:min(1100px,92vw); } }
.lp-hero-video,
.lp-hero-media > img {
  width:100%; height:100%; object-fit:cover; display:block;
  filter:saturate(1.15);
  -webkit-mask-image:radial-gradient(closest-side,#000 58%,transparent 100%);
  mask-image:radial-gradient(closest-side,#000 58%,transparent 100%);
}
.lp-hero-fallback { background:radial-gradient(closest-side,rgba(0,113,227,.35),transparent); }

/* Hiện dần khi cuộn tới */
.lp-reveal { opacity:0; transform:translate3d(0,24px,0); transition:opacity .7s var(--ease), transform .7s var(--ease); }
.lp-reveal.is-in { opacity:1; transform:none; }
@keyframes lp-rise { from { opacity:0; transform:translate3d(0,18px,0); } to { opacity:1; transform:none; } }
.lp-rise { animation:lp-rise .9s var(--ease) both; }
.lp-d1 { animation-delay:.08s; } .lp-d2 { animation-delay:.18s; } .lp-d3 { animation-delay:.3s; }

@media (prefers-reduced-motion: reduce) {
  .lp-reveal { transform:none; transition:opacity .3s ease; }
  .lp-rise { animation:none; }
  .lp-hero-media { transform:translate3d(-50%,-50%,0); }
  .lp-press, .lp-cta { transition:none; }
  .lp-press:active, .lp-cta:active { transform:none; }
}
@media (prefers-reduced-transparency: reduce) {
  .lp-glass { background:#fdfdfd; -webkit-backdrop-filter:none; backdrop-filter:none; }
}
@media (prefers-contrast: more) {
  .lp-card, .lp-glass { border:1px solid rgba(0,0,0,.4); }
  .lp-tag { border-width:1px; }
}
`;

