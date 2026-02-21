import { cpSync, existsSync, mkdirSync } from "node:fs";

if (!existsSync("docs")) {
  mkdirSync("docs", { recursive: true });
}
if (!existsSync("docs/assets")) {
  mkdirSync("docs/assets", { recursive: true });
}

cpSync("src/index.html", "docs/index.html");
cpSync("src/styles.css", "docs/styles.css");
cpSync("src/assets", "docs/assets", { recursive: true });
