// Charte visuelle centrale du documentaire "IA Responsable".
// Etalonnage sombre, dominante slate / bleu nuit + accent cyan.

export const THEME = {
  // Couleurs de base
  bg: "#0f172a", // slate 900 — fond nuit
  bgDeep: "#020617", // slate 950 — pour les vignettes / bords
  ink: "#e2e8f0", // slate 200 — texte principal
  inkMuted: "#94a3b8", // slate 400 — texte secondaire
  accent: "#22d3ee", // cyan 400 — highlights, titres cles
  accentDeep: "#0891b2", // cyan 700
  danger: "#f43f5e", // rose 500 — pour "dilemme" / alerte
  gold: "#fbbf24", // amber — accent chaud discret (USA)

  // Etalonnage (color grading) applique globalement sur les fonds
  grade: {
    // teinte bleu nuit posee par-dessus chaque image de fond
    tint: "#0f172a",
    tintOpacity: 0.55,
    // reglages filtres CSS
    brightness: 0.82,
    contrast: 1.12,
    saturate: 0.9,
  },

  // Grain cinematographique
  grain: {
    opacity: 0.06, // tres leger
    baseFrequency: 0.9,
  },

  // Vignettage
  vignette: {
    inner: "transparent",
    outer: "rgba(2,6,23,0.72)",
    innerStop: "38%",
    outerStop: "100%",
  },

  // Typographie (familles reelles chargees via @remotion/google-fonts)
  fonts: {
    title: '"Bricolage Grotesque"',
    body: '"Inter"',
  },
} as const;

// Fabrique une chaine de filtres CSS pour l'etalonnage sombre.
export const gradeFilter = () => {
  const { brightness, contrast, saturate } = THEME.grade;
  return `brightness(${brightness}) contrast(${contrast}) saturate(${saturate})`;
};
