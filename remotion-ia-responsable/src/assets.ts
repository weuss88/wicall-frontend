// ============================================================================
// MANIFESTE DES ASSETS DE FOND
// ----------------------------------------------------------------------------
// Chaque sequence peut afficher une vraie image/video libre de droits.
//
// COMMENT FOURNIR LES IMAGES (2 options) :
//
//  A) EN LOCAL (recommande pour un rendu stable) :
//     Depose tes fichiers dans  public/assets/  puis renseigne `file` ci-dessous.
//     Ex: public/assets/ue-parlement.jpg -> file: "assets/ue-parlement.jpg"
//     Remotion sert public/ a la racine : on y accede via staticFile("assets/...").
//
//  B) VIA API (Pexels / Unsplash / Pixabay) :
//     Lance `npm run fetch-assets` (voir scripts/fetch-assets.mjs) avec ta cle
//     API dans .env — il telecharge les images dans public/assets/ et tu n'as
//     plus qu'a renseigner `file`.
//     Tu peux aussi mettre une URL distante directe dans `remote` (le rendu
//     doit alors avoir acces au reseau).
//
//  Si NI `file` NI `remote` ne sont fournis, un fond procedural (degrade anime
//  + grille) est genere automatiquement : le projet rend donc des maintenant.
//
//  ⚠️  JAMAIS de visage humain genere par IA ni de deepfake. Choisis des plans
//     de villes, cartes, architecture institutionnelle, data centers, ecrans
//     de code, hemicycles vides, etc.
// ============================================================================

export type SceneAsset = {
  file?: string; // chemin relatif dans public/ (ex: "assets/xxx.jpg")
  remote?: string; // URL distante directe (fallback si pas de fichier local)
  credit?: string; // credit photographe/plateforme (bonne pratique)
  // Reglage du mouvement Ken Burns pour cette image :
  ken?: {
    from: number; // zoom de depart (1 = 100%)
    to: number; // zoom d'arrivee
    panX?: number; // deplacement horizontal en % de la largeur (-x..x)
    panY?: number; // deplacement vertical
  };
};

// Idees de recherche par sequence (mots-cles Pexels/Unsplash) en commentaire.
export const ASSETS: Record<string, SceneAsset> = {
  // "artificial intelligence", "server room dark", "code screen"
  Accroche: { ken: { from: 1.0, to: 1.14, panY: -3 } },

  // "european parliament", "brussels architecture", "eu flag night"
  BlocUE: { ken: { from: 1.12, to: 1.0, panX: 2 } },

  // "washington capitol", "white house night", "us capitol dome"
  BlocUSA: { ken: { from: 1.0, to: 1.12, panX: -3 } },

  // "beijing skyline night", "surveillance camera city", "shanghai"
  BlocChine: { ken: { from: 1.1, to: 1.0, panY: 3 } },

  // "world map dark", "connected globe", "network earth"
  EffetBruxelles: { ken: { from: 1.0, to: 1.18 } },

  // "data center servers", "scale balance", "circuit board macro"
  Dilemme: { ken: { from: 1.14, to: 1.0, panX: -2, panY: 2 } },

  // "sunrise city horizon", "green data center", "solar panels tech"
  Chute: { ken: { from: 1.0, to: 1.1, panY: -2 } },
};
