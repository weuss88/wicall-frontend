# IA Responsable — vidéo documentaire (Remotion)

Vidéo verticale **1080×1920 · 30 fps · 70 s** pour TikTok / Reels, style
documentaire Netflix : étalonnage sombre slate/bleu nuit, accent cyan,
grain cinématographique, vignettage, mouvement Ken Burns, crossfades,
typographie Bricolage Grotesque + Inter, sources incrustées en permanence.

> ⚠️ **Projet isolé** : ce dossier a son propre `package.json` et n'a aucun
> lien avec l'application WiCall du dépôt parent. Tu peux le déplacer ailleurs
> tel quel.

## Démarrer

```bash
cd remotion-ia-responsable
npm install
npm start          # ouvre le Remotion Studio (preview interactive)
```

Le projet **rend immédiatement** même sans aucune image : chaque séquence
affiche un fond procédural (dégradé nuit + grille) tant que tu n'as pas fourni
de visuel.

## Ajouter de vraies images de fond

**Option A — API Pexels (automatique)**

```bash
cp .env.example .env
# colle ta clé gratuite (https://www.pexels.com/api/) dans .env
npm run fetch-assets
```

Puis renseigne les chemins dans `src/assets.ts` :

```ts
Accroche: { file: "assets/accroche.jpg", ken: { from: 1, to: 1.14, panY: -3 } },
```

**Option B — fichiers locaux (Unsplash / Pixabay / tes propres plans)**

Dépose tes fichiers dans `public/assets/` et référence-les de la même façon.

> Jamais de visage humain généré par IA ni de deepfake. Privilégie villes,
> cartes, hémicycles, architecture institutionnelle, data centers, code.

## Sources éditoriales

Toutes les incrustations « Source : … » sont centralisées dans
`src/sources.ts`. **Vérifie et mets à jour chaque référence avant publication**
(la réglementation IA évolue vite).

## Rendu (export)

```bash
npm run render        # 1080×1920 (résolution native)
npm run render:4k     # ×2  → 2160×3840
npm run render:8k     # ×4  → 4320×7680  (exige une machine puissante)
```

Le 4K est confortable sur une machine standard. Le 8K quadruple la charge
mémoire/GPU : à tester selon ton device (on ajuste `--scale` / `--concurrency`
ensemble si besoin).

## Structure

```
src/
├── index.ts              # registerRoot
├── Root.tsx              # <Composition> VideoUn (durée calculée)
├── VideoUn.tsx           # montage : TransitionSeries + crossfades + polices
├── timeline.ts           # durées des séquences, fps, dimensions
├── theme.ts              # charte couleurs + étalonnage
├── sources.ts            # registre des sources incrustées
├── assets.ts             # manifeste des fonds (+ réglages Ken Burns)
├── components/
│   ├── SceneShell.tsx        # coquille commune (fond+grade+grain+vignette+source)
│   ├── KenBurnsBackground.tsx
│   ├── ProceduralBackground.tsx
│   ├── FilmGrain.tsx
│   ├── Vignette.tsx
│   ├── SourceTag.tsx
│   └── AnimatedText.tsx
└── scenes/               # Accroche, BlocUE, BlocUSA, BlocChine,
                          # EffetBruxelles, Dilemme, Chute
```

## Modifier le texte

Chaque séquence est un fichier autonome dans `src/scenes/`. Le texte, les
délais d'apparition et les couleurs s'éditent directement là.
```
