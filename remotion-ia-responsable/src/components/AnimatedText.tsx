import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { THEME } from "../theme";

type Props = {
  children: React.ReactNode;
  delay?: number; // frames avant apparition
  size?: number;
  weight?: number;
  color?: string;
  font?: "title" | "body";
  uppercase?: boolean;
  align?: "left" | "center";
  maxWidth?: number;
  glow?: boolean;
  lineHeight?: number;
  letterSpacing?: number;
};

// Bloc de texte avec entree "montante" douce (fade + translate + spring).
export const AnimatedText: React.FC<Props> = ({
  children,
  delay = 0,
  size = 64,
  weight = 700,
  color = THEME.ink,
  font = "body",
  uppercase = false,
  align = "left",
  maxWidth,
  glow = false,
  lineHeight = 1.1,
  letterSpacing = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const enter = spring({
    frame: local,
    fps,
    config: { damping: 200, mass: 0.6 },
    durationInFrames: 22,
  });

  const opacity = interpolate(local, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(enter, [0, 1], [26, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        fontFamily: font === "title" ? THEME.fonts.title : THEME.fonts.body,
        fontSize: size,
        fontWeight: weight,
        color,
        textTransform: uppercase ? "uppercase" : "none",
        textAlign: align,
        maxWidth,
        lineHeight,
        letterSpacing,
        textShadow: glow
          ? `0 0 30px ${THEME.accent}66, 0 3px 18px rgba(2,6,23,0.85)`
          : "0 3px 18px rgba(2,6,23,0.85)",
      }}
    >
      {children}
    </div>
  );
};

// Petit "kicker" (surtitre) cyan encadre, pour l'entete de sequence.
export const Kicker: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        opacity,
        alignSelf: "flex-start",
        fontFamily: THEME.fonts.body,
        fontSize: 28,
        fontWeight: 600,
        letterSpacing: 4,
        textTransform: "uppercase",
        color: THEME.accent,
        padding: "10px 18px",
        border: `1px solid ${THEME.accent}55`,
        borderRadius: 999,
        background: `${THEME.accent}12`,
        backdropFilter: "blur(4px)",
      }}
    >
      {children}
    </div>
  );
};
