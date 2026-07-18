import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {COLORS, FONT, FONT_TEXT} from '../theme.js';

// ---------- Fond animé : dégradé sombre + halos de couleur + vignette ----------
export const Background = ({accent = '#2451ff'}) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 55) * 60;
  const drift2 = Math.cos(frame / 70) * 80;
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg}}>
      <div
        style={{
          position: 'absolute',
          width: 1100,
          height: 1100,
          borderRadius: '50%',
          background: accent,
          opacity: 0.16,
          filter: 'blur(160px)',
          top: -350 + drift,
          left: -300 + drift2,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: accent,
          opacity: 0.1,
          filter: 'blur(140px)',
          bottom: -250 - drift,
          right: -250,
        }}
      />
      {/* Grille subtile façon "tech" */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '90px 90px',
        }}
      />
      {/* Vignette */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

// ---------- Barre de progression TikTok en haut ----------
export const ProgressBar = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const pct = (frame / durationInFrames) * 100;
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 12,
        background: 'rgba(255,255,255,0.12)',
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #ffd700, #ff3b30)',
        }}
      />
    </div>
  );
};

// ---------- Petit watermark de chaîne ----------
export const Watermark = () => (
  <div
    style={{
      position: 'absolute',
      top: 40,
      width: '100%',
      textAlign: 'center',
      fontFamily: FONT_TEXT,
      fontWeight: 700,
      fontSize: 30,
      letterSpacing: 8,
      color: 'rgba(255,255,255,0.45)',
      zIndex: 40,
      textTransform: 'uppercase',
    }}
  >
    IA &nbsp;•&nbsp; Géopolitique
  </div>
);

// ---------- Titre qui claque (spring scale + shake léger) ----------
export const SlamText = ({
  children,
  delay = 0,
  size = 110,
  color = COLORS.white,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: {damping: 12, stiffness: 200, mass: 0.6},
  });
  const opacity = interpolate(frame - delay, [0, 4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.05,
        color,
        textAlign: 'center',
        transform: `scale(${0.5 + s * 0.5})`,
        opacity,
        textShadow: '0 6px 30px rgba(0,0,0,0.6)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ---------- Caption TikTok bas d'écran : boîte noire arrondie, mots-clés colorés ----------
export const Caption = ({from, to, children, bottom = 210}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < from || frame > to) return null;
  const s = spring({
    frame: frame - from,
    fps,
    config: {damping: 14, stiffness: 250, mass: 0.5},
  });
  const out = interpolate(frame, [to - 6, to], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        position: 'absolute',
        bottom,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 45,
        transform: `scale(${0.85 + s * 0.15}) translateY(${(1 - s) * 30}px)`,
        opacity: out,
      }}
    >
      <div
        style={{
          maxWidth: 900,
          background: 'rgba(0,0,0,0.72)',
          borderRadius: 28,
          padding: '34px 46px',
          fontFamily: FONT_TEXT,
          fontWeight: 800,
          fontSize: 52,
          lineHeight: 1.25,
          color: COLORS.white,
          textAlign: 'center',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Mot-clé surligné dans une caption
export const Hl = ({color = COLORS.yellow, children}) => (
  <span style={{color, fontWeight: 900}}>{children}</span>
);

// ---------- Badge type "pill" ----------
export const Badge = ({children, color, delay = 0, size = 44}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: {damping: 11, stiffness: 220, mass: 0.5},
  });
  return (
    <div
      style={{
        display: 'inline-block',
        background: color,
        color: '#000',
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        padding: '16px 40px',
        borderRadius: 999,
        transform: `scale(${s})`,
        letterSpacing: 1,
        boxShadow: `0 0 40px ${color}66`,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </div>
  );
};

// ---------- En-tête de scène région : drapeau + nom + badge ----------
export const RegionHeader = ({flag, name, badge, badgeColor}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13, stiffness: 180}});
  return (
    <div
      style={{
        position: 'absolute',
        top: 130,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 30,
        transform: `translateY(${(1 - s) * -120}px)`,
        opacity: s,
        zIndex: 30,
      }}
    >
      <div style={{transform: `scale(${0.7 + s * 0.3}) rotate(${(1 - s) * -6}deg)`}}>
        {flag}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 96,
          color: COLORS.white,
          letterSpacing: 4,
          textShadow: '0 6px 30px rgba(0,0,0,0.7)',
        }}
      >
        {name}
      </div>
      <Badge color={badgeColor} delay={10}>
        {badge}
      </Badge>
    </div>
  );
};
