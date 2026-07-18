import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Background, Caption, Hl, RegionHeader} from '../components/UI.jsx';
import {EUFlag} from '../components/Flags.jsx';
import {COLORS, FONT, FONT_TEXT} from '../theme.js';

// Pyramide des risques de l'AI Act — se construit du bas vers le haut
const LEVELS = [
  {label: 'RISQUE MINIMAL', sub: 'Libre', color: '#2ee66b', width: 860, delay: 95},
  {label: 'RISQUE LIMITÉ', sub: 'Transparence exigée', color: '#ffd700', width: 700, delay: 115},
  {label: 'HAUT RISQUE', sub: 'Contrôles stricts', color: '#ff9f1c', width: 540, delay: 135},
  {label: 'INACCEPTABLE', sub: 'INTERDIT', color: '#ff3b30', width: 380, delay: 160},
];

// Scène 2 — Europe (14s) : AI Act + pyramide des risques
export const Europe = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const cardS = spring({
    frame: frame - 45,
    fps,
    config: {damping: 13, stiffness: 200},
  });

  return (
    <AbsoluteFill>
      <Background accent={COLORS.euBlue} />
      <RegionHeader
        flag={<EUFlag width={300} />}
        name="EUROPE"
        badge="#1 · La plus stricte"
        badgeColor={COLORS.euYellow}
      />

      {/* Carte AI ACT */}
      <div
        style={{
          position: 'absolute',
          top: 640,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          transform: `scale(${cardS})`,
          opacity: cardS,
        }}
      >
        <div
          style={{
            background: 'rgba(36,81,255,0.18)',
            border: '2px solid rgba(255,255,255,0.25)',
            borderRadius: 30,
            padding: '30px 70px',
            textAlign: 'center',
            boxShadow: '0 0 60px rgba(36,81,255,0.4)',
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 92,
              color: COLORS.white,
              letterSpacing: 3,
            }}
          >
            AI ACT
          </div>
          <div
            style={{
              fontFamily: FONT_TEXT,
              fontWeight: 700,
              fontSize: 40,
              color: COLORS.muted,
              marginTop: 6,
            }}
          >
            1er cadre complet au monde
          </div>
        </div>
      </div>

      {/* Pyramide des risques */}
      <div
        style={{
          position: 'absolute',
          top: 920,
          width: '100%',
          display: 'flex',
          flexDirection: 'column-reverse',
          alignItems: 'center',
          gap: 14,
        }}
      >
        {LEVELS.map((lvl, i) => {
          const s = spring({
            frame: frame - lvl.delay,
            fps,
            config: {damping: 12, stiffness: 190, mass: 0.6},
          });
          const isTop = i === LEVELS.length - 1;
          const pulse = isTop && frame > lvl.delay + 15
            ? 1 + Math.sin((frame - lvl.delay) / 5) * 0.02
            : 1;
          return (
            <div
              key={lvl.label}
              style={{
                width: lvl.width,
                background: `linear-gradient(135deg, ${lvl.color}, ${lvl.color}bb)`,
                borderRadius: 20,
                padding: '18px 0',
                textAlign: 'center',
                transform: `scale(${s * pulse}) translateY(${(1 - s) * 60}px)`,
                opacity: s,
                boxShadow: `0 0 35px ${lvl.color}55`,
              }}
            >
              <div
                style={{
                  fontFamily: FONT,
                  fontWeight: 900,
                  fontSize: 44,
                  color: '#000',
                  letterSpacing: 1,
                }}
              >
                {lvl.label}
              </div>
              <div
                style={{
                  fontFamily: FONT_TEXT,
                  fontWeight: 800,
                  fontSize: 32,
                  color: 'rgba(0,0,0,0.65)',
                }}
              >
                {lvl.sub}
              </div>
            </div>
          );
        })}
      </div>

      <Caption from={20} to={150}>
        L'Europe est officiellement la région{' '}
        <Hl color={COLORS.euYellow}>la plus stricte</Hl> au monde
      </Caption>
      <Caption from={155} to={290}>
        L'<Hl color={COLORS.euYellow}>AI Act</Hl> classe chaque IA par{' '}
        <Hl color={COLORS.orange}>niveau de risque</Hl>
      </Caption>
      <Caption from={295} to={415}>
        Et certains usages sont purement{' '}
        <Hl color={COLORS.red}>INTERDITS</Hl>
      </Caption>

      {/* Transition sortie : fondu */}
      <AbsoluteFill
        style={{
          background: '#000',
          opacity: interpolate(frame, [408, 420], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
