/* ADIA — fonctions communes aux documents générés depuis la fiche d'intervention
   (passeport implantaire, traçabilité). La fiche de liaison garde son propre code.
   Aucune donnée ne quitte le poste : tout est lu dans le stockage local du navigateur. */
window.ADIA_FICHES = (function(){
  "use strict";
  var HANDOFF = "adia-fiches-handoff-v1";
  var MOIS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
  var JOURS = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];

  function load(){ try{ return JSON.parse(localStorage.getItem(HANDOFF)||"null"); }catch(e){ return null; } }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }
  function slug(s){ return String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^A-Za-z0-9]+/g,"_").replace(/^_+|_+$/g,""); }
  function p2(n){ return ("0"+n).slice(-2); }

  function parseDateFr(s){
    s = String(s||"");
    var m = s.match(/(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/);
    if(m){ var y=+m[3]; if(y<100) y+=2000; return new Date(y,+m[2]-1,+m[1]); }
    var iso = s.match(/(\d{4})-(\d{2})-(\d{2})/);
    if(iso) return new Date(+iso[1],+iso[2]-1,+iso[3]);
    var txt = s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/);
    if(txt){
      var noms = MOIS.map(function(x){ return x.normalize("NFD").replace(/[\u0300-\u036f]/g,""); });
      var i = noms.indexOf(txt[2]); if(i>=0) return new Date(+txt[3], i, +txt[1]);
    }
    return null;
  }
  function fmtLong(d){ return JOURS[d.getDay()]+" "+d.getDate()+" "+MOIS[d.getMonth()]+" "+d.getFullYear(); }
  function fmtCourt(d){ return p2(d.getDate())+"/"+p2(d.getMonth()+1)+"/"+d.getFullYear(); }
  function fmtJourCourt(d){ return JOURS[d.getDay()]+" "+fmtCourt(d); }
  function fmtIso(d){ return d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate()); }
  function arcade(dent){ var q=+String(dent)[0]; return (q===1||q===2)?"maxillaire":((q===3||q===4)?"mandibule":""); }
  function dentsOf(str){ return String(str||"").match(/\b[1-4][1-8]\b/g)||[]; }

  /* Ø, longueur, réf et lot depuis le texte libre « Ø × L / réf / lot » de la fiche. */
  function parseSpec(spec){
    var s = String(spec||"").replace(/,/g,".");
    var o = {d:null,l:null,ref:null,lot:null,plat:null};
    var xy = s.match(/(\d+(?:\.\d+)?)\s*[x×X]\s*(\d+(?:\.\d+)?)/);
    if(xy){ o.d=+xy[1]; o.l=+xy[2]; }
    var p = s.match(/\b(NP|RP|WP)\b/i); if(p) o.plat=p[1].toUpperCase();
    var ref = s.match(/r[ée]f\.?\s*:?\s*([0-9A-Z][0-9A-Z\-]{3,})/i); if(ref) o.ref=ref[1];
    var lot = s.match(/lot\s*:?\s*([0-9A-Z][0-9A-Z\-]{3,})/i); if(lot) o.lot=lot[1];
    return o;
  }

  /* Clé de rangement des saisies propres à un patient et une date (lots, étiquettes). */
  function cle(data){
    if(!data) return "";
    var d = parseDateFr(data.date);
    return [slug(data.dossier), slug(data.nom).toUpperCase(), slug(data.prenom), d?fmtIso(d):slug(data.date)].join("|");
  }

  function titreFichier(data, suffixe){
    var parts=[]; if(data&&data.dossier) parts.push(slug(data.dossier)); if(data&&data.nom) parts.push(slug(data.nom).toUpperCase());
    var d = data && parseDateFr(data.date); if(d) parts.push(fmtIso(d));
    parts.push(suffixe); return parts.join("_");
  }

  /* ---- sorties : Word, impression, dossier patient, passerelle ADIA ---- */
  function docHTML(titre){
    var css = document.querySelector("style").textContent;
    var body = document.getElementById("doc").cloneNode(true);
    body.querySelectorAll(".noprint").forEach(function(e){ e.remove(); });
    body.querySelectorAll("[contenteditable]").forEach(function(e){ e.removeAttribute("contenteditable"); });
    body.querySelectorAll("input[type=checkbox]").forEach(function(cb){ var s=document.createElement("span"); s.textContent=cb.checked?"☒ ":"☐ "; cb.parentNode.replaceChild(s,cb); });
    return '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>'+esc(titre)+'</title><style>'+css+' body{background:#fff} .page{padding:0}</style></head><body>'+body.innerHTML+'</body></html>';
  }
  function blobWord(titre){ return new Blob(["\ufeff"+docHTML(titre)],{type:"application/msword"}); }

  function idbOpen(){ return new Promise(function(res,rej){ var r=indexedDB.open("fiche-fs",1); r.onupgradeneeded=function(){ r.result.createObjectStore("h"); }; r.onsuccess=function(){res(r.result);}; r.onerror=function(){rej(r.error);}; }); }
  function idbGet(){ return idbOpen().then(function(db){ return new Promise(function(res){ var t=db.transaction("h","readonly").objectStore("h").get("dir"); t.onsuccess=function(){res(t.result||null);}; t.onerror=function(){res(null);}; }); }); }
  function idbPut(h){ return idbOpen().then(function(db){ return new Promise(function(res){ var t=db.transaction("h","readwrite").objectStore("h").put(h,"dir"); t.onsuccess=function(){res();}; t.onerror=function(){res();}; }); }); }
  async function resolveDir(){
    var h = await idbGet();
    if(h){ var p=await h.queryPermission({mode:"readwrite"}); if(p!=="granted"){ p=await h.requestPermission({mode:"readwrite"}); } if(p==="granted") return h; }
    h = await window.showDirectoryPicker({mode:"readwrite"}); await idbPut(h); return h;
  }

  /* Branche la barre d'actions. opts : { titre:function()->nom de fichier, dossier:function()->n° dossier, recharger:function() } */
  function barre(opts){
    var live = document.getElementById("live");
    function dire(t){ if(live) live.textContent=t; }
    var b;
    if((b=document.getElementById("print"))) b.addEventListener("click",function(){ window.print(); });
    if((b=document.getElementById("word"))) b.addEventListener("click",function(){
      var t=opts.titre(), a=document.createElement("a"); a.href=URL.createObjectURL(blobWord(t)); a.download=t+".doc";
      document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },500);
    });
    if((b=document.getElementById("reload")) && opts.recharger) b.addEventListener("click",function(){ opts.recharger(); });
    if((b=document.getElementById("savefolder")) && window.showDirectoryPicker){
      b.style.display="";
      b.addEventListener("click", async function(){
        try{
          var h=await resolveDir(); if(!h) return;
          var name=opts.titre()+".doc", fh=await h.getFileHandle(name,{create:true}), w=await fh.createWritable();
          await w.write(blobWord(opts.titre())); await w.close();
          dire("✓ Enregistré : "+name+" — dossier « "+(h.name||"choisi")+" ».");
        }catch(e){ if(e&&e.name==="AbortError") return; dire("Enregistrement impossible : "+((e&&e.message)||e)); }
      });
    }
    if((b=document.getElementById("classerAdia"))) b.addEventListener("click", async function(){
      var dossier=opts.dossier&&opts.dossier();
      if(!dossier){ dire("N° de dossier absent : renseignez-le dans la fiche d'intervention (Importer le patient ADIA)."); return; }
      var hosts=["http://127.0.0.1:8765/classer-fiche","http://localhost:8765/classer-fiche"], name=opts.titre()+".doc", blob=blobWord(opts.titre());
      for(var i=0;i<hosts.length;i++){
        try{
          var r=await fetch(hosts[i]+"?folder_id="+encodeURIComponent(dossier)+"&filename="+encodeURIComponent(name),{method:"POST",headers:{"Content-Type":"application/msword"},body:blob});
          if(!r.ok){ var e={}; try{ e=await r.json(); }catch(_){ } throw new Error(e.error||("Erreur passerelle (HTTP "+r.status+")")); }
          dire("✓ Classé dans le dossier du patient n° "+dossier+" : "+name); return;
        }catch(e){ if(i===hosts.length-1){ dire(/Failed to fetch|NetworkError|load failed/i.test(String(e&&e.message||e))?"Passerelle non trouvée. Lancez « ADIA - Passerelle logiciel » et cochez « Activer lien local ADIA ».":"Classement impossible : "+(e&&e.message||e)); } }
      }
    });
    return { dire:dire };
  }

  /* ---- lecture d'une étiquette GS1 (DataMatrix / code 128) saisie par une douchette ---- */
  var GS1_FIXE = {"00":18,"01":14,"02":14,"11":6,"13":6,"15":6,"17":6,"20":2};
  var GS1_VAR = ["10","21","22","240","241","30","37"];
  function dateGs1(v){
    if(!/^\d{6}$/.test(v)) return v;
    var aa=+v.slice(0,2), mm=v.slice(2,4), jj=v.slice(4,6);
    if(+mm<1||+mm>12) return v;
    return (jj==="00"?"":jj+"/")+mm+"/20"+p2(aa);
  }
  function lireGs1(brut){
    var s = String(brut||"").trim().replace(/^\](d2|C1|Q3|e0)/,"");
    var champs = {}, m;
    if(/\(\d{2,4}\)/.test(s)){
      var re=/\((\d{2,4})\)([^(]*)/g;
      while((m=re.exec(s))) champs[m[1]] = m[2].replace(/[\x1d\s]+$/,"");
    }else{
      if(!/^\x1d?0[012]\d{14}/.test(s) && !/^\x1d?(10|11|17|21)/.test(s)) return null;
      var i=0, garde=0;
      while(i<s.length && garde++<30){
        if(s[i]==="\x1d"){ i++; continue; }
        var ai2=s.substr(i,2), ai3=s.substr(i,3);
        if(GS1_FIXE[ai2]){ var n=GS1_FIXE[ai2]; champs[ai2]=s.substr(i+2,n); i+=2+n; continue; }
        var ai = GS1_VAR.indexOf(ai3)>=0 ? ai3 : (GS1_VAR.indexOf(ai2)>=0 ? ai2 : null);
        if(!ai) break;
        var fin=s.indexOf("\x1d", i+ai.length); if(fin<0) fin=s.length;
        champs[ai]=s.slice(i+ai.length, fin); i=fin;
      }
    }
    if(!champs["01"] && !champs["10"] && !champs["17"]) return null;
    var lignes=[];
    if(champs["240"]) lignes.push("REF "+champs["240"]);
    if(champs["01"]) lignes.push("GTIN "+champs["01"]);
    if(champs["10"]) lignes.push("LOT "+champs["10"]);
    if(champs["21"]) lignes.push("N° série "+champs["21"]);
    if(champs["11"]) lignes.push("Fabrication "+dateGs1(champs["11"]));
    if(champs["17"]) lignes.push("Péremption "+dateGs1(champs["17"]));
    return { champs:champs, lot:champs["10"]||"", lignes:lignes, texte:lignes.join("\n") };
  }

  return { HANDOFF:HANDOFF, MOIS:MOIS, JOURS:JOURS, load:load, esc:esc, slug:slug, parseDateFr:parseDateFr,
    fmtLong:fmtLong, fmtCourt:fmtCourt, fmtJourCourt:fmtJourCourt, arcade:arcade, dentsOf:dentsOf, parseSpec:parseSpec,
    cle:cle, titreFichier:titreFichier, barre:barre, lireGs1:lireGs1 };
})();
