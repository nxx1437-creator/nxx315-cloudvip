// src/components/LandingStyle.js
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,400;1,400&family=Space+Mono&display=swap');
.dp{--cv:#090909;--paper:#f7f9fa;--vio:#af50ff;--mut:rgba(255,255,255,.4);--rule:rgba(255,255,255,.25);--card:rgba(255,255,255,.05);--line:rgba(255,255,255,.2);--txt2:rgba(247,249,250,.75);--cn:#d4a0ff;background:var(--cv);color:var(--paper);font-family:"Inter",Arial,sans-serif;font-weight:300;min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased;transition:background .3s,color .3s}
.dp *,.dp *::before,.dp *::after{box-sizing:border-box}
.dp a{color:inherit;text-decoration:none}
.dp button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;padding:0}
.dp h1,.dp h2,.dp h3,.dp p{margin:0}
.dp-serif{font-family:"Playfair Display",Georgia,serif;font-style:italic;font-weight:400;letter-spacing:0}
.dp-mono{font-family:"Space Mono",ui-monospace,monospace;font-weight:400}
.dp-wrap{max-width:1296px;margin:0 auto;padding:0 clamp(20px,5vw,72px)}
.dp-sec{padding:clamp(72px,12vw,160px) 0 0}
.dp-lbl{font:400 12px/1 "Inter",sans-serif;letter-spacing:.07em;text-transform:uppercase;color:var(--mut)}
.dp-h2{font-weight:500;font-size:clamp(34px,6vw,64px);line-height:1.12;letter-spacing:-.04em;margin-top:16px}
.dp-body{font-size:clamp(16px,2vw,20px);line-height:1.6;color:var(--txt2)}
.dp-rv{opacity:0;transform:translateY(24px);transition:opacity .8s ease,transform .8s ease}
.dp-rv.in{opacity:1;transform:none}

/* NAV */
.dp-nav{position:fixed;top:0;left:0;right:0;height:54px;z-index:20;display:flex;align-items:center;gap:16px;padding:0 clamp(14px,2vw,26px);border-bottom:.5px solid rgba(255,255,255,.4);background:rgba(9,9,9,.35);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.dp-wm{font-weight:700;font-size:14px;letter-spacing:.02em;white-space:nowrap}
.dp-wm .dp-serif{font-weight:400;font-size:15px;opacity:.85}
.dp-nav-links{display:none;margin-left:auto;gap:22px;padding-left:20px;border-left:.5px solid rgba(255,255,255,.4);height:100%;align-items:stretch}
.dp-nav-links button{font:400 12px/1 "Inter",sans-serif;text-transform:uppercase;opacity:.9;border-bottom:4px solid transparent}
.dp-nav-links button:hover{opacity:.75;border-bottom-color:rgba(255,255,255,.75)}
.dp-nav-actions{display:flex;gap:8px;margin-left:auto;align-items:center}
.dp-nbtn{white-space:nowrap;font:400 12px/1 "Inter",sans-serif;text-transform:uppercase;height:32px;padding:0 14px;border-radius:4px;display:inline-flex;align-items:center;transition:background .15s}
.dp-nbtn.fill{background:rgba(255,255,255,.1)}
.dp-nbtn.fill:hover{background:rgba(255,255,255,.4)}
.dp-nbtn.line{border:.5px solid #fff}
.dp-nbtn.ghost{opacity:.7;padding:0 8px}
@media(min-width:900px){.dp-nav-links{display:flex}.dp-nav-actions{margin-left:0}}

/* ===== HERO ===== */
.dp-stage{position:relative;min-height:100svh;overflow:hidden;padding:120px 0 72px;display:flex;flex-direction:column;justify-content:center;background:#090909;}
.dp-trail{position:absolute;left:0;top:46%;width:100%;pointer-events:none;opacity:.9;z-index:2}
.dp-trail svg{display:block;width:min(260px,52vw);height:18px;animation:dpFly 11s linear infinite}
@keyframes dpFly{from{transform:translateX(-30vw)}to{transform:translateX(105vw)}}
.dp-hero{position:relative;z-index:2;display:grid;gap:40px;align-items:center}
@media(min-width:900px){.dp-hero{grid-template-columns:1.1fr .9fr}}
.dp-hero-text-container{width:100%; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.8)); }
.dp-h1{font-weight:500;font-size:clamp(46px,10.5vw,88px);line-height:.98;letter-spacing:-.03em}
.dp-h1 span{display:block}
.dp-h1 .dp-serif{letter-spacing:-.02em}
.dp-h1 .dim{opacity:.55;padding-bottom:.14em}
.dp-hs{margin-top:20px;font-weight:700;font-size:clamp(20px,3vw,28px);line-height:1.2;letter-spacing:-.01em;max-width:320px}
.dp-tele{position:absolute;left:0;right:0;bottom:22px;z-index:2;display:flex;justify-content:space-between;font-size:13px;color:rgba(255,255,255,.7)}
.dp-hero-bg-image {position: absolute;top: 0;left: 0;width: 100%;height: 100%;object-fit: cover;z-index: 0;filter: brightness(0.7);}
.dp-hero-overlay {position: absolute;inset: 0;background: linear-gradient(90deg, rgba(9,9,9,0.9) 0%, rgba(9,9,9,0.3) 50%, rgba(9,9,9,0.1) 100%), linear-gradient(0deg, rgba(9,9,9,0.8) 0%, transparent 40%);z-index: 1;pointer-events: none;}

/* TICKET */
.dp-ticket{position:relative;border-radius:20px;padding:32px 24px 28px 44px; background:rgba(20,20,30,.6);border-top:.5px solid rgba(255,255,255,.45);border-right:.5px solid rgba(255,255,255,.45);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);-webkit-mask:radial-gradient(circle 12px at 0 14%,#0000 98%,#000);mask:radial-gradient(circle 12px at 0 14%,#0000 98%,#000);box-shadow: 0 8px 32px rgba(0,0,0,0.3);}
.dp-ticket::before{content:"";position:absolute;left:20px;top:8%;bottom:8%;border-left:2px dotted rgba(255,255,255,.35)}
.dp-ticket .meta{font-size:12px;letter-spacing:.07em;text-transform:uppercase;color:rgba(255,255,255,.6);display:flex;justify-content:space-between;margin-bottom:14px}
.dp-ticket h3{font-weight:400;font-size:clamp(24px,3.4vw,32px);line-height:1.2;margin:0 0 6px}
.dp-ticket .note{font-size:15px;line-height:1.5;color:rgba(255,255,255,.75);margin-bottom:24px}

/* GLASS PILL */
.dp-pill{display:flex;align-items:center;justify-content:center;gap:14px;height:56px;padding:0 28px;border-radius:9999px;background:rgba(255,255,255,.1);color:#fff;font-weight:300;font-size:clamp(17px,2.4vw,22px);border-top:.5px solid rgba(255,255,255,.25);border-right:.5px solid rgba(255,255,255,.5);border-bottom:.5px solid rgba(237,195,196,.25);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);transition:all .2s;width:100%}
.dp-pill+.dp-pill{margin-top:12px}
.dp-pill:hover{background:rgba(255,255,255,.2);border-color:transparent;box-shadow:inset 0 0 0 2px #af50ff,inset 1px 1px 0 1px rgba(255,255,255,.6),inset -1px -1px 0 1px rgba(255,255,255,.35)}
.dp-pill.big{height:64px;font-size:clamp(18px,2.6vw,28px);width:auto;min-width:min(100%,300px)}

/* 3 CỘT (onboarding, mời bạn) */
.dp-trip{display:grid;gap:40px;margin-top:clamp(56px,9vw,96px)}
@media(min-width:900px){.dp-trip{grid-template-columns:repeat(3,1fr);gap:64px}}
.dp-trip .num{font-size:13px;color:var(--mut);margin-bottom:12px;text-transform:uppercase}
.dp-trip h3{font-weight:400;font-size:clamp(28px,4.4vw,48px);line-height:1;letter-spacing:-.02em}
.dp-trip p{margin-top:16px;font-size:17px;line-height:1.5;color:var(--txt2)}
.dp-trip svg.ico{color:var(--vio);margin-bottom:16px}
.dp-cta-row{margin-top:48px;display:flex;flex-wrap:wrap;gap:16px;align-items:center}

/* ===== THÔNG TIN CHI TIẾT + FAQ ===== */
.dp-dgrid{display:grid;gap:20px;margin-top:clamp(40px,7vw,72px)}
@media(min-width:900px){.dp-dgrid{grid-template-columns:repeat(2,1fr)}}
.dp-dcard{height:100%;padding:28px;border-radius:20px;border:1px solid var(--line);background:var(--card)}
.dp-dcard h3{font-size:clamp(20px,2.6vw,26px);font-weight:500;margin-bottom:10px}
.dp-dcard p{font-size:16px;line-height:1.6;color:var(--txt2)}
.dp-faq-title{font-weight:500;font-size:clamp(26px,4vw,40px);letter-spacing:-.03em;margin-top:72px}
.dp-faq{max-width:820px;margin-top:24px;display:grid;gap:10px}
.dp-faq details{padding:18px 22px;border-radius:14px;border:1px solid var(--line);background:var(--card)}
.dp-faq summary{cursor:pointer;font-size:18px;font-weight:400;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:16px}
.dp-faq summary::-webkit-details-marker{display:none}
.dp-faq summary::after{content:"+";font-size:22px;color:var(--vio);flex-shrink:0}
.dp-faq details[open] summary::after{content:"–"}
.dp-faq details p{margin-top:12px;font-size:16px;line-height:1.6;color:var(--txt2)}

/* ===== TÍNH NĂNG MỚI (CREATOR) ===== */
.dp-feature-box{position:relative;background:var(--card);border:1px solid rgba(175,80,255,.3);border-radius:32px;padding:clamp(32px,6vw,64px);overflow:hidden;box-shadow:0 20px 80px rgba(0,0,0,.5)}
.dp-feature-glow{position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle at 50% 50%,rgba(175,80,255,.15) 0%,transparent 60%);pointer-events:none;z-index:1}
.dp-creator-showcase{display:grid;gap:48px;margin-top:48px;align-items:center}
@media(min-width:900px){.dp-creator-showcase{grid-template-columns:1fr 1fr}}
.dp-creator-text h3{font-size:clamp(24px,3vw,32px);font-weight:500;margin-bottom:16px}
.dp-creator-text p{font-size:18px;line-height:1.6;color:var(--txt2);margin-bottom:24px}
.dp-creator-perks{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:16px}
.dp-creator-perks li{display:flex;align-items:center;gap:12px;font-size:16px;color:var(--paper);background:var(--card);padding:16px;border-radius:12px;border:1px solid var(--line)}
.dp-creator-perks li svg{color:var(--vio);flex-shrink:0}
.dp-creator-visual{position:relative}

/* CONSOLE MOCKUP */
.dp-head{max-width:760px}
.dp-console{border:1px solid var(--line);border-radius:24px;overflow:hidden;background:#0d0d12;position:relative;z-index:2}
.dp-cbar{display:flex;align-items:center;gap:8px;padding:12px 16px;background:rgba(175,80,255,.22);border-bottom:.5px solid rgba(175,80,255,.5)}
.dp-cbar i{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.4)}
.dp-url{margin-left:10px;flex:1;font-size:12px;opacity:.85;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dp-badge{display:inline-flex;align-items:center;padding:8px 14px;border-radius:8px;border-top:.5px solid #4d5da5;background:rgba(255,255,255,.07);backdrop-filter:blur(11px);font:400 12px/1 "Inter",sans-serif;text-transform:uppercase;letter-spacing:.04em}
.dp-cbody{padding:clamp(16px,3vw,32px);display:grid;gap:12px;min-height:240px}
.dp-cbody img{width:100%;height:100%;object-fit:cover;border-radius:12px;display:block}
.dp-float{margin-top:14px;margin-right:10px}
@media(min-width:900px){.dp-float{position:absolute;margin:0}.dp-float.f1{right:-20px;top:70px}}

/* XẾP HẠNG + ĐƠN ĐÃ DUYỆT */
.dp-rail{display:flex;gap:24px;overflow-x:auto;scroll-snap-type:x mandatory;padding:6px max(20px,5vw) 24px;margin-top:48px;scrollbar-width:none}
.dp-rail::-webkit-scrollbar{display:none}
.dp-tk{position:relative;flex:0 0 min(423px,82vw);height:297px;border-radius:20px;overflow:hidden;scroll-snap-align:start;display:flex;flex-direction:column;justify-content:space-between;padding:22px 24px;background:#0f0f14;color:#f7f9fa;-webkit-mask:radial-gradient(circle 10px at 0 33%,#0000 98%,#000),radial-gradient(circle 10px at 100% 33%,#0000 98%,#000);-webkit-mask-composite:source-in;mask:radial-gradient(circle 10px at 0 33%,#0000 98%,#000),radial-gradient(circle 10px at 100% 33%,#0000 98%,#000);mask-composite:intersect}
.dp-tk::before,.dp-tk::after{content:"";position:absolute;border-radius:50%;filter:blur(46px);z-index:0}
.dp-tk::before{width:70%;height:70%;left:-10%;top:-10%}
.dp-tk::after{width:70%;height:70%;right:-10%;bottom:-10%}
.dp-tk.t0::before{background:#2fd3ff}.dp-tk.t0::after{background:#af50ff}
.dp-tk.t1::before{background:#b08cff}.dp-tk.t1::after{background:#ff4fa3}
.dp-tk.t2::before{background:#ff7ab8}.dp-tk.t2::after{background:#5a6bff}
.dp-tk>*{position:relative;z-index:1}
.dp-tk .shade{position:absolute;inset:auto 0 0 0;height:60%;background:linear-gradient(0deg,rgba(9,9,9,.78),rgba(9,9,9,0));z-index:0}
.dp-tk .top{font-size:14px;letter-spacing:.07em;text-transform:uppercase;color:rgba(255,255,255,.8)}
.dp-tk .ghost{position:absolute;right:20px;bottom:44px;font-size:88px;line-height:1;color:rgba(247,249,250,.25);mix-blend-mode:soft-light;z-index:1}
.dp-tk .btm{display:flex;align-items:flex-end;justify-content:space-between;gap:12px}
.dp-tk .nm{font-size:clamp(24px,3vw,32px);line-height:1.15;word-break:break-word}
.dp-tk .sub{margin-top:6px;font-size:15px;color:rgba(255,255,255,.85)}
.dp-tk.sk{background:#14141a;opacity:.5}
.dp-list{max-width:768px;margin:32px auto 0;padding:0 20px;display:grid;gap:10px}
.dp-row{display:flex;align-items:center;gap:16px;padding:16px 20px;border:1px solid var(--line);border-radius:12px;background:var(--card)}
.dp-row .rk{width:32px;color:var(--mut);font-size:14px}
.dp-row .nm{flex:1;font-size:18px;font-weight:400}
.dp-row .cn{font-size:15px;color:var(--cn)}
.dp-oc{flex:0 0 min(300px,78vw);scroll-snap-align:start;padding:24px;border-radius:12px;border:1px solid var(--line);background:var(--card);display:flex;flex-direction:column;gap:18px;transition:background .3s}
.dp-oc:hover{background:var(--card);filter:brightness(1.08)}
.dp-oc .it{font-size:28px;line-height:1.15;font-weight:400;letter-spacing:-.01em}
.dp-oc .ft{display:flex;justify-content:space-between;align-items:center;font-size:14px;color:var(--mut)}
.dp-note{text-align:center;color:var(--mut);padding:32px 20px;font-size:16px}

/* FOOTER */
.dp-end{position:relative;overflow:hidden;margin-top:clamp(72px,12vw,160px);background:#090909;color:#f7f9fa;padding-bottom:24px}
.dp-glow{position:absolute;inset:0;background:radial-gradient(60% 55% at 10% 100%,rgba(175,80,255,.55),transparent 70%),radial-gradient(60% 55% at 92% 100%,rgba(40,100,210,.65),transparent 70%),radial-gradient(50% 40% at 50% 70%,rgba(210,80,150,.2),transparent 70%)}
.dp-grain{position:absolute;inset:0;opacity:.18;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
.dp-horizon{position:absolute;left:-30%;right:-30%;top:-60%;height:100%;border-radius:50%;background:var(--cv);transition:background .3s}
.dp-close{position:relative;text-align:center;padding:clamp(72px,12vw,140px) 20px 64px}
.dp-close h2{font-weight:300;font-size:clamp(32px,5.4vw,50px);line-height:1.2}
.dp-close p{margin-top:12px;color:rgba(255,255,255,.7)}
.dp-close .acts{margin-top:48px;display:flex;flex-wrap:wrap;gap:16px;justify-content:center}
.dp-foot{position:relative;display:grid;gap:36px;padding-top:48px;grid-template-columns:1fr 1fr}
@media(min-width:900px){.dp-foot{grid-template-columns:1.3fr 1fr 1fr 1fr}}
.dp-foot .brand{grid-column:1/-1}
@media(min-width:900px){.dp-foot .brand{grid-column:auto}}
.dp-foot .brand .dp-wm{font-size:26px}
.dp-foot .brand .dp-wm .dp-serif{font-size:28px}
.dp-foot .brand p{margin-top:16px;max-width:320px;font-size:18px;line-height:1.55;font-weight:400}
.dp-foot h4{margin:0 0 10px;font-weight:700;font-size:17px;text-transform:uppercase}
.dp-foot li{list-style:none}
.dp-foot ul{margin:0;padding:0}
.dp-foot li a,.dp-foot li button{display:inline-block;padding:7px 0 4px;font-size:18px;font-weight:400;color:#fff;text-align:left}
.dp-bottom{position:relative;margin-top:48px;padding-top:20px;border-top:1px solid rgba(255,255,255,.2);display:flex;flex-wrap:wrap;gap:12px 24px;justify-content:space-between;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.7)}

/* ===== CHẾ ĐỘ SÁNG (khi <html> không có class "dark") ===== */
html:not(.dark) .dp{--cv:#f7f9fa;--paper:#0f1115;--mut:rgba(15,17,21,.5);--card:#ffffff;--line:rgba(15,17,21,.12);--txt2:rgba(15,17,21,.72);--cn:#8a2be2}
html:not(.dark) .dp .dp-stage,
html:not(.dark) .dp .dp-end,
html:not(.dark) .dp .dp-nav{--paper:#f7f9fa;--mut:rgba(255,255,255,.4);color:#f7f9fa}
html:not(.dark) .dp .dp-nav{background:rgba(9,9,9,.78)}
html:not(.dark) .dp .dp-sec .dp-pill{background:rgba(15,17,21,.06);color:#0f1115;border-color:rgba(15,17,21,.2)}
html:not(.dark) .dp .dp-sec .dp-pill:hover{background:rgba(175,80,255,.12)}
html:not(.dark) .dp .dp-feature-box{box-shadow:0 20px 60px rgba(0,0,0,.08)}
html:not(.dark) .dp .dp-console{background:#fff}
html:not(.dark) .dp .dp-badge{background:rgba(175,80,255,.12);border-top-color:rgba(175,80,255,.5)}
html:not(.dark) .dp .dp-row:hover,
html:not(.dark) .dp .dp-oc{box-shadow:0 4px 18px rgba(0,0,0,.05)}

@media(prefers-reduced-motion:reduce){
  .dp *{animation:none!important;transition:none!important}
  .dp-rv{opacity:1;transform:none}
}
`;
