/* ============================================================
   references.js — Table de références prothétiques (La Clé du Sourire)
   ------------------------------------------------------------
   C'est LE fichier à modifier quand une référence change ou qu'un
   système est ajouté. Aucun code à toucher ailleurs.
   Source : fiches de liaison du cabinet (septembre 2026).
   ============================================================ */
window.ADIA_REFS = {

  /* Plateformes à connexion conique Nobel (Parallel CC, Replace CC,
     Active NP/RP/WP : mêmes composants prothétiques). */
  plateformes: {
    "NP": {
      libelle: "NP", couleur: "#f3b5c6", texte: "#7a1f3f",
      diametres_implant: [3.5],
      transfert: { titre: "Transfert d'empreinte fermé",
        lignes: [ { d: "Ø3,6", long: "36 538" }, { d: "Ø5", long: "36 539" } ] },
      scanbody: "IO 2B-A SA (ou IO 2B-A)",
      analogue: "36 697",
      locator_piliers: { "1.0": "02069", "2.0": "02070", "3.0": "02071", "4.0": "02072", "5.0": "02073", "6.0": "02074" }
    },
    "RP": {
      libelle: "RP", couleur: "#ffe66b", texte: "#5a4a00",
      diametres_implant: [4.3, 5.0],
      transfert: { titre: "Transfert d'empreinte fermé",
        lignes: [ { d: "Ø5", court: "36 543", long: "36 542" }, { d: "Ø3,6", court: "36 541", long: "36 540" } ] },
      scanbody: "IO 2B-B SA (ou IO 2B-B)",
      analogue: "36 698",
      locator_piliers: { "1.0": "02075", "2.0": "02076", "3.0": "02077", "4.0": "02078", "5.0": "02079", "6.0": "02080" }
    },
    "WP": {
      libelle: "WP", couleur: "#9dc3ff", texte: "#0f3b7a",
      diametres_implant: [5.5],
      transfert: { titre: "Transfert d'empreinte fermé",
        lignes: [ { d: "Ø5×9 (court)", court: "37 851" }, { d: "Ø5×13 (long)", long: "37 850" } ] },
      scanbody: "IO 2B-C SA",
      analogue: "37 879",
      locator_piliers: null   /* non renseigné sur les fiches du cabinet */
    },
    "3.0": {
      libelle: "Active 3.0", couleur: "#d9d9d9", texte: "#333",
      diametres_implant: [3.0],
      transfert: { titre: "Transfert d'empreinte fermé",
        lignes: [ { d: "Ø3,3", long: "36 801" }, { d: "Ø3,8", long: "36 803" } ] },
      scanbody: "IO 2B-D SA",
      analogue: "36 791",
      alerte: "ATTENTION SERRAGE 15 N",
      locator_piliers: null
    }
  },

  /* Multi-unit déjà en place : mêmes composants, droit ou angulé. */
  multiunit: {
    libelle: "Multi-unit (MUA)", couleur: "#cfe8d6", texte: "#1b5e34",
    transfert: { titre: "Transfert d'empreinte fermé sur MUA", lignes: [ { d: "MUA", ref: "29089" } ] },
    scanbody: "IO 2C-A",
    analogue: { unite: "38918", par5: "38919" }
  },

  /* Locator (Zest) : éléments communs à toutes les plateformes. */
  locator: {
    anneau: { libelle: "Locator® Male Processing Pkg (2/pkg)", ref: "08519-2" },
    transfert: { libelle: "Locator® Impression Coping (4/pkg)", ref: "08505" },
    analogue: { libelle: "Locator® Female Analog (4/pkg)", ref: "08530" },
    instrumentation: "Tournevis / clé Locator® (Core Tool)",
    hauteurs: ["1.0", "2.0", "3.0", "4.0", "5.0", "6.0"]
  },

  /* Longueurs de transfert fermé (rappel imprimé sur la fiche). */
  transfert_longueurs: "court = 9 mm · long = 13 mm",

  /* Délais avant l'étape prothétique, en mois. */
  delais_mois: { maxillaire: 6, mandibule: 3 },

  /* Comment reconnaître un système dans la fiche d'intervention. */
  systemes: {
    "NobelActive":   { famille: "conique", actif: true },
    "NobelParallel": { famille: "conique", actif: false },
    "NA":            { famille: "conique", actif: true },
    "Replace":       { famille: "conique", actif: false },
    "TBR":           { famille: "autre" },
    "Autre":         { famille: "autre" }
  },

  /* En-tête et pied de page du cabinet (repris des fiches papier). */
  cabinet: {
    praticien: "Docteur Jacques BITTON",
    qualite: "Chirurgien-dentiste",
    titre2: "Expert près la Cour d'Appel de BESANÇON",
    id: "ID : 25 4 00531 7",
    adresse: "4 rue Armand BLOCH · 25200 MONTBELIARD",
    tel: "03.81.98.61.70",
    mail: "secretariatdrbitton@orange.fr"
  }
};
