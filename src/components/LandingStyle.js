// src/components/LandingStyle.js
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,400;1,400&family=Space+Mono&display=swap');
.dp{--cv:#090909;--paper:#f7f9fa;--vio:#af50ff;--mut:rgba(255,255,255,.4);--rule:rgba(255,255,255,.25);--card:rgba(255,255,255,.05);--line:rgba(255,255,255,.2);--txt2:rgba(247,249,250,.75);--cn:#d4a0ff;background:var(--cv);color:var(--paper);font-family:"Inter",Arial,sans-serif;font-weight:300;min-height:100vh;overflow-x:hidden;overflow-x:clip;-webkit-font-smoothing:antialiased;transition:background .3s,color .3s}
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

/* hiện dần (mặc định chỉ mờ + trượt, nhẹ cho điện thoại) */
.dp-rv{opacity:0;transform:translateY(28px);transition:opacity .8s ease,transform .8s cubic-bezier(.2,.8,.2,1)}
.dp-rv.in{opacity:1;transform:none}
.fx-fade{opacity:0;transform:translateY(20px);transition:opacity .8s ease .15s,transform .8s cubic-bezier(.2,.8,.2,1) .15s}
.fx-fade.in{opacity:1;transform:none}

/* ===== THANH TIẾN ĐỘ CUỘN ===== */
.fx-bar{position:fixed;top:0;left:0;right:0;height:3px;z-index:30;pointer-events:none}
.fx-bar i{display:block;height:100%;background:linear-gradient(90deg,#2fd3ff,#af50ff,#ff4fa3);transform-origin:0 0;transform:scaleX(0)}

/* ===== NAV ===== */
.dp-nav{position:fixed;top:0;left:0;right:0;height:54px;z-index:20;display:flex;align-items:center;gap:10px;padding:0 clamp(12px,2vw,26px);border-bottom:.5px solid rgba(255,255,255,.4);background:rgba(9,9,9,.35);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.dp-wm{font-weight:700;font-size:14px;letter-spacing:.02em;white-space:nowrap}
.dp-wm .dp-serif{font-weight:400;font-size:15px;opacity:.85}
.dp-nav-links{display:none;margin-left:auto;gap:22px;padding-left:20px;border-left:.5px solid rgba(255,255,255,.4);height:100%;align-items:stretch}
.dp-nav-links button{font:400 12px/1 "Inter",sans-serif;text-transform:uppercase;opacity:.9;border-bottom:4px solid transparent;white-space:nowrap}
.dp-nav-links button:hover{opacity:.75;border-bottom-color:rgba(255,255,255,.75)}
.dp-nav-actions{display:flex;gap:6px;margin-left:auto;align-items:center}
.dp-nbtn{white-space:nowrap;font:400 12px/1 "Inter",sans-serif;text-transform:uppercase;height:32px;padding:0 12px;border-radius:4px;display:inline-flex;align-items:center;transition:background .15s}
.dp-nbtn.fill{background:rgba(255,255,255,.1)}
.dp-nbtn.fill:hover{background:rgba(255,255,255,.4)}
.dp-nbtn.line{border:.5px solid #fff}
.dp-nbtn.ghost{opacity:.7;padding:0 8px}
@media(max-width:400px){
  .dp-nav{gap:6px}
  .dp-wm{font-size:12.5px}
  .dp-wm .dp-serif{font-size:13.5px}
  .dp-nbtn{padding:0 9px;font-size:10.5px;height:30px}
  .dp-nbtn.ghost{padding:0 4px}
}
@media(min-width:1100px){.dp-nav-links{display:flex}.dp-nav-actions{margin-left:0;gap:8px}}

/* ===== HERO ===== */
.dp-stage{position:relative;min-height:100svh;overflow:hidden;padding:120px 0 72px;display:flex;flex-direction:column;justify-content:center;background:#090909}
.dp-trail{position:absolute;left:0;top:46%;width:100%;pointer-events:none;opacity:.9;z-index:2}
.dp-trail svg{display:block;width:min(260px,52vw);height:18px;animation:dpFly 11s linear infinite}
@keyframes dpFly{from{transform:translateX(-30vw)}to{transform:translateX(105vw)}}
.dp-hero{position:relative;z-index:2;display:grid;gap:40px;align-items:center}
@media(min-width:900px){.dp-hero{grid-template-columns:1.1fr .9fr}}
.dp-hero-text-container{width:100%}
.dp-h1{font-weight:500;font-size:clamp(46px,10.5vw,88px);line-height:.98;letter-spacing:-.03em;text-shadow:0 4px 18px rgba(0,0,0,.55)}
.dp-h1 span{display:block}
.dp-h1 .dp-serif{letter-spacing:-.02em}
.dp-h1 .dim{opacity:.55;padding-bottom:.14em}
.dp-hs{margin-top:20px;font-weight:700;font-size:clamp(20px,3vw,28px);line-height:1.2;letter-spacing:-.01em;max-width:320px;text-shadow:0 2px 12px rgba(0,0,0,.6)}
.dp-tele{position:absolute;left:0;right:0;bottom:22px;z-index:2;display:flex;justify-content:space-between;font-size:13px;color:rgba(255,255,255,.7)}
.dp-hero-bg-image{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:0}
.dp-hero-overlay{position:absolute;inset:0;background:linear-gradient(rgba(0,0,0,.3),rgba(0,0,0,.3)),linear-gradient(90deg,rgba(9,9,9,.9) 0%,rgba(9,9,9,.3) 50%,rgba(9,9,9,.1) 100%),linear-gradient(0deg,rgba(9,9,9,.8) 0%,transparent 40%);z-index:1;pointer-events:none}
.fx-spot{position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(420px circle at var(--mx,70%) var(--my,30%),rgba(175,80,255,.2),transparent 60%)}
@media(hover:none){.fx-spot{display:none}}

/* hero vào cảnh (chỉ mờ + trượt) */
@keyframes fxLine{from{opacity:0;transform:translateY(36px)}}
.dp-h1>span{animation:fxLine 1s cubic-bezier(.2,.8,.2,1) both}
.dp-h1>span:nth-child(2){animation-delay:.12s}
.dp-h1>span:nth-child(3){animation-delay:.24s}
.dp-hs{animation:fxLine .9s .4s cubic-bezier(.2,.8,.2,1) both}
.dp-ticket{animation:fxLine 1s .3s cubic-bezier(.2,.8,.2,1) both}

/* TICKET */
.dp-ticket{position:relative;border-radius:20px;padding:32px 24px 28px 44px;background:rgba(20,20,30,.6);border-top:.5px solid rgba(255,255,255,.45);border-right:.5px solid rgba(255,255,255,.45);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);-webkit-mask:radial-gradient(circle 12px at 0 14%,#0000 98%,#000);mask:radial-gradient(circle 12px at 0 14%,#0000 98%,#000);box-shadow:0 8px 32px rgba(0,0,0,.3)}
.dp-ticket::before{content:"";position:absolute;left:20px;top:8%;bottom:8%;border-left:2px dotted rgba(255,255,255,.35)}
.dp-ticket .meta{font-size:12px;letter-spacing:.07em;text-transform:uppercase;color:rgba(255,255,255,.6);display:flex;justify-content:space-between;margin-bottom:14px}
.dp-ticket h3{font-weight:400;font-size:clamp(24px,3.4vw,32px);line-height:1.2;margin:0 0 6px}
.dp-ticket .note{font-size:15px;line-height:1.5;color:rgba(255,255,255,.75);margin-bottom:24px}
.dp-ticket .dp-pill{padding:0 22px;font-size:clamp(16px,4.2vw,20px);white-space:nowrap}

/* GLASS PILL */
.dp-pill{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;gap:14px;height:56px;padding:0 28px;border-radius:9999px;background:rgba(255,255,255,.1);color:#fff;font-weight:300;font-size:clamp(17px,2.4vw,22px);border-top:.5px solid rgba(255,255,255,.25);border-right:.5px solid rgba(255,255,255,.5);border-bottom:.5px solid rgba(237,195,196,.25);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);transition:all .2s;width:100%}
.dp-pill::after{content:"";position:absolute;top:0;bottom:0;left:-60%;width:40%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.35),transparent);transform:skewX(-20deg);transition:left .6s ease;pointer-events:none}
.dp-pill:hover::after{left:130%}
.dp-pill+.dp-pill{margin-top:12px}
.dp-pill:hover{background:rgba(255,255,255,.2);border-color:transparent;box-shadow:inset 0 0 0 2px #af50ff,inset 1px 1px 0 1px rgba(255,255,255,.6),inset -1px -1px 0 1px rgba(255,255,255,.35)}
.dp-pill.big{height:64px;font-size:clamp(18px,2.6vw,28px);width:auto;min-width:min(100%,300px)}
.fx-mag{display:inline-block;max-width:100%;transition:transform .25s cubic-bezier(.2,.8,.2,1)}

/* ===== ĐOẠN CHỮ SÁNG DẦN THEO CUỘN ===== */
.fx-sw{position:relative;height:240vh;height:240svh}
.fx-sw-in{position:sticky;top:0;height:100vh;height:100svh;display:flex;align-items:center}
.fx-sw-p{max-width:1000px;margin:0 auto;padding:0 clamp(20px,5vw,72px);font-weight:500;font-size:clamp(30px,6.4vw,72px);line-height:1.12;letter-spacing:-.035em}
.fx-sw-p span{opacity:.16;transition:opacity .3s ease}
.fx-sw-p span.on{opacity:1}

/* ===== TIÊU ĐỀ HIỆN TỪNG CHỮ ===== */
.fx-w{display:inline-block;opacity:0;transform:translateY(.6em);transition:opacity .7s ease,transform .7s cubic-bezier(.2,.8,.2,1);transition-delay:calc(var(--i) * 60ms)}
.fx-split.in .fx-w{opacity:1;transform:none}

/* chỉ máy tính (có chuột) mới dùng hiệu ứng làm mờ */
@media(hover:hover) and (pointer:fine){
  .dp-rv{filter:blur(8px);transition:opacity .9s ease,transform .9s cubic-bezier(.2,.8,.2,1),filter .9s ease}
  .dp-rv.in{filter:none}
  .fx-w{filter:blur(12px);transition:opacity .8s ease,transform .8s cubic-bezier(.2,.8,.2,1),filter .8s ease;transition-delay:calc(var(--i) * 70ms)}
  .fx-split.in .fx-w{filter:none}
  .dp-feature-glow{animation:fxPulse 6s ease-in-out infinite alternate}
  .dp-glow{animation:fxPulse 8s ease-in-out infinite alternate}
}

/* ===== CÁC BƯỚC ĐƯỢC GHIM (ONBOARDING) ===== */
.fx-pin{--n:3;position:relative;margin-top:clamp(40px,6vw,64px);height:calc(var(--n) * 90vh);height:calc(var(--n) * 90svh)}
.fx-pin-in{position:sticky;top:0;height:100vh;height:100svh;display:flex;flex-direction:column;justify-content:center;gap:20px;padding-top:64px}
@media(min-width:900px){.fx-pin-in{display:grid;grid-template-columns:.8fr 1.2fr;gap:56px;align-items:center}}
.fx-pin-list{position:relative;display:flex;flex-wrap:wrap;gap:8px}
@media(min-width:900px){.fx-pin-list{flex-direction:column;flex-wrap:nowrap;gap:6px;padding-left:28px}.fx-track{display:block}}
.fx-track{display:none;position:absolute;left:0;top:0;bottom:0;width:2px;background:var(--line);border-radius:2px;overflow:hidden}
.fx-track i{display:block;height:100%;background:linear-gradient(#2fd3ff,#af50ff,#ff4fa3);transform-origin:top;transform:scaleY(0)}
.fx-step{display:flex;align-items:center;gap:12px;text-align:left;padding:10px 16px;border-radius:9999px;border:1px solid var(--line);color:var(--mut);transition:all .4s;font-size:15px}
.fx-step b{font:400 12px "Space Mono",ui-monospace,monospace}
@media(min-width:900px){.fx-step{border:0;border-radius:12px;padding:14px 0;font-size:clamp(24px,3vw,36px);font-weight:500;letter-spacing:-.02em;background:none}}
.fx-step.on{color:var(--paper);border-color:var(--vio);background:rgba(175,80,255,.12)}
@media(min-width:900px){.fx-step.on{background:none;transform:translateX(8px)}}
.fx-step.done{color:var(--paper);opacity:.55}
.fx-pin-card{position:relative;overflow:hidden;padding:clamp(24px,4vw,48px);min-height:300px;border-radius:28px;border:1px solid var(--line);background:var(--card);animation:fxCard .5s cubic-bezier(.2,.8,.2,1) both}
.fx-pin-card::before{content:"";position:absolute;width:70%;height:70%;right:-15%;top:-25%;border-radius:50%;background:radial-gradient(circle,rgba(175,80,255,.35),transparent 65%);z-index:0}
.fx-pin-card>*{position:relative;z-index:1}
.fx-pin-card>.fx-big{position:absolute;z-index:0;right:20px;top:-.1em;font-size:clamp(140px,28vw,280px);line-height:1;font-weight:700;color:var(--paper);opacity:.06;pointer-events:none}
.fx-pin-card .ico-wrap{width:64px;height:64px;border-radius:18px;display:grid;place-items:center;background:rgba(175,80,255,.15);color:var(--vio);margin-bottom:24px}
.fx-pin-card .fx-num{font-size:13px;color:var(--mut);text-transform:uppercase;margin-bottom:10px}
.fx-pin-card h3{font-weight:500;font-size:clamp(28px,4.4vw,48px);line-height:1.05;letter-spacing:-.03em}
.fx-pin-card p:last-child{margin-top:16px;font-size:clamp(16px,2vw,19px);line-height:1.6;color:var(--txt2);max-width:520px}
@keyframes fxCard{from{opacity:0;transform:translateY(24px) scale(.98)}}

/* 3 CỘT (mời bạn) */
.dp-trip{display:grid;gap:40px;margin-top:clamp(56px,9vw,96px)}
@media(min-width:900px){.dp-trip{grid-template-columns:repeat(3,1fr);gap:64px}}
.dp-trip .num{font-size:13px;color:var(--mut);margin-bottom:12px;text-transform:uppercase}
.dp-trip h3{font-weight:400;font-size:clamp(28px,4.4vw,48px);line-height:1;letter-spacing:-.02em}
.dp-trip p{margin-top:16px;font-size:17px;line-height:1.5;color:var(--txt2)}
.dp-cta-row{margin-top:48px;display:flex;flex-wrap:wrap;gap:16px;align-items:center}

/* ===== CHỮ CHẠY NGANG ===== */
.fx-marquee{margin-top:clamp(72px,12vw,160px);display:grid;gap:6px;overflow:hidden;padding:8px 0}
.fx-marquee+.dp-sec{padding-top:clamp(56px,8vw,100px)}
.fx-mq{overflow:hidden;white-space:nowrap}
.fx-mq-track{display:inline-flex;animation:fxMq 38s linear infinite;will-change:transform}
.fx-mq.rev .fx-mq-track{animation-direction:reverse;animation-duration:46s}
.fx-mq:hover .fx-mq-track{animation-play-state:paused}
.fx-mq-set{display:inline-flex;flex-shrink:0}
.fx-mq-set span{display:inline-flex;align-items:center;gap:.4em;padding-right:.4em;font-size:clamp(44px,9vw,120px);font-weight:500;letter-spacing:-.03em;line-height:1.1}
.fx-mq-set span.line{color:transparent;-webkit-text-stroke:1.5px var(--paper)}
.fx-mq-set span b{font-weight:400;font-size:.4em;color:var(--vio);-webkit-text-stroke:0}
@keyframes fxMq{to{transform:translateX(-50%)}}

/* ===== THÔNG TIN CHI TIẾT + FAQ ===== */
.dp-dgrid{display:grid;gap:20px;margin-top:clamp(40px,7vw,72px)}
@media(min-width:900px){.dp-dgrid{grid-template-columns:repeat(2,1fr)}}
.dp-dgrid>*{height:100%}
.fx-tilt{position:relative;height:100%;border-radius:20px;transition:transform .25s ease-out;transform-style:preserve-3d}
.fx-tilt::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .3s;background:radial-gradient(circle at var(--gx,50%) var(--gy,50%),rgba(175,80,255,.2),transparent 55%)}
.fx-tilt:hover::after{opacity:1}
.dp-dcard{height:100%;padding:28px;border-radius:20px;border:1px solid var(--line);background:var(--card);transition:border-color .3s}
.dp-dcard:hover{border-color:var(--vio)}
.dp-dcard h3{font-size:clamp(20px,2.6vw,26px);font-weight:500;margin-bottom:10px}
.dp-dcard p{font-size:16px;line-height:1.6;color:var(--txt2)}
.dp-faq-title{font-weight:500;font-size:clamp(26px,4vw,40px);letter-spacing:-.03em;margin-top:72px}
.dp-faq{max-width:820px;margin-top:24px;display:grid;gap:10px}
.dp-faq details{padding:18px 22px;border-radius:14px;border:1px solid var(--line);background:var(--card);transition:border-color .3s}
.dp-faq details[open]{border-color:var(--vio)}
.dp-faq summary{cursor:pointer;font-size:18px;font-weight:400;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:16px}
.dp-faq summary::-webkit-details-marker{display:none}
.dp-faq summary::after{content:"+";font-size:22px;color:var(--vio);flex-shrink:0}
.dp-faq details[open] summary::after{content:"–"}
.dp-faq details p{margin-top:12px;font-size:16px;line-height:1.6;color:var(--txt2)}
.dp-faq details[open]>p{animation:fxDrop .35s ease both}
@keyframes fxDrop{from{opacity:0;transform:translateY(-8px)}}

/* ===== TÍNH NĂNG MỚI (CREATOR) ===== */
.dp-feature-box{position:relative;background:var(--card);border:1px solid rgba(175,80,255,.3);border-radius:32px;padding:clamp(32px,6vw,64px);overflow:hidden;box-shadow:0 20px 80px rgba(0,0,0,.5)}
.dp-feature-glow{position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle at 50% 50%,rgba(175,80,255,.15) 0%,transparent 60%);pointer-events:none;z-index:1}
@keyframes fxPulse{from{opacity:.6}to{opacity:1}}
.dp-creator-showcase{display:grid;gap:48px;margin-top:48px;align-items:center}
@media(min-width:900px){.dp-creator-showcase{grid-template-columns:1fr 1fr}}
.dp-creator-text h3{font-size:clamp(24px,3vw,32px);font-weight:500;margin-bottom:16px}
.dp-creator-text p{font-size:18px;line-height:1.6;color:var(--txt2);margin-bottom:24px}
.dp-creator-perks{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:16px}
.dp-creator-perks li{display:flex;align-items:center;gap:12px;font-size:16px;color:var(--paper);background:var(--card);padding:16px;border-radius:12px;border:1px solid var(--line)}
.dp-creator-perks li svg{color:var(--vio);flex-shrink:0}
.fx-stag li{opacity:0;transform:translateX(-24px);transition:opacity .6s ease,transform .6s cubic-bezier(.2,.8,.2,1)}
.fx-stag.in li{opacity:1;transform:none}
.fx-stag li:nth-child(2){transition-delay:.12s}
.fx-stag li:nth-child(3){transition-delay:.24s}
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
.dp-float{margin-top:14px;margin-right:10px;animation:fxFloat 4s ease-in-out infinite alternate}
@keyframes fxFloat{from{translate:0 0}to{translate:0 -12px}}
@media(min-width:900px){.dp-float{position:absolute;margin:0;z-index:3}.dp-float.f1{right:-20px;top:70px}}

/* ===== XẾP HẠNG + ĐƠN ĐÃ DUYỆT ===== */
.dp-rail{display:flex;gap:24px;overflow-x:auto;scroll-snap-type:x mandatory;padding:6px max(20px,5vw) 24px;margin-top:48px;scrollbar-width:none}
.dp-rail::-webkit-scrollbar{display:none}
.fx-rise>*{opacity:0;transform:translateY(40px);transition:opacity .7s ease,transform .7s cubic-bezier(.2,.8,.2,1)}
.fx-rise.in>*{opacity:1;transform:none}
.fx-rise>*:nth-child(2){transition-delay:.1s}
.fx-rise>*:nth-child(3){transition-delay:.2s}
.fx-rise>*:nth-child(4){transition-delay:.3s}
.fx-rise>*:nth-child(5){transition-delay:.4s}
.fx-rise>*:nth-child(n+6){transition-delay:.5s}
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
.dp-row{display:flex;align-items:center;gap:16px;padding:16px 20px;border:1px solid var(--line);border-radius:12px;background:var(--card);transition:transform .3s,border-color .3s}
.dp-row:hover{transform:translateX(8px);border-color:var(--vio)}
.dp-row .rk{width:32px;color:var(--mut);font-size:14px}
.dp-row .nm{flex:1;font-size:18px;font-weight:400}
.dp-row .cn{font-size:15px;color:var(--cn)}
.dp-oc{flex:0 0 min(300px,78vw);scroll-snap-align:start;padding:24px;border-radius:12px;border:1px solid var(--line);background:var(--card);display:flex;flex-direction:column;gap:18px;transition:transform .3s,border-color .3s}
.dp-oc:hover{transform:translateY(-6px);border-color:var(--vio)}
.dp-oc .it{font-size:28px;line-height:1.15;font-weight:400;letter-spacing:-.01em}
.dp-oc .ft{display:flex;justify-content:space-between;align-items:center;font-size:14px;color:var(--mut)}
.dp-note{text-align:center;color:var(--mut);padding:32px 20px;font-size:16px}

/* ===== FOOTER ===== */
.dp-end{position:relative;overflow:hidden;margin-top:clamp(72px,12vw,160px);background:#090909;color:#f7f9fa;padding-bottom:24px}
.dp-glow{position:absolute;inset:0;background:radial-gradient(60% 55% at 10% 100%,rgba(175,80,255,.55),transparent 70%),radial-gradient(60% 55% at 92% 100%,rgba(40,100,210,.65),transparent 70%),radial-gradient(50% 40% at 50% 70%,rgba(210,80,150,.2),transparent 70%)}
.dp-grain{position:absolute;inset:0;opacity:.18;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
.dp-horizon{position:absolute;left:-30%;right:-30%;top:-60%;height:100%;border-radius:50%;background:#090909}
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
.dp-foot li a,.dp-foot li button{display:inline-block;padding:7px 0 4px;font-size:18px;font-weight:400;color:#fff;text-align:left;transition:transform .2s,color .2s}
.dp-foot li a:hover,.dp-foot li button:hover{transform:translateX(6px);color:#d4a0ff}
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
html:not(.dark) .dp .dp-oc,
html:not(.dark) .dp .dp-row,
html:not(.dark) .dp .fx-pin-card{box-shadow:0 4px 18px rgba(0,0,0,.05)}

/* ===== BẢN ĐIỆN THOẠI: đơn giản, không ghim, bỏ hiệu ứng nặng ===== */
.fx-sw-static{padding:clamp(72px,14vw,120px) 0}
.fx-sw-static .fx-sw-p span{opacity:1}
.fx-pin-static{display:grid;gap:16px;margin-top:32px}
.fx-pin-static .fx-pin-card{animation:none;min-height:0}
@media(hover:none){
  .dp-pill,.dp-badge,.dp-ticket{backdrop-filter:none;-webkit-backdrop-filter:none}
  .dp-ticket{background:rgba(20,20,30,.85);-webkit-mask:none;mask:none}
  .dp-pill::after{display:none}
  .dp-tk::before,.dp-tk::after{filter:blur(28px)}
  .dp-float{animation:none}
  .fx-mq-set span{font-size:clamp(40px,12vw,64px)}
}

/* ===== GIẢM CHUYỂN ĐỘNG (cài đặt của thiết bị) ===== */
@media(prefers-reduced-motion:reduce){
  .dp *{animation:none!important;transition:none!important}
  .dp-rv,.fx-fade,.fx-w,.fx-stag li,.fx-rise>*{opacity:1;transform:none;filter:none}
  .fx-sw-p span{opacity:1}
}
`;
