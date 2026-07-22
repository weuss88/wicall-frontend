import React from "react";
import { AnimatedText, Kicker } from "../components/AnimatedText";
import { SceneShell } from "../components/SceneShell";
import { ASSETS } from "../assets";
import { SOURCES } from "../sources";
import { THEME } from "../theme";

export const BlocChine: React.FC = () => {
  return (
    <SceneShell
      asset={ASSETS.BlocChine}
      source={SOURCES.chinaGenAi.label}
      seed={4}
    >
      <Kicker delay={6}>Chine</Kicker>
      <AnimatedText
        delay={14}
        font="title"
        size={92}
        weight={800}
        color={THEME.danger}
      >
        La voie du controle
      </AnimatedText>
      <AnimatedText delay={40} size={46} color={THEME.ink} maxWidth={880}>
        L'IA generative est autorisee, mais alignee sur les valeurs de l'Etat :
        enregistrement des modeles, filtrage des contenus, responsabilite des
        fournisseurs.
      </AnimatedText>
      <AnimatedText delay={74} size={40} color={THEME.inkMuted} maxWidth={880}>
        Innover, oui — dans un cadre politique strict.
      </AnimatedText>
    </SceneShell>
  );
};
