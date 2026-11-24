/* 京都東京 7 日行程：離線快取
   - 行程頁（index.html）：先抓網路，沒網路才用快取 → 網站更新後打開就是新版
   - 圖片、字型、圖示：先用快取，背景再更新
   - 天氣等外部網址不快取 */
const CACHE = "tk7days-v6";
const PRECACHE = [
  "./", "./index.html", "./manifest.json",
  "./fonts/cinzel-latin-600-normal.woff2", "./fonts/cormorant-garamond-latin-700-italic.woff2",
  "./icons/app-icon.png", "./icons/apple-touch-icon.png", "./icons/favicon-16.png", "./icons/favicon-32.png", "./icons/icon-192.png", "./icons/icon-512.png",
  "./images/kyoto/city-kyoto.jpg", "./images/kyoto/city-tokyo.jpg",
  "./images/kyoto/day1-shimbashi.jpg", "./images/kyoto/day2-ginkgo.jpg", "./images/kyoto/day3-yasaka.jpg", "./images/kyoto/day4-tofukuji.jpg", "./images/kyoto/day5-sagano.jpg", "./images/kyoto/day6-kiyomizu.jpg", "./images/kyoto/day7-ninenzaka.jpg",
  "./images/kyoto/deco-corner-a.png", "./images/kyoto/deco-corner-b.png", "./images/kyoto/deco-corner-c.png", "./images/kyoto/deco-postcard.png", "./images/kyoto/deco-sprig.png",
  "./images/kyoto/food-kitsune-udon.jpg", "./images/kyoto/food-matcha-sweets.jpg", "./images/kyoto/food-tsukemono.jpg", "./images/kyoto/food-yudofu.jpg",
  "./images/kyoto/intro-bamboo.jpg", "./images/kyoto/intro-hanamikoji.jpg", "./images/kyoto/intro-hozugawa.jpg", "./images/kyoto/intro-inari.jpg", "./images/kyoto/intro-kimono.jpg", "./images/kyoto/intro-kinkakuji.jpg", "./images/kyoto/intro-kiyomizu.jpg", "./images/kyoto/intro-ninenzaka.jpg", "./images/kyoto/intro-shichimi.jpg", "./images/kyoto/intro-tofu.jpg", "./images/kyoto/intro-tofukuji.jpg", "./images/kyoto/intro-wagashi.jpg", "./images/kyoto/intro-yasaka.jpg",
  "./images/kyoto/souvenir-matcha-sweets.jpg", "./images/kyoto/souvenir-matcha.jpg", "./images/kyoto/souvenir-shichimi.jpg", "./images/kyoto/souvenir-yatsuhashi.jpg",
  "./maps/overview.svg", "./maps/day1.svg", "./maps/day2.svg", "./maps/day3.svg", "./maps/day4.svg", "./maps/day5.svg", "./maps/day6.svg",
  "./images/tokyo/intro-gotokuji.jpg", "./images/tokyo/intro-koami.jpg", "./images/tokyo/intro-ningyocho.jpg", "./images/tokyo/intro-todai.jpg"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(PRECACHE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const isPage = req.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith(".html");
  if (isPage) {
    e.respondWith(
      fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put("./index.html", copy)); return res; })
        .catch(() => caches.match("./index.html").then(r => r || caches.match("./")))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req).then(res => { if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; }).catch(() => hit);
      return hit || net;
    })
  );
});
