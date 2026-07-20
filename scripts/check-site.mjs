import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { validateFeed } from "./intel-core.mjs";

const baseUrl = new URL(process.argv[2] || "https://xinchenda.github.io/kaoyan-war-room/");
const execFileAsync = promisify(execFile);
const defaultHeaders = {
  "user-agent": "Mozilla/5.0 (compatible; KaoyanWarRoom/3.0; +https://github.com/xinchenda/kaoyan-war-room)",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function errorDetail(error) {
  return [error?.message, error?.cause?.code, error?.cause?.message].filter(Boolean).join(" | ") || String(error);
}

async function fetchWithRetries(url) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        cache: "no-store",
        headers: defaultHeaders,
        signal: AbortSignal.timeout(25000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await sleep(attempt * 700);
    }
  }
  throw lastError;
}

async function fetchWithCurl(url) {
  const { stdout } = await execFileAsync(
    "/usr/bin/curl",
    [
      "-4",
      "--fail",
      "--silent",
      "--show-error",
      "--location",
      "--connect-timeout",
      "12",
      "--max-time",
      "35",
      "--retry",
      "2",
      "--retry-all-errors",
      "--header",
      `accept: ${defaultHeaders.accept}`,
      "--user-agent",
      defaultHeaders["user-agent"],
      url.toString(),
    ],
    { maxBuffer: 8 * 1024 * 1024, timeout: 45000 },
  );
  return new Response(stdout, {
    headers: {
      "content-type": guessContentType(url.pathname),
    },
  });
}

function guessContentType(pathname) {
  if (pathname.endsWith(".json")) return "application/json; charset=utf-8";
  if (pathname.endsWith(".css")) return "text/css; charset=utf-8";
  if (pathname.endsWith(".js")) return "application/javascript; charset=utf-8";
  return "text/html; charset=utf-8";
}

async function fetchResponse(path, expectedType) {
  const url = new URL(path, baseUrl);
  let response;
  try {
    response = await fetchWithRetries(url);
  } catch (nativeError) {
    response = await fetchWithCurl(url).catch((curlError) => {
      throw new Error(`${url} failed: fetch ${errorDetail(nativeError)}; curl ${errorDetail(curlError)}`);
    });
  }
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
