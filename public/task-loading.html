<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>Đang mở nhiệm vụ...</title>
  <style>
    html, body { height: 100%; margin: 0; }
    body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 18px;
      padding: 24px;
      box-sizing: border-box;
      background: #effbf7;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      color: #334155;
      text-align: center;
    }
    .spin {
      width: 52px;
      height: 52px;
      border: 5px solid #bbf7d0;
      border-top-color: #10b981;
      border-radius: 50%;
      animation: r 0.8s linear infinite;
    }
    @keyframes r { to { transform: rotate(360deg); } }
    h1 { margin: 0; font-size: 20px; font-weight: 800; }
    .bar {
      width: 100%;
      max-width: 260px;
      height: 8px;
      border-radius: 999px;
      background: #d1fae5;
      overflow: hidden;
    }
    .bar i {
      display: block;
      height: 100%;
      width: 0%;
      border-radius: 999px;
      background: linear-gradient(90deg, #10b981, #2dd4bf);
      transition: width 0.9s ease-out;
    }
    .steps {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
      text-align: left;
      font-size: 15px;
      color: #94a3b8;
    }
    .steps li {
      display: flex;
      align-items: center;
      gap: 10px;
      transition: color 0.3s;
    }
    .steps li .dot {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid #cbd5e1;
      box-sizing: border-box;
      display: grid;
      place-items: center;
      font-size: 11px;
      line-height: 1;
      color: #fff;
      transition: all 0.3s;
    }
    .steps li.active { color: #0f766e; font-weight: 700; }
    .steps li.active .dot { border-color: #10b981; border-top-color: transparent; animation: r 0.8s linear infinite; }
    .steps li.done { color: #334155; }
    .steps li.done .dot { background: #10b981; border-color: #10b981; animation: none; }
    .steps li.done .dot::after { content: "✓"; }
    .slow { margin: 0; min-height: 20px; font-size: 14px; color: #64748b; max-width: 280px; }
    @media (prefers-color-scheme: dark) {
      body { background: #0f172a; color: #e2e8f0; }
      .bar { background: #134e4a; }
      .steps li.active { color: #5eead4; }
      .steps li.done { color: #e2e8f0; }
      .slow { color: #94a3b8; }
    }
  </style>
</head>
<body>
  <div class="spin"></div>
  <h1>Đang chuẩn bị nhiệm vụ...</h1>
  <div class="bar"><i id="bar"></i></div>
  <ul class="steps" id="steps">
    <li><span class="dot"></span>Kiểm tra tài khoản</li>
    <li><span class="dot"></span>Tạo link nhiệm vụ</li>
    <li><span class="dot"></span>Mở nhiệm vụ cho bạn</li>
  </ul>
  <p class="slow" id="slow"></p>

  <script>
    (function () {
      var items = document.querySelectorAll("#steps li");
      var bar = document.getElementById("bar");
      var slow = document.getElementById("slow");

      function setStep(n) {
        for (var i = 0; i < items.length; i++) {
          items[i].className = i < n ? "done" : i === n ? "active" : "";
        }
      }

      // Thanh tiến độ chạy dần nhưng không bao giờ tới 100% khi chưa có link
      setStep(0);
      bar.style.width = "20%";
      setTimeout(function () { setStep(1); bar.style.width = "55%"; }, 900);
      setTimeout(function () { setStep(2); bar.style.width = "85%"; }, 2600);
      setTimeout(function () { bar.style.width = "92%"; }, 5000);
      setTimeout(function () {
        slow.textContent = "Nhà cung cấp phản hồi hơi chậm, bạn đợi thêm chút nhé...";
      }, 8000);
    })();
  </script>
</body>
</html>
