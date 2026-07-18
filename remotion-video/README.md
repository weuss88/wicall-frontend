# Vidéo TikTok — « Qui régule vraiment l'IA ? » (Remotion)

Vidéo verticale **1080×1920 (9:16), 30 fps, ~58 s**, générée avec [Remotion](https://remotion.dev).

## Contenu

| Scène | Durée | Contenu |
|---|---|---|
| Hook | 0–5 s | « 3 régions, 3 façons de réguler l'IA » + drapeaux |
| Europe | 5–19 s | AI Act, pyramide des 4 niveaux de risque, usages interdits |
| États-Unis | 19–32 s | Cadre fédéral « SUPPRIMÉ », compteur de vitesse, dérégulation |
| Chine | 32–45 s | Régulation secteur par secteur, jauges contrôle/transparence |
| Classement + CTA | 45–58 s | Récap 1-2-3 + bouton « Abonne-toi » |

## Commandes

```bash
npm install          # Installer les dépendances
npm run studio       # Ouvrir Remotion Studio (préviz + timeline)
npm run render       # Rendu final → out/regulation-ia-tiktok.mp4
npm run render:preview  # Rendu rapide à 50 % → out/preview.mp4
```

## Structure

```
src/
├── index.js            # registerRoot
├── Root.jsx            # Composition "RegulationIA" (1080×1920@30fps)
├── Video.jsx           # Timeline des 5 séquences + progress bar
├── theme.js            # Couleurs & polices
├── components/
│   ├── UI.jsx          # Background, captions TikTok, badges, en-têtes
│   └── Flags.jsx       # Drapeaux UE / USA / Chine en SVG pur
└── scenes/
    ├── Hook.jsx
    ├── Europe.jsx
    ├── USA.jsx
    ├── China.jsx
    └── Recap.jsx
```

Aucun asset externe : drapeaux et icônes sont en SVG inline, le rendu
fonctionne donc hors ligne et en headless.

Note : `remotion.config.js` pointe vers le Chromium préinstallé de
l'environnement de rendu distant (`/opt/pw-browsers/...`). En local,
supprimer la ligne `setBrowserExecutable` pour laisser Remotion
télécharger son propre navigateur.

## Conseils publication TikTok

- Ajouter une voix off (le texte des captions est déjà calé dessus) ou
  un son tendance en fond.
- Sous-titres déjà incrustés → utilisable sans le son.
- Hashtags suggérés : #ia #intelligenceartificielle #geopolitique #aiact #tech
