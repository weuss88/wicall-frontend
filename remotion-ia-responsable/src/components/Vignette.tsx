import React from "react";
import { AbsoluteFill } from "remotion";
import { THEME } from "../theme";

// Vignettage subtil : coins assombris pour concentrer le regard au centre.
export const Vignette: React.FC = () => {
  const { inner, outer, innerStop, outerStop } = THEME.vignette;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, ${inner} ${innerStop}, ${outer} ${outerStop})`,
        pointerEvents: "none",
      }}
    />
  );
};
