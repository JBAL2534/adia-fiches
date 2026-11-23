/* ADIA — barre de passage entre les documents d'une même intervention,
   et mise en mémoire des pages pour un usage sans internet.
   Chargé par la fiche d'intervention et ses documents (version du cabinet et version omnipratique).
   Les données de l'intervention sont déjà partagées (stockage local du navigateur) :
   on passe d'un document à l'autre dans la même fenêtre, sans revenir à la fiche. */
(function(){
  "use strict";
  var OMNI = /omnipratique/i.test(location.pathname) || /[?&]profil=omni\b/.test(location.search);
  var DOCS = OMNI ? [
    ["plan-omnipratique.html","Plan"],
    ["devis-omnipratique.html","Devis"],
    ["fiche-omnipratique.html","Intervention"],
    ["labo-omnipratique.html","Labo"],
    ["consignes-omnipratique.html","Consignes"],
    ["tracabilite-omnipratique.html","Traçabilité"]
  ] : [
    ["plan-de-traitement.html","Plan"],
    ["fiche-intervention.html","Intervention"],
    ["liaison-prothese.html","Liaison"],
    ["passeport-implantaire.html","Passeport"],
    ["tracabilite.html","Traçabilité"]
  ];
  // Omnipratique : la liaison implantaire et le passeport n'apparaissent que si des implants sont saisis.
  var avecImplants=false;
  if(OMNI){
    try{
      var h=JSON.parse(localStorage.getItem("adia-omni-handoff-v1")||"null");
      avecImplants=!!(h && h.implants && h.implants.length) || /passeport|liaison/i.test(location.pathname);
    }catch(e){}
    DOCS.push(["liaison-prothese.html?profil=omni","Liaison"]);
    DOCS.push(["passeport-implantaire.html?profil=omni","Passeport"]);
  }
  // La fiche prévient la barre dès qu'un implant est ajouté ou retiré.
  window.adiaNavPasseport=function(oui){
    avecImplants=!!oui;
    [].forEach.call(document.querySelectorAll("#adiaNav a[data-implants]"), function(a){ a.style.display=avecImplants?"":"none"; });
  };

  function poser(){
    if(document.getElementById("adiaNav")) return;
    var ici=(location.pathname.split("/").pop()||"index.html").toLowerCase();
    function page(h){ return h.split("?")[0]; }
    var st=document.createElement("style");
    st.textContent=
      "#adiaNav{position:sticky;top:0;z-index:90;display:flex;gap:6px;padding:6px 8px;background:#173a63;"
      +"font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.18)}"
      +"#adiaNav a{flex:1 1 0;min-width:0;min-height:44px;display:flex;align-items:center;justify-content:center;"
      +"padding:0 6px;border-radius:9px;color:#dbe7f5;text-decoration:none;font-size:15px;font-weight:600;"
      +"white-space:nowrap;overflow:hidden;text-overflow:ellipsis}"
      +"#adiaNav a:hover{background:rgba(255,255,255,.14);color:#fff}"
      +"#adiaNav a[aria-current=page]{background:#fff;color:#173a63}"
      +"@media (max-width:480px){#adiaNav{gap:3px;padding:5px 4px;overflow-x:auto}#adiaNav a{font-size:13px;padding:0 6px;flex:1 0 auto}}"
      +"@media print{#adiaNav{display:none !important}}";
    document.head.appendChild(st);
    var nav=document.createElement("nav");
    nav.id="adiaNav"; nav.className="noprint"; nav.setAttribute("aria-label","Documents de l'intervention");
    DOCS.forEach(function(d){
      var a=document.createElement("a"); a.href=d[0]; a.textContent=d[1];
      if(OMNI && (d[1]==="Passeport" || d[1]==="Liaison")){ a.setAttribute("data-implants","1"); if(!avecImplants) a.style.display="none"; }
      if(page(d[0])===ici){ a.setAttribute("aria-current","page"); a.addEventListener("click",function(e){ e.preventDefault(); }); }
      else a.addEventListener("click",function(){
        // la fiche d'intervention dépose ses données à jour avant de céder la place
        try{ if(window.adiaAvantNavigation) window.adiaAvantNavigation(); }catch(e){}
      });
      nav.appendChild(a);
    });
    document.body.insertBefore(nav, document.body.firstChild);
    // Petit écran : l'onglet en cours reste visible quand la barre défile de côté.
    try{ var cur=nav.querySelector("[aria-current]"); if(cur && nav.scrollWidth>nav.clientWidth) nav.scrollLeft=Math.max(0, cur.offsetLeft-(nav.clientWidth-cur.offsetWidth)/2); }catch(e){}
    // Plan de traitement : sa page est centrée autrement, la barre s'y fixe en haut de l'écran.
    if(getComputedStyle(document.body).display==="flex"){
      nav.style.position="fixed"; nav.style.top="0"; nav.style.left="0"; nav.style.right="0";
      document.body.style.paddingTop=nav.offsetHeight+"px";
    }
  }
  if(document.body) poser(); else document.addEventListener("DOMContentLoaded", poser);

  // Pages gardées en mémoire : après une première ouverture, tout fonctionne sans internet.
  if("serviceWorker" in navigator && /^https?:$/.test(location.protocol)){
    window.addEventListener("load", function(){ navigator.serviceWorker.register("sw.js").catch(function(){}); });
  }
})();
