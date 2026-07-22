import React from "react";
import { THEME } from "../theme";

// Incrustation permanente de la source en bas d'ecran (rigueur editoriale).
// Petit texte discret mais lisible, avec puce cyan.
export const SourceTag: React.FC<{ label: string }> = ({ label }) => {
  if (!label) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 64,
        right: 64,
        bottom: 96,
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontFamily: THEME.fonts.body,
        fontSize: 26,
        letterSpacing: 0.2,
        color: THEME.inkMuted,
        textShadow: "0 2px 8px rgba(2,6,23,0.9)",
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: THEME.accent,
          boxShadow: `0 0 12px ${THEME.accent}`,
          flexShrink: 0,
        }}
      />
      <span>{label}</span>
    </div>
  );
};
