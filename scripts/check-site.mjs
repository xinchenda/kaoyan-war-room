import { validateFeed } from "./intel-core.mjs";

const baseUrl = new URL(process.argv[2] || "https://xinchenda.github.io/kaoyan-war-room/");

async function fetchResponse(path, expectedType) {
  const url = new URL(path, baseUrl);
  const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  const contentType = response.headers.get("content-type") || "";
  if (expectedType && !contentType.includes(expectedType)) throw new Error(`${url} returned unexpected content-type ${contentType}`);
  return response;
}

const index = await (await fetchResponse("./index.html", "text/html")).text();
for (const marker of ["410 考研冲刺台", "panel-intel", "data/updates.js", "app.js"]) {
  if (!index.includes(marker)) throw new Error(`index.html is missing ${marker}`);
}

const [app, styles, serviceWorker, feed] = await Promise.all([
  (await fetchResponse("./app.js", "javascript")).text(),
  (await fetchResponse("./styles.css", "text/css")).text(),
  (await fetchResponse("./sw.js", "javascript")).text(),
  (await fetchResponse("./data/updates.json", "application/json")).json(),
]);

if (!app.includes("renderIntel") || app.length < 20000) throw new Error("app.js is incomplete");
if (!styles.includes("health-chip") || styles.length < 10000) throw new Error("styles.css is incomplete");
if (!serviceWorker.includes("networkFirst")) throw new Error("service worker update strategy is missing");

const errors = validateFeed(feed);
const ageHours = (Date.now() - new Date(feed.generatedAt).getTime()) / 3600000;
if (ageHours > 48) errors.push(`live feed is ${ageHours.toFixed(1)} hours old`);
if (feed.health?.status !== "healthy") errors.push(`live feed health is ${feed.health?.status || "missing"}`);
if (errors.length) throw new Error(`Live site check failed:\n- ${errors.join("\n- ")}`);

console.log(`Live site healthy at ${baseUrl}: ${feed.admissions.length} admissions and ${feed.politics.length} politics items.`);
