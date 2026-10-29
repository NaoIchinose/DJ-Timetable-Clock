// DJブース時計 Service Worker: オフライン起動用。更新時は CACHE のバージョンを上げる
var CACHE='djclock-v1';
var CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(CORE)}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  var r=e.request;
  if(r.method!=='GET')return;
  var u=new URL(r.url);
  var ok=u.origin===location.origin||u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com';
  if(!ok)return;
  // キャッシュ優先 + 裏で更新(オフラインでも起動、オンラインなら次回起動で最新に)
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(function(hit){
    var net=fetch(r).then(function(res){
      if(res&&(res.ok||res.type==='opaque')){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(r,cp)})}
      return res;
    }).catch(function(){return hit});
    return hit||net;
  }));
});
