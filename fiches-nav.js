/* ADIA — barre de passage entre les documents d'une même intervention,
   et mise en mémoire des pages pour un usage sans internet.
   Chargé par la fiche d'intervention, la fiche de liaison, le passeport et la traçabilité.
   Les données de l'intervention sont déjà partagées (stockage local du navigateur) :
   on passe d'un document à l'autre dans la même fenêtre, sans revenir à la fiche. */
(function(){
  "use strict";
  var DOCS=[
    ["fiche-intervention.html","Intervention"],
    ["liaison-prothese.html","Liaison"],
    ["passeport-implantaire.html","Passeport"],
    ["tracabilite.html","Traçabilité"]
  ];

  function poser(){
    if(document.getElementById("adiaNav")) return;
    var ici=(location.pathname.split("/").pop()||"index.html").toLowerCase();
    var st=document.createElement("style");
    st.textContent=
      "#adiaNav{position:sticky;top:0;z-index:90;display:flex;gap:6px;padding:6px 8px;background:#173a63;"
      +"font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.18)}"
      +"#adiaNav a{flex:1 1 0;min-width:0;min-height:44px;display:flex;align-items:center;justify-content:center;"
      +"padding:0 6px;border-radius:9px;color:#dbe7f5;text-decoration:none;font-size:15px;font-weight:600;"
      +"white-space:nowrap;overflow:hidden;text-overflow:ellipsis}"
      +"#adiaNav a:hover{background:rgba(255,255,255,.14);color:#fff}"
      +"#adiaNav a[aria-current=page]{background:#fff;color:#173a63}"
      +"@media (max-width:480px){#adiaNav{gap:3px;padding:5px 4px}#adiaNav a{font-size:13px;padding:0 2px}}"
      +"@media print{#adiaNav{display:none !important}}";
    document.head.appendChild(st);
    var nav=document.createElement("nav");
    nav.id="adiaNav"; nav.className="noprint"; nav.setAttribute("aria-label","Documents de l'intervention");
    DOCS.forEach(function(d){
      var a=document.createElement("a"); a.href=d[0]; a.textContent=d[1];
      if(d[0]===ici){ a.setAttribute("aria-current","page"); a.addEventListener("click",function(e){ e.preventDefault(); }); }
      else a.addEventListener("click",function(){
        // la fiche d'intervention dépose ses données à jour avant de céder la place
        try{ if(window.adiaAvantNavigation) window.adiaAvantNavigation(); }catch(e){}
      });
      nav.appendChild(a);
    });
    document.body.insertBefore(nav, document.body.firstChild);
  }
  if(document.body) poser(); else document.addEventListener("DOMContentLoaded", poser);

  // Pages gardées en mémoire : après une première ouverture, tout fonctionne sans internet.
  if("serviceWorker" in navigator && /^https?:$/.test(location.protocol)){
    window.addEventListener("load", function(){ navigator.serviceWorker.register("sw.js").catch(function(){}); });
  }
})();
