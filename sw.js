/* ADIA Fiches — fonctionnement sans internet.
   Les pages sont gardées en mémoire sur le poste. Avec internet, on prend toujours
   la version en ligne (donc la plus récente) ; sans internet, ou si le réseau ne
   répond pas en 3 secondes, on sert la copie gardée. Aucune donnée de patient ici :
   seuls les fichiers de l'application sont concernés. */
var CACHE="adia-fiches-v11";
var FICHIERS=[
  "./","index.html",
  "fiche-intervention.html","plan-de-traitement.html","liaison-prothese.html",
  "passeport-implantaire.html","tracabilite.html",
  "fiche-omnipratique.html","plan-omnipratique.html","labo-omnipratique.html",
  "consignes-omnipratique.html","tracabilite-omnipratique.html",
  "fiches-commun.js","fiches-nav.js","references.js",
  "manifest.webmanifest","plan.webmanifest","omni.webmanifest","plan-omni.webmanifest",
  "icon-192.png","icon-512.png","logo-cds.png"
];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FICHIERS); }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(noms){
    return Promise.all(noms.filter(function(n){ return n!==CACHE; }).map(function(n){ return caches.delete(n); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener("fetch", function(e){
  var req=e.request;
  if(req.method!=="GET") return;
  var url=new URL(req.url);
  if(url.origin!==self.location.origin) return;       // passerelle locale, serveurs externes : on ne touche à rien

  var copie=function(){ return caches.match(req,{ignoreSearch:true}); };
  // « no-cache » : on redemande toujours au serveur si la page a changé, sans se fier à la mémoire du navigateur
  var reseau=fetch(req.url,{cache:"no-cache",credentials:"same-origin"}).then(function(rep){
    if(rep && rep.ok){ var double=rep.clone(); caches.open(CACHE).then(function(c){ c.put(url.origin+url.pathname, double); }); }
    return rep;
  });
  var attente=new Promise(function(res){ setTimeout(res, 3000); }).then(copie);

  e.respondWith(
    Promise.race([reseau.catch(function(){ return null; }), attente]).then(function(rep){
      if(rep) return rep;
      return copie().then(function(c){ return c || reseau; });
    })
  );
});
