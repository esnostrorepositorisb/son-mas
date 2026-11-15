// Son Mas: keeps the tool available without coverage. Online: fetches the newest version (5 s limit); offline: uses the saved copy.
var CACHE = "sonmas-8a5b61eeb5";
var FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", function(e){ e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); })); });
self.addEventListener("activate", function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener("fetch", function(e){
  var u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(new Promise(function(resolve){
    var done = false, cached = caches.match(e.request, {ignoreSearch:true}).then(function(r){ return r || caches.match("index.html"); });
    var t = setTimeout(function(){ cached.then(function(r){ if (r && !done){ done = true; resolve(r); } }); }, 5000);
    fetch(e.request).then(function(r){
      if (r && r.ok){ var copy = r.clone(); caches.open(CACHE).then(function(c){ c.put(e.request, copy); }); }
      clearTimeout(t); if (!done){ done = true; resolve(r); }
    }).catch(function(){ clearTimeout(t); cached.then(function(r){ if (!done){ done = true; resolve(r || Response.error()); } }); });
  }));
});
