// src/components/AuthStyle.js
export const AUTH_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;1,400&display=swap');

/* ===== màu: SÁNG mặc định, data-theme="dark" = TỐI (AuthShell quyết định theo sở thích người dùng) ===== */
.au{
  color-scheme:light;
  --bg:#f6f9f7;--fg:#0e1a14;--mut:#66746d;--line:#e0e8e3;
  --card:#ffffff;--in:#ffffff;--in2:#f1f5f3;
  --acc:#1ba575;--acc2:#0f8a5c;--accfg:#0d8f5f;--glow:rgba(22,160,107,.2);--grid:rgba(15,60,40,.05);
  --warn-bg:#fffbeb;--warn-bd:#fcd34d;--warn-fg:#92400e;
  --bad-bg:#fff1f2;--bad-bd:#fda4af;--bad-fg:#be123c;
  position:relative;min-height:100vh;min-height:100svh;background:var(--bg);color:var(--fg);
  font-family:"Inter",Arial,sans-serif;font-weight:400;font-size:14px;line-height:1.5;
  overflow-x:hidden;-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;
  transition:background .3s,color .3s
}
.au[data-theme="dark"]{
  color-scheme:dark;
  --bg:#07110d;--fg:#eaf5ef;--mut:#93a69c;--line:rgba(255,255,255,.12);
  --card:#0d1914;--in:rgba(255,255,255,.05);--in2:rgba(255,255,255,.08);
  --acc:#1fb882;--acc2:#12936a;--accfg:#4ee0a5;--glow:rgba(47,211,154,.16);--grid:rgba(255,255,255,.04);
  --warn-bg:rgba(245,158,11,.12);--warn-bd:rgba(245,158,11,.35);--warn-fg:#fcd34d;
  --bad-bg:rgba(244,63,94,.12);--bad-bd:rgba(244,63,94,.38);--bad-fg:#fda4af
}

/* reset độ ưu tiên thấp, không đè lên class bên dưới */
:where(.au) *,:where(.au) *::before,:where(.au) *::after{box-sizing:border-box}
:where(.au) a{color:inherit;text-decoration:none}
:where(.au) button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}
:where(.au) h1,:where(.au) h2,:where(.au) p,:where(.au) ul{margin:0}

/* nền: vầng xanh + lưới mờ */
.au-bg{position:fixed;inset:0;z-index:0;pointer-events:none;
  background:
    radial-gradient(60% 34% at 50% 10%,var(--glow),transparent 70%),
    radial-gradient(45% 26% at 0% 0%,var(--glow),transparent 70%),
    linear-gradient(var(--grid) 1px,transparent 1px) 0 0/44px 44px,
    linear-gradient(90deg,var(--grid) 1px,transparent 1px) 0 0/44px 44px}

/* bố cục */
.au-main{position:relative;z-index:1;width:100%;max-width:480px;margin:0 auto;min-height:100vh;min-height:100svh;display:flex;flex-direction:column;align-items:center;padding:14px 20px 36px}
.au-top{align-self:stretch;display:flex;justify-content:flex-end;gap:10px}
.au-tbtn{height:40px;min-width:40px;padding:0 12px;display:inline-flex;align-items:center;justify-content:center;gap:6px;border-radius:12px;border:1px solid var(--line);background:var(--in);color:var(--fg);transition:background .2s}
.au-tbtn:hover{background:var(--in2)}
.au-tbtn.theme{background:#fdf1cf;border-color:#f3d77c;color:#d99a00}
.au[data-theme="dark"] .au-tbtn.theme{background:rgba(255,200,60,.14);border-color:rgba(255,200,60,.4);color:#ffcf4a}
.au-flag{font-size:18px;line-height:1}
.au-lang{position:relative}
.au-menu{position:absolute;right:0;top:calc(100% + 8px);min-width:160px;padding:6px;border-radius:12px;background:var(--card);border:1px solid var(--line);box-shadow:0 14px 34px rgba(0,0,0,.14);z-index:10}
.au-mi{display:flex;align-items:center;gap:10px;width:100%;padding:9px 10px;border-radius:8px;text-align:left;font-size:14px}
.au-mi:hover{background:var(--in2)}
.au-mi.on{font-weight:700;color:var(--accfg)}

/* logo + dòng giới thiệu */
.au-brand{position:relative;isolation:isolate;margin-top:18px;text-align:center}
.au-brand::before{content:"";position:absolute;left:50%;top:36%;width:min(320px,90vw);height:100px;transform:translate(-50%,-50%);background:radial-gradient(closest-side,var(--glow),transparent);z-index:-1}
.au-logo{display:inline-block;font-weight:800;font-size:clamp(28px,8.4vw,34px);letter-spacing:-.03em;line-height:1.1}
.au-logo em{font-family:"Playfair Display",Georgia,serif;font-style:italic;font-weight:400;letter-spacing:-.01em;color:var(--accfg)}
.au-tag{margin:10px auto 0;max-width:300px;color:var(--mut);font-size:14px;line-height:1.5}

/* thẻ */
.au-card{position:relative;overflow:hidden;width:100%;min-width:0;margin-top:22px;padding:22px 22px 20px;border-radius:22px;border:1px solid var(--line);
  background:linear-gradient(180deg,rgba(22,160,107,.07),transparent 130px),var(--card);
  box-shadow:0 14px 40px rgba(15,60,40,.08);animation:auUp .6s cubic-bezier(.2,.8,.2,1) both}
.au[data-theme="dark"] .au-card{box-shadow:0 14px 50px rgba(0,0,0,.45)}
.au-card::before{content:"";position:absolute;top:0;left:14%;right:14%;height:2px;background:linear-gradient(90deg,transparent,var(--acc),transparent)}
.au-h1{font-weight:800;font-size:clamp(22px,6.6vw,26px);line-height:1.2;letter-spacing:-.02em}
.au-sub{margin-top:6px;color:var(--mut);font-size:14px;line-height:1.5}
.au-body{margin-top:20px}
.au-foot{margin-top:20px;padding-top:16px;border-top:1px solid var(--line);text-align:center;font-size:14px;color:var(--mut)}
.au-link{color:var(--accfg);font-weight:600;text-decoration:underline;text-decoration-color:rgba(22,160,107,.35);text-underline-offset:3px}
.au-link:hover{text-decoration-color:currentColor}
@keyframes auUp{from{opacity:0;transform:translateY(20px)}}

/* form */
.au-form{display:grid;gap:14px}
.au-form>*{animation:auUp .5s cubic-bezier(.2,.8,.2,1) both}
.au-form>*:nth-child(2){animation-delay:.05s}
.au-form>*:nth-child(3){animation-delay:.1s}
.au-form>*:nth-child(4){animation-delay:.15s}
.au-form>*:nth-child(n+5){animation-delay:.2s}
.au-lab{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:12px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--fg)}
.au-lab>span:nth-child(2){text-transform:none;letter-spacing:0;font-weight:500;font-size:12px;color:var(--mut)}
.au-inwrap{position:relative}
.au-ic{position:absolute;left:14px;top:50%;transform:translateY(-50%);display:flex;color:var(--mut);pointer-events:none}
.au-in{width:100%;height:44px;padding:0 14px 0 42px;border-radius:14px;border:1px solid var(--line);background:var(--in);color:var(--fg);font:400 14px "Inter",sans-serif;outline:0;transition:border-color .2s,box-shadow .2s}
.au-in::placeholder{color:var(--mut);opacity:.8}
.au-in:focus{border-color:var(--acc);box-shadow:0 0 0 3px rgba(22,160,107,.16)}
.au-in:disabled{opacity:.55;cursor:not-allowed}
.au-in.up{text-transform:uppercase;letter-spacing:.08em}
.au-in.gift{border-style:dashed}
.au-hint{font-size:13px;line-height:1.5;color:var(--mut)}
.au-check{display:flex;align-items:flex-start;gap:10px;font-size:14px;line-height:1.5;color:var(--mut);cursor:pointer}
.au-check input{width:18px;height:18px;margin-top:2px;flex-shrink:0;accent-color:var(--acc)}
.au-center{text-align:center;font-size:12.5px;line-height:1.5;color:var(--mut)}

/* nút chính (xanh lá) */
.au-btn{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:46px;border-radius:14px;color:#fff;font:700 15px "Inter",sans-serif;background:linear-gradient(180deg,var(--acc),var(--acc2));box-shadow:0 8px 20px rgba(22,160,107,.25);transition:filter .2s,transform .1s}
.au-btn::after{content:"";position:absolute;top:0;bottom:0;left:-60%;width:40%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.3),transparent);transform:skewX(-20deg);transition:left .6s ease;pointer-events:none}
@media(hover:hover){.au-btn:hover:not(:disabled)::after{left:130%}.au-btn:hover:not(:disabled){filter:brightness(1.07)}}
.au-btn:active:not(:disabled){transform:scale(.99)}
.au-btn:disabled{opacity:.5;cursor:not-allowed;box-shadow:none}
.au-btn2{display:flex;align-items:center;justify-content:center;width:100%;height:44px;border-radius:14px;border:1px solid var(--line);background:var(--in);font:600 14px "Inter",sans-serif;color:var(--fg);transition:background .2s}
.au-btn2:hover:not(:disabled){background:var(--in2)}
.au-btn2:disabled{opacity:.5;cursor:not-allowed}
.au-gbtn{gap:10px}

/* ngăn cách + Google */
.au-or{display:flex;align-items:center;gap:12px;margin:18px 0;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--mut)}
.au-or::before,.au-or::after{content:"";flex:1;height:1px;background:var(--line)}
.au-google{display:flex;justify-content:center;width:100%;min-height:40px;overflow:hidden;color-scheme:light}
.au-google.off{pointer-events:none;opacity:.5}

/* thông báo */
.au-note{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-radius:12px;border:1px solid var(--line);background:var(--in2);color:var(--mut);font-size:12.5px;line-height:1.5;margin-bottom:14px}
.au-form .au-note{margin:0}
.au-note-ic{margin-top:1px;flex-shrink:0;display:flex}
.au-note-bd{flex:1;min-width:0}
.au-note-t{font-weight:700;font-size:13px;color:inherit}
.au-note-p{margin-top:2px}
.au-note-t+.au-note-p{margin-top:3px}
.au-note.warn{background:var(--warn-bg);border-color:var(--warn-bd);color:var(--warn-fg)}
.au-note.bad{background:var(--bad-bg);border-color:var(--bad-bd);color:var(--bad-fg)}
.au-note.error{background:var(--bad-bg);border-color:var(--bad-bd);color:var(--bad-fg);font-weight:500}
.au-note.error .au-link,.au-note.bad .au-link{color:inherit}
.au-pre{white-space:pre-line}
.au-mini{margin-top:10px;display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;font:700 12px/1 "Inter",sans-serif;color:#fff;background:#f59e0b;transition:filter .2s}
.au-note.bad .au-mini{background:#f43f5e}
.au-mini:hover{filter:brightness(1.08)}

/* màn đã gửi liên kết */
.au-sent{text-align:center;display:grid;gap:12px;justify-items:center;animation:auUp .5s cubic-bezier(.2,.8,.2,1) both}
.au-sent-ic{width:60px;height:60px;border-radius:18px;display:grid;place-items:center;background:rgba(22,160,107,.14);color:var(--accfg)}
.au-sent h2{font-weight:800;font-size:22px;letter-spacing:-.02em}
.au-sent .mail{font-weight:700;font-size:15px;word-break:break-all;color:var(--fg)}
.au-sent p{color:var(--mut);font-size:13px;line-height:1.55;max-width:320px}
.au-sent .ok{color:var(--accfg)}
.au-sent .no{color:var(--bad-fg)}
.au-sent .au-btn2{margin-top:4px}

@media(prefers-reduced-motion:reduce){
  .au *{animation:none!important;transition:none!important}
}
`;
