import React from "react";
import { AnimatedText, Kicker } from "../components/AnimatedText";
import { SceneShell } from "../components/SceneShell";
import { ASSETS } from "../assets";
import { SOURCES } from "../sources";
import { THEME } from "../theme";

export const Accroche: React.FC = () => {
  return (
    <SceneShell asset={ASSETS.Accroche} source={SOURCES.none.label} seed={1}>
      <Kicker delay={6}>IA Responsable</Kicker>
      <AnimatedText
        delay={16}
        font="title"
        size={112}
        weight={800}
        lineHeight={1.02}
        color={THEME.ink}
      >
        Qui va <span style={{ color: THEME.accent }}>gouverner</span> l'IA ?
      </AnimatedText>
      <AnimatedText delay={40} size={44} color={THEME.inkMuted} maxWidth={820}>
        Trois puissances. Trois visions du pouvoir. Une seule technologie qui
        redessine deja les regles du monde.
      </AnimatedText>
    </SceneShell>
  );
};
