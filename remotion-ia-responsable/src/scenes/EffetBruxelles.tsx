import React from "react";
import { AnimatedText, Kicker } from "../components/AnimatedText";
import { SceneShell } from "../components/SceneShell";
import { ASSETS } from "../assets";
import { SOURCES } from "../sources";
import { THEME } from "../theme";

export const EffetBruxelles: React.FC = () => {
  return (
    <SceneShell
      asset={ASSETS.EffetBruxelles}
      source={SOURCES.brusselsEffect.label}
      seed={5}
    >
      <Kicker delay={6}>L'effet Bruxelles</Kicker>
      <AnimatedText delay={14} font="title" size={88} weight={800} glow>
        Une norme qui s'exporte
      </AnimatedText>
      <AnimatedText delay={40} size={46} color={THEME.ink} maxWidth={880}>
        Pour vendre en Europe, il faut respecter les regles europeennes. Alors
        beaucoup d'entreprises les appliquent... partout.
      </AnimatedText>
      <AnimatedText delay={74} size={44} color={THEME.accent} maxWidth={880}>
        Le premier marche a legiferer devient, de fait, le standard mondial.
      </AnimatedText>
    </SceneShell>
  );
};
