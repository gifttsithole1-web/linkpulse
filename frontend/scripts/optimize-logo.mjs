import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(
  root,
  "src",
  "Loggo",
  "ChatGPT Image Jun 4, 2026, 11_45_29 AM.png",
);
const outDir = path.join(root, "public", "brand");

await mkdir(outDir, { recursive: true });

const meta = await sharp(src).metadata();
const cropH = Math.round(meta.height * 0.42);

await sharp(src)
  .resize({ width: 400, withoutEnlargement: true })
  .webp({ quality: 82 })
  .toFile(path.join(outDir, "linkpulse-logo.webp"));

await sharp(src)
  .extract({ left: 0, top: 0, width: meta.width, height: cropH })
  .resize(144, 144, { fit: "cover", position: "top" })
  .webp({ quality: 82 })
  .toFile(path.join(outDir, "linkpulse-mark.webp"));

console.log("Wrote optimized logos to public/brand/");
