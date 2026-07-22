import React from "react";
import { AbsoluteFill } from "remotion";
import { KenBurnsBackground } from "./KenBurnsBackground";
import { FilmGrain } from "./FilmGrain";
import { Vignette } from "./Vignette";
import { SourceTag } from "./SourceTag";
import type { SceneAsset } from "../assets";
import { THEME } from "../theme";

// Coquille commune a toutes les sequences : empile fond Ken Burns, etalonnage,
// contenu, vignettage, grain, puis l'incrustation de source permanente.
// L'ordre des calques est important (grain et vignette au-dessus du contenu).
export const SceneShell: React.FC<{
  asset: SceneAsset;
  source: string;
  seed?: number;
  children: React.ReactNode;
}> = ({ asset, source, seed = 0, children }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bgDeep }}>
      <KenBurnsBackground asset={asset} seed={seed} />

      {/* Zone de contenu : marges genereuses facon documentaire */}
      <AbsoluteFill
        style={{
          padding: "180px 72px 220px 72px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 28,
        }}
      >
        {children}
      </AbsoluteFill>

      <Vignette />
      <FilmGrain />
      <SourceTag label={source} />
    </AbsoluteFill>
  );
};
