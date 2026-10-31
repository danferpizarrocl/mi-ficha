/* Mi Ficha: funciona sin conexion. La pagina, el manifiesto y los iconos se piden primero a internet. */
var CACHE='mi-ficha-'+(new URL(self.location.href).searchParams.get('v')||'0');
var BASE=['./','./index.html','./manifest-v2.webmanifest','./icon-v2-192.png','./icon-v2-512.png','./maskable-v2-512.png','./apple-touch-icon-v2.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return Promise.all(BASE.map(function(u){return c.add(new Request(u,{cache:'reload'}))}))}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET')return;
  var url=new URL(req.url);
  if(url.origin!==location.origin)return;
  var isMeta=/\.(webmanifest|png)$/.test(url.pathname);
  if(isMeta){
    e.respondWith(fetch(req,{cache:'reload'}).then(function(r){if(r&&r.status===200){var cp=r.clone();caches.open(CACHE).then(function(c){c.put(req,cp)})}return r}).catch(function(){return caches.match(req)}));
    return;
  }
  e.respondWith(fetch(req,{cache:'no-cache'}).then(function(r){var cp=r.clone();caches.open(CACHE).then(function(c){c.put(req.mode==='navigate'?'./index.html':req,cp)});return r}).catch(function(){return caches.match(req).then(function(m){return m||caches.match('./index.html')})}));
});
