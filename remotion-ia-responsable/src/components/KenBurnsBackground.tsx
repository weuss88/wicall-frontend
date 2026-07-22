import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { THEME, gradeFilter } from "../theme";
import type { SceneAsset } from "../assets";
import { ProceduralBackground } from "./ProceduralBackground";

// Fond d'une sequence : image reelle (locale ou distante) avec mouvement
// Ken Burns lent (zoom + pan discret), etalonnage sombre et calque de teinte.
// Si aucun asset n'est fourni -> ProceduralBackground.
export const KenBurnsBackground: React.FC<{
  asset: SceneAsset;
  seed?: number;
}> = ({ asset, seed = 0 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const ken = asset.ken ?? { from: 1.0, to: 1.12 };
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = interpolate(progress, [0, 1], [ken.from, ken.to]);
  const panX = interpolate(progress, [0, 1], [0, ken.panX ?? 0]);
  const panY = interpolate(progress, [0, 1], [0, ken.panY ?? 0]);

  const src = asset.file
    ? staticFile(asset.file)
    : asset.remote
      ? asset.remote
      : null;

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bgDeep, overflow: "hidden" }}>
      {src ? (
        <AbsoluteFill
          style={{
            transform: `scale(${scale}) translate(${panX}%, ${panY}%)`,
          }}
        >
          <Img
            src={src}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: gradeFilter(),
            }}
          />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill
          style={{
            transform: `scale(${scale}) translate(${panX}%, ${panY}%)`,
          }}
        >
          <ProceduralBackground seed={seed} />
        </AbsoluteFill>
      )}

      {/* Calque de teinte bleu nuit pose par-dessus (color grade) */}
      <AbsoluteFill
        style={{
          backgroundColor: THEME.grade.tint,
          opacity: THEME.grade.tintOpacity,
          mixBlendMode: "multiply",
        }}
      />
      {/* Assombrissement bas d'ecran pour lisibilite du texte / source */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(to bottom, transparent 40%, ${THEME.bgDeep}cc 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
