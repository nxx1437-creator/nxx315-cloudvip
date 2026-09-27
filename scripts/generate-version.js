import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";

const distDir = join(process.cwd(), "dist");
const publicDir = join(process.cwd(), "public");
const checkerFile = join(
  process.cwd(),
  "src",
  "components",
  "VersionChecker.jsx"
);

// Đảm bảo folder tồn tại
if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });
if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

// Tạo version mới
const version = {
  version: Date.now().toString(),
  buildTime: new Date().toISOString(),
};

const jsonContent = JSON.stringify(version, null, 2);

// 1. Ghi vào dist/version.json
writeFileSync(join(distDir, "version.json"), jsonContent, "utf-8");

// 2. Ghi luôn vào public/version.json (để dev cũng có)
writeFileSync(join(publicDir, "version.json"), jsonContent, "utf-8");

// 3. ✅ QUAN TRỌNG: Cập nhật VersionChecker.jsx để CURRENT_VERSION khớp
if (existsSync(checkerFile)) {
  let content = readFileSync(checkerFile, "utf-8");

  // Tìm và thay dòng const CURRENT_VERSION = "..."
  const before = content;
  content = content.replace(
    /const CURRENT_VERSION = "[^"]*"/,
    `const CURRENT_VERSION = "${version.version}"`
  );

  if (content !== before) {
    writeFileSync(checkerFile, content, "utf-8");
    console.log(`✅ Updated VersionChecker.jsx → ${version.version}`);
  } else {
    console.warn(
      "⚠️ Không tìm thấy dòng `const CURRENT_VERSION = \"...\"` trong VersionChecker.jsx"
    );
  }
} else {
  console.warn("⚠️ Không tìm thấy file VersionChecker.jsx");
}

console.log("📦 Generated version.json:", version);
