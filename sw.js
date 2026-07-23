const CACHE_NAME = "kaoyan-war-room-v4";
const STATIC_SHELL = ["./styles.css", "./app.js", "./data/updates.js", "./manifest.webmanifest"];

function indexUrl() {
  return new URL("./index.html", self.registration.scope).toString();
}

async function withoutRedirectMetadata(response) {
  const contentType = response.headers.get("content-type") || "text/html; charset=utf-8";
  return new Response(await response.arrayBuffer(), {
    status: response.status,
    statusText: response.statusText,
    headers: {
      "content-type": contentType,
      "cache-control": "no-cache",
    },
  });
}

async function installShell() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.all(STATIC_SHELL.map(async (url) => {
    const response = await fetch(url, { cache: "reload" });
    if (!response.ok) throw new Error(`Unable to cache ${url}`);
    await cache.put(url, response);
  }));

  const response = await fetch(indexUrl(), { cache: "reload", redirect: "follow" });
  if (!response.ok) throw new Error("Unable to cache index.html");
  await cache.put(indexUrl(), await withoutRedirectMetadata(response));
}

self.addEventListener("install", (event) => {
  event.waitUntil(installShell());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))));
  self.clients.claim();
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) || new Response("Offline", { status: 503 });
  }
}

async function navigationFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request, { redirect: "follow" });
    if (!response.ok) throw new Error(`Navigation returned ${response.status}`);
    const safeResponse = await withoutRedirectMetadata(response);
    await cache.put(indexUrl(), safeResponse.clone());
    return safeResponse;
  } catch {
    return (await cache.match(indexUrl())) || new Response("Offline", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;
  event.respondWith(event.request.mode === "navigate" ? navigationFirst(event.request) : networkFirst(event.request));
});
