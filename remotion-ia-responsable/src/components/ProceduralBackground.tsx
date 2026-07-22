import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { THEME } from "../theme";

// Fond de secours genere sans image : degrade nuit + grille de "data" animee.
// Sert quand aucun asset (file/remote) n'est fourni pour la sequence, afin que
// le projet rende immediatement. Discret, dans l'esprit slate/cyan.
export const ProceduralBackground: React.FC<{ seed?: number }> = ({
  seed = 0,
}) => {
  const frame = useCurrentFrame();
  const drift = (frame + seed * 40) * 0.15;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 80% at 50% 30%, ${THEME.bg} 0%, ${THEME.bgDeep} 70%)`,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${THEME.accent}22 1px, transparent 1px), linear-gradient(90deg, ${THEME.accent}22 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
          backgroundPosition: `${drift}px ${drift * 0.6}px`,
          maskImage:
            "radial-gradient(80% 60% at 50% 45%, #000 0%, transparent 85%)",
          opacity: 0.5,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(40% 25% at 50% 22%, ${THEME.accent}22 0%, transparent 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};
