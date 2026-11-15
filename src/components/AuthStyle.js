// src/components/AuthStyle.js
export const AUTH_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,400;1,400&family=Space+Mono&display=swap');
.au{
  --bg:#090909;--fg:#f7f9fa;--mut:rgba(255,255,255,.58);--line:rgba(255,255,255,.16);
  --card:rgba(20,20,30,.72);--in:rgba(255,255,255,.06);
  --acc:#af50ff;--acc2:#6a5cff;--accfg:#d4a0ff;
  --warn-bg:rgba(245,158,11,.12);--warn-bd:rgba(245,158,11,.35);--warn-fg:#fcd34d;
  --bad-bg:rgba(244,63,94,.12);--bad-bd:rgba(244,63,94,.38);--bad-fg:#fda4af;
  position:relative;min-height:100vh;min-height:100svh;background:var(--bg);color:var(--fg);
  font-family:"Inter",Arial,sans-serif;font-weight:300;overflow-x:hidden;-webkit-font-smoothing:antialiased;
  transition:background .3s,color .3s
}
html:not(.dark) .au{
  --bg:#f4f5f9;--fg:#0f1115;--mut:rgba(15,17,21,.62);--line:rgba(15,17,21,.13);
  --card:#ffffff;--in:#f3f4f8;--accfg:#8a2be2;
  --warn-bg:#fffbeb;--warn-bd:#fcd34d;--warn-fg:#92400e;
  --bad-bg:#fff1f2;--bad-bd:#fda4af;--bad-fg:#be123c
}
.au *,.au *::before,.au *::after{box-sizing:border-box}
.au a{color:inherit;text-decoration:none}
.au button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;padding:0}
.au h1,.au h2,.au p,.au ul{margin:0}
.au-serif{font-family:"Playfair Display",Georgia,serif;font-style:italic;font-weight:400}

/* nền */
.au-bg{position:fixed;inset:0;z-index:0;pointer-events:none;
  background:radial-gradient(55% 50% at 10% 100%,rgba(175,80,255,.45),transparent 70%),
             radial-gradient(55% 50% at 96% 0%,rgba(40,100,210,.4),transparent 70%),
             radial-gradient(40% 35% at 55% 55%,rgba(210,80,150,.14),transparent 70%)}
html:not(.dark) .au-bg{opacity:.5}

/* thanh trên */
.au-top{position:absolute;top:0;left:0;right:0;z-index:3;display:flex;align-items:center;justify-content:space-between;padding:18px clamp(16px,5vw,72px)}
.au-wm{font-weight:700;font-size:15px;letter-spacing:.02em;white-space:nowrap}
.au-wm em{font-family:"Playfair Display",Georgia,serif;font-weight:400;font-size:16px;opacity:.85}
.au-top-r{display:flex;align-items:center;gap:8px}
.au-ghost{font:400 12px/1 "Inter",sans-serif;text-transform:uppercase;letter-spacing:.04em;padding:9px 12px;border-radius:8px;border:1px solid var(--line);color:var(--fg);transition:background .2s}
.au-ghost:hover{background:var(--in)}

/* bố cục */
.au-main{position:relative;z-index:1;max-width:1200px;margin:0 auto;min-height:100vh;min-height:100svh;display:grid;align-items:center;gap:48px;padding:84px clamp(16px,5vw,72px) 40px}
@media(min-width:960px){.au-main{grid-template-columns:1.05fr .95fr}}
.au-side{display:none}
@media(min-width:960px){.au-side{display:block;padding-right:24px}}
.au-eyebrow{font:400 12px/1 "Space Mono",ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--mut)}
.au-big{margin-top:18px;font-weight:500;font-size:clamp(44px,5.4vw,76px);line-height:1;letter-spacing:-.04em}
.au-big em{font-family:"Playfair Display",Georgia,serif;font-style:italic;font-weight:400;letter-spacing:-.02em;display:block;opacity:.7}
.au-perks{list-style:none;padding:0;margin-top:36px;display:grid;gap:14px}
.au-perks li{display:flex;align-items:center;gap:12px;font-size:17px;font-weight:400}
.au-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;background:var(--acc);box-shadow:0 0 12px var(--acc)}

/* thẻ */
.au-card{width:100%;max-width:480px;margin:0 auto;padding:clamp(24px,5vw,40px);border-radius:20px;background:var(--card);border:1px solid var(--line);box-shadow:0 20px 70px rgba(0,0,0,.35);animation:auUp .7s cubic-bezier(.2,.8,.2,1) both}
html:not(.dark) .au-card{box-shadow:0 20px 60px rgba(40,30,80,.1)}
@media(hover:hover) and (pointer:fine){.au-card{backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}}
.au-h1{font-weight:500;font-size:clamp(28px,4vw,34px);line-height:1.1;letter-spacing:-.03em}
.au-sub{margin-top:8px;color:var(--mut);font-size:15px;line-height:1.5;font-weight:400}
.au-body{margin-top:24px}
.au-foot{margin-top:26px;padding-top:20px;border-top:1px solid var(--line);text-align:center;font-size:14px;color:var(--mut);font-weight:400}
.au-link{color:var(--accfg);font-weight:600;text-decoration:underline;text-decoration-color:rgba(175,80,255,.4);text-underline-offset:3px}
.au-link:hover{text-decoration-color:currentColor}
@keyframes auUp{from{opacity:0;transform:translateY(24px)}}

/* form */
.au-form{display:grid;gap:16px}
.au-form>*{animation:auUp .6s cubic-bezier(.2,.8,.2,1) both}
.au-form>*:nth-child(2){animation-delay:.06s}
.au-form>*:nth-child(3){animation-delay:.12s}
.au-form>*:nth-child(4){animation-delay:.18s}
.au-form>*:nth-child(n+5){animation-delay:.24s}
.au-lab{display:flex;justify-content:space-between;align-items:center;font:500 13px/1 "Inter",sans-serif;color:var(--mut);margin-bottom:8px}
.au-inwrap{position:relative}
.au-ic{position:absolute;left:16px;top:50%;transform:translateY(-50%);display:flex;color:var(--mut);pointer-events:none}
.au-in{width:100%;height:54px;padding:0 16px 0 46px;border-radius:12px;border:1px solid var(--line);background:var(--in);color:var(--fg);font:400 16px "Inter",sans-serif;outline:0;transition:border-color .2s,box-shadow .2s}
.au-in::placeholder{color:var(--mut);opacity:.7}
.au-in:focus{border-color:var(--acc);box-shadow:0 0 0 4px rgba(175,80,255,.18)}
.au-in:disabled{opacity:.55;cursor:not-allowed}
.au-in.up{text-transform:uppercase;letter-spacing:.08em}
.au-in.gift{border-style:dashed}
.au-hint{font-size:13px;line-height:1.5;color:var(--mut);font-weight:400}
.au-check{display:flex;align-items:flex-start;gap:12px;font-size:14px;line-height:1.55;color:var(--mut);cursor:pointer;font-weight:400}
.au-check input{width:20px;height:20px;margin-top:2px;flex-shrink:0;accent-color:var(--acc)}
.au-center{text-align:center;font-size:13px;line-height:1.5;color:var(--mut);font-weight:400}

/* nút chính */
.au-btn{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;gap:10px;width:100%;height:56px;border-radius:14px;color:#fff;font:700 15px "Inter",sans-serif;background:linear-gradient(90deg,var(--acc),var(--acc2));box-shadow:0 10px 30px rgba(175,80,255,.35);transition:filter .2s,transform .1s,box-shadow .2s}
.au-btn::after{content:"";position:absolute;top:0;bottom:0;left:-60%;width:40%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.35),transparent);transform:skewX(-20deg);transition:left .6s ease;pointer-events:none}
@media(hover:hover){.au-btn:hover:not(:disabled)::after{left:130%}.au-btn:hover:not(:disabled){filter:brightness(1.1)}}
.au-btn:active:not(:disabled){transform:scale(.99)}
.au-btn:disabled{opacity:.5;cursor:not-allowed;box-shadow:none}
.au-btn2{display:flex;align-items:center;justify-content:center;width:100%;height:50px;border-radius:14px;border:1px solid var(--line);font:500 14px "Inter",sans-serif;color:var(--fg);transition:background .2s}
.au-btn2:hover:not(:disabled){background:var(--in)}
.au-btn2:disabled{opacity:.5;cursor:not-allowed}

/* ngăn cách + Google */
.au-or{display:flex;align-items:center;gap:12px;margin:22px 0;font:700 11px/1 "Inter",sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--mut)}
.au-or::before,.au-or::after{content:"";flex:1;height:1px;background:var(--line)}
.au-google{display:flex;justify-content:center;min-height:44px}
.au-google.off{pointer-events:none;opacity:.5}

/* thông báo */
.au-note{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border-radius:12px;border:1px solid var(--line);background:var(--in);color:var(--mut);font-size:13px;line-height:1.55;font-weight:400;margin-bottom:18px}
.au-form .au-note{margin:0}
.au-note-ic{margin-top:2px;flex-shrink:0;display:flex}
.au-note-bd{flex:1;min-width:0}
.au-note-t{font-weight:700;font-size:13px;color:inherit}
.au-note-p{margin-top:2px}
.au-note-t+.au-note-p{margin-top:4px}
.au-note.warn{background:var(--warn-bg);border-color:var(--warn-bd);color:var(--warn-fg)}
.au-note.bad{background:var(--bad-bg);border-color:var(--bad-bd);color:var(--bad-fg)}
.au-note.error{background:var(--bad-bg);border-color:var(--bad-bd);color:var(--bad-fg);font-weight:500}
.au-note.error .au-link,.au-note.bad .au-link{color:inherit}
.au-pre{white-space:pre-line}
.au-mini{margin-top:12px;display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:10px;font:700 12px/1 "Inter",sans-serif;color:#fff;background:#f59e0b;transition:filter .2s}
.au-note.bad .au-mini{background:#f43f5e}
.au-mini:hover{filter:brightness(1.08)}

/* màn đã gửi liên kết */
.au-sent{text-align:center;display:grid;gap:14px;justify-items:center;animation:auUp .6s cubic-bezier(.2,.8,.2,1) both}
.au-sent-ic{width:68px;height:68px;border-radius:20px;display:grid;place-items:center;background:rgba(175,80,255,.16);color:var(--accfg)}
.au-sent h2{font-weight:500;font-size:26px;letter-spacing:-.02em}
.au-sent .mail{font-weight:700;font-size:16px;word-break:break-all;color:var(--fg)}
.au-sent p{color:var(--mut);font-size:14px;line-height:1.6;font-weight:400;max-width:340px}
.au-sent .ok{color:var(--accfg)}
.au-sent .no{color:var(--bad-fg)}
.au-sent .au-btn2{margin-top:6px}
.au-sent .au-link{background:none;font-size:14px}

/* ===== SỬA LỖI: tràn ngang + bị reset đè ===== */
.au-main{grid-template-columns:minmax(0,1fr)}
@media(min-width:960px){.au-main{grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr)}}
.au-main>*{min-width:0}
.au-card{min-width:0}
.au-google{width:100%;overflow:hidden}
.au-h1{font-size:clamp(26px,7vw,34px)}

.au .au-btn{background:linear-gradient(90deg,var(--acc),var(--acc2));color:#fff}
.au .au-btn2{border:1px solid var(--line);color:var(--fg)}
.au .au-ghost{border:1px solid var(--line)}
.au .au-link{color:var(--accfg)}
.au .au-note.error .au-link,.au .au-note.bad .au-link{color:inherit}
.au .au-mini{color:#fff;background:#f59e0b}
.au .au-note.bad .au-mini{background:#f43f5e}
.au .au-sent .au-link{background:none}

@media(prefers-reduced-motion:reduce){
  .au *{animation:none!important;transition:none!important}
}
`;
