# CLAUDE.md

Repères pour travailler sur ce projet. La **spécification complète** est dans `CAHIER-DES-CHARGES.md` — s'y référer pour le détail des fonctionnalités, le modèle de données et les valeurs par défaut. Le **design à reproduire** est dans `reference/maquette.html`.

## Le projet en une phrase

Application web personnelle (professeure des écoles, GS-CP) pour préparer chaque journée de classe dans une grille horaire, l'enregistrer par date, réutiliser des modèles par jour de la semaine, et l'imprimer en portrait.

## Commandes

```bash
npm run dev       # développement (http://localhost:5173)
npm run build     # build de production (sortie : dist/)
npm run preview   # prévisualiser le build
```

## Stack & conventions de code

- **Vite + React** en **JavaScript** (pas de TypeScript sauf demande explicite).
- Composants **fonctionnels + hooks**. Un composant par fichier, nom en PascalCase.
- **CSS** dans une feuille globale `src/styles.css` utilisant les **variables CSS de la maquette** (`--day-bg`, `--day-accent`, `--day-ink`, `--paper`, `--ink`, etc.). Pas de framework CSS (pas de Tailwind, Bootstrap…).
- Stockage via **`idb-keyval`** (déjà installé). Aucune autre dépendance sans me demander d'abord.
- Interface et textes **en français**, locale `fr` pour les dates.
- Code lisible et simple avant tout : pas de sur-ingénierie, pas d'abstraction prématurée.

## Règles à ne jamais enfreindre

- **Aucune base de données externe** (pas de Supabase, Firebase, Postgres…). Les données vivent en local (IndexedDB).
- L'app doit **fonctionner hors ligne** et **sans la synchro Gist** : la synchro (jalon 6) est une couche optionnelle, jamais un prérequis.
- Ne pas utiliser `localStorage`/`sessionStorage` pour les données volumineuses (uniquement toléré pour le token Gist).
- **Reproduire fidèlement le design de la maquette** : couleurs, typographie (Quicksand + Nunito), mise en page, bandeaux récré/pause colorés, matière en gras centrée.
- **Impression** : A4 portrait, l'interface (barre d'outils, panneau paramètres) masquée via `@media print`.
- **Accessibilité** : focus clavier visible, `prefers-reduced-motion` respecté, cases tapables sur mobile (~360 px).

## Façon de travailler

- Avancer **un seul jalon à la fois** (feuille de route §10 du cahier des charges). À la fin d'un jalon : **s'arrêter, résumer ce qui a été fait, et attendre ma validation** avant le suivant. Ne pas anticiper les jalons non demandés.
- **Commits petits et fréquents**, messages clairs en français (ex. `feat: grille éditable (jalon 1)`).
- Avant d'ajouter une dépendance, un fichier de config ou de modifier l'architecture prévue : **me demander**.
- En cas de doute sur un choix produit (nommage, comportement) : proposer, ne pas trancher seul.

## Arborescence prévue

Voir §4 du cahier des charges. En résumé : `src/App.jsx` (état + date), `src/components/` (Toolbar, SettingsDrawer, JournalSheet, HourRow, TeachingCell, BandRow, NotesPanel), `src/storage/` (local.js puis gist.js), `src/hooks/useJournal.js`, `src/data/defaults.js`.

## Valeurs par défaut

Couleurs des jours et horaires par défaut : voir §6 du cahier des charges (à mettre dans `src/data/defaults.js`). Ne pas inventer d'autres valeurs.
