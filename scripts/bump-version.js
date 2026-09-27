import fs from "fs";
import path from "path";

const versionFile = path.join(process.cwd(), "public", "version.json");

// Đọc version hiện tại
const current = JSON.parse(fs.readFileSync(versionFile, "utf8"));
const parts = current.version.split(".").map(Number);
parts[2] += 1; // Tăng patch: 2.0.0 → 2.0.1

const newVersion = parts.join(".");
fs.writeFileSync(
  versionFile,
  JSON.stringify({ version: newVersion }, null, 2)
);

// ✅ Cập nhật luôn file VersionChecker.jsx
const checkerFile = path.join(
  process.cwd(),
  "src",
  "components",
  "VersionChecker.jsx"
);
let checkerContent = fs.readFileSync(checkerFile, "utf8");

checkerContent = checkerContent.replace(
  /const CURRENT_VERSION = "[^"]+"/,
  `const CURRENT_VERSION = "${newVersion}"`
);

fs.writeFileSync(checkerFile, checkerContent);

console.log(`📦 Bumped: ${current.version} → ${newVersion}`);
