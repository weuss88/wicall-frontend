import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { THEME } from "../theme";

// Grain cinematographique leger, genere par SVG feTurbulence (aucun asset
// externe). La graine change a chaque frame -> vrai scintillement de grain.
export const FilmGrain: React.FC<{ opacity?: number }> = ({
  opacity = THEME.grain.opacity,
}) => {
  const frame = useCurrentFrame();
  // graine deterministe mais differente chaque frame
  const seed = Math.floor(random(`grain-${frame}`) * 1000);

  return (
    <AbsoluteFill
      style={{
        opacity,
        mixBlendMode: "overlay",
        pointerEvents: "none",
      }}
    >
      <svg width="100%" height="100%">
        <filter id={`grain-${frame}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency={THEME.grain.baseFrequency}
            numOctaves={2}
            seed={seed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter={`url(#grain-${frame})`}
        />
      </svg>
    </AbsoluteFill>
  );
};
