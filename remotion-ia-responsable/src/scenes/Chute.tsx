import React from "react";
import { AnimatedText, Kicker } from "../components/AnimatedText";
import { SceneShell } from "../components/SceneShell";
import { ASSETS } from "../assets";
import { SOURCES } from "../sources";
import { THEME } from "../theme";

export const Chute: React.FC = () => {
  return (
    <SceneShell asset={ASSETS.Chute} source={SOURCES.none.label} seed={7}>
      <AnimatedText
        delay={10}
        font="title"
        size={96}
        weight={800}
        lineHeight={1.04}
        glow
      >
        L'IA responsable n'est pas une option.
      </AnimatedText>
      <AnimatedText delay={44} size={46} color={THEME.inkMuted} maxWidth={880}>
        C'est le choix de societe qui decidera a qui profite l'intelligence
        artificielle.
      </AnimatedText>
      <div style={{ height: 12 }} />
      <AnimatedText delay={78} size={40} weight={700} color={THEME.accent}>
        Abonne-toi — on decrypte la gouvernance de l'IA.
      </AnimatedText>
    </SceneShell>
  );
};
