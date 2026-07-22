import React from "react";
import { AnimatedText, Kicker } from "../components/AnimatedText";
import { SceneShell } from "../components/SceneShell";
import { ASSETS } from "../assets";
import { SOURCES } from "../sources";
import { THEME } from "../theme";

export const BlocUE: React.FC = () => {
  return (
    <SceneShell
      asset={ASSETS.BlocUE}
      source={SOURCES.aiActRisque.label}
      seed={2}
    >
      <Kicker delay={6}>Union europeenne</Kicker>
      <AnimatedText delay={14} font="title" size={92} weight={800} glow>
        La voie du droit
      </AnimatedText>
      <AnimatedText delay={40} size={46} color={THEME.ink} maxWidth={880}>
        L'Europe encadre l'IA par le risque : plus un systeme est dangereux,
        plus les obligations sont lourdes — jusqu'a l'interdiction.
      </AnimatedText>
      <AnimatedText delay={72} size={40} color={THEME.accent} maxWidth={880}>
        Transparence obligatoire : un contenu genere par IA doit etre signale.
      </AnimatedText>
    </SceneShell>
  );
};
