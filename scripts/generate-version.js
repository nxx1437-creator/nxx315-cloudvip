import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const distDir = join(process.cwd(), "dist");

if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

const version = {
  version: Date.now().toString(),
  buildTime: new Date().toISOString(),
};

writeFileSync(
  join(distDir, "version.json"),
  JSON.stringify(version),
  "utf-8"
);

console.log(" Generated version.json:", version);
