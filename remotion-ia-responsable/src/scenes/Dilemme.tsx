import React from "react";
import { AnimatedText, Kicker } from "../components/AnimatedText";
import { SceneShell } from "../components/SceneShell";
import { ASSETS } from "../assets";
import { SOURCES } from "../sources";
import { THEME } from "../theme";

export const Dilemme: React.FC = () => {
  return (
    <SceneShell asset={ASSETS.Dilemme} source={SOURCES.greenIa.label} seed={6}>
      <Kicker delay={6}>Le dilemme</Kicker>
      <AnimatedText
        delay={14}
        font="title"
        size={88}
        weight={800}
        color={THEME.danger}
      >
        Reguler sans etouffer
      </AnimatedText>
      <AnimatedText delay={42} size={46} color={THEME.ink} maxWidth={880}>
        Trop de regles freinent l'innovation. Trop peu laissent proliferer les
        risques : desinformation, biais, surveillance.
      </AnimatedText>
      <AnimatedText delay={78} size={42} color={THEME.accent} maxWidth={880}>
        Et un cout invisible : chaque requete, chaque modele consomme de
        l'energie. La gouvernance de l'IA est aussi une question ecologique.
      </AnimatedText>
    </SceneShell>
  );
};
