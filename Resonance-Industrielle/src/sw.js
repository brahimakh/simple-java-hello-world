// Offline cache for the installed game. Same-origin GET requests only; the game itself makes no network calls.
const CACHE='resonance-0.6.0';
const FILES=['./','index.html','app.js','style.css','onboarding.css','atelier.css','learning.css','effects.css','views.css','mobile.css','manifest.webmanifest','icon.svg','icon-maskable.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url);if(e.request.method!=='GET'||url.origin!==location.origin)return;
 // Network first so updates arrive, cache as the offline fallback.
 e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r;}).catch(()=>caches.match(e.request).then(r=>r??caches.match('index.html'))));
});
