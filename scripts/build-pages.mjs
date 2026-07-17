import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist-pages");
const entries = ["index.html", "styles.css", "app.js", "manifest.webmanifest", "sw.js", "data"];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const entry of entries) {
  await cp(resolve(root, entry), resolve(output, entry), { recursive: true });
}

await cp(resolve(root, "public", "og.png"), resolve(output, "og.png"));
await cp(resolve(root, "index.html"), resolve(output, "404.html"));
