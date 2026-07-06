# Cahier des charges — Application « Cahier journal »

Application web personnelle pour organiser mes journées de classe (professeure des écoles, GS-CP double niveau). Ce document sert de référence pour construire le projet avec Claude Code.

> **À Claude Code :** lis ce fichier en entier, puis implémente le projet **jalon par jalon** (section « Feuille de route »). Reproduis fidèlement le design de la maquette de référence (`reference/maquette.html`) : mêmes couleurs, même typographie, même mise en page. Demande confirmation avant chaque nouveau jalon.

---

## 1. Objectif

Préparer chaque journée d'école dans une grille horaire, l'enregistrer date par date, et réutiliser des **modèles par jour de la semaine** (« tous les lundis, les mêmes matières »). Le tout imprimable en portrait et consultable sur PC comme sur téléphone.

## 2. Contraintes (non négociables)

- **Gratuit**, sans abonnement.
- **Aucune base de données externe** (pas de Supabase, Firebase, Postgres, etc.).
- **Fonctionne hors ligne** ; les données ne se perdent pas au rechargement.
- **Imprimable** en A4 portrait, sans l'interface.
- Utilisable au **doigt sur téléphone** comme à la souris sur PC.
- Hébergement sur **Vercel**.

## 3. Stack technique

- **Vite + React** (JavaScript, pas de TypeScript pour rester simple — mais tu peux proposer TS si tu l'estimes utile).
- **CSS** dans une feuille globale unique reprenant les variables CSS de la maquette (`--day-bg`, `--day-accent`, `--day-ink`, etc.). Pas de framework CSS.
- **Stockage local** via `idb-keyval` (IndexedDB, petite dépendance) — voir §7.
- **Synchro optionnelle** via un Gist GitHub privé — voir §7, étape 2. À n'implémenter qu'au jalon 6.
- Aucune autre dépendance sans me demander.

## 4. Arborescence cible

```
cahier-journal/
├── CAHIER-DES-CHARGES.md        ← ce fichier
├── reference/
│   └── maquette.html            ← maquette visuelle à reproduire
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx                  ← état global, sélection de date
    ├── styles.css               ← reprend les tokens de la maquette
    ├── data/
    │   └── defaults.js          ← couleurs + horaires par défaut (§6)
    ├── storage/
    │   ├── local.js             ← get/set via idb-keyval
    │   └── gist.js              ← synchro Gist (jalon 6, optionnel)
    ├── hooks/
    │   └── useJournal.js        ← chargement/sauvegarde auto par date
    └── components/
        ├── Toolbar.jsx          ← date, jours, simple/double, boutons
        ├── SettingsDrawer.jsx   ← couleurs, horaires, libellés niveaux
        ├── JournalSheet.jsx     ← en-tête + niveaux + tableau
        ├── HourRow.jsx
        ├── TeachingCell.jsx     ← Matière (gras, centré) / Objectif / Matériel
        ├── BandRow.jsx          ← Récréation / Pause méridienne
        └── NotesPanel.jsx
```

## 5. Modèle de données

Trois objets, tous stockés en local (et sérialisés en un seul JSON pour la synchro Gist).

### `settings`
```js
{
  levelMode: "double",                 // "double" | "single"
  levelLabels: { n1: "GS", n2: "CP" },
  school: { line1: "École Pierre Dumonteil", line2: "année 2025-2026" },
  dayColors: {                          // modifiable dans les paramètres
    lundi:    { bg: "#ECE4F7", accent: "#7C5CBF" },
    mardi:    { bg: "#DEEBF8", accent: "#3E7CB1" },
    mercredi: { bg: "#EFE9E2", accent: "#8A7E6E" },
    jeudi:    { bg: "#E2F1DE", accent: "#5AA45C" },
    vendredi: { bg: "#FBF3D3", accent: "#B79514" }
  },
  hours: [                              // ordre = ordre d'affichage
    { id: "h1", kind: "slot",  start: "8:30",  end: "9:00" },
    { id: "r1", kind: "break", label: "Récréation", start: "10:15", end: "10:50" },
    { id: "p1", kind: "break", label: "Pause méridienne", start: "11:25", end: "13:30" }
    // ...
  ]
}
```

### `templates` (un modèle par jour de la semaine)
```js
{
  lundi: {
    rows: {
      "h1": { n1: { matiere:"", objectif:"", materiel:"" },
              n2: { matiere:"", objectif:"", materiel:"" } }
      // une entrée par créneau "slot"
    },
    notes: ""
  }
  // mardi, jeudi, vendredi identiques ; mercredi = { notes: "" } seulement
}
```

### `entries` (ce qui a réellement été fait, par date)
```js
{
  "2026-03-05": {
    weekday: "jeudi",
    rows: { "h1": { n1:{...}, n2:{...} }, ... },
    notes: "",
    updatedAt: "2026-03-05T18:22:00.000Z"
  }
}
```
Clé de stockage local : une entrée par jour → `entry:2026-03-05`. Plus `settings` et `templates` sous leurs propres clés.

## 6. Valeurs par défaut (reprises de la maquette)

**Couleurs** : voir `dayColors` ci-dessus. Le texte des jours utilise l'`accent`.

**Horaires par défaut** (les 4 premières lignes du matin, puis récré, etc.) :
```
8:30-9:00 · 9:00-9:30 · 9:30-9:50 · 9:50-10:15
Récréation 10:15-10:50
10:50-11:25
Pause méridienne 11:25-13:30
13:30-14:00 · 14:00-14:40 · 14:40-15:15
Récréation 15:15-15:30
15:30-15:50 · 15:50-16:20
```

## 7. Couche stockage

### Étape 1 — Local (jalons 2 à 5)
- Interface commune dans `storage/local.js` : `getSettings/saveSettings`, `getTemplates/saveTemplates`, `getEntry(date)/saveEntry(date, data)`, `listEntries()`.
- Implémentation via `idb-keyval`.
- **Autosave** : à chaque frappe dans une case, on sauvegarde l'entrée de la date courante (debounce ~600 ms).
- **Export / Import** : bouton pour télécharger un `.json` (toutes les données) et un pour le réimporter → permet de passer du PC au téléphone à la main.

### Étape 2 — Synchro Gist (jalon 6, optionnel)
- Un **Gist GitHub privé** contient un seul fichier `cahier-journal.json` = `{ settings, templates, entries }`.
- Dans les paramètres, un champ pour coller un **token GitHub à portée « gist » uniquement** et l'id du Gist. Le token reste dans le navigateur (localStorage) — usage strictement personnel.
- Au chargement : `GET` du Gist → fusion. À la sauvegarde : `PATCH` du Gist (debounce). Stratégie **dernier écrit gagne**.
- Indicateur d'état : « synchronisé » / « hors ligne » / « erreur ».
- La même interface que `storage/local.js`, pour que le reste du code ne change pas.

> Garder l'app parfaitement fonctionnelle **sans** Gist : la synchro est une couche en plus, jamais un prérequis.

## 8. Fonctionnalités détaillées

1. **Sélecteur de date** → déduit le jour de la semaine, applique la couleur, charge l'entrée existante ou pré-remplit depuis le modèle du jour (avec mention discrète « pré-rempli depuis le modèle du lundi »).
2. **Pastilles jour** (Lun/Mar/Mer/Jeu/Ven) pour changer sans passer par le calendrier.
3. **Cellule d'enseignement** : **Matière en gras, centrée** en haut ; **Objectif** et **Matériel** en dessous (libellés à gauche). Matière laissée vide par défaut.
4. **Récréation** et **Pause méridienne** : bandeaux pleine largeur, texte centré verticalement, à la couleur du jour.
5. **Simple / double niveau** : bascule qui masque/affiche la 2ᵉ colonne. Libellés de niveau modifiables (ex. GS/CP).
6. **Paramètres** (panneau latéral) : couleur de chaque jour (fond + accent), édition des horaires (ajout/suppression/renommage de créneaux, marquage récré/pause), libellés de niveau, infos école.
7. **Mercredi** : pas de grille, seulement une grande zone de **notes** (préparation, réunions…).
8. **Modèles par jour** : bouton « Enregistrer comme modèle du {jour} » (copie le contenu courant dans `templates[jour]`) et « Charger le modèle du {jour} ».
9. **Notes** du jour sous la grille.
10. **Impression** : bouton qui déclenche `window.print()`. En portrait A4, l'interface (barre d'outils, panneau) est masquée. Si tout ne tient pas sur une page, autoriser la coupure naturelle ; prévoir une **option « recto = matin / verso = après-midi »** (saut de page avant l'après-midi).
11. **Export / Import** JSON (§7).

## 9. Qualité & accessibilité

- Responsive jusqu'au mobile (~360 px) : la grille reste lisible, les cases restent tapables.
- Focus clavier visible, `prefers-reduced-motion` respecté.
- Locale française (jours, mois, format de date).
- Pas de `localStorage`/`sessionStorage` pour les données volumineuses → IndexedDB via `idb-keyval` (le token Gist peut rester en `localStorage`).

## 10. Feuille de route (jalons)

- **Jalon 0** — Scaffold Vite + React, `styles.css` reprenant les tokens de la maquette, structure de fichiers.
- **Jalon 1** — Grille éditable statique + barre d'outils (date, jours, simple/double) + panneau Paramètres (couleurs, horaires, niveaux).
- **Jalon 2** — Stockage local (`idb-keyval`) : autosave par date, chargement au changement de date, export/import JSON.
- **Jalon 3** — Modèles par jour (enregistrer / charger / pré-remplissage).
- **Jalon 4** — Mode mercredi (notes seules).
- **Jalon 5** — Impression portrait propre + option recto/verso.
- **Jalon 6** *(optionnel)* — Synchro Gist.
- **Jalon 7** — Déploiement Vercel.

## 11. Installation & démarrage

Prérequis : Node.js ≥ 18 (LTS 20 ou 22 conseillé). Vérifier avec `node -v`.

```bash
# 1) Créer le projet
npm create vite@latest cahier-journal -- --template react
cd cahier-journal
npm install
npm install idb-keyval

# 2) Déposer ce fichier et la maquette
#    - CAHIER-DES-CHARGES.md  à la racine
#    - maquette.html          dans un dossier reference/

# 3) Lancer en développement
npm run dev        # http://localhost:5173
```

## 12. Déploiement Vercel

Vercel détecte automatiquement Vite (build `npm run build`, dossier de sortie `dist`).

- **Recommandé (via Git)** : pousser le dépôt sur GitHub, puis sur vercel.com → *Add New Project* → importer le dépôt → *Deploy*. Chaque `git push` redéploie.
- **Ou en ligne de commande** :
  ```bash
  npm i -g vercel
  vercel          # déploiement de prévisualisation
  vercel --prod   # mise en production
  ```
