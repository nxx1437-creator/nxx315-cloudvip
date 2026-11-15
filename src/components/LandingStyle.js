// src/components/LandingStyle.js
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,400;1,400&family=Space+Mono&display=swap');
.dp{--cv:#090909;--paper:#f7f9fa;--vio:#af50ff;--mut:rgba(255,255,255,.4);--rule:rgba(255,255,255,.25);background:var(--cv);color:var(--paper);font-family:"Inter",Arial,sans-serif;font-weight:300;min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased}
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
.dp-body{font-size:clamp(16px,2vw,20px);line-height:1.6;color:rgba(247,249,250,.78)}
.dp-rv{opacity:0;transform:translateY(24px);transition:opacity .8s ease,transform .8s ease}
.dp-rv.in{opacity:1;transform:none}

/* NAV */
.dp-nav{position:fixed;top:0;left:0;right:0;height:54px;z-index:20;display:flex;align-items:center;gap:16px;padding:0 clamp(14px,2vw,26px);border-bottom:.5px solid rgba(255,255,255,.4);background:rgba(9,9,9,.35);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.dp-wm{font-weight:700;font-size:14px;letter-spacing:.02em;white-space:nowrap}
.dp-wm .dp-serif{font-weight:400;font-size:15px;opacity:.85}
.dp-nav-links{display:none;margin-left:auto;gap:28px;padding-left:20px;border-left:.5px solid rgba(255,255,255,.4);height:100%;align-items:stretch}
.dp-nav-links button{font:400 12px/1 "Inter",sans-serif;text-transform:uppercase;opacity:.9;border-bottom:4px solid transparent}
.dp-nav-links button:hover{opacity:.75;border-bottom-color:rgba(255,255,255,.75)}
.dp-nav-actions{display:flex;gap:8px;margin-left:auto;align-items:center}
.dp-nbtn{font:400 12px/1 "Inter",sans-serif;text-transform:uppercase;height:32px;padding:0 14px;border-radius:4px;display:inline-flex;align-items:center;transition:background .15s}
.dp-nbtn.fill{background:rgba(255,255,255,.1)}
.dp-nbtn.fill:hover{background:rgba(255,255,255,.4)}
.dp-nbtn.line{border:.5px solid #fff}
.dp-nbtn.ghost{opacity:.7;padding:0 8px}
@media(min-width:900px){.dp-nav-links{display:flex}.dp-nav-actions{margin-left:0}}

/* HERO */
.dp-stage{position:relative;min-height:100svh;overflow:hidden;padding:96px 0 72px;display:flex;flex-direction:column;justify-content:center;background:linear-gradient(180deg,#0a1668 0%,#1d3bb0 34%,#5a4acf 60%,#c25fb8 86%,#f0a0c0 100%)}
.dp-sky{position:absolute;inset:0;pointer-events:none}
.dp-cloud{position:absolute;border-radius:50%;filter:blur(34px);opacity:.85;animation:dpDrift 26s ease-in-out infinite alternate}
.dp-cloud.c1{left:-15%;bottom:-8%;width:70%;height:36%;background:radial-gradient(closest-side,#ffd3e6,rgba(255,170,210,0))}
.dp-cloud.c2{right:-12%;bottom:4%;width:64%;height:40%;background:radial-gradient(closest-side,#e3b8ff,rgba(150,90,230,0));animation-duration:32s}
.dp-cloud.c3{left:20%;bottom:-14%;width:80%;height:30%;background:radial-gradient(closest-side,#fff,rgba(255,200,230,0));opacity:.7;animation-duration:38s}
.dp-cloud.c4{right:8%;top:14%;width:40%;height:22%;background:radial-gradient(closest-side,rgba(160,130,255,.6),rgba(80,60,200,0));animation-duration:30s}
.dp-halo{position:absolute;inset:0;background:radial-gradient(circle closest-corner at 10% 50%,#6c4bd6,rgba(0,0,0,0) 55%);opacity:.437}
.dp-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(6,12,60,.7),rgba(6,12,60,0) 62%),linear-gradient(0deg,#090909 0%,rgba(9,9,9,0) 24%)}
@keyframes dpDrift{from{transform:translateX(-3%)}to{transform:translateX(4%)}}
.dp-trail{position:absolute;left:0;top:46%;width:100%;pointer-events:none;opacity:.9}
.dp-trail svg{display:block;width:min(260px,52vw);height:18px;animation:dpFly 11s linear infinite}
@keyframes dpFly{from{transform:translateX(-30vw)}to{transform:translateX(105vw)}}
.dp-hero{position:relative;z-index:2;display:grid;gap:40px;align-items:center}
@media(min-width:900px){.dp-hero{grid-template-columns:1.1fr .9fr}}
.dp-h1{font-weight:500;font-size:clamp(46px,10.5vw,88px);line-height:.98;letter-spacing:-.03em}
.dp-h1 span{display:block}
.dp-h1 .dp-serif{letter-spacing:-.02em}
.dp-h1 .dim{opacity:.55}
.dp-hs{margin-top:24px;font-weight:700;font-size:clamp(20px,3vw,28px);line-height:1.2;letter-spacing:-.01em;max-width:320px}
.dp-watch{margin-top:20px;display:inline-flex;align-items:center;gap:20px;font-size:clamp(17px,2.4vw,22px)}
.dp-play{width:64px;height:64px;border:1px solid #fff;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:var(--vio);backdrop-filter:blur(7px);transition:background .1s}
.dp-watch:hover .dp-play{background:rgba(255,255,255,.12)}
.dp-tele{position:absolute;left:0;right:0;bottom:22px;z-index:2;display:flex;justify-content:space-between;font-size:13px;color:rgba(255,255,255,.7)}

/* TICKET (glass pass) */
.dp-ticket{position:relative;border-radius:20px;padding:24px 24px 28px 44px;background:rgba(255,255,255,.08);border-top:.5px solid rgba(255,255,255,.45);border-right:.5px solid rgba(255,255,255,.45);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);-webkit-mask:radial-gradient(circle 12px at 0 14%,#0000 98%,#000);mask:radial-gradient(circle 12px at 0 14%,#0000 98%,#000)}
.dp-ticket::before{content:"";position:absolute;left:20px;top:8%;bottom:8%;border-left:2px dotted rgba(255,255,255,.35)}
.dp-ticket .meta{font-size:12px;letter-spacing:.07em;text-transform:uppercase;color:rgba(255,255,255,.6);display:flex;justify-content:space-between;margin-bottom:14px}
.dp-vid{display:block;width:100%;aspect-ratio:16/9;border:0;border-radius:12px;background:#05050a;object-fit:cover}
.dp-vid-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;border:.5px dashed rgba(255,255,255,.45);background:rgba(5,5,20,.35);text-align:center;padding:12px}
.dp-vid-empty p{font-size:12px;color:rgba(255,255,255,.7)}
.dp-ticket h3{font-weight:400;font-size:clamp(24px,3.4vw,32px);line-height:1.2;margin:22px 0 6px}
.dp-ticket .note{font-size:15px;line-height:1.5;color:rgba(255,255,255,.75);margin-bottom:18px}
.dp-bars{display:none;position:absolute;right:12px;top:18px;bottom:18px;width:18px;opacity:.55}
@media(min-width:1100px){.dp-bars{display:block}.dp-ticket{padding-right:48px}}

/* GLASS PILL */
.dp-pill{display:flex;align-items:center;justify-content:center;gap:14px;height:56px;padding:0 28px;border-radius:9999px;background:rgba(237,195,196,.05);color:#fff;font-weight:300;font-size:clamp(17px,2.4vw,22px);border-top:.5px solid rgba(255,255,255,.25);border-right:.5px solid rgba(255,255,255,.5);border-bottom:.5px solid rgba(237,195,196,.25);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);transition:all .2s;width:100%}
.dp-pill+.dp-pill{margin-top:12px}
.dp-pill:hover{background:rgba(255,255,255,.1);border-color:transparent;box-shadow:inset 0 0 0 2px #af50ff,inset 1px 1px 0 1px rgba(255,255,255,.6),inset -1px -1px 0 1px rgba(255,255,255,.35)}
.dp-pill.big{height:64px;font-size:clamp(18px,2.6vw,28px);width:auto;min-width:min(100%,300px)}

/* SPLIT-FLAP BOARD */
.dp-board{margin-top:48px}
.dp-flap{display:block;width:100%;height:clamp(64px,11vw,100px);padding:1px;border-radius:8px;background:linear-gradient(rgba(255,255,255,.2),rgba(255,255,255,0));margin-bottom:16px;text-align:left}
.dp-flap-in{display:flex;align-items:center;justify-content:space-between;height:100%;padding:0 clamp(14px,3vw,32px);background:#0b0b0b;border-radius:7px;overflow:hidden}
.dp-fw{position:relative;display:inline-block;font:400 clamp(24px,6.4vw,73.6px)/.9 "Space Mono",monospace;letter-spacing:.2em;text-transform:uppercase;white-space:nowrap}
.dp-ft{display:inline-block;clip-path:inset(0 0 50% 0);transform-origin:50% 100%}
.dp-fb{position:absolute;left:0;top:0;display:inline-block;clip-path:inset(50% 0 0 0);transform:translateY(1px);transform-origin:50% 0}
.dp-fw::after{content:"";position:absolute;left:-4px;right:-4px;top:50%;height:2px;background:#0b0b0b;transform:translateY(-50%)}
.dp-fw span.o{color:transparent;-webkit-text-stroke:1px #f7f9fa}
.dp-farrow{width:clamp(22px,4vw,40px);height:auto;flex:none;opacity:.9}
.dp-flap.in .dp-ft{animation:dpFlapT .5s ease both}
.dp-flap.in .dp-fb{animation:dpFlapB .5s .25s ease both}
@keyframes dpFlapT{from{transform:rotateX(-90deg)}to{transform:rotateX(0)}}
@keyframes dpFlapB{from{transform:translateY(1px) rotateX(90deg)}to{transform:translateY(1px) rotateX(0)}}
.dp-flap:hover .dp-flap-in{background:#121018;box-shadow:inset 0 0 0 1px rgba(175,80,255,.7)}

/* FEATURE SCENE */
.dp-head{max-width:760px}
.dp-scene{position:relative;margin:clamp(40px,7vw,64px) auto 0;max-width:907px}
.dp-console{border:1px solid rgba(255,255,255,.25);border-radius:24px;overflow:hidden;background:#0d0d12}
.dp-cbar{display:flex;align-items:center;gap:8px;padding:12px 16px;background:rgba(175,80,255,.22);border-bottom:.5px solid rgba(175,80,255,.5)}
.dp-cbar i{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.4)}
.dp-url{margin-left:10px;flex:1;font-size:12px;opacity:.85;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dp-badge{display:inline-flex;align-items:center;padding:8px 14px;border-radius:8px;border-top:.5px solid #4d5da5;background:rgba(255,255,255,.07);backdrop-filter:blur(11px);font:400 12px/1 "Inter",sans-serif;text-transform:uppercase;letter-spacing:.04em}
.dp-cbody{padding:clamp(16px,3vw,32px);display:grid;gap:12px;min-height:240px}
.dp-crow{display:flex;align-items:center;gap:14px;padding:14px 16px;border:.5px solid rgba(255,255,255,.2);border-radius:12px;background:rgba(255,255,255,.04)}
.dp-line{flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,.12)}
.dp-chip{font:400 11px/1 "Inter",sans-serif;text-transform:uppercase;letter-spacing:.06em;padding:7px 10px;border-radius:6px}
.dp-chip.ok{background:#af50ff;color:#090909;font-weight:700}
.dp-chip.wait{border:.5px solid rgba(255,255,255,.5);color:rgba(255,255,255,.85)}
.dp-float{margin-top:14px;margin-right:10px}
@media(min-width:900px){.dp-float{position:absolute;margin:0}.dp-float.f1{right:-56px;top:70px}.dp-float.f2{left:-56px;bottom:56px}}
.dp-trip{display:grid;gap:40px;margin-top:clamp(56px,9vw,96px)}
@media(min-width:900px){.dp-trip{grid-template-columns:repeat(3,1fr);gap:64px}}
.dp-trip .num{font-size:13px;color:var(--mut);margin-bottom:12px}
.dp-trip h3{font-weight:400;font-size:clamp(28px,4.4vw,48px);line-height:1;letter-spacing:-.02em}
.dp-trip p{margin-top:16px;font-size:17px;line-height:1.5;color:rgba(247,249,250,.75)}
.dp-cta-row{margin-top:48px;display:flex;flex-wrap:wrap;gap:16px;align-items:center}

/* TICKET RAIL */
.dp-rail{display:flex;gap:24px;overflow-x:auto;scroll-snap-type:x mandatory;padding:6px max(20px,5vw) 24px;margin-top:48px;scrollbar-width:none}
.dp-rail::-webkit-scrollbar{display:none}
.dp-tk{position:relative;flex:0 0 min(423px,82vw);height:297px;border-radius:20px;overflow:hidden;scroll-snap-align:start;display:flex;flex-direction:column;justify-content:space-between;padding:22px 24px;background:#0f0f14;-webkit-mask:radial-gradient(circle 10px at 0 33%,#0000 98%,#000),radial-gradient(circle 10px at 100% 33%,#0000 98%,#000);-webkit-mask-composite:source-in;mask:radial-gradient(circle 10px at 0 33%,#0000 98%,#000),radial-gradient(circle 10px at 100% 33%,#0000 98%,#000);mask-composite:intersect}
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
.dp-row{display:flex;align-items:center;gap:16px;padding:16px 20px;border:.5px solid rgba(255,255,255,.25);border-radius:12px;background:rgba(255,255,255,.05)}
.dp-row .rk{width:32px;color:var(--mut);font-size:14px}
.dp-row .nm{flex:1;font-size:18px;font-weight:400}
.dp-row .cn{font-size:15px;color:#d4a0ff}
.dp-oc{flex:0 0 min(300px,78vw);scroll-snap-align:start;padding:24px;border-radius:12px;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.08);display:flex;flex-direction:column;gap:18px;transition:background .3s}
.dp-oc:hover{background:rgba(255,255,255,.13)}
.dp-oc .it{font-size:28px;line-height:1.15;font-weight:400;letter-spacing:-.01em}
.dp-oc .ft{display:flex;justify-content:space-between;align-items:center;font-size:14px;color:rgba(255,255,255,.65)}
.dp-note{text-align:center;color:var(--mut);padding:32px 20px;font-size:16px}

/* ENDING */
.dp-end{position:relative;overflow:hidden;margin-top:clamp(72px,12vw,160px);background:#090909;padding-bottom:24px}
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
.dp-foot li a,.dp-foot li button{display:inline-block;padding:7px 0 4px;font-size:18px;font-weight:400;color:#fff;text-align:left}
.dp-bottom{position:relative;margin-top:48px;padding-top:20px;border-top:1px solid rgba(255,255,255,.2);display:flex;flex-wrap:wrap;gap:12px 24px;justify-content:space-between;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.7)}
@media(prefers-reduced-motion:reduce){.dp *{animation:none!important;transition:none!important}.dp-rv{opacity:1;transform:none}}
`;
