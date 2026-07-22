import React from "react";
import { AnimatedText, Kicker } from "../components/AnimatedText";
import { SceneShell } from "../components/SceneShell";
import { ASSETS } from "../assets";
import { SOURCES } from "../sources";
import { THEME } from "../theme";

export const BlocUSA: React.FC = () => {
  return (
    <SceneShell asset={ASSETS.BlocUSA} source={SOURCES.nist.label} seed={3}>
      <Kicker delay={6}>Etats-Unis</Kicker>
      <AnimatedText
        delay={14}
        font="title"
        size={92}
        weight={800}
        color={THEME.gold}
      >
        La voie du marche
      </AnimatedText>
      <AnimatedText delay={40} size={46} color={THEME.ink} maxWidth={880}>
        Priorite a l'innovation et a la competitivite. Peu de loi federale
        contraignante, des cadres volontaires et des regles sectorielles.
      </AnimatedText>
      <AnimatedText delay={72} size={40} color={THEME.inkMuted} maxWidth={880}>
        Le risque se gere par des standards — non par l'interdiction.
      </AnimatedText>
    </SceneShell>
  );
};
