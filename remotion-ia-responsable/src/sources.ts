// ============================================================================
// REGISTRE DES SOURCES EDITORIALES
// ----------------------------------------------------------------------------
// Rigueur editoriale NON negociable : chaque affirmation a l'ecran cite sa
// source ici, incrustee en permanence en bas de la sequence concernee.
//
// ⚠️  A VERIFIER AVANT PUBLICATION : les references ci-dessous sont des points
//     de depart credibles mais tu DOIS confirmer chaque libelle, article et
//     date par rapport a la version en vigueur au moment de la publication.
//     La reglementation IA evolue vite (revocations, amendements, entree en
//     application echelonnee de l'AI Act...). Ne publie rien sans relecture.
// ============================================================================

export type Source = {
  id: string;
  label: string; // texte affiche a l'ecran
};

export const SOURCES: Record<string, Source> = {
  aiActTransparence: {
    id: "aiActTransparence",
    label: "Source : AI Act — Reglement (UE) 2024/1689, Art. 50 (transparence)",
  },
  aiActRisque: {
    id: "aiActRisque",
    label: "Source : AI Act — approche par niveaux de risque (Titre III)",
  },
  aiActEntree: {
    id: "aiActEntree",
    label: "Source : AI Act — entree en application echelonnee 2025-2027",
  },
  usExecOrder: {
    id: "usExecOrder",
    label: "Source : approche US — cadre federal & directives sectorielles",
  },
  nist: {
    id: "nist",
    label: "Source : NIST AI Risk Management Framework (AI RMF 1.0)",
  },
  chinaGenAi: {
    id: "chinaGenAi",
    label:
      "Source : Chine — Mesures provisoires sur l'IA generative (CAC, 2023)",
  },
  brusselsEffect: {
    id: "brusselsEffect",
    label: 'Source : "effet Bruxelles" — A. Bradford, Columbia Law (2020)',
  },
  greenIa: {
    id: "greenIa",
    label: "Source : empreinte energetique de l'IA — rapports AIE / Ademe",
  },
  none: {
    id: "none",
    label: "",
  },
};
