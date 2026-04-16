const CACHE_NAME = "cimra-handbook-v13";
const APP_SHELL = [
  "/",
  "/index.html",
  "/offline.html",
  "/download.html",
  "/manifest.json",
  "/cimra-logo.jpg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const acceptHeader = event.request.headers.get("accept") || "";
  const isNavigationRequest = event.request.mode === "navigate" || acceptHeader.includes("text/html");
  const isSameOrigin = new URL(event.request.url).origin === self.location.origin;

  if (!isSameOrigin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (isNavigationRequest) {
          return (await caches.match("/offline.html")) || (await caches.match("/index.html"));
        }
        return new Response("Offline", { status: 503, statusText: "Offline" });
      })
  );
});
