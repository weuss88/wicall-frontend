// Configuration temporelle du montage.
// Format : vertical 1080x1920, 30 fps, ~70 s.
//
// Avec <TransitionSeries>, chaque crossfade "mange" `TRANSITION` frames de
// recouvrement. Duree finale = somme(scenes) - (nbScenes - 1) * TRANSITION.

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// Duree d'un fondu enchaine entre deux sequences (1 s).
export const TRANSITION = 30;

export type SceneId =
  | "Accroche"
  | "BlocUE"
  | "BlocUSA"
  | "BlocChine"
  | "EffetBruxelles"
  | "Dilemme"
  | "Chute";

// Duree de chaque sequence (en frames), recouvrement de transition INCLUS.
export const SCENE_DURATIONS: Record<SceneId, number> = {
  Accroche: 270, // 9 s
  BlocUE: 360, // 12 s
  BlocUSA: 330, // 11 s
  BlocChine: 330, // 11 s
  EffetBruxelles: 360, // 12 s
  Dilemme: 360, // 12 s
  Chute: 270, // 9 s
};

export const SCENE_ORDER: SceneId[] = [
  "Accroche",
  "BlocUE",
  "BlocUSA",
  "BlocChine",
  "EffetBruxelles",
  "Dilemme",
  "Chute",
];

// Duree totale de la composition, calculee automatiquement.
export const TOTAL_DURATION =
  SCENE_ORDER.reduce((sum, id) => sum + SCENE_DURATIONS[id], 0) -
  (SCENE_ORDER.length - 1) * TRANSITION;
// => 2280 - 6*30 = 2100 frames = 70 s exactement.
